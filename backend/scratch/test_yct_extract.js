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

async function testPage(pdfName, pageNum) {
  const filePath = path.join(__dirname, '..', '..', 'filetuvung', pdfName);
  const dataBuffer = await fs.readFile(filePath);
  const uint8Array = new Uint8Array(dataBuffer);
  const parser = new PDFParse({ data: uint8Array });
  await parser.load();

  const screenshotResult = await parser.getScreenshot({
    partial: [pageNum],
    desiredWidth: 600,
    imageBuffer: true,
    imageDataUrl: false
  });

  if (!screenshotResult.pages || screenshotResult.pages.length === 0) {
    console.log(`Page ${pageNum} render failed.`);
    return;
  }

  const page = screenshotResult.pages[0];
  const base64Image = Buffer.from(page.data).toString('base64');

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-lite-latest:generateContent?key=${apiKey}`;

  const promptText = `Đây là trang trong sách giáo trình YCT. Hãy trích xuất danh sách các từ vựng/từ mới (生词) xuất hiện trên trang này. Trả về kết quả dưới dạng JSON array, mỗi đối tượng gồm có:
- 'word' (từ chữ Hán, ví dụ: '你好' hoặc '家')
- 'pinyin' (phiên âm, ví dụ: 'nǐ hǎo')
- 'meaning' (nghĩa tiếng Việt, ví dụ: 'xin chào')
- 'lesson' (số bài học nếu có, ví dụ 1, 2..., nếu không có ghi null)
- 'category' (từ loại nếu có, ví dụ 'danh từ', 'động từ', hoặc 'Chưa phân loại')

Nếu trang này là trang bìa, mục lục, bài tập không chứa bảng từ vựng từ mới, hãy trả về array rỗng []. Không trả về markdown formatting ngoài JSON thuần.`;

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
    console.log(`Page ${pageNum} -> ${json.length} words found.`);
    if (json.length > 0) {
      console.log('Sample:', json.slice(0, 3));
    }
  } catch (e) {
    console.log(`Page ${pageNum} parse error: ${cleanText.slice(0, 100)}`);
  }
}

async function run() {
  console.log('Testing YCT 1 pages 60 to 72...');
  for (let p = 60; p <= 72; p++) {
    await testPage('YCT1 Tieng Viet.pdf', p);
  }
}

run();
