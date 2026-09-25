/**
 * Tiếng Trung HongTai - Luyện Dịch & Nghe Chép Đoạn Văn (1,665 Đoạn HSK 1 - 6)
 */

let allLessons = [];
let filteredLessons = [];
let currentLesson = null;
let currentIndex = 0;
let currentLevel = 'all';
let currentMode = 'translation'; // 'translation' | 'dictation'
let translationDirection = 'vi_to_zh'; // 'vi_to_zh' | 'zh_to_vi'
let playbackRate = 0.85;
let currentAudio = null;
let isAudioPlaying = false;
let isHintsVisible = false;

// User Statistics
let userStats = {
  translatedCount: 0,
  dictatedCount: 0,
  totalScore: 0
};

// Base URL helper
function getApiBase() {
  if (typeof window !== 'undefined') {
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return '';
    }
  }
  return '';
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', async () => {
  loadStoredStats();
  setupGlobalControls();
  await loadAllLessons();
});

// Load user stats from localStorage
function loadStoredStats() {
  try {
    const saved = localStorage.getItem('hongtai_paragraph_stats');
    if (saved) {
      userStats = Object.assign(userStats, JSON.parse(saved));
      updateStatsDisplay();
    }
  } catch (e) {
    console.warn('Failed to load stats:', e);
  }
}

function saveUserStats() {
  try {
    localStorage.setItem('hongtai_paragraph_stats', JSON.stringify(userStats));
    updateStatsDisplay();
  } catch (e) { }
}

function updateStatsDisplay() {
  const transCountEl = document.getElementById('stat-translated-count');
  if (transCountEl) transCountEl.textContent = userStats.translatedCount || 0;
  const dictCountEl = document.getElementById('stat-dictated-count');
  if (dictCountEl) dictCountEl.textContent = userStats.dictatedCount || 0;
}

