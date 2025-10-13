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
const terpenInfo = {
  "β-Myrcen": {
    aliases: ["Myrcen"],
    description:
      "Monoterpen; häufigstes Terpen in Cannabisblüten vieler Kultivare. Typische Noten: erdig, krautig, moschusartig.",
  },
  "β-Caryophyllen": {
    aliases: ["Trans-Caryophyllen", "Caryophyllen"],
    description:
      "Sesquiterpen; pfeffrig-würzig. Bindet als einziger geläufiger Duftstoff direkt am CB2-Rezeptor (präklinische Evidenz).",
  },
  Caryophyllen: {
    aliases: ["β-Caryophyllen", "Trans-Caryophyllen"],
    description:
      "Würzig-pfeffrig; in schwarzem Pfeffer, Nelke. Häufiges Hauptterpen in vielen Kultivaren.",
  },
  "Trans-Caryophyllen": {
    aliases: ["β-Caryophyllen", "Caryophyllen"],
    description:
      "Geometrisches Isomer von Caryophyllen (trans). Charakteristisch pfeffrig-warm.",
  },
  "D-Limonen": {
    aliases: ["Limonen"],
    description:
      "Monoterpen; zitrusartig (Orange/Zitrone). Häufig in Schalen von Zitrusfrüchten.",
  },
  Terpinolen: {
    aliases: [],
    description:
      "Monoterpen; frisch, kiefernartig mit blumigen Noten. In Apfel, Teebaum, Kreuzkümmel beschrieben.",
  },
  "β-Ocimen": {
    aliases: ["Ocimen"],
    description:
      "Monoterpen; süß, krautig, leicht holzig. Variiert stark zwischen Kultivaren.",
  },
  "α-Humulen": {
    aliases: ["Humulen"],
    description:
      "Sesquiterpen; hopfig-herb (in Hopfen). Oft zusammen mit (β-)Caryophyllen zu finden.",
  },
  Farnesen: {
    aliases: [],
    description:
      "Sesquiterpen-Familie; grün-apfelig, in Apfel- und Hopfenaromen. Subtyp-abhängige Profile.",
  },
  Linalool: {
    aliases: [],
    description:
      "Monoterpenalkohol; blumig-lavendelartig. Weit verbreitet in Lavendel, Koriander, Basilikum.",
  },
  Selinen: {
    aliases: [
      "Selinene",
      "α‑Selinen",
      "β‑Selinen",
      "δ‑Selinen",
      "α-Selinene",
      "beta-Selinene",
      "delta-Selinene",
    ],
    description:
      "Sammelbegriff für isomere bicyclische Sesquiterpene (z. B. α‑, β‑, δ‑Selinen). Aroma: holzig, würzig, sellerie-/apiaceae-typisch. Berichtet u. a. in Selleriesamen‑, Muskat‑, Koriander‑ und Hopfenölen; in Cannabis meist in geringen Anteilen.",
  },
  "α‑Selinen": {
    aliases: ["α-Selinene", "alpha-Selinene", "α‑Selinene"],
    description:
      "Bicyclisches Sesquiterpen‑Isomer; holzig‑würzig, leicht hopfig. Vorkommen u. a. in Apiaceae (Sellerie, Petersilie) und Hopfen.",
  },
  "β‑Selinen": {
    aliases: ["β-Selinene", "beta-Selinene", "β‑Selinene"],
    description:
      "Isomeres Sesquiterpen mit sellerie-/krautiger Note; Anteile variieren je nach Herkunft und Verarbeitung.",
  },
  "δ‑Selinen": {
    aliases: ["δ-Selinene", "delta-Selinene", "δ‑Selinene"],
    description:
      "Weitere Selinen‑Variante; holzig‑krautig. In ätherischen Ölen verschiedener Gewürz‑ und Heilpflanzen beschrieben.",
  },
};

