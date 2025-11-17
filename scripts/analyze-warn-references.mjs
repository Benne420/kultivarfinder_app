#!/usr/bin/env node

import fs from 'fs';
import path from 'path';

// Paths
const reportPath = './reports/references-online-report.json';
const referencesPath = './public/data/references.json';

// Read files
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const references = JSON.parse(fs.readFileSync(referencesPath, 'utf8'));

// Build lookup map: DOI -> [refIds]
const doiMap = {};
references.forEach((ref) => {
  const doi = ref.doi || 'NO_DOI';
  if (!doiMap[doi]) {
    doiMap[doi] = [];
  }
  doiMap[doi].push(ref.id);
});

// Extract WARN entries from report
const warns = report.issues.filter((issue) => issue.level === 'WARN');

console.log('=== WARN REFERENCES ANALYSIS ===\n');
console.log(`Total WARN entries in report: ${warns.length}\n`);

// Categorize by reason
const byReason = {};
warns.forEach((w) => {
  if (!byReason[w.reason]) {
    byReason[w.reason] = [];
  }
  byReason[w.reason].push(w);
});

console.log('=== CATEGORIZED BY REASON ===\n');

// 1. Crossref 404 errors
if (byReason['Crossref-Fehler: Crossref 404 for 10.1080/01635580902732406'] ||
    Object.keys(byReason).find((k) => k.includes('Crossref 404'))) {
  const crossref404 = warns.filter((w) => w.reason.includes('Crossref 404'));
  console.log(`Crossref 404 Errors (${crossref404.length}):`);
  const doiCrossfefMap = {};
  crossref404.forEach((w) => {
    if (!doiCrossfefMap[w.doi]) {
      doiCrossfefMap[w.doi] = [];
    }
    doiCrossfefMap[w.doi].push(w.id);
  });
  Object.entries(doiCrossfefMap).forEach(([doi, ids]) => {
    const refIds = doiMap[doi] || ['NOT_FOUND'];
    const isDuplicate = refIds.length > 1;
    console.log(`  DOI: ${doi}`);
    console.log(`  Report IDs: ${ids.join(', ')}`);
    console.log(`  Local Reference IDs: ${refIds.join(', ')}${isDuplicate ? ' [DUPLICATE!]' : ''}`);
  });
  console.log();
}

// 2. No Subjects / No Domain Keywords
const noSubjects = warns.filter((w) => w.reason.includes('Keine Subjects'));
if (noSubjects.length > 0) {
  console.log(`No Subjects / No Domain Keywords (${noSubjects.length}):`);
  const doiSubjectsMap = {};
  noSubjects.forEach((w) => {
    if (!doiSubjectsMap[w.doi]) {
      doiSubjectsMap[w.doi] = [];
    }
    doiSubjectsMap[w.doi].push(w.id);
  });
  Object.entries(doiSubjectsMap).forEach(([doi, ids]) => {
    const refIds = doiMap[doi] || ['NOT_FOUND'];
    const isDuplicate = refIds.length > 1;
    console.log(`  DOI: ${doi}`);
    console.log(`  Report IDs: ${ids.join(', ')}`);
    console.log(`  Local Reference IDs: ${refIds.join(', ')}${isDuplicate ? ' [DUPLICATE!]' : ''}`);
  });
  console.log();
}

// 3. Duplicate DOIs in local references
console.log('=== DUPLICATE DOIs IN LOCAL REFERENCES ===\n');
const duplicateDois = Object.entries(doiMap).filter(([doi, ids]) => ids.length > 1);
if (duplicateDois.length > 0) {
  duplicateDois.forEach(([doi, ids]) => {
    console.log(`DOI: ${doi}`);
    console.log(`Local Reference IDs: ${ids.join(', ')}`);
    console.log(`Details:`);
    ids.forEach((refId) => {
      const ref = references.find((r) => r.id === refId);
      console.log(`  - ${refId}: "${ref.title}" (${ref.year})`);
    });
    console.log();
  });
} else {
  console.log('No duplicate DOIs found.\n');
}

// 4. References with missing subjects field
console.log('=== LOCAL REFERENCES WITH MISSING/EMPTY SUBJECTS ===\n');
const noSubjectsLocal = references.filter((ref) => !ref.subjects || ref.subjects.length === 0);
console.log(`${noSubjectsLocal.length} references have no 'subjects' field or empty array:\n`);
noSubjectsLocal.forEach((ref) => {
  const hasWarn = warns.find((w) => doiMap[w.doi]?.includes(ref.id));
  const warnMarker = hasWarn ? '[WARN IN REPORT]' : '[OK in report]';
  console.log(`  ${ref.id}: "${ref.title}" (DOI: ${ref.doi}) ${warnMarker}`);
});
console.log();

// 5. Summary
console.log('=== SUMMARY ===\n');
console.log(`Total Crossref 404 errors: ${warns.filter((w) => w.reason.includes('Crossref 404')).length}`);
console.log(`Total "No Subjects" warnings: ${noSubjects.length}`);
console.log(`Total duplicate DOIs in local refs: ${duplicateDois.length}`);
console.log(`Total local references: ${references.length}`);
console.log(`Local references with missing subjects: ${noSubjectsLocal.length}`);
console.log();

// 6. Recommended Actions
console.log('=== RECOMMENDED ACTIONS ===\n');
console.log('1. DEDUPLICATE DOIs:');
duplicateDois.forEach(([doi, ids]) => {
  console.log(`   - DOI ${doi}: keep first (${ids[0]}), remove: ${ids.slice(1).join(', ')}`);
});
console.log();

console.log('2. FIX CROSSREF 404 ERRORS:');
const crossref404 = warns.filter((w) => w.reason.includes('Crossref 404'));
const uniqueCrossref404Dois = [...new Set(crossref404.map((w) => w.doi))];
uniqueCrossref404Dois.forEach((doi) => {
  const refIds = doiMap[doi] || [];
  console.log(`   - DOI ${doi} (Local: ${refIds.join(', ')})`);
  console.log(`     → Check at https://doi.org/${doi}`);
  console.log(`     → If invalid, update local reference or replace with valid DOI`);
});
console.log();

console.log('3. ADD MISSING SUBJECTS:');
console.log(`   ${noSubjectsLocal.length} references need subjects field added.`);
console.log('   → Can be auto-populated from title keywords or manually added.');
