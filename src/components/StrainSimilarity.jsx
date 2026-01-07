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

function normalizeTerpeneList(value = []) {
  return (Array.isArray(value) ? value : String(value || "").split(/[;,]/))
    .map((s) => s.trim())
    .filter(Boolean);
}

/* cosine similarity for two terpene-profiles (arrays) with positional weighting */
function cosineSimilarity(a = [], b = []) {
  const arrA = normalizeTerpeneList(a);
  const arrB = normalizeTerpeneList(b);

  const unique = Array.from(new Set([...arrA, ...arrB]));
  if (unique.length === 0) return 0;

  const vecA = unique.map((k) => {
    const idx = arrA.indexOf(k);
    if (idx === -1) return 0;
    return (arrA.length - idx) / arrA.length;
  });

  const vecB = unique.map((k) => {
    const idx = arrB.indexOf(k);
    if (idx === -1) return 0;
    return (arrB.length - idx) / arrB.length;
  });

  const dot = vecA.reduce((sum, v, i) => sum + v * vecB[i], 0);
  const magA = Math.sqrt(vecA.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(vecB.reduce((sum, v) => sum + v * v, 0));

  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

function buildTerpeneWeightMap(list = []) {
  const normalized = normalizeTerpeneList(list);
  const map = new Map();
  const len = normalized.length || 1;

  normalized.forEach((name, index) => {
    const weight = (len - index) / len;
    const prev = map.get(name) || 0;
    if (weight > prev) {
      map.set(name, weight);
    }
  });

  return map;
}

function getTerpeneOverlap(refList = [], targetList = []) {
  if (!refList.length || !targetList.length)
    return { shared: 0, total: 0, bucket: 0, weightedRatio: 0 };

  const refSet = new Set(refList);
  const targetSet = new Set(targetList);
  const union = new Set([...refSet, ...targetSet]);

  const shared = Array.from(union).filter((t) => refSet.has(t) && targetSet.has(t)).length;
  const total = union.size;

  const refWeights = buildTerpeneWeightMap(refList);
  const targetWeights = buildTerpeneWeightMap(targetList);

  let sharedWeight = 0;
  let totalWeight = 0;
  union.forEach((name) => {
    const refWeight = refWeights.get(name) || 0;
    const targetWeight = targetWeights.get(name) || 0;
    const maxWeight = Math.max(refWeight, targetWeight);
    const minWeight = Math.min(refWeight, targetWeight);
    totalWeight += maxWeight;
    sharedWeight += minWeight;
  });

  const weightedRatio = totalWeight > 0 ? sharedWeight / totalWeight : 0;
  const bucket = weightedRatio === 0 ? 0 : Math.max(1, Math.round(weightedRatio * 5));

  return { shared, total, bucket, weightedRatio };
}

function describeSimilarity(overlap = { bucket: 0 }) {
  const { bucket } = overlap;
  if (bucket === 5) return "sehr hoch";
  if (bucket === 4) return "hoch";
  if (bucket === 3) return "mittel";
  if (bucket === 2) return "niedrig";
  if (bucket === 1) return "sehr niedrig";
  return null;
}

function findSimilar(reference, allStrains, limit = 5) {
  if (!reference?.normalizedTerpenes?.length) return [];

  return allStrains
    .filter((s) => s.name !== reference.name && s.normalizedTerpenes.length > 0)
    .map((s) => {
      const overlap = getTerpeneOverlap(reference.normalizedTerpenes, s.normalizedTerpenes);
      const weightedSimilarity = overlap.weightedRatio;
      const cosineScore = cosineSimilarity(reference.normalizedTerpenes, s.normalizedTerpenes);

      return {
        ...s,
        similarity: weightedSimilarity,
        weightedSimilarity,
        cosineSimilarity: cosineScore,
        overlap,
        similarityLabel: describeSimilarity(overlap),
      };
    })
    .sort((a, b) => {
      if (b.weightedSimilarity !== a.weightedSimilarity) {
        return b.weightedSimilarity - a.weightedSimilarity;
      }
      return b.cosineSimilarity - a.cosineSimilarity;
    })
    .slice(0, limit);
}

export default function StrainSimilarity({
  kultivare = [],
  onApplySimilar,
  includeDiscontinued = false,
}) {
  const [selectedName, setSelectedName] = useState("");
  const [similarStrains, setSimilarStrains] = useState([]);

  const strainsWithNormalizedTerpenes = useMemo(
    () =>
      kultivare.map((strain) => ({
        ...strain,
        normalizedTerpenes: normalizeTerpeneList(
          strain.normalizedTerpenprofil ||
            strain.terpenprofil ||
            strain.terpenprofile ||
            strain.terpenes ||
            []
        ),
      })),
    [kultivare]
  );

  // only consider active strains for dropdown / comparisons unless discontinued should be included
  const selectableStrains = useMemo(() => {
    const filtered = (
      includeDiscontinued
        ? strainsWithNormalizedTerpenes
        : strainsWithNormalizedTerpenes.filter(isActiveStrain)
    ).filter((strain) => strain.normalizedTerpenes.length > 0);

    return filtered.sort((a, b) => {
      const nameA = a?.name || "";
      const nameB = b?.name || "";
      return nameA.localeCompare(nameB, "de", { sensitivity: "base" });
    });
  }, [includeDiscontinued, strainsWithNormalizedTerpenes]);

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

  const recomputeSimilarities = useCallback(
    (name, strains) => {
      if (!name) {
        setSimilarStrains([]);
        emitResults(null, []);
        return;
      }

      const reference = strains.find((k) => k.name === name);
      if (!reference) {
        setSimilarStrains([]);
        emitResults(null, []);
        return;
      }

      const similar = findSimilar(reference, strains);
      setSimilarStrains(similar);
      emitResults(reference, similar);
    },
    [emitResults]
  );

  const handleChange = (e) => {
    const name = e.target.value;
    setSelectedName(name);
    recomputeSimilarities(name, selectableStrains);
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

  useEffect(() => {
    recomputeSimilarities(selectedName, selectableStrains);
  }, [recomputeSimilarities, selectedName, selectableStrains]);

  return (
    <section className="similarity-panel">
      <h3 id="similarity-panel-title" className="similarity-panel__title">
        Ähnliche Sorte finden
      </h3>
      <div className="similarity-panel__controls">
        <label className="similarity-panel__label" htmlFor="strain-select">
          Sorte wählen
        </label>
        <select
          id="strain-select"
          className="similarity-panel__select"
          onChange={handleChange}
          value={selectedName}
          aria-labelledby="similarity-panel-title"
          aria-describedby="strain-select-note"
        >
          <option value="">Sorte wählen …</option>
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

      <p id="strain-select-note" className="similarity-panel__description">
        Wählen Sie eine Referenzsorte, um ähnliche Kultivare anhand des Terpenprofils zu finden.
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
