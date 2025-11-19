import React, { useEffect, useMemo, useState } from "react";
import TerpeneChips from "./TerpeneChips";

const PAGE_SIZE_OPTIONS = [50, 100];
const DEFAULT_PAGE_SIZE = 100;

export default function StrainTable({
  strains = [],
  showInfo = () => {},
  showTerpenPanel = () => {},
  showRadar = () => {},
  onToggleSelect = () => {},
  selectedCultivars = [],
}) {
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  const [pageIndex, setPageIndex] = useState(0);

  const hasSimilarityColumn = Array.isArray(strains)
    ? strains.some((s) => typeof s?.similarity === "number" && !Number.isNaN(s.similarity))
    : false;

  const totalItems = Array.isArray(strains) ? strains.length : 0;
  const totalPages = totalItems ? Math.ceil(totalItems / pageSize) : 0;
  const safePageIndex = Math.min(pageIndex, Math.max(totalPages - 1, 0));

  const paginatedStrains = useMemo(() => {
    if (!Array.isArray(strains) || strains.length === 0) {
      return [];
    }

    const start = safePageIndex * pageSize;
    const end = start + pageSize;
    return strains.slice(start, end);
  }, [pageSize, safePageIndex, strains]);

  useEffect(() => {
    if (pageIndex !== safePageIndex) {
      setPageIndex(safePageIndex);
    }
  }, [pageIndex, safePageIndex]);

  const handlePageSizeChange = (event) => {
    const value = Number.parseInt(event.target.value, 10);
    setPageSize(Number.isNaN(value) ? DEFAULT_PAGE_SIZE : value);
    setPageIndex(0);
  };

  const goToPage = (nextIndex) => {
    if (nextIndex < 0 || nextIndex >= totalPages) {
      return;
    }

    setPageIndex(nextIndex);
  };

  return (
    <div className="strain-table-wrapper">
      <div className="strain-table-scroll" role="region" aria-label="Kultivar-Ergebnisse">
        <table className="strain-table">
          <thead>
            <tr>
              <th className="comparison-column" scope="col" aria-label="Zur Vergleichsauswahl">Vergleich</th>
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
            {paginatedStrains && paginatedStrains.length ? (
              paginatedStrains.map((k) => {
                const isSelected = selectedCultivars.some((item) => item.name === k.name);
                return (
                  <tr key={k.name} className={isSelected ? "is-selected" : undefined}>
                    <td className="comparison-column" data-label="Vergleich">
                      <label className="comparison-checkbox">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(k)}
                          aria-label={`${k.name} für Vergleich ${isSelected ? "abwählen" : "auswählen"}`}
                        />
                        <span aria-hidden="true" />
                      </label>
                    </td>
                    <td data-label="Name">
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
                      <td className="similarity-column" data-label="Übereinstimmung">
                        {typeof k.similarity === "number" && !Number.isNaN(k.similarity)
                          ? `${Math.round(k.similarity * 100)}%`
                          : "–"}
                      </td>
                    )}
                    <td data-label="THC">
                      <span className="thc-values">{k.thc || "N/A"}</span>
                    </td>
                    <td className="hidden-sm" data-label="CBD">
                      {k.cbd || "N/A"}
                    </td>
                    <td className="hidden-sm terpenprofil-cell" data-label="Terpenprofil">
                      <TerpeneChips
                        list={
                          Array.isArray(k.normalizedTerpenprofil) && k.normalizedTerpenprofil.length
                            ? k.normalizedTerpenprofil
                            : k.terpenprofil || []
                        }
                        onInfo={() => showTerpenPanel(k)}
                      />
                    </td>
                    <td data-label="Radar">
                      <button
                        className="link-button"
                        onClick={() => showRadar(k)}
                        type="button"
                        aria-label={`${k.name} Radar anzeigen`}
                      >
                        anzeigen
                      </button>
                    </td>
                    <td data-label="Details">
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
                );
              })
            ) : (
              <tr>
                <td
                  colSpan={hasSimilarityColumn ? 8 : 7}
                  style={{ textAlign: "center", padding: 12 }}
                >
                  Keine Ergebnisse
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="strain-table-pagination" role="navigation" aria-label="Seitennavigation">
          <div className="pagination-controls">
            <button
              type="button"
              className="link-button"
              onClick={() => goToPage(0)}
              disabled={safePageIndex === 0}
            >
              « Erste
            </button>
            <button
              type="button"
              className="link-button"
              onClick={() => goToPage(safePageIndex - 1)}
              disabled={safePageIndex === 0}
            >
              ‹ Zurück
            </button>
            <span className="pagination-status" aria-live="polite">
              Seite {safePageIndex + 1} von {totalPages}
            </span>
            <button
              type="button"
              className="link-button"
              onClick={() => goToPage(safePageIndex + 1)}
              disabled={safePageIndex + 1 >= totalPages}
            >
              Weiter ›
            </button>
            <button
              type="button"
              className="link-button"
              onClick={() => goToPage(totalPages - 1)}
              disabled={safePageIndex + 1 >= totalPages}
            >
              Letzte »
            </button>
          </div>
          <label className="pagination-size" htmlFor="strain-pagination-size">
            Einträge pro Seite:
            <select id="strain-pagination-size" value={pageSize} onChange={handlePageSizeChange}>
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>
        </div>
      )}
    </div>
  );
}
