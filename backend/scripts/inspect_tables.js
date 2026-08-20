import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rawHtml = fs.readFileSync(path.resolve(__dirname, '../../scratch/hsk1_ver3_raw.html'), 'utf-8');
const $ = cheerio.load(rawHtml);

// Let's inspect each table and list items
$('table').each((i, table) => {
  console.log(`\n--- TABLE ${i + 1} ---`);
  $(table).find('tr').each((rIdx, tr) => {
    const row = [];
    $(tr).find('td, th').each((cIdx, td) => {
      row.push($(td).text().trim());
    });
    console.log(`  Row ${rIdx + 1}:`, row.join(' | '));
  });
});
