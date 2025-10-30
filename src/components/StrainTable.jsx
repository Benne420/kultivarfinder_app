import React from "react";
import TerpeneChips from "./TerpeneChips";
import { radarPathSvg } from "../utils/helpers";

export default function StrainTable({
  strains = [],
  showInfo = () => {},
  showTerpenPanel = () => {},
  showRadar = () => {},
}) {
  const hasSimilarityColumn = Array.isArray(strains)
    ? strains.some((s) => typeof s?.similarity === "number" && !Number.isNaN(s.similarity))
    : false;

  return (
    <div className="strain-table-wrapper">
      <table className="strain-table">
        <thead>
          <tr>
            <th>Name</th>
            {hasSimilarityColumn && <th className="similarity-column">Übereinstimmung</th>}
            <th>THC</th>
            <th className="hidden-sm">CBD</th>
            <th className="hidden-sm terpenprofil-header">Terpenprofil</th>
            <th>Radar</th>
            <th>Details</th>
          </tr>
        </thead>
        <tbody>
          {strains && strains.length ? (
            strains.map((k) => (
              <tr key={k.name}>
                <td>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => {
                      const url = `/datenblaetter/${k.name.replace(/\s+/g, "_")}.pdf`;
                      window.open(url, "_blank", "noopener,noreferrer");
                    }}
                    aria-label={`${k.name} Datenblatt anzeigen`}
                  >
                    {k.name}
                  </button>
                </td>
                {hasSimilarityColumn && (
                  <td className="similarity-column">
                    {typeof k.similarity === "number" && !Number.isNaN(k.similarity)
                      ? `${Math.round(k.similarity * 100)}%`
                      : "–"}
                  </td>
                )}
                <td>
                  <span className="thc-values">{k.thc || "N/A"}</span>
                </td>
                <td className="hidden-sm">{k.cbd || "N/A"}</td>
                <td className="hidden-sm terpenprofil-cell">
                  <TerpeneChips list={k.terpenprofil || []} onInfo={() => showTerpenPanel(k)} />
                </td>
                <td>
                  <button
                    className="link-button"
                    onClick={() => showRadar(k)}
                    type="button"
                    aria-label={`${k.name} Radar anzeigen`}
                  >
                    anzeigen
                  </button>
                </td>
                <td>
                  <button
                    type="button"
                    className="link-button"
                    onClick={() => showInfo(k)}
                    aria-label={`${k.name} Details anzeigen`}
                  >
                    anzeigen
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={hasSimilarityColumn ? 7 : 6}
                style={{ textAlign: "center", padding: 12 }}
              >
                Keine Ergebnisse
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
