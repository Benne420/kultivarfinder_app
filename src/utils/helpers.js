// Utility helpers extracted from App.js to reduce redundancy and improve reuse
export const normalize = (s) => {
  const key = (s || "").toString().trim().toLowerCase();
  return key;
};

// Mapping of common aliases for effects (Wirkungen)
export const wirkungAliases = {
  antiinflammatorisch: "entzündungshemmend",
  antiphlogistisch: "entzündungshemmend",
  schmerzstillend: "analgetisch",
  schmerzlindernd: "analgetisch",
  stresslösend: "entspannend",
};

export const normalizeWirkung = (w) => {
  const key = (w || "").toString().trim().toLowerCase();
  const normalized = wirkungAliases[key];
  return normalized || key;
};

// Terpen information (kept here so other components can import)
export const terpenInfo = {
  "β-Myrcen": {
    aliases: ["Myrcen"],
    description:
      "Monoterpen; häufigstes Terpen in Cannabisblüten vieler Kultivare. Typische Noten: erdig, krautig, moschusartig.",
  },
  "β-Caryophyllen": {
    aliases: ["Trans-Caryophyllen", "Caryophyllen"],
    description:
      "Sesquiterpen; pfeffrig-würzig. Bindet als einziger geläufiger Duftstoff direkt am CB2-Rezeptor (präklinische Evidenz).",
  },
  Caryophyllen: {
    aliases: ["β-Caryophyllen", "Trans-Caryophyllen"],
    description:
      "Würzig-pfeffrig; in schwarzem Pfeffer, Nelke. Häufiges Hauptterpen in vielen Kultivaren.",
  },
  "Trans-Caryophyllen": {
    aliases: ["β-Caryophyllen", "Caryophyllen"],
    description:
      "Geometrisches Isomer von Caryophyllen (trans). Charakteristisch pfeffrig-warm.",
  },
  "D-Limonen": {
    aliases: ["Limonen"],
    description:
      "Monoterpen; zitrusartig (Orange/Zitrone). Häufig in Schalen von Zitrusfrüchten.",
  },
  Terpinolen: {
    aliases: [],
    description:
      "Monoterpen; frisch, kiefernartig mit blumigen Noten. In Apfel, Teebaum, Kreuzkümmel beschrieben.",
  },
  "β-Ocimen": {
    aliases: ["Ocimen"],
    description:
      "Monoterpen; süß, krautig, leicht holzig. Variiert stark zwischen Kultivaren.",
  },
  "α-Humulen": {
    aliases: ["Humulen"],
    description:
      "Sesquiterpen; hopfig-herb (in Hopfen). Oft zusammen mit (β-)Caryophyllen zu finden.",
  },
  Farnesen: {
    aliases: [],
    description:
      "Sesquiterpen-Familie; grün-apfelig, in Apfel- und Hopfenaromen. Subtyp-abhängige Profile.",
  },
  Linalool: {
    aliases: [],
    description:
      "Monoterpenalkohol; blumig-lavendelartig. Weit verbreitet in Lavendel, Koriander, Basilikum.",
  },
  Selinen: {
    aliases: [
      "Selinene",
      "α‑Selinen",
      "β‑Selinen",
      "δ‑Selinen",
      "α-Selinene",
      "beta-Selinene",
      "delta-Selinene",
    ],
    description:
      "Sammelbegriff für isomere bicyclische Sesquiterpene (z. B. α‑, β‑, δ‑Selinen). Aroma: holzig, würzig, sellerie-/apiaceae-typisch. Berichtet u. a. in Selleriesamen‑, Muskat‑, Koriander‑ und Hopfenölen; in Cannabis meist in geringen Anteilen.",
  },
  "α‑Selinen": {
    aliases: ["α-Selinene", "alpha-Selinene", "α‑Selinene"],
    description:
      "Bicyclisches Sesquiterpen‑Isomer; holzig‑würzig, leicht hopfig. Vorkommen u. a. in Apiaceae (Sellerie, Petersilie) und Hopfen.",
  },
  "β‑Selinen": {
    aliases: ["β-Selinene", "beta-Selinene", "β‑Selinene"],
    description:
      "Isomeres Sesquiterpen mit sellerie-/krautiger Note; Anteile variieren je nach Herkunft und Verarbeitung.",
  },
  "δ‑Selinen": {
    aliases: ["δ-Selinene", "delta-Selinene", "δ‑Selinene"],
    description:
      "Weitere Selinen‑Variante; holzig‑krautig. In ätherischen Ölen verschiedener Gewürz‑ und Heilpflanzen beschrieben.",
  },
};

export const getTerpenAliases = (name) => {
  const info = terpenInfo[name];
  if (!info) return [name];
  const list = [name, ...(info.aliases || [])];
  return Array.from(new Set(list));
};

export default null;
