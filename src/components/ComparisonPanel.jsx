import React from "react";
import MiniRadarChart from "./MiniRadarChart";

function formatValue(value) {
  if (value == null || value === "") {
    return "–";
  }
  return value;
}

function EffectPills({ effects = [] }) {
  if (!effects.length) {
    return <span className="empty-value">–</span>;
  }

  return (
    <div className="effect-pills" role="list">
      {effects.slice(0, 5).map((effect) => (
        <span key={effect} className="effect-pill" role="listitem">
          {effect}
        </span>
      ))}
    </div>
  );
}

export default function ComparisonPanel({
  isOpen,
  cultivars = [],
  onClose = () => {},
  onRequestAdd = () => {},
  onShowAllDetails = () => {},
}) {
  if (!isOpen) {
    return null;
  }

  const columnTemplate = {
    gridTemplateColumns: `160px repeat(${Math.max(cultivars.length, 1)}, minmax(120px, 1fr))`,
  };

  return (
    <aside className="comparison-panel" role="dialog" aria-modal="true" aria-labelledby="comparison-panel-title">
      <div className="comparison-panel__header">
        <div>
          <p className="comparison-panel__eyebrow">Medizinischer Vergleich</p>
          <h2 id="comparison-panel-title">Vergleich starten</h2>
        </div>
        <button type="button" className="comparison-panel__close" onClick={onClose} aria-label="Vergleich schließen">
          ×
        </button>
      </div>

      <div className="comparison-panel__content" role="table" aria-label="Ausgewählte Sorten vergleichen">
        <div className="comparison-panel__row comparison-panel__row--header" role="row" style={columnTemplate}>
          <div className="comparison-panel__cell" role="columnheader">
            <span className="comparison-panel__cell-label">Parameter</span>
          </div>
          {cultivars.map((cultivar) => (
            <div key={cultivar.name} className="comparison-panel__cell" role="columnheader">
              <span className="comparison-panel__cultivar-name">{cultivar.name}</span>
            </div>
          ))}
        </div>

        <div className="comparison-panel__row" role="row" style={columnTemplate}>
          <div className="comparison-panel__cell" role="rowheader">
            THC
          </div>
          {cultivars.map((cultivar) => (
            <div key={`${cultivar.name}-thc`} className="comparison-panel__cell" role="cell">
              {formatValue(cultivar.thc)}
            </div>
          ))}
        </div>

        <div className="comparison-panel__row" role="row" style={columnTemplate}>
          <div className="comparison-panel__cell" role="rowheader">
            CBD
          </div>
          {cultivars.map((cultivar) => (
            <div key={`${cultivar.name}-cbd`} className="comparison-panel__cell" role="cell">
              {formatValue(cultivar.cbd)}
            </div>
          ))}
        </div>

        <div className="comparison-panel__row" role="row" style={columnTemplate}>
          <div className="comparison-panel__cell" role="rowheader">
            Terpengehalt
          </div>
          {cultivars.map((cultivar) => (
            <div key={`${cultivar.name}-terpengehalt`} className="comparison-panel__cell" role="cell">
              {formatValue(cultivar.terpengehalt)}
            </div>
          ))}
        </div>

        <div className="comparison-panel__row" role="row" style={columnTemplate}>
          <div className="comparison-panel__cell" role="rowheader">
            Terpen-Radar
          </div>
          {cultivars.map((cultivar) => (
            <div key={`${cultivar.name}-radar`} className="comparison-panel__cell" role="cell">
              <MiniRadarChart
                labels={
                  Array.isArray(cultivar.normalizedTerpenprofil) && cultivar.normalizedTerpenprofil.length
                    ? cultivar.normalizedTerpenprofil
                    : cultivar.terpenprofil || []
                }
                size={110}
                title={`Terpen-Radar für ${cultivar.name}`}
              />
            </div>
          ))}
        </div>

        <div className="comparison-panel__row" role="row" style={columnTemplate}>
          <div className="comparison-panel__cell" role="rowheader">
            Häufigste Wirkungen
          </div>
          {cultivars.map((cultivar) => (
            <div key={`${cultivar.name}-effects`} className="comparison-panel__cell" role="cell">
              <EffectPills effects={cultivar.normalizedWirkungen || cultivar.wirkungen || []} />
            </div>
          ))}
        </div>
      </div>

      <div className="comparison-panel__actions">
        <button type="button" className="comparison-panel__add" onClick={onRequestAdd}>
          + Weitere Sorte hinzufügen
        </button>
        <div className="comparison-panel__action-buttons">
          <button type="button" className="secondary" onClick={onClose}>
            Vergleich schließen
          </button>
          <button type="button" className="primary" onClick={onShowAllDetails}>
            Alle Details anzeigen
          </button>
        </div>
      </div>
    </aside>
  );
}
