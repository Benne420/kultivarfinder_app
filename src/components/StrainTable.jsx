import React from "react";
import TerpeneChips from "./TerpeneChips";

export default function StrainTable({ strains = [], showInfo = () => {}, showTerpenPanel = () => {} }) {
  const radarPathSvg = (name) => `/netzdiagramme/${name.replace(/\s+/g, "_")}.svg`;

  return (
    <div className="strain-table-wrapper">
      <table className="strain-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>THC</th>
            <th className="hidden-sm">CBD</th>
            <th className="hidden-sm">Terpenprofil</th>
            <th>Radar</th>
            <th>Terpene</th>
          </tr>
        </thead>
        <tbody>
          {strains && strains.length ? (
            strains.map((k) => (
              <tr key={k.name}>
                <td>
                  <button
                    className="link-button"
                    onClick={() => {
                      const url = `/datenblaetter/${k.name.replace(/\s+/g, "_")}.pdf`;
                      window.open(url, "_blank", "noopener,noreferrer");
                    }}
                  >
                    {k.name}
                  </button>
                </td>
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
                <td>
                  <button className="link-button" onClick={() => showTerpenPanel(k)} title="Detaillierte Terpen-Wirkungen anzeigen">
                    Terpene
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} style={{ textAlign: "center", padding: 12 }}>
                Keine Ergebnisse
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
