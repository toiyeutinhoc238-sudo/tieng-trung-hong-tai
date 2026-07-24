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
  'tu vung hsk 4 thuong 2.0.pdf',
  'tu vung hsk 4 ha 2.0.pdf',
  'tu vung hsk 5 thuong 2.0.pdf',
  'tu vung hsk 5 ha 2.0.pdf'
];

async function check() {
  for (const name of pdfs) {
    const p = path.join(folder, name);
    try {
      const dataBuffer = await fs.readFile(p);
      const uint8Array = new Uint8Array(dataBuffer);
      const parser = new PDFParse({ data: uint8Array });
      await parser.load();
      console.log(`${name}: numPages = ${parser.numPages}`);
      const text = await parser.getText({ partial: [1] });
      console.log(`Page 1 sample text length: ${text.text ? text.text.length : 0}`);
      console.log(`Sample text: ${text.text ? text.text.slice(0, 200).replace(/\n/g, ' ') : 'N/A'}`);
    } catch (e) {
      console.error(`Error reading ${name}:`, e.message);
    }
  }
}

check();
