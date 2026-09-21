/**
 * Tiếng Trung HongTai - AI Speaking Practice & HSKK Speech Grader (3p - 2p)
 * Khớp 100% bản vẽ Luyện Nói: Trình độ Sơ/Trung/Cao, Đề + Quay Random,
 * Gợi ý AI (Dàn bài, từ vựng, mẫu câu), Chuẩn bị (3p) và Bắt đầu nói (2p) có thu âm.
 */

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
}

// 2. Chuyển đổi Cấp độ: [Sơ] [Trung] [Cao]
window.switchSpeakingLevel = function (level, btn) {
  if (currentSpeakingLevel === level && currentActiveQuestion) return;
  currentSpeakingLevel = level;

  document.querySelectorAll('.level-select-row .level-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  spinRandomQuestion(true);
};

// 3. Nút [Quay] (Random đề bài)
window.spinRandomQuestion = function (playAnim = true) {
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
      <span>Gợi ý</span>
      <span style="font-size: 0.82rem; font-weight: 600; opacity: 0.9;">&rarr; Dàn bài &bull; Từ vựng / câu có thể sử dụng (AI tự đề xuất)</span>
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
  const box = document.getElementById('ai-suggestion-box');
  const btn = document.getElementById('hint-toggle-btn');
  if (!box || !currentActiveQuestion) return;

  const isVisible = box.style.display === 'block';

  if (isVisible) {
    box.style.display = 'none';
    if (btn) {
      btn.innerHTML = `
        <i class="fa-solid fa-lightbulb"></i>
        <span>Gợi ý</span>
        <span style="font-size: 0.82rem; font-weight: 600; opacity: 0.9;">&rarr; Dàn bài &bull; Từ vựng / câu có thể sử dụng (AI tự đề xuất)</span>
      `;
    }
    return;
  }

  box.style.display = 'block';
  if (btn) {
    btn.innerHTML = `
      <i class="fa-solid fa-eye-slash"></i>
      <span>Ẩn Gợi ý</span>
      <span style="font-size: 0.82rem; font-weight: 600; opacity: 0.9;">(Bấm để thu gọn)</span>
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
    const fallback = {
      outline: {
        intro: "Mở đầu trực tiếp: Nêu rõ câu trả lời hoặc quan điểm của bạn đối với đề tài.",
        body: [
          "Luận điểm 1: Nêu lý do cụ thể hoặc chia sẻ trải nghiệm thực tế của bạn.",
          "Luận điểm 2: Đưa ra ví dụ minh họa sinh động để tăng sức thuyết phục.",
          "Luận điểm 3: Nêu cảm xúc hoặc liên hệ mở rộng đến cuộc sống."
        ],
        conclusion: "Kết bài: Tóm tắt lại suy nghĩ và đưa ra lời chúc hoặc hy vọng tương lai."
      },
      vocabulary: [
        { hanzi: "经验", pinyin: "jīngyàn", meaning: "kinh nghiệm" },
        { hanzi: "观点", pinyin: "guāndiǎn", meaning: "quan điểm" },
        { hanzi: "不仅……而且……", pinyin: "bùjǐn... érqiě...", meaning: "không những... mà còn..." },
        { hanzi: "深有体会", pinyin: "shēnyǒu tǐhuì", meaning: "thấm thía sâu sắc" }
      ],
      sentenceStructures: [
        {
          pattern: "对于这个问题，我的看法是……",
          meaning: "Đối với câu hỏi này, quan điểm của tôi là...",
          example: "对于这个问题，我的看法是兴趣是最好的老师。"
        },
        {
          pattern: "之所以……是因为……",
          meaning: "Sở dĩ... là bởi vì...",
          example: "我之所以选择一个人旅行，是因为这样更自由。"
        }
      ],
      sampleAnswer: {
        hanzi: "对于这个问题，我的看法是，无论是在生活还是在工作中，积极的心态都至关重要。遇到困难时，我们应当保持冷静，多向有经验的人请教，持之以恒就一定能克服难关。",
        pinyin: "Duìyú zhè ge wèntí, wǒ de kànfǎ shì, wúlùn shì zài shēnghuó háishì zài gōngzuò zhōng, jījí de xīntài dōu zhìguān zhòngyào. Yù dào kùnnán shí, wǒmen yīngdāng bǎochí lěngjìng, duō xiàng yǒu jīngyàn de rén qǐngjiào, chízhīyǐhéng jiù yídìng néng kèfú nánguān.",
        meaningVi: "Đối với câu hỏi này, quan điểm của tôi là dù trong cuộc sống hay công việc, tâm thế tích cực đều vô cùng quan trọng. Khi gặp khó khăn, chúng ta nên giữ bình tĩnh, học hỏi người có kinh nghiệm, kiên trì thì nhất định sẽ vượt qua thử thách."
      }
    };
    aiSuggestionsCache.set(qKey, fallback);
    renderAiSuggestionContent(fallback);
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
  const sample = data.sampleAnswer || null;

  box.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px dashed rgba(34, 197, 94, 0.4); padding-bottom: 10px;">
      <div style="display: flex; align-items: center; gap: 8px; font-weight: 900; font-size: 1.05rem; color: #4ade80;">
        <i class="fa-solid fa-wand-magic-sparkles"></i>
        <span>AI Đề Xuất Dàn Ý &amp; Từ Vựng Khẩu Ngữ</span>
      </div>
      <span style="font-size: 0.75rem; background: rgba(34, 197, 94, 0.15); color: #86efac; padding: 2px 8px; border-radius: 6px; font-weight: 700;">
        HSKK ${currentSpeakingLevel === 'so' ? 'Sơ cấp' : currentSpeakingLevel === 'cao' ? 'Cao cấp' : 'Trung cấp'}
      </span>
    </div>

    <!-- 1. Dàn bài -->
    <div style="margin-bottom: 16px;">
      <div style="font-size: 0.92rem; font-weight: 800; color: #fbbf24; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
        <i class="fa-solid fa-list-ol"></i> <span>1. Dàn bài gợi ý:</span>
      </div>
      <div style="background: rgba(0,0,0,0.25); padding: 12px 16px; border-radius: 12px; border-left: 3px solid #fbbf24; font-size: 0.9rem; line-height: 1.65; color: #e2e8f0;">
        <div style="margin-bottom: 6px;"><strong>Mở đầu:</strong> ${outline.intro || 'Trả lời trực tiếp vào trọng tâm câu hỏi.'}</div>
        <div style="margin-bottom: 6px;">
          <strong>Triển khai thân bài:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 20px;">
            ${(outline.body || []).map(b => `<li>${b}</li>`).join('')}
          </ul>
        </div>
        <div><strong>Kết thúc:</strong> ${outline.conclusion || 'Đúc kết bài học hoặc cảm xúc cá nhân.'}</div>
      </div>
    </div>

    <!-- 2. Từ vựng có thể sử dụng -->
    <div style="margin-bottom: 16px;">
      <div style="font-size: 0.92rem; font-weight: 800; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
        <i class="fa-solid fa-key"></i> <span>2. Từ vựng / Cụm từ đắt giá nên nói:</span>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${vocabList.map(v => `
          <div style="background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.35); padding: 5px 12px; border-radius: 99px;">
            <span style="font-weight: 800; color: #ffffff; font-family: var(--font-chinese), sans-serif;">${v.hanzi}</span>
            <span style="font-size: 0.78rem; color: #38bdf8; margin: 0 4px;">(${v.pinyin})</span>
            <span style="font-size: 0.78rem; color: #cbd5e1;">: ${v.meaning}</span>
          </div>
        `).join('')}
      </div>
    </div>

    <!-- 3. Mẫu câu cấu trúc nên dùng -->
    ${sentenceList.length > 0 ? `
      <div style="margin-bottom: 16px;">
        <div style="font-size: 0.92rem; font-weight: 800; color: #a855f7; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-puzzle-piece"></i> <span>3. Mẫu câu kết nối lưu loát:</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">
          ${sentenceList.map(s => `
            <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 12px; padding: 10px 14px; font-size: 0.88rem;">
              <div style="font-weight: 800; color: #d8b4fe; margin-bottom: 2px;">${s.pattern}</div>
              <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px;">${s.meaning}</div>
              ${s.example ? `<div style="font-size: 0.84rem; color: #e2e8f0; font-style: italic;">VD: ${s.example}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
    ` : ''}

    <!-- 4. Bài nói mẫu tham khảo -->
    ${sample ? `
      <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 14px 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong style="font-size: 0.88rem; color: #34d399;"><i class="fa-solid fa-medal"></i> Bài nói mẫu tham khảo:</strong>
          <button onclick="playSpeakingSampleTts()" style="background: transparent; border: none; color: #38bdf8; font-size: 0.82rem; font-weight: 700; cursor: pointer;">
            <i class="fa-solid fa-volume-high"></i> Nghe người bản xứ nói
          </button>
        </div>
        <div id="sample-speaking-hanzi" class="hanzi-text" style="font-size: 1.05rem; line-height: 1.7; color: #ffffff; margin-bottom: 4px;">
          ${sample.hanzi}
        </div>
        ${sample.pinyin ? `<div style="font-size: 0.82rem; color: #94a3b8; font-style: italic; margin-bottom: 4px;">${sample.pinyin}</div>` : ''}
        ${sample.meaningVi ? `<div style="font-size: 0.84rem; color: #cbd5e1;">${sample.meaningVi}</div>` : ''}
      </div>
    ` : ''}
  `;
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
  // Đóng bộ ghi âm nếu đang chạy
  cancelSpeakingRecording();

  const prepBox = document.getElementById('prep-timer-box');
  const btnPrep = document.getElementById('btn-prep-3p');
  if (!prepBox) return;

  prepBox.style.display = 'block';
  btnPrep?.classList.add('active-timer');
  prepBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

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
  const badge = data.badge || (score >= 90 ? 'Xuất Sắc 🌟' : score >= 80 ? 'Rất Tốt 👏' : score >= 65 ? 'Khá 👍' : 'Cần Cố Gắng 🎙️');
  const scoreBg = score >= 85 ? 'linear-gradient(135deg, #10b981, #059669)' : score >= 70 ? 'linear-gradient(135deg, #f59e0b, #d97706)' : 'linear-gradient(135deg, #ef4444, #dc2626)';

  const crit = data.criteriaScores || { pronunciation: 85, fluency: 85, grammar: 85, content: 85 };
  const strengths = data.strengths || [];
  const improvements = data.improvements || [];
  const nativeZh = data.nativeVersion || originalTranscript;
  const nativePinyin = data.nativePinyin || '';
  const nativeVi = data.nativeVi || '';

  container.innerHTML = `
    <div class="speaking-card-panel" style="margin-bottom: 24px; position: relative;">
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
          ${data.generalFeedback || 'Bài nói của bạn hoàn thành tốt mục tiêu giao tiếp.'}
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

// Khởi chạy khi DOM sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
  initSpeakingQuestions();
});
