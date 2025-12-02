import React from "react";
import { radarPathSvg } from "../utils/helpers";
import CultivarTerpenPanel from "./CultivarTerpenPanel";

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
          Netzdiagramm &amp; Terpenprofil: {cultivar.name}
        </h3>
        <div className="terpene-radar-layout">
          <section className="terpene-radar-layout__panel" aria-label="Netzdiagramm">
            <img
              src={radarPathSvg(cultivar.name)}
              alt={`Radar-Diagramm für ${cultivar.name}`}
              className="terpene-radar-layout__image"
            />
            <p className="modal-meta">Visualisierung des Terpenprofils als Netzdiagramm.</p>
          </section>
          <section
            className="terpene-radar-layout__panel terpene-radar-layout__panel--terpenes"
            aria-label="Terpeninformationen"
          >
            <CultivarTerpenPanel cultivar={cultivar} />
          </section>
        </div>
      </div>
    </div>
  );
}
