import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const folder = path.join(__dirname, '..', '..', 'filetuvung');

const pdfs = [
  { name: 'YCT1 Tieng Viet.pdf', level: 1 },
  { name: 'YCT2 Tieng Viet.pdf', level: 2 },
  { name: 'YCT3 Tieng Viet.pdf', level: 3 },
  { name: 'YCT4 Tieng Viet.pdf', level: 4 }
];

async function getPageCounts() {
  for (const item of pdfs) {
    const p = path.join(folder, item.name);
    const dataBuffer = await fs.readFile(p);
    const uint8Array = new Uint8Array(dataBuffer);
    const parser = new PDFParse({ data: uint8Array });
    await parser.load();
    const res = await parser.getText({ partial: [1] });
    const match = res.text.match(/-- \d+ of (\d+) --/);
    if (match) {
      console.log(`${item.name}: ${match[1]} pages`);
    } else {
      console.log(`${item.name}: text sample: ${res.text.slice(0, 100)}`);
    }
  }
}

getPageCounts();
