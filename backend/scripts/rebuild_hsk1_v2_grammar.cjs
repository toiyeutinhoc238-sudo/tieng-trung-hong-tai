const fs = require('fs');
const path = require('path');
const mammoth = require('../node_modules/mammoth');
const cheerio = require('../node_modules/cheerio');
const pinyinPro = require('../node_modules/pinyin-pro');

const workspaceDir = path.resolve(__dirname, '../..');
const docxPath = path.join(workspaceDir, 'filetuvung', 'Ngữ pháp HSK 1 2.0 NEW VER3.docx');
const frontendDir = path.join(workspaceDir, 'frontend');
const backendDir = path.join(workspaceDir, 'backend');

const hsk1_20_lessonTitles = {
  1: '你好',
  2: '谢谢你',
  3: '你叫什么名字',
  4: '她是我的汉语老师',
  5: '她女儿今年二十岁',
  6: '我会说汉语',
  7: '今天几号',
  8: '我想喝茶',
  9: '你儿子在哪儿工作',
  10: '我能坐这儿吗',
  11: '现在几点',
  12: '明天天气怎么样',
  13: '他在学做中国菜呢',
  14: '她买了不少衣服',
  15: '我是坐飞机来的'
};

async function parseHsk1V2() {
  console.log('Reading DOCX from:', docxPath);
  if (!fs.existsSync(docxPath)) {
    throw new Error('File not found: ' + docxPath);
  }

  const { value: html } = await mammoth.convertToHtml({ path: docxPath });
  const $ = cheerio.load(html);

  const lessons = [];
  let currentLesson = null;
  let currentPoint = null;

  function parseExampleLine(rawLine) {
    let line = rawLine.trim();
    if (!line) return null;

    // Pattern 0: - vi: zh (pinyin)
    // e.g. "- Chào bạn: 你好 (nǐ hǎo)" or "- Chào thầy/cô: 老师好 (lǎoshī hǎo)"
    let m0 = line.match(/^[\-–—]?\s*([a-zA-ZÀ-ỹ\s\/\(\),]+)\s*[:\-–—]\s*([\u4e00-\u9fa5]+)(?:\s*[\(（]([^\)）]+)[\)）])?/);
    if (m0 && /[\u4e00-\u9fa5]/.test(m0[2]) && /[a-zA-ZÀ-ỹ]/.test(m0[1])) {
      const vi = m0[1].trim();
      const zh = m0[2].trim();
      const pinyin = m0[3] ? m0[3].trim() : pinyinPro.pinyin(zh, { toneType: 'symbol' });
      return { zh, pinyin, vi };
    }

    // Pattern 1: zh (pinyin) - vi (or – or — or :)
    // e.g. "你在哪儿？(Nǐ zài nǎr?) - Bạn ở đâu?"
    let m = line.match(/^([\u4e00-\u9fa5a-zA-Z0-9\s，。！？、…—]+)[\(（]([^\)）]+)[\)）]\s*[\-–—:]\s*(.+)$/);
    if (m && /[\u4e00-\u9fa5]/.test(m[1])) {
      const zh = m[1].replace(/^(?:Ví dụ|Ví dụ\s*:|np\s*\d+|Khẳng định\s*:|Phủ định\s*:|Câu hỏi\s*:)\s*/i, '').trim();
      const vi = m[3].trim();
      const pinyin = pinyinPro.pinyin(zh, { toneType: 'symbol' });
      return { zh, pinyin, vi };
    }

    // Pattern 2: zh - vi (or : )
    // e.g. "八点 (bā diǎn): 8 giờ."
    m = line.match(/^([\u4e00-\u9fa5a-zA-Z0-9\s，。！？、…—]+)[\(（]([a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ\s\.,\?!':;’‘/0-9\-—]+)[\)）]\s*[:\-–—]\s*(.+)$/);
    if (m && /[\u4e00-\u9fa5]/.test(m[1])) {
      const zh = m[1].trim();
      const vi = m[3].trim();
      const pinyin = pinyinPro.pinyin(zh, { toneType: 'symbol' });
      return { zh, pinyin, vi };
    }

    // Pattern 3: zh (vi)
    // e.g. "你会写汉字吗？(Bạn biết viết chữ Hán không?)"
    m = line.match(/^([\u4e00-\u9fa5a-zA-Z0-9\s，。！？、…—]+)[\(（]([^\)）]+)[\)）]\s*$/);
    if (m && /[\u4e00-\u9fa5]/.test(m[1])) {
      const zh = m[1].replace(/^(?:Ví dụ|Ví dụ\s*:|np\s*\d+|Khẳng định\s*:|Phủ định\s*:|Câu hỏi\s*:)\s*/i, '').trim();
      let viCandidate = m[2].trim();
      // If viCandidate is pure pinyin without Vietnamese words
      if (/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(viCandidate) || /^[a-zA-Z\s\.,\?!'-]+$/.test(viCandidate)) {
        // Try to see if it's pinyin
        // We will provide fallback Vietnamese translation below if needed
        return { zh, pinyin: pinyinPro.pinyin(zh, { toneType: 'symbol' }), vi: viCandidate };
      }
      const pinyin = pinyinPro.pinyin(zh, { toneType: 'symbol' });
      return { zh, pinyin, vi: viCandidate };
    }

    // Pattern 4: zh : vi
    m = line.match(/^([\u4e00-\u9fa5]+)\s*[:\-–—]\s*([a-zA-ZÀ-ỹ0-9\s,\.!\?]+)$/);
    if (m && /[\u4e00-\u9fa5]/.test(m[1]) && /[a-zA-ZÀ-ỹ]/.test(m[2])) {
      const zh = m[1].trim();
      const vi = m[2].trim();
      const pinyin = pinyinPro.pinyin(zh, { toneType: 'symbol' });
      return { zh, pinyin, vi };
    }

    return null;
  }

  // Traverse body elements
  $('body').children().each((idx, el) => {
    const tagName = el.tagName.toLowerCase();
    const text = $(el).text().trim();

    // 1. Check Lesson Header
    const baiMatch = text.match(/^bài\s*(\d+)/i);
    if (baiMatch) {
      if (currentLesson) {
        if (currentPoint) {
          currentLesson.grammarPoints.push(currentPoint);
          currentPoint = null;
        }
        lessons.push(currentLesson);
      }
      const lId = parseInt(baiMatch[1], 10);
      const titleZh = hsk1_20_lessonTitles[lId] || `Bài ${lId}`;
      currentLesson = {
        lessonId: lId,
        lessonKey: `Bài ${lId}`,
        lessonTitleZh: titleZh,
        lessonTitleFull: `Bài ${lId}: ${titleZh} (HSK 1 v2.0)`,
        grammarPoints: []
      };
      return;
    }

    if (!currentLesson) return;

    // 2. Check Point Header (NP 1, np1, etc.)
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

    // 3. Process Tables
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

    // 4. Process Lists (ol / ul)
    if (tagName === 'ol' || tagName === 'ul') {
      $(el).find('li').each((liIdx, li) => {
        const liText = $(li).text().trim();
        const ex = parseExampleLine(liText);
        if (ex) {
          currentPoint.examples.push({
            rawZh: `${ex.zh} (${ex.vi})`,
            zh: ex.zh,
            pinyin: ex.pinyin,
            vi: ex.vi
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

    // 5. Check if paragraph is an example
    const ex = parseExampleLine(text);
    if (ex) {
      currentPoint.examples.push({
        rawZh: `${ex.zh} (${ex.vi})`,
        zh: ex.zh,
        pinyin: ex.pinyin,
        vi: ex.vi
      });
      return;
    }

    // 6. Metadata tags
    if (/^Cấu trúc\s*[:\s\-]/i.test(text) || /^Công thức\s*[:\s\-]/i.test(text)) {
      const f = text.replace(/^(?:Cấu trúc|Công thức)\s*[:\s\-]\s*/i, '').trim();
      currentPoint.formula = currentPoint.formula ? `${currentPoint.formula}\n${f}` : f;
    } else if (/^Cách dùng\s*[:\s\-]/i.test(text) || /^Ý nghĩa\s*[:\s\-]/i.test(text)) {
      const exp = text.replace(/^(?:Cách dùng|Ý nghĩa)\s*[:\s\-]\s*/i, '').trim();
      currentPoint.explanation = currentPoint.explanation ? `${currentPoint.explanation}\n${exp}` : exp;
    } else if (/^Lưu ý\s*[:\s\-]/i.test(text) || /^Chú ý\s*[:\s\-]/i.test(text)) {
      const n = text.replace(/^(?:Lưu ý|Chú ý)\s*[:\s\-]\s*/i, '').trim();
      currentPoint.note = currentPoint.note ? `${currentPoint.note}\n${n}` : n;
    } else if (text && !/^Ví dụ\s*[:\-]?$/i.test(text)) {
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

  // Ensure Lesson 2 (谢谢你) is included if docx omitted it
  const hasL2 = lessons.some(l => l.lessonId === 2);
  if (!hasL2) {
    const l2 = {
      lessonId: 2,
      lessonKey: "Bài 2",
      lessonTitleZh: "谢谢你",
      lessonTitleFull: "Bài 2: 谢谢你 (Cảm ơn và Xin lỗi trong tiếng Trung)",
      grammarPoints: [
        {
          id: "hsk1_20_b2_g1",
          num: 1,
          title: "Cách nói lời cảm ơn và đáp lại",
          explanation: "Dùng để bày tỏ sự biết ơn khi nhận được sự giúp đỡ từ người khác và cách đáp lại lịch sự.",
          formula: "Cảm ơn: 谢谢 / 谢谢你\nĐáp lại: 不客气 / 不用谢",
          note: "Khi đáp lại lời cảm ơn, không bao giờ im lặng mà nên đáp lại lịch sự bằng 不客气 (bú kèqi).",
          examples: [
            {
              rawZh: "谢谢！ (Cảm ơn!)",
              zh: "谢谢！",
              pinyin: "xiè xie ！",
              vi: "Cảm ơn!"
            },
            {
              rawZh: "谢谢你！ (Cảm ơn bạn!)",
              zh: "谢谢你！",
              pinyin: "xiè xie nǐ ！",
              vi: "Cảm ơn bạn!"
            },
            {
              rawZh: "不客气！ (Không có gì / Đừng khách sáo!)",
              zh: "不客气！",
              pinyin: "bú kè qi ！",
              vi: "Không có gì / Đừng khách sáo!"
            },
            {
              rawZh: "不用谢！ (Không cần cảm ơn!)",
              zh: "不用谢！",
              pinyin: "bú yòng xiè ！",
              vi: "Không cần cảm ơn!"
            }
          ],
          tables: []
        },
        {
          id: "hsk1_20_b2_g2",
          num: 2,
          title: "Cách nói lời xin lỗi và đáp lại",
          explanation: "Dùng khi làm phiền người khác hoặc mắc lỗi và cách người nghe thể hiện sự thông cảm, bỏ qua.",
          formula: "Xin lỗi: 对不起\nĐáp lại: 没关系",
          note: "\"没关系\" có nghĩa là không sao, không có gì to tát cả.",
          examples: [
            {
              rawZh: "对不起！ (Xin lỗi!)",
              zh: "对不起！",
              pinyin: "duì bu qǐ ！",
              vi: "Xin lỗi!"
            },
            {
              rawZh: "没关系！ (Không sao đâu!)",
              zh: "没关系！",
              pinyin: "méi guān xi ！",
              vi: "Không sao đâu!"
            }
          ],
          tables: []
        }
      ]
    };
    const l1Idx = lessons.findIndex(l => l.lessonId === 1);
    if (l1Idx !== -1) {
      lessons.splice(l1Idx + 1, 0, l2);
    } else {
      lessons.unshift(l2);
    }
  }

  // Known dictionary of missing translations in HSK 1 2.0 to ensure 100% Vietnamese coverage
  const translationDict = {
    "你好": "Xin chào bạn",
    "您好": "Xin chào ngài (kính trọng)",
    "大家好": "Chào tất cả mọi người",
    "你们好": "Chào các bạn",
    "老师好": "Chào thầy/cô",
    "谁": "Ai (Đại từ hỏi người)",
    "哪": "Nào (Đại từ hỏi lựa chọn)",
    "多": "Nhiều / Bao nhiêu",
    "星期一": "Thứ Hai",
    "星期三": "Thứ Tư",
    "星期五": "Thứ Sáu",
    "星期": "Thứ / Tuần",
    "10 分": "10 xu (fēn)",
    "3块": "3 tệ",
    "10块": "10 tệ",
    "20块": "20 tệ",
    "1块5": "1 tệ 5 hào",
    "1块5毛": "1 tệ 5 hào",
    "2块8": "2 tệ 8 hào",
    "2块8毛": "2 tệ 8 hào",
    "1块5毛5": "1 tệ 5 hào 5 xu",
    "3块2毛6": "3 tệ 2 hào 6 xu",
    "零": "Số 0",
    "1块零5分": "1 tệ lẻ 5 xu",
    "5块零2分": "5 tệ lẻ 2 xu",
    "毛": "Hào (1/10 tệ)",
    "两块五": "2 tệ 5 hào",
    "块": "Tệ (khẩu ngữ)",
    "10 毛": "10 hào",
    "两": "Số 2 (dùng trước lượng từ)",
    "我妈妈在家。": "Mẹ tôi ở nhà.",
    "老师在学校。": "Thầy giáo ở trường.",
    "我的书在桌子上。": "Sách của tôi ở trên bàn.",
    "哪儿?": "Ở đâu?",
    "你在哪儿？": "Bạn ở đâu?",
    "你的电脑在哪儿？": "Máy tính của bạn ở đâu?",
    "老师在哪儿？": "Thầy giáo ở đâu?",
    "我在商店买东西。": "Tôi mua đồ ở cửa hàng.",
    "他在学校看书。": "Anh ấy đọc sách ở trường.",
    "我在医院工作。": "Tôi làm việc ở bệnh viện.",
    "呢?": "... đâu rồi / ở đâu rồi?",
    "我的书呢？": "Sách của tôi đâu rồi?",
    "妈妈呢？": "Mẹ đâu rồi?",
    "老师呢？": "Thầy giáo đâu rồi?",
    "我能去学校。": "Tôi có thể đi đến trường.",
    "他能开车。": "Anh ấy có thể lái xe.",
    "明天我不能去商店。": "Ngày mai tôi không thể đi cửa hàng.",
    "对不起，我不能看电视。": "Xin lỗi, tôi không thể xem tivi.",
    "我能坐这儿吗？": "Tôi có thể ngồi ở đây không?",
    "你能说汉语吗？": "Bạn có thể nói tiếng Hán không?",
    "点": "Giờ (đồng hồ)",
    "分": "Phút",
    "半": "Rưỡi / Nửa (30 phút)",
    "八点": "8 giờ",
    "八点半": "8 giờ 30 phút",
    "八点零五分": "8 giờ 5 phút",
    "我八点去学校。": "Tôi 8 giờ đi đến trường.",
    "八点我吃饭。": "8 giờ tôi ăn cơm.",
    "前": "Trước (thời gian / vị trí)",
    "商店前": "Phía trước cửa hàng",
    "八点前": "Trước 8 giờ",
    "三天前": "Ba ngày trước",
    "三点后。": "Sau 3 giờ.",
    "学校后。": "Phía sau trường học.",
    "好啊！": "Được thôi! (Đồng ý vui vẻ)",
    "你看，那是我的朋友啊！": "Bạn xem, đó là bạn của tôi kìa!",
    "我是坐飞机来的。": "Tôi là đi máy bay đến.",
    "我是昨天买的。": "Tôi là mua vào ngày hôm qua.",
    "我是在学校学的。": "Tôi là học ở trường.",
    "星期一。": "Thứ Hai (Năm 2026, tháng 8, ngày 17)"
  };

  // Clean, filter and deduplicate points and examples
  lessons.forEach(les => {
    les.grammarPoints = les.grammarPoints.filter(p => p.title && (p.explanation || p.formula || p.examples.length > 0));
    les.grammarPoints.forEach((p, idx) => {
      p.num = idx + 1;
      p.id = `hsk1_20_b${les.lessonId}_g${p.num}`;

      // Deduplicate examples and fix translations
      const seenZh = new Set();
      const cleanExamples = [];
      p.examples.forEach(e => {
        let zh = e.zh.trim().replace(/^(?:i\?|ng\.|m qua mua\.|c |hay |thay cho )/g, '').trim();
        if (!zh || zh.length < 1) return;

        let vi = (e.vi || '').trim();
        // Check if translation exists in dictionary
        if (translationDict[zh]) {
          vi = translationDict[zh];
        } else if (translationDict[e.zh]) {
          vi = translationDict[e.zh];
        } else if (/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(vi) || (/^[a-zA-Z\s\.,\?!'-]+$/.test(vi) && vi.length > 4)) {
          // If vi is pure pinyin without tone mark, see if we can improve it
          if (translationDict[zh]) vi = translationDict[zh];
        }

        const key = zh + '|' + vi;
        if (!seenZh.has(key)) {
          seenZh.add(key);
          cleanExamples.push({
            rawZh: `${zh} (${vi})`,
            zh,
            pinyin: pinyinPro.pinyin(zh, { toneType: 'symbol' }),
            vi
          });
        }
      });
      p.examples = cleanExamples;
    });
  });

  console.log(`Successfully parsed and cleaned ${lessons.length} lessons for HSK 1 (v2.0)!`);

  // Write frontend/grammar_hsk1_v2.js
  const jsContent = `export const HSK1_V2_STRUCTURED_GRAMMAR = ${JSON.stringify(lessons, null, 2)};\nif (typeof window !== 'undefined') {\n  window.HSK1_V2_STRUCTURED_GRAMMAR = HSK1_V2_STRUCTURED_GRAMMAR;\n}\n`;
  fs.writeFileSync(path.join(frontendDir, 'grammar_hsk1_v2.js'), jsContent, 'utf8');
  console.log('Saved frontend/grammar_hsk1_v2.js');

  // Update backend/hsk_grammar_structured.json and frontend/grammar_structured.js
  const jsonPath = path.join(backendDir, 'hsk_grammar_structured.json');
  if (fs.existsSync(jsonPath)) {
    const masterData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    masterData.hsk1_v2 = {
      level: "HSK 1",
      version: "2.0",
      title: "Tổng Hợp Ngữ Pháp HSK 1 Chuẩn 2.0 (15 Bài Học Chi Tiết)",
      totalPoints: lessons.reduce((a, b) => a + b.grammarPoints.length, 0),
      lessons: lessons
    };
    fs.writeFileSync(jsonPath, JSON.stringify(masterData, null, 2), 'utf8');

    const structuredJsPath = path.join(frontendDir, 'grammar_structured.js');
    fs.writeFileSync(structuredJsPath, `export const FULL_STRUCTURED_GRAMMAR = ${JSON.stringify(masterData, null, 2)};\nwindow.FULL_STRUCTURED_GRAMMAR = FULL_STRUCTURED_GRAMMAR;\n`, 'utf8');
    console.log('Synchronized backend/hsk_grammar_structured.json and frontend/grammar_structured.js');
  }

  return lessons;
}

parseHsk1V2().catch(console.error);
