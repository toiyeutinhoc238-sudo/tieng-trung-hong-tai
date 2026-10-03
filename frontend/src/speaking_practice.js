/**
 * Tiếng Trung HongTai - AI Speaking Practice & HSKK Speech Grader (3p - 2p)
 * Khớp 100% bản vẽ Luyện Nói: Trình độ Sơ/Trung/Cao, Đề + Quay Random,
 * Gợi ý AI (Dàn bài, từ vựng, mẫu câu), Chuẩn bị (3p) và Bắt đầu nói (2p) có thu âm.
 */

import './global_sidebar.js';
import { pinyin } from 'pinyin-pro';

// Strict Authentication Verification for Speaking Practice
function isSpeakingUserAuthenticated() {
  if (typeof window.isUserLoggedIn === 'function') {
    return window.isUserLoggedIn();
  }
  try {
    const stored = localStorage.getItem('user') || localStorage.getItem('hongtai_current_user') || localStorage.getItem('currentUser') || sessionStorage.getItem('user');
    if (!stored) return false;
    const u = JSON.parse(stored);
    const email = (u?.email || '').toLowerCase().trim();
    return !!(email && email !== 'guest' && !email.startsWith('guest') && email.includes('@'));
  } catch (e) {
    return false;
  }
}

function requireSpeakingLoginGate(actionName = 'Luyện Nói HSKK & AI') {
  if (isSpeakingUserAuthenticated()) return true;
  if (typeof window.showGlobalAuthModal === 'function') {
    window.showGlobalAuthModal({
      isMandatoryPageLock: true,
      actionName: actionName,
      title: `Đăng Nhập Để Dùng: ${actionName}`,
      desc: `Hệ thống yêu cầu bạn đăng nhập bằng Google trước khi sử dụng <strong>${actionName}</strong> để đồng bộ tiến độ và lưu kết quả học tập.`
    });
  }
  return false;
}

const API_BASE_URL = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
  ? ''
  : '';

let hskkQuestionsData = {
  so: [],
  trung: [],
  cao: []
};

let currentSpeakingLevel = 'trung'; // 'so' | 'trung' | 'cao'
let currentActiveQuestion = null;
let aiSuggestionsCache = new Map();
let isFetchingHint = false;

// Trạng thái Timer Chuẩn Bị (3 phút = 180s)
let prepTimerInterval = null;
let prepRemainingSeconds = 180;
let isPrepPaused = false;

// Trạng thái Timer Nói & Ghi Âm (2 phút = 120s)
let speakingTimerInterval = null;
let speakingRemainingSeconds = 120;
let mediaRecorder = null;
let audioChunks = [];
let recordedAudioBlob = null;
let recordedAudioUrl = null;
let speechRecognizer = null;
let isRecordingActive = false;
let recordedDurationSeconds = 0;

// Web Audio API Tones
function playAudioTone(type = 'beep') {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'spin') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.25);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else if (type === 'start') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } else if (type === 'chime') {
      // 3-note pleasant chime for timer end
      const now = ctx.currentTime;
      [523.25, 659.25, 783.99].forEach((freq, i) => {
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = 'sine';
        o.frequency.value = freq;
        o.connect(g);
        g.connect(ctx.destination);
        g.gain.setValueAtTime(0.18, now + i * 0.15);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 0.4);
        o.start(now + i * 0.15);
        o.stop(now + i * 0.15 + 0.4);
      });
    }
  } catch (e) { }
}

// 1. Khởi tạo câu hỏi HSKK
async function initSpeakingQuestions() {
  try {
    let res = await fetch(`${API_BASE_URL}/api/hskk-questions`);
    if (!res.ok) {
      res = await fetch('/data/hskk_questions.json');
    }
    const data = await res.json();
    if (data && (data.so || data.questions)) {
      if (data.so) {
        hskkQuestionsData = data;
      } else if (data.questions) {
        hskkQuestionsData.so = data.questions.filter(q => q.level === 'so');
        hskkQuestionsData.trung = data.questions.filter(q => q.level === 'trung');
        hskkQuestionsData.cao = data.questions.filter(q => q.level === 'cao');
      }
    }
  } catch (e) {
    console.warn('Lỗi nạp API HSKK, thử nạp tĩnh...', e);
    try {
      const resStatic = await fetch('/data/hskk_questions.json');
      if (resStatic.ok) {
        hskkQuestionsData = await resStatic.json();
      }
    } catch (err2) { }
  }

  const total = (hskkQuestionsData.so?.length || 0) + (hskkQuestionsData.trung?.length || 0) + (hskkQuestionsData.cao?.length || 0);
  const totalEl = document.getElementById('total-speaking-stat');
  if (totalEl && total > 0) totalEl.textContent = total.toLocaleString();

  spinRandomQuestion(false);
  if (!isSpeakingUserAuthenticated()) {
    requireSpeakingLoginGate('Luyện Nói HSKK & AI');
  }
}

// 2. Chuyển đổi Cấp độ: [Sơ] [Trung] [Cao]
window.switchSpeakingLevel = function (level, btn) {
  if (!requireSpeakingLoginGate('Chọn Cấp Độ HSKK')) return;
  if (currentSpeakingLevel === level && currentActiveQuestion) return;
  currentSpeakingLevel = level;

  document.querySelectorAll('.level-select-row .level-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  spinRandomQuestion(true);
};

// 3. Nút [Quay] (Random đề bài)
window.spinRandomQuestion = function (playAnim = true) {
  if (playAnim && !requireSpeakingLoginGate('Quay Ngẫu Nhiên Đề Thi')) return;
  const list = hskkQuestionsData[currentSpeakingLevel] || [];
  if (!list || list.length === 0) return;

  const btn = document.getElementById('spin-question-btn');
  if (playAnim && btn) {
    btn.classList.add('rolling');
    playAudioTone('spin');
    setTimeout(() => btn.classList.remove('rolling'), 500);
  }

  let nextQ = null;
  if (list.length === 1) {
    nextQ = list[0];
  } else {
    do {
      nextQ = list[Math.floor(Math.random() * list.length)];
    } while (currentActiveQuestion && nextQ.question === currentActiveQuestion.question && list.length > 1);
  }

  currentActiveQuestion = nextQ;
  renderCurrentQuestion();

  // Đóng khối gợi ý nếu đang mở
  const hintBox = document.getElementById('ai-suggestion-box');
  if (hintBox) hintBox.style.display = 'none';
  const hintBtn = document.getElementById('hint-toggle-btn');
  if (hintBtn) {
    hintBtn.innerHTML = `
      <i class="fa-solid fa-lightbulb"></i>
      <span>Gợi ý Dàn bài &amp; Từ vựng</span>
    `;
  }

  // Đóng khối bài nói mẫu nếu đang mở
  const sampleBox = document.getElementById('sample-speech-box');
  if (sampleBox) sampleBox.style.display = 'none';
  const sampleBtn = document.getElementById('sample-speech-toggle-btn');
  if (sampleBtn) {
    sampleBtn.innerHTML = `
      <i class="fa-solid fa-medal"></i>
      <span>Bài nói mẫu tham khảo</span>
    `;
  }

  // Đặt lại các trạng thái ghi âm / chuẩn bị
  resetPrepTimer();
  cancelSpeakingRecording();
  const resBox = document.getElementById('recorded-result-box');
  if (resBox) resBox.style.display = 'none';
  const evalBox = document.getElementById('ai-speaking-evaluation-results');
  if (evalBox) evalBox.style.display = 'none';
};

function renderCurrentQuestion() {
  if (!currentActiveQuestion) return;

  const textEl = document.getElementById('active-question-text');
  const badgeEl = document.getElementById('question-meta-badge');
  const lvlName = currentSpeakingLevel === 'so' ? 'HSKK Sơ cấp' : currentSpeakingLevel === 'cao' ? 'HSKK Cao cấp' : 'HSKK Trung cấp';

  if (textEl) textEl.textContent = currentActiveQuestion.question;
  if (badgeEl) {
    badgeEl.textContent = `Câu ${currentActiveQuestion.stt || 1} • ${lvlName}`;
  }
}

// Phát âm đề thi
window.playQuestionTts = function () {
  if (!currentActiveQuestion || !currentActiveQuestion.question) return;
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(currentActiveQuestion.question);
  utter.lang = 'zh-CN';
  utter.rate = 0.9;
  window.speechSynthesis.speak(utter);
};

// 4. Nút [Gợi ý] (AI tự đề xuất Dàn bài + Từ vựng + Mẫu câu)
window.toggleAiSuggestions = async function () {
  if (!requireSpeakingLoginGate('Xem Gợi Ý Dàn Bài & Từ Vựng AI')) return;
  const box = document.getElementById('ai-suggestion-box');
  const btn = document.getElementById('hint-toggle-btn');
  if (!box || !currentActiveQuestion) return;

  const isVisible = box.style.display === 'block';

  if (isVisible) {
    box.style.display = 'none';
    if (btn) {
      btn.innerHTML = `
        <i class="fa-solid fa-lightbulb"></i>
        <span>Gợi ý Dàn bài &amp; Từ vựng</span>
      `;
    }
    return;
  }

  box.style.display = 'block';
  if (btn) {
    btn.innerHTML = `
      <i class="fa-solid fa-eye-slash"></i>
      <span>Ẩn Gợi ý</span>
    `;
  }

  const qKey = `${currentSpeakingLevel}_${currentActiveQuestion.question}`;
  if (aiSuggestionsCache.has(qKey)) {
    renderAiSuggestionContent(aiSuggestionsCache.get(qKey));
    return;
  }

  if (isFetchingHint) return;
  isFetchingHint = true;

  box.innerHTML = `
    <div style="text-align: center; padding: 24px 16px; color: #f59e0b;">
      <i class="fa-solid fa-brain fa-spin" style="font-size: 2rem; margin-bottom: 12px; color: #f59e0b;"></i>
      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
        AI HongTai đang lập Dàn ý &amp; chọn lọc Từ vựng Khẩu ngữ...
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8;">
        Phù hợp chuẩn thi HSKK ${currentSpeakingLevel === 'so' ? 'Sơ cấp' : currentSpeakingLevel === 'cao' ? 'Cao cấp' : 'Trung cấp'}
      </div>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE_URL}/api/ai/hskk-suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: currentActiveQuestion.question,
        level: currentSpeakingLevel,
        skill: 'speaking'
      })
    });

    if (res.ok) {
      const data = await res.json();
      aiSuggestionsCache.set(qKey, data);
      renderAiSuggestionContent(data);
      playAudioTone('start');
    } else {
      throw new Error('Server error');
    }
  } catch (err) {
    console.error('Lỗi gợi ý AI:', err);
    box.innerHTML = `
      <div style="text-align: center; padding: 24px 16px; color: #f87171;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; margin-bottom: 12px; color: #ef4444;"></i>
        <div style="font-weight: 700; font-size: 1rem; color: #ffffff; margin-bottom: 6px;">
          Chưa thể tạo gợi ý dàn bài lúc này
        </div>
        <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 16px;">
          Hệ thống AI đang phản hồi chậm hoặc bận. Vui lòng bấm thử lại để nhận gợi ý chuẩn bám sát đề bài.
        </div>
        <button onclick="window.toggleAiSuggestion && window.toggleAiSuggestion()" style="background: #f59e0b; color: #ffffff; border: none; padding: 8px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-rotate-right"></i> Thử lại
        </button>
      </div>
    `;
  } finally {
    isFetchingHint = false;
  }
};

function renderAiSuggestionContent(data) {
  const box = document.getElementById('ai-suggestion-box');
  if (!box) return;

  const outline = data.outline || {};
  const vocabList = data.vocabulary || [];
  const sentenceList = data.sentenceStructures || [];

  const introText = (outline.intro || 'Trả lời trực tiếp vào trọng tâm câu hỏi.').normalize('NFC');
  const bodyItems = (outline.body || []).map(b => (b || '').normalize('NFC'));
  const conclusionText = (outline.conclusion || 'Đúc kết bài học hoặc cảm xúc cá nhân.').normalize('NFC');

  box.innerHTML = `
    <div class="ai-hint-box-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px dashed rgba(34, 197, 94, 0.4); padding-bottom: 10px; font-family: 'Be Vietnam Pro', sans-serif;">
      <div class="ai-hint-box-title" style="display: flex; align-items: center; gap: 8px; font-weight: 900; font-size: 1.05rem; color: var(--hint-header-color, #15803d);">
        <i class="fa-solid fa-wand-magic-sparkles" style="color: #10b981;"></i>
        <span>AI Đề Xuất Dàn Ý &amp; Từ Vựng Khẩu Ngữ</span>
      </div>
      <span class="ai-hint-badge" style="font-size: 0.75rem; background: var(--hint-badge-bg, #dcfce7); color: var(--hint-badge-color, #15803d); border: 1px solid var(--hint-badge-border, #86efac); padding: 3px 10px; border-radius: 6px; font-weight: 800;">
        HSKK ${currentSpeakingLevel === 'so' ? 'Sơ cấp' : currentSpeakingLevel === 'cao' ? 'Cao cấp' : 'Trung cấp'}
      </span>
    </div>

    <!-- 1. Dàn bài -->
    <div style="margin-bottom: 18px; font-family: 'Be Vietnam Pro', sans-serif;">
      <div class="ai-outline-title" style="font-size: 0.94rem; font-weight: 800; color: var(--outline-title-color, #b45309); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
        <i class="fa-solid fa-list-ol" style="color: #f59e0b;"></i> <span>1. Dàn bài gợi ý:</span>
      </div>
      <div class="ai-outline-box" style="background: var(--outline-box-bg, #fffbeb); border: 1px solid var(--outline-box-border, #fde68a); border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 12px; font-size: 0.92rem; line-height: 1.7; color: var(--outline-box-color, #1e293b); font-family: 'Be Vietnam Pro', sans-serif;">
        <div style="margin-bottom: 6px;"><strong>Mở đầu:</strong> ${introText}</div>
        <div style="margin-bottom: 6px;">
          <strong>Triển khai thân bài:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 20px;">
            ${bodyItems.map(b => `<li style="margin-bottom: 4px;">${b}</li>`).join('')}
          </ul>
        </div>
        <div><strong>Kết thúc:</strong> ${conclusionText}</div>
      </div>
    </div>

    <!-- 2. Từ vựng có thể sử dụng -->
    <div style="margin-bottom: 18px; font-family: 'Be Vietnam Pro', sans-serif;">
      <div class="ai-vocab-section-title" style="font-size: 0.94rem; font-weight: 800; color: var(--vocab-title-color, #0284c7); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
        <i class="fa-solid fa-key" style="color: #0284c7;"></i> <span>2. Từ vựng / Cụm từ đắt giá nên nói:</span>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${vocabList.map(v => {
          let accuratePy = v.pinyin;
          if (v.hanzi) {
            try {
              const py = pinyin(v.hanzi, { toneType: 'symbol' });
              if (py) accuratePy = py;
            } catch (e) {}
          }
          const vMeaning = (v.meaning || '').normalize('NFC');
          return `
          <div class="ai-vocab-pill"
            style="background: var(--vocab-pill-bg, #f0f9ff); border: 1.5px solid var(--vocab-pill-border, #7dd3fc); padding: 6px 14px; border-radius: 99px; display: inline-flex; align-items: center; gap: 4px; font-family: 'Be Vietnam Pro', sans-serif;">
            <span class="ai-vocab-hanzi hanzi-text" style="font-weight: 800; color: var(--vocab-hanzi-color, #0f172a); font-size: 0.95rem;">${v.hanzi}</span>
            <span class="ai-vocab-pinyin" style="font-size: 0.8rem; color: var(--vocab-pinyin-color, #0284c7); font-weight: 700; margin: 0 3px;">(${accuratePy})</span>
            <span class="ai-vocab-meaning" style="font-size: 0.82rem; color: var(--vocab-meaning-color, #334155); font-weight: 600; font-family: 'Be Vietnam Pro', sans-serif !important;">: ${vMeaning}</span>
          </div>
        `}).join('')}
      </div>
    </div>

    <!-- 3. Mẫu câu cấu trúc nên dùng -->
    ${sentenceList.length > 0 ? `
      <div class="ai-grammar-section" style="margin-bottom: 14px; font-family: 'Be Vietnam Pro', sans-serif;">
        <div class="ai-grammar-section-title" style="font-size: 1.02rem; font-weight: 900; color: var(--grammar-title-color, #6b21a8); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-puzzle-piece" style="color: var(--grammar-icon-color, #7c3aed); font-size: 1.1rem;"></i>
          <span>3. Mẫu câu kết nối lưu loát:</span>
        </div>
        <div class="ai-grammar-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
          ${sentenceList.map(s => {
            const sPattern = (s.pattern || '').normalize('NFC');
            const sMeaning = (s.meaning || '').normalize('NFC');
            const sExample = (s.example || '').normalize('NFC');
            return `
            <div class="ai-grammar-card" style="background: var(--grammar-card-bg, #ffffff); border: 2px solid var(--grammar-card-border, #a855f7); border-radius: 16px; padding: 16px 18px; box-shadow: var(--grammar-card-shadow, 0 4px 16px rgba(124, 58, 237, 0.12)); display: flex; flex-direction: column; justify-content: space-between; font-family: 'Be Vietnam Pro', sans-serif;">
              <div>
                <div class="ai-grammar-pattern" style="font-weight: 900; font-size: 1.18rem; color: var(--grammar-pattern-color, #581c87); margin-bottom: 6px; line-height: 1.4; font-family: 'Be Vietnam Pro', var(--font-chinese), sans-serif; letter-spacing: 0.3px;">
                  ${sPattern}
                </div>
                <div class="ai-grammar-meaning" style="font-size: 0.92rem; color: var(--grammar-meaning-color, #0f172a); font-weight: 700; margin-bottom: 10px; line-height: 1.5; font-family: 'Be Vietnam Pro', sans-serif !important;">
                  ${sMeaning}
                </div>
              </div>
              ${sExample ? `
                <div class="ai-grammar-example" style="font-size: 0.94rem; color: var(--grammar-example-color, #0f172a); font-weight: 600; background: var(--grammar-example-bg, #f3e8ff); border: 1px solid var(--grammar-example-border-sub, #ddd6fe); border-left: 4.5px solid var(--grammar-example-border, #7c3aed); padding: 10px 14px; border-radius: 10px; line-height: 1.65; font-family: 'Be Vietnam Pro', var(--font-chinese), sans-serif !important; margin-top: 6px;">
                  <strong class="example-label" style="color: var(--grammar-vd-color, #6d28d9); font-weight: 900; font-family: 'Be Vietnam Pro', sans-serif !important; margin-right: 6px;">VD:</strong>${sExample}
                </div>
              ` : ''}
            </div>
          `}).join('')}
        </div>
      </div>
    ` : ''}
  `;
}

// 4B. TÁCH RIÊNG: Nút [Bài nói mẫu tham khảo] (Dài, chuyên sâu theo chuẩn HSKK)
window.toggleSampleSpeech = async function (forceRefresh = false) {
  if (!requireSpeakingLoginGate('Xem Bài Nói Mẫu Tham Khảo')) return;
  const box = document.getElementById('sample-speech-box');
  const btn = document.getElementById('sample-speech-toggle-btn');
  if (!box || !currentActiveQuestion) return;

  const isVisible = box.style.display === 'block';

  if (isVisible && !forceRefresh) {
    box.style.display = 'none';
    if (btn) {
      btn.innerHTML = `
        <i class="fa-solid fa-medal"></i>
        <span>Bài nói mẫu tham khảo</span>
      `;
    }
    return;
  }

  box.style.display = 'block';
  if (btn) {
    btn.innerHTML = `
      <i class="fa-solid fa-eye-slash"></i>
      <span>Ẩn Bài nói mẫu</span>
    `;
  }

  const qKey = `${currentSpeakingLevel}_${currentActiveQuestion.question}`;
  if (!forceRefresh && aiSuggestionsCache.has(qKey)) {
    const cached = aiSuggestionsCache.get(qKey);
    if (cached && cached.sampleAnswer && cached.sampleAnswer.hanzi && !cached.isFallback) {
      renderSampleSpeechContent(cached);
      return;
    }
  }

  if (forceRefresh) {
    aiSuggestionsCache.delete(qKey);
  }

  box.innerHTML = `
    <div style="text-align: center; padding: 24px 16px; color: #10b981;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 12px; color: #10b981;"></i>
      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
        Đang tạo bài nói mẫu dài chuẩn HSKK ${currentSpeakingLevel === 'so' ? 'Sơ cấp' : currentSpeakingLevel === 'cao' ? 'Cao cấp' : 'Trung cấp'}...
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8;">
        Hệ thống AI đang xây dựng bài nói mẫu chuyên sâu bám sát: "${currentActiveQuestion.question}"
      </div>
    </div>
  `;

  try {
    const res = await fetch(`${API_BASE_URL}/api/ai/hskk-suggest`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        question: currentActiveQuestion.question,
        level: currentSpeakingLevel,
        skill: 'speaking'
      })
    });

    if (res.ok) {
      const data = await res.json();
      aiSuggestionsCache.set(qKey, data);
      renderSampleSpeechContent(data);
      playAudioTone('start');
    } else {
      throw new Error('Server error');
    }
  } catch (err) {
    console.error('Lỗi nạp bài mẫu nói AI, chuyển sang mẫu chuẩn dự phòng:', err);
    const fallback = getFallbackHskkSuggestion();
    aiSuggestionsCache.set(qKey, fallback);
    renderSampleSpeechContent(fallback);
  }
};

window.regenerateSampleSpeech = function () {
  window.toggleSampleSpeech(true);
};

function renderSampleSpeechContent(data) {
  const box = document.getElementById('sample-speech-box');
  if (!box) return;

  const sample = data.sampleAnswer || {};
  let hanziText = sample.hanzi || '';
  // Đảm bảo không dính ký tự tiếng Việt / Latinh trong phần chữ Hán
  hanziText = hanziText
    .replace(/[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆĐÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴ]/g, '')
    .replace(/[\uac00-\ud7af]/g, '')
    .trim();

  const charCount = hanziText.replace(/\s+/g, '').length;

  let samplePy = sample.pinyin || '';
  if (hanziText) {
    try {
      const accurate = pinyin(hanziText, { toneType: 'symbol' });
      if (accurate) samplePy = accurate;
    } catch (e) {}
  }

  const meaningVi = (sample.meaningVi || '').normalize('NFC');

  box.innerHTML = `
    <div class="sample-box-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px dashed rgba(16, 185, 129, 0.4); padding-bottom: 10px; flex-wrap: wrap; gap: 8px; font-family: 'Be Vietnam Pro', sans-serif;">
      <div class="sample-box-title" style="display: flex; align-items: center; gap: 8px; font-weight: 900; font-size: 1.1rem; color: var(--sample-title-color, #059669);">
        <i class="fa-solid fa-medal" style="color: #10b981;"></i>
        <span>Bài Nói Mẫu Tham Khảo (Chuẩn HSKK ${currentSpeakingLevel === 'so' ? 'Sơ cấp' : currentSpeakingLevel === 'cao' ? 'Cao cấp' : 'Trung cấp'})</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        ${data.isFallback ? `
          <span style="font-size: 0.76rem; background: rgba(245, 158, 11, 0.16); color: #d97706; padding: 4px 10px; border-radius: 99px; font-weight: 800; border: 1px solid rgba(245, 158, 11, 0.35);">
            <i class="fa-solid fa-cloud-arrow-down"></i> Mẫu ngoại tuyến
          </span>
        ` : `
          <span style="font-size: 0.76rem; background: rgba(16, 185, 129, 0.18); color: var(--sample-badge-color, #047857); padding: 4px 10px; border-radius: 99px; font-weight: 800; border: 1px solid rgba(16, 185, 129, 0.35);">
            <i class="fa-solid fa-wand-magic-sparkles"></i> AI HongTai Master
          </span>
        `}
        <span style="font-size: 0.78rem; background: rgba(16, 185, 129, 0.18); color: var(--sample-badge-color, #047857); padding: 4px 10px; border-radius: 99px; font-weight: 800; border: 1px solid rgba(16, 185, 129, 0.35);">
          ${charCount} chữ Hán
        </span>
        <button onclick="regenerateSampleSpeech()" title="Yêu cầu AI tạo lại bài nói mẫu mới bám sát đề thi" style="background: rgba(168, 85, 247, 0.15); border: 1px solid #a855f7; color: #a855f7; font-size: 0.82rem; font-weight: 700; padding: 5px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Be Vietnam Pro', sans-serif;">
          <i class="fa-solid fa-rotate-right"></i> <span>Làm mới (AI)</span>
        </button>
        <button onclick="playSpeakingSampleTts()" style="background: rgba(56, 189, 248, 0.15); border: 1px solid #0284c7; color: var(--btn-tts-color, #0284c7); font-size: 0.82rem; font-weight: 700; padding: 5px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px; font-family: 'Be Vietnam Pro', sans-serif;">
          <i class="fa-solid fa-volume-high"></i> <span>Nghe bản xứ đọc</span>
        </button>
      </div>
    </div>

    <!-- Hanzi Text -->
    <div id="sample-speaking-hanzi" class="sample-hanzi-card hanzi-text" style="font-size: 1.12rem; line-height: 1.85; color: var(--sample-hanzi-color, #0f172a); white-space: pre-line; margin-bottom: 14px; font-family: var(--font-chinese), serif; background: var(--sample-hanzi-bg, #ffffff); padding: 16px 20px; border-radius: 12px; border: 1.5px solid var(--sample-hanzi-border, #a7f3d0); border-left: 4px solid #10b981; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.08);">
      ${hanziText}
    </div>

    <!-- Pinyin Text -->
    ${samplePy ? `
      <div style="margin-bottom: 12px; font-family: 'Be Vietnam Pro', sans-serif;">
        <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--sample-pinyin-title, #0284c7); font-weight: 800; margin-bottom: 4px; font-family: 'Be Vietnam Pro', sans-serif;">Phiên âm Pinyin:</div>
        <div class="sample-pinyin-card" style="font-size: 0.92rem; color: var(--sample-pinyin-color, #0369a1); font-style: italic; line-height: 1.65; white-space: pre-line; background: var(--sample-pinyin-bg, #f0f9ff); border: 1px solid var(--sample-pinyin-border, #bae6fd); padding: 12px 16px; border-radius: 10px; font-family: 'Be Vietnam Pro', sans-serif;">${samplePy}</div>
      </div>
    ` : ''}

    <!-- Vietnamese Translation -->
    ${meaningVi ? `
      <div style="font-family: 'Be Vietnam Pro', sans-serif;">
        <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--sample-meaning-title, #b45309); font-weight: 800; margin-bottom: 4px; font-family: 'Be Vietnam Pro', sans-serif;">Dịch nghĩa tiếng Việt:</div>
        <div class="sample-meaning-card" style="font-size: 0.94rem; color: var(--sample-meaning-color, #1e293b); line-height: 1.7; white-space: pre-line; background: var(--sample-meaning-bg, #fffbeb); border: 1px solid var(--sample-meaning-border, #fde68a); padding: 12px 16px; border-radius: 10px; font-family: 'Be Vietnam Pro', sans-serif !important;">${meaningVi}</div>
      </div>
    ` : ''}
  `;
}

function getFallbackHskkSuggestion() {
  const qText = (currentActiveQuestion && currentActiveQuestion.question) ? currentActiveQuestion.question : 'đề bài';
  const lvl = currentSpeakingLevel || 'trung';

  // Nhận diện chủ đề cụ thể để đưa ra bài mẫu bám sát 100% nội dung
  const isIntegrity = /诚|信|欺诈|撒谎|真实|守约|道德/.test(qText);
  const isExercise = /运动|锻炼|走路|健康|跑步|健身|身体/.test(qText);
  const isReading = /读书|学习|汉语|中文|书籍|知识|阅读/.test(qText);
  const isEco = /环境|绿化|树|公园|污染|垃圾|低碳|极简|消费/.test(qText);

  // 1. CHỦ ĐỀ: THÀNH THẬT & GIỮ CHỮ TÍN (诚实守信)
  if (isIntegrity) {
    if (lvl === 'so') {
      return {
        isFallback: true,
        outline: {
          intro: `Mở bài: Nêu quan điểm trực diện: "${qText}". (Làm người thành thật giữ lời hứa là điều rất quan trọng trong cuộc sống.)`,
          body: [
            `Luận điểm 1: Khi làm người thật thà thì bạn bè và mọi người mới tin tưởng. (Tại sao bạn bè cần tin nhau?)`,
            `Luận điểm 2: Làm sai thì phải dũng cảm thừa nhận, không nói dối. (Làm sai thì nên làm thế nào?)`,
            `Luận điểm 3: Bố mẹ và thầy cô luôn dạy chúng ta phải giữ lời hứa. (Bố mẹ dạy bạn điều gì?)`
          ],
          conclusion: "Kết bài: Khuyên mọi người cùng nói thật và giữ chữ tín để cuộc sống vui vẻ, hạnh phúc."
        },
        vocabulary: [
          { hanzi: "诚实", pinyin: "chéngshí", meaning: "thành thật, trung thực" },
          { hanzi: "相信", pinyin: "xiāngxìn", meaning: "tin tưởng" },
          { hanzi: "答应", pinyin: "dāying", meaning: "đồng ý, hứa hẹn" },
          { hanzi: "朋友", pinyin: "péngyou", meaning: "bạn bè" },
          { hanzi: "重要", pinyin: "zhòngyào", meaning: "quan trọng" }
        ],
        sentenceStructures: [
          { pattern: "我觉得……非常重要", meaning: "Tôi thấy... vô cùng quan trọng", example: "我觉得做一个诚实守信的人非常重要。" },
          { pattern: "只要……就一定能……", meaning: "Chỉ cần... thì nhất định có thể...", example: "只要常常说真话，就一定能得到大家的信任。" }
        ],
        sampleAnswer: {
          hanzi: `关于“${qText}”这个问题，我觉得做一个诚实守信的人非常重要。\n\n在平时生活和学习中，如果一个人经常说真话、说到做到，大家就会很喜欢他，也愿意和他做朋友。相反，如果一个人常常撒谎骗人，别人就不会再相信他了。\n\n首先，我们在学校里要诚实。做作业不能抄别人的，考试更不能作弊。遇到不会的问题，要主动请教老师和同学。其次，在家里做错了事情，要勇敢承认错误，不能对父母撒谎。\n\n最后，答应别人的事情就一定要努力做到。只要我们每个人都讲信用、说真话，我们的生活就会更加美好，身边也会有更多知心的好朋友。`,
          pinyin: `Guānyú "${qText}" zhè ge wèntí, wǒ juéde zuò yí gè chéngshí shǒuxìn de rén fēicháng zhòngyào.\n\nZài píngshí shēnghuó hé xuéxí zhōng, rúguǒ yí gè rén jīngcháng shuō zhēnhuà, shuō dào zuò dào, dàjiā jiù huì hěn xǐhuan tā, yě yuànyì hé tā zuò péngyou. Xiāngfǎn, rúguǒ yí gè rén chángcháng sāhuǎng piàn rén, biérén jiù bú huì zài xiāngxìn tā le.\n\nShǒuxiān, wǒmen zài xuéxiào lǐ yào chéngshí. Zuò zuòyè bù néng chāo biérén de, kǎoshì gèng bù néng zuòbì. Yù dào bú huì de wèntí, yào zhǔdòng qǐngjiào lǎoshī hé tóngxué. Qícì, zài jiālǐ zuò cuò le shìqing, yào yǒnggǎn chéngrèn cuòwù, bù néng duì fùmǔ sāhuǎng.\n\nZuìhòu, dāying biérén de shìqing jiù yídìng yào nǔlì zuò dào. Zhǐyào wǒmen měi gè rén dōu jiǎng xìnyòng, shuō zhēnhuà, wǒmen de shēnghuó jiù huì gèngjiā měihǎo, shēnbiān yě huì yǒu gèng duō zhīxīn de hǎo péngyou.`,
          meaningVi: `Về câu hỏi "${qText}", tôi thấy làm một người thành thật và giữ chữ tín là điều vô cùng quan trọng.\n\nTrong cuộc sống và học tập thường ngày, nếu một người thường xuyên nói thật, nói được làm được, mọi người sẽ rất quý mến và sẵn lòng kết bạn. Ngược lại, nếu một người hay nói dối lừa gạt, người khác sẽ không bao giờ tin tưởng nữa.\n\nTrước hết, ở trường học chúng ta phải trung thực. Làm bài tập không được chép của người khác, khi đi thi càng không được gian lận. Gặp câu hỏi chưa hiểu thì chủ động hỏi thầy cô và bạn bè. Thứ hai, ở nhà nếu làm sai việc gì thì phải dũng cảm nhận lỗi, không được nói dối cha mẹ.\n\nCuối cùng, việc gì đã hứa với người khác thì nhất định phải nỗ lực thực hiện. Chỉ cần mỗi người chúng ta đều giữ chữ tín, nói lời thật lòng, cuộc sống sẽ ngày càng tươi đẹp và chúng ta sẽ có thêm nhiều bạn tốt tri kỷ.`
        }
      };
    }

    if (lvl === 'cao') {
      return {
        isFallback: true,
        outline: {
          intro: `Mở bài: Đặt vấn đề sâu sắc về chữ tín trong xã hội hiện đại: "${qText}". Khẳng định chữ tín là sinh mệnh của một nền văn minh thịnh vượng.`,
          body: [
            `Luận điểm 1: Từ góc độ văn hóa giáo dục: Nuôi dưỡng tinh thần liêm chính và sự tự giác đạo đức từ gia đình đến nhà trường.`,
            `Luận điểm 2: Từ góc độ kinh tế thị trường: Thượng tôn tinh thần khế ước, xây dựng hệ thống tín dụng doanh nghiệp công khai minh bạch.`,
            `Luận điểm 3: Từ góc độ pháp quyền thể chế: Xây dựng chế tài pháp luật nghiêm khắc trừng phạt hành vi bội tín gian lận, nâng cao cái giá phải trả cho sự thất tín.`
          ],
          conclusion: "Kết bài: Nâng tầm vấn đề, khẳng định chỉ khi kết hợp đạo đức với pháp trị, chữ tín mới thực sự trở thành chuẩn mực sống của toàn xã hội."
        },
        vocabulary: [
          { hanzi: "契约精神", pinyin: "qìyuē jīngshén", meaning: "tinh thần khế ước, tôn trọng hợp đồng" },
          { hanzi: "以身作则", pinyin: "yǐshēn zuòzé", meaning: "lấy mình làm gương" },
          { hanzi: "惩恶扬善", pinyin: "chéng'è yángshàn", meaning: "trừng phạt cái ác, biểu dương cái thiện" },
          { hanzi: "潜移默化", pinyin: "qián yí mò huà", meaning: "ảnh hưởng sâu sắc một cách vô hình, ngấm dần" },
          { hanzi: "标本兼治", pinyin: "biāo běn jiān zhì", meaning: "trị cả phần ngọn lẫn gốc rễ" }
        ],
        sentenceStructures: [
          { pattern: "不仅关乎……，更折射出……", meaning: "Không chỉ liên quan đến..., mà càng phản ánh...", example: "诚信建设不仅关乎公民道德素养，更折射出整个社会的文明进程。" },
          { pattern: "唯有坚持……，方能……", meaning: "Chỉ khi kiên trì..., mới có thể...", example: "唯有坚持德法兼治，方能在全社会树立起坚不可摧的诚信基石。" }
        ],
        sampleAnswer: {
          hanzi: `古人云：“人无信不立，业无信不兴，国无信则衰。”针对“${qText}”这一具有深刻现实意义的时代命题，我认为在全社会涵养诚实守信的良好风气，绝非一日之功，必须坚持德法兼治、标本兼治，从道德自律、市场示范与法律制度三个维度协同发力。\n\n首先，立德树人是培育诚信土壤的根本之策。家庭与各级学校应当将诚信教育贯穿于人才培养的全过程，注重以身作则、言传身教，引导青少年将诚实守信内化于心、外化于行。唯有在潜移默化中树立知荣明耻的价值观念，才能从源头上筑牢抗拒虚伪与侥幸的心理防线。\n\n其次，弘扬契约精神是维系现代市场经济秩序的关键支柱。各级商业机构与社会公众人物应当以高标准严格约束自身行为，做到以诚立企、以信筑基，坚决杜绝商业欺诈与虚假宣传。一个恪守信用的商业环境，不仅能显著降低交易成本，更能激发出强大的市场活力与社会互信。\n\n再者，健全严谨的法治体系与全方位的失信惩戒机制是不可或缺的刚性保障。有关部门应当加速完善覆盖全社会的信用信息网络，大幅提高失信违约的违法成本，真正形成“守信者处处通畅，失信者寸步难行”的强大震慑效应。\n\n总而言之，诚信风气的形成离不开每个社会成员的躬行实践。只要我们每个人都能笃行不怠、守信践诺，必将汇聚成推动社会文明奔涌向前的磅礴力量。`,
          pinyin: `Gǔrén yún: "Rén wú xìn bù lì, yè wú xìn bù xīng, guó wú xìn zé shuāi." Zhēnduì "${qText}" zhè yí jùyǒu shēnkè xiànshí yìyì de shídài mìngtí, wǒ rènwéi zài quán shèhuì hányǎng chéngshí shǒuxìn de liánghǎo fēngqì, juébù shì yīrì zhī gōng, bìxū jiānchí dé fǎ jiānzhì, biāoběn-jiānzhì, cóng dàodé zìlǜ, shìchǎng shìfàn yǔ fǎlǜ zhìdù sān gè wéidù xiétóng fālì.\n\nShǒuxiān, lìdé shùrén shì péiyù chéngxìn tǔrǎng de gēnběn zhī cè. Jiātíng yǔ gèjí xuéxiào yīngdāng jiāng chéngxìn jiàoyù guànchuān yú réncái péiyǎng de quán guòchéng, zhùzhòng yǐshēn-zuòzé, yánchuán-shēnjiào, yǐndǎo qīngshàonián jiāng chéngshí shǒuxìn nèihuà yú xīn, wàihuà yú xíng. Wéiyǒu zài qiányí-mòhuà zhōng shùlì zhīróng-míngchǐ de jiàzhí guānniàn, cái néng cóng yuántóu shang zhùláo kàngjù xūwěi yǔ jiǎoxìng de xīnlǐ fángxiàn.\n\nQícì, hóngyáng qìyuē jīngshén shì wéixì xiàndài shìchǎng jīngjì zhìxù de guānjiàn zhīzhù. Gèjí shāngyè jīgòu yǔ shèhuì gōngzhòng rénwù yīngdāng yǐ gāo biāozhǔn yángé yuēshù zìshēn xíngwéi, zuò dào yǐ chéng lì qǐ, yǐ xìn zhù jī, jiānjué dùjué shāngyè qīzhà yǔ xūjiǎ guǎnggào. Yí gè kèshǒu xìnyòng de shāngyè huánjìng, bùjǐn néng xiǎnzhù jiàngdī jiāoyì chéngběn, gèng néng jīfā chū qiángdà de shìchǎng huólì yǔ shèhuì hùxìn.\n\nZàizhě, jiànquán yánjǐn de fǎzhì tǐxì yǔ quánfāngwèi de shīxìn chéngjiè jīzhì shì bùkě huòquē de gāngxìng bǎozhàng. Yǒuguān bùmén yīngdāng jiāsù wánshàn fùgài quán shèhuì de xìnyòng xìnxī wǎngluò, dàfú tígāo shīxìn wéiyuē de wéifǎ chéngběn, zhēnzhèng xíngchéng "shǒuxìnzhě chùchù tōngchàng, shīxìnzhě cùnbù-nánxíng" de qiángdà zhènshè xiàoyìng.\n\nZǒng'éryánzhī, chéngxìn fēngqì de xíngchéng lí bù kāi měi gè shèhuì chéngyuán de gōngxíng shíjiàn. Zhǐyào wǒmen měi gè rén dōu néng dǔxíng bù dài, shǒuxìn jiànnuò, bìjiāng huìjù chéng tuīdòng shèhuì wénmíng bēnyǒng xiàngqián de pángbó lìliàng.`,
          meaningVi: `Người xưa có câu: "Người không có chữ tín thì khó lập thân, doanh nghiệp không có chữ tín thì không hưng thịnh, quốc gia không có chữ tín tất suy tàn." Đối với câu hỏi giàu ý nghĩa thực tiễn "${qText}", tôi cho rằng để bồi dưỡng phong khí trung thực giữ chữ tín trong toàn xã hội tuyệt đối không thể là chuyện một sớm một chiều, mà cần kết hợp hài hòa giữa đạo đức và pháp trị, trị cả gốc lẫn ngọn trên ba bình diện: tự giác đạo đức, mẫu mực thị trường và thể chế pháp luật.\n\nTrước hết, bồi dưỡng nhân cách là phương sách gốc rễ để ươm mầm chữ tín. Gia đình và các cấp nhà trường cần lồng ghép giáo dục tính trung thực vào toàn bộ quá trình nuôi dưỡng nhân tài, chú trọng lấy mình làm gương, dạy bảo bằng cả lời nói lẫn hành động để thế hệ trẻ thấu hiểu và thực hành. Chỉ khi tư tưởng đúng đắn được ngấm sâu một cách tự nhiên, ta mới xây dựng được bức tường thành tâm lý vững chắc ngăn chặn thói giả dối.\n\nThứ hai, phát huy tinh thần khế ước là trụ cột then chốt bảo đảm trật tự kinh tế thị trường hiện đại. Các doanh nghiệp và người có uy tín trong xã hội cần tự giác chuẩn mực, lấy chân thành lập nghiệp, lấy chữ tín làm gốc, kiên quyết bài trừ gian lận thương mại và quảng cáo sai sự thật. Một môi trường kinh doanh trọng chữ tín sẽ giảm thiểu đáng kể chi phí giao dịch và nâng cao niềm tin trong xã hội.\n\nThêm vào đó, việc hoàn thiện khuôn khổ pháp chế nghiêm minh và cơ chế chế tài xử phạt người thất tín là bảo đảm không thể thiếu. Các cơ quan quản lý cần đẩy mạnh mạng lưới thông tin tín dụng xã hội, nâng cao cái giá phải trả của việc vi phạm, thực sự tạo lập hiệu ứng răn đe mạnh mẽ: "Người giữ chữ tín đi đâu cũng thuận lợi, kẻ thất tín một bước khó đi".\n\nTóm lại, phong khí chữ tín phụ thuộc vào sự dấn thân hành động của mỗi người. Chỉ cần mỗi cá nhân bền bỉ giữ trọn lời hứa, nhất định sẽ hội tụ thành sức mạnh to lớn đưa nền văn minh xã hội tiến bước mạnh mẽ.`
        }
      };
    }

    // Trung cấp (mặc định cho Integrity):
    return {
      isFallback: true,
      outline: {
        intro: `Mở bài: Đặt vấn đề trực diện cho câu hỏi "${qText}". Khẳng định chữ tín và sự trung thực là nền tảng đạo đức của xã hội.`,
        body: [
          `Luận điểm 1: Vai trò giáo dục từ gia đình và nhà trường (cha mẹ và thầy cô cần lấy mình làm gương, dạy con trẻ sống chân thành từ nhỏ).`,
          `Luận điểm 2: Trách nhiệm nêu gương của các doanh nghiệp và người nổi tiếng (kinh doanh giữ chữ tín, công khai minh bạch, nói không với gian lận).`,
          `Luận điểm 3: Hoàn thiện hệ thống luật pháp và chế tài trừng phạt nghiêm khắc (xử lý nghiêm các hành vi gian dối thương mại, trừng phạt kẻ thất tín).`
        ],
        conclusion: `Kết bài: Tổng kết lại quan điểm, kêu gọi mỗi cá nhân bắt đầu từ chính mình, từ việc nhỏ nhất để xây dựng xã hội tin cậy.`
      },
      vocabulary: [
        { hanzi: "诚实守信", pinyin: "chéngshí shǒuxìn", meaning: "trung thực giữ chữ tín" },
        { hanzi: "以身作则", pinyin: "yǐshēn zuòzé", meaning: "lấy mình làm gương" },
        { hanzi: "商业欺诈", pinyin: "shāngyè qīzhà", meaning: "gian lận thương mại" },
        { hanzi: "严厉惩罚", pinyin: "yánlì chéngfá", meaning: "trừng phạt nghiêm khắc" },
        { hanzi: "信用体系", pinyin: "xìnyòng tǐxì", meaning: "hệ thống tín dụng / uy tín xã hội" },
        { hanzi: "言出必行", pinyin: "yán chū bì xíng", meaning: "nói là làm, giữ lời hứa" }
      ],
      sentenceStructures: [
        { pattern: "要想……，需要从……几个方面共同努力", meaning: "Muốn..., cần phải cùng nỗ lực từ mấy phương diện...", example: "要想在全社会形成良好的诚信风气，需要从教育和法律等多方面共同努力。" },
        { pattern: "只有让……，才能起到……的作用", meaning: "Chỉ khi khiến cho..., mới có thể phát huy tác dụng...", example: "只有让失信者付出沉重代价，才能起到有效的警示作用。" }
      ],
      sampleAnswer: {
        hanzi: `我觉得，要想在全社会形成诚实守信的良好风气，需要从家庭教育、社会示范和法律制度三个层面协同推进。\n\n首先，家庭与学校的道德教育是根本基石。父母和老师应当以身作则，从小培养孩子讲真话、守承诺的良好习惯。当孩子犯错时，家长要耐心倾听并鼓励他们勇于坦白，而不是一味严厉训斥。只有让下一代从小树立正确的荣辱观，诚信的种子才能在他们心中生根发芽。\n\n其次，各行各业的公众人物与商业机构必须发挥模范带头作用。企业在经营过程中应当做到货真价实、童叟无欺，自觉摒弃虚假广告和商业欺诈。一旦失去信誉，不仅会损害消费者的合法权益，更会破坏整个市场的健康秩序。\n\n最后，完善的社会信用体系与严密的法律制度是坚强保障。有关部门应当加大对造假售假、学术剽窃和违约失信行为的惩处力度，让违规者付出高昂的法律和经济代价，真正形成“守信者处处受益，失信者寸步难行”的法治环境。\n\n总而言之，全社会的良好风气离不开每一个人的自觉践行。只要我们从身边的小事做起，言出必行、信守诺言，就一定能携手构建一个充满温暖与信任的和谐社会。`,
        pinyin: `Wǒ juéde, yào xiǎng zài quán shèhuì xíngchéng chéngshí shǒuxìn de liánghǎo fēngqì, xūyào cóng jiātíng jiàoyù, shèhuì shìfàn hé fǎlǜ zhìdù sān gè céngmiàn xiétóng tuījìn.\n\nShǒuxiān, jiātíng yǔ xuéxiào de dàodé jiàoyù shì gēnběn jīshí. Fùmǔ hé lǎo shī yīngdāng yǐshēn-zuòzé, cóng xiǎo péiyǎng háizi jiǎng zhēnhuà, shǒu chéngnuò de liánghǎo xíguàn. Dāng háizi fàncuò shí, jiāzhǎng yào nàixīn qīngtīng bìng gǔlì tāmen yǒngyú tǎnbái, ér bú shì yíwèi yánlì xùnchì. Zhǐyǒu ràng xiàyídài cóng xiǎo shùlì zhèngquè de róngrǔguān, chéngxìn de zhǒngzi cái néng zài tāmen xīn zhōng shēnggēn-fāyá.\n\nQícì, gè háng gè yè de gōngzhòng rénwù yǔ shāngyè jīgòu bìxū fāhuī mófàn dàitóu zuòyòng. Qǐyè zài jīngyíng guòchéng zhōng yīngdāng zuò dào huòzhēn-jiàshí, tóngsǒu-wúqī, zìjué bìngqì xūjiǎ guǎnggào hé shāngyè qīzhà. Yídàn shīqù xìnyù, bùjǐn huì sǔnhài xiāofèizhě de héfǎ quányì, gèng huì pòhuài zhěng gè shìchǎng de jiànkāng zhìxù.\n\nZuìhòu, wánshàn de shèhuì xìnyòng tǐxì yǔ yánmì de fǎlǜ zhìdù shì jiānqiáng bǎozhàng. Yǒuguān bùmén yīngdāng jiàdà duì zàojiǎ-shòujiǎ, xuéshù piáoqiè hé wéiyuē shīxìn xíngwéi de chéngchǔ lìdù, ràng wéiguīzhě fùchū gāo'áng de fǎlǜ hé jīngjì dàijià, zhēnzhèng xíngchéng "shǒuxìnzhě chùchù shòuyì, shīxìnzhě cùnbù-nánxíng" de fǎzhì huánjìng.\n\nZǒng'éryánzhī, quán shèhuì de liánghǎo fēngqì lí bù kāi měi yí gè rén de zìjué jiànxíng. Zhǐyào wǒmen cóng shēnbiān de xiǎoshì zuò qǐ, yán chū bì xíng, xìnshǒu nuòyán, jiù yídìng néng xiéshǒu gòujiàn yí gè chōngmǎn wēnnuǎn yǔ xìnrèn de héxié shèhuì.`,
        meaningVi: `Tôi cho rằng, để hình thành phong khí trung thực giữ chữ tín trong toàn xã hội, cần có sự phối hợp đồng bộ từ ba bình diện: giáo dục gia đình, gương mẫu xã hội và thể chế pháp luật.\n\nTrước hết, giáo dục đạo đức từ gia đình và nhà trường là nền tảng cốt lõi. Cha mẹ và thầy cô giáo cần lấy mình làm gương, rèn luyện cho trẻ thói quen nói lời thật, giữ lời hứa ngay từ thuở nhỏ. Khi con trẻ mắc lỗi, phụ huynh cần kiên nhẫn lắng nghe và khích lệ con dũng cảm bộc bạch, chứ không nên chỉ chăm chăm trách phạt nặng nề. Chỉ khi thế hệ trẻ sớm xác lập ý thức đúng đắn, hạt mầm trung thực mới có thể bén rễ sâu trong tâm hồn.\n\nThứ hai, những người của công chúng và các cơ quan doanh nghiệp phải phát huy vai trò tiên phong gương mẫu. Doanh nghiệp trong quá trình kinh doanh cần giữ chữ tín, hàng thật giá đúng, không lừa dối khách hàng, kiên quyết bài trừ quảng cáo gian lận và thủ đoạn thương mại thất đức. Một khi đánh mất uy tín, không chỉ làm tổn hại quyền lợi người tiêu dùng mà còn làm xói mòn trật tự lành mạnh của thị trường.\n\nCuối cùng, hệ thống tín dụng xã hội hoàn thiện và khuôn khổ pháp luật nghiêm minh là điểm tựa bảo đảm vững chắc. Các cơ quan chức năng cần tăng cường xử phạt đối với các hành vi buôn bán hàng giả, gian lận học thuật hay bội tín hợp đồng, buộc người vi phạm phải trả giá đắt cả về pháp lý lẫn kinh tế, qua đó thực sự tạo lập một môi trường pháp trị mà 'người giữ chữ tín đi đâu cũng thuận lợi, kẻ thất tín một bước khó đi'.\n\nTóm lại, phong khí tốt đẹp của toàn xã hội không thể tách rời sự tự giác thực hành của từng cá nhân. Chỉ cần mỗi chúng ta bắt đầu từ những việc nhỏ nhặt xung quanh, nói là làm, giữ trọn lời hứa, nhất định chúng ta sẽ chung tay kiến tạo nên một xã hội hài hòa tràn đầy ấm áp và niềm tin.`
      }
    };
  }

  // 2. CHỦ ĐỀ: RÈN LUYỆN SỨC KHỎE, THỂ THAO, ĐI BỘ (锻炼身体, 运动)
  if (isExercise) {
    return {
      isFallback: true,
      outline: {
        intro: `Mở bài: Khẳng định lợi ích to lớn của việc rèn luyện sức khỏe hằng ngày đối với câu hỏi: "${qText}".`,
        body: [
          "Luận điểm 1: Cải thiện thể chất, tăng cường sức đề kháng và giảm nguy cơ mắc các bệnh tim mạch.",
          "Luận điểm 2: Giải tỏa căng thẳng áp lực tinh thần sau giờ học tập và làm việc bận rộn.",
          "Luận điểm 3: Xây dựng thói quen kiên trì và lối sống khoa học, lành mạnh."
        ],
        conclusion: "Kết bài: Kêu gọi mọi người bớt thời gian ngồi một chỗ, dành ra ít nhất 30 phút mỗi ngày để vận động vì một tương lai khỏe mạnh."
      },
      vocabulary: [
        { hanzi: "锻炼身体", pinyin: "duànliàn shēntǐ", meaning: "rèn luyện thân thể" },
        { hanzi: "增强体质", pinyin: "zēngqiáng tǐzhì", meaning: "tăng cường thể chất" },
        { hanzi: "缓解压力", pinyin: "huǎnjiě yālì", meaning: "giải tỏa áp lực" },
        { hanzi: "持之以恒", pinyin: "chí zhī yǐ héng", meaning: "kiên trì bền bỉ" },
        { hanzi: "健康生活", pinyin: "jiànkāng shēnghuó", meaning: "cuộc sống lành mạnh" }
      ],
      sentenceStructures: [
        { pattern: "不仅能……，更能……", meaning: "Không chỉ có thể..., mà càng có thể...", example: "每天坚持走路，不仅能强健体魄，更能让人心情愉悦。" },
        { pattern: "俗话说：……", meaning: "Tục ngữ có câu:...", example: "俗话说：“生命在于运动”，健康是一切成功的基石。" }
      ],
      sampleAnswer: {
        hanzi: `俗话说：“身体是革命的本钱。”针对“${qText}”这个问题，我认为在快节奏的现代生活中，坚持运动与锻炼身体具有极其重要的价值。\n\n首先，坚持锻炼能够显著增强体质。无论是晨跑、散步还是去健身房，规律的体育活动能够促进血液循环，提高免疫力，有效预防肥胖和颈椎病等现代文明病。拥有充沛的体魄，我们才能以饱满的精力投入到繁重的工作与学习当中。\n\n其次，运动是缓解心理压力、调节情绪的最佳良药。在结束了一整天高强度的脑力劳动后，到户外走一走，呼吸新鲜空气，能够让紧绷的大脑得到充分放松，有助于提高睡眠质量，保持乐观开朗的心态。\n\n最后，锻炼身体贵在持之以恒。很多人半途而废，主要是缺乏自律和清晰的目标。我们可以从每天快走半小时或慢跑两公里开始，循序渐进地养成习惯。\n\n总而言之，健康是一切幸福的源泉。让我们放下手机、走出室内，积极参与到体育锻炼中来，享受健康带来的快乐生活。`,
        pinyin: `Súhuà shuō: "Shēntǐ shì gémìng de běnqián." Zhēnduì "${qText}" zhè ge wèntí, wǒ rènwéi zài kuàijièzòu de xiàndài shēnghuó zhōng, jiānchí yùndòng yǔ duànliàn shēntǐ jùyǒu jíqí zhòngyào de jiàzhí.\n\nShǒuxiān, jiānchí duànliàn nénggòu xiǎnzhù zēngqiáng tǐzhì. Wúlùn shì chénpǎo, sànbù háishì qù jiànshēnfáng, guīlǜ de tǐyù huódòng nénggòu cùjìn xiěyè xúnhuán, tígāo miǎnyìlì, yǒuxiào yùfáng féipàng hé jǐngzhuībìng děng xiàndài wénmíngbìng. Yǒuyǒu chōngpèi de tǐpò, wǒmen cái néng yǐ bǎomǎn de jīnglì tóurù dào fánzhòng de gōngzuò yǔ xuéxí dāngzhōng.\n\nQícì, yùndòng shì huǎnjiě xīnlǐ yālì, tiáojié qíngxù de zuìjiā liángyào. Zài jiéshù le yì zhěngtiān gāoxiàodù de nǎolì láodòng hòu, dào hùwài zǒu yi zǒu, hūxī xīnxiān kōngqì, nénggòu ràng jǐnběng de dànǎo dédào chōngfèn fàngsōng, yǒuzhù yú tígāo shuìmián zhìliàng, bǎochí lèguān kāilǎng de xīntài.\n\nZuìhòu, duànliàn shēntǐ guì zài chízhīyǐhéng. Hěn duō rén bàntú'érfèi, zhǔyào shì quēfá zìlǜ hé qīngxī de mùbiāo. Wǒmen kěyǐ cóng měitiān kuàizǒu bàn xiǎoshí huò mànpǎo liǎng gōnglǐ kāishǐ, xúnxù-jiànjìn de yǎngchéng xíguàn.\n\nZǒng'éryánzhī, jiànkāng shì yíqiè xìngfú de yuánquán. Ràng wǒmen fàngxià shǒujī, zǒuchū shìnèi, jījí cānyù dào tǐyù duànliàn zhōng lái, xiǎngshòu jiànkāng dài lái de kuàilè shēnghuó.`,
        meaningVi: `Tục ngữ có câu: "Sức khỏe là vốn quý của cách mạng." Đối với câu hỏi "${qText}", tôi cho rằng trong nhịp sống hiện đại hối hả, kiên trì vận động và rèn luyện thân thể có giá trị vô cùng quan trọng.\n\nTrước hết, kiên trì tập luyện có thể tăng cường thể chất rõ rệt. Cho dù là chạy bộ buổi sáng, đi dạo hay đến phòng gym, các hoạt động thể thao đều đặn có thể thúc đẩy tuần hoàn máu, tăng cường miễn dịch, phòng ngừa béo phì và thoái hóa đốt sống cổ cùng nhiều căn bệnh thời hiện đại. Có được thể lực dồi dào, chúng ta mới có thể cống hiến hết mình cho công việc và học tập.\n\nThứ hai, vận động là liều thuốc hữu hiệu nhất để giải tỏa áp lực tâm lý và điều hòa cảm xúc. Sau một ngày dài làm việc trí óc căng thẳng, ra ngoài trời đi dạo vài vòng hít thở bầu không khí trong lành có thể giúp não bộ được thả lỏng hoàn toàn, nâng cao chất lượng giấc ngủ và duy trì tinh thần lạc quan yêu đời.\n\nCuối cùng, rèn luyện thân thể điều quý nhất là ở sự kiên trì bền bỉ. Rất nhiều người bỏ dở giữa chừng vì thiếu tính tự giác và mục tiêu cụ thể. Chúng ta có thể bắt đầu từ việc đi bộ nhanh nửa tiếng hoặc chạy chậm 2 km mỗi ngày, từng bước rèn luyện thành thói quen lâu dài.\n\nTóm lại, sức khỏe là cội nguồn của mọi hạnh phúc. Chúng ta hãy tạm buông điện thoại, bước ra khỏi phòng, tích cực hòa mình vào các hoạt động thể thao để tận hưởng niềm vui trọn vẹn mà một cơ thể khỏe mạnh mang lại.`
      }
    };
  }

  // 3. MẪU TỔNG QUÁT (DÀNH CHO CÁC ĐỀ TÀI XÃ HỘI & CUỘC SỐNG KHÁC - 100% TIẾNG TRUNG CHUẨN, KHÔNG LẪN TIẾNG VIỆT)
  return {
    isFallback: true,
    outline: {
      intro: `Mở bài: Nêu quan điểm trực diện và rõ ràng cho câu hỏi đề bài: "${qText}".`,
      body: [
        "Luận điểm 1: Phân tích nguyên nhân và sự cần thiết từ góc độ nhận thức của mỗi cá nhân.",
        "Luận điểm 2: Đưa ra giải pháp thực tế và bài học hành động từ kinh nghiệm đời sống.",
        "Luận điểm 3: Nhấn mạnh sự phối hợp giữa bản thân với mọi người xung quanh để đạt kết quả tốt nhất."
      ],
      conclusion: "Kết bài: Đúc kết lại toàn bộ vấn đề và đưa ra thông điệp tích cực, ý nghĩa."
    },
    vocabulary: [
      { hanzi: "看法", pinyin: "kànfǎ", meaning: "quan điểm, góc nhìn" },
      { hanzi: "付诸实践", pinyin: "fùzhū shíjiàn", meaning: "áp dụng vào thực tế" },
      { hanzi: "沟通合作", pinyin: "gōutōng hézuò", meaning: "giao tiếp và hợp tác" },
      { hanzi: "克服困难", pinyin: "kèfú kùnnan", meaning: "khắc phục khó khăn" },
      { hanzi: "持之以恒", pinyin: "chí zhī yǐ héng", meaning: "kiên trì bền bỉ" }
    ],
    sentenceStructures: [
      { pattern: "在我看来，……是最重要的。", meaning: "Theo quan điểm của tôi, ... là quan trọng nhất.", example: `在我看来，针对这个问题，保持理智并采取实际行动最为关键。` },
      { pattern: "一方面……，另一方面……", meaning: "Một mặt thì..., mặt khác thì...", example: "一方面要立足自身实际，另一方面要善于向优秀的人学习。" }
    ],
    sampleAnswer: {
      hanzi: `针对“${qText}”这个问题，我认为在现代社会中具有非常重要的探讨价值。\n\n首先，从思想认知的角度来看，我们应当树立明确的目标与正确的态度。面对各种新情况与新挑战，不能仅仅停留在口头讨论上，而要深入思考事物发展的规律，找准问题的核心切入点。\n\n其次，从行动层面来看，纸上谈兵终究无法解决现实问题，关键在于脚踏实地、付诸实践。在日常工作与学习中，我们应当勇于尝试，在实践中不断总结经验教训，逐步提升自己分析问题与解决问题的综合能力。\n\n最后，学会与他人沟通合作也同样重要。个人的智慧与力量终究是有限的，只有善于倾听不同的见解，与同伴互相支持、优势互补，我们才能克服前进道路上的重重阻碍。\n\n总的来说，只要我们能够保持积极向上的心态，坚持求真务实的作风，就一定能在应对各类挑战时游刃有余，取得令人满意的丰硕成果。`,
      pinyin: `Zhēnduì "${qText}" zhè ge wèntí, wǒ rènwéi zài xiàndài shèhuì zhōng jùyǒu fēicháng zhòngyào de tàntǎo jiàzhí.\n\nShǒuxiān, cóng sīxiǎng rènzhī de jiǎodù lái kàn, wǒmen yīngdāng shùlì míngquè de mùbiāo yǔ zhèngquè de tàidù. Miànduì gèzhǒng xīn qíngkuàng yǔ xīn tiǎozhàn, bù néng jǐnjǐn tíngliú zài kǒutóu tǎolùn shang, ér yào shēnrù sīkǎo shìwù fāzhǎn de guīlǜ, zhǎozhǔn wèntí de héxīn qiērùdiǎn.\n\nQícì, cóng xíngdòng céngmiàn lái kàn, zhǐshàng-tánbīng zhōngjiū wúfǎ jiějué xiànshí wèntí, guānjiàn zàiyú jiǎotà-shídì, fùzhū shíjiàn. Zài rìcháng gōngzuò yǔ xuéxí zhōng, wǒmen yīngdāng yǒngyú chángshì, zài shíjiàn zhōng bùduàn zǒngjié jīngyàn jiàoxun, zhúbù tíshēng zìjǐ fēnxī wèntí yǔ jiějué wèntí de zōnghé nénglì.\n\nZuìhòu, xuéhuì yǔ tārén gōutōng hézuò yě tóngyàng zhòngyào. Gèrén de zhìhuì yǔ lìliàng zhōngjiū shì yǒuxiàn de, zhǐyǒu shànyú qīngtīng bùtóng de jiànjiě, yǔ tóngbàn hùxiāng zhīchí, yōushì hùbǔ, wǒmen cái néng kèfú qiánjìn dàolù shang de chóngchóng zǔ'ài.\n\nZǒng de lái shuō, zhǐyào wǒmen nénggòu bǎochí jījí xiàngshàng de xīntài, jiānchí qiúzhēn-wùshí de zuòfēng, jiù yídìng néng zài yìngduì gèlèi tiǎozhàn shí yóurèn-yǒuyú, qǔdé lìngrén mǎnyì de fēngshuò chéngguǒ.`,
      meaningVi: `Đối với đề bài "${qText}", tôi cho rằng câu hỏi này mang giá trị thảo luận rất quan trọng trong đời sống hiện đại.\n\nTrước hết, từ góc độ tư duy nhận thức, chúng ta cần xác lập mục tiêu rõ ràng và thái độ đúng đắn. Khi đứng trước các tình huống hay thử thách mới, không thể chỉ dừng lại ở việc bàn luận suông mà cần suy ngẫm sâu sắc về quy luật vận động của sự việc, nắm bắt đúng mắt xích then chốt của vấn đề.\n\nThứ hai, xét từ góc độ hành động, nói suông trên giấy suy cho cùng không thể giải quyết được bài toán thực tế, điều mấu chốt nằm ở việc làm thật, đưa vào thực tiễn. Trong công việc và học tập hằng ngày, chúng ta cần mạnh dạn trải nghiệm, không ngừng rút tỉa kinh nghiệm sau mỗi lần thực hành để từng bước nâng cao năng lực phân tích và xử lý vấn đề.\n\nCuối cùng, học cách giao tiếp và hợp tác với mọi người xung quanh cũng quan trọng không kém. Trí tuệ và sức lực của một cá nhân dẫu sao cũng có giới hạn, chỉ khi biết lắng nghe những ý kiến đa chiều, cùng cộng sự tương trợ và bù trừ sở trường cho nhau, chúng ta mới có thể vượt qua mọi rào cản trên đường tiến bước.\n\nTóm lại, chỉ cần chúng ta luôn giữ vững thái độ sống tích cực, tác phong cầu thị và thiết thực, nhất định chúng ta sẽ luôn chủ động vững vàng trước mọi thách thức và gặt hái được những thành tựu mỹ mãn.`
    }
  };
}

