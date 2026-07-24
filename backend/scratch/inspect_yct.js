import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const folder = path.join(__dirname, '..', '..', 'filetuvung');

async function inspectYCTPages(fileName, totalPages) {
  console.log(`\n=== Inspecting ${fileName} ===`);
  const p = path.join(folder, fileName);
  const dataBuffer = await fs.readFile(p);
  const uint8Array = new Uint8Array(dataBuffer);
  const parser = new PDFParse({ data: uint8Array });
  await parser.load();

  for (let page = 1; page <= totalPages; page++) {
    try {
      const res = await parser.getText({ partial: [page] });
      const text = res.text || '';
      // Check if text has any Chinese characters or keyword
      const hasChinese = /[\u4e00-\u9fa5]/.test(text);
      if (hasChinese || text.includes('生词') || text.includes('Từ mới') || text.includes('Bài') || text.includes('Lesson')) {
        console.log(`Page ${page}: length=${text.length}, hasChinese=${hasChinese}, sample=${text.slice(0, 150).replace(/\n/g, ' ')}`);
      }
    } catch (e) {
      console.log(`Error on page ${page}:`, e.message);
    }
  }
}

async function run() {
  await inspectYCTPages('YCT1 Tieng Viet.pdf', 72);
}

run();
