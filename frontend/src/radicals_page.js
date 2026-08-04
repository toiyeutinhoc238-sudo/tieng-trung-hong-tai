import './style.css';
import radicalsData from './radicals_data.json';

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
  const API_BASE_URL = window.location.origin;
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

function initSeasonalParticles() {
  const canvas = document.getElementById('seasonal-particle-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const month = new Date().getMonth() + 1; // 1 to 12
  let season = 'spring';
  if (month >= 1 && month <= 3) season = 'spring';      // Tháng 1-3: Hoa đào xuân
  else if (month >= 4 && month <= 6) season = 'summer'; // Tháng 4-6: Lá xanh
  else if (month >= 7 && month <= 9) season = 'autumn'; // Tháng 7-9: Lá vàng thu
  else season = 'winter';                              // Tháng 10-12: Tuyết rơi

  const particleCount = season === 'winter' ? 40 : 28;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: season === 'winter' ? Math.random() * 3.5 + 2 : Math.random() * 7 + 5,
      speedY: Math.random() * 1.2 + 0.5,
      speedX: Math.sin(Math.random() * Math.PI) * 0.7,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 1.5,
      opacity: Math.random() * 0.65 + 0.35
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    if (localStorage.getItem('particles_enabled') !== 'false') {
      particles.forEach(p => {
        p.y += p.speedY;
        p.x += Math.sin(p.y * 0.01) * 0.5;
        p.rotation += p.rotSpeed;

        if (p.y > height + 20) {
          p.y = -20;
          p.x = Math.random() * width;
        }
        if (p.x > width + 20) p.x = -20;
        if (p.x < -20) p.x = width + 20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.globalAlpha = p.opacity;

        if (season === 'winter') {
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else if (season === 'spring') {
          ctx.fillStyle = 'rgba(255, 183, 197, 0.85)';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (season === 'summer') {
          ctx.fillStyle = 'rgba(74, 222, 128, 0.8)';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.4, 0.4, 0, Math.PI * 2);
          ctx.fill();
        } else if (season === 'autumn') {
          ctx.fillStyle = 'rgba(245, 158, 11, 0.85)';
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.5, 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
    }
    requestAnimationFrame(render);
  }

  render();
}

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

  renderContent();
};

function renderContent() {
  const container = document.getElementById('radicals-content-area');
  if (!container) return;

  if (currentTab === 'So sánh') {
    const compList = radicalsData.comparisons || [];
    let html = `
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="background: rgba(37, 99, 235, 0.12); border: 1px solid rgba(37, 99, 235, 0.3); border-radius: 14px; padding: 14px 18px; color: var(--text-color); font-size: 0.93rem; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-circle-info" style="color: #3b82f6; font-size: 1.1rem;"></i>
          <span>Tổng hợp 25 cặp bộ thủ có hình dáng tương đồng và bí quyết phân biệt chi tiết:</span>
        </div>
    `;

    compList.forEach(c => {
      html += `
        <div class="rad-card" style="cursor: default;">
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
    
    let html = `
      <div class="grid-container">
    `;

    list.forEach((r, idx) => {
      html += `
        <div class="rad-card" onclick="window.openRadicalDetailByIndex(${idx})">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: baseline; gap: 8px;">
              <span style="font-family: var(--font-hanzi); font-size: 2.4rem; font-weight: 800; color: #2563eb;">
                ${r.radical}
              </span>
              ${r.variant ? `<span style="font-family: var(--font-hanzi); font-size: 1.5rem; color: #60a5fa; font-weight: 700;">(${r.variant})</span>` : ''}
            </div>
            <span style="font-family: var(--font-pinyin); font-size: 1.15rem; font-weight: 700; color: #38bdf8;">
              ${r.pinyin}
            </span>
          </div>

          <div style="font-size: 1.1rem; font-weight: 800; border-top: 1px solid rgba(255,255,255,0.08); padding-top: 8px;">
            Hán-Việt: ${r.name} - <span style="color: #34d399;">${r.meaning}</span>
          </div>

          ${r.note ? `
            <div style="font-size: 0.85rem; color: var(--text-muted); font-style: italic; line-height: 1.35; background: rgba(0,0,0,0.15); padding: 6px 10px; border-radius: 6px;">
              <i class="fa-solid fa-circle-info" style="color: #3b82f6; margin-right: 4px;"></i> ${r.note}
            </div>
          ` : ''}

          ${r.example ? `
            <div style="font-size: 0.88rem; color: var(--text-color); font-weight: 600; margin-top: 2px;">
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

// Open Flashcard Mode at specific index
window.openRadicalDetailByIndex = function(index) {
  if (!currentFlashcardList || currentFlashcardList.length === 0) {
    currentFlashcardList = (radicalsData.radicals || []).filter(r => r.category === currentTab);
  }
  if (index < 0) index = currentFlashcardList.length - 1;
  if (index >= currentFlashcardList.length) index = 0;

  currentFlashcardIndex = index;
  renderFlashcardCard(currentFlashcardList[currentFlashcardIndex]);
};

window.openRadicalDetail = function(radId) {
  const list = currentFlashcardList.length > 0 ? currentFlashcardList : (radicalsData.radicals || []);
  const idx = list.findIndex(r => r.id === radId);
  if (idx !== -1) {
    window.openRadicalDetailByIndex(idx);
  } else {
    const item = (radicalsData.radicals || []).find(r => r.id === radId);
    if (item) renderFlashcardCard(item);
  }
};

window.startRadicalFlashcardMode = function() {
  if (currentTab === 'So sánh') {
    currentFlashcardList = radicalsData.radicals || [];
  } else {
    currentFlashcardList = (radicalsData.radicals || []).filter(r => r.category === currentTab);
  }
  if (currentFlashcardList.length > 0) {
    window.openRadicalDetailByIndex(0);
  }
};

window.nextRadicalFlashcard = function() {
  if (currentFlashcardList.length > 0) {
    window.openRadicalDetailByIndex(currentFlashcardIndex + 1);
  }
};

window.prevRadicalFlashcard = function() {
  if (currentFlashcardList.length > 0) {
    window.openRadicalDetailByIndex(currentFlashcardIndex - 1);
  }
};

// Render Flashcard Card (Tương thích sắc nét cả Chế độ Sáng & Tối)
function renderFlashcardCard(r) {
  if (!r) return;

  const modal = document.getElementById('radical-detail-modal');
  const cardBody = document.getElementById('radical-detail-card-body');
  if (!modal || !cardBody) return;

  modal.style.display = 'flex';

  const total = currentFlashcardList.length;
  const currNum = currentFlashcardIndex + 1;

  cardBody.innerHTML = `
    <!-- Top Progress Bar & Category Counter -->
    <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; border-bottom: 1px solid rgba(148, 163, 184, 0.2); padding-bottom: 12px; flex-wrap: wrap; gap: 8px;">
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="background: rgba(37, 99, 235, 0.12); color: #2563eb; padding: 4px 12px; border-radius: 99px; font-weight: 800; font-size: 0.85rem; border: 1px solid rgba(37, 99, 235, 0.25);">
          ${r.category || 'Bộ thủ'}
        </span>
        <span style="font-weight: 700; font-size: 0.92rem;" class="rad-text-sub">
          Thẻ ${currNum} / ${total}
        </span>
      </div>

      <div style="font-size: 0.82rem; font-weight: 600; display: flex; align-items: center; gap: 6px;" class="rad-text-sub">
        <i class="fa-solid fa-keyboard"></i> Phím mũi tên &larr; &rarr; để đổi thẻ
      </div>
    </div>

    <!-- MAIN CARD CONTENT -->
    <div style="display: flex; gap: 28px; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; text-align: left; width: 100%;">
      
      <!-- LEFT COLUMN: TIANZIGE (CÁCH VIẾT) -->
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center;">
        <div style="font-size: 0.85rem; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 0.8px; margin-bottom: 8px;">
          CÁCH VIẾT
        </div>

        <div id="rad-tianzige-box" style="width: 170px; height: 170px; background: #ffffff; border: 2px solid #dc2626; border-radius: 16px; position: relative; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.08); display: flex; align-items: center; justify-content: center;"></div>

        <button onclick="window.animateRadicalStroke()" style="margin-top: 14px; background: rgba(37, 99, 235, 0.12); color: #2563eb; border: 1px solid rgba(37, 99, 235, 0.28); padding: 8px 18px; border-radius: 99px; font-weight: 800; cursor: pointer; font-size: 0.88rem; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1); transition: all 0.2s;">
          <i class="fa-solid fa-pen-nib"></i> Phát lại nét
        </button>
      </div>

      <!-- RIGHT COLUMN: DETAILS -->
      <div style="flex: 1; min-width: 270px; display: flex; flex-direction: column; gap: 12px;">
        
        <!-- Line 1: Hán-Việt -->
        <div style="font-size: 1.35rem; font-weight: 800; color: #2563eb;">
          Hán-Việt: <span class="rad-text-primary" style="text-transform: uppercase; margin-left: 4px;">${r.name}</span>
        </div>

        <!-- Line 2: Nghĩa -->
        <div style="font-size: 1.55rem; font-weight: 800; color: #10b981;">
          Nghĩa: <span style="color: #10b981; margin-left: 4px;">${r.meaning}</span>
        </div>

        <!-- Line 3: Phiên âm + Baidu Female Audio Button -->
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="font-size: 1.25rem; font-weight: 700; color: #0284c7; font-family: var(--font-pinyin);">
            Phiên âm: <span style="font-weight: 800; margin-left: 4px;">${r.pinyin}</span>
          </div>

          <button onclick="window.speakText('${(r.radical || '').replace(/'/g, "\\'")}')" title="Phát âm Giọng Baidu Nữ chuẩn" style="background: #2563eb; color: #ffffff; border: none; width: 44px; height: 44px; border-radius: 50%; font-size: 1.15rem; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35); transition: transform 0.15s;" onmousedown="this.style.transform='scale(0.92)'" onmouseup="this.style.transform='scale(1)'">
            <i class="fa-solid fa-volume-high"></i>
          </button>
        </div>

        <!-- Line 4: Bộ thủ Box -->
        <div class="rad-info-box" style="padding: 10px 16px; border-radius: 12px; font-weight: 800; font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
          Bộ thủ: <span style="font-family: var(--font-hanzi); font-size: 1.5rem; color: #2563eb; font-weight: 800;">${r.radical}</span>
          ${r.variant ? `<span class="rad-variant-text" style="font-weight: 600; font-size: 1.05rem;">(Biến thể: <span style="font-family: var(--font-hanzi); color: #2563eb; font-weight: 700; font-size: 1.3rem;">${r.variant}</span> )</span>` : ''}
        </div>

        <!-- Line 5: Cách dùng -->
        ${r.note ? `
          <div class="rad-text-sub" style="font-size: 0.95rem; font-style: italic; line-height: 1.5; display: flex; align-items: flex-start; gap: 6px;">
            <i class="fa-solid fa-circle-info" style="color: #2563eb; font-size: 1rem; margin-top: 2px;"></i>
            <span><strong>Cách dùng:</strong> ${r.note}</span>
          </div>
        ` : ''}

        <!-- Line 6: VD -->
        ${r.example ? `
          <div style="border-left: 3.5px solid #2563eb; padding-left: 14px; margin-top: 4px;">
            <div style="font-size: 0.85rem; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 2px;">VÍ DỤ:</div>
            <div class="rad-text-primary" style="font-size: 1.05rem; font-weight: 700;">${r.example}</div>
          </div>
        ` : ''}

      </div>
    </div>

    <!-- BOTTOM NAVIGATION CONTROLS -->
    <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 28px; border-top: 1px solid rgba(148, 163, 184, 0.2); padding-top: 18px; flex-wrap: wrap; gap: 12px;">
      <button onclick="window.prevRadicalFlashcard()" style="background: rgba(255, 255, 255, 0.9); color: #334155; border: 1.5px solid #cbd5e1; padding: 10px 20px; border-radius: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.2s; box-shadow: 0 2px 8px rgba(0,0,0,0.05);">
        <i class="fa-solid fa-chevron-left"></i> Thẻ trước
      </button>

      <button onclick="window.speakText('${(r.radical || '').replace(/'/g, "\\'")}')" style="background: rgba(37, 99, 235, 0.12); color: #2563eb; border: 1px solid rgba(37, 99, 235, 0.3); padding: 10px 22px; border-radius: 99px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px;">
        <i class="fa-solid fa-volume-high"></i> Giọng Baidu Nữ
      </button>

      <button onclick="window.nextRadicalFlashcard()" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; padding: 10px 22px; border-radius: 12px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(37, 99, 235, 0.35);">
        Thẻ tiếp theo <i class="fa-solid fa-chevron-right"></i>
      </button>
    </div>
  `;

  // Automatically play Baidu female audio on card open
  speakText(r.radical);

  // Init HanziWriter for radical
  setTimeout(() => {
    const box = document.getElementById('rad-tianzige-box');
    if (box && window.HanziWriter) {
      box.innerHTML = '';
      writerInstance = window.HanziWriter.create('rad-tianzige-box', r.radical, {
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

window.animateRadicalStroke = function() {
  if (writerInstance) {
    writerInstance.animateCharacter();
  }
};

// Keyboard listener for Flashcard navigation
document.addEventListener('keydown', (e) => {
  const modal = document.getElementById('radical-detail-modal');
  if (modal && modal.style.display === 'flex') {
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
  initSeasonalParticles();
  renderContent();
});
