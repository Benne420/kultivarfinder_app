#!/usr/bin/env node

import { readFile, writeFile } from 'node:fs/promises';
import { isDeepStrictEqual } from 'node:util';
import { backupPairs } from './validate-backups.mjs';

function formatList(items) {
  return items.length === 1 ? items[0] : `${items.slice(0, -1).join(', ')} und ${items.at(-1)}`;
}

async function syncBackup({ source, backup }) {
  const [sourceJson, backupJson = null] = await Promise.all([
    readFile(source, 'utf8'),
    readFile(backup, 'utf8').catch(() => null)
  ]);

  const sourceData = JSON.parse(sourceJson);
  const backupData = backupJson ? JSON.parse(backupJson) : null;

  if (backupData && isDeepStrictEqual(sourceData, backupData)) {
    return false;
  }

  const normalized = `${JSON.stringify(sourceData, null, 2)}\n`;
  await writeFile(backup, normalized, 'utf8');
  return true;
}

export async function syncBackups(pairs = backupPairs) {
  const updates = [];

  for (const pair of pairs) {
    const changed = await syncBackup(pair);
    if (changed) {
      updates.push(pair.backup);
      console.log(`💾 Backup aktualisiert: ${pair.backup}`);
    } else {
      console.log(`✅ Backup bereits aktuell: ${pair.backup}`);
    }
  }

  return { updates };
}

async function main() {
  const { updates } = await syncBackups();

  if (updates.length === 0) {
    console.log('🎉 Alle Backups waren bereits synchron.');
    return;
  }

  console.log(`📂 Aktualisierte Backups: ${formatList(updates)}`);
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch((error) => {
    console.error(`❌ Backup-Sync fehlgeschlagen: ${error.message}`);
    process.exitCode = 1;
  });
}
