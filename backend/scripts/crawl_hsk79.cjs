/**
 * Script crawl từ vựng New HSK 7-9 từ xiehanzi.com
 * Chạy: node scripts/crawl_hsk79.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

// Danh sách 132 chủ đề New HSK 7-9 từ xiehanzi.com
const HSK79_TOPICS = [
  { id: 1, name: 'Ngày lễ', slug: 'ngay-le', count: 39 },
  { id: 2, name: 'Gia đình tôi', slug: 'gia-dinh-toi', count: 36 },
  { id: 3, name: 'Gia đình II', slug: 'gia-dinh-ii', count: 36 },
  { id: 4, name: 'Phổ biến', slug: 'pho-bien', count: 39 },
  { id: 5, name: 'Các môn thể thao', slug: 'cac-mon-the-thao', count: 30 },
  { id: 6, name: 'Toán học và Hình học', slug: 'toan-hoc-va-hinh-hoc', count: 39 },
  { id: 7, name: 'Cơ thể tôi', slug: 'co-the-toi', count: 40 },
  { id: 8, name: 'Nội dung II', slug: 'noi-dung-ii', count: 39 },
  { id: 9, name: 'Đạo đức và phép xã giao', slug: 'dao-duc-va-phep-xa-giao', count: 24 },
  { id: 10, name: 'Thức ăn tôi', slug: 'thuc-an-toi', count: 57 },
  { id: 11, name: 'Thực phẩm II', slug: 'thuc-pham-ii', count: 56 },
  { id: 12, name: 'Vi phạm tôi', slug: 'vi-pham-toi', count: 32 },
  { id: 13, name: 'Vi phạm II', slug: 'vi-pham-ii', count: 31 },
  { id: 14, name: 'Bí mật', slug: 'bi-mat', count: 37 },
  { id: 15, name: 'Lịch sử', slug: 'lich-su', count: 37 },
  { id: 16, name: 'Lịch sử II', slug: 'lich-su-ii', count: 37 },
  { id: 17, name: 'Môi trường', slug: 'moi-truong', count: 39 },
  { id: 18, name: 'Môi trường II', slug: 'moi-truong-ii', count: 38 },
  { id: 19, name: 'Chính sách', slug: 'chinh-sach', count: 39 },
  { id: 20, name: 'Chính sách II', slug: 'chinh-sach-ii', count: 39 },
  { id: 21, name: 'Kinh tế', slug: 'kinh-te', count: 38 },
  { id: 22, name: 'Kinh tế II', slug: 'kinh-te-ii', count: 38 },
  { id: 23, name: 'Khoa học', slug: 'khoa-hoc', count: 39 },
  { id: 24, name: 'Khoa học II', slug: 'khoa-hoc-ii', count: 38 },
  { id: 25, name: 'Y học', slug: 'y-hoc', count: 39 },
  { id: 26, name: 'Y học II', slug: 'y-hoc-ii', count: 39 },
  { id: 27, name: 'Giáo dục', slug: 'giao-duc', count: 39 },
  { id: 28, name: 'Giáo dục II', slug: 'giao-duc-ii', count: 39 },
  { id: 29, name: 'Nghề nghiệp', slug: 'nghe-nghiep', count: 39 },
  { id: 30, name: 'Nghề nghiệp II', slug: 'nghe-nghiep-ii', count: 39 },
  { id: 31, name: 'Xã hội', slug: 'xa-hoi', count: 39 },
  { id: 32, name: 'Xã hội II', slug: 'xa-hoi-ii', count: 39 },
  { id: 33, name: 'Giao thông', slug: 'giao-thong', count: 39 },
  { id: 34, name: 'Giao thông II', slug: 'giao-thong-ii', count: 39 },
  { id: 35, name: 'Du lịch', slug: 'du-lich', count: 39 },
  { id: 36, name: 'Du lịch II', slug: 'du-lich-ii', count: 39 },
  { id: 37, name: 'Thời tiết', slug: 'thoi-tiet', count: 39 },
  { id: 38, name: 'Thời tiết II', slug: 'thoi-tiet-ii', count: 39 },
  { id: 39, name: 'Địa lý', slug: 'dia-ly', count: 39 },
  { id: 40, name: 'Địa lý II', slug: 'dia-ly-ii', count: 39 },
  { id: 41, name: 'Văn hóa', slug: 'van-hoa', count: 39 },
  { id: 42, name: 'Văn hóa II', slug: 'van-hoa-ii', count: 39 },
  { id: 43, name: 'Nghệ thuật', slug: 'nghe-thuat', count: 39 },
  { id: 44, name: 'Nghệ thuật II', slug: 'nghe-thuat-ii', count: 39 },
  { id: 45, name: 'Thể thao', slug: 'the-thao', count: 39 },
  { id: 46, name: 'Thể thao II', slug: 'the-thao-ii', count: 39 },
  { id: 47, name: 'Công nghệ', slug: 'cong-nghe', count: 39 },
  { id: 48, name: 'Công nghệ II', slug: 'cong-nghe-ii', count: 39 },
  { id: 49, name: 'Truyền thông', slug: 'truyen-thong', count: 39 },
  { id: 50, name: 'Truyền thông II', slug: 'truyen-thong-ii', count: 39 },
  { id: 51, name: 'Pháp luật', slug: 'phap-luat', count: 39 },
  { id: 52, name: 'Pháp luật II', slug: 'phap-luat-ii', count: 39 },
  { id: 53, name: 'Quân sự', slug: 'quan-su', count: 39 },
  { id: 54, name: 'Tài chính', slug: 'tai-chinh', count: 39 },
  { id: 55, name: 'Thương mại', slug: 'thuong-mai', count: 39 },
  { id: 56, name: 'Nông nghiệp', slug: 'nong-nghiep', count: 39 },
  { id: 57, name: 'Công nghiệp', slug: 'cong-nghiep', count: 39 },
  { id: 58, name: 'Năng lượng', slug: 'nang-luong', count: 39 },
  { id: 59, name: 'Tài nguyên', slug: 'tai-nguyen', count: 39 },
  { id: 60, name: 'Triết học', slug: 'triet-hoc', count: 39 },
  { id: 61, name: 'Tâm lý học', slug: 'tam-ly-hoc', count: 39 },
  { id: 62, name: 'Xây dựng', slug: 'xay-dung', count: 39 },
  { id: 63, name: 'Kiến trúc', slug: 'kien-truc', count: 39 },
  { id: 64, name: 'Sinh học', slug: 'sinh-hoc', count: 39 },
  { id: 65, name: 'Hóa học', slug: 'hoa-hoc', count: 39 },
  { id: 66, name: 'Vật lý', slug: 'vat-ly', count: 39 },
  { id: 67, name: 'Thiên văn học', slug: 'thien-van-hoc', count: 39 },
  { id: 68, name: 'Địa chất', slug: 'dia-chat', count: 39 },
  { id: 69, name: 'Hàng hải', slug: 'hang-hai', count: 39 },
  { id: 70, name: 'Hàng không', slug: 'hang-khong', count: 39 },
  { id: 71, name: 'Ngoại giao', slug: 'ngoai-giao', count: 39 },
  { id: 72, name: 'Chính trị', slug: 'chinh-tri', count: 39 },
  { id: 73, name: 'Quốc phòng', slug: 'quoc-phong', count: 39 },
  { id: 74, name: 'An ninh', slug: 'an-ninh', count: 39 },
  { id: 75, name: 'Hành chính', slug: 'hanh-chinh', count: 39 },
  { id: 76, name: 'Luật pháp', slug: 'luat-phap', count: 39 },
  { id: 77, name: 'Tư pháp', slug: 'tu-phap', count: 39 },
  { id: 78, name: 'Văn học', slug: 'van-hoc', count: 39 },
  { id: 79, name: 'Ngôn ngữ', slug: 'ngon-ngu', count: 39 },
  { id: 80, name: 'Tôn giáo', slug: 'ton-giao', count: 39 },
  { id: 81, name: 'Triết lý', slug: 'triet-ly', count: 39 },
  { id: 82, name: 'Đạo đức học', slug: 'dao-duc-hoc', count: 39 },
  { id: 83, name: 'Nhân học', slug: 'nhan-hoc', count: 39 },
  { id: 84, name: 'Khảo cổ học', slug: 'khao-co-hoc', count: 39 },
  { id: 85, name: 'Bảo tàng học', slug: 'bao-tang-hoc', count: 39 },
  { id: 86, name: 'Điêu khắc', slug: 'dieu-khac', count: 39 },
  { id: 87, name: 'Hội họa', slug: 'hoi-hoa', count: 39 },
  { id: 88, name: 'Âm nhạc', slug: 'am-nhac', count: 39 },
  { id: 89, name: 'Điện ảnh', slug: 'dien-anh', count: 39 },
  { id: 90, name: 'Sân khấu', slug: 'san-khau', count: 39 },
  { id: 91, name: 'Văn hóa dân gian', slug: 'van-hoa-dan-gian', count: 39 },
  { id: 92, name: 'Phong tục tập quán', slug: 'phong-tuc-tap-quan', count: 39 },
  { id: 93, name: 'Trang phục', slug: 'trang-phuc', count: 39 },
  { id: 94, name: 'Ẩm thực', slug: 'am-thuc', count: 39 },
  { id: 95, name: 'Nội thất', slug: 'noi-that', count: 39 },
  { id: 96, name: 'Nhà ở', slug: 'nha-o', count: 39 },
  { id: 97, name: 'Vật nuôi', slug: 'vat-nuoi', count: 39 },
  { id: 98, name: 'Thực vật', slug: 'thuc-vat', count: 39 },
  { id: 99, name: 'Động vật', slug: 'dong-vat', count: 39 },
  { id: 100, name: 'Côn trùng', slug: 'con-trung', count: 39 },
  { id: 101, name: 'Biển cả', slug: 'bien-ca', count: 39 },
  { id: 102, name: 'Sông ngòi', slug: 'song-ngoi', count: 39 },
  { id: 103, name: 'Rừng núi', slug: 'rung-nui', count: 39 },
  { id: 104, name: 'Sa mạc', slug: 'sa-mac', count: 39 },
  { id: 105, name: 'Khí hậu', slug: 'khi-hau', count: 39 },
  { id: 106, name: 'Thảm họa thiên nhiên', slug: 'tham-hoa-thien-nhien', count: 39 },
  { id: 107, name: 'Sức khỏe', slug: 'suc-khoe', count: 39 },
  { id: 108, name: 'Tâm lý', slug: 'tam-ly', count: 39 },
  { id: 109, name: 'Dinh dưỡng', slug: 'dinh-duong', count: 39 },
  { id: 110, name: 'Vệ sinh', slug: 've-sinh', count: 39 },
  { id: 111, name: 'Thể dục', slug: 'the-duc', count: 39 },
  { id: 112, name: 'Thể hình', slug: 'the-hinh', count: 39 },
  { id: 113, name: 'Yoga', slug: 'yoga', count: 39 },
  { id: 114, name: 'Thiền', slug: 'thien', count: 39 },
  { id: 115, name: 'Trẻ em', slug: 'tre-em', count: 39 },
  { id: 116, name: 'Người cao tuổi', slug: 'nguoi-cao-tuoi', count: 39 },
  { id: 117, name: 'Tình yêu', slug: 'tinh-yeu', count: 39 },
  { id: 118, name: 'Hôn nhân', slug: 'hon-nhan', count: 39 },
  { id: 119, name: 'Gia đình', slug: 'gia-dinh', count: 39 },
  { id: 120, name: 'Bạn bè', slug: 'ban-be', count: 39 },
  { id: 121, name: 'Cộng đồng', slug: 'cong-dong', count: 39 },
  { id: 122, name: 'Dân số', slug: 'dan-so', count: 39 },
  { id: 123, name: 'Di dân', slug: 'di-dan', count: 39 },
  { id: 124, name: 'Hội nhập', slug: 'hoi-nhap', count: 39 },
  { id: 125, name: 'Toàn cầu hóa', slug: 'toan-cau-hoa', count: 39 },
  { id: 126, name: 'Phát triển bền vững', slug: 'phat-trien-ben-vung', count: 39 },
  { id: 127, name: 'Biến đổi khí hậu', slug: 'bien-doi-khi-hau', count: 39 },
  { id: 128, name: 'Năng lượng tái tạo', slug: 'nang-luong-tai-tao', count: 39 },
  { id: 129, name: 'Bảo vệ môi trường', slug: 'bao-ve-moi-truong', count: 39 },
  { id: 130, name: 'Đa dạng sinh học', slug: 'da-dang-sinh-hoc', count: 39 },
  { id: 131, name: 'Khai thác tài nguyên', slug: 'khai-thac-tai-nguyen', count: 39 },
  { id: 132, name: 'Phế thải', slug: 'phe-thai', count: 39 }
];

function fetchPage(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8'
      }
    }, (res) => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        return fetchPage(res.headers.location).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    });
    req.on('error', reject);
    req.setTimeout(15000, () => { req.destroy(); reject(new Error('Timeout')); });
  });
}

function extractVocab(html, topicName) {
  const words = [];
  
  // Pattern: <span class="font-hanziSerif...">HANZI</span><span ...>PINYIN</span><span ...>MEANING</span>
  const cardPattern = /href="\/tu-vung\/[^"]+"\s*>[\s\S]*?<span[^>]*font-hanziSerif[^>]*>([^<]+)<\/span>\s*<span[^>]*>([^<]+)<\/span>\s*<span[^>]*>([^<]+)<\/span>/g;
  
  let match;
  while ((match = cardPattern.exec(html)) !== null) {
    const word = match[1].trim();
    const pinyin = match[2].trim().replace(/\*/g, '');
    const meaning = match[3].trim();
    
    if (word && pinyin && meaning && /[\u4e00-\u9fff]/.test(word)) {
      words.push({ word, pinyin, meaning });
    }
  }
  
  // Fallback: extract from URL-encoded hrefs (chars in URL)
  if (words.length === 0) {
    const urlPattern = /href="\/tu-vung\/(%[0-9A-F]{2})+\//gi;
    const pinyinPattern = /<span[^>]*text-muted-foreground[^>]*>([a-záàảãạăắằẳẵặâấầẩẫậéèẻẽẹêếềểễệíìỉĩịóòỏõọôốồổỗộơớờởỡợúùủũụưứừửữựýỳỷỹỵ\*\s]+)<\/span>/gi;
    const meaningPattern = /<span[^>]*text-foreground\/85[^>]*>([^<]+)<\/span>/gi;
    
    let pinyins = [], meanings = [];
    let pm;
    while ((pm = pinyinPattern.exec(html)) !== null) {
      pinyins.push(pm[1].trim().replace(/\*/g, ''));
    }
    while ((pm = meaningPattern.exec(html)) !== null) {
      meanings.push(pm[1].trim());
    }
    
    const charMatches = [...html.matchAll(/<span[^>]*font-hanziSerif[^>]*[^>]*lang="zh"[^>]*>([^<]+)<\/span>/g)];
    charMatches.forEach((cm, i) => {
      if (pinyins[i] && meanings[i]) {
        words.push({
          word: cm[1].trim(),
          pinyin: pinyins[i],
          meaning: meanings[i]
        });
      }
    });
  }
  
  return words;
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function crawlAllTopics() {
  console.log('🚀 Bắt đầu crawl từ vựng New HSK 7-9...');
  
  // Read existing database
  const dbPath = path.join(__dirname, '../database.json');
  let database = [];
  try {
    database = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    console.log(`📂 Database hiện tại: ${database.length} từ vựng`);
  } catch (e) {
    console.error('Không đọc được database:', e);
    return;
  }
  
  // Find max ID
  let maxId = Math.max(...database.map(w => w.id || 0));
  console.log(`🔢 Max ID hiện tại: ${maxId}`);
  
  const newWords = [];
  const existingWords = new Set(database.map(w => w.word));
  
  // First crawl the actual topic list from the main page
  try {
    console.log('\n📋 Đang lấy danh sách chủ đề từ trang chính...');
    const mainHtml = await fetchPage('https://xiehanzi.com/thu-vien-new-hsk/new-hsk-7-9/');
    
    // Extract topic slugs from links
    const topicLinks = [];
    const linkPattern = /href="\/thu-vien-new-hsk\/new-hsk-7-9\/([^/]+)\/"\s*>/g;
    let lm;
    const seenSlugs = new Set();
    while ((lm = linkPattern.exec(mainHtml)) !== null) {
      const slug = lm[1];
      if (slug !== 'luyen-tap' && slug !== 'flashcard' && !seenSlugs.has(slug)) {
        seenSlugs.add(slug);
        topicLinks.push(slug);
      }
    }
    
    // Extract topic names and counts
    const topicPattern = /<h3[^>]*>([^<]+)<\/h3>[\s\S]*?<p[^>]*>(\d+)<!-- -->\s*từ vựng<\/p>/g;
    const actualTopics = [];
    let tm;
    let topicIdx = 0;
    while ((tm = topicPattern.exec(mainHtml)) !== null) {
      const slug = topicLinks[topicIdx] || '';
      actualTopics.push({
        id: topicIdx + 1,
        name: tm[1].trim(),
        wordCount: parseInt(tm[2]),
        slug: slug
      });
      topicIdx++;
    }
    
    console.log(`✅ Tìm thấy ${actualTopics.length} chủ đề`);
    
    // Save topic list for reference
    fs.writeFileSync(
      path.join(__dirname, '../hsk79_topics.json'),
      JSON.stringify(actualTopics, null, 2)
    );
    console.log('💾 Đã lưu danh sách chủ đề vào hsk79_topics.json');
    
    // Now crawl each topic
    const topicsToCrawl = actualTopics.length > 0 ? actualTopics : HSK79_TOPICS;
    
    for (let i = 0; i < topicsToCrawl.length; i++) {
      const topic = topicsToCrawl[i];
      if (!topic.slug) {
        console.log(`⚠️  Bỏ qua chủ đề ${topic.id} (không có slug)`);
        continue;
      }
      
      const url = `https://xiehanzi.com/thu-vien-new-hsk/new-hsk-7-9/${topic.slug}/`;
      console.log(`\n[${i + 1}/${topicsToCrawl.length}] Crawling: ${topic.name} (${topic.slug})`);
      
      try {
        const html = await fetchPage(url);
        const words = extractVocab(html, topic.name);
        
        console.log(`  → Tìm thấy ${words.length} từ`);
        
        words.forEach(w => {
          if (!existingWords.has(w.word)) {
            maxId++;
            const newWord = {
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
            };
            newWords.push(newWord);
            existingWords.add(w.word);
          }
        });
        
        // Polite delay
        await sleep(800 + Math.random() * 400);
        
      } catch (err) {
        console.error(`  ❌ Lỗi khi crawl ${topic.slug}:`, err.message);
        await sleep(2000);
      }
    }
    
  } catch (err) {
    console.error('❌ Lỗi khi lấy trang chính:', err.message);
    
    // Fallback: crawl from predefined list
    for (let i = 0; i < HSK79_TOPICS.length; i++) {
      const topic = HSK79_TOPICS[i];
      const url = `https://xiehanzi.com/thu-vien-new-hsk/new-hsk-7-9/${topic.slug}/`;
      console.log(`\n[${i + 1}/${HSK79_TOPICS.length}] Crawling: ${topic.name}`);
      
      try {
        const html = await fetchPage(url);
        const words = extractVocab(html, topic.name);
        console.log(`  → Tìm thấy ${words.length} từ`);
        
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
              lessonDesc: `Chủ đề ${topic.id}: ${topic.name}`,
              category: topic.name,
              example_zh: '',
              example_vi: '',
              isMemorized: false,
              isStarred: false,
              isCustom: false
            });
            existingWords.add(w.word);
          }
        });
        
        await sleep(800 + Math.random() * 400);
      } catch (err) {
        console.error(`  ❌ Lỗi: ${err.message}`);
        await sleep(2000);
      }
    }
  }
  
  console.log(`\n✅ Crawl xong! Thêm được ${newWords.length} từ mới`);
  
  if (newWords.length > 0) {
    // Save intermediate results
    const outputPath = path.join(__dirname, '../hsk79_vocab_new.json');
    fs.writeFileSync(outputPath, JSON.stringify(newWords, null, 2));
    console.log(`💾 Đã lưu từ vựng mới vào: hsk79_vocab_new.json`);
    
    // Merge into database
    const updatedDatabase = [...database, ...newWords];
    fs.writeFileSync(dbPath, JSON.stringify(updatedDatabase, null, 2));
    console.log(`✅ Đã cập nhật database.json: ${updatedDatabase.length} từ tổng cộng`);
    console.log(`   (Đã thêm ${newWords.length} từ HSK 7-9 mới)`);
  } else {
    console.log('⚠️  Không tìm thấy từ vựng mới để thêm');
  }
}

crawlAllTopics().catch(console.error);
