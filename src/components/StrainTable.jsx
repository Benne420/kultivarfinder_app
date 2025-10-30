import React from "react";
import TerpeneChips from "./TerpeneChips";

export default function StrainTable({ strains = [], showInfo = () => {}, showTerpenPanel = () => {} }) {
  const radarPathSvg = (name) => `/netzdiagramme/${name.replace(/\s+/g, "_")}.svg`;
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
          </tr>
        </thead>
        <tbody>
          {strains && strains.length ? (
            strains.map((k) => (
              <tr key={k.name}>
                <td>
                  <div className="strain-name-actions">
                    <a
                      className="link-button"
                      href={`/datenblaetter/${k.name.replace(/\s+/g, "_")}.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {k.name}
                    </a>
                    <button
                      type="button"
                      className="link-button strain-details-button"
                      onClick={() => showInfo(k)}
                      aria-label={`${k.name} Details anzeigen`}
                    >
                      Details
                    </button>
                  </div>
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
                    onClick={() => {
                      const url = radarPathSvg(k.name);
                      window.open(url, "_blank", "noopener,noreferrer");
                    }}
                  >
                    anzeigen
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={hasSimilarityColumn ? 6 : 5}
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
