#!/usr/bin/env node

import { promises as fs } from 'node:fs';
import path from 'node:path';

const ROOT = process.cwd();
const SCRIPTS_DIR = path.join(ROOT, 'scripts');
const PACKAGE_JSON = path.join(ROOT, 'package.json');

const SCRIPT_PATTERN = /scripts\/[\w.-]+\.(?:mjs|js)/g;
const RELATIVE_SCRIPT_PATTERN = /['"]((?:\.?\.\/)?[^'"\s]+\.(?:mjs|js))['"]/g;

async function listScriptFiles() {
  const entries = await fs.readdir(SCRIPTS_DIR, { withFileTypes: true });
  return entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(SCRIPTS_DIR, entry.name));
}

async function readPackageScripts() {
  const content = await fs.readFile(PACKAGE_JSON, 'utf8');
  const pkg = JSON.parse(content);
  const values = Object.values(pkg.scripts || {});

  const referenced = new Set();
  for (const value of values) {
    const matches = value.match(SCRIPT_PATTERN) || [];
    matches.forEach((match) => referenced.add(path.join(ROOT, match)));
  }

  return referenced;
}

async function collectReferences(filePath) {
  const content = await fs.readFile(filePath, 'utf8');
  const references = new Set();

  const addReference = (spec) => {
    const target = path.resolve(path.dirname(filePath), spec);
    const withExt = path.extname(target) ? target : `${target}.mjs`;
    references.add(withExt);
  };

  const matches = content.matchAll(RELATIVE_SCRIPT_PATTERN);
  for (const match of matches) {
    addReference(match[1]);
  }

  return references;
}

async function buildGraph(scriptFiles) {
  const graph = new Map();
  for (const file of scriptFiles) {
    graph.set(file, await collectReferences(file));
  }
  return graph;
}

function traverse(graph, entryPoints) {
  const visited = new Set();
  const queue = [...entryPoints];

  while (queue.length > 0) {
    const current = queue.shift();
    if (!graph.has(current) || visited.has(current)) continue;

    visited.add(current);

    for (const next of graph.get(current)) {
      queue.push(next);
    }
  }

  return visited;
}

async function main() {
  const scriptFiles = await listScriptFiles();
  const entryPoints = await readPackageScripts();
  const graph = await buildGraph(scriptFiles);

  const reachable = traverse(graph, entryPoints);
  const unused = scriptFiles.filter((file) => !reachable.has(file));

  if (unused.length === 0) {
    console.log('✅ Alle Scripts sind referenziert.');
    return;
  }

  console.log('⚠️  Nicht referenzierte Scripts gefunden:');
  unused
    .sort()
    .forEach((file) => console.log(` - ${path.relative(ROOT, file)}`));

  console.log('\nHinweis: Manuell genutzte Hilfsskripte können in package.json hinterlegt oder aus dem Repo entfernt werden.');
  process.exitCode = 1;
}

main().catch((error) => {
  console.error(`❌ Audit fehlgeschlagen: ${error.message}`);
  process.exitCode = 1;
});
