import { DICTATION_LESSONS } from './dictation_data.js';
import './particles.js';
/**
 * Tiếng Trung HongTai - Video Dictation Engine (Luyện Nghe Chép Chính Tả Video)
 * Architecture inspired by eJOY / DailyDictation / LingoClip
 */

// Global State
let allLessons = [];
let filteredLessons = [];
let currentLesson = null;
let currentSentenceIdx = 0;
let currentMode = 'shadowing'; // 'shadowing' | 'dictation' | 'dubbing'
let currentSpeed = 0.85;
let autoPauseEnabled = true;
let isVideoBlurred = false;
let isVideoHidden = false;
let userAnswers = {}; // { sentenceId: { isCorrect, score, userAnswer, blanks: [] } }
let totalScore = 0;
let currentStreak = 0;

// Subtitles & Shadowing Visibility State
let shadowHidePinyin = false;
let shadowHideHanzi = false;
let shadowHideMeaning = false;
let shadowSubMode = 'sentence'; // 'sentence' | 'passage'
let shadowPassageHidePinyin = false;
let shadowPassageHideMeaning = false;
let transcriptHidePinyin = false;
let transcriptHideMeaning = false;
let selectedDubRole = 'all';

// Audio Recording & Pronunciation Assessment State
let isRecording = false;
let mediaRecorder = null;
let audioChunks = [];
let userRecordedBlob = null;
let userRecordedAudioUrl = null;
let activeRecognition = null;
let recognizedTranscript = '';
let recordingTimerInterval = null;
let recordingSeconds = 0;
let dubbingVideoSyncPlaying = false;
let dubbingPreviewPlaying = false;
let dubbingPreviewAudio = null;

// Passage Recording State
let isPassageRecording = false;
let passageMediaRecorder = null;
let passageAudioChunks = [];
let passageRecordedBlob = null;
let passageRecordedAudioUrl = null;
let passageActiveRecognition = null;
let passageRecognizedTranscript = '';
let passageRecordingTimerInterval = null;
let passageRecordingSeconds = 0;

// YouTube Player Instance & Polling
let ytPlayer = null;
let isPlayerReady = false;
let playbackWatcher = null;
let isSentencePlaying = false;
let lastPausedSentenceIdx = -1;
let activeHanziWriter = null;

// Built-in Fallback Lessons Data
// Built-in 8 Lessons from Excel + YouTube
const DEFAULT_LESSONS = DICTATION_LESSONS;

// Helper: Normalize String for comparison
function cleanStr(s) {
  if (!s) return '';
  return s.toString().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // Remove accents if pinyin
    .replace(/[，。？！, .?!'’"“”：:]/g, "")
    .trim();
}

// Helper: Extract speaker prefix (e.g. "妈妈：" or "小初:" or "A:" or "Mẹ:")
function parseSpeakerAndText(text) {
  if (!text) return { speaker: '', text: '' };
  const str = text.trim();
  // Match các dạng dấu 2 chấm: ASCII :, full-width ：, middle dot ·, và khoảng trắng đặc biệt
  const match = str.match(/^([^\uff1a:\n]{1,15})[\uff1a:]\s*(.+)$/s);
  if (match) {
    const spk = match[1].trim();
    const txt = match[2].trim();
    // Chỉ nhận dạng speaker nếu phần trước dấu : ngắn hợp lý (không phải cả câu)
    if (spk.length >= 1 && spk.length <= 10 && txt.length > 0) {
      return { speaker: spk, text: txt };
    }
  }
  return { speaker: '', text: str };
}

// Helper: Extract speaker and clean content for a sentence across Hanzi, Pinyin, and Vietnamese Meaning
function getSentenceDisplayInfo(sent) {
  if (!sent) return { speaker: '', rawHanzi: '', rawPinyin: '', rawMeaning: '', cleanHanzi: '', cleanPinyin: '', cleanMeaning: '' };
  const parsedHanzi = parseSpeakerAndText(sent.hanzi);
  const parsedPinyin = parseSpeakerAndText(sent.pinyin);
  const parsedMeaning = parseSpeakerAndText(sent.meaning);

  const speaker = parsedHanzi.speaker || parsedMeaning.speaker || parsedPinyin.speaker || '';
  let cleanHanzi = parsedHanzi.text || sent.hanzi || '';
  let cleanPinyin = parsedPinyin.text || sent.pinyin || '';
  let cleanMeaning = parsedMeaning.text || sent.meaning || '';

  // Bỏ các chú thích hành động/âm thanh trong ngoặc đơn nếu có (như （大哭）, (Khóc), （独白）) và dấu chấm lửng
  const hanziWithoutBracket = cleanHanzi.replace(/（[^）]*）|\([^)]*\)/g, '').replace(/[……\.]{2,}/g, '').trim();
  if (hanziWithoutBracket.length > 0) {
    cleanHanzi = hanziWithoutBracket;
    cleanPinyin = cleanPinyin.replace(/（[^）]*）|\([^)]*\)/g, '').replace(/[……\.]{2,}/g, '').trim();
    cleanMeaning = cleanMeaning.replace(/（[^）]*）|\([^)]*\)/g, '').replace(/[……\.]{2,}/g, '').trim();
  }

  return {
    speaker,
    rawHanzi: sent.hanzi || '',
    rawPinyin: sent.pinyin || '',
    rawMeaning: sent.meaning || '',
    cleanHanzi,
    cleanPinyin,
    cleanMeaning
  };
}

// Toast notification
function showToast(msg, isError = false) {
  let toast = document.getElementById('dict-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'dict-toast';
    toast.style.cssText = 'position: fixed; bottom: 24px; right: 24px; padding: 14px 22px; border-radius: 12px; font-weight: 700; font-size: 0.95rem; z-index: 999999; box-shadow: 0 10px 30px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 10px; transition: all 0.3s ease;';
    document.body.appendChild(toast);
  }
  toast.style.background = isError ? 'rgba(239, 68, 68, 0.95)' : 'rgba(16, 185, 129, 0.95)';
  toast.style.color = '#ffffff';
  toast.innerHTML = `<i class="fa-solid ${isError ? 'fa-triangle-exclamation' : 'fa-circle-check'}"></i> <span>${msg}</span>`;
  toast.style.opacity = '1';
  toast.style.transform = 'translateY(0)';
  clearTimeout(window._dictToastTimer);
  window._dictToastTimer = setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
  }, 2500);
}

// Audio Player: Baidu TTS with Google TTS & Web Speech fallback
function speakChinese(text) {
  if (!text) return;
  const clean = text.replace(/[^\u4e00-\u9fa5a-zA-Z0-9\s，。！？、…]/g, '').trim();
  if (!clean) return;

  function useWebSpeech() {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(clean);
    u.lang = 'zh-CN';
    u.rate = 0.82;
    u.pitch = 1.05;
    // Prefer a Mandarin voice if available
    const voices = window.speechSynthesis.getVoices();
    const mandarinVoice = voices.find(v =>
      v.lang.toLowerCase().startsWith('zh') ||
      v.name.toLowerCase().includes('chinese') ||
      v.name.toLowerCase().includes('mandarin')
    );
    if (mandarinVoice) u.voice = mandarinVoice;
    window.speechSynthesis.speak(u);
  }

  // Try backend TTS first, fallback to Web Speech
  const audioUrl = `/api/tts?text=${encodeURIComponent(clean)}&voice=baidu-female`;
  const audio = new Audio(audioUrl);
  audio.playbackRate = 0.9;
  const playPromise = audio.play();
  if (playPromise) {
    playPromise.catch(() => useWebSpeech());
  }
}

// Convenience: speak the current lesson's sentence (used by inline onclick in HTML)
function speakCurrentSentence() {
  const sent = currentLesson?.sentences?.[currentSentenceIdx];
  if (sent) {
    const info = getSentenceDisplayInfo(sent);
    speakChinese(info.cleanHanzi);
  } else {
    showToast('Vui lòng chọn một bài học trước!', true);
  }
}

// ==========================================
// YOUTUBE PLAYER API INITIALIZATION
// ==========================================

function initYouTubeAPI() {
  if (window.YT && window.YT.Player) {
    return;
  }
  const tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  const firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
}

window.onYouTubeIframeAPIReady = function () {
  console.log("YouTube IFrame API Ready");
};

function setupPlayerForVideo(youtubeId) {
  if (ytPlayer && ytPlayer.destroy) {
    try { ytPlayer.destroy(); } catch (e) { console.warn(e); }
  }

  isPlayerReady = false;
  ytPlayer = new YT.Player('yt-video-embed', {
    videoId: youtubeId,
    playerVars: {
      autoplay: 0,
      controls: 1,
      rel: 0,
      modestbranding: 1,
      fs: 1,
      playsinline: 1,
      enablejsapi: 1,
      origin: window.location.origin
    },
    events: {
      onReady: (event) => {
        isPlayerReady = true;
        ytPlayer.setPlaybackRate(currentSpeed);
        console.log("YouTube Player is Ready.");
        // Play the first sentence on load
        playCurrentSentence();
      },
      onStateChange: (event) => {
        // YT.PlayerState.PLAYING = 1
        if (event.data === 1) {
          startPlaybackWatcher();
        } else {
          stopPlaybackWatcher();
        }
      }
    }
  });
}

function startPlaybackWatcher() {
  stopPlaybackWatcher();

  function updateFrame() {
    if (ytPlayer && ytPlayer.getCurrentTime && currentLesson && currentLesson.sentences && currentLesson.sentences.length > 0) {
      try {
        const curTime = ytPlayer.getCurrentTime();

        // 1. Detect active sentence from curTime if video is playing continuously
        let activeIdx = currentLesson.sentences.findIndex(s => curTime >= s.startTime - 0.05 && curTime < s.endTime);
        if (activeIdx === -1) {
          const nextIdx = currentLesson.sentences.findIndex(s => s.startTime > curTime);
          if (nextIdx > 0 && curTime >= currentLesson.sentences[nextIdx - 1].endTime) {
            activeIdx = nextIdx - 1;
          } else if (nextIdx === -1 && curTime >= currentLesson.sentences[currentLesson.sentences.length - 1].startTime) {
            activeIdx = currentLesson.sentences.length - 1;
          }
        }

        // 2. Auto sync currentSentenceIdx when playing continuously
        if (activeIdx !== -1 && activeIdx !== currentSentenceIdx) {
          currentSentenceIdx = activeIdx;
          lastPausedSentenceIdx = -1; // Reset pause guard for new sentence
          renderCurrentSentence();
        }

        // 3. Highlight transcript and passage
        updateSubtitleHighlight(curTime);
        updateShadowPassageHighlight(curTime);

        // 4. Real-time Dubbing Karaoke & Pacing
        if (currentMode === 'dubbing' && (dubbingVideoSyncPlaying || dubbingPreviewPlaying)) {
          updateDubbingKaraoke(curTime);
        }

        // 5. Auto pause at the end of each sentence
        const isPassageMode = (currentMode === 'shadowing' && shadowSubMode === 'passage');
        if (autoPauseEnabled && !isPassageMode && currentLesson.sentences[currentSentenceIdx]) {
          const curSent = currentLesson.sentences[currentSentenceIdx];
          if (curTime >= curSent.endTime - 0.08 && lastPausedSentenceIdx !== currentSentenceIdx) {
            ytPlayer.pauseVideo();
            lastPausedSentenceIdx = currentSentenceIdx;
            isSentencePlaying = false;
            stopPlaybackWatcher();
            return;
          }
        }

        // 6. Dubbing recording auto-stop when reaching sentence end
        if (dubbingVideoSyncPlaying && currentLesson.sentences[currentSentenceIdx]) {
          const curSent = currentLesson.sentences[currentSentenceIdx];
          if (curTime >= curSent.endTime) {
            stopRecordingAudio();
            return;
          }
        }

        // 7. Dubbing preview auto-stop when reaching sentence end
        if (dubbingPreviewPlaying && currentLesson.sentences[currentSentenceIdx]) {
          const curSent = currentLesson.sentences[currentSentenceIdx];
          if (curTime >= curSent.endTime) {
            stopDubbingPreview();
            return;
          }
        }

      } catch (e) {
        console.warn("Watcher frame error:", e);
      }
    }

    if (ytPlayer && ytPlayer.getPlayerState) {
      const state = ytPlayer.getPlayerState();
      if (state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING) {
        playbackWatcher = requestAnimationFrame(updateFrame);
        return;
      }
    }
    playbackWatcher = null;
  }

  playbackWatcher = requestAnimationFrame(updateFrame);
}

function stopPlaybackWatcher() {
  if (playbackWatcher) {
    if (typeof playbackWatcher === 'number') {
      cancelAnimationFrame(playbackWatcher);
    } else {
      clearInterval(playbackWatcher);
    }
    playbackWatcher = null;
  }
}

function playCurrentSentence() {
  if (!currentLesson || !currentLesson.sentences[currentSentenceIdx]) return;
  const sentence = currentLesson.sentences[currentSentenceIdx];
  if (ytPlayer && ytPlayer.seekTo) {
    ytPlayer.seekTo(sentence.startTime, true);
    ytPlayer.setPlaybackRate(currentSpeed);
    ytPlayer.playVideo();
    isSentencePlaying = true;
    startPlaybackWatcher();
  }
}

function replaySnippet() {
  playCurrentSentence();
  showToast("Đang phát lại câu hiện tại 🔁");
}

function setPlaybackSpeed(rate) {
  currentSpeed = parseFloat(rate) || 1.0;
  if (ytPlayer && ytPlayer.setPlaybackRate) {
    ytPlayer.setPlaybackRate(currentSpeed);
  }
  document.querySelectorAll('.speed-pill').forEach(btn => {
    btn.classList.toggle('active', parseFloat(btn.dataset.speed) === currentSpeed);
  });
  showToast(`Tốc độ phát: ${currentSpeed}x`);
}

function toggleAutoPause() {
  autoPauseEnabled = !autoPauseEnabled;
  const btn = document.getElementById('toggle-autopause-btn');
  if (btn) {
    btn.classList.toggle('active', autoPauseEnabled);
    btn.innerHTML = autoPauseEnabled
      ? '<i class="fa-solid fa-pause"></i> <span>Tự Dừng Câu: BẬT</span>'
      : '<i class="fa-solid fa-play"></i> <span>Tự Dừng Câu: TẮT</span>';
  }
  showToast(autoPauseEnabled ? "Đã BẬT tự động dừng ở cuối mỗi câu" : "Đã TẮT tự động dừng (Video chạy liên tục)");
}

function toggleVideoBlur() {
  isVideoBlurred = !isVideoBlurred;
  const wrapper = document.getElementById('yt-video-embed');
  const btn = document.getElementById('toggle-blur-btn');
  if (wrapper) {
    wrapper.style.filter = isVideoBlurred ? 'blur(16px)' : 'none';
  }
  if (btn) {
    btn.classList.toggle('active', isVideoBlurred);
    btn.innerHTML = isVideoBlurred
      ? '<i class="fa-solid fa-eye-slash"></i> <span>Làm Mờ Video: BẬT</span>'
      : '<i class="fa-solid fa-eye"></i> <span>Làm Mờ Video: TẮT</span>';
  }
  showToast(isVideoBlurred ? "Đã làm mờ video để tập trung luyện nghe" : "Đã hiển thị lại video rõ nét");
}

// ==========================================
// WORKSPACE & 3 MODES INTERACTIVE LOGIC
// ==========================================

function toggleHideVideo(checked) {
  isVideoHidden = !!checked;
  const curtain = document.getElementById('yt-video-curtain');
  if (curtain) {
    curtain.style.display = isVideoHidden ? 'flex' : 'none';
  }
  showToast(isVideoHidden ? "Đã bật chế độ luyện nghe (Ẩn màn hình video)" : "Đã hiển thị lại video");
}

function toggleShadowPinyin(checked) {
  shadowHidePinyin = !!checked;
  renderShadowingPanel(currentLesson?.sentences?.[currentSentenceIdx]);
}

