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

let printRadicalScopeConfig = 'all';
let printRadicalLayoutConfig = 'fit_multi';
let printRadicalRowsConfig = '4';
let printRadicalTraceConfig = '2';
let printRadicalShowPinyin = true;
let printRadicalShowMeaning = true;

window.printRadicalWorksheet = function() {
  openRadicalPrintWorksheetModal('all');
};

window.openRadicalPrintWorksheetModal = function(scope = 'all') {
  printRadicalScopeConfig = scope;
  
  let modal = document.getElementById('print-radical-worksheet-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'print-radical-worksheet-modal';
    modal.style.cssText = 'display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(11,15,25,0.92); z-index:9999999; align-items:center; justify-content:center; padding:16px; box-sizing:border-box; backdrop-filter:blur(8px);';
    document.body.appendChild(modal);
  }

  // Hide seasonal particle canvas when modal is active
  const particleCanvas = document.getElementById('seasonal-particle-canvas');
  if (particleCanvas) particleCanvas.style.display = 'none';

  modal.innerHTML = `
    <div style="background:#0f172a; border:1px solid rgba(255,255,255,0.15); border-radius:20px; max-width:980px; width:100%; max-height:95vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 20px 50px rgba(0,0,0,0.6);">
      
      <!-- Thanh Tiêu Đề Modal -->
      <div class="no-print" style="padding:14px 20px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center; background:rgba(30,41,59,0.9); flex-wrap:wrap; gap:10px;">
        <h3 style="color:#fff; font-size:1.1rem; margin:0; font-weight:700; display:flex; align-items:center; gap:8px;">
          <i class="fa-solid fa-print" style="color:#10b981;"></i> Xem Trước Phiếu In Tập Viết Bộ Thủ Tiếng Trung
        </h3>
        <div style="display:flex; gap:10px; align-items:center;">
          <button style="background:linear-gradient(135deg, #10b981, #059669); border:none; color:#fff; padding:8px 20px; border-radius:99px; font-weight:800; cursor:pointer; display:flex; align-items:center; gap:6px; box-shadow:0 4px 14px rgba(16,185,129,0.4);" onclick="triggerRadicalPrintWorksheet()">
            <i class="fa-solid fa-print"></i> In Ngay ( <span id="modal-radical-print-total-pages">1</span> trang)
          </button>
          <button style="background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.25); color:#fff; padding:8px 16px; border-radius:99px; font-weight:700; cursor:pointer;" onclick="closeRadicalPrintWorksheetModal()">
            <i class="fa-solid fa-xmark"></i> Đóng
          </button>
        </div>
      </div>

      <!-- Thanh Bảng Điều Khiển Tùy Chỉnh Phiếu In (Số Hàng, Pinyin, Nghĩa) -->
      <div class="no-print" style="padding:10px 20px; background:#1e293b; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; flex-wrap:wrap; align-items:center; gap:16px; font-size:0.85rem; color:#cbd5e1;">
        
        <!-- Chọn Phạm Vi In -->
        <div style="display:flex; align-items:center; gap:6px;">
          <label style="font-weight:700; color:#f59e0b;"><i class="fa-solid fa-list-check"></i> Danh sách in:</label>
          <select id="radical-print-scope" onchange="updateRadicalWorksheetPreviewConfig()" style="background:#0f172a; border:1px solid #f59e0b; color:#fff; padding:4px 10px; border-radius:8px; font-weight:700; outline:none; cursor:pointer;">
            <option value="all" ${printRadicalScopeConfig === 'all' ? 'selected' : ''}>Tất cả bộ thủ (${currentTab})</option>
            <option value="single" ${printRadicalScopeConfig === 'single' ? 'selected' : ''}>Chỉ bộ thủ đang chọn</option>
          </select>
        </div>

        <!-- Chọn Chế Độ Ghép Trang / Tiết Kiệm Giấy -->
        <div style="display:flex; align-items:center; gap:6px;">
          <label style="font-weight:700; color:#38bdf8;"><i class="fa-solid fa-file-invoice"></i> Chế độ in:</label>
          <select id="radical-print-layout" onchange="updateRadicalWorksheetPreviewConfig()" style="background:#0f172a; border:1px solid #38bdf8; color:#fff; padding:4px 10px; border-radius:8px; font-weight:700; outline:none; cursor:pointer;">
            <option value="fit_multi" selected>🌱 Ghép nhiều từ/trang (Tiết kiệm giấy)</option>
            <option value="one_per_page">📄 Mỗi bộ thủ 1 trang riêng</option>
          </select>
        </div>

        <!-- Tùy chỉnh Số Hàng -->
        <div style="display:flex; align-items:center; gap:6px;">
          <label style="font-weight:700; color:#60a5fa;"><i class="fa-solid fa-table-cells-large"></i> Số hàng/từ:</label>
          <select id="radical-print-rows" onchange="updateRadicalWorksheetPreviewConfig()" style="background:#0f172a; border:1px solid #3b82f6; color:#fff; padding:4px 10px; border-radius:8px; font-weight:700; outline:none; cursor:pointer;">
            <option value="2">2 hàng (Siêu tiết kiệm, 4-5 từ/trang)</option>
            <option value="3">3 hàng (Tiết kiệm, 3-4 từ/trang)</option>
            <option value="4" selected>4 hàng (Chuẩn ghép, 2-3 từ/trang)</option>
            <option value="5">5 hàng (Ghép 1-2 từ/trang)</option>
            <option value="6">6 hàng (Chuẩn 1 từ/trang)</option>
          </select>
        </div>

        <!-- Tùy chỉnh Số Hàng Tô Mờ -->
        <div style="display:flex; align-items:center; gap:6px;">
          <label style="font-weight:700; color:#34d399;"><i class="fa-solid fa-pen-nib"></i> Số hàng mờ mẫu:</label>
          <select id="radical-print-trace-rows" onchange="updateRadicalWorksheetPreviewConfig()" style="background:#0f172a; border:1px solid #10b981; color:#fff; padding:4px 10px; border-radius:8px; font-weight:700; outline:none; cursor:pointer;">
            <option value="0">0 hàng (Chỉ ô trống)</option>
            <option value="1">1 hàng mờ</option>
            <option value="2" selected>2 hàng mờ (Mặc định)</option>
            <option value="3">3 hàng mờ</option>
            <option value="all">Tất cả hàng mờ</option>
          </select>
        </div>

        <!-- Checkbox Hiển thị Pinyin -->
        <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:700; color:#f59e0b; user-select:none;">
          <input type="checkbox" id="radical-print-show-pinyin" checked onchange="updateRadicalWorksheetPreviewConfig()" style="accent-color:#f59e0b; width:16px; height:16px; cursor:pointer;">
          Hiển thị Pinyin
        </label>

        <!-- Checkbox Hiển thị Nghĩa -->
        <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:700; color:#a855f7; user-select:none;">
          <input type="checkbox" id="radical-print-show-meaning" checked onchange="updateRadicalWorksheetPreviewConfig()" style="accent-color:#a855f7; width:16px; height:16px; cursor:pointer;">
          Hiển thị Nghĩa Tiếng Việt
        </label>
      </div>

      <!-- Preview Sheet Content Container -->
      <div id="radical-print-worksheet-content-wrap" style="flex:1; overflow-y:auto; padding:24px; background:#f1f5f9; color:#000;">
        <!-- Dynamic printable content injected here -->
      </div>
    </div>
  `;

  modal.style.display = 'flex';
  updateRadicalWorksheetPreviewConfig();
};

