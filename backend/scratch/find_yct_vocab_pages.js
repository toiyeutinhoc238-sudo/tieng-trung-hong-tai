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

const books = [
  { name: 'YCT1 Tieng Viet.pdf', pages: 72, level: 1 },
  { name: 'YCT2 Tieng Viet.pdf', pages: 80, level: 2 },
  { name: 'YCT3 Tieng Viet.pdf', pages: 80, level: 3 },
  { name: 'YCT4 Tieng Viet.pdf', pages: 80, level: 4 }
];

async function scanPages(item) {
  console.log(`\n========================================`);
  console.log(`Scanning ${item.name} (${item.pages} pages)...`);
  console.log(`========================================`);

  const filePath = path.join(__dirname, '..', '..', 'filetuvung', item.name);
  const dataBuffer = await fs.readFile(filePath);
  const uint8Array = new Uint8Array(dataBuffer);
  const parser = new PDFParse({ data: uint8Array });
  await parser.load();

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;

  // We scan starting from page 50 to the end to find the vocabulary index table
  for (let p = 50; p <= item.pages; p++) {
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

      const promptText = `Đây là trang trong sách YCT. Kiểm tra xem trang này có chứa danh sách / bảng từ vựng (Từ mới / 生词 / 词汇表) hay không. Nếu CÓ, trả về JSON array danh sách từ vựng gồm các trường:
- 'word' (từ chữ Hán, ví dụ: '你好')
- 'pinyin' (phiên âm, ví dụ: 'nǐ hǎo')
- 'meaning' (nghĩa tiếng Việt, ví dụ: 'xin chào')
- 'lesson' (số bài học nếu có trong bảng từ vựng, ví dụ 1, 2, nếu không có ghi null)
- 'category' (từ loại nếu có, ví dụ 'danh từ', 'động từ', hoặc 'Chưa phân loại')

Nếu KHÔNG chứa bảng từ vựng, hãy trả về array rỗng []. Không trả về markdown formatting ngoài JSON thuần.`;

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

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      let cleanText = text.trim();
      if (cleanText.startsWith("```json")) cleanText = cleanText.substring(7);
      if (cleanText.endsWith("```")) cleanText = cleanText.substring(0, cleanText.length - 3);
      cleanText = cleanText.trim();
      try {
        const json = JSON.parse(cleanText);
        if (json.length > 0) {
          console.log(`[${item.name}] Page ${p} -> FOUND ${json.length} VOCABULARY WORDS!`);
        }
      } catch (e) {
        // Not JSON or empty
      }
    } catch (err) {
      console.error(`Page ${p} error:`, err.message);
    }
  }
}

async function run() {
  for (const b of books) {
    await scanPages(b);
  }
}

run();
