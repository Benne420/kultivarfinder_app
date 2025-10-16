import { useState, useEffect } from 'react';

/**
 * Custom hook for managing kultivare data loading and state
 * @returns {Object} Object containing kultivare data, loading state, and error state
 * @returns {Array<Object>} returns.kultivare - Array of kultivar objects
 * @returns {boolean} returns.isLoading - Whether data is currently loading
 * @returns {string} returns.loadError - Error message if loading failed
 */
export const useKultivareData = () => {
  const [kultivare, setKultivare] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    fetch("/kultivare.json")
      .then((response) => response.json())
      .then((data) => setKultivare(data))
      .catch((error) => {
        console.error("Fehler beim Laden der Daten:", error);
        setLoadError("Daten konnten nicht geladen werden.");
      })
      .finally(() => setIsLoading(false));
  }, []);

  return { kultivare, isLoading, loadError };
};