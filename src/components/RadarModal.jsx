import React, { useEffect, useMemo, useRef } from "react";
import TerpeneChips from "./TerpeneChips";
import { normalizeWirkung, radarPathSvg } from "../utils/helpers";

export default function RadarModal({ radarDialog, hideRadar }) {
  const cultivar = radarDialog?.cultivar || {};
  const isOpen = Boolean(radarDialog?.open && radarDialog?.cultivar);
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);
  const lastFocusedElementRef = useRef(null);
  const safeId = (cultivar.name || "")
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "radar";
  const titleId = `radar-modal-title-${safeId}`;
  const wirkungen = useMemo(() => {
    if (Array.isArray(cultivar?.wirkungen)) {
      return cultivar.wirkungen.map((w) => normalizeWirkung(w)).join(", ");
    }
    return cultivar?.wirkungen;
  }, [cultivar?.wirkungen]);
  const optionalDetails = useMemo(
    () =>
      [
        { label: "Genetik", value: cultivar?.genetics || cultivar?.genetik },
        { label: "Geruch", value: cultivar?.smell },
        { label: "Geschmack", value: cultivar?.taste },
        { label: "Aroma/Flavour", value: cultivar?.aroma },
        { label: "Anbauhinweise", value: cultivar?.anbauhinweise },
      ].filter((entry) => Boolean(entry.value)),
    [
      cultivar?.anbauhinweise,
      cultivar?.aroma,
      cultivar?.genetics,
      cultivar?.genetik,
      cultivar?.smell,
      cultivar?.taste,
    ]
  );

  const mainDetails = useMemo(
    () => [
      { label: "Typ", value: cultivar?.typ || "Keine Angabe" },
      { label: "Produktlinie", value: cultivar?.produktlinie || "Keine Angabe" },
      { label: "THC", value: cultivar?.thc || "Keine Angabe" },
      { label: "CBD", value: cultivar?.cbd || "Keine Angabe" },
      { label: "Terpengehalt", value: cultivar?.terpengehalt || "Keine Angabe" },
      { label: "Angegebene Wirkungen", value: wirkungen || "Keine Angabe" },
    ],
    [cultivar?.cbd, cultivar?.produktlinie, cultivar?.terpengehalt, cultivar?.thc, cultivar?.typ, wirkungen]
  );

  const detailRows = useMemo(
    () => [...mainDetails, ...optionalDetails],
    [mainDetails, optionalDetails]
  );
  const terpeneList = useMemo(() => {
    if (
      Array.isArray(cultivar?.normalizedTerpenprofil) &&
      cultivar.normalizedTerpenprofil.length
    ) {
      return cultivar.normalizedTerpenprofil;
    }
    return Array.isArray(cultivar?.terpenprofil) ? cultivar.terpenprofil : [];
  }, [cultivar?.normalizedTerpenprofil, cultivar?.terpenprofil]);
  const terpeneLegendId = `${titleId}-terpene-legend`;

  useEffect(() => {
    if (!isOpen) return undefined;

    lastFocusedElementRef.current = document.activeElement;
    const nodeToFocus = closeButtonRef.current || modalRef.current;
    if (nodeToFocus?.focus) {
      nodeToFocus.focus({ preventScroll: true });
    }

    return () => {
      if (
        lastFocusedElementRef.current &&
        typeof lastFocusedElementRef.current.focus === "function"
      ) {
        lastFocusedElementRef.current.focus({ preventScroll: true });
      }
    };
  }, [isOpen]);

  const focusableSelectors =
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';

  const trapFocus = (event) => {
    if (event.key !== "Tab" || !modalRef.current) return;

    const focusable = Array.from(
      modalRef.current.querySelectorAll(focusableSelectors)
    ).filter((node) => node.offsetParent !== null);

    if (!focusable.length) {
      event.preventDefault();
      modalRef.current.focus({ preventScroll: true });
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    const current = document.activeElement;

    if (event.shiftKey && current === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && current === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      hideRadar();
      return;
    }

    trapFocus(event);
  };

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={hideRadar}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      ref={modalRef}
      tabIndex={-1}
      onKeyDown={handleKeyDown}
    >
      <div
        className="modal modal--wide modal--terpene-radar"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="modal-close"
          onClick={hideRadar}
          aria-label="Dialog schließen"
          ref={closeButtonRef}
        >
          ×
        </button>
        <h3 className="modal-title" id={titleId}>
          Netzdiagramm &amp; Details: {cultivar.name}
        </h3>
        <div className="terpene-radar-layout">
          <section
            className="terpene-radar-layout__panel terpene-radar-layout__panel--visual"
            aria-label="Netzdiagramm"
          >
            <img
              src={radarPathSvg(cultivar.name)}
              alt={`Radar-Diagramm für ${cultivar.name}`}
              className="terpene-radar-layout__image"
            />
            <p className="modal-meta">Visualisierung des Terpenprofils als Netzdiagramm.</p>
            <div
              className="terpene-radar-layout__terpenes"
              aria-label="Terpenprofil"
            >
              <div className="terpene-radar-layout__terpene-header">
                <h4 className="terpene-radar-layout__terpene-title">Terpenprofil</h4>
                <p className="terpene-radar-layout__terpene-hint">
                  Dominante und begleitende Terpene der Sorte
                </p>
              </div>
              <TerpeneChips list={terpeneList} describedBy={terpeneLegendId} />
              <p id={terpeneLegendId} className="terpene-legend">
                <span className="terpene-legend__label">Legende:</span>
                <span
                  className="terpene-legend__badge terpene-legend__badge--dominant"
                  aria-hidden="true"
                >
                  ★
                </span>
                <span className="terpene-legend__text">Dominant</span>
                <span
                  className="terpene-legend__badge terpene-legend__badge--supporting"
                  aria-hidden="true"
                >
                  •
                </span>
                <span className="terpene-legend__text">Begleitend</span>
              </p>
            </div>
          </section>
          <section
            className="terpene-radar-layout__panel terpene-radar-layout__panel--details"
            aria-label="Sortendetails"
          >
            <dl className="detail-grid" aria-label="Kultivar-Informationen">
              {detailRows.map((entry) => (
                <div className="detail-grid__row" key={entry.label}>
                  <dt>{entry.label}</dt>
                  <dd>{entry.value}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