window.closeRadicalPrintWorksheetModal = function() {
  const modal = document.getElementById('print-radical-worksheet-modal');
  if (modal) modal.style.display = 'none';
  const particleCanvas = document.getElementById('seasonal-particle-canvas');
  if (particleCanvas && localStorage.getItem('particles_enabled') !== 'false') {
    particleCanvas.style.display = 'block';
  }
};

window.updateRadicalWorksheetPreviewConfig = function() {
  const scopeEl = document.getElementById('radical-print-scope');
  const layoutEl = document.getElementById('radical-print-layout');
  const rowsEl = document.getElementById('radical-print-rows');
  const traceEl = document.getElementById('radical-print-trace-rows');
  const pinyinEl = document.getElementById('radical-print-show-pinyin');
  const meaningEl = document.getElementById('radical-print-show-meaning');

  if (scopeEl) printRadicalScopeConfig = scopeEl.value;
  if (layoutEl) printRadicalLayoutConfig = layoutEl.value;
  if (rowsEl) printRadicalRowsConfig = rowsEl.value;
  if (traceEl) printRadicalTraceConfig = traceEl.value;
  if (pinyinEl) printRadicalShowPinyin = pinyinEl.checked;
  if (meaningEl) printRadicalShowMeaning = meaningEl.checked;

  let targetCategory = currentTab;
  if (!targetCategory || targetCategory === 'So sánh' || targetCategory === 'Còn lại') {
    targetCategory = '50 bộ (1)';
  }

  let list = (radicalsData.radicals || []).filter(r => r.category === targetCategory);
  if (list.length === 0) {
    list = (radicalsData.radicals || []).slice(0, 50);
  }

  if (printRadicalScopeConfig === 'single' && currentFlashcardList[currentFlashcardIndex]) {
    const singleObj = currentFlashcardList[currentFlashcardIndex];
    if (singleObj && singleObj.radical) {
      list = list.filter(r => r.radical === singleObj.radical);
      if (list.length === 0) list = [singleObj];
    } else {
      list = list.slice(0, 1);
    }
  }

  generateRadicalWorksheetHTML(list);
};

