// Mapping of common aliases for effects (Wirkungen)
export const wirkungAliases = {
  antiinflammatorisch: "entzündungshemmend",
  "anti-inflammatorisch": "entzündungshemmend",
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

export const toSafeAssetBaseName = (name, fallback = "datenblatt") => {
  const trimmed = (name || "").toString().trim();
  if (!trimmed) {
    return fallback;
  }

  const withoutInvalidFsChars = trimmed
    .replace(/[<>:"/\\|?*]/g, "")
    .replace(/[\u0000-\u001f]/g, "")
    .replace(/['`]/g, "");

  const underscored = withoutInvalidFsChars
    .replace(/\s+/g, "_")
    .replace(/_+/g, "_")
    .trim();

  return underscored || fallback;
};

export const toSafePdfPath = (name) => {
  const safeName = toSafeAssetBaseName(name, "datenblatt");
  return `/datenblaetter/${encodeURIComponent(safeName)}.pdf`;
};

export const toSafeThumbnailPath = (name) => {
  const safeName = toSafeAssetBaseName(name, "thumbnail");
  return `/thumbnails/${encodeURIComponent(safeName)}.avif`;
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

  const baseName = raw.split("(")[0].trim();
  const normalized = baseName
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

const CM_TO_PX = 37.7952755906;

export const COMPARISON_HEADER_WIDTH_PX = 180;
export const COMPARISON_COLUMN_GAP_PX = 8;
export const COMPARISON_MAX_WIDTH_PX = 1200;
const COMPARISON_RADAR_WIDTH_CM = 11;
const COMPARISON_RADAR_HEIGHT_CM = 8.5;

export const getComparisonLayoutMetrics = (count = 1, maxWidthPx) => {
  const cultivarCount = Math.max(Number.parseInt(count, 10) || 0, 1);
  const preferredColumnWidthPx = COMPARISON_RADAR_WIDTH_CM * CM_TO_PX;
  const aspectRatio = COMPARISON_RADAR_HEIGHT_CM / COMPARISON_RADAR_WIDTH_CM;
  const totalGapWidth = cultivarCount * COMPARISON_COLUMN_GAP_PX;
  const preferredPanelWidthPx =
    COMPARISON_HEADER_WIDTH_PX + totalGapWidth + cultivarCount * preferredColumnWidthPx;
  const rawPanelWidthPx = Math.max(COMPARISON_MAX_WIDTH_PX, preferredPanelWidthPx);
  const constrainedWidth =
    typeof maxWidthPx === "number" && Number.isFinite(maxWidthPx) && maxWidthPx > 0
      ? maxWidthPx
      : null;
  const panelWidthPx = constrainedWidth
    ? Math.min(rawPanelWidthPx, constrainedWidth)
    : rawPanelWidthPx;
  const availableWidth = Math.max(
    panelWidthPx - COMPARISON_HEADER_WIDTH_PX - totalGapWidth,
    0
  );

  const rawColumnWidth =
    cultivarCount > 0 && availableWidth > 0
      ? availableWidth / cultivarCount
      : preferredColumnWidthPx;

  const columnWidthPx = Math.min(preferredColumnWidthPx, rawColumnWidth);

  return {
    panelWidthPx,
    columnWidthPx,
    radarHeightPx: columnWidthPx * aspectRatio,
  };
};
