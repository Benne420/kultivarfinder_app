import React, { useMemo } from "react";
import TerpeneChips from "./TerpeneChips";
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
  const terpeneList = useMemo(() => {
    if (
      Array.isArray(cultivar?.normalizedTerpenprofil) &&
      cultivar.normalizedTerpenprofil.length
    ) {
      return cultivar.normalizedTerpenprofil;
    }
    return Array.isArray(cultivar?.terpenprofil) ? cultivar.terpenprofil : [];
  }, [cultivar?.normalizedTerpenprofil, cultivar?.terpenprofil]);
  const terpeneLegendId = `${titleId}-terpene-legend`;

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
            className="terpene-radar-layout__panel terpene-radar-layout__panel--visual"
            aria-label="Netzdiagramm"
          >
            <img
              src={radarPathSvg(cultivar.name)}
              alt={`Radar-Diagramm für ${cultivar.name}`}
              className="terpene-radar-layout__image"
            />
            <p className="modal-meta">Visualisierung des Terpenprofils als Netzdiagramm.</p>
          </section>
          <section
            className="terpene-radar-layout__panel terpene-radar-layout__panel--details"
            aria-label="Sortendetails"
          >
            <div className="terpene-radar-layout__details-grid">
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
                <div className="terpene-radar-layout__details-row terpene-radar-layout__details-row--wide">
                  <dt>Angegebene Wirkungen</dt>
                  <dd>{wirkungen || "Keine Angabe"}</dd>
                </div>
              </dl>
              {optionalDetails.length > 0 && (
                <div className="terpene-radar-layout__extras" aria-label="Zusätzliche Angaben">
                  {optionalDetails.map((entry) => (
                    <div key={entry.label} className="terpene-radar-layout__detail-chip">
                      <span className="terpene-radar-layout__detail-label">{entry.label}:</span>
                      <span>{entry.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div
              className="terpene-radar-layout__terpenes"
              aria-label="Terpenprofil"
            >
              <div className="terpene-radar-layout__terpene-header">
                <h4 className="terpene-radar-layout__terpene-title">Terpenprofil</h4>
                <p className="terpene-radar-layout__terpene-hint">
                  Dominante und begleitende Terpene der Sorte
                </p>
              </div>
              <TerpeneChips list={terpeneList} describedBy={terpeneLegendId} />
              <p id={terpeneLegendId} className="terpene-legend">
                <span className="terpene-legend__label">Legende:</span>
                <span
                  className="terpene-legend__badge terpene-legend__badge--dominant"
                  aria-hidden="true"
                >
                  ★
                </span>
                <span className="terpene-legend__text">Dominant</span>
                <span
                  className="terpene-legend__badge terpene-legend__badge--supporting"
                  aria-hidden="true"
                >
                  •
                </span>
                <span className="terpene-legend__text">Begleitend</span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
