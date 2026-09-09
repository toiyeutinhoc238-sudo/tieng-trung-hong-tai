const fs = require('fs');
const path = require('path');
const mammoth = require('../node_modules/mammoth');
const cheerio = require('../node_modules/cheerio');
const pinyinPro = require('../node_modules/pinyin-pro');

const workspaceDir = path.resolve(__dirname, '../..');
const docxPath = path.join(workspaceDir, 'filetuvung', 'Ngữ pháp HSK 2 2.0.docx');
const frontendDir = path.join(workspaceDir, 'frontend');
const backendDir = path.join(workspaceDir, 'backend');

const lessonTitlesMap = {
  1: '九月去北京旅游最好',
  2: '我每天六点起床',
  3: '左边那个红色的是我的',
  4: '这个工作是他帮我介绍的',
  5: '就买这件吧',
  6: '你怎么不吃了？',
  7: '你家离公司远吗',
  8: '让我想想再告诉你',
  9: '题太多，我没做完',
  10: '别找了，手机在桌子上',
  11: '他比我大三岁',
  12: '你穿得太少了',
  13: '门开着呢',
  14: '你看过那个电影吗？',
  15: '新年就要到了'
};

async function parseDocx() {
  console.log('Reading DOCX from:', docxPath);
  if (!fs.existsSync(docxPath)) {
    throw new Error('DOCX file not found: ' + docxPath);
  }

  const { value: html } = await mammoth.convertToHtml({ path: docxPath });
  const $ = cheerio.load(html);

  const lessons = [];
  let currentLesson = null;
  let currentPoint = null;
  let currentSectionMode = ''; // 'usage', 'formula', 'note', 'examples'

  // Traverse body children
  $('body').children().each((idx, el) => {
    const tagName = el.tagName.toLowerCase();
    const text = $(el).text().trim();

    // 1. Check if Lesson header (e.g. "BÀI 1", "BÀI 10")
    const baiMatch = text.match(/^BÀI\s*(\d+)/i);
    if (baiMatch) {
      if (currentLesson) {
        if (currentPoint) {
          currentLesson.grammarPoints.push(currentPoint);
          currentPoint = null;
        }
        lessons.push(currentLesson);
      }

      const lId = parseInt(baiMatch[1], 10);
      const titleZh = lessonTitlesMap[lId] || `Bài ${lId}`;
      currentLesson = {
        lessonId: lId,
        lessonKey: `Bài ${lId}`,
        lessonTitleZh: titleZh,
        lessonTitleFull: `Bài ${lId}: ${titleZh} (HSK 2 v2.0)`,
        grammarPoints: []
      };
      currentSectionMode = '';
      return;
    }

    if (!currentLesson) return;

    // 2. Check if Grammar Point header (e.g. "NP 1: Trợ động từ 要 (Yào)", "NP 2: ...")
    const npMatch = text.match(/^(?:NP\s*(\d+)|(\d+)\.\s*NP\s*(\d+))[:\s\-\.]*(.*)/i);
    if (npMatch && text.length < 150 && !text.includes('Ví dụ:') && !text.includes('Cấu trúc:')) {
      if (currentPoint) {
        currentLesson.grammarPoints.push(currentPoint);
      }
      const pNum = currentLesson.grammarPoints.length + 1;
      let cleanTitle = (npMatch[4] || text).replace(/^(?:NP\s*\d+[:\s\-\.]*)/i, '').trim();
      if (!cleanTitle) cleanTitle = `Điểm ngữ pháp ${pNum}`;

      currentPoint = {
        id: `hsk2_20_b${currentLesson.lessonId}_g${pNum}`,
        num: pNum,
        title: cleanTitle,
        explanation: '',
        formula: '',
        note: '',
        examples: [],
        tables: []
      };
      currentSectionMode = '';
      return;
    }

    if (!currentPoint) return;

    // 3. Check for Table (Examples or grammar table)
    if (tagName === 'table') {
      const rows = [];
      $(el).find('tr').each((rIdx, tr) => {
        const cells = [];
        $(tr).find('th, td').each((cIdx, td) => {
          cells.push($(td).text().trim());
        });
        if (cells.length >= 2) {
          rows.push(cells);
        }
      });

      rows.forEach(([col1, col2]) => {
        if (!col1 && !col2) return;
        // Check if header row
        if (/^Ví dụ$/i.test(col1) && /^Nghĩa$/i.test(col2)) return;

        // Check if category header inside table (e.g. "Tân ngữ là danh từ thường:")
        if (col1 && !col2) {
          if (currentPoint.note) currentPoint.note += `\n• ${col1}`;
          else currentPoint.note = `• ${col1}`;
          return;
        }

        // Clean typo in source docx (e.g. "เขา不想去运动" -> "他不想去运动")
        let zh = col1.replace(/เขา/g, '他').trim();
        let vi = col2 ? col2.trim() : '';

        if (/[\u4e00-\u9fa5]/.test(zh)) {
          const pinyin = pinyinPro.pinyin(zh, { toneType: 'symbol' });
          currentPoint.examples.push({
            rawZh: `${zh} (${vi})`,
            zh,
            pinyin,
            vi
          });
        }
      });
      return;
    }

    // 4. Check for Section Markers in Paragraphs
    if (/^-\s*Cách dùng\s*[:\s\-]/i.test(text) || /^Cách dùng\s*[:\s\-]/i.test(text)) {
      currentSectionMode = 'usage';
      const exp = text.replace(/^-\s*(?:Cách dùng)\s*[:\s\-]\s*/i, '').trim();
      if (exp) {
        currentPoint.explanation = currentPoint.explanation ? `${currentPoint.explanation}\n${exp}` : exp;
      }
      return;
    }

    if (/^-\s*Công thức\s*[:\s\-]/i.test(text) || /^Công thức\s*[:\s\-]/i.test(text) || /^Cấu trúc\s*[:\s\-]/i.test(text)) {
      currentSectionMode = 'formula';
      const f = text.replace(/^-\s*(?:Công thức|Cấu trúc)\s*[:\s\-]\s*/i, '').trim();
      if (f) {
        currentPoint.formula = currentPoint.formula ? `${currentPoint.formula}\n${f}` : f;
      }
      return;
    }

    if (/^-\s*Lưu ý\s*[:\s\-]/i.test(text) || /^-\s*Chú thích\s*[:\s\-]/i.test(text) || /^Lưu ý\s*[:\s\-]/i.test(text) || /^Chú thích\s*[:\s\-]/i.test(text)) {
      currentSectionMode = 'note';
      const n = text.replace(/^-\s*(?:Lưu ý|Chú thích|Chú ý)\s*[:\s\-]\s*/i, '').trim();
      if (n) {
        currentPoint.note = currentPoint.note ? `${currentPoint.note}\n${n}` : n;
      }
      return;
    }

    if (/^-\s*Ví dụ\s*[:\s\-]?/i.test(text)) {
      currentSectionMode = 'examples';
      return;
    }

    // 5. Continuation lines based on currentSectionMode
    if (text) {
      if (currentSectionMode === 'formula') {
        currentPoint.formula = currentPoint.formula ? `${currentPoint.formula}\n${text}` : text;
      } else if (currentSectionMode === 'note') {
        currentPoint.note = currentPoint.note ? `${currentPoint.note}\n${text}` : text;
      } else if (currentSectionMode === 'usage') {
        currentPoint.explanation = currentPoint.explanation ? `${currentPoint.explanation}\n${text}` : text;
      } else {
        // Fallback: if no explanation yet, put to explanation
        if (!currentPoint.explanation) {
          currentPoint.explanation = text;
        } else {
          currentPoint.explanation += `\n${text}`;
        }
      }
    }
  });

  // Push final lesson
  if (currentLesson) {
    if (currentPoint) {
      currentLesson.grammarPoints.push(currentPoint);
    }
    lessons.push(currentLesson);
  }

  // Cleanup and format points
  lessons.forEach(les => {
    les.grammarPoints.forEach((p, idx) => {
      p.num = idx + 1;
      p.id = `hsk2_20_b${les.lessonId}_g${p.num}`;
      if (p.formula) p.formula = p.formula.trim();
      if (p.explanation) p.explanation = p.explanation.trim();
      if (p.note) p.note = p.note.trim();
    });
  });

  console.log(`Successfully parsed ${lessons.length} lessons for HSK 2 (v2.0)!`);
  const totalPoints = lessons.reduce((sum, l) => sum + l.grammarPoints.length, 0);
  const totalExamples = lessons.reduce((sum, l) => sum + l.grammarPoints.reduce((s, p) => s + p.examples.length, 0), 0);
  console.log(`Total Grammar Points: ${totalPoints}, Total Examples: ${totalExamples}`);

  lessons.forEach(l => {
    console.log(` -> Bài ${l.lessonId} (${l.lessonTitleZh}): ${l.grammarPoints.length} points (${l.grammarPoints.map(p => p.title).join('; ')})`);
  });

  // 1. Write frontend/grammar_hsk2_v2.js
  const jsContent = `export const HSK2_V2_STRUCTURED_GRAMMAR = ${JSON.stringify(lessons, null, 2)};\nif (typeof window !== 'undefined') {\n  window.HSK2_V2_STRUCTURED_GRAMMAR = HSK2_V2_STRUCTURED_GRAMMAR;\n}\n`;
  const outJsPath = path.join(frontendDir, 'grammar_hsk2_v2.js');
  fs.writeFileSync(outJsPath, jsContent, 'utf8');
  console.log('Written:', outJsPath);

  // 2. Update backend/hsk_grammar_structured.json
  const jsonPath = path.join(backendDir, 'hsk_grammar_structured.json');
  if (fs.existsSync(jsonPath)) {
    const masterData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    masterData.hsk2_v2 = {
      level: "HSK 2",
      version: "2.0",
      title: "Tổng Hợp Ngữ Pháp HSK 2 Chuẩn 2.0 (15 Bài Học Chi Tiết)",
      totalPoints: totalPoints,
      lessons: lessons
    };
    fs.writeFileSync(jsonPath, JSON.stringify(masterData, null, 2), 'utf8');
    console.log('Updated backend/hsk_grammar_structured.json with hsk2_v2');
  }

  // 3. Update frontend/grammar_structured.js directly from masterData
  const structuredJsPath = path.join(frontendDir, 'grammar_structured.js');
  if (fs.existsSync(jsonPath)) {
    const masterData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const structuredJsContent = `export const FULL_STRUCTURED_GRAMMAR = ${JSON.stringify(masterData, null, 2)};\nwindow.FULL_STRUCTURED_GRAMMAR = FULL_STRUCTURED_GRAMMAR;\n`;
    fs.writeFileSync(structuredJsPath, structuredJsContent, 'utf8');
    console.log('Updated frontend/grammar_structured.js with hsk2_v2');
  }

  return lessons;
}

parseDocx().catch(err => {
  console.error('Error during parsing:', err);
  process.exit(1);
});
