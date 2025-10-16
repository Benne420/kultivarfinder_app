import React, { useRef, useEffect } from 'react';

/**
 * Accessible modal component with keyboard navigation and focus management
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to call when closing the modal
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @returns {JSX.Element|null} Modal component or null if not open
 */
const Modal = ({ isOpen, onClose, title, children }) => {
  const dialogRef = useRef(null);
  const closeButtonRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      // Store the currently focused element
      previouslyFocusedElementRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      
      // Focus the close button after modal opens
      const timer = setTimeout(() => {
        closeButtonRef.current?.focus();
      }, 0);
      
      return () => clearTimeout(timer);
    } else if (previouslyFocusedElementRef.current) {
      // Restore focus to the previously focused element
      previouslyFocusedElementRef.current.focus();
      previouslyFocusedElementRef.current = null;
    }
  }, [isOpen]);

  const handleKeyDown = (event) => {
    if (event.key === "Escape") {
      event.stopPropagation();
      onClose();
      return;
    }
    
    if (event.key === "Tab") {
      const root = dialogRef.current;
      if (!root) return;
      
      const focusableElements = root.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      
      if (!focusableElements.length) return;
      
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const isShiftPressed = event.shiftKey;
      
      if (!isShiftPressed && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      } else if (isShiftPressed && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terpen-dialog-title"
        aria-describedby="terpen-dialog-desc"
        id="terpen-info-dialog"
        onClick={(event) => event.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <button
          ref={closeButtonRef}
          className="modal-close"
          onClick={onClose}
          type="button"
          aria-label="Dialog schließen"
        >
          ×
        </button>
        <h3 className="modal-title" id="terpen-dialog-title">
          {title}
        </h3>
        <div className="modal-content" id="terpen-dialog-desc">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;