/**
 * Tiếng Trung HongTai - Sentence Reorder Interactive Practice (790 Questions HSK 1 - 6)
 */

let allQuestionsData = {
  meta: { total: 0 },
  questions: [],
  byLevel: { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] }
};

let currentLevel = 1; // 'all' | 1 | 2 | 3 | 4 | 5 | 6
let currentQuestionsList = [];
let currentIndex = 0;
let currentQuestion = null;

// The current user selection: array of objects { partIndex, text }
let selectedWords = [];
// Current scrambled display order of indices
let scrambledIndices = [];

// Stats
let streak = parseInt(localStorage.getItem('hongtai_reorder_streak') || '0', 10);
let correctCount = parseInt(localStorage.getItem('hongtai_reorder_correct') || '0', 10);
let isRandomMode = localStorage.getItem('hongtai_reorder_random') === 'true';
let showPinyinHint = false;

// 1. Initialize
async function initSentenceReorder() {
  updateStatsDisplay();

  try {
    let res = await fetch('/api/sentence-reorder');
    if (res.ok) {
      allQuestionsData = await res.json();
    } else {
      res = await fetch('/data/sentence_reorder_questions.json');
      allQuestionsData = await res.json();
    }
  } catch (e) {
    console.warn('API error, loading static JSON...', e);
    try {
      const res = await fetch('/data/sentence_reorder_questions.json');
      allQuestionsData = await res.json();
    } catch (err2) {
      console.error('Cannot load sentence questions:', err2);
    }
  }

  // Update tabs count
  if (allQuestionsData.meta) {
    const meta = allQuestionsData.meta;
    const heroBadge = document.getElementById('hero-total-badge');
    if (heroBadge) heroBadge.textContent = `${meta.total || 790} Đề Chuẩn HSK 1 - 6`;
  }

  updateQuestionList();
  loadQuestion(0);
}

// 2. Filter list by level
function updateQuestionList() {
  if (currentLevel === 'all') {
    currentQuestionsList = [...allQuestionsData.questions];
  } else {
    currentQuestionsList = allQuestionsData.byLevel[currentLevel] || [];
  }

  if (isRandomMode) {
    shuffleArray(currentQuestionsList);
  }

  currentIndex = 0;
}

// 3. Load question at index
function loadQuestion(index) {
  if (!currentQuestionsList || currentQuestionsList.length === 0) return;

  if (index < 0) index = currentQuestionsList.length - 1;
  if (index >= currentQuestionsList.length) index = 0;

  currentIndex = index;
  currentQuestion = currentQuestionsList[currentIndex];
  selectedWords = [];

  // Prepare scrambled indices (ensure it's not already in exact answer order)
  const partsCount = currentQuestion.parts.length;
  scrambledIndices = Array.from({ length: partsCount }, (_, i) => i);
  shuffleArray(scrambledIndices);

  // If accidentally identical to 0, 1, 2, ... and length > 1, shuffle once more
  if (partsCount > 2 && scrambledIndices.every((val, i) => val === i)) {
    shuffleArray(scrambledIndices);
  }

  renderQuestionUI();
}

// 4. Render UI
function renderQuestionUI() {
  if (!currentQuestion) return;

  // Level & Index badge
  const lvlBadge = document.getElementById('q-level-badge');
  if (lvlBadge) lvlBadge.textContent = `HSK ${currentQuestion.level}`;

  const idxBadge = document.getElementById('q-index-badge');
  if (idxBadge) idxBadge.textContent = `Câu ${currentIndex + 1} / ${currentQuestionsList.length}`;

  // Meaning & Pinyin hint
  const transEl = document.getElementById('q-translation-text');
  if (transEl) transEl.textContent = currentQuestion.translation || 'Sắp xếp các khối từ thành câu hoàn chỉnh.';

  const pinyinHintEl = document.getElementById('q-pinyin-hint-text');
  if (pinyinHintEl) {
    pinyinHintEl.textContent = currentQuestion.pinyin || '';
    pinyinHintEl.style.display = showPinyinHint ? 'block' : 'none';
  }

  // Hide reveal panel
  const revealCard = document.getElementById('answer-reveal-card');
  if (revealCard) revealCard.style.display = 'none';

  // Reset answer zone state
  const answerZone = document.getElementById('answer-zone');
  if (answerZone) {
    answerZone.className = 'answer-zone';
  }

  // Reset check button
  const checkBtn = document.getElementById('btn-check');
  if (checkBtn) {
    checkBtn.innerHTML = '<i class="fa-solid fa-check"></i> Kiểm tra';
    checkBtn.style.background = 'linear-gradient(135deg, #0284c7, #2563eb)';
    checkBtn.disabled = false;
  }

  renderAnswerZone();
  renderScrambledPool();
}

