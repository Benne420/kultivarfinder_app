import { useState, useEffect } from "react";
import "@fontsource/montserrat";
import "./styles.css";

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

// --- Zusatz: Terpen-Wissensbasis für Tooltip/Modal ---
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
      "α‑Selinene",
      "β‑Selinene",
      "δ‑Selinene",
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

// Hilfsfunktionen für alias-sensitives Matching (z. B. Caryophyllen/β-Caryophyllen/Trans-Caryophyllen, Selinen-Isomere)
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

// Inaktive Datensätze robust ausfiltern
const isStatusIncluded = (k, includeDisc) => {
  var s = ((k && k.status) || "").toString().trim().toLowerCase();
  if (s === "active") return true;
  if (includeDisc && s === "discontinued") return true;
  return false;
};

// "Nicht mehr im Verkauf"/ausgelistet etc. ausfiltern

const mapTyp = (s) => {
  const t = (s || "").toString().trim().toLowerCase();
  if (t.indexOf("indica-domin") !== -1) return "indica-dominant";
  if (t.indexOf("sativa-domin") !== -1) return "sativa-dominant";
  if (t.indexOf("indica") !== -1) return "indica";
  if (t.indexOf("sativa") !== -1) return "sativa";
  return t;
};

const filterKultivare = (
  kultivare,
  selectedWirkungen,
  selectedTerpene,
  selectedTyp,
  includeDisc
) => {
  const targetTyp = mapTyp(selectedTyp);
  return kultivare
    .filter(function (k) {
      return isStatusIncluded(k, includeDisc);
    })
    .filter((kultivar) => {
      if (
        selectedTerpene.size &&
        !kultivarHasSelectedTerpene(kultivar, selectedTerpene)
      )
        return false;
      if (selectedWirkungen.size) {
        if (!Array.isArray(kultivar.wirkungen)) return false;
        if (
          ![...selectedWirkungen].every(
            (w) => kultivar.wirkungen.indexOf(w) !== -1
          )
        )
          return false;
      }
      if (targetTyp) {
        const kt = mapTyp(kultivar.typ);
        if (kt !== targetTyp) return false;
      }
      return true;
    });
};

// --- kleines, lib-freies Modal ---
const Modal = ({ open, onClose, title, children }) => {
  if (!open) return null;
  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button
          className="modal-close"
          onClick={onClose}
          aria-label="Dialog schließen"
        >
          ×
        </button>
        <h3 className="modal-title">{title}</h3>
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
};

