import React from "react";
import EntourageInfoContent from "./EntourageInfo";

const modalStyle = { maxWidth: "640px", maxHeight: "90vh", overflowY: "auto" };

const EntourageInfoModal = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget && typeof onClose === "function") {
      onClose();
    }
  };

  const handleClose = (event) => {
    event.stopPropagation();
    if (typeof onClose === "function") {
      onClose();
    }
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-label="Informationen zum Entourage-Effekt"
      onClick={handleBackdropClick}
    >
      <div className="modal" onClick={(event) => event.stopPropagation()} style={modalStyle}>
        <button className="modal-close" onClick={handleClose} aria-label="Dialog schließen">
          ×
        </button>
        <div className="modal-content">
          <EntourageInfoContent />
        </div>
      </div>
    </div>
  );
};

export default EntourageInfoModal;
