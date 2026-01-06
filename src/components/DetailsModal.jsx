import React, { useEffect, useMemo, useRef } from "react";
import { normalizeWirkung, toSafePdfPath } from "../utils/helpers";

export default function DetailsModal({ infoDialog, hideInfo }) {
  const modalRef = useRef(null);
  const closeButtonRef = useRef(null);

  const cultivar = infoDialog?.cultivar;
  const isOpen = Boolean(infoDialog?.open && cultivar);
  const pdfUrl = useMemo(() => toSafePdfPath(cultivar?.name), [cultivar?.name]);

  useEffect(() => {
    if (!isOpen) return undefined;

    const focusableElements = () => {
      if (!modalRef.current) return [];
      return Array.from(
        modalRef.current.querySelectorAll(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        )
      ).filter((el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true");
    };

    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        hideInfo();
        return;
      }

      if (event.key !== "Tab") return;

      const elements = focusableElements();
      if (!elements.length) return;

      const first = elements[0];
      const last = elements[elements.length - 1];

      if (event.shiftKey) {
        if (document.activeElement === first) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", handleKeydown);
    closeButtonRef.current?.focus();

    return () => document.removeEventListener("keydown", handleKeydown);
  }, [hideInfo, isOpen]);

  if (!isOpen) return null;

  const wirkungen = Array.isArray(cultivar.wirkungen)
    ? cultivar.wirkungen.map((w) => normalizeWirkung(w)).join(", ")
    : cultivar.wirkungen;

  const optionalDetails = [
    { label: "Genetik", value: cultivar.genetics || cultivar.genetik },
    { label: "Geruch", value: cultivar.smell },
    { label: "Geschmack", value: cultivar.taste },
    { label: "Aroma/Flavour", value: cultivar.aroma },
    { label: "Anbauhinweise", value: cultivar.anbauhinweise },
  ].filter((entry) => Boolean(entry.value));

  const mainDetails = [
    { label: "Typ", value: cultivar.typ || "Keine Angabe" },
    { label: "Produktlinie", value: cultivar.produktlinie || "Keine Angabe" },
    { label: "THC", value: cultivar.thc || "Keine Angabe" },
    { label: "CBD", value: cultivar.cbd || "Keine Angabe" },
    { label: "Terpengehalt", value: cultivar.terpengehalt || "Keine Angabe" },
    { label: "Angegebene Wirkungen", value: wirkungen || "Keine Angabe" },
  ];

  return (
    <div className="modal-backdrop" onClick={hideInfo}>
      <div
        ref={modalRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="cultivar-details-title"
        aria-describedby="cultivar-details-content"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          className="modal-close"
          onClick={hideInfo}
          aria-label="Dialog schließen"
          type="button"
        >
          ×
        </button>
        <h3 id="cultivar-details-title" className="modal-title">
          {cultivar.name}
        </h3>
        <div id="cultivar-details-content" className="modal-content">
          <dl className="detail-grid" aria-label="Kultivar-Informationen">
            {mainDetails.map((entry) => (
              <div className="detail-grid__row" key={entry.label}>
                <dt>{entry.label}</dt>
                <dd>{entry.value}</dd>
              </div>
            ))}

            {optionalDetails.map((entry) => (
              <div className="detail-grid__row" key={entry.label}>
                <dt>{entry.label}</dt>
                <dd>{entry.value}</dd>
              </div>
            ))}
          </dl>

          <div className="modal-meta" style={{ marginTop: "12px" }}>
            <button
              type="button"
              className="link-button"
              onClick={() => window.open(pdfUrl, "_blank", "noopener,noreferrer")}
              aria-label={`${cultivar.name} Datenblatt öffnen`}
            >
              Datenblatt öffnen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
