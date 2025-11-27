#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Pfade zu den Datenbanken
const TERPENES_PATH = path.join(__dirname, '../public/data/terpenes.json');
const REFERENCES_PATH = path.join(__dirname, '../public/data/references.json');
const CULTIVARS_PATH = path.join(__dirname, '../public/kultivare.json');

// Validierungsfunktionen
function validateTerpenes(terpenes) {
  const errors = [];
  
  if (!Array.isArray(terpenes)) {
    errors.push('Terpenes must be an array');
    return errors;
  }

  terpenes.forEach((terpene, index) => {
    // Erforderliche Felder prüfen
    if (!terpene.name || typeof terpene.name !== 'string') {
      errors.push(`Terpene[${index}]: Missing or invalid 'name' field`);
    }
    
    if (!terpene.description || typeof terpene.description !== 'string') {
      errors.push(`Terpene[${index}]: Missing or invalid 'description' field`);
    }
    
    if (!terpene.aroma || typeof terpene.aroma !== 'string') {
      errors.push(`Terpene[${index}]: Missing or invalid 'aroma' field`);
    }
    
    if (
      terpene.boilingPoint !== undefined &&
      typeof terpene.boilingPoint !== 'string'
    ) {
      errors.push(`Terpene[${index}]: 'boilingPoint' must be a string when provided`);
    }

    // Aliases prüfen (optional, aber wenn vorhanden, muss es ein Array sein)
    if (terpene.aliases && !Array.isArray(terpene.aliases)) {
      errors.push(`Terpene[${index}]: 'aliases' must be an array`);
    }

    // Effects prüfen
    if (terpene.effects) {
      if (!Array.isArray(terpene.effects)) {
        errors.push(`Terpene[${index}]: 'effects' must be an array`);
      } else {
        terpene.effects.forEach((effect, effectIndex) => {
          if (!effect.effect || typeof effect.effect !== 'string') {
            errors.push(`Terpene[${index}].effects[${effectIndex}]: Missing or invalid 'effect' field`);
          }
          if (!effect.strength || typeof effect.strength !== 'string') {
            errors.push(`Terpene[${index}].effects[${effectIndex}]: Missing or invalid 'strength' field`);
          }
          if (!effect.sources || !Array.isArray(effect.sources)) {
            errors.push(`Terpene[${index}].effects[${effectIndex}]: Missing or invalid 'sources' array`);
          }
        });
      }
    }
  });

  return errors;
}

function validateReferences(references) {
  const errors = [];
  
  if (!Array.isArray(references)) {
    errors.push('References must be an array');
    return errors;
  }

  const referenceIds = new Set();

  references.forEach((ref, index) => {
    // Erforderliche Felder prüfen
    if (!ref.id || typeof ref.id !== 'string') {
      errors.push(`Reference[${index}]: Missing or invalid 'id' field`);
    } else {
      // Duplikat-Check
      if (referenceIds.has(ref.id)) {
        errors.push(`Reference[${index}]: Duplicate ID '${ref.id}'`);
      }
      referenceIds.add(ref.id);
    }
    
    if (!ref.title || typeof ref.title !== 'string') {
      errors.push(`Reference[${index}]: Missing or invalid 'title' field`);
    }
    
    if (!ref.authors || typeof ref.authors !== 'string') {
      errors.push(`Reference[${index}]: Missing or invalid 'authors' field`);
    }
    
    if (!ref.journal || typeof ref.journal !== 'string') {
      errors.push(`Reference[${index}]: Missing or invalid 'journal' field`);
    }
    
    if (!ref.year || typeof ref.year !== 'number') {
      errors.push(`Reference[${index}]: Missing or invalid 'year' field`);
    }
    
    if (!ref.doi || typeof ref.doi !== 'string') {
      errors.push(`Reference[${index}]: Missing or invalid 'doi' field`);
    }
    
    if (!ref.type || typeof ref.type !== 'string') {
      errors.push(`Reference[${index}]: Missing or invalid 'type' field`);
    }
  });

  return errors;
}

