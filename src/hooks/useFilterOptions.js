import { useMemo } from 'react';

/**
 * Custom hook for generating filter options from kultivare data
 * @param {Array<Object>} kultivare - Array of kultivar objects
 * @returns {Object} Object containing terpene and effect options
 * @returns {Array<string>} returns.terpeneOptions - Sorted array of unique terpene names
 * @returns {Array<string>} returns.effectOptions - Sorted array of unique effect names
 */
export const useFilterOptions = (kultivare) => {
  const terpeneOptions = useMemo(() => {
    const uniqueTerpenes = new Set();
    for (const kultivar of kultivare) {
      if (Array.isArray(kultivar.terpenprofil)) {
        for (const terpene of kultivar.terpenprofil) {
          uniqueTerpenes.add(terpene);
        }
      }
    }
    return Array.from(uniqueTerpenes).sort((a, b) => a.localeCompare(b));
  }, [kultivare]);

  const effectOptions = useMemo(() => {
    const uniqueEffects = new Set();
    for (const kultivar of kultivare) {
      if (Array.isArray(kultivar.wirkungen)) {
        for (const effect of kultivar.wirkungen) {
          uniqueEffects.add(effect);
        }
      }
    }
    return Array.from(uniqueEffects).sort((a, b) => a.localeCompare(b));
  }, [kultivare]);

  return { terpeneOptions, effectOptions };
};