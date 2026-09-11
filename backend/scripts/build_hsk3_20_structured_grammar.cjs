const fs = require('fs');
const path = require('path');
const mammoth = require('../node_modules/mammoth');
const cheerio = require('../node_modules/cheerio');
const pinyinPro = require('../node_modules/pinyin-pro');

const workspaceDir = path.resolve(__dirname, '../..');
const docxPath = path.join(workspaceDir, 'filetuvung', 'Ngữ pháp HSK 3 2.0.docx');
const frontendDir = path.join(workspaceDir, 'frontend');
const backendDir = path.join(workspaceDir, 'backend');

const lessonTitlesMap = {
  1: { zh: '周末你有什么打算？', vi: 'Cuối tuần bạn có dự định gì?' },
  2: { zh: '他什么时候回来？', vi: 'Khi nào anh ấy quay về?' },
  3: { zh: '桌子上放着很多饮料', vi: 'Trên bàn để rất nhiều đồ uống' },
  4: { zh: '她总是笑着跟客人说话', vi: 'Cô ấy luôn cười khi nói chuyện với khách hàng' },
  5: { zh: '我最近越来越胖了', vi: 'Dạo này tôi càng ngày càng béo ra' },
  6: { zh: '怎么突然找不到了？', vi: 'Sao bỗng dưng lại không tìm thấy rồi?' },
  7: { zh: '我跟她都认识五年了', vi: 'Tôi và cô ấy quen nhau 5 năm rồi' },
  8: { zh: '你去哪儿我就去哪儿', vi: 'Bạn đi đâu tôi đi đó' },
  9: { zh: '她的汉语说得跟中国人一样好', vi: 'Cô ấy nói tiếng Trung hay như người Trung Quốc vậy' },
  10: { zh: '数学比历史难多了', vi: 'Toán khó hơn Lịch sử nhiều' },
  11: { zh: '别忘了把空调关了', vi: 'Đừng quên tắt điều hòa nhé' },
  12: { zh: '把重要的东西放在我这儿吧', vi: 'Để những thứ quan trọng ở chỗ tôi đi' },
  13: { zh: '我是走回来的', vi: 'Tôi đi bộ về' },
  14: { zh: '你把水果拿过来', vi: 'Bạn mang hoa quả lại đây' },
  15: { zh: '其他都没什么问题', vi: 'Những cái khác đều không có vấn đề gì' },
  16: { zh: '我现在累得下了班就想睡觉', vi: 'Bây giờ tôi mệt đến mức tan làm chỉ muốn đi ngủ' },
  17: { zh: '谁都有办法看好你的“病”', vi: 'Ai cũng có cách chữa khỏi "bệnh" cho bạn' },
  18: { zh: '我相信他们会同意的', vi: 'Tôi tin họ sẽ đồng ý' },
  19: { zh: '你没看出来吗？', vi: 'Bạn không nhận ra à?' },
  20: { zh: '我被他影响了', vi: 'Tôi bị anh ấy ảnh hưởng rồi' }
};

async function buildHsk3V2Grammar() {
  console.log('Reading DOCX from:', docxPath);
  if (!fs.existsSync(docxPath)) {
    throw new Error('DOCX file not found: ' + docxPath);
  }

  const { value: html } = await mammoth.convertToHtml({ path: docxPath });
  const $ = cheerio.load(html);

  const elements = $('body').children().toArray();
  const lessons = [];
  let currentLesson = null;
  let currentPoint = null;
  let currentSectionMode = '';

  // Skip Table of Contents at the beginning (before index 40)
  for (let i = 41; i < elements.length; i++) {
    const el = elements[i];
    const tagName = el.tagName.toLowerCase();
    const text = $(el).text().trim();

    // 1. Check if Lesson header (e.g. "BÀI 1", "BÀI 20")
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
      const meta = lessonTitlesMap[lId] || { zh: `Bài ${lId}`, vi: '' };
      currentLesson = {
        lessonId: lId,
        lessonKey: `Bài ${lId}`,
        lessonTitleZh: meta.zh,
        lessonTitleVi: meta.vi,
        lessonTitleFull: `Bài ${lId}: ${meta.zh} (HSK 3 v2.0)`,
        grammarPoints: []
      };
      currentSectionMode = '';
      continue;
    }

    if (!currentLesson) continue;

    // 2. Check if Grammar Point header (e.g. "NP 1: ...", "NP 2: ...")
    const npMatch = text.match(/^(?:NP\s*(\d+)|(\d+)\.\s*NP\s*(\d+))[:\s\-\.]*(.*)/i);
    if (npMatch && text.length < 150 && !text.includes('Ví dụ:')) {
      // Special handle for Bài 15 where NP 2 appears twice (linh hoạt & phiếm chỉ)
      if (currentLesson.lessonId === 15 && currentPoint && currentPoint.title.includes('linh hoạt') && text.includes('phiếm chỉ')) {
        // Merge into currentPoint
        currentPoint.title = 'Đại từ nghi vấn dùng linh hoạt & phiếm chỉ: 什么';
        currentPoint.explanation += '\n• Biểu thị tính tùy ý, không giới hạn hoặc thay thế cho sự vật/hành động không xác định ("bất kỳ cái gì / cái gì cũng...").';
        currentSectionMode = 'usage';
        continue;
      }

      if (currentPoint) {
        currentLesson.grammarPoints.push(currentPoint);
      }
      const pNum = currentLesson.grammarPoints.length + 1;
      let cleanTitle = (npMatch[4] || text).replace(/^(?:NP\s*\d+[:\s\-\.]*)/i, '').trim();
      if (!cleanTitle) cleanTitle = `Điểm ngữ pháp ${pNum}`;

      currentPoint = {
        id: `hsk3_20_b${currentLesson.lessonId}_g${pNum}`,
        num: pNum,
        title: cleanTitle,
        explanation: '',
        formula: '',
        note: '',
        examples: [],
        tables: []
      };
      currentSectionMode = '';
      continue;
    }

    if (!currentPoint) continue;

    // 3. Table parser (examples or comparison table)
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
        if (/^Ví dụ$/i.test(col1) && /^Nghĩa$/i.test(col2)) return;

        if (col1 && !col2) {
          if (currentPoint.note) currentPoint.note += `\n• ${col1}`;
          else currentPoint.note = `• ${col1}`;
          return;
        }

        // Clean up numbering (e.g. "1. 饭做好了。" -> "饭做好了。")
        let zh = col1.replace(/^\d+[\.\s、]\s*/, '').trim();
        let vi = col2 ? col2.replace(/^\d+[\.\s、]\s*/, '').trim() : '';

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
      continue;
    }

    // 4. Section Markers
    if (/^-\s*Cách dùng\s*[:\s\-]/i.test(text) || /^Cách dùng\s*[:\s\-]/i.test(text)) {
      currentSectionMode = 'usage';
      const exp = text.replace(/^-\s*(?:Cách dùng)\s*[:\s\-]\s*/i, '').trim();
      if (exp) {
        currentPoint.explanation = currentPoint.explanation ? `${currentPoint.explanation}\n${exp}` : exp;
      }
      continue;
    }

    if (/^-\s*Công thức\s*[:\s\-]/i.test(text) || /^Công thức\s*[:\s\-]/i.test(text) || /^Cấu trúc\s*[:\s\-]/i.test(text)) {
      currentSectionMode = 'formula';
      const f = text.replace(/^-\s*(?:Công thức|Cấu trúc)\s*[:\s\-]\s*/i, '').trim();
      if (f) {
        currentPoint.formula = currentPoint.formula ? `${currentPoint.formula}\n${f}` : f;
      }
      continue;
    }

    if (/^-\s*Lưu ý\s*[:\s\-]/i.test(text) || /^-\s*Chú thích\s*[:\s\-]/i.test(text) || /^Lưu ý\s*[:\s\-]/i.test(text) || /^Chú thích\s*[:\s\-]/i.test(text)) {
      currentSectionMode = 'note';
      const n = text.replace(/^-\s*(?:Lưu ý|Chú thích|Chú ý)\s*[:\s\-]\s*/i, '').trim();
      if (n) {
        currentPoint.note = currentPoint.note ? `${currentPoint.note}\n${n}` : n;
      }
      continue;
    }

    if (tagName === 'ul' || tagName === 'ol') {
      const listItems = [];
      $(el).find('li').each((_, li) => {
        listItems.push($(li).text().trim());
      });
      const listText = listItems.join('\n• ');
      if (listText) {
        if (currentSectionMode === 'note') {
          currentPoint.note = currentPoint.note ? `${currentPoint.note}\n• ${listText}` : `• ${listText}`;
        } else {
          currentPoint.explanation = currentPoint.explanation ? `${currentPoint.explanation}\n• ${listText}` : `• ${listText}`;
        }
      }
      continue;
    }

    // 5. Continuation lines based on mode
    if (text) {
      if (currentSectionMode === 'formula') {
        currentPoint.formula = currentPoint.formula ? `${currentPoint.formula}\n${text}` : text;
      } else if (currentSectionMode === 'note') {
        currentPoint.note = currentPoint.note ? `${currentPoint.note}\n${text}` : text;
      } else if (currentSectionMode === 'usage') {
        currentPoint.explanation = currentPoint.explanation ? `${currentPoint.explanation}\n${text}` : text;
      } else {
        if (!currentPoint.explanation) {
          currentPoint.explanation = text;
        } else {
          currentPoint.explanation += `\n${text}`;
        }
      }
    }
  }

  // Push final lesson
  if (currentLesson) {
    if (currentPoint) {
      currentLesson.grammarPoints.push(currentPoint);
    }
    lessons.push(currentLesson);
  }

  // Format and refine points
  lessons.forEach(les => {
    les.grammarPoints.forEach((p, idx) => {
      p.num = idx + 1;
      p.id = `hsk3_20_b${les.lessonId}_g${p.num}`;
      if (p.formula) p.formula = p.formula.trim();
      if (p.explanation) p.explanation = p.explanation.trim();
      if (p.note) p.note = p.note.trim();
    });
  });

  console.log(`Successfully parsed ${lessons.length} lessons for HSK 3 (v2.0)!`);
  const totalPoints = lessons.reduce((sum, l) => sum + l.grammarPoints.length, 0);
  const totalExamples = lessons.reduce((sum, l) => sum + l.grammarPoints.reduce((s, p) => s + p.examples.length, 0), 0);
  console.log(`Total Grammar Points: ${totalPoints}, Total Examples: ${totalExamples}`);

  lessons.forEach(l => {
    console.log(` -> Bài ${l.lessonId} (${l.lessonTitleZh}): ${l.grammarPoints.length} NP (${l.grammarPoints.map(p => p.title).join('; ')})`);
  });

  // 1. Write frontend/grammar_hsk3_v2.js (file mới cho frontend)
  const jsContent = `export const HSK3_V2_STRUCTURED_GRAMMAR = ${JSON.stringify(lessons, null, 2)};\nif (typeof window !== 'undefined') {\n  window.HSK3_V2_STRUCTURED_GRAMMAR = HSK3_V2_STRUCTURED_GRAMMAR;\n}\n`;
  const outJsPath = path.join(frontendDir, 'grammar_hsk3_v2.js');
  fs.writeFileSync(outJsPath, jsContent, 'utf8');
  console.log('✅ Created:', outJsPath);

  // 2. Write backend/hsk3_v2_structured_grammar.json (file mới cho backend)
  const backendJsonPath = path.join(backendDir, 'hsk3_v2_structured_grammar.json');
  fs.writeFileSync(backendJsonPath, JSON.stringify(lessons, null, 2), 'utf8');
  console.log('✅ Created:', backendJsonPath);

  // 3. Update backend/hsk_grammar_structured.json
  const jsonPath = path.join(backendDir, 'hsk_grammar_structured.json');
  let masterData = {};
  if (fs.existsSync(jsonPath)) {
    masterData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  }
  masterData.hsk3_v2 = {
    level: "HSK 3",
    version: "2.0",
    title: "Tổng Hợp Ngữ Pháp HSK 3 Chuẩn 2.0 (20 Bài Học Chi Tiết)",
    totalPoints: totalPoints,
    lessons: lessons
  };
  fs.writeFileSync(jsonPath, JSON.stringify(masterData, null, 2), 'utf8');
  console.log('✅ Updated backend/hsk_grammar_structured.json with hsk3_v2');

  // 4. Update frontend/grammar_structured.js
  const structuredJsPath = path.join(frontendDir, 'grammar_structured.js');
  const structuredJsContent = `export const FULL_STRUCTURED_GRAMMAR = ${JSON.stringify(masterData, null, 2)};\nwindow.FULL_STRUCTURED_GRAMMAR = FULL_STRUCTURED_GRAMMAR;\n`;
  fs.writeFileSync(structuredJsPath, structuredJsContent, 'utf8');
  console.log('✅ Updated frontend/grammar_structured.js with hsk3_v2');

  return { lessons, totalPoints, totalExamples };
}

buildHsk3V2Grammar().catch(err => {
  console.error('Error building HSK 3 2.0 grammar:', err);
  process.exit(1);
});
