/*
 * Refaktorierte Version der Hauptkomponente, bei der der Zustand über
 * useReducer verwaltet wird. Hier werden alle Filter‑ und UI‑bezogenen
 * Zustände in einem zentralen Objekt zusammengeführt. Dadurch werden
 * Set‑Operationen konsistenter und die Logik der Zustandsübergänge
 * bleibt übersichtlicher. Die ursprüngliche Funktionalität bleibt
 * unverändert.
 */

import {
  useEffect,
  useMemo,
  useCallback,
  useReducer,
  useRef,
  useState,
  lazy,
  Suspense,
} from "react";
import "@fontsource/montserrat";
import "./styles.css";
import FilterPanel from "./components/FilterPanel";
import StrainTable from "./components/StrainTable";
import StrainSimilarity from "./components/StrainSimilarity";
import TypFilter from "./components/TypFilter";
import { TerpeneContext } from "./context/TerpeneContext";
import { DEFAULT_TERPENE_RANK_ICONS } from "./constants/terpeneIcons";
import {
  normalizeWirkung,
  createTerpeneAliasLookup,
  mapTerpeneToCanonical,
  sortTerpeneNames,
  getComparisonLayoutMetrics,
  COMPARISON_MAX_WIDTH_PX,
} from "./utils/helpers";
import defaultTerpeneOptionsSource from "./data/default-terpene-options.json";
import defaultWirkungenSource from "./data/default-wirkungen.json";

const EntourageInfoModal = lazy(() => import("./components/EntourageInfoModal"));
const TerpeneInfoModal = lazy(() => import("./components/TerpeneInfoModal"));
const RadarModal = lazy(() => import("./components/RadarModal"));
const ComparisonPanel = lazy(() => import("./components/ComparisonPanel"));
const ComparisonDetailsModal = lazy(() => import("./components/ComparisonDetailsModal"));

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
const defaultTerpeneOptions = sortTerpeneNames(defaultTerpeneOptionsSource);

/*
 * Liste der verfügbaren Wirkungen. Synonyme werden über das Mapping
 * `wirkungAliases` auf diese kanonischen Bezeichnungen abgebildet. Diese
 * Liste dient als Quelle für Dropdowns.
 */
const defaultWirkungen = [...defaultWirkungenSource].sort();

const SuspenseOverlayFallback = ({ label = "Inhalt wird geladen …" }) => (
  <div className="modal-fallback" role="status" aria-live="polite">
    <span className="modal-fallback__spinner" aria-hidden="true" />
    <span>{label}</span>
  </div>
);

