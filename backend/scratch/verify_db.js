import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '..', 'database.json');

async function verify() {
  const content = await fs.readFile(dbPath, 'utf-8');
  const data = JSON.parse(content);

  console.log(`Total words in DB: ${data.length}`);

  const counts = {};
  data.forEach(item => {
    const ver = item.hskVersion || '3.0';
    const lvl = item.level;
    const key = `HSK ${lvl} (v${ver})`;
    counts[key] = (counts[key] || 0) + 1;
  });

  console.log('\nWord counts per version & level:');
  Object.keys(counts).sort().forEach(k => {
    console.log(`  ${k}: ${counts[k]} words`);
  });
}

verify();