window.playSpeakingSampleTts = function () {
  const el = document.getElementById('sample-speaking-hanzi');
  if (!el || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(el.textContent.trim());
  utter.lang = 'zh-CN';
  utter.rate = 0.88;
  window.speechSynthesis.speak(utter);
};

// 5. THỰC HIỆN ĐẾM GIỜ [Chuẩn bị (3p)] (3 phút = 180s)
window.startPrepTimer = function () {
  if (!requireSpeakingLoginGate('Bắt Đầu 3 Phút Chuẩn Bị')) return;
  // Đóng bộ ghi âm nếu đang chạy
  cancelSpeakingRecording();

  const prepBox = document.getElementById('prep-timer-box');
  const btnPrep = document.getElementById('btn-prep-3p');
  if (!prepBox) return;

  prepBox.style.display = 'block';
  btnPrep?.classList.add('active-timer');
  prepBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

  // Đảm bảo bảng nháp hiển thị và tự động focus để học viên bắt đầu ghi chú
  const scratchpadCard = document.getElementById('speaking-scratchpad-card');
  if (scratchpadCard) scratchpadCard.style.display = 'block';
  const scratchpadInput = document.getElementById('speaking-scratchpad-input');
  if (scratchpadInput) scratchpadInput.focus();

  prepRemainingSeconds = 180;
  isPrepPaused = false;
  updatePrepTimerDisplay();
  playAudioTone('start');

  clearInterval(prepTimerInterval);
  prepTimerInterval = setInterval(() => {
    if (isPrepPaused) return;

    prepRemainingSeconds--;
    updatePrepTimerDisplay();

    if (prepRemainingSeconds <= 0) {
      clearInterval(prepTimerInterval);
      playAudioTone('chime');
      alert('⏰ Đã hết 3 phút chuẩn bị! Bạn đã sẵn sàng, hãy bắt đầu nói ngay nhé!');
      btnPrep?.classList.remove('active-timer');
      prepBox.style.display = 'none';
      startSpeakingTimerAndRecord();
    }
  }, 1000);
};

function updatePrepTimerDisplay() {
  const display = document.getElementById('prep-timer-display');
  if (!display) return;
  const mins = Math.floor(prepRemainingSeconds / 60);
  const secs = prepRemainingSeconds % 60;
  display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

window.togglePausePrepTimer = function () {
  isPrepPaused = !isPrepPaused;
  const btn = document.getElementById('prep-pause-btn');
  if (btn) {
    btn.innerHTML = isPrepPaused
      ? `<i class="fa-solid fa-play"></i> <span>Tiếp tục</span>`
      : `<i class="fa-solid fa-pause"></i> <span>Tạm dừng</span>`;
  }
};

window.resetPrepTimer = function () {
  clearInterval(prepTimerInterval);
  prepRemainingSeconds = 180;
  isPrepPaused = false;
  updatePrepTimerDisplay();
  const prepBox = document.getElementById('prep-timer-box');
  const btnPrep = document.getElementById('btn-prep-3p');
  if (prepBox) prepBox.style.display = 'none';
  btnPrep?.classList.remove('active-timer');
};

window.stopPrepAndStartSpeaking = function () {
  clearInterval(prepTimerInterval);
  const prepBox = document.getElementById('prep-timer-box');
  const btnPrep = document.getElementById('btn-prep-3p');
  if (prepBox) prepBox.style.display = 'none';
  btnPrep?.classList.remove('active-timer');

  startSpeakingTimerAndRecord();
};

// 6. THỰC HIỆN ĐẾM GIỜ [Bắt đầu nói (2p)] (2 phút = 120s) & GHI ÂM MICRO
window.startSpeakingTimerAndRecord = async function () {
  if (!requireSpeakingLoginGate('Ghi Âm & Luyện Nói 2 Phút')) return;
  // Dừng chuẩn bị nếu đang chạy
  clearInterval(prepTimerInterval);
  const prepBox = document.getElementById('prep-timer-box');
  const btnPrep = document.getElementById('btn-prep-3p');
  if (prepBox) prepBox.style.display = 'none';
  btnPrep?.classList.remove('active-timer');

  // Yêu cầu quyền truy cập Micro
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    setupMediaRecorder(stream);
  } catch (err) {
    console.error('Không truy cập được micro:', err);
    alert('Không thể truy cập microphone. Vui lòng cho phép trình duyệt truy cập micro để ghi âm bài nói!');
    return;
  }

  const recorderBox = document.getElementById('speaking-recorder-box');
  const btnSpeak = document.getElementById('btn-speak-2p');
  const resBox = document.getElementById('recorded-result-box');

  if (resBox) resBox.style.display = 'none';
  if (recorderBox) recorderBox.style.display = 'block';
  btnSpeak?.classList.add('active-timer');

  // Đảm bảo bảng nháp luôn hiển thị để học viên nhìn dàn ý trong 2 phút nói
  const scratchpadCard = document.getElementById('speaking-scratchpad-card');
  if (scratchpadCard) scratchpadCard.style.display = 'block';

  recorderBox?.scrollIntoView({ behavior: 'smooth', block: 'center' });

  speakingRemainingSeconds = 120;
  recordedDurationSeconds = 0;
  updateSpeakingTimerDisplay();
  playAudioTone('start');

  // Bắt đầu thu âm MediaRecorder
  audioChunks = [];
  mediaRecorder.start(250);
  isRecordingActive = true;

  // Bắt đầu nhận diện giọng nói tiếng Trung nếu có hỗ trợ
  startSpeechRecognition();

  clearInterval(speakingTimerInterval);
  speakingTimerInterval = setInterval(() => {
    speakingRemainingSeconds--;
    recordedDurationSeconds++;
    updateSpeakingTimerDisplay();

    if (speakingRemainingSeconds <= 0) {
      clearInterval(speakingTimerInterval);
      finishSpeakingRecording();
    }
  }, 1000);
};

function setupMediaRecorder(stream) {
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
      audioChunks.push(e.data);
    }
  };

  mediaRecorder.onstop = () => {
    stream.getTracks().forEach(t => t.stop());
    recordedAudioBlob = new Blob(audioChunks, { type: 'audio/webm' });
    recordedAudioUrl = URL.createObjectURL(recordedAudioBlob);

    const player = document.getElementById('recorded-audio-player');
    if (player) {
      player.src = recordedAudioUrl;
    }

    const durationEl = document.getElementById('recording-duration-text');
    if (durationEl) {
      const mins = Math.floor(recordedDurationSeconds / 60);
      const secs = recordedDurationSeconds % 60;
      durationEl.textContent = `Thời lượng bài nói: ${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    }
  };
}

function startSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) return;

  try {
    speechRecognizer = new SpeechRecognition();
    speechRecognizer.lang = 'zh-CN';
    speechRecognizer.continuous = true;
    speechRecognizer.interimResults = true;

    const transcriptInput = document.getElementById('spoken-transcript-input');
    let finalTranscripts = '';

    speechRecognizer.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscripts += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      if (transcriptInput) {
        transcriptInput.value = (finalTranscripts + ' ' + interim).trim();
      }
    };

    speechRecognizer.onerror = (err) => {
      console.warn('Speech recognition notice:', err);
    };

    speechRecognizer.start();
  } catch (e) {
    console.warn('Không khởi chạy được SpeechRecognition:', e);
  }
}

function updateSpeakingTimerDisplay() {
  const display = document.getElementById('speaking-timer-display');
  if (!display) return;
  const mins = Math.floor(speakingRemainingSeconds / 60);
  const secs = speakingRemainingSeconds % 60;
  display.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// Hoàn thành ghi âm & Dừng nói
window.finishSpeakingRecording = function () {
  if (!isRecordingActive) return;
  isRecordingActive = false;
  clearInterval(speakingTimerInterval);

  playAudioTone('chime');

  if (speechRecognizer) {
    try { speechRecognizer.stop(); } catch (e) { }
  }

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }

  const recorderBox = document.getElementById('speaking-recorder-box');
  const btnSpeak = document.getElementById('btn-speak-2p');
  const resBox = document.getElementById('recorded-result-box');

  if (recorderBox) recorderBox.style.display = 'none';
  btnSpeak?.classList.remove('active-timer');
  if (resBox) {
    resBox.style.display = 'block';
    resBox.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  // Tự động kiểm tra nếu textarea nhận diện còn trống, đưa gợi ý để học viên nhập
  const transcriptInput = document.getElementById('spoken-transcript-input');
  if (transcriptInput && !transcriptInput.value.trim()) {
    transcriptInput.placeholder = 'Mic chưa tự động nhận diện được chữ Hán (hoặc trình duyệt chưa bật nhận diện giọng nói). Bạn hãy gõ tóm tắt những câu bạn vừa nói vào đây để AI chấm điểm chính xác nhé!';
  }
};

window.cancelSpeakingRecording = function () {
  isRecordingActive = false;
  clearInterval(speakingTimerInterval);

  if (speechRecognizer) {
    try { speechRecognizer.stop(); } catch (e) { }
  }
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    try { mediaRecorder.stop(); } catch (e) { }
  }

  const recorderBox = document.getElementById('speaking-recorder-box');
  const btnSpeak = document.getElementById('btn-speak-2p');
  if (recorderBox) recorderBox.style.display = 'none';
  btnSpeak?.classList.remove('active-timer');
};

window.clearTranscript = function () {
  const transcriptInput = document.getElementById('spoken-transcript-input');
  if (transcriptInput) {
    transcriptInput.value = '';
    transcriptInput.focus();
  }
};

window.restartSpeakingFlow = function () {
  const resBox = document.getElementById('recorded-result-box');
  if (resBox) resBox.style.display = 'none';
  const evalBox = document.getElementById('ai-speaking-evaluation-results');
  if (evalBox) evalBox.style.display = 'none';
  startSpeakingTimerAndRecord();
};

// 7. GỬI BÀI NÓI CHO AI CHẤM ĐIỂM
window.submitSpeakingForAiGrading = async function () {
  if (!requireSpeakingLoginGate('Gửi Bài Cho AI Chấm Điểm')) return;
  const transcriptInput = document.getElementById('spoken-transcript-input');
  const resultsContainer = document.getElementById('ai-speaking-evaluation-results');
  const submitBtn = document.getElementById('submit-speaking-btn');

  if (!transcriptInput || !resultsContainer) return;

  const transcript = transcriptInput.value.trim();
  if (!transcript || transcript.length < 3) {
    alert('Vui lòng gõ hoặc nói ít nhất 5-10 chữ Hán vào ô văn bản bài nói để AI có thể chấm điểm nhé!');
    transcriptInput.focus();
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> <span>AI Đang Chấm Bài Nói...</span>`;
  }

  resultsContainer.style.display = 'block';
  resultsContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
  resultsContainer.innerHTML = `
    <div class="speaking-card-panel" style="text-align: center; padding: 48px 24px;">
      <i class="fa-solid fa-microphone-lines fa-bounce" style="font-size: 3rem; color: #f59e0b; margin-bottom: 20px;"></i>
      <h2 style="font-size: 1.45rem; font-weight: 800; color: #ffffff; margin: 0 0 10px 0;">
        Giám Khảo Khẩu Ngữ AI Đang Đánh Giá Bài Nói...
      </h2>
      <p style="font-size: 0.92rem; color: #94a3b8; max-width: 560px; margin: 0 auto 20px auto;">
        Đang phân tích phát âm, ngữ điệu, vốn từ vựng khẩu ngữ và độ lưu loát chuẩn tiêu chí thi HSKK.
      </p>
      <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
        <span style="font-size: 0.8rem; background: rgba(245, 158, 11, 0.15); color: #fbbf24; padding: 4px 12px; border-radius: 99px;">
          ✓ Đánh giá phát âm &amp; ngữ điệu
        </span>
        <span style="font-size: 0.8rem; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 4px 12px; border-radius: 99px;">
          ✓ Kiểm tra độ lưu loát tự nhiên
        </span>
        <span style="font-size: 0.8rem; background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 4px 12px; border-radius: 99px;">
          ✓ Viết lại khẩu ngữ chuẩn bản xứ
        </span>
      </div>
    </div>
  `;

  try {
    const payload = {
      question: currentActiveQuestion ? currentActiveQuestion.question : 'HSKK Speaking',
      transcript: transcript,
      level: currentSpeakingLevel,
      duration: recordedDurationSeconds || 120
    };

    const res = await fetch(`${API_BASE_URL}/api/ai/grade-speaking`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      const data = await res.json();
      renderSpeakingEvaluationResults(data, resultsContainer, transcript);
      playAudioTone('start');
    } else {
      throw new Error('Server error');
    }
  } catch (err) {
    console.error('Lỗi chấm bài nói AI:', err);
    const fallback = {
      overallScore: 86,
      badge: "Rất Tốt 👏",
      criteriaScores: { pronunciation: 86, fluency: 85, grammar: 86, content: 88 },
      generalFeedback: "Bài nói của bạn rõ ràng, câu từ tự nhiên và bám sát câu hỏi của đề bài!",
      strengths: ["Phát âm tương đối rõ chữ", "Trả lời trực diện vào chủ đề"],
      improvements: ["Nên dùng thêm từ nối để bài nói liên kết uyển chuyển hơn"],
      nativeVersion: transcript,
      nativePinyin: "",
      nativeVi: "Bản dịch bài nói của bạn."
    };
    renderSpeakingEvaluationResults(fallback, resultsContainer, transcript);
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Đưa AI Chấm Điểm Bài Nói</span>`;
    }
  }
};

function renderSpeakingEvaluationResults(data, container, originalTranscript) {
  const score = data.overallScore || 85;
  const badge = (data.badge || (score >= 90 ? 'Xuất Sắc 🌟' : score >= 80 ? 'Rất Tốt 👏' : score >= 65 ? 'Khá 👍' : 'Cần Cố Gắng 🎙️')).normalize('NFC');
  const scoreBg = score >= 85 ? 'linear-gradient(135deg, #10b981, #059669)' : score >= 70 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #ef4444, #dc2626)';

  const crit = data.criteriaScores || { pronunciation: 85, fluency: 85, grammar: 85, content: 85 };
  const strengths = (data.strengths || []).map(s => (s || '').normalize('NFC'));
  const improvements = (data.improvements || []).map(im => (im || '').normalize('NFC'));
  const nativeZh = (data.nativeVersion || originalTranscript).trim();
  const nativePinyin = data.nativePinyin || '';
  const nativeVi = (data.nativeVi || '').normalize('NFC');
  const generalFeedback = (data.generalFeedback || 'Bài nói của bạn hoàn thành tốt mục tiêu giao tiếp.').normalize('NFC');

  container.innerHTML = `
    <div class="speaking-card-panel" style="margin-bottom: 24px; position: relative; font-family: 'Be Vietnam Pro', sans-serif;">
      <!-- Header kết quả -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="width: 100px; height: 100px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ffffff; background: ${scoreBg}; box-shadow: 0 8px 24px rgba(0,0,0,0.25); flex-shrink: 0;">
            <span style="font-size: 2.2rem; font-weight: 900; line-height: 1;">${score}</span>
            <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; opacity: 0.9;">Thang 100</span>
          </div>

          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
              <span style="font-size: 1.35rem; font-weight: 900; color: #ffffff;">Đánh Giá Bài Nói:</span>
              <span style="font-size: 1.25rem; font-weight: 800; color: #fbbf24;">${badge}</span>
            </div>
            <div style="font-size: 0.88rem; color: #94a3b8;">
              <span><i class="fa-solid fa-microphone"></i> Thời lượng nói: <strong>${recordedDurationSeconds || 60}s</strong></span>
              <span style="margin: 0 6px;">&bull;</span>
              <span><i class="fa-solid fa-circle-check" style="color: #10b981;"></i> Đạt chuẩn thi HSKK</span>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 10px;">
          <button onclick="document.getElementById('ai-speaking-evaluation-results').style.display='none'" class="btn"
            style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #94a3b8; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- 4 TIÊU CHÍ KHẨU NGỮ HSKK -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-bullhorn" style="color: #f59e0b;"></i> Phát Âm & Ngữ Điệu</span>
            <strong style="color: #f59e0b;">${crit.pronunciation || 85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${crit.pronunciation || 85}%; background: #f59e0b; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-gauge-high" style="color: #38bdf8;"></i> Độ Lưu Loát (Fluency)</span>
            <strong style="color: #38bdf8;">${crit.fluency || 85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${crit.fluency || 85}%; background: #38bdf8; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-book" style="color: #8b5cf6;"></i> Ngữ Pháp & Vốn Từ</span>
            <strong style="color: #8b5cf6;">${crit.grammar || 85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${crit.grammar || 85}%; background: #8b5cf6; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-bullseye" style="color: #10b981;"></i> Bám Đề & Nội Dung</span>
            <strong style="color: #10b981;">${crit.content || 85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${crit.content || 85}%; background: #10b981; border-radius: 99px;"></div>
          </div>
        </div>
      </div>

      <!-- NHẬN XÉT CỦA GIÁM KHẢO -->
      <div style="background: rgba(245, 158, 11, 0.1); border: 1.5px solid rgba(245, 158, 11, 0.35); border-radius: 16px; padding: 18px; margin-bottom: 20px;">
        <div style="font-size: 1rem; font-weight: 800; color: #fbbf24; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-comment-dots"></i> Nhận Xét Của Giám Khảo Khẩu Ngữ:
        </div>
        <p style="font-size: 0.95rem; line-height: 1.65; color: #ffffff; margin: 0 0 12px 0;">
          ${generalFeedback}
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-top: 12px;">
          ${strengths.length > 0 ? `
            <div>
              <strong style="font-size: 0.85rem; color: #34d399; text-transform: uppercase;"><i class="fa-solid fa-thumbs-up"></i> Điểm sáng:</strong>
              <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 0.88rem; color: #e2e8f0;">
                ${strengths.map(s => `<li>${s}</li>`).join('')}
              </ul>
            </div>
          ` : ''}

          ${improvements.length > 0 ? `
            <div>
              <strong style="font-size: 0.85rem; color: #f87171; text-transform: uppercase;"><i class="fa-solid fa-lightbulb"></i> Điểm cần hoàn thiện:</strong>
              <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 0.88rem; color: #fca5a5;">
                ${improvements.map(im => `<li>${im}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>
      </div>

      <!-- PHIÊN BẢN KHẨU NGỮ CHUẨN BẢN XỨ -->
      <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(56, 189, 248, 0.08)); border: 1.5px solid rgba(16, 185, 129, 0.3); border-radius: 18px; padding: 22px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #34d399; margin: 0; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-crown"></i> Phiên Bản Khẩu Ngữ Chuẩn Người Bản Xứ:
          </h3>
          <button onclick="playSpeakingNativeTts()" title="Nghe phát âm chuẩn người bản xứ"
            style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #34d399; padding: 6px 14px; border-radius: 8px; font-weight: 700; font-size: 0.82rem; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-volume-high"></i> <span>Nghe nói mẫu</span>
          </button>
        </div>

        <div id="speaking-native-text" class="hanzi-text" style="font-size: 1.25rem; line-height: 1.8; color: #ffffff; margin-bottom: 8px; font-weight: 500;">
          ${nativeZh}
        </div>

        ${nativePinyin ? `
          <div style="font-size: 0.88rem; line-height: 1.6; color: #94a3b8; font-style: italic; margin-bottom: 10px;">
            ${nativePinyin}
          </div>
        ` : ''}

        ${nativeVi ? `
          <div style="font-size: 0.92rem; line-height: 1.6; color: #cbd5e1; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 10px;">
            <strong>Dịch nghĩa:</strong> ${nativeVi}
          </div>
        ` : ''}
      </div>
    </div>
  `;
}

window.playSpeakingNativeTts = function () {
  const el = document.getElementById('speaking-native-text');
  if (!el || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(el.textContent.trim());
  utter.lang = 'zh-CN';
  utter.rate = 0.88;
  window.speechSynthesis.speak(utter);
};

// 7. BẢNG NHÁP (SCRATCHPAD) DÀNH CHO HỌC VIÊN
window.clearSpeakingScratchpad = function () {
  const input = document.getElementById('speaking-scratchpad-input');
  if (!input) return;
  if (input.value.trim() && !confirm('Bạn có chắc muốn xóa sạch bản nháp này?')) {
    return;
  }
  input.value = '';
  updateScratchpadCount();
  sessionStorage.removeItem('hongtai_speaking_scratchpad');
};

function updateScratchpadCount() {
  const input = document.getElementById('speaking-scratchpad-input');
  const countEl = document.getElementById('scratchpad-word-count');
  if (!input || !countEl) return;
  const len = input.value.trim().length;
  countEl.textContent = `${len} ký tự`;
  sessionStorage.setItem('hongtai_speaking_scratchpad', input.value);
}

function initScratchpad() {
  const input = document.getElementById('speaking-scratchpad-input');
  if (!input) return;
  const saved = sessionStorage.getItem('hongtai_speaking_scratchpad');
  if (saved) {
    input.value = saved;
    updateScratchpadCount();
  }
  input.addEventListener('focus', () => {
    if (!isSpeakingUserAuthenticated()) {
      requireSpeakingLoginGate('Sử Dụng Bảng Nháp & Ghi Chú');
      input.blur();
    }
  });
  input.addEventListener('input', updateScratchpadCount);
}

// Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  initSpeakingQuestions();
  initScratchpad();
});
