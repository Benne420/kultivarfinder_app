import { useState, useEffect } from 'react';

/**
 * Custom hook for managing filter state with dropdown selections
 * @returns {Object} Object containing filter state and handlers
 * @returns {string} returns.selectedTerpene1 - First selected terpene
 * @returns {string} returns.selectedTerpene2 - Second selected terpene
 * @returns {string} returns.selectedEffect1 - First selected effect
 * @returns {string} returns.selectedEffect2 - Second selected effect
 * @returns {Function} returns.setSelectedTerpene1 - Setter for first terpene
 * @returns {Function} returns.setSelectedTerpene2 - Setter for second terpene
 * @returns {Function} returns.setSelectedEffect1 - Setter for first effect
 * @returns {Function} returns.setSelectedEffect2 - Setter for second effect
 * @returns {Set<string>} returns.selectedTerpenes - Set of selected terpenes for filtering
 * @returns {Set<string>} returns.selectedEffects - Set of selected effects for filtering
 * @returns {Function} returns.clearTerpenes - Function to clear terpene selections
 * @returns {Function} returns.clearEffects - Function to clear effect selections
 */
export const useFilterState = () => {
  // Dropdown state for UI
  const [selectedTerpene1, setSelectedTerpene1] = useState("");
  const [selectedTerpene2, setSelectedTerpene2] = useState("");
  const [selectedEffect1, setSelectedEffect1] = useState("");
  const [selectedEffect2, setSelectedEffect2] = useState("");

  // Set state for filtering logic
  const [selectedTerpenes, setSelectedTerpenes] = useState(new Set());
  const [selectedEffects, setSelectedEffects] = useState(new Set());

  // Update terpene set when dropdown selections change
  useEffect(() => {
    setSelectedTerpenes(new Set([selectedTerpene1, selectedTerpene2].filter(Boolean)));
  }, [selectedTerpene1, selectedTerpene2]);

  // Update effect set when dropdown selections change
  useEffect(() => {
    setSelectedEffects(new Set([selectedEffect1, selectedEffect2].filter(Boolean)));
  }, [selectedEffect1, selectedEffect2]);

  const clearTerpenes = () => {
    setSelectedTerpene1("");
    setSelectedTerpene2("");
  };

  const clearEffects = () => {
    setSelectedEffect1("");
    setSelectedEffect2("");
  };

  return {
    // Dropdown state
    selectedTerpene1,
    selectedTerpene2,
    selectedEffect1,
    selectedEffect2,
    setSelectedTerpene1,
    setSelectedTerpene2,
    setSelectedEffect1,
    setSelectedEffect2,
    // Set state for filtering
    selectedTerpenes,
    selectedEffects,
    // Clear functions
    clearTerpenes,
    clearEffects,
  };
};