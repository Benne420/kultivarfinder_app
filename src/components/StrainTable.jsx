import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TerpeneChips from "./TerpeneChips";
import { toSafePdfPath } from "../utils/helpers";

const DEFAULT_BATCH_SIZE = 100;

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
  const topTerpenes = useMemo(() => terpeneList.slice(0, 2), [terpeneList]);

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

  const handleRowClick = useCallback(
    (event) => {
      if (!showRadar) return;
      if (event?.target?.closest?.("button, a, input, label")) {
        return;
      }
      showRadar(strain);
    },
    [showRadar, strain]
  );

  const handleRowKeyDown = useCallback(
    (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        showRadar(strain);
      }
    },
    [showRadar, strain]
  );

  return (
    <tr
      className={`strain-table__row${isSelected ? " is-selected" : ""}`}
      onClick={handleRowClick}
      onKeyDown={handleRowKeyDown}
      tabIndex={0}
      aria-label={`${name} öffnen`}
    >
      <td className="comparison-column" data-label="Vergleich">
        <label className="comparison-checkbox">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleToggleSelect}
            onClick={(event) => event.stopPropagation()}
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
          onClick={(event) => event.stopPropagation()}
          aria-label={`${name} Datenblatt anzeigen`}
        >
          {name}
        </a>
      </td>
      <td data-label="THC">
        <span className="thc-values">{thc ?? "N/A"}</span>
      </td>
      <td data-label="CBD">
        {cbd ?? "N/A"}
      </td>
      <td data-label="Top-Terpene">
        <TerpeneChips
          list={topTerpenes}
          onInfo={handleShowTerpeneInfo}
          describedBy={terpeneLegendId}
        />
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
      <td data-label="Details" className="action-cell">
        <button
          type="button"
          className="link-button action-button"
          onClick={(event) => {
            event.stopPropagation();
            handleShowRadar();
          }}
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
  tableRef = null,
}) {
  const terpeneLegendId = "terpene-legend";
  const [visibleCount, setVisibleCount] = useState(DEFAULT_BATCH_SIZE);
  const loadMoreMarkerRef = useRef(null);

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
  }, [totalItems]);

  const loadMoreItems = useCallback(() => {
    setVisibleCount((current) => {
      const next = Math.min(current + DEFAULT_BATCH_SIZE, totalItems);
      return next;
    });
  }, [totalItems]);

  useEffect(() => {
    if (!loadMoreMarkerRef.current || typeof IntersectionObserver === "undefined") {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const shouldLoadMore = entries.some((entry) => entry.isIntersecting);
        if (shouldLoadMore) {
          loadMoreItems();
        }
      },
      { root: null, rootMargin: "320px 0px", threshold: 0 }
    );

    observer.observe(loadMoreMarkerRef.current);

    return () => observer.disconnect();
  }, [loadMoreItems]);

  const canLoadMore = visibleCount < totalItems;

  return (
    <div className="strain-table-wrapper" ref={tableRef}>
      {visibleStrains && visibleStrains.length ? (
        <table className="strain-table">
          <thead>
            <tr>
              <th className="comparison-column" scope="col" aria-label="Zur Vergleichsauswahl">
                Vergleich
              </th>
              <th scope="col">Name</th>
              <th scope="col">THC</th>
              <th scope="col">CBD</th>
              <th scope="col">Top-Terpene</th>
              {hasSimilarityColumn && (
                <th className="similarity-column" scope="col">
                  Übereinstimmung
                </th>
              )}
              <th scope="col">Details</th>
            </tr>
          </thead>
          <tbody>
            {visibleStrains.map((strain, index) => (
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

      {canLoadMore && (
        <div className="strain-table__load-more">
          <button
            type="button"
            className="primary"
            onClick={loadMoreItems}
            aria-label="Weitere Ergebnisse laden"
          >
            Mehr Ergebnisse laden
          </button>
        </div>
      )}

      <div ref={loadMoreMarkerRef} className="strain-table__sentinel" aria-hidden="true" />

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
