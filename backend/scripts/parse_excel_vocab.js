import xlsx from 'xlsx';
import path from 'path';

function parseExcelVocab() {
  const filePath = path.resolve('../filetuvung/Từ vựng HSK 1 3.0.xlsx');
  const workbook = xlsx.readFile(filePath);
  
  console.log('Sheet Names in Excel:', workbook.SheetNames);

  workbook.SheetNames.forEach(sheetName => {
    console.log(`\n================ SHEET: ${sheetName} ================`);
    const sheet = workbook.Sheets[sheetName];
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    console.log('Total rows:', data.length);
    if (data.length > 0) {
      console.log('Row 0 (Header):', data[0]);
      console.log('Row 1:', data[1]);
      console.log('Row 2:', data[2]);
      console.log('Row 3:', data[3]);
    }
  });
}

parseExcelVocab();
