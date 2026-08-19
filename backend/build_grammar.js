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
  
  const points = [];
  const fullText = cleanLines.join('\n');

  // ─── VER2 FORMAT: 第X课 headers + 💡 grammar points ───────────────────────
  const hasEmojiPoints = cleanLines.some(l => l.startsWith('💡'));
  
  if (hasEmojiPoints) {
    let lessonTitle = '';
    
    for (let i = 0; i < cleanLines.length; i++) {
      const line = cleanLines[i];
      
      // Detect lesson header: 第X课：...
      if (line.match(/^第[一二三四五六七八九十百零千万\d]+课[:：]/)) {
        lessonTitle = line;
        continue;
      }
      
      // Grammar point starts with 💡
      if (line.startsWith('💡')) {
        const pointTitle = line.replace(/^💡\s*/, '').trim();
        const pointLines = [];
        
        let j = i + 1;
        while (j < cleanLines.length) {
          const next = cleanLines[j];
          if (next.startsWith('💡') || next.match(/^第[一二三四五六七八九十百零千万\d]+课[:：]/)) break;
          pointLines.push(next);
          j++;
        }
        
        // Parse example table and explanation
        const examplePairs = [];
        const explanationLines = [];
        let inTable = false;
        let tableZh = null;
        
        for (let k = 0; k < pointLines.length; k++) {
          const pl = pointLines[k];
          if (pl === 'Ví dụ' || pl === 'Tiếng Trung' || pl === 'Nghĩa' || pl === 'Phiên âm') {
            inTable = true;
            continue;
          }
          if (inTable) {
            if (pl.match(/[\u4e00-\u9fff]/u)) {
              tableZh = pl;
            } else if (tableZh && pl.match(/^[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\s,\.]+$/i)) {
              // Pinyin row - skip
            } else if (tableZh) {
              examplePairs.push({ zh: tableZh, vi: pl });
              tableZh = null;
            }
          } else {
            if (pl.match(/[\u4e00-\u9fff]/u)) {
              examplePairs.push({ zh: pl, vi: '' });
            } else {
              explanationLines.push(pl);
            }
          }
        }
        
        const formattedExamples = examplePairs.slice(0, 6).map(p =>
          p.vi ? `${p.zh} → ${p.vi}` : p.zh
        );
        
        const fullTitle = lessonTitle
          ? `[${lessonTitle}] ${pointTitle}`
          : pointTitle;
        
        points.push({
          id: `pt_${i}_${pointTitle.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase().slice(0, 30)}`,
          title: fullTitle,
          lessonHeader: lessonTitle,
          pointName: pointTitle,
          explanation: explanationLines.join(' ').slice(0, 800),
          examples: formattedExamples,
          rawLines: pointLines,
        });
        
        i = j - 1;
      }
    }
    
    if (points.length > 0) return points;
  }

  // ─── LEGACY FORMAT: numbered sections ──────────────────────────────────────
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
  
  if (numberedSections.length > 1) {
    for (let i = 0; i < numberedSections.length; i++) {
      const section = numberedSections[i];
      const nextIdx = i + 1 < numberedSections.length ? numberedSections[i + 1].idx : cleanLines.length;
      const sectionLines = cleanLines.slice(section.idx, nextIdx);
      
      const examples = sectionLines.filter(l => {
        return l.match(/[\u4e00-\u9fff]/u) ||
               l.match(/\/[a-zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]+\//i) ||
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
    return points;
  }
  
  return [{
    id: 'full_content',
    title: `Ngữ pháp ${level}`,
    explanation: fullText.slice(0, 800),
    examples: [],
  }];
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
