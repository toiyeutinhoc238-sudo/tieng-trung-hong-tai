const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const mammoth = require('../node_modules/mammoth');
const cheerio = require('../node_modules/cheerio');
const pinyinPro = require('pinyin-pro');

const rootDir = path.join(__dirname, '../..');
const filetuvungDir = path.join(rootDir, 'filetuvung');
const backendDir = path.join(rootDir, 'backend');
const frontendDir = path.join(rootDir, 'frontend');

// =========================================================================
// 1. IMPORT TV HSK 1 2.0 NEW VER3.xlsx -> backend/database.json
// =========================================================================
function importVocabHsk1Ver3() {
  console.log('\n--- 1. Importing TV HSK 1 2.0 NEW VER3.xlsx ---');
  const excelPath = path.join(filetuvungDir, 'TV HSK 1 2.0 NEW VER3.xlsx');
  const dbPath = path.join(backendDir, 'database.json');

  const wb = xlsx.readFile(excelPath);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  let currentLessonId = 0;
  let currentLessonTitle = '';
  const parsedWords = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;

    const baiRaw = r[0];
    const titleRaw = r[1];
    const word = (r[2] || '').toString().trim();

    if (!word) continue;

    if (baiRaw !== undefined && baiRaw !== null && String(baiRaw).trim() !== '') {
      const match = String(baiRaw).match(/\d+/);
      if (match) {
        currentLessonId = parseInt(match[0], 10);
      } else {
        currentLessonId++;
      }
    }

    if (titleRaw !== undefined && titleRaw !== null && String(titleRaw).trim() !== '') {
      currentLessonTitle = String(titleRaw).trim();
    }

    let cleanTitle = currentLessonTitle;
    cleanTitle = cleanTitle.replace(/^Bài\s*\d+\s*[:：\-–]?\s*/i, '').trim();
    const formattedLessonTitle = `Bài ${currentLessonId}: ${cleanTitle}`;

    const pinyin = (r[3] || '').toString().trim();
    const category = (r[4] || '').toString().trim() || 'Từ vựng';
    const meaning = (r[5] || '').toString().trim();
    const note = (r[6] || '').toString().trim();
    const example_zh = (r[7] || '').toString().trim();
    const example_vi = (r[8] || '').toString().trim();
    const question = (r[9] || '').toString().trim();
    const answer = (r[10] || '').toString().trim();

    parsedWords.push({
      word,
      pinyin,
      meaning,
      level: 1,
      curriculum: 'hsk',
      hskVersion: '2.0',
      volume: null,
      lessonId: currentLessonId,
      lessonTitle: formattedLessonTitle,
      lessonDesc: `Toàn bộ từ vựng ${formattedLessonTitle} chuẩn HSK 1 (v2.0)`,
      category,
      example_zh,
      example_vi,
      question,
      answer,
      note
    });
  }

  console.log(`Parsed ${parsedWords.length} vocabulary items from Excel.`);

  let db = [];
  if (fs.existsSync(dbPath)) {
    db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  }

  const existingHsk1Map = new Map();
  db.forEach(w => {
    if (w.level === 1 && w.hskVersion === '2.0' && !w.isCustom) {
      existingHsk1Map.set(w.word.trim(), w);
    }
  });

  const finalHsk1Items = parsedWords.map((pw, index) => {
    const existing = existingHsk1Map.get(pw.word);
    if (existing) {
      return Object.assign({}, existing, {
        pinyin: pw.pinyin || existing.pinyin,
        meaning: pw.meaning || existing.meaning,
        category: pw.category || existing.category,
        level: 1,
        curriculum: 'hsk',
        hskVersion: '2.0',
        volume: null,
        lessonId: pw.lessonId,
        lessonTitle: pw.lessonTitle,
        lessonDesc: pw.lessonDesc,
        example_zh: pw.example_zh,
        example_vi: pw.example_vi,
        question: pw.question,
        answer: pw.answer,
        note: pw.note
      });
    } else {
      return Object.assign({}, pw, {
        id: 200000 + index + 1,
        isMemorized: false,
        isStarred: false,
        isCustom: false
      });
    }
  });

  const nonHsk1Items = db.filter(w => !(w.level === 1 && w.hskVersion === '2.0' && !w.isCustom));
  const updatedDb = [...finalHsk1Items, ...nonHsk1Items];

  fs.writeFileSync(dbPath, JSON.stringify(updatedDb, null, 2), 'utf8');
  console.log(`Saved ${updatedDb.length} items to database.json (Updated HSK 1 v2.0).`);
}

