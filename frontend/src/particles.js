/**
 * Tiếng Trung HongTai - Ultra-Smooth Seasonal Particles Engine (Xuân - Hạ - Thu - Đông)
 * Optimized for Mobile 60Hz/120Hz Displays:
 * - Singleton Loop: Eliminates double RAF loops and clearing collisions (No more flickering / chớp nháy).
 * - Mobile Scroll Guard: Ignores address bar height resizing during touch scrolls.
 * - Retina/Hi-DPI Crispness: Clamped DPR (max 2) prevents subpixel shimmering.
 * - Natural Autumn Leaf Physics: Smooth horizontal sway + gentle 3D flutter without teleport jumps.
 */

// Global singleton instance on window to guarantee only 1 engine & 1 RAF loop ever exists
const GLOBAL_ENGINE_KEY = '__hongtai_seasonal_particles__';

function getGlobalEngine() {
  if (!window[GLOBAL_ENGINE_KEY]) {
    window[GLOBAL_ENGINE_KEY] = {
      canvas: null,
      ctx: null,
      width: 0,
      height: 0,
      dpr: 1,
      particles: [],
      animFrameId: null,
      lastTime: 0,
      season: 'autumn',
      isInitialized: false,
      resizeTimer: null,
      lastWidth: 0,
      lastHeight: 0
    };
  }
  return window[GLOBAL_ENGINE_KEY];
}

