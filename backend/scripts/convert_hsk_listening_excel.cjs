const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const { pinyin } = require('pinyin-pro');

const rootDir = path.join(__dirname, '..', '..');
const filetuvungDir = path.join(rootDir, 'filetuvung');

const configs = [
  { file: 'Kn nghe đoạn HSK 1 3.0.xlsx', level: 1, levelText: 'HSK 1' },
  { file: 'Kn nghe đoạn HSK 2 3.0.xlsx', level: 2, levelText: 'HSK 2' },
  { file: 'Kn nghe đoạn HSK 3 3.0.xlsx', level: 3, levelText: 'HSK 3' }
];

const allPassages = [];
const stats = { 1: 0, 2: 0, 3: 0 };

configs.forEach(({ file, level, levelText }) => {
  const filePath = path.join(filetuvungDir, file);
  if (!fs.existsSync(filePath)) {
    console.error(`File not found: ${filePath}`);
    return;
  }

  const wb = xlsx.readFile(filePath);
  const sheetName = wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet);

  let count = 0;
  rows.forEach((row) => {
    const hanzi = (row[' Đoạn văn'] || row['Đoạn văn'] || '').trim();
    const meaning = (row['Dịch'] || row['dịch'] || row['DỊCH'] || '').trim();

    if (!hanzi) return;

    count++;
    const generatedPinyin = pinyin(hanzi, { toneType: 'symbol' });

    allPassages.push({
      id: `hsk${level}_p${count}`,
      level,
      levelText,
      index: count,
      hanzi,
      pinyin: generatedPinyin,
      meaning: meaning || 'Đang cập nhật nghĩa tiếng Việt...'
    });
  });

  stats[level] = count;
  console.log(`[Loaded] ${levelText}: ${count} passages from "${file}"`);
});

console.log(`\nTotal passages parsed: ${allPassages.length}`);

// Target output paths
const backendOutput = path.join(rootDir, 'backend', 'hsk_listening_passages.json');
const frontendPublicOutput = path.join(rootDir, 'frontend', 'public', 'hsk_listening_passages.json');
const frontendDistOutput = path.join(rootDir, 'frontend', 'dist', 'hsk_listening_passages.json');

const jsonStr = JSON.stringify(allPassages, null, 2);

fs.writeFileSync(backendOutput, jsonStr, 'utf8');
console.log(`Saved to ${backendOutput}`);

fs.writeFileSync(frontendPublicOutput, jsonStr, 'utf8');
console.log(`Saved to ${frontendPublicOutput}`);

if (fs.existsSync(path.join(rootDir, 'frontend', 'dist'))) {
  fs.writeFileSync(frontendDistOutput, jsonStr, 'utf8');
  console.log(`Saved to ${frontendDistOutput}`);
}

console.log('\n✅ Conversion completed successfully!');
