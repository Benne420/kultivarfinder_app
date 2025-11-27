import { readFile } from 'fs/promises';
import { isDeepStrictEqual } from 'util';

const backupPairs = [
  {
    source: 'public/kultivare.json',
    backup: 'data/kultivare.json.bak'
  }
];

function formatList(items) {
  return items.length === 1 ? items[0] : `${items.slice(0, -1).join(', ')} und ${items.at(-1)}`;
}

async function compareBackup({ source, backup }) {
  const [sourceJson, backupJson] = await Promise.all([
    readFile(source, 'utf8'),
    readFile(backup, 'utf8')
  ]);

  const sourceData = JSON.parse(sourceJson);
  const backupData = JSON.parse(backupJson);

  if (!isDeepStrictEqual(sourceData, backupData)) {
    throw new Error(`Backup stimmt nicht überein: ${backup} vs. ${source}`);
  }
}

async function main() {
  const failures = [];

  await Promise.all(
    backupPairs.map(async (pair) => {
      try {
        await compareBackup(pair);
        console.log(`✅ Backup aktuell: ${pair.backup}`);
      } catch (error) {
        failures.push(error.message);
      }
    })
  );

  if (failures.length > 0) {
    const formatted = formatList(failures);
    console.error(`❌ Veraltete Backups gefunden: ${formatted}`);
    process.exitCode = 1;
    return;
  }

  console.log('🎉 Alle Backups sind auf dem neuesten Stand.');
}

main();
