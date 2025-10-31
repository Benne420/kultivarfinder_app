/*
 * Refaktorierte Version der Hauptkomponente, bei der der Zustand über
 * useReducer verwaltet wird. Hier werden alle Filter‑ und UI‑bezogenen
 * Zustände in einem zentralen Objekt zusammengeführt. Dadurch werden
 * Set‑Operationen konsistenter und die Logik der Zustandsübergänge
 * bleibt übersichtlicher. Die ursprüngliche Funktionalität bleibt
 * unverändert.
 */

import { useEffect, useMemo, useCallback, useReducer, useRef, useState } from "react";
import "@fontsource/montserrat";
import "./styles.css";
import CultivarTerpenPanel from "./components/CultivarTerpenPanel";
import EntourageInfo from "./components/EntourageInfo";
import FilterPanel from "./components/FilterPanel";
import StrainTable from "./components/StrainTable";
import DetailsModal from "./components/DetailsModal";
import RadarModal from "./components/RadarModal";
import StrainSimilarity from "./components/StrainSimilarity";
import TypFilter from "./components/TypFilter";
import { TerpeneContext } from "./context/TerpeneContext";
import {
  normalizeWirkung,
  createTerpeneAliasLookup,
  mapTerpeneToCanonical,
  sortTerpeneNames,
} from "./utils/helpers";

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
const defaultTerpeneOptions = sortTerpeneNames([
  "ɑ-Pinen",
  "α-Humulen",
  "β-Myrcen",
  "β-Ocimen",
  "Caryophyllen",
  "D-Limonen",
  "Farnesen",
  "Linalool",
  "Selinen",
  "Terpinolen",
]);

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

const getCanonicalTerpeneProfile = (kultivar, aliasLookup) => {
  if (!kultivar) return new Set();
  if (Array.isArray(kultivar.normalizedTerpenprofil)) {
    return new Set(kultivar.normalizedTerpenprofil);
  }
  if (!Array.isArray(kultivar.terpenprofil)) {
    return new Set();
  }
  const canonicalSet = new Set();
  kultivar.terpenprofil.forEach((name) => {
    const canonical = mapTerpeneToCanonical(name, aliasLookup);
    if (canonical) {
      canonicalSet.add(canonical);
    }
  });
  return canonicalSet;
};