export function initSeasonalParticles() {
  const engine = getGlobalEngine();

  // If already initialized and running, do nothing
  if (engine.isInitialized && engine.animFrameId) {
    return;
  }

  // 1. Get or create single canvas
  let canvas = document.getElementById('seasonal-particle-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'seasonal-particle-canvas';
    // Clean fixed positioning without 3D transforms that cause layer flashing on mobile WebKit/Chromium
    canvas.style.cssText = 'position: fixed; inset: 0; width: 100%; height: 100%; pointer-events: none; z-index: 1; -webkit-backface-visibility: hidden; backface-visibility: hidden;';
    if (document.body) {
      document.body.insertBefore(canvas, document.body.firstChild);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        if (!document.getElementById('seasonal-particle-canvas')) {
          document.body.insertBefore(canvas, document.body.firstChild);
        }
      });
    }
  } else {
    canvas.style.position = 'fixed';
    canvas.style.inset = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.pointerEvents = 'none';
    canvas.style.zIndex = '1';
    canvas.style.webkitBackfaceVisibility = 'hidden';
    canvas.style.backfaceVisibility = 'hidden';
  }

  engine.canvas = canvas;
  const ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;
  engine.ctx = ctx;

  // 2. Determine Season based on current month
  // Month is 1-indexed (1 to 12). September = 9 (Autumn / Lá vàng mùa thu)
  const month = new Date().getMonth() + 1;
  let season = 'autumn';
  if (month >= 1 && month <= 3) season = 'spring';       // Hoa đào xuân
  else if (month >= 4 && month <= 6) season = 'summer';  // Lá xanh mùa hạ
  else if (month >= 7 && month <= 9) season = 'autumn';  // Lá vàng phong mùa thu
  else season = 'winter';                               // Bông tuyết mùa đông

  if (window.location.pathname.includes('documents')) {
    season = 'winter';
  }
  engine.season = season;

  // 3. Set Dimensions with DPR scaling (prevents blurry subpixel shimmering)
  const updateDimensions = (force = false) => {
    if (!engine.canvas) return;
    const winW = window.innerWidth || document.documentElement.clientWidth || 360;
    const winH = window.innerHeight || document.documentElement.clientHeight || 640;

    // Mobile Scroll Protection:
    // If not forced and on mobile, ignore minor height changes (< 140px) caused by address bar collapsing/expanding
    const isMobile = winW < 768;
    if (!force && isMobile && engine.lastWidth > 0) {
      const widthDiff = Math.abs(winW - engine.lastWidth);
      const heightDiff = Math.abs(winH - engine.lastHeight);
      if (widthDiff < 10 && heightDiff < 140) {
        return; // Skip canvas reset to prevent flashing while scrolling!
      }
    }

    engine.lastWidth = winW;
    engine.lastHeight = winH;
    engine.width = winW;
    engine.height = winH;

    // Clamp devicePixelRatio to max 2 for smooth mobile GPU performance
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    engine.dpr = dpr;

    engine.canvas.width = Math.floor(winW * dpr);
    engine.canvas.height = Math.floor(winH * dpr);
    engine.canvas.style.width = winW + 'px';
    engine.canvas.style.height = winH + 'px';

    engine.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };

  updateDimensions(true);

  // Debounced resize handler so mobile rotation or window resize doesn't spam canvas clears
  window.addEventListener('resize', () => {
    if (engine.resizeTimer) clearTimeout(engine.resizeTimer);
    engine.resizeTimer = setTimeout(() => {
      updateDimensions(false);
    }, 150);
  }, { passive: true });

  // 4. Initialize Smooth Particles
  const isMobile = engine.width < 768;
  const particleCount = isMobile ? 12 : 20;

  engine.particles = [];
  for (let i = 0; i < particleCount; i++) {
    const isSpecial = i % 3 === 0;
    engine.particles.push({
      baseX: Math.random() * engine.width,
      x: 0,
      y: Math.random() * (engine.height + 60) - 30,
      size: season === 'winter'
        ? (Math.random() * 3.2 + 2.0)
        : (isMobile ? Math.random() * 4.5 + 4.0 : Math.random() * 5.5 + 5.0),
      speedY: season === 'winter'
        ? (Math.random() * 0.5 + 0.3)
        : (Math.random() * 0.55 + 0.35),
      swayAmp: Math.random() * 25 + 15,       // Max sway distance in pixels
      swayFreq: Math.random() * 0.012 + 0.008, // Smooth horizontal frequency
      phase: Math.random() * Math.PI * 2,
      baseRotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 0.4,   // Gentle flutter rotation
      opacity: isMobile
        ? (Math.random() * 0.3 + 0.35)
        : (Math.random() * 0.35 + 0.4),
      // Autumn leaf color shades (warm golden amber, soft sunset orange, autumn red)
      colorType: i % 4,
      shape: isSpecial ? 'leaf_maple' : 'leaf_petal'
    });
  }

  // 5. Render Loop (Single RequestAnimationFrame)
  function render(currentTime) {
    if (localStorage.getItem('particles_enabled') === 'false' || document.hidden) {
      if (engine.ctx) engine.ctx.clearRect(0, 0, engine.width, engine.height);
      engine.animFrameId = null;
      return;
    }

    if (!engine.lastTime) engine.lastTime = currentTime;
    const elapsed = currentTime - engine.lastTime;
    engine.lastTime = currentTime;

    // Normalizing delta time against 60fps (16.67ms)
    // Clamped strictly between 0.3 and 1.8 to prevent jumpy lag or sudden frame leaps
    const dt = Math.min(Math.max(elapsed / 16.667, 0.3), 1.8);

    const w = engine.width;
    const h = engine.height;
    const currentSeason = engine.season;
    const c = engine.ctx;

    c.clearRect(0, 0, w, h);

    const count = engine.particles.length;
    for (let i = 0; i < count; i++) {
      const p = engine.particles[i];

      // Vertical fall
      p.y += p.speedY * dt;

      // Natural horizontal wave oscillation centered on baseX
      const swayOffset = Math.sin(p.y * p.swayFreq + p.phase) * p.swayAmp;
      p.x = p.baseX + swayOffset;

      // Gentle wobble rotation
      p.baseRotation += p.rotSpeed * dt;

      // Reset when particle falls past bottom of screen
      if (p.y > h + 35) {
        p.y = -35;
        p.baseX = Math.random() * w;
        p.phase = Math.random() * Math.PI * 2;
      }
      // Wrap smoothly horizontally if it drifted past edges
      if (p.baseX > w + 40) p.baseX = -30;
      if (p.baseX < -40) p.baseX = w + 30;

      c.save();
      c.translate(p.x, p.y);

      if (currentSeason === 'autumn') {
        // --- 🍁 MÙA THU: HIỆU ỨNG LÁ RƠI TỰ NHIÊN, KHÔNG CHỚP NHÁY ---
        // Natural 3D flutter: leaf tilts and gently flips side-to-side as it falls
        const flutterAngle = (p.baseRotation * Math.PI) / 180 + Math.sin(p.y * 0.015 + p.phase) * 0.35;
        const scaleX = Math.cos(p.y * 0.018 + p.phase); // 3D flip ratio (-1 to 1)

        c.rotate(flutterAngle);
        c.scale(scaleX, 1);
        c.globalAlpha = p.opacity;

        // Rich Autumn Color Palette
        let leafColor = '#f59e0b'; // Vàng ấm
        if (p.colorType === 1) leafColor = '#ea580c'; // Cam hổ phách
        else if (p.colorType === 2) leafColor = '#e11d48'; // Đỏ phong
        else if (p.colorType === 3) leafColor = '#d97706'; // Nâu mật ong

        c.fillStyle = leafColor;
        c.beginPath();

        if (p.shape === 'leaf_maple') {
          // Delicate 3-point maple leaf silhouette
          const s = p.size;
          c.moveTo(0, -s);
          c.quadraticCurveTo(s * 0.45, -s * 0.3, s * 0.7, -s * 0.1);
          c.quadraticCurveTo(s * 0.35, s * 0.2, s * 0.4, s * 0.7);
          c.quadraticCurveTo(0, s * 0.4, -s * 0.4, s * 0.7);
          c.quadraticCurveTo(-s * 0.35, s * 0.2, -s * 0.7, -s * 0.1);
          c.quadraticCurveTo(-s * 0.45, -s * 0.3, 0, -s);
        } else {
          // Smooth, aerodynamic leaf petal with tapered stem & tip
          const s = p.size;
          c.moveTo(0, -s);
          c.bezierCurveTo(s * 0.55, -s * 0.4, s * 0.55, s * 0.4, 0, s);
          c.bezierCurveTo(-s * 0.55, s * 0.4, -s * 0.55, -s * 0.4, 0, -s);
        }
        c.fill();

      } else if (currentSeason === 'winter') {
        // --- ❄️ MÙA ĐÔNG: BÔNG TUYẾT ---
        c.rotate((p.baseRotation * Math.PI) / 180);
        c.globalAlpha = p.opacity;

        if (p.shape === 'leaf_maple') {
          c.strokeStyle = 'rgba(255, 255, 255, 0.9)';
          c.lineWidth = Math.max(1, p.size * 0.2);
          c.lineCap = 'round';
          c.beginPath();
          for (let k = 0; k < 6; k++) {
            c.moveTo(0, 0);
            c.lineTo(0, p.size);
            c.moveTo(0, p.size * 0.55);
            c.lineTo(p.size * 0.25, p.size * 0.75);
            c.moveTo(0, p.size * 0.55);
            c.lineTo(-p.size * 0.25, p.size * 0.75);
            c.rotate(Math.PI / 3);
          }
          c.stroke();
        } else {
          const grad = c.createRadialGradient(0, 0, 0, 0, 0, p.size);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          grad.addColorStop(0.4, 'rgba(224, 242, 254, 0.75)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          c.fillStyle = grad;
          c.beginPath();
          c.arc(0, 0, p.size, 0, Math.PI * 2);
          c.fill();
        }

      } else if (currentSeason === 'spring') {
        // --- 🌸 MÙA XUÂN: CÁNH HOA ĐÀO ---
        const flutterAngle = (p.baseRotation * Math.PI) / 180;
        c.rotate(flutterAngle);
        c.scale(Math.cos(p.y * 0.02 + p.phase), 1);
        c.globalAlpha = p.opacity;
        c.fillStyle = 'rgba(255, 183, 197, 0.85)';
        c.beginPath();
        c.ellipse(0, 0, p.size, p.size * 0.55, 0, 0, Math.PI * 2);
        c.fill();

      } else if (currentSeason === 'summer') {
        // --- 🍃 MÙA HẠ: LÁ XANH BIẾC ---
        const flutterAngle = (p.baseRotation * Math.PI) / 180;
        c.rotate(flutterAngle);
        c.scale(Math.cos(p.y * 0.02 + p.phase), 1);
        c.globalAlpha = p.opacity;
        c.fillStyle = 'rgba(74, 222, 128, 0.8)';
        c.beginPath();
        c.ellipse(0, 0, p.size, p.size * 0.45, 0.3, 0, Math.PI * 2);
        c.fill();
      }

      c.restore();
    }

    engine.animFrameId = requestAnimationFrame(render);
  }

  function startLoop() {
    if (engine.animFrameId) {
      cancelAnimationFrame(engine.animFrameId);
      engine.animFrameId = null;
    }
    if (localStorage.getItem('particles_enabled') !== 'false' && !document.hidden) {
      engine.lastTime = performance.now();
      engine.animFrameId = requestAnimationFrame(render);
    }
  }

  engine.startLoop = startLoop;
  engine.isInitialized = true;

  const enabled = localStorage.getItem('particles_enabled') !== 'false';
  if (canvas) canvas.style.display = enabled ? 'block' : 'none';
  if (enabled) {
    startLoop();
  }

  // Handle visibility changes cleanly
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (engine.animFrameId) {
        cancelAnimationFrame(engine.animFrameId);
        engine.animFrameId = null;
      }
    } else {
      startLoop();
    }
  });

  window.startParticleLoop = startLoop;
}

