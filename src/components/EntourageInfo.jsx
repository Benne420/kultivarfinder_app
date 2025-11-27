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

const EntourageInfoContent = ({ headingId }) => {
  return (
    <section className="entourage-info" aria-labelledby={headingId}>
      <header className="entourage-info__header">
        <p className="entourage-info__eyebrow">Wissen</p>
        <h3 id={headingId} className="entourage-info__title">
          Entourage-Effekt &amp; ECS
        </h3>
        <p className="entourage-info__lede">
          Kompakte Übersicht zu Mechanismen, möglichen Synergien und aktueller Evidenzlage.
        </p>
      </header>

      <div className="entourage-info__panel">
        <div className="entourage-info__section">
          <h4 className="entourage-info__section-title">Das Endocannabinoid-System (ECS) im Überblick</h4>
          <ul className="entourage-info__list">
            {ecsPoints.map(({ heading, text }) => (
              <li key={heading}>
                <strong>{heading}:</strong> {text}
              </li>
            ))}
          </ul>
        </div>

        <div className="entourage-info__section">
          <h4 className="entourage-info__section-title">Entourage-Effekt</h4>
          <p>
            Der Entourage-Effekt bezeichnet potenziell synergistische Wechselwirkungen zwischen Cannabinoiden, Terpenen und
            Flavonoiden. Das Konzept postuliert, dass Kombinationspräparate ein anderes oder ausgewogeneres pharmakologisches
            Profil entfalten könnten als isolierte Einzelstoffe.
          </p>
        </div>

        <div className="entourage-info__section">
          <h5 className="entourage-info__subsection-title">Wichtige Aspekte zum Entourage-Effekt</h5>
          <ul className="entourage-info__list entourage-info__list--dense">
            {aspects.map(({ title, description }) => (
              <li key={title}>
                <strong>{`${title}:`}</strong> {description}
              </li>
            ))}
          </ul>
        </div>

        <p className="entourage-info__note">
          Der Hypothese nach könnten Kombinationen molekulare Synergien erzeugen; eine klinisch belastbare Bestätigung steht
          bislang aus (Russo, 2011).
        </p>

        <div className="entourage-info__disclaimer" role="note">
          <strong>Rechtlicher Hinweis:</strong> Diese Informationen dienen der allgemeinen wissenschaftlichen Orientierung und
          ersetzen keine medizinische Beratung. Indikation und Präparateauswahl erfolgen ausschließlich durch ärztliches
          Fachpersonal.
        </div>

        <div className="entourage-info__sources">
          <h6 className="entourage-info__sources-title">Quellen</h6>
          <ol className="entourage-info__list entourage-info__list--compact">
            {references.map(({ label, href }) => (
              <li key={href}>
                <a href={href} target="_blank" rel="noopener noreferrer">
                  {label}
                </a>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
};

export default EntourageInfoContent;
