export function initSeasonalParticles() {
  let canvas = document.getElementById('seasonal-particle-canvas');
  if (!canvas) {
    canvas = document.createElement('canvas');
    canvas.id = 'seasonal-particle-canvas';
    canvas.style.cssText = 'position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 9999;';
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

  const ctx = canvas.getContext('2d');
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const month = new Date().getMonth() + 1; // 1 to 12
  let season = 'spring';
  if (month >= 1 && month <= 3) season = 'spring';
  else if (month >= 4 && month <= 6) season = 'summer';
  else if (month >= 7 && month <= 9) season = 'autumn';
  else season = 'winter';

  const particleCount = season === 'winter' ? 40 : 28;
  const particles = [];

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      size: season === 'winter' ? Math.random() * 3.5 + 2 : Math.random() * 7 + 5,
      speedY: Math.random() * 1.2 + 0.5,
      speedX: Math.sin(Math.random() * Math.PI) * 0.7,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 1.5,
      opacity: Math.random() * 0.65 + 0.35
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    if (localStorage.getItem('particles_enabled') !== 'false') {
      particles.forEach(p => {
        p.y += p.speedY;
        p.x += Math.sin(p.y * 0.01) * 0.5;
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
    }
    requestAnimationFrame(render);
  }

  render();
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
  let sessionSecs = 0;
  const API_BASE_URL = window.location.origin.includes('5173') ? 'http://localhost:5000' : window.location.origin;

  setInterval(() => {
    if (document.hasFocus()) {
      sessionSecs++;
      if (sessionSecs >= 15) {
        const increment = sessionSecs;
        sessionSecs = 0;
        const todayStr = new Date().toLocaleDateString('sv'); // YYYY-MM-DD

        fetch(API_BASE_URL + '/api/user/stats/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ incrementStudyTime: increment, localDateStr: todayStr }),
          credentials: 'include'
        }).catch(() => { });
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
