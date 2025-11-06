export const DEFAULT_TERPENE_AXES = [
  "β-Myrcen",
  "β-Caryophyllen",
  "Limonen",
  "Linalool",
  "Humulen",
  "Terpinolen",
];

export const normalizeTerpeneKey = (label) =>
  typeof label === "string" ? label.trim().toLowerCase().replace(/[^a-z0-9]/g, "") : "";

export const getTerpeneLabels = (cultivar) => {
  if (!cultivar) return [];
  if (Array.isArray(cultivar.normalizedTerpenprofil) && cultivar.normalizedTerpenprofil.length) {
    return cultivar.normalizedTerpenprofil;
  }
  if (Array.isArray(cultivar.terpenprofil)) {
    return cultivar.terpenprofil;
  }
  return [];
};

export const buildTerpeneAxes = (cultivars = [], limit) => {
  const baseAxes = [...DEFAULT_TERPENE_AXES];
  const seen = new Set(baseAxes.map(normalizeTerpeneKey));

  cultivars.forEach((cultivar) => {
    getTerpeneLabels(cultivar).forEach((label) => {
      const key = normalizeTerpeneKey(label);
      if (label && !seen.has(key)) {
        seen.add(key);
        baseAxes.push(label);
      }
    });
  });

  if (typeof limit === "number" && Number.isFinite(limit)) {
    const capped = Math.max(1, Math.floor(limit));
    return baseAxes.slice(0, capped);
  }

  return baseAxes;
};
