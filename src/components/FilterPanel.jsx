import React from "react";

const MultiSelectChips = ({
  options,
  selectedValues,
  onChange,
  emptyLabel,
}) => {
  const selectedSet = React.useMemo(() => {
    if (selectedValues instanceof Set) {
      return selectedValues;
    }
    if (Array.isArray(selectedValues)) {
      return new Set(selectedValues);
    }
    if (selectedValues == null) {
      return new Set();
    }
    return new Set([selectedValues]);
  }, [selectedValues]);

  const handleToggle = React.useCallback(
    (option) => {
      if (typeof onChange !== "function") return;
      const next = new Set(selectedSet);
      if (next.has(option)) {
        next.delete(option);
      } else {
        next.add(option);
      }
      onChange(next);
    },
    [onChange, selectedSet]
  );

  if (!options?.length) {
    return <p className="filter-section__empty">{emptyLabel}</p>;
  }

  return (
    <div className="filter-chip-list" role="list">
      {options.map((option) => {
        const isActive = selectedSet.has(option);
        return (
          <button
            key={option}
            type="button"
            role="listitem"
            className={`filter-chip${isActive ? " filter-chip--active" : ""}`}
            onClick={() => handleToggle(option)}
            aria-pressed={isActive}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
};

export default function FilterPanel({
  filters,
  dispatch,
  wirkungen,
  terpene,
  clearTerpene,
  clearWirkungen,
  showTerpene = true,
  showWirkungen = true,
}) {
  const handleTerpeneChange = (nextSet) =>
    dispatch({ type: "SET_TERPENE_VALUES", value: nextSet });
  const handleWirkungChange = (nextSet) =>
    dispatch({ type: "SET_WIRKUNG_VALUES", value: nextSet });

  return (
    <div className="filters">
      {showTerpene && (
        <section className="filter-section" aria-labelledby="terpene-heading">
          <div className="filter-section__header">
            <div>
              <h3 id="terpene-heading" className="filter-heading">
                Terpenprofil
              </h3>
              <p className="filter-section__hint">Mehrfachauswahl möglich</p>
            </div>
            <button
              type="button"
              className="filter-section__reset"
              onClick={clearTerpene}
              disabled={!filters.selectedTerpene.size}
            >
              Zurücksetzen
            </button>
          </div>
          <MultiSelectChips
            options={terpene}
            selectedValues={filters.selectedTerpene}
            onChange={handleTerpeneChange}
            emptyLabel="Keine Terpene verfügbar."
          />
        </section>
      )}

      {showWirkungen && (
        <section className="filter-section" aria-labelledby="wirkungen-heading">
          <div className="filter-section__header">
            <div>
              <h3 id="wirkungen-heading" className="filter-heading">
                Wirkziele
              </h3>
              <p className="filter-section__hint">Mehrfachauswahl möglich</p>
            </div>
            <button
              type="button"
              className="filter-section__reset"
              onClick={clearWirkungen}
              disabled={!filters.selectedWirkungen.size}
            >
              Zurücksetzen
            </button>
          </div>
          <MultiSelectChips
            options={wirkungen}
            selectedValues={filters.selectedWirkungen}
            onChange={handleWirkungChange}
            emptyLabel="Keine Wirkziele verfügbar."
          />
        </section>
      )}
    </div>
  );
}
