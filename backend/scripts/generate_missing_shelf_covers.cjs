const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer-core');

const chromePath = fs.existsSync('C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe')
  ? 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'
  : 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

const coversToGenerate = [
  // HSK 2.0
  {
    filePath: 'frontend/public/covers/hsk2/hsk5_thuong.jpg',
    level: '5',
    sub: '上',
    tap: 'Tập 1',
    bgColor: '#163b65',
    theme: 'hsk2'
  },
  {
    filePath: 'frontend/public/covers/hsk2/hsk6_thuong.jpg',
    level: '6',
    sub: '上',
    tap: 'Tập 1',
    bgColor: '#4a235a',
    theme: 'hsk2'
  },
  {
    filePath: 'frontend/public/covers/hsk2/hsk6_ha.jpg',
    level: '6',
    sub: '下',
    tap: 'Tập 2',
    bgColor: '#4a235a',
    theme: 'hsk2'
  },
  // HSK 3.0
  {
    filePath: 'frontend/public/covers/hsk3/hsk4_ha.jpg',
    level: '4',
    sub: '下',
    title: '新 HSK 教程 4 (下)',
    en: 'New HSK Course 4 (Part 2)',
    gradient: 'linear-gradient(150deg, #0d9488 0%, #115e59 60%, #134e4a 100%)',
    theme: 'hsk3'
  },
  {
    filePath: 'frontend/public/covers/hsk3/hsk5.jpg',
    level: '5',
    sub: '全',
    title: '新 HSK 教程 5',
    en: 'New HSK Course 5',
    gradient: 'linear-gradient(150deg, #0f766e 0%, #0369a1 60%, #1e1b4b 100%)',
    theme: 'hsk3'
  },
  {
    filePath: 'frontend/public/covers/hsk3/hsk5_thuong.jpg',
    level: '5',
    sub: '上',
    title: '新 HSK 教程 5 (上)',
    en: 'New HSK Course 5 (Part 1)',
    gradient: 'linear-gradient(150deg, #0284c7 0%, #0369a1 60%, #0c4a6e 100%)',
    theme: 'hsk3'
  },
  {
    filePath: 'frontend/public/covers/hsk3/hsk5_ha.jpg',
    level: '5',
    sub: '下',
    title: '新 HSK 教程 5 (下)',
    en: 'New HSK Course 5 (Part 2)',
    gradient: 'linear-gradient(150deg, #0369a1 0%, #075985 60%, #082f49 100%)',
    theme: 'hsk3'
  },
  {
    filePath: 'frontend/public/covers/hsk3/hsk6.jpg',
    level: '6',
    sub: '全',
    title: '新 HSK 教程 6',
    en: 'New HSK Course 6',
    gradient: 'linear-gradient(150deg, #581c87 0%, #312e81 60%, #0f172a 100%)',
    theme: 'hsk3'
  },
  {
    filePath: 'frontend/public/covers/hsk3/hsk6_thuong.jpg',
    level: '6',
    sub: '上',
    title: '新 HSK 教程 6 (上)',
    en: 'New HSK Course 6 (Part 1)',
    gradient: 'linear-gradient(150deg, #7c3aed 0%, #6d28d9 60%, #4c1d95 100%)',
    theme: 'hsk3'
  },
  {
    filePath: 'frontend/public/covers/hsk3/hsk6_ha.jpg',
    level: '6',
    sub: '下',
    title: '新 HSK 教程 6 (下)',
    en: 'New HSK Course 6 (Part 2)',
    gradient: 'linear-gradient(150deg, #6d28d9 0%, #5b21b6 60%, #3b0764 100%)',
    theme: 'hsk3'
  },
  {
    filePath: 'frontend/public/covers/hsk3/hsk7_9.jpg',
    level: '7-9',
    sub: '全',
    title: '新 HSK 教程 7-9',
    en: 'New HSK Course 7-9 (Advanced)',
    gradient: 'linear-gradient(150deg, #db2777 0%, #be185d 60%, #831843 100%)',
    theme: 'hsk3'
  },
  // YCT
  {
    filePath: 'frontend/public/covers/yct/yct1.jpg',
    level: '1',
    gradient: 'linear-gradient(150deg, #f43f5e 0%, #e11d48 60%, #9f1239 100%)',
    theme: 'yct'
  },
  {
    filePath: 'frontend/public/covers/yct/yct2.jpg',
    level: '2',
    gradient: 'linear-gradient(150deg, #f97316 0%, #ea580c 60%, #9a3412 100%)',
    theme: 'yct'
  },
  {
    filePath: 'frontend/public/covers/yct/yct3.jpg',
    level: '3',
    gradient: 'linear-gradient(150deg, #10b981 0%, #059669 60%, #065f46 100%)',
    theme: 'yct'
  },
  {
    filePath: 'frontend/public/covers/yct/yct4.jpg',
    level: '4',
    gradient: 'linear-gradient(150deg, #6366f1 0%, #4f46e5 60%, #3730a3 100%)',
    theme: 'yct'
  }
];

