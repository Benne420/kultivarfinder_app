import React, { useState, useMemo, useCallback } from "react";

/* helper: determine whether a strain is considered "active" (same logic as filters) */
function isActiveStrain(s = {}) {
  const status = (s.status || s.statut || s.aktiv || "").toString().toLowerCase();
  if (status) {
    if (status === "active" || status === "aktiv" || status === "true") return true;
    return false;
  }
  if (s.active === true) return true;
  return false;
}

/* cosine similarity for two terpene-profiles (arrays). returns 0..1 */
function cosineSimilarity(a = [], b = []) {
  const arrA = Array.isArray(a) ? a : String(a || "").split(/[;,]/).map(s => s.trim()).filter(Boolean);
  const arrB = Array.isArray(b) ? b : String(b || "").split(/[;,]/).map(s => s.trim()).filter(Boolean);

  const unique = Array.from(new Set([...arrA, ...arrB]));
  if (unique.length === 0) return 0;

  const vecA = unique.map(k => (arrA.includes(k) ? 1 : 0));
  const vecB = unique.map(k => (arrB.includes(k) ? 1 : 0));

  const dot = vecA.reduce((sum, v, i) => sum + v * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(vecB.reduce((sum, v) => sum + v * v, 0));

  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

function findSimilar(reference, allStrains, limit = 5) {
  if (!reference) return [];
  const refTerps = reference.terpenprofil || reference.terpenprofile || reference.terpenes || [];
  return allStrains
    .filter(s => s.name !== reference.name)
    .map(s => ({ ...s, similarity: cosineSimilarity(refTerps, s.terpenprofil || s.terpenprofile || s.terpenes || []) }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

export default function StrainSimilarity({ kultivare = [], onApplySimilar }) {
  const [selectedName, setSelectedName] = useState("");
  const [similarStrains, setSimilarStrains] = useState([]);

  // only consider active strains for dropdown / comparisons
  const activeStrains = useMemo(() => kultivare.filter(isActiveStrain), [kultivare]);

  const emitResults = useCallback(
    (reference, results) => {
      if (typeof onApplySimilar !== "function") return;
      if (reference && Array.isArray(results) && results.length) {
        onApplySimilar({ reference, results });
        return;
      }
      onApplySimilar(null);
    },
    [onApplySimilar]
  );

  const handleChange = (e) => {
    const name = e.target.value;
    setSelectedName(name);
    if (!name) {
      setSimilarStrains([]);
      emitResults(null, []);
      return;
    }
    const ref = activeStrains.find(k => k.name === name);
    if (!ref) {
      setSimilarStrains([]);
      emitResults(null, []);
      return;
    }
    const similar = findSimilar(ref, activeStrains);
    setSimilarStrains(similar);
    emitResults(ref, similar);
  };

  const handleClear = () => {
    setSelectedName("");
    setSimilarStrains([]);
    emitResults(null, []);
  };

  return (
    <div style={{ padding: 16 }}>
      <label htmlFor="strain-select">Sorte auswählen (aktive Sorten):</label>
      <select id="strain-select" onChange={handleChange} value={selectedName}>
        <option value="">-- wählen --</option>
        {activeStrains.map((s) => (
          <option key={s.name} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>

      <div style={{ marginTop: 12 }}>
        <button type="button" onClick={handleClear} disabled={!selectedName}>Clear similarity</button>
      </div>

      <div style={{ marginTop: 16 }} aria-live="polite">
        {selectedName && similarStrains.length === 0 && (
          <p style={{ margin: 0 }}>Keine ähnlichen Sorten gefunden.</p>
        )}
        {similarStrains.length > 0 && (
          <>
            <h4 style={{ margin: "0 0 8px" }}>Ähnliche Sorten (nach Terpenprofil)</h4>
            <ol style={{ paddingLeft: "1.2rem", margin: 0 }}>
              {similarStrains.map((s) => (
                <li key={s.name} style={{ marginBottom: 4 }}>
                  <span style={{ fontWeight: 600 }}>{s.name}</span>
                  {typeof s.similarity === "number" && !Number.isNaN(s.similarity) && (
                    <span style={{ marginLeft: 6, color: "#546e7a" }}>
                      ({Math.round(s.similarity * 100)}% Übereinstimmung)
                    </span>
                  )}
                </li>
              ))}
            </ol>
            <p style={{ marginTop: 8 }}>
              Die oben aufgeführten Sorten werden in der Haupttabelle angezeigt.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
