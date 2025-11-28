import { useMemo } from "react";

export default function TerpeneChips({ list = [], onInfo, describedBy }) {
  const orderedList = useMemo(() => {
    if (!Array.isArray(list)) return [];

    const seen = new Set();
    return list
      .map((value) => (value || "").toString().trim())
      .filter((name) => {
        if (!name) return false;
        const key = name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [list]);

  if (orderedList.length === 0) {
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
    <div className="terp-list__wrapper" aria-describedby={describedBy}>
      <ul className="terp-list" aria-label="Terpenprofil">
        {orderedList.map((t, idx) => {
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
