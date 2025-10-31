import React from "react";
import TypInfoDialog from "./TypInfoDialog";

export default function TypFilter({ typ, dispatch, typInfo }) {
  const [isInfoOpen, setIsInfoOpen] = React.useState(false);
  const dialogId = "typ-info-dialog";

  const handleToggle = (value) => {
    dispatch({ type: "SET_TYP", value: typ === value ? "" : value });
  };

  const handleOpenInfo = () => setIsInfoOpen(true);
  const handleCloseInfo = () => setIsInfoOpen(false);

  return (
    <div className="typ-button-group">
      <h3>Typ</h3>
      <div className="typ-row">
        {Object.keys(typInfo)
          .filter((t) => !/^\s*(indica|sativa)\s*$/i.test(t))
          .map((t) => (
            <button
              key={t}
              type="button"
              className={`typ-btn ${typ === t ? "active" : ""}`}
              onClick={() => handleToggle(t)}
            >
              {t}
            </button>
          ))}
      </div>
      {typ ? <p className="typ-description">{typInfo[typ]}</p> : null}
      <div className="typ-info">
        <button
          type="button"
          className="typ-info-button"
          onClick={handleOpenInfo}
          aria-haspopup="dialog"
          aria-controls={dialogId}
        >
          <span className="typ-info-button__icon" aria-hidden="true">
            ℹ️
          </span>
          <span className="typ-info-button__label">Mehr zu Indica / Sativa</span>
        </button>
      </div>
      <TypInfoDialog open={isInfoOpen} onClose={handleCloseInfo} dialogId={dialogId} />
    </div>
  );
}
