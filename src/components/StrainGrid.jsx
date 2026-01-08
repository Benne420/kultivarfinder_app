import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toSafePdfPath, toSafeThumbnailPath } from "../utils/helpers";

const DEFAULT_BATCH_SIZE = 60;

const StrainCard = React.memo(function StrainCard({
  strain,
  isSelected,
  onToggleSelect,
  showRadar,
  showTerpeneInfo,
}) {
  if (!strain) {
    return null;
  }

  const { name = "Unbekannt", thc, normalizedTerpenprofil, terpenprofil } = strain;
  const pdfUrl = useMemo(() => toSafePdfPath(name), [name]);
  const thumbnailUrl = useMemo(() => toSafeThumbnailPath(name), [name]);
  const fallbackThumbnailUrl = useMemo(() => toSafeThumbnailPath(""), []);
  const terpeneList = useMemo(() => {
    if (Array.isArray(normalizedTerpenprofil) && normalizedTerpenprofil.length) {
      return normalizedTerpenprofil;
    }
    return Array.isArray(terpenprofil) ? terpenprofil : [];
  }, [normalizedTerpenprofil, terpenprofil]);
  const topTerpenes = terpeneList.slice(0, 3);

  const handleToggleSelect = useCallback(() => onToggleSelect(strain), [onToggleSelect, strain]);
  const handleShowRadar = useCallback(() => showRadar(strain), [showRadar, strain]);
  const handleShowTerpeneInfo = useCallback(
    (event) => {
      const terpeneName = event.currentTarget?.dataset?.terpene;
      if (terpeneName) {
        showTerpeneInfo(strain, terpeneName);
      }
    },
    [showTerpeneInfo, strain]
  );
  const handleImageError = useCallback(
    (event) => {
      if (event.currentTarget.src !== fallbackThumbnailUrl) {
        event.currentTarget.src = fallbackThumbnailUrl;
        event.currentTarget.onerror = null;
      }
    },
    [fallbackThumbnailUrl]
  );

  return (
    <article className={`strain-card ${isSelected ? "is-selected" : ""}`.trim()}>
      <div className="strain-card__media">
        <img
          src={thumbnailUrl}
          alt={`Blüte der Sorte ${name}`}
          loading="lazy"
          className="strain-card__image"
          onError={handleImageError}
        />
        <label className="strain-card__compare">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleToggleSelect}
            aria-label={`${name} für Vergleich ${isSelected ? "abwählen" : "auswählen"}`}
          />
          <span aria-hidden="true">Vergleichen</span>
        </label>
      </div>
      <div className="strain-card__body">
        <div className="strain-card__header">
          <a
            className="strain-card__name"
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${name} Datenblatt anzeigen`}
          >
            {name}
          </a>
          <span className="strain-card__thc" aria-label={`THC ${thc || "N/A"}`}>
            THC {thc || "N/A"}
          </span>
        </div>

        <div className="strain-card__terpenes" aria-label="Top-Terpene">
          {topTerpenes.length ? (
            topTerpenes.map((terpene) => (
              <button
                type="button"
                key={terpene}
                className="strain-card__badge"
                data-terpene={terpene}
                onClick={handleShowTerpeneInfo}
              >
                {terpene}
              </button>
            ))
          ) : (
            <span className="strain-card__terpene-empty">Keine Terpene hinterlegt</span>
          )}
        </div>
        <div className="strain-card__actions">
          <button
            type="button"
            className="link-button action-button"
            onClick={handleShowRadar}
            aria-label={`${name} Diagramm, Details und Terpene anzeigen`}
          >
            Details
          </button>
        </div>
      </div>
    </article>
  );
});

StrainCard.displayName = "StrainCard";

export default function StrainGrid({
  strains = [],
  showRadar = () => {},
  showTerpeneInfo = () => {},
  onToggleSelect = () => {},
  selectedCultivars = [],
  onResetEmptyState = () => {},
  isSimilarityMode = false,
  gridRef = null,
}) {
  const [visibleCount, setVisibleCount] = useState(DEFAULT_BATCH_SIZE);
  const loadMoreMarkerRef = useRef(null);

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
    setVisibleCount((current) => Math.min(current + DEFAULT_BATCH_SIZE, totalItems));
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
    <div className="strain-grid-wrapper" ref={gridRef}>
      {visibleStrains && visibleStrains.length ? (
        <div className="strain-grid" role="list">
          {visibleStrains.map((strain, index) => (
            <div key={strain?.name || index} role="listitem">
              <StrainCard
                strain={strain}
                isSelected={strain?.name ? selectedNameSet.has(strain.name) : false}
                onToggleSelect={onToggleSelect}
                showRadar={showRadar}
                showTerpeneInfo={showTerpeneInfo}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="strain-grid-empty" role="status" aria-live="polite">
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
        <div className="strain-grid__load-more">
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

      <div ref={loadMoreMarkerRef} className="strain-grid__sentinel" aria-hidden="true" />
    </div>
  );
}
