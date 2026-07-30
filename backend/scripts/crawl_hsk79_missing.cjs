/**
 * Crawl 3 chủ đề bị thiếu của New HSK 7-9
 * Slugs đã xác nhận từ JSON trong trang chính
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
    
    if (!hanzi || !/[\u4e00-\u9fff\u3400-\u4dbf]/.test(hanzi)) return;
    if (seen.has(hanzi)) return;
    
    const startPos = match.index;
    const nextMatch = hrefMatches[idx + 1];
    const endPos = nextMatch ? nextMatch.index : startPos + 2000;
    const cardHtml = html.slice(startPos, Math.min(endPos, startPos + 2000));
    
    const pinyinMatch = cardHtml.match(/font-vn text-sm text-muted-foreground[^>]*>([^<]+)<\/span>/);
    const meaningMatch = cardHtml.match(/line-clamp-2[^>]*>([^<]+)<\/span>/);
    
    const pinyin = pinyinMatch ? pinyinMatch[1].trim().replace(/\*/g, '') : '';
    const meaning = meaningMatch ? meaningMatch[1].trim() : '';
    
    if (hanzi && pinyin && meaning) {
      words.push({ word: hanzi, pinyin, meaning });
      seen.add(hanzi);
    }
  });
  
  return words;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function crawlMissingTopics() {
  // 3 chủ đề bị thiếu - xác nhận từ JSON trang chính
  const missingTopics = [
    { id: 130, name: 'Trạng thái của những điều tôi', slug: 'trang-thai-cua-nhung-dieu-toi', wordCount: 55 },
    { id: 131, name: 'Trạng thái của sự vật II',      slug: 'trang-thai-cua-su-vat-ii',      wordCount: 57 },
    { id: 132, name: 'Trạng thái của sự vật III',     slug: 'trang-thai-cua-su-vat-iii',     wordCount: 54 }
  ];

  const dbPath = path.join(__dirname, '../database.json');
  let database = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  console.log(`📂 Database: ${database.length} từ vựng`);

  let maxId = 0;
  database.forEach(w => { const n = parseInt(w.id); if (!isNaN(n) && n > maxId) maxId = n; });
  console.log(`🔢 Max ID: ${maxId}\n`);

  const existingWords = new Set(database.map(w => w.word));
  const newWords = [];

  for (const topic of missingTopics) {
    const url = `https://xiehanzi.com/thu-vien-new-hsk/new-hsk-7-9/${topic.slug}/`;
    console.log(`Crawling [${topic.id}]: ${topic.name}`);
    console.log(`  URL: ${url}`);
    
    try {
      const html = await fetchPage(url);
      const words = extractVocab(html);
      
      let added = 0;
      words.forEach(w => {
        if (!existingWords.has(w.word)) {
          maxId++;
          newWords.push({
            id: maxId,
            word: w.word,
            pinyin: w.pinyin,
            meaning: w.meaning,
            level: '7-9',
            curriculum: 'hsk',
            hskVersion: '3.0',
            volume: null,
            lessonId: `hsk79_topic${topic.id}`,
            lessonTitle: `New HSK 7-9: ${topic.name}`,
            lessonDesc: `Chủ đề ${topic.id}: ${topic.name} - New HSK 7-9 cao cấp`,
            category: topic.name,
            example_zh: '',
            example_vi: '',
            isMemorized: false,
            isStarred: false,
            isCustom: false
          });
          existingWords.add(w.word);
          added++;
        }
      });
      
      console.log(`  ✅ Tìm thấy: ${words.length} từ | Thêm mới: ${added} từ | Kỳ vọng: ${topic.wordCount}`);
    } catch(e) {
      console.error(`  ❌ Lỗi: ${e.message}`);
    }
    
    await sleep(1000);
  }

  console.log(`\n✅ Xong! Thêm được ${newWords.length} từ mới`);
  
  const updated = [...database, ...newWords];
  fs.writeFileSync(dbPath, JSON.stringify(updated, null, 2), 'utf8');
  console.log(`✅ database.json: ${database.length} → ${updated.length} từ (+${newWords.length})`);
}

crawlMissingTopics().catch(console.error);
