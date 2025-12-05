import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TerpeneChips from "./TerpeneChips";

const DEFAULT_BATCH_SIZE = 100;
const LOAD_AHEAD_THRESHOLD = 10;
const ROW_HEIGHT = 110;

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
  showTerpeneInfo,
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
  const handleShowTerpeneInfo = useCallback(
    (terpeneName) => showTerpeneInfo(strain, terpeneName),
    [showTerpeneInfo, strain]
  );

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
        <a
          className="link-button action-button strain-table__name-button"
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${name} Datenblatt anzeigen`}
        >
          {name}
        </a>
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
          onInfo={handleShowTerpeneInfo}
          describedBy={terpeneLegendId}
        />
      </td>
      <td data-label="Details" className="action-cell">
        <button
          type="button"
          className="link-button action-button"
          onClick={handleShowRadar}
          aria-label={`${name} Diagramm, Details und Terpene anzeigen`}
        >
          Details
        </button>
      </td>
    </tr>
  );
});

StrainTableRow.displayName = "StrainTableRow";

export default function StrainTable({
  strains = [],
  showRadar = () => {},
  showTerpeneInfo = () => {},
  onToggleSelect = () => {},
  selectedCultivars = [],
  onResetEmptyState = () => {},
  isSimilarityMode = false,
}) {
  const terpeneLegendId = "terpene-legend";
  const [visibleCount, setVisibleCount] = useState(DEFAULT_BATCH_SIZE);
  const [listHeight, setListHeight] = useState(640);
  const [scrollTop, setScrollTop] = useState(0);
  const scrollContainerRef = useRef(null);

  const hasSimilarityColumn = useMemo(() => {
    if (!Array.isArray(strains)) {
      return false;
    }
    return strains.some(
      (s) => typeof s?.similarity === "number" && !Number.isNaN(s.similarity)
    );
  }, [strains]);

  const totalItems = Array.isArray(strains) ? strains.length : 0;

  const visibleStrains = useMemo(() => {
    if (!Array.isArray(strains) || strains.length === 0) {
      return [];
    }

    return strains.slice(0, Math.min(visibleCount, totalItems));
  }, [strains, totalItems, visibleCount]);

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
    const newCount = Math.min(DEFAULT_BATCH_SIZE, totalItems || 0);
    setVisibleCount(newCount || 0);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    setScrollTop(0);
  }, [totalItems]);

  useEffect(() => {
    const updateDimensions = () => {
      if (typeof window === "undefined") {
        return;
      }

      const preferredHeight = Math.min(820, Math.max(360, Math.floor(window.innerHeight * 0.6)));

      if (scrollContainerRef.current) {
        const { clientHeight } = scrollContainerRef.current;
        const nextHeight = Math.min(820, Math.max(320, clientHeight || preferredHeight));
        setListHeight(nextHeight);
      } else {
        setListHeight(preferredHeight);
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const loadMoreItems = useCallback(() => {
    setVisibleCount((current) => {
      const next = Math.min(current + DEFAULT_BATCH_SIZE, totalItems);
      return next;
    });
  }, [totalItems]);

  const overscan = 5;
  const startIndex = useMemo(
    () => Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - overscan),
    [overscan, scrollTop]
  );

  const endIndex = useMemo(
    () =>
      Math.min(
        visibleStrains.length,
        Math.ceil((scrollTop + listHeight) / ROW_HEIGHT) + overscan
      ),
    [listHeight, overscan, scrollTop, visibleStrains.length]
  );

  useEffect(() => {
    if (endIndex >= visibleCount - LOAD_AHEAD_THRESHOLD && visibleCount < totalItems) {
      loadMoreItems();
    }
  }, [endIndex, loadMoreItems, totalItems, visibleCount]);

  const handleScroll = useCallback((event) => {
    const { scrollTop: nextScrollTop } = event.currentTarget;
    setScrollTop(nextScrollTop);
  }, []);

  const columnTemplate = useMemo(
    () =>
      hasSimilarityColumn
        ? "110px minmax(220px, 2fr) 1.1fr 0.8fr 0.9fr 1.6fr 1fr"
        : "110px minmax(220px, 2fr) 0.8fr 0.9fr 1.6fr 1fr",
    [hasSimilarityColumn]
  );

  const totalHeight = useMemo(
    () => Math.max(0, visibleStrains.length * ROW_HEIGHT),
    [visibleStrains.length]
  );

  const paddingTop = useMemo(() => startIndex * ROW_HEIGHT, [startIndex]);
  const paddingBottom = useMemo(
    () => Math.max(totalHeight - endIndex * ROW_HEIGHT, 0),
    [endIndex, totalHeight]
  );

  const visibleRows = useMemo(() => {
    if (!Array.isArray(visibleStrains) || visibleStrains.length === 0) {
      return [];
    }
    const rows = [];
    for (let i = startIndex; i < endIndex; i += 1) {
      rows.push({ index: i, strain: visibleStrains[i] });
    }
    return rows;
  }, [endIndex, startIndex, visibleStrains]);

  return (
    <div className="strain-table-wrapper">
      <div
        className="strain-table-scroll"
        ref={scrollContainerRef}
        onScroll={handleScroll}
        style={{ maxHeight: listHeight }}
        role="region"
        aria-label="Kultivar-Ergebnisse"
      >
        {visibleStrains && visibleStrains.length ? (
          <table className="strain-table" style={{ "--strain-table-columns": columnTemplate }}>
            <thead>
              <tr>
                <th className="comparison-column" scope="col" aria-label="Zur Vergleichsauswahl">
                  Vergleich
                </th>
                <th>Name</th>
                {hasSimilarityColumn && <th className="similarity-column">Übereinstimmung</th>}
                <th>THC</th>
                <th className="hidden-sm">CBD</th>
                <th className="hidden-sm terpenprofil-header">Terpenprofil</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody style={{ minHeight: totalHeight }}>
              {paddingTop > 0 && (
                <tr className="virtual-spacer" aria-hidden="true">
                  <td colSpan={hasSimilarityColumn ? 7 : 6} style={{ height: paddingTop }} />
                </tr>
              )}

              {visibleRows.map(({ index, strain }) => (
                <StrainTableRow
                  key={strain?.name || index}
                  strain={strain}
                  isSelected={strain?.name ? selectedNameSet.has(strain.name) : false}
                  hasSimilarityColumn={hasSimilarityColumn}
                  onToggleSelect={onToggleSelect}
                  showRadar={showRadar}
                  showTerpeneInfo={showTerpeneInfo}
                  terpeneLegendId={terpeneLegendId}
                />
              ))}

              {paddingBottom > 0 && (
                <tr className="virtual-spacer" aria-hidden="true">
                  <td colSpan={hasSimilarityColumn ? 7 : 6} style={{ height: paddingBottom }} />
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <div className="strain-table-empty" role="status" aria-live="polite">
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
                isSimilarityMode ? "Ähnlichkeitssuche zurücksetzen" : "Alle Filter zurücksetzen"
              }
            >
              {isSimilarityMode ? "Ähnlichkeitssuche aufheben" : "Filter zurücksetzen"}
            </button>
          </div>
        )}
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
    </div>
  );
}
