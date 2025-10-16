import { useState, useEffect, useMemo, useRef } from "react";
import "@fontsource/montserrat/400.css";
import "@fontsource/montserrat/700.css";
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
};

const filterKultivare = (kultivare, selectedWirkungen, selectedTerpene) => {
  return kultivare.filter(
    (kultivar) =>
      [...selectedTerpene].every((terpen) =>
        kultivar.terpenprofil.includes(terpen)
      ) &&
      [...selectedWirkungen].every((wirkung) =>
        kultivar.wirkungen.includes(wirkung)
      )
  );
};

// PDF-Dateinamen robust aus dem Sortennamen ableiten (inkl. Ausnahmen)
const getPdfFileForName = (name) => {
  const exceptions = {
    "MAC 1": "MAC1.pdf",
    "Tropicanna Cookies": "Tropicana_Cookies.pdf",
  };
  if (exceptions[name]) return exceptions[name];
  return `${name.replace(/\s+/g, "_")}.pdf`;
};

// --- kleines, lib-freies, zugängliches Modal ---
const Modal = ({ open, onClose, title, children }) => {
  const dialogRef = useRef(null);
  const closeBtnRef = useRef(null);
  const previouslyFocusedRef = useRef(null);

  useEffect(() => {
    if (open) {
      previouslyFocusedRef.current =
        document.activeElement instanceof HTMLElement
          ? document.activeElement
          : null;
      // Fokus in den Dialog setzen
      const timer = setTimeout(() => {
        closeBtnRef.current?.focus();
      }, 0);
      return () => clearTimeout(timer);
    } else if (previouslyFocusedRef.current) {
      // Fokus zurücksetzen
      previouslyFocusedRef.current.focus();
      previouslyFocusedRef.current = null;
    }
  }, [open]);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key === "Tab") {
      const root = dialogRef.current;
      if (!root) return;
      const focusable = root.querySelectorAll(
        'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      const isShift = e.shiftKey;
      if (!isShift && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (isShift && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    }
  };

  if (!open) return null;
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="terpen-dialog-title"
        aria-describedby="terpen-dialog-desc"
        id="terpen-info-dialog"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <button
          ref={closeBtnRef}
          className="modal-close"
          onClick={onClose}
          type="button"
          aria-label="Dialog schließen"
        >
          ×
        </button>
        <h3 className="modal-title" id="terpen-dialog-title">{title}</h3>
        <div className="modal-content" id="terpen-dialog-desc">{children}</div>
      </div>
    </div>
  );
};

