/*
 * Refaktorierte Version der Hauptkomponente, bei der der Zustand über
 * useReducer verwaltet wird. Hier werden alle Filter‑ und UI‑bezogenen
 * Zustände in einem zentralen Objekt zusammengeführt. Dadurch werden
 * Set‑Operationen konsistenter und die Logik der Zustandsübergänge
 * bleibt übersichtlicher. Die ursprüngliche Funktionalität bleibt
 * unverändert.
 */

import { useEffect, useMemo, useCallback, useReducer, useState } from "react";
import "@fontsource/montserrat";
import "./styles.css";
import CultivarTerpenPanel from "./components/CultivarTerpenPanel";
import EntourageInfo from "./components/EntourageInfo";
import FilterPanel from "./components/FilterPanel";
import StrainTable from "./components/StrainTable";
import DetailsModal from "./components/DetailsModal";
import StrainSimilarity from "./components/StrainSimilarity";
import TypFilter from "./components/TypFilter";
import { normalizeWirkung, getTerpenAliases } from "./utils/helpers";

/*
 * Daten und Hilfsfunktionen werden außerhalb der Komponente definiert, um
 * Mehrfachinitialisierungen zu vermeiden. Diese Definitionen sind
 * identisch zur optimierten Version ohne useReducer.
 */
const typInfo = {
  "Indica-dominant":
    "Hybride mit überwiegend Indica-Merkmalen, die ursprünglich für kompakt wachsende Pflanzen aus dem Hindukusch typisch waren. Umgangssprachlich oft mit beruhigender Wirkung verbunden – wissenschaftlich jedoch nicht verlässlich belegt. Die tatsächliche Wirkung hängt vom Cannabinoid- und Terpenprofil ab.",
  "Sativa-dominant":
    "Hybride mit stärkerem Sativa-Einfluss, wie er bei hochwüchsigen, schlanken Pflanzen aus tropischen Regionen vorkam. Im Narrativ oft als aktivierend beschrieben – die tatsächliche Wirkung lässt sich wissenschaftlich nicht am Namen festmachen, sondern ergibt sich aus Wirkstoff- und Terpenprofil.",
};
const terpene = [
  "Caryophyllen",
  "D-Limonen",
  "Farnesen",
  "Linalool",
  "Selinen",
  "Terpinolen",
  "α-Humulen",
  "β-Myrcen",
  "β-Ocimen",
];

/*
 * Liste der verfügbaren Wirkungen. Synonyme werden über das Mapping
 * `wirkungAliases` auf diese kanonischen Bezeichnungen abgebildet. Diese
 * Liste dient als Quelle für Dropdowns.
 */
const defaultWirkungen = [
  "analgetisch",
  "angstlösend",
  "antimikrobiell",
  "antimykotisch",
  "antioxidativ",
  "entspannend",
  "entzündungshemmend",
  "krampflösend",
  "neuroprotektiv",
  "unterstützt Wundheilung",
].sort();

// kultivarHasSelectedTerpene uses getTerpenAliases from helpers
const kultivarHasSelectedTerpene = (kultivar, selectedTerpene) => {
  const profile = Array.isArray(kultivar.terpenprofil)
    ? kultivar.terpenprofil
    : [];
  return [...selectedTerpene].every((sel) => {
    const names = getTerpenAliases(sel);
    return profile.some((p) => names.includes(p));
  });
};

const isStatusIncluded = (k, includeDisc) => {
  const s = ((k && k.status) || "").toString().trim().toLowerCase();
  if (s === "active") return true;
  if (includeDisc && s === "discontinued") return true;
  return false;
};

const mapTyp = (s) => {
  const t = (s || "").toString().trim().toLowerCase();
  if (t.includes("indica-domin")) return "indica-dominant";
  if (t.includes("sativa-domin")) return "sativa-dominant";
  if (t.includes("indica")) return "indica";
  if (t.includes("sativa")) return "sativa";
  return t;
};

