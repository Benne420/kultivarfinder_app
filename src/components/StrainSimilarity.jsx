import React, { useState, useMemo, useCallback, useEffect } from "react";

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
  const refTerps =
    reference.normalizedTerpenprofil ||
    reference.terpenprofil ||
    reference.terpenprofile ||
    reference.terpenes ||
    [];
  return allStrains
    .filter(s => s.name !== reference.name)
    .map(s => ({
      ...s,
      similarity: cosineSimilarity(
        refTerps,
        s.normalizedTerpenprofil ||
          s.terpenprofil ||
          s.terpenprofile ||
          s.terpenes ||
          []
      ),
    }))
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit);
}

export default function StrainSimilarity({
  kultivare = [],
  onApplySimilar,
  includeDiscontinued = false,
  onToggleIncludeDiscontinued,
}) {
  const [selectedName, setSelectedName] = useState("");
  const [similarStrains, setSimilarStrains] = useState([]);

  // only consider active strains for dropdown / comparisons unless discontinued should be included
  const selectableStrains = useMemo(
    () => (includeDiscontinued ? kultivare : kultivare.filter(isActiveStrain)),
    [includeDiscontinued, kultivare]
  );

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
    const ref = selectableStrains.find((k) => k.name === name);
    if (!ref) {
      setSimilarStrains([]);
      emitResults(null, []);
      return;
    }
    const similar = findSimilar(ref, selectableStrains);
    setSimilarStrains(similar);
    emitResults(ref, similar);
  };

  const handleClear = useCallback(() => {
    setSelectedName("");
    setSimilarStrains([]);
    emitResults(null, []);
  }, [emitResults]);

  useEffect(() => {
    if (!includeDiscontinued && selectedName) {
      const selected = kultivare.find((k) => k.name === selectedName);
      if (selected && !isActiveStrain(selected)) {
        handleClear();
      }
    }
  }, [includeDiscontinued, selectedName, kultivare, handleClear]);

  const handleIncludeToggle = useCallback(
    (event) => {
      if (typeof onToggleIncludeDiscontinued === "function") {
        onToggleIncludeDiscontinued(event.target.checked);
      }
    },
    [onToggleIncludeDiscontinued]
  );

  return (
    <section className="similarity-panel">
      <h3 id="similarity-panel-title" className="similarity-panel__title">
        Ähnliche Sorte finden
      </h3>
      <div className="similarity-panel__controls">
        <select
          id="strain-select"
          className="similarity-panel__select"
          onChange={handleChange}
          value={selectedName}
          aria-labelledby="similarity-panel-title"
        >
          <option value="" disabled hidden>
            Sorte wählen
          </option>
          {selectableStrains.map((s) => (
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

      <div id="strain-select-description" className="similarity-panel__description">
        <input
          id="similarity-include-discontinued"
          type="checkbox"
          checked={includeDiscontinued}
          onChange={handleIncludeToggle}
        />
        <label htmlFor="similarity-include-discontinued">
          Nicht mehr verfügbare Sorten anzeigen
        </label>
      </div>

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
