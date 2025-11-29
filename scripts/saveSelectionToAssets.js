/**
 * Simple Node script to copy a selection text file into src/assets/ as
 * selected_images_<procedureId>.txt
 *
 * Usage:
 *   node scripts/saveSelectionToAssets.js <procedureId> <path/to/selection.txt>
 *
 * Example:
 *   node scripts/saveSelectionToAssets.js proc-123 /path/to/selected_images_proc-123.txt
 *
 * Note: Browser client cannot write into your project files. This script is a
 * helper you run locally to move a previously-exported selection file into
 * the repository assets folder.
 */
const fs = require('fs');
const path = require('path');

if (process.argv.length < 4) {
  console.error('Usage: node scripts/saveSelectionToAssets.js <procedureId> <path/to/selection.txt>');
  process.exit(1);
}

const procedureId = process.argv[2];
const inputPath = process.argv[3];

const outDir = path.join(__dirname, '..', 'src', 'assets');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const outPath = path.join(outDir, `selected_images_${procedureId}.txt`);

try {
  const content = fs.readFileSync(inputPath, 'utf8');
  fs.writeFileSync(outPath, content, 'utf8');
  console.log(`Wrote ${outPath}`);
} catch (err) {
  console.error('Error copying file:', err.message || err);
  process.exit(2);
}
