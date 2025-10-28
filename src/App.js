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
import TerpeneChips from "./components/TerpeneChips";
import FilterPanel from "./components/FilterPanel";
import StrainTable from "./components/StrainTable";
import DetailsModal from "./components/DetailsModal";
import StrainSimilarity from "./components/StrainSimilarity";
import { normalize, normalizeWirkung, terpenInfo, getTerpenAliases } from "./utils/helpers";

// Wiederverwendbare UI‑Komponenten
const Card = ({ children }) => <div className="card">{children}</div>;
const CardContent = ({ children }) => <div>{children}</div>;
const Button = ({ children, onClick, disabled }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`button ${disabled ? "button-disabled" : ""}`}
  >
    {children}
  </button>
);

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
  "Trans-Caryophyllen",
  "α-Humulen",
  "β-Caryophyllen",
  "β-Myrcen",
  "β-Ocimen",
];

/*
 * Liste der verfügbaren Wirkungen. Synonyme werden über das Mapping
 * `wirkungAliases` auf diese kanonischen Bezeichnungen abgebildet. Diese
 * Liste dient als Quelle für Dropdowns.
 */
const wirkungen = [
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
      if (selectedWirkungen.size) {
        if (!Array.isArray(k.wirkungen)) return false;
        const selectedNormalized = [...selectedWirkungen].map((w) =>
          normalizeWirkung(w)
        );
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

// Ableitung des Radar‑Diagramm‑Pfads
const radarPathSvg = (name) =>
  `/netzdiagramme/${name.replace(/\s+/g, "_")}.svg`;

/*
 * Anfangszustand des Reducers. Wir fassen alle Filter- und UI‑Zustände
 * zusammen. Sets werden hier als echte Set‑Instanzen initialisiert.
 */
const initialFilterState = {
  terp1: "",
  terp2: "",
  wirk1: "",
  wirk2: "",
  typ: "",
  includeDiscontinued: false,
  selectedTerpene: new Set(),
  selectedWirkungen: new Set(),
  terpenDialog: { open: false, name: null },
};

/*
 * Reducer zum Aktualisieren des Filterzustands. Für jede Aktion
 * berechnen wir den neuen State und leiten ggf. Sets ab. Durch das
 * Bündeln der Logik hier bleibt der Code in der Komponente schlanker.
 */
function filterReducer(state, action) {
  switch (action.type) {
    case "SET_TERP1": {
      const newSet = new Set([action.value, state.terp2].filter(Boolean));
      return { ...state, terp1: action.value, selectedTerpene: newSet };
    }
    case "SET_TERP2": {
      const newSet = new Set([state.terp1, action.value].filter(Boolean));
      return { ...state, terp2: action.value, selectedTerpene: newSet };
    }
    case "SET_WIRK1": {
      const newSet = new Set([action.value, state.wirk2].filter(Boolean));
      return { ...state, wirk1: action.value, selectedWirkungen: newSet };
    }
    case "SET_WIRK2": {
      const newSet = new Set([state.wirk1, action.value].filter(Boolean));
      return { ...state, wirk2: action.value, selectedWirkungen: newSet };
    }
    case "SET_TYP": {
      return { ...state, typ: action.value };
    }
    case "TOGGLE_INCLUDE_DISC": {
      return { ...state, includeDiscontinued: action.value };
    }
    case "CLEAR_TERPENE": {
      return { ...state, terp1: "", terp2: "", selectedTerpene: new Set() };
    }
    case "CLEAR_WIRKUNGEN": {
      return { ...state, wirk1: "", wirk2: "", selectedWirkungen: new Set() };
    }
    case "OPEN_TERPEN_DIALOG": {
      return { ...state, terpenDialog: { open: true, name: action.name } };
    }
    case "CLOSE_TERPEN_DIALOG": {
      return { ...state, terpenDialog: { open: false, name: null } };
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
    document.body.style.backgroundImage =
      "url('/F20_Pharma_Pattern-Hexagon_07.png')";
  }, []);

  // Daten aus dem Backend laden
  const [kultivare, setKultivare] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
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
      } catch (err) {
        console.error("Fehler beim Laden der Daten:", err);
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
    if (payload && Array.isArray(payload.results) && payload.results.length) {
      setSimilarityContext({
        referenceName: payload.reference?.name || payload.referenceName || "",
        results: payload.results,
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
  const openTerpenDialog = useCallback(
    (name) => dispatch({ type: "OPEN_TERPEN_DIALOG", name }),
    []
  );
  const closeTerpenDialog = useCallback(
    () => dispatch({ type: "CLOSE_TERPEN_DIALOG" }),
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

  const optionsFor = useCallback(
    (items, exclude) => items.filter((i) => !exclude || i !== exclude),
    []
  );

  // Tooltip‑Informationen zu Terpenen
  const activeInfo = useMemo(() => {
    const name = filters.terpenDialog.name;
    if (!name) return null;
    return (
      terpenInfo[name] ||
      Object.values(terpenInfo).find((v) => v.aliases?.includes(name)) ||
      null
    );
  }, [filters.terpenDialog.name]);

  // UI für Terpen‑Chips (verwende useCallback, damit die Funktion nur neu erstellt wird, wenn openTerpenDialog sich ändert)
  const renderTerpenChips = useCallback((list) => {
    return <TerpeneChips list={list} onInfo={openTerpenDialog} />;
  }, [openTerpenDialog]);

  // Rendern der Komponente
  return (
    <div className="container">
      <header className="header" aria-label="App-Kopfzeile">
        <h1 className="appname">Kultivarfinder</h1>
      </header>
      {/* Inline‑Styles für Chips, Modals und Filterelemente */}
      <style>{`
        .terp-list { display: flex; flex-wrap: wrap; gap: 6px; justify-content: center; }
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
        .filters { display: grid; gap: 12px; margin: 16px 0 24px; }
        .select-group { background: #ffffffcc; padding: 12px; border: 1px solid #e0e0e0; border-radius: 10px; }
        .select-group h3 { margin: 0 0 8px; font-size: 16px; text-align: center; }
        .select-row { display: grid; grid-template-columns: 1fr 1fr auto; gap: 8px; align-items: center; }
        .select-row select { width: 100%; padding: 10px; border: 1px solid #cfd8dc; border-radius: 8px; font-size: 14px; }
        .reset-btn { padding: 8px 10px; border: 1px solid #b0bec5; background: #f5f7f9; border-radius: 8px; cursor: pointer; }
        .reset-btn:hover { background: #eef2f7; }
        .table-scroll { overflow-x: auto; -webkit-overflow-scrolling: touch; }
        .table-container { overflow-x: auto; }

        /* NEU: Tabelle zentrieren und maximale Breite setzen */
        .strain-table-wrapper { display: flex; justify-content: center; width: 100%; margin: 0 auto; }
        .strain-table { width: 100%; max-width: 1100px; border-collapse: collapse; }
        .strain-table th, .strain-table td { padding: 8px 10px; border-bottom: 1px solid #eee; text-align: left; }
        .strain-table th.terpenprofil-header, .strain-table td.terpenprofil-cell { text-align: center; }
        .similarity-banner { background: #e3f2fd; border: 1px solid #90caf9; color: #0d47a1; border-radius: 8px; padding: 10px 12px; margin: 16px auto; max-width: 1100px; }

        .table { width: 100%; }
        .table th, .table td { white-space: normal; }
        .typ-button-group { background: #ffffffcc; padding: 12px; border: 1px solid #e0e0e0; border-radius: 10px; text-align: center; }
        .typ-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: center; }
        .typ-btn { border: 1px solid #cfd8dc; border-radius: 9999px; padding: 8px 12px; cursor: pointer; background: #fff; font-size: 14px; line-height: 1; white-space: nowrap; }
        .typ-btn:hover { background: #f7faff; }
        .typ-btn.active { background: #e8f0fe; border-color: #90caf9; }
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

      <EntourageInfo />
      <FilterPanel
        filters={filters}
        dispatch={dispatch}
        terpene={terpene}
        optionsFor={optionsFor}
        wirkungen={wirkungen}
        typInfo={typInfo}
        clearTerpene={clearTerpene}
        clearWirkungen={clearWirkungen}
      />
      {similarityContext && (
        <div className="similarity-banner" role="status" aria-live="polite">
          <strong>Hinweis:</strong> Es werden ähnliche Sorten zu <em>{similarityContext.referenceName || "der ausgewählten Sorte"}</em>
          {" "}angezeigt. Verwenden Sie „Clear similarity“, um zur gefilterten Ansicht zurückzukehren.
        </div>
      )}
      <StrainTable strains={displayedKultivare} showInfo={showInfo} showTerpenPanel={showTerpenPanel} />
      <StrainSimilarity kultivare={kultivare} onApplySimilar={handleApplySimilarity} /> {/* Füge die StrainSimilarity-Komponente hinzu */}

      {/* Terpen Info modal remains handled in App via filters.terpenDialog */}
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

