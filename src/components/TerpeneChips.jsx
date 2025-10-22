import React from "react";
import { getTerpenAliases } from "../utils/helpers";

export default function TerpeneChips({ list = [], onInfo }) {
  if (!Array.isArray(list) || list.length === 0) return "N/A";
  return (
    <div className="terp-list" role="list" aria-label="Terpenprofil">
      {list.map((t, idx) => (
        <button
          key={`${t}-${idx}`}
          className="terp-chip"
          onClick={() => onInfo?.(t)}
          title={`Mehr Informationen zu ${t}`}
        >
          {t}
        </button>
      ))}
    </div>
  );
}
