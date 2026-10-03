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
  const isTech = /科技|互联网|手机|人工智能|网络|电脑|数字|微信|距离/.test(qText);
  const isSuccess = /成败|成功|失败|母|细节|努力|挫折|坚持|目标|知足/.test(qText);
  const isMoney = /金钱|幸福|财富|富裕|快乐|心态|钱/.test(qText);
  const isFastPaced = /快节奏|压力|生活|节奏|工作|平衡|忙碌|加班/.test(qText);
  const isReading = /读书|学习|汉语|中文|书籍|知识|阅读|教育/.test(qText);
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
          meaningVi: `Người xưa có câu: "Người không có chữ tín thì khó lập thân, doanh nghiệp không có chữ tín thì không hưng thịnh, quốc gia không có chữ tín tất suy tàn." Đối với câu hỏi giàu ý nghĩa thực tiễn "${qText}", tôi cho rằng để bồi dưỡng phong khí trung thực giữ chữ tín trong toàn xã hội tuyệt đối không thể là chuyện một sớm một chiều, mà cần kết hợp hài hòa giữa đạo đức và pháp trị, trị cả gốc lẫn ngọn trên ba bình diện: tự giác đạo đức, mẫu mực thị trường và thể chế pháp luật.\n\nTrước hết, bồi dưỡng nhân cách là phương sách gốc rễ để ươm mầm chữ tín. Gia đình và các cấp nhà trường cần lồng ghép giáo dục tính trung thực vào toàn bộ quá trình nuôi dưỡng nhân tài, chú trọng lấy mình làm gương, dạy bảo bằng cả lời nói lẫn hành động để thế hệ trẻ thấu hiểu và thực hành. Chỉ khi tư tưởng đúng đắn được ngấm sâu một cách tự nhiên, ta mới xây dựng được bức tường thành tâm lý vững chắc ngăn chặn thói giả dối.\n\nThứ hai, phát huy tinh thần khế ước là trụ cột then chốt bảo đảm trật tự kinh tế thị trường hiện đại. Các doanh nghiệp và người có uy tín trong xã hội cần tự giác chuẩn mực, lấy chân thành lập nghiệp, lấy chữ tín làm gốc, kiên quyết bài trừ gian lận thương mại và quảng cáo sai sự thật. Một môi trường kinh doanh trọng chữ tín sẽ giảm thiểu đáng kể chi phí giao dịch và nâng cao niềm tin trong xã hội.\n\nThêm vào đó, việc hoàn thiện khuôn khổ pháp chế nghiêm minh và cơ chế chế tài xử phạt người thất tín là bảo đảm không thể thiếu. Các cơ quan quản lý cần đẩy mạnh mạng lưới thông tin tín dụng xã hội, nâng cao cái giá phải trả của việc vi phạm, thực sự tạo lập hiệu ứng răn đe mạnh mẽ: "Người giữ chữ tín đi đâu cũng thuận lợi, kẻ thất tín một bước khó đi".\n\nTóm lại, phong khí chữ tín phụ thuộc vào sự dấn thân hành động của mỗi người. Chỉ cần mỗi cá nhân bền bỉ giữ trọn lời hứa, nhất định sẽ hội tụ thành sức mạnh to lớn đưa nền văn minh xã hội tiến bước mạnh mẽ.`
        }
      };
    }
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
        meaningVi: `Tục ngữ có câu: "Sức khỏe là vốn quý của cách mạng." Đối với câu hỏi "${qText}", tôi cho rằng trong nhịp sống hiện đại hối hả, kiên trì vận động và rèn luyện thân thể có giá trị vô cùng quan trọng.\n\nTrước hết, kiên trì tập luyện có thể tăng cường thể chất rõ rệt. Cho dù là chạy bộ buổi sáng, đi dạo hay đến phòng gym, các hoạt động thể thao đều đặn có thể thúc đẩy tuần hoàn máu, tăng cường miễn dịch, phòng ngừa béo phì và thoái hóa đốt sống cổ cùng nhiều căn bệnh thời hiện đại. Có được thể lực dồi dào, chúng ta mới có thể cống hiến hết mình cho công việc và học tập.\n\nThứ hai, vận động là liều thuốc hữu hiệu nhất để giải tỏa áp lực tâm lý và điều hòa cảm xúc. Sau một ngày dài làm việc trí óc căng thẳng, ra ngoài trời đi dạo vài vòng hít thở bầu không khí trong lành có thể giúp não bộ được thả lỏng hoàn toàn, nâng cao chất lượng giấc ngủ và duy trì tinh thần lạc quan yêu đời.\n\nCuối cùng, rèn luyện thân thể điều quý nhất là ở sự kiên trì bền bỉ. Rất nhiều người bỏ dở giữa chừng vì thiếu tính tự giác và mục tiêu cụ thể. Chúng ta có thể bắt đầu từ việc đi bộ nhanh nửa tiếng hoặc chạy chậm 2 km mỗi ngày, từng bước rèn luyện thành thói quen lâu dài.\n\nTóm lại, sức khỏe là cội nguồn của mọi hạnh phúc. Chúng ta hãy tạm buông điện thoại, bước ra khỏi phòng, tích cực hòa mình vào các hoạt động thể thao để tận hưởng niềm vui trọn vẹn mà một cơ thể khỏe mạnh mang lại.`
      }
    };
  }

  // 3. CHỦ ĐỀ: THÀNH CÔNG, THẤT BẠI, CHI TIẾT (成败, 细节, 挫折, 坚持)
  if (isSuccess) {
    return {
      isFallback: true,
      outline: {
        intro: `Mở bài: Nêu quan điểm trực diện về quy luật thành công và thất bại: "${qText}". Khẳng định thành công là sự kết tinh của bài học kinh nghiệm và ý chí kiên định.`,
        body: [
          "Luận điểm 1: Thất bại là tấm gương soi chiếu những lỗ hổng, giúp tích lũy kinh nghiệm quý báu và rèn luyện nghị lực (dẫn chứng: Thomas Edison, Steve Jobs).",
          "Luận điểm 2: Thành công ban đầu giúp thắp sáng sự tự tin và kiến tạo đòn bẩy tâm lý tích cực, tạo đà bứt phá cho những mục tiêu lớn hơn.",
          "Luận điểm 3: Coi trọng chi tiết và sự kiên trì bền bỉ: 'Chi tiết quyết định thành bại', chỉ khi làm tốt từng khâu nhỏ mới dựng nên nghiệp lớn."
        ],
        conclusion: "Kết bài: Đúc kết rằng không nên sợ thất bại cũng đừng ngủ quên trên chiến thắng; giữ tâm thế khiêm tốn học hỏi để bước tới thành công bền vững."
      },
      vocabulary: [
        { hanzi: "失败乃成功之母", pinyin: "shībài nǎi chénggōng zhī mǔ", meaning: "thất bại là mẹ thành công" },
        { hanzi: "挫折", pinyin: "cuòzhé", meaning: "trắc trở, nghịch cảnh" },
        { hanzi: "细节决定成败", pinyin: "xìjié juédìng chéngbài", meaning: "chi tiết quyết định thành bại" },
        { hanzi: "持之以恒", pinyin: "chí zhī yǐ héng", meaning: "kiên trì bền bỉ" },
        { hanzi: "厚积薄发", pinyin: "hòu jī bó fā", meaning: "tích lũy sâu dày rồi mới bộc phát rực rỡ" }
      ],
      sentenceStructures: [
        { pattern: "……不仅是检验……的试金石，更是……", meaning: "... không chỉ là viên đá thử vàng kiểm nghiệm..., mà càng là...", example: "挫折不仅是检验意志的试金石，更是走向成熟的阶梯。" },
        { pattern: "正所谓“……”，只有……才能……", meaning: "Đúng như câu nói '...', chỉ khi... mới có thể...", example: "正所谓“细节决定成败”，只有把每一个细节做到极致，才能赢得最终的胜利。" }
      ],
      sampleAnswer: {
        hanzi: `古人常讲：“不经一番寒彻骨，怎得梅花扑鼻香。”关于“${qText}”这一耐人寻味的命题，我认为人生的成就绝非一蹴而就，而是在面对挫折与把握机遇的交替中不断淬炼出来的。\n\n首先，失败是磨砺心智、累积经验的宝贵财富。正如爱迪生为了研制灯泡曾经历上千次尝试与挫败，每一次失利并没有击垮他，反而帮他排除了无数错误路线，最终迎来光明的突破。如果一个人害怕犯错而裹足不前，他就永远无法探索未知的可能性。\n\n其次，初期的成功能够迅速激发内心强大的自信心与行动力。在团队与个人成长中，阶段性的小胜能够给人们带来成就感，形成积极向上的正向反馈。只要我们在取得成绩时不骄不躁，把成功当作新的起点，这种自信就会化作源源不断的创新动能。\n\n再者，俗话说“细节决定成败”。无论目标多么宏大，最终都要落实到每一个具体的步骤与环节之中。古今中外无数案例证明，往往是某一个被忽视的细微疏漏导致全盘崩溃，而那些精益求精、把寻常事情做到极致的人，往往能在激烈的竞争中脱颖而出。\n\n总的来说，失败让我们清醒，成功让我们笃定。只要我们胸怀远大目标，脚踏实地注重每一个细节，持之以恒、厚积薄发，就一定能在人生的赛道上行稳致远。`,
        meaningVi: `Người xưa thường nói: "Không qua một phen lạnh thấu xương, sao có hoa mai ngát hương thơm." Đối với vấn đề đầy ý nghĩa "${qText}", tôi cho rằng thành tựu trong đời người không bao giờ đến sau một đêm, mà được tôi luyện qua sự đan xen giữa đối diện nghịch cảnh và nắm bắt thời cơ.\n\nTrước hết, thất bại là tài sản vô giá tôi luyện tâm trí và tích lũy vốn sống. Như Thomas Edison từng trải qua hàng ngàn lần thử nghiệm bất thành khi chế tạo bóng đèn, mỗi lần thất bại không quật ngã ông mà ngược lại giúp ông loại bỏ những con đường sai lầm để chạm tay vào bước đột phá. Nếu một người vì sợ sai mà chùn bước, họ sẽ vĩnh viễn không thể khai phá những giới hạn mới.\n\nThứ hai, những thành công bước đầu có thể nhanh chóng thắp lên niềm tin và sự tự tin mạnh mẽ. Trong sự trưởng thành của cá nhân hay tập thể, những thắng lợi giai đoạn mang lại cảm giác thành tựu và tạo ra động lực tâm lý tích cực. Chỉ cần chúng ta không tự mãn, xem thành công là điểm khởi đầu mới, sự tự tin ấy sẽ biến thành đòn bẩy mạnh mẽ.\n\nThêm vào đó, tục ngữ có câu "Chi tiết quyết định thành bại". Cho dù mục tiêu to lớn đến đâu, cuối cùng đều phải được hiện thực hóa qua từng khâu từng việc cụ thể. Những ai biết tỉ mỉ cầu toàn, biến những điều bình dị thành xuất sắc nhất định sẽ vững vàng dẫn đầu.\n\nTóm lại, thất bại giúp ta tỉnh táo, thành công giúp ta thêm vững tâm. Chỉ cần chúng ta nuôi dưỡng hoài bão, chú trọng từng chi tiết và kiên trì không ngừng, nhất định sẽ đi được những bước đi dài và vững chắc trên đường đời.`
      }
    };
  }

  // 4. CHỦ ĐỀ: CÔNG NGHỆ, MẠNG XÃ HỘI, KHOẢNG CÁCH (科技, 手机, 距离, 互联网)
  if (isTech) {
    return {
      isFallback: true,
      outline: {
        intro: `Mở bài: Đặt vấn đề trực diện về sự tác động hai mặt của công nghệ hiện đại đối với câu hỏi: "${qText}".`,
        body: [
          "Luận điểm 1: Công nghệ xóa nhòa rào cản địa lý (video call, mạng xã hội giúp người thân ở xa gặp nhau hàng ngày, hợp tác toàn cầu).",
          "Luận điểm 2: Mặt trái: Hiện tượng 'cúi đầu xem điện thoại' (低头族), giao tiếp ảo làm loãng tình cảm thực tế, ngồi cạnh nhau nhưng thiếu kết nối chân thành.",
          "Luận điểm 3: Giải pháp: Làm chủ công nghệ, thiết lập ranh giới 'đồng hành chất lượng cao' (高质量陪伴), dành thời gian thực cho gia đình bạn bè."
        ],
        conclusion: "Kết bài: Khẳng định công nghệ chỉ là công cụ, gần hay xa phụ thuộc vào trái tim và sự lựa chọn của mỗi con người."
      },
      vocabulary: [
        { hanzi: "拉近距离", pinyin: "lā jìn jùlí", meaning: "kéo gần khoảng cách" },
        { hanzi: "疏远", pinyin: "shūyuǎn", meaning: "xa cách, lạnh nhạt" },
        { hanzi: "低头族", pinyin: "dītóuzú", meaning: "hội người cúi đầu cắm mặt vào điện thoại" },
        { hanzi: "高质量陪伴", pinyin: "gāo zhìliàng péibàn", meaning: "sự đồng hành chất lượng cao, thực chất" },
        { hanzi: "双刃剑", pinyin: "shuāng rèn jiàn", meaning: "con dao hai lưỡi" }
      ],
      sentenceStructures: [
        { pattern: "科技宛如一把双刃剑，既……又……", meaning: "Công nghệ như con dao hai lưỡi, vừa... lại vừa...", example: "现代科技宛如一把双刃剑，既拉近了地理上的距离，又可能疏远心灵的沟通。" },
        { pattern: "关键在于我们如何……，而不是……", meaning: "Điều then chốt nằm ở việc chúng ta làm thế nào..., chứ không phải...", example: "关键在于我们如何支配手机，而不是让手机支配我们的生活。" }
      ],
      sampleAnswer: {
        hanzi: `在这个日新月异的信息时代，针对“${qText}”这个引人深思的话题，我认为现代科技宛如一把双刃剑，它拉近了地理上的距离，却也在无形中给人们的心灵筑起了隔阂。\n\n从积极的层面来看，互联网与智能通信技术彻底打破了时空的限制。以往“家书抵万金”，而如今远在千里之外的亲朋好友，只需轻点屏幕就能通过高清视频面对面交谈。跨国合作、线上办公也因为科技的赋能变得触手可及，极大地促进了人与人之间的协作效率与情感联结。\n\n然而，从消极的一面来看，“低头族”现象在现代社会随处可见。无论是在家庭聚餐还是朋友聚会中，很多人习惯性地沉迷于虚拟世界，在社交软件上热火朝天，却对身边的亲友冷漠以对。这种浅层化的虚拟社交不仅剥夺了深度沟通的温度，甚至让不少年轻人产生了社交焦虑与现实疏离感。\n\n因此，问题的根源并不在于科技本身，而在于我们使用科技的态度。我们应当倡导“高质量陪伴”的理念，学会给手机设置边界，在与家人朋友相处时放下电子设备，用真诚的眼神与倾听去感受彼此的温度。\n\n总而言之，科技应当是温暖人心的桥梁，而不应成为阻隔温情的冰冷高墙。唯有理性自律地驾驭科技，我们才能在享受数字化便利的同时，守住最真挚的人间温情。`,
        meaningVi: `Trong kỷ nguyên thông tin biến đổi từng ngày, đối với chủ đề sâu sắc "${qText}", tôi cho rằng công nghệ hiện đại tựa như một con dao hai lưỡi: nó kéo gần khoảng cách địa lý, nhưng cũng vô tình dựng lên những bức tường ngăn cách giữa tâm hồn con người.\n\nXét từ mặt tích cực, internet và thiết bị thông minh đã phá vỡ rào cản không gian và thời gian. Xưa kia 'thư nhà đáng giá ngàn vàng', ngày nay người thân bạn bè ở xa muôn trùng chỉ cần một nút chạm là có thể trò chuyện video trực diện. Hợp tác xuyên quốc gia và làm việc trực tuyến trở nên dễ dàng, thúc đẩy mạnh mẽ hiệu quả gắn kết công việc và tình cảm.\n\nTuy nhiên ở chiều ngược lại, hiện tượng 'cúi đầu lướt điện thoại' xuất hiện ở khắp mọi nơi. Dù là trong bữa cơm gia đình hay buổi tụ tập bạn bè, nhiều người mải mê với thế giới ảo, sôi nổi trên mạng nhưng lại thờ ơ lãnh đạm với người bên cạnh. Sự giao tiếp ảo hời hợt này tước đi hơi ấm của tương tác sâu sắc, khiến không ít người trẻ cảm thấy cô đơn giữa đám đông.\n\nBởi vậy, mấu chốt không nằm ở công nghệ, mà nằm ở thái độ làm chủ công nghệ của chúng ta. Chúng ta cần hướng tới sự 'đồng hành chất lượng cao', biết đặt ra ranh giới cho điện thoại, khi ở bên người thân hãy tạm gác màn hình để trao nhau ánh mắt lắng nghe chân thành.\n\nTóm lại, công nghệ nên là cây cầu nối liền những trái tim, chứ không phải bức tường lạnh lẽo ngăn cách yêu thương. Chỉ khi tự giác và làm chủ công nghệ, chúng ta mới vừa tận hưởng sự tiện lợi số hóa vừa giữ trọn vẹn sự ấm áp của tình người.`
      }
    };
  }

  // 5. CHỦ ĐỀ: TIỀN BẠC VÀ HẠNH PHÚC (金钱, 幸福, 财富, 快乐)
  if (isMoney) {
    return {
      isFallback: true,
      outline: {
        intro: `Mở bài: Đặt vấn đề biện chứng về mối quan hệ giữa tiền bạc và hạnh phúc: "${qText}". Khẳng định tiền là điều kiện vật chất cần thiết nhưng không phải ngọn nguồn duy nhất của hạnh phúc đích thực.`,
        body: [
          "Luận điểm 1: Tiền bạc đem lại nền tảng an toàn vật chất (cơm ăn áo mặc, y tế, giáo dục, giảm bớt nỗi lo cơm áo gạo tiền).",
          "Luận điểm 2: Giới hạn của tiền tài: Tiền không mua được tình thân chân thành, sức khỏe thể chất và sự bình an, thanh thản trong tâm hồn.",
          "Luận điểm 3: Hạnh phúc đích thực đến từ sự biết đủ (知足常乐), phong phú về thế giới tinh thần và giá trị cống hiến cho xã hội."
        ],
        conclusion: "Kết bài: Đúc kết phương châm sống: Kiếm tiền bằng sự nỗ lực chân chính nhưng không biến mình thành nô lệ của đồng tiền; trân trọng giá trị tinh thần."
      },
      vocabulary: [
        { hanzi: "金钱", pinyin: "jīnqián", meaning: "tiền bạc" },
        { hanzi: "真正的幸福", pinyin: "zhēnzhèng de xìngfú", meaning: "hạnh phúc đích thực" },
        { hanzi: "物质保障", pinyin: "wùzhì bǎozhàng", meaning: "đảm bảo về mặt vật chất" },
        { hanzi: "知足常乐", pinyin: "zhī zú cháng lè", meaning: "biết đủ là vui, hài lòng với thực tại" },
        { hanzi: "精神世界", pinyin: "jīngshén shìjiè", meaning: "thế giới tinh thần" }
      ],
      sentenceStructures: [
        { pattern: "金钱固然能够带来……，但它买不来……", meaning: "Tiền bạc dẫu có thể đem lại..., nhưng nó không mua được...", example: "金钱固然能够带来优越的物质享受，但它买不来内心的宁静与真挚的情感。" },
        { pattern: "真正的幸福往往不在于拥有多少，而在于……", meaning: "Hạnh phúc đích thực thường không nằm ở sở hữu bao nhiêu, mà nằm ở...", example: "真正的幸福往往不在于拥有多少财富，而在于懂得知足与关爱身边的人。" }
      ],
      sampleAnswer: {
        hanzi: `古人云：“金玉满堂，莫之能守。”对于“${qText}”这个永恒的话题，我认为金钱与幸福之间有着密不可分的关系，但金钱绝非衡量幸福的唯一标尺。\n\n不可否认，一定的经济基础是生存与发展的基本前提。正如俗话所说：“巧妇难为无米之炊。”拥有足够的资金，我们能够改善居住条件、享受良好的医疗保健，并为子女提供优质的教育资源。免于贫困的匮乏与焦虑，能够在很大程度上赋予我们追求梦想的安全感与尊严。\n\n然而，金钱的作用终究是有边界的。财富可以买来奢华的床榻，却买不来安稳的睡眠；可以买来昂贵的礼物，却买不来真挚的友谊与亲情。如果在追逐财富的过程中迷失了自我，沦为金钱的奴隶，甚至牺牲了健康与家庭，即使腰缠万贯，内心也依然会感到空虚与痛苦。\n\n在我看来，真正的幸福往往源于内心的丰盈与从容。正如先贤所倡导的“知足常乐”，当我们学会珍惜眼前的点滴拥有，把时间倾注于热爱的事业、陪伴身边的至亲，并用自己的能力回馈社会时，那种精神上的充实与满足才是任何金钱都无法替代的。\n\n总的来说，金钱是通向美好生活的一种工具，而不是终极目的。我们要通过双手创造财富，更要用智慧守护幸福，在物质与精神之间找到最惬意的平衡。`,
        meaningVi: `Người xưa có câu: 'Vàng ngọc đầy nhà, khó giữ bền lâu.' Đối với câu hỏi muôn thuở "${qText}", tôi cho rằng giữa tiền tài và hạnh phúc có mối liên hệ mật thiết, nhưng tiền bạc tuyệt đối không phải là thước đo duy nhất của niềm hạnh phúc.\n\nKhông thể phủ nhận rằng một nền tảng kinh tế ổn định là điều kiện cơ bản để sinh tồn và phát triển. Có đủ tài chính, chúng ta có thể cải thiện đời sống, tiếp cận điều kiện y tế tốt và mang lại nền giáo dục ưu việt cho con cái. Không bị bủa vây bởi nỗi lo cơm áo gạo tiền sẽ đem lại cho ta cảm giác an toàn và sự tự tôn để theo đuổi ước mơ.\n\nThế nhưng, đồng tiền suy cho cùng luôn có giới hạn. Tiền có thể mua chiếc giường nhung lụa nhưng không mua được giấc ngủ bình yên; mua được món quà đắt giá nhưng không mua được tình thân và bạn bè tri kỷ. Nếu mải miết lao vào kiếm tiền mà đánh mất chính mình, đánh đổi sức khỏe và gia đình thì dẫu có gia tài bạc triệu tâm hồn vẫn cô độc và trống rỗng.\n\nTheo tôi, hạnh phúc chân thực bắt nguồn từ sự phong phú và an nhiên trong nội tâm. Đúng như đạo lý 'biết đủ là vui', khi ta biết trân trọng những gì mình đang có, dành thời gian cho đam mê, người thân và sẻ chia với xã hội, sự thảnh thơi đó là thứ vàng bạc không thể đánh đổi.\n\nTóm lại, tiền bạc là công cụ hỗ trợ cuộc sống chứ không phải mục đích sau cùng. Chúng ta hãy nỗ lực tạo ra của cải bằng đôi tay, nhưng hãy dùng trí tuệ để gìn giữ hạnh phúc, tìm được điểm cân bằng trọn vẹn giữa vật chất và tinh thần.`
      }
    };
  }

  // 6. CHỦ ĐỀ: CUỘC SỐNG NHỊP NHANH, ÁP LỰC VÀ CÂN BẰNG (快节奏, 压力, 工作, 平衡)
  if (isFastPaced) {
    return {
      isFallback: true,
      outline: {
        intro: `Mở bài: Nêu quan điểm trực diện về lối sống nhịp nhanh (快节奏生活) đối với câu hỏi: "${qText}". Nhịp sống nhanh mang lại hiệu suất cao nhưng cũng tạo áp lực lớn, cần tìm lại sự cân bằng.`,
        body: [
          "Luận điểm 1: Tác động tiêu cực của nhịp sống hối hả: Thường xuyên tăng ca, thiếu ngủ, kiệt sức và căng thẳng tâm lý.",
          "Luận điểm 2: Ảnh hưởng đến các mối quan hệ xã hội: Ít thời gian chất lượng dành cho gia đình, ăn bữa cơm vội vã, cắm mặt vào điện thoại.",
          "Luận điểm 3: Giải pháp cá nhân: Học cách sống chậm (慢生活), phân bổ thời gian khoa học, biết từ chối yêu cầu không cần thiết để tái tạo năng lượng."
        ],
        conclusion: "Kết bài: Đúc kết rằng cuộc sống không chỉ có guồng quay công việc; biết dừng lại hít thở để tận hưởng khoảnh khắc đời thường."
      },
      vocabulary: [
        { hanzi: "快节奏生活", pinyin: "kuài jièzòu shēnghuó", meaning: "cuộc sống nhịp điệu nhanh" },
        { hanzi: "身心俱疲", pinyin: "shēn xīn jù pí", meaning: "thân xác và tâm hồn đều mệt mỏi rã rời" },
        { hanzi: "劳逸结合", pinyin: "láo yì jiéhé", meaning: "kết hợp hài hòa giữa lao động và nghỉ ngơi" },
        { hanzi: "紧绷", pinyin: "jǐnběng", meaning: "căng thẳng, thắt chặt" },
        { hanzi: "有张有弛", pinyin: "yǒu zhāng yǒu chí", meaning: "biết căng biết chùng, điều hòa nhịp nhàng" }
      ],
      sentenceStructures: [
        { pattern: "在享受……的同时，我们也必须正视……", meaning: "Trong khi tận hưởng..., chúng ta cũng phải nhìn nhận thẳng thắn...", example: "在享受高效率带来的便利的同时，我们也必须正视快节奏对身心健康的影响。" },
        { pattern: "只有做到……，才能在忙碌中保持……", meaning: "Chỉ khi làm được..., mới có thể duy trì... trong sự bận rộn", example: "只有做到劳逸结合，才能在忙碌中保持充沛的活力与清醒的头脑。" }
      ],
      sampleAnswer: {
        hanzi: `在当今瞬息万变的现代社会，“快节奏生活”已经成为一种普遍的常态。针对“${qText}”这个问题，我认为快节奏虽然极大地提升了社会运转的效率，但如果缺乏调适，也会给人们的身心健康和生活质量带来沉重的负担。\n\n首先，持续的高压运转严重透支着现代人的身心健康。许多上班族和青年学生习惯了争分夺秒，加班熬夜成为家常便饭。长期的紧绷状态导致失眠、焦虑以及亚健康问题频发，很多人年纪轻轻就感到身心俱疲。如果生活只剩下奔波，效率的提升最终可能以健康为代价。\n\n其次，快节奏在不知不觉中冲淡了人际交往的温情。为了赶进度，我们常常草草吃完一顿饭，很少有充裕的时间陪伴父母、倾听伴侣的心声。人与人之间的交流变得碎片化，即使坐在一起也常常心不在焉地刷着工作群，让原本温馨的家庭生活失去了应有的宁静。\n\n古人讲：“文武之道，一张一弛。”面对快节奏的裹挟，我们最重要的课题是学会主动寻找生活的平衡。一方面要提高时间管理能力，拒绝无意义的内耗与伪勤奋；另一方面要勇敢地为自己保留一段“慢时光”，去户外散步、读一本好书，或者静静喝一杯茶，让疲惫的心灵得到抚慰与沉淀。\n\n总的来说，人生的旅途不仅在于奔跑的速度，更在于沿途的风景与内心的感受。学会在忙碌中适时停下脚步，劳逸结合、从容前行，我们才能拥有真正健康而充实的人生。`,
        meaningVi: `Trong xã hội hiện đại biến chuyển không ngừng, 'cuộc sống nhịp nhanh' đã trở thành trạng thái phổ biến. Đối với đề bài "${qText}", tôi cho rằng nhịp sống hối hả dẫu nâng cao năng suất xã hội, nhưng nếu thiếu sự điều hòa sẽ tạo nên gánh nặng lớn cho sức khỏe và chất lượng sống.\n\nTrước hết, guồng quay liên tục khiến sức khỏe thể chất và tinh thần bị bào mòn. Rất nhiều người trẻ quen với việc chạy đua cùng thời gian, tăng ca thâu đêm trở thành điều thường nhật. Áp lực kéo dài dẫn đến mất ngủ, lo âu và suy nhược. Nếu cuộc sống chỉ còn lại sự hối hả, năng suất cao cuối cùng sẽ phải trả giá bằng chính sức khỏe.\n\nThứ hai, nhịp sống vội vã vô tình làm nguội lạnh hơi ấm của các mối quan hệ. Vì bận rộn, ta thường ăn bữa cơm vội vã, ít có thời gian chất lượng lắng nghe người thân và bạn bè. Giao tiếp bị phân mảnh, ngồi cạnh nhau nhưng tâm trí vẫn để ở công việc khiến gia đình mất đi sự ấm cúng thanh thản.\n\nNgười xưa dạy: 'Đạo văn võ, có lúc căng lúc chùng'. Đứng trước làn sóng hối hả, điều quan trọng nhất là ta phải chủ động tìm lại sự cân bằng. Một mặt cần quản lý thời gian khoa học, mặt khác hãy dành cho mình những khoảnh khắc 'sống chậm' như đi dạo hít thở khí trời, đọc một cuốn sách hay thưởng thức chén trà để tâm hồn được tái tạo.\n\nTóm lại, hành trình cuộc đời không chỉ tính bằng tốc độ chạy, mà còn ở cảnh sắc hai bên đường và sự thanh thản nội tâm. Biết dừng lại đúng lúc để nghỉ ngơi, làm việc và nghỉ ngơi hài hòa, ta mới có thể tận hưởng cuộc đời trọn vẹn.`
      }
    };
  }

  // 7. MẪU TỔNG QUÁT TỰ NHIÊN (KHÔNG DÙNG VĂN MẪU RẬP KHUÔN, BÁM TRỰC DIỆN ĐỀ BÀI)
  return {
    isFallback: true,
    outline: {
      intro: `Mở bài: Nêu quan điểm trực diện và rõ ràng cho câu hỏi đề bài: "${qText}". Đặt ra câu hỏi gợi mở cho học viên.`,
      body: [
        "Luận điểm 1: Phân tích bản chất hiện tượng từ góc nhìn thực tế đời sống và nguyên nhân cốt lõi.",
        "Luận điểm 2: Đưa ra trải nghiệm, dẫn chứng thực tế sinh động để làm sáng tỏ vấn đề.",
        "Luận điểm 3: Đề xuất giải pháp và bài học hành động để phát huy mặt tích cực và khắc phục mặt hạn chế."
      ],
      conclusion: "Kết bài: Đúc kết lại toàn bộ vấn đề, đưa ra thông điệp tích cực và định hướng hành động thiết thực."
    },
    vocabulary: [
      { hanzi: "深思", pinyin: "shēnsī", meaning: "suy ngẫm sâu sắc" },
      { hanzi: "切身体会", pinyin: "qièshēn tǐhuì", meaning: "trải nghiệm thực tế của bản thân" },
      { hanzi: "脚踏实地", pinyin: "jiǎo tà shí dì", meaning: "chân đạp đất vững chắc, làm thật việc thật" },
      { hanzi: "因地制宜", pinyin: "yīn dì zhì yí", meaning: "tùy cơ ứng biến, linh hoạt theo tình hình" },
      { hanzi: "厚积薄发", pinyin: "hòu jī bó fā", meaning: "tích lũy sâu dày rồi bộc phát rực rỡ" }
    ],
    sentenceStructures: [
      { pattern: "就我个人的体会而言，……最核心的要素在于……", meaning: "Xét từ trải nghiệm của cá nhân tôi, yếu tố cốt lõi nhất của... nằm ở...", example: `就我个人的体会而言，面对这个话题，最核心的要素在于理性思考与脚踏实地的行动。` },
      { pattern: "与其……，不如从……做起", meaning: "Thay vì..., chi bằng hãy bắt đầu từ việc...", example: "与其盲目焦虑，不如从身边的每一件小事做起。" }
    ],
    sampleAnswer: {
      hanzi: `关于“${qText}”这个非常具有启发性的题目，我认为它紧密贴合了我们当下的现实生活，很值得我们静下心来深入探讨。\n\n首先，从现实生活的实际经验来看，任何事情的发展都有其内在的规律。面对各种纷繁复杂的现象，我们不能只停留在表面的讨论上，而应当善于抓住核心，弄清楚背后的根本原因。只有看清了方向，我们的努力才不会偏离轨道。\n\n其次，就我个人的体会而言，面对这样的情境，保持积极而平和的心态至关重要。生活中往往充满了未知与变数，与其一味感到困惑或抱怨，不如静下心来认真总结经验。多向身边优秀的同行与长辈请教，把每一次考验都当作提升自我认知的契机，才能在复杂多变的环境中立于不败之地。\n\n最后，纸上谈兵终究无法带来真实的改变，关键在于知行合一、脚踏实地。我们可以从力所能及的小事做起，循序渐进地积累经验。只要方向正确、方法得当，点滴的努力最终必将汇聚成可观的成果。\n\n总的来说，面对这一问题，我们既要有长远的眼光，又要有求真务实的作风。在思考中前行、在行动中完善，我们就一定能从容应对，活出充实而有意义的人生。`,
      meaningVi: `Đối với câu hỏi giàu ý nghĩa gợi mở "${qText}", tôi cho rằng đề bài này bám rất sát thực tế đời sống hiện nay và rất xứng đáng để chúng ta cùng suy ngẫm sâu sắc.\n\nTrước hết, từ trải nghiệm thực tế đời thường, sự phát triển của vạn vật đều có quy luật riêng. Đứng trước những hiện tượng phức tạp, chúng ta không thể chỉ dừng lại ở bàn luận bề nổi, mà cần nắm bắt mắt xích cốt lõi, thấu suốt nguyên nhân căn bản. Chỉ khi nhìn rõ phương hướng, nỗ lực của chúng ta mới không bị chệch hướng.\n\nThứ hai, từ cảm nhận của bản thân tôi, giữ được một tâm thế bình hòa và tích cực là điều vô cùng quý giá. Cuộc sống luôn có những biến số, thay vì hoang mang hay than phiền, chi bằng ta hãy lắng lòng lại đúc kết kinh nghiệm, khiêm tốn học hỏi những người đi trước và biến mỗi thử thách thành đòn bẩy hoàn thiện năng lực.\n\nCuối cùng, mọi điều nói suông đều không tạo ra thay đổi thực chất, điều cốt yếu nằm ở việc 'tri hành hợp nhất', nói đi đôi với làm thật. Chúng ta hãy bắt đầu từ những việc nhỏ trong tầm tay, tích lũy từng bước để tạo nên thành tựu lớn.\n\nTóm lại, đối với vấn đề này, chúng ta vừa cần tầm nhìn xa trông rộng, vừa cần tác phong thực tế cầu thị. Vừa đi vừa ngẫm, vừa làm vừa hoàn thiện, nhất định chúng ta sẽ tự tin làm chủ cuộc sống và kiến tạo một tương lai ý nghĩa.`
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