// Render the Answer line
function renderAnswerZone() {
  const answerZone = document.getElementById('answer-zone');
  const countLabel = document.getElementById('answer-count-label');
  if (!answerZone) return;

  if (selectedWords.length === 0) {
    answerZone.innerHTML = `
      <div class="answer-placeholder" id="answer-placeholder">
        <i class="fa-solid fa-hand-pointer" style="margin-right: 6px;"></i> Bấm các khối từ bên dưới để đưa vào câu này...
      </div>
    `;
    answerZone.classList.remove('has-items');
    if (countLabel) countLabel.textContent = `0 / ${currentQuestion.parts.length} từ`;
    return;
  }

  answerZone.classList.add('has-items');
  if (countLabel) countLabel.textContent = `${selectedWords.length} / ${currentQuestion.parts.length} từ`;

  answerZone.innerHTML = '';
  selectedWords.forEach((item, pos) => {
    const chip = document.createElement('div');
    chip.className = 'word-chip in-answer';
    chip.innerHTML = `<span style="font-size: 0.72rem; opacity: 0.75; margin-right: 4px;">${pos + 1}.</span> <span>${escapeHtml(item.text)}</span>`;
    chip.title = 'Bấm để trả lại khối từ';
    chip.onclick = () => removeWordFromAnswer(pos);
    answerZone.appendChild(chip);
  });
}

// Render the Scrambled Pool
function renderScrambledPool() {
  const pool = document.getElementById('scrambled-pool');
  if (!pool || !currentQuestion) return;

  pool.innerHTML = '';
  const usedIndices = new Set(selectedWords.map(w => w.partIndex));

  scrambledIndices.forEach(partIdx => {
    const isUsed = usedIndices.has(partIdx);
    const text = currentQuestion.parts[partIdx];

    const chip = document.createElement('div');
    chip.className = `word-chip ${isUsed ? 'used-placeholder' : ''}`;
    chip.textContent = text;
    if (!isUsed) {
      chip.onclick = () => addWordToAnswer(partIdx, text);
    }
    pool.appendChild(chip);
  });
}

// Interaction: Add word from pool to answer
function addWordToAnswer(partIndex, text) {
  // Prevent duplicate additions of the same part index
  if (selectedWords.some(w => w.partIndex === partIndex)) return;

  selectedWords.push({ partIndex, text });
  renderAnswerZone();
  renderScrambledPool();

  // Reset any error/check state
  const answerZone = document.getElementById('answer-zone');
  if (answerZone) answerZone.className = 'answer-zone has-items';
}

// Interaction: Remove word from answer
function removeWordFromAnswer(pos) {
  selectedWords.splice(pos, 1);
  renderAnswerZone();
  renderScrambledPool();

  const answerZone = document.getElementById('answer-zone');
  if (answerZone) answerZone.className = 'answer-zone' + (selectedWords.length > 0 ? ' has-items' : '');
}

// Interaction: Check Answer
window.checkAnswer = function () {
  if (!currentQuestion) return;

  const answerZone = document.getElementById('answer-zone');
  const checkBtn = document.getElementById('btn-check');

  if (selectedWords.length === 0) {
    if (answerZone) {
      answerZone.classList.add('incorrect-shake');
      setTimeout(() => answerZone.classList.remove('incorrect-shake'), 600);
    }
    showToast('Vui lòng chọn các từ để hoàn thiện câu!');
    return;
  }

  if (selectedWords.length < currentQuestion.parts.length) {
    if (answerZone) {
      answerZone.classList.add('incorrect-shake');
      setTimeout(() => answerZone.classList.remove('incorrect-shake'), 600);
    }
    showToast(`Bạn mới xếp ${selectedWords.length}/${currentQuestion.parts.length} từ. Hãy xếp đủ câu nhé!`);
    return;
  }

  // Clean strings for exact grammatical comparison
  const userText = selectedWords.map(w => w.text).join('').replace(/[。？！?!.,，、\s]/g, '');
  const targetText = currentQuestion.answer.replace(/[。？！?!.,，、\s]/g, '');

  if (userText === targetText) {
    // CORRECT!
    streak++;
    correctCount++;
    saveStats();
    updateStatsDisplay();

    if (answerZone) {
      answerZone.className = 'answer-zone has-items correct-glow';
    }

    if (checkBtn) {
      checkBtn.innerHTML = '<i class="fa-solid fa-circle-check"></i> Hoàn toàn chính xác!';
      checkBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    }

    speakTargetAnswer();
    showRevealPanel(true);
  } else {
    // INCORRECT!
    streak = 0;
    saveStats();
    updateStatsDisplay();

    if (answerZone) {
      answerZone.classList.remove('incorrect-shake');
      void answerZone.offsetWidth; // trigger reflow
      answerZone.className = 'answer-zone has-items incorrect-shake';
    }

    showToast('Chưa đúng thứ tự ngữ pháp! Hãy thử xếp lại hoặc bấm "Xem đáp án" nhé!');
  }
};