const MAX_COMPARISON_ITEMS = 4;
const VIEWPORT_WIDTH_FACTOR = 0.94;
const VIEWPORT_WIDTH_FALLBACK = COMPARISON_MAX_WIDTH_PX / VIEWPORT_WIDTH_FACTOR;

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
        // Greife auf vorberechnete normalisierte Werte zurück und fallbacke auf Rohdaten.
        const kultivarNormalized = Array.isArray(k.normalizedWirkungen)
          ? k.normalizedWirkungen
          : Array.isArray(k.wirkungen)
          ? k.wirkungen.map((w) => normalizeWirkung(w))
          : [];
        if (!kultivarNormalized.length) {
          return false;
        }
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
    case "CLEAR_FILTERS": {
      return {
        ...initialFilterState,
        selectedTerpene: new Set(),
        selectedWirkungen: new Set(),
      };
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
    const previousStyles = {
      backgroundImage: document.body.style.backgroundImage,
      backgroundRepeat: document.body.style.backgroundRepeat,
      backgroundSize: document.body.style.backgroundSize,
      backgroundPosition: document.body.style.backgroundPosition,
      title: document.title,
    };

    document.body.style.backgroundImage =
      "url('/F20_Pharma_Pattern-Hexagon_07.png')";
    document.body.style.backgroundRepeat = "repeat";
    document.body.style.backgroundSize = "auto";
    document.body.style.backgroundPosition = "center";
    document.title = "Four20 Index";

    return () => {
      document.body.style.backgroundImage = previousStyles.backgroundImage;
      document.body.style.backgroundRepeat = previousStyles.backgroundRepeat;
      document.body.style.backgroundSize = previousStyles.backgroundSize;
      document.body.style.backgroundPosition = previousStyles.backgroundPosition;
      document.title = previousStyles.title;
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
  const [referencesLoading, setReferencesLoading] = useState(false);
  const [referencesError, setReferencesError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadReferences = useCallback(async () => {
    if (referencesCacheRef.current.data) {
      setReferences(referencesCacheRef.current.data);
      setReferencesError(null);
      setReferencesLoading(false);
      return referencesCacheRef.current.data;
    }

    if (!referencesCacheRef.current.promise) {
      setReferencesError(null);
      setReferencesLoading(true);

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
          setReferencesError(err instanceof Error ? err.message : "Unbekannter Fehler");
          throw err;
        })
        .finally(() => {
          referencesCacheRef.current.promise = null;
          setReferencesLoading(false);
        });
    }

    if (referencesCacheRef.current.promise) {
      try {
        return await referencesCacheRef.current.promise;
      } catch (err) {
        // Fehler werden bereits oben gesetzt; trotzdem weiterreichen für spezifische Behandlungen
        throw err;
      }
    }

    return [];
  }, []);
  const prefetchReferences = useCallback(() => {
    const maybePromise = loadReferences();
    if (maybePromise && typeof maybePromise.then === "function") {
      maybePromise.catch((err) => {
        console.warn(
          "Referenzdaten konnten nicht geladen werden, Kernfunktionalität wird fortgesetzt.",
          err
        );
      });
    }
  }, [loadReferences]);
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);

      try {
        prefetchReferences();
      } catch (err) {
        console.warn(
          "Referenzdaten konnten nicht geladen werden, Kernfunktionalität wird fortgesetzt.",
          err
        );
      }

      try {
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

        const [kultivarData, terpenesData] = await Promise.all([
          kultivarResponse.json(),
          terpeneResponse.json(),
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
                  ).slice(0, 5)
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
  }, [prefetchReferences]);

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

  // Dialog für das kombinierte Radar- und Detailfenster
  const [radarDialog, setRadarDialog] = useState({ open: false, cultivar: null });
  const [terpeneDialog, setTerpeneDialog] = useState({
    open: false,
    cultivar: null,
    terpene: null,
  });

  // NEW: Similarity override state — wenn gesetzt, ersetzt diese Liste die gefilterten Ergebnisse
  const [similarityContext, setSimilarityContext] = useState(null);
  const [selectedCultivars, setSelectedCultivars] = useState([]);
  const [isComparisonOpen, setIsComparisonOpen] = useState(false);
  const [isComparisonDetailsOpen, setIsComparisonDetailsOpen] = useState(false);

  const [viewportWidth, setViewportWidth] = useState(() => {
    if (typeof window === "undefined") {
      return VIEWPORT_WIDTH_FALLBACK;
    }
    return window.innerWidth;
  });
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(true);

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const viewportConstraint = useMemo(() => {
    if (!Number.isFinite(viewportWidth) || viewportWidth <= 0) {
      return undefined;
    }
    return Math.floor(viewportWidth * VIEWPORT_WIDTH_FACTOR);
  }, [viewportWidth]);

  const comparisonLayout = useMemo(
    () =>
      getComparisonLayoutMetrics(
        Math.max(selectedCultivars.length, 1),
        viewportConstraint
      ),
    [selectedCultivars.length, viewportConstraint]
  );

  const containerStyle = useMemo(
    () => ({ "--layout-max-width": `${comparisonLayout.panelWidthPx}px` }),
    [comparisonLayout.panelWidthPx]
  );

  const activeCultivarCount = useMemo(
    () => kultivare.filter((k) => isStatusIncluded(k, false)).length,
    [kultivare]
  );
  useEffect(() => {
    if (!isComparisonOpen || typeof document === "undefined") {
      return undefined;
    }

    const { style } = document.body;
    const previousOverflow = style.overflow;
    const previousPaddingRight = style.paddingRight;
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    style.overflow = "hidden";
    if (scrollbarWidth > 0) {
      style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      style.overflow = previousOverflow;
      style.paddingRight = previousPaddingRight;
    };
  }, [isComparisonOpen]);
  const [isEntourageModalOpen, setIsEntourageModalOpen] = useState(false);
  const handleApplySimilarity = useCallback((payload) => {
    if (
      payload &&
      payload.reference &&
      Array.isArray(payload.results) &&
      payload.results.length
    ) {
      const referenceName = payload.reference?.name || payload.referenceName || "";
      const referenceEntry = {
        ...payload.reference,
        similarity: 1,
        similarityLabel: "Referenz",
      };
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

  const kultivarLookup = useMemo(() => {
    const lookup = new Map();
    kultivare.forEach((cultivar) => {
      if (cultivar?.name) {
        lookup.set(cultivar.name, cultivar);
      }
    });
    return lookup;
  }, [kultivare]);

  useEffect(() => {
    setSelectedCultivars((prev) =>
      prev
        .map((item) => (item?.name ? kultivarLookup.get(item.name) : null))
        .filter(Boolean)
    );
  }, [kultivarLookup]);

  const terpeneContextValue = useMemo(
    () => ({
      terpenes: terpeneMetadata,
      aliasLookup: terpeneLookup,
      references,
      loadReferences,
      referencesLoading,
      referencesError,
      rankIconMap: DEFAULT_TERPENE_RANK_ICONS,
    }),
    [
      terpeneMetadata,
      terpeneLookup,
      references,
      loadReferences,
      referencesLoading,
      referencesError,
    ]
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
  const resetFilters = useCallback(() => dispatch({ type: "CLEAR_FILTERS" }), []);
  const showRadar = useCallback((cultivar) => {
    setRadarDialog({ open: true, cultivar });
  }, []);

  const showTerpeneInfo = useCallback((cultivar, terpene) => {
    setTerpeneDialog({ open: true, cultivar, terpene });
  }, []);

  const hideRadar = useCallback(() => {
    setRadarDialog({ open: false, cultivar: null });
  }, []);

  const hideTerpeneInfo = useCallback(() => {
    setTerpeneDialog({ open: false, cultivar: null, terpene: null });
  }, []);

  const toggleCultivarSelection = useCallback((cultivar) => {
    if (!cultivar?.name) return;
    setSelectedCultivars((prev) => {
      const exists = prev.some((item) => item.name === cultivar.name);
      if (exists) {
        return prev.filter((item) => item.name !== cultivar.name);
      }
      if (prev.length >= MAX_COMPARISON_ITEMS) {
        return prev;
      }
      return [...prev, cultivar];
    });
  }, []);

  const openComparison = useCallback(() => {
    setIsComparisonOpen((prev) => (selectedCultivars.length >= 2 ? true : prev));
  }, [selectedCultivars.length]);

  const closeComparison = useCallback(() => {
    setIsComparisonOpen(false);
  }, []);

  const handleAddMoreCultivars = useCallback(() => {
    setIsComparisonOpen(false);
    setIsComparisonDetailsOpen(false);
  }, []);

  useEffect(() => {
    if (isComparisonOpen && selectedCultivars.length < 2) {
      setIsComparisonOpen(false);
    }
  }, [isComparisonOpen, selectedCultivars.length]);

  useEffect(() => {
    if (isComparisonDetailsOpen && selectedCultivars.length < 2) {
      setIsComparisonDetailsOpen(false);
    }
  }, [isComparisonDetailsOpen, selectedCultivars.length]);

  const openEntourageModal = useCallback(() => {
    setIsEntourageModalOpen(true);
  }, []);

  const closeEntourageModal = useCallback(() => {
    setIsEntourageModalOpen(false);
  }, []);

  const canOpenComparison = selectedCultivars.length >= 2;

  const tableSectionRef = useRef(null);
  const filterPanelRef = useRef(null);

  const scrollToTable = useCallback(() => {
    if (tableSectionRef.current) {
      tableSectionRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const scrollToFilters = useCallback(() => {
    if (filterPanelRef.current) {
      filterPanelRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  const toggleFilterPanel = useCallback(() => {
    setIsFilterPanelOpen((prev) => !prev);
  }, []);

  const handleShowAllDetails = useCallback(() => {
    if (!selectedCultivars.length) {
      return;
    }

    if (selectedCultivars.length === 1) {
      showRadar(selectedCultivars[0]);
      return;
    }

    setIsComparisonOpen(false);
    setIsComparisonDetailsOpen(true);
  }, [selectedCultivars, showRadar]);

  const closeComparisonDetails = useCallback(() => {
    setIsComparisonDetailsOpen(false);
  }, []);

  const handleResetEmptyState = useCallback(() => {
    if (similarityContext) {
      setSimilarityContext(null);
      return;
    }
    resetFilters();
  }, [resetFilters, similarityContext]);

  const handleResetAllFilters = useCallback(() => {
    setSimilarityContext(null);
    resetFilters();
  }, [resetFilters]);

  const activeFilterChips = useMemo(() => {
    const chips = [];
    filters.selectedWirkungen.forEach((wirkung) => {
      chips.push({
        key: `wirkung-${wirkung}`,
        label: wirkung,
        onRemove: () => {
          const next = new Set(filters.selectedWirkungen);
          next.delete(wirkung);
          dispatch({ type: "SET_WIRKUNG_VALUES", value: next });
        },
      });
    });
    filters.selectedTerpene.forEach((terpene) => {
      chips.push({
        key: `terpene-${terpene}`,
        label: terpene,
        onRemove: () => {
          const next = new Set(filters.selectedTerpene);
          next.delete(terpene);
          dispatch({ type: "SET_TERPENE_VALUES", value: next });
        },
      });
    });
    if (filters.typ) {
      chips.push({
        key: "typ",
        label: filters.typ,
        onRemove: () => dispatch({ type: "SET_TYP", value: "" }),
      });
    }
    if (filters.includeDiscontinued) {
      chips.push({
        key: "include-discontinued",
        label: "inkl. inaktive Sorten",
        onRemove: () => dispatch({ type: "TOGGLE_INCLUDE_DISC", value: false }),
      });
    }
    if (similarityContext?.referenceName) {
      chips.push({
        key: "similarity",
        label: `Ähnlichkeit: ${similarityContext.referenceName}`,
        onRemove: () => setSimilarityContext(null),
      });
    }
    return chips;
  }, [dispatch, filters, similarityContext]);

  // Rendern der Komponente
  return (
    <TerpeneContext.Provider value={terpeneContextValue}>
      <div className="container app-shell" style={containerStyle}>
        <header className="header" aria-label="App-Kopfzeile">
          <div className="header__surface header__surface--compact">
            <div className="header__content">
              <h1 className="appname">Kultivarfilter</h1>
              <p className="header__subtitle">
                Filtern Sie medizinische Cannabis-Kultivare nach Wirkzielen, THC/CBD-Profil und
                Terpenprofil. In Sekunden zur passenden Auswahl.
              </p>
              <div className="header__actions">
                <button type="button" className="header__cta" onClick={scrollToFilters}>
                  Filter anzeigen
                </button>
                <button type="button" className="secondary" onClick={scrollToTable}>
                  Zur Ergebnisliste
                </button>
              </div>
              <div className="header__meta header__meta--inline" role="list">
                <div
                  className="header__stat"
                  role="listitem"
                  aria-label={`${activeCultivarCount || "–"} aktive Kultivare erfasst`}
                >
                  <span className="header__stat-value">
                    {activeCultivarCount || "–"}
                  </span>
                  <span className="header__stat-label">Aktive Kultivare</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="content-stack app-layout">
          <aside
            className={`filters-panel${isFilterPanelOpen ? " is-open" : ""}`}
            ref={filterPanelRef}
          >
            <div className="filters-panel__header">
              <h2 className="filters-panel__title">Filter</h2>
              <button
                type="button"
                className="filters-panel__toggle"
                onClick={toggleFilterPanel}
                aria-expanded={isFilterPanelOpen}
              >
                {isFilterPanelOpen ? "Filter ausblenden" : "Filter anzeigen"}
              </button>
            </div>

            <div className="active-filters">
              <div className="active-filters__header">
                <p className="active-filters__title">Aktive Filter</p>
                <button type="button" className="active-filters__reset" onClick={handleResetAllFilters}>
                  Filter zurücksetzen
                </button>
              </div>
              {activeFilterChips.length ? (
                <div className="active-filters__chips">
                  {activeFilterChips.map((chip) => (
                    <button
                      key={chip.key}
                      type="button"
                      className="active-filter-chip"
                      onClick={chip.onRemove}
                    >
                      {chip.label} <span aria-hidden="true">×</span>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="active-filters__empty">Keine Filter aktiv.</p>
              )}
            </div>

            <div className="filters-panel__content">
              <details className="filter-entry">
                <summary className="filter-entry__summary">Typ</summary>
                <div className="filter-entry__content">
                  <TypFilter typ={filters.typ} dispatch={dispatch} typInfo={typInfo} />
                </div>
              </details>

              <details className="filter-entry">
                <summary className="filter-entry__summary">Ähnlichkeit</summary>
                <div className="filter-entry__content">
                  <StrainSimilarity
                    kultivare={kultivare}
                    onApplySimilar={handleApplySimilarity}
                    includeDiscontinued={filters.includeDiscontinued}
                  />
                </div>
              </details>

              <details className="filter-entry">
                <summary className="filter-entry__summary">Terpene</summary>
                <div className="filter-entry__content">
                  <FilterPanel
                    filters={filters}
                    dispatch={dispatch}
                    terpene={terpeneOptions}
                    wirkungen={availableWirkungen}
                    clearTerpene={clearTerpene}
                    clearWirkungen={clearWirkungen}
                    showWirkungen={false}
                  />
                </div>
              </details>

              <details className="filter-entry">
                <summary className="filter-entry__summary">Wirkungen</summary>
                <div className="filter-entry__content">
                  <FilterPanel
                    filters={filters}
                    dispatch={dispatch}
                    terpene={terpeneOptions}
                    wirkungen={availableWirkungen}
                    clearTerpene={clearTerpene}
                    clearWirkungen={clearWirkungen}
                    showTerpene={false}
                  />
                </div>
              </details>
            </div>
          </aside>

          <section className="results-panel">
            <div className="notice" role="note">
              <strong>Hinweis:</strong> Nur zur allgemeinen Information – keine medizinische Beratung.
            </div>

            {similarityContext && (
              <div className="similarity-banner" role="status" aria-live="polite">
                <strong>Hinweis:</strong> Es werden ähnliche Sorten zu{" "}
                <em>{similarityContext.referenceName || "der ausgewählten Sorte"}</em>{" "}
                angezeigt. Die Tabelle enthält dafür eine Spalte mit dem Übereinstimmungswert. Verwenden Sie „Ähnlichkeitssuche
                zurücksetzen“ (×), um zur gefilterten Ansicht zurückzukehren.
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
              <>
                <div className="comparison-toolbar" role="region" aria-label="Vergleichsauswahl">
                  <p className="comparison-toolbar__hint">
                    {selectedCultivars.length
                      ? `${selectedCultivars.length} Sorte${selectedCultivars.length > 1 ? "n" : ""} ausgewählt (max. ${MAX_COMPARISON_ITEMS})`
                      : "Wählen Sie mindestens zwei Sorten aus, um den Vergleich zu starten."}
                  </p>
                  <button
                    type="button"
                    className="primary"
                    onClick={openComparison}
                    disabled={!canOpenComparison}
                    aria-disabled={!canOpenComparison}
                  >
                    Vergleich starten
                  </button>
                </div>

                <StrainTable
                  strains={displayedKultivare}
                  showRadar={showRadar}
                  showTerpeneInfo={showTerpeneInfo}
                  onToggleSelect={toggleCultivarSelection}
                  selectedCultivars={selectedCultivars}
                  onResetEmptyState={handleResetEmptyState}
                  isSimilarityMode={Boolean(similarityContext)}
                  tableRef={tableSectionRef}
                />
              </>
            )}

            <div className="entourage-inline" role="region" aria-label="Information zum Entourage-Effekt">
              <div className="entourage-inline__copy">
                <p className="entourage-inline__eyebrow">Wissen</p>
                <p className="entourage-inline__title">Entourage-Effekt &amp; ECS kompakt</p>
                <p className="entourage-inline__hint">Kernpunkte zu Synergien, Mechanismen und Evidenz auf einen Blick.</p>
              </div>
              <button
                type="button"
                className="entourage-button"
                onClick={openEntourageModal}
                aria-haspopup="dialog"
                aria-expanded={isEntourageModalOpen}
                aria-label="Mehr zum Entourage-Effekt"
              >
                <span>Mehr</span>
              </button>
            </div>
          </section>
        </div>

        {radarDialog.open && (
          <Suspense fallback={<SuspenseOverlayFallback label="Radar wird geladen …" />}>
            <RadarModal radarDialog={radarDialog} hideRadar={hideRadar} />
          </Suspense>
        )}

        {terpeneDialog.open && (
          <Suspense fallback={<SuspenseOverlayFallback label="Terpen-Informationen werden geladen …" />}>
            <TerpeneInfoModal
              isOpen={terpeneDialog.open}
              cultivar={terpeneDialog.cultivar}
              activeTerpene={terpeneDialog.terpene}
              onClose={hideTerpeneInfo}
            />
          </Suspense>
        )}

        {isEntourageModalOpen && (
          <Suspense fallback={<SuspenseOverlayFallback label="Informationen werden geladen …" />}>
            <EntourageInfoModal isOpen={isEntourageModalOpen} onClose={closeEntourageModal} />
          </Suspense>
        )}

        {isComparisonOpen && (
          <Suspense fallback={<SuspenseOverlayFallback label="Vergleich wird geladen …" />}>
            <ComparisonPanel
              isOpen={isComparisonOpen}
              cultivars={selectedCultivars}
              onClose={closeComparison}
              onRequestAdd={handleAddMoreCultivars}
              onShowAllDetails={handleShowAllDetails}
              layoutMetrics={comparisonLayout}
            />
          </Suspense>
        )}
        {isComparisonDetailsOpen && (
          <Suspense fallback={<SuspenseOverlayFallback label="Detailansicht wird geladen …" />}>
            <ComparisonDetailsModal
              isOpen={isComparisonDetailsOpen}
              cultivars={selectedCultivars}
              onClose={closeComparisonDetails}
              layoutMetrics={comparisonLayout}
            />
          </Suspense>
        )}
      </div>
    </TerpeneContext.Provider>
  );
}
