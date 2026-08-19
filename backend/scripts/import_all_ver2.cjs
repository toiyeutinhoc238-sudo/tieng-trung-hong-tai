const fs = require("fs");
const path = require("path");
const xlsx = require("xlsx");

const FILES = [
  {
    file: "filetuvung/Từ vựng HSK 1 3.0 NEW VER2.xlsx",
    level: 1,
    hskVersion: "3.0",
    idBase: 10000,
    filterFn: w => w.level === 1 && (w.hskVersion === "3.0" || !w.hskVersion) && !w.isCustom,
    label: "HSK 1 (3.0)"
  },
  {
    file: "filetuvung/Từ vựng HSK 2 3.0 NEW VER2.xlsx",
    level: 2,
    hskVersion: "3.0",
    idBase: 30000,
    filterFn: w => w.level === 2 && (w.hskVersion === "3.0" || !w.hskVersion) && !w.isCustom,
    label: "HSK 2 (3.0)"
  },
  {
    file: "filetuvung/Từ vựng HSK 3 3.0 NEW VER2.xlsx",
    level: 3,
    hskVersion: "3.0",
    idBase: 40000,
    filterFn: w => w.level === 3 && (w.hskVersion === "3.0" || !w.hskVersion) && !w.isCustom,
    label: "HSK 3 (3.0)"
  },
  {
    file: "filetuvung/TV HSK 1 2.0 NEW VER2.xlsx",
    level: 1,
    hskVersion: "2.0",
    idBase: 1000,
    filterFn: w => w.level === 1 && w.hskVersion === "2.0" && !w.isCustom,
    label: "HSK 1 (2.0)"
  },
  {
    file: "filetuvung/TV HSK 2 2.0 NEW VER2.xlsx",
    level: 2,
    hskVersion: "2.0",
    idBase: 20000,
    filterFn: w => w.level === 2 && w.hskVersion === "2.0" && !w.isCustom,
    label: "HSK 2 (2.0)"
  },
  {
    file: "filetuvung/TV HSK 3 2.0 NEW VER2.xlsx",
    level: 3,
    hskVersion: "2.0",
    idBase: 50000,
    filterFn: w => w.level === 3 && w.hskVersion === "2.0" && !w.isCustom,
    label: "HSK 3 (2.0)"
  }
];

const dbPath = "backend/database.json";

function parseLessonId(baiRaw) {
  if (baiRaw === null || baiRaw === undefined) return null;
  const str = String(baiRaw).trim();
  if (!str) return null;
  // numeric
  if (typeof baiRaw === "number") return baiRaw;
  // extract digits from "Bài 1" or "一课" etc
  const m = str.match(/\d+/);
  if (m) return parseInt(m[0], 10);
  return null;
}

let db = [];
if (fs.existsSync(dbPath)) {
  db = JSON.parse(fs.readFileSync(dbPath, "utf8"));
  console.log("Existing database:", db.length, "items.");
}

for (const cfg of FILES) {
  console.log("\n=== Processing:", cfg.label, "===");
  if (!fs.existsSync(cfg.file)) {
    console.error("  File not found:", cfg.file);
    continue;
  }

  const wb = xlsx.readFile(cfg.file);
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  console.log("  Read", rows.length, "rows from", path.basename(cfg.file));

  let currentLessonId = 0;
  let currentLessonTitle = "";
  const parsedWords = [];

  for (let i = 1; i < rows.length; i++) {
    const r = rows[i];
    if (!r || r.length === 0) continue;

    const baiRaw = r[0];
    const titleRaw = r[1];
    const word = (r[2] || "").toString().trim();
    if (!word) continue;

    const newLessonId = parseLessonId(baiRaw);
    if (newLessonId !== null && newLessonId !== currentLessonId) {
      currentLessonId = newLessonId;
    } else if (titleRaw !== undefined && titleRaw !== null && String(titleRaw).trim() !== "" && currentLessonId === 0) {
      currentLessonId = 1;
    }
    // If baiRaw is set but not a number, still increment if new row with bai
    if (newLessonId === null && baiRaw !== null && baiRaw !== undefined && String(baiRaw).trim() !== "") {
      currentLessonId++;
    }

    if (titleRaw !== undefined && titleRaw !== null && String(titleRaw).trim() !== "") {
      currentLessonTitle = String(titleRaw).trim();
    }

    let cleanTitle = currentLessonTitle.replace(/^Bài\s*\d+\s*[:：\-–]?\s*/i, "").trim();
    const formattedLessonTitle = cleanTitle
      ? "Bài " + currentLessonId + ": " + cleanTitle
      : "Bài " + currentLessonId;

    const pinyin = (r[3] || "").toString().trim();
    const category = (r[4] || "").toString().trim() || "Từ vựng";
    const meaning = (r[5] || "").toString().trim();
    const note = (r[6] || "").toString().trim();
    const example_zh = (r[7] || "").toString().trim();
    const example_vi = (r[8] || "").toString().trim();
    const question = (r[9] || "").toString().trim();
    const answer = (r[10] || "").toString().trim();

    parsedWords.push({
      word, pinyin, meaning,
      level: cfg.level,
      curriculum: "hsk",
      hskVersion: cfg.hskVersion,
      volume: null,
      lessonId: currentLessonId,
      lessonTitle: formattedLessonTitle,
      lessonDesc: "Toàn bộ từ vựng " + formattedLessonTitle + " chuẩn HSK " + cfg.level + " (v" + cfg.hskVersion + ")",
      category, example_zh, example_vi, question, answer, note
    });
  }

  console.log("  Parsed", parsedWords.length, "words across", currentLessonId, "lessons");

  // Existing map
  const existingMap = new Map();
  db.forEach(w => {
    if (cfg.filterFn(w)) {
      existingMap.set(w.word.trim(), w);
    }
  });

  let updatedCount = 0, newCount = 0;

  const finalItems = parsedWords.map((pw, index) => {
    const existing = existingMap.get(pw.word);
    if (existing) {
      updatedCount++;
      return Object.assign({}, existing, {
        pinyin: pw.pinyin || existing.pinyin,
        meaning: pw.meaning || existing.meaning,
        category: pw.category || existing.category,
        level: cfg.level,
        curriculum: "hsk",
        hskVersion: cfg.hskVersion,
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
      newCount++;
      return Object.assign({}, pw, {
        id: cfg.idBase + index + 1,
        isMemorized: false,
        isStarred: false,
        isCustom: false
      });
    }
  });

  console.log("  Updated:", updatedCount, "| New:", newCount);

  // Re-assemble
  const nonItems = db.filter(w => !cfg.filterFn(w));
  db = [...finalItems, ...nonItems];
  console.log("  DB now:", db.length, "total items");
}

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf8");
console.log("\nDone! Saved", db.length, "items to database.json");