export default function CannabisKultivarFinder() {
  const [selectedWirkungen, setSelectedWirkungen] = useState(new Set());
  const [selectedTerpene, setSelectedTerpene] = useState(new Set());
  const [kultivare, setKultivare] = useState([]);
  const [terpenDialog, setTerpenDialog] = useState({ open: false, name: null });
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  // Neue Zustände für Dropdowns (je 2 Optionen)
  const [terp1, setTerp1] = useState("");
  const [terp2, setTerp2] = useState("");
  const [wirk1, setWirk1] = useState("");
  const [wirk2, setWirk2] = useState("");

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

  // Optionen aus Daten ableiten (verhindert Inkonsistenzen)
  const terpeneOptions = useMemo(() => {
    const all = new Set();
    for (const item of kultivare) {
      if (Array.isArray(item.terpenprofil)) {
        for (const t of item.terpenprofil) all.add(t);
      }
    }
    return Array.from(all).sort((a, b) => a.localeCompare(b));
  }, [kultivare]);

  const wirkungOptions = useMemo(() => {
    const all = new Set();
    for (const item of kultivare) {
      if (Array.isArray(item.wirkungen)) {
        for (const w of item.wirkungen) all.add(w);
      }
    }
    return Array.from(all).sort((a, b) => a.localeCompare(b));
  }, [kultivare]);

  // Auswahl-Logik: Dropdowns => Sets
  useEffect(() => {
    setSelectedTerpene(new Set([terp1, terp2].filter(Boolean)));
  }, [terp1, terp2]);

  useEffect(() => {
    setSelectedWirkungen(new Set([wirk1, wirk2].filter(Boolean)));
  }, [wirk1, wirk2]);

  const filteredKultivare = useMemo(
    () => filterKultivare(kultivare, selectedWirkungen, selectedTerpene),
    [kultivare, selectedWirkungen, selectedTerpene]
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
      <ul className="terp-list" aria-label="Terpenprofil Liste">
        {list.map((t, idx) => (
          <li key={`${t}-${idx}`} className="terp-item">
            <button
              className="terp-chip"
              onClick={() => openTerpenDialog(t)}
              type="button"
              title={`Mehr Informationen zu ${t}`}
              aria-haspopup="dialog"
              aria-controls="terpen-info-dialog"
            >
              {t}
            </button>
          </li>
        ))}
      </ul>
    );
  };

  const activeInfo = terpenDialog.name
    ? terpenInfo[terpenDialog.name] ||
      Object.values(terpenInfo).find((v) =>
        v.aliases?.includes(terpenDialog.name)
      ) ||
      null
    : null;

  const resultsCount = filteredKultivare.length;

  return (
    <main
      className="container"
      id="main-content"
      aria-hidden={terpenDialog.open || undefined}
      inert={terpenDialog.open || undefined}
      tabIndex={-1}
    >

      <h1>Cannabis-Kultivarfinder</h1>
      <p className="disclaimer">
        Die angegebenen medizinischen Wirkungen beziehen sich auf mögliche
        Effekte des dominantesten Terpens in der Blüte. Die Angaben sind
        lediglich ein Anhaltspunkt für die passende Produktauswahl durch das
        medizinische Fachpersonal und haben keinen Anspruch auf Vollständigkeit.
      </p>

      {/* Dropdown-Filter */}
      <div className="filters" role="region" aria-labelledby="filters-heading">
        <h2 id="filters-heading" className="visually-hidden">
          Filter auswählen
        </h2>

        <fieldset className="select-group" aria-labelledby="terpen-legend">
          <legend id="terpen-legend">Terpen-Auswahl (bis zu 2)</legend>
          <div className="select-row">
            <label className="visually-hidden" htmlFor="terp1-select">
              Terpen Option 1
            </label>
            <select
              id="terp1-select"
              value={terp1}
              onChange={(e) => setTerp1(e.target.value)}
            >
              <option value="">— Option 1 wählen —</option>
              {terpeneOptions.map((t) => (
                <option key={`t1-${t}`} value={t}>
                  {t}
                </option>
              ))}
            </select>

            <label className="visually-hidden" htmlFor="terp2-select">
              Terpen Option 2
            </label>
            <select
              id="terp2-select"
              value={terp2}
              onChange={(e) => setTerp2(e.target.value)}
            >
              <option value="">— Option 2 wählen —</option>
              {optionsFor(terpeneOptions, terp1).map((t) => (
                <option key={`t2-${t}`} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <button
              className="reset-btn"
              onClick={clearTerpene}
              type="button"
              aria-label="Terpen-Auswahl zurücksetzen"
            >
              Zurücksetzen
            </button>
          </div>
        </fieldset>

        <fieldset className="select-group" aria-labelledby="wirkung-legend">
          <legend id="wirkung-legend">Wirkungs-Auswahl (bis zu 2)</legend>
          <div className="select-row">
            <label className="visually-hidden" htmlFor="wirk1-select">
              Wirkung Option 1
            </label>
            <select
              id="wirk1-select"
              value={wirk1}
              onChange={(e) => setWirk1(e.target.value)}
            >
              <option value="">— Option 1 wählen —</option>
              {wirkungOptions.map((w) => (
                <option key={`w1-${w}`} value={w}>
                  {w}
                </option>
              ))}
            </select>

            <label className="visually-hidden" htmlFor="wirk2-select">
              Wirkung Option 2
            </label>
            <select
              id="wirk2-select"
              value={wirk2}
              onChange={(e) => setWirk2(e.target.value)}
            >
              <option value="">— Option 2 wählen —</option>
              {optionsFor(wirkungOptions, wirk1).map((w) => (
                <option key={`w2-${w}`} value={w}>
                  {w}
                </option>
              ))}
            </select>
            <button
              className="reset-btn"
              onClick={clearWirkungen}
              type="button"
              aria-label="Wirkungs-Auswahl zurücksetzen"
            >
              Zurücksetzen
            </button>
          </div>
        </fieldset>
      </div>

      <div className="table-container center-table">
        <Card>
          <CardContent>
            <h2>Passende Kultivare:</h2>
            {loadError ? (
              <p role="alert" className="error-message">
                {loadError}
              </p>
            ) : (
              <p
                className="results-count"
                role="status"
                aria-live="polite"
                aria-busy={isLoading}
              >
                {isLoading
                  ? "Laden…"
                  : `${resultsCount} passende Kultivare gefunden.`}
              </p>
            )}
            {!isLoading && filteredKultivare.length > 0 ? (
              <div className="table-scroll">
                <table className="table">
                  <caption className="visually-hidden">
                    Tabelle der passenden Kultivare mit THC, CBD, Terpengehalt und Terpenprofil
                  </caption>
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">THC %</th>
                      <th className="hidden-sm" scope="col">CBD %</th>
                      <th className="hidden-sm" scope="col">Terpengehalt %</th>
                      <th className="hidden-sm" scope="col">Terpenprofil</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredKultivare.map((strain) => (
                      <tr key={strain.name}>
                        <th scope="row">
                          <a
                            href={encodeURI(
                              `/datenblaetter/${getPdfFileForName(strain.name)}`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="link-button"
                            aria-label={`Datenblatt für ${strain.name} in neuem Tab öffnen`}
                            title={`Datenblatt für ${strain.name} öffnen`}
                          >
                            {strain.name}
                            <span className="visually-hidden">
                              (öffnet in neuem Tab)
                            </span>
                          </a>
                        </th>
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
              <p className="no-results" role="status" aria-live="polite">
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
    </main>
  );
}