const kultivarHasSelectedTerpene = (kultivar, selectedTerpene, aliasLookup) => {
  if (!selectedTerpene || selectedTerpene.size === 0) return true;
  const profileSet = getCanonicalTerpeneProfile(kultivar, aliasLookup);
  if (!profileSet.size) return false;
  for (const sel of selectedTerpene) {
    const canonical = mapTerpeneToCanonical(sel, aliasLookup);
    if (!canonical || !profileSet.has(canonical)) {
      return false;
    }
  }
  return true;
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
  selectedNormalized,
  selectedTerpene,
  targetTyp,
  includeDisc,
  aliasLookup
) => {
  return kultivare
    .filter((k) => isStatusIncluded(k, includeDisc))
    .filter((k) => {
      // Terpene filtern
      if (
        selectedTerpene.size &&
        !kultivarHasSelectedTerpene(k, selectedTerpene, aliasLookup)
      ) {
        return false;
      }
      // Wirkungen filtern (normalisiert)
      if (selectedNormalized && selectedNormalized.length) {
        if (!Array.isArray(k.wirkungen)) return false;
        // Use preprocessed normalizedWirkungen if available to avoid re-normalizing on each filter.
        const kultivarNormalized = Array.isArray(k.normalizedWirkungen)
          ? k.normalizedWirkungen
          : Array.isArray(k.wirkungen)
          ? k.wirkungen.map((w) => normalizeWirkung(w))
          : [];
        for (const w of selectedNormalized) {
          if (!kultivarNormalized.includes(w)) {
            return false;
          }
        }
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
    case "SET_TERPENE_VALUES": {
      const next = toSet(action.value);
      if (areSetsEqual(next, state.selectedTerpene)) {
        return state;
      }
      return { ...state, selectedTerpene: next };
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
  const [terpeneOptions, setTerpeneOptions] = useState(defaultTerpeneOptions);
  const [terpeneLookup, setTerpeneLookup] = useState(null);
  const [terpeneMetadata, setTerpeneMetadata] = useState([]);
  const referencesCacheRef = useRef({ data: null, promise: null });
  const [references, setReferences] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadReferences = useCallback(async () => {
    if (referencesCacheRef.current.data) {
      setReferences(referencesCacheRef.current.data);
      return referencesCacheRef.current.data;
    }

    if (!referencesCacheRef.current.promise) {
      const fetchPromise = (async () => {
        const response = await fetch("/data/references.json");
        if (!response.ok) {
          throw new Error(`Referenzen HTTP ${response.status}`);
        }
        const data = await response.json();
        const normalized = Array.isArray(data) ? data : [];
        referencesCacheRef.current.data = normalized;
        setReferences(normalized);
        return normalized;
      })();

      referencesCacheRef.current.promise = fetchPromise
        .catch((err) => {
          referencesCacheRef.current.data = null;
          throw err;
        })
        .finally(() => {
          referencesCacheRef.current.promise = null;
        });
    }

    if (referencesCacheRef.current.promise) {
      return referencesCacheRef.current.promise;
    }

    return [];
  }, []);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const referencesPromise = loadReferences();
        const [kultivarResponse, terpeneResponse] = await Promise.all([
          fetch("/kultivare.json"),
          fetch("/data/terpenes.json"),
        ]);

        if (!kultivarResponse.ok) {
          throw new Error(`Kultivare HTTP ${kultivarResponse.status}`);
        }
        if (!terpeneResponse.ok) {
          throw new Error(`Terpene HTTP ${terpeneResponse.status}`);
        }

        const [kultivarData, terpenesData, referencesData] = await Promise.all([
          kultivarResponse.json(),
          terpeneResponse.json(),
          referencesPromise,
        ]);

        const terpenes = Array.isArray(terpenesData) ? terpenesData : [];
        setTerpeneMetadata(terpenes);
        const aliasLookup = createTerpeneAliasLookup(terpenes);
        setTerpeneLookup(aliasLookup);

        const canonicalTerpenes = aliasLookup?.variantsByCanonical;
        if (canonicalTerpenes instanceof Map && canonicalTerpenes.size) {
          const sortedTerpenes = sortTerpeneNames([
            ...canonicalTerpenes.keys(),
          ]);
          setTerpeneOptions(sortedTerpenes);
        } else {
          setTerpeneOptions(defaultTerpeneOptions);
        }

        const normalized = Array.isArray(kultivarData)
          ? kultivarData.map((k) => {
              const normalizedWirkungen = Array.isArray(k.wirkungen)
                ? k.wirkungen.map((w) => normalizeWirkung(w))
                : [];
              const normalizedTerpenprofil = Array.isArray(k.terpenprofil)
                ? Array.from(
                    new Set(
                      k.terpenprofil
                        .map((name) => mapTerpeneToCanonical(name, aliasLookup))
                        .filter(Boolean)
                    )
                  )
                : [];
              return {
                ...k,
                normalizedWirkungen,
                normalizedTerpenprofil,
              };
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

        if (Array.isArray(referencesData)) {
          setReferences(referencesData);
        }
      } catch (err) {
        console.error("Fehler beim Laden der Daten:", err);
        setError(err instanceof Error ? err.message : "Unbekannter Fehler");
        setKultivare([]);
        setAvailableWirkungen(defaultWirkungen);
        setTerpeneOptions(defaultTerpeneOptions);
        setTerpeneLookup(null);
        setTerpeneMetadata([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [loadReferences]);

  // useReducer für den Filterzustand
  const [filters, dispatch] = useReducer(filterReducer, initialFilterState);

  const targetTyp = useMemo(() => mapTyp(filters.typ), [filters.typ]);
  const selectedNormalized = useMemo(() => {
    if (!filters.selectedWirkungen.size) return null;
    const normalized = [];
    filters.selectedWirkungen.forEach((wirkung) => {
      const value = normalizeWirkung(wirkung);
      if (value) {
        normalized.push(value);
      }
    });
    return normalized;
  }, [filters.selectedWirkungen]);

  // Dialog für detaillierte Sorteninformationen (Name, THC, CBD, Terpengehalt, Wirkungen, Terpenprofil)
  const [infoDialog, setInfoDialog] = useState({ open: false, cultivar: null });
  const [radarDialog, setRadarDialog] = useState({ open: false, cultivar: null });

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
        selectedNormalized,
        filters.selectedTerpene,
        targetTyp,
        filters.includeDiscontinued,
        terpeneLookup
      ),
    [
      kultivare,
      selectedNormalized,
      filters.selectedTerpene,
      targetTyp,
      filters.includeDiscontinued,
      terpeneLookup,
    ]
  );

  // Falls du bereits ein memoisiertes filteredKultivare hast, benutze das.
  // Beispiel: const filteredKultivare = useMemo(() => filterKultivare(...), [...deps]);

  // NEW: displayedKultivare = similarity override falls gesetzt, sonst gefilterte Liste
  const displayedKultivare = useMemo(
    () => (similarityContext ? similarityContext.results : filteredKultivare),
    [similarityContext, filteredKultivare]
  );

  const terpeneContextValue = useMemo(
    () => ({
      terpenes: terpeneMetadata,
      aliasLookup: terpeneLookup,
      references,
      loadReferences,
    }),
    [terpeneMetadata, terpeneLookup, references, loadReferences]
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
  const handleIncludeDiscontinuedChange = useCallback(
    (value) => dispatch({ type: "TOGGLE_INCLUDE_DISC", value }),
    [dispatch]
  );
  // Memoized helpers to open and close the information dialog. Wrapping
  // setInfoDialog in useCallback avoids recreating these functions on every render.
  const showInfo = useCallback((cultivar) => {
    setInfoDialog({ open: true, cultivar });
  }, []);
  const hideInfo = useCallback(() => {
    setInfoDialog({ open: false, cultivar: null });
  }, []);

  const showRadar = useCallback((cultivar) => {
    setRadarDialog({ open: true, cultivar });
  }, []);

  const hideRadar = useCallback(() => {
    setRadarDialog({ open: false, cultivar: null });
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
    <TerpeneContext.Provider value={terpeneContextValue}>
      <div className="container">
      <header className="header" aria-label="App-Kopfzeile">
        <h1 className="appname">Four20 Index</h1>
      </header>
      
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

      <StrainSimilarity
        kultivare={kultivare}
        onApplySimilar={handleApplySimilarity}
        includeDiscontinued={filters.includeDiscontinued}
        onToggleIncludeDiscontinued={handleIncludeDiscontinuedChange}
      />
      <TypFilter typ={filters.typ} dispatch={dispatch} typInfo={typInfo} />
      <FilterPanel
        filters={filters}
        dispatch={dispatch}
        terpene={terpeneOptions}
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
          showRadar={showRadar}
        />
      )}
      <EntourageInfo />

      <DetailsModal infoDialog={infoDialog} hideInfo={hideInfo} />
      <RadarModal radarDialog={radarDialog} hideRadar={hideRadar} />

      {terpenPanel.open && terpenPanel.cultivar && (
        <div className="modal-backdrop" onClick={hideTerpenPanel} role="dialog" aria-modal="true" aria-label={`Terpen-Informationen für ${terpenPanel.cultivar.name}`}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: "800px", maxHeight: "90vh", overflow: "auto" }}>
            <button className="modal-close" onClick={hideTerpenPanel} aria-label="Dialog schließen">×</button>
            <CultivarTerpenPanel cultivar={terpenPanel.cultivar} />
          </div>
        </div>
      )}
      </div>
    </TerpeneContext.Provider>
  );
}



