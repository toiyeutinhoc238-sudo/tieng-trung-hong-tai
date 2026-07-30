/**
 * Script crawl từ vựng New HSK 7-9 từ xiehanzi.com - PHIÊN BẢN CẢI TIẾN
 * Fix: regex mạnh hơn để bắt đủ 6,016 từ từ 132 chủ đề
 * Chạy: node scripts/crawl_hsk79_v2.cjs
 */

const https = require('https');
const fs = require('fs');
const path = require('path');

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'no-cache'
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

/**
 * Giải mã chuỗi URI component sang Unicode
 */
function decodeHanziFromUrl(encodedUrl) {
  try {
    // Extract the encoded part: /tu-vung/%E6%8B%9C%E5%B9%B4/
    const match = encodedUrl.match(/\/tu-vung\/([^/]+)\//);
    if (match) {
      return decodeURIComponent(match[1]);
    }
  } catch (e) {}
  return null;
}

/**
 * Chiến lược 1: Extract từ href URL + span tags
 * Mỗi từ vựng nằm trong <a href="/tu-vung/ENCODED/"> ... </a>
 */
function extractVocabImproved(html, topicName) {
  const words = [];
  const seen = new Set();

  // Strategy 1: Split by word card boundaries
  // Tìm tất cả block từ href="/tu-vung/ đến href="/tu-vung/ tiếp theo
  const cardSplitPattern = /href="\/tu-vung\/(%[0-9A-Fa-f]{2}[^"]*?)\/"/g;
  const hrefMatches = [...html.matchAll(cardSplitPattern)];
  
  if (hrefMatches.length > 0) {
    hrefMatches.forEach((match, idx) => {
      const encodedWord = match[1];
      let hanzi = '';
      try {
        hanzi = decodeURIComponent(encodedWord);
      } catch(e) { return; }
      
      if (!hanzi || !/[\u4e00-\u9fff\u3400-\u4dbf]/.test(hanzi)) return;
      if (seen.has(hanzi)) return;
      
      // Lấy đoạn HTML sau href này (khoảng 1500 chars) để tìm pinyin và meaning
      const startPos = match.index;
      const endPos = hrefMatches[idx + 1] ? hrefMatches[idx + 1].index : startPos + 2000;
      const cardHtml = html.slice(startPos, Math.min(endPos, startPos + 2000));
      
      // Extract pinyin: <span class="font-vn text-sm text-muted-foreground">
      const pinyinMatch = cardHtml.match(/font-vn text-sm text-muted-foreground[^>]*>([^<]+)<\/span>/);
      // Extract meaning: text-foreground/85 line-clamp-2
      const meaningMatch = cardHtml.match(/line-clamp-2[^>]*>([^<]+)<\/span>/);
      
      const pinyin = pinyinMatch ? pinyinMatch[1].trim().replace(/\*/g, '') : '';
      const meaning = meaningMatch ? meaningMatch[1].trim() : '';
      
      if (hanzi && pinyin && meaning) {
        words.push({ word: hanzi, pinyin, meaning });
        seen.add(hanzi);
      } else if (hanzi) {
        // Try fallback - extract from hanziSerif span right after the URL
        const hanziSpanMatch = cardHtml.match(/font-hanziSerif[^>]*lang="zh"[^>]*>([^<]+)<\/span>/);
        const pinyinFallback = cardHtml.match(/text-muted-foreground[^>]*>([a-zA-Zàáâãèéêìíòóôõùúăắằẳẵặâấầẩẫậđêếềểễệôốồổỗộơớờởỡợưứừửữựỳýỷỹỵ\*\s]+)<\/span>/i);
        const meaningFallback = cardHtml.match(/line-clamp-2[^>]*>([^<]+)<\/span>/);
        
        const h2 = hanziSpanMatch ? hanziSpanMatch[1].trim() : hanzi;
        const p2 = pinyinFallback ? pinyinFallback[1].trim().replace(/\*/g, '') : '';
        const m2 = meaningFallback ? meaningFallback[1].trim() : '';
        
        if (h2 && p2 && m2 && !seen.has(h2)) {
          words.push({ word: h2, pinyin: p2, meaning: m2 });
          seen.add(h2);
        }
      }
    });
  }

  // Strategy 2 (fallback): Extract trực tiếp từ tất cả hanziSerif spans
  if (words.length === 0) {
    // Lấy tất cả hanzi spans
    const hanziMatches = [...html.matchAll(/font-hanziSerif[^>]*lang="zh"[^>]*>([^<]+)<\/span>/g)];
    // Lấy tất cả pinyin spans
    const pinyinMatches = [...html.matchAll(/text-muted-foreground[^>]*>([a-zA-Zàáâãèéêìíòóôõùúăắằẳẵặâấầẩẫậđêếềểễệôốồổỗộơớờởỡợưứừửữựỳýỷỹỵ\*\s,\.]+)<\/span>/gi)];
    // Lấy tất cả meaning spans
    const meaningMatches = [...html.matchAll(/line-clamp-2[^>]*>([^<]{1,100})<\/span>/g)];
    
    hanziMatches.forEach((hm, i) => {
      const hanzi = hm[1].trim();
      if (!hanzi || !/[\u4e00-\u9fff]/.test(hanzi) || seen.has(hanzi)) return;
      
      const pinyin = pinyinMatches[i] ? pinyinMatches[i][1].trim().replace(/\*/g, '') : '';
      const meaning = meaningMatches[i] ? meaningMatches[i][1].trim() : '';
      
      if (hanzi && meaning) {
        words.push({ word: hanzi, pinyin, meaning });
        seen.add(hanzi);
      }
    });
  }

  return words;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function crawlAllTopics() {
  console.log('🚀 Bắt đầu crawl từ vựng New HSK 7-9 (v2 - improved regex)...\n');

  // Read existing database
  const dbPath = path.join(__dirname, '../database.json');
  let database = [];
  try {
    database = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    console.log(`📂 Database hiện tại: ${database.length} từ vựng`);
  } catch (e) {
    console.error('Không đọc được database:', e.message);
    return;
  }

  // Find max ID properly
  let maxId = 0;
  database.forEach(w => {
    const numId = parseInt(w.id);
    if (!isNaN(numId) && numId > maxId) maxId = numId;
  });
  console.log(`🔢 Max ID: ${maxId}`);

  // Build set of EXISTING HSK 7-9 words to replace them
  // Remove old HSK 7-9 entries first, then re-add fresh ones
  const nonHsk79 = database.filter(w => w.level !== '7-9');
  const existingOtherWords = new Set(nonHsk79.map(w => w.word));
  console.log(`📝 Từ vựng non-HSK7-9: ${nonHsk79.length}`);
  console.log(`🗑️  Xóa ${database.length - nonHsk79.length} từ HSK 7-9 cũ để crawl lại từ đầu...\n`);

  // Reset maxId to the max of non-hsk79 entries
  maxId = 0;
  nonHsk79.forEach(w => {
    const numId = parseInt(w.id);
    if (!isNaN(numId) && numId > maxId) maxId = numId;
  });

  // Get topic list from main page
  let topics = [];
  try {
    console.log('📋 Lấy danh sách chủ đề từ trang chính...');
    const mainHtml = await fetchPage('https://xiehanzi.com/thu-vien-new-hsk/new-hsk-7-9/');
    
    // Extract all unique topic links (exclude luyen-tap, flashcard etc.)
    const slugSet = new Set();
    const linkMatches = [...mainHtml.matchAll(/href="\/thu-vien-new-hsk\/new-hsk-7-9\/([^/"]+)\/"/g)];
    linkMatches.forEach(m => {
      const slug = m[1];
      if (!['luyen-tap', 'flashcard'].includes(slug)) {
        slugSet.add(slug);
      }
    });
    const slugs = [...slugSet];

    // Extract topic names
    const nameMatches = [...mainHtml.matchAll(/<h3[^>]*capitalize[^>]*>([^<]+)<\/h3>/g)];
    const countMatches = [...mainHtml.matchAll(/<p[^>]*text-muted[^>]*>(\d+)<!-- -->\s*từ vựng/g)];

    slugs.forEach((slug, i) => {
      topics.push({
        id: i + 1,
        name: nameMatches[i] ? nameMatches[i][1].trim() : `Chủ đề ${i + 1}`,
        wordCount: countMatches[i] ? parseInt(countMatches[i][1]) : 0,
        slug
      });
    });

    console.log(`✅ Tìm thấy ${topics.length} chủ đề`);
    const totalExpected = topics.reduce((sum, t) => sum + t.wordCount, 0);
    console.log(`📊 Tổng từ vựng kỳ vọng: ${totalExpected}\n`);
    
  } catch (e) {
    console.error('Lỗi lấy danh sách chủ đề:', e.message);
    return;
  }

  // Crawl each topic
  const newWords = [];
  const addedWords = new Set(existingOtherWords);
  let totalFound = 0;

  for (let i = 0; i < topics.length; i++) {
    const topic = topics[i];
    const url = `https://xiehanzi.com/thu-vien-new-hsk/new-hsk-7-9/${topic.slug}/`;
    
    process.stdout.write(`[${String(i + 1).padStart(3)}/${topics.length}] ${topic.name.padEnd(45)} `);
    
    let retries = 3;
    let words = [];
    
    while (retries > 0) {
      try {
        const html = await fetchPage(url);
        words = extractVocabImproved(html, topic.name);
        break;
      } catch (err) {
        retries--;
        if (retries === 0) {
          console.log(`❌ FAILED: ${err.message}`);
        } else {
          await sleep(2000);
        }
      }
    }

    const added = [];
    words.forEach(w => {
      if (w.word && !addedWords.has(w.word)) {
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
          lessonDesc: `Chủ đề ${topic.id}: ${topic.name} - New HSK 7-9 cao cấp (${topic.wordCount} từ)`,
          category: topic.name,
          example_zh: '',
          example_vi: '',
          isMemorized: false,
          isStarred: false,
          isCustom: false
        });
        addedWords.add(w.word);
        added.push(w.word);
      }
    });

    totalFound += added.length;
    const status = words.length >= (topic.wordCount * 0.8) ? '✅' : words.length > 0 ? '⚠️ ' : '❌';
    console.log(`${status} ${String(words.length).padStart(3)} từ tìm thấy | ${String(added.length).padStart(3)} từ mới | KH: ${topic.wordCount}`);

    await sleep(700 + Math.random() * 300);
  }

  console.log(`\n${'='.repeat(60)}`);
  console.log(`✅ Crawl hoàn tất!`);
  console.log(`   Tổng từ mới HSK 7-9: ${newWords.length}`);
  console.log(`   Tổng cộng database: ${nonHsk79.length + newWords.length}`);
  console.log(`${'='.repeat(60)}\n`);

  // Save intermediate
  const outputPath = path.join(__dirname, '../hsk79_vocab_v2.json');
  fs.writeFileSync(outputPath, JSON.stringify(newWords, null, 2), 'utf8');
  console.log(`💾 Đã lưu vào hsk79_vocab_v2.json`);

  // Merge & save database
  const updatedDb = [...nonHsk79, ...newWords];
  fs.writeFileSync(dbPath, JSON.stringify(updatedDb, null, 2), 'utf8');
  console.log(`✅ Đã cập nhật database.json: ${updatedDb.length} từ tổng cộng`);
  console.log(`   Trước: ${database.length} | Sau: ${updatedDb.length} | Delta: +${updatedDb.length - database.length}`);
}

crawlAllTopics().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
