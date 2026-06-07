import fs from 'fs/promises';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const CACHE_FILE = 'c:\\Users\\BRAVO 15\\Downloads\\tiengtrunghongtai\\backend\\extraction_cache.json';

const pdfFiles = [
  { level: 1, name: 'tu vung hsk 1 3.0.pdf', pages: 7 },
  { level: 2, name: 'tu vung hsk 2 3.0.pdf', pages: 6 },
  { level: 3, name: 'tu vung hsk 3 3.0.pdf', pages: 9 }
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
  // Use gemini-flash-latest which has 1500 RPD standard free tier limit instead of 20 RPD on gemini-2.5-flash
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: "Đây là ảnh trang từ vựng HSK. Hãy trích xuất tất cả các từ vựng xuất hiện trong bảng '词语表'/'Vocabulary' trên trang này. Trả về kết quả dưới dạng JSON array, mỗi đối tượng gồm có các trường: 'word' (từ chữ Hán), 'pinyin' (phiên âm), và 'lesson' (số bài học - phần 课号, chỉ lấy số nguyên). Không trả về bất kỳ từ nào khác ngoài JSON thuần túy (không sử dụng markdown block ```json)."
          },
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
      const waitTime = 65000;
      console.warn(`[Level ${level} Page ${pageNum}] Rate limited (status ${response.status}). Waiting 65 seconds... (Attempt ${attempt})`);
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
    if (attempt <= 5) {
      const waitTime = attempt * 5000;
      console.warn(`[Level ${level} Page ${pageNum}] Catch error: ${error.message}. Retrying in ${waitTime / 1000}s... (Attempt ${attempt}/5)`);
      await delay(waitTime);
      return callGeminiWithRetry(base64Image, pageNum, level, attempt + 1);
    }
    throw error;
  }
}

async function main() {
  const cache = await loadCache();

  // Clear the cache values that might have been partially populated or empty, or let it load
  const allMappings = {};

  for (const f of pdfFiles) {
    console.log(`\n========================================`);
    console.log(`Processing HSK Level ${f.level} PDF: ${f.name}`);
    console.log(`========================================`);

    const filePath = `c:\\Users\\BRAVO 15\\Downloads\\tiengtrunghongtai\\filetuvung\\${f.name}`;
    const dataBuffer = await fs.readFile(filePath);
    const uint8Array = new Uint8Array(dataBuffer);
    const parser = new PDFParse({ data: uint8Array });

    const levelWords = [];

    for (let p = 1; p <= f.pages; p++) {
      const cacheKey = `${f.level}_${p}`;
      if (cache[cacheKey] && cache[cacheKey].length > 0) {
        console.log(`Page ${p} loaded from cache (${cache[cacheKey].length} words).`);
        levelWords.push(...cache[cacheKey]);
        continue;
      }

      console.log(`Rendering page ${p}/${f.pages}...`);
      try {
        const screenshotResult = await parser.getScreenshot({
          partial: [p],
          desiredWidth: 450,
          imageBuffer: true,
          imageDataUrl: false
        });

        if (screenshotResult.pages.length === 0) {
          console.error(`Failed to render page ${p}`);
          continue;
        }

        const page = screenshotResult.pages[0];
        const base64Image = Buffer.from(page.data).toString('base64');

        console.log(`Sending page ${p} to Gemini...`);
        const pageWords = await callGeminiWithRetry(base64Image, p, f.level);
        console.log(`Page ${p} extracted ${pageWords.length} words.`);

        cache[cacheKey] = pageWords;
        await saveCache(cache);

        levelWords.push(...pageWords);

        // Wait 12 seconds between pages
        await delay(12000);
      } catch (err) {
        console.error(`Failed to process page ${p} of HSK ${f.level}:`, err.message);
      }
    }

    console.log(`Level ${f.level} total words extracted: ${levelWords.length}`);

    levelWords.forEach(item => {
      if (item && item.word) {
        const word = item.word.trim();
        let lessonVal = item.lesson;
        if (Array.isArray(lessonVal)) {
          lessonVal = lessonVal[0];
        }
        const lesson = parseInt(lessonVal);
        if (!isNaN(lesson)) {
          allMappings[`${word}_hsk${f.level}`] = lesson;
        }
      }
    });
  }

  // Save final mapping to JSON
  await fs.writeFile('c:\\Users\\BRAVO 15\\Downloads\\tiengtrunghongtai\\backend\\lessons_mapping.json', JSON.stringify(allMappings, null, 2));
  console.log(`\nSuccessfully wrote lessons mapping to lessons_mapping.json! Total mappings: ${Object.keys(allMappings).length}`);

  // Read database.json to generate statistics
  try {
    const dbContent = await fs.readFile('c:\\Users\\BRAVO 15\\Downloads\\tiengtrunghongtai\\backend\\database.json', 'utf-8');
    const db = JSON.parse(dbContent);

    for (let lvl = 1; lvl <= 3; lvl++) {
      const dbWords = db.filter(w => !w.isCustom && w.level === lvl);
      let matchedCount = 0;
      const lessonStats = {};
      const unmatched = [];

      dbWords.forEach(w => {
        const key = `${w.word}_hsk${lvl}`;
        if (allMappings[key]) {
          matchedCount++;
          const lesson = allMappings[key];
          lessonStats[lesson] = (lessonStats[lesson] || 0) + 1;
        } else {
          let found = false;
          const parts = w.word.split('|').map(x => x.trim());
          for (const p of parts) {
            const pk = `${p}_hsk${lvl}`;
            if (allMappings[pk]) {
              matchedCount++;
              const lesson = allMappings[pk];
              lessonStats[lesson] = (lessonStats[lesson] || 0) + 1;
              found = true;
              break;
            }
          }
          if (!found) {
            unmatched.push(w.word);
          }
        }
      });

      console.log(`\n--- STATISTICS FOR HSK LEVEL ${lvl} ---`);
      console.log(`Total words in DB: ${dbWords.length}`);
      console.log(`Successfully matched with PDF lessons: ${matchedCount} (${((matchedCount / dbWords.length) * 100).toFixed(1)}%)`);
      console.log(`Unmatched words: ${unmatched.length}`);
      if (unmatched.length > 0 && unmatched.length < 20) {
        console.log(`Unmatched list:`, unmatched);
      } else if (unmatched.length >= 20) {
        console.log(`Unmatched list (first 20):`, unmatched.slice(0, 20));
      }

      console.log(`Lessons division stats:`);
      Object.keys(lessonStats).sort((a, b) => parseInt(a) - parseInt(b)).forEach(les => {
        console.log(`  Lesson ${les}: ${lessonStats[les]} words`);
      });
    }
  } catch (err) {
    console.error("Failed to compute stats:", err.message);
  }
}

main();
