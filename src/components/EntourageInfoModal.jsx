import React, { useId } from "react";
import EntourageInfoContent from "./EntourageInfo";

const EntourageInfoModal = ({ isOpen, onClose }) => {
  const titleId = useId();

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      onClick={onClose}
    >
      <div
        className="modal"
        onClick={(event) => event.stopPropagation()}
        style={{ maxWidth: "640px", maxHeight: "90vh", overflowY: "auto" }}
      >
        <button className="modal-close" onClick={onClose} aria-label="Dialog schließen">
          ×
        </button>
        <div className="modal-content">
          <EntourageInfoContent headingId={titleId} />
        </div>
      </div>
    </div>
  );
};

export default EntourageInfoModal;
