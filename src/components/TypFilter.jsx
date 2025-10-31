import React from "react";

export default function TypFilter({ typ, dispatch, typInfo }) {
  const [isInfoOpen, setIsInfoOpen] = React.useState(false);
  const infoTitleId = "typ-info-title";
  const dialogId = "typ-info-dialog";
  const descriptionId = "typ-info-description";

  const openInfo = () => setIsInfoOpen(true);
  const closeInfo = () => setIsInfoOpen(false);

  return (
    <div className="typ-button-group">
      <h3>Typ</h3>
      <div className="typ-row">
        {Object.keys(typInfo)
          // entferne reine "Indica" / "Sativa" Buttons (exakte Bezeichnungen)
          .filter((t) => !/^\s*(indica|sativa)\s*$/i.test(t))
          .map((t) => (
            <button
              key={t}
              className={`typ-btn ${typ === t ? "active" : ""}`}
              onClick={() => dispatch({ type: "SET_TYP", value: typ === t ? "" : t })}
            >
              {t}
            </button>
          ))}
      </div>
      <p id={descriptionId} className="typ-description">
        {typ ? typInfo[typ] : ""}
      </p>
      <div className="typ-info">
        <button
          type="button"
          className="typ-info__button"
          onClick={openInfo}
          aria-haspopup="dialog"
          aria-controls={dialogId}
          aria-describedby={descriptionId}
        >
          <span className="typ-info__button-icon" aria-hidden="true">
            ℹ️
          </span>
          <span className="typ-info__button-label">Mehr zu Indica / Sativa</span>
        </button>
      </div>
      {isInfoOpen ? (
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby={infoTitleId}
          onClick={closeInfo}
        >
          <div
            id={dialogId}
            className="modal modal--info"
            role="document"
            onClick={(event) => event.stopPropagation()}
          >
            <button type="button" className="modal-close" onClick={closeInfo} aria-label="Dialog schließen">
              ×
            </button>
            <h4 id={infoTitleId} className="modal-title">
              Indica / Sativa – Was diese Begriffe (nicht) bedeuten
            </h4>
            <div className="modal-content typ-info-modal__content">
              <p>
                Die Begriffe <em>Indica</em> und <em>Sativa</em> stammen aus der Botanik, sagen aber heute
                <strong> nichts Verlässliches über Wirkung oder Inhaltsstoffe</strong> aus.
              </p>
              <p>
                Studien zeigen, dass diese Etiketten weder genetische Verwandtschaft noch chemische Profile zuverlässig erklären
                (Hazekamp et al., 2016; Watts et al., 2021). Auch eine Analyse medizinischer Sorten aus Deutschland ergab
                <strong> keine konsistenten Terpen- oder Wirkstoffmuster entlang der Label</strong> (Herwig et al., 2024).
              </p>
              <p>
                Wirkung und Verträglichkeit hängen vom Zusammenspiel aus THC, CBD und Terpenen ab – nicht vom Namen. Deshalb
                setzt die medizinische Praxis zunehmend auf <strong>analysierte Wirkstoffprofile statt Kategorien</strong>.
              </p>
              <div className="typ-info-modal__sources">
                <strong>Quellen:</strong>
                <ul className="typ-info-modal__list">
                  <li>
                    Hazekamp, A., Tejkalová, K., & Papadimitriou, S. (2016). <em>
                      Cannabis: From Cultivar to Chemovar II—A Metabolomics Approach to Cannabis Classification.
                    </em> Cannabis and Cannabinoid Research, 1(1), 202–215.{" "}
                    <a href="https://doi.org/10.1089/can.2016.0017" target="_blank" rel="noopener noreferrer">
                      Link
                    </a>
                  </li>
                  <li>
                    Watts, S., et al. (2021). <em>Cannabis labelling is associated with genetic variation in terpene synthase genes.</em>
                    Nature Plants, 7(10), 1330–1334.{" "}
                    <a href="https://doi.org/10.1038/s41477-021-01003-y" target="_blank" rel="noopener noreferrer">
                      Link
                    </a>
                  </li>
                  <li>
                    Herwig, N., et al. (2024). <em>Classification of Cannabis Strains Based on their Chemical Fingerprint.</em>
                    Cannabis and Cannabinoid Research.{" "}
                    <a href="https://doi.org/10.1089/can.2024.0127" target="_blank" rel="noopener noreferrer">
                      Link
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
