import React, { useEffect, useMemo, useRef } from "react";
import { normalizeWirkung } from "../utils/helpers";
import { toSafePdfPath } from "./StrainTable";

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
          <p>
            <strong>Typ:</strong> {cultivar.typ || "Keine Angabe"}
          </p>
          <p>
            <strong>Produktlinie:</strong> {cultivar.produktlinie || "Keine Angabe"}
          </p>
          <p>
            <strong>THC:</strong> {cultivar.thc || "Keine Angabe"}
          </p>
          <p>
            <strong>CBD:</strong> {cultivar.cbd || "Keine Angabe"}
          </p>
          <p>
            <strong>Terpengehalt:</strong> {cultivar.terpengehalt || "Keine Angabe"}
          </p>
          <p>
            <strong>Angegebene Wirkungen:</strong> {wirkungen || "Keine Angabe"}
          </p>

          {optionalDetails.length > 0 && (
            <div className="modal-meta" aria-label="Zusätzliche Angaben">
              {optionalDetails.map((entry) => (
                <p key={entry.label}>
                  <strong>{entry.label}:</strong> {entry.value}
                </p>
              ))}
            </div>
          )}

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
