/**
 * build_grammar.js
 * Script to parse grammar .content.txt files from grammar_json/
 * and build a structured hsk_grammar_data.json file for the frontend.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


const GRAMMAR_DIR = path.join(__dirname, 'grammar_json');
const OUTPUT_FILE = path.join(__dirname, 'hsk_grammar_data.json');

// Define the HSK grammar files to process
const HSK_FILES = [
  { key: 'hsk1', level: 'HSK 1', file: 'ngu phap hsk 1.content.txt', color: '#58cc02', icon: '🌱', desc: 'Ngữ pháp sơ cấp - Đại từ, Số từ, Cấu trúc câu cơ bản' },
  { key: 'hsk2', level: 'HSK 2', file: 'ngu phap hsk 2.content.txt', color: '#1cb0f6', icon: '📘', desc: 'Ngữ pháp cơ bản - Phó từ, Giới từ, Câu hỏi nâng cao' },
  { key: 'hsk3', level: 'HSK 3', file: 'ngu phap hsk 3.content.txt', color: '#ce82ff', icon: '📗', desc: 'Ngữ pháp trung cấp - Bổ ngữ, Cấu trúc phức tạp' },
  { key: 'hsk4', level: 'HSK 4', file: 'ngu phap hsk 4.content.txt', color: '#ffc800', icon: '📙', desc: 'Ngữ pháp trung cấp cao - Câu chữ 把, 被, Bổ ngữ xu hướng' },
  { key: 'hsk5', level: 'HSK 5', file: 'ngu phap hsk 5.content.txt', color: '#ff9600', icon: '📕', desc: 'Ngữ pháp cao cấp - Liên từ, Số thập phân, Biểu thức phức hợp' },
  { key: 'hsk6', level: 'HSK 6', file: 'ngu phap hsk 6.content.txt', color: '#ff4b4b', icon: '🏆', desc: 'Ngữ pháp nâng cao - Cấu trúc văn học, Biểu đạt chuyên sâu' },
];

// YCT files
const YCT_FILES = [
  { key: 'yct1', level: 'YCT 1', file: 'YCT1 Tieng Viet.content.txt', color: '#58cc02', icon: '🌟', desc: 'Ngữ pháp tiếng Trung dành cho thiếu nhi - Cấp 1' },
  { key: 'yct2', level: 'YCT 2', file: 'YCT2 Tieng Viet.content.txt', color: '#1cb0f6', icon: '⭐', desc: 'Ngữ pháp tiếng Trung dành cho thiếu nhi - Cấp 2' },
  { key: 'yct3', level: 'YCT 3', file: 'YCT3 Tieng Viet.content.txt', color: '#ce82ff', icon: '💫', desc: 'Ngữ pháp tiếng Trung dành cho thiếu nhi - Cấp 3' },
  { key: 'yct4', level: 'YCT 4', file: 'YCT4 Tieng Viet.content.txt', color: '#ffc800', icon: '🌙', desc: 'Ngữ pháp tiếng Trung dành cho thiếu nhi - Cấp 4' },
];

const ALL_FILES = [...HSK_FILES, ...YCT_FILES];

/**
 * Parse raw content text into structured grammar points.
 * Each "point" is a section (topic) extracted from the text.
 */
