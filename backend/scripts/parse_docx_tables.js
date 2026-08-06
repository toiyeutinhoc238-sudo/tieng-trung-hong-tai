import mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import path from 'path';
import fs from 'fs';

async function parseDocx() {
  const filePath = path.resolve('../filetuvung/Từ Vựng HSK 1 3.0.docx');
  const result = await mammoth.convertToHtml({ path: filePath });
  const $ = cheerio.load(result.value);

  console.log('Total tables in DOCX:', $('table').length);

  const parsedLessons = [];

  $('table').each((tableIdx, table) => {
    console.log(`\n=================== TABLE ${tableIdx + 1} ===================`);
    const rows = [];
    $(table).find('tr').each((rIdx, tr) => {
      const cells = [];
      $(tr).find('td, th').each((cIdx, td) => {
        cells.push($(td).text().trim());
      });
      if (cells.length > 0) rows.push(cells);
    });

    console.log('Total rows:', rows.length);
    if (rows.length > 0) {
      console.log('Header columns:', rows[0]);
      for (let i = 1; i < Math.min(rows.length, 5); i++) {
        console.log(`Row ${i}:`, rows[i]);
      }
    }
  });
}

parseDocx().catch(console.error);
