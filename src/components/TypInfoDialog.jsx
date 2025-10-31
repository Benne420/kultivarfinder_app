import React from "react";

export default function TypInfoDialog({ open, onClose, dialogId }) {
  React.useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const titleId = `${dialogId}-title`;

  const stopPropagation = (event) => {
    event.stopPropagation();
  };

  return (
    <div
      className="modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      id={dialogId}
      onClick={onClose}
    >
      <div className="modal typ-info-modal" onClick={stopPropagation}>
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Dialog schließen"
        >
          ×
        </button>
        <h3 className="modal-title" id={titleId}>
          Indica / Sativa – Was diese Begriffe (nicht) bedeuten
        </h3>
        <div className="modal-content typ-info-modal__content">
          <p>
            Die Begriffe <em>Indica</em> und <em>Sativa</em> stammen aus der Botanik,
            sagen heute jedoch <strong>nichts Verlässliches über Wirkung oder
            Inhaltsstoffe</strong> aus. Studien zeigen, dass diese Etiketten weder
            genetische Verwandtschaft noch chemische Profile zuverlässig erklären
            (Hazekamp et al., 2016; Watts et al., 2021).
          </p>
          <p>
            Auch eine Analyse medizinischer Sorten aus Deutschland ergab
            <strong>keine konsistenten Terpen- oder Wirkstoffmuster entlang der
            Label</strong> (Herwig et al., 2024). Wirkung und Verträglichkeit hängen vom
            Zusammenspiel aus THC, CBD und Terpenen ab – nicht vom Namen. Daher setzt
            die medizinische Praxis zunehmend auf <strong>analysierte Wirkstoffprofile</strong>
            statt Kategorien.
          </p>
          <div className="typ-info-modal__sources">
            <strong>Quellen:</strong>
            <ul>
              <li>
                Hazekamp, A., Tejkalová, K., & Papadimitriou, S. (2016).
                <em>
                  Cannabis: From Cultivar to Chemovar II—A Metabolomics Approach to
                  Cannabis Classification.
                </em>
                Cannabis and Cannabinoid Research, 1(1), 202–215.{" "}
                <a
                  href="https://doi.org/10.1089/can.2016.0017"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Link
                </a>
              </li>
              <li>
                Watts, S., et al. (2021).
                <em>
                  Cannabis labelling is associated with genetic variation in terpene
                  synthase genes.
                </em>
                Nature Plants, 7(10), 1330–1334.{" "}
                <a
                  href="https://doi.org/10.1038/s41477-021-01003-y"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Link
                </a>
              </li>
              <li>
                Herwig, N., et al. (2024).
                <em>
                  Classification of Cannabis Strains Based on their Chemical Fingerprint.
                </em>
                Cannabis and Cannabinoid Research.{" "}
                <a
                  href="https://doi.org/10.1089/can.2024.0127"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Link
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
