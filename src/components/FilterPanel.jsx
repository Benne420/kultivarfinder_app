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
  selectedSet,
  onToggle,
  optionPrefix,
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const dropdownRef = React.useRef(null);

  const selectedItems = React.useMemo(
    () => Array.from(selectedSet.values()),
    [selectedSet]
  );

  const summary = React.useMemo(() => {
    if (!selectedItems.length) {
      return "Alle anzeigen";
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
        <span className="multi-select-dropdown__summary">{summary}</span>
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
                    onChange={() => onToggle(option)}
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
  typInfo,
  terpene,
  clearTerpene,
  clearWirkungen,
}) {
  const handleTerpeneToggle = (value) =>
    dispatch({ type: "TOGGLE_TERPENE", value });
  const handleWirkungToggle = (value) =>
    dispatch({ type: "TOGGLE_WIRKUNG", value });

  return (
    <div className="filters">
      <div className="select-group">
        <h3 id="terpene-heading">Terpene</h3>
        <div className="select-row select-row--with-reset">
          <MultiSelectDropdown
            headingId="terpene-heading"
            label="Terpene auswählen"
            options={terpene}
            selectedSet={filters.selectedTerpene}
            onToggle={handleTerpeneToggle}
            optionPrefix="terpene"
          />
          <button
            type="button"
            className="reset-btn"
            onClick={clearTerpene}
            disabled={!filters.selectedTerpene.size}
            aria-label="Terpen-Auswahl zurücksetzen"
          >
            ×
          </button>
        </div>
      </div>

      <div className="select-group">
        <h3 id="wirkungen-heading">Wirkungen</h3>
        <div className="select-row select-row--with-reset">
          <MultiSelectDropdown
            headingId="wirkungen-heading"
            label="Wirkungen auswählen"
            options={wirkungen}
            selectedSet={filters.selectedWirkungen}
            onToggle={handleWirkungToggle}
            optionPrefix="wirkung"
          />
          <button
            type="button"
            className="reset-btn"
            onClick={clearWirkungen}
            disabled={!filters.selectedWirkungen.size}
            aria-label="Wirkungs-Auswahl zurücksetzen"
          >
            ×
          </button>
        </div>
      </div>

      <div className="typ-button-group">
        <h3>Typ</h3>
        <div className="typ-row">
          {Object.keys(typInfo)
            // entferne reine "Indica" / "Sativa" Buttons (exakte Bezeichnungen)
            .filter((t) => !/^\s*(indica|sativa)\s*$/i.test(t))
            .map((t) => (
              <button
                key={t}
                className={`typ-btn ${filters.typ === t ? "active" : ""}`}
                onClick={() => dispatch({ type: "SET_TYP", value: filters.typ === t ? "" : t })}
              >
                {t}
              </button>
            ))}
        </div>
        <p style={{ fontSize: 12, color: "#546e7a", marginTop: 4 }}>{filters.typ ? typInfo[filters.typ] : ""}</p>
        <div className="info-box" style={{ fontSize: 11, color: "#39454d", marginTop: 8 }}>
          <h4 style={{ margin: "0 0 8px", fontSize: 12, color: "#2c3840" }}>
            Indica / Sativa – Was diese Begriffe (nicht) bedeuten:
          </h4>
          Die Begriffe <em>Indica</em> und <em>Sativa</em> stammen aus der
          Botanik, sagen aber heute
          <strong>
            {" "}
            nichts Verlässliches über Wirkung oder Inhaltsstoffe
          </strong>{" "}
          aus. Studien zeigen, dass diese Etiketten weder genetische
          Verwandtschaft noch chemische Profile zuverlässig erklären (Hazekamp
          et al., 2016; Watts et al., 2021). Auch eine Analyse medizinischer
          Sorten aus Deutschland ergab
          <strong>
            {" "}
            keine konsistenten Terpen- oder Wirkstoffmuster entlang der Label
          </strong>{" "}
          (Herwig et al., 2024). Wirkung und Verträglichkeit hängen vom
          Zusammenspiel aus THC, CBD und Terpenen ab – nicht vom Namen.
          Deshalb setzt die medizinische Praxis zunehmend auf{" "}
          <strong>analysierte Wirkstoffprofile statt Kategorien</strong>.
            <br />
            <br />
            <strong>Quellen:</strong>
            <br />
            Hazekamp, A., Tejkalová, K., & Papadimitriou, S. (2016).{" "}
            <em>
              Cannabis: From Cultivar to Chemovar II—A Metabolomics Approach to
              Cannabis Classification.
            </em>
            Cannabis and Cannabinoid Research, 1(1), 202–215.{" "}
            <a
              href="https://doi.org/10.1089/can.2016.0017"
              target="_blank"
              rel="noopener noreferrer"
            >
              Link
            </a>
            <br />
            Watts, S., et al. (2021).{" "}
            <em>
              Cannabis labelling is associated with genetic variation in terpene
              synthase genes.
            </em>
            Nature Plants, 7(10), 1330–1334.{" "}
            <a
              href="https://doi.org/10.1038/s41477-021-01003-y"
              target="_blank"
              rel="noopener noreferrer"
            >
              Link
            </a>
            <br />
            Herwig, N., et al. (2024).{" "}
            <em>
              Classification of Cannabis Strains Based on their Chemical
              Fingerprint.
            </em>
            Cannabis and Cannabinoid Research.{" "}
            <a
              href="https://doi.org/10.1089/can.2024.0127"
              target="_blank"
              rel="noopener noreferrer"
            >
              Link
            </a>
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <label>
          <input type="checkbox" checked={filters.includeDiscontinued} onChange={(e) => dispatch({ type: "TOGGLE_INCLUDE_DISC", value: e.target.checked })} />
          &nbsp;Eingestellte Sorten einbeziehen
        </label>
      </div>
    </div>
  );
}
