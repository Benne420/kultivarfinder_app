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
          Der <strong>Entourage-Effekt</strong> beschreibt die mögliche
          synergistische Wechselwirkung verschiedener Inhaltsstoffe der
          Cannabispflanze – insbesondere Cannabinoide, Terpene und Flavonoide –,
          die gemeinsam eine andere oder ausgewogenere Wirkung entfalten können
          als ihre isolierten Einzelkomponenten.
        </p>

        <div style={{ marginBottom: "12px" }}>
          <strong>Wichtige Aspekte:</strong>
          <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
            <li>
              <strong>Cannabinoid–Terpen–Synergie:</strong> Terpene können die
              Wirkung von THC und CBD modulieren, z. B. durch Einfluss auf
              Rezeptoren oder Signalwege (Russo, 2011).
            </li>
            <li>
              <strong>Pharmakokinetik:</strong> Einige Terpene könnten die
              Aufnahme von Cannabinoiden verändern, etwa durch Beeinflussung der
              Zellmembranpermeabilität (Russo, 2011).
            </li>
            <li>
              <strong>Wirkungsmodulation:</strong> Kombinationen können Effekte
              verstärken oder abschwächen – z. B. Myrcen mit potenziell
              sedierender, Limonen mit stimmungsaufhellender Wirkung (Russo,
              2011).
            </li>
            <li>
              <strong>Sensorik:</strong> Terpene bestimmen Aroma und Geschmack
              und können das subjektive Erleben beeinflussen (Booth et al.,
              2017).
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
          <strong>Hinweis:</strong> Die beschriebenen Zusammenhänge sind
          Gegenstand aktueller Forschung. Diese Informationen ersetzen keine
          medizinische Beratung.
        </div>

        <div style={{ marginTop: "12px", fontSize: "12px", color: "#6c757d" }}>
          Quellen: Russo, E. B. (2011). <em>Taming THC</em>. Br J Pharmacol,
          163(7), 1344–1364. Booth, J. K. et al. (2017). <em>Terpene synthases
          from Cannabis sativa</em>. PLoS ONE, 12(3), e0173911.
        </div>
      </div>
    </div>
  );
};

export default EntourageInfo;
