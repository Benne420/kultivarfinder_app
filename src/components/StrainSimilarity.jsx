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
    <section className="similarity-panel">
      <h3 className="similarity-panel__title">Ähnliche Sorte finden</h3>
      <div className="similarity-panel__controls">
        <select
          id="strain-select"
          className="similarity-panel__select"
          onChange={handleChange}
          value={selectedName}
          aria-describedby="strain-select-description"
          aria-label="Ähnliche Sorte auswählen"
        >
          <option value="" disabled hidden></option>
          {activeStrains.map((s) => (
            <option key={s.name} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="reset-btn similarity-panel__clear"
          onClick={handleClear}
          disabled={!selectedName}
          aria-label="Ähnlichkeitssuche zurücksetzen"
        >
          ×
        </button>
      </div>

      <p id="strain-select-description" className="similarity-panel__description">
        Nur aktive Sorten auswählbar
      </p>

      <div className="similarity-panel__status" aria-live="polite">
        {selectedName && similarStrains.length === 0 && (
          <p className="similarity-panel__hint">Keine ähnlichen Sorten gefunden.</p>
        )}
        {similarStrains.length > 0 && (
          <p className="similarity-panel__hint">
            Die Ergebnisse werden unterhalb in der Tabelle inklusive Übereinstimmungswert angezeigt.
          </p>
        )}
      </div>
    </section>
  );
}
