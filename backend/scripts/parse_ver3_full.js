import fs from 'fs';
import path from 'path';
import * as cheerio from 'cheerio';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const htmlPath = path.resolve(__dirname, '../../scratch/hsk1_ver3_raw.html');
const rawHtml = fs.readFileSync(htmlPath, 'utf-8');
const $ = cheerio.load(rawHtml);

console.log('Total body children elements:', $('body').children().length);

// Let's dump all body children in sequential order to inspect the flow
const nodes = [];
$('body').children().each((idx, el) => {
  const tagName = el.tagName.toLowerCase();
  const text = $(el).text().trim();
  const html = $(el).html();
  if (text || tagName === 'table') {
    nodes.push({ idx, tagName, text, html });
  }
});

console.log(`Extracted ${nodes.length} non-empty top-level nodes.`);

// Let's print the entire node sequence structure
fs.writeFileSync(path.resolve(__dirname, '../../scratch/hsk1_ver3_nodes.json'), JSON.stringify(nodes, null, 2), 'utf-8');
console.log('Saved nodes to scratch/hsk1_ver3_nodes.json');
