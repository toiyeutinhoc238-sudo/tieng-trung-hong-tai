import"./style-DS26AI4y.js";import"./particles-Dl8CQUZ9.js";import"./screen_drawing-Cm5JD6Na.js";let $={radicals:[],comparisons:[]};async function J(){try{let e=await fetch("/radicals_data.json");e.ok||(e=await fetch("/src/radicals_data.json")),e.ok&&($=await e.json(),typeof W=="function"&&W())}catch(e){console.warn("Could not load radicals_data.json:",e)}}J();let f="50 bộ (1)",M=null,E=null,w=0,p=[];function A(e){if(!e)return;const t=e.trim();if(!t)return;if(E){try{E.pause(),E.currentTime=0,E.src=""}catch{}E=null}const n=parseFloat(localStorage.getItem("speech_playback_rate"))||1,o=`${window.location.origin.includes("5173")?"http://localhost:5000":window.location.origin}/api/tts?text=${encodeURIComponent(t)}&voice=baidu-female`,i=new Audio(o);i.playbackRate=n,E=i,i.play().catch(r=>{console.warn("Retrying Baidu female voice audio playback...",r),setTimeout(()=>{i.play().catch(l=>{if(console.error("Audio playback error:",l),"speechSynthesis"in window){window.speechSynthesis.cancel();const y=new SpeechSynthesisUtterance(t);y.lang="zh-CN",y.rate=n,window.speechSynthesis.speak(y)}})},200)})}window.speakText=A;window.switchRadicalPageTab=function(e){f=e,Object.entries({"50 bộ (1)":"tab-50-1","50 bộ (2)":"tab-50-2","50 bộ (3)":"tab-50-3","Còn lại":"tab-rest","So sánh":"tab-comp"}).forEach(([n,a])=>{const o=document.getElementById(a);o&&(n===e?o.classList.add("active"):o.classList.remove("active"))}),W()};function W(){const e=document.getElementById("radicals-content-area");if(!e)return;const t=document.querySelector(".print-mode-btn"),n=document.getElementById("print-mode-btn-text");if(f==="So sánh")t&&(t.style.display="none");else if(t&&(t.style.display="inline-flex"),n){let a=0,o="";f==="Còn lại"?(a=($.radicals||[]).filter(i=>i.category==="Còn lại").length,o=`Còn Lại - ${a} Bộ`):(a=($.radicals||[]).filter(i=>i.category===f).length,o=`${a||50} Bộ`),n.textContent=`In Phiếu Tập Tô (${o})`}if(f==="So sánh"){const a=$.comparisons||[];p=a.map((i,r)=>({id:`comp_${r}`,radical:`${i.rad1} / ${i.rad2}`,variant:"",pinyin:`${i.meaning1} vs ${i.meaning2}`,name:"Phân biệt",meaning:i.difference,note:i.difference,example:i.example,category:"So sánh"}));let o=`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="background: rgba(37, 99, 235, 0.12); border: 1px solid rgba(37, 99, 235, 0.3); border-radius: 14px; padding: 14px 18px; color: var(--text-color); font-size: 0.93rem; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-circle-info" style="color: #3b82f6; font-size: 1.1rem;"></i>
          <span>Tổng hợp 25 cặp bộ thủ có hình dáng tương đồng và bí quyết phân biệt chi tiết:</span>
        </div>
    `;a.forEach((i,r)=>{o+=`
        <div class="rad-card" onclick="window.openRadicalDetailByIndex(${r})">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px dashed rgba(255,255,255,0.15); padding-bottom: 12px; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 14px;">
              <span style="background: rgba(37, 99, 235, 0.2); color: #3b82f6; border: 1.5px solid #2563eb; padding: 6px 16px; border-radius: 10px; font-weight: 800; font-family: var(--font-hanzi); font-size: 1.5rem;">
                ${i.rad1} <span style="font-size: 0.95rem; font-weight: 600;">(${i.meaning1})</span>
              </span>
              <span style="font-weight: 800; color: #ef4444; font-size: 1.1rem;">VS</span>
              <span style="background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1.5px solid #10b981; padding: 6px 16px; border-radius: 10px; font-weight: 800; font-family: var(--font-hanzi); font-size: 1.5rem;">
                ${i.rad2} <span style="font-size: 0.95rem; font-weight: 600;">(${i.meaning2})</span>
              </span>
            </div>
          </div>

          <div style="font-size: 0.98rem; line-height: 1.55;">
            <strong style="color: #fbbf24;"><i class="fa-solid fa-scale-balanced" style="margin-right: 4px;"></i> Phân biệt:</strong> ${i.difference}
          </div>

          ${i.example?`
            <div style="font-size: 0.92rem; background: rgba(0,0,0,0.25); border-left: 3px solid #3b82f6; padding: 10px 14px; border-radius: 0 8px 8px 0;">
              <i class="fa-solid fa-book" style="color: #3b82f6; margin-right: 6px;"></i> <strong>Ví dụ:</strong> ${i.example}
            </div>
          `:""}
        </div>
      `}),o+="</div>",e.innerHTML=o}else{const a=($.radicals||[]).filter(i=>i.category===f);p=a;let o='<div class="grid-container">';a.forEach((i,r)=>{o+=`
        <div class="rad-card" onclick="window.openRadicalDetailByIndex(${r})">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: baseline; gap: 8px;">
              <span style="font-family: var(--font-hanzi); font-size: 2.4rem; font-weight: 800; color: #2563eb;">
                ${i.radical}
              </span>
              ${i.variant?`<span style="font-family: var(--font-hanzi); font-size: 1.5rem; color: #0284c7; font-weight: 700;">(${i.variant})</span>`:""}
            </div>
            <span style="font-family: var(--font-pinyin); font-size: 1.15rem; font-weight: 700; color: #0284c7;">
              ${i.pinyin}
            </span>
          </div>

          <div style="font-size: 1.1rem; font-weight: 800; border-top: 1px solid rgba(148, 163, 184, 0.2); padding-top: 8px;">
            Hán-Việt: ${i.name} - <span style="color: #10b981;">${i.meaning}</span>
          </div>

          ${i.note?`
            <div style="font-size: 0.88rem; font-style: italic; line-height: 1.4; background: rgba(37, 99, 235, 0.08); padding: 8px 12px; border-radius: 8px;" class="rad-text-sub">
              <i class="fa-solid fa-circle-info" style="color: #2563eb; margin-right: 4px;"></i> ${i.note}
            </div>
          `:""}

          ${i.example?`
            <div style="font-size: 0.9rem; font-weight: 600; margin-top: 2px;" class="rad-text-primary">
              <i class="fa-solid fa-lightbulb" style="color: #fbbf24; margin-right: 4px;"></i> Ví dụ: ${i.example}
            </div>
          `:""}
        </div>
      `}),o+="</div>",e.innerHTML=o}}window.startRadicalFlashcardMode=function(){const e=document.getElementById("radicals-grid-view"),t=document.getElementById("radicals-flashcard-view");e&&(e.style.display="none"),t&&(t.style.display="block"),window.scrollTo({top:0,behavior:"smooth"}),window.selectRadicalByIndex(0)};window.openRadicalDetailByIndex=function(e){const t=document.getElementById("radicals-grid-view"),n=document.getElementById("radicals-flashcard-view");t&&(t.style.display="none"),n&&(n.style.display="block"),window.scrollTo({top:0,behavior:"smooth"}),window.selectRadicalByIndex(e)};window.showGridView=function(){const e=document.getElementById("radicals-grid-view"),t=document.getElementById("radicals-flashcard-view");e&&(e.style.display="block"),t&&(t.style.display="none"),window.scrollTo({top:0,behavior:"smooth"})};window.selectRadicalByIndex=function(e){if(!p||p.length===0)return;e<0&&(e=p.length-1),e>=p.length&&(e=0),w=e;const t=p[w],n=document.getElementById("radicals-count-badge");n&&(n.textContent=`${p.length} ${f==="So sánh"?"cặp phân biệt":"bộ thủ"}`),Q(t),Z()};window.nextRadicalFlashcard=function(){p.length>0&&window.selectRadicalByIndex(w+1)};window.prevRadicalFlashcard=function(){p.length>0&&window.selectRadicalByIndex(w-1)};function Q(e){const t=document.getElementById("hero-card-content");!t||!e||(t.innerHTML=`
    <div style="display: flex; gap: 32px; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; width: 100%;">
      
      <!-- Left Column: Tianzige Box + Stroke Play Button + Category Pill -->
      <div style="display: flex; flex-direction: column; align-items: center; text-align: center; flex-shrink: 0;">
        <div id="hero-tianzige-box" style="width: 170px; height: 170px; background: #ffffff; border: 2.5px solid #dc2626; border-radius: 18px; position: relative; overflow: hidden; box-shadow: 0 8px 24px rgba(0,0,0,0.12); display: flex; align-items: center; justify-content: center;"></div>

        <button onclick="window.animateRadicalStroke()" style="margin-top: 14px; background: rgba(37, 99, 235, 0.15); color: #2563eb; border: 1px solid rgba(37, 99, 235, 0.3); padding: 8px 18px; border-radius: 99px; font-weight: 800; cursor: pointer; font-size: 0.88rem; display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s;">
          <i class="fa-solid fa-pen-nib"></i> Phát lại nét
        </button>

        <div style="margin-top: 10px; background: rgba(37, 99, 235, 0.2); color: #3b82f6; padding: 4px 14px; border-radius: 99px; font-weight: 800; font-size: 0.82rem; border: 1px solid rgba(37, 99, 235, 0.35);">
          ${e.category||"Bộ thủ"}
        </div>
      </div>

      <!-- Right Column: Details -->
      <div style="flex: 1; min-width: 280px; display: flex; flex-direction: column; gap: 14px; text-align: left;">
        
        <!-- Row 1: Pinyin + Audio Speaker Button -->
        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="font-size: 2.2rem; font-weight: 800; color: #0284c7; font-family: var(--font-pinyin);">
            ${e.pinyin}
          </div>

          <button onclick="window.speakText('${(e.radical||"").replace(/'/g,"\\'")}')" title="Nghe phát âm Baidu Nữ" style="background: #2563eb; color: #ffffff; border: none; width: 48px; height: 48px; border-radius: 50%; font-size: 1.25rem; cursor: pointer; display: flex; align-items: center; justify-content: center; box-shadow: 0 6px 18px rgba(37, 99, 235, 0.4); transition: transform 0.15s;" onmousedown="this.style.transform='scale(0.92)'" onmouseup="this.style.transform='scale(1)'">
            <i class="fa-solid fa-volume-high"></i>
          </button>
        </div>

        <!-- Row 2: Badge Box: BỘ THỦ: 人 (Biến thể: 亻) (NHÂN - Người) -->
        <div class="hero-info-badge">
          <i class="fa-solid fa-layer-group" style="font-size: 0.95rem;"></i>
          <span>BỘ THỦ: <strong style="font-family: var(--font-hanzi); font-size: 1.35rem; color: #2563eb;">${e.radical}</strong> ${e.variant?`( Biến thể: <strong style="font-family: var(--font-hanzi); color: #2563eb;">${e.variant}</strong> )`:""} ( <strong style="text-transform: uppercase;">${e.name}</strong> - ${e.meaning} )</span>
        </div>

        <!-- Row 3: Large Bold Meaning -->
        <div style="font-size: 1.65rem; font-weight: 800; color: #10b981;">
          Nghĩa: ${e.meaning} <span style="font-size: 1.15rem; font-weight: 700; color: #0284c7; margin-left: 8px;">(${e.name})</span>
        </div>

        <!-- Row 4: Usage Note -->
        ${e.note?`
          <div style="font-size: 0.98rem; font-style: italic; line-height: 1.55; display: flex; align-items: flex-start; gap: 8px;" class="hero-text-sub">
            <i class="fa-solid fa-circle-info" style="color: #2563eb; font-size: 1.05rem; margin-top: 3px;"></i>
            <span><strong>Cách dùng:</strong> ${e.note}</span>
          </div>
        `:""}

        <!-- Row 5: Examples -->
        ${e.example?`
          <div style="border-left: 3.5px solid #2563eb; padding-left: 14px; margin-top: 4px;">
            <div style="font-size: 0.85rem; font-weight: 800; color: #2563eb; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 3px;">VÍ DỤ:</div>
            <div style="font-size: 1.1rem; font-weight: 700;" class="hero-text-primary">${e.example}</div>
          </div>
        `:""}

      </div>
    </div>
  `,setTimeout(()=>{const n=document.getElementById("hero-tianzige-box");if(n&&window.HanziWriter){n.innerHTML="";const a=(e.radical||"").split("/")[0].trim();M=window.HanziWriter.create("hero-tianzige-box",a,{width:170,height:170,padding:10,showOutline:!0,strokeColor:"#dc2626",outlineColor:"#cbd5e1",showCharacter:!0}),M.animateCharacter()}},50))}function Z(){const e=document.getElementById("mini-cards-grid");if(!e)return;let t="";p.forEach((n,a)=>{t+=`
      <div class="mini-rad-card ${a===w?"active":""}" onclick="window.selectRadicalByIndex(${a})" id="mini-card-${a}">
        <div style="font-family: var(--font-hanzi); font-size: 2.1rem; font-weight: 800; color: #2563eb;">
          ${n.radical}
        </div>
        <div style="font-family: var(--font-pinyin); font-size: 0.9rem; font-weight: 700; color: #0284c7; margin-top: 2px;">
          ${n.pinyin}
        </div>
        <div style="font-size: 0.78rem; font-weight: 600; margin-top: 4px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;" class="hero-text-sub">
          ${n.name}
        </div>
      </div>
    `}),e.innerHTML=t,setTimeout(()=>{const n=document.getElementById("mini-cards-grid"),a=document.getElementById(`mini-card-${w}`);if(n&&a){const o=a.offsetLeft-n.clientWidth/2+a.offsetWidth/2;n.scrollTo({left:Math.max(0,o),behavior:"smooth"})}},100)}window.animateRadicalStroke=function(){M&&M.animateCharacter()};let b=!1;window.toggleRadicalFullscreen=function(e){const t=typeof e=="boolean"?e:!b,n=document.getElementById("radicals-flashcard-view");if(!n)return;b=t,document.body.classList.toggle("flashcard-fullscreen-mode",b),n.classList.toggle("fullscreen-flashcard-active",b);const a=document.getElementById("radical-fullscreen-toggle-btn");if(a){a.classList.toggle("active-fullscreen",b);const o=a.querySelector(".fs-btn-label");o&&(o.textContent=b?"Thu Nhỏ":"Toàn Màn Hình");const i=a.querySelector("i");i&&(i.className=`fa-solid ${b?"fa-compress":"fa-expand"}`),a.title=b?"Thu nhỏ (Phím F hoặc Esc)":"Phóng to toàn màn hình (Phím F)"}if(b)try{n.requestFullscreen?n.requestFullscreen().catch(()=>{}):n.webkitRequestFullscreen&&n.webkitRequestFullscreen()}catch{}else if(!!(document.fullscreenElement||document.webkitFullscreenElement))try{document.exitFullscreen&&document.exitFullscreen().catch(()=>{})}catch{}};document.addEventListener("fullscreenchange",()=>{!!!(document.fullscreenElement||document.webkitFullscreenElement)&&b&&window.toggleRadicalFullscreen(!1)});document.addEventListener("keydown",e=>{const t=document.getElementById("radicals-flashcard-view");t&&t.style.display!=="none"&&(e.key==="ArrowLeft"?window.prevRadicalFlashcard():e.key==="ArrowRight"?window.nextRadicalFlashcard():e.key===" "||e.key==="Spacebar"?(e.preventDefault(),p[w]&&A(p[w].radical)):e.key==="f"||e.key==="F"?(e.preventDefault(),window.toggleRadicalFullscreen()):e.key==="Escape"&&b&&(e.preventDefault(),window.toggleRadicalFullscreen(!1)))});document.addEventListener("DOMContentLoaded",()=>{W()});let I="all",_="fit_multi",O="4",U="2",q=!0,X=!0;window.printRadicalWorksheet=function(){openRadicalPrintWorksheetModal("all")};window.openRadicalPrintWorksheetModal=function(e="all"){I=e;let t=document.getElementById("print-radical-worksheet-modal");t||(t=document.createElement("div"),t.id="print-radical-worksheet-modal",t.style.cssText="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(11,15,25,0.92); z-index:9999999; align-items:center; justify-content:center; padding:16px; box-sizing:border-box; backdrop-filter:blur(8px);",document.body.appendChild(t));const n=document.getElementById("seasonal-particle-canvas");n&&(n.style.display="none"),t.innerHTML=`
    <div style="background:#0f172a; border:1px solid rgba(255,255,255,0.15); border-radius:20px; max-width:980px; width:100%; max-height:95vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 20px 50px rgba(0,0,0,0.6);">
      
      <!-- Thanh Tiêu Đề Modal -->
      <div class="no-print" style="padding:14px 20px; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; justify-content:space-between; align-items:center; background:rgba(30,41,59,0.9); flex-wrap:wrap; gap:10px;">
        <h3 style="color:#fff; font-size:1.1rem; margin:0; font-weight:700; display:flex; align-items:center; gap:8px; font-family:'Be Vietnam Pro','Segoe UI',sans-serif;">
          <i class="fa-solid fa-print" style="color:#10b981;"></i> Xem Trước Phiếu In Tập Viết Bộ Thủ Tiếng Trung
        </h3>
        <div style="display:flex; gap:10px; align-items:center;">
          <button style="background:linear-gradient(135deg, #10b981, #059669); border:none; color:#ffffff; padding:9px 22px; border-radius:99px; font-weight:700; font-family:'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; cursor:pointer; display:inline-flex; align-items:center; gap:8px; box-shadow:0 4px 14px rgba(16,185,129,0.4); font-size:0.95rem; text-transform:none; letter-spacing:0.2px;" onclick="triggerRadicalPrintWorksheet()">
            <i class="fa-solid fa-print"></i> In Ngay (<span id="modal-radical-print-total-pages">1 trang</span>)
          </button>
          <button style="background:rgba(255,255,255,0.15); border:1px solid rgba(255,255,255,0.25); color:#fff; padding:9px 18px; border-radius:99px; font-weight:700; font-family:'Be Vietnam Pro',sans-serif; cursor:pointer;" onclick="closeRadicalPrintWorksheetModal()">
            <i class="fa-solid fa-xmark"></i> Đóng
          </button>
        </div>
      </div>

      <!-- Thanh Bảng Điều Khiển Tùy Chỉnh Phiếu In (Số Hàng, Pinyin, Nghĩa) -->
      <div class="no-print" style="padding:10px 20px; background:#1e293b; border-bottom:1px solid rgba(255,255,255,0.08); display:flex; flex-wrap:wrap; align-items:center; gap:16px; font-size:0.85rem; color:#cbd5e1;">
        
        <!-- Chọn Phạm Vi In -->
        <div style="display:flex; align-items:center; gap:6px;">
          <label style="font-weight:700; color:#f59e0b;"><i class="fa-solid fa-list-check"></i> Danh sách in:</label>
          <select id="radical-print-scope" onchange="updateRadicalWorksheetPreviewConfig()" style="background:#0f172a; border:1px solid #f59e0b; color:#fff; padding:4px 10px; border-radius:8px; font-weight:700; outline:none; cursor:pointer;">
            <option value="all" ${I==="all"?"selected":""}>Tất cả (${f==="So sánh"?"25 Cặp Phân Biệt":f==="Còn lại"?"Còn Lại (64 Bộ)":f})</option>
            <option value="single" ${I==="single"?"selected":""}>Chỉ bộ thủ đang chọn</option>
          </select>
        </div>

        <!-- Chọn Chế Độ Ghép Trang / Tiết Kiệm Giấy -->
        <div style="display:flex; align-items:center; gap:6px;">
          <label style="font-weight:700; color:#38bdf8;"><i class="fa-solid fa-file-invoice"></i> Chế độ in:</label>
          <select id="radical-print-layout" onchange="updateRadicalWorksheetPreviewConfig()" style="background:#0f172a; border:1px solid #38bdf8; color:#fff; padding:4px 10px; border-radius:8px; font-weight:700; outline:none; cursor:pointer;">
            <option value="fit_multi" selected>🌱 Ghép nhiều từ/trang (Tiết kiệm giấy)</option>
            <option value="one_per_page">📄 Mỗi bộ thủ 1 trang riêng</option>
          </select>
        </div>

        <!-- Tùy chỉnh Số Hàng -->
        <div style="display:flex; align-items:center; gap:6px;">
          <label style="font-weight:700; color:#60a5fa;"><i class="fa-solid fa-table-cells-large"></i> Số hàng/từ:</label>
          <select id="radical-print-rows" onchange="updateRadicalWorksheetPreviewConfig()" style="background:#0f172a; border:1px solid #3b82f6; color:#fff; padding:4px 10px; border-radius:8px; font-weight:700; outline:none; cursor:pointer;">
            <option value="2">2 hàng (Siêu tiết kiệm, 4-5 từ/trang)</option>
            <option value="3">3 hàng (Tiết kiệm, 3-4 từ/trang)</option>
            <option value="4" selected>4 hàng (Chuẩn ghép, 2-3 từ/trang)</option>
            <option value="5">5 hàng (Ghép 1-2 từ/trang)</option>
            <option value="6">6 hàng (Chuẩn 1 từ/trang)</option>
          </select>
        </div>

        <!-- Tùy chỉnh Số Hàng Tô Mờ -->
        <div style="display:flex; align-items:center; gap:6px;">
          <label style="font-weight:700; color:#34d399;"><i class="fa-solid fa-pen-nib"></i> Số hàng mờ mẫu:</label>
          <select id="radical-print-trace-rows" onchange="updateRadicalWorksheetPreviewConfig()" style="background:#0f172a; border:1px solid #10b981; color:#fff; padding:4px 10px; border-radius:8px; font-weight:700; outline:none; cursor:pointer;">
            <option value="0">0 hàng (Chỉ ô trống)</option>
            <option value="1">1 hàng mờ</option>
            <option value="2" selected>2 hàng mờ (Mặc định)</option>
            <option value="3">3 hàng mờ</option>
            <option value="all">Tất cả hàng mờ</option>
          </select>
        </div>

        <!-- Checkbox Hiển thị Pinyin -->
        <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:700; color:#f59e0b; user-select:none;">
          <input type="checkbox" id="radical-print-show-pinyin" checked onchange="updateRadicalWorksheetPreviewConfig()" style="accent-color:#f59e0b; width:16px; height:16px; cursor:pointer;">
          Hiển thị Pinyin
        </label>

        <!-- Checkbox Hiển thị Nghĩa -->
        <label style="display:flex; align-items:center; gap:6px; cursor:pointer; font-weight:700; color:#a855f7; user-select:none;">
          <input type="checkbox" id="radical-print-show-meaning" checked onchange="updateRadicalWorksheetPreviewConfig()" style="accent-color:#a855f7; width:16px; height:16px; cursor:pointer;">
          Hiển thị Nghĩa Tiếng Việt
        </label>
      </div>

      <!-- Preview Sheet Content Container -->
      <div id="radical-print-worksheet-content-wrap" style="flex:1; overflow-y:auto; padding:24px; background:#f1f5f9; color:#000;">
        <!-- Dynamic printable content injected here -->
      </div>
    </div>
  `,t.style.display="flex",updateRadicalWorksheetPreviewConfig()};window.closeRadicalPrintWorksheetModal=function(){const e=document.getElementById("print-radical-worksheet-modal");e&&(e.style.display="none");const t=document.getElementById("seasonal-particle-canvas");t&&localStorage.getItem("particles_enabled")!=="false"&&(t.style.display="block")};window.updateRadicalWorksheetPreviewConfig=function(){const e=document.getElementById("radical-print-scope"),t=document.getElementById("radical-print-layout"),n=document.getElementById("radical-print-rows"),a=document.getElementById("radical-print-trace-rows"),o=document.getElementById("radical-print-show-pinyin"),i=document.getElementById("radical-print-show-meaning");e&&(I=e.value),t&&(_=t.value),n&&(O=n.value),a&&(U=a.value),o&&(q=o.checked),i&&(X=i.checked);let r=[];if(f==="So sánh"?r=($.comparisons||[]).map((l,y)=>({id:`comp_${y}`,radical:`${l.rad1}/${l.rad2}`,variant:"",pinyin:`${l.meaning1} vs ${l.meaning2}`,name:"Phân biệt",meaning:l.difference+(l.example?` (VD: ${l.example})`:""),category:"Phân biệt"})):f==="Còn lại"?r=($.radicals||[]).filter(l=>l.category==="Còn lại"):(r=($.radicals||[]).filter(l=>l.category===f),r.length===0&&(r=($.radicals||[]).filter(l=>l.category==="50 bộ (1)"))),I==="single"&&p[w]){const l=p[w];if(l&&l.radical){const y=r.find(H=>H.radical===l.radical);r=y?[y]:[l]}else r=r.slice(0,1)}ee(r)};function ee(e){const t=document.getElementById("radical-print-worksheet-content-wrap");if(!t)return;const n=new Date,a=`${n.getDate()}/${n.getMonth()+1}/${n.getFullYear()}`,o=13,i=48,r=parseInt(O)||4,l=U,y=q,H=X;function D(d,s=""){return`
      <div style="
        width:${d}px; height:${d}px;
        border:1px solid #16a34a;
        position:relative;
        display:flex; align-items:center; justify-content:center;
        box-sizing:border-box; background:#fff;
        margin-right:-1px; margin-bottom:-1px;
        flex-shrink:0;
      ">
        <svg style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;" viewBox="0 0 ${d} ${d}">
          <line x1="0" y1="${d/2}" x2="${d}" y2="${d/2}" stroke="#86efac" stroke-dasharray="2,2" />
          <line x1="${d/2}" y1="0" x2="${d/2}" y2="${d}" stroke="#86efac" stroke-dasharray="2,2" />
          <line x1="0" y1="0" x2="${d}" y2="${d}" stroke="#dcfce7" stroke-dasharray="2,2" />
          <line x1="${d}" y1="0" x2="0" y2="${d}" stroke="#dcfce7" stroke-dasharray="2,2" />
        </svg>
        ${s}
      </div>`}const N=[];let V="";if(_==="fit_multi"){let d=e.length,s=3;r<=2?s=5:r===3?s=4:r===4?s=3:r>=5&&(s=2);let g=Math.ceil(d/s)||1;const x=document.getElementById("modal-radical-print-total-pages");x&&(x.textContent=`${g} trang`);for(let m=0;m<g;m++){const v=e.slice(m*s,(m+1)*s);let z="";v.forEach((c,R)=>{const B=m*s+R,C=c.radical,h=c.radical+(c.variant?` / ${c.variant}`:""),L=C.match(/[\u4e00-\u9fa5]/g)||[C[0]];function F(u){let j="";for(let K=0;K<o;K++){let P=!1;(l==="all"||l==="1"&&u===0||l==="2"&&(u===0||u===1)||l==="3"&&(u===0||u===1||u===2))&&(P=!0);let G="";P&&(G=`<span style="
                font-size:${i*.72}px;
                font-family:'LXGW WenKai Lite','Kaiti','STKaiti','Kai','PingFang SC','Noto Serif SC',serif;
                font-weight:normal; color:#111827; opacity:0.18;
                line-height:1; position:relative; z-index:2; pointer-events:none;
              ">${C}</span>`),j+=D(i,G)}return`<div style="display:flex;">${j}</div>`}let T="";for(let u=0;u<r;u++)T+=F(u);const S=`radical-stroke-steps-modal-${B}`;N.push({id:S,wordChars:L});const Y=`
          <div style="
            border:2px solid #22c55e; border-radius:8px;
            padding:8px 14px; margin-bottom:8px;
            background:#fff; width:100%; box-sizing:border-box;
          ">
            <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:6px; border-bottom:1px dashed #dcfce7;">
              <div style="display:flex; align-items:baseline; gap:12px; flex-wrap:wrap;">
                <span style="
                  font-size:1.8rem;
                  font-family:'LXGW WenKai Lite','Kaiti','STKaiti','Kai','PingFang SC','Noto Serif SC',serif;
                  font-weight:bold; color:#111827; line-height:1;
                ">${h}</span>
                ${y&&c.pinyin?`<span style="font-size:1.05rem; font-weight:800; color:#ea580c;">${c.pinyin}</span>`:""}
                ${H?`<span style="font-size:0.9rem; color:#374151; font-weight:700;">${c.name?`${c.name} (${c.meaning||""})`:c.meaning||""}</span>`:""}
              </div>
              <div style="font-size:0.75rem; color:#16a34a; font-weight:700; background:#f0fdf4; padding:3px 10px; border-radius:12px; border:1px solid #bbf7d0;">
                ${c.category||"50 BỘ THỦ"}
              </div>
            </div>

            <div style="margin-top:6px;">
              <div id="${S}" style="display:flex; flex-wrap:wrap; gap:12px; align-items:center;">
                <span style="font-size:0.75rem; color:#9ca3af;">Đang tải nét bút...</span>
              </div>
            </div>
          </div>`;z+=`
          <div class="print-word-card" style="margin-bottom:18px; page-break-inside:avoid; break-inside:avoid;">
            <div style="font-size:0.75rem; font-weight:800; color:#16a34a; margin-bottom:4px;">
              Bộ thủ #${B+1}: ${c.radical}
            </div>
            ${Y}
            <div style="display:inline-flex; flex-direction:column; border:2px solid #22c55e; border-radius:6px; overflow:hidden; box-sizing:border-box; width:100%;">
              ${T}
            </div>
          </div>
        `});const k=m===g-1;V+=`
        <div class="print-page-area" style="
          font-family:'Be Vietnam Pro','Segoe UI',sans-serif;
          padding:24px 28px;
          background:#fff; color:#000;
          max-width:${o*i+80}px;
          margin:0 auto ${k?"0":"30px"} auto;
          box-shadow:0 10px 30px rgba(0,0,0,0.15);
          border-radius:12px;
          page-break-after: always;
          break-after: page;
        ">
          <!-- HEADER -->
          <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #f97316; padding-bottom:8px; margin-bottom:10px;">
            <div>
              <div style="font-size:1.4rem; font-weight:900; color:#f97316;">Tiếng Trung HongTai</div>
              <div style="font-size:0.78rem; color:#16a34a; font-weight:700; margin-top:2px;">Phiếu Tập Viết Bộ Thủ Tiếng Trung (Tiết Kiệm Giấy - ${e.length} bộ)</div>
            </div>
            <div style="text-align:right; font-size:0.75rem; color:#6b7280;">
              <div style="font-weight:700; color:#111827;">tiengtrunghongtai.com</div>
              <div>Trang ${m+1}/${g} - Ngày in: ${a}</div>
            </div>
          </div>

          <!-- HÀNG TÊN / LỚP / NGÀY -->
          <div style="display:flex; gap:20px; margin-bottom:12px; font-size:0.8rem; font-weight:700; color:#16a34a; border-bottom:1px dashed #cbd5e1; padding-bottom:8px;">
            <span>Tên: <span style="display:inline-block; border-bottom:1.5px solid #22c55e; min-width:150px;">&nbsp;</span></span>
            <span>Lớp: <span style="display:inline-block; border-bottom:1.5px solid #22c55e; min-width:80px;">&nbsp;</span></span>
            <span>Ngày: <span style="display:inline-block; border-bottom:1.5px solid #22c55e; min-width:110px;">&nbsp;</span></span>
          </div>

          <!-- DANH SÁCH CÁC THẺ BỘ THỦ GHÉP -->
          ${z}

          <!-- FOOTER -->
          <div style="margin-top:12px; border-top:1px dashed #86efac; padding-top:6px; display:flex; justify-content:space-between; font-size:0.72rem; color:#9ca3af; page-break-inside: avoid; break-inside: avoid;">
            <span>💡 Viết theo các ô mờ mẫu ➔ Tự viết vào các ô trống (tự điều chỉnh số hàng để ghép vừa 1 trang A4).</span>
            <span style="font-weight:800; color:#f97316;">Tiếng Trung HongTai</span>
          </div>
        </div>
      `}}else{const d=document.getElementById("modal-radical-print-total-pages");d&&(d.textContent=`${e.length} trang`),e.forEach((s,g)=>{const x=s.radical,m=s.radical+(s.variant?` / ${s.variant}`:""),v=x.match(/[\u4e00-\u9fa5]/g)||[x[0]];function z(h){let L="";for(let F=0;F<o;F++){let T=!1;(l==="all"||l==="1"&&h===0||l==="2"&&(h===0||h===1)||l==="3"&&(h===0||h===1||h===2))&&(T=!0);let S="";T&&(S=`<span style="
              font-size:${i*.72}px;
              font-family:'LXGW WenKai Lite','Kaiti','STKaiti','Kai','PingFang SC','Noto Serif SC',serif;
              font-weight:normal; color:#111827; opacity:0.18;
              line-height:1; position:relative; z-index:2; pointer-events:none;
            ">${x}</span>`),L+=D(i,S)}return`<div style="display:flex;">${L}</div>`}let k="";for(let h=0;h<r;h++)k+=z(h);const c=`radical-stroke-steps-modal-${g}`;N.push({id:c,wordChars:v});const R=`
        <div style="
          border:2px solid #22c55e; border-radius:8px;
          padding:12px 18px; margin-bottom:12px;
          background:#fff; width:100%; box-sizing:border-box;
        ">
          <div style="display:flex; justify-content:space-between; align-items:center; padding-bottom:8px; border-bottom:1px dashed #dcfce7;">
            <div style="display:flex; align-items:baseline; gap:16px; flex-wrap:wrap;">
              <span style="
                font-size:2.2rem;
                font-family:'LXGW WenKai Lite','Kaiti','STKaiti','Kai','PingFang SC','Noto Serif SC',serif;
                font-weight:bold; color:#111827; line-height:1;
              ">${m}</span>
              ${y&&s.pinyin?`<span style="font-size:1.15rem; font-weight:800; color:#ea580c;">${s.pinyin}</span>`:""}
              ${H?`<span style="font-size:0.95rem; color:#374151; font-weight:600;">${s.name?`${s.name} (${s.meaning||""})`:s.meaning||""}</span>`:""}
            </div>
            <div style="font-size:0.75rem; color:#16a34a; font-weight:700; background:#f0fdf4; padding:4px 12px; border-radius:12px; border:1px solid #bbf7d0;">
              ${s.category||"50 BỘ THỦ"}
            </div>
          </div>

          <div style="margin-top:8px;">
            <div id="${c}" style="display:flex; flex-wrap:wrap; gap:16px; align-items:center;">
              <span style="font-size:0.8rem; color:#9ca3af;">Đang tải nét bút...</span>
            </div>
          </div>
        </div>`,B=`
        <div style="display:inline-flex; flex-direction:column; border:2px solid #22c55e; border-radius:6px; overflow:hidden; box-sizing:border-box; width:100%;">
          ${k}
        </div>`,C=g===e.length-1;V+=`
        <div class="print-page-area" style="
          font-family:'Be Vietnam Pro','Segoe UI',sans-serif;
          padding:24px 28px;
          background:#fff; color:#000;
          max-width:${o*i+80}px;
          margin:0 auto ${C?"0":"30px"} auto;
          box-shadow:0 10px 30px rgba(0,0,0,0.15);
          border-radius:12px;
          page-break-after: always;
          break-after: page;
        ">
          <!-- HEADER -->
          <div style="display:flex; justify-content:space-between; align-items:flex-start; border-bottom:3px solid #f97316; padding-bottom:10px; margin-bottom:12px;">
            <div>
              <div style="font-size:1.45rem; font-weight:900; color:#f97316;">Tiếng Trung HongTai</div>
              <div style="font-size:0.78rem; color:#16a34a; font-weight:700; margin-top:2px;">Phiếu Tập Viết Bộ Thủ Tiếng Trung</div>
            </div>
            <div style="text-align:right; font-size:0.75rem; color:#6b7280;">
              <div style="font-weight:700; color:#111827;">tiengtrunghongtai.com</div>
              <div>Trang ${g+1}/${e.length} - Ngày in: ${a}</div>
            </div>
          </div>

          <!-- HÀNG TÊN / LỚP / NGÀY -->
          <div style="display:flex; gap:20px; margin-bottom:12px; font-size:0.8rem; font-weight:700; color:#16a34a;">
            <span>Tên: <span style="display:inline-block; border-bottom:1.5px solid #22c55e; min-width:150px;">&nbsp;</span></span>
            <span>Lớp: <span style="display:inline-block; border-bottom:1.5px solid #22c55e; min-width:80px;">&nbsp;</span></span>
            <span>Ngày: <span style="display:inline-block; border-bottom:1.5px solid #22c55e; min-width:110px;">&nbsp;</span></span>
          </div>

          <!-- KHUNG THÔNG TIN BỘ THỦ -->
          ${R}

          <!-- KHỐI LƯỚI LUYỆN VIẾT -->
          <div style="text-align:center;">
            ${B}
          </div>

          <!-- FOOTER -->
          <div style="margin-top:14px; border-top:1px dashed #86efac; padding-top:8px; display:flex; justify-content:space-between; font-size:0.72rem; color:#9ca3af;">
            <span>💡 Viết theo các ô mờ mẫu ➔ Tự viết vào các ô trống (mỗi ô 1 chữ, viết lần lượt theo thứ tự từ).</span>
            <span style="font-weight:800; color:#f97316;">Tiếng Trung HongTai</span>
          </div>
        </div>
      `})}t.innerHTML=V,typeof HanziWriter<"u"&&N.forEach(d=>{const s=document.getElementById(d.id);if(!s)return;let g="",x=d.wordChars.length;d.wordChars.forEach(m=>{HanziWriter.loadCharacterData(m).then(v=>{if(v&&v.strokes){const z=v.strokes.length;let k='<div style="display:inline-flex; align-items:center; gap:5px; background:#f8fafc; padding:3px 8px; border-radius:6px; border:1px solid #e2e8f0;">';k+=`<span style="font-weight:bold; color:#111827; font-size:1.05rem; margin-right:4px;">${m}:</span>`;for(let c=1;c<=z;c++){const R=v.strokes.slice(0,c);let B="";R.forEach(C=>{B+=`<path d="${C}" fill="#111827" transform="scale(0.022, -0.022) translate(0, -900)" />`}),k+=`
                <div style="display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px;">
                  <svg width="22" height="22" viewBox="0 0 24 24" style="overflow:visible;">
                    ${B}
                  </svg>
                </div>`}k+="</div>",g+=k}x--,x===0&&(s.innerHTML=g||"")}).catch(v=>{x--,x===0&&!g&&(s.innerHTML="")})})})}window.triggerRadicalPrintWorksheet=function(){if(/iPad|iPhone|iPod/.test(navigator.userAgent)||navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1){window.print();return}const t=document.getElementById("radical-print-worksheet-content-wrap");if(!t){window.print();return}const n=window.open("","_blank","width=920,height=900");if(!n){window.print();return}const a=t.innerHTML;n.document.open(),n.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Phiếu Tập Viết Bộ Thủ Tiếng Trung - Tiếng Trung HongTai</title>
      <meta charset="utf-8">
      <style>
        @page {
          size: A4 portrait;
          margin: 5mm 8mm;
        }
        * {
          box-sizing: border-box;
        }
        body {
          font-family: 'Be Vietnam Pro', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: #ffffff !important;
          color: #000000 !important;
          margin: 0;
          padding: 0;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        .print-page-area {
          width: 100% !important;
          max-width: 100% !important;
          box-shadow: none !important;
          border: none !important;
          padding: 0 !important;
          margin: 0 !important;
        }
        .print-word-card {
          page-break-inside: avoid !important;
          break-inside: avoid !important;
          margin-bottom: 20px !important;
        }
        .no-print {
          display: none !important;
        }
      </style>
    </head>
    <body>
      ${a}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            window.close();
          }, 350);
        };
      <\/script>
    </body>
    </html>
  `),n.document.close()};