// =========================================================================
// 2. PARSE Ngữ pháp HSK 3 3.0 new.docx -> frontend/grammar_hsk3.js
// =========================================================================
async function buildHsk3Grammar() {
  console.log('\n--- 2. Building HSK 3 (v3.0) Structured Grammar ---');
  const fullPath = path.join(filetuvungDir, 'Ngữ pháp HSK 3 3.0 new.docx');
  const buffer = fs.readFileSync(fullPath);
  const htmlResult = await mammoth.convertToHtml({ buffer });
  const html = htmlResult.value;

  const $ = cheerio.load(html);
  const elements = $('body > *');

  const lessons = [];
  let currentLesson = null;
  let currentPoint = null;

  elements.each((i, el) => {
    const tagName = el.tagName.toLowerCase();
    const text = $(el).text().trim();

    // Check if this is a Lesson header
    const baiMatch = text.match(/^BÀI\s+(\d+)/i);
    if (baiMatch) {
      if (currentLesson) {
        if (currentPoint) {
          currentLesson.grammarPoints.push(currentPoint);
          currentPoint = null;
        }
        lessons.push(currentLesson);
      }
      const lId = parseInt(baiMatch[1], 10);
      currentLesson = {
        lessonId: lId,
        lessonKey: `Bài ${lId}`,
        lessonTitleZh: `Bài ${lId}`,
        lessonTitleFull: `Bài ${lId} (HSK 3 v3.0)`,
        grammarPoints: []
      };
      return;
    }

    if (!currentLesson) return;

    // Check if this is a Grammar Point title
    const isPointHeader = (tagName === 'ol' || tagName === 'ul' || tagName === 'p') &&
      (/(?:NP\s*\d+|CỤM TỪ|CÁCH DÙNG|ĐỊNH NGỮ|PHÓ TỪ|BỔ NGỮ|CẤU TRÚC|CÂU|GIỚI TỪ|TRỢ TỪ|ĐẠI TỪ|\d+\.\s+[A-Z\u00C0-\u1EF9])/i.test(text)) &&
      !text.startsWith('Cách dùng:') && !text.startsWith('Công thức:') && !text.startsWith('Lưu ý:') && !text.startsWith('Ví dụ:') &&
      !text.startsWith('Dùng trong câu trần thuật') && !text.startsWith('Địa điểm + Động từ') && !text.startsWith('Bổ ngữ thời lượng dùng để') &&
      !text.startsWith('Đây là lý do khiến') && !text.startsWith('Với các động từ không duy trì') && !text.startsWith('Biểu thị tình huống') && !text.startsWith('Dùng trong câu kể về');

    if (isPointHeader && text.length < 130) {
      if (currentPoint) {
        currentLesson.grammarPoints.push(currentPoint);
      }
      const pNum = currentLesson.grammarPoints.length + 1;
      let cleanTitle = text.replace(/^(?:NP\s*\d+[:\s\-\.]*|\d+[\.\:\-\s]+)/i, '').trim();
      cleanTitle = cleanTitle.replace(/^BÀI\s+\d+[:\.\s]*/i, '').trim();
      if (!cleanTitle) cleanTitle = text;

      currentPoint = {
        id: `hsk3_b${currentLesson.lessonId}_g${pNum}`,
        num: pNum,
        title: cleanTitle,
        explanation: '',
        formula: '',
        note: '',
        examples: [],
        tables: []
      };
      return;
    }

    if (!currentPoint) {
      const pNum = currentLesson.grammarPoints.length + 1;
      currentPoint = {
        id: `hsk3_b${currentLesson.lessonId}_g${pNum}`,
        num: pNum,
        title: `Điểm ngữ pháp ${pNum}`,
        explanation: '',
        formula: '',
        note: '',
        examples: [],
        tables: []
      };
    }

    // Process content for currentPoint
    if (tagName === 'table') {
      const headers = [];
      const rows = [];
      $(el).find('tr').each((rIdx, tr) => {
        const rowCells = [];
        $(tr).find('th, td').each((cIdx, td) => {
          rowCells.push($(td).text().trim());
        });
        if (rowCells.length > 0) {
          if (rIdx === 0 && ($(tr).find('th').length > 0 || rowCells.some(c => c.toLowerCase().includes('ví dụ') || c.toLowerCase().includes('stt') || c.toLowerCase().includes('câu')))) {
            headers.push(...rowCells);
          } else {
            rows.push(rowCells);
          }
        }
      });

      const isExampleTable = headers.some(h => /ví dụ|tiếng trung|câu/i.test(h)) || rows.some(r => /[\u4e00-\u9fa5]/.test(r[1] || r[0] || ''));
      if (isExampleTable && (headers.length <= 3 || rows[0]?.length <= 3)) {
        rows.forEach(r => {
          let zh = '', vi = '';
          if (r.length === 3) {
            zh = r[1];
            vi = r[2];
          } else if (r.length === 2) {
            zh = r[0];
            vi = r[1];
          }
          if (zh && /[\u4e00-\u9fa5]/.test(zh)) {
            const pinyin = pinyinPro.pinyin(zh, { toneType: 'symbol' });
            currentPoint.examples.push({
              rawZh: `${zh} (${vi || ''})`,
              zh,
              pinyin,
              vi: vi || ''
            });
          }
        });
      } else if (headers.length > 0 || rows.length > 0) {
        currentPoint.tables.push({
          title: `Bảng tổng hợp & Đối chiếu: ${currentPoint.title}`,
          headers: headers.length > 0 ? headers : rows[0],
          rows: headers.length > 0 ? rows : rows.slice(1)
        });
      }
      return;
    }

    if (tagName === 'ol' || tagName === 'ul') {
      $(el).find('li').each((liIdx, li) => {
        const liText = $(li).text().trim();
        // Check if li is an example sentence: e.g. "他向我走过来。(Anh ấy đi về phía tôi.)"
        const exMatch = liText.match(/^([\u4e00-\u9fa5a-zA-Z0-9\s，。！？、…—]+)[\(（]([^\)）]+)[\)）]/);
        if (exMatch && /[\u4e00-\u9fa5]/.test(exMatch[1])) {
          const zh = exMatch[1].trim();
          const vi = exMatch[2].trim();
          const pinyin = pinyinPro.pinyin(zh, { toneType: 'symbol' });
          currentPoint.examples.push({
            rawZh: `${zh} (${vi})`,
            zh,
            pinyin,
            vi
          });
          return;
        }

        if (/^Công thức\s*[:\s\-]/i.test(liText)) {
          const f = liText.replace(/^Công thức\s*[:\s\-]\s*/i, '').trim();
          currentPoint.formula = currentPoint.formula ? `${currentPoint.formula}\n${f}` : f;
        } else if (/^Cách dùng\s*[:\s\-]/i.test(liText)) {
          const exp = liText.replace(/^Cách dùng\s*[:\s\-]\s*/i, '').trim();
          currentPoint.explanation = currentPoint.explanation ? `${currentPoint.explanation}\n${exp}` : exp;
        } else if (/^Lưu ý\s*[:\s\-]/i.test(liText) || /^Chú ý\s*[:\s\-]/i.test(liText)) {
          const n = liText.replace(/^(?:Lưu ý|Chú ý)\s*[:\s\-]\s*/i, '').trim();
          currentPoint.note = currentPoint.note ? `${currentPoint.note}\n${n}` : n;
        } else if (liText) {
          if (!currentPoint.explanation) currentPoint.explanation = liText;
          else currentPoint.explanation += `\n• ${liText}`;
        }
      });
      return;
    }

    if (/^Cách dùng\s*[:\s\-]/i.test(text)) {
      const exp = text.replace(/^Cách dùng\s*[:\s\-]\s*/i, '').trim();
      currentPoint.explanation = currentPoint.explanation ? `${currentPoint.explanation}\n${exp}` : exp;
    } else if (/^Công thức\s*[:\s\-]/i.test(text)) {
      const f = text.replace(/^Công thức\s*[:\s\-]\s*/i, '').trim();
      currentPoint.formula = currentPoint.formula ? `${currentPoint.formula}\n${f}` : f;
    } else if (/^Lưu ý\s*[:\s\-]/i.test(text) || /^Chú ý\s*[:\s\-]/i.test(text) || /^Mẹo\s*[:\s\-]/i.test(text)) {
      const n = text.replace(/^(?:Lưu ý|Chú ý|Mẹo)\s*(?:& Mẹo nhớ)?\s*[:\s\-]\s*/i, '').trim();
      currentPoint.note = currentPoint.note ? `${currentPoint.note}\n${n}` : n;
    } else if (text) {
      if (!currentPoint.explanation && !currentPoint.formula) {
        currentPoint.explanation = text;
      } else if (currentPoint.note) {
        currentPoint.note += `\n${text}`;
      } else {
        currentPoint.explanation += `\n${text}`;
      }
    }
  });

  if (currentLesson) {
    if (currentPoint) {
      currentLesson.grammarPoints.push(currentPoint);
    }
    lessons.push(currentLesson);
  }

  // Filter out any empty grammar points and clean up fields
  lessons.forEach(les => {
    les.grammarPoints = les.grammarPoints.filter(p => p.title && (p.explanation || p.formula || p.examples.length > 0));
    les.grammarPoints.forEach((p, idx) => {
      p.num = idx + 1;
      p.id = `hsk3_b${les.lessonId}_g${p.num}`;
      if (!p.formula && p.title.includes('……')) {
        p.formula = p.title;
      }
    });
  });

  console.log(`Successfully parsed ${lessons.length} lessons for HSK 3 (v3.0)! Total points: ${lessons.reduce((a, b) => a + b.grammarPoints.length, 0)}`);

  // Write to frontend/grammar_hsk3.js
  const hsk3JsContent = `export const HSK3_STRUCTURED_GRAMMAR = ${JSON.stringify(lessons, null, 2)};\nwindow.HSK3_STRUCTURED_GRAMMAR = HSK3_STRUCTURED_GRAMMAR;\n`;
  fs.writeFileSync(path.join(frontendDir, 'grammar_hsk3.js'), hsk3JsContent, 'utf8');
  console.log('Saved frontend/grammar_hsk3.js');

  return lessons;
}

