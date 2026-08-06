let radicalsData = { radicals: [], comparisons: [] };
async function loadRadicalsData() {
  try {
    let res = await fetch('/radicals_data.json');
    if (!res.ok) {
      res = await fetch('/src/radicals_data.json');
    }
    if (res.ok) {
      radicalsData = await res.json();
      if (typeof renderGridContent === 'function') {
        renderGridContent();
      }
    }
  } catch (e) {
    console.warn("Could not load radicals_data.json:", e);
  }
}
loadRadicalsData();

let currentTab = '50 bộ (1)';
let writerInstance = null;
let activeAudioElement = null;
let currentFlashcardIndex = 0;
let currentFlashcardList = [];

function speakText(text) {
  if (!text) return;
  const cleanText = text.trim();
  if (!cleanText) return;

  if (activeAudioElement) {
    try {
      activeAudioElement.pause();
      activeAudioElement.currentTime = 0;
      activeAudioElement.src = '';
    } catch (e) { }
    activeAudioElement = null;
  }

  const currentSpeed = parseFloat(localStorage.getItem('speech_playback_rate')) || 1.0;
  const API_BASE_URL = window.location.origin.includes('5173') ? 'http://localhost:5000' : window.location.origin;
  const url = `${API_BASE_URL}/api/tts?text=${encodeURIComponent(cleanText)}&voice=baidu-female`;

  const audio = new Audio(url);
  audio.playbackRate = currentSpeed;
  activeAudioElement = audio;

  audio.play().catch(err => {
    console.warn("Retrying Baidu female voice audio playback...", err);
    setTimeout(() => {
      audio.play().catch(e => {
        console.error("Audio playback error:", e);
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
          const utterance = new SpeechSynthesisUtterance(cleanText);
          utterance.lang = 'zh-CN';
          utterance.rate = currentSpeed;
          window.speechSynthesis.speak(utterance);
        }
      });
    }, 200);
  });
}

window.speakText = speakText;

window.switchRadicalPageTab = function(tabName) {
  currentTab = tabName;

  const btnMap = {
    '50 bộ (1)': 'tab-50-1',
    '50 bộ (2)': 'tab-50-2',
    '50 bộ (3)': 'tab-50-3',
    'Còn lại': 'tab-rest',
    'So sánh': 'tab-comp'
  };

  Object.entries(btnMap).forEach(([name, id]) => {
    const btn = document.getElementById(id);
    if (btn) {
      if (name === tabName) btn.classList.add('active');
      else btn.classList.remove('active');
    }
  });

  renderGridContent();
};

