import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('CRITICAL ERROR: GEMINI_API_KEY is not defined in .env file!');
  process.exit(1);
}

const CACHE_FILE = path.join(__dirname, '..', 'extraction_cache_hsk6.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'hsk6_extracted.json');

const pdfFiles = [
  { level: 6, volume: 'thuong', name: 'tu vung hsk 6 thuong 2.0.pdf', pages: 28, id: 'hsk6_thuong' },
  { level: 6, volume: 'ha', name: 'tu vung hsk 6 ha 2.0.pdf', pages: 33, id: 'hsk6_ha' }
];

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadCache() {
  try {
    const data = await fs.readFile(CACHE_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return {};
  }
}

async function saveCache(cache) {
  await fs.writeFile(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
}

async function callGeminiWithRetry(base64Image, pageNum, volume, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;

  const promptText = `Đây là ảnh trang từ vựng HSK 6 (Phiên bản 2.0 ${volume === 'thuong' ? 'Thượng' : 'Hạ'}). Hãy trích xuất tất cả các từ vựng xuất hiện trong bảng trên trang này. Trả về kết quả dưới dạng JSON array, mỗi đối tượng gồm có các trường:
- 'word' (từ chữ Hán, ví dụ: '凹凸')
- 'pinyin' (phiên âm chuẩn có dấu, ví dụ: 'āotū')
- 'category' (từ loại tiếng Việt tương ứng: 'danh từ', 'động từ', 'tính từ', 'phó từ', 'số từ', 'lượng từ', 'động từ năng nguyện', 'trợ từ', 'liên từ', hoặc giữ nguyên)
- 'meaning' (nghĩa tiếng Việt)
- 'lesson' (số bài học nếu có, hoặc null)

Không trả về bất kỳ văn bản nào khác ngoài JSON array thuần túy (không sử dụng block markdown \`\`\`json).`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: promptText },
          {
            inlineData: {
              mimeType: "image/png",
              data: base64Image
            }
          }
        ]
      }
    ]
  };

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody)
    });

    if (response.status === 429 || response.status === 503) {
      const waitTime = 30000;
      console.warn(`[HSK 6 ${volume} Page ${pageNum}] Rate limited (status ${response.status}). Waiting 30s... (Attempt ${attempt})`);
      await delay(waitTime);
      return callGeminiWithRetry(base64Image, pageNum, volume, attempt + 1);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) cleanText = cleanText.substring(7);
    if (cleanText.endsWith("```")) cleanText = cleanText.substring(0, cleanText.length - 3);
    cleanText = cleanText.trim();

    return JSON.parse(cleanText);
  } catch (error) {
    if (attempt <= 3) {
      const waitTime = attempt * 5000;
      console.warn(`[HSK 6 ${volume} Page ${pageNum}] Error: ${error.message}. Retrying in ${waitTime / 1000}s... (Attempt ${attempt}/3)`);
      await delay(waitTime);
      return callGeminiWithRetry(base64Image, pageNum, volume, attempt + 1);
    }
    throw error;
  }
}

async function main() {
  console.log('Starting HSK 6 (v2.0) vocabulary extraction from PDFs...');
  const cache = await loadCache();
  const wordsThuong = [];
  const wordsHa = [];

  for (const f of pdfFiles) {
    console.log(`\n========================================`);
    console.log(`Processing ${f.name} (${f.pages} pages)...`);
    console.log(`========================================`);

    const filePath = path.join(__dirname, '..', '..', 'filetuvung', f.name);
    const dataBuffer = await fs.readFile(filePath);
    const uint8Array = new Uint8Array(dataBuffer);
    const parser = new PDFParse({ data: uint8Array });
    await parser.load();

    const targetList = f.volume === 'thuong' ? wordsThuong : wordsHa;

    for (let p = 1; p <= f.pages; p++) {
      const cacheKey = `hsk6_${f.volume}_page${p}`;
      if (cache[cacheKey] && cache[cacheKey].length > 0) {
        console.log(`[${f.name}] Page ${p}/${f.pages} loaded from cache (${cache[cacheKey].length} words).`);
        targetList.push(...cache[cacheKey]);
        continue;
      }

      console.log(`[${f.name}] Rendering page ${p}/${f.pages}...`);
      try {
        const screenshotResult = await parser.getScreenshot({
          partial: [p],
          desiredWidth: 600,
          imageBuffer: true,
          imageDataUrl: false
        });

        if (screenshotResult.pages.length === 0) {
          console.error(`Failed to render page ${p}`);
          continue;
        }

        const page = screenshotResult.pages[0];
        const base64Image = Buffer.from(page.data).toString('base64');

        console.log(`[${f.name}] Extracting page ${p} via Gemini...`);
        const pageWords = await callGeminiWithRetry(base64Image, p, f.volume);
        console.log(`[${f.name}] Page ${p} extracted ${pageWords.length} words.`);

        cache[cacheKey] = pageWords;
        await saveCache(cache);

        targetList.push(...pageWords);
        await delay(2500);
      } catch (err) {
        console.error(`Failed page ${p} of ${f.name}:`, err.message);
      }
    }
  }

  // Deduplicate words
  const cleanThuong = [];
  const mapThuong = new Set();
  wordsThuong.forEach(w => {
    if (w && w.word && w.word.trim()) {
      const key = `${w.word.trim()}_${w.pinyin ? w.pinyin.trim() : ''}`;
      if (!mapThuong.has(key)) {
        mapThuong.add(key);
        cleanThuong.push(w);
      }
    }
  });

  const cleanHa = [];
  const mapHa = new Set();
  wordsHa.forEach(w => {
    if (w && w.word && w.word.trim()) {
      const key = `${w.word.trim()}_${w.pinyin ? w.pinyin.trim() : ''}`;
      if (!mapHa.has(key)) {
        mapHa.add(key);
        cleanHa.push(w);
      }
    }
  });

  console.log('\n========================================');
  console.log(`Extraction complete!`);
  console.log(`HSK 6 Thượng: ${cleanThuong.length} unique words`);
  console.log(`HSK 6 Hạ: ${cleanHa.length} unique words`);
  console.log('========================================');

  const outputData = { thuong: cleanThuong, ha: cleanHa };
  await fs.writeFile(OUTPUT_FILE, JSON.stringify(outputData, null, 2), 'utf-8');
  console.log(`Saved output to ${OUTPUT_FILE}`);
}

main().catch(err => {
  console.error('Extraction failed:', err);
});
