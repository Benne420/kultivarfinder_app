// scripts/validate-refs-online.mjs
// Online-Validierung deiner references.json via Crossref.
// Ziel: Fehl-Matches (falsches Themenfeld, unplausible Titel) herausfischen.
//
// Nutzung:
//   node scripts/validate-refs-online.mjs
//
// Optional-Flags:
//   NO_FETCH=1  -> nur DOI-Format prüfen, keine Online-Calls
//   SLOW_MS=300 -> Wartezeit zwischen Anfragen (Default 250ms)
//
// Heuristik (konservativ):
// - DOI-Format muss passen
// - Crossref-Titel darf nicht offensichtlich fachfremd (“marketing”, “leadership”, “organizational” …) sein
// - Subjekt/Category sollte zu Bio/Med/Pharma/Chem/Natural Products passen
// - optional: Titel sollte (wenn vorhanden) Keywords wie cannabis/cannabinoid/terpene enthalten – nur WARN, kein FAIL

import fs from "node:fs";
import path from "node:path";
import { setTimeout as wait } from "node:timers/promises";

// Minimale Fetch-Implementierung mit Undici (Node >=18 hat global fetch)
const hasFetch = typeof fetch === "function";

const ROOT = process.cwd();
const REF_PATH = path.join(ROOT, "public", "data", "references.json");

const SLOW_MS = Number(process.env.SLOW_MS || 250);
const NO_FETCH = process.env.NO_FETCH === "1";

const DOI_RE = /^10\.\d{4,9}\/[-._;()/:A-Z0-9]+$/i;

const DOMAIN_KEYWORDS = [
  "cannabis","cannabinoid","cb1","cb2","tetrahydrocannabinol","thc","cannabidiol","cbd",
  "terpene","terpenes","myrcene","myrcen","caryophyllene","limonene","linalool",
  "sesquiterpene","monoterpene"
];

const OFF_TOPIC_HINTS = [
  "marketing","leadership","organizational","management","innovation management",
  "supply chain","tourism","education policy","accounting","banking","finance",
  "industrial marketing","hr management"
];

// Subjekt/Category, die tendenziell passen
const WANTED_SUBJECTS = [
  "Pharmacology","Pharmacy","Toxicology","Neuroscience","Biochemistry","Molecular Biology",
  "Chemistry","Medicinal Chemistry","Botany","Plant Science","Natural products","Oncology",
  "Anesthesiology","Pain","Immunology","Psychopharmacology","Biology","Medicine","Public Health"
].map(s=>s.toLowerCase());

// Hilfen
const norm = (s="") => s.toString().toLowerCase().replace(/\s+/g, " ").trim();

function containsAny(hay="", needles=[]){
  const H = norm(hay);
  return needles.some(n => H.includes(norm(n)));
}

function okSubject(list){
  if (!Array.isArray(list) || list.length===0) return null; // unbekannt
  const arr = list.map(norm);
  return arr.some(s => WANTED_SUBJECTS.some(w => s.includes(w)));
}

function fmt(obj){
  return JSON.stringify(obj, null, 2);
}

async function getCrossref(doi){
  const url = `https://api.crossref.org/works/${encodeURIComponent(doi)}`;
  const res = await fetch(url, { headers: { "User-Agent": "kultivarfinder-ref-validator/1.0 (mailto:devnull@example.com)" }});
  if (!res.ok) throw new Error(`Crossref ${res.status} for ${doi}`);
  const j = await res.json();
  return j?.message;
}

function summarizeCR(msg){
  if (!msg) return {};
  const title = Array.isArray(msg.title) ? msg.title[0] : msg.title || "";
  const subj  = Array.isArray(msg.subject) ? msg.subject : [];
  const type  = msg.type || "";
  const year =
    (Array.isArray(msg.issued?.["date-parts"]) && msg.issued["date-parts"][0]?.[0]) ||
    msg.created?.["date-parts"]?.[0]?.[0] ||
    msg.deposited?.["date-parts"]?.[0]?.[0] ||
    null;

  const container = msg["container-title"]?.[0] || "";
  const publisher = msg.publisher || "";
  const url = msg.URL || "";

  return { title, subj, type, year, container, publisher, url };
}

function printHeader(){
  console.log("🔎 Online-Validierung references.json (Crossref)\n");
}

function printSummary(stats){
  console.log("\n📊 Zusammenfassung");
  console.log(fmt(stats));
  if (stats.fail > 0) process.exitCode = 1;
}

