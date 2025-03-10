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

const wirkungen = [
  "analgetisch", "angstlösend", "antimikrobiell", "antimykotisch",
  "antioxidativ", "entspannend", "entzündungshemmend", "krampflösend",
  "neuroprotektiv", "unterstützt Wundheilung"
];

const terpene = [
  "Caryophyllen", "D-Limonen", "β-Myrcen", "Linalool", "Humulen",
  "Farnesen", "α-Bisabolol", "Guaiol"
];

const filterKultivare = (kultivare, selectedWirkungen, selectedTerpene) => {
  return kultivare.filter((kultivar) =>
    [...selectedWirkungen].every((wirkung) => kultivar.wirkungen.includes(wirkung)) &&
    [...selectedTerpene].every((terpen) => kultivar.terpenprofil.includes(terpen))
  );
};

export default function CannabisKultivarFinder() {
  const [selectedWirkungen, setSelectedWirkungen] = useState(new Set());
  const [selectedTerpene, setSelectedTerpene] = useState(new Set());
  const [kultivare, setKultivare] = useState([]);
  const [quellen, setQuellen] = useState([]);

  useEffect(() => {
    fetch("/kultivare.json")
      .then((response) => response.json())
      .then((data) => setKultivare(data))
      .catch((error) => console.error("Fehler beim Laden der Daten:", error));

    fetch("/quellen.json")
      .then((response) => response.json())
      .then((data) => setQuellen(data))
      .catch((error) => console.error("Fehler beim Laden der Quellen:", error));
  }, []);

  const toggleSelection = (setSelected, selectedSet, item, maxSelection = 2) => {
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

  const filteredKultivare = filterKultivare(kultivare, selectedWirkungen, selectedTerpene);

  return (
    <div className="container">
      <h1>Cannabis-Kultivarfinder</h1>
      <p className="disclaimer">
        Die angegebenen medizinischen Wirkungen beziehen sich auf mögliche
        Effekte des dominantesten Terpens in der Blüte. Die Angaben sind
        lediglich ein Anhaltspunkt für die passende Produktauswahl durch das
        medizinische Fachpersonal und haben keinen Anspruch auf Vollständigkeit.
      </p>
      <p className="instruction">Wählen Sie bis zu zwei Wirkungen aus:</p>
      <div className="grid">
        {wirkungen.map((wirkung) => (
          <Button key={wirkung} onClick={() => toggleSelection(setSelectedWirkungen, selectedWirkungen, wirkung)}>
            {[...selectedWirkungen].includes(wirkung) ? `✓ ${wirkung}` : wirkung}
          </Button>
        ))}
      </div>
      <p className="instruction">Wählen Sie bis zu zwei Terpene aus:</p>
      <div className="grid">
        {terpene.map((terpen) => (
          <Button key={terpen} onClick={() => toggleSelection(setSelectedTerpene, selectedTerpene, terpen)}>
            {[...selectedTerpene].includes(terpen) ? `✓ ${terpen}` : terpen}
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
                  </tr>
                </thead>
                <tbody>
                  {filteredKultivare.map((strain) => (
                    <tr key={strain.name}>
                      <td>
                        <button
                          onClick={() => window.open(
                            `/datenblaetter/${strain.name.replace(/\s+/g, "_")}.pdf`, "_blank"
                          )}
                          className="link-button"
                        >
                          {strain.name}
                        </button>
                      </td>
                      <td>
                        <span className="thc-values">{strain.thc}</span>
                      </td>
                      <td className="hidden-sm">{strain.cbd}</td>
                      <td className="hidden-sm">{strain.terpen}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="no-results">
                Bitte wählen Sie Wirkungen und/oder Terpene aus, um passende Kultivare zu sehen.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
