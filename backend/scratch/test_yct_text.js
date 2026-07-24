import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const folder = path.join(__dirname, '..', '..', 'filetuvung');

async function testText() {
  const p = path.join(folder, 'YCT1 Tieng Viet.pdf');
  const dataBuffer = await fs.readFile(p);
  const uint8Array = new Uint8Array(dataBuffer);
  const parser = new PDFParse({ data: uint8Array });
  await parser.load();
  console.log('PDF loaded. Testing page 1 text...');
  for (let page = 1; page <= 50; page++) {
    try {
      const res = await parser.getText({ partial: [page] });
      if (!res.text || res.text.trim().length === 0) {
        console.log(`Page ${page} has no text (or out of bounds).`);
      } else {
        console.log(`Page ${page}: length = ${res.text.length}, sample: ${res.text.slice(0, 100).replace(/\n/g, ' ')}`);
      }
    } catch (e) {
      console.log(`Page ${page} error: ${e.message}`);
      break;
    }
  }
}

testText();
