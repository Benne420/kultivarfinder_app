import React, { useCallback, useEffect, useMemo, useState } from "react";
import TerpeneChips from "./TerpeneChips";

const PAGE_SIZE_OPTIONS = [50, 100];
const DEFAULT_PAGE_SIZE = 100;

export const toSafePdfPath = (name) => {
  const trimmed = String(name || "").trim();
  if (!trimmed) {
    return "/datenblaetter/datenblatt.pdf";
  }

  // Entferne nur wirklich problematische Dateisystem-Zeichen, lasse aber Diakritika intakt,
  // damit vorhandene Dateien wie "Rose_Gold_Pavé.pdf" auch gefunden werden.
  const withoutInvalidFsChars = trimmed
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/[\u0000-\u001f]/g, "")
    .replace(/['`]/g, "");

  const underscored = withoutInvalidFsChars
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .trim();

  const safeName = underscored || "datenblatt";
  return `/datenblaetter/${encodeURIComponent(safeName)}.pdf`;
};

const StrainTableRow = React.memo(function StrainTableRow({
  strain,
  isSelected,
  hasSimilarityColumn,
  onToggleSelect,
  showRadar,
  terpeneLegendId,
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
  const handleShowRadar = useCallback(() => showRadar(strain), [showRadar, strain]);
  const handleOpenPdf = useCallback(() => {
    window.open(pdfUrl, "_blank", "noopener,noreferrer");
  }, [pdfUrl]);

  const similarityScore =
    typeof strain.similarity === "number" && !Number.isNaN(strain.similarity)
      ? strain.similarity
      : null;
  const overlap = strain?.overlap;
  const overlapBucketText =
    overlap && Number.isFinite(overlap.bucket)
      ? `${overlap.bucket}/5 Terpene`
      : null;
  const similarityLabel = strain?.similarityLabel;

  const similarityPrimary = similarityLabel || "Übereinstimmung";
  const similarityMeta = [overlapBucketText].filter(Boolean);
  const similarityDescription =
    [similarityLabel, overlapBucketText].filter(Boolean).join(" – ") || "Ähnlichkeitsbewertung";

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
          {similarityScore !== null ? (
            <div className="similarity-badge" aria-label={similarityDescription}>
              <span className="similarity-badge__primary">{similarityPrimary}</span>
              {similarityMeta.length > 0 && (
                <span className="similarity-badge__meta">
                  {similarityMeta.map((entry, index) => (
                    <span
                      key={`${entry}-${index}`}
                      className={index === 0 ? "similarity-pill" : "similarity-detail"}
                    >
                      {entry}
                    </span>
                  ))}
                </span>
              )}
            </div>
          ) : (
            "–"
          )}
        </td>
      )}
      <td data-label="THC">
        <span className="thc-values">{thc || "N/A"}</span>
      </td>
      <td className="hidden-sm" data-label="CBD">
        {cbd || "N/A"}
      </td>
      <td className="hidden-sm terpenprofil-cell" data-label="Terpenprofil">
        <TerpeneChips
          list={terpeneList}
          onInfo={handleShowRadar}
          describedBy={terpeneLegendId}
        />
      </td>
      <td data-label="Radar & Details" className="action-cell">
        <button
          type="button"
          className="link-button action-button"
          onClick={handleShowRadar}
          aria-label={`${name} Diagramm und Kerndaten öffnen`}
        >
          Diagramm &amp; Kerndaten öffnen
        </button>
      </td>
    </tr>
  );
});

StrainTableRow.displayName = "StrainTableRow";

export default function StrainTable({
  strains = [],
  showRadar = () => {},
  onToggleSelect = () => {},
  selectedCultivars = [],
  onResetEmptyState = () => {},
  isSimilarityMode = false,
}) {
  const terpeneLegendId = "terpene-legend";
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
              <th>Diagramm &amp; Kerndaten</th>
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
                  showRadar={showRadar}
                  terpeneLegendId={terpeneLegendId}
                />
              ))
            ) : (
              <tr>
                <td colSpan={hasSimilarityColumn ? 7 : 6} style={{ padding: 12 }}>
                  <div className="empty-state" aria-live="polite">
                    <p className="empty-state__headline">Keine Ergebnisse</p>
                    <p className="empty-state__hint">
                      {isSimilarityMode
                        ? "Es wurden keine ähnlichen Sorten gefunden. Setzen Sie die Ähnlichkeitssuche zurück, um wieder alle Ergebnisse zu sehen."
                        : "Passen Sie die Filter an oder setzen Sie sie zurück, um wieder Treffer zu erhalten."}
                    </p>
                    <button
                      type="button"
                      className="primary"
                      onClick={onResetEmptyState}
                      aria-label={
                        isSimilarityMode
                          ? "Ähnlichkeitssuche zurücksetzen"
                          : "Alle Filter zurücksetzen"
                      }
                    >
                      {isSimilarityMode ? "Ähnlichkeitssuche aufheben" : "Filter zurücksetzen"}
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div id={terpeneLegendId} className="terpene-legend" aria-live="polite">
        <span className="terpene-legend__label">Terpenprofil-Legende:</span>
        <span className="terpene-legend__badge terpene-legend__badge--dominant" aria-hidden="true">
          ★
        </span>
        <span className="terpene-legend__text">Dominant</span>
        <span className="terpene-legend__badge terpene-legend__badge--supporting" aria-hidden="true">
          •
        </span>
        <span className="terpene-legend__text">Begleitend</span>
        <span className="terpene-legend__note">
          Reihenfolge folgt dem Datensatz; im Terpen-Panel lässt sich bei Bedarf
          eine alphabetische Ansicht wählen.
        </span>
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
