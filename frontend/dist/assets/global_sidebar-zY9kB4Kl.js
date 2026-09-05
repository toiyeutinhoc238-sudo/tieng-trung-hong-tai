(function(){const s=document.createElement("link").relList;if(s&&s.supports&&s.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))l(a);new MutationObserver(a=>{for(const e of a)if(e.type==="childList")for(const i of e.addedNodes)i.tagName==="LINK"&&i.rel==="modulepreload"&&l(i)}).observe(document,{childList:!0,subtree:!0});function c(a){const e={};return a.integrity&&(e.integrity=a.integrity),a.referrerPolicy&&(e.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?e.credentials="include":a.crossOrigin==="anonymous"?e.credentials="omit":e.credentials="same-origin",e}function l(a){if(a.ep)return;a.ep=!0;const e=c(a);fetch(a.href,e)}})();(function(){function d(){const e=window.location.pathname.toLowerCase(),i=window.location.search.toLowerCase();return e==="/"||e.endsWith("/index.html")?i.includes("tab=flashcards")?"flashcards":i.includes("view=roadmap")||window.location.hash.includes("roadmap")?"roadmap":"home":e.includes("video-dictation")?i.includes("mode=shadowing")?"shadowing":"dictation":e.includes("reading-practice")?"reading":e.includes("chinese-phonetics")?"phonetics":e.includes("chinese-radicals")?"radicals":e.includes("hanzi-writer")?"hanzi":e.includes("hsk-grammar")?"grammar":e.includes("lesson-texts")?"texts":e.includes("detail-list")?"vocabulary":e.includes("quiz-game")?"games":e.includes("han-viet-rules")?"rules":e.includes("rank")?"rank":""}function s(){try{const e=localStorage.getItem("hongtai_current_user")||localStorage.getItem("currentUser");if(e)return JSON.parse(e)}catch{}return null}function c(){const e=d(),i=s(),r=i?i.name||i.displayName||"Học viên":"Khách (Chưa đăng nhập)",n=i?i.email||"":"Đăng nhập để lưu tiến độ học",t=i?i.role==="super_admin"?"Super Admin":i.role==="admin"?"Admin":i.role==="teacher"?"Giáo viên":"Học viên":"Khách",o=i&&i.picture?i.picture:"";return`
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
            ${o?`<img class="user-avatar-img" src="${o}" alt="Avatar" style="display: block;">`:'<div class="user-avatar sidebar-avatar-placeholder"><i class="fa-solid fa-user"></i></div>'}
          </div>
          <div class="user-info">
            <span class="user-name">${r}</span>
            <span class="user-sub">${n}</span>
            <span class="user-role-badge">${t}</span>
          </div>
        </div>
      </div>

      <div class="sidebar-menu-wrapper" style="overflow-y: auto; flex: 1; padding-right: 4px;">
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
      </div>

      <!-- FOOTER CONTROLS -->
      <div class="sidebar-footer" style="display: flex; gap: 8px; justify-content: space-between; align-items: center; padding-top: 14px; border-top: 1px solid var(--border-glass, rgba(255,255,255,0.12));">
        <button onclick="window.toggleTheme && window.toggleTheme()" class="btn btn-outline btn-sm" style="flex: 1; display: inline-flex; align-items: center; justify-content: center; gap: 6px; font-size: 0.82rem; padding: 8px 10px; border-radius: 10px;">
          <i class="fa-solid fa-moon"></i> <span>Giao diện</span>
        </button>
        <button onclick="window.toggleSeasonalParticles && window.toggleSeasonalParticles()" class="btn btn-outline btn-sm" style="display: inline-flex; align-items: center; justify-content: center; font-size: 0.85rem; padding: 8px 12px; border-radius: 10px;">
          <i class="fa-solid fa-snowflake" style="color: #60a5fa;"></i>
        </button>
      </div>
    </aside>
    `}window.openGlobalSidebar=function(){const e=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar"),i=document.querySelector(".sidebar-backdrop")||document.getElementById("global-sidebar-backdrop");e&&e.classList.add("open","active"),i&&i.classList.add("active"),document.body.classList.add("sidebar-open")},window.closeGlobalSidebar=function(){const e=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar"),i=document.querySelector(".sidebar-backdrop")||document.getElementById("global-sidebar-backdrop");e&&e.classList.remove("open","active"),i&&i.classList.remove("active"),document.body.classList.remove("sidebar-open")},window.toggleGlobalSidebar=function(){const e=document.querySelector(".app-sidebar")||document.getElementById("global-app-sidebar");e&&(e.classList.contains("open")||e.classList.contains("active")||document.body.classList.contains("sidebar-open"))?window.closeGlobalSidebar():window.openGlobalSidebar()},document.addEventListener("keydown",function(e){e.key==="Escape"&&window.closeGlobalSidebar()});function l(){let e=document.querySelector(".sidebar-backdrop");e||(e=document.createElement("div"),e.className="sidebar-backdrop",e.id="global-sidebar-backdrop",document.body.appendChild(e)),e.addEventListener("click",window.closeGlobalSidebar);const i=window.location.pathname==="/"||window.location.pathname.endsWith("/index.html");if(!document.querySelector(".app-sidebar")&&!i){const t=document.createElement("div");t.id="global-sidebar-mount",t.innerHTML=c(),document.body.insertBefore(t.firstElementChild,document.body.firstChild)}a();const n=()=>{document.querySelectorAll(".menu-toggle-btn, .global-hamburger-btn, .sidebar-open-btn, .top-menu-btn, #top-sidebar-toggle-btn, #sidebar-expand-float-btn, .sidebar-expand-float-btn, #mobile-nav-toggle-btn").forEach(t=>{t.onclick=window.toggleGlobalSidebar})};n(),setTimeout(n,500)}function a(){const e=document.querySelector(".global-hamburger-btn, #mobile-nav-toggle-btn, #top-sidebar-toggle-btn");if(e){e.onclick=window.toggleGlobalSidebar;return}const i=[{container:".navbar .nav-container",insertBefore:".nav-brand"},{container:".top-bar",insertBefore:":first-child"},{container:".rd-header-left",insertBefore:":first-child"},{container:".rd-header-bar",insertBefore:":first-child"},{container:".dict-top-nav",insertBefore:".dict-brand"},{container:".grammar-header .brand-box",insertBefore:":first-child"},{container:".grammar-header",insertBefore:":first-child"},{container:".hanzi-header .brand-box",insertBefore:":first-child"},{container:".hanzi-header",insertBefore:":first-child"},{container:".phonetics-header .brand-box",insertBefore:":first-child"},{container:".phonetics-header",insertBefore:":first-child"},{container:".header-card > div:first-child",insertBefore:":first-child"},{container:".header-card",insertBefore:":first-child"},{container:".header-panel .logo",insertBefore:":first-child"},{container:".header-panel",insertBefore:":first-child"},{container:".rank-header-nav",insertBefore:".rank-brand-logo"},{container:".rules-header",insertBefore:".rules-title-group"},{container:".header-bar .header-title-wrap",insertBefore:":first-child"},{container:".chat-view-header",insertBefore:":first-child"},{container:"header",insertBefore:":first-child"}];let r=!1;for(const n of i){const t=document.querySelector(n.container);if(t){if(t.querySelector(".global-hamburger-btn, .menu-toggle-btn, #sidebar-expand-float-btn")){r=!0;break}const o=document.createElement("button");if(o.className="menu-toggle-btn global-hamburger-btn",o.id="global-hamburger-btn",o.title="Mở Menu Danh Mục",o.setAttribute("aria-label","Mở Menu Danh Mục"),o.innerHTML='<i class="fa-solid fa-bars"></i> <span class="btn-text">Menu</span>',o.onclick=window.toggleGlobalSidebar,n.insertBefore===":first-child")t.insertBefore(o,t.firstChild);else{const f=t.querySelector(n.insertBefore);f?t.insertBefore(o,f):t.insertBefore(o,t.firstChild)}r=!0;break}}if(!r&&!document.querySelector(".floating-menu-trigger-btn")){const n=document.createElement("button");n.className="menu-toggle-btn global-hamburger-btn floating-menu-trigger-btn",n.id="global-floating-menu-btn",n.title="Mở Menu Danh Mục",n.setAttribute("aria-label","Mở Menu Danh Mục"),n.innerHTML='<i class="fa-solid fa-bars"></i>',n.onclick=window.toggleGlobalSidebar,document.body.appendChild(n)}}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",l):l()})();
