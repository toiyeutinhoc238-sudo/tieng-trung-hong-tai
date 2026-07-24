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

const CACHE_FILE = path.join(__dirname, '..', 'extraction_cache_yct.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'yct_extracted.json');

const yctFiles = [
  { level: 1, name: 'YCT1 Tieng Viet.pdf', pages: 72, startPage: 55 },
  { level: 2, name: 'YCT2 Tieng Viet.pdf', pages: 80, startPage: 60 },
  { level: 3, name: 'YCT3 Tieng Viet.pdf', pages: 80, startPage: 60 },
  { level: 4, name: 'YCT4 Tieng Viet.pdf', pages: 80, startPage: 60 }
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

async function callGeminiWithRetry(base64Image, pageNum, level, attempt = 1) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;

  const promptText = `Đây là trang trong giáo trình YCT. Hãy trích xuất tất cả các từ vựng xuất hiện trong bảng từ vựng / từ mới (词汇表 / 生词) trên trang này. Trả về kết quả dưới dạng JSON array, mỗi đối tượng gồm có các trường:
- 'word' (từ chữ Hán, ví dụ: '你好' hoặc '家')
- 'pinyin' (phiên âm, ví dụ: 'nǐ hǎo')
- 'meaning' (nghĩa tiếng Việt, ví dụ: 'xin chào')
- 'lesson' (số bài học nếu có trong cột 课/Bài, chỉ lấy số nguyên ví dụ 5, nếu không có trả về null)
- 'category' (từ loại tiếng Việt nếu có, ví dụ 'danh từ', 'động từ', 'tính từ', hoặc 'Chưa phân loại')

Nếu trang không có bảng từ vựng từ mới, hãy trả về array rỗng []. Không trả về bất kỳ văn bản nào khác ngoài JSON array thuần túy (không sử dụng block markdown \`\`\`json).`;

  const requestBody = {
    contents: [
      {
        parts: [
          { text: promptText },
          { inlineData: { mimeType: "image/png", data: base64Image } }
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
      console.warn(`[YCT ${level} Page ${pageNum}] Rate limited (${response.status}). Waiting 30s... (Attempt ${attempt})`);
      await delay(waitTime);
      return callGeminiWithRetry(base64Image, pageNum, level, attempt + 1);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) cleanText = cleanText.substring(7);
    if (cleanText.endsWith("```")) cleanText = cleanText.substring(0, cleanText.length - 3);
    cleanText = cleanText.trim();

    if (!cleanText || cleanText === "[]") return [];
    return JSON.parse(cleanText);
  } catch (error) {
    if (attempt <= 3) {
      const waitTime = attempt * 5000;
      console.warn(`[YCT ${level} Page ${pageNum}] Error: ${error.message}. Retrying in ${waitTime / 1000}s...`);
      await delay(waitTime);
      return callGeminiWithRetry(base64Image, pageNum, level, attempt + 1);
    }
    return [];
  }
}

async function main() {
  console.log('Starting YCT vocabulary extraction from PDFs...');
  const cache = await loadCache();
  const resultData = { "1": [], "2": [], "3": [], "4": [] };

  try {
    const existingOutput = await fs.readFile(OUTPUT_FILE, 'utf-8');
    const existingJson = JSON.parse(existingOutput);
    ["1", "2", "3", "4"].forEach(k => {
      if (existingJson[k]) resultData[k] = existingJson[k];
    });
  } catch (e) {
    console.log('Starting fresh compilation for yct_extracted.json');
  }

  for (const f of yctFiles) {
    console.log(`\n========================================`);
    console.log(`Processing YCT Level ${f.level} PDF: ${f.name}`);
    console.log(`========================================`);

    const filePath = path.join(__dirname, '..', '..', 'filetuvung', f.name);
    const dataBuffer = await fs.readFile(filePath);
    const uint8Array = new Uint8Array(dataBuffer);
    const parser = new PDFParse({ data: uint8Array });
    await parser.load();

    const levelWords = [];

    // Scan from startPage to end page
    for (let p = f.startPage; p <= f.pages; p++) {
      const cacheKey = `yct_level${f.level}_page${p}`;
      if (cache[cacheKey]) {
        console.log(`[${f.name}] Page ${p}/${f.pages} loaded from cache (${cache[cacheKey].length} words).`);
        levelWords.push(...cache[cacheKey]);
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

        if (!screenshotResult.pages || screenshotResult.pages.length === 0) continue;

        const page = screenshotResult.pages[0];
        const base64Image = Buffer.from(page.data).toString('base64');

        console.log(`[${f.name}] Sending page ${p} to Gemini...`);
        const pageWords = await callGeminiWithRetry(base64Image, p, f.level);
        console.log(`[${f.name}] Page ${p} extracted ${pageWords.length} words.`);

        cache[cacheKey] = pageWords;
        await saveCache(cache);

        levelWords.push(...pageWords);
        await delay(2500);
      } catch (err) {
        console.error(`Error processing page ${p} of ${f.name}:`, err.message);
      }
    }

    const uniqueMap = new Map();
    levelWords.forEach(item => {
      if (item && item.word) {
        const key = `${item.word.trim()}_${item.pinyin?.trim()}`;
        uniqueMap.set(key, item);
      }
    });

    resultData[f.level.toString()] = Array.from(uniqueMap.values());
    console.log(`YCT Level ${f.level} unique words extracted: ${resultData[f.level.toString()].length}`);

    await fs.writeFile(OUTPUT_FILE, JSON.stringify(resultData, null, 2), 'utf-8');
  }

  console.log('\n========================================');
  console.log('YCT Extraction complete!');
  console.log(`Total YCT unique words:`);
  console.log(`  Level 1: ${resultData["1"].length}`);
  console.log(`  Level 2: ${resultData["2"].length}`);
  console.log(`  Level 3: ${resultData["3"].length}`);
  console.log(`  Level 4: ${resultData["4"].length}`);
  console.log('========================================');
}

main().catch(err => {
  console.error('Error running YCT extraction main:', err);
});
