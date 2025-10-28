import React from "react";

const aspects = [
  {
    title: "Cannabinoid–Terpen–Synergie",
    description:
      "Terpene können die Wirkung von THC und CBD modulieren, z. B. durch Einfluss auf Rezeptoren oder Signalwege (Russo, 2011).",
  },
  {
    title: "Pharmakokinetik",
    description:
      "Einige Terpene könnten die Aufnahme von Cannabinoiden verändern, etwa durch Beeinflussung der Zellmembranpermeabilität (Russo, 2011).",
  },
  {
    title: "Wirkungsmodulation",
    description:
      "Kombinationen können Effekte verstärken oder abschwächen – z. B. Myrcen mit potenziell sedierender, Limonen mit stimmungsaufhellender Wirkung (Russo, 2011).",
  },
  {
    title: "Sensorik",
    description:
      "Terpene bestimmen Aroma und Geschmack und können das subjektive Erleben beeinflussen (Booth et al., 2020).",
  },
];

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
            {aspects.map(({ title, description }) => (
              <li key={title}>
                <strong>{`${title}:`}</strong> {description}
              </li>
            ))}
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
          Quellen:
          <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
            <li>
              <a
                href="https://bpspubs.onlinelibrary.wiley.com/doi/10.1111/j.1476-5381.2011.01238.x"
                target="_blank"
                rel="noopener noreferrer"
              >
                Russo, E. B. (2011). <em>Taming THC</em>. Br J Pharmacol,
                163(7), 1344–1364.
              </a>
            </li>
            <li>
              <a
                href="https://academic.oup.com/plphys/article/184/1/130/6117797?login=false"
                target="_blank"
                rel="noopener noreferrer"
              >
                Booth, J. K. et al. (2020). <em>Terpene synthases from Cannabis
                sativa</em>. Plant Physiology, 184(1), 130–147.
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EntourageInfo;