// Filterfunktion, die den aktuellen Filterzustand nutzt
const filterKultivare = (
  kultivare,
  selectedWirkungen,
  selectedTerpene,
  selectedTyp,
  includeDisc
) => {
  const targetTyp = mapTyp(selectedTyp);
  const selectedNormalized = selectedWirkungen.size
    ? [...selectedWirkungen].map(normalizeWirkung)
    : null;
  return kultivare
    .filter((k) => isStatusIncluded(k, includeDisc))
    .filter((k) => {
      // Terpene filtern
      if (
        selectedTerpene.size &&
        !kultivarHasSelectedTerpene(k, selectedTerpene)
      ) {
        return false;
      }
      // Wirkungen filtern (normalisiert)
      if (selectedNormalized) {
        if (!Array.isArray(k.wirkungen)) return false;
        // Use preprocessed normalizedWirkungen if available to avoid re-normalizing on each filter.
        const kultivarNormalized = Array.isArray(k.normalizedWirkungen)
          ? k.normalizedWirkungen
          : Array.isArray(k.wirkungen)
          ? k.wirkungen.map((w) => normalizeWirkung(w))
          : [];
        if (!selectedNormalized.every((w) => kultivarNormalized.includes(w)))
          return false;
      }
      // Typ filtern
      if (targetTyp) {
        const kt = mapTyp(k.typ);
        if (kt !== targetTyp) return false;
      }
      return true;
    });
};

/*
 * Anfangszustand des Reducers. Wir fassen alle Filter- und UI‑Zustände
 * zusammen. Sets werden hier als echte Set‑Instanzen initialisiert.
 */
const initialFilterState = {
  typ: "",
  includeDiscontinued: false,
  selectedTerpene: new Set(),
  selectedWirkungen: new Set(),
};

const toSet = (value) => {
  if (value instanceof Set) {
    return new Set(value);
  }
  if (Array.isArray(value)) {
    return new Set(value.filter(Boolean));
  }
  if (value == null || value === "") {
    return new Set();
  }
  return new Set([value]);
};

const areSetsEqual = (a, b) => {
  if (a === b) return true;
  if (!a || !b) return false;
  if (a.size !== b.size) return false;
  for (const value of a.values()) {
    if (!b.has(value)) {
      return false;
    }
  }
  return true;
};

/*
 * Reducer zum Aktualisieren des Filterzustands. Für jede Aktion
 * berechnen wir den neuen State und leiten ggf. Sets ab. Durch das
 * Bündeln der Logik hier bleibt der Code in der Komponente schlanker.
 */
function filterReducer(state, action) {
  switch (action.type) {
    case "TOGGLE_TERPENE": {
      const next = new Set(state.selectedTerpene);
      if (next.has(action.value)) {
        next.delete(action.value);
      } else {
        next.add(action.value);
      }
      return { ...state, selectedTerpene: next };
    }
    case "SET_TERPENE_VALUES": {
      const next = toSet(action.value);
      if (areSetsEqual(next, state.selectedTerpene)) {
        return state;
      }
      return { ...state, selectedTerpene: next };
    }
    case "TOGGLE_WIRKUNG": {
      const next = new Set(state.selectedWirkungen);
      if (next.has(action.value)) {
        next.delete(action.value);
      } else {
        next.add(action.value);
      }
      return { ...state, selectedWirkungen: next };
    }
    case "SET_WIRKUNG_VALUES": {
      const next = toSet(action.value);
      if (areSetsEqual(next, state.selectedWirkungen)) {
        return state;
      }
      return { ...state, selectedWirkungen: next };
    }
    case "SET_TYP": {
      return { ...state, typ: action.value };
    }
    case "TOGGLE_INCLUDE_DISC": {
      return { ...state, includeDiscontinued: action.value };
    }
    case "CLEAR_TERPENE": {
      return { ...state, selectedTerpene: new Set() };
    }
    case "CLEAR_WIRKUNGEN": {
      return { ...state, selectedWirkungen: new Set() };
    }
    default:
      return state;
  }
}

