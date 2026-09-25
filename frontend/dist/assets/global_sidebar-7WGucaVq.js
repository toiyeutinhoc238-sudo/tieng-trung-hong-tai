(function(){const u=document.createElement("link").relList;if(u&&u.supports&&u.supports("modulepreload"))return;for(const s of document.querySelectorAll('link[rel="modulepreload"]'))m(s);new MutationObserver(s=>{for(const c of s)if(c.type==="childList")for(const l of c.addedNodes)l.tagName==="LINK"&&l.rel==="modulepreload"&&m(l)}).observe(document,{childList:!0,subtree:!0});function t(s){const c={};return s.integrity&&(c.integrity=s.integrity),s.referrerPolicy&&(c.referrerPolicy=s.referrerPolicy),s.crossOrigin==="use-credentials"?c.credentials="include":s.crossOrigin==="anonymous"?c.credentials="omit":c.credentials="same-origin",c}function m(s){if(s.ep)return;s.ep=!0;const c=t(s);fetch(s.href,c)}})();function h(){let d=document.getElementById("seasonal-particle-canvas");d||(d=document.createElement("canvas"),d.id="seasonal-particle-canvas",d.style.cssText="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 50;",document.body?document.body.insertBefore(d,document.body.firstChild):document.addEventListener("DOMContentLoaded",()=>{document.body.insertBefore(d,document.body.firstChild)}));const u=localStorage.getItem("particles_enabled")!=="false";d&&(d.style.display=u?"block":"none");const t=d.getContext("2d");let m=d.width=window.innerWidth,s=d.height=window.innerHeight;window.addEventListener("resize",()=>{m=d.width=window.innerWidth,s=d.height=window.innerHeight});const c=new Date().getMonth()+1;let l="spring";c>=1&&c<=3?l="spring":c>=4&&c<=6?l="summer":c>=7&&c<=9?l="autumn":l="winter",window.location.pathname.includes("documents")&&(l="winter");const i=l==="winter"?45:28,n=[];for(let a=0;a<i;a++)n.push({x:Math.random()*m,y:Math.random()*s,size:l==="winter"?Math.random()*4.5+2.5:Math.random()*7+5,speedY:l==="winter"?Math.random()*.9+.45:Math.random()*1.2+.5,speedX:Math.sin(Math.random()*Math.PI)*.7,rotation:Math.random()*360,rotSpeed:(Math.random()-.5)*1.5,opacity:Math.random()*.5+.45,shape:a%3===0?"crystal":"glow"});let o=null;function r(){if(localStorage.getItem("particles_enabled")==="false"){t.clearRect(0,0,m,s),o&&(cancelAnimationFrame(o),o=null);return}t.clearRect(0,0,m,s),n.forEach(a=>{if(a.y+=a.speedY,a.x+=Math.sin(a.y*.01)*.5,a.rotation+=a.rotSpeed,a.y>s+20&&(a.y=-20,a.x=Math.random()*m),a.x>m+20&&(a.x=-20),a.x<-20&&(a.x=m+20),t.save(),t.translate(a.x,a.y),t.rotate(a.rotation*Math.PI/180),t.globalAlpha=a.opacity,l==="winter")if(a.shape==="crystal"){t.strokeStyle="rgba(255, 255, 255, 0.95)",t.lineWidth=Math.max(1,a.size*.22),t.lineCap="round",t.beginPath();for(let p=0;p<6;p++)t.moveTo(0,0),t.lineTo(0,a.size),t.moveTo(0,a.size*.55),t.lineTo(a.size*.25,a.size*.75),t.moveTo(0,a.size*.55),t.lineTo(-a.size*.25,a.size*.75),t.rotate(Math.PI/3);t.stroke()}else{const p=t.createRadialGradient(0,0,0,0,0,a.size);p.addColorStop(0,"rgba(255, 255, 255, 1)"),p.addColorStop(.4,"rgba(224, 242, 254, 0.85)"),p.addColorStop(1,"rgba(255, 255, 255, 0)"),t.fillStyle=p,t.beginPath(),t.arc(0,0,a.size,0,Math.PI*2),t.fill()}else l==="spring"?(t.fillStyle="rgba(255, 183, 197, 0.85)",t.beginPath(),t.ellipse(0,0,a.size,a.size*.5,0,0,Math.PI*2),t.fill()):l==="summer"?(t.fillStyle="rgba(74, 222, 128, 0.8)",t.beginPath(),t.ellipse(0,0,a.size,a.size*.4,.4,0,Math.PI*2),t.fill()):l==="autumn"&&(t.fillStyle="rgba(245, 158, 11, 0.85)",t.beginPath(),t.ellipse(0,0,a.size,a.size*.5,.5,0,Math.PI*2),t.fill());t.restore()}),o=requestAnimationFrame(r)}localStorage.getItem("particles_enabled")!=="false"&&r(),window.startParticleLoop=()=>{!o&&localStorage.getItem("particles_enabled")!=="false"&&r()}}window.initSeasonalParticles=h;window.updateParticleToggleBtns=function(d){document.querySelectorAll("#particle-toggle-btn, .particle-toggle-btn").forEach(t=>{d?(t.classList.remove("particles-off"),t.innerHTML='<i class="fa-solid fa-snowflake" style="color: #38bdf8;"></i>',t.title="Tắt hiệu ứng mùa rơi (Đang BẬT)"):(t.classList.add("particles-off"),t.innerHTML='<i class="fa-solid fa-snowflake" style="opacity: 0.35; color: #94a3b8;"></i>',t.title="Bật hiệu ứng mùa rơi (Đang TẮT)")})};window.toggleSeasonalParticles=function(){const u=!(localStorage.getItem("particles_enabled")!=="false");localStorage.setItem("particles_enabled",u?"true":"false"),typeof window.updateParticleToggleBtns=="function"&&window.updateParticleToggleBtns(u);const t=document.getElementById("seasonal-particle-canvas");t&&(t.style.display=u?"block":"none"),u&&typeof window.startParticleLoop=="function"&&window.startParticleLoop(),typeof window.showToast=="function"&&window.showToast(u?"Đã bật hiệu ứng bông tuyết mùa rơi ❄️":"Đã tắt hiệu ứng bông tuyết mùa rơi ⚡")};(function(){if(window.__hasMainStudyTimer)return;let u=0;const t=window.location.origin.includes("5173")?"http://localhost:5000":window.location.origin;function m(s){if(!s||s<=0)return;const c=new Date().toLocaleDateString("sv");let l="guest";try{const i=localStorage.getItem("user");if(i){const n=JSON.parse(i);n&&n.email&&(l=n.email)}}catch{}const e=l!=="guest"?`daily_study_history_${l}`:"daily_study_history_guest";try{const i=localStorage.getItem(e),n=i?JSON.parse(i):{};n[c]=(n[c]||0)+s,localStorage.setItem(e,JSON.stringify(n));const o=l!=="guest"?`user_stats_${l}`:"user_stats_guest",r=localStorage.getItem(o),a=r?JSON.parse(r):{streak:0,studyTime:0};a.studyTime=(a.studyTime||0)+s,localStorage.setItem(o,JSON.stringify(a))}catch{}}setInterval(()=>{if(!window.__hasMainStudyTimer&&document.hasFocus()&&(u++,u>=15)){const s=u;u=0;const c=new Date().toLocaleDateString("sv");m(s);const l=localStorage.getItem("session_token"),e={"Content-Type":"application/json"};l&&(e.Authorization=`Bearer ${l}`,e["x-session-token"]=l),fetch(t+"/api/user/stats/sync",{method:"POST",headers:e,body:JSON.stringify({incrementStudyTime:s,localDateStr:c}),credentials:"include"}).then(i=>i.ok?i.json():null).then(i=>{if(i&&i.dailyHistory){let n=null;try{const o=localStorage.getItem("user");if(o){const r=JSON.parse(o);r&&r.email&&(n=r.email)}}catch{}if(n)try{localStorage.setItem(`daily_study_history_${n}`,JSON.stringify(i.dailyHistory)),localStorage.setItem(`user_stats_${n}`,JSON.stringify({streak:i.streak,studyTime:i.studyTime}))}catch{}}}).catch(()=>{})}},1e3)})();if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{h();const d=localStorage.getItem("particles_enabled")!=="false";window.updateParticleToggleBtns&&window.updateParticleToggleBtns(d)});else{h();const d=localStorage.getItem("particles_enabled")!=="false";window.updateParticleToggleBtns&&window.updateParticleToggleBtns(d)}(function(){function d(){const e=window.location.pathname.toLowerCase(),i=window.location.search.toLowerCase();return e==="/"||e.endsWith("/index.html")?i.includes("tab=flashcards")?"flashcards":i.includes("view=roadmap")||window.location.hash.includes("roadmap")?"roadmap":"home":e.includes("video-dictation")?i.includes("mode=shadowing")?"shadowing":"dictation":e.includes("translation-practice")||e.includes("paragraph-practice")?"translation":e.includes("writing-practice")?"writing":e.includes("speaking-practice")?"speaking":e.includes("sentence-reorder")?"sentence-reorder":e.includes("ai-dialogue")?"ai-dialogue":e.includes("reading-practice")?"reading":e.includes("chinese-phonetics")?"phonetics":e.includes("chinese-radicals")?"radicals":e.includes("hanzi-writer")?"hanzi":e.includes("hsk-grammar")?"grammar":e.includes("lesson-texts")?"texts":e.includes("vocab-practice")?"vocab-practice":e.includes("detail-list")?"vocabulary":e.includes("quiz-game")?"games":e.includes("han-viet-rules")?"rules":e.includes("rank")?"rank":e.includes("documents")?"documents":""}function u(){try{const e=localStorage.getItem("user")||localStorage.getItem("hongtai_current_user")||localStorage.getItem("currentUser")||sessionStorage.getItem("user");if(e)return JSON.parse(e)}catch{}return null}function t(){const e=u();document.querySelectorAll(".app-sidebar, .global-app-sidebar").forEach(n=>{const o=n.querySelector(".user-name, #user-display-name"),r=n.querySelector(".user-sub, #user-display-email"),a=n.querySelector(".user-role-badge, #user-display-role"),p=n.querySelector(".sidebar-avatar-wrap"),f=n.querySelector(".sidebar-auth-action-item");if(e&&(e.name||e.email)){const g=e.name||e.displayName||(e.email?e.email.split("@")[0]:"Học viên"),b=e.email||"",y=e.role==="super_admin"?"Super Admin":e.role==="admin"?"Admin":e.role==="teacher"?"Giáo viên":"Học viên",w=e.picture||e.avatar||"";o&&(o.textContent=g),r&&(r.textContent=b),a&&(a.textContent=y),p&&(w?p.innerHTML=`<img class="user-avatar-img" src="${w}" alt="Avatar" style="display: block; width: 44px; height: 44px; border-radius: 50%; object-fit: cover;">`:p.innerHTML='<div class="user-avatar sidebar-avatar-placeholder"><i class="fa-solid fa-user"></i></div>'),f&&(f.innerHTML=`
            <a href="javascript:void(0)" class="logout-link" onclick="window.handleGlobalLogout && window.handleGlobalLogout(event)" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #f87171; font-size: 0.88rem; font-weight: 600; text-decoration: none; transition: all 0.2s;">
              <i class="fa-solid fa-right-from-bracket" style="color: #f87171;"></i> <span>Đăng xuất</span>
            </a>
          `)}else o&&(o.textContent="Khách (Chưa đăng nhập)"),r&&(r.textContent="Đăng nhập để lưu tiến độ học"),a&&(a.textContent="Khách"),p&&(p.innerHTML='<div class="user-avatar sidebar-avatar-placeholder"><i class="fa-solid fa-user"></i></div>'),f&&(f.innerHTML=`
            <a href="javascript:void(0)" onclick="window.openLoginPrompt && window.openLoginPrompt()" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #4ade80; font-size: 0.88rem; font-weight: 700; text-decoration: none; transition: all 0.2s;">
              <i class="fa-brands fa-google" style="color: #4ade80;"></i> <span>Đăng nhập Google</span>
            </a>
          `)})}function m(){const e=d(),i=u(),n=i?i.name||i.displayName||(i.email?i.email.split("@")[0]:"Học viên"):"Khách (Chưa đăng nhập)",o=i?i.email||"":"Đăng nhập để lưu tiến độ học",r=i?i.role==="super_admin"?"Super Admin":i.role==="admin"?"Admin":i.role==="teacher"?"Giáo viên":"Học viên":"Khách",a=i&&(i.picture||i.avatar)?i.picture||i.avatar:"";return`
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
                ${a?`<img class="user-avatar-img" src="${a}" alt="Avatar" style="display: block; width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-blue, #38bdf8);">`:'<div class="user-avatar sidebar-avatar-placeholder" style="width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white;"><i class="fa-solid fa-user"></i></div>'}
              </div>
              <div class="user-info" style="min-width: 0; flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                <span class="user-name" style="font-weight: 700; font-size: 0.92rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${n}</span>
                <span class="user-sub" style="font-size: 0.72rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${o}</span>
                <span class="user-role-badge" style="font-size: 0.68rem; margin-top: 2px; align-self: flex-start;">${r}</span>
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
    `}window.openGlobalSidebar=function(){t();const e=window.location.pathname==="/"||window.location.pathname.endsWith("/index.html");if(e&&window.innerWidth>900){document.body.classList.remove("sidebar-collapsed"),localStorage.setItem("sidebar_collapsed","false");return}const i=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar"),n=document.querySelector(".sidebar-backdrop")||document.getElementById("global-sidebar-backdrop");i&&(i.classList.add("open","active"),i.style.pointerEvents="auto"),n&&(!e||window.innerWidth<=900)&&n.classList.add("active"),document.body.classList.add("sidebar-open")},window.closeGlobalSidebar=function(){const e=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar"),i=document.querySelector(".sidebar-backdrop")||document.getElementById("global-sidebar-backdrop");e&&e.classList.remove("open","active"),i&&i.classList.remove("active"),document.body.classList.remove("sidebar-open")},window.toggleGlobalSidebar=function(){if((window.location.pathname==="/"||window.location.pathname.endsWith("/index.html"))&&window.innerWidth>900){window.toggleSidebarCollapse?window.toggleSidebarCollapse():document.body.classList.toggle("sidebar-collapsed");return}const i=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar");i&&(i.classList.contains("open")||i.classList.contains("active")||document.body.classList.contains("sidebar-open"))?window.closeGlobalSidebar():window.openGlobalSidebar()},window.toggleGlobalUserDropdown=function(e){e&&(e.stopPropagation(),typeof e.preventDefault=="function"&&e.preventDefault());const i=e&&e.target?e.target.closest(".user-dropdown"):null;i?i.classList.toggle("show-menu"):document.querySelectorAll(".user-dropdown").forEach(o=>o.classList.toggle("show-menu"))},window.toggleUserDropdown=window.toggleGlobalUserDropdown,window.handleGlobalLogout=async function(e){e&&(e.stopPropagation(),typeof e.preventDefault=="function"&&e.preventDefault());try{await fetch("/api/auth/logout",{method:"POST",credentials:"include"})}catch{}if(localStorage.removeItem("user"),localStorage.removeItem("currentUser"),localStorage.removeItem("hongtai_user"),localStorage.removeItem("hongtai_current_user"),localStorage.removeItem("session_token"),sessionStorage.removeItem("user"),typeof google<"u"&&google.accounts&&google.accounts.id)try{google.accounts.id.disableAutoSelect()}catch{}typeof window.handleLogout=="function"?window.handleLogout(e):window.location.reload()},window.openLoginPrompt=function(){const e=document.getElementById("app-login-modal")||document.getElementById("auth-required-modal");e?(e.style.display="flex",document.body.style.overflow="hidden"):window.location.href="/?login=true"},document.addEventListener("keydown",function(e){e.key==="Escape"&&(window.closeGlobalSidebar(),document.querySelectorAll(".user-dropdown.show-menu").forEach(i=>i.classList.remove("show-menu")))}),document.addEventListener("click",function(e){e.target.closest(".user-dropdown")||document.querySelectorAll(".user-dropdown.show-menu").forEach(i=>i.classList.remove("show-menu"))}),window.closeAnnouncementTicker=function(){const e=document.getElementById("home-announcement-ticker")||document.querySelector(".announcement-ticker-bar");if(e){e.classList.add("dismissed"),setTimeout(()=>{e.style.display="none"},350);try{sessionStorage.setItem("hongtai_ticker_dismissed","true")}catch{}}};function s(){try{if(sessionStorage.getItem("hongtai_ticker_dismissed")==="true"){const e=document.getElementById("home-announcement-ticker")||document.querySelector(".announcement-ticker-bar");e&&(e.style.display="none")}}catch{}}function c(){s();const e=window.location.pathname==="/"||window.location.pathname.endsWith("/index.html");e&&window.innerWidth>=768&&(document.body.classList.remove("sidebar-collapsed"),localStorage.setItem("sidebar_collapsed","false"));let i=document.querySelector(".sidebar-backdrop");if(i?e&&i.classList.add("on-index"):(i=document.createElement("div"),i.className="sidebar-backdrop"+(e?" on-index":""),i.id="global-sidebar-backdrop",document.body.appendChild(i)),i.addEventListener("click",function(f){window.closeGlobalSidebar()}),!document.querySelector(".app-sidebar")&&!e){const f=document.createElement("div");f.id="global-sidebar-mount",f.innerHTML=m(),document.body.insertBefore(f.firstElementChild,document.body.firstChild)}t(),window.addEventListener("storage",t),window.addEventListener("user-auth-changed",t),setTimeout(t,500),setTimeout(t,1500),document.querySelectorAll(".app-sidebar, .global-app-sidebar").forEach(f=>{f.addEventListener("click",g=>{g.target.closest(".user-dropdown")||document.querySelectorAll(".user-dropdown.show-menu").forEach(b=>b.classList.remove("show-menu")),g.stopPropagation()})});const o=()=>{document.querySelectorAll(".app-sidebar .sidebar-item, .global-app-sidebar .sidebar-item, .app-sidebar .sidebar-subitem, .global-app-sidebar .sidebar-subitem").forEach(f=>{f.classList.contains("sidebar-dropdown-toggle")||(f.style.pointerEvents="auto",f.addEventListener("click",()=>{window.innerWidth<=900&&setTimeout(()=>{window.closeGlobalSidebar()},120)}))})};o(),setTimeout(o,600);const r=document.getElementById("menu-bubble-widget");if(r&&r.remove(),!(window.location.pathname==="/"||window.location.pathname.endsWith("/index.html")||window.location.pathname==="")){const f=document.getElementById("floating-theme-widget");f&&f.remove()}l(),setTimeout(l,300);const p=()=>{document.querySelectorAll(".menu-toggle-btn, .global-hamburger-btn, .sidebar-open-btn, .top-menu-btn, #top-sidebar-toggle-btn, #sidebar-expand-float-btn, .sidebar-expand-float-btn, #mobile-nav-toggle-btn, .header-icon-btn, .sidebar-toggle-btn, .topbar-comic-menu-btn, #mobile-sidebar-toggle-btn").forEach(f=>{f.onclick=window.toggleGlobalSidebar})};p(),setTimeout(p,500),setTimeout(p,1200)}function l(){const e=document.querySelector(".global-hamburger-btn, #mobile-nav-toggle-btn, #top-sidebar-toggle-btn, #mobile-sidebar-toggle-btn");if(e){e.onclick=window.toggleGlobalSidebar;return}const i=[{container:".navbar .nav-container",insertBefore:".nav-brand"},{container:".app-top-nav-inner > div:first-child",insertBefore:":first-child"},{container:".reorder-header-inner > div:first-child",insertBefore:":first-child"},{container:".diag-header-inner > div:first-child",insertBefore:":first-child"},{container:".top-bar",insertBefore:":first-child"},{container:".rd-header-left",insertBefore:".rd-back-btn"},{container:".dict-top-nav",insertBefore:".dict-brand"},{container:".rank-header-nav",insertBefore:".rank-brand-logo"},{container:".header-title-wrap",insertBefore:".back-btn"},{container:".phonetics-header .brand-box",insertBefore:":first-child"},{container:".hanzi-header .brand-box",insertBefore:":first-child"},{container:".grammar-header .brand-box",insertBefore:":first-child"},{container:".header-card > div:first-child",insertBefore:":first-child"},{container:".header-panel .logo",insertBefore:":first-child"},{container:".rules-header .rules-title-group",insertBefore:":first-child"},{container:".topbar-left-cluster",insertBefore:":first-child"}];for(const n of i){const o=document.querySelector(n.container);if(o){if(o.querySelector(".global-hamburger-btn, .menu-toggle-btn, #sidebar-expand-float-btn, #mobile-sidebar-toggle-btn"))break;const r=document.createElement("button");if(r.className="header-icon-btn global-hamburger-btn",r.id="global-hamburger-btn",r.title="Mở Menu Danh Mục",r.setAttribute("aria-label","Mở Menu Danh Mục"),r.innerHTML='<i class="fa-solid fa-bars"></i>',r.onclick=window.toggleGlobalSidebar,n.insertBefore===":first-child")o.insertBefore(r,o.firstChild);else{const a=o.querySelector(n.insertBefore);a?o.insertBefore(r,a):o.insertBefore(r,o.firstChild)}break}}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",c):c()})();