function toggleShadowHanzi(checked) {
  shadowHideHanzi = !!checked;
  renderShadowingPanel(currentLesson?.sentences?.[currentSentenceIdx]);
}

function toggleShadowMeaning(checked) {
  shadowHideMeaning = !!checked;
  renderShadowingPanel(currentLesson?.sentences?.[currentSentenceIdx]);
}

function toggleTranscriptPinyin(checked) {
  transcriptHidePinyin = !!checked;
  renderTranscriptList();
}

function toggleTranscriptMeaning(checked) {
  transcriptHideMeaning = !!checked;
  renderTranscriptList();
}

function selectDubRole(role) {
  selectedDubRole = role;
  const roleDisplay = document.getElementById('dubbing-role-display');
  if (roleDisplay) {
    const map = {
      'role_a': 'Nhân vật A (Chính)',
      'role_b': 'Nhân vật B (Đối thoại)',
      'all': 'Tất cả nhân vật'
    };
    roleDisplay.textContent = map[role] || 'Nhân vật A';
  }
}

function toggleSideCard(cardId) {
  const card = document.getElementById(cardId);
  if (card) {
    card.classList.toggle('collapsed');
  }
}

function renderLessonVocabNotes() {
  const container = document.getElementById('lesson-vocab-notes-list');
  if (!container || !currentLesson) return;

  container.innerHTML = '';
  const items = [];

  // 1. Parse currentLesson.note if present
  if (currentLesson.note && currentLesson.note.trim()) {
    const lines = currentLesson.note.split('\n').map(l => l.trim()).filter(Boolean);
    lines.forEach(line => {
      const cleanLine = line.replace(/^[-*•]\s*/, '').trim();
      const match = cleanLine.match(/^([^\(:\-]+)(?:\s*\(([^)]+)\))?\s*[:\-–]\s*(.+)$/);
      if (match) {
        items.push({
          word: match[1].trim(),
          pinyin: match[2] ? match[2].trim() : '',
          meaning: match[3].trim()
        });
      } else {
        items.push({
          word: cleanLine.slice(0, 8),
          pinyin: '',
          meaning: cleanLine
        });
      }
    });
  }

  // 2. If no items from note, aggregate unique keywords from sentences
  if (items.length === 0 && currentLesson.sentences) {
    const seen = new Set();
    currentLesson.sentences.forEach(s => {
      if (Array.isArray(s.keywords)) {
        s.keywords.forEach(kw => {
          const kClean = kw.trim();
          if (kClean && !seen.has(kClean)) {
            seen.add(kClean);
            items.push({
              word: kClean,
              pinyin: '',
              meaning: `Trích xuất từ câu: "${s.meaning}"`
            });
          }
        });
      }
    });
  }

  if (items.length === 0) {
    container.innerHTML = `
      <div style="padding: 14px; text-align: center; color: var(--text-muted); font-size: 0.85rem;">
        <i class="fa-solid fa-circle-info"></i> Video này tập trung vào phản xạ luyện nghe khẩu ngữ trực tiếp.
      </div>
    `;
    return;
  }

  items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'vocab-item-row';
    const escapedWord = item.word.replace(/'/g, "\\'");
    row.innerHTML = `
      <div class="vocab-item-main">
        <div class="vocab-item-header">
          <span class="vocab-item-hanzi">${item.word}</span>
          ${item.pinyin ? `<span class="vocab-item-pinyin">${item.pinyin}</span>` : ''}
        </div>
        <div class="vocab-item-meaning">${item.meaning}</div>
      </div>
      <div class="vocab-item-actions">
        <button class="btn-vocab-tool" onclick="window.speakChinese('${escapedWord}')" title="Nghe phát âm chuẩn">
          <i class="fa-solid fa-volume-high"></i>
        </button>
        <button class="btn-vocab-tool" onclick="window.saveVocabWordToNotebook('${escapedWord}', '${(item.pinyin||'').replace(/'/g, "\\'")}', '${(item.meaning||'').replace(/'/g, "\\'")}')" title="Thêm vào Sổ tay từ vựng / Flashcard">
          <i class="fa-solid fa-bookmark" style="color: #fbbf24;"></i>
        </button>
      </div>
    `;
    container.appendChild(row);
  });
}

function saveVocabWordToNotebook(word, pinyin, meaning) {
  if (!word) return;
  try {
    const email = getCurrentUserEmail();
    const storageKey = `my_saved_flashcards_${email}`;
    let saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!saved.some(item => item.word === word)) {
      saved.push({
        word: word,
        pinyin: pinyin || '',
        meaning: meaning || '',
        hskLevel: currentLesson?.levelText || 'Từ Vựng Video',
        addedAt: new Date().toISOString()
      });
      localStorage.setItem(storageKey, JSON.stringify(saved));
      showToast(`⭐ Đã thêm "${word}" vào Sổ tay từ vựng cá nhân!`);
    } else {
      showToast(`Từ "${word}" đã có trong Sổ tay từ vựng của bạn!`);
    }
  } catch (e) {
    showToast(`⭐ Đã thêm "${word}" vào sổ từ vựng!`);
  }
}

function loadLessonNotes() {
  if (!currentLesson) return;
  const email = getCurrentUserEmail();
  const storageKey = `video_notes_${currentLesson.id}_${email}`;
  const textarea = document.getElementById('lesson-notes-textarea');
  if (textarea) {
    textarea.value = localStorage.getItem(storageKey) || '';
  }
  const statusEl = document.getElementById('notes-save-status');
  if (statusEl) {
    statusEl.innerHTML = '<i class="fa-solid fa-cloud-check"></i> Đã tự động lưu';
  }
  renderLessonVocabNotes();
}

function handleNotesInput(val) {
  if (!currentLesson) return;
  const email = getCurrentUserEmail();
  const storageKey = `video_notes_${currentLesson.id}_${email}`;
  localStorage.setItem(storageKey, val);
  const statusEl = document.getElementById('notes-save-status');
  if (statusEl) {
    statusEl.innerHTML = '<i class="fa-solid fa-cloud-check"></i> Đã tự động lưu';
  }
}

function clearCurrentNotes() {
  if (!currentLesson) return;
  if (confirm('Bạn có chắc muốn xóa ghi chú cá nhân của video này không?')) {
    const email = getCurrentUserEmail();
    const storageKey = `video_notes_${currentLesson.id}_${email}`;
    localStorage.removeItem(storageKey);
    const textarea = document.getElementById('lesson-notes-textarea');
    if (textarea) textarea.value = '';
    showToast('Đã xóa ghi chú của bài học!');
  }
}

function switchMode(mode) {
  currentMode = mode;
  document.querySelectorAll('.mode-tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.mode === mode);
  });

  const shadowingWrap = document.getElementById('mode-panel-shadowing');
  const dictationWrap = document.getElementById('mode-panel-dictation');
  const dubbingWrap = document.getElementById('mode-panel-dubbing');

  if (shadowingWrap) shadowingWrap.style.display = (mode === 'shadowing') ? 'block' : 'none';
  if (dictationWrap) dictationWrap.style.display = (mode === 'dictation') ? 'block' : 'none';
  if (dubbingWrap) dubbingWrap.style.display = (mode === 'dubbing') ? 'block' : 'none';

  renderCurrentSentence();
}

function renderCurrentSentence() {
  if (!currentLesson || !currentLesson.sentences[currentSentenceIdx]) return;
  const sent = currentLesson.sentences[currentSentenceIdx];
  const total = currentLesson.sentences.length;

  // Title & Level badge in workspace top bar
  const titleEl = document.getElementById('workspace-lesson-title');
  const levelEl = document.getElementById('workspace-lesson-level-badge');
  if (titleEl) titleEl.textContent = currentLesson.title || 'Bài học';
  if (levelEl) {
    levelEl.textContent = currentLesson.levelText || `HSK ${currentLesson.level || 1}`;
    levelEl.className = `level-badge level-${currentLesson.level || 1}`;
  }

  // Render mode-specific contents
  if (currentMode === 'shadowing') {
    renderShadowingPanel(sent);
  } else if (currentMode === 'dictation') {
    renderDictationPanel(sent);
  } else if (currentMode === 'dubbing') {
    renderDubbingPanel(sent);
  }

  // Render Columns
  renderTranscriptList();
  loadLessonNotes();
  updateTimingDisplay();
}

function renderShadowingPanel(sent) {
  if (!sent) return;
  const info = getSentenceDisplayInfo(sent);

  const speakerBadgeWrap = document.getElementById('shadow-speaker-badge-wrap');
  const speakerBadge = document.getElementById('shadow-speaker-badge');
  // Ẩn badge nhân vật trong shadowing - không cần hiển thị tên người nói
  if (speakerBadgeWrap) {
    speakerBadgeWrap.style.display = 'none';
  }

  const pinyinEl = document.getElementById('shadow-pinyin-display');
  const hanziEl = document.getElementById('shadow-hanzi-display');
  const meaningEl = document.getElementById('shadow-meaning-display');

  if (pinyinEl) {
    pinyinEl.textContent = shadowHidePinyin ? '• • • • • • • • •' : info.cleanPinyin;
    pinyinEl.style.opacity = shadowHidePinyin ? '0.4' : '1';
  }

  if (hanziEl) {
    if (shadowHideHanzi) {
      hanziEl.innerHTML = '<span style="color: #64748b; letter-spacing: 0.1em;">[ Ẩn chữ Hán - Luyện nghe nói ]</span>';
    } else {
      // Chỉ hiển thị phần text của câu (bỏ prefix nhân vật nếu có)
      hanziEl.innerHTML = renderClickableHanziSpans(info.cleanHanzi);
    }
  }

  if (meaningEl) {
    meaningEl.textContent = shadowHideMeaning ? '[ Đã ẩn nghĩa tiếng Việt ]' : info.cleanMeaning;
    meaningEl.style.opacity = shadowHideMeaning ? '0.4' : '1';
  }

  // Reset Assessment Card khi chuyển sang câu mới
  const assessmentCard = document.getElementById('shadow-assessment-card');
  if (assessmentCard) {
    assessmentCard.style.display = 'none';
    // Xóa nút Câu tiếp cũ nếu có
    const oldNextBtn = document.getElementById('shadow-assessment-next-wrap');
    if (oldNextBtn) oldNextBtn.remove();
  }
}

// Sub-mode Switcher stub (giữ lại để tương thích nếu có lời gọi ngoài)
function setShadowSubMode(mode) {
  shadowSubMode = 'sentence';
  renderCurrentSentence();
}

function toggleShadowPassagePinyin(checked) {
  shadowPassageHidePinyin = checked;
  renderShadowPassageList();
}

function toggleShadowPassageMeaning(checked) {
  shadowPassageHideMeaning = checked;
  renderShadowPassageList();
}

function renderShadowPassageList() {
  const container = document.getElementById('shadow-full-passage-list');
  if (!container || !currentLesson || !currentLesson.sentences) return;

  container.innerHTML = '';
  currentLesson.sentences.forEach((s, idx) => {
    const info = getSentenceDisplayInfo(s);
    const isActive = idx === currentSentenceIdx;

    const row = document.createElement('div');
    row.className = `passage-dialogue-row ${isActive ? 'active' : ''}`;
    row.id = `passage-row-${idx}`;

    const speakerHtml = info.speaker
      ? `<span class="passage-speaker-pill">${info.speaker}</span>`
      : `<span class="passage-speaker-pill" style="background: rgba(56,189,248,0.2); color:#38bdf8; border-color: rgba(56,189,248,0.4);">#${idx + 1}</span>`;

    const pinyinHtml = shadowPassageHidePinyin ? '' : `<div class="passage-pinyin-line">${info.cleanPinyin}</div>`;
    const meaningHtml = shadowPassageHideMeaning ? '' : `<div class="passage-meaning-line">${info.cleanMeaning}</div>`;

    row.innerHTML = `
      <div class="passage-speaker-col">
        ${speakerHtml}
      </div>
      <div class="passage-text-col">
        <div class="passage-hanzi-line">${renderClickableHanziSpans(info.cleanHanzi)}</div>
        ${pinyinHtml}
        ${meaningHtml}
      </div>
    `;

    row.addEventListener('click', () => {
      currentSentenceIdx = idx;
      lastPausedSentenceIdx = -1;
      renderCurrentSentence();
      playCurrentSentence();
    });

    container.appendChild(row);
  });
}

function updateShadowPassageHighlight(curTime) {
  if (!currentLesson || !currentLesson.sentences) return;
  const rows = document.querySelectorAll('.passage-dialogue-row');
  const container = document.getElementById('shadow-full-passage-list');
  let activeIdx = -1;
  currentLesson.sentences.forEach((s, idx) => {
    if (curTime >= s.startTime && curTime <= s.endTime) {
      rows[idx]?.classList.add('active');
      activeIdx = idx;
    } else {
      rows[idx]?.classList.remove('active');
    }
  });

  if (activeIdx !== -1 && container) {
    const activeRow = document.getElementById(`passage-row-${activeIdx}`);
    if (activeRow) {
      const relativeTop = activeRow.offsetTop - (container.clientHeight / 2) + (activeRow.offsetHeight / 2);
      container.scrollTo({ top: Math.max(0, relativeTop), behavior: 'smooth' });
    }
  }
}

function playFullPassage() {
  if (!currentLesson || !currentLesson.sentences || currentLesson.sentences.length === 0) return;
  const firstSent = currentLesson.sentences[0];
  if (ytPlayer && ytPlayer.seekTo) {
    ytPlayer.seekTo(firstSent.startTime, true);
    ytPlayer.setPlaybackRate(currentSpeed);
    ytPlayer.playVideo();
    isSentencePlaying = true;
    startPlaybackWatcher();
    showToast("▶️ Đang phát video toàn bộ bài học!");
  }
}

async function togglePassageRecording() {
  if (isPassageRecording) {
    stopPassageRecording();
  } else {
    startPassageRecording();
  }
}

async function startPassageRecording() {
  if (isPassageRecording) return;
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    });

    passageAudioChunks = [];
    let options = {};
    if (typeof MediaRecorder !== 'undefined') {
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      }
    }

    passageMediaRecorder = new MediaRecorder(stream, options);
    passageMediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        passageAudioChunks.push(e.data);
      }
    };

    passageMediaRecorder.onstop = () => {
      if (passageAudioChunks.length > 0) {
        const mime = passageMediaRecorder.mimeType || 'audio/webm';
        passageRecordedBlob = new Blob(passageAudioChunks, { type: mime });
        if (passageRecordedAudioUrl) {
          try { URL.revokeObjectURL(passageRecordedAudioUrl); } catch (e) { }
        }
        passageRecordedAudioUrl = URL.createObjectURL(passageRecordedBlob);
      }
      stream.getTracks().forEach(t => t.stop());
    };

    passageMediaRecorder.start(100);
    isPassageRecording = true;
    passageRecognizedTranscript = '';

    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.lang = 'zh-CN';
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 3;

        rec.onresult = (event) => {
          let str = '';
          for (let i = 0; i < event.results.length; i++) {
            str += event.results[i][0].transcript;
          }
          passageRecognizedTranscript = str;
        };

        rec.onerror = (err) => {
          console.warn('Passage SpeechRecognition error:', err);
        };

        rec.onend = () => {
          passageActiveRecognition = null;
        };

        passageActiveRecognition = rec;
        rec.start();
      } catch (e) { }
    }

    // UI
    const micBtn = document.getElementById('btn-passage-mic');
    if (micBtn) micBtn.classList.add('recording');
    const liveBar = document.getElementById('shadow-passage-recording-live-bar');
    const timerEl = document.getElementById('shadow-passage-recording-timer');
    if (liveBar) liveBar.style.display = 'flex';
    if (timerEl) timerEl.textContent = '00:00';

    passageRecordingSeconds = 0;
    clearInterval(passageRecordingTimerInterval);
    passageRecordingTimerInterval = setInterval(() => {
      passageRecordingSeconds++;
      const m = String(Math.floor(passageRecordingSeconds / 60)).padStart(2, '0');
      const s = String(passageRecordingSeconds % 60).padStart(2, '0');
      if (timerEl) timerEl.textContent = `${m}:${s}`;
    }, 1000);

    // Play full passage video simultaneously
    playFullPassage();
    showToast("🔴 Đang ghi âm toàn bài văn... Đọc theo video!");

  } catch (err) {
    console.error('Error passage recording:', err);
    isPassageRecording = false;
    showToast('Vui lòng cấp quyền Micro trên trình duyệt để ghi âm toàn bài!', true);
  }
}

