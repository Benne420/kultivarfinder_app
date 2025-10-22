import React from "react";
import TerpeneChips from "./TerpeneChips";

export default function FilterPanel({
  filters,
  dispatch,
  terpeneOptions,
  wirkungen,
  typInfo,
  terpene,
  optionsFor,
  clearTerpene,
  clearWirkungen,
  showTerpenPanel,
  setIncludeDiscontinued,
}) {
  return (
    <div className="filters">
      <div className="select-group">
        <h3>Terpene</h3>
        <div className="select-row">
          <select
            value={filters.terp1}
            onChange={(e) => dispatch({ type: "SET_TERP1", value: e.target.value })}
          >
            <option value="">–</option>
            {optionsFor(terpene, filters.terp2).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <select
            value={filters.terp2}
            onChange={(e) => dispatch({ type: "SET_TERP2", value: e.target.value })}
          >
            <option value="">–</option>
            {optionsFor(terpene, filters.terp1).map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
          <button className="reset-btn" onClick={clearTerpene} disabled={!filters.selectedTerpene.size}>
            ×
          </button>
        </div>
      </div>

      <div className="select-group">
        <h3>Wirkungen</h3>
        <div className="select-row">
          <select value={filters.wirk1} onChange={(e) => dispatch({ type: "SET_WIRK1", value: e.target.value })}>
            <option value="">–</option>
            {optionsFor(wirkungen, filters.wirk2).map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
          <select value={filters.wirk2} onChange={(e) => dispatch({ type: "SET_WIRK2", value: e.target.value })}>
            <option value="">–</option>
            {optionsFor(wirkungen, filters.wirk1).map((w) => (
              <option key={w} value={w}>
                {w}
              </option>
            ))}
          </select>
          <button className="reset-btn" onClick={clearWirkungen} disabled={!filters.selectedWirkungen.size}>
            ×
          </button>
        </div>
      </div>

      <div className="typ-button-group">
        <h3>Typ</h3>
        <div className="typ-row">
          {Object.keys(typInfo).map((t) => (
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
          Indica / Sativa – Was diese Begriffe (nicht) bedeuten:<br />
          Die Begriffe Indica und Sativa stammen aus der Botanik, sagen aber heute nichts Verlässliches über Wirkung oder Inhaltsstoffe aus.
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
