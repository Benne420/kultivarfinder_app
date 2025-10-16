import React from 'react';
import Button from './Button';

/**
 * Filter section component for terpene and effect selection
 * @param {Object} props - Component props
 * @param {Array} props.terpeneOptions - Available terpene options
 * @param {Array} props.effectOptions - Available effect options
 * @param {string} props.selectedTerpene1 - First selected terpene
 * @param {string} props.selectedTerpene2 - Second selected terpene
 * @param {string} props.selectedEffect1 - First selected effect
 * @param {string} props.selectedEffect2 - Second selected effect
 * @param {Function} props.onTerpene1Change - Handler for terpene 1 change
 * @param {Function} props.onTerpene2Change - Handler for terpene 2 change
 * @param {Function} props.onEffect1Change - Handler for effect 1 change
 * @param {Function} props.onEffect2Change - Handler for effect 2 change
 * @param {Function} props.onClearTerpenes - Handler for clearing terpene selection
 * @param {Function} props.onClearEffects - Handler for clearing effect selection
 * @param {Function} props.getFilteredOptions - Function to get filtered options
 * @returns {JSX.Element} FilterSection component
 */
const FilterSection = ({
  terpeneOptions,
  effectOptions,
  selectedTerpene1,
  selectedTerpene2,
  selectedEffect1,
  selectedEffect2,
  onTerpene1Change,
  onTerpene2Change,
  onEffect1Change,
  onEffect2Change,
  onClearTerpenes,
  onClearEffects,
  getFilteredOptions,
}) => {
  return (
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
            value={selectedTerpene1}
            onChange={(event) => onTerpene1Change(event.target.value)}
          >
            <option value="">— Option 1 wählen —</option>
            {terpeneOptions.map((terpene) => (
              <option key={`t1-${terpene}`} value={terpene}>
                {terpene}
              </option>
            ))}
          </select>

          <label className="visually-hidden" htmlFor="terp2-select">
            Terpen Option 2
          </label>
          <select
            id="terp2-select"
            value={selectedTerpene2}
            onChange={(event) => onTerpene2Change(event.target.value)}
          >
            <option value="">— Option 2 wählen —</option>
            {getFilteredOptions(terpeneOptions, selectedTerpene1).map((terpene) => (
              <option key={`t2-${terpene}`} value={terpene}>
                {terpene}
              </option>
            ))}
          </select>
          <Button
            onClick={onClearTerpenes}
            ariaLabel="Terpen-Auswahl zurücksetzen"
            className="reset-btn"
          >
            Zurücksetzen
          </Button>
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
            value={selectedEffect1}
            onChange={(event) => onEffect1Change(event.target.value)}
          >
            <option value="">— Option 1 wählen —</option>
            {effectOptions.map((effect) => (
              <option key={`w1-${effect}`} value={effect}>
                {effect}
              </option>
            ))}
          </select>

          <label className="visually-hidden" htmlFor="wirk2-select">
            Wirkung Option 2
          </label>
          <select
            id="wirk2-select"
            value={selectedEffect2}
            onChange={(event) => onEffect2Change(event.target.value)}
          >
            <option value="">— Option 2 wählen —</option>
            {getFilteredOptions(effectOptions, selectedEffect1).map((effect) => (
              <option key={`w2-${effect}`} value={effect}>
                {effect}
              </option>
            ))}
          </select>
          <Button
            onClick={onClearEffects}
            ariaLabel="Wirkungs-Auswahl zurücksetzen"
            className="reset-btn"
          >
            Zurücksetzen
          </Button>
        </div>
      </fieldset>
    </div>
  );
};

export default FilterSection;