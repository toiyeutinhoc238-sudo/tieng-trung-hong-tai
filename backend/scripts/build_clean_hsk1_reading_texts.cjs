const mammoth = require('mammoth');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

async function buildCleanTexts() {
  const filePath = path.resolve('../filetuvung/Bài khoá HSK 1 3.0.docx');
  const res = await mammoth.convertToHtml({ path: filePath });
  const $ = cheerio.load(res.value);

  const textBlocks = [];
  $('p, ul, ol, h1, h2, h3, h4, table, tr, td').each((_, el) => {
    const t = $(el).text().trim();
    if (t) textBlocks.push(t);
  });

  const lessonsMap = {};

  let currentLessonId = 0;
  let currentDialogueIndex = 0;
  let inQuiz = false;
  let currentQuiz = null;

  const ChineseToNumber = {
    '一': 1, '二': 2, '三': 3, '四': 4, '五': 5,
    '六': 6, '七': 7, '八': 8, '九': 9, '十': 10,
    '十一': 11, '十二': 12, '十三': 13, '十四': 14, '十五': 15
  };

  const getLessonNum = (str) => {
    const match = str.match(/第([一二三四五六七八九十\d]+)课|第(\d+)课|Bài\s*(\d+)/i);
    if (!match) return null;
    const raw = match[1] || match[2] || match[3];
    if (/^\d+$/.test(raw)) return parseInt(raw, 10);
    return ChineseToNumber[raw] || null;
  };

  const getDialogueNum = (str) => {
    const match = str.match(/课文([一二三四五六七八九十\d]+)|课文\s*(\d+)/i);
    if (!match) return null;
    const raw = match[1] || match[2];
    if (/^\d+$/.test(raw)) return parseInt(raw, 10);
    return ChineseToNumber[raw] || null;
  };

  for (let i = 0; i < textBlocks.length; i++) {
    const block = textBlocks[i];

    // Check lesson header
    const lesNum = getLessonNum(block);
    if (lesNum) {
      currentLessonId = lesNum;
      currentDialogueIndex = 0;
      if (!lessonsMap[currentLessonId]) {
        const titleParts = block.split(/[:：]/);
        const titleStr = titleParts.length > 1 ? titleParts.slice(1).join('：').trim() : `Bài ${currentLessonId}`;
        lessonsMap[currentLessonId] = {
          lessonId: currentLessonId,
          lessonTitle: `Bài ${currentLessonId}: ${titleStr}`,
          dialogues: []
        };
      }
      continue;
    }

    if (!currentLessonId) currentLessonId = 1;
    if (!lessonsMap[currentLessonId]) {
      lessonsMap[currentLessonId] = {
        lessonId: currentLessonId,
        lessonTitle: `Bài ${currentLessonId}`,
        dialogues: []
      };
    }

    // Check dialogue header e.g. "课文1:", "课文二", "课文三："
    const diagNum = getDialogueNum(block);
    if (diagNum) {
      // If we already have 3 dialogues and get another "课文三", ignore or clamp to 3
      let targetIdx = diagNum;
      if (targetIdx > 3) targetIdx = 3;

      let currentDiag = lessonsMap[currentLessonId].dialogues.find(d => d.id === targetIdx);
      if (!currentDiag) {
        currentDiag = {
          id: targetIdx,
          title: `Bài Khóa ${targetIdx}`,
          audio: `/audio/hsk1_texts/${currentLessonId}-${(targetIdx * 2) - 1}.mp3`,
          lines: [],
          notes: [],
          quiz: null
        };
        lessonsMap[currentLessonId].dialogues.push(currentDiag);
      }
      currentDialogueIndex = targetIdx;
      inQuiz = false;
      continue;
    }

    if (currentDialogueIndex === 0) currentDialogueIndex = 1;
    let currentDiag = lessonsMap[currentLessonId].dialogues.find(d => d.id === currentDialogueIndex);
    if (!currentDiag) {
      currentDiag = {
        id: currentDialogueIndex,
        title: `Bài Khóa ${currentDialogueIndex}`,
        audio: `/audio/hsk1_texts/${currentLessonId}-${(currentDialogueIndex * 2) - 1}.mp3`,
        lines: [],
        notes: [],
        quiz: null
      };
      lessonsMap[currentLessonId].dialogues.push(currentDiag);
    }

    // Check if line is quiz prompt or question
    if (block.includes('听两遍') || block.includes('拼两遍') || block.includes('选择正确答案')) {
      inQuiz = true;
      if (!currentDiag.quiz) {
        currentDiag.quiz = {
          instruction: 'Nghe file audio bài khóa và chọn đáp án đúng cho 2 câu hỏi bên dưới:',
          questions: []
        };
      }
      continue;
    }

    if (block.startsWith('Chú ý:') || block.startsWith('Chú ý :')) {
      const noteText = block.replace(/^Chú ý\s*[:：]\s*/i, '').trim();
      currentDiag.notes.push(noteText);
      continue;
    }

    // Question line e.g. "（1）大医院里（……）。" or "(1) ..."
    if (inQuiz && (block.match(/^[（\(][11一][）\)]/)|| block.match(/^[（\(][22二][）\)]/))) {
      let qNum = block.includes('2') || block.includes('二') ? 2 : 1;
      let qObj = currentDiag.quiz.questions.find(q => q.id === qNum);
      if (!qObj) {
        qObj = { id: qNum, question: block, options: [] };
        currentDiag.quiz.questions.push(qObj);
      } else {
        qObj.question = block;
      }
      continue;
    }

    // Options line if in Quiz
    if (inQuiz && currentDiag.quiz && currentDiag.quiz.questions.length > 0 && !block.includes('：') && !block.includes(':')) {
      const lastQ = currentDiag.quiz.questions[currentDiag.quiz.questions.length - 1];
      if (lastQ && lastQ.options.length === 0) {
        // Options e.g. "妹妹 姐姐 哥哥" or "人很少 病人多 医生不忙"
        const opts = block.split(/\s+/).filter(o => o.trim().length > 0);
        lastQ.options = opts;
        continue;
      }
    }

    // Speaker line e.g. "王一飞：AI小语，你好！"
    const parts = block.split(/[:：]/);
    if (parts.length > 1 && parts[0].trim().length <= 12 && !parts[0].includes('(') && !parts[0].includes('（')) {
      const speaker = parts[0].trim();
      const zhText = parts.slice(1).join('：').trim();
      if (zhText) {
        currentDiag.lines.push({
          speaker,
          zh: zhText,
          pinyin: '',
          vi: ''
        });
      }
    }
  }

  const outputLessons = Object.values(lessonsMap).sort((a, b) => a.lessonId - b.lessonId);

  // Ensure each lesson has max 3 dialogues
  outputLessons.forEach(l => {
    l.dialogues = l.dialogues.slice(0, 3);
  });

  fs.writeFileSync('../frontend/public/hsk1_reading_texts.json', JSON.stringify(outputLessons, null, 2));
  console.log('Saved', outputLessons.length, 'lessons to ../frontend/public/hsk1_reading_texts.json!');
}

buildCleanTexts().catch(console.error);
