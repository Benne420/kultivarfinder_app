import React from "react";

const slugify = (prefix, value) => {
  const normalized = `${prefix}-${value}`
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

  const baseSlug = normalized
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  if (baseSlug) return baseSlug;

  return `${prefix}-${encodeURIComponent(String(value))}`;
};

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

  const optionList = React.useMemo(() => {
    const seen = new Map();
    return options.map((option) => {
      const baseId = slugify(optionPrefix, option);
      const count = seen.get(baseId) || 0;
      const id = count ? `${baseId}-${count + 1}` : baseId;
      seen.set(baseId, count + 1);
      const isChecked = selectedSet.has(option);
      return (
        <label key={`${option}-${id}`} htmlFor={id} className="multi-select__option">
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
    });
  }, [optionPrefix, options, onChange, selectedSet]);

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
            {optionList}
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default function FilterPanel({
  id,
  title,
  label,
  options,
  selectedValues,
  onChange,
  onClear,
  optionPrefix,
  resetLabel,
}) {
  const headingId = `${id}-heading`;
  const contentId = `${id}-content`;

  return (
    <details className="filter-section">
      <summary className="filter-section__summary" aria-controls={contentId}>
        <span id={headingId} className="filter-section__title">
          {title}
        </span>
        <span className="filter-section__chevron" aria-hidden="true">
          ▾
        </span>
      </summary>
      <div id={contentId} className="filter-section__content">
        <div className="filters">
          <div className="select-group">
            <div className="select-row select-row--with-reset">
              <MultiSelectDropdown
                headingId={headingId}
                label={label}
                options={options}
                selectedValues={selectedValues}
                onChange={onChange}
                optionPrefix={optionPrefix}
              />
              <button
                type="button"
                className="reset-btn"
                onClick={onClear}
                disabled={!selectedValues.size}
                aria-label={resetLabel}
              >
                ×
              </button>
            </div>
          </div>
        </div>
      </div>
    </details>
  );
}
