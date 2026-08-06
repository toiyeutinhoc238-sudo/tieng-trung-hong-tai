import fs from 'fs';
import path from 'path';

function restoreHsk1Ids() {
  const dbPath = path.resolve('database.json');
  const lessonsDataPath = path.resolve('lessons_data.json');

  const db = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

  // Separate HSK 1 3.0 words vs other words
  const nonHsk1_30 = db.filter(w => !((w.hskVersion === '3.0' || w.version === '3.0') && String(w.level) === '1'));
  const hsk1_30 = db.filter(w => (w.hskVersion === '3.0' || w.version === '3.0') && String(w.level) === '1');

  console.log('Non-HSK 1 3.0 items count:', nonHsk1_30.length);
  console.log('HSK 1 3.0 items count:', hsk1_30.length);

  // Assign IDs starting from 210 for HSK 1 (v3.0) words
  let startId = 210;
  hsk1_30.forEach((w, idx) => {
    w.id = startId + idx;
  });

  const updatedDb = [...nonHsk1_30, ...hsk1_30];

  fs.writeFileSync(dbPath, JSON.stringify(updatedDb, null, 2));
  console.log('Reassigned HSK 1 (v3.0) IDs starting from 210 to', 210 + hsk1_30.length - 1);

  if (fs.existsSync(lessonsDataPath)) {
    const lessonsData = JSON.parse(fs.readFileSync(lessonsDataPath, 'utf8'));
    lessonsData['hsk1_30'] = hsk1_30;
    fs.writeFileSync(lessonsDataPath, JSON.stringify(lessonsData, null, 2));
    console.log('Updated lessons_data.json hsk1_30!');
  }
}

restoreHsk1Ids();
