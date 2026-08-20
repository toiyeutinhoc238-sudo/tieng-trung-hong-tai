import mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function analyze() {
  const ver3Docx = path.resolve(__dirname, '../../filetuvung/Ngữ pháp HSK 1 3.0 NEW VER3.docx');
  const ver2Docx = path.resolve(__dirname, '../../filetuvung/Ngữ pháp HSK 1 3.0 NEW VER2.docx');
  const oldDocx = path.resolve(__dirname, '../../filetuvung/Ngữ pháp HSK 1.docx');

  const res3 = await mammoth.convertToHtml({ path: ver3Docx });
  const res2 = fs.existsSync(ver2Docx) ? await mammoth.convertToHtml({ path: ver2Docx }) : null;
  const resOld = fs.existsSync(oldDocx) ? await mammoth.convertToHtml({ path: oldDocx }) : null;

  console.log('VER3 HTML Length:', res3.value.length);
  if (res2) console.log('VER2 HTML Length:', res2.value.length);
  if (resOld) console.log('Old HTML Length:', resOld.value.length);

  const $ = cheerio.load(res3.value);

  // Let's list all headings or lesson indicators
  const headings = [];
  $('p, h1, h2, h3, h4, h5, h6').each((i, el) => {
    const text = $(el).text().trim();
    if (/第.+课|Bài\s*\d+|💡/i.test(text)) {
      headings.push({ tag: el.tagName, text });
    }
  });

  console.log('Total headings/points found:', headings.length);
  headings.forEach(h => console.log(`[${h.tag}] ${h.text}`));

  // Also print all tables structure
  console.log('\n--- TABLES ---');
  $('table').each((i, tbl) => {
    const rows = [];
    $(tbl).find('tr').each((rIdx, tr) => {
      const cells = [];
      $(tr).find('td, th').each((cIdx, td) => {
        cells.push($(td).text().trim().replace(/\s+/g, ' '));
      });
      rows.push(cells);
    });
    console.log(`Table ${i + 1} (${rows.length} rows):`, rows.slice(0, 3));
  });
}

analyze().catch(console.error);
