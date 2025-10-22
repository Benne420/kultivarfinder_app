import React from "react";
import { normalizeWirkung } from "../utils/helpers";

export default function DetailsModal({ infoDialog, hideInfo }) {
  if (!infoDialog.open || !infoDialog.cultivar) return null;
  const cultivar = infoDialog.cultivar;
  return (
    <div className="modal-backdrop" onClick={hideInfo} role="dialog" aria-modal="true" aria-label={cultivar.name}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={hideInfo} aria-label="Dialog schließen">×</button>
        <h3 className="modal-title">{cultivar.name}</h3>
        <div className="modal-content">
          <p><strong>Typ:</strong> {cultivar.typ ? cultivar.typ : "N/A"}</p>
          <p><strong>THC:</strong> {cultivar.thc || "N/A"}</p>
          <p><strong>CBD:</strong> {cultivar.cbd || "N/A"}</p>
          <p><strong>Terpengehalt:</strong> {cultivar.terpengehalt || "N/A"}</p>
          <p><strong>Wirkungen:</strong> {Array.isArray(cultivar.wirkungen) ? cultivar.wirkungen.map((w) => normalizeWirkung(w)).join(", ") : "N/A"}</p>
          <p><strong>Terpenprofil:</strong> {/* Terpene rendered by parent via TerpeneChips */}</p>
        </div>
      </div>
    </div>
  );
}
