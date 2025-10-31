import React from "react";

const slugify = (prefix, value) =>
  `${prefix}-${value}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const MultiSelectDropdown = ({
  headingId,
  label,
  options,
  selectedValues,
  onChange,
  optionPrefix,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

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

  const selectedItems = React.useMemo(
    () => Array.from(selectedSet.values()),
    [selectedSet]
  );

  const summary = React.useMemo(() => {
    if (!selectedItems.length) {
      return null;
    }

    if (selectedItems.length <= 2) {
      return selectedItems.join(", ");
    }

    return `${selectedItems.length} ausgewählt`;
  }, [selectedItems]);

  React.useEffect(() => {
    if (!isOpen) return undefined;

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  const toggleOpen = () => {
    setIsOpen((prev) => !prev);
  };

  return (
    <div className="multi-select-dropdown" ref={dropdownRef}>
      <button
        type="button"
        className="multi-select-dropdown__trigger"
        aria-expanded={isOpen}
        aria-controls={`${headingId}-options`}
        onClick={toggleOpen}
      >
        <span className="multi-select-dropdown__label">{label}</span>
        {summary ? (
          <span className="multi-select-dropdown__summary">{summary}</span>
        ) : null}
        <span className="multi-select-dropdown__chevron" aria-hidden="true">
          ▾
        </span>
      </button>
      {isOpen ? (
        <div
          id={`${headingId}-options`}
          className="multi-select-dropdown__panel"
          role="group"
          aria-labelledby={headingId}
        >
          <div className="multi-select">
            {options.map((option) => {
              const id = slugify(optionPrefix, option);
              const isChecked = selectedSet.has(option);
              return (
                <label key={option} htmlFor={id} className="multi-select__option">
                  <input
                    id={id}
                    type="checkbox"
                    value={option}
                    checked={isChecked}
                    onChange={() => {
                      if (typeof onChange !== "function") return;
                      const next = new Set(selectedSet);
                      if (next.has(option)) {
                        next.delete(option);
                      } else {
                        next.add(option);
                      }
                      onChange(next);
                    }}
                  />
                  <span>{option}</span>
                </label>
              );
            })}
          </div>
        </div>
      ) : null}
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
}) {
  const handleTerpeneChange = (nextSet) =>
    dispatch({ type: "SET_TERPENE_VALUES", value: nextSet });
  const handleWirkungChange = (nextSet) =>
    dispatch({ type: "SET_WIRKUNG_VALUES", value: nextSet });

  return (
    <div className="filters">
      <div className="select-group">
        <h3 id="terpene-heading">Terpenfilter</h3>
        <div className="select-row select-row--with-reset">
          <MultiSelectDropdown
            headingId="terpene-heading"
            label="Terpene auswählen"
            options={terpene}
            selectedValues={filters.selectedTerpene}
            onChange={handleTerpeneChange}
            optionPrefix="terpene"
          />
          <button
            type="button"
            className="reset-btn"
            onClick={clearTerpene}
            disabled={!filters.selectedTerpene.size}
            aria-label="Terpenfilter zurücksetzen"
          >
            ×
          </button>
        </div>
      </div>

      <div className="select-group">
        <h3 id="wirkungen-heading">Wirkungsfilter</h3>
        <div className="select-row select-row--with-reset">
          <MultiSelectDropdown
            headingId="wirkungen-heading"
            label="Wirkungen auswählen"
            options={wirkungen}
            selectedValues={filters.selectedWirkungen}
            onChange={handleWirkungChange}
            optionPrefix="wirkung"
          />
          <button
            type="button"
            className="reset-btn"
            onClick={clearWirkungen}
            disabled={!filters.selectedWirkungen.size}
            aria-label="Wirkungsfilter zurücksetzen"
          >
            ×
          </button>
        </div>
      </div>

    </div>
  );
}
