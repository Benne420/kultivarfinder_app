#!/usr/bin/env node

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateBackups } from './validate-backups.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function runScript(relativePath) {
  const absolutePath = path.join(__dirname, relativePath);
  const result = spawnSync('node', [absolutePath], { stdio: 'inherit' });
  if (result.status !== 0) {
    throw new Error(`${relativePath} failed with status ${result.status}`);
  }
}

async function main() {
  console.log('🔍 Starte Validierungen...');

  runScript('validate-terpenes.mjs');

  const { failures } = await validateBackups();
  if (failures.length > 0) {
    const details = failures.map((msg) => ` - ${msg}`).join('\n');
    throw new Error(`Backup-Validierung fehlgeschlagen:\n${details}`);
  }

  console.log('🎉 Alle Validierungen erfolgreich.');
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