function validateCultivars(cultivars) {
  const errors = [];
  
  if (!Array.isArray(cultivars)) {
    errors.push('Cultivars must be an array');
    return errors;
  }

  cultivars.forEach((cultivar, index) => {
    // Erforderliche Felder prüfen
    if (!cultivar.name || typeof cultivar.name !== 'string') {
      errors.push(`Cultivar[${index}]: Missing or invalid 'name' field`);
    }
    
    // Terpenprofil prüfen (optional, aber wenn vorhanden, muss es ein Array sein)
    if (cultivar.terpenprofil && !Array.isArray(cultivar.terpenprofil)) {
      errors.push(`Cultivar[${index}]: 'terpenprofil' must be an array`);
    }

    if (Array.isArray(cultivar.terpenprofil)) {
      const seen = new Set();
      const duplicates = new Set();
      cultivar.terpenprofil.forEach((terpene) => {
        const key = terpene.trim().toLowerCase();
        if (seen.has(key)) {
          duplicates.add(terpene);
        }
        seen.add(key);
      });

      if (duplicates.size > 0) {
        const list = Array.from(duplicates).join(', ');
        errors.push(
          `Cultivar[${index}]: duplicate terpenprofil entries found (${list})`
        );
      }
    }
  });

  return errors;
}

function validateReferencesInTerpenes(terpenes, references) {
  const errors = [];
  const referenceIds = new Set(references.map(ref => ref.id));
  
  terpenes.forEach((terpene, terpeneIndex) => {
    if (terpene.effects && Array.isArray(terpene.effects)) {
      terpene.effects.forEach((effect, effectIndex) => {
        if (effect.sources && Array.isArray(effect.sources)) {
          effect.sources.forEach((sourceId, sourceIndex) => {
            if (!referenceIds.has(sourceId)) {
              errors.push(
                `Terpene[${terpeneIndex}].effects[${effectIndex}].sources[${sourceIndex}]: ` +
                `Reference '${sourceId}' not found in references database`
              );
            }
          });
        }
      });
    }
  });

  return errors;
}

// Hauptvalidierungsfunktion
async function validateData() {
  console.log('🔍 Validiere Terpen-Datenbanken...\n');
  
  let hasErrors = false;
  
  try {
    // Terpenes laden und validieren
    console.log('📋 Validiere Terpenes...');
    const terpenesData = JSON.parse(fs.readFileSync(TERPENES_PATH, 'utf8'));
    const terpenesErrors = validateTerpenes(terpenesData);
    
    if (terpenesErrors.length > 0) {
      console.log('❌ Fehler in terpenes.json:');
      terpenesErrors.forEach(error => console.log(`   - ${error}`));
      hasErrors = true;
    } else {
      console.log('✅ terpenes.json ist gültig');
    }
    
    // References laden und validieren
    console.log('\n📚 Validiere References...');
    const referencesData = JSON.parse(fs.readFileSync(REFERENCES_PATH, 'utf8'));
    const referencesErrors = validateReferences(referencesData);
    
    if (referencesErrors.length > 0) {
      console.log('❌ Fehler in references.json:');
      referencesErrors.forEach(error => console.log(`   - ${error}`));
      hasErrors = true;
    } else {
      console.log('✅ references.json ist gültig');
    }
    
    // Cultivars laden und validieren
    console.log('\n🌿 Validiere Cultivars...');
    const cultivarsData = JSON.parse(fs.readFileSync(CULTIVARS_PATH, 'utf8'));
    const cultivarsErrors = validateCultivars(cultivarsData);
    
    if (cultivarsErrors.length > 0) {
      console.log('❌ Fehler in kultivare.json:');
      cultivarsErrors.forEach(error => console.log(`   - ${error}`));
      hasErrors = true;
    } else {
      console.log('✅ kultivare.json ist gültig');
    }
    
    // Querverweise validieren
    console.log('\n🔗 Validiere Querverweise...');
    const crossReferenceErrors = validateReferencesInTerpenes(terpenesData, referencesData);
    
    if (crossReferenceErrors.length > 0) {
      console.log('❌ Fehler in Querverweisen:');
      crossReferenceErrors.forEach(error => console.log(`   - ${error}`));
      hasErrors = true;
    } else {
      console.log('✅ Alle Querverweise sind gültig');
    }
    
    // Statistiken anzeigen
    console.log('\n📊 Statistiken:');
    console.log(`   - Terpene: ${terpenesData.length}`);
    console.log(`   - Referenzen: ${referencesData.length}`);
    console.log(`   - Kultivare: ${cultivarsData.length}`);
    
    // Wirkungen zählen
    const totalEffects = terpenesData.reduce((sum, terpene) => 
      sum + (terpene.effects ? terpene.effects.length : 0), 0);
    console.log(`   - Gesamte Wirkungen: ${totalEffects}`);
    
    if (!hasErrors) {
      console.log('\n🎉 Alle Validierungen erfolgreich!');
      process.exit(0);
    } else {
      console.log('\n💥 Validierung fehlgeschlagen!');
      process.exit(1);
    }
    
  } catch (error) {
    console.error('❌ Fehler beim Laden der Dateien:', error.message);
    process.exit(1);
  }
}

// Script ausführen
validateData();
