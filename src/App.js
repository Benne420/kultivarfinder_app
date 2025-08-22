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
};

const terpene = [
  "Caryophyllen",
  "D-Limonen",
  "Farnesen",
  "Linalool",
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

  useEffect(() => {
    fetch("/kultivare.json")
      .then((response) => response.json())
      .then((data) => setKultivare(data))
      .catch((error) => console.error("Fehler beim Laden der Daten:", error));
  }, []);

  const toggleSelection = (
    setSelected,
    selectedSet,
    item,
    maxSelection = 2
  ) => {
    setSelected((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(item)) {
        newSet.delete(item);
      } else if (newSet.size < maxSelection) {
        newSet.add(item);
      }
      return newSet;
    });
  };

  const filteredKultivare = filterKultivare(
    kultivare,
    selectedWirkungen,
    selectedTerpene
  );

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
      // Fallback: versuche eine Alias-Zuordnung grob zu finden
      Object.values(terpenInfo).find((v) =>
        v.aliases?.includes(terpenDialog.name)
      ) ||
      null
    : null;

  return (
    <div className="container">
      {/* Inline-Ministyles für Chips & Modal (kann nach styles.css ausgelagert werden) */}
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
      `}</style>

      <h1>Cannabis-Kultivarfinder</h1>
      <p className="disclaimer">
        Die angegebenen medizinischen Wirkungen beziehen sich auf mögliche
        Effekte des dominantesten Terpens in der Blüte. Die Angaben sind
        lediglich ein Anhaltspunkt für die passende Produktauswahl durch das
        medizinische Fachpersonal und haben keinen Anspruch auf Vollständigkeit.
      </p>
      <p className="instruction">Wählen Sie bis zu zwei Terpene aus:</p>
      <div className="grid">
        {terpene.map((terpen) => (
          <Button
            key={terpen}
            onClick={() =>
              toggleSelection(setSelectedTerpene, selectedTerpene, terpen)
            }
          >
            {[...selectedTerpene].includes(terpen) ? `✓ ${terpen}` : terpen}
          </Button>
        ))}
      </div>
      <p className="instruction">Wählen Sie bis zu zwei Wirkungen aus:</p>
      <div className="grid">
        {wirkungen.map((wirkung) => (
          <Button
            key={wirkung}
            onClick={() =>
              toggleSelection(setSelectedWirkungen, selectedWirkungen, wirkung)
            }
          >
            {[...selectedWirkungen].includes(wirkung)
              ? `✓ ${wirkung}`
              : wirkung}
          </Button>
        ))}
      </div>
      <div className="table-container center-table">
        <Card>
          <CardContent>
            <h2>Passende Kultivare:</h2>
            {filteredKultivare.length > 0 ? (
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
                      <td className="hidden-sm">
                        {renderTerpenChips(strain.terpenprofil)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
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
              variieren je nach Charge &amp; Verarbeitung.
            </p>
          </>
        ) : null}
      </Modal>
    </div>
  );
}
