import React from "react";
import { radarPathSvg } from "../utils/helpers";

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
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={hideRadar} aria-label="Dialog schließen">
          ×
        </button>
        <h3 className="modal-title" id={titleId}>
          Radar-Diagramm: {cultivar.name}
        </h3>
        <div className="modal-content" style={{ textAlign: "center" }}>
          <img
            src={radarPathSvg(cultivar.name)}
            alt={`Radar-Diagramm für ${cultivar.name}`}
            style={{ maxWidth: "100%", height: "auto" }}
          />
          <p className="modal-meta">Visualisierung des Terpenprofils als Netzdiagramm.</p>
        </div>
      </div>
    </div>
  );
}