// Fetch all 1,665 paragraph lessons
async function loadAllLessons() {
  const loadingEl = document.getElementById('loading-overlay');
  if (loadingEl) loadingEl.style.display = 'flex';

  try {
    const res = await fetch(`${getApiBase()}/api/paragraph-lessons?limit=2500`);
    if (!res.ok) throw new Error('Không thể tải danh sách bài học');
    const data = await res.json();
    allLessons = data.lessons || [];

    // Filter by initial level
    applyLevelFilter(currentLevel);

    // Update total count badges
    const totalCountEl = document.getElementById('total-lessons-stat');
    if (totalCountEl) totalCountEl.textContent = allLessons.length.toLocaleString('vi-VN');

    // Check URL parameters (e.g. ?level=2&mode=dictation)
    const urlParams = new URLSearchParams(window.location.search);
    const paramLvl = urlParams.get('level');
    const paramMode = urlParams.get('mode');
    if (paramLvl) switchLevel(paramLvl);
    if (paramMode && (paramMode === 'dictation' || paramMode === 'translation')) {
      switchMode(paramMode);
    }
  } catch (err) {
    console.error('Load lessons error:', err);
    if (typeof window.showToast === 'function') {
      window.showToast('Lỗi tải dữ liệu bài học từ máy chủ', true);
    }
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

// Level switching
window.switchLevel = function (lvl, btnEl) {
  currentLevel = lvl;
  applyLevelFilter(lvl);

  // Update tabs UI
  document.querySelectorAll('.level-tab-btn').forEach(btn => {
    btn.classList.remove('active');
  });
  if (btnEl) {
    btnEl.classList.add('active');
  } else {
    const targetBtn = document.querySelector(`.level-tab-btn[data-level="${lvl}"]`);
    if (targetBtn) targetBtn.classList.add('active');
  }
};

function applyLevelFilter(lvl) {
  if (!lvl || lvl === 'all') {
    filteredLessons = [...allLessons];
  } else {
    const lvlNum = parseInt(lvl, 10);
    filteredLessons = allLessons.filter(l => l.level === lvlNum);
  }

  currentIndex = 0;
  if (filteredLessons.length > 0) {
    currentLesson = filteredLessons[0];
    renderCurrentLesson();
  }
}

// Mode switching: 'translation' | 'dictation'
window.switchMode = function (mode) {
  currentMode = mode;
  stopAudio();

  const btnTrans = document.getElementById('mode-btn-translation');
  const btnDict = document.getElementById('mode-btn-dictation');
  const viewTrans = document.getElementById('view-translation-mode');
  const viewDict = document.getElementById('view-dictation-mode');

  if (mode === 'translation') {
    if (btnTrans) btnTrans.classList.add('active');
    if (btnDict) btnDict.classList.remove('active');
    if (viewTrans) viewTrans.style.display = 'block';
    if (viewDict) viewDict.style.display = 'none';
  } else {
    if (btnDict) btnDict.classList.add('active');
    if (btnTrans) btnTrans.classList.remove('active');
    if (viewDict) viewDict.style.display = 'block';
    if (viewTrans) viewTrans.style.display = 'none';
  }

  renderCurrentLesson();
};

// Direction switching for translation: 'vi_to_zh' | 'zh_to_vi'
window.switchTranslationDirection = function (dir) {
  translationDirection = dir;
  const btnViZh = document.getElementById('dir-btn-vi-zh');
  const btnZhVi = document.getElementById('dir-btn-zh-vi');
  if (dir === 'vi_to_zh') {
    if (btnViZh) btnViZh.classList.add('active');
    if (btnZhVi) btnZhVi.classList.remove('active');
  } else {
    if (btnZhVi) btnZhVi.classList.add('active');
    if (btnViZh) btnViZh.classList.remove('active');
  }

  // Clear previous outputs
  resetTranslationInputs();
  renderCurrentLesson();
};

// Render current lesson
function renderCurrentLesson() {
  if (!currentLesson) return;

  // Header meta badges
  const metaBadge = document.getElementById('lesson-meta-badge');
  if (metaBadge) {
    metaBadge.textContent = `${currentLesson.levelText} • Bài ${currentIndex + 1}/${filteredLessons.length}`;
  }

  const wordCountBadge = document.getElementById('lesson-wordcount-badge');
  if (wordCountBadge) {
    wordCountBadge.textContent = `${currentLesson.wordCount} chữ Hán`;
  }

  // Render based on current mode
  if (currentMode === 'translation') {
    renderTranslationView();
  } else {
    renderDictationView();
  }
}

// -------------------------------------------------------------
// CHẾ ĐỘ 1: LUYỆN DỊCH
// -------------------------------------------------------------
function renderTranslationView() {
  resetTranslationInputs();

  const isViToZh = translationDirection === 'vi_to_zh';
  const promptTextEl = document.getElementById('translation-prompt-text');
  const promptLabelEl = document.getElementById('translation-prompt-label');
  const targetInputEl = document.getElementById('translation-user-input');

  if (promptLabelEl) {
    promptLabelEl.innerHTML = isViToZh
      ? '<i class="fa-solid fa-flag"></i> Đề bài gốc (Tiếng Việt) &rarr; Dịch sang Tiếng Trung:'
      : '<i class="fa-solid fa-language"></i> Đề bài gốc (Tiếng Trung) &rarr; Dịch sang Tiếng Việt:';
  }

  if (promptTextEl) {
    promptTextEl.textContent = isViToZh ? currentLesson.vi : currentLesson.zh;
    promptTextEl.className = isViToZh ? 'prompt-display-text text-vietnamese' : 'prompt-display-text text-chinese';
  }

  if (targetInputEl) {
    targetInputEl.placeholder = isViToZh
      ? 'Gõ bản dịch bằng Tiếng Trung tại đây (sử dụng bàn phím Pinyin gõ chữ Hán)...'
      : 'Gõ bản dịch bằng Tiếng Việt của bạn tại đây...';
  }

  // Hints box
  const hintsBox = document.getElementById('translation-hints-box');
  if (hintsBox) {
    hintsBox.style.display = 'none';
    isHintsVisible = false;
    const hintsContent = document.getElementById('translation-hints-content');
    if (hintsContent) {
      hintsContent.innerHTML = `
        <div style="margin-bottom: 8px;">
          <span style="font-weight: 800; color: #a855f7;">Phiên âm Pinyin:</span>
          <span class="pinyin-text" style="color: #cbd5e1; margin-left: 6px;">${currentLesson.pinyin}</span>
        </div>
        <div style="font-size: 0.88rem; color: #94a3b8;">
          <span style="font-weight: 800; color: #38bdf8;">Độ dài gợi ý:</span> Khoảng ${currentLesson.wordCount} chữ Hán.
        </div>
      `;
    }
  }

  // Audio button for Chinese text
  const audioBtn = document.getElementById('trans-prompt-audio-btn');
  if (audioBtn) {
    audioBtn.style.display = isViToZh ? 'none' : 'inline-flex';
  }
}

function resetTranslationInputs() {
  const inputEl = document.getElementById('translation-user-input');
  if (inputEl) inputEl.value = '';
  const resultCard = document.getElementById('translation-result-card');
  if (resultCard) resultCard.style.display = 'none';
  const aiResultCard = document.getElementById('translation-ai-card');
  if (aiResultCard) aiResultCard.style.display = 'none';
}

window.toggleTranslationHints = function () {
  const hintsBox = document.getElementById('translation-hints-box');
  if (!hintsBox) return;
  isHintsVisible = !isHintsVisible;
  hintsBox.style.display = isHintsVisible ? 'block' : 'none';
};

// Check translation against model answer
window.checkTranslationAnswer = function () {
  if (!currentLesson) return;
  const inputEl = document.getElementById('translation-user-input');
  const userText = (inputEl ? inputEl.value : '').trim();

  if (!userText) {
    if (typeof window.showToast === 'function') {
      window.showToast('Vui lòng gõ bản dịch của bạn trước khi kiểm tra nhé!', true);
    }
    return;
  }

  const isViToZh = translationDirection === 'vi_to_zh';
  const standardText = isViToZh ? currentLesson.zh : currentLesson.vi;

  const resultCard = document.getElementById('translation-result-card');
  const modelTextEl = document.getElementById('trans-model-answer-text');
  const modelPinyinEl = document.getElementById('trans-model-pinyin');
  const comparisonDiffEl = document.getElementById('trans-comparison-diff');

  if (modelTextEl) modelTextEl.textContent = standardText;
  if (modelPinyinEl) {
    if (isViToZh) {
      modelPinyinEl.textContent = currentLesson.pinyin;
      modelPinyinEl.style.display = 'block';
    } else {
      modelPinyinEl.style.display = 'none';
    }
  }

  // Compute character-based similarity / diff
  if (comparisonDiffEl) {
    comparisonDiffEl.innerHTML = generateDiffHtml(userText, standardText, isViToZh);
  }

  if (resultCard) {
    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Update stats
  userStats.translatedCount = (userStats.translatedCount || 0) + 1;
  saveUserStats();
};

// AI Grading & Feedback
window.requestAiTranslationGrading = async function () {
  if (!currentLesson) return;
  const inputEl = document.getElementById('translation-user-input');
  const userText = (inputEl ? inputEl.value : '').trim();

  if (!userText) {
    if (typeof window.showToast === 'function') {
      window.showToast('Vui lòng nhập bài dịch trước khi gọi AI chấm nhé!', true);
    }
    return;
  }

  const aiBtn = document.getElementById('ai-grade-trans-btn');
  const originalBtnHtml = aiBtn ? aiBtn.innerHTML : '';
  if (aiBtn) {
    aiBtn.disabled = true;
    aiBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> AI đang phân tích bài dịch...';
  }

  try {
    const res = await fetch(`${getApiBase()}/api/ai/grade-translation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        originalZh: currentLesson.zh,
        originalVi: currentLesson.vi,
        userTranslation: userText,
        direction: translationDirection,
        level: currentLesson.level
      })
    });

    if (!res.ok) throw new Error('AI chấm bài tạm thời gián đoạn');
    const data = await res.json();

    renderAiGradingResult(data);
  } catch (err) {
    console.error('AI grading error:', err);
    if (typeof window.showToast === 'function') {
      window.showToast('Không thể kết nối dịch vụ AI, vui lòng thử lại sau', true);
    }
  } finally {
    if (aiBtn) {
      aiBtn.disabled = false;
      aiBtn.innerHTML = originalBtnHtml;
    }
  }
};

function renderAiGradingResult(data) {
  const card = document.getElementById('translation-ai-card');
  if (!card) return;

  const scoreEl = document.getElementById('ai-score-num');
  const badgeEl = document.getElementById('ai-score-badge');
  const commentEl = document.getElementById('ai-general-comment');
  const improvementsListEl = document.getElementById('ai-improvements-list');
  const alternativeEl = document.getElementById('ai-alternative-version');

  if (scoreEl) scoreEl.textContent = data.score || 85;
  if (badgeEl) badgeEl.textContent = data.badge || 'Rất Tốt 👏';
  if (commentEl) commentEl.textContent = data.comment || 'Bài dịch truyền tải tốt nội dung!';

  if (improvementsListEl) {
    improvementsListEl.innerHTML = '';
    if (data.improvements && data.improvements.length > 0) {
      data.improvements.forEach(item => {
        const li = document.createElement('li');
        li.style.marginBottom = '8px';
        li.innerHTML = `
          <strong style="color: #f87171;">"${item.issue || ''}"</strong> &rarr; 
          <strong style="color: #34d399;">"${item.suggestion || ''}"</strong>: 
          <span style="color: #cbd5e1;">${item.explanation || ''}</span>
        `;
        improvementsListEl.appendChild(li);
      });
    } else {
      improvementsListEl.innerHTML = '<li style="color: #34d399;"><i class="fa-solid fa-circle-check"></i> Bản dịch rất chuẩn xác, không có lỗi ngữ pháp đáng kể!</li>';
    }
  }

  if (alternativeEl) {
    if (data.alternativePhrasings && data.alternativePhrasings.length > 0) {
      alternativeEl.textContent = `Cách diễn đạt khác: "${data.alternativePhrasings[0]}"`;
      alternativeEl.style.display = 'block';
    } else {
      alternativeEl.style.display = 'none';
    }
  }

  card.style.display = 'block';
  card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// -------------------------------------------------------------
// CHẾ ĐỘ 2: NGHE CHÉP CHÍNH TẢ ĐOẠN VĂN (DICTATION)
// -------------------------------------------------------------
function renderDictationView() {
  resetDictationInputs();

  // Render individual sentence chips
  const sentencesListEl = document.getElementById('dict-sentences-chips');
  if (sentencesListEl) {
    sentencesListEl.innerHTML = '';
    if (currentLesson.sentences && currentLesson.sentences.length > 0) {
      currentLesson.sentences.forEach((s, idx) => {
        const chip = document.createElement('button');
        chip.className = 'sentence-chip-btn';
        chip.innerHTML = `<i class="fa-solid fa-volume-high"></i> Câu ${idx + 1}`;
        chip.title = 'Bấm để nghe riêng câu này';
        chip.onclick = () => playSingleSentence(s.zh);
        sentencesListEl.appendChild(chip);
      });
    }
  }
}

function resetDictationInputs() {
  const inputEl = document.getElementById('dictation-user-input');
  if (inputEl) inputEl.value = '';
  const resultCard = document.getElementById('dictation-result-card');
  if (resultCard) resultCard.style.display = 'none';
}

window.checkDictationAnswer = function () {
  if (!currentLesson) return;
  const inputEl = document.getElementById('dictation-user-input');
  const userText = (inputEl ? inputEl.value : '').trim();

  if (!userText) {
    if (typeof window.showToast === 'function') {
      window.showToast('Vui lòng nghe audio và gõ nội dung trước khi kiểm tra nhé!', true);
    }
    return;
  }

  const targetZh = currentLesson.zh;
  const { accuracy, html } = calculateDictationAccuracy(userText, targetZh);

  const resultCard = document.getElementById('dictation-result-card');
  const accuracyNumEl = document.getElementById('dict-accuracy-percent');
  const diffBoxEl = document.getElementById('dict-diff-display');
  const fullHanziEl = document.getElementById('dict-full-hanzi');
  const fullPinyinEl = document.getElementById('dict-full-pinyin');
  const fullViEl = document.getElementById('dict-full-vi');

  if (accuracyNumEl) accuracyNumEl.textContent = `${accuracy}%`;
  if (diffBoxEl) diffBoxEl.innerHTML = html;
  if (fullHanziEl) fullHanziEl.textContent = targetZh;
  if (fullPinyinEl) fullPinyinEl.textContent = currentLesson.pinyin;
  if (fullViEl) fullViEl.textContent = currentLesson.vi;

  if (resultCard) {
    resultCard.style.display = 'block';
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  // Update stats
  userStats.dictatedCount = (userStats.dictatedCount || 0) + 1;
  saveUserStats();
};

// Calculate accuracy and color characters
function calculateDictationAccuracy(userText, targetText) {
  const cleanTarget = targetText.replace(/[\s\p{P}]/gu, '');
  const cleanUser = userText.replace(/[\s\p{P}]/gu, '');

  let matches = 0;
  let diffHtml = '';

  const targetChars = Array.from(cleanTarget);
  const userChars = Array.from(cleanUser);

  targetChars.forEach((char, idx) => {
    if (userChars[idx] === char) {
      matches++;
      diffHtml += `<span class="char-correct" title="Chính xác">${char}</span>`;
    } else if (userChars[idx]) {
      diffHtml += `<span class="char-wrong" title="Bạn gõ: ${userChars[idx]} (Đúng là: ${char})">${char}</span>`;
    } else {
      diffHtml += `<span class="char-missing" title="Thiếu chữ này">${char}</span>`;
    }
  });

  const accuracy = cleanTarget.length > 0
    ? Math.min(100, Math.round((matches / cleanTarget.length) * 100))
    : 100;

  return { accuracy, html: diffHtml };
}

// Diff visualizer for translation
function generateDiffHtml(userText, standardText, isChinese) {
  return `
    <div style="display: flex; flex-direction: column; gap: 8px;">
      <div>
        <span style="font-size: 0.8rem; font-weight: 700; color: #94a3b8;">Bản dịch của bạn:</span>
        <div style="color: #cbd5e1; font-size: 1.05rem; padding: 6px 0;">${escapeHtml(userText)}</div>
      </div>
      <div>
        <span style="font-size: 0.8rem; font-weight: 700; color: #10b981;">Đáp án mẫu chuẩn:</span>
        <div style="color: #34d399; font-weight: 800; font-size: 1.08rem; padding: 6px 0;">${escapeHtml(standardText)}</div>
      </div>
    </div>
  `;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// -------------------------------------------------------------
// AUDIO PLAYER ENGINE
// -------------------------------------------------------------
window.playParagraphAudio = function () {
  if (!currentLesson || !currentLesson.zh) return;
  if (isAudioPlaying) {
    stopAudio();
    return;
  }
  playTextAudio(currentLesson.zh);
};

window.playPromptAudio = function () {
  if (!currentLesson || !currentLesson.zh) return;
  playTextAudio(currentLesson.zh);
};

function playSingleSentence(sentenceZh) {
  stopAudio();
  playTextAudio(sentenceZh);
}

function playTextAudio(text) {
  if (!text) return;
  stopAudio();

  const playBtnIcon = document.getElementById('dict-play-btn-icon');
  const playBtnText = document.getElementById('dict-play-btn-text');
  const soundWave = document.getElementById('dict-sound-wave');

  // Try Server Baidu / Edge TTS first
  const audioUrl = `${getApiBase()}/api/tts?text=${encodeURIComponent(text)}&voice=baidu-female&speed=3`;
  const audio = new Audio(audioUrl);
  audio.playbackRate = playbackRate;
  currentAudio = audio;
  isAudioPlaying = true;

  if (playBtnIcon) playBtnIcon.className = 'fa-solid fa-pause';
  if (playBtnText) playBtnText.textContent = 'Tạm dừng';
  if (soundWave) soundWave.classList.add('playing');

  audio.onended = () => {
    stopAudio();
  };

  audio.onerror = () => {
    // Fallback to browser SpeechSynthesis
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = playbackRate;
      utterance.onend = () => stopAudio();
      utterance.onerror = () => stopAudio();
      window.speechSynthesis.speak(utterance);
    } else {
      stopAudio();
    }
  };

  audio.play().catch(e => {
    console.warn('Audio play failed, using fallback TTS:', e);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'zh-CN';
      utterance.rate = playbackRate;
      utterance.onend = () => stopAudio();
      utterance.onerror = () => stopAudio();
      window.speechSynthesis.speak(utterance);
    } else {
      stopAudio();
    }
  });
}

function stopAudio() {
  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch (e) { }
    currentAudio = null;
  }
  if ('speechSynthesis' in window) {
    try { window.speechSynthesis.cancel(); } catch (e) { }
  }
  isAudioPlaying = false;

  const playBtnIcon = document.getElementById('dict-play-btn-icon');
  const playBtnText = document.getElementById('dict-play-btn-text');
  const soundWave = document.getElementById('dict-sound-wave');

  if (playBtnIcon) playBtnIcon.className = 'fa-solid fa-play';
  if (playBtnText) playBtnText.textContent = 'Nghe toàn bài';
  if (soundWave) soundWave.classList.remove('playing');
}

window.setPlaybackRate = function (rate, btnEl) {
  playbackRate = parseFloat(rate) || 0.85;
  if (currentAudio) currentAudio.playbackRate = playbackRate;

  document.querySelectorAll('.speed-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
};

window.replayLastFewSeconds = function () {
  if (currentAudio) {
    currentAudio.currentTime = Math.max(0, currentAudio.currentTime - 4);
    if (!isAudioPlaying) currentAudio.play();
  } else {
    playParagraphAudio();
  }
};

// -------------------------------------------------------------
// NAVIGATION: NEXT / PREV / RANDOM
// -------------------------------------------------------------
window.nextLesson = function () {
  stopAudio();
  if (filteredLessons.length === 0) return;
  currentIndex = (currentIndex + 1) % filteredLessons.length;
  currentLesson = filteredLessons[currentIndex];
  renderCurrentLesson();
};

window.prevLesson = function () {
  stopAudio();
  if (filteredLessons.length === 0) return;
  currentIndex = (currentIndex - 1 + filteredLessons.length) % filteredLessons.length;
  currentLesson = filteredLessons[currentIndex];
  renderCurrentLesson();
};

window.randomLesson = function () {
  stopAudio();
  if (filteredLessons.length === 0) return;
  const randIdx = Math.floor(Math.random() * filteredLessons.length);
  currentIndex = randIdx;
  currentLesson = filteredLessons[currentIndex];
  renderCurrentLesson();
};

// Global controls & Theme toggle
function setupGlobalControls() {
  // Theme toggle helper
  window.toggleTheme = function () {
    const isLight = document.documentElement.classList.contains('light-mode') || document.documentElement.classList.contains('light');
    const nextDark = isLight;
    const bgUrl = nextDark ? "url('/assets/app_bg_night_v3.png')" : "url('/assets/app_bg_day_v3.png')";

    document.documentElement.style.setProperty('background-image', bgUrl, 'important');
    if (document.body) document.body.style.setProperty('background-image', bgUrl, 'important');

    if (nextDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light', 'light-mode');
      if (document.body) {
        document.body.classList.remove('light-mode', 'light');
        document.body.classList.add('dark');
      }
      localStorage.setItem('theme', 'dark');
      updateThemeToggleIcons(false);
    } else {
      document.documentElement.classList.add('light', 'light-mode');
      document.documentElement.classList.remove('dark');
      if (document.body) {
        document.body.classList.remove('dark');
        document.body.classList.add('light-mode');
      }
      localStorage.setItem('theme', 'light');
      updateThemeToggleIcons(true);
    }
  };

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    // Ctrl + Enter to submit check
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      if (currentMode === 'translation') {
        checkTranslationAnswer();
      } else {
        checkDictationAnswer();
      }
    }
  });
}

function updateThemeToggleIcons(isLight) {
  document.querySelectorAll('.theme-toggle-btn').forEach(btn => {
    btn.innerHTML = isLight ? '<i class="fa-solid fa-moon"></i>' : '<i class="fa-solid fa-sun"></i>';
    btn.setAttribute('title', isLight ? 'Chuyển sang Chế độ Tối' : 'Chuyển sang Chế độ Sáng');
  });
}
