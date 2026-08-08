const mammoth = require('mammoth');
const cheerio = require('cheerio');
const fs = require('fs');

async function main() {
  const res = await mammoth.convertToHtml({ path: '../filetuvung/Bài khoá HSK 1 3.0.docx' });
  const $ = cheerio.load(res.value);
  const textBlocks = [];
  $('p, ul, ol, h1, h2, h3, h4, table, tr, td').each((_, el) => {
    const t = $(el).text().trim();
    if (t) textBlocks.push(t);
  });
  console.log('Total text blocks:', textBlocks.length);
  fs.writeFileSync('../scratch/docx_text_blocks.json', JSON.stringify(textBlocks, null, 2));

  // Also print out lines matching '听两遍' or '课文' or 'Bài'
  textBlocks.forEach((b, i) => {
    if (b.includes('听两遍') || b.includes('课文') || b.startsWith('第') || b.includes('选择正确答案')) {
      console.log(`[${i}] ${b}`);
    }
  });
}

main().catch(console.error);
