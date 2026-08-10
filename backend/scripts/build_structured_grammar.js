import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import xlsx from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workspaceDir = path.resolve(__dirname, '../../');
const xlsxPath = path.join(workspaceDir, 'filetuvung', 'Ngữ Pháp HSK 1 new.xlsx');
const docxHtmlPath = path.join(workspaceDir, 'scratch', 'ngu_phap_hsk1_docx.html');
const grammarJsonDir = path.join(workspaceDir, 'backend', 'grammar_json');
const frontendDir = path.join(workspaceDir, 'frontend');

console.log('Reading Excel:', xlsxPath);
const wb = xlsx.readFile(xlsxPath);
const sheet = wb.Sheets[wb.SheetNames[0]];
const excelRows = xlsx.utils.sheet_to_json(sheet);

console.log(`Excel has ${excelRows.length} grammar points across HSK 1 lessons.`);

// Group HSK 1 by Lesson
const hsk1Lessons = {};

excelRows.forEach((row, idx) => {
  const bai = (row['Bài'] || row['bai'] || `Bài ${idx + 1}`).trim();
  const tenBai = (row['Tên bài'] || row['ten_bai'] || '').trim();
  const stt = parseInt(row['Số thự tự Ngữ pháp'] || row['stt'] || 1, 10);
  const tenNgữPháp = (row['Tên Ngữ pháp'] || row['ten_ngu_phap'] || `Ngữ pháp ${stt}`).trim();
  const giaiThich = (row['Giải thích'] || row['giai_thich'] || '').trim();
  const congThuc = (row['Công thức'] || row['cong_thuc'] || '').trim();
  const luuY = (row['Lưu ý'] || row['luu_y'] || '').trim();
  const viDuRaw = (row['Ví dụ'] || row['vi_du'] || '').trim();
  const dichViDuRaw = (row['Dịch ví dụ '] || row['Dịch ví dụ'] || row['dich_vi_du'] || '').trim();

  if (!hsk1Lessons[bai]) {
    hsk1Lessons[bai] = {
      lessonId: parseInt(bai.replace(/\D/g, ''), 10) || 1,
      lessonKey: bai,
      lessonTitleZh: tenBai,
      lessonTitleFull: `${bai}: ${tenBai}`,
      grammarPoints: []
    };
  }

  // Parse examples
  const examples = [];
  if (viDuRaw) {
    const zhLines = viDuRaw.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
    const viLines = dichViDuRaw ? dichViDuRaw.split(/\r?\n/).map(s => s.trim()).filter(Boolean) : [];

    zhLines.forEach((zhL, lIdx) => {
      // Check if line contains both Chinese and translation in parentheses or after colon
      let zh = zhL.replace(/^[-•*]\s*/, '').trim();
      let pinyin = '';
      let vi = viLines[lIdx] ? viLines[lIdx].replace(/^[-•*]\s*/, '').trim() : '';

      // Match format: 我爱你。(Wǒ ài nǐ.): Tôi yêu bạn.
      const matchBoth = zh.match(/^([^\(（:]+)(?:[\(（]([^\)）]+)[\)）])?(?:\s*[:：]\s*(.+))?$/);
      if (matchBoth) {
        zh = matchBoth[1].trim();
        pinyin = matchBoth[2] ? matchBoth[2].trim() : '';
        if (matchBoth[3] && !vi) {
          vi = matchBoth[3].trim();
        }
      }

      // Check pinyin inside parentheses if not set
      if (!pinyin) {
        const pinMatch = zhL.match(/[\(（]([^\)）]+)[\)）]/);
        if (pinMatch) pinyin = pinMatch[1].trim();
      }

      examples.push({
        rawZh: zhL,
        zh,
        pinyin,
        vi
      });
    });
  }

  const pointObj = {
    id: `hsk1_b${hsk1Lessons[bai].lessonId}_g${stt}`,
    num: stt,
    title: tenNgữPháp,
    explanation: giaiThich || null,
    formula: congThuc || null,
    note: luuY || null,
    examples: examples.length > 0 ? examples : null,
    tables: null,
    exercises: null
  };

  // Attach rich tables & exercises from Word doc for specific lessons
  if (bai === 'Bài 4' && stt === 2) {
    // Numbers Table
    pointObj.tables = [
      {
        title: 'Bảng cách đọc và viết số từ 0 - 99',
        headers: ['Chữ Hán & Pinyin', 'Số Ả Rập', 'Chữ Hán & Pinyin', 'Số Ả Rập'],
        rows: [
          ['零 (líng)', '0', '十 (shí)', '10'],
          ['一 (yī)', '1', '十一 (shíyī)', '11'],
          ['二 (èr)', '2', '二十 (èrshí)', '20'],
          ['三 (sān)', '3', '二十一 (èrshíyī)', '21'],
          ['四 (sì)', '4', '三十 (sānshí)', '30'],
          ['五 (wǔ)', '5', '四十 (sìshí)', '40'],
          ['六 (liù)', '6', '五十 (wǔshí)', '50'],
          ['七 (qī)', '7', '六十 (liùshí)', '60'],
          ['八 (bā)', '8', '七十 (qīshí)', '70'],
          ['九 (jiǔ)', '9', '八十 (bāshí)', '80'],
          ['... (Tiếp tục ghép)', '...', '九十九 (jiǔshíjiǔ)', '99']
        ]
      },
      {
        title: 'Bảng cách đọc và viết số lớn từ 100 - 10,000',
        headers: ['Hàng Chục Ngàn (万 wàn)', 'Hàng Ngàn (千 qiān)', 'Hàng Trăm (百 bǎi)', 'Hàng Chục (十 shí)', 'Đơn Vị (个 gè)'],
        rows: [
          ['10,000: 一万 (yí wàn)', '1,000: 一千 (yì qiān)', '100: 一百 (yì bǎi)', '10: 十 (shí)', '1: 一 (yī)'],
          ['20,000: 两万 (liǎng wàn)', '3,008: 三千零八', '205: 二百零五', '410: 四百一十', '222: 二百二十二']
        ]
      }
    ];
  }

  if (bai === 'Bài 5' && stt === 1) {
    // Time & Calendar Tables
    pointObj.tables = [
      {
        title: 'Bảng 12 Tháng trong năm (月 yuè)',
        headers: ['Tháng', 'Chữ Hán & Pinyin', 'Tháng', 'Chữ Hán & Pinyin'],
        rows: [
          ['Tháng 1', '一月 (yī yuè)', 'Tháng 7', '七月 (qī yuè)'],
          ['Tháng 2', '二月 (èr yuè)', 'Tháng 8', '八月 (bā yuè)'],
          ['Tháng 3', '三月 (sān yuè)', 'Tháng 9', '九月 (jiǔ yuè)'],
          ['Tháng 4', '四月 (sì yuè)', 'Tháng 10', '十月 (shí yuè)'],
          ['Tháng 5', '五月 (wǔ yuè)', 'Tháng 11', '十一月 (shí yī yuè)'],
          ['Tháng 6', '六月 (liù yuè)', 'Tháng 12', '十二月 (shí èr yuè)']
        ]
      },
      {
        title: 'Bảng các Thứ trong tuần (星期 xīngqī)',
        headers: ['Thứ', 'Chữ Hán & Pinyin', 'Thứ', 'Chữ Hán & Pinyin'],
        rows: [
          ['Thứ 2', '星期一 (xīngqī yī)', 'Thứ 6', '星期五 (xīngqī wǔ)'],
          ['Thứ 3', '星期二 (xīngqī èr)', 'Thứ 7', '星期六 (xīngqī liù)'],
          ['Thứ 4', '星期三 (xīngqī sān)', 'Chủ Nhật', '星期日 / 星期天 (xīngqī rì / tiān)'],
          ['Thứ 5', '星期四 (xīngqī sì)', '', '']
        ]
      }
    ];
    pointObj.exercises = [
      {
        type: 'Sắp xếp câu',
        prompt: 'Sắp xếp: 是 / 2026年 / 8月/ 今天 / 星期日/ 2日',
        answer: '今天是2026年8月2日，星期日。'
      },
      {
        type: 'Dịch câu',
        prompt: 'Dịch: "Hôm qua là ngày 10 tháng 8, thứ sáu."',
        answer: '昨天是8月10日，星期五。(Zuótiān shì bā yuè shí hào, xīngqī wǔ.)'
      }
    ];
  }

  if (bai === 'Bài 8' && stt === 1) {
    // Phương vị từ table
    pointObj.tables = [
      {
        title: 'Bảng các Phương vị từ thường gặp',
        headers: ['Phương vị từ', 'Nghĩa tiếng Việt', 'Ví dụ ghép câu', 'Dịch nghĩa'],
        rows: [
          ['上 (shàng)', 'Trên', '桌子上 (Zhuōzi shàng)', 'Trên bàn'],
          ['下 (xià)', 'Dưới', '桌子下 (Zhuōzi xià)', 'Dưới bàn'],
          ['里 (lǐ)', 'Trong', '房间里 (Fángjiān lǐ)', 'Trong phòng'],
          ['外 (wài)', 'Ngoài', '房间外 (Fángjiān wài)', 'Ngoài phòng'],
          ['前 (qián)', 'Trước', '超市前 (Chāoshì qián)', 'Trước siêu thị'],
          ['后 (hòu)', 'Sau', '家后 (Jiā hòu)', 'Sau nhà']
        ]
      }
    ];
  }

  if (bai === 'Bài 10' && stt === 1) {
    // Currency Table
    pointObj.tables = [
      {
        title: 'Bảng phân cấp đơn vị tiền tệ Trung Quốc',
        headers: ['Đơn vị', 'Văn nói (Khẩu ngữ)', 'Văn viết (Trang trọng)', 'Giá trị quy đổi'],
        rows: [
          ['Đơn vị chính', '块 (kuài)', '元 (yuán)', '1 đơn vị tệ'],
          ['Đơn vị 1/10', '毛 (máo)', '角 (jiǎo)', '0.1 đơn vị (Hào)'],
          ['Đơn vị 1/100', '分 (fēn)', '分 (fēn)', '0.01 đơn vị (Xu)']
        ]
      }
    ];
  }

  if (bai === 'Bài 14' && stt === 2) {
    // Từ ly hợp table
    pointObj.tables = [
      {
        title: 'Bảng các Từ Ly Hợp thường gặp (HSK 1)',
        headers: ['Từ ly hợp', 'Phiên âm', 'Ý nghĩa', 'Ví dụ tách từ (Chèn trợ từ/số lượng)'],
        rows: [
          ['睡觉', 'shuìjiào', 'Đi ngủ', '睡了一觉 (Đã ngủ một giấc)'],
          ['吃饭', 'chīfàn', 'Ăn cơm', '吃了一顿饭 (Đã ăn một bữa cơm)'],
          ['打电话', 'dǎ diànhuà', 'Gọi điện', '打了个电话 (Đã gọi một cuộc điện thoại)'],
          ['开车', 'kāichē', 'Lái xe', '开了两小时车 (Đã lái xe 2 tiếng)'],
          ['上课', 'shàngkè', 'Lên lớp', '上了一节课 (Đã lên một tiết học)'],
          ['下班', 'xiàbān', 'Tan làm', '下了班 (Đã tan làm)'],
          ['做饭', 'zuòfàn', 'Nấu ăn', '做了很多饭 (Đã nấu rất nhiều cơm)']
        ]
      }
    ];
  }

  hsk1Lessons[bai].grammarPoints.push(pointObj);
});

