import React from "react";
import TerpeneRadarImage from "./TerpeneRadarImage";

function formatValue(value) {
  if (value == null || value === "") {
    return "–";
  }
  return value;
}

export default function ComparisonDetailsModal({ isOpen, cultivars = [], onClose = () => {} }) {
  const showModal = isOpen && Array.isArray(cultivars) && cultivars.length > 0;

  if (!showModal) {
    return null;
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-backdrop" onClick={handleBackdropClick} role="dialog" aria-modal="true">
      <div className="comparison-details-modal" onClick={(event) => event.stopPropagation()} role="document">
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
                  <div>
                    <dt>THC</dt>
                    <dd>{formatValue(cultivar.thc)}</dd>
                  </div>
                  <div>
                    <dt>CBD</dt>
                    <dd>{formatValue(cultivar.cbd)}</dd>
                  </div>
                  <div>
                    <dt>Terpengehalt</dt>
                    <dd>{formatValue(cultivar.terpengehalt)}</dd>
                  </div>
                  <div>
                    <dt>Häufigste Wirkungen</dt>
                    <dd>
                      {Array.isArray(cultivar.normalizedWirkungen) && cultivar.normalizedWirkungen.length ? (
                        <div className="effect-pills" role="list">
                          {cultivar.normalizedWirkungen.slice(0, 6).map((effect) => (
                            <span key={effect} className="effect-pill" role="listitem">
                              {effect}
                            </span>
                          ))}
                        </div>
                      ) : Array.isArray(cultivar.wirkungen) && cultivar.wirkungen.length ? (
                        <div className="effect-pills" role="list">
                          {cultivar.wirkungen.slice(0, 6).map((effect) => (
                            <span key={effect} className="effect-pill" role="listitem">
                              {effect}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="empty-value">–</span>
                      )}
                    </dd>
                  </div>
                </dl>

                <div className="comparison-details-modal__radar">
                  <TerpeneRadarImage
                    cultivarName={cultivar?.name}
                    className="comparison-details-modal__radar-image"
                    lazy={false}
                  />
                </div>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
