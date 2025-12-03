import React from "react";

const ecsPoints = [
  {
    heading: "Funktion",
    text: "Steuert Schmerzverarbeitung, Schlaf, Muskeltonus und Immunantworten mit.",
  },
  {
    heading: "Rezeptoren",
    text: "CB1 (v. a. zentralnervös) und CB2 (Immun- und periphere Gewebe) binden Endo- und Phytocannabinoide.",
  },
  {
    heading: "Cannabinoide",
    text: "THC: vor allem psychoaktiv und analgetisch. CBD: eher entzündungshemmend/antikonvulsiv und kann THC-Nebenwirkungen dämpfen.",
  },
];

const aspects = [
  {
    title: "Cannabinoid–Terpen–Interaktionen",
    description:
      "Terpene wie Linalool, β-Pinen oder α-Humulen können Cannabinoidwirkungen in Modellen modulieren (LaVigne et al., 2021).",
  },
  {
    title: "Pharmakologische Modulation",
    description:
      "Eigene Wirkmechanismen (z. B. GABA, Adenosin, TRP) könnten Bioverfügbarkeit und Rezeptorbindung der Cannabinoide beeinflussen (André et al., 2024).",
  },
  {
    title: "Klinische Evidenz",
    description:
      "Beobachtungen: CBD-reiche Vollextrakte könnten wirksamer und verträglicher sein als isoliertes CBD (Pamplona et al., 2018).",
  },
  {
    title: "Aktueller Forschungsstand",
    description:
      "Systematische Reviews sehen bislang keine belastbaren kontrollierten Studien für generalisierbare Synergien (Christensen et al., 2023).",
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
          ECS und Entourage-Effekt
        </h3>
        <p className="entourage-info__lede">
          Kompakter Überblick zu Endocannabinoid-System und Entourage-Effekt.
        </p>
      </header>

      <section className="entourage-info__section" aria-label="Endocannabinoid-System">
        <h4 className="entourage-info__section-title">Das Endocannabinoid-System (ECS)</h4>
        <dl className="entourage-info__definition-list">
          {ecsPoints.map(({ heading, text }) => (
            <div key={heading} className="entourage-info__definition-row">
              <dt>{heading}</dt>
              <dd>{text}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="entourage-info__section" aria-label="Entourage-Effekt">
        <h4 className="entourage-info__section-title">Entourage-Effekt</h4>
        <p className="entourage-info__text">
          Synergien zwischen Cannabinoiden, Terpenen und Flavonoiden: Mischungen können ein anderes, teils
          ausgewogeneres pharmakologisches Profil als Einzelstoffe entfalten.
        </p>
        <p className="entourage-info__note">
          Die Synergie-Hypothese ist plausibel, aber klinisch bislang nicht belastbar bestätigt (Russo, 2011).
        </p>
      </section>

      <section className="entourage-info__section" aria-label="Schlüssel-Aspekte zum Entourage-Effekt">
        <div className="entourage-info__section-heading">
          <h5 className="entourage-info__subsection-title">Schlüssel-Aspekte</h5>
          <p className="entourage-info__section-description">Kerneinblicke aus Forschung und Pharmakologie.</p>
        </div>
        <ol className="entourage-info__aspect-list">
          {aspects.map(({ title, description }) => (
            <li key={title} className="entourage-info__aspect">
              <div className="entourage-info__aspect-body">
                <h6 className="entourage-info__aspect-title">{title}</h6>
                <p className="entourage-info__text">{description}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <div className="entourage-info__disclaimer" role="note">
        <strong>Rechtlicher Hinweis:</strong> Diese Informationen dienen der allgemeinen wissenschaftlichen Orientierung und
        ersetzen keine medizinische Beratung. Indikation und Präparateauswahl erfolgen ausschließlich durch ärztliches
        Fachpersonal.
      </div>

      <div className="entourage-info__sources" aria-label="Quellenverzeichnis">
        <div className="entourage-info__section-heading entourage-info__section-heading--compact">
          <h6 className="entourage-info__sources-title">Quellen</h6>
          <p className="entourage-info__section-description">Weitere Literatur zur Vertiefung.</p>
        </div>
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
    </section>
  );
};

export default EntourageInfoContent;
