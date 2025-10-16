import { useState, useMemo } from "react";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/700.css";
import "./styles.css";

// Components
import FilterSection from "./components/FilterSection";
import ResultsTable from "./components/ResultsTable";
import Modal from "./components/Modal";

// Hooks
import { useKultivareData } from "./hooks/useKultivareData";
import { useFilterOptions } from "./hooks/useFilterOptions";
import { useFilterState } from "./hooks/useFilterState";

// Utils
import { filterKultivare, getFilteredOptions } from "./utils/filterUtils";

// Constants
import { terpenInfo } from "./constants/terpenInfo";

/**
 * Main Cannabis Kultivar Finder application component
 * @returns {JSX.Element} The main application component
 */
export default function CannabisKultivarFinder() {
  // State for terpene information modal
  const [terpeneModal, setTerpeneModal] = useState({ isOpen: false, name: null });

  // Custom hooks for data management
  const { kultivare, isLoading, loadError } = useKultivareData();
  const { terpeneOptions, effectOptions } = useFilterOptions(kultivare);
  const {
    selectedTerpene1,
    selectedTerpene2,
    selectedEffect1,
    selectedEffect2,
    setSelectedTerpene1,
    setSelectedTerpene2,
    setSelectedEffect1,
    setSelectedEffect2,
    selectedTerpenes,
    selectedEffects,
    clearTerpenes,
    clearEffects,
  } = useFilterState();

  // Filter kultivare based on selected criteria
  const filteredKultivare = useMemo(
    () => filterKultivare(kultivare, selectedEffects, selectedTerpenes),
    [kultivare, selectedEffects, selectedTerpenes]
  );

  // Modal handlers
  const openTerpeneModal = (terpeneName) => 
    setTerpeneModal({ isOpen: true, name: terpeneName });
  
  const closeTerpeneModal = () => 
    setTerpeneModal({ isOpen: false, name: null });

  // Get terpene information for modal display
  const terpeneInfo = terpeneModal.name
    ? terpenInfo[terpeneModal.name] ||
      Object.values(terpenInfo).find((info) =>
        info.aliases?.includes(terpeneModal.name)
      ) ||
      null
    : null;

  const resultsCount = filteredKultivare.length;

  return (
    <main
      className="container"
      id="main-content"
      aria-hidden={terpeneModal.isOpen || undefined}
      inert={terpeneModal.isOpen || undefined}
      tabIndex={-1}
    >
      <h1>Cannabis-Kultivarfinder</h1>
      <p className="disclaimer">
        Die angegebenen medizinischen Wirkungen beziehen sich auf mögliche
        Effekte des dominantesten Terpens in der Blüte. Die Angaben sind
        lediglich ein Anhaltspunkt für die passende Produktauswahl durch das
        medizinische Fachpersonal und haben keinen Anspruch auf Vollständigkeit.
      </p>

      <FilterSection
        terpeneOptions={terpeneOptions}
        effectOptions={effectOptions}
        selectedTerpene1={selectedTerpene1}
        selectedTerpene2={selectedTerpene2}
        selectedEffect1={selectedEffect1}
        selectedEffect2={selectedEffect2}
        onTerpene1Change={setSelectedTerpene1}
        onTerpene2Change={setSelectedTerpene2}
        onEffect1Change={setSelectedEffect1}
        onEffect2Change={setSelectedEffect2}
        onClearTerpenes={clearTerpenes}
        onClearEffects={clearEffects}
        getFilteredOptions={getFilteredOptions}
      />

      <ResultsTable
        filteredKultivare={filteredKultivare}
        isLoading={isLoading}
        loadError={loadError}
        resultsCount={resultsCount}
        onTerpeneClick={openTerpeneModal}
      />

      <Modal
        isOpen={terpeneModal.isOpen}
        onClose={closeTerpeneModal}
        title={terpeneModal.name || "Terpen"}
      >
        {terpeneModal.name ? (
          <>
            <p>
              <strong>Synonyme:</strong>{" "}
              {terpeneInfo?.aliases && terpeneInfo.aliases.length > 0
                ? terpeneInfo.aliases.join(", ")
                : "—"}
            </p>
            <p>
              {terpeneInfo?.description ||
                "Für dieses Terpen sind noch keine Detailinformationen hinterlegt."}
            </p>
            <p className="modal-meta">
              Hinweis: Kurzinfos, keine medizinische Beratung. Terpenprofile
              variieren je nach Charge & Verarbeitung.
            </p>
          </>
        ) : null}
      </Modal>
    </main>
  );
}