export default function CannabisKultivarFinder() {
  const [selectedWirkungen, setSelectedWirkungen] = useState(new Set());
  const [selectedTerpene, setSelectedTerpene] = useState(new Set());
  const [kultivare, setKultivare] = useState([]);
  const [terpenDialog, setTerpenDialog] = useState({ open: false, name: null });

  // Neue Zustände für Dropdowns (je 2 Optionen)
  const [terp1, setTerp1] = useState("");
  const [terp2, setTerp2] = useState("");
  const [wirk1, setWirk1] = useState("");
  const [wirk2, setWirk2] = useState("");
  const [typ, setTyp] = useState("");
  const [includeDiscontinued, setIncludeDiscontinued] = useState(false);

  useEffect(() => {
    fetch("/kultivare.json")
      .then((response) => response.json())
      .then((data) => setKultivare(data))
      .catch((error) => console.error("Fehler beim Laden der Daten:", error));
  }, []);

  // Auswahl-Logik: Dropdowns => Sets
  useEffect(() => {
    setSelectedTerpene(new Set([terp1, terp2].filter(Boolean)));
  }, [terp1, terp2]);

  useEffect(() => {
    setSelectedWirkungen(new Set([wirk1, wirk2].filter(Boolean)));
  }, [wirk1, wirk2]);

  const filteredKultivare = filterKultivare(
    kultivare,
    selectedWirkungen,
    selectedTerpene,
    typ,
    includeDiscontinued
  );

  const clearTerpene = () => {
    setTerp1("");
    setTerp2("");
  };
  const clearWirkungen = () => {
    setWirk1("");
    setWirk2("");
  };

  const optionsFor = (items, exclude) =>
    items.filter((i) => !exclude || i !== exclude);

  const openTerpenDialog = (name) => setTerpenDialog({ open: true, name });
  const closeTerpenDialog = () => setTerpenDialog({ open: false, name: null });

  const renderTerpenChips = (list) => {
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
  };

  const activeInfo = terpenDialog.name
    ? terpenInfo[terpenDialog.name] ||
      Object.values(terpenInfo).find((v) =>
        v.aliases?.includes(terpenDialog.name)
      ) ||
      null
    : null;

  return (
    <div className="container">
      {/* Inline-Ministyles für Chips, Modal und Mobile-Dropdowns */}
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

        /* Typ Buttons + Tooltips (Desktop) */
        .typ-button-group { background: #ffffffcc; padding: 12px; border: 1px solid #e0e0e0; border-radius: 10px; text-align: center; }
        .typ-row { display: flex; flex-wrap: wrap; gap: 8px; align-items: center; justify-content: center; }
        .typ-btn { border: 1px solid #cfd8dc; border-radius: 9999px; padding: 8px 12px; cursor: pointer; background: #fff; font-size: 14px; line-height: 1; white-space: nowrap; }
        .typ-btn:hover { background: #f7faff; }
        .typ-btn.active { background: #e8f0fe; border-color: #90caf9; }
        .has-tooltip { position: relative; display: inline-block; }
        .tooltip { position: absolute; bottom: calc(100% + 8px); left: 50%; transform: translateX(-50%); background: #111; color: #fff; padding: 8px 10px; border-radius: 8px; font-size: 12px; line-height: 1.3; max-width: 320px; width: max-content; box-shadow: 0 6px 20px rgba(0,0,0,0.2); opacity: 0; visibility: hidden; transition: opacity .15s ease; pointer-events: none; z-index: 10; }
        .has-tooltip:hover .tooltip, .has-tooltip:focus-within .tooltip { opacity: 1; visibility: visible; }

        /* Standard: Dropdown für Typ ausblenden, Buttons zeigen */
        .typ-select { display: none; }

        .availability-toggle { display: flex; align-items: center; gap: 8px; }

        @media (max-width: 768px) {
          .select-row { grid-template-columns: 1fr; }
          /* Auf Mobile: Buttons ausblenden, Dropdown zeigen */
          .typ-button-group { display: none; }
          .typ-select { display: block; }
        }

        @media (max-width: 640px) {
          /* Spalten 3 (CBD) und 4 (Terpengehalt) ausblenden, Name/THC/Profil bleiben sichtbar */
          .table thead th:nth-child(3), .table tbody td:nth-child(3),
          .table thead th:nth-child(4), .table tbody td:nth-child(4) { display: none; }
        }
      `}</style>

      <h1>Cannabis-Kultivarfinder</h1>
      <p className="disclaimer">
        Die angegebenen medizinischen Wirkungen beziehen sich auf mögliche
        Effekte des dominantesten Terpens in der Blüte. Die Angaben sind
        lediglich ein Anhaltspunkt für die passende Produktauswahl durch das
        medizinische Fachpersonal und haben keinen Anspruch auf Vollständigkeit.
      </p>

      {/* Dropdown-Filter */}
      <div className="filters">
        <div className="select-group">
          <h3>Terpen-Auswahl (bis zu 2)</h3>
          <div className="select-row">
            <select
              value={terp1}
              onChange={(e) => setTerp1(e.target.value)}
              aria-label="Terpen Option 1"
            >
              <option value="">— Option 1 wählen —</option>
              {terpene.map((t) => (
                <option key={`t1-${t}`} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <select
              value={terp2}
              onChange={(e) => setTerp2(e.target.value)}
              aria-label="Terpen Option 2"
            >
              <option value="">— Option 2 wählen —</option>
              {optionsFor(terpene, terp1).map((t) => (
                <option key={`t2-${t}`} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              className="reset-btn"
              onClick={() => {
                setTerp1("");
                setTerp2("");
              }}
            >
              Zurücksetzen
            </button>
          </div>
        </div>

        <div className="select-group">
          <h3>Wirkungs-Auswahl (bis zu 2)</h3>
          <div className="select-row">
            <select
              value={wirk1}
              onChange={(e) => setWirk1(e.target.value)}
              aria-label="Wirkung Option 1"
            >
              <option value="">— Option 1 wählen —</option>
              {wirkungen.map((w) => (
                <option key={`w1-${w}`} value={w}>
                  {w}
                </option>
              ))}
            </select>
            <select
              value={wirk2}
              onChange={(e) => setWirk2(e.target.value)}
              aria-label="Wirkung Option 2"
            >
              <option value="">— Option 2 wählen —</option>
              {optionsFor(wirkungen, wirk1).map((w) => (
                <option key={`w2-${w}`} value={w}>
                  {w}
                </option>
              ))}
            </select>
            <button
              className="reset-btn"
              onClick={() => {
                setWirk1("");
                setWirk2("");
              }}
            >
              Zurücksetzen
            </button>
          </div>
        </div>

        {/* Typ: Buttons (Desktop) */}
        <div className="typ-button-group">
          <h3>Typ</h3>
          <div className="typ-row">
            {["Indica", "Indica-dominant", "Sativa", "Sativa-dominant"].map(
              (t) => (
                <span className="has-tooltip" key={`typbtn-${t}`}>
                  <button
                    type="button"
                    className={`typ-btn ${
                      mapTyp(typ) === mapTyp(t) ? "active" : ""
                    }`}
                    onClick={() => setTyp(mapTyp(typ) === mapTyp(t) ? "" : t)}
                    aria-describedby={`tt-${t}`}
                    title={typInfo[t]}
                  >
                    {mapTyp(typ) === mapTyp(t) ? `✓ ${t}` : t}
                  </button>
                  <span role="tooltip" id={`tt-${t}`} className="tooltip">
                    {typInfo[t]}
                  </span>
                </span>
              )
            )}
            <button className="reset-btn" onClick={() => setTyp("")}>
              Alle
            </button>
          </div>
        </div>

        {/* Typ: Fallback-Dropdown (Mobile) */}
        <div className="select-group typ-select">
          <h3>Typ</h3>
          <div className="select-row">
            <select
              value={typ}
              onChange={(e) => setTyp(e.target.value)}
              aria-label="Typ"
            >
              <option value="">— Alle Typen —</option>
              <option value="Indica">Indica</option>
              <option value="Indica-dominant">Indica-dominant</option>
              <option value="Sativa">Sativa</option>
              <option value="Sativa-dominant">Sativa-dominant</option>
            </select>
            <div></div>
            <button className="reset-btn" onClick={() => setTyp("")}>
              Zurücksetzen
            </button>
          </div>
        </div>

        {/* Verfügbarkeit */}
        <div className="select-group">
          <h3>Verfügbarkeit</h3>
          <label className="availability-toggle">
            <input
              type="checkbox"
              checked={includeDiscontinued}
              onChange={(e) => setIncludeDiscontinued(e.target.checked)}
            />
            <span>Nicht mehr im Verkauf befindliche Blüten anzeigen</span>
          </label>
        </div>
      </div>

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
                      <th>THC %</th>
                      <th className="hidden-sm">CBD %</th>
                      <th className="hidden-sm">Terpengehalt %</th>
                      <th className="hidden-sm">Terpenprofil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKultivare.map((strain) => (
                      <tr key={strain.name}>
                        <td>
                          <button
                            onClick={() =>
                              window.open(
                                `/datenblaetter/${strain.name.replace(
                                  /\s+/g,
                                  "_"
                                )}.pdf`,
                                "_blank"
                              )
                            }
                            className="link-button"
                          >
                            {strain.name}
                          </button>
                        </td>
                        <td>
                          <span className="thc-values">{strain.thc}</span>
                        </td>
                        <td className="hidden-sm">{strain.cbd}</td>
                        <td className="hidden-sm">
                          {strain.terpengehalt ? strain.terpengehalt : "N/A"}
                        </td>
                        <td className="hidden-sm terpenprofil-cell">
                          {renderTerpenChips(strain.terpenprofil)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="no-results">
                Bitte wählen Sie Wirkungen und/oder Terpene aus, um passende
                Kultivare zu sehen.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Terpen-Informationsdialog */}
      <Modal
        open={terpenDialog.open}
        onClose={closeTerpenDialog}
        title={terpenDialog.name || "Terpen"}
      >
        {terpenDialog.name ? (
          <>
            <p>
              <strong>Synonyme:</strong>{" "}
              {activeInfo?.aliases && activeInfo.aliases.length > 0
                ? activeInfo.aliases.join(", ")
                : "—"}
            </p>
            <p>
              {activeInfo?.description ||
                "Für dieses Terpen sind noch keine Detailinformationen hinterlegt."}
            </p>
            <p className="modal-meta">
              Hinweis: Kurzinfos, keine medizinische Beratung. Terpenprofile
              variieren je nach Charge & Verarbeitung.
            </p>
          </>
        ) : null}
      </Modal>
    </div>
  );
}
