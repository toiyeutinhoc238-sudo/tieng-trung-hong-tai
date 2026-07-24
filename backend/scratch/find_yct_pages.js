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
  'YCT1 Tieng Viet.pdf',
  'YCT2 Tieng Viet.pdf',
  'YCT3 Tieng Viet.pdf',
  'YCT4 Tieng Viet.pdf'
];

async function checkPages() {
  for (const name of pdfs) {
    const p = path.join(folder, name);
    try {
      const dataBuffer = await fs.readFile(p);
      const uint8Array = new Uint8Array(dataBuffer);
      const parser = new PDFParse({ data: uint8Array });
      await parser.load();
      
      let pNum = 1;
      while (true) {
        try {
          const res = await parser.getScreenshot({ partial: [pNum], desiredWidth: 100, imageBuffer: true });
          if (!res.pages || res.pages.length === 0) break;
          pNum++;
        } catch (e) {
          break;
        }
      }
      console.log(`${name} total pages: ${pNum - 1}`);
    } catch (e) {
      console.error(`Error with ${name}:`, e.message);
    }
  }
}

checkPages();
