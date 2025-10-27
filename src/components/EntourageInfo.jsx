import React from "react";

const EntourageInfo = () => {
  return (
    <div
      style={{
        padding: "16px",
        backgroundColor: "#f8f9fa",
        border: "1px solid #dee2e6",
        borderRadius: "8px",
        margin: "16px 0",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: "12px",
          fontSize: "18px",
          color: "#495057",
        }}
      >
        Entourage-Effekt
      </h3>

      <div style={{ fontSize: "14px", lineHeight: "1.5", color: "#495057" }}>
        <p style={{ margin: "0 0 12px 0" }}>
          Der <strong>Entourage-Effekt</strong> beschreibt die  mögliche synergistische
          Wirkung verschiedener Cannabis-Inhaltsstoffe, die zusammen eine andere
          Wirkung erzielen können als ihre Einzelkomponenten.
        </p>

        <div style={{ marginBottom: "12px" }}>
          <strong>Wichtige Aspekte:</strong>
          <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
            <li>
              <strong>Terpen-Cannabinoid-Synergie:</strong> Terpene können die
              Wirkung von THC und CBD modulieren (Russo, 2011).
            </li>
            <li>
              <strong>Bioverfügbarkeit:</strong> Manche Terpene verbessern die
              Aufnahme von Cannabinoiden, indem sie z. B. die Permeabilität von
              Zellmembranen beeinflussen (Russo, 2011).
            </li>
            <li>
              <strong>Wirkungsverstärkung:</strong> Kombinationen können
              Wirkungen verstärken oder abschwächen, etwa Myrcen als sedierend
              oder Limonen als stimmungsaufhellend (Russo, 2011).
            </li>
            <li>
              <strong>Geschmack und Aroma:</strong> Terpene prägen das
              sensorische Erlebnis und tragen zur Gesamtwirkung bei (Booth et
              al., 2017).
            </li>
          </ul>
        </div>

        <div
          style={{
            padding: "8px 12px",
            backgroundColor: "#fff3cd",
            border: "1px solid #ffeaa7",
            borderRadius: "4px",
            fontSize: "12px",
            color: "#856404",
          }}
        >
          <strong>Hinweis:</strong> Diese Informationen dienen der allgemeinen
          Bildung und ersetzen keine medizinische Beratung. Bei gesundheitlichen
          Fragen konsultieren Sie einen Arzt oder Apotheker.
        </div>

        <div style={{ marginTop: "12px", fontSize: "12px", color: "#6c757d" }}>
          Quellen: Russo, E. B. (2011). <em>Taming THC</em>. British Journal of
          Pharmacology, 163(7), 1344–1364. Booth, J. K. et al. (2017).{" "}
          <em>Terpene synthases from Cannabis sativa</em>. PLoS ONE, 12(3),
          e0173911.
        </div>
      </div>
    </div>
  );
};

export default EntourageInfo;
