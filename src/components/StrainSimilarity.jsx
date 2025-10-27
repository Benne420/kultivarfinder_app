import React, { useState, useMemo } from "react";
import StrainTable from "./StrainTable";

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

  const handleChange = (e) => {
    const name = e.target.value;
    setSelectedName(name);
    if (!name) {
      setSimilarStrains([]);
      if (typeof onApplySimilar === "function") onApplySimilar(null); // clear override
      return;
    }
    const ref = activeStrains.find(k => k.name === name);
    if (!ref) {
      setSimilarStrains([]);
      if (typeof onApplySimilar === "function") onApplySimilar(null);
      return;
    }
    const similar = findSimilar(ref, activeStrains);
    setSimilarStrains(similar);
    if (typeof onApplySimilar === "function") onApplySimilar(similar);
  };

  const handleClear = () => {
    setSelectedName("");
    setSimilarStrains([]);
    if (typeof onApplySimilar === "function") onApplySimilar(null);
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

      {similarStrains.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4>Ähnliche Sorten (nach Terpenprofil)</h4>
          {/* optional inline preview; main table is replaced via App callback */}
          <StrainTable strains={similarStrains} />
        </div>
      )}
    </div>
  );
}
