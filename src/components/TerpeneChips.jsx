export default function TerpeneChips({ list = [], onInfo }) {
  if (!Array.isArray(list) || list.length === 0) return "N/A";
  return (
    <ul className="terp-list" aria-label="Terpenprofil">
      {list.map((t, idx) => (
        <li key={`${t}-${idx}`}>
          <button
            className="terp-chip"
            type="button"
            onClick={() => onInfo?.(t)}
            title={`Mehr Informationen zu ${t}`}
          >
            {t}
          </button>
        </li>
      ))}
    </ul>
  );
}
