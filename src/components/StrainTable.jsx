import React, { useCallback, useEffect, useMemo, useState } from "react";
import TerpeneChips from "./TerpeneChips";

const PAGE_SIZE_OPTIONS = [50, 100];
const DEFAULT_PAGE_SIZE = 100;

const toSafePdfPath = (name) => {
  const normalized = String(name || "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/["'`]/g, "")
    .trim();

  const sanitized = normalized.replace(/[^\w\s-]+/g, "");
  const underscored = sanitized.replace(/\s+/g, "_") || "datenblatt";

  return `/datenblaetter/${encodeURIComponent(underscored)}.pdf`;
};

const StrainTableRow = React.memo(function StrainTableRow({
  strain,
  isSelected,
  hasSimilarityColumn,
  onToggleSelect,
  showInfo,
  showTerpenPanel,
  showRadar,
}) {
  if (!strain) {
    return null;
  }

  const { name = "Unbekannt", thc, cbd, normalizedTerpenprofil, terpenprofil } = strain;
  const pdfUrl = useMemo(() => toSafePdfPath(name), [name]);
  const terpeneList = useMemo(() => {
    if (Array.isArray(normalizedTerpenprofil) && normalizedTerpenprofil.length) {
      return normalizedTerpenprofil;
    }
    return Array.isArray(terpenprofil) ? terpenprofil : [];
  }, [normalizedTerpenprofil, terpenprofil]);

  const handleToggleSelect = useCallback(() => onToggleSelect(strain), [onToggleSelect, strain]);
  const handleShowInfo = useCallback(() => showInfo(strain), [showInfo, strain]);
  const handleShowTerpenPanel = useCallback(
    () => showTerpenPanel(strain),
    [showTerpenPanel, strain]
  );
  const handleShowRadar = useCallback(() => showRadar(strain), [showRadar, strain]);
  const handleOpenPdf = useCallback(() => {
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  }, [pdfUrl]);

  const similarityValue =
    typeof strain.similarity === "number" && !Number.isNaN(strain.similarity)
      ? `${Math.round(strain.similarity * 100)}%`
      : "–";

  return (
    <tr className={isSelected ? "is-selected" : undefined}>
      <td className="comparison-column" data-label="Vergleich">
        <label className="comparison-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleToggleSelect}
            aria-label={`${name} für Vergleich ${isSelected ? "abwählen" : "auswählen"}`}
          />
          <span aria-hidden="true" />
        </label>
      </td>
      <td data-label="Name">
        <button
          type="button"
          className="link-button"
          onClick={handleOpenPdf}
          aria-label={`${name} Datenblatt anzeigen`}
        >
          {name}
        </button>
      </td>
      {hasSimilarityColumn && (
        <td className="similarity-column" data-label="Übereinstimmung">
          {similarityValue}
        </td>
      )}
      <td data-label="THC">
        <span className="thc-values">{thc || "N/A"}</span>
      </td>
      <td className="hidden-sm" data-label="CBD">
        {cbd || "N/A"}
      </td>
      <td className="hidden-sm terpenprofil-cell" data-label="Terpenprofil">
        <TerpeneChips list={terpeneList} onInfo={handleShowTerpenPanel} />
      </td>
      <td data-label="Radar">
        <button
          className="link-button"
          onClick={handleShowRadar}
          type="button"
          aria-label={`${name} Radar anzeigen`}
        >
          anzeigen
        </button>
      </td>
      <td data-label="Details">
        <button
          type="button"
          className="link-button"
          onClick={handleShowInfo}
          aria-label={`${name} Details anzeigen`}
        >
          anzeigen
        </button>
      </td>
    </tr>
  );
});

StrainTableRow.displayName = "StrainTableRow";

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

  const hasSimilarityColumn = useMemo(() => {
    if (!Array.isArray(strains)) {
      return false;
    }
    return strains.some(
      (s) => typeof s?.similarity === "number" && !Number.isNaN(s.similarity)
    );
  }, [strains]);

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

  const selectedNameSet = useMemo(() => {
    if (!Array.isArray(selectedCultivars) || !selectedCultivars.length) {
      return new Set();
    }

    return new Set(
      selectedCultivars
        .map((item) => (item?.name ? item.name : null))
        .filter((value) => typeof value === "string")
    );
  }, [selectedCultivars]);

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
              paginatedStrains.map((k) => (
                <StrainTableRow
                  key={k.name}
                  strain={k}
                  isSelected={selectedNameSet.has(k.name)}
                  hasSimilarityColumn={hasSimilarityColumn}
                  onToggleSelect={onToggleSelect}
                  showInfo={showInfo}
                  showTerpenPanel={showTerpenPanel}
                  showRadar={showRadar}
                />
              ))
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