function stopPassageRecording() {
  if (!isPassageRecording) return;
  isPassageRecording = false;
  clearInterval(passageRecordingTimerInterval);

  if (passageMediaRecorder && passageMediaRecorder.state !== 'inactive') {
    try { passageMediaRecorder.stop(); } catch (e) { }
  }

  if (passageActiveRecognition) {
    try { passageActiveRecognition.stop(); } catch (e) { }
    passageActiveRecognition = null;
  }

  const micBtn = document.getElementById('btn-passage-mic');
  if (micBtn) micBtn.classList.remove('recording');
  const liveBar = document.getElementById('shadow-passage-recording-live-bar');
  if (liveBar) liveBar.style.display = 'none';

  setTimeout(() => {
    evaluatePassagePronunciation();
  }, 250);
}

function playPassageRecordingAudio() {
  if (passageRecordedAudioUrl) {
    const audio = new Audio(passageRecordedAudioUrl);
    audio.play().catch(e => console.warn(e));
    showToast("▶️ Đang phát lại toàn bộ bài thu âm của bạn...");
  } else {
    showToast("Chưa có đoạn thu âm toàn bài nào! Bấm Mic để thu âm trước", true);
  }
}

function evaluatePassagePronunciation() {
  if (!currentLesson || !currentLesson.sentences || currentLesson.sentences.length === 0) return;

  const card = document.getElementById('shadow-passage-assessment-card');
  const scoreValEl = document.getElementById('passage-assessment-score-val');
  const verdictEl = document.getElementById('passage-assessment-verdict-text');
  const spokenEl = document.getElementById('passage-assessment-spoken-text');
  const targetEl = document.getElementById('passage-assessment-target-text');

  if (!card) return;

  // Build target passage text
  const targetPassage = currentLesson.sentences
    .map(s => getSentenceDisplayInfo(s).cleanHanzi)
    .join(' ');

  const spoken = (passageRecognizedTranscript || '').trim();

  let similarity = 0;
  if (spoken) {
    similarity = calculateSimilarity(spoken, targetPassage);
  } else {
    // Không có giọng nói được nhận diện -> 0 điểm
    similarity = 0;
  }

  const percent = Math.min(100, Math.max(0, Math.round(similarity * 100)));

  card.style.display = 'block';
  if (scoreValEl) scoreValEl.textContent = `${percent}%`;

  if (verdictEl) {
    if (!spoken) {
      verdictEl.innerHTML = '⚠️ Chưa nhận diện được giọng đọc tiếng Trung. Bạn hãy bấm Mic và đọc to rõ ràng theo bài nhé!';
    } else if (percent >= 85) {
      verdictEl.innerHTML = '🌟 Xuất sắc! Phát âm toàn bài rất lưu loát & tự nhiên!';
      totalScore += 25;
      currentStreak += 3;
    } else if (percent >= 70) {
      verdictEl.innerHTML = '👍 Tốt! Bài đọc của bạn khá hoàn chỉnh.';
      totalScore += 15;
      currentStreak += 1;
    } else {
      verdictEl.innerHTML = '💪 Cần luyện tập thêm độ liền mạch & ngữ điệu!';
    }
  }

  if (spokenEl) {
    spokenEl.textContent = spoken ? `"${spoken}"` : '(Đã ghi âm bài đọc của bạn - Bấm nút "Nghe Lại" để kiểm tra)';
  }

  if (targetEl) {
    targetEl.textContent = targetPassage;
  }

  renderCurrentSentenceHeaderStats();
  showToast(`📊 Điểm tổng thể cả bài: ${percent}%!`);
}

const isPunctuationChar = (c) => /[，。？！、：；“”‘’!?,.:;'" …—\-（）()\/]/.test(c);

function renderDictationPanel(sent) {
  if (!sent) return;
  const info = getSentenceDisplayInfo(sent);

  const speakerWrap = document.getElementById('dictation-speaker-wrap');
  if (speakerWrap) speakerWrap.style.display = 'none';

  // Update Sentence Counter Badge (e.g. Câu 1/18)
  const counterBadge = document.getElementById('dictation-counter-badge');
  if (counterBadge && currentLesson && currentLesson.sentences) {
    counterBadge.textContent = `Câu ${currentSentenceIdx + 1}/${currentLesson.sentences.length}`;
  }

  const inputEl = document.getElementById('dictation-user-input');
  if (inputEl) {
    inputEl.value = '';
    inputEl.classList.remove('input-error', 'input-success');
  }

  const feedbackBox = document.getElementById('dictation-feedback-box');
  if (feedbackBox) {
    feedbackBox.style.display = 'none';
    feedbackBox.innerHTML = '';
  }

  const solutionBox = document.getElementById('dictation-solution-box');
  if (solutionBox) solutionBox.style.display = 'none';

  // Reset "HIỆN GỢI Ý MẪU" button to default state
  const hintBtn = document.getElementById('btn-dictation-toggle-hint') || document.querySelector('.btn-orange-hint');
  if (hintBtn) {
    hintBtn.innerHTML = '<i class="fa-regular fa-eye"></i> HIỆN GỢI Ý MẪU';
    hintBtn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
  }

  // Render character slot tiles with eye icon (Bấm từng ô để lật mở gợi ý)
  const tilesContainer = document.getElementById('dictation-char-tiles');
  if (tilesContainer) {
    tilesContainer.innerHTML = '';
    const rawChars = (info.cleanHanzi || '').split('');
    let hanziIndex = 0;

    rawChars.forEach((c, idx) => {
      const tile = document.createElement('div');
      const isPunct = isPunctuationChar(c);

      tile.id = `dict-tile-${idx}`;
      tile.dataset.char = c;
      tile.dataset.idx = idx;
      tile.dataset.isPunct = isPunct ? 'true' : 'false';

      if (isPunct) {
        tile.className = 'dict-tile-box punct';
        tile.textContent = c;
      } else {
        tile.className = 'dict-tile-box pending';
        tile.innerHTML = '<i class="fa-regular fa-eye tile-eye-icon"></i>';
        tile.dataset.hanziIdx = String(hanziIndex);
        tile.dataset.manualFlipped = 'false';
        tile.dataset.flipped = 'false';
        tile.title = 'Bấm để xem gợi ý chữ này';
        tile.onclick = function () {
          window.toggleDictationTileHint(this, c);
        };
        hanziIndex++;
      }

      tilesContainer.appendChild(tile);
    });
  }

  // Render Virtual Character Keyboard ONLY for cleanHanzi (no punctuation)
  renderVirtualKeyboard(info.cleanHanzi);
}

function toggleDictationTileHint(btnEl, char) {
  if (!btnEl) return;
  const isFlipped = btnEl.dataset.manualFlipped === 'true';
  const inputEl = document.getElementById('dictation-user-input');
  const currentVal = inputEl ? inputEl.value : '';

  if (isFlipped) {
    btnEl.dataset.manualFlipped = 'false';
  } else {
    btnEl.dataset.manualFlipped = 'true';
  }

  handleDictationRealtimeInput(currentVal);
}

function renderVirtualKeyboard(cleanHanziText) {
  const vkGrid = document.getElementById('dict-vk-grid');
  if (!vkGrid) return;

  vkGrid.innerHTML = '';

  // Extract Hanzi characters (filtering out punctuation)
  const hanziChars = (cleanHanziText || '').split('').filter(c => !isPunctuationChar(c) && /[\u4e00-\u9fa5a-zA-Z0-9]/.test(c));

  // Shuffled or arranged list of characters
  const displayChars = [...hanziChars];
  displayChars.sort(() => Math.random() - 0.5);

  displayChars.forEach((char, btnIdx) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'dict-vk-btn';
    btn.textContent = char;
    btn.dataset.char = char;
    btn.dataset.btnIdx = String(btnIdx);
    btn.onclick = (e) => {
      e.preventDefault();
      inputDictationChar(char);
    };
    vkGrid.appendChild(btn);
  });
}

function updateVirtualKeyboardUsage(currentInputVal) {
  const vkGrid = document.getElementById('dict-vk-grid');
  if (!vkGrid) return;

  const buttons = Array.from(vkGrid.querySelectorAll('.dict-vk-btn'));
  const inputChars = (currentInputVal || '').split('').filter(c => !isPunctuationChar(c) && /[\u4e00-\u9fa5a-zA-Z0-9]/.test(c));

  // Count instances of each character currently in input
  const usedCounts = {};
  inputChars.forEach(c => {
    usedCounts[c] = (usedCounts[c] || 0) + 1;
  });

  // Track consumed buttons so matching buttons hide
  const consumedCounts = {};
  buttons.forEach(btn => {
    const char = btn.dataset.char;
    const needed = usedCounts[char] || 0;
    const currentConsumed = consumedCounts[char] || 0;

    if (currentConsumed < needed) {
      btn.classList.add('used');
      consumedCounts[char] = currentConsumed + 1;
    } else {
      btn.classList.remove('used');
    }
  });
}

function inputDictationChar(char) {
  const inputEl = document.getElementById('dictation-user-input');
  if (!inputEl) return;

  inputEl.value += char;
  handleDictationRealtimeInput(inputEl.value);
}

function deleteLastDictationChar() {
  const inputEl = document.getElementById('dictation-user-input');
  if (!inputEl || !inputEl.value) return;

  inputEl.value = inputEl.value.slice(0, -1);
  handleDictationRealtimeInput(inputEl.value);
}

function clearDictationInput() {
  const inputEl = document.getElementById('dictation-user-input');
  if (inputEl) {
    inputEl.value = '';
    handleDictationRealtimeInput('');
  }
}

function handleDictationRealtimeInput(val) {
  if (!currentLesson || !currentLesson.sentences[currentSentenceIdx]) return;
  const sent = currentLesson.sentences[currentSentenceIdx];
  const info = getSentenceDisplayInfo(sent);

  // Extract only Hanzi characters from user input (ignoring punctuation)
  const userHanziChars = (val || '').split('').filter(c => !isPunctuationChar(c) && /[\u4e00-\u9fa5a-zA-Z0-9]/.test(c));

  // Update virtual keyboard visibility so used letters disappear (Duolingo style)
  updateVirtualKeyboardUsage(val);

  const tiles = Array.from(document.querySelectorAll('.dict-tile-box'));
  let correctCount = 0;
  let totalHanziCount = 0;
  let hasWrong = false;

  tiles.forEach(tile => {
    const isPunct = tile.dataset.isPunct === 'true';
    if (isPunct) {
      // Punctuation tile is a fixed separator, stays as punctuation
      tile.className = 'dict-tile-box punct';
      tile.textContent = tile.dataset.char;
      return;
    }

    totalHanziCount++;
    const hIdx = parseInt(tile.dataset.hanziIdx || '0', 10);
    const targetChar = tile.dataset.char;

    if (hIdx < userHanziChars.length) {
      const userChar = userHanziChars[hIdx];
      if (userChar === targetChar) {
        tile.className = 'dict-tile-box correct';
        tile.dataset.flipped = 'true';
        tile.innerHTML = `<span>${targetChar}</span>`;
        correctCount++;
      } else {
        tile.className = 'dict-tile-box wrong';
        tile.dataset.flipped = 'false';
        tile.innerHTML = `<i class="fa-solid fa-eye tile-eye-icon" style="color: #ef4444;"></i>`;
        hasWrong = true;
      }
    } else {
      // Position not typed yet
      const isManual = tile.dataset.manualFlipped === 'true';
      if (isManual) {
        tile.className = 'dict-tile-box manual-flipped';
        tile.dataset.flipped = 'true';
        tile.innerHTML = `<span>${targetChar}</span>`;
      } else {
        tile.className = 'dict-tile-box pending';
        tile.dataset.flipped = 'false';
        tile.innerHTML = '<i class="fa-regular fa-eye tile-eye-icon"></i>';
      }
    }
  });

  const inputEl = document.getElementById('dictation-user-input');
  const feedbackEl = document.getElementById('dictation-feedback-box');

  if (userHanziChars.length > 0) {
    if (hasWrong) {
      if (inputEl) {
        inputEl.classList.add('input-error');
        inputEl.classList.remove('input-success');
      }
      if (feedbackEl) {
        feedbackEl.style.display = 'flex';
        feedbackEl.className = 'dict-feedback-badge error';
        feedbackEl.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> <span>Chưa đúng!</span>';
      }
    } else {
      if (inputEl) inputEl.classList.remove('input-error');
      if (correctCount >= totalHanziCount && totalHanziCount > 0) {
        if (inputEl) inputEl.classList.add('input-success');
        if (feedbackEl) {
          feedbackEl.style.display = 'flex';
          feedbackEl.className = 'dict-feedback-badge success';
          feedbackEl.innerHTML = '<i class="fa-solid fa-circle-check"></i> <span>Chính xác! (+10 điểm) 🎉</span>';
        }
      } else {
        if (feedbackEl) feedbackEl.style.display = 'none';
      }
    }
  } else {
    if (inputEl) inputEl.classList.remove('input-error', 'input-success');
    if (feedbackEl) feedbackEl.style.display = 'none';
  }

  // Check if fully completed correctly
  const cleanInput = cleanStr(val);
  const cleanTarget = cleanStr(info.cleanHanzi);
  const cleanPinyinTarget = cleanStr(info.cleanPinyin);

  const isFullMatch = (cleanInput === cleanTarget) || (cleanInput === cleanPinyinTarget) || (totalHanziCount > 0 && correctCount >= totalHanziCount);

  if (isFullMatch) {
    onDictationCompletedSuccess(sent);
  }
}

function checkDictationAnswer() {
  if (!currentLesson || !currentLesson.sentences[currentSentenceIdx]) return;
  const sent = currentLesson.sentences[currentSentenceIdx];
  const info = getSentenceDisplayInfo(sent);
  const inputEl = document.getElementById('dictation-user-input');
  const feedbackEl = document.getElementById('dictation-feedback-box');
  const val = inputEl ? inputEl.value.trim() : '';

  if (!val) {
    showToast("Vui lòng gõ chữ hoặc chọn phím bên dưới!", true);
    return;
  }

  const cleanInput = cleanStr(val);
  const cleanTarget = cleanStr(info.cleanHanzi);
  const cleanPinyinTarget = cleanStr(info.cleanPinyin);

  const isFullMatch = (cleanInput === cleanTarget) || (cleanInput === cleanPinyinTarget);
  const sim = calculateSimilarity(cleanInput, cleanTarget) || calculateSimilarity(cleanInput, cleanPinyinTarget);

  if (isFullMatch || sim >= 0.85) {
    onDictationCompletedSuccess(sent);
  } else {
    handleDictationRealtimeInput(val);
    if (feedbackEl) {
      feedbackEl.style.display = 'flex';
      feedbackEl.className = 'dict-feedback-badge error';
      feedbackEl.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> <span>Chưa đúng! Hãy kiểm tra các ô màu đỏ để sửa lại nhé!</span>`;
      currentStreak = 0;
      userAnswers[sent.id] = { isCorrect: false, score: 0 };
      showToast("Chưa chính xác! Thử nghe lại nhé ⚠️", true);
    }
  }
}

function showDictationHint() {
  if (!currentLesson || !currentLesson.sentences[currentSentenceIdx]) return;
  const sent = currentLesson.sentences[currentSentenceIdx];
  const info = getSentenceDisplayInfo(sent);

  const tiles = Array.from(document.querySelectorAll('.dict-tile-box')).filter(t => t.dataset.isPunct !== 'true');
  const allFlipped = tiles.length > 0 && tiles.every(t => t.dataset.flipped === 'true' || t.dataset.manualFlipped === 'true');
  const hintBtn = document.getElementById('btn-dictation-toggle-hint') || document.querySelector('.btn-orange-hint');
  const solutionEl = document.getElementById('dictation-solution-box');
  const solutionHanzi = document.getElementById('dictation-sol-hanzi');
  const solutionPinyin = document.getElementById('dictation-sol-pinyin');
  const solutionMeaning = document.getElementById('dictation-sol-meaning');
  const inputEl = document.getElementById('dictation-user-input');

  if (allFlipped) {
    // ẨN GỢI Ý MẪU: Đóng lại các ô gợi ý
    tiles.forEach(tile => {
      tile.dataset.manualFlipped = 'false';
    });
    if (hintBtn) {
      hintBtn.innerHTML = '<i class="fa-regular fa-eye"></i> HIỆN GỢI Ý MẪU';
      hintBtn.style.background = 'linear-gradient(135deg, #f59e0b, #d97706)';
    }
    if (solutionEl) solutionEl.style.display = 'none';
    handleDictationRealtimeInput(inputEl ? inputEl.value : '');
    showToast("Đã ẩn gợi ý mẫu");
  } else {
    // HIỆN GỢI Ý MẪU: Mở tất cả các ô chữ gợi ý
    tiles.forEach(tile => {
      tile.dataset.manualFlipped = 'true';
      tile.dataset.flipped = 'true';
      tile.className = 'dict-tile-box manual-flipped';
      tile.innerHTML = `<span>${tile.dataset.char}</span>`;
    });
    if (hintBtn) {
      hintBtn.innerHTML = '<i class="fa-solid fa-eye-slash"></i> ẨN GỢI Ý MẪU';
      hintBtn.style.background = 'linear-gradient(135deg, #64748b, #475569)';
    }

    if (solutionEl && solutionHanzi) {
      const prefixHtml = info.speaker ? `<span class="dialogue-speaker-badge" style="margin-right: 8px;"><i class="fa-solid fa-user-tag"></i> ${info.speaker}</span>` : '';
      solutionHanzi.innerHTML = prefixHtml + renderClickableHanziSpans(info.cleanHanzi);
      if (solutionPinyin) solutionPinyin.textContent = info.cleanPinyin;
      if (solutionMeaning) solutionMeaning.textContent = info.cleanMeaning;
      solutionEl.style.display = 'block';
    }

    showToast("💡 Đã mở gợi ý mẫu!");
  }
}

function onDictationCompletedSuccess(sent) {
  const info = getSentenceDisplayInfo(sent);
  const feedbackEl = document.getElementById('dictation-feedback-box');
  const solutionEl = document.getElementById('dictation-solution-box');
  const solutionHanzi = document.getElementById('dictation-sol-hanzi');
  const solutionPinyin = document.getElementById('dictation-sol-pinyin');
  const solutionMeaning = document.getElementById('dictation-sol-meaning');

  // Turn all tiles green
  const tiles = document.querySelectorAll('.dict-tile-box');
  tiles.forEach(t => {
    t.textContent = t.dataset.char;
    t.className = 'dict-tile-box correct';
    t.dataset.flipped = 'true';
    t.dataset.manualFlipped = 'true';
  });

  if (feedbackEl) {
    feedbackEl.style.display = 'flex';
    feedbackEl.className = 'dict-feedback-badge success';
    feedbackEl.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span>Chính xác tuyệt vời! (+10 điểm) 🎉</span>`;
  }

  // REVEAL SOLUTION & VIETNAMESE MEANING
  if (solutionEl && solutionHanzi) {
    const prefixHtml = info.speaker ? `<span class="dialogue-speaker-badge" style="margin-right: 8px;"><i class="fa-solid fa-user-tag"></i> ${info.speaker}</span>` : '';
    solutionHanzi.innerHTML = prefixHtml + renderClickableHanziSpans(info.cleanHanzi);
    if (solutionPinyin) solutionPinyin.textContent = info.cleanPinyin;
    if (solutionMeaning) solutionMeaning.textContent = info.cleanMeaning;
    solutionEl.style.display = 'block';
  }

  if (!userAnswers[sent.id] || !userAnswers[sent.id].isCorrect) {
    totalScore += 10;
    currentStreak++;
    userAnswers[sent.id] = { isCorrect: true, score: 10 };
    showToast("🎉 Hoàn toàn chính xác! (+10 điểm)");
    speakChinese(info.cleanHanzi);
  }

  renderCurrentSentenceHeaderStats();
}

function updateDubbingKaraoke(curTime) {
  if (!currentLesson || !currentLesson.sentences[currentSentenceIdx]) return;
  const sent = currentLesson.sentences[currentSentenceIdx];
  const info = getSentenceDisplayInfo(sent);
  const text = info.cleanHanzi;
  if (!text) return;

  const totalDuration = Math.max(0.1, sent.endTime - sent.startTime);
  const elapsed = Math.max(0, curTime - sent.startTime);
  const progress = Math.min(1, Math.max(0, elapsed / totalDuration));

  // Pacing bar fill
  const pacingFill = document.getElementById('dubbing-pacing-fill');
  if (pacingFill) {
    pacingFill.style.width = `${(progress * 100).toFixed(1)}%`;
  }

  // Character glowing karaoke
  const charCount = text.length;
  const activeCharIdx = Math.floor(progress * charCount);

  for (let i = 0; i < charCount; i++) {
    const charEl = document.getElementById(`dub-char-${i}`);
    if (!charEl) continue;

    if (i < activeCharIdx) {
      charEl.className = 'karaoke-char passed';
    } else if (i === activeCharIdx) {
      charEl.className = 'karaoke-char active-glow';
    } else {
      charEl.className = 'karaoke-char';
    }
  }
}

function stopDubbingPreview() {
  dubbingPreviewPlaying = false;
  if (dubbingPreviewAudio) {
    try {
      dubbingPreviewAudio.pause();
      dubbingPreviewAudio.currentTime = 0;
    } catch (e) { }
    dubbingPreviewAudio = null;
  }
  if (ytPlayer) {
    try {
      ytPlayer.pauseVideo();
      ytPlayer.unMute();
    } catch (e) { }
  }
  const pacingFill = document.getElementById('dubbing-pacing-fill');
  if (pacingFill) pacingFill.style.width = '0%';
}

function populateDubbingRoles(lesson) {
  const select = document.getElementById('dubbing-role-selector');
  if (!select || !lesson || !lesson.sentences) return;

  const speakers = [];
  lesson.sentences.forEach(s => {
    const info = getSentenceDisplayInfo(s);
    if (info.speaker && !speakers.includes(info.speaker)) {
      speakers.push(info.speaker);
    }
  });

  select.innerHTML = '<option value="all">Tất cả nhân vật</option>';

  speakers.forEach(spk => {
    const opt = document.createElement('option');
    opt.value = spk;
    opt.textContent = `Nhân vật: ${spk}`;
    select.appendChild(opt);
  });

  if (speakers.length === 0) {
    const optA = document.createElement('option');
    optA.value = 'role_a';
    optA.textContent = 'Nhân vật A (Nam/Nữ chính)';
    select.appendChild(optA);

    const optB = document.createElement('option');
    optB.value = 'role_b';
    optB.textContent = 'Nhân vật B (Đối thoại)';
    select.appendChild(optB);
  }
}

function renderDubbingPanel(sent) {
  if (!sent) return;
  const info = getSentenceDisplayInfo(sent);

  const speakerBadgeWrap = document.getElementById('dubbing-speaker-tag-wrap');
  const speakerBadge = document.getElementById('dubbing-speaker-badge');
  if (speakerBadgeWrap && speakerBadge) {
    if (info.speaker) {
      speakerBadge.innerHTML = `<i class="fa-solid fa-user-tag"></i> ${info.speaker}`;
      speakerBadgeWrap.style.display = 'block';
    } else {
      speakerBadgeWrap.style.display = 'none';
    }
  }

  const hanziEl = document.getElementById('dubbing-hanzi-text');
  const pinyinEl = document.getElementById('dubbing-pinyin-text');
  const meaningEl = document.getElementById('dubbing-meaning-text');

  if (hanziEl) {
    const chars = (info.cleanHanzi || '').split('');
    hanziEl.innerHTML = chars.map((c, idx) => `<span class="karaoke-char" id="dub-char-${idx}">${c}</span>`).join('');
  }
  if (pinyinEl) pinyinEl.textContent = info.cleanPinyin;
  if (meaningEl) meaningEl.textContent = info.cleanMeaning;

  const pacingFill = document.getElementById('dubbing-pacing-fill');
  if (pacingFill) pacingFill.style.width = '0%';

  const liveBar = document.getElementById('dubbing-status-bar');
  if (liveBar) liveBar.style.display = 'none';
}

function renderTranscriptList() {
  const container = document.getElementById('transcript-sentences-list');
  if (!container || !currentLesson) return;

  container.innerHTML = '';
  currentLesson.sentences.forEach((s, idx) => {
    const info = getSentenceDisplayInfo(s);
    const isDone = userAnswers[s.id] && userAnswers[s.id].isCorrect;
    const isActive = idx === currentSentenceIdx;

    const row = document.createElement('div');
    row.className = `transcript-row ${isActive ? 'active' : ''}`;
    row.id = `transcript-row-${idx}`;

    const speakerTag = info.speaker ? `<span class="dialogue-speaker-badge" style="font-size: 0.72rem; padding: 1px 6px; margin-bottom: 2px;"><i class="fa-solid fa-user-tag"></i> ${info.speaker}</span> ` : '';

    const pinyinHtml = transcriptHidePinyin ? '' : `<div class="transcript-row-pinyin">${info.cleanPinyin}</div>`;
    const meaningHtml = transcriptHideMeaning ? '' : `<div class="transcript-row-meaning">${info.cleanMeaning}</div>`;

    row.innerHTML = `
      <div class="transcript-row-head">
        <span class="transcript-row-idx">Câu ${idx + 1}</span>
        <span class="transcript-row-time"><i class="fa-regular fa-clock"></i> ${formatTime(s.startTime)} - ${formatTime(s.endTime)}</span>
      </div>
      <div class="transcript-row-hanzi">${speakerTag}${renderClickableHanziSpans(info.cleanHanzi)}</div>
      ${pinyinHtml}
      ${meaningHtml}
    `;

    row.addEventListener('click', () => {
      currentSentenceIdx = idx;
      lastPausedSentenceIdx = -1;
      renderCurrentSentence();
      playCurrentSentence();
    });

    container.appendChild(row);
  });

  // Smooth scroll active row ONLY inside the container without jumping the browser window
  const activeRow = document.getElementById(`transcript-row-${currentSentenceIdx}`);
  if (activeRow && container) {
    const relativeTop = activeRow.offsetTop - (container.clientHeight / 2) + (activeRow.offsetHeight / 2);
    container.scrollTo({ top: Math.max(0, relativeTop), behavior: 'smooth' });
  }
}

function renderCurrentSentenceHeaderStats() {
  const scoreText = document.getElementById('dict-score-counter');
  if (scoreText) scoreText.textContent = `${totalScore} điểm`;
  const streakText = document.getElementById('dict-streak-counter');
  if (streakText) streakText.textContent = `${currentStreak} 🔥`;
}

function nextSentence() {
  if (!currentLesson) return;
  if (currentSentenceIdx < currentLesson.sentences.length - 1) {
    currentSentenceIdx++;
    lastPausedSentenceIdx = -1;
    renderCurrentSentence();
    playCurrentSentence();
  } else {
    showLessonCompletedModal();
  }
}

function prevSentence() {
  if (!currentLesson) return;
  if (currentSentenceIdx > 0) {
    currentSentenceIdx--;
    lastPausedSentenceIdx = -1;
    renderCurrentSentence();
    playCurrentSentence();
  } else {
    showToast("Đây là câu đầu tiên của bài!");
  }
}

// ==========================================
// SENTENCE NAVIGATOR & SUBTITLES LIST
// ==========================================

function renderSentenceNavigator() {
  const listEl = document.getElementById('dict-sentence-navigator-list');
  const fullSubsListEl = document.getElementById('subs-mode-full-list');
  if (!currentLesson) return;

  if (listEl) {
    listEl.innerHTML = '';
    currentLesson.sentences.forEach((s, idx) => {
      const isDone = userAnswers[s.id] && userAnswers[s.id].isCorrect;
      const isActive = idx === currentSentenceIdx;

      const item = document.createElement('div');
      item.className = `dict-nav-item ${isActive ? 'active' : ''} ${isDone ? 'done' : ''}`;
      item.innerHTML = `
        <span class="nav-idx-badge">${idx + 1}</span>
        <span class="nav-time-badge">${formatTime(s.startTime)}</span>
        <span class="nav-snippet-text">${s.hanzi}</span>
        <i class="fa-solid ${isDone ? 'fa-circle-check text-success' : 'fa-play play-icon'}"></i>
      `;
      item.addEventListener('click', () => {
        currentSentenceIdx = idx;
        renderCurrentSentence();
        playCurrentSentence();
      });
      listEl.appendChild(item);
    });
  }

  // Full Subtitles Mode View
  if (fullSubsListEl) {
    fullSubsListEl.innerHTML = '';
    currentLesson.sentences.forEach((s, idx) => {
      const row = document.createElement('div');
      row.className = `subs-full-row ${idx === currentSentenceIdx ? 'highlight-row' : ''}`;
      row.innerHTML = `
        <div class="subs-row-header">
          <span class="subs-row-num">#${idx + 1}</span>
          <span class="subs-row-time"><i class="fa-regular fa-clock"></i> ${formatTime(s.startTime)} - ${formatTime(s.endTime)}</span>
          <button class="btn btn-outline btn-xs" onclick="window.jumpToSentence(${idx})">
            <i class="fa-solid fa-play"></i> Nghe câu này
          </button>
        </div>
        <div class="subs-row-hanzi">${renderClickableHanziSpans(s.hanzi)}</div>
        <div class="subs-row-pinyin">${s.pinyin}</div>
        <div class="subs-row-meaning">${s.meaning}</div>
      `;
      fullSubsListEl.appendChild(row);
    });
  }
}

function updateSubtitleHighlight(curTime) {
  if (!currentLesson) return;
  const rows = document.querySelectorAll('.subs-full-row');
  currentLesson.sentences.forEach((s, idx) => {
    if (curTime >= s.startTime && curTime <= s.endTime) {
      rows[idx]?.classList.add('highlight-row');
    } else {
      rows[idx]?.classList.remove('highlight-row');
    }
  });
}

function updateInPlayerDualSubtitles(curTime) {
  if (!currentLesson || !currentLesson.sentences) return;
  const overlayHanzi = document.getElementById('yt-overlay-hanzi');
  const overlayPinyin = document.getElementById('yt-overlay-pinyin');
  const overlayMeaning = document.getElementById('yt-overlay-meaning');
  if (!overlayHanzi) return;

  const activeSentence = currentLesson.sentences.find(s => curTime >= s.startTime && curTime <= s.endTime);
  if (activeSentence) {
    overlayHanzi.innerHTML = renderInteractiveWords(activeSentence.hanzi, activeSentence.words, curTime);
    if (overlayPinyin) overlayPinyin.textContent = activeSentence.pinyin || '';
    if (overlayMeaning) overlayMeaning.textContent = activeSentence.meaning || '';
  } else {
    // Only display subtitle when video playback time is within sentence active timing bounds
    overlayHanzi.innerHTML = '';
    if (overlayPinyin) overlayPinyin.textContent = '';
    if (overlayMeaning) overlayMeaning.textContent = '';
  }
}

let currentPopoverData = null;

function renderInteractiveWords(text, wordsArray = [], curTime = 0) {
  if (!text) return '';
  if (/[\u4e00-\u9fa5]/.test(text)) {
    return text.split('').map((char, idx) => {
      if (/[\u4e00-\u9fa5]/.test(char)) {
        let isActive = false;
        if (Array.isArray(wordsArray) && wordsArray.length > 0) {
          const matched = wordsArray.find(w => {
            const wClean = (w.word || '').trim();
            return wClean.includes(char) && curTime >= (w.start - 0.05) && curTime <= (w.end + 0.1);
          });
          if (matched) isActive = true;
        }
        const activeClass = isActive ? ' karaoke-word-active' : '';
        return `<span class="yt-sub-hanzi-word${activeClass}" onclick="window.lookupWord(this, '${char}')" title="Bấm để tra từ 1-click">${char}</span>`;
      }
      return char;
    }).join('');
  } else {
    return text.split(/(\s+|[^\w\s'])/).map(part => {
      if (/^[a-zA-Z0-9']+$/.test(part)) {
        const escaped = part.replace(/'/g, "\\'");
        let isActive = false;
        if (Array.isArray(wordsArray) && wordsArray.length > 0) {
          const matched = wordsArray.find(w => {
            const wClean = (w.word || '').trim().toLowerCase();
            return wClean.includes(part.toLowerCase()) && curTime >= (w.start - 0.05) && curTime <= (w.end + 0.1);
          });
          if (matched) isActive = true;
        }
        const activeClass = isActive ? ' karaoke-word-active' : '';
        return `<span class="yt-sub-hanzi-word${activeClass}" onclick="window.lookupWord(this, '${escaped}')" title="Bấm để tra từ 1-click">${part}</span>`;
      }
      return part;
    }).join('');
  }
}

window.lookupWord = async function (element, word) {
  if (!word || !word.trim()) return;
  const cleanWord = word.trim();
  currentPopoverData = { word: cleanWord, pinyin: '', meaning: '' };

  const popover = document.getElementById('dict-word-popover');
  const wordText = document.getElementById('popover-word-text');
  const pinyinText = document.getElementById('popover-pinyin-text');
  const meaningText = document.getElementById('popover-meaning-text');
  const hskBadge = document.getElementById('popover-hsk-badge');

  if (!popover) return;

  if (wordText) wordText.textContent = cleanWord;
  if (pinyinText) pinyinText.textContent = '...';
  if (meaningText) meaningText.textContent = 'Đang tra từ điển...';
  if (hskBadge) hskBadge.textContent = 'HSK';

  // Position popover near element
  const rect = element.getBoundingClientRect();
  popover.style.display = 'block';
  popover.style.top = `${Math.min(window.innerHeight - 190, rect.bottom + 8)}px`;
  popover.style.left = `${Math.max(10, Math.min(window.innerWidth - 310, rect.left - 40))}px`;

  // Fetch dictionary
  try {
    const res = await fetch('/api/dict/lookup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ word: cleanWord })
    });
    if (res.ok) {
      const data = await res.json();
      currentPopoverData = data;
      if (wordText) wordText.textContent = data.word || cleanWord;
      if (pinyinText) pinyinText.textContent = data.pinyin || '';
      if (meaningText) meaningText.textContent = data.meaning || 'Không tìm thấy định nghĩa';
      if (hskBadge) hskBadge.textContent = data.hskLevel || 'Từ Vựng';
    }
  } catch (err) {
    if (meaningText) meaningText.textContent = 'Lỗi tra từ.';
  }
};

window.speakPopoverWord = function () {
  if (currentPopoverData && currentPopoverData.word) {
    speakChinese(currentPopoverData.word);
  }
};

window.savePopoverWordToFlashcard = function () {
  if (!currentPopoverData || !currentPopoverData.word) return;
  try {
    const email = getCurrentUserEmail();
    const storageKey = `my_saved_flashcards_${email}`;
    let saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
    if (!saved.some(item => item.word === currentPopoverData.word)) {
      saved.push({
        word: currentPopoverData.word,
        pinyin: currentPopoverData.pinyin,
        meaning: currentPopoverData.meaning,
        hskLevel: currentPopoverData.hskLevel,
        addedAt: new Date().toISOString()
      });
      localStorage.setItem(storageKey, JSON.stringify(saved));
      showToast(`⭐ Đã lưu "${currentPopoverData.word}" vào Flashcard cá nhân!`);
    } else {
      showToast(`Từ "${currentPopoverData.word}" đã có trong Flashcard!`);
    }
  } catch (e) {
    showToast(`Đã lưu "${currentPopoverData.word}" vào sổ từ vựng!`);
  }
};

function renderClickableHanziSpans(text) {
  return renderInteractiveWords(text);
}

function formatTime(secs) {
  if (isNaN(secs)) return '00:00';
  const m = Math.floor(secs / 60);
  const s = Math.floor(secs % 60);
  return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
}

// Simple Levenshtein distance for fuzzy matching
function calculateStringSimilarity(s1, s2) {
  if (!s1 || !s2) return 0;
  let longer = s1.length > s2.length ? s1 : s2;
  let shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1.0;
  let costs = [];
  for (let i = 0; i <= longer.length; i++) {
    let lastValue = i;
    for (let j = 0; j <= shorter.length; j++) {
      if (i === 0) costs[j] = j;
      else {
        if (j > 0) {
          let newValue = costs[j - 1];
          if (longer.charAt(i - 1) !== shorter.charAt(j - 1))
            newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
          costs[j - 1] = lastValue;
          lastValue = newValue;
        }
      }
    }
    if (i > 0) costs[shorter.length] = lastValue;
  }
  return (longer.length - costs[shorter.length]) / longer.length;
}

// ==========================================
// HANZI WRITER POPUP INTEGRATION
// ==========================================

function openHanziModal(character) {
  if (!character) return;
  const modal = document.getElementById('dict-hanzi-writer-modal');
  const targetCharEl = document.getElementById('hanzi-modal-char-title');
  const tabsDiv = document.getElementById('hanzi-modal-char-tabs');
  const targetDiv = document.getElementById('hanzi-writer-target');

  if (!modal || !targetDiv) return;

  // Extract all Chinese characters from string
  const hanziChars = (character.match(/[\u4e00-\u9fa5]/g) || [character.charAt(0)]);
  let selectedChar = hanziChars[0] || '你';

  function renderSingleChar(char) {
    selectedChar = char;
    targetDiv.innerHTML = '';
    if (targetCharEl) targetCharEl.textContent = `Tập Viết Chữ: ${char}`;

    if (window.HanziWriter) {
      try {
        const isDark = document.documentElement.classList.contains('dark');
        activeHanziWriter = HanziWriter.create('hanzi-writer-target', char, {
          width: 180,
          height: 180,
          padding: 10,
          showOutline: true,
          strokeColor: '#2563eb',
          radicalColor: '#ef4444',
          outlineColor: isDark ? '#475569' : '#94a3b8',
          strokeAnimationSpeed: 1.2
        });
        activeHanziWriter.animateCharacter();
      } catch (e) {
        targetDiv.innerHTML = `<span style="font-size: 5rem; font-weight: 900; color: #ef4444;">${char}</span>`;
      }
    } else {
      targetDiv.innerHTML = `<span style="font-size: 5rem; font-weight: 900; color: #ef4444;">${char}</span>`;
    }

    // Highlight active tab button
    if (tabsDiv) {
      tabsDiv.querySelectorAll('.hanzi-tab-btn').forEach(btn => {
        const isActive = btn.dataset.char === char;
        btn.classList.toggle('btn-primary', isActive);
        btn.classList.toggle('btn-outline', !isActive);
      });
    }
  }

  // Render character tabs if multiple Hanzi characters
  if (tabsDiv) {
    tabsDiv.innerHTML = '';
    if (hanziChars.length > 1) {
      hanziChars.forEach((c) => {
        const btn = document.createElement('button');
        btn.className = `btn btn-xs ${c === selectedChar ? 'btn-primary' : 'btn-outline'} hanzi-tab-btn`;
        btn.dataset.char = c;
        btn.textContent = c;
        btn.style.fontSize = '1rem';
        btn.style.padding = '4px 10px';
        btn.onclick = () => renderSingleChar(c);
        tabsDiv.appendChild(btn);
      });
      tabsDiv.style.display = 'flex';
    } else {
      tabsDiv.style.display = 'none';
    }
  }

  modal.style.display = 'flex';
  renderSingleChar(selectedChar);
}

function animateCurrentHanzi() {
  if (activeHanziWriter) {
    activeHanziWriter.animateCharacter();
  }
}

function closeHanziModal() {
  const modal = document.getElementById('dict-hanzi-writer-modal');
  if (modal) modal.style.display = 'none';
}

// ==========================================
// LESSON COMPLETED MODAL
// ==========================================

function showLessonCompletedModal() {
  const modal = document.getElementById('dict-lesson-completed-modal');
  const scoreVal = document.getElementById('modal-final-score-val');
  const correctCountVal = document.getElementById('modal-correct-count-val');

  const total = currentLesson.sentences.length;
  const correct = Object.values(userAnswers).filter(a => a.isCorrect).length;

  if (scoreVal) scoreVal.textContent = `${totalScore} Điểm`;
  if (correctCountVal) correctCountVal.textContent = `${correct} / ${total} câu`;

  if (modal) modal.style.display = 'flex';
  showToast("🎉 Chúc mừng bạn đã hoàn thành xuất sắc bài luyện chép video!");
}

// ==========================================
// USER AUTH & CUSTOM VIDEOS MANAGEMENT
// ==========================================

let currentUser = null;

function initCurrentUser() {
  try {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      currentUser = JSON.parse(userStr);
    }
  } catch (e) {
    currentUser = null;
  }
  updateUserHeaderDisplay();
}

function getCurrentUserEmail() {
  return currentUser?.email || 'guest';
}

function updateUserHeaderDisplay() {
  const nameEl = document.getElementById('dict-user-name-display');
  const badgeEl = document.getElementById('dict-user-profile-badge');
  if (currentUser && currentUser.email) {
    if (nameEl) nameEl.textContent = currentUser.name || currentUser.email.split('@')[0];
    if (badgeEl) {
      badgeEl.title = `Đang đăng nhập: ${currentUser.email}`;
      badgeEl.style.borderColor = 'rgba(56, 189, 248, 0.5)';
      badgeEl.style.background = 'rgba(56, 189, 248, 0.12)';
      badgeEl.style.color = '#38bdf8';
    }
  } else {
    if (nameEl) nameEl.textContent = 'Khách (Lưu trên máy này)';
  }
}

function getLocalCustomVideos() {
  const email = getCurrentUserEmail();
  try {
    const saved = localStorage.getItem(`custom_video_dictation_${email}`);
    if (saved) {
      const list = JSON.parse(saved);
      if (Array.isArray(list)) return list;
    }
  } catch (e) { }
  return [];
}

function saveLocalCustomVideos(videos) {
  const email = getCurrentUserEmail();
  try {
    localStorage.setItem(`custom_video_dictation_${email}`, JSON.stringify(videos));
  } catch (e) { }
}

function updateMyVideosBadge() {
  const email = getCurrentUserEmail();
  const count = allLessons.filter(l => l.isCustom === true || (l.userEmail && (l.userEmail === email || l.userEmail === 'guest'))).length;
  const countEl = document.getElementById('my-videos-count');
  if (countEl) countEl.textContent = count;
  const myOpt = document.getElementById('my-videos-opt');
  if (myOpt) myOpt.textContent = `⭐ Video Của Tôi (${count})`;
}

function extractYouTubeId(url) {
  if (!url) return '';
  const trimmed = url.trim();
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = trimmed.match(regExp);
  return match ? match[1] : '';
}

// Live YouTube input preview
window.handleYouTubeUrlInput = function (val) {
  const ytId = extractYouTubeId(val);
  const previewBox = document.getElementById('custom-video-preview-box');
  const previewImg = document.getElementById('custom-video-preview-img');
  const previewId = document.getElementById('custom-video-preview-id');
  const titleInput = document.getElementById('custom-video-title');

  if (ytId) {
    if (previewBox) previewBox.style.display = 'flex';
    if (previewImg) previewImg.src = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    if (previewId) previewId.textContent = `YouTube Video ID: ${ytId}`;
    if (titleInput && !titleInput.value) {
      titleInput.value = `Bài Luyện Nghe YouTube (${ytId})`;
    }
  } else {
    if (previewBox) previewBox.style.display = 'none';
  }
};

// Subtitle & YouTube Fetcher Tools
// Master All-in-One AI Generator: Auto Subtitles, Auto Voice Transcription, Auto HSK & Category Classification, 100% Proofreading
window.autoGenerateAllWithAI = async function () {
  const urlInput = document.getElementById('custom-video-url')?.value.trim();
  const ytId = extractYouTubeId(urlInput);

  if (!ytId) {
    showToast("Vui lòng dán link YouTube hợp lệ vào ô ở trên trước!", true);
    document.getElementById('custom-video-url')?.focus();
    return;
  }

  const btn = document.getElementById('btn-auto-generate-all');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> AI đang xử lý toàn diện...';
  }

  const steps = [
    { delay: 0, msg: '🔍 Đang phân tích video & kết nối AI...' },
    { delay: 3000, msg: '⚡ AI đang phân loại HSK, xác định chủ đề & bóc tách câu thoại...' },
    { delay: 7000, msg: '✍️ Đang chuẩn hóa chính tả 100% & sinh phiên âm Pinyin...' }
  ];
  const toastTimers = steps.map(s => setTimeout(() => showToast(s.msg), s.delay));

  try {
    const res = await fetch('/api/dictation/fetch-subtitles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ youtubeId: ytId, extractRawOnly: true })
    });

    toastTimers.forEach(t => clearTimeout(t));

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      showToast(`Lỗi máy chủ: ${errData.error || res.status}`, true);
      return;
    }

    const data = await res.json();

    if (data.success && Array.isArray(data.sentences) && data.sentences.length > 0) {
      const titleInput = document.getElementById('custom-video-title');
      if (titleInput && (!titleInput.value || titleInput.value.startsWith('Bài Luyện Nghe'))) {
        titleInput.value = data.videoTitle || titleInput.value;
      }

      // Auto-select AI-detected HSK Level
      if (data.level) {
        const levelSelect = document.getElementById('custom-video-level');
        if (levelSelect) levelSelect.value = String(data.level);
      }

      // Auto-select AI-detected Category
      if (data.category) {
        const catSelect = document.getElementById('custom-video-cat');
        if (catSelect) catSelect.value = data.category;
      }

      const lines = data.sentences.map(s => {
        const sMin = Math.floor(s.startTime / 60);
        const sSec = (s.startTime % 60).toFixed(3);
        const eMin = Math.floor(s.endTime / 60);
        const eSec = (s.endTime % 60).toFixed(3);
        const sFormatted = `${String(sMin).padStart(2, '0')}:${String(sSec).padStart(6, '0')}`;
        const eFormatted = `${String(eMin).padStart(2, '0')}:${String(eSec).padStart(6, '0')}`;
        return `[${sFormatted} - ${eFormatted}] ${s.hanzi}`; // Note: hanzi holds raw text for extractRawOnly
      });

      const textarea = document.getElementById('custom-video-subtitles');
      if (textarea) textarea.value = lines.join('\n');

      showToast("⚡ Đã trích xuất phụ đề theo ngôn ngữ gốc của video! Hãy bấm nút 'Dịch Tiếng Trung' để chuyển sang Chữ Hán, Pinyin & Tiếng Việt. 🎉");

    } else {
      showToast(data.message || 'Không thể tạo tự động bài học. Vui lòng thử lại!', true);
    }

  } catch (err) {
    toastTimers.forEach(t => clearTimeout(t));
    console.error('Auto generate all error:', err);
    showToast('Lỗi kết nối máy chủ AI — Vui lòng kiểm tra lại mạng!', true);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-wand-magic-sparkles"></i> AI Tạo Tự Động Toàn Diện';
    }
  }
};

