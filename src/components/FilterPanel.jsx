import React from "react";

const slugify = (prefix, value) =>
  `${prefix}-${value}`
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

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
          <div
            className="multi-select"
            role="group"
            aria-labelledby="terpene-heading"
          >
            {terpene.map((t) => {
              const id = slugify("terpene", t);
              return (
                <label key={t} htmlFor={id} className="multi-select__option">
                  <input
                    id={id}
                    type="checkbox"
                    value={t}
                    checked={filters.selectedTerpene.has(t)}
                    onChange={() => handleTerpeneToggle(t)}
                  />
                  <span>{t}</span>
                </label>
              );
            })}
          </div>
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
          <div
            className="multi-select"
            role="group"
            aria-labelledby="wirkungen-heading"
          >
            {wirkungen.map((w) => {
              const id = slugify("wirkung", w);
              return (
                <label key={w} htmlFor={id} className="multi-select__option">
                  <input
                    id={id}
                    type="checkbox"
                    value={w}
                    checked={filters.selectedWirkungen.has(w)}
                    onChange={() => handleWirkungToggle(w)}
                  />
                  <span>{w}</span>
                </label>
              );
            })}
          </div>
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