const typInfo = {
  Indica:
    "Ursprünglich für kompakt wachsende Pflanzen aus dem Hindukusch geprägt. Heute ist „Indica“ vor allem ein traditioneller Name ohne verlässliche Aussage über Wirkung oder Inhaltsstoffe.",
  "Indica-dominant":
    "Bezeichnung für Hybride mit überwiegend Indica-Merkmalen. Umgangssprachlich oft mit beruhigender Wirkung verbunden – wissenschaftlich aber nicht eindeutig belegt.",
  Sativa:
    "Historisch für hochwüchsige, schlanke Pflanzen aus tropischen Regionen verwendet. Der Begriff sagt nichts Sicheres über die chemische Zusammensetzung oder Wirkung aus.",
  "Sativa-dominant":
    "Hybride mit stärkerem Sativa-Einfluss. Im Narrativ oft als „aktivierend“ beschrieben – die tatsächliche Wirkung hängt jedoch von Cannabinoid- und Terpenprofilen ab.",
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

// Synonym‑Mapping für Wirkungen
const wirkungAliases = {
  antiinflammatorisch: "entzündungshemmend",
  antiphlogistisch: "entzündungshemmend",
  schmerzstillend: "analgetisch",
  schmerzlindernd: "analgetisch",
  stresslösend: "entspannend",
};

// Normalisiert eine Wirkung auf den kanonischen Namen
const normalizeWirkung = (w) => {
  const key = (w || "").toString().trim().toLowerCase();
  const normalized = wirkungAliases[key];
  return normalized || w;
};

// Hilfsfunktionen für Terpenalias
const getTerpenAliases = (name) => {
  const info = terpenInfo[name];
  if (!info) return [name];
  const list = [name, ...(info.aliases || [])];
  return Array.from(new Set(list));
};

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
        const kultivarNormalized = k.wirkungen.map((w) => normalizeWirkung(w));
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
  // Daten aus dem Backend laden
  const [kultivare, setKultivare] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("/kultivare.json");
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        setKultivare(data);
      } catch (err) {
        console.error("Fehler beim Laden der Daten:", err);
      }
    };
    fetchData();
  }, []);

  // useReducer für den Filterzustand
  const [filters, dispatch] = useReducer(filterReducer, initialFilterState);

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
  const renderTerpenChips = useCallback(
    (list) => {
      if (!Array.isArray(list) || list.length === 0) return "N/A";
      return (
        <div className="terp-list" role="list" aria-label="Terpenprofil">
          {list.map((t, idx) => (
            <button
              key={`${t}-${idx}`}
              className="terp-chip"
              onClick={() => openTerpenDialog(t)}
              title={`Mehr Informationen zu ${t}`}
            >
              {t}
            </button>
          ))}
        </div>
      );
    },
    [openTerpenDialog]
  );

  // Rendern der Komponente
  return (
    <div className="container">
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
      {/* Filter‑Bereich */}
      <div className="filters">
        {/* Terpenauswahl */}
        <div className="select-group">
          <h3>Terpene</h3>
          <div className="select-row">
            <select
              value={filters.terp1}
              onChange={(e) =>
                dispatch({ type: "SET_TERP1", value: e.target.value })
              }
            >
              <option value="">–</option>
              {optionsFor(terpene, filters.terp2).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={filters.terp2}
              onChange={(e) =>
                dispatch({ type: "SET_TERP2", value: e.target.value })
              }
            >
              <option value="">–</option>
              {optionsFor(terpene, filters.terp1).map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              className="reset-btn"
              onClick={clearTerpene}
              disabled={!filters.selectedTerpene.size}
            >
              ×
            </button>
          </div>
        </div>
        {/* Wirkungswahl */}
        <div className="select-group">
          <h3>Wirkungen</h3>
          <div className="select-row">
            <select
              value={filters.wirk1}
              onChange={(e) =>
                dispatch({ type: "SET_WIRK1", value: e.target.value })
              }
            >
              <option value="">–</option>
              {optionsFor(wirkungen, filters.wirk2).map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            <select
              value={filters.wirk2}
              onChange={(e) =>
                dispatch({ type: "SET_WIRK2", value: e.target.value })
              }
            >
              <option value="">–</option>
              {optionsFor(wirkungen, filters.wirk1).map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            <button
              className="reset-btn"
              onClick={clearWirkungen}
              disabled={!filters.selectedWirkungen.size}
            >
              ×
            </button>
          </div>
        </div>
        {/* Typauswahl */}
        <div className="typ-button-group">
          <h3>Typ</h3>
          <div className="typ-row">
            {Object.keys(typInfo).map((t) => (
              <button
                key={t}
                className={`typ-btn ${filters.typ === t ? "active" : ""}`}
                onClick={() =>
                  dispatch({
                    type: "SET_TYP",
                    value: filters.typ === t ? "" : t,
                  })
                }
              >
                {t}
              </button>
            ))}
          </div>
          <p style={{ fontSize: 12, color: "#546e7a", marginTop: 4 }}>
            {filters.typ ? typInfo[filters.typ] : ""}
          </p>
        </div>
        {/* Option zur Anzeige eingestellter Sorten */}
        <div style={{ textAlign: "center" }}>
          <label>
            <input
              type="checkbox"
              checked={filters.includeDiscontinued}
              onChange={(e) =>
                dispatch({
                  type: "TOGGLE_INCLUDE_DISC",
                  value: e.target.checked,
                })
              }
            />
            &nbsp;Eingestellte Sorten einbeziehen
          </label>
        </div>
      </div>
      {/* Ergebnis‑Tabelle */}
      <div className="table-container center-table">
        <Card>
          <CardContent>
            <h2>Passende Kultivare:</h2>
            {filteredKultivare.length > 0 ? (
              <div className="table-scroll">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Typ</th>
                      <th>THC %</th>
                      <th className="hidden-sm">CBD %</th>
                      <th className="hidden-sm">Terpengehalt %</th>
                      <th className="hidden-sm">Terpenprofil</th>
                      <th className="hidden-sm">Wirkungen</th>
                      <th>Diagramm</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKultivare.map((k) => (
                      <tr key={k.name}>
                        <td>
                          <button
                            onClick={() => {
                              const url = `/datenblaetter/${k.name.replace(
                                /\s+/g,
                                "_"
                              )}.pdf`;
                              window.open(url, "_blank", "noopener,noreferrer");
                            }}
                            className="link-button"
                          >
                            {k.name}
                          </button>
                        </td>
                        <td>{mapTyp(k.typ)}</td>
                        <td>
                          <span className="thc-values">{k.thc || "N/A"}</span>
                        </td>
                        <td className="hidden-sm">{k.cbd || "N/A"}</td>
                        <td className="hidden-sm">{k.terpengehalt || "N/A"}</td>
                        <td className="hidden-sm terpenprofil-cell">
                          {renderTerpenChips(k.terpenprofil)}
                        </td>
                        <td className="hidden-sm">
                          {Array.isArray(k.wirkungen)
                            ? k.wirkungen
                                .map((w) => normalizeWirkung(w))
                                .join(", ")
                            : "N/A"}
                        </td>
                        <td>
                          <button
                            className="link-button"
                            onClick={() => {
                              const url = radarPathSvg(k.name);
                              window.open(url, "_blank", "noopener,noreferrer");
                            }}
                          >
                            anzeigen
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>Keine passenden Kultivare gefunden.</p>
            )}
          </CardContent>
        </Card>
      </div>
      {/* Terpen-Informationsmodal */}
      {filters.terpenDialog.open && (
        <div
          className="modal-backdrop"
          onClick={closeTerpenDialog}
          role="dialog"
          aria-modal="true"
          aria-label={filters.terpenDialog.name}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button
              className="modal-close"
              onClick={closeTerpenDialog}
              aria-label="Dialog schließen"
            >
              ×
            </button>
            <h3 className="modal-title">{filters.terpenDialog.name}</h3>
            <div className="modal-content">
              {activeInfo ? (
                <>
                  <p>{activeInfo.description}</p>
                  {activeInfo.aliases && activeInfo.aliases.length > 0 && (
                    <p className="modal-meta">
                      Alias: {activeInfo.aliases.join(", ")}
                    </p>
                  )}
                </>
              ) : (
                <p>Keine weiteren Informationen vorhanden.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