window.initSeasonalParticles = initSeasonalParticles;

window.updateParticleToggleBtns = function (enabled) {
  const btns = document.querySelectorAll('#particle-toggle-btn, .particle-toggle-btn');
  btns.forEach(btn => {
    if (enabled) {
      btn.classList.remove('particles-off');
      btn.innerHTML = '<i class="fa-solid fa-snowflake" style="color: #38bdf8;"></i>';
      btn.title = 'Tắt hiệu ứng mùa rơi (Đang BẬT)';
    } else {
      btn.classList.add('particles-off');
      btn.innerHTML = '<i class="fa-solid fa-snowflake" style="opacity: 0.35; color: #94a3b8;"></i>';
      btn.title = 'Bật hiệu ứng mùa rơi (Đang TẮT)';
    }
  });
};

window.toggleSeasonalParticles = function () {
  const current = localStorage.getItem('particles_enabled') !== 'false';
  const next = !current;
  localStorage.setItem('particles_enabled', next ? 'true' : 'false');
  if (typeof window.updateParticleToggleBtns === 'function') {
    window.updateParticleToggleBtns(next);
  }
  const cv = document.getElementById('seasonal-particle-canvas');
  if (cv) cv.style.display = next ? 'block' : 'none';

  const engine = getGlobalEngine();
  if (next) {
    if (typeof engine.startLoop === 'function') {
      engine.startLoop();
    } else if (typeof window.startParticleLoop === 'function') {
      window.startParticleLoop();
    }
  } else {
    if (engine.animFrameId) {
      cancelAnimationFrame(engine.animFrameId);
      engine.animFrameId = null;
    }
    if (engine.ctx && engine.width && engine.height) {
      engine.ctx.clearRect(0, 0, engine.width, engine.height);
    }
  }
  if (typeof window.showToast === 'function') {
    window.showToast(next ? 'Đã bật hiệu ứng mùa rơi 🍁' : 'Đã tắt hiệu ứng mùa rơi để tăng tốc độ ⚡');
  }
};

