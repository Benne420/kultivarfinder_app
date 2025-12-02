import React, { useMemo } from "react";
import { normalizeWirkung, radarPathSvg } from "../utils/helpers";

export default function RadarModal({ radarDialog, hideRadar }) {
  if (!radarDialog.open || !radarDialog.cultivar) return null;
  const cultivar = radarDialog.cultivar;
  const safeId = (cultivar.name || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "radar";
  const titleId = `radar-modal-title-${safeId}`;
  const wirkungen = useMemo(() => {
    if (Array.isArray(cultivar?.wirkungen)) {
      return cultivar.wirkungen.map((w) => normalizeWirkung(w)).join(", ");
    }
    return cultivar?.wirkungen;
  }, [cultivar?.wirkungen]);
  const optionalDetails = useMemo(
    () =>
      [
        { label: "Aroma/Flavour", value: cultivar?.aroma },
        { label: "Genetik", value: cultivar?.genetik },
        { label: "Anbauhinweise", value: cultivar?.anbauhinweise },
      ].filter((entry) => Boolean(entry.value)),
    [cultivar?.anbauhinweise, cultivar?.aroma, cultivar?.genetik]
  );

  return (
    <div
      className="modal-backdrop"
      onClick={hideRadar}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <div
        className="modal modal--wide modal--terpene-radar"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="modal-close" onClick={hideRadar} aria-label="Dialog schließen">
          ×
        </button>
        <h3 className="modal-title" id={titleId}>
          Netzdiagramm &amp; Details: {cultivar.name}
        </h3>
        <div className="terpene-radar-layout">
          <section
            className="terpene-radar-layout__panel terpene-radar-layout__panel--overview"
            aria-label="Netzdiagramm und Kerndaten"
          >
            <img
              src={radarPathSvg(cultivar.name)}
              alt={`Radar-Diagramm für ${cultivar.name}`}
              className="terpene-radar-layout__image"
            />
            <p className="modal-meta">Visualisierung des Terpenprofils als Netzdiagramm.</p>
            <dl className="terpene-radar-layout__details">
              <div className="terpene-radar-layout__details-row">
                <dt>Typ</dt>
                <dd>{cultivar.typ || "Keine Angabe"}</dd>
              </div>
              <div className="terpene-radar-layout__details-row">
                <dt>THC</dt>
                <dd>{cultivar.thc || "Keine Angabe"}</dd>
              </div>
              <div className="terpene-radar-layout__details-row">
                <dt>CBD</dt>
                <dd>{cultivar.cbd || "Keine Angabe"}</dd>
              </div>
              <div className="terpene-radar-layout__details-row">
                <dt>Terpengehalt</dt>
                <dd>{cultivar.terpengehalt || "Keine Angabe"}</dd>
              </div>
              <div className="terpene-radar-layout__details-row">
                <dt>Angegebene Wirkungen</dt>
                <dd>{wirkungen || "Keine Angabe"}</dd>
              </div>
              {optionalDetails.length > 0 && (
                <div
                  className="terpene-radar-layout__details-row terpene-radar-layout__details-row--stack"
                  aria-label="Zusätzliche Angaben"
                >
                  {optionalDetails.map((entry) => (
                    <div key={entry.label} className="terpene-radar-layout__detail-chip">
                      <span className="terpene-radar-layout__detail-label">{entry.label}:</span>
                      <span>{entry.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
