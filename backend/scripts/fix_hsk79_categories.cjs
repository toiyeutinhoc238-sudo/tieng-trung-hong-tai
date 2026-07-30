/**
 * Fix: Cập nhật category name cho 3 chủ đề bị gán sai tên trong database
 * Và đảm bảo tất cả 132 chủ đề đều được crawl đúng
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'vi-VN,vi;q=0.9'
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchPage(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(20000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function extractVocab(html) {
  const words = [];
  const seen = new Set();
  const hrefMatches = [...html.matchAll(/href="\/tu-vung\/(%[0-9A-Fa-f]{2}[^"]*?)\/"/g)];
  hrefMatches.forEach((match, idx) => {
    let hanzi = '';
    try { hanzi = decodeURIComponent(match[1]); } catch(e) { return; }
    if (!hanzi || !/[\u4e00-\u9fff\u3400-\u4dbf]/.test(hanzi) || seen.has(hanzi)) return;
    const startPos = match.index;
    const cardHtml = html.slice(startPos, Math.min(hrefMatches[idx+1]?.index ?? startPos+2000, startPos + 2000));
    const pinyinMatch = cardHtml.match(/font-vn text-sm text-muted-foreground[^>]*>([^<]+)<\/span>/);
    const meaningMatch = cardHtml.match(/line-clamp-2[^>]*>([^<]+)<\/span>/);
    const pinyin = pinyinMatch ? pinyinMatch[1].trim().replace(/\*/g, '') : '';
    const meaning = meaningMatch ? meaningMatch[1].trim() : '';
    if (hanzi && pinyin && meaning) { words.push({ word: hanzi, pinyin, meaning }); seen.add(hanzi); }
  });
  return words;
}

async function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

async function fixDatabase() {
  const dbPath = path.join(__dirname, '../database.json');
  let database = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  console.log(`📂 Database: ${database.length} từ vựng\n`);

  // === BƯỚC 1: Fix tên category cho 3 chủ đề bị gán sai ===
  // Các từ crawl từ slug trang-thai-cua-nhung-dieu-toi/ii/iii bị gán sai tên
  const wrongToRight = {
    'hsk79_topic127': { correctName: 'Trạng thái của những điều tôi', correctId: 130 },
    'hsk79_topic128': { correctName: 'Trạng thái của sự vật II',      correctId: 131 },
    'hsk79_topic129': { correctName: 'Trạng thái của sự vật III',     correctId: 132 }
  };

  let fixedCount = 0;
  database = database.map(w => {
    const fix = wrongToRight[w.lessonId];
    if (fix) {
      fixedCount++;
      return {
        ...w,
        lessonId: `hsk79_topic${fix.correctId}`,
        lessonTitle: `New HSK 7-9: ${fix.correctName}`,
        lessonDesc: `Chủ đề ${fix.correctId}: ${fix.correctName} - New HSK 7-9 cao cấp`,
        category: fix.correctName
      };
    }
    return w;
  });
  console.log(`✏️  Đã fix tên category cho ${fixedCount} từ (topics 127→130, 128→131, 129→132)`);

  // === BƯỚC 2: Crawl 3 chủ đề THỰC SỰ bị thiếu: y-thuc-va-tam-hon, doc-dao, tu-choi-va-cam ===
  // Những chủ đề này có slug riêng nhưng chưa được crawl
  const actualMissingTopics = [
    { id: 127, name: 'Ý thức và tâm hồn', slug: 'y-thuc-va-tam-hon', wordCount: 23 },
    { id: 128, name: 'Độc đáo',           slug: 'doc-dao',           wordCount: 23 },
    { id: 129, name: 'Từ chối và cấm',    slug: 'tu-choi-va-cam',    wordCount: 21 }
  ];

  let maxId = 0;
  database.forEach(w => { const n = parseInt(w.id); if (!isNaN(n) && n > maxId) maxId = n; });
  
  const existingWords = new Set(database.map(w => w.word));
  const newWords = [];

  console.log('\n🔍 Crawl 3 chủ đề thực sự bị thiếu...\n');
  for (const topic of actualMissingTopics) {
    const url = `https://xiehanzi.com/thu-vien-new-hsk/new-hsk-7-9/${topic.slug}/`;
    process.stdout.write(`  [${topic.id}] ${topic.name.padEnd(30)} `);
    try {
      const html = await fetchPage(url);
      const words = extractVocab(html);
      let added = 0;
      words.forEach(w => {
        if (!existingWords.has(w.word)) {
          maxId++;
          newWords.push({
            id: maxId, word: w.word, pinyin: w.pinyin, meaning: w.meaning,
            level: '7-9', curriculum: 'hsk', hskVersion: '3.0', volume: null,
            lessonId: `hsk79_topic${topic.id}`,
            lessonTitle: `New HSK 7-9: ${topic.name}`,
            lessonDesc: `Chủ đề ${topic.id}: ${topic.name} - New HSK 7-9 cao cấp`,
            category: topic.name, example_zh: '', example_vi: '',
            isMemorized: false, isStarred: false, isCustom: false
          });
          existingWords.add(w.word);
          added++;
        }
      });
      console.log(`✅ ${words.length} tìm thấy | ${added} mới | KH: ${topic.wordCount}`);
    } catch(e) {
      console.log(`❌ ${e.message}`);
    }
    await sleep(1000);
  }

  // === LƯU KẾT QUẢ ===
  const final = [...database, ...newWords];
  fs.writeFileSync(dbPath, JSON.stringify(final, null, 2), 'utf8');
  
  console.log(`\n${'='.repeat(55)}`);
  console.log(`✅ Hoàn tất!`);
  console.log(`   - Fix category: ${fixedCount} từ`);
  console.log(`   - Từ mới thêm: ${newWords.length}`);
  console.log(`   - Database: ${database.length} → ${final.length} từ`);
  console.log(`${'='.repeat(55)}`);
}

fixDatabase().catch(console.error);
