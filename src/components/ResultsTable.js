import React from 'react';
import { getPdfFileForName } from '../utils/filterUtils';

/**
 * Terpene chips component for displaying terpene profiles
 * @param {Array} terpeneList - Array of terpene names
 * @param {Function} onTerpeneClick - Handler for terpene chip clicks
 * @returns {JSX.Element} Terpene chips or "N/A" if no terpenes
 */
const TerpeneChips = ({ terpeneList, onTerpeneClick }) => {
  if (!Array.isArray(terpeneList) || terpeneList.length === 0) {
    return "N/A";
  }

  return (
    <ul className="terp-list" aria-label="Terpenprofil Liste">
      {terpeneList.map((terpene, index) => (
        <li key={`${terpene}-${index}`} className="terp-item">
          <button
            className="terp-chip"
            onClick={() => onTerpeneClick(terpene)}
            type="button"
            title={`Mehr Informationen zu ${terpene}`}
            aria-haspopup="dialog"
            aria-controls="terpen-info-dialog"
          >
            {terpene}
          </button>
        </li>
      ))}
    </ul>
  );
};

/**
 * Results table component displaying filtered kultivare
 * @param {Object} props - Component props
 * @param {Array} props.filteredKultivare - Array of filtered kultivar objects
 * @param {boolean} props.isLoading - Whether data is loading
 * @param {string} props.loadError - Error message if loading failed
 * @param {number} props.resultsCount - Number of results found
 * @param {Function} props.onTerpeneClick - Handler for terpene chip clicks
 * @returns {JSX.Element} ResultsTable component
 */
const ResultsTable = ({
  filteredKultivare,
  isLoading,
  loadError,
  resultsCount,
  onTerpeneClick,
}) => {
  return (
    <div className="table-container center-table">
      <div className="card">
        <div>
          <h2>Passende Kultivare:</h2>
          {loadError ? (
            <p role="alert" className="error-message">
              {loadError}
            </p>
          ) : (
            <p
              className="results-count"
              role="status"
              aria-live="polite"
              aria-busy={isLoading}
            >
              {isLoading
                ? "Laden…"
                : `${resultsCount} passende Kultivare gefunden.`}
            </p>
          )}
          {!isLoading && filteredKultivare.length > 0 ? (
            <div className="table-scroll">
              <table className="table">
                <caption className="visually-hidden">
                  Tabelle der passenden Kultivare mit THC, CBD, Terpengehalt und Terpenprofil
                </caption>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">THC %</th>
                    <th className="hidden-sm" scope="col">CBD %</th>
                    <th className="hidden-sm" scope="col">Terpengehalt %</th>
                    <th className="hidden-sm" scope="col">Terpenprofil</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredKultivare.map((strain) => (
                    <tr key={strain.name}>
                      <th scope="row">
                        <a
                          href={encodeURI(
                            `/datenblaetter/${getPdfFileForName(strain.name)}`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="link-button"
                          aria-label={`Datenblatt für ${strain.name} in neuem Tab öffnen`}
                          title={`Datenblatt für ${strain.name} öffnen`}
                        >
                          {strain.name}
                          <span className="visually-hidden">
                            (öffnet in neuem Tab)
                          </span>
                        </a>
                      </th>
                      <td>
                        <span className="thc-values">{strain.thc}</span>
                      </td>
                      <td className="hidden-sm">{strain.cbd}</td>
                      <td className="hidden-sm">
                        {strain.terpengehalt ? strain.terpengehalt : "N/A"}
                      </td>
                      <td className="hidden-sm terpenprofil-cell">
                        <TerpeneChips 
                          terpeneList={strain.terpenprofil} 
                          onTerpeneClick={onTerpeneClick}
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="no-results" role="status" aria-live="polite">
              Bitte wählen Sie Wirkungen und/oder Terpene aus, um passende
              Kultivare zu sehen.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResultsTable;