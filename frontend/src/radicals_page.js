import './style.css';
import radicalsData from './radicals_data.json';

let currentTab = '50 bộ (1)';
let writerInstance = null;

function speakText(text) {
  if (!text) return;
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'zh-CN';
    utterance.rate = 0.85;
    window.speechSynthesis.speak(utterance);
  }
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
    
    let html = `
      <div class="grid-container">
    `;

    list.forEach((r, idx) => {
      html += `
        <div class="rad-card" onclick="window.openRadicalDetail('${r.id}')">
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

window.openRadicalDetail = function(radId) {
  const r = (radicalsData.radicals || []).find(item => item.id === radId);
  if (!r) return;

  const modal = document.getElementById('radical-detail-modal');
  const cardBody = document.getElementById('radical-detail-card-body');
  if (!modal || !cardBody) return;

  modal.style.display = 'flex';

  // Flashcard structure matching Image 2 mockup
  cardBody.innerHTML = `
    <div style="display: flex; gap: 24px; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; text-align: left; width: 100%;">
      
      <!-- LEFT COLUMN: TIANZIGE (Cách viết) -->
      <div style="display: flex; flex-direction: column; align-items: center; gap: 10px;">
        <div style="font-size: 0.85rem; font-weight: 700; color: #3b82f6; text-transform: uppercase; letter-spacing: 0.5px;">Cách viết</div>
        <div id="rad-tianzige-box" style="width: 170px; height: 170px; background: #ffffff; border: 2px solid #dc2626; border-radius: 12px; position: relative; overflow: hidden; box-shadow: 0 4px 14px rgba(0,0,0,0.15);"></div>
        <button onclick="window.animateRadicalStroke()" style="background: rgba(37, 99, 235, 0.15); color: #2563eb; border: 1px solid rgba(37, 99, 235, 0.3); padding: 6px 14px; border-radius: 99px; font-weight: 700; cursor: pointer; font-size: 0.85rem;">
          <i class="fa-solid fa-pen-nib"></i> Phát lại nét
        </button>
      </div>

      <!-- RIGHT COLUMN: DETAILS (Hán Việt, Nghĩa, Phiên âm, Bộ thủ, Cách dùng, Ví dụ) -->
      <div style="flex: 1; min-width: 260px; display: flex; flex-direction: column; gap: 10px;">
        
        <!-- Line 1: Hán Việt -->
        <div style="font-size: 1.25rem; font-weight: 800; color: #2563eb;">
          Hán-Việt: <span style="color: #ffffff;">${r.name}</span>
        </div>

        <!-- Line 2: Nghĩa -->
        <div style="font-size: 1.5rem; font-weight: 800; color: #34d399; border-bottom: 2px solid rgba(255,255,255,0.1); padding-bottom: 6px;">
          Nghĩa: ${r.meaning}
        </div>

        <!-- Line 3: Phiên âm -->
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="font-size: 1.2rem; font-weight: 700; color: #38bdf8; font-family: var(--font-pinyin);">
            Phiên âm: ${r.pinyin}
          </div>
          <button onclick="speakText('${(r.radical || '').replace(/'/g, "\\'")}')" style="background: linear-gradient(135deg, #2563eb, #1d4ed8); color: white; border: none; width: 38px; height: 36px; border-radius: 50%; font-size: 1rem; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-volume-high"></i>
          </button>
        </div>

        <!-- Line 4: Bộ thủ -->
        <div style="background: rgba(37, 99, 235, 0.12); border: 1px solid rgba(37, 99, 235, 0.3); padding: 8px 12px; border-radius: 10px; font-weight: 700; font-size: 1.1rem; color: #ffffff;">
          Bộ thủ: <span style="font-family: var(--font-hanzi); font-size: 1.4rem; color: #2563eb;">${r.radical}</span> ${r.variant ? `(Biến thể: <span style="font-family: var(--font-hanzi); color: #60a5fa;">${r.variant}</span>)` : ''}
        </div>

        <!-- Line 5: Cách dùng -->
        ${r.note ? `
          <div style="font-size: 0.95rem; color: #94a3b8; font-style: italic; line-height: 1.4;">
            <i class="fa-solid fa-circle-info" style="color: #3b82f6; margin-right: 4px;"></i> <strong>Cách dùng:</strong> ${r.note}
          </div>
        ` : ''}

        <!-- Line 6: VD -->
        ${r.example ? `
          <div style="background: rgba(255,255,255,0.04); border-left: 3px solid #2563eb; padding: 10px 14px; border-radius: 0 8px 8px 0; margin-top: 4px;">
            <div style="font-size: 0.85rem; font-weight: 700; color: #3b82f6; text-transform: uppercase; margin-bottom: 2px;">Ví dụ:</div>
            <div style="font-size: 1rem; color: #ffffff; font-weight: 600;">${r.example}</div>
          </div>
        ` : ''}

      </div>
    </div>
  `;

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
};

window.animateRadicalStroke = function() {
  if (writerInstance) {
    writerInstance.animateCharacter();
  }
};

document.addEventListener('DOMContentLoaded', () => {
  renderContent();
});
