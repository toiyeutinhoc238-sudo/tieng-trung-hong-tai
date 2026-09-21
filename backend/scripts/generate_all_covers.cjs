const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const catalogPath = path.resolve(__dirname, '..', 'books_catalog.json');
const outDir = path.resolve(__dirname, '..', '..', 'frontend', 'public', 'covers', 'thumbnails');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

(async () => {
  console.log('--- Starting All Covers Generator ---');
  console.log('Target directory:', outDir);
  console.log('Using browser:', chromePath);

  const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));
  console.log(`Found ${catalog.length} books in catalog.`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
  });

  const page = await browser.newPage();
  await page.goto('http://localhost:5173/documents.html', { waitUntil: 'networkidle0' });
  console.log('PDF.js host page ready.');

  let successCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  for (let i = 0; i < catalog.length; i++) {
    const book = catalog[i];
    const outFile = path.join(outDir, `${book.id}.jpg`);
    const relCoverUrl = `/covers/thumbnails/${book.id}.jpg`;

    if (fs.existsSync(outFile) && fs.statSync(outFile).size > 1000) {
      // Already generated
      book.coverUrl = relCoverUrl;
      skippedCount++;
      continue;
    }

    process.stdout.write(`[${i + 1}/${catalog.length}] Generating cover for: ${book.titleVi.slice(0, 35)}... `);

    try {
      const dataUrl = await page.evaluate(async (bookId) => {
        try {
          const url = `http://localhost:5000/api/books/${bookId}/stream`;
          const loadingTask = window.pdfjsLib.getDocument({
            url: url,
            cMapUrl: '/vendor/pdfjs/cmaps/',
            cMapPacked: true,
            rangeChunkSize: 65536
          });
          const pdf = await loadingTask.promise;
          const firstPage = await pdf.getPage(1);
          // Scale to render a sharp ~400px width thumbnail
          const unscaledViewport = firstPage.getViewport({ scale: 1.0 });
          const targetWidth = 360;
          const scale = targetWidth / unscaledViewport.width;
          const viewport = firstPage.getViewport({ scale });

          const canvas = document.createElement('canvas');
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext('2d');

          await firstPage.render({ canvasContext: ctx, viewport }).promise;
          return canvas.toDataURL('image/jpeg', 0.85);
        } catch (e) {
          return { error: e.message };
        }
      }, book.id);

      if (dataUrl && dataUrl.startsWith('data:image/jpeg')) {
        const base64Data = dataUrl.replace(/^data:image\/jpeg;base64,/, '');
        fs.writeFileSync(outFile, Buffer.from(base64Data, 'base64'));
        book.coverUrl = relCoverUrl;
        successCount++;
        console.log(`OK (${(fs.statSync(outFile).size / 1024).toFixed(1)} KB)`);
      } else {
        console.log(`FAILED: ${dataUrl?.error || 'No dataUrl'}`);
        errorCount++;
      }
    } catch (err) {
      console.log(`ERROR: ${err.message}`);
      errorCount++;
    }
  }

  await browser.close();

  // Save updated catalog
  fs.writeFileSync(catalogPath, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log('\n--- Finished Cover Generation ---');
  console.log(`Total: ${catalog.length} | Generated: ${successCount} | Existing: ${skippedCount} | Errors: ${errorCount}`);
  console.log('Saved catalog with coverUrl fields to:', catalogPath);
})();