// 1. RENDER DEFAULT GRID VIEW (HÌNH 1)
function renderGridContent() {
  const container = document.getElementById('radicals-content-area');
  if (!container) return;

  if (currentTab === 'So sánh') {
    const compList = radicalsData.comparisons || [];
    currentFlashcardList = compList.map((c, i) => ({
      id: `comp_${i}`,
      radical: `${c.rad1} / ${c.rad2}`,
      variant: '',
      pinyin: `${c.meaning1} vs ${c.meaning2}`,
      name: 'Phân biệt',
      meaning: c.difference,
      note: c.difference,
      example: c.example,
      category: 'So sánh'
    }));

    let html = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="background: rgba(37, 99, 235, 0.12); border: 1px solid rgba(37, 99, 235, 0.3); border-radius: 14px; padding: 14px 18px; color: var(--text-color); font-size: 0.93rem; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-circle-info" style="color: #3b82f6; font-size: 1.1rem;"></i>
          <span>Tổng hợp 25 cặp bộ thủ có hình dáng tương đồng và bí quyết phân biệt chi tiết:</span>
        </div>
    `;

    compList.forEach((c, idx) => {
      html += `
        <div class="rad-card" onclick="window.openRadicalDetailByIndex(${idx})">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px dashed rgba(255,255,255,0.15); padding-bottom: 12px; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 14px;">
              <span style="background: rgba(37, 99, 235, 0.2); color: #3b82f6; border: 1.5px solid #2563eb; padding: 6px 16px; border-radius: 10px; font-weight: 800; font-family: var(--font-hanzi); font-size: 1.5rem;">
                ${c.rad1} <span style="font-size: 0.95rem; font-weight: 600;">(${c.meaning1})</span>
              </span>
              <span style="font-weight: 800; color: #ef4444; font-size: 1.1rem;">VS</span>
              <span style="background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1.5px solid #10b981; padding: 6px 16px; border-radius: 10px; font-weight: 800; font-family: var(--font-hanzi); font-size: 1.5rem;">
                ${c.rad2} <span style="font-size: 0.95rem; font-weight: 600;">(${c.meaning2})</span>
              </span>
            </div>
          </div>

          <div style="font-size: 0.98rem; line-height: 1.55;">
            <strong style="color: #fbbf24;"><i class="fa-solid fa-scale-balanced" style="margin-right: 4px;"></i> Phân biệt:</strong> ${c.difference}
          </div>

          ${c.example ? `
            <div style="font-size: 0.92rem; background: rgba(0,0,0,0.25); border-left: 3px solid #3b82f6; padding: 10px 14px; border-radius: 0 8px 8px 0;">
              <i class="fa-solid fa-book" style="color: #3b82f6; margin-right: 6px;"></i> <strong>Ví dụ:</strong> ${c.example}
            </div>
          ` : ''}
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  } else {
    const list = (radicalsData.radicals || []).filter(r => r.category === currentTab);
    currentFlashcardList = list;

    let html = `<div class="grid-container">`;

    list.forEach((r, idx) => {
      html += `
        <div class="rad-card" onclick="window.openRadicalDetailByIndex(${idx})">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: baseline; gap: 8px;">
              <span style="font-family: var(--font-hanzi); font-size: 2.4rem; font-weight: 800; color: #2563eb;">
                ${r.radical}
              </span>
              ${r.variant ? `<span style="font-family: var(--font-hanzi); font-size: 1.5rem; color: #0284c7; font-weight: 700;">(${r.variant})</span>` : ''}
            </div>
            <span style="font-family: var(--font-pinyin); font-size: 1.15rem; font-weight: 700; color: #0284c7;">
              ${r.pinyin}
            </span>
          </div>

          <div style="font-size: 1.1rem; font-weight: 800; border-top: 1px solid rgba(148, 163, 184, 0.2); padding-top: 8px;">
            Hán-Việt: ${r.name} - <span style="color: #10b981;">${r.meaning}</span>
          </div>

          ${r.note ? `
            <div style="font-size: 0.88rem; font-style: italic; line-height: 1.4; background: rgba(37, 99, 235, 0.08); padding: 8px 12px; border-radius: 8px;" class="rad-text-sub">
              <i class="fa-solid fa-circle-info" style="color: #2563eb; margin-right: 4px;"></i> ${r.note}
            </div>
          ` : ''}

          ${r.example ? `
            <div style="font-size: 0.9rem; font-weight: 600; margin-top: 2px;" class="rad-text-primary">
              <i class="fa-solid fa-lightbulb" style="color: #fbbf24; margin-right: 4px;"></i> Ví dụ: ${r.example}
            </div>
          ` : ''}
        </div>
      `;
    });

    html += `</div>`;
    container.innerHTML = html;
  }
}

// 2. SWITCH TO FLASHCARD STUDY MODE (HÌNH 2 HERO + LIST)
window.startRadicalFlashcardMode = function() {
  const gridView = document.getElementById('radicals-grid-view');
  const flashcardView = document.getElementById('radicals-flashcard-view');

  if (gridView) gridView.style.display = 'none';
  if (flashcardView) flashcardView.style.display = 'block';

  window.scrollTo({ top: 0, behavior: 'smooth' });
  window.selectRadicalByIndex(0);
};