window.fetchYouTubeSubtitles = window.autoGenerateAllWithAI;
window.transcribeAudioWithAI = window.autoGenerateAllWithAI;

window.autoTranslateSubtitles = async function () {
  const textarea = document.getElementById('custom-video-subtitles');
  if (!textarea || !textarea.value.trim()) {
    showToast("Vui lòng nhập lời câu thoại (Tiếng Việt hoặc Tiếng Trung) trước!", true);
    textarea?.focus();
    return;
  }

  const btn = document.getElementById('btn-auto-translate-subs');
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang dịch...';
  }

  showToast("🌐 Đang chuyển đổi toàn bộ phụ đề sang Chữ Hán Giản Thể, Pinyin & Tiếng Việt...");

  try {
    const res = await fetch('/api/dictation/auto-translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: textarea.value })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.success && data.processedText) {
        textarea.value = data.processedText;
        showToast("✨ Đã chuyển đổi toàn bộ phụ đề sang Chữ Hán, Pinyin & Tiếng Việt chuẩn xác 100%! 🎉");
      } else {
        showToast("Không thể dịch tự động, vui lòng thử lại.", true);
      }
    } else {
      showToast("Lỗi kết nối máy chủ dịch thuật.", true);
    }
  } catch (err) {
    console.error("Auto translate error:", err);
    showToast("Lỗi khi kết nối dịch thuật.", true);
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = '<i class="fa-solid fa-language"></i> Dịch Tiếng Trung';
    }
  }
};

window.fillSampleSubtitles = function () {
  const textarea = document.getElementById('custom-video-subtitles');
  if (!textarea) return;
  textarea.value = `[00:10 - 00:17] 你好！很高兴认识你。 | Nǐ hǎo! Hěn gāoxìng rènshi nǐ. | Xin chào! Rất vui được làm quen với bạn.
[00:18 - 00:26] 你喜欢听中文歌吗？ | Nǐ xǐhuan tīng zhōngwén gē ma? | Bạn có thích nghe nhạc tiếng Trung không?
[00:27 - 00:35] 我非常喜欢，每天都在练习听力。 | Wǒ fēicháng xǐhuan, měitiān dōu zài liànxí tīnglì. | Mình rất thích, mỗi ngày đều luyện nghe.`;
  showToast("Đã chèn mẫu câu ví dụ! 📝");
};

window.clearSubtitlesInput = function () {
  const textarea = document.getElementById('custom-video-subtitles');
  if (textarea) {
    textarea.value = '';
    textarea.focus();
  }
};

window.autoGenerateSubtitlesPinyin = async function () {
  const textarea = document.getElementById('custom-video-subtitles');
  if (!textarea || !textarea.value.trim()) {
    showToast("Vui lòng nhập lời câu thoại chữ Hán trước!", true);
    return;
  }

  showToast("Đang tự động sinh Pinyin chuẩn...");
  const lines = textarea.value.split('\n');
  const processedLines = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      processedLines.push('');
      continue;
    }

    const parts = trimmed.split('|').map(p => p.trim());
    if (parts.length >= 2 && parts[1]) {
      processedLines.push(trimmed);
      continue;
    }

    let timePrefix = '';
    let hanziText = parts[0] || '';
    const timeMatch = hanziText.match(/^(\[[0-9:\s.-]+\]|[0-9:]+)\s*(.*)$/);
    if (timeMatch) {
      timePrefix = timeMatch[1] + ' ';
      hanziText = timeMatch[2];
    }

    try {
      const res = await fetch('/api/dictation/pinyin-helper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: hanziText })
      });
      if (res.ok) {
        const data = await res.json();
        const generatedPinyin = data.pinyin || '';
        const meaning = parts[2] || parts[1] || 'Câu luyện chép tiếng Trung';
        processedLines.push(`${timePrefix}${hanziText} | ${generatedPinyin} | ${meaning}`);
      } else {
        processedLines.push(trimmed);
      }
    } catch (e) {
      processedLines.push(trimmed);
    }
  }

  textarea.value = processedLines.join('\n');
  showToast("Đã sinh Pinyin tự động thành công! ✨");
};

// ==========================================
// INTERACTIVE SENTENCE TIMING ADJUSTMENT
// ==========================================

window.nudgeTiming = function (type, delta) {
  if (!currentLesson || !currentLesson.sentences[currentSentenceIdx]) return;
  const sent = currentLesson.sentences[currentSentenceIdx];

  if (type === 'start') {
    sent.startTime = Math.max(0, parseFloat((sent.startTime + delta).toFixed(2)));
    if (sent.startTime >= sent.endTime) sent.endTime = parseFloat((sent.startTime + 1.0).toFixed(2));
  } else if (type === 'end') {
    sent.endTime = Math.max(sent.startTime + 0.5, parseFloat((sent.endTime + delta).toFixed(2)));
  }

  updateTimingDisplay();
  showToast(`Mốc ${type === 'start' ? 'bắt đầu' : 'kết thúc'}: ${type === 'start' ? sent.startTime : sent.endTime}s`);
};

window.setTimingFromCurrent = function (type) {
  if (!ytPlayer || !ytPlayer.getCurrentTime || !currentLesson || !currentLesson.sentences[currentSentenceIdx]) return;
  const curTime = parseFloat(ytPlayer.getCurrentTime().toFixed(2));
  const sent = currentLesson.sentences[currentSentenceIdx];

  if (type === 'start') {
    sent.startTime = curTime;
    if (sent.startTime >= sent.endTime) sent.endTime = parseFloat((sent.startTime + 2.0).toFixed(2));
  } else if (type === 'end') {
    sent.endTime = Math.max(sent.startTime + 0.5, curTime);
  }

  updateTimingDisplay();
  showToast(`📍 Đã gán mốc ${type === 'start' ? 'Bắt Đầu' : 'Kết Thúc'} tại ${curTime}s`);
};

function updateTimingDisplay() {
  if (!currentLesson || !currentLesson.sentences[currentSentenceIdx]) return;
  const sent = currentLesson.sentences[currentSentenceIdx];

  const startEl = document.getElementById('timing-start-val');
  const endEl = document.getElementById('timing-end-val');
  if (startEl) startEl.textContent = `${sent.startTime.toFixed(2)}s`;
  if (endEl) endEl.textContent = `${sent.endTime.toFixed(2)}s`;
}

window.saveAdjustedTiming = function () {
  if (!currentLesson) return;
  const email = getCurrentUserEmail();

  // Save to local storage
  const localList = getLocalCustomVideos();
  const idx = localList.findIndex(l => l.id === currentLesson.id);
  if (idx >= 0) {
    localList[idx] = currentLesson;
    saveLocalCustomVideos(localList);
  }

  // Sync to server
  fetch('/api/dictation/save-lesson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(currentLesson)
  }).catch(err => console.warn("Save timing error:", err));

  renderSentenceNavigator();
  showToast("💾 Đã lưu mốc thời gian câu thoại thành công! 100% Khớp giọng nói");
};

// ==========================================
// MEDIA RECORDER & PRONUNCIATION ASSESSMENT
// ==========================================

function calculateSimilarity(str1, str2) {
  const s1 = cleanStr(str1);
  const s2 = cleanStr(str2);
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1.0;

  const m = s1.length;
  const n = s2.length;
  const dp = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  const distance = dp[m][n];
  const maxLen = Math.max(m, n);
  return Math.max(0, 1 - distance / maxLen);
}

async function startRecordingAudio(mode = 'shadowing') {
  if (isRecording) {
    stopRecordingAudio();
    return;
  }

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
    });

    audioChunks = [];
    let options = {};
    if (typeof MediaRecorder !== 'undefined') {
      if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        options = { mimeType: 'audio/webm;codecs=opus' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      }
    }

    mediaRecorder = new MediaRecorder(stream, options);
    mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) {
        audioChunks.push(e.data);
      }
    };

    mediaRecorder.onstop = () => {
      if (audioChunks.length > 0) {
        const mime = mediaRecorder.mimeType || 'audio/webm';
        userRecordedBlob = new Blob(audioChunks, { type: mime });
        if (userRecordedAudioUrl) {
          try { URL.revokeObjectURL(userRecordedAudioUrl); } catch (e) { }
        }
        userRecordedAudioUrl = URL.createObjectURL(userRecordedBlob);
      }
      stream.getTracks().forEach(t => t.stop());
    };

    mediaRecorder.start(100);
    isRecording = true;
    recognizedTranscript = '';

    // Parallel Speech Recognition for Mandarin transcript
    if (SpeechRecognition) {
      try {
        const rec = new SpeechRecognition();
        rec.lang = 'zh-CN';
        rec.continuous = true;
        rec.interimResults = true;
        rec.maxAlternatives = 3;

        rec.onresult = (event) => {
          let str = '';
          for (let i = 0; i < event.results.length; i++) {
            str += event.results[i][0].transcript;
          }
          recognizedTranscript = str;
        };

        rec.onerror = (err) => {
          console.warn('SpeechRecognition error:', err);
        };

        rec.onend = () => {
          activeRecognition = null;
        };

        activeRecognition = rec;
        rec.start();
      } catch (e) {
        console.warn('Speech recognition parallel init failed:', e);
      }
    }

    // UI Updates
    recordingSeconds = 0;
    if (mode === 'shadowing') {
      const micBtn = document.getElementById('btn-shadow-mic');
      if (micBtn) micBtn.classList.add('recording');
      const liveBar = document.getElementById('shadow-recording-live-bar');
      const timerEl = document.getElementById('shadow-recording-timer');
      if (liveBar) liveBar.style.display = 'flex';
      if (timerEl) timerEl.textContent = '00:00';

      clearInterval(recordingTimerInterval);
      recordingTimerInterval = setInterval(() => {
        recordingSeconds++;
        const m = String(Math.floor(recordingSeconds / 60)).padStart(2, '0');
        const s = String(recordingSeconds % 60).padStart(2, '0');
        if (timerEl) timerEl.textContent = `${m}:${s}`;
      }, 1000);

      showToast("🔴 Đang ghi âm... Nói xong hãy bấm nút Mic lại để Chấm điểm!");
    } else if (mode === 'dubbing') {
      const micBtn = document.getElementById('btn-dub-mic');
      if (micBtn) micBtn.classList.add('recording');
      const liveBar = document.getElementById('dubbing-status-bar');
      const timerEl = document.getElementById('dubbing-timer');
      const statusMsg = document.getElementById('dubbing-status-msg');
      if (liveBar) liveBar.style.display = 'flex';
      if (statusMsg) statusMsg.textContent = 'Đang thu âm lồng tiếng... Khớp khẩu hình video';
      if (timerEl) timerEl.textContent = '00:00';

      clearInterval(recordingTimerInterval);
      recordingTimerInterval = setInterval(() => {
        recordingSeconds++;
        const m = String(Math.floor(recordingSeconds / 60)).padStart(2, '0');
        const s = String(recordingSeconds % 60).padStart(2, '0');
        if (timerEl) timerEl.textContent = `${m}:${s}`;
      }, 1000);

      // Play video snippet muted to help user synchronize lip movements
      if (ytPlayer && ytPlayer.seekTo && currentLesson?.sentences?.[currentSentenceIdx]) {
        const s = currentLesson.sentences[currentSentenceIdx];
        ytPlayer.seekTo(s.startTime, true);
        ytPlayer.mute();
        ytPlayer.playVideo();
        dubbingVideoSyncPlaying = true;
      }

      showToast("🔴 Đang thu âm lồng tiếng... Khớp khẩu hình video");
    }

  } catch (err) {
    console.error('Error starting media recording:', err);
    isRecording = false;
    showToast('Vui lòng cấp quyền Micro trên trình duyệt để ghi âm luyện nói!', true);
  }
}

function stopRecordingAudio() {
  if (!isRecording) return;
  isRecording = false;
  clearInterval(recordingTimerInterval);

  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    try { mediaRecorder.stop(); } catch (e) { }
  }

  if (activeRecognition) {
    try { activeRecognition.stop(); } catch (e) { }
    activeRecognition = null;
  }

  if (dubbingVideoSyncPlaying && ytPlayer) {
    try {
      ytPlayer.pauseVideo();
      ytPlayer.unMute();
    } catch (e) { }
    dubbingVideoSyncPlaying = false;
  }

  // Reset Button & Live Bar UI
  const shadowMicBtn = document.getElementById('btn-shadow-mic');
  if (shadowMicBtn) shadowMicBtn.classList.remove('recording');
  const shadowLiveBar = document.getElementById('shadow-recording-live-bar');
  if (shadowLiveBar) shadowLiveBar.style.display = 'none';

  const dubMicBtn = document.getElementById('btn-dub-mic');
  if (dubMicBtn) dubMicBtn.classList.remove('recording');
  const dubLiveBar = document.getElementById('dubbing-status-bar');
  if (dubLiveBar) {
    const statusMsg = document.getElementById('dubbing-status-msg');
    if (statusMsg) statusMsg.innerHTML = '<i class="fa-solid fa-circle-check" style="color:#10b981;"></i> Đã thu âm xong lời thoại! Bấm <strong>"Phát"</strong> để xem video lồng tiếng';
  }

  // Process and evaluate after a tiny delay so Blob is ready
  setTimeout(() => {
    if (currentMode === 'shadowing') {
      evaluateCurrentPronunciation();
    } else if (currentMode === 'dubbing') {
      showToast("✅ Đã thu âm xong! Bấm nút 'Phát' để xem thử video lồng tiếng");
    }
  }, 250);
}

function evaluateCurrentPronunciation() {
  const sent = currentLesson?.sentences?.[currentSentenceIdx];
  if (!sent) return;
  const info = getSentenceDisplayInfo(sent);

  const card = document.getElementById('shadow-assessment-card');
  const scoreValEl = document.getElementById('assessment-score-val');
  const scoreBadge = document.getElementById('assessment-score-badge');
  const verdictEl = document.getElementById('assessment-verdict-text');
  const spokenTextEl = document.getElementById('assessment-spoken-text');
  const targetBreakdownEl = document.getElementById('assessment-target-breakdown');

  if (!card) return;

  const targetHanzi = info.cleanHanzi;
  const spoken = (recognizedTranscript || '').trim();

  let similarity = 0;
  if (spoken) {
    similarity = calculateSimilarity(spoken, targetHanzi) ||
      calculateSimilarity(spoken, info.cleanPinyin);
  } else {
    // Không có giọng đọc được nhận diện -> 0 điểm
    similarity = 0;
  }

  const percent = Math.min(100, Math.max(0, Math.round(similarity * 100)));

  card.style.display = 'block';
  if (scoreValEl) scoreValEl.textContent = `${percent}%`;

  if (scoreBadge) {
    scoreBadge.classList.toggle('low', percent < 70);
  }

  if (verdictEl) {
    if (!spoken) {
      verdictEl.innerHTML = '⚠️ Chưa nhận diện được giọng đọc tiếng Trung. Bạn hãy bấm Mic và đọc to rõ ràng theo câu mẫu nhé!';
      currentStreak = 0;
      userAnswers[sent.id] = { isCorrect: false, score: 0, userAnswer: '' };
    } else if (percent >= 85) {
      verdictEl.innerHTML = '🌟 Xuất sắc! Phát âm rất chuẩn & tự nhiên!';
      totalScore += 10;
      currentStreak++;
      userAnswers[sent.id] = { isCorrect: true, score: 10, userAnswer: spoken };
    } else if (percent >= 70) {
      verdictEl.innerHTML = '👍 Tốt! Bạn đã phát âm đúng đại đa số từ.';
      totalScore += 5;
      currentStreak++;
      userAnswers[sent.id] = { isCorrect: true, score: 5, userAnswer: spoken };
    } else {
      verdictEl.innerHTML = '💪 Cần luyện tập thêm! Hãy nghe mẫu rồi thử lại.';
      currentStreak = 0;
      userAnswers[sent.id] = { isCorrect: false, score: 0, userAnswer: spoken };
    }
  }

  if (spokenTextEl) {
    spokenTextEl.textContent = spoken ? `"${spoken}"` : '(Đã ghi âm giọng nói - Bấm nút "Nghe lại giọng bạn" để nghe)';
  }

  if (targetBreakdownEl) {
    const chars = targetHanzi.split('');
    const cleanSpk = cleanStr(spoken);
    const spans = chars.map(c => {
      if (/[\u4e00-\u9fa5]/.test(c)) {
        const isMatched = cleanSpk.includes(cleanStr(c)) || percent >= 80;
        return `<span class="${isMatched ? 'char-match-correct' : 'char-match-wrong'}" title="${isMatched ? 'Đúng' : 'Cần chú ý phát âm'}">${c}</span>`;
      }
      return c;
    });
    targetBreakdownEl.innerHTML = spans.join('');
  }

  // Thêm nút Câu tiếp theo sau khi chấm điểm
  const existingNextBtn = document.getElementById('shadow-assessment-next-wrap');
  if (!existingNextBtn && card) {
    const wrap = document.createElement('div');
    wrap.id = 'shadow-assessment-next-wrap';
    wrap.style.cssText = 'display: flex; justify-content: center; margin-top: 14px;';
    wrap.innerHTML = `<button onclick="window.nextSentence()" style="background: linear-gradient(135deg, #10b981, #059669); border: none; color: #fff; font-weight: 800; padding: 10px 24px; border-radius: 12px; font-size: 0.92rem; cursor: pointer; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(16,185,129,0.35);"><i class="fa-solid fa-arrow-right"></i> Câu tiếp theo</button>`;
    card.appendChild(wrap);
  }

  renderCurrentSentenceHeaderStats();
  showToast(`🎯 Điểm phát âm: ${percent}%! Đã lưu file ghi âm của bạn`);
}

