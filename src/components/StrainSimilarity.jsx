import React, { useState, useMemo, useCallback, useEffect, useId } from "react";

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

function matchesQuery(name, query) {
  if (!query) return true;
  const normalized = name.toLowerCase();
  const terms = query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  return terms.every((term) => normalized.includes(term));
}

export default function StrainSimilarity({
  kultivare = [],
  onApplySimilar,
  includeDiscontinued = false,
  onToggleIncludeDiscontinued,
}) {
  const [selectedName, setSelectedName] = useState("");
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [similarStrains, setSimilarStrains] = useState([]);
  const listboxId = useId();

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

  const filteredStrains = useMemo(() => {
    const trimmed = query.trim();
    if (!trimmed) return selectableStrains;
    return selectableStrains.filter((strain) => matchesQuery(strain.name || "", trimmed));
  }, [query, selectableStrains]);

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

  const handleSelect = useCallback(
    (name) => {
      setSelectedName(name);
      setQuery(name);
      setIsOpen(false);
      setActiveIndex(-1);
    },
    []
  );

  const handleChange = (event) => {
    const nextQuery = event.target.value;
    setQuery(nextQuery);
    setIsOpen(true);
    setActiveIndex(0);
    if (!nextQuery) {
      setSelectedName("");
    }
  };

  const handleClear = useCallback(() => {
    setSelectedName("");
    setQuery("");
    setSimilarStrains([]);
    setIsOpen(false);
    setActiveIndex(-1);
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

  useEffect(() => {
    if (!selectedName) {
      setQuery("");
      return;
    }
    setQuery(selectedName);
  }, [selectedName]);

  useEffect(() => {
    if (!filteredStrains.length) {
      setActiveIndex(-1);
      return;
    }
    setActiveIndex((prev) => (prev >= filteredStrains.length ? 0 : prev));
  }, [filteredStrains.length]);

  const handleIncludeToggle = useCallback(
    (event) => {
      if (typeof onToggleIncludeDiscontinued === "function") {
        onToggleIncludeDiscontinued(event.target.checked);
      }
    },
    [onToggleIncludeDiscontinued]
  );

  const handleKeyDown = (event) => {
    if (!isOpen && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setIsOpen(true);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((prev) => {
        const next = prev + 1;
        return next >= filteredStrains.length ? 0 : next;
      });
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((prev) => {
        if (prev <= 0) return filteredStrains.length - 1;
        return prev - 1;
      });
    }

    if (event.key === "Enter") {
      event.preventDefault();
      const target = filteredStrains[activeIndex] || filteredStrains[0];
      if (target?.name) {
        handleSelect(target.name);
      }
    }

    if (event.key === "Escape") {
      setIsOpen(false);
    }
  };

  const activeDescendantId =
    activeIndex >= 0 && filteredStrains[activeIndex]
      ? `${listboxId}-option-${activeIndex}`
      : undefined;

  return (
    <section className="similarity-panel">
      <h3 id="similarity-panel-title" className="similarity-panel__title">
        Ähnliche Sorte finden
      </h3>
      <div className="similarity-panel__controls">
        <label className="similarity-panel__label" htmlFor="strain-combobox">
          Sorte wählen
        </label>
        <div className="similarity-panel__combobox">
          <input
            id="strain-combobox"
            className="similarity-panel__input"
            type="text"
            role="combobox"
            aria-autocomplete="list"
            aria-expanded={isOpen}
            aria-controls={listboxId}
            aria-activedescendant={activeDescendantId}
            aria-labelledby="similarity-panel-title"
            aria-describedby="strain-select-note"
            placeholder="Sorte wählen …"
            value={query}
            onChange={handleChange}
            onFocus={() => setIsOpen(true)}
            onBlur={() => {
              window.setTimeout(() => setIsOpen(false), 100);
            }}
            onKeyDown={handleKeyDown}
          />
          {isOpen && (
            <ul className="similarity-panel__list" role="listbox" id={listboxId}>
              {filteredStrains.length ? (
                filteredStrains.map((strain, index) => {
                  const isActive = index === activeIndex;
                  return (
                    <li
                      key={strain.name}
                      id={`${listboxId}-option-${index}`}
                      role="option"
                      aria-selected={isActive}
                      className={`similarity-panel__option ${isActive ? "is-active" : ""}`.trim()}
                      onMouseDown={(event) => {
                        event.preventDefault();
                        handleSelect(strain.name);
                      }}
                      onMouseEnter={() => setActiveIndex(index)}
                    >
                      {strain.name}
                    </li>
                  );
                })
              ) : (
                <li className="similarity-panel__option is-empty" role="option" aria-selected="false">
                  Keine Treffer
                </li>
              )}
            </ul>
          )}
        </div>
        <button
          type="button"
          className="reset-btn similarity-panel__clear"
          onClick={handleClear}
          disabled={!selectedName && !query}
          aria-label="Ähnlichkeitssuche zurücksetzen"
        >
          ×
        </button>
      </div>

      <p id="strain-select-note" className="similarity-panel__description">
        Tippen Sie, um eine Referenzsorte zu finden. Die Suche filtert live und nutzt das Terpenprofil als Basis.
      </p>

      <fieldset className="similarity-panel__options">
        <legend className="visually-hidden">Optionen für die Ähnlichkeitssuche</legend>
        <div className="similarity-panel__description">
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
      </fieldset>

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
