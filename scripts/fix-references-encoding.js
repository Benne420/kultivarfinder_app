const fs = require('fs');
const p = 'public/data/references.json';

// Backup
fs.copyFileSync(p, p + '.bak');

// read raw bytes, try latin1->utf8 fix first
let raw = fs.readFileSync(p);
let text = raw.toString('utf8');

// If text contains common mojibake sequences, attempt latin1->utf8 conversion
if (text.match(/Ã|Â|Î|â|Å/)) {
  try {
    text = Buffer.from(raw, 'latin1').toString('utf8');
  } catch (e) {
    console.error('latin1->utf8 conversion failed, keeping original utf8 read.');
  }
}

// targeted replacements (common mojibake → correct)
const fixes = {
  'Î²': 'β',
  'Î±': 'α',
  'CBâ‚‚': 'CB2',
  'CBÂ₂': 'CB2',
  'HanuÅ¡': 'Hanuš',
  'Geyikoglu F, Tatar A, Hacimuftuoglu A': 'Geyikoğlu F, Tatar A, Hacimuftuoglu A', // falls gewünscht
  'Ã–': 'Ö',
  'Ã¤': 'ä',
  'Ã¼': 'ü',
  'Ã¶': 'ö',
  'Ã¡': 'á',
  'Ã©': 'é',
  'Ã­': 'í',
  'Ã³': 'ó',
  'Ã±': 'ñ',
  'Ã ': 'à',
  'â€™': "’",
  'â€“': "–",
  'â€"': "—",
  'Â': ''
};

for (const [k,v] of Object.entries(fixes)) {
  text = text.split(k).join(v);
}

// optional: collapse duplicate commas/whitespace accidentally introduced
text = text.replace(/\uFEFF/g, ''); // BOM entfernen
text = text.replace(/,\s*,/g, ','); 

// validate JSON
try {
  JSON.parse(text);
} catch (e) {
  console.error('JSON-Parse-Fehler nach Korrektur:', e.message);
  fs.writeFileSync(p + '.fixed_preview.json', text, 'utf8');
  console.log('Preview written to', p + '.fixed_preview.json');
  process.exit(1);
}

// write back
fs.writeFileSync(p, text, 'utf8');
console.log('references.json fixed and saved (backup: references.json.bak)');