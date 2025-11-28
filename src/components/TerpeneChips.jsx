import { useId, useMemo } from "react";
import { sortTerpeneNames } from "../utils/helpers";

export default function TerpeneChips({ list = [], onInfo }) {
  const legendId = useId();
  const sortedList = useMemo(() => {
    if (!Array.isArray(list)) return [];
    return sortTerpeneNames(list.filter(Boolean));
  }, [list]);

  if (sortedList.length === 0) {
    return (
      <p className="terp-list__placeholder" role="status">
        Kein Terpenprofil hinterlegt. Die Angaben fehlen entweder im Datensatz
        oder wurden vom Hersteller nicht bereitgestellt. Mehr zur Datengrundlage
        erfahren Sie in der
        {" "}
        <a href="https://de.wikipedia.org/wiki/Terpene" rel="noreferrer" target="_blank">
          Übersicht zu Terpenen
        </a>
        .
      </p>
    );
  }

  return (
    <div className="terp-list__wrapper" aria-describedby={legendId}>
      <p id={legendId} className="terp-list__legend">
        Legende: kräftig markierte Chips stehen für dominantere Terpene, helle
        Chips für Begleitstoffe. Nutzen Sie die Schaltflächen, um Details
        aufzurufen.
      </p>
      <ul className="terp-list" aria-label="Terpenprofil">
        {sortedList.map((t, idx) => {
          const dominance = idx === 0 ? "dominant" : "supporting";
          return (
            <li key={`${t}-${idx}`}>
              <button
                className={`terp-chip terp-chip--${dominance}`}
                type="button"
                onClick={() => onInfo?.(t)}
                title={`Mehr Informationen zu ${t}`}
                aria-label={`${t} (${dominance === "dominant" ? "dominant" : "begleitend"})`}
              >
                <span className="terp-chip__badge" aria-hidden="true">
                  {dominance === "dominant" ? "★" : "•"}
                </span>
                <span className="terp-chip__label">{t}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