function generateRadicalWorksheetHTML(listToPrint) {
  const container = document.getElementById('radical-print-worksheet-content-wrap');
  if (!container) return;

  const today = new Date();
  const todayStr = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;

  const COLS = 13;
  const BOX = 48;
  const ROWS = parseInt(printRadicalRowsConfig) || 4;
  const traceConfig = printRadicalTraceConfig;
  const showPinyin = printRadicalShowPinyin;
  const showMeaning = printRadicalShowMeaning;

  function mizigeCell(size, innerHtml = '') {
    return `
      <div style="
        width:${size}px; height:${size}px;
        border:1px solid #16a34a;
        position:relative;
        display:flex; align-items:center; justify-content:center;
        box-sizing:border-box; background:#fff;
        margin-right:-1px; margin-bottom:-1px;
        flex-shrink:0;
      ">
        <svg style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;" viewBox="0 0 ${size} ${size}">
          <line x1="0" y1="${size / 2}" x2="${size}" y2="${size / 2}" stroke="#86efac" stroke-dasharray="2,2" />
          <line x1="${size / 2}" y1="0" x2="${size / 2}" y2="${size}" stroke="#86efac" stroke-dasharray="2,2" />
          <line x1="0" y1="0" x2="${size}" y2="${size}" stroke="#dcfce7" stroke-dasharray="2,2" />
          <line x1="${size}" y1="0" x2="0" y2="${size}" stroke="#dcfce7" stroke-dasharray="2,2" />
        </svg>
        ${innerHtml}
      </div>`;
  }

  const pendingStrokeLoaders = [];
  let pagesHtml = '';

  if (printRadicalLayoutConfig === 'fit_multi') {
    // 🌱 FIT MULTI (Ghép nhiều bộ thủ/trang)
    let totalCards = listToPrint.length;
    let cardsPerPage = 3;
    if (ROWS <= 2) cardsPerPage = 5;
    else if (ROWS === 3) cardsPerPage = 4;
    else if (ROWS === 4) cardsPerPage = 3;
    else if (ROWS >= 5) cardsPerPage = 2;

    let totalPages = Math.ceil(totalCards / cardsPerPage) || 1;
    const pageTotalEl = document.getElementById('modal-radical-print-total-pages');
    if (pageTotalEl) pageTotalEl.textContent = `${totalCards} bộ thủ (${totalPages} trang)`;

    for (let p = 0; p < totalPages; p++) {
      const pageItems = listToPrint.slice(p * cardsPerPage, (p + 1) * cardsPerPage);
      let pageCardsHtml = '';

      pageItems.forEach((target, cardIdx) => {
        const itemIdx = p * cardsPerPage + cardIdx;
        const mainChar = target.radical;
        const charDisplay = target.radical + (target.variant ? ` / ${target.variant}` : '');
        const wordChars = [mainChar];

        function buildRow(rowIdx) {
          let cells = '';
          for (let col = 0; col < COLS; col++) {
            let isTrace = false;
            if (traceConfig === 'all') isTrace = true;
            else if (traceConfig === '1' && rowIdx === 0) isTrace = true;
            else if (traceConfig === '2' && (rowIdx === 0 || rowIdx === 1)) isTrace = true;
            else if (traceConfig === '3' && (rowIdx === 0 || rowIdx === 1 || rowIdx === 2)) isTrace = true;

            let inner = '';
            if (isTrace) {
              inner = `<span style="
                font-size:${BOX * 0.72}px;
                font-family:'LXGW WenKai Lite','Kaiti','STKaiti','Kai','PingFang SC','Noto Serif SC',serif;
                font-weight:normal; color:#111827; opacity:0.18;
                line-height:1; position:relative; z-index:2; pointer-events:none;
              ">${mainChar}</span>`;
            }

            cells += mizigeCell(BOX, inner);
          }
          return `<div style="display:flex;">${cells}</div>`;
        }

        let allRows = '';
        for (let r = 0; r < ROWS; r++) {
          allRows += buildRow(r);
        }

        const strokeSeqContainerId = `radical-stroke-steps-modal-${itemIdx}`;
        pendingStrokeLoaders.push({ id: strokeSeqContainerId, wordChars });

        const infoBox = `
          <div style="
            border:2px solid #22c55e; border-radius:8px;
            padding:8px 14px; margin-bottom:8px;
            background:#fff; width:100%; box-sizing:border-box;
          ">
            <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:6px; border-bottom:1px dashed #dcfce7;">
              <div style="display:flex; align-items:baseline; gap:12px; flex-wrap:wrap;">
                <span style="
                  font-size:1.8rem;
                  font-family:'LXGW WenKai Lite','Kaiti','STKaiti','Kai','PingFang SC','Noto Serif SC',serif;
                  font-weight:bold; color:#111827; line-height:1;
                ">${charDisplay}</span>
                ${showPinyin && target.pinyin ? `<span style="font-size:1.05rem; font-weight:800; color:#ea580c;">${target.pinyin}</span>` : ''}
                ${showMeaning ? `<span style="font-size:0.9rem; color:#374151; font-weight:700;">${target.name ? `${target.name} (${target.meaning || ''})` : (target.meaning || '')}</span>` : ''}
              </div>
              <div style="font-size:0.75rem; color:#16a34a; font-weight:700; background:#f0fdf4; padding:3px 10px; border-radius:12px; border:1px solid #bbf7d0;">
                ${target.category || '50 BỘ THỦ'}
              </div>
            </div>

            <div style="margin-top:6px;">
              <div id="${strokeSeqContainerId}" style="display:flex; flex-wrap:wrap; gap:12px; align-items:center;">
                <span style="font-size:0.75rem; color:#9ca3af;">Đang tải nét bút...</span>
              </div>
            </div>
          </div>`;

        pageCardsHtml += `
          <div class="print-word-card" style="margin-bottom:18px; page-break-inside:avoid; break-inside:avoid;">
            <div style="font-size:0.75rem; font-weight:800; color:#16a34a; margin-bottom:4px;">
              Bộ thủ #${itemIdx + 1}: ${target.radical}
            </div>
            ${infoBox}
            <div style="display:inline-flex; flex-direction:column; border:2px solid #22c55e; border-radius:6px; overflow:hidden; box-sizing:border-box; width:100%;">
              ${allRows}
            </div>
          </div>
        `;
      });

      const isLastPage = p === totalPages - 1;
      pagesHtml += `
        <div class="print-page-area" style="
          font-family:'Be Vietnam Pro','Segoe UI',sans-serif;
          padding:24px 28px;
          background:#fff; color:#000;
          max-width:${COLS * BOX + 80}px;
          margin:0 auto ${isLastPage ? '0' : '30px'} auto;
          box-shadow:0 10px 30px rgba(0,0,0,0.15);
          border-radius:12px;
          page-break-after: always;
          break-after: page;
        ">
          <!-- HEADER -->
          <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #f97316; padding-bottom:8px; margin-bottom:10px;">
            <div>
              <div style="font-size:1.4rem; font-weight:900; color:#f97316;">Tiếng Trung HongTai</div>
              <div style="font-size:0.78rem; color:#16a34a; font-weight:700; margin-top:2px;">Phiếu Tập Viết Bộ Thủ Tiếng Trung (Tiết Kiệm Giấy - ${listToPrint.length} bộ)</div>
            </div>
            <div style="text-align:right; font-size:0.75rem; color:#6b7280;">
              <div style="font-weight:700; color:#111827;">tiengtrunghongtai.com</div>
              <div>Trang ${p + 1}/${totalPages} - Ngày in: ${todayStr}</div>
            </div>
          </div>

          <!-- HÀNG TÊN / LỚP / NGÀY -->
          <div style="display:flex; gap:20px; margin-bottom:12px; font-size:0.8rem; font-weight:700; color:#16a34a; border-bottom:1px dashed #cbd5e1; padding-bottom:8px;">
            <span>Tên: <span style="display:inline-block; border-bottom:1.5px solid #22c55e; min-width:150px;">&nbsp;</span></span>
            <span>Lớp: <span style="display:inline-block; border-bottom:1.5px solid #22c55e; min-width:80px;">&nbsp;</span></span>
            <span>Ngày: <span style="display:inline-block; border-bottom:1.5px solid #22c55e; min-width:110px;">&nbsp;</span></span>
          </div>

          <!-- DANH SÁCH CÁC THẺ BỘ THỦ GHÉP -->
          ${pageCardsHtml}

          <!-- FOOTER -->
          <div style="margin-top:12px; border-top:1px dashed #86efac; padding-top:6px; display:flex; justify-content:space-between; font-size:0.72rem; color:#9ca3af; page-break-inside: avoid; break-inside: avoid;">
            <span>💡 Viết theo các ô mờ mẫu ➔ Tự viết vào các ô trống (tự điều chỉnh số hàng để ghép vừa 1 trang A4).</span>
            <span style="font-weight:800; color:#f97316;">Tiếng Trung HongTai</span>
          </div>
        </div>
      `;
    }
  } else {
    // 📄 ONE RADICAL PER PAGE LAYOUT
    const pageTotalEl = document.getElementById('modal-radical-print-total-pages');
    if (pageTotalEl) pageTotalEl.textContent = `${listToPrint.length} trang`;

    listToPrint.forEach((target, pageIdx) => {
      const mainChar = target.radical;
      const charDisplay = target.radical + (target.variant ? ` / ${target.variant}` : '');
      const wordChars = [mainChar];

      function buildRow(rowIdx) {
        let cells = '';
        for (let col = 0; col < COLS; col++) {
          let isTrace = false;
          if (traceConfig === 'all') isTrace = true;
          else if (traceConfig === '1' && rowIdx === 0) isTrace = true;
          else if (traceConfig === '2' && (rowIdx === 0 || rowIdx === 1)) isTrace = true;
          else if (traceConfig === '3' && (rowIdx === 0 || rowIdx === 1 || rowIdx === 2)) isTrace = true;

          let inner = '';
          if (isTrace) {
            inner = `<span style="
              font-size:${BOX * 0.72}px;
              font-family:'LXGW WenKai Lite','Kaiti','STKaiti','Kai','PingFang SC','Noto Serif SC',serif;
              font-weight:normal; color:#111827; opacity:0.18;
              line-height:1; position:relative; z-index:2; pointer-events:none;
            ">${mainChar}</span>`;
          }

          cells += mizigeCell(BOX, inner);
        }
        return `<div style="display:flex;">${cells}</div>`;
      }

      let allRows = '';
      for (let r = 0; r < ROWS; r++) {
        allRows += buildRow(r);
      }

      const strokeSeqContainerId = `radical-stroke-steps-modal-${pageIdx}`;
      pendingStrokeLoaders.push({ id: strokeSeqContainerId, wordChars });

      const infoBox = `
        <div style="
          border:2px solid #22c55e; border-radius:8px;
          padding:12px 18px; margin-bottom:12px;
          background:#fff; width:100%; box-sizing:border-box;
        ">
          <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:8px; border-bottom:1px dashed #dcfce7;">
            <div style="display:flex; align-items:baseline; gap:16px; flex-wrap:wrap;">
              <span style="
                font-size:2.2rem;
                font-family:'LXGW WenKai Lite','Kaiti','STKaiti','Kai','PingFang SC','Noto Serif SC',serif;
                font-weight:bold; color:#111827; line-height:1;
              ">${charDisplay}</span>
              ${showPinyin && target.pinyin ? `<span style="font-size:1.15rem; font-weight:800; color:#ea580c;">${target.pinyin}</span>` : ''}
              ${showMeaning ? `<span style="font-size:0.95rem; color:#374151; font-weight:600;">${target.name ? `${target.name} (${target.meaning || ''})` : (target.meaning || '')}</span>` : ''}
            </div>
            <div style="font-size:0.75rem; color:#16a34a; font-weight:700; background:#f0fdf4; padding:4px 12px; border-radius:12px; border:1px solid #bbf7d0;">
              ${target.category || '50 BỘ THỦ'}
            </div>
          </div>

          <div style="margin-top:8px;">
            <div id="${strokeSeqContainerId}" style="display:flex; flex-wrap:wrap; gap:16px; align-items:center;">
              <span style="font-size:0.8rem; color:#9ca3af;">Đang tải nét bút...</span>
            </div>
          </div>
        </div>`;

      const practiceBlock = `
        <div style="display:inline-flex; flex-direction:column; border:2px solid #22c55e; border-radius:6px; overflow:hidden; box-sizing:border-box; width:100%;">
          ${allRows}
        </div>`;

      const isLastPage = pageIdx === listToPrint.length - 1;
      pagesHtml += `
        <div class="print-page-area" style="
          font-family:'Be Vietnam Pro','Segoe UI',sans-serif;
          padding:24px 28px;
          background:#fff; color:#000;
          max-width:${COLS * BOX + 80}px;
          margin:0 auto ${isLastPage ? '0' : '30px'} auto;
          box-shadow:0 10px 30px rgba(0,0,0,0.15);
          border-radius:12px;
          page-break-after: always;
          break-after: page;
        ">
          <!-- HEADER -->
          <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #f97316; padding-bottom:10px; margin-bottom:12px;">
            <div>
              <div style="font-size:1.45rem; font-weight:900; color:#f97316;">Tiếng Trung HongTai</div>
              <div style="font-size:0.78rem; color:#16a34a; font-weight:700; margin-top:2px;">Phiếu Tập Viết Bộ Thủ Tiếng Trung</div>
            </div>
            <div style="text-align:right; font-size:0.75rem; color:#6b7280;">
              <div style="font-weight:700; color:#111827;">tiengtrunghongtai.com</div>
              <div>Trang ${pageIdx + 1}/${listToPrint.length} - Ngày in: ${todayStr}</div>
            </div>
          </div>

          <!-- HÀNG TÊN / LỚP / NGÀY -->
          <div style="display:flex; gap:20px; margin-bottom:12px; font-size:0.8rem; font-weight:700; color:#16a34a;">
            <span>Tên: <span style="display:inline-block; border-bottom:1.5px solid #22c55e; min-width:150px;">&nbsp;</span></span>
            <span>Lớp: <span style="display:inline-block; border-bottom:1.5px solid #22c55e; min-width:80px;">&nbsp;</span></span>
            <span>Ngày: <span style="display:inline-block; border-bottom:1.5px solid #22c55e; min-width:110px;">&nbsp;</span></span>
          </div>

          <!-- KHUNG THÔNG TIN BỘ THỦ -->
          ${infoBox}

          <!-- KHỐI LƯỚI LUYỆN VIẾT -->
          <div style="text-align:center;">
            ${practiceBlock}
          </div>

          <!-- FOOTER -->
          <div style="margin-top:14px; border-top:1px dashed #86efac; padding-top:8px; display:flex; justify-content:space-between; font-size:0.72rem; color:#9ca3af;">
            <span>💡 Viết theo các ô mờ mẫu ➔ Tự viết vào các ô trống (mỗi ô 1 chữ, viết lần lượt theo thứ tự từ).</span>
            <span style="font-weight:800; color:#f97316;">Tiếng Trung HongTai</span>
          </div>
        </div>
      `;
    });
  }

  container.innerHTML = pagesHtml;

  // Load stroke steps for each item
  if (typeof HanziWriter !== 'undefined') {
    pendingStrokeLoaders.forEach(item => {
      const stepsContainer = document.getElementById(item.id);
      if (!stepsContainer) return;
      let sequenceHtml = '';
      let pending = item.wordChars.length;

      item.wordChars.forEach(ch => {
        HanziWriter.loadCharacterData(ch).then(data => {
          if (data && data.strokes) {
            const strokesCount = data.strokes.length;
            let charStepsHtml = `<div style="display:inline-flex; align-items:center; gap:5px; background:#f8fafc; padding:3px 8px; border-radius:6px; border:1px solid #e2e8f0;">`;
            charStepsHtml += `<span style="font-weight:bold; color:#111827; font-size:1.05rem; margin-right:4px;">${ch}:</span>`;
            
            for (let i = 1; i <= strokesCount; i++) {
              const stepStrokes = data.strokes.slice(0, i);
              let svgPaths = '';
              stepStrokes.forEach(pathData => {
                svgPaths += `<path d="${pathData}" fill="#111827" transform="scale(0.022, -0.022) translate(0, -900)" />`;
              });

              charStepsHtml += `
                <div style="display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px;">
                  <svg width="22" height="22" viewBox="0 0 24 24" style="overflow:visible;">
                    ${svgPaths}
                  </svg>
                </div>`;
            }
            charStepsHtml += `</div>`;
            sequenceHtml += charStepsHtml;
          }
          pending--;
          if (pending === 0) {
            stepsContainer.innerHTML = sequenceHtml || '';
          }
        }).catch(err => {
          pending--;
          if (pending === 0 && !sequenceHtml) {
            stepsContainer.innerHTML = '';
          }
        });
      });
    });
  }
}

window.triggerRadicalPrintWorksheet = function() {
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  if (isIOS) {
    window.print();
    return;
  }

  const printWrap = document.getElementById('radical-print-worksheet-content-wrap');
  if (!printWrap) {
    window.print();
    return;
  }

  const printWindow = window.open('', '_blank', 'width=920,height=900');
  if (!printWindow) {
    window.print();
    return;
  }

  const contentHtml = printWrap.innerHTML;

  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Phiếu Tập Viết Bộ Thủ Tiếng Trung - Tiếng Trung HongTai</title>
      <meta charset="utf-8">
      <style>
        @page {
          size: A4 portrait;
          margin: 5mm 8mm;
        }
        * {
          box-sizing: border-box;
        }
        body {
          font-family: 'Be Vietnam Pro', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #ffffff !important;
          color: #000000 !important;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .print-page-area {
          width: 100% !important;
          max-width: 100% !important;
          box-shadow: none !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .print-word-card {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          margin-bottom: 20px !important;
        }
        .no-print {
          display: none !important;
        }
      </style>
    </head>
    <body>
      ${contentHtml}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            window.close();
          }, 350);
        };
      <\/script>
    </body>
    </html>
  `);
  printWindow.document.close();
};
