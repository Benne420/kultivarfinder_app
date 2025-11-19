import React from "react";
import TerpeneRadarImage from "./TerpeneRadarImage";
import {
  formatMetricValue,
  getComparisonLayoutMetrics,
} from "../utils/helpers";
import {
  comparisonMetrics,
  renderComparisonMetricValue,
} from "./comparisonMetrics";

export default function ComparisonDetailsModal({
  isOpen,
  cultivars = [],
  onClose = () => {},
  layoutMetrics,
}) {
  const showModal = isOpen && Array.isArray(cultivars) && cultivars.length > 0;

  if (!showModal) {
    return null;
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  const cultivarCount = Math.max(cultivars.length, 1);
  const { panelWidthPx, columnWidthPx, radarHeightPx } =
    layoutMetrics && typeof layoutMetrics.panelWidthPx === "number"
      ? layoutMetrics
      : getComparisonLayoutMetrics(cultivarCount);

  const modalStyle = {
    "--comparison-panel-width": `${panelWidthPx}px`,
    "--comparison-column-width": `${columnWidthPx}px`,
    "--comparison-radar-height": `${radarHeightPx}px`,
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div
        className="comparison-details-modal"
        onClick={(event) => event.stopPropagation()}
        role="document"
        style={modalStyle}
      >
        <header className="comparison-details-modal__header">
          <div>
            <p className="comparison-details-modal__eyebrow">Vergleichsansicht</p>
            <h2 className="comparison-details-modal__title">Alle Details anzeigen</h2>
          </div>
          <button type="button" className="comparison-details-modal__close" onClick={onClose} aria-label="Dialog schließen">
            ×
          </button>
        </header>

        <div className="comparison-details-modal__content" role="list">
          {cultivars.map((cultivar) => (
            <section key={cultivar.name} className="comparison-details-modal__cultivar" role="listitem">
              <header className="comparison-details-modal__cultivar-header">
                <h3>{cultivar.name}</h3>
                {cultivar.typ && <p className="comparison-details-modal__cultivar-meta">{cultivar.typ}</p>}
              </header>

              <div className="comparison-details-modal__body">
                <dl className="comparison-details-modal__metrics">
                  {comparisonMetrics
                    .filter((metric) => metric.includeInDetails !== false)
                    .map((metric) => (
                      <div key={metric.accessor || metric.label}>
                        <dt>{metric.label}</dt>
                        <dd>
                          {renderComparisonMetricValue(
                            metric,
                            cultivar,
                            "details",
                            formatMetricValue,
                          )}
                        </dd>
                      </div>
                    ))}
                </dl>

                <div className="comparison-details-modal__radar">
                  <div className="comparison-details-modal__radar-wrapper">
                    <TerpeneRadarImage
                      cultivarName={cultivar?.name}
                      className="comparison-details-modal__radar-image"
                      lazy={false}
                    />
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
