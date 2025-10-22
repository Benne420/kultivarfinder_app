import React from "react";
import TerpeneChips from "./TerpeneChips";

export default function StrainTable({ strains = [], showInfo, showTerpenPanel }) {
  const radarPathSvg = (name) => `/netzdiagramme/${name.replace(/\s+/g, "_")}.svg`;

  return (
    <div className="table-container center-table">
      <div className="card">
        <div>
          <h2>Passende Kultivare:</h2>
          {strains.length > 0 ? (
            <div className="table-scroll">
              <table className="table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>THC %</th>
                    <th className="hidden-sm">CBD %</th>
                    <th className="hidden-sm">Terpenprofil</th>
                    <th>Diagramm</th>
                    <th>Details</th>
                    <th>Terpene</th>
                  </tr>
                </thead>
                <tbody>
                  {strains.map((k) => (
                    <tr key={k.name}>
                      <td>
                        <button
                          onClick={() => {
                            const url = `/datenblaetter/${k.name.replace(/\s+/g, "_")}.pdf`;
                            window.open(url, "_blank", "noopener,noreferrer");
                          }}
                          className="link-button"
                        >
                          {k.name}
                        </button>
                      </td>
                      <td>
                        <span className="thc-values">{k.thc || "N/A"}</span>
                      </td>
                      <td className="hidden-sm">{k.cbd || "N/A"}</td>
                      <td className="hidden-sm terpenprofil-cell">{TerpeneChips({ list: k.terpenprofil, onInfo: () => showTerpenPanel(k) })}</td>
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
                        <button className="link-button" onClick={() => showInfo(k)}>
                          Info
                        </button>
                      </td>
                      <td>
                        <button className="link-button" onClick={() => showTerpenPanel(k)} title="Detaillierte Terpen-Wirkungen anzeigen">
                          Terpene
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>Keine passenden Kultivare gefunden.</p>
          )}
        </div>
      </div>
    </div>
  );
}
