import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  console.error('CRITICAL ERROR: GEMINI_API_KEY is not defined in .env file!');
  process.exit(1);
}

const CACHE_FILE = path.join(__dirname, '..', 'extraction_cache_hsk2.json');
const OUTPUT_FILE = path.join(__dirname, '..', 'hsk2_extracted.json');

const pdfFiles = [
  { level: 1, name: 'tu vung hsk 1 2.0.pdf', pages: 10, id: 'level1' },
  { level: 2, name: 'tu vung hsk 2 2.0.pdf', pages: 9, id: 'level2' },
  { level: 3, name: 'tu vung hsk 3 2.0.pdf', pages: 14, id: 'level3' },
  { level: 4, name: 'tu vung hsk 4 thuong 2.0.pdf', pages: 14, id: 'level4_thuong' },
  { level: 4, name: 'tu vung hsk 4 ha 2.0.pdf', pages: 15, id: 'level4_ha' },
  { level: 5, name: 'tu vung hsk 5 thuong 2.0.pdf', pages: 26, id: 'level5_thuong' },
  { level: 5, name: 'tu vung hsk 5 ha 2.0.pdf', pages: 24, id: 'level5_ha' }
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
  // Use gemini-flash-lite-latest which has 1500 RPD standard free tier limit
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;

  const promptText = `Đây là ảnh trang từ vựng HSK. Hãy trích xuất tất cả các từ vựng xuất hiện trong bảng '生词' / 'Từ mới' trên trang này. Trả về kết quả dưới dạng JSON array, mỗi đối tượng gồm có các trường:
- 'word' (từ chữ Hán, ví dụ: '电脑' hoặc '爸爸')
- 'pinyin' (phiên âm, ví dụ: 'diànnǎo')
- 'category' (từ loại tiếng Việt tương ứng với ký hiệu viết tắt, ví dụ: 'dt.' -> 'danh từ', 'dgt.' -> 'động từ', 'tt.' -> 'tính từ', 'phó.' -> 'phó từ', 'số.' -> 'số từ', 'lượng.' -> 'lượng từ', 'dtnn.' -> 'động từ năng nguyện', 'trợ.' -> 'trợ từ', 'liên.' -> 'liên từ', hoặc giữ nguyên nếu không khớp)
- 'meaning' (nghĩa tiếng Việt, ví dụ: 'máy vi tính')
- 'lesson' (số bài học từ cột '课号 / Bài', chỉ lấy số nguyên ví dụ '5 (chú thích)' -> 5, hoặc nếu không có thì trả về null)

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
      console.warn(`[Level ${level} Page ${pageNum}] Rate limited (status ${response.status}). Waiting 30 seconds... (Attempt ${attempt})`);
      await delay(waitTime);
      return callGeminiWithRetry(base64Image, pageNum, level, attempt + 1);
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini status ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    let cleanText = text.trim();
    if (cleanText.startsWith("```json")) {
      cleanText = cleanText.substring(7);
    }
    if (cleanText.endsWith("```")) {
      cleanText = cleanText.substring(0, cleanText.length - 3);
    }
    cleanText = cleanText.trim();

    return JSON.parse(cleanText);
  } catch (error) {
    if (attempt <= 3) {
      const waitTime = attempt * 5000;
      console.warn(`[Level ${level} Page ${pageNum}] Catch error: ${error.message}. Retrying in ${waitTime / 1000}s... (Attempt ${attempt}/3)`);
      await delay(waitTime);
      return callGeminiWithRetry(base64Image, pageNum, level, attempt + 1);
    }
    throw error;
  }
}

async function main() {
  console.log('Starting HSK 2.0 vocabulary extraction from PDFs...');
  const cache = await loadCache();
  const resultData = { "1": [], "2": [], "3": [], "4": [], "5": [] };

  // Load existing output if any, to preserve what is already done
  try {
    const existingOutput = await fs.readFile(OUTPUT_FILE, 'utf-8');
    const existingJson = JSON.parse(existingOutput);
    ["1", "2", "3", "4", "5"].forEach(k => {
      if (existingJson[k]) resultData[k] = existingJson[k];
    });
    console.log(`Loaded existing extracted data: L1: ${resultData["1"].length}, L2: ${resultData["2"].length}, L3: ${resultData["3"].length}, L4: ${resultData["4"].length}, L5: ${resultData["5"].length}`);
  } catch (e) {
    console.log('No existing hsk2_extracted.json found, starting fresh compilation.');
  }

  // Accumulate words per level
  const wordsByLevel = { "1": [], "2": [], "3": [], "4": [], "5": [] };

  for (const f of pdfFiles) {
    console.log(`\n========================================`);
    console.log(`Processing HSK Level ${f.level} 2.0 PDF: ${f.name}`);
    console.log(`========================================`);

    const filePath = path.join(__dirname, '..', '..', 'filetuvung', f.name);
    const dataBuffer = await fs.readFile(filePath);
    const uint8Array = new Uint8Array(dataBuffer);
    const parser = new PDFParse({ data: uint8Array });
    await parser.load();

    for (let p = 1; p <= f.pages; p++) {
      const cacheKey = f.id ? `hsk2_${f.id}_page${p}` : `hsk2_level${f.level}_page${p}`;
      if (cache[cacheKey] && cache[cacheKey].length > 0) {
        console.log(`[${f.name}] Page ${p}/${f.pages} loaded from cache (${cache[cacheKey].length} words).`);
        wordsByLevel[f.level.toString()].push(...cache[cacheKey]);
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

        console.log(`[${f.name}] Sending page ${p} to Gemini...`);
        const pageWords = await callGeminiWithRetry(base64Image, p, f.level);
        console.log(`[${f.name}] Page ${p} extracted ${pageWords.length} words.`);

        cache[cacheKey] = pageWords;
        await saveCache(cache);

        wordsByLevel[f.level.toString()].push(...pageWords);

        // Wait 3 seconds to stay under rate limits
        await delay(3000);
      } catch (err) {
        console.error(`Failed to process page ${p} of ${f.name}:`, err.message);
      }
    }
  }

  // Deduplicate and update resultData for levels 1-5
  ["1", "2", "3", "4", "5"].forEach(lvl => {
    const list = wordsByLevel[lvl];
    if (list && list.length > 0) {
      const uniqueMap = new Map();
      list.forEach(item => {
        if (item && item.word) {
          const key = `${item.word.trim()}_${item.pinyin?.trim()}`;
          uniqueMap.set(key, item);
        }
      });
      resultData[lvl] = Array.from(uniqueMap.values());
    }
  });

  console.log('\n========================================');
  console.log('Extraction complete!');
  console.log(`Total unique words:`);
  console.log(`  Level 1: ${resultData["1"].length}`);
  console.log(`  Level 2: ${resultData["2"].length}`);
  console.log(`  Level 3: ${resultData["3"].length}`);
  console.log(`  Level 4: ${resultData["4"].length}`);
  console.log(`  Level 5: ${resultData["5"].length}`);
  console.log('========================================');

  await fs.writeFile(OUTPUT_FILE, JSON.stringify(resultData, null, 2), 'utf-8');
}

main().catch(err => {
  console.error('Error running extraction main:', err);
});
