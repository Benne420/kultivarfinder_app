import React from "react";

const ecsPoints = [
  {
    heading: "Funktion",
    text: "Reguliert u. a. Schmerzverarbeitung, Schlaf, Muskeltonus und Immunantworten.",
  },
  {
    heading: "Rezeptoren",
    text: "CB1 (zentralnervös) und CB2 (Immun- und periphere Gewebe) sind zentrale Bindungspartner für Endo- und Phytocannabinoide.",
  },
  {
    heading: "Cannabinoide",
    text: "THC wirkt vor allem psychoaktiv und analgetisch; CBD zeigt vorwiegend entzündungshemmende und antikonvulsive Eigenschaften und kann unerwünschte THC-Effekte abschwächen.",
  },
];

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

const references = [
  {
    label: "Pamplona, F. A. et al. (2018). Front Neurol, 9, 759.",
    href: "https://www.frontiersin.org/articles/10.3389/fneur.2018.00759/full",
  },
  {
    label: "LaVigne, J. E. et al. (2021). Sci Rep, 11, 9481.",
    href: "https://www.nature.com/articles/s41598-021-87740-8",
  },
  {
    label: "Christensen, C. et al. (2023). Biomedicines, 11(8), 2110.",
    href: "https://pubmed.ncbi.nlm.nih.gov/37626819/",
  },
  {
    label: "André, R. et al. (2024). Pharmaceuticals, 17(11), 1543.",
    href: "https://www.mdpi.com/1424-8247/17/11/1543",
  },
  {
    label: "Russo, E. B. (2011). Br J Pharmacol, 163(7), 1344–1364.",
    href: "https://bpspubs.onlinelibrary.wiley.com/doi/10.1111/j.1476-5381.2011.01238.x",
  },
];

const styles = {
  container: {
    padding: "16px",
    backgroundColor: "#f8f9fa",
    border: "1px solid #dee2e6",
    borderRadius: "8px",
    margin: "16px 0",
  },
  heading: {
    marginTop: 0,
    marginBottom: "12px",
    fontSize: "18px",
    color: "#495057",
  },
  text: {
    fontSize: "14px",
    lineHeight: 1.5,
    color: "#495057",
  },
  section: {
    marginBottom: "12px",
  },
  list: {
    margin: "8px 0 0 0",
    paddingLeft: "20px",
  },
  disclaimer: {
    padding: "8px 12px",
    backgroundColor: "#fff3cd",
    border: "1px solid #ffeaa7",
    borderRadius: "4px",
    fontSize: "12px",
    color: "#856404",
  },
  sources: {
    marginTop: "12px",
    fontSize: "12px",
    color: "#6c757d",
  },
};

const EntourageInfoContent = ({ headingId }) => {
  return (
    <section style={styles.container} aria-labelledby={headingId}>
      <h3 id={headingId} style={styles.heading}>
        Entourage-Effekt
      </h3>

      <div style={styles.text}>
        <p style={{ margin: "0 0 12px 0" }}>
          Der <strong>Entourage-Effekt</strong> bezeichnet potenziell synergistische Wechselwirkungen zwischen Cannabinoiden,
          Terpenen und Flavonoiden. Das Konzept postuliert, dass Kombinationspräparate ein anderes oder ausgewogeneres
          pharmakologisches Profil entfalten könnten als isolierte Einzelstoffe.
        </p>

        <div style={styles.section}>
          <strong>Das Endocannabinoid-System (ECS) im Überblick</strong>
          <ul style={styles.list}>
            {ecsPoints.map(({ heading, text }) => (
              <li key={heading}>
                <strong>{heading}:</strong> {text}
              </li>
            ))}
          </ul>
        </div>

        <div style={styles.section}>
          <strong>Wichtige Aspekte zum Entourage-Effekt</strong>
          <ul style={styles.list}>
            {aspects.map(({ title, description }) => (
              <li key={title}>
                <strong>{`${title}:`}</strong> {description}
              </li>
            ))}
          </ul>
        </div>

        <p style={{ margin: "0 0 12px 0" }}>
          Der Hypothese nach könnten Kombinationen molekulare Synergien erzeugen; eine klinisch belastbare Bestätigung steht
          bislang aus (Russo, 2011).
        </p>

        <div style={styles.disclaimer}>
          <strong>Rechtlicher Hinweis:</strong> Diese Informationen dienen der allgemeinen wissenschaftlichen Orientierung und
          ersetzen keine medizinische Beratung. Indikation und Präparateauswahl erfolgen ausschließlich durch ärztliches
          Fachpersonal.
        </div>

        <div style={styles.sources}>
          Quellen:
          <ul style={styles.list}>
            {references.map(({ label, href }) => (
              <li key={href}>
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default EntourageInfoContent;