(async () => {
  printHeader();

  if (!fs.existsSync(REF_PATH)) {
    console.error(`❌ Datei nicht gefunden: ${REF_PATH}`);
    process.exit(1);
  }

  const refs = JSON.parse(fs.readFileSync(REF_PATH, "utf8"));
  const keys = Object.keys(refs);
  if (keys.length === 0) {
    console.log("ℹ️ Keine Referenzen vorhanden.");
    process.exit(0);
  }

  let stats = { total: keys.length, checked: 0, ok: 0, warn: 0, fail: 0, noDoi: 0, skipped: 0 };
  const issues = [];

  for (const id of keys) {
    const r = refs[id];
    const titleLocal = r?.title || "";
    const doi = (r?.doi || "").trim();
    const url = (r?.url || "").trim();

    // DOI ggf. aus URL extrahieren
    let doiCandidate = doi;
    if (!doiCandidate && url) {
      const m = url.match(/10\.\d{4,9}\/[-._;()/:A-Z0-9]+/i);
      if (m) doiCandidate = m[0];
    }

    if (!doiCandidate) {
      stats.noDoi++;
      issues.push({ id, level: "WARN", reason: "Keine DOI vorhanden", ref: r });
      continue;
    }

    // DOI-Format
    if (!DOI_RE.test(doiCandidate)) {
      stats.fail++;
      issues.push({ id, level: "FAIL", reason: `Ungültiges DOI-Format: ${doiCandidate}`, ref: r });
      continue;
    }

    if (NO_FETCH || !hasFetch) {
      stats.skipped++;
      continue;
    }

    try {
      const msg = await getCrossref(doiCandidate);
      const cr = summarizeCR(msg);

      const titleOK = !containsAny(cr.title, OFF_TOPIC_HINTS);
      const subjectOK = okSubject(cr.subj);
      const domainHintOK = containsAny(cr.title, DOMAIN_KEYWORDS) || containsAny(titleLocal, DOMAIN_KEYWORDS);

      let level = "OK";
      let notes = [];

      if (!titleOK) { level = "FAIL"; notes.push("Titel deutet fachfremdes Themenfeld an"); }
      if (subjectOK === false) { level = "FAIL"; notes.push(`Subject nicht passend: ${cr.subj?.join(", ") || "—"}`); }
      if (subjectOK === null) { // unbekannt
        if (!domainHintOK) { level = level === "OK" ? "WARN" : level; notes.push("Keine Subjects; keine Domain-Keywords gefunden"); }
      }

      // Sanity: Jahresabweichung > 5 Jahre (falls lokal Jahr gesetzt)
      if (r.year && cr.year && Math.abs(Number(r.year) - Number(cr.year)) > 5) {
        level = level === "OK" ? "WARN" : level;
        notes.push(`Jahresabweichung lokal(${r.year}) vs Crossref(${cr.year})`);
      }

      // Ergebnis
      if (level === "OK") stats.ok++;
      else if (level === "WARN") stats.warn++;
      else stats.fail++;

      issues.push({
        id,
        level,
        reason: notes.join("; ") || "—",
        doi: doiCandidate,
        localTitle: titleLocal,
        crossref: cr
      });

    } catch (e) {
      stats.warn++;
      issues.push({ id, level: "WARN", reason: `Crossref-Fehler: ${e.message}`, doi: doiCandidate, ref: r });
    }

    // Rate Limit schonen
    await wait(SLOW_MS);
    stats.checked++;
  }

  // Ausgabe
  const outDir = path.join(ROOT, "reports");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, "references-online-report.json");
  fs.writeFileSync(outFile, JSON.stringify({ stats, issues }, null, 2), "utf8");

  // Menschliche Konsole
  const fails = issues.filter(x => x.level === "FAIL");
  const warns = issues.filter(x => x.level === "WARN");

  if (fails.length) {
    console.log("\n❌ Verdächtige/Unpassende Einträge (FAIL):");
    fails.forEach(x => {
      console.log(`- ${x.id} :: ${x.reason}`);
      if (x.crossref?.title) console.log(`  ↳ Crossref-Titel: ${x.crossref.title}`);
      if (x.crossref?.subj?.length) console.log(`  ↳ Subjects: ${x.crossref.subj.join(", ")}`);
    });
  }
  if (warns.length) {
    console.log("\n⚠️  Hinweise (WARN):");
    warns.forEach(x => {
      console.log(`- ${x.id} :: ${x.reason}`);
      if (x.crossref?.title) console.log(`  ↳ Crossref-Titel: ${x.crossref.title}`);
    });
  }

  printSummary(stats);
  console.log(`\n📝 Vollständiger Report: ${outFile}`);
})();