function parseGrammarContent(rawText, level) {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  
  // Remove page break markers
  const cleanLines = lines.filter(l => !l.startsWith('----------------Page'));
  
  // Try to extract structured grammar points
  const points = [];
  let currentPoint = null;
  let currentExamples = [];

  // Patterns to detect section headers (numbered, Vietnamese heading patterns)
  const headingPatterns = [
    /^(\d+)\.\s+(.+)$/,           // "1. Đại từ nhân xưng"
    /^([A-Z]{2,})[\s:](.+)$/,    // "PHÓ TỪ", "LIÊN TỪ"
    /^([A-ZĐÀÁẢÃẠ][A-ZĐÀÁỂÉÈÊỈÍÌÏỊÒÓÔÕỢỚÕÙÚƯỪỨữỵỷỹĂÂŨảãạĩóôõúùủưựừứệểẹẻẽ\s]+)$/,  // All-caps Vietnamese
  ];
  
  // A simpler approach: split by keyword topics found in the text
  const sectionMarkers = [
    /ĐẠI TỪ/i, /SỐ TỪ/i, /LƯỢNG TỪ/i, /CHỮ SỐ/i, /PHÓ TỪ/i, /TRỢ TỪ/i,
    /TRỢ ĐỘNG TỪ/i, /GIỚI TỪ/i, /LIÊN TỪ/i, /CÂU NGHI VẤN/i, /CÂU TRẦN THUẬT/i,
    /CÂU CẢM THÁN/i, /CÂU CẦU KHIẾN/i, /CÁC DẠNG CÂU/i, /TRẠNG THÁI/i,
    /BỔ NGỮ/i, /ĐỊA ĐIỂM/i, /THỜI GIAN/i, /CẤU TRÚC/i, /MẪU CÂU/i,
  ];
  
  // Flatten to single string for section-based parsing
  const fullText = cleanLines.join('\n');
  
  // Extract all content
  // Find numbered points like "1. XXX" or "2. XXX" etc.
  const numberedSections = [];
  let lastIdx = -1;
  
  cleanLines.forEach((line, idx) => {
    const numMatch = line.match(/^(\d+)\.\s*(.+)$/);
    const capsMatch = line.match(/^([A-ZĐÀÁẢÃẠÊỨỈỴẼỮỖỘỔỠỘỤÕỜỞỢỢẦẨẪẬẮẶẴẰẲẶ\s]{4,})$/) && line.length > 4 && line.length < 80;
    
    if ((numMatch || capsMatch) && idx !== lastIdx) {
      const title = numMatch ? numMatch[2] : line;
      if (title.length > 3 && title.length < 120) {
        numberedSections.push({ title: line, idx });
        lastIdx = idx;
      }
    }
  });
  
  // Build sections from numbered headings
  if (numberedSections.length > 1) {
    for (let i = 0; i < numberedSections.length; i++) {
      const section = numberedSections[i];
      const nextIdx = i + 1 < numberedSections.length ? numberedSections[i + 1].idx : cleanLines.length;
      const sectionLines = cleanLines.slice(section.idx, nextIdx);
      
      const examples = sectionLines.filter(l => {
        return l.match(/[一-龯]/u) || // Chinese chars
               l.match(/\/[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+\//i) || // Pinyin
               l.startsWith('Ví dụ') ||
               l.startsWith('●') || l.startsWith('–') || l.startsWith('-');
      });
      
      const explanation = sectionLines
        .filter(l => !examples.includes(l) && l !== section.title)
        .join(' ');
      
      points.push({
        id: `${section.title.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_${i}`,
        title: section.title,
        explanation: explanation.slice(0, 500),
        examples: examples.slice(0, 6),
      });
    }
  }
  
  // If not enough structured points found, create a single full-content point
  if (points.length < 2) {
    // Split by topic keywords and create cards
    const topicCards = [];
    let buffer = [];
    let currentTitle = `Tổng hợp ngữ pháp ${level}`;
    
    for (const line of cleanLines) {
      const isHeading = (
        line.match(/^\d+\.\s+[A-ZĐÀÁẢÃẠ]/) ||
        line.match(/^[A-ZĐÀÁẢÃ\s]{4,}$/) ||
        line.includes('Đại từ') || line.includes('Phó từ') || line.includes('Liên từ') ||
        line.includes('Bổ ngữ') || line.includes('Cấu trúc') || line.includes('Câu chữ') ||
        (line.length < 60 && line.match(/[A-ZĐÀÁẢÃẠ]/) && !line.includes('/') && !line.match(/[一-龯]/u))
      );
      
      if (isHeading && buffer.length > 3) {
        topicCards.push({
          id: `${currentTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}`,
          title: currentTitle,
          explanation: buffer.filter(l => !l.match(/[一-龯]/u)).join(' ').slice(0, 400),
          examples: buffer.filter(l => l.match(/[一-龯]/u) || l.match(/\/[a-zāáǎà]+\//i)).slice(0, 5),
        });
        buffer = [];
        currentTitle = line;
      } else {
        buffer.push(line);
      }
    }
    
    if (buffer.length > 0) {
      topicCards.push({
        id: `${currentTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()}_last`,
        title: currentTitle,
        explanation: buffer.filter(l => !l.match(/[一-龯]/u)).join(' ').slice(0, 400),
        examples: buffer.filter(l => l.match(/[一-龯]/u) || l.match(/\/[a-zāáǎà]+\//i)).slice(0, 5),
      });
    }
    
    return topicCards.length > 0 ? topicCards : [{
      id: 'full_content',
      title: `Ngữ pháp ${level}`,
      explanation: fullText.slice(0, 800),
      examples: [],
    }];
  }
  
  return points;
}

const result = {};

for (const entry of ALL_FILES) {
  const filePath = path.join(GRAMMAR_DIR, entry.file);
  
  if (!fs.existsSync(filePath)) {
    console.warn(`⚠️  File not found: ${entry.file}`);
    continue;
  }
  
  const rawText = fs.readFileSync(filePath, 'utf8');
  const points = parseGrammarContent(rawText, entry.level);
  
  result[entry.key] = {
    id: entry.key,
    level: entry.level,
    title: `Ngữ Pháp ${entry.level} - Tổng Hợp`,
    icon: entry.icon,
    color: entry.color,
    desc: entry.desc,
    pointCount: points.length,
    content: rawText.trim(),        // Keep raw text for full-content API
    items: points,                   // Structured grammar points
  };
  
  console.log(`✅ Processed ${entry.level}: ${points.length} grammar points`);
}

fs.writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf8');
console.log(`\n🎉 Done! Grammar data saved to: ${OUTPUT_FILE}`);
console.log(`📦 Total levels: ${Object.keys(result).length}`);
