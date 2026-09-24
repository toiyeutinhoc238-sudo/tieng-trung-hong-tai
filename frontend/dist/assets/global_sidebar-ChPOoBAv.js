(function(){const p=document.createElement("link").relList;if(p&&p.supports&&p.supports("modulepreload"))return;for(const n of document.querySelectorAll('link[rel="modulepreload"]'))f(n);new MutationObserver(n=>{for(const s of n)if(s.type==="childList")for(const e of s.addedNodes)e.tagName==="LINK"&&e.rel==="modulepreload"&&f(e)}).observe(document,{childList:!0,subtree:!0});function c(n){const s={};return n.integrity&&(s.integrity=n.integrity),n.referrerPolicy&&(s.referrerPolicy=n.referrerPolicy),n.crossOrigin==="use-credentials"?s.credentials="include":n.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function f(n){if(n.ep)return;n.ep=!0;const s=c(n);fetch(n.href,s)}})();(function(){function g(){const e=window.location.pathname.toLowerCase(),i=window.location.search.toLowerCase();return e==="/"||e.endsWith("/index.html")?i.includes("tab=flashcards")?"flashcards":i.includes("view=roadmap")||window.location.hash.includes("roadmap")?"roadmap":"home":e.includes("video-dictation")?i.includes("mode=shadowing")?"shadowing":"dictation":e.includes("writing-practice")?"writing":e.includes("speaking-practice")?"speaking":e.includes("sentence-reorder")?"sentence-reorder":e.includes("ai-dialogue")?"ai-dialogue":e.includes("reading-practice")?"reading":e.includes("chinese-phonetics")?"phonetics":e.includes("chinese-radicals")?"radicals":e.includes("hanzi-writer")?"hanzi":e.includes("hsk-grammar")?"grammar":e.includes("lesson-texts")?"texts":e.includes("vocab-practice")?"vocab-practice":e.includes("detail-list")?"vocabulary":e.includes("quiz-game")?"games":e.includes("han-viet-rules")?"rules":e.includes("rank")?"rank":e.includes("documents")?"documents":""}function p(){try{const e=localStorage.getItem("user")||localStorage.getItem("hongtai_current_user")||localStorage.getItem("currentUser")||sessionStorage.getItem("user");if(e)return JSON.parse(e)}catch{}return null}function c(){const e=p();document.querySelectorAll(".app-sidebar, .global-app-sidebar").forEach(r=>{const a=r.querySelector(".user-name, #user-display-name"),t=r.querySelector(".user-sub, #user-display-email"),l=r.querySelector(".user-role-badge, #user-display-role"),d=r.querySelector(".sidebar-avatar-wrap"),o=r.querySelector(".sidebar-auth-action-item");if(e&&(e.name||e.email)){const u=e.name||e.displayName||(e.email?e.email.split("@")[0]:"Học viên"),b=e.email||"",h=e.role==="super_admin"?"Super Admin":e.role==="admin"?"Admin":e.role==="teacher"?"Giáo viên":"Học viên",m=e.picture||e.avatar||"";a&&(a.textContent=u),t&&(t.textContent=b),l&&(l.textContent=h),d&&(m?d.innerHTML=`<img class="user-avatar-img" src="${m}" alt="Avatar" style="display: block; width: 44px; height: 44px; border-radius: 50%; object-fit: cover;">`:d.innerHTML='<div class="user-avatar sidebar-avatar-placeholder"><i class="fa-solid fa-user"></i></div>'),o&&(o.innerHTML=`
            <a href="javascript:void(0)" class="logout-link" onclick="window.handleGlobalLogout && window.handleGlobalLogout(event)" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #f87171; font-size: 0.88rem; font-weight: 600; text-decoration: none; transition: all 0.2s;">
              <i class="fa-solid fa-right-from-bracket" style="color: #f87171;"></i> <span>Đăng xuất</span>
            </a>
          `)}else a&&(a.textContent="Khách (Chưa đăng nhập)"),t&&(t.textContent="Đăng nhập để lưu tiến độ học"),l&&(l.textContent="Khách"),d&&(d.innerHTML='<div class="user-avatar sidebar-avatar-placeholder"><i class="fa-solid fa-user"></i></div>'),o&&(o.innerHTML=`
            <a href="javascript:void(0)" onclick="window.openLoginPrompt && window.openLoginPrompt()" style="display: flex; align-items: center; gap: 10px; padding: 10px 14px; border-radius: 8px; color: #4ade80; font-size: 0.88rem; font-weight: 700; text-decoration: none; transition: all 0.2s;">
              <i class="fa-brands fa-google" style="color: #4ade80;"></i> <span>Đăng nhập Google</span>
            </a>
          `)})}function f(){const e=g(),i=p(),r=i?i.name||i.displayName||(i.email?i.email.split("@")[0]:"Học viên"):"Khách (Chưa đăng nhập)",a=i?i.email||"":"Đăng nhập để lưu tiến độ học",t=i?i.role==="super_admin"?"Super Admin":i.role==="admin"?"Admin":i.role==="teacher"?"Giáo viên":"Học viên":"Khách",l=i&&(i.picture||i.avatar)?i.picture||i.avatar:"";return`
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
                ${l?`<img class="user-avatar-img" src="${l}" alt="Avatar" style="display: block; width: 42px; height: 42px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent-blue, #38bdf8);">`:'<div class="user-avatar sidebar-avatar-placeholder" style="width: 42px; height: 42px; border-radius: 50%; background: linear-gradient(135deg, #3b82f6, #8b5cf6); display: flex; align-items: center; justify-content: center; color: white;"><i class="fa-solid fa-user"></i></div>'}
              </div>
              <div class="user-info" style="min-width: 0; flex: 1; display: flex; flex-direction: column; overflow: hidden;">
                <span class="user-name" style="font-weight: 700; font-size: 0.92rem; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${r}</span>
                <span class="user-sub" style="font-size: 0.72rem; color: #94a3b8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${a}</span>
                <span class="user-role-badge" style="font-size: 0.68rem; margin-top: 2px; align-self: flex-start;">${t}</span>
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
          <li class="sidebar-item ${e==="texts"?"active":""}" onclick="window.location.href = '/lesson-texts.html'">
            <i class="fa-solid fa-comments" style="color: #fb923c;"></i> <span>Bài Khóa & Hội Thoại</span>
          </li>
          <li class="sidebar-item ${e==="vocab-practice"?"active":""}" onclick="window.location.href = '/vocab-practice.html'">
            <i class="fa-solid fa-graduation-cap" style="color: #a855f7;"></i> <span>Ôn Tập Từ Vựng (5 Dạng)</span>
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
            <span style="font-size:0.65rem; background:linear-gradient(135deg, rgba(168,85,247,0.25), rgba(139,92,246,0.3)); color:#d8b4fe; border:1px solid rgba(168,85,247,0.4); padding:2px 7px; border-radius:6px; font-weight:800; margin-left:auto;">AI Mới ✨</span>
          </li>
          <li class="sidebar-item ${e==="speaking"?"active":""}" onclick="window.location.href = '/speaking-practice.html'">
            <i class="fa-solid fa-microphone-lines" style="color: #f59e0b;"></i> <span>Luyện Nói HSKK & AI</span>
            <span style="font-size:0.65rem; background:linear-gradient(135deg, rgba(245,158,11,0.25), rgba(217,119,6,0.3)); color:#fbbf24; border:1px solid rgba(245,158,11,0.4); padding:2px 7px; border-radius:6px; font-weight:800; margin-left:auto;">3p-2p 🎙️</span>
          </li>
          <li class="sidebar-item ${e==="sentence-reorder"?"active":""}" onclick="window.location.href = '/sentence-reorder.html'">
            <i class="fa-solid fa-arrow-down-short-wide" style="color: #38bdf8;"></i> <span>Sắp Xếp Câu</span>
            <span style="font-size:0.65rem; background:linear-gradient(135deg, rgba(56,189,248,0.25), rgba(2,132,199,0.3)); color:#38bdf8; border:1px solid rgba(56,189,248,0.4); padding:2px 7px; border-radius:6px; font-weight:800; margin-left:auto;">790 Câu 🧩</span>
          </li>
          <li class="sidebar-item ${e==="ai-dialogue"?"active":""}" onclick="window.location.href = '/ai-dialogue.html'">
            <i class="fa-solid fa-comments" style="color: #a855f7;"></i> <span>Hội Thoại AI</span>
            <span style="font-size:0.65rem; background:linear-gradient(135deg, rgba(168,85,247,0.25), rgba(139,92,246,0.3)); color:#d8b4fe; border:1px solid rgba(168,85,247,0.4); padding:2px 7px; border-radius:6px; font-weight:800; margin-left:auto;">AI Mới 💬</span>
          </li>
          <li class="sidebar-item ${e==="rules"?"active":""}" onclick="window.location.href = '/han-viet-rules.html'">
            <i class="fa-solid fa-book-bookmark" style="color: #8b5cf6;"></i> <span>Quy Tắc Hán Việt</span>
          </li>
          <li class="sidebar-item ${e==="rank"?"active":""}" onclick="window.location.href = '/rank.html'">
            <i class="fa-solid fa-trophy" style="color: #fbbf24;"></i> <span>Bảng Xếp Hạng</span>
          </li>
          <li class="sidebar-item ${e==="documents"?"active":""}" onclick="window.location.href = '/documents.html'">
            <i class="fa-solid fa-book-bookmark" style="color: #06b6d4;"></i> <span>Kho Sách &amp; Tài Liệu</span>
            <span style="font-size:0.65rem; background:linear-gradient(135deg, #0284c7, #06b6d4); color:#ffffff; border:1px solid rgba(255,255,255,0.25); padding:2px 8px; border-radius:6px; font-weight:800; margin-left:auto; white-space:nowrap; box-shadow:0 2px 8px rgba(2,132,199,0.35); text-shadow:0 1px 2px rgba(0,0,0,0.25);">66 Sách 📚</span>
          </li>
        </ul>

        <!-- DANH MỤC: CỘNG ĐỒNG & KHẢO SÁT -->
        <div class="sidebar-section-label">Cộng Đồng &amp; Góp Ý</div>
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item" onclick="if(window.openSurveyModal){ window.openSurveyModal(); } else { window.open('https://forms.gle/WaqZsrYrCZfAN5xn6', '_blank'); }" style="cursor: pointer;">
            <i class="fa-solid fa-clipboard-question" style="color: #ec4899;"></i> <span>Khảo sát ý kiến</span>
            <span style="font-size:0.68rem; background:linear-gradient(135deg, rgba(236,72,153,0.25), rgba(244,63,94,0.25)); color:#f472b6; border:1px solid rgba(236,72,153,0.4); padding:2px 8px; border-radius:6px; font-weight:700; margin-left:auto; white-space:nowrap;">Góp ý 🎁</span>
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
    `}window.openGlobalSidebar=function(){c();const e=window.location.pathname==="/"||window.location.pathname.endsWith("/index.html");if(e&&window.innerWidth>900){document.body.classList.remove("sidebar-collapsed"),localStorage.setItem("sidebar_collapsed","false");return}const i=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar"),r=document.querySelector(".sidebar-backdrop")||document.getElementById("global-sidebar-backdrop");i&&(i.classList.add("open","active"),i.style.pointerEvents="auto"),r&&(!e||window.innerWidth<=900)&&r.classList.add("active"),document.body.classList.add("sidebar-open")},window.closeGlobalSidebar=function(){const e=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar"),i=document.querySelector(".sidebar-backdrop")||document.getElementById("global-sidebar-backdrop");e&&e.classList.remove("open","active"),i&&i.classList.remove("active"),document.body.classList.remove("sidebar-open")},window.toggleGlobalSidebar=function(){if((window.location.pathname==="/"||window.location.pathname.endsWith("/index.html"))&&window.innerWidth>900){window.toggleSidebarCollapse?window.toggleSidebarCollapse():document.body.classList.toggle("sidebar-collapsed");return}const i=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar");i&&(i.classList.contains("open")||i.classList.contains("active")||document.body.classList.contains("sidebar-open"))?window.closeGlobalSidebar():window.openGlobalSidebar()},window.toggleGlobalUserDropdown=function(e){e&&(e.stopPropagation(),typeof e.preventDefault=="function"&&e.preventDefault());const i=e&&e.target?e.target.closest(".user-dropdown"):null;i?i.classList.toggle("show-menu"):document.querySelectorAll(".user-dropdown").forEach(a=>a.classList.toggle("show-menu"))},window.toggleUserDropdown=window.toggleGlobalUserDropdown,window.handleGlobalLogout=async function(e){e&&(e.stopPropagation(),typeof e.preventDefault=="function"&&e.preventDefault());try{await fetch("/api/auth/logout",{method:"POST",credentials:"include"})}catch{}if(localStorage.removeItem("user"),localStorage.removeItem("currentUser"),localStorage.removeItem("hongtai_user"),localStorage.removeItem("hongtai_current_user"),localStorage.removeItem("session_token"),sessionStorage.removeItem("user"),typeof google<"u"&&google.accounts&&google.accounts.id)try{google.accounts.id.disableAutoSelect()}catch{}typeof window.handleLogout=="function"?window.handleLogout(e):window.location.reload()},window.openLoginPrompt=function(){const e=document.getElementById("app-login-modal")||document.getElementById("auth-required-modal");e?(e.style.display="flex",document.body.style.overflow="hidden"):window.location.href="/?login=true"},document.addEventListener("keydown",function(e){e.key==="Escape"&&(window.closeGlobalSidebar(),document.querySelectorAll(".user-dropdown.show-menu").forEach(i=>i.classList.remove("show-menu")))}),document.addEventListener("click",function(e){e.target.closest(".user-dropdown")||document.querySelectorAll(".user-dropdown.show-menu").forEach(i=>i.classList.remove("show-menu"))});function n(){const e=window.location.pathname==="/"||window.location.pathname.endsWith("/index.html");e&&window.innerWidth>=768&&(document.body.classList.remove("sidebar-collapsed"),localStorage.setItem("sidebar_collapsed","false"));let i=document.querySelector(".sidebar-backdrop");if(i?e&&i.classList.add("on-index"):(i=document.createElement("div"),i.className="sidebar-backdrop"+(e?" on-index":""),i.id="global-sidebar-backdrop",document.body.appendChild(i)),i.addEventListener("click",function(o){window.closeGlobalSidebar()}),!document.querySelector(".app-sidebar")&&!e){const o=document.createElement("div");o.id="global-sidebar-mount",o.innerHTML=f(),document.body.insertBefore(o.firstElementChild,document.body.firstChild)}c(),window.addEventListener("storage",c),window.addEventListener("user-auth-changed",c),setTimeout(c,500),setTimeout(c,1500),document.querySelectorAll(".app-sidebar, .global-app-sidebar").forEach(o=>{o.addEventListener("click",u=>{u.target.closest(".user-dropdown")||document.querySelectorAll(".user-dropdown.show-menu").forEach(b=>b.classList.remove("show-menu")),u.stopPropagation()})});const a=()=>{document.querySelectorAll(".app-sidebar .sidebar-item, .global-app-sidebar .sidebar-item, .app-sidebar .sidebar-subitem, .global-app-sidebar .sidebar-subitem").forEach(o=>{o.classList.contains("sidebar-dropdown-toggle")||(o.style.pointerEvents="auto",o.addEventListener("click",()=>{window.innerWidth<=900&&setTimeout(()=>{window.closeGlobalSidebar()},120)}))})};a(),setTimeout(a,600);const t=document.getElementById("menu-bubble-widget");if(t&&t.remove(),!(window.location.pathname==="/"||window.location.pathname.endsWith("/index.html")||window.location.pathname==="")){const o=document.getElementById("floating-theme-widget");o&&o.remove()}s(),setTimeout(s,300);const d=()=>{document.querySelectorAll(".menu-toggle-btn, .global-hamburger-btn, .sidebar-open-btn, .top-menu-btn, #top-sidebar-toggle-btn, #sidebar-expand-float-btn, .sidebar-expand-float-btn, #mobile-nav-toggle-btn, .header-icon-btn, .sidebar-toggle-btn, .topbar-comic-menu-btn, #mobile-sidebar-toggle-btn").forEach(o=>{o.onclick=window.toggleGlobalSidebar})};d(),setTimeout(d,500),setTimeout(d,1200)}function s(){const e=document.querySelector(".global-hamburger-btn, #mobile-nav-toggle-btn, #top-sidebar-toggle-btn, #mobile-sidebar-toggle-btn");if(e){e.onclick=window.toggleGlobalSidebar;return}const i=[{container:".navbar .nav-container",insertBefore:".nav-brand"},{container:".app-top-nav-inner > div:first-child",insertBefore:":first-child"},{container:".reorder-header-inner > div:first-child",insertBefore:":first-child"},{container:".diag-header-inner > div:first-child",insertBefore:":first-child"},{container:".top-bar",insertBefore:":first-child"},{container:".rd-header-left",insertBefore:".rd-back-btn"},{container:".dict-top-nav",insertBefore:".dict-brand"},{container:".rank-header-nav",insertBefore:".rank-brand-logo"},{container:".header-title-wrap",insertBefore:".back-btn"},{container:".phonetics-header .brand-box",insertBefore:":first-child"},{container:".hanzi-header .brand-box",insertBefore:":first-child"},{container:".grammar-header .brand-box",insertBefore:":first-child"},{container:".header-card > div:first-child",insertBefore:":first-child"},{container:".header-panel .logo",insertBefore:":first-child"},{container:".rules-header .rules-title-group",insertBefore:":first-child"},{container:".topbar-left-cluster",insertBefore:":first-child"}];for(const r of i){const a=document.querySelector(r.container);if(a){if(a.querySelector(".global-hamburger-btn, .menu-toggle-btn, #sidebar-expand-float-btn, #mobile-sidebar-toggle-btn"))break;const t=document.createElement("button");if(t.className="header-icon-btn global-hamburger-btn",t.id="global-hamburger-btn",t.title="Mở Menu Danh Mục",t.setAttribute("aria-label","Mở Menu Danh Mục"),t.innerHTML='<i class="fa-solid fa-bars"></i>',t.onclick=window.toggleGlobalSidebar,r.insertBefore===":first-child")a.insertBefore(t,a.firstChild);else{const l=a.querySelector(r.insertBefore);l?a.insertBefore(t,l):a.insertBefore(t,a.firstChild)}break}}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",n):n()})();
