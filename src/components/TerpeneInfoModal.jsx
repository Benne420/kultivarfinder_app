import React, { useEffect, useRef } from "react";
import CultivarTerpenPanel from "./CultivarTerpenPanel";

export default function TerpeneInfoModal({ isOpen, cultivar, activeTerpene, onClose }) {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    const getFocusable = () => {
      if (!dialogRef.current) return [];
      return Array.from(
        dialogRef.current.querySelectorAll(
          "button, [href], input, select, textarea, [tabindex]:not([tabindex='-1'])"
        )
      ).filter((el) => !el.hasAttribute("disabled") && el.getAttribute("aria-hidden") !== "true");
    };

    const handleKeydown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const elements = getFocusable();
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
    closeButtonRef.current?.focus({ preventScroll: true });

    return () => document.removeEventListener("keydown", handleKeydown);
  }, [isOpen, onClose]);

  if (!isOpen || !cultivar) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        className="modal modal--wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terpene-info-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          className="modal-close"
          onClick={onClose}
          aria-label="Dialog schließen"
          type="button"
        >
          ×
        </button>

        <h3 id="terpene-info-title" className="modal-title">
          Terpen-Informationen für {cultivar.name || "Kultivar"}
        </h3>

        <div className="modal-content">
          <CultivarTerpenPanel cultivar={cultivar} activeTerpene={activeTerpene} />
        </div>
      </div>
    </div>
  );
}