function getHtmlForCover(item) {
  if (item.theme === 'hsk2') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif; }
          body {
            width: 480px;
            height: 680px;
            background: #ffffff;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
          }
          .top-strip {
            height: 48px;
            background: repeating-linear-gradient(90deg, #e2e8f0, #e2e8f0 4px, #ffffff 4px, #ffffff 8px);
            border-bottom: 2px solid #cbd5e1;
          }
          .top-header {
            padding: 30px 24px 20px;
            text-align: center;
          }
          .top-cn {
            font-size: 26px;
            font-weight: 900;
            color: ${item.bgColor};
            letter-spacing: 4px;
            margin-bottom: 6px;
          }
          .top-vi {
            font-size: 24px;
            font-weight: 800;
            color: ${item.bgColor};
            font-family: Georgia, serif;
          }
          .middle-banner {
            background: ${item.bgColor};
            padding: 24px 0;
            text-align: center;
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          }
          .hsk-letters {
            font-size: 110px;
            font-weight: 900;
            color: #ffffff;
            letter-spacing: 4px;
            line-height: 0.95;
          }
          .bottom-content {
            flex: 1;
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            padding: 30px 36px 40px;
            position: relative;
          }
          .credits {
            font-size: 11px;
            line-height: 1.6;
            color: #475569;
          }
          .level-block {
            display: flex;
            align-items: baseline;
            gap: 4px;
          }
          .level-num {
            font-size: 140px;
            font-weight: 900;
            color: ${item.bgColor};
            line-height: 0.8;
            font-family: Impact, sans-serif;
          }
          .level-sub {
            font-size: 38px;
            font-weight: 900;
            color: ${item.bgColor};
          }
          .tap-label {
            font-size: 16px;
            font-weight: 800;
            color: #475569;
            margin-left: 6px;
          }
        </style>
      </head>
      <body>
        <div class="top-strip"></div>
        <div class="top-header">
          <div class="top-cn">标准教程</div>
          <div class="top-vi">Giáo trình chuẩn</div>
        </div>
        <div class="middle-banner">
          <div class="hsk-letters">HSK</div>
        </div>
        <div class="bottom-content">
          <div class="credits">
            <div><strong>Chủ biên:</strong> Khương Lệ Bình</div>
            <div><strong>Biên soạn:</strong> Vương Phương, Vương Phong</div>
            <div><strong>Bản dịch tiếng Việt:</strong> TS. Nguyễn Thị Minh Hồng</div>
            <div style="margin-top: 10px; font-weight: 700; color: #0284c7;">Bản Số Hóa HongTai</div>
          </div>
          <div class="level-block">
            <span class="level-num">${item.level}</span>
            <span class="level-sub">${item.sub}</span>
            <span class="tap-label">${item.tap}</span>
          </div>
        </div>
      </body>
      </html>
    `;
  } else if (item.theme === 'yct') {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          body {
            width: 480px;
            height: 680px;
            background: ${item.gradient};
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 38px 32px;
            color: #ffffff;
            position: relative;
            overflow: hidden;
          }
          .yct-stars {
            font-size: 26px;
            letter-spacing: 8px;
            color: #fde047;
            margin-bottom: 8px;
          }
          .yct-header {
            font-size: 24px;
            font-weight: 900;
            letter-spacing: 1px;
            text-shadow: 0 2px 8px rgba(0,0,0,0.25);
          }
          .yct-center {
            text-align: center;
            margin: auto 0;
          }
          .yct-title {
            font-size: 110px;
            font-weight: 900;
            font-family: Impact, sans-serif;
            letter-spacing: 6px;
            color: #ffffff;
            text-shadow: 0 8px 24px rgba(0,0,0,0.35);
            line-height: 0.9;
          }
          .yct-subtext {
            font-size: 18px;
            font-weight: 800;
            color: #fef08a;
            margin-top: 8px;
            letter-spacing: 2px;
          }
          .yct-level-badge {
            display: inline-block;
            background: rgba(255,255,255,0.25);
            backdrop-filter: blur(10px);
            padding: 10px 28px;
            border-radius: 999px;
            font-size: 22px;
            font-weight: 900;
            margin-top: 20px;
            border: 2px solid rgba(255,255,255,0.4);
            box-shadow: 0 4px 15px rgba(0,0,0,0.15);
          }
          .yct-footer {
            border-top: 1.5px solid rgba(255,255,255,0.25);
            padding-top: 16px;
            display: flex;
            justify-content: space-between;
            font-size: 13px;
            font-weight: 700;
            color: rgba(255,255,255,0.9);
          }
        </style>
      </head>
      <body>
        <div>
          <div class="yct-stars">★★★★★</div>
          <div class="yct-header">Giáo Trình Thiếu Nhi YCT</div>
          <div style="font-size: 14px; opacity: 0.9; font-weight: 600;">Youth Chinese Test Standard Course</div>
        </div>
        <div class="yct-center">
          <div class="yct-title">YCT</div>
          <div class="yct-subtext">少儿汉语考试</div>
          <div class="yct-level-badge">CẤP ĐỘ ${item.level}</div>
        </div>
        <div class="yct-footer">
          <span>Tiếng Trung HongTai Junior</span>
          <span>Tiêu chuẩn Quốc Tế</span>
        </div>
      </body>
      </html>
    `;
  } else {
    // HSK 3.0 theme
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "PingFang SC", "Microsoft YaHei", sans-serif; }
          body {
            width: 480px;
            height: 680px;
            background: ${item.gradient};
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            padding: 40px 36px;
            color: #ffffff;
            position: relative;
            overflow: hidden;
          }
          .bg-glow {
            position: absolute;
            top: -100px;
            right: -100px;
            width: 350px;
            height: 350px;
            border-radius: 50%;
            background: radial-gradient(circle, rgba(255,255,255,0.2) 0%, transparent 70%);
            pointer-events: none;
          }
          .hsk3-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 1.5px solid rgba(255,255,255,0.25);
            padding-bottom: 16px;
          }
          .hsk3-tag {
            font-size: 13px;
            font-weight: 800;
            letter-spacing: 1px;
            color: #a7f3d0;
          }
          .hsk3-press {
            font-size: 11px;
            color: rgba(255,255,255,0.7);
          }
          .hsk3-main {
            margin: 40px 0;
            text-align: left;
          }
          .hsk3-prefix {
            font-size: 28px;
            font-weight: 900;
            letter-spacing: 2px;
            color: #ffffff;
            margin-bottom: 8px;
          }
          .hsk3-huge {
            font-size: 100px;
            font-weight: 900;
            line-height: 0.9;
            color: #86efac;
            font-family: Impact, sans-serif;
            letter-spacing: 2px;
            text-shadow: 0 4px 20px rgba(0,0,0,0.4);
          }
          .hsk3-level-box {
            display: inline-flex;
            align-items: center;
            gap: 12px;
            margin-top: 16px;
            background: rgba(0,0,0,0.3);
            backdrop-filter: blur(10px);
            padding: 8px 18px;
            border-radius: 999px;
            border: 1.5px solid rgba(255,255,255,0.25);
          }
          .hsk3-level-num {
            font-size: 30px;
            font-weight: 900;
            color: #ffffff;
          }
          .hsk3-level-desc {
            font-size: 13px;
            font-weight: 700;
            color: #cbd5e1;
          }
          .hsk3-footer {
            border-top: 1px solid rgba(255,255,255,0.2);
            padding-top: 16px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: rgba(255,255,255,0.8);
          }
        </style>
      </head>
      <body>
        <div class="bg-glow"></div>
        <div class="hsk3-header">
          <span class="hsk3-tag">HSK 3.0 TIÊU CHUẨN MỚI</span>
          <span class="hsk3-press">FLTRP • BLCUP</span>
        </div>
        <div class="hsk3-main">
          <div class="hsk3-prefix">新 HSK 教程</div>
          <div class="hsk3-huge">HSK</div>
          <div class="hsk3-level-box">
            <span class="hsk3-level-num">CẤP ${item.level}</span>
            <span class="hsk3-level-desc">${item.en}</span>
          </div>
        </div>
        <div class="hsk3-footer">
          <span>Tiếng Trung HongTai Library</span>
          <span>Bản Số Hóa Cao Cấp</span>
        </div>
      </body>
      </html>
    `;
  }
}

(async () => {
  console.log('Generating missing covers with browser:', chromePath);
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 480, height: 680, deviceScaleFactor: 2 });

  for (const item of coversToGenerate) {
    const targetFile = path.resolve(__dirname, '..', '..', item.filePath);
    const dir = path.dirname(targetFile);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    const html = getHtmlForCover(item);
    await page.setContent(html, { waitUntil: 'load' });
    await new Promise(r => setTimeout(r, 200));
    await page.screenshot({ path: targetFile, type: 'jpeg', quality: 90 });
    console.log(`Generated: ${item.filePath} (${(fs.statSync(targetFile).size / 1024).toFixed(1)} KB)`);
  }

  await browser.close();
  console.log('Finished generating missing shelf covers.');
})();
