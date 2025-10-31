import React from "react";

const aspects = [
  {
    title: "Cannabinoid–Terpen–Interaktionen",
    description:
      "Terpene wie Linalool, β-Pinen oder α-Humulen zeigen in präklinischen Modellen cannabimimetische Eigenschaften und können Cannabinoidwirkungen modulieren (LaVigne et al., 2021).",
  },
  {
    title: "Pharmakologische Modulation",
    description:
      "Terpene besitzen eigene Wirkmechanismen – etwa über GABA-, Adenosin- oder TRP-Kanäle – und könnten Bioverfügbarkeit sowie Rezeptorbindung von Cannabinoiden beeinflussen (André et al., 2024).",
  },
  {
    title: "Klinische Evidenz",
    description:
      "Beobachtungen legen nahe, dass CBD-reiche Vollextrakte eine stärkere Wirksamkeit und ein günstigeres Nebenwirkungsprofil zeigen könnten als isoliertes CBD (Pamplona et al., 2018).",
  },
  {
    title: "Aktueller Forschungsstand",
    description:
      "Systematische Übersichtsarbeiten betonen, dass bislang keine kontrollierten klinischen Studien eine generalisierbare Synergie belegen (Christensen et al., 2023).",
  },
];

const containerStyle = {
  padding: "16px",
  backgroundColor: "#f8f9fa",
  border: "1px solid #dee2e6",
  borderRadius: "8px",
  margin: "16px 0",
};

const headingStyle = {
  marginTop: 0,
  marginBottom: "12px",
  fontSize: "18px",
  color: "#495057",
};

const bodyTextStyle = {
  fontSize: "14px",
  lineHeight: "1.5",
  color: "#495057",
};

const EntourageInfoContent = () => {
  return (
    <div style={containerStyle}>
      <h3 style={headingStyle}>Entourage-Effekt</h3>

      <div style={bodyTextStyle}>
        <p style={{ margin: "0 0 12px 0" }}>
          Der sogenannte <strong>Entourage-Effekt</strong> beschreibt die
          potenziell synergistische Wechselwirkung verschiedener Inhaltsstoffe
          der Cannabispflanze – insbesondere Cannabinoide, Terpene und
          Flavonoide –, die gemeinsam eine andere oder ausgewogenere
          pharmakologische Wirkung entfalten könnten als isolierte
          Einzelkomponenten.
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

        <p style={{ margin: "0 0 12px 0" }}>
          Die Hypothese des Entourage-Effekts wurde 2011 von Ethan B. Russo
          umfassend beschrieben und postuliert eine molekulare Synergie zwischen
          Terpenen und Cannabinoiden. Sie ist wissenschaftlich einflussreich,
          wurde bisher jedoch nicht klinisch validiert (Russo, 2011).
        </p>

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
          <strong>Rechtlicher Hinweis:</strong> Diese Informationen dienen der
          allgemeinen wissenschaftlichen Orientierung und ersetzen keine
          medizinische Beratung.
        </div>

        <div style={{ marginTop: "12px", fontSize: "12px", color: "#6c757d" }}>
          Quellen:
          <ul style={{ margin: "8px 0 0 0", paddingLeft: "20px" }}>
            <li>
              <a
                href="https://www.frontiersin.org/articles/10.3389/fneur.2018.00759/full"
                target="_blank"
                rel="noopener noreferrer"
              >
                Pamplona, F. A. et al. (2018). Front Neurol, 9, 759.
              </a>
            </li>
            <li>
              <a
                href="https://www.nature.com/articles/s41598-021-87740-8"
                target="_blank"
                rel="noopener noreferrer"
              >
                LaVigne, J. E. et al. (2021). Sci Rep, 11, 9481.
              </a>
            </li>
            <li>
              <a
                href="https://pubmed.ncbi.nlm.nih.gov/37626819/"
                target="_blank"
                rel="noopener noreferrer"
              >
                Christensen, C. et al. (2023). Biomedicines, 11(8), 2110.
              </a>
            </li>
            <li>
              <a
                href="https://www.mdpi.com/1424-8247/17/11/1543"
                target="_blank"
                rel="noopener noreferrer"
              >
                André, R. et al. (2024). Pharmaceuticals, 17(11), 1543.
              </a>
            </li>
            <li>
              <a
                href="https://bpspubs.onlinelibrary.wiley.com/doi/10.1111/j.1476-5381.2011.01238.x"
                target="_blank"
                rel="noopener noreferrer"
              >
                Russo, E. B. (2011). Br J Pharmacol, 163(7), 1344–1364.
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default EntourageInfoContent;
export { EntourageInfoContent };