function evaluatePronunciation() {
  if (isRecording) {
    stopRecordingAudio();
  } else {
    evaluateCurrentPronunciation();
  }
}

function toggleSpeechRecording() {
  if (isRecording) {
    stopRecordingAudio();
  } else {
    startRecordingAudio('shadowing');
  }
}

function toggleDubRecording() {
  if (isRecording) {
    stopRecordingAudio();
  } else {
    startRecordingAudio('dubbing');
  }
}

function playUserRecordingAudio() {
  if (userRecordedAudioUrl) {
    const audio = new Audio(userRecordedAudioUrl);
    audio.play().catch(e => console.warn('User audio play error:', e));
    showToast("▶️ Đang phát lại giọng nói của bạn...");
  } else {
    showToast("Chưa có đoạn ghi âm nào! Bấm nút Mic để nói trước nhé", true);
  }
}

function playUserOrModelAudio() {
  if (userRecordedAudioUrl) {
    playUserRecordingAudio();
  } else {
    speakCurrentSentence();
  }
}

function previewDubbing() {
  if (!userRecordedAudioUrl) {
    showToast("Vui lòng bấm Mic thu âm lời thoại trước khi phát thử!", true);
    return;
  }
  const sent = currentLesson?.sentences?.[currentSentenceIdx];
  if (!sent || !ytPlayer || !ytPlayer.seekTo) return;

  stopDubbingPreview();

  ytPlayer.seekTo(sent.startTime, true);
  ytPlayer.mute();
  ytPlayer.playVideo();
  dubbingPreviewPlaying = true;
  startPlaybackWatcher();

  dubbingPreviewAudio = new Audio(userRecordedAudioUrl);
  dubbingPreviewAudio.play().catch(e => console.warn(e));

  showToast("🎬 Đang phát video lồng tiếng kèm nhịp Karaoke & giọng của bạn!");
}

function getSelectedCategoryAndLevel() {
  const select = document.getElementById('dict-category-filter');
  if (select && select.value) {
    const val = select.value;
    if (val.startsWith('level:')) {
      return { cat: 'all', lvl: val.replace('level:', ''), status: 'all' };
    }
    if (val.startsWith('cat:')) {
      return { cat: val.replace('cat:', ''), lvl: 'all', status: 'all' };
    }
    if (val.startsWith('status:')) {
      return { cat: 'all', lvl: 'all', status: val.replace('status:', '') };
    }
    return { cat: 'all', lvl: 'all', status: 'all' };
  }
  const activeCatBtn = document.querySelector('.cat-pill-btn.active');
  return {
    cat: activeCatBtn?.dataset.cat || 'all',
    lvl: activeCatBtn?.dataset.level || 'all',
    status: 'all'
  };
}

// Delete Custom Video
window.deleteCustomVideo = async function (lessonId) {
  const lesson = allLessons.find(l => l.id === lessonId);
  const title = lesson ? lesson.title : 'video này';
  if (!confirm(`Bạn có chắc chắn muốn xóa "${title}" khỏi danh sách video của bạn không?`)) {
    return;
  }

  const email = getCurrentUserEmail();

  // 1. Remove from allLessons
  allLessons = allLessons.filter(l => l.id !== lessonId);

  // 2. Remove from localStorage
  const localList = getLocalCustomVideos().filter(l => l.id !== lessonId);
  saveLocalCustomVideos(localList);

  // 3. Delete from backend
  try {
    await fetch(`/api/dictation/lessons/${lessonId}?userEmail=${encodeURIComponent(email)}`, {
      method: 'DELETE'
    });
  } catch (e) {
    console.warn("Delete server error:", e);
  }

  // 4. Update UI
  updateMyVideosBadge();
  const { cat, lvl } = getSelectedCategoryAndLevel();
  const searchVal = document.getElementById('dict-search-input')?.value.trim() || '';
  filterLessons(cat, lvl, searchVal);

  showToast("Đã xóa video khỏi danh sách của bạn! 🗑️");
};

// ==========================================
// COMPLETED VIDEOS TRACKING (Hình 3 & 4)
// ==========================================

function getCompletedVideos() {
  const email = getCurrentUserEmail();
  try {
    return JSON.parse(localStorage.getItem(`completed_dictation_videos_${email}`) || '[]');
  } catch {
    return [];
  }
}

function isLessonCompleted(lessonId) {
  return getCompletedVideos().includes(lessonId);
}

function toggleLessonCompleted(lessonId, event) {
  if (event) event.stopPropagation();
  const email = getCurrentUserEmail();
  const storageKey = `completed_dictation_videos_${email}`;
  let list = getCompletedVideos();
  const idx = list.indexOf(lessonId);
  if (idx !== -1) {
    list.splice(idx, 1);
    showToast("Đã bỏ đánh dấu hoàn thành!");
  } else {
    list.push(lessonId);
    showToast("🎉 Đã lưu video vào danh sách ĐÃ HOÀN THÀNH!");
  }
  localStorage.setItem(storageKey, JSON.stringify(list));
  renderCatalogGrid();
  updateWorkspaceCompletedButton();
}

function updateWorkspaceCompletedButton() {
  const btn = document.getElementById('workspace-btn-toggle-completed');
  if (!btn || !currentLesson) return;
  const isCompleted = isLessonCompleted(currentLesson.id);
  if (isCompleted) {
    btn.classList.add('completed');
    btn.innerHTML = `<i class="fa-solid fa-circle-check"></i> <span id="workspace-btn-completed-text">Đã học xong</span>`;
  } else {
    btn.classList.remove('completed');
    btn.innerHTML = `<i class="fa-solid fa-check"></i> <span id="workspace-btn-completed-text">Đánh dấu đã học</span>`;
  }
}

function toggleCurrentLessonCompleted() {
  if (!currentLesson) return;
  toggleLessonCompleted(currentLesson.id);
  updateWorkspaceCompletedButton();
}

// ==========================================
// CATALOG & LESSON SELECTION
// ==========================================

function renderCatalogGrid() {
  const grid = document.getElementById('dict-lessons-catalog-grid');
  if (!grid) return;

  grid.innerHTML = '';
  const email = getCurrentUserEmail();
  const { cat } = getSelectedCategoryAndLevel();
  const isMyVideosTab = cat === 'my_videos';

  if (filteredLessons.length === 0) {
    if (isMyVideosTab) {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted); background: rgba(255,255,255,0.03); border: 1.5px dashed rgba(245, 158, 11, 0.4); border-radius: 20px;">
          <i class="fa-brands fa-youtube" style="font-size: 3.5rem; color: #ef4444; margin-bottom: 16px; opacity: 0.85;"></i>
          <h3 style="color: var(--text-primary); font-size: 1.3rem; margin-bottom: 8px;">Bạn chưa có video cá nhân nào</h3>
          <p style="max-width: 500px; margin: 0 auto 20px; font-size: 0.92rem; color: var(--text-secondary);">
            Dán bất kỳ link video YouTube yêu thích nào (MV, phim hoạt hình, hội thoại...) để tạo bài luyện nghe chép chính tả cá nhân hóa!
          </p>
          <button class="btn btn-primary btn-sm" onclick="window.openAddVideoModal()" style="background: linear-gradient(135deg, #ef4444, #dc2626); border: none; color: #ffffff; font-weight: 800; padding: 10px 24px; border-radius: 50px; display: inline-flex; align-items: center; gap: 8px; cursor: pointer; box-shadow: 0 4px 14px rgba(239, 68, 68, 0.4);">
            <i class="fa-brands fa-youtube" style="color: #ffffff;"></i> + Thêm Video YouTube Mới
          </button>
        </div>
      `;
    } else {
      grid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-muted);">
          <i class="fa-solid fa-video-slash" style="font-size: 3rem; margin-bottom: 16px; opacity: 0.5;"></i>
          <h3>Không tìm thấy video nào phù hợp</h3>
          <p>Vui lòng thử chọn danh mục khác hoặc bấm nút [Thêm Video YouTube] ở trên để tạo bài mới!</p>
        </div>
      `;
    }
    return;
  }

  filteredLessons.forEach(lesson => {
    const isUserVideo = lesson.isCustom === true || (lesson.userEmail && (lesson.userEmail === email || lesson.userEmail === 'guest'));
    const isCompleted = isLessonCompleted(lesson.id);

    const card = document.createElement('div');
    card.className = `dict-lesson-card glass-panel ${isCompleted ? 'lesson-completed' : ''}`;
    card.innerHTML = `
      <div class="dict-card-thumb-wrap">
        <img src="${lesson.thumbnail || `https://img.youtube.com/vi/${lesson.youtubeId}/hqdefault.jpg`}" alt="${lesson.title}" loading="lazy">
        <span class="dict-card-dur-badge"><i class="fa-regular fa-clock"></i> ${lesson.duration || '03:00'}</span>
        <span class="dict-card-level-badge level-${lesson.level || '1'}">${lesson.levelText || `HSK ${lesson.level || 1}`}</span>
        ${isCompleted ? `<span class="dict-completed-badge" style="position: absolute; top: 10px; left: 10px; z-index: 4;"><i class="fa-solid fa-circle-check"></i> Đã Xong</span>` : ''}
        <button class="dict-card-play-overlay-btn" title="Bắt đầu luyện tập">
          <i class="fa-solid fa-play"></i>
        </button>
      </div>
      <div class="dict-card-body">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
          ${isUserVideo
        ? `<span class="dict-card-cat-badge dict-my-badge"><i class="fa-solid fa-user-check"></i> Video Của Tôi</span>`
        : `<span class="dict-card-cat-badge"><i class="fa-solid fa-tag"></i> ${lesson.category || 'Tổng Hợp'}</span>`
      }
          <div style="display: flex; align-items: center; gap: 6px;">
            <button class="btn-toggle-completed ${isCompleted ? 'completed' : ''}" onclick="event.stopPropagation(); window.toggleLessonCompleted('${lesson.id}', event)" title="${isCompleted ? 'Bỏ đánh dấu hoàn thành' : 'Đánh dấu đã hoàn thành'}">
              <i class="fa-solid ${isCompleted ? 'fa-circle-check' : 'fa-check'}"></i> ${isCompleted ? 'Đã học' : 'Xong'}
            </button>
            ${isUserVideo ? `
              <button class="btn-delete-custom-video" onclick="event.stopPropagation(); window.deleteCustomVideo('${lesson.id}')" title="Xóa video khỏi danh sách của bạn">
                <i class="fa-solid fa-trash-can"></i>
              </button>
            ` : ''}
          </div>
        </div>
        <h3 class="dict-card-title" style="margin-bottom: 12px;">${lesson.title}</h3>
        <div class="dict-card-footer">
          <span class="dict-card-sentences-count"><i class="fa-solid fa-list-ol"></i> ${lesson.sentences?.length || 0} câu thoại</span>
          <button class="btn btn-primary btn-sm btn-start-study" style="${currentMode === 'shadowing' ? 'background: linear-gradient(135deg, #10b981, #059669);' : ''}">
            <i class="fa-solid ${currentMode === 'shadowing' ? 'fa-microphone' : 'fa-pencil'}"></i> ${currentMode === 'shadowing' ? 'Luyện Shadowing' : 'Luyện Nghe Chép'}
          </button>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      openLessonWorkspace(lesson);
    });

    grid.appendChild(card);
  });
}

function filterLessons(category = 'all', level = 'all', keyword = '', status = 'all') {
  const email = getCurrentUserEmail();
  const completedList = getCompletedVideos();
  filteredLessons = allLessons.filter(l => {
    let matchCat = false;
    if (category === 'all') {
      matchCat = true;
    } else if (category === 'my_videos') {
      matchCat = l.isCustom === true || (l.userEmail && (l.userEmail === email || l.userEmail === 'guest'));
    } else {
      matchCat = l.category === category;
    }

    const matchLvl = (level === 'all') || (String(l.level) === String(level));
    const matchKey = !keyword || l.title.toLowerCase().includes(keyword.toLowerCase()) || (l.description && l.description.toLowerCase().includes(keyword.toLowerCase()));
    
    let matchStatus = true;
    const isDone = completedList.includes(l.id);
    if (status === 'completed') matchStatus = isDone;
    if (status === 'uncompleted') matchStatus = !isDone;

    return matchCat && matchLvl && matchKey && matchStatus;
  });
  renderCatalogGrid();
}

function openLessonWorkspace(lesson) {
  currentLesson = lesson;
  currentSentenceIdx = 0;
  lastPausedSentenceIdx = -1;
  totalScore = 0;
  currentStreak = 0;
  userAnswers = {};
  shadowSubMode = 'sentence';

  const catalogView = document.getElementById('dict-catalog-view');
  const workspaceView = document.getElementById('dict-workspace-view');

  if (catalogView) catalogView.style.display = 'none';
  if (workspaceView) workspaceView.style.display = 'block';

  // Set titles & breadcrumb
  const titleEl = document.getElementById('workspace-lesson-title');
  if (titleEl) titleEl.textContent = lesson.title;

  const levelBadge = document.getElementById('workspace-lesson-level-badge');
  if (levelBadge) {
    levelBadge.textContent = lesson.levelText || `HSK ${lesson.level || 1}`;
    levelBadge.className = `level-badge level-${lesson.level || '1'}`;
  }

  // Update Completed Button in Workspace
  updateWorkspaceCompletedButton();

  // Switch to selected mode (shadowing or dictation)
  switchMode(currentMode || 'shadowing');

  // Populate Dubbing roles from speakers
  populateDubbingRoles(lesson);
  setShadowSubMode('sentence');

  // Load custom timing adjustments cache if exists
  try {
    const cacheKey = `hongtai_dictation_timing_${lesson.id}`;
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      const timingMap = JSON.parse(cached);
      timingMap.forEach(item => {
        const s = lesson.sentences.find(x => x.id === item.id);
        if (s) {
          s.startTime = item.startTime;
          s.endTime = item.endTime;
        }
      });
    }
  } catch (e) { }

  // Setup YouTube player
  setupPlayerForVideo(lesson.youtubeId);
  renderCurrentSentence();

  // Populate lesson notes if available
  const noteBox = document.getElementById('workspace-lesson-note-box');
  const noteContent = document.getElementById('workspace-lesson-note-content');
  if (noteBox && noteContent) {
    if (lesson.note && lesson.note.trim()) {
      noteContent.textContent = lesson.note.trim();
      noteBox.style.display = 'block';
    } else {
      noteBox.style.display = 'none';
    }
  }

  // Scroll to workspace top
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function returnToCatalog() {
  if (ytPlayer && ytPlayer.pauseVideo) {
    try { ytPlayer.pauseVideo(); } catch (e) { }
  }
  stopPlaybackWatcher();

  const catalogView = document.getElementById('dict-catalog-view');
  const workspaceView = document.getElementById('dict-workspace-view');

  if (catalogView) catalogView.style.display = 'block';
  if (workspaceView) workspaceView.style.display = 'none';
}

