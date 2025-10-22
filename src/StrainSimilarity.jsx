import React, { useState } from "react";
import StrainTable from './components/StrainTable'; // Importiere StrainTable

function cosineSimilarity(a, b) {
  const uniqueKeys = Array.from(new Set([...a, ...b]));
  const vecA = uniqueKeys.map((k) => (a.includes(k) ? 1 : 0));
  const vecB = uniqueKeys.map((k) => (b.includes(k) ? 1 : 0));
  const dot = vecA.reduce((sum, val, i) => sum + val * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, val) => sum + val ** 2, 0));
  const magB = Math.sqrt(vecB.reduce((sum, val) => sum + val ** 2, 0));
  return dot / (magA * magB || 1);
}

function findSimilar(reference, allStrains) {
  return allStrains
    .filter((s) => s.name !== reference.name)
    .map((s) => ({
      ...s,
      similarity: cosineSimilarity(
        reference.terpenprofil || [],
        s.terpenprofil || []
      ),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
}

export default function StrainSimilarity({ kultivare }) {
  const [selectedName, setSelectedName] = useState("");
  const [similarStrains, setSimilarStrains] = useState([]);

  const handleChange = (e) => {
    const ref = kultivare.find((k) => k.name === e.target.value);
    setSelectedName(ref.name);
    const similar = findSimilar(ref, kultivare);
    setSimilarStrains(similar);
  };

  return (
    <div style={{ padding: 16 }}>
      <label htmlFor="strain-select">Sorte auswählen:</label>
      <select id="strain-select" onChange={handleChange} value={selectedName}>
        <option value="">-- wählen --</option>
        {kultivare.map((s) => (
          <option key={s.name} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>

      {similarStrains.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4>Ähnliche Sorten (nach Terpenprofil):</h4>
          <StrainTable strains={similarStrains} /> {/* Zeige die ähnlichen Strains in der Tabelle an */}
        </div>
      )}
    </div>
  );
}