window.openRadicalDetailByIndex = function(index) {
  const gridView = document.getElementById('radicals-grid-view');
  const flashcardView = document.getElementById('radicals-flashcard-view');

  if (gridView) gridView.style.display = 'none';
  if (flashcardView) flashcardView.style.display = 'block';

  window.scrollTo({ top: 0, behavior: 'smooth' });
  window.selectRadicalByIndex(index);
};

window.showGridView = function() {
  const gridView = document.getElementById('radicals-grid-view');
  const flashcardView = document.getElementById('radicals-flashcard-view');

  if (gridView) gridView.style.display = 'block';
  if (flashcardView) flashcardView.style.display = 'none';

  window.scrollTo({ top: 0, behavior: 'smooth' });
};

window.selectRadicalByIndex = function(index) {
  if (!currentFlashcardList || currentFlashcardList.length === 0) return;
  if (index < 0) index = currentFlashcardList.length - 1;
  if (index >= currentFlashcardList.length) index = 0;

  currentFlashcardIndex = index;
  const r = currentFlashcardList[currentFlashcardIndex];

  const countBadge = document.getElementById('radicals-count-badge');
  if (countBadge) {
    countBadge.textContent = `${currentFlashcardList.length} ${currentTab === 'So sánh' ? 'cặp phân biệt' : 'bộ thủ'}`;
  }

  renderHeroFlashcard(r);
  renderMiniCardsGrid();
};

window.nextRadicalFlashcard = function() {
  if (currentFlashcardList.length > 0) {
    window.selectRadicalByIndex(currentFlashcardIndex + 1);
  }
};

window.prevRadicalFlashcard = function() {
  if (currentFlashcardList.length > 0) {
    window.selectRadicalByIndex(currentFlashcardIndex - 1);
  }
};