// =========================================================================
// 3. PARSE Ngữ pháp HSK 1 2.0 NEW VER2.docx -> frontend/grammar_hsk1_v2.js
// =========================================================================
async function buildHsk1V2Grammar() {
  console.log('\n--- 3. Building HSK 1 (v2.0) Structured Grammar ---');
  const fullPath = path.join(filetuvungDir, 'Ngữ pháp HSK 1 2.0 NEW VER2.docx');
  const buffer = fs.readFileSync(fullPath);
  const htmlResult = await mammoth.convertToHtml({ buffer });
  const html = htmlResult.value;

  const $ = cheerio.load(html);
  const elements = $('body > *');

  const lessons = [];
  let currentLesson = null;
  let currentPoint = null;

  elements.each((i, el) => {
    const tagName = el.tagName.toLowerCase();
    const text = $(el).text().trim();

    // Check if this is a Lesson header (e.g. <p><strong>Bài 1</strong></p>, Bài 3, etc.)
    const baiMatch = text.match(/^Bài\s+(\d+)/i);
    if (baiMatch && text.length < 30) {
      if (currentLesson) {
        if (currentPoint) {
          currentLesson.grammarPoints.push(currentPoint);
          currentPoint = null;
        }
        lessons.push(currentLesson);
      }
      const lId = parseInt(baiMatch[1], 10);
      currentLesson = {
        lessonId: lId,
        lessonKey: `Bài ${lId}`,
        lessonTitleZh: `Bài ${lId}`,
        lessonTitleFull: `Bài ${lId} (HSK 1 v2.0)`,
        grammarPoints: []
      };
      return;
    }

    if (!currentLesson) return;

    // Check if point header (e.g. NP1:..., np2:..., Np 3:...)
    const npMatch = text.match(/^(?:np\s*(\d+)|(\d+)\.\s*np\s*(\d+))[:\s\-\.]*(.*)/i);
    if (npMatch && text.length < 120 && !text.includes('Ví dụ:') && !text.includes('Cấu trúc:')) {
      if (currentPoint) {
        currentLesson.grammarPoints.push(currentPoint);
      }
      const pNum = currentLesson.grammarPoints.length + 1;
      let cleanTitle = (npMatch[4] || text).replace(/^(?:np\s*\d+[:\s\-\.]*)/i, '').trim();
      if (!cleanTitle) cleanTitle = `Điểm ngữ pháp ${pNum}`;

      currentPoint = {
        id: `hsk1_20_b${currentLesson.lessonId}_g${pNum}`,
        num: pNum,
        title: cleanTitle,
        explanation: '',
        formula: '',
        note: '',
        examples: [],
        tables: []
      };
      return;
    }

    if (!currentPoint) {
      const pNum = currentLesson.grammarPoints.length + 1;
      currentPoint = {
        id: `hsk1_20_b${currentLesson.lessonId}_g${pNum}`,
        num: pNum,
        title: `Điểm ngữ pháp ${pNum}`,
        explanation: '',
        formula: '',
        note: '',
        examples: [],
        tables: []
      };
    }

    // Process content for currentPoint
    if (tagName === 'table') {
      const headers = [];
      const rows = [];
      $(el).find('tr').each((rIdx, tr) => {
        const rowCells = [];
        $(tr).find('th, td').each((cIdx, td) => {
          rowCells.push($(td).text().trim());
        });
        if (rowCells.length > 0) {
          if (rIdx === 0 && $(tr).find('th').length > 0) {
            headers.push(...rowCells);
          } else {
            rows.push(rowCells);
          }
        }
      });
      if (headers.length > 0 || rows.length > 0) {
        currentPoint.tables.push({
          title: `Bảng ngữ pháp: ${currentPoint.title}`,
          headers: headers.length > 0 ? headers : rows[0],
          rows: headers.length > 0 ? rows : rows.slice(1)
        });
      }
      return;
    }

    if (tagName === 'ol' || tagName === 'ul') {
      $(el).find('li').each((liIdx, li) => {
        const liText = $(li).text().trim();
        const exMatch = liText.match(/^([\u4e00-\u9fa5a-zA-Z0-9\s，。！？、…—]+)[\(（]([^\)）]+)[\)）]/);
        if (exMatch && /[\u4e00-\u9fa5]/.test(exMatch[1])) {
          const zh = exMatch[1].trim();
          const vi = exMatch[2].trim();
          const pinyin = pinyinPro.pinyin(zh, { toneType: 'symbol' });
          currentPoint.examples.push({
            rawZh: `${zh} (${vi})`,
            zh,
            pinyin,
            vi
          });
          return;
        }

        if (/^Cấu trúc\s*[:\s\-]/i.test(liText) || /^Công thức\s*[:\s\-]/i.test(liText)) {
          const f = liText.replace(/^(?:Cấu trúc|Công thức)\s*[:\s\-]\s*/i, '').trim();
          currentPoint.formula = currentPoint.formula ? `${currentPoint.formula}\n${f}` : f;
        } else if (/^Cách dùng\s*[:\s\-]/i.test(liText) || /^Ý nghĩa\s*[:\s\-]/i.test(liText)) {
          const exp = liText.replace(/^(?:Cách dùng|Ý nghĩa)\s*[:\s\-]\s*/i, '').trim();
          currentPoint.explanation = currentPoint.explanation ? `${currentPoint.explanation}\n${exp}` : exp;
        } else if (/^Lưu ý\s*[:\s\-]/i.test(liText) || /^Chú ý\s*[:\s\-]/i.test(liText)) {
          const n = liText.replace(/^(?:Lưu ý|Chú ý)\s*[:\s\-]\s*/i, '').trim();
          currentPoint.note = currentPoint.note ? `${currentPoint.note}\n${n}` : n;
        } else if (liText) {
          if (!currentPoint.explanation) currentPoint.explanation = liText;
          else currentPoint.explanation += `\n• ${liText}`;
        }
      });
      return;
    }

    if (/^Cấu trúc\s*[:\s\-]/i.test(text) || /^Công thức\s*[:\s\-]/i.test(text)) {
      const f = text.replace(/^(?:Cấu trúc|Công thức)\s*[:\s\-]\s*/i, '').trim();
      currentPoint.formula = currentPoint.formula ? `${currentPoint.formula}\n${f}` : f;
    } else if (/^Cách dùng\s*[:\s\-]/i.test(text) || /^Ý nghĩa\s*[:\s\-]/i.test(text)) {
      const exp = text.replace(/^(?:Cách dùng|Ý nghĩa)\s*[:\s\-]\s*/i, '').trim();
      currentPoint.explanation = currentPoint.explanation ? `${currentPoint.explanation}\n${exp}` : exp;
    } else if (/^Lưu ý\s*[:\s\-]/i.test(text) || /^Chú ý\s*[:\s\-]/i.test(text)) {
      const n = text.replace(/^(?:Lưu ý|Chú ý)\s*[:\s\-]\s*/i, '').trim();
      currentPoint.note = currentPoint.note ? `${currentPoint.note}\n${n}` : n;
    } else if (text) {
      if (!currentPoint.explanation && !currentPoint.formula) {
        currentPoint.explanation = text;
      } else if (currentPoint.note) {
        currentPoint.note += `\n${text}`;
      } else {
        currentPoint.explanation += `\n${text}`;
      }
    }
  });

  if (currentLesson) {
    if (currentPoint) {
      currentLesson.grammarPoints.push(currentPoint);
    }
    lessons.push(currentLesson);
  }

  lessons.forEach(les => {
    les.grammarPoints = les.grammarPoints.filter(p => p.title && (p.explanation || p.formula || p.examples.length > 0));
    les.grammarPoints.forEach((p, idx) => {
      p.num = idx + 1;
      p.id = `hsk1_20_b${les.lessonId}_g${p.num}`;
    });
  });

  console.log(`Successfully parsed ${lessons.length} lessons for HSK 1 (v2.0)!`);

  const hsk1V2JsContent = `export const HSK1_V2_STRUCTURED_GRAMMAR = ${JSON.stringify(lessons, null, 2)};\nwindow.HSK1_V2_STRUCTURED_GRAMMAR = HSK1_V2_STRUCTURED_GRAMMAR;\n`;
  fs.writeFileSync(path.join(frontendDir, 'grammar_hsk1_v2.js'), hsk1V2JsContent, 'utf8');
  console.log('Saved frontend/grammar_hsk1_v2.js');

  return lessons;
}

