import React from "react";
import {
  formatMetricValue,
  getComparisonLayoutMetrics,
  COMPARISON_HEADER_WIDTH_PX,
} from "../utils/helpers";
import {
  comparisonMetrics,
  renderComparisonMetricValue,
} from "./comparisonMetrics";

export default function ComparisonPanel({
  isOpen,
  cultivars = [],
  onClose = () => {},
  onRequestAdd = () => {},
  onShowAllDetails = () => {},
  layoutMetrics,
}) {
  if (!isOpen) {
    return null;
  }

  const cultivarCount = Math.max(cultivars.length, 1);

  const { panelWidthPx, columnWidthPx, radarHeightPx } =
    layoutMetrics && typeof layoutMetrics.panelWidthPx === "number"
      ? layoutMetrics
      : getComparisonLayoutMetrics(cultivarCount);

  const columnWidth = `${columnWidthPx}px`;
  const columnTemplate = {
    gridTemplateColumns: `${COMPARISON_HEADER_WIDTH_PX}px repeat(${cultivarCount}, var(--comparison-column-width, ${columnWidth}))`,
  };

  const panelStyle = {
    "--comparison-column-width": columnWidth,
    "--comparison-radar-height": `${radarHeightPx}px`,
    "--comparison-panel-width": `${panelWidthPx}px`,
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="comparison-panel-backdrop" role="presentation" onClick={handleBackdropClick}>
      <aside
        className="comparison-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="comparison-panel-title"
        onClick={(event) => event.stopPropagation()}
        style={panelStyle}
      >
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

          {comparisonMetrics.map((metric) => {
            const rowClassName = ["comparison-panel__row"];
            if (metric.rowClassName) {
              rowClassName.push(metric.rowClassName);
            }

            const cellClassName = ["comparison-panel__cell"];
            if (metric.cellClassName) {
              cellClassName.push(metric.cellClassName);
            }

            return (
              <div
                key={metric.accessor || metric.label}
                className={rowClassName.join(" ")}
                role="row"
                style={columnTemplate}
              >
                <div className="comparison-panel__cell" role="rowheader">
                  {metric.label}
                </div>
                {cultivars.map((cultivar) => (
                  <div
                    key={`${cultivar.name}-${metric.accessor || metric.label}`}
                    className={cellClassName.join(" ")}
                    role="cell"
                  >
                    {renderComparisonMetricValue(
                      metric,
                      cultivar,
                      "panel",
                      formatMetricValue,
                    )}
                  </div>
                ))}
              </div>
            );
          })}
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
    </div>
  );
}