function renderHeroFlashcard(r) {
  const container = document.getElementById('hero-card-content');
  if (!container || !r) return;

  container.innerHTML = `
    <div style="display: flex; gap: 32px; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; width: 100%;">
      
      <!-- Left Column: Tianzige Box + Stroke Play Button + Category Pill -->
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center; flex-shrink: 0;">
        <div id="hero-tianzige-box" style="width: 170px; height: 170px; background: #ffffff; border: 2.5px solid #dc2626; border-radius: 18px; position: relative; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.12); display: flex; align-items: center; justify-content: center;"></div>

        <button onclick="window.animateRadicalStroke()" style="margin-top: 14px; background: rgba(37, 99, 235, 0.15); color: #2563eb; border: 1px solid rgba(37, 99, 235, 0.3); padding: 8px 18px; border-radius: 99px; font-weight: 800; cursor: pointer; font-size: 0.88rem; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s;">
          <i class="fa-solid fa-pen-nib"></i> Phát lại nét
        </button>

        <div style="margin-top: 10px; background: rgba(37, 99, 235, 0.2); color: #3b82f6; padding: 4px 14px; border-radius: 99px; font-weight: 800; font-size: 0.82rem; border: 1px solid rgba(37, 99, 235, 0.35);">
          ${r.category || 'Bộ thủ'}
        </div>
      </div>

      <!-- Right Column: Details -->
      <div style="flex: 1; min-width: 280px; display: flex; flex-direction: column; gap: 14px; text-align: left;">
        
        <!-- Row 1: Pinyin + Audio Speaker Button -->
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="font-size: 2.2rem; font-weight: 800; color: #0284c7; font-family: var(--font-pinyin);">
            ${r.pinyin}
          </div>

          <button onclick="window.speakText('${(r.radical || '').replace(/'/g, "\\'")}')" title="Nghe phát âm Baidu Nữ" style="background: #2563eb; color: #ffffff; border: none; width: 48px; height: 48px; border-radius: 50%; font-size: 1.25rem; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 18px rgba(37, 99, 235, 0.4); transition: transform 0.15s;" onmousedown="this.style.transform='scale(0.92)'" onmouseup="this.style.transform='scale(1)'">
            <i class="fa-solid fa-volume-high"></i>
          </button>
        </div>

        <!-- Row 2: Badge Box: BỘ THỦ: 人 (Biến thể: 亻) (NHÂN - Người) -->
        <div class="hero-info-badge">
          <i class="fa-solid fa-layer-group" style="font-size: 0.95rem;"></i>
          <span>BỘ THỦ: <strong style="font-family: var(--font-hanzi); font-size: 1.35rem; color: #2563eb;">${r.radical}</strong> ${r.variant ? `( Biến thể: <strong style="font-family: var(--font-hanzi); color: #2563eb;">${r.variant}</strong> )` : ''} ( <strong style="text-transform: uppercase;">${r.name}</strong> - ${r.meaning} )</span>
        </div>

        <!-- Row 3: Large Bold Meaning -->
        <div style="font-size: 1.65rem; font-weight: 800; color: #10b981;">
          Nghĩa: ${r.meaning} <span style="font-size: 1.15rem; font-weight: 700; color: #0284c7; margin-left: 8px;">(${r.name})</span>
        </div>

        <!-- Row 4: Usage Note -->
        ${r.note ? `
          <div style="font-size: 0.98rem; font-style: italic; line-height: 1.55; display: flex; align-items: flex-start; gap: 8px;" class="hero-text-sub">
            <i class="fa-solid fa-circle-info" style="color: #2563eb; font-size: 1.05rem; margin-top: 3px;"></i>
            <span><strong>Cách dùng:</strong> ${r.note}</span>
          </div>
        ` : ''}

        <!-- Row 5: Examples -->
        ${r.example ? `
          <div style="border-left: 3.5px solid #2563eb; padding-left: 14px; margin-top: 4px;">
            <div style="font-size: 0.85rem; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;">VÍ DỤ:</div>
            <div style="font-size: 1.1rem; font-weight: 700;" class="hero-text-primary">${r.example}</div>
          </div>
        ` : ''}

      </div>
    </div>
  `;

  // Audio plays on user click only
  // speakText(r.radical);

  // Init HanziWriter stroke animation for active radical
  setTimeout(() => {
    const box = document.getElementById('hero-tianzige-box');
    if (box && window.HanziWriter) {
      box.innerHTML = '';
      const targetChar = (r.radical || '').split('/')[0].trim();
      writerInstance = window.HanziWriter.create('hero-tianzige-box', targetChar, {
        width: 170,
        height: 170,
        padding: 10,
        showOutline: true,
        strokeColor: '#dc2626',
        outlineColor: '#cbd5e1',
        showCharacter: true
      });
      writerInstance.animateCharacter();
    }
  }, 50);
}