// Global click handler for any particle toggle button
document.addEventListener('click', (e) => {
  const btn = e.target.closest('#particle-toggle-btn, .particle-toggle-btn');
  if (btn) {
    e.preventDefault();
    e.stopPropagation();
    window.toggleSeasonalParticles();
  }
});

// Universal Study Time Tracker across ALL HTML pages
(function initGlobalStudyTracker() {
  if (window.__hasMainStudyTimer) return;
  let sessionSecs = 0;
  const API_BASE_URL = window.location.origin.includes('5173') ? 'http://localhost:5000' : window.location.origin;

  function recordLocalStudyTime(secs) {
    if (!secs || secs <= 0) return;
    const todayStr = new Date().toLocaleDateString('sv');
    let userEmail = 'guest';
    try {
      const uRaw = localStorage.getItem('user');
      if (uRaw) {
        const u = JSON.parse(uRaw);
        if (u && u.email) userEmail = u.email;
      }
    } catch (e) { }

    const key = userEmail !== 'guest' ? `daily_study_history_${userEmail}` : 'daily_study_history_guest';
    try {
      const raw = localStorage.getItem(key);
      const history = raw ? JSON.parse(raw) : {};
      history[todayStr] = (history[todayStr] || 0) + secs;
      localStorage.setItem(key, JSON.stringify(history));

      // Also update user_stats cache in localStorage
      const statsKey = userEmail !== 'guest' ? `user_stats_${userEmail}` : 'user_stats_guest';
      const statsRaw = localStorage.getItem(statsKey);
      const cachedStats = statsRaw ? JSON.parse(statsRaw) : { streak: 0, studyTime: 0 };
      cachedStats.studyTime = (cachedStats.studyTime || 0) + secs;
      localStorage.setItem(statsKey, JSON.stringify(cachedStats));
    } catch (e) { }
  }

  setInterval(() => {
    if (window.__hasMainStudyTimer) return;
    if (document.hasFocus()) {
      sessionSecs++;
      if (sessionSecs >= 15) {
        const increment = sessionSecs;
        sessionSecs = 0;
        const todayStr = new Date().toLocaleDateString('sv'); // YYYY-MM-DD

        recordLocalStudyTime(increment);

        const token = localStorage.getItem('session_token');
        const headers = { 'Content-Type': 'application/json' };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
          headers['x-session-token'] = token;
        }

        fetch(API_BASE_URL + '/api/user/stats/sync', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify({ incrementStudyTime: increment, localDateStr: todayStr }),
          credentials: 'include'
        }).then(res => res.ok ? res.json() : null)
          .then(stats => {
            if (stats && stats.dailyHistory) {
              let userEmail = null;
              try {
                const uRaw = localStorage.getItem('user');
                if (uRaw) {
                  const u = JSON.parse(uRaw);
                  if (u && u.email) userEmail = u.email;
                }
              } catch (e) { }
              if (userEmail) {
                try {
                  localStorage.setItem(`daily_study_history_${userEmail}`, JSON.stringify(stats.dailyHistory));
                  localStorage.setItem(`user_stats_${userEmail}`, JSON.stringify({ streak: stats.streak, studyTime: stats.studyTime }));
                } catch (e) { }
              }
            }
          })
          .catch(() => { });
      }
    }
  }, 1000);
})();

// Auto run when script loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initSeasonalParticles();
    const enabled = localStorage.getItem('particles_enabled') !== 'false';
    if (window.updateParticleToggleBtns) window.updateParticleToggleBtns(enabled);
  });
} else {
  initSeasonalParticles();
  const enabled = localStorage.getItem('particles_enabled') !== 'false';
  if (window.updateParticleToggleBtns) window.updateParticleToggleBtns(enabled);
}
