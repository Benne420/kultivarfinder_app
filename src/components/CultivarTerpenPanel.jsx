import React, { useEffect, useMemo, useState } from 'react';
import { useTerpeneContext } from '../context/TerpeneContext';
import { mapTerpeneToCanonical } from '../utils/helpers';

const makeAnchorId = (value, fallback) => {
  const raw = (value || '').toString().trim();
  const normalized = raw
    .normalize('NFKD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/ß/gi, (match) => (match === 'ß' ? 'ss' : 'SS'))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  if (normalized) return `terpen-${normalized}`;
  return `terpen-${fallback}`;
};

const CultivarTerpenPanel = ({ cultivar }) => {
  const {
    terpenes: contextTerpenes,
    aliasLookup,
    references: contextReferences,
    loadReferences: ensureReferences,
  } = useTerpeneContext();
  const [terpenes, setTerpenes] = useState(() =>
    Array.isArray(contextTerpenes) ? contextTerpenes : []
  );
  const [references, setReferences] = useState(() =>
    Array.isArray(contextReferences) ? contextReferences : []
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDetails, setShowDetails] = useState(true);
  const [orderMode, setOrderMode] = useState('dataset');
  const cultivarName = cultivar?.name || 'Kultivar';

  const orderedProfile = useMemo(() => {
    if (!cultivar || !Array.isArray(cultivar.terpenprofil)) return [];

    const seen = new Set();

    return cultivar.terpenprofil
      .map((name) => mapTerpeneToCanonical(name, aliasLookup))
      .map((value) => (value || '').toString().trim())
      .filter((name) => {
        if (!name) return false;
        const key = name.toLowerCase();
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
  }, [aliasLookup, cultivar]);

  const sortedProfile = useMemo(() => {
    if (!orderedProfile.length) return [];

    return [...orderedProfile].sort((a, b) =>
      a.localeCompare(b, 'de', { sensitivity: 'base' })
    );
  }, [orderedProfile]);

  const displayProfile = orderMode === 'alpha' ? sortedProfile : orderedProfile;

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      if (!isMounted) {
        return;
      }

      if (Array.isArray(contextTerpenes)) {
        setTerpenes(contextTerpenes);
      }

      if (Array.isArray(contextReferences) && contextReferences.length > 0) {
        setReferences(contextReferences);
        setLoading(false);
        return;
      }

      if (typeof ensureReferences !== 'function') {
        setLoading(false);
        return;
      }

      setError(null);
      setLoading(true);

      try {
        const loadedReferences = await ensureReferences();
        if (!isMounted) {
          return;
        }
        setReferences(Array.isArray(loadedReferences) ? loadedReferences : []);
      } catch (err) {
        if (!isMounted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Unbekannter Fehler');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [contextTerpenes, contextReferences, ensureReferences]);

  const getTerpenInfo = (terpenName) => {
    if (!Array.isArray(terpenes)) return undefined;
    const canonical = mapTerpeneToCanonical(terpenName, aliasLookup);
    return (
      terpenes.find((t) => t.name === canonical) ||
      terpenes.find(
        (t) =>
          t.name === terpenName ||
          (Array.isArray(t.aliases) && t.aliases.includes(terpenName))
      )
    );
  };

  const getReferenceInfo = (refId) => {
    if (!Array.isArray(references)) return undefined;
    return references.find((r) => r.id === refId);
  };

  const formatReference = (ref) => {
    if (!ref) return 'Unbekannte Quelle';
    return `${ref.authors} (${ref.year}). ${ref.title}. ${ref.journal}`;
  };

  if (loading) {
    return (
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <p>Lade Terpen-Informationen...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '16px', textAlign: 'center', color: '#d32f2f' }}>
        <p>Fehler beim Laden der Terpen-Daten: {error}</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      <h3
        style={{ marginTop: 0, marginBottom: '12px', fontSize: '18px' }}
        id="terpen-panel-heading"
      >
        Terpen-Wirkungen für {cultivarName}
      </h3>

      <div className="terpen-panel__meta" aria-describedby="terpen-panel-legend">
        <p id="terpen-panel-legend" className="terpen-panel__legend">
          Nutzen Sie die Navigation, um direkt zu einzelnen Terpenen zu springen.
          Die Kurzfassung blendet Tabellen mit Quellenangaben aus. Standardmäßig
          bleibt die Reihenfolge wie im Datensatz erhalten; bei Bedarf können Sie
          auf eine alphabetische Ansicht wechseln.
        </p>
        <div className="terpen-panel__controls">
          <div className="terpen-panel__control-group">
            <nav aria-label="Terpen-Navigation" className="terpen-panel__nav">
              <span className="terpen-panel__nav-label">Schnellwahl:</span>
              <ul>
                {displayProfile.map((name, index) => (
                  <li key={name || index}>
                    <a href={`#${makeAnchorId(name, index)}`}>
                      {name || `Terpen ${index + 1}`}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
            <div
              className="terpen-panel__ordering"
              role="group"
              aria-label="Reihenfolge des Terpenprofils"
            >
              <span className="terpen-panel__nav-label">Reihenfolge:</span>
              <button
                type="button"
                className={`terpen-panel__ordering-btn${orderMode === 'dataset' ? ' is-active' : ''}`}
                aria-pressed={orderMode === 'dataset'}
                onClick={() => setOrderMode('dataset')}
              >
                Datensatz
              </button>
              <button
                type="button"
                className={`terpen-panel__ordering-btn${orderMode === 'alpha' ? ' is-active' : ''}`}
                aria-pressed={orderMode === 'alpha'}
                onClick={() => setOrderMode('alpha')}
              >
                Alphabetisch
              </button>
            </div>
          </div>
          <button
            type="button"
            className="terpen-panel__toggle"
            aria-pressed={showDetails}
            onClick={() => setShowDetails((prev) => !prev)}
          >
            {showDetails ? 'Kurzfassung anzeigen' : 'Details einblenden'}
          </button>
        </div>
      </div>

      {displayProfile.length > 0 && (
        <div className="terpen-panel__overview" role="list">
          {displayProfile.map((name, index) => {
            const sectionId = makeAnchorId(name, index);
            const rank = index === 0 ? 'dominant' : 'begleitend';
            const icon = index === 0 ? '🔥' : '🌿';
            return (
              <div
                key={sectionId}
                className={`terpen-panel__overview-chip terpen-panel__overview-chip--${rank}`}
                role="listitem"
              >
                <div className="terpen-panel__overview-icon" aria-hidden="true">
                  {icon}
                </div>
                <div className="terpen-panel__overview-body">
                  <div className="terpen-panel__overview-title">{name}</div>
                  <div className="terpen-panel__overview-meta">
                    {rank === 'dominant' ? 'Dominant' : 'Begleitend'} ·{' '}
                    <a href={`#${sectionId}`}>zum Abschnitt springen</a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div style={{ marginBottom: '16px', fontSize: '12px', color: '#666' }}>
        <p style={{ margin: 0, fontStyle: 'italic' }}>
          <strong>Hinweis:</strong> Die hier aufgeführten Wirkungen stammen überwiegend aus
          präklinischen Untersuchungen und sind nicht klinisch belegt. Die Inhalte sind keine
          medizinische Beratung; wenden Sie sich für individuelle Einschätzungen an
          medizinisches Fachpersonal.
        </p>
      </div>

      {displayProfile.map((terpenName, index) => {
        const terpenInfo = getTerpenInfo(terpenName);
        const sectionId = makeAnchorId(terpenName, index);

        if (!terpenInfo) {
          return (
            <div
              id={sectionId}
              key={index}
              style={{
                marginBottom: '12px',
                padding: '12px',
                border: '1px solid #e0e0e0',
                borderRadius: '8px'
              }}
            >
              <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
                {terpenName}
              </h4>
              <p style={{ margin: 0, color: '#666' }}>
                Keine detaillierten Informationen verfügbar.
              </p>
            </div>
          );
        }

        return (
          <div
            id={sectionId}
            key={index}
            style={{
              marginBottom: '16px',
              padding: '12px',
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              backgroundColor: '#fafafa'
            }}
          >
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
              {terpenInfo.name}
            </h4>

            <p
              style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333' }}
              className={!showDetails ? 'terpen-panel__summary' : ''}
            >
              {terpenInfo.description}
            </p>

            <div style={{ marginBottom: '8px' }}>
              <strong>Aroma:</strong> {terpenInfo.aroma}
            </div>

            {showDetails && typeof terpenInfo.boilingPoint === 'string' &&
              terpenInfo.boilingPoint.trim().length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <strong>Siedepunkt:</strong> {terpenInfo.boilingPoint}
                </div>
            )}

            {showDetails && terpenInfo.effects && terpenInfo.effects.length > 0 && (
              <div>
                <strong style={{ display: 'block', marginBottom: '8px' }}>
                  Berichtete Wirkungen:
                </strong>
                <ul style={{ margin: 0, paddingLeft: '20px' }}>
                  {terpenInfo.effects.map((effect, effectIndex) => (
                    <li key={effectIndex} style={{ marginBottom: '4px' }}>
                      <strong>{effect.effect}</strong> ({effect.strength})
                      {effect.sources && effect.sources.length > 0 && (
                        <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>
                          Quellen: {effect.sources.map((sourceId, sourceIndex) => {
                            const ref = getReferenceInfo(sourceId);
                            return (
                              <span key={sourceIndex}>
                                {sourceIndex > 0 && ', '}
                                <span title={formatReference(ref)}>
                                  {ref ? `${ref.authors} (${ref.year})` : sourceId}
                                </span>
                              </span>
                            );
                          })}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        );
      })}

      <div
        style={{
          marginTop: '20px',
          padding: '12px',
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          fontSize: '12px',
          color: '#1565c0'
        }}
      >
        <strong>Entourage-Effekt:</strong> Hinweise auf mögliche Wechselwirkungen zwischen
        Terpenen und Cannabinoiden stammen vor allem aus Labor- und Tiermodellen. Eine
        klinische Evidenz für synergistische Wirkungen liegt aktuell nicht vor, daher
        lassen sich keine Aussagen zur Wirksamkeit bei Patienten ableiten.
      </div>
    </div>
  );
};

export default CultivarTerpenPanel;
