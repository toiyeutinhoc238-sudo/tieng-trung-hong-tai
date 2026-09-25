(function(){const c=document.createElement("link").relList;if(c&&c.supports&&c.supports("modulepreload"))return;for(const r of document.querySelectorAll('link[rel="modulepreload"]'))h(r);new MutationObserver(r=>{for(const d of r)if(d.type==="childList")for(const p of d.addedNodes)p.tagName==="LINK"&&p.rel==="modulepreload"&&h(p)}).observe(document,{childList:!0,subtree:!0});function o(r){const d={};return r.integrity&&(d.integrity=r.integrity),r.referrerPolicy&&(d.referrerPolicy=r.referrerPolicy),r.crossOrigin==="use-credentials"?d.credentials="include":r.crossOrigin==="anonymous"?d.credentials="omit":d.credentials="same-origin",d}function h(r){if(r.ep)return;r.ep=!0;const d=o(r);fetch(r.href,d)}})();let g=null,a=null,w=0,y=0,S=[],b=null,v=0,I=!1;function L(){if(I&&b||(g=document.getElementById("seasonal-particle-canvas"),g?(g.style.zIndex="1",g.style.willChange="transform",g.style.transform="translateZ(0)"):(g=document.createElement("canvas"),g.id="seasonal-particle-canvas",g.style.cssText="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 1; will-change: transform; transform: translateZ(0);",document.body?document.body.insertBefore(g,document.body.firstChild):document.addEventListener("DOMContentLoaded",()=>{document.body.insertBefore(g,document.body.firstChild)})),a=g.getContext("2d",{alpha:!0}),!a))return;const f=()=>{g&&(w=g.width=window.innerWidth,y=g.height=window.innerHeight)};f(),window.addEventListener("resize",f,{passive:!0});const c=new Date().getMonth()+1;let o="spring";c>=1&&c<=3?o="spring":c>=4&&c<=6?o="summer":c>=7&&c<=9?o="autumn":o="winter",window.location.pathname.includes("documents")&&(o="winter");const h=window.innerWidth<768,r=h?12:20;S=[];for(let i=0;i<r;i++)S.push({x:Math.random()*w,y:Math.random()*y,size:o==="winter"?Math.random()*3.5+2:Math.random()*5+4,speedY:o==="winter"?Math.random()*.7+.35:Math.random()*.8+.4,speedX:Math.random()*.6+.2,phase:Math.random()*Math.PI*2,rotation:Math.random()*360,rotSpeed:(Math.random()-.5)*.8,opacity:h?Math.random()*.35+.25:Math.random()*.4+.3,shape:i%3===0?"crystal":"glow"});I=!0;function d(i){if(localStorage.getItem("particles_enabled")==="false"||document.hidden){a&&a.clearRect(0,0,w,y),b=null;return}v||(v=i);const s=i-v;v=i;const n=Math.min(Math.max(s/16.667,.2),2);a.clearRect(0,0,w,y);for(let l=0;l<S.length;l++){const t=S[l];if(t.y+=t.speedY*n,t.x+=Math.sin(t.y*.012+t.phase)*t.speedX*n,t.rotation+=t.rotSpeed*n,t.y>y+25&&(t.y=-25,t.x=Math.random()*w),t.x>w+25&&(t.x=-25),t.x<-25&&(t.x=w+25),a.save(),a.translate(t.x,t.y),a.rotate(t.rotation*Math.PI/180),a.globalAlpha=t.opacity,o==="winter")if(t.shape==="crystal"){a.strokeStyle="rgba(255, 255, 255, 0.9)",a.lineWidth=Math.max(1,t.size*.2),a.lineCap="round",a.beginPath();for(let m=0;m<6;m++)a.moveTo(0,0),a.lineTo(0,t.size),a.moveTo(0,t.size*.55),a.lineTo(t.size*.25,t.size*.75),a.moveTo(0,t.size*.55),a.lineTo(-t.size*.25,t.size*.75),a.rotate(Math.PI/3);a.stroke()}else{const m=a.createRadialGradient(0,0,0,0,0,t.size);m.addColorStop(0,"rgba(255, 255, 255, 0.95)"),m.addColorStop(.4,"rgba(224, 242, 254, 0.75)"),m.addColorStop(1,"rgba(255, 255, 255, 0)"),a.fillStyle=m,a.beginPath(),a.arc(0,0,t.size,0,Math.PI*2),a.fill()}else o==="spring"?(a.fillStyle="rgba(255, 183, 197, 0.75)",a.beginPath(),a.ellipse(0,0,t.size,t.size*.5,0,0,Math.PI*2),a.fill()):o==="summer"?(a.fillStyle="rgba(74, 222, 128, 0.7)",a.beginPath(),a.ellipse(0,0,t.size,t.size*.4,.4,0,Math.PI*2),a.fill()):o==="autumn"&&(a.fillStyle="rgba(245, 158, 11, 0.75)",a.beginPath(),a.ellipse(0,0,t.size,t.size*.5,.5,0,Math.PI*2),a.fill());a.restore()}b=requestAnimationFrame(d)}function p(){!b&&localStorage.getItem("particles_enabled")!=="false"&&!document.hidden&&(v=performance.now(),b=requestAnimationFrame(d))}const e=localStorage.getItem("particles_enabled")!=="false";g&&(g.style.display=e?"block":"none"),e&&p(),document.addEventListener("visibilitychange",()=>{document.hidden?b&&(cancelAnimationFrame(b),b=null):p()}),window.startParticleLoop=p}window.initSeasonalParticles=L;window.updateParticleToggleBtns=function(f){document.querySelectorAll("#particle-toggle-btn, .particle-toggle-btn").forEach(o=>{f?(o.classList.remove("particles-off"),o.innerHTML='<i class="fa-solid fa-snowflake" style="color: #38bdf8;"></i>',o.title="Tắt hiệu ứng mùa rơi (Đang BẬT)"):(o.classList.add("particles-off"),o.innerHTML='<i class="fa-solid fa-snowflake" style="opacity: 0.35; color: #94a3b8;"></i>',o.title="Bật hiệu ứng mùa rơi (Đang TẮT)")})};window.toggleSeasonalParticles=function(){const c=!(localStorage.getItem("particles_enabled")!=="false");localStorage.setItem("particles_enabled",c?"true":"false"),typeof window.updateParticleToggleBtns=="function"&&window.updateParticleToggleBtns(c);const o=document.getElementById("seasonal-particle-canvas");o&&(o.style.display=c?"block":"none"),c?typeof window.startParticleLoop=="function"&&window.startParticleLoop():(b&&(cancelAnimationFrame(b),b=null),a&&w&&y&&a.clearRect(0,0,w,y)),typeof window.showToast=="function"&&window.showToast(c?"Đã bật hiệu ứng mùa rơi 🍁":"Đã tắt hiệu ứng mùa rơi để tăng tốc độ ⚡")};document.addEventListener("click",f=>{f.target.closest("#particle-toggle-btn, .particle-toggle-btn")&&(f.preventDefault(),f.stopPropagation(),window.toggleSeasonalParticles())});(function(){if(window.__hasMainStudyTimer)return;let c=0;const o=window.location.origin.includes("5173")?"http://localhost:5000":window.location.origin;function h(r){if(!r||r<=0)return;const d=new Date().toLocaleDateString("sv");let p="guest";try{const i=localStorage.getItem("user");if(i){const s=JSON.parse(i);s&&s.email&&(p=s.email)}}catch{}const e=p!=="guest"?`daily_study_history_${p}`:"daily_study_history_guest";try{const i=localStorage.getItem(e),s=i?JSON.parse(i):{};s[d]=(s[d]||0)+r,localStorage.setItem(e,JSON.stringify(s));const n=p!=="guest"?`user_stats_${p}`:"user_stats_guest",l=localStorage.getItem(n),t=l?JSON.parse(l):{streak:0,studyTime:0};t.studyTime=(t.studyTime||0)+r,localStorage.setItem(n,JSON.stringify(t))}catch{}}setInterval(()=>{if(!window.__hasMainStudyTimer&&document.hasFocus()&&(c++,c>=15)){const r=c;c=0;const d=new Date().toLocaleDateString("sv");h(r);const p=localStorage.getItem("session_token"),e={"Content-Type":"application/json"};p&&(e.Authorization=`Bearer ${p}`,e["x-session-token"]=p),fetch(o+"/api/user/stats/sync",{method:"POST",headers:e,body:JSON.stringify({incrementStudyTime:r,localDateStr:d}),credentials:"include"}).then(i=>i.ok?i.json():null).then(i=>{if(i&&i.dailyHistory){let s=null;try{const n=localStorage.getItem("user");if(n){const l=JSON.parse(n);l&&l.email&&(s=l.email)}}catch{}if(s)try{localStorage.setItem(`daily_study_history_${s}`,JSON.stringify(i.dailyHistory)),localStorage.setItem(`user_stats_${s}`,JSON.stringify({streak:i.streak,studyTime:i.studyTime}))}catch{}}}).catch(()=>{})}},1e3)})();if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{L();const f=localStorage.getItem("particles_enabled")!=="false";window.updateParticleToggleBtns&&window.updateParticleToggleBtns(f)});else{L();const f=localStorage.getItem("particles_enabled")!=="false";window.updateParticleToggleBtns&&window.updateParticleToggleBtns(f)}(function(){function f(){const e=window.location.pathname.toLowerCase(),i=window.location.search.toLowerCase();return e==="/"||e.endsWith("/index.html")?i.includes("tab=flashcards")?"flashcards":i.includes("view=roadmap")||window.location.hash.includes("roadmap")?"roadmap":"home":e.includes("video-dictation")?i.includes("mode=shadowing")?"shadowing":"dictation":e.includes("translation-practice")||e.includes("paragraph-practice")?"translation":e.includes("writing-practice")?"writing":e.includes("speaking-practice")?"speaking":e.includes("sentence-reorder")?"sentence-reorder":e.includes("ai-dialogue")?"ai-dialogue":e.includes("reading-practice")?"reading":e.includes("chinese-phonetics")?"phonetics":e.includes("chinese-radicals")?"radicals":e.includes("hanzi-writer")?"hanzi":e.includes("hsk-grammar")?"grammar":e.includes("lesson-texts")?"texts":e.includes("vocab-practice")?"vocab-practice":e.includes("detail-list")?"vocabulary":e.includes("quiz-game")?"games":e.includes("han-viet-rules")?"rules":e.includes("rank")?"rank":e.includes("documents")?"documents":""}function c(){try{const e=localStorage.getItem("user")||localStorage.getItem("hongtai_current_user")||localStorage.getItem("currentUser")||sessionStorage.getItem("user");if(e)return JSON.parse(e)}catch{}return null}function o(){const e=c();document.querySelectorAll(".app-sidebar, .global-app-sidebar").forEach(s=>{const n=s.querySelector(".user-name, #user-display-name"),l=s.querySelector(".user-sub, #user-display-email"),t=s.querySelector(".user-role-badge, #user-display-role"),m=s.querySelector(".sidebar-avatar-wrap"),u=s.querySelector(".sidebar-auth-action-item");if(e&&(e.name||e.email)){const x=e.name||e.displayName||(e.email?e.email.split("@")[0]:"Học viên"),k=e.email||"",M=e.role==="super_admin"?"Super Admin":e.role==="admin"?"Admin":e.role==="teacher"?"Giáo viên":"Học viên",T=e.picture||e.avatar||"";n&&(n.textContent=x),l&&(l.textContent=k),t&&(t.textContent=M),m&&(T?m.innerHTML=`<img class="user-avatar-img" src="${T}" alt="Avatar" style="display: block; width: 44px; height: 44px; border-radius: 50%; object-fit: cover;">`:m.innerHTML='<div class="user-avatar sidebar-avatar-placeholder"><i class="fa-solid fa-user"></i></div>'),u&&(u.innerHTML=`
            <a href="javascript:void(0)" class="logout-link" onclick="window.handleGlobalLogout && window.handleGlobalLogout(event)" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #f87171; font-size: 0.88rem; font-weight: 600; text-decoration: none; transition: all 0.2s;">
              <i class="fa-solid fa-right-from-bracket" style="color: #f87171;"></i> <span>Đăng xuất</span>
            </a>
          `)}else n&&(n.textContent="Khách (Chưa đăng nhập)"),l&&(l.textContent="Đăng nhập để lưu tiến độ học"),t&&(t.textContent="Khách"),m&&(m.innerHTML='<div class="user-avatar sidebar-avatar-placeholder"><i class="fa-solid fa-user"></i></div>'),u&&(u.innerHTML=`
            <a href="javascript:void(0)" onclick="window.openLoginPrompt && window.openLoginPrompt()" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #4ade80; font-size: 0.88rem; font-weight: 700; text-decoration: none; transition: all 0.2s;">
              <i class="fa-brands fa-google" style="color: #4ade80;"></i> <span>Đăng nhập Google</span>
            </a>
          `)})}function h(){const e=f(),i=c(),s=i?i.name||i.displayName||(i.email?i.email.split("@")[0]:"Học viên"):"Khách (Chưa đăng nhập)",n=i?i.email||"":"Đăng nhập để lưu tiến độ học",l=i?i.role==="super_admin"?"Super Admin":i.role==="admin"?"Admin":i.role==="teacher"?"Giáo viên":"Học viên":"Khách",t=i&&(i.picture||i.avatar)?i.picture||i.avatar:"";return`
    <aside class="app-sidebar global-sidebar-drawer" id="global-app-sidebar">
      <div class="sidebar-header">
        <a href="/" style="display: flex; align-items: center; gap: 12px; cursor: pointer; flex: 1; text-decoration: none;">
          <img class="sidebar-logo" src="/assets/logo.png" alt="Hongtai Logo">
          <div style="display: flex; flex-direction: column;">
            <span style="font-weight: 800; font-size: 1.05rem; color: var(--text-primary, #ffffff); letter-spacing: -0.01em;">Hongtai Chinese</span>
          </div>
        </a>
        <button class="sidebar-toggle-btn" onclick="window.closeGlobalSidebar()" title="Đóng Menu (✕)">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- User Account Card with Interactive Dropdown -->
      <div class="auth-container ${i?"logged-in":"logged-out"}" style="width: 100%; border-bottom: 1px solid var(--border-glass, rgba(255,255,255,0.12)); padding-bottom: 12px; margin-bottom: 12px; position: relative;">
        <div class="user-dropdown" style="width: 100%; position: relative;">
          <div class="user-profile sidebar-profile-card" onclick="window.toggleGlobalUserDropdown && window.toggleGlobalUserDropdown(event)"
            style="cursor: pointer; display: flex; align-items: center; justify-content: space-between; padding: 10px 12px; background: rgba(255, 255, 255, 0.04); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.08); transition: all 0.2s ease;">
            <div style="display: flex; align-items: center; gap: 10px; min-width: 0; flex: 1;">
              <div class="sidebar-avatar-wrap" style="flex-shrink: 0;">
                ${t?`<img class="user-avatar-img" src="${t}" alt="Avatar" style="display: block; width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-blue, #38bdf8);">`:'<div class="user-avatar sidebar-avatar-placeholder" style="width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white;"><i class="fa-solid fa-user"></i></div>'}
              </div>
              <div class="user-info" style="min-width: 0; flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                <span class="user-name" style="font-weight: 700; font-size: 0.92rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${s}</span>
                <span class="user-sub" style="font-size: 0.72rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${n}</span>
                <span class="user-role-badge" style="font-size: 0.68rem; margin-top: 2px; align-self: flex-start;">${l}</span>
              </div>
            </div>
            <i class="fa-solid fa-chevron-down profile-chevron" style="color: #94a3b8; font-size: 0.8rem; margin-left: 8px; transition: transform 0.2s ease;"></i>
          </div>

          <!-- Dropdown menu with 3 options -->
          <ul class="profile-dropdown-menu" style="position: absolute; top: calc(100% + 6px); left: 0; right: 0; width: 100%; background: #1e293b; background-color: rgba(30, 41, 59, 0.98); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.18); border-radius: 12px; box-shadow: 0 14px 35px rgba(0,0,0,0.6); padding: 8px 6px; list-style: none; z-index: 9999; margin: 0; box-sizing: border-box;">
            <li>
              <a href="/chat-history.html" class="history-link" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #cbd5e1; font-size: 0.88rem; font-weight: 500; text-decoration: none; transition: all 0.2s;">
                <i class="fa-solid fa-clock-rotate-left" style="color: #38bdf8;"></i> <span>Lịch sử cuộc trò chuyện</span>
              </a>
            </li>
            <li>
              <a href="/rank.html" id="game-history-btn" class="history-link" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #cbd5e1; font-size: 0.88rem; font-weight: 500; text-decoration: none; transition: all 0.2s;">
                <i class="fa-solid fa-gamepad" style="color: #fbbf24;"></i> <span>Lịch sử chơi & Xếp hạng</span>
              </a>
            </li>
            <li class="sidebar-auth-action-item">
              ${i?`
              <a href="javascript:void(0)" class="logout-link" onclick="window.handleGlobalLogout && window.handleGlobalLogout(event)" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #f87171; font-size: 0.88rem; font-weight: 600; text-decoration: none; transition: all 0.2s;">
                <i class="fa-solid fa-right-from-bracket" style="color: #f87171;"></i> <span>Đăng xuất</span>
              </a>
              `:`
              <a href="javascript:void(0)" onclick="window.openLoginPrompt && window.openLoginPrompt()" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #4ade80; font-size: 0.88rem; font-weight: 700; text-decoration: none; transition: all 0.2s;">
                <i class="fa-brands fa-google" style="color: #4ade80;"></i> <span>Đăng nhập Google</span>
              </a>
              `}
            </li>
          </ul>
        </div>
      </div>

      <div class="sidebar-menu-wrapper" style="width: 100%; box-sizing: border-box;">
        <!-- TRANG CHỦ -->
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item ${e==="home"?"active":""}" onclick="window.location.href = '/'">
            <i class="fa-solid fa-house"></i> <span>Trang chủ</span>
          </li>
        </ul>

        <!-- DANH MỤC: HỌC TẬP -->
        <div class="sidebar-section-label">Học Tập</div>
        <ul class="sidebar-menu" style="margin-bottom: 8px;">
          <li class="sidebar-item ${e==="roadmap"?"active":""}" onclick="window.location.href = '/index.html#roadmap'">
            <i class="fa-solid fa-route" style="color: #60a5fa;"></i> <span>Lộ trình</span>
          </li>
          <li class="sidebar-item ${e==="vocabulary"?"active":""}" onclick="window.location.href = '/detail-list.html'">
            <i class="fa-solid fa-font" style="color: #38bdf8;"></i> <span>Từ vựng HSK</span>
          </li>
          <li class="sidebar-item ${e==="radicals"?"active":""}" onclick="window.location.href = '/chinese-radicals.html'">
            <i class="fa-solid fa-shapes" style="color: #a855f7;"></i> <span>Bảng Bộ Thủ</span>
          </li>
          <li class="sidebar-item ${e==="phonetics"?"active":""}" onclick="window.location.href = '/chinese-phonetics.html'">
            <i class="fa-solid fa-table-cells" style="color: #38bdf8;"></i> <span>Bảng Phiên Âm (Pinyin)</span>
          </li>
          <li class="sidebar-item ${e==="hanzi"?"active":""}" onclick="window.location.href = '/hanzi-writer.html'">
            <i class="fa-solid fa-pen-nib" style="color: #f59e0b;"></i> <span>Tập viết chữ Hán</span>
          </li>
          <li class="sidebar-item ${e==="grammar"?"active":""}" onclick="window.location.href = '/hsk-grammar.html'">
            <i class="fa-solid fa-spell-check" style="color: #34d399;"></i> <span>Sổ tay Ngữ Pháp</span>
          </li>
        </ul>

        <!-- DANH MỤC: TRÒ CHƠI -->
        <div class="sidebar-section-label">Trò Chơi</div>
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item ${e==="games"?"active":""}" onclick="window.location.href = '/quiz-game.html'">
            <i class="fa-solid fa-gamepad" style="color: #f59e0b;"></i> <span>Trò Chơi Ôn Tập</span>
          </li>
        </ul>

        <!-- DANH MỤC: KỸ NĂNG -->
        <div class="sidebar-section-label">Kỹ Năng & Video</div>
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item ${e==="shadowing"?"active":""}" onclick="window.location.href = '/video-dictation.html?mode=shadowing'">
            <i class="fa-solid fa-microphone-lines" style="color: #10b981;"></i> <span>Shadowing Video</span>
          </li>
          <li class="sidebar-item ${e==="dictation"?"active":""}" onclick="window.location.href = '/video-dictation.html?mode=dictation'">
            <i class="fa-solid fa-pen-to-square" style="color: #38bdf8;"></i> <span>Chép Chính Tả</span>
          </li>
          <li class="sidebar-item ${e==="reading"?"active":""}" onclick="window.location.href = '/reading-practice.html'">
            <i class="fa-solid fa-book-open-reader" style="color: #ec4899;"></i> <span>Luyện Đọc HSK</span>
          </li>
          <li class="sidebar-item ${e==="writing"?"active":""}" onclick="window.location.href = '/writing-practice.html'">
            <i class="fa-solid fa-feather-pointed" style="color: #a855f7;"></i> <span>Luyện Viết & AI Chấm</span>
          </li>
          <li class="sidebar-item ${e==="speaking"?"active":""}" onclick="window.location.href = '/speaking-practice.html'">
            <i class="fa-solid fa-microphone-lines" style="color: #f59e0b;"></i> <span>Luyện Nói</span>
          </li>
          <li class="sidebar-item ${e==="translation"?"active":""}" onclick="window.location.href = '/translation-practice.html'">
            <i class="fa-solid fa-language" style="color: #06b6d4;"></i> <span>Luyện Dịch &amp; Nghe Đoạn</span>
          </li>
          <li class="sidebar-item ${e==="sentence-reorder"?"active":""}" onclick="window.location.href = '/sentence-reorder.html'">
            <i class="fa-solid fa-arrow-down-short-wide" style="color: #38bdf8;"></i> <span>Sắp Xếp Câu</span>
          </li>
          <li class="sidebar-item ${e==="ai-dialogue"?"active":""}" onclick="window.location.href = '/ai-dialogue.html'">
            <i class="fa-solid fa-comments" style="color: #a855f7;"></i> <span>Hội Thoại AI</span>
          </li>
          <li class="sidebar-item ${e==="rules"?"active":""}" onclick="window.location.href = '/han-viet-rules.html'">
            <i class="fa-solid fa-book-bookmark" style="color: #8b5cf6;"></i> <span>Quy Tắc Hán Việt</span>
          </li>
          <li class="sidebar-item ${e==="rank"?"active":""}" onclick="window.location.href = '/rank.html'">
            <i class="fa-solid fa-trophy" style="color: #fbbf24;"></i> <span>Bảng Xếp Hạng</span>
          </li>
          <li class="sidebar-item ${e==="documents"?"active":""}" onclick="window.location.href = '/documents.html'">
            <i class="fa-solid fa-book-bookmark" style="color: #06b6d4;"></i> <span>Kho Sách &amp; Tài Liệu</span>
          </li>
        </ul>

        <!-- DANH MỤC: CỘNG ĐỒNG & KHẢO SÁT -->
        <div class="sidebar-section-label">Cộng Đồng &amp; Góp Ý</div>
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item" onclick="if(window.openSurveyModal){ window.openSurveyModal(); } else { window.open('https://forms.gle/WaqZsrYrCZfAN5xn6', '_blank'); }" style="cursor: pointer;">
            <i class="fa-solid fa-clipboard-question" style="color: #ec4899;"></i> <span>Khảo sát ý kiến</span>
          </li>
        </ul>

        ${i&&(i.role==="super_admin"||i.role==="admin"||i.role==="teacher"||i.email&&(i.email.includes("phanphiphu")||i.email.includes("thaihong162004")||i.email.includes("hongtai")))?`
        <!-- DANH MỤC: QUẢN TRỊ VIÊN -->
        <div class="sidebar-section-label" style="color: #f43f5e; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-crown" style="font-size: 0.75rem;"></i> Quản Trị Hệ Thống
        </div>
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item" onclick="if(window.openAdminManagementModal){ window.openAdminManagementModal(); } else { window.location.href = '/?openAdmin=true'; }"
            style="cursor: pointer; background: rgba(244, 63, 94, 0.08); border: 1px solid rgba(244, 63, 94, 0.25); border-radius: 10px;">
            <i class="fa-solid fa-users-gear" style="color: #f43f5e;"></i> <span>Quản lý Học viên</span>
            <span style="font-size:0.68rem; background:linear-gradient(135deg, #f43f5e, #e11d48); color:white; padding:2px 6px; border-radius:6px; font-weight:800; margin-left:auto; white-space:nowrap;">Admin</span>
          </li>
        </ul>
        `:""}

        <!-- DANH MỤC: GIAO DIỆN -->
        <div class="sidebar-section-label">Giao Diện</div>
        <ul class="sidebar-menu" style="margin-bottom: 24px;">
          <li class="sidebar-item" onclick="window.toggleTheme && window.toggleTheme()">
            <i class="fa-solid fa-moon" style="color: #60a5fa;"></i> <span>Chế độ Sáng / Tối</span>
          </li>
          <li class="sidebar-item" onclick="window.toggleSeasonalParticles && window.toggleSeasonalParticles()">
            <i class="fa-solid fa-snowflake" style="color: #38bdf8;"></i> <span>Hiệu ứng Mùa rơi</span>
          </li>
        </ul>
      </div>
    </aside>
    `}window.openGlobalSidebar=function(){o();const e=window.location.pathname==="/"||window.location.pathname.endsWith("/index.html");if(e&&window.innerWidth>900){document.body.classList.remove("sidebar-collapsed"),localStorage.setItem("sidebar_collapsed","false");return}const i=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar"),s=document.querySelector(".sidebar-backdrop")||document.getElementById("global-sidebar-backdrop");i&&(i.classList.add("open","active"),i.style.pointerEvents="auto"),s&&(!e||window.innerWidth<=900)&&s.classList.add("active"),document.body.classList.add("sidebar-open")},window.closeGlobalSidebar=function(){const e=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar"),i=document.querySelector(".sidebar-backdrop")||document.getElementById("global-sidebar-backdrop");e&&e.classList.remove("open","active"),i&&i.classList.remove("active"),document.body.classList.remove("sidebar-open")},window.toggleGlobalSidebar=function(){if((window.location.pathname==="/"||window.location.pathname.endsWith("/index.html"))&&window.innerWidth>900){window.toggleSidebarCollapse?window.toggleSidebarCollapse():document.body.classList.toggle("sidebar-collapsed");return}const i=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar");i&&(i.classList.contains("open")||i.classList.contains("active")||document.body.classList.contains("sidebar-open"))?window.closeGlobalSidebar():window.openGlobalSidebar()},window.toggleGlobalUserDropdown=function(e){e&&(e.stopPropagation(),typeof e.preventDefault=="function"&&e.preventDefault());const i=e&&e.target?e.target.closest(".user-dropdown"):null;i?i.classList.toggle("show-menu"):document.querySelectorAll(".user-dropdown").forEach(n=>n.classList.toggle("show-menu"))},window.toggleUserDropdown=window.toggleGlobalUserDropdown,window.handleGlobalLogout=async function(e){e&&(e.stopPropagation(),typeof e.preventDefault=="function"&&e.preventDefault());try{await fetch("/api/auth/logout",{method:"POST",credentials:"include"})}catch{}if(localStorage.removeItem("user"),localStorage.removeItem("currentUser"),localStorage.removeItem("hongtai_user"),localStorage.removeItem("hongtai_current_user"),localStorage.removeItem("session_token"),sessionStorage.removeItem("user"),typeof google<"u"&&google.accounts&&google.accounts.id)try{google.accounts.id.disableAutoSelect()}catch{}typeof window.handleLogout=="function"?window.handleLogout(e):window.location.reload()},window.openLoginPrompt=function(){const e=document.getElementById("app-login-modal")||document.getElementById("auth-required-modal");e?(e.style.display="flex",document.body.style.overflow="hidden"):window.location.href="/?login=true"},document.addEventListener("keydown",function(e){e.key==="Escape"&&(window.closeGlobalSidebar(),document.querySelectorAll(".user-dropdown.show-menu").forEach(i=>i.classList.remove("show-menu")))}),document.addEventListener("click",function(e){e.target.closest(".user-dropdown")||document.querySelectorAll(".user-dropdown.show-menu").forEach(i=>i.classList.remove("show-menu"))}),window.closeAnnouncementTicker=function(){const e=document.getElementById("home-announcement-ticker")||document.querySelector(".announcement-ticker-bar");if(e){e.classList.add("dismissed"),setTimeout(()=>{e.style.display="none"},350);try{sessionStorage.setItem("hongtai_ticker_dismissed","true")}catch{}}};function r(){try{if(sessionStorage.getItem("hongtai_ticker_dismissed")==="true"){const e=document.getElementById("home-announcement-ticker")||document.querySelector(".announcement-ticker-bar");e&&(e.style.display="none")}}catch{}}function d(){r();const e=window.location.pathname==="/"||window.location.pathname.endsWith("/index.html");e&&window.innerWidth>=768&&(document.body.classList.remove("sidebar-collapsed"),localStorage.setItem("sidebar_collapsed","false"));let i=document.querySelector(".sidebar-backdrop");if(i?e&&i.classList.add("on-index"):(i=document.createElement("div"),i.className="sidebar-backdrop"+(e?" on-index":""),i.id="global-sidebar-backdrop",document.body.appendChild(i)),i.addEventListener("click",function(u){window.closeGlobalSidebar()}),!document.querySelector(".app-sidebar")&&!e){const u=document.createElement("div");u.id="global-sidebar-mount",u.innerHTML=h(),document.body.insertBefore(u.firstElementChild,document.body.firstChild)}o(),window.addEventListener("storage",o),window.addEventListener("user-auth-changed",o),setTimeout(o,500),setTimeout(o,1500),document.querySelectorAll(".app-sidebar, .global-app-sidebar").forEach(u=>{u.addEventListener("click",x=>{x.target.closest(".user-dropdown")||document.querySelectorAll(".user-dropdown.show-menu").forEach(k=>k.classList.remove("show-menu")),x.stopPropagation()})});const n=()=>{document.querySelectorAll(".app-sidebar .sidebar-item, .global-app-sidebar .sidebar-item, .app-sidebar .sidebar-subitem, .global-app-sidebar .sidebar-subitem").forEach(u=>{u.classList.contains("sidebar-dropdown-toggle")||(u.style.pointerEvents="auto",u.addEventListener("click",()=>{window.innerWidth<=900&&setTimeout(()=>{window.closeGlobalSidebar()},120)}))})};n(),setTimeout(n,600);const l=document.getElementById("menu-bubble-widget");if(l&&l.remove(),!(window.location.pathname==="/"||window.location.pathname.endsWith("/index.html")||window.location.pathname==="")){const u=document.getElementById("floating-theme-widget");u&&u.remove()}p(),setTimeout(p,300);const m=()=>{document.querySelectorAll(".menu-toggle-btn, .global-hamburger-btn, .sidebar-open-btn, .top-menu-btn, #top-sidebar-toggle-btn, #sidebar-expand-float-btn, .sidebar-expand-float-btn, #mobile-nav-toggle-btn, .header-icon-btn, .sidebar-toggle-btn, .topbar-comic-menu-btn, #mobile-sidebar-toggle-btn").forEach(u=>{u.onclick=window.toggleGlobalSidebar})};m(),setTimeout(m,500),setTimeout(m,1200)}function p(){const e=document.querySelector(".global-hamburger-btn, #mobile-nav-toggle-btn, #top-sidebar-toggle-btn, #mobile-sidebar-toggle-btn");if(e){e.onclick=window.toggleGlobalSidebar;return}const i=[{container:".navbar .nav-container",insertBefore:".nav-brand"},{container:".app-top-nav-inner > div:first-child",insertBefore:":first-child"},{container:".reorder-header-inner > div:first-child",insertBefore:":first-child"},{container:".diag-header-inner > div:first-child",insertBefore:":first-child"},{container:".top-bar",insertBefore:":first-child"},{container:".rd-header-left",insertBefore:".rd-back-btn"},{container:".dict-top-nav",insertBefore:".dict-brand"},{container:".rank-header-nav",insertBefore:".rank-brand-logo"},{container:".header-title-wrap",insertBefore:".back-btn"},{container:".phonetics-header .brand-box",insertBefore:":first-child"},{container:".hanzi-header .brand-box",insertBefore:":first-child"},{container:".grammar-header .brand-box",insertBefore:":first-child"},{container:".header-card > div:first-child",insertBefore:":first-child"},{container:".header-panel .logo",insertBefore:":first-child"},{container:".rules-header .rules-title-group",insertBefore:":first-child"},{container:".topbar-left-cluster",insertBefore:":first-child"}];for(const s of i){const n=document.querySelector(s.container);if(n){if(n.querySelector(".global-hamburger-btn, .menu-toggle-btn, #sidebar-expand-float-btn, #mobile-sidebar-toggle-btn"))break;const l=document.createElement("button");if(l.className="header-icon-btn global-hamburger-btn",l.id="global-hamburger-btn",l.title="Mở Menu Danh Mục",l.setAttribute("aria-label","Mở Menu Danh Mục"),l.innerHTML='<i class="fa-solid fa-bars"></i>',l.onclick=window.toggleGlobalSidebar,s.insertBefore===":first-child")n.insertBefore(l,n.firstChild);else{const t=n.querySelector(s.insertBefore);t?n.insertBefore(l,t):n.insertBefore(l,n.firstChild)}break}}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",d):d()})();
