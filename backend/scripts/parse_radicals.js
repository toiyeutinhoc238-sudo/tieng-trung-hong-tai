import mammoth from 'mammoth';
import * as cheerio from 'cheerio';
import fs from 'fs';
import path from 'path';

const dir = 'c:/Users/BRAVO 15/Downloads/tiengtrunghongtai/filetuvung';

async function parseDocx(file) {
  const filePath = path.join(dir, file);
  const result = await mammoth.convertToHtml({ path: filePath });
  const $ = cheerio.load(result.value);
  const rows = [];
  $('tr').each((i, tr) => {
    const cells = [];
    $(tr).find('td, th').each((j, td) => {
      cells.push($(td).text().trim().replace(/\s+/g, ' '));
    });
    if (cells.length > 0) rows.push(cells);
  });
  return rows;
}

async function main() {
  const list1 = await parseDocx('50 bộ thủ thông dụng 1.docx');
  const list2 = await parseDocx('50 bộ thủ thông dụng 2.docx');
  const list3 = await parseDocx('50 bộ thủ thông dụng 3.docx');
  const listRest = await parseDocx('Những bộ thủ còn lại.docx');
  const listComp = await parseDocx('So sánh các bộ thủ giống nhau.docx');

  function mapRadicalRows(rows, category) {
    const items = [];
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      if (!r || r.length < 5) continue;
      const radical = r[0] || '';
      const variant = r[1] || '';
      const pinyin = r[2] || '';
      const name = r[3] || '';
      const meaning = r[4] || '';
      const example = r[5] || '';
      const note = r[6] || '';
      if (!radical) continue;
      items.push({
        id: `rad_${category.replace(/\s+/g, '_')}_${i}`,
        radical,
        variant,
        pinyin,
        name,
        meaning,
        example,
        note,
        category
      });
    }
    return items;
  }

  const rads1 = mapRadicalRows(list1, '50 bộ thủ 1');
  const rads2 = mapRadicalRows(list2, '50 bộ thủ 2');
  const rads3 = mapRadicalRows(list3, '50 bộ thủ 3');
  const radsRest = mapRadicalRows(listRest, 'Bộ thủ còn lại');

  const comparisons = [];
  for (let i = 1; i < listComp.length; i++) {
    const r = listComp[i];
    if (!r || r.length < 5) continue;
    comparisons.push({
      id: `comp_${i}`,
      rad1: r[0] || '',
      meaning1: r[1] || '',
      rad2: r[2] || '',
      meaning2: r[3] || '',
      difference: r[4] || '',
      example: r[5] || ''
    });
  }

  const dataset = {
    radicals: [...rads1, ...rads2, ...rads3, ...radsRest],
    comparisons
  };

  console.log('Total Radicals parsed:', dataset.radicals.length);
  console.log('Total Comparisons parsed:', dataset.comparisons.length);

  const outFrontend = 'c:/Users/BRAVO 15/Downloads/tiengtrunghongtai/frontend/src/radicals_data.json';
  const outBackend = 'c:/Users/BRAVO 15/Downloads/tiengtrunghongtai/backend/radicals_data.json';

  fs.writeFileSync(outFrontend, JSON.stringify(dataset, null, 2), 'utf8');
  fs.writeFileSync(outBackend, JSON.stringify(dataset, null, 2), 'utf8');

  console.log('Saved dataset to frontend and backend json successfully!');
}

main().catch(console.error);