const hsk1Array = Object.values(hsk1Lessons).sort((a, b) => a.lessonId - b.lessonId);

console.log(`Structured HSK 1 has ${hsk1Array.length} lessons with total ${excelRows.length} grammar points.`);

// Process HSK 2 -> 6 structured data from text/json
function parseLevelSections(rawText, levelKey) {
  const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
  const clean = lines.filter(l => !l.startsWith('----------------Page'));
  
  const sections = [];
  let curSection = null;
  let curPoint = null;

  clean.forEach(line => {
    // Check main section like "1. Đại từ tiếng Trung" or "Bổ ngữ kết quả"
    const isMainSec = line.match(/^(\d+)\.\s+([^\d\n]+)$/) || line.match(/^([IVXLCDM]+)\.\s+(.+)$/);
    if (isMainSec && line.length < 80) {
      if (curSection) sections.push(curSection);
      curSection = {
        title: line,
        points: []
      };
      curPoint = null;
      return;
    }

    // Check point like "● Bổ ngữ trạng thái" or "● A比B+tính từ"
    const isBullet = line.startsWith('●') || line.startsWith('-') || line.startsWith('★');
    if (isBullet && curSection) {
      curPoint = {
        title: line.replace(/^[●\-★]\s*/, ''),
        content: []
      };
      curSection.points.push(curPoint);
      return;
    }

    if (curPoint) {
      curPoint.content.push(line);
    } else if (curSection) {
      if (curSection.points.length === 0) {
        curSection.points.push({
          title: 'Chi tiết ngữ pháp',
          content: [line]
        });
      } else {
        curSection.points[curSection.points.length - 1].content.push(line);
      }
    }
  });

  if (curSection) sections.push(curSection);
  return sections;
}

