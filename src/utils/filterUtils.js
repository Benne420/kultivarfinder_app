/**
 * Filters kultivare based on selected terpenes and effects
 * @param {Array<Object>} kultivare - Array of kultivar objects
 * @param {Set<string>} selectedEffects - Set of selected effect names
 * @param {Set<string>} selectedTerpenes - Set of selected terpene names
 * @returns {Array<Object>} Filtered array of kultivare that match all criteria
 */
export const filterKultivare = (kultivare, selectedEffects, selectedTerpenes) => {
  return kultivare.filter(
    (kultivar) =>
      [...selectedTerpenes].every((terpene) =>
        kultivar.terpenprofil.includes(terpene)
      ) &&
      [...selectedEffects].every((effect) =>
        kultivar.wirkungen.includes(effect)
      )
  );
};

/**
 * Generates PDF filename from kultivar name with special exceptions
 * @param {string} kultivarName - Kultivar name
 * @returns {string} PDF filename with .pdf extension
 */
export const getPdfFileForName = (kultivarName) => {
  const nameExceptions = {
    "MAC 1": "MAC1.pdf",
    "Tropicanna Cookies": "Tropicana_Cookies.pdf",
  };
  
  if (nameExceptions[kultivarName]) return nameExceptions[kultivarName];
  return `${kultivarName.replace(/\s+/g, "_")}.pdf`;
};

/**
 * Filters options to exclude already selected items
 * @param {Array<string>} availableOptions - Array of available options
 * @param {string} excludeItem - Item to exclude from options
 * @returns {Array<string>} Filtered options array without the excluded item
 */
export const getFilteredOptions = (availableOptions, excludeItem) =>
  availableOptions.filter((option) => !excludeItem || option !== excludeItem);