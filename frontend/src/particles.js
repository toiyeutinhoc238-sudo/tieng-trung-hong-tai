/**
 * Tiếng Trung HongTai - High-Performance Seasonal Particles Engine (Xuân - Hạ - Thu - Đông)
 * Optimized for 60Hz/120Hz displays with delta-time normalization, zero jitter, and hardware acceleration.
 */

let canvas = null;
let ctx = null;
let width = 0;
let height = 0;
let particles = [];
let animFrameId = null;
let lastTime = 0;
let isInitialized = false;

export function initSeasonalParticles() {
  if (isInitialized && animFrameId) return;

  canvas = document.getElementById('seasonal-particle-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'seasonal-particle-canvas';
    canvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 1; will-change: transform; transform: translateZ(0);';
    if (document.body) {
      document.body.insertBefore(canvas, document.body.firstChild);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.insertBefore(canvas, document.body.firstChild);
      });
    }
  } else {
    // Ensure proper z-index and hardware layer
    canvas.style.zIndex = '1';
    canvas.style.willChange = 'transform';
    canvas.style.transform = 'translateZ(0)';
  }

  ctx = canvas.getContext('2d', { alpha: true });
  if (!ctx) return;

  const updateDimensions = () => {
    if (!canvas) return;
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  };
  updateDimensions();

  window.addEventListener('resize', updateDimensions, { passive: true });

  const month = new Date().getMonth() + 1; // 1 to 12
  let season = 'spring';
  if (month >= 1 && month <= 3) season = 'spring';       // Hoa đào xuân
  else if (month >= 4 && month <= 6) season = 'summer';  // Lá xanh mùa hạ
  else if (month >= 7 && month <= 9) season = 'autumn';  // Lá vàng phong mùa thu
  else season = 'winter';                               // Bông tuyết mùa đông

  if (window.location.pathname.includes('documents')) {
    season = 'winter';
  }

  // Smooth, subtle particle count for optimal FPS on phones & tablets
  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 12 : 20;

  particles = [];
  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: season === 'winter' ? (Math.random() * 3.5 + 2) : (Math.random() * 5 + 4),
      speedY: season === 'winter' ? (Math.random() * 0.7 + 0.35) : (Math.random() * 0.8 + 0.4),
      speedX: Math.random() * 0.6 + 0.2,
      phase: Math.random() * Math.PI * 2,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 0.8,
      opacity: isMobile ? (Math.random() * 0.35 + 0.25) : (Math.random() * 0.4 + 0.3),
      shape: i % 3 === 0 ? 'crystal' : 'glow'
    });
  }

  isInitialized = true;

  function render(currentTime) {
    if (localStorage.getItem('particles_enabled') === 'false' || document.hidden) {
      if (ctx) ctx.clearRect(0, 0, width, height);
      animFrameId = null;
      return;
    }

    if (!lastTime) lastTime = currentTime;
    // Delta-time normalization: 1.0 at 60fps, 0.5 at 120fps, clamped to prevent jumpy lag
    const elapsed = currentTime - lastTime;
    lastTime = currentTime;
    const dt = Math.min(Math.max(elapsed / 16.667, 0.2), 2.0);

    ctx.clearRect(0, 0, width, height);

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];
      p.y += p.speedY * dt;
      p.x += Math.sin(p.y * 0.012 + p.phase) * p.speedX * dt;
      p.rotation += p.rotSpeed * dt;

      if (p.y > height + 25) {
        p.y = -25;
        p.x = Math.random() * width;
      }
      if (p.x > width + 25) p.x = -25;
      if (p.x < -25) p.x = width + 25;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.globalAlpha = p.opacity;

      if (season === 'winter') {
        if (p.shape === 'crystal') {
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
          ctx.lineWidth = Math.max(1, p.size * 0.2);
          ctx.lineCap = 'round';
          ctx.beginPath();
          for (let k = 0; k < 6; k++) {
            ctx.moveTo(0, 0);
            ctx.lineTo(0, p.size);
            ctx.moveTo(0, p.size * 0.55);
            ctx.lineTo(p.size * 0.25, p.size * 0.75);
            ctx.moveTo(0, p.size * 0.55);
            ctx.lineTo(-p.size * 0.25, p.size * 0.75);
            ctx.rotate(Math.PI / 3);
          }
          ctx.stroke();
        } else {
          const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, p.size);
          grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
          grad.addColorStop(0.4, 'rgba(224, 242, 254, 0.75)');
          grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        }
      } else if (season === 'spring') {
        ctx.fillStyle = 'rgba(255, 183, 197, 0.75)';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (season === 'summer') {
        ctx.fillStyle = 'rgba(74, 222, 128, 0.7)';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.4, 0.4, 0, Math.PI * 2);
        ctx.fill();
      } else if (season === 'autumn') {
        // Delicate golden maple leaf petal with smooth gradient
        ctx.fillStyle = 'rgba(245, 158, 11, 0.75)';
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.5, 0.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    }

    animFrameId = requestAnimationFrame(render);
  }

  function startLoop() {
    if (!animFrameId && localStorage.getItem('particles_enabled') !== 'false' && !document.hidden) {
      lastTime = performance.now();
      animFrameId = requestAnimationFrame(render);
    }
  }

  const enabled = localStorage.getItem('particles_enabled') !== 'false';
  if (canvas) canvas.style.display = enabled ? 'block' : 'none';
  if (enabled) {
    startLoop();
  }

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
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
  if (next) {
    if (typeof window.startParticleLoop === 'function') {
      window.startParticleLoop();
    }
  } else {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (ctx && width && height) {
      ctx.clearRect(0, 0, width, height);
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