// Build full output
const fullStructured = {
  hsk1: {
    level: 'HSK 1',
    title: 'Tổng Hợp Ngữ Pháp HSK 1 Chuẩn 3.0 (15 Bài Học Chi Tiết)',
    totalPoints: excelRows.length,
    lessons: hsk1Array
  }
};

// Also read other levels if files exist
['hsk2', 'hsk3', 'hsk4', 'hsk5', 'hsk6'].forEach(lvl => {
  const contentFile = path.join(grammarJsonDir, `ngu phap ${lvl.replace('hsk', 'hsk ')}.content.txt`);
  if (fs.existsSync(contentFile)) {
    const raw = fs.readFileSync(contentFile, 'utf-8');
    const sections = parseLevelSections(raw, lvl);
    fullStructured[lvl] = {
      level: lvl.toUpperCase(),
      title: `Tổng Hợp Ngữ Pháp ${lvl.toUpperCase()} Chi Tiết`,
      sections: sections,
      rawContent: raw
    };
  }
});

// Save to frontend and backend files
fs.writeFileSync(path.join(frontendDir, 'grammar_hsk1.js'), `export const HSK1_STRUCTURED_GRAMMAR = ${JSON.stringify(hsk1Array, null, 2)};\nwindow.HSK1_STRUCTURED_GRAMMAR = HSK1_STRUCTURED_GRAMMAR;\n`, 'utf-8');
fs.writeFileSync(path.join(frontendDir, 'grammar_structured.js'), `export const FULL_STRUCTURED_GRAMMAR = ${JSON.stringify(fullStructured, null, 2)};\nwindow.FULL_STRUCTURED_GRAMMAR = FULL_STRUCTURED_GRAMMAR;\n`, 'utf-8');
fs.writeFileSync(path.join(workspaceDir, 'backend', 'hsk_grammar_structured.json'), JSON.stringify(fullStructured, null, 2), 'utf-8');

console.log('Successfully generated structured grammar datasets in frontend/grammar_hsk1.js, frontend/grammar_structured.js and backend/hsk_grammar_structured.json!');