// =========================================================================
// 4. COMBINE AND UPDATE frontend/grammar_structured.js & backend/hsk_grammar_structured.json
// =========================================================================
async function updateStructuredMaster(hsk3Lessons, hsk1V2Lessons) {
  console.log('\n--- 4. Updating Master Grammar Files ---');
  
  // Read existing structured json
  const jsonPath = path.join(backendDir, 'hsk_grammar_structured.json');
  let masterData = {};
  if (fs.existsSync(jsonPath)) {
    masterData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }

  // Update HSK 3
  masterData.hsk3 = {
    level: "HSK 3",
    title: "Tổng Hợp Ngữ Pháp HSK 3 Chuẩn 3.0 (18 Bài Học Chi Tiết)",
    totalPoints: hsk3Lessons.reduce((a, b) => a + b.grammarPoints.length, 0),
    lessons: hsk3Lessons
  };

  // Update HSK 1 v2.0
  masterData.hsk1_v2 = {
    level: "HSK 1 (2.0)",
    title: "Tổng Hợp Ngữ Pháp HSK 1 Phiên Bản 2.0 (15 Bài)",
    totalPoints: hsk1V2Lessons.reduce((a, b) => a + b.grammarPoints.length, 0),
    lessons: hsk1V2Lessons
  };

  fs.writeFileSync(jsonPath, JSON.stringify(masterData, null, 2), 'utf8');
  console.log('Updated backend/hsk_grammar_structured.json');

  // Update frontend/grammar_structured.js
  const jsContent = `export const FULL_STRUCTURED_GRAMMAR = ${JSON.stringify(masterData, null, 2)};\nwindow.FULL_STRUCTURED_GRAMMAR = FULL_STRUCTURED_GRAMMAR;\n`;
  fs.writeFileSync(path.join(frontendDir, 'grammar_structured.js'), jsContent, 'utf8');
  console.log('Updated frontend/grammar_structured.js');
}

async function main() {
  importVocabHsk1Ver3();
  const hsk3Lessons = await buildHsk3Grammar();
  const hsk1V2Lessons = await buildHsk1V2Grammar();
  await updateStructuredMaster(hsk3Lessons, hsk1V2Lessons);
  console.log('\n✅ ALL 3 FILES HAVE BEEN FULLY INTEGRATED!');
}

main().catch(console.error);
