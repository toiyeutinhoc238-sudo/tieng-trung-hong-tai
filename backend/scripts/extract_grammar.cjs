const fs = require('fs');
const path = require('path');
const pdfParse = require('pdf-parse/lib/pdf-parse.js');

const pdfFiles = [
  { id: 'hsk1', name: 'ngu phap hsk 1.pdf', level: 'HSK 1' },
  { id: 'hsk2', name: 'ngu phap hsk 2.pdf', level: 'HSK 2' },
  { id: 'hsk3', name: 'ngu phap hsk 3.pdf', level: 'HSK 3' },
  { id: 'hsk4', name: 'ngu phap hsk 4.pdf', level: 'HSK 4' },
  { id: 'hsk5', name: 'ngu phap hsk 5.pdf', level: 'HSK 5' },
  { id: 'hsk6', name: 'ngu phap hsk 6.pdf', level: 'HSK 6' },
  { id: 'hsk123', name: 'ngu phap hsk 1 2 3.pdf', level: 'HSK 1-2-3' }
];

const filetuvungDir = path.join(__dirname, '..', '..', 'filetuvung');
const outputJsonPath = path.join(__dirname, '..', '..', 'backend', 'hsk_grammar_data.json');

async function extractGrammar() {
  const result = {};

  for (const item of pdfFiles) {
    const filePath = path.join(filetuvungDir, item.name);
    if (!fs.existsSync(filePath)) {
      console.warn(`File not found: ${filePath}`);
      continue;
    }

    try {
      const dataBuffer = fs.readFileSync(filePath);
      const pdfData = await pdfParse(dataBuffer);
      const text = pdfData.text || '';

      result[item.id] = {
        id: item.id,
        level: item.level,
        fileName: item.name,
        rawText: text
      };
      console.log(`Extracted ${item.name}: ${text.length} chars`);
    } catch (e) {
      console.error(`Error parsing ${item.name}:`, e.message);
    }
  }

  fs.writeFileSync(outputJsonPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`Successfully saved grammar data to ${outputJsonPath}`);
}

extractGrammar();
