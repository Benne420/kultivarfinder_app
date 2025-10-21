import React, { useState, useEffect } from "react";

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
      similarity: cosineSimilarity(reference.terpenprofil, s.terpenprofil || []),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, 5);
}

export default function StrainSimilarity() {
  const [data, setData] = useState([]);
  const [selectedName, setSelectedName] = useState("");
  const [alternatives, setAlternatives] = useState([]);

  useEffect(() => {
    fetch("/kultivare.json")
      .then((res) => res.json())
      .then(setData)
      .catch(console.error);
  }, []);

  const handleChange = (e) => {
    const ref = data.find((k) => k.name === e.target.value);
    setSelectedName(ref.name);
    const similar = findSimilar(ref, data);
    setAlternatives(similar);
  };

  return (
    <div style={{ padding: 16, fontFamily: "Montserrat, sans-serif" }}>
      <label htmlFor="strain-select">Sorte auswählen:</label>
      <select id="strain-select" onChange={handleChange} value={selectedName}>
        <option value="">-- wählen --</option>
        {data.map((s) => (
          <option key={s.name} value={s.name}>
            {s.name}
          </option>
        ))}
      </select>

      {alternatives.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <h4>Ähnliche Sorten (nach Terpenprofil):</h4>
          <ul>
            {alternatives.map((s) => (
              <li key={s.name}>
                {s.name} – Ähnlichkeit: {(s.similarity * 100).toFixed(1)}%
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