function renderMiniCardsGrid() {
  const container = document.getElementById('mini-cards-grid');
  if (!container) return;

  let html = '';
  currentFlashcardList.forEach((r, idx) => {
    const isActive = idx === currentFlashcardIndex;
    html += `
      <div class="mini-rad-card ${isActive ? 'active' : ''}" onclick="window.selectRadicalByIndex(${idx})" id="mini-card-${idx}">
        <div style="font-family: var(--font-hanzi); font-size: 2.1rem; font-weight: 800; color: #2563eb;">
          ${r.radical}
        </div>
        <div style="font-family: var(--font-pinyin); font-size: 0.9rem; font-weight: 700; color: #0284c7; margin-top: 2px;">
          ${r.pinyin}
        </div>
        <div style="font-size: 0.78rem; font-weight: 600; margin-top: 4px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;" class="hero-text-sub">
          ${r.name}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Scroll active mini card inside container ONLY (prevents page viewport jumping)
  setTimeout(() => {
    const container = document.getElementById('mini-cards-grid');
    const activeEl = document.getElementById(`mini-card-${currentFlashcardIndex}`);
    if (container && activeEl) {
      const scrollLeft = activeEl.offsetLeft - (container.clientWidth / 2) + (activeEl.offsetWidth / 2);
      container.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
    }
  }, 100);
}

window.animateRadicalStroke = function() {
  if (writerInstance) {
    writerInstance.animateCharacter();
  }
};

// Keyboard listener for Flashcard navigation
document.addEventListener('keydown', (e) => {
  const flashcardView = document.getElementById('radicals-flashcard-view');
  if (flashcardView && flashcardView.style.display !== 'none') {
    if (e.key === 'ArrowLeft') {
      window.prevRadicalFlashcard();
    } else if (e.key === 'ArrowRight') {
      window.nextRadicalFlashcard();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
      e.preventDefault();
      if (currentFlashcardList[currentFlashcardIndex]) {
        speakText(currentFlashcardList[currentFlashcardIndex].radical);
      }
    }
  }
});

document.addEventListener('DOMContentLoaded', () => {
  renderGridContent();
});

window.printRadicalWorksheet = function() {
  let targetCategory = currentTab;
  if (!targetCategory || targetCategory === 'So sánh' || targetCategory === 'Còn lại') {
    targetCategory = '50 bộ (1)';
  }

  const list = (radicalsData.radicals || []).filter(r => r.category === targetCategory);
  if (list.length === 0) {
    alert('Không tìm thấy dữ liệu bộ thủ để in!');
    return;
  }

  let printModal = document.getElementById('printable-radical-worksheet-modal');
  if (!printModal) {
    printModal = document.createElement('div');
    printModal.id = 'printable-radical-worksheet-modal';
    document.body.appendChild(printModal);
  }

  printModal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.88); backdrop-filter: blur(8px); z-index: 999999; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 20px; box-sizing: border-box;';

  const createTianzigeBox = (char = '', isFaint = false) => {
    return `
      <div style="width: 32px; height: 32px; border: 1px solid #64748b; position: relative; display: flex; align-items: center; justify-content: center; box-sizing: border-box; background: #fff;">
        <svg style="position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;" viewBox="0 0 32 32">
          <line x1="0" y1="16" x2="32" y2="16" stroke="#cbd5e1" stroke-dasharray="2,2" />
          <line x1="16" y1="0" x2="16" y2="32" stroke="#cbd5e1" stroke-dasharray="2,2" />
          <line x1="0" y1="0" x2="32" y2="32" stroke="#e2e8f0" stroke-dasharray="2,2" />
          <line x1="32" y1="0" x2="0" y2="32" stroke="#e2e8f0" stroke-dasharray="2,2" />
        </svg>
        ${char ? `<span style="font-family: KaiTi, STKaiti, 'SimSun', serif; font-size: 1.4rem; font-weight: 800; color: ${isFaint ? '#cbd5e1' : '#0f172a'}; z-index: 1;">${char}</span>` : ''}
      </div>
    `;
  };

  let rowsHtml = '';
  list.forEach((item, index) => {
    const charDisplay = item.radical + (item.variant ? ` / ${item.variant}` : '');
    const traceChar = item.variant || item.radical;
    
    let faintBoxes = '';
    let blankBoxes = '';
    for (let i = 0; i < 8; i++) {
      faintBoxes += createTianzigeBox(traceChar, true);
      blankBoxes += createTianzigeBox('', false);
    }

    rowsHtml += `
      <div style="display: flex; align-items: stretch; border: 1px solid #94a3b8; border-radius: 6px; margin-bottom: 6px; page-break-inside: avoid; background: #fff;">
        <div style="width: 140px; padding: 4px 8px; border-right: 1.5px solid #64748b; display: flex; flex-direction: column; justify-content: center; background: #f8fafc;">
          <div style="font-size: 0.75rem; font-weight: 800; color: #2563eb;">STT ${index + 1}</div>
          <div style="font-family: KaiTi, STKaiti, 'SimSun', serif; font-size: 1.5rem; font-weight: 900; color: #0f172a; line-height: 1.1; margin: 1px 0;">${charDisplay}</div>
          <div style="font-size: 0.78rem; font-weight: 700; color: #334155;">${item.name || ''} (${item.meaning || ''})</div>
        </div>

        <div style="flex: 1; padding: 4px 8px; display: flex; flex-direction: column; gap: 3px; justify-content: center;">
          <div style="display: flex; gap: 3px; align-items: center;">
            <span style="font-size: 0.65rem; font-weight: 700; color: #64748b; width: 44px;">Mờ:</span>
            ${faintBoxes}
          </div>
          <div style="display: flex; gap: 3px; align-items: center;">
            <span style="font-size: 0.65rem; font-weight: 700; color: #64748b; width: 44px;">Trống:</span>
            ${blankBoxes}
          </div>
        </div>
      </div>
    `;
  });

  printModal.innerHTML = `
    <style>
      @media print {
        body * { visibility: hidden !important; }
        #printable-radical-worksheet-content, #printable-radical-worksheet-content * { visibility: visible !important; }
        #printable-radical-worksheet-content {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          padding: 8mm !important;
          box-sizing: border-box !important;
          background: #fff !important;
          color: #0f172a !important;
          max-height: none !important;
          overflow: visible !important;
          box-shadow: none !important;
        }
        .no-print { display: none !important; }
        @page { size: A4 portrait; margin: 6mm; }
      }
    </style>
    
    <!-- Top Action Header inside Modal -->
    <div class="no-print" style="width: 100%; max-width: 860px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 12px; flex-wrap: wrap;">
      <div style="color: #ffffff; font-weight: 800; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
        <i class="fa-solid fa-file-pdf" style="color: #10b981;"></i> Xem Trước Phiếu Tập Tô A4 — ${targetCategory}
      </div>
      <div style="display: flex; gap: 10px;">
        <button onclick="window.printWorksheetDocument()" style="background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; padding: 8px 20px; border-radius: 99px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.4);">
          <i class="fa-solid fa-print"></i> In Ngay / Tải PDF
        </button>
        <button onclick="document.getElementById('printable-radical-worksheet-modal').style.display='none'" style="background: rgba(255, 255, 255, 0.15); color: #fff; border: 1px solid rgba(255, 255, 255, 0.25); padding: 8px 18px; border-radius: 99px; font-weight: 700; cursor: pointer;">
          Đóng
        </button>
      </div>
    </div>

    <!-- Paper Sheet Container (Always White Paper Background) -->
    <div id="printable-radical-worksheet-content" style="background: #ffffff !important; color: #0f172a !important; max-width: 860px; width: 100%; border-radius: 14px; padding: 24px; box-shadow: 0 25px 60px rgba(0,0,0,0.6); max-height: 82vh; overflow-y: auto; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Be Vietnam Pro', sans-serif;">
      <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 14px;">
        <h1 style="font-size: 1.25rem; font-weight: 800; margin: 0; text-transform: uppercase; color: #0f172a; letter-spacing: 0.3px; line-height: 1.3;">PHIẾU TẬP TÔ BỘ THỦ TIẾNG TRUNG — ${targetCategory.toUpperCase()}</h1>
        <p style="font-size: 0.8rem; color: #475569; margin: 4px 0 0 0; font-weight: 700; letter-spacing: 0.2px;">TIẾNG TRUNG HỒNG THÁI — BẢNG 50 BỘ THỦ CỐ ĐỊNH (CHỮ HÁN & NGHĨA HÁN-VIỆT)</p>
      </div>

      <div>
        ${rowsHtml}
      </div>
    </div>
  `;

  printModal.style.display = 'flex';
};

window.printWorksheetDocument = function() {
  window.print();
};
