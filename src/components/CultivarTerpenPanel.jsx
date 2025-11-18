import React, { useState, useEffect } from 'react';
import { useTerpeneContext } from '../context/TerpeneContext';
import { mapTerpeneToCanonical } from '../utils/helpers';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        let terpenesData = contextTerpenes;
        if (!Array.isArray(terpenesData) || terpenesData.length === 0) {
          const terpenesRes = await fetch('/data/terpenes.json');
          if (!terpenesRes.ok) {
            throw new Error(`Terpen-Daten HTTP ${terpenesRes.status}`);
          }
          terpenesData = await terpenesRes.json();
        }

        let referencesData = contextReferences;
        if (!Array.isArray(referencesData) || referencesData.length === 0) {
          if (typeof ensureReferences === 'function') {
            referencesData = await ensureReferences();
          } else {
            const referencesRes = await fetch('/data/references.json');
            if (!referencesRes.ok) {
              throw new Error(`Referenz-Daten HTTP ${referencesRes.status}`);
            }
            referencesData = await referencesRes.json();
          }
        }

        if (!isMounted) return;
        setTerpenes(Array.isArray(terpenesData) ? terpenesData : []);
        setReferences(Array.isArray(referencesData) ? referencesData : []);
      } catch (err) {
        if (!isMounted) return;
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

  if (!cultivar || !Array.isArray(cultivar.terpenprofil)) {
    return (
      <div style={{ padding: '16px' }}>
        <p>Kein Terpenprofil verfügbar.</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '16px' }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px', fontSize: '18px' }}>
        Terpen-Wirkungen für {cultivar.name}
      </h3>
      
      <div style={{ marginBottom: '16px', fontSize: '12px', color: '#666' }}>
        <p style={{ margin: 0, fontStyle: 'italic' }}>
          <strong>Hinweis:</strong> Die hier aufgeführten Wirkungen basieren auf präklinischen Studien 
          und sind nicht als medizinische Beratung zu verstehen. Konsultieren Sie vor der Anwendung 
          einen Arzt oder Apotheker.
        </p>
      </div>

      {cultivar.terpenprofil.map((terpenName, index) => {
        const terpenInfo = getTerpenInfo(terpenName);
        
        if (!terpenInfo) {
          return (
            <div key={index} style={{ 
              marginBottom: '12px', 
              padding: '12px', 
              border: '1px solid #e0e0e0', 
              borderRadius: '8px' 
            }}>
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
          <div key={index} style={{ 
            marginBottom: '16px', 
            padding: '12px', 
            border: '1px solid #e0e0e0', 
            borderRadius: '8px',
            backgroundColor: '#fafafa'
          }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>
              {terpenInfo.name}
            </h4>
            
            <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#333' }}>
              {terpenInfo.description}
            </p>
            
            <div style={{ marginBottom: '8px' }}>
              <strong>Aroma:</strong> {terpenInfo.aroma}
            </div>
            
            {typeof terpenInfo.boilingPoint === 'string' &&
              terpenInfo.boilingPoint.trim().length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <strong>Siedepunkt:</strong> {terpenInfo.boilingPoint}
                </div>
            )}

            {terpenInfo.effects && terpenInfo.effects.length > 0 && (
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

      <div style={{ 
        marginTop: '20px', 
        padding: '12px', 
        backgroundColor: '#e3f2fd', 
        borderRadius: '8px',
        fontSize: '12px',
        color: '#1565c0'
      }}>
        <strong>Entourage-Effekt:</strong> Terpene wirken synergistisch mit Cannabinoiden 
        und können deren Wirkung modulieren. Die hier aufgeführten Einzelwirkungen 
        können in Kombination verstärkt oder verändert werden.
      </div>
    </div>
  );
};

export default CultivarTerpenPanel;
