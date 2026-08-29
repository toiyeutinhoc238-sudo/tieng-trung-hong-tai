export function initSeasonalParticles() {
  let canvas = document.getElementById('seasonal-particle-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'seasonal-particle-canvas';
    canvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 9999; will-change: transform; transform: translateZ(0);';
    if (document.body) {
      document.body.insertBefore(canvas, document.body.firstChild);
    } else {
      document.addEventListener('DOMContentLoaded', () => {
        document.body.insertBefore(canvas, document.body.firstChild);
      });
    }
  }

  const enabled = localStorage.getItem('particles_enabled') !== 'false';
  if (canvas) {
    canvas.style.display = enabled ? 'block' : 'none';
  }

  const ctx = canvas.getContext('2d', { alpha: true });
  // Limit canvas internal resolution to max 1280x720 to save 80% GPU memory on 4K/Retina
  let width = (canvas.width = Math.min(window.innerWidth, 1280));
  let height = (canvas.height = Math.min(window.innerHeight, 720));

  window.addEventListener('resize', () => {
    width = canvas.width = Math.min(window.innerWidth, 1280);
    height = canvas.height = Math.min(window.innerHeight, 720);
  }, { passive: true });

  const month = new Date().getMonth() + 1;
  let season = 'spring';
  if (month >= 1 && month <= 3) season = 'spring';
  else if (month >= 4 && month <= 6) season = 'summer';
  else if (month >= 7 && month <= 9) season = 'autumn';
  else season = 'winter';

  const isMobile = window.innerWidth < 768;
  const particleCount = isMobile ? 10 : (season === 'winter' ? 22 : 16);
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: season === 'winter' ? Math.random() * 2.5 + 2 : Math.random() * 5 + 3,
      speedY: Math.random() * 0.8 + 0.3,
      speedX: Math.sin(Math.random() * Math.PI) * 0.4,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 1.0,
      opacity: Math.random() * 0.55 + 0.25
    });
  }

  let animFrameId = null;
  let isTabVisible = !document.hidden;
  let isScrolling = false;
  let scrollTimeout = null;
  let lastFrameTime = 0;
  const targetInterval = 1000 / 30; // 30 FPS cap

  // Pause on background tab
  document.addEventListener('visibilitychange', () => {
    isTabVisible = !document.hidden;
    if (isTabVisible && !animFrameId && localStorage.getItem('particles_enabled') !== 'false') {
      animFrameId = requestAnimationFrame(render);
    }
  }, { passive: true });

  // Pause during active scrolling to give 100% 60-120fps smooth scrolling
  window.addEventListener('scroll', () => {
    isScrolling = true;
    if (scrollTimeout) clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
      if (isTabVisible && !animFrameId && localStorage.getItem('particles_enabled') !== 'false') {
        animFrameId = requestAnimationFrame(render);
      }
    }, 150);
  }, { passive: true });

  function render(timestamp) {
    if (!isTabVisible || isScrolling || localStorage.getItem('particles_enabled') === 'false') {
      animFrameId = null;
      return;
    }

    // 30 FPS throttling
    if (timestamp - lastFrameTime < targetInterval) {
      animFrameId = requestAnimationFrame(render);
      return;
    }
    lastFrameTime = timestamp;

    ctx.clearRect(0, 0, width, height);

    particles.forEach(p => {
      p.y += p.speedY;
      p.x += Math.sin(p.y * 0.01) * 0.3;
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

    animFrameId = requestAnimationFrame(render);
  }

  if (localStorage.getItem('particles_enabled') !== 'false') {
    animFrameId = requestAnimationFrame(render);
  }

  window.startParticleLoop = () => {
    if (!animFrameId && localStorage.getItem('particles_enabled') !== 'false') {
      animFrameId = requestAnimationFrame(render);
    }
  };
}

window.updateParticleToggleBtns = function(enabled) {
  const btns = document.querySelectorAll('#particle-toggle-btn, .particle-toggle-btn');
  btns.forEach(btn => {
    if (enabled) {
      btn.classList.remove('particles-off');
      btn.innerHTML = '<i class="fa-solid fa-snowflake" style="color: #3b82f6;"></i>';
      btn.title = 'Tắt hiệu ứng rơi động (Đang BẬT)';
    } else {
      btn.classList.add('particles-off');
      btn.innerHTML = '<i class="fa-solid fa-snowflake" style="opacity: 0.35; color: #94a3b8;"></i>';
      btn.title = 'Bật hiệu ứng rơi động (Đang TẮT)';
    }
  });
};

window.toggleSeasonalParticles = function() {
  const current = localStorage.getItem('particles_enabled') !== 'false';
  const next = !current;
  localStorage.setItem('particles_enabled', next ? 'true' : 'false');
  if (window.updateParticleToggleBtns) {
    window.updateParticleToggleBtns(next);
  }
  const cv = document.getElementById('seasonal-particle-canvas');
  if (cv) cv.style.display = next ? 'block' : 'none';
};

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
    } catch (e) {}

    const key = userEmail !== 'guest' ? `daily_study_history_${userEmail}` : 'daily_study_history_guest';
    try {
      const raw = localStorage.getItem(key);
      const history = raw ? JSON.parse(raw) : {};
      history[todayStr] = (history[todayStr] || 0) + secs;
      localStorage.setItem(key, JSON.stringify(history));

      // Also update user_stats cache in localStorage
      const statsKey = userEmail !== 'guest' ? `user_stats_${userEmail}` : 'user_stats_guest';
      const statsRaw = localStorage.getItem(statsKey);
      const cachedStats = statsRaw ? JSON.parse(statsRaw) : { streak: 1, studyTime: 0 };
      cachedStats.studyTime = (cachedStats.studyTime || 0) + secs;
      localStorage.setItem(statsKey, JSON.stringify(cachedStats));
    } catch (e) {}
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
              } catch (e) {}
              if (userEmail) {
                try {
                  localStorage.setItem(`daily_study_history_${userEmail}`, JSON.stringify(stats.dailyHistory));
                  localStorage.setItem(`user_stats_${userEmail}`, JSON.stringify({ streak: stats.streak, studyTime: stats.studyTime }));
                } catch (e) {}
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
