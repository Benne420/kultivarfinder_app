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

const normalizeTerpeneKey = (value) =>
  (value || "").toString().trim().toLowerCase();

const terpeneSortReplacements = new Map([
  ["ɑ", "a"],
  ["α", "a"],
  ["β", "b"],
  ["γ", "g"],
  ["δ", "d"],
]);

const terpeneSortKey = (value) => {
  const input = (value || "").toString();
  if (!input) return "";
  const replaced = Array.from(input)
    .map((char) => {
      const lower = char.toLowerCase();
      return (
        terpeneSortReplacements.get(char) ||
        terpeneSortReplacements.get(lower) ||
        lower
      );
    })
    .join("");
  return replaced
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
};

export const sortTerpeneNames = (names = []) =>
  [...names].sort((a, b) => terpeneSortKey(a).localeCompare(terpeneSortKey(b), "de"));

export const createTerpeneAliasLookup = (terpenes = []) => {
  const canonicalByKey = new Map();
  const variantsByCanonical = new Map();

  terpenes.forEach((entry) => {
    if (!entry) return;
    const canonical = (entry.name || "").toString().trim();
    if (!canonical) return;
    const canonicalKey = normalizeTerpeneKey(canonical);
    const existingSet = variantsByCanonical.get(canonical) || new Set();
    existingSet.add(canonical);
    variantsByCanonical.set(canonical, existingSet);
    canonicalByKey.set(canonicalKey, canonical);

    const aliases = Array.isArray(entry.aliases) ? entry.aliases : [];
    aliases.forEach((alias) => {
      const normalizedAlias = (alias || "").toString().trim();
      if (!normalizedAlias) return;
      existingSet.add(normalizedAlias);
      canonicalByKey.set(normalizeTerpeneKey(normalizedAlias), canonical);
    });
  });

  return { canonicalByKey, variantsByCanonical };
};

export const mapTerpeneToCanonical = (name, lookup) => {
  const value = (name || "").toString().trim();
  if (!value) return "";
  if (lookup && lookup.canonicalByKey instanceof Map) {
    return lookup.canonicalByKey.get(normalizeTerpeneKey(value)) || value;
  }
  return value;
};

export const radarPathSvg = (name) => {
  const raw = (name || "").toString().trim();
  if (!raw) {
    return "";
  }

  const normalized = raw
    .normalize("NFKD")
    .replace(/ß/gi, (match) => (match === "ß" ? "ss" : "SS"))
    .replace(/\p{Diacritic}/gu, "");

  const fileName = normalized
    .replace(/[^a-z0-9]+/gi, "_")
    .replace(/^_+|_+$/g, "");

  return `/netzdiagramme/${fileName}.svg`;
};

export const formatMetricValue = (value) =>
  value == null || value === "" ? "–" : value;

export const getCultivarEffects = (cultivar) => {
  if (!cultivar) return [];

  const primary = Array.isArray(cultivar.normalizedWirkungen)
    ? cultivar.normalizedWirkungen
    : null;

  const fallback = Array.isArray(cultivar.wirkungen)
    ? cultivar.wirkungen
    : null;

  const values = primary && primary.length ? primary : fallback || [];

  return values
    .map((entry) => (entry || "").toString().trim())
    .filter(Boolean);
};
