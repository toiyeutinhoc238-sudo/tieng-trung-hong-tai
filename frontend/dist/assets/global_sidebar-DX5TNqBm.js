(function(){const u=document.createElement("link").relList;if(u&&u.supports&&u.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))b(t);new MutationObserver(t=>{for(const o of t)if(o.type==="childList")for(const e of o.addedNodes)e.tagName==="LINK"&&e.rel==="modulepreload"&&b(e)}).observe(document,{childList:!0,subtree:!0});function m(t){const o={};return t.integrity&&(o.integrity=t.integrity),t.referrerPolicy&&(o.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?o.credentials="include":t.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function b(t){if(t.ep)return;t.ep=!0;const o=m(t);fetch(t.href,o)}})();(function(){function g(){const e=window.location.pathname.toLowerCase(),i=window.location.search.toLowerCase();return e==="/"||e.endsWith("/index.html")?i.includes("tab=flashcards")?"flashcards":i.includes("view=roadmap")||window.location.hash.includes("roadmap")?"roadmap":"home":e.includes("video-dictation")?i.includes("mode=shadowing")?"shadowing":"dictation":e.includes("reading-practice")?"reading":e.includes("chinese-phonetics")?"phonetics":e.includes("chinese-radicals")?"radicals":e.includes("hanzi-writer")?"hanzi":e.includes("hsk-grammar")?"grammar":e.includes("lesson-texts")?"texts":e.includes("detail-list")?"vocabulary":e.includes("quiz-game")?"games":e.includes("han-viet-rules")?"rules":e.includes("rank")?"rank":""}function u(){try{const e=localStorage.getItem("hongtai_current_user")||localStorage.getItem("currentUser");if(e)return JSON.parse(e)}catch{}return null}function m(){const e=g(),i=u(),n=i?i.name||i.displayName||"Học viên":"Khách (Chưa đăng nhập)",r=i?i.email||"":"Đăng nhập để lưu tiến độ học",c=i?i.role==="super_admin"?"Super Admin":i.role==="admin"?"Admin":i.role==="teacher"?"Giáo viên":"Học viên":"Khách",a=i&&i.picture?i.picture:"";return`
    <aside class="app-sidebar global-app-sidebar" id="global-app-sidebar">
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

      <!-- User Account Card -->
      <div class="auth-container" style="width: 100%; border-bottom: 1px solid var(--border-glass, rgba(255,255,255,0.12)); padding-bottom: 12px; margin-bottom: 12px;">
        <div class="sidebar-profile-card" onclick="if(window.location.pathname !== '/' && !window.location.pathname.endsWith('/index.html')) { window.location.href='/'; }">
          <div class="sidebar-avatar-wrap">
            ${a?`<img class="user-avatar-img" src="${a}" alt="Avatar" style="display: block;">`:'<div class="user-avatar sidebar-avatar-placeholder"><i class="fa-solid fa-user"></i></div>'}
          </div>
          <div class="user-info">
            <span class="user-name">${n}</span>
            <span class="user-sub">${r}</span>
            <span class="user-role-badge">${c}</span>
          </div>
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
        </ul>

        <!-- DANH MỤC: TRÒ CHƠI -->
        <div class="sidebar-section-label">Trò Chơi</div>
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item ${e==="games"?"active":""}" onclick="window.location.href = '/quiz-game.html'">
            <i class="fa-solid fa-gamepad" style="color: #f59e0b;"></i> <span>Trò Chơi Ôn Tập</span>
            <span style="font-size:0.68rem; background:linear-gradient(135deg, #f59e0b, #d97706); color:#fff; padding:2px 7px; border-radius:6px; font-weight:800; margin-left:auto; white-space:nowrap;">🔥 5 Game</span>
          </li>
        </ul>

        <!-- DANH MỤC: KỸ NĂNG -->
        <div class="sidebar-section-label">Kỹ Năng & Video</div>
        <ul class="sidebar-menu" style="margin-bottom: 12px;">
          <li class="sidebar-item ${e==="shadowing"?"active":""}" onclick="window.location.href = '/video-dictation.html?mode=shadowing'">
            <i class="fa-solid fa-microphone-lines" style="color: #10b981;"></i> <span>Shadowing Video</span>
            <span style="font-size:0.68rem; background:linear-gradient(135deg, #10b981, #059669); color:#fff; padding:2px 7px; border-radius:6px; font-weight:800; margin-left:auto; white-space:nowrap;">🔥 24 Video</span>
          </li>
          <li class="sidebar-item ${e==="dictation"?"active":""}" onclick="window.location.href = '/video-dictation.html?mode=dictation'">
            <i class="fa-solid fa-pen-to-square" style="color: #38bdf8;"></i> <span>Chép Chính Tả</span>
            <span style="font-size:0.68rem; background:linear-gradient(135deg, #0284c7, #2563eb); color:#fff; padding:2px 7px; border-radius:6px; font-weight:800; margin-left:auto; white-space:nowrap;">🔥 24 Video</span>
          </li>
          <li class="sidebar-item ${e==="reading"?"active":""}" onclick="window.location.href = '/reading-practice.html'">
            <i class="fa-solid fa-book-open-reader" style="color: #ec4899;"></i> <span>Luyện Đọc HSK</span>
            <span style="font-size:0.68rem; background:linear-gradient(135deg, #ec4899, #db2777); color:#fff; padding:2px 7px; border-radius:6px; font-weight:800; margin-left:auto; white-space:nowrap;">🔥 33 Bài</span>
          </li>
          <li class="sidebar-item ${e==="rules"?"active":""}" onclick="window.location.href = '/han-viet-rules.html'">
            <i class="fa-solid fa-book-bookmark" style="color: #8b5cf6;"></i> <span>Quy Tắc Hán Việt</span>
          </li>
          <li class="sidebar-item ${e==="rank"?"active":""}" onclick="window.location.href = '/rank.html'">
            <i class="fa-solid fa-trophy" style="color: #fbbf24;"></i> <span>Bảng Xếp Hạng</span>
          </li>
        </ul>

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
    `}window.openGlobalSidebar=function(){document.body.classList.remove("sidebar-collapsed");const e=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar"),i=document.querySelector(".sidebar-backdrop")||document.getElementById("global-sidebar-backdrop");e&&(e.classList.add("open","active"),e.style.pointerEvents="auto"),i&&i.classList.add("active"),document.body.classList.add("sidebar-open")},window.closeGlobalSidebar=function(){const e=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar"),i=document.querySelector(".sidebar-backdrop")||document.getElementById("global-sidebar-backdrop");e&&e.classList.remove("open","active"),i&&i.classList.remove("active"),document.body.classList.remove("sidebar-open")},window.toggleGlobalSidebar=function(){const e=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar");e&&(e.classList.contains("open")||e.classList.contains("active")||document.body.classList.contains("sidebar-open"))?window.closeGlobalSidebar():window.openGlobalSidebar()},document.addEventListener("keydown",function(e){e.key==="Escape"&&window.closeGlobalSidebar()});function b(){let e=document.querySelector(".sidebar-backdrop");e||(e=document.createElement("div"),e.className="sidebar-backdrop",e.id="global-sidebar-backdrop",document.body.appendChild(e)),e.addEventListener("click",function(a){window.closeGlobalSidebar()});const i=window.location.pathname==="/"||window.location.pathname.endsWith("/index.html");if(!document.querySelector(".app-sidebar")&&!i){const a=document.createElement("div");a.id="global-sidebar-mount",a.innerHTML=m(),document.body.insertBefore(a.firstElementChild,document.body.firstChild)}document.querySelectorAll(".app-sidebar, .global-app-sidebar").forEach(a=>{a.addEventListener("click",f=>{f.stopPropagation()})});const r=()=>{document.querySelectorAll(".app-sidebar .sidebar-item, .global-app-sidebar .sidebar-item, .app-sidebar .sidebar-subitem, .global-app-sidebar .sidebar-subitem").forEach(a=>{a.classList.contains("sidebar-dropdown-toggle")||(a.style.pointerEvents="auto",a.addEventListener("click",()=>{window.innerWidth<=900&&setTimeout(()=>{window.closeGlobalSidebar()},120)}))})};r(),setTimeout(r,600),t();const c=()=>{document.querySelectorAll(".menu-toggle-btn, .global-hamburger-btn, .sidebar-open-btn, .top-menu-btn, #top-sidebar-toggle-btn, #sidebar-expand-float-btn, .sidebar-expand-float-btn, #mobile-nav-toggle-btn").forEach(a=>{a.onclick=window.toggleGlobalSidebar})};c(),setTimeout(c,500)}function t(){if(document.getElementById("menu-bubble-widget"))return;const e=window.location.pathname==="/"||window.location.pathname.endsWith("/index.html"),i=document.createElement("div");i.className="menu-bubble-widget"+(e?" on-index-page":""),i.id="menu-bubble-widget";const n=document.createElement("button");n.className="menu-bubble-btn",n.id="menu-bubble-btn",n.title="Mở Menu Danh Mục (☰)",n.setAttribute("aria-label","Mở Menu Danh Mục"),n.innerHTML='<i class="fa-solid fa-bars"></i>',i.appendChild(n),document.body.appendChild(i),o(i,n)}function o(e,i){let n=!1,r=0,c=0,a=0,f=0,p=!1;function w(s){return s.touches&&s.touches.length>0?{x:s.touches[0].clientX,y:s.touches[0].clientY}:{x:s.clientX,y:s.clientY}}function y(s){if(s.button&&s.button!==0)return;const l=w(s);r=l.x,c=l.y;const d=e.getBoundingClientRect();a=d.left,f=d.top,p=!1,n=!0,e.style.transition="none"}function v(s){if(!n)return;const l=w(s),d=l.x-r,h=l.y-c;if(!p&&(Math.abs(d)>6||Math.abs(h)>6)&&(p=!0),p){s.cancelable&&s.preventDefault();const k=window.innerWidth-e.offsetWidth-10,L=window.innerHeight-e.offsetHeight-10,S=Math.max(10,Math.min(k,a+d)),C=Math.max(10,Math.min(L,f+h));e.style.left=`${S}px`,e.style.top=`${C}px`,e.style.bottom="auto",e.style.right="auto"}}function x(s){if(n)if(n=!1,e.style.transition="all 0.3s cubic-bezier(0.16, 1, 0.3, 1)",!p)window.toggleGlobalSidebar();else{const l=e.getBoundingClientRect(),d=window.innerWidth/2;l.left+l.width/2<d?(e.style.left="16px",e.style.right="auto"):(e.style.left=`${window.innerWidth-l.width-16}px`,e.style.right="auto")}}i.addEventListener("touchstart",y,{passive:!1}),window.addEventListener("touchmove",v,{passive:!1}),window.addEventListener("touchend",x),i.addEventListener("mousedown",y),window.addEventListener("mousemove",v),window.addEventListener("mouseup",x)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",b):b()})();