// Show answer reveal panel
function showRevealPanel(isCorrect = false) {
  const panel = document.getElementById('answer-reveal-card');
  if (!panel || !currentQuestion) return;

  const statusText = document.getElementById('reveal-status-text');
  if (statusText) {
    statusText.innerHTML = isCorrect
      ? '<i class="fa-solid fa-circle-check"></i> XUẤT SẮC! ĐÁP ÁN CHÍNH XÁC:'
      : '<i class="fa-solid fa-circle-info" style="color: #fbbf24;"></i> ĐÁP ÁN THAM KHẢO CHUẨN:';
    statusText.style.color = isCorrect ? '#10b981' : '#fbbf24';
  }

  const hanziEl = document.getElementById('reveal-hanzi-text');
  if (hanziEl) hanziEl.textContent = currentQuestion.answer;

  const pinyinEl = document.getElementById('reveal-pinyin-text');
  if (pinyinEl) pinyinEl.textContent = currentQuestion.pinyin || '';

  const transEl = document.getElementById('reveal-trans-text');
  if (transEl) transEl.textContent = currentQuestion.translation || '';

  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Reveal Answer manually
window.revealAnswer = function () {
  showRevealPanel(false);
  speakTargetAnswer();
};

// Reset current sentence
window.resetCurrentSentence = function () {
  selectedWords = [];
  renderAnswerZone();
  renderScrambledPool();

  const revealCard = document.getElementById('answer-reveal-card');
  if (revealCard) revealCard.style.display = 'none';

  const answerZone = document.getElementById('answer-zone');
  if (answerZone) answerZone.className = 'answer-zone';

  const checkBtn = document.getElementById('btn-check');
  if (checkBtn) {
    checkBtn.innerHTML = '<i class="fa-solid fa-check"></i> Kiểm tra';
    checkBtn.style.background = 'linear-gradient(135deg, #0284c7, #2563eb)';
  }
};

// Next Question
window.nextQuestion = function () {
  loadQuestion(currentIndex + 1);
};

// Prev Question
window.prevQuestion = function () {
  loadQuestion(currentIndex - 1);
};

// Shuffle pool order
window.shuffleCurrentPool = function () {
  shuffleArray(scrambledIndices);
  renderScrambledPool();
};

// Switch level filter
window.switchLevel = function (lvl, btnEl) {
  currentLevel = lvl;

  // Update tabs active state
  document.querySelectorAll('.lvl-tab-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');

  updateQuestionList();
  loadQuestion(0);
};

// Toggle Order Mode: Sequential vs Random
window.toggleOrderMode = function () {
  isRandomMode = !isRandomMode;
  localStorage.setItem('hongtai_reorder_random', isRandomMode ? 'true' : 'false');

  const modeText = document.getElementById('mode-text');
  if (modeText) {
    modeText.textContent = isRandomMode ? 'Ngẫu nhiên' : 'Theo thứ tự';
  }

  updateQuestionList();
  loadQuestion(0);
  showToast(isRandomMode ? 'Đã bật chế độ bài tập ngẫu nhiên 🎲' : 'Đã bật chế độ bài tập theo thứ tự 🔢');
};

// Toggle Pinyin hint
window.togglePinyinHint = function () {
  showPinyinHint = !showPinyinHint;
  const pinyinHintEl = document.getElementById('q-pinyin-hint-text');
  if (pinyinHintEl) {
    pinyinHintEl.style.display = showPinyinHint ? 'block' : 'none';
  }
};

// Pronounce Mandarin
window.speakTargetAnswer = function () {
  if (!currentQuestion || !('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(currentQuestion.answer);
  utter.lang = 'zh-CN';
  utter.rate = 0.88;
  window.speechSynthesis.speak(utter);
};

// Stats update & save
function saveStats() {
  localStorage.setItem('hongtai_reorder_streak', String(streak));
  localStorage.setItem('hongtai_reorder_correct', String(correctCount));
}

function updateStatsDisplay() {
  const streakEl = document.getElementById('stat-streak');
  if (streakEl) streakEl.textContent = `🔥 ${streak}`;

  const correctEl = document.getElementById('stat-correct');
  if (correctEl) correctEl.textContent = String(correctCount);
}

// Utility: Shuffle
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

// Utility: Escape HTML
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Utility: Toast
function showToast(msg) {
  let toast = document.getElementById('reorder-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'reorder-toast';
    toast.style.cssText = 'position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: rgba(15, 23, 42, 0.95); border: 1px solid rgba(56, 189, 248, 0.4); color: #fff; padding: 12px 24px; border-radius: 99px; font-weight: 700; font-size: 0.92rem; z-index: 99999; box-shadow: 0 10px 30px rgba(0,0,0,0.5); backdrop-filter: blur(10px); transition: all 0.3s ease; opacity: 0; pointer-events: none;';
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.opacity = '1';
  toast.style.transform = 'translateX(-50%) translateY(0)';
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(-50%) translateY(10px)';
  }, 2500);
}

// Keyboard shortcuts: Enter to check, ArrowRight to next, ArrowLeft to prev
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;

  if (e.key === 'Enter') {
    e.preventDefault();
    window.checkAnswer();
  } else if (e.key === 'ArrowRight') {
    e.preventDefault();
    window.nextQuestion();
  } else if (e.key === 'ArrowLeft') {
    e.preventDefault();
    window.prevQuestion();
  }
});

// Run on page load
initSentenceReorder();
