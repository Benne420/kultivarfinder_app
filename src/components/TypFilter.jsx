import React from "react";

export default function TypFilter({ typ, dispatch, typInfo }) {
  const [showInfo, setShowInfo] = React.useState(false);
  const infoContentId = "typ-info-content";

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
      <p style={{ fontSize: 12, color: "#546e7a", marginTop: 4 }}>{typ ? typInfo[typ] : ""}</p>
      <div style={{ marginTop: 12 }}>
        <button
          type="button"
          className="info-box__toggle"
          aria-expanded={showInfo}
          aria-controls={infoContentId}
          onClick={() => setShowInfo((prev) => !prev)}
          style={{
            background: "none",
            border: "none",
            padding: 0,
            cursor: "pointer",
            color: "#2c3840",
            fontSize: 12,
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            fontWeight: 600,
          }}
        >
          <span>{showInfo ? "Info ausblenden" : "Mehr zu Indica / Sativa"}</span>
          <span
            aria-hidden="true"
            style={{
              transform: showInfo ? "rotate(180deg)" : "rotate(0)",
              transition: "transform 0.2s ease",
              fontSize: 10,
            }}
          >
            ▾
          </span>
        </button>
        {showInfo ? (
          <div
            id={infoContentId}
            className="info-box"
            style={{ fontSize: 11, color: "#39454d", marginTop: 8 }}
          >
            <h4 style={{ margin: "0 0 8px", fontSize: 12, color: "#2c3840" }}>
              Indica / Sativa – Was diese Begriffe (nicht) bedeuten:
            </h4>
            Die Begriffe <em>Indica</em> und <em>Sativa</em> stammen aus der
            Botanik, sagen aber heute
            <strong>
              {" "}
              nichts Verlässliches über Wirkung oder Inhaltsstoffe
            </strong>{" "}
            aus. Studien zeigen, dass diese Etiketten weder genetische
            Verwandtschaft noch chemische Profile zuverlässig erklären
            (Hazekamp et al., 2016; Watts et al., 2021). Auch eine Analyse
            medizinischer Sorten aus Deutschland ergab
            <strong>
              {" "}
              keine konsistenten Terpen- oder Wirkstoffmuster entlang der
              Label
            </strong>{" "}
            (Herwig et al., 2024). Wirkung und Verträglichkeit hängen vom
            Zusammenspiel aus THC, CBD und Terpenen ab – nicht vom Namen.
            Deshalb setzt die medizinische Praxis zunehmend auf{" "}
            <strong>analysierte Wirkstoffprofile statt Kategorien</strong>.
            <br />
            <br />
            <strong>Quellen:</strong>
            <br />
            Hazekamp, A., Tejkalová, K., & Papadimitriou, S. (2016).{" "}
            <em>
              Cannabis: From Cultivar to Chemovar II—A Metabolomics Approach
              to Cannabis Classification.
            </em>
            Cannabis and Cannabinoid Research, 1(1), 202–215.{" "}
            <a
              href="https://doi.org/10.1089/can.2016.0017"
              target="_blank"
              rel="noopener noreferrer"
            >
              Link
            </a>
            <br />
            Watts, S., et al. (2021).{" "}
            <em>
              Cannabis labelling is associated with genetic variation in
              terpene synthase genes.
            </em>
            Nature Plants, 7(10), 1330–1334.{" "}
            <a
              href="https://doi.org/10.1038/s41477-021-01003-y"
              target="_blank"
              rel="noopener noreferrer"
            >
              Link
            </a>
            <br />
            Herwig, N., et al. (2024).{" "}
            <em>
              Classification of Cannabis Strains Based on their Chemical
              Fingerprint.
            </em>
            Cannabis and Cannabinoid Research.{" "}
            <a
              href="https://doi.org/10.1089/can.2024.0127"
              target="_blank"
              rel="noopener noreferrer"
            >
              Link
            </a>
          </div>
        ) : null}
      </div>
    </div>
  );
}