// ==========================================
// ADD CUSTOM YOUTUBE VIDEO MODAL
// ==========================================

function openAddVideoModal() {
  showToast("🔒 Tính năng Thêm Video YouTube cá nhân đang được nâng cấp và sẽ sớm ra mắt! Hãy cùng đón chờ nhé. ✨", false);
}

function closeAddVideoModal() {
  const modal = document.getElementById('dict-add-video-modal');
  if (modal) modal.style.display = 'none';
}

function parseTimeToSeconds(timeStr) {
  if (!timeStr) return null;
  const parts = timeStr.trim().split(':').map(Number);
  if (parts.some(isNaN)) return null;
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  } else if (parts.length === 1) {
    return parts[0];
  }
  return null;
}

async function handleSaveCustomVideo(e) {
  e.preventDefault();
  const urlInput = document.getElementById('custom-video-url').value.trim();
  const titleInput = document.getElementById('custom-video-title').value.trim();
  const levelInput = document.getElementById('custom-video-level').value;
  const catInput = document.getElementById('custom-video-cat').value;
  const rawSubtitles = document.getElementById('custom-video-subtitles').value.trim();

  // Extract YouTube ID
  const ytId = extractYouTubeId(urlInput);
  if (!ytId) {
    showToast("Link YouTube không hợp lệ! Vui lòng kiểm tra lại.", true);
    return;
  }

  let sentences = [];
  if (rawSubtitles) {
    const lines = rawSubtitles.split('\n').map(l => l.trim()).filter(Boolean);
    let curTime = 2.0;

    for (let idx = 0; idx < lines.length; idx++) {
      const line = lines[idx];
      let startTime = curTime;
      let endTime = curTime + 4.0;
      let textLine = line;

      // Check for timestamp bracket format: [00:12 - 00:18] or 0:15
      const bracketMatch = line.match(/^\[\s*([\d:.]+)\s*(?:-|–|to)\s*([\d:.]+)\s*\]\s*(.*)$/i);
      if (bracketMatch) {
        const sTime = parseTimeToSeconds(bracketMatch[1]);
        const eTime = parseTimeToSeconds(bracketMatch[2]);
        if (sTime !== null) startTime = sTime;
        if (eTime !== null && eTime > startTime) endTime = eTime;
        textLine = bracketMatch[3].trim();
      }

      const parts = textLine.split('|').map(p => p.trim());
      const hanzi = parts[0] || '';
      let pinyin = parts[1] || '';
      let meaning = parts[2] || (parts.length === 2 && !/[a-zA-Zāáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜ]/.test(parts[1]) ? parts[1] : 'Câu luyện chép tiếng Trung');

      if (!pinyin && hanzi) {
        try {
          const res = await fetch('/api/dictation/pinyin-helper', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text: hanzi })
          });
          if (res.ok) {
            const d = await res.json();
            pinyin = d.pinyin || '';
          }
        } catch (err) { }
      }

      const duration = Math.max(3, Math.min(10, hanzi.length * 0.55));
      if (!bracketMatch) {
        endTime = parseFloat((startTime + duration).toFixed(1));
        curTime = endTime + 0.6;
      }

      const cleanHanzi = hanzi.replace(/[^\u4e00-\u9fa5]/g, '');
      const keywords = [];
      if (cleanHanzi.length >= 2) {
        keywords.push(cleanHanzi.slice(0, Math.min(2, cleanHanzi.length)));
        if (cleanHanzi.length >= 4) {
          keywords.push(cleanHanzi.slice(2, 4));
        }
      } else if (cleanHanzi.length === 1) {
        keywords.push(cleanHanzi);
      }

      sentences.push({
        id: idx + 1,
        startTime: parseFloat(startTime.toFixed(3)),
        endTime: parseFloat(endTime.toFixed(3)),
        hanzi: hanzi,
        pinyin: pinyin,
        meaning: meaning,
        keywords: keywords.length > 0 ? keywords : [hanzi.slice(0, 1)],
        blankIndices: [0]
      });
    }
  }

  if (sentences.length === 0) {
    sentences.push({
      id: 1,
      startTime: 0,
      endTime: 15.0,
      hanzi: "你好，欢迎学习中文！",
      pinyin: "Nǐ hǎo, huānyíng xuéxí zhōngwén!",
      meaning: "Xin chào, chào mừng bạn học tiếng Trung!",
      keywords: ["你好", "中文"],
      blankIndices: [0]
    });
  }

  const email = getCurrentUserEmail();
  const newLesson = {
    id: `dict_custom_${Date.now()}`,
    title: titleInput || `Video Luyện Chép (${ytId})`,
    youtubeId: ytId,
    duration: '03:30',
    level: levelInput,
    levelText: `HSK ${levelInput}`,
    category: catInput,
    thumbnail: `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`,
    description: `Video cá nhân được thêm bởi ${currentUser?.name || email}.`,
    isCustom: true,
    userEmail: email,
    createdAt: new Date().toISOString(),
    sentences: sentences
  };

  // Deduplicate existing entry for this user and youtubeId
  allLessons = allLessons.filter(l => !(l.youtubeId === ytId && l.userEmail === email));
  let localList = getLocalCustomVideos();
  localList = localList.filter(l => !(l.youtubeId === ytId && l.userEmail === email));

  // 1. Add to allLessons
  allLessons.unshift(newLesson);

  // 2. Save to local storage
  localList.unshift(newLesson);
  saveLocalCustomVideos(localList);

  // 3. Sync to server
  fetch('/api/dictation/save-lesson', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newLesson)
  }).catch(err => console.warn("Sync new lesson error:", err));

  // 4. Update UI
  updateMyVideosBadge();
  closeAddVideoModal();

  // Reset form
  document.getElementById('custom-video-form').reset();
  const previewBox = document.getElementById('custom-video-preview-box');
  if (previewBox) previewBox.style.display = 'none';

  // Automatically switch to "Video Của Tôi" tab
  document.querySelectorAll('.cat-pill-btn').forEach(b => b.classList.remove('active'));
  const myPill = document.getElementById('my-videos-pill');
  if (myPill) myPill.classList.add('active');

  filterLessons('my_videos', 'all');
  showToast("🎉 Đã thêm video vào danh sách của bạn thành công!");
}

// ==========================================
// INITIALIZATION ON DOM READY
// ==========================================

async function initVideoDictationPage() {
  initCurrentUser();
  initYouTubeAPI();

  // Fetch Lessons from Backend API
  let serverLessons = [];
  try {
    const res = await fetch('/api/dictation/lessons');
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        serverLessons = data;
      } else {
        serverLessons = DEFAULT_LESSONS;
      }
    } else {
      serverLessons = DEFAULT_LESSONS;
    }
  } catch (e) {
    console.warn("Using default fallback lessons:", e);
    serverLessons = DEFAULT_LESSONS;
  }

  // Merge server lessons with local custom lessons
  const localCustom = getLocalCustomVideos();
  const map = new Map(); // Key: ID
  const ytEmailMap = new Set(); // Key: youtubeId_userEmail

  serverLessons.forEach(l => {
    map.set(l.id, l);
    if (l.youtubeId && l.userEmail) ytEmailMap.add(`${l.youtubeId}_${l.userEmail}`);
  });

  localCustom.forEach(l => {
    const compositeKey = `${l.youtubeId}_${l.userEmail}`;
    if (!map.has(l.id) && !ytEmailMap.has(compositeKey)) {
      map.set(l.id, l);
      if (l.youtubeId && l.userEmail) ytEmailMap.add(compositeKey);
    }
  });

  allLessons = Array.from(map.values());
  updateMyVideosBadge();

  // Check URL mode parameter (shadowing vs dictation)
  const params = new URLSearchParams(window.location.search);
  const urlMode = params.get('mode');
  if (urlMode === 'shadowing' || urlMode === 'dictation') {
    currentMode = urlMode;
    // Update active tab buttons if present
    document.querySelectorAll('.mode-tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mode === currentMode);
    });

    // Update Banner Texts dynamically
    const bannerTag = document.getElementById('dict-banner-tag');
    const bannerTitle = document.getElementById('dict-banner-title');
    const heading = document.getElementById('dict-catalog-heading');
    if (urlMode === 'shadowing') {
      if (bannerTag) bannerTag.innerHTML = '<i class="fa-solid fa-microphone-lines"></i> LUYỆN SHADOWING BẢN XỨ';
      if (bannerTitle) bannerTitle.textContent = 'Luyện Phản Xạ Nói & Shadowing Video';
      if (heading) heading.innerHTML = '<i class="fa-solid fa-microphone-lines" style="color: #10b981;"></i> Video Luyện Shadowing';
    } else if (urlMode === 'dictation') {
      if (bannerTag) bannerTag.innerHTML = '<i class="fa-solid fa-pen-to-square"></i> LUYỆN NGHE CHÉP CHÍNH TẢ';
      if (bannerTitle) bannerTitle.textContent = 'Luyện Nghe Chép Chính Tả Video';
      if (heading) heading.innerHTML = '<i class="fa-solid fa-pen-to-square" style="color: #38bdf8;"></i> Video Luyện Nghe Chép';
    }
  }

  filteredLessons = [...allLessons];
  renderCatalogGrid();

  // Setup Event Listeners
  setupEventListeners();

  // Check URL params (e.g. ?lesson=dict_lesson_1)
  const lessonId = params.get('lesson');
  if (lessonId) {
    const target = allLessons.find(l => l.id === lessonId);
    if (target) openLessonWorkspace(target);
  }
}

function setupEventListeners() {
  // Category Dropdown Filter
  const filterSelect = document.getElementById('dict-category-filter');
  if (filterSelect) {
    filterSelect.addEventListener('change', () => {
      const { cat, lvl, status } = getSelectedCategoryAndLevel();
      const searchVal = document.getElementById('dict-search-input')?.value.trim() || '';
      filterLessons(cat, lvl, searchVal, status);
    });
  }

  // Level Tabs Filter (Pills fallback)
  document.querySelectorAll('.cat-pill-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.cat-pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.cat || 'all';
      const lvl = btn.dataset.level || 'all';
      const searchVal = document.getElementById('dict-search-input')?.value.trim() || '';
      filterLessons(cat, lvl, searchVal, 'all');
    });
  });

  // Search input
  const searchInput = document.getElementById('dict-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const { cat, lvl, status } = getSelectedCategoryAndLevel();
      filterLessons(cat, lvl, e.target.value.trim(), status);
    });
  }

  // Dismiss Popover when clicking outside
  document.addEventListener('click', (e) => {
    const popover = document.getElementById('dict-word-popover');
    if (popover && popover.style.display === 'block') {
      if (!popover.contains(e.target) && !e.target.classList.contains('yt-sub-hanzi-word') && !e.target.classList.contains('hanzi-interactive-char')) {
        popover.style.display = 'none';
      }
    }
  });

  // Global Hotkeys for Shadowing & Dictation (Space = Replay, ArrowLeft/Right = Prev/Next, P = AutoPause, S = Speed)
  document.addEventListener('keydown', (e) => {
    // If not in workspace, return
    const ws = document.getElementById('dict-workspace-view');
    if (!ws || ws.style.display === 'none') return;

    const isTyping = ['INPUT', 'TEXTAREA'].includes(e.target.tagName);

    if (e.code === 'Space' && (!isTyping || e.ctrlKey)) {
      e.preventDefault();
      replaySnippet();
    } else if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      checkCurrentAnswer();
    } else if ((e.key === 'h' || e.key === 'H') && e.ctrlKey) {
      e.preventDefault();
      showHint();
    } else if (e.key === 'ArrowRight' && (e.ctrlKey || !isTyping)) {
      e.preventDefault();
      nextSentence();
    } else if (e.key === 'ArrowLeft' && (e.ctrlKey || !isTyping)) {
      e.preventDefault();
      prevSentence();
    } else if ((e.key === 'p' || e.key === 'P') && !isTyping) {
      toggleAutoPause();
    } else if ((e.key === 's' || e.key === 'S') && !isTyping) {
      const speeds = [0.5, 0.75, 1.0];
      const nextIdx = (speeds.indexOf(currentSpeed) + 1) % speeds.length;
      setPlaybackSpeed(speeds[nextIdx]);
    }
  });

  // Add Custom Video Form
  const customForm = document.getElementById('custom-video-form');
  if (customForm) {
    customForm.addEventListener('submit', handleSaveCustomVideo);
  }
}



// Export functions to window for onclick handlers
window.replaySnippet = replaySnippet;
window.setPlaybackSpeed = setPlaybackSpeed;
window.toggleAutoPause = toggleAutoPause;
window.toggleVideoBlur = toggleVideoBlur;
window.toggleHideVideo = toggleHideVideo;
window.toggleShadowPinyin = toggleShadowPinyin;
window.toggleShadowHanzi = toggleShadowHanzi;
window.toggleShadowMeaning = toggleShadowMeaning;
window.setShadowSubMode = setShadowSubMode;
window.toggleShadowPassagePinyin = toggleShadowPassagePinyin;
window.toggleShadowPassageMeaning = toggleShadowPassageMeaning;
window.playFullPassage = playFullPassage;
window.togglePassageRecording = togglePassageRecording;
window.playPassageRecordingAudio = playPassageRecordingAudio;
window.evaluatePassagePronunciation = evaluatePassagePronunciation;
window.toggleTranscriptPinyin = toggleTranscriptPinyin;
window.toggleTranscriptMeaning = toggleTranscriptMeaning;
window.selectDubRole = selectDubRole;
window.toggleSideCard = toggleSideCard;
window.handleNotesInput = handleNotesInput;
window.clearCurrentNotes = clearCurrentNotes;
window.switchMode = switchMode;
window.checkDictationAnswer = checkDictationAnswer;
window.showDictationHint = showDictationHint;
window.toggleDictationTileHint = toggleDictationTileHint;
window.inputDictationChar = inputDictationChar;
window.deleteLastDictationChar = deleteLastDictationChar;
window.clearDictationInput = clearDictationInput;
window.handleDictationRealtimeInput = handleDictationRealtimeInput;
window.toggleSpeechRecording = toggleSpeechRecording;
window.toggleDubRecording = toggleDubRecording;
window.evaluatePronunciation = evaluatePronunciation;
window.playUserRecordingAudio = playUserRecordingAudio;
window.playUserOrModelAudio = playUserOrModelAudio;
window.previewDubbing = previewDubbing;
window.stopDubbingPreview = stopDubbingPreview;
window.checkCurrentAnswer = checkDictationAnswer; // Fallback
window.showHint = showDictationHint; // Fallback
window.revealAnswer = showDictationHint; // Fallback
window.nextSentence = nextSentence;
window.prevSentence = prevSentence;
window.saveVocabWordToNotebook = saveVocabWordToNotebook;
window.speakChinese = speakChinese;
window.speakCurrentSentence = speakCurrentSentence;
window.openHanziModal = openHanziModal;
window.animateCurrentHanzi = animateCurrentHanzi;
window.closeHanziModal = closeHanziModal;
// Dynamic getters so inline onclick HTML can access live state
Object.defineProperty(window, 'currentLesson', {
  get: () => currentLesson,
  configurable: true
});
Object.defineProperty(window, 'currentSentenceIdx', {
  get: () => currentSentenceIdx,
  configurable: true
});
window.openLessonWorkspace = openLessonWorkspace;
window.returnToCatalog = returnToCatalog;
window.openAddVideoModal = openAddVideoModal;
window.closeAddVideoModal = closeAddVideoModal;
window.jumpToSentence = function (idx) {
  currentSentenceIdx = idx;
  lastPausedSentenceIdx = -1;
  renderCurrentSentence();
  playCurrentSentence();
};

window.toggleLessonCompleted = toggleLessonCompleted;
window.toggleCurrentLessonCompleted = toggleCurrentLessonCompleted;
window.getCompletedVideos = getCompletedVideos;
window.isLessonCompleted = isLessonCompleted;

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initVideoDictationPage);
} else {
  initVideoDictationPage();
}