/*
 * Hauptkomponente des Kultivarfinder‑Tools. Sie nutzt useReducer, um
 * die Filter zu verwalten, und useState für die geladenen Daten.
 */
export default function CannabisKultivarFinderUseReducer() {
  // Hintergrundbild setzen
  useEffect(() => {
    const previousBackground = document.body.style.backgroundImage;
    const previousTitle = document.title;
    document.body.style.backgroundImage =
      "url('/F20_Pharma_Pattern-Hexagon_07.png')";
    document.title = "Four20 Index";

    return () => {
      document.body.style.backgroundImage = previousBackground;
      document.title = previousTitle;
    };
  }, []);

  // Daten aus dem Backend laden
  const [kultivare, setKultivare] = useState([]);
  const [availableWirkungen, setAvailableWirkungen] = useState(defaultWirkungen);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/kultivare.json");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        // Normalize Wirkungen once when loading data to avoid repeated processing later.
        // Each kultivar gets a new property `normalizedWirkungen` which contains
        // canonical effect names. This avoids repeatedly mapping over the wirkungen
        // array in the filter function.
        const normalized = Array.isArray(data)
          ? data.map((k) => {
              const normalizedWirkungen = Array.isArray(k.wirkungen)
                ? k.wirkungen.map((w) => normalizeWirkung(w))
                : [];
              return { ...k, normalizedWirkungen };
            })
          : [];
        setKultivare(normalized);

        const wirkungSet = new Set();
        normalized.forEach((cultivar) => {
          if (Array.isArray(cultivar.normalizedWirkungen)) {
            cultivar.normalizedWirkungen.forEach((wirkung) => {
              if (wirkung) {
                wirkungSet.add(wirkung);
              }
            });
          }
        });

        const wirkungList = [...wirkungSet].sort((a, b) =>
          a.localeCompare(b, "de", { sensitivity: "base" })
        );
        setAvailableWirkungen(
          wirkungList.length ? wirkungList : defaultWirkungen
        );
      } catch (err) {
        console.error("Fehler beim Laden der Daten:", err);
        setError(err instanceof Error ? err.message : "Unbekannter Fehler");
        setKultivare([]);
        setAvailableWirkungen(defaultWirkungen);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // useReducer für den Filterzustand
  const [filters, dispatch] = useReducer(filterReducer, initialFilterState);

  // Dialog für detaillierte Sorteninformationen (Name, THC, CBD, Terpengehalt, Wirkungen, Terpenprofil)
  const [infoDialog, setInfoDialog] = useState({ open: false, cultivar: null });

  // Zustand für das Terpen-Panel
  const [terpenPanel, setTerpenPanel] = useState({
    open: false,
    cultivar: null,
  });

  // NEW: Similarity override state — wenn gesetzt, ersetzt diese Liste die gefilterten Ergebnisse
  const [similarityContext, setSimilarityContext] = useState(null);
  const handleApplySimilarity = useCallback((payload) => {
    if (
      payload &&
      payload.reference &&
      Array.isArray(payload.results) &&
      payload.results.length
    ) {
      const referenceName = payload.reference?.name || payload.referenceName || "";
      const referenceEntry = { ...payload.reference, similarity: 1 };
      const filteredResults = payload.results.filter(
        (result) => result && result.name !== referenceEntry.name
      );
      setSimilarityContext({
        referenceName,
        results: [referenceEntry, ...filteredResults],
      });
      return;
    }
    setSimilarityContext(null);
  }, []);

  // Memoisiertes Filtern der Kultivare basierend auf dem Reducer-State
  const filteredKultivare = useMemo(
    () =>
      filterKultivare(
        kultivare,
        filters.selectedWirkungen,
        filters.selectedTerpene,
        filters.typ,
        filters.includeDiscontinued
      ),
    [
      kultivare,
      filters.selectedWirkungen,
      filters.selectedTerpene,
      filters.typ,
      filters.includeDiscontinued,
    ]
  );

  // Falls du bereits ein memoisiertes filteredKultivare hast, benutze das.
  // Beispiel: const filteredKultivare = useMemo(() => filterKultivare(...), [...deps]);

  // NEW: displayedKultivare = similarity override falls gesetzt, sonst gefilterte Liste
  const displayedKultivare = useMemo(
    () => (similarityContext ? similarityContext.results : filteredKultivare),
    [similarityContext, filteredKultivare]
  );

  // Callback‑Funktionen zum Dispatchen von Aktionen
  const clearTerpene = useCallback(
    () => dispatch({ type: "CLEAR_TERPENE" }),
    []
  );
  const clearWirkungen = useCallback(
    () => dispatch({ type: "CLEAR_WIRKUNGEN" }),
    []
  );
  // Memoized helpers to open and close the information dialog. Wrapping
  // setInfoDialog in useCallback avoids recreating these functions on every render.
  const showInfo = useCallback((cultivar) => {
    setInfoDialog({ open: true, cultivar });
  }, []);
  const hideInfo = useCallback(() => {
    setInfoDialog({ open: false, cultivar: null });
  }, []);

  // Callback-Funktionen für das Terpen-Panel
  const showTerpenPanel = useCallback((cultivar) => {
    setTerpenPanel({ open: true, cultivar });
  }, []);

  const hideTerpenPanel = useCallback(() => {
    setTerpenPanel({ open: false, cultivar: null });
  }, []);

  // Rendern der Komponente
  return (
    <div className="container">
      <header className="header" aria-label="App-Kopfzeile">
        <h1 className="appname">Four20 Index</h1>
      </header>
      {/* Inline‑Styles für Chips, Modals und Filterelemente */}
      <style>{`
        .terp-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
          justify-content: center;
          list-style: none;
          margin: 0;
          padding: 0;
        }
        .terp-chip {
          border: 1px solid #cfd8dc; border-radius: 9999px; padding: 4px 10px; cursor: pointer;
          background: #f7fafc; font-size: 12px; line-height: 1; white-space: nowrap;
        }
        .terp-chip:hover { background: #eef2f7; }
        .modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.35); display: grid; place-items: center; z-index: 50; }
        .modal { background: #fff; max-width: 600px; width: 90%; border-radius: 12px; padding: 18px 20px 20px; position: relative; }
        .modal-title { margin: 0 0 8px; text-align: left; font-size: 18px; }
        .modal-close { position: absolute; top: 8px; right: 10px; border: none; background: transparent; font-size: 22px; cursor: pointer; }
        .modal-content p { margin: 0.5rem 0; }
        .modal-meta { font-size: 12px; color: #546e7a; }
        .filters { display: grid; gap: 12px; margin: 12px 0 24px; }
        .select-group { background: #ffffffcc; padding: 12px; border: 1px solid #e0e0e0; border-radius: 10px; }
        .select-group h3 { margin: 0 0 8px; font-size: 16px; text-align: center; }
        .select-row { display: flex; gap: 12px; align-items: flex-start; }
        .select-row--with-reset .reset-btn { align-self: flex-start; }
        .multi-select { display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr)); gap: 8px; width: 100%; }
        .multi-select__option { display: inline-flex; align-items: center; gap: 6px; padding: 8px 12px; border: 1px solid #cfd8dc; border-radius: 9999px; background: #f7fafc; font-size: 13px; line-height: 1.3; }
        .multi-select__option input { accent-color: #546e7a; }
        .multi-select__option:focus-within { outline: 2px solid #90caf9; outline-offset: 2px; }
        .reset-btn { padding: 8px 10px; border: 1px solid #b0bec5; background: #f5f7f9; border-radius: 8px; cursor: pointer; }
        .reset-btn:hover { background: #eef2f7; }
        .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .table-container { overflow-x: auto; }

        /* NEU: Tabelle zentrieren und maximale Breite setzen */
        .strain-table-wrapper { display: flex; justify-content: center; width: 100%; margin: 0 auto; }
        .strain-table { width: 100%; max-width: 1100px; border-collapse: collapse; }
        .strain-table th, .strain-table td { padding: 8px 10px; border-bottom: 1px solid #eee; text-align: left; }
        .strain-table th.terpenprofil-header, .strain-table td.terpenprofil-cell { text-align: center; }

        .table { width: 100%; }
        .table th, .table td { white-space: normal; }
        .typ-button-group { background: #ffffffcc; padding: 12px; border: 1px solid #e0e0e0; border-radius: 10px; text-align: center; margin: 12px 0; }
        .typ-row { display: flex; flex-wrap: wrap; gap: 4px; align-items: center; justify-content: center; }
        .typ-btn { border: 1px solid #cfd8dc; border-radius: 9999px; padding: 8px 12px; cursor: pointer; background: #fff; font-size: 14px; line-height: 1; white-space: nowrap; }
        .typ-btn:hover { background: #f7faff; }
        .typ-btn.active { background: #e8f0fe; border-color: #90caf9; }
        .status { margin: 16px auto; max-width: 720px; padding: 12px 16px; border-radius: 10px; font-size: 15px; text-align: center; }
        .status--loading { background: #f1f8ff; border: 1px solid #90caf9; color: #0d47a1; }
        .status--error { background: #ffebee; border: 1px solid #ef9a9a; color: #b71c1c; }
        /* Kleine Screens: Spalten mit der Klasse hidden-sm ausblenden */
        @media (max-width: 640px) {
          .hidden-sm {
            display: none;
          }
        }
      `}</style>
      {/* HWG-Hinweis */}
      <div
        style={{
          backgroundColor: "#fff3cd",
          border: "1px solid #ffeaa7",
          borderRadius: "8px",
          padding: "12px",
          marginBottom: "16px",
          fontSize: "14px",
          color: "#856404",
        }}
      >
        <strong>Hinweis:</strong> Diese Anwendung dient ausschließlich der
        allgemeinen Information und ersetzt keine medizinische Beratung. Bei
        gesundheitlichen Fragen wenden Sie sich an einen Arzt oder Apotheker.
      </div>

      <StrainSimilarity kultivare={kultivare} onApplySimilar={handleApplySimilarity} />
      <TypFilter typ={filters.typ} dispatch={dispatch} typInfo={typInfo} />
      <FilterPanel
        filters={filters}
        dispatch={dispatch}
        terpene={terpene}
        wirkungen={availableWirkungen}
        clearTerpene={clearTerpene}
        clearWirkungen={clearWirkungen}
      />
      {similarityContext && (
        <div className="similarity-banner" role="status" aria-live="polite">
          <strong>Hinweis:</strong> Es werden ähnliche Sorten zu <em>{similarityContext.referenceName || "der ausgewählten Sorte"}</em>
          {" "}angezeigt. Die Tabelle enthält dafür eine Spalte mit dem Übereinstimmungswert. Verwenden Sie „Clear similarity“,
          um zur gefilterten Ansicht zurückzukehren.
        </div>
      )}
      {loading && (
        <div className="status status--loading" role="status" aria-live="polite">
          Daten werden geladen …
        </div>
      )}
      {error && !loading && (
        <div className="status status--error" role="alert">
          Beim Laden der Daten ist ein Fehler aufgetreten: {error}
        </div>
      )}
      {!loading && !error && (
        <StrainTable
          strains={displayedKultivare}
          showInfo={showInfo}
          showTerpenPanel={showTerpenPanel}
        />
      )}
      <EntourageInfo />

      <DetailsModal infoDialog={infoDialog} hideInfo={hideInfo} />

      {terpenPanel.open && terpenPanel.cultivar && (
        <div className="modal-backdrop" onClick={hideTerpenPanel} role="dialog" aria-modal="true" aria-label={`Terpen-Informationen für ${terpenPanel.cultivar.name}`}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px", maxHeight: "90vh", overflow: "auto" }}>
            <button className="modal-close" onClick={hideTerpenPanel} aria-label="Dialog schließen">×</button>
            <CultivarTerpenPanel cultivar={terpenPanel.cultivar} />
          </div>
        </div>
      )}
    </div>
  );
}


