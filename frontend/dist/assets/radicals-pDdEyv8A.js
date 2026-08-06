import"./modulepreload-polyfill-B5Qt9EMX.js";import"./particles-Dl8CQUZ9.js";let I={radicals:[],comparisons:[]};async function q(){try{let e=await fetch("/radicals_data.json");e.ok||(e=await fetch("/src/radicals_data.json")),e.ok&&(I=await e.json(),typeof M=="function"&&M())}catch(e){console.warn("Could not load radicals_data.json:",e)}}q();let C="50 bộ (1)",W=null,B=null,b=0,c=[];function A(e){if(!e)return;const i=e.trim();if(!i)return;if(B){try{B.pause(),B.currentTime=0,B.src=""}catch{}B=null}const n=parseFloat(localStorage.getItem("speech_playback_rate"))||1,r=`${window.location.origin.includes("5173")?"http://localhost:5000":window.location.origin}/api/tts?text=${encodeURIComponent(i)}&voice=baidu-female`,p=new Audio(r);p.playbackRate=n,B=p,p.play().catch(d=>{console.warn("Retrying Baidu female voice audio playback...",d),setTimeout(()=>{p.play().catch(l=>{if(console.error("Audio playback error:",l),"speechSynthesis"in window){window.speechSynthesis.cancel();const f=new SpeechSynthesisUtterance(i);f.lang="zh-CN",f.rate=n,window.speechSynthesis.speak(f)}})},200)})}window.speakText=A;window.switchRadicalPageTab=function(e){C=e,Object.entries({"50 bộ (1)":"tab-50-1","50 bộ (2)":"tab-50-2","50 bộ (3)":"tab-50-3","Còn lại":"tab-rest","So sánh":"tab-comp"}).forEach(([n,t])=>{const r=document.getElementById(t);r&&(n===e?r.classList.add("active"):r.classList.remove("active"))}),M()};function M(){const e=document.getElementById("radicals-content-area");if(e)if(C==="So sánh"){const i=I.comparisons||[];c=i.map((t,r)=>({id:`comp_${r}`,radical:`${t.rad1} / ${t.rad2}`,variant:"",pinyin:`${t.meaning1} vs ${t.meaning2}`,name:"Phân biệt",meaning:t.difference,note:t.difference,example:t.example,category:"So sánh"}));let n=`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="background: rgba(37, 99, 235, 0.12); border: 1px solid rgba(37, 99, 235, 0.3); border-radius: 14px; padding: 14px 18px; color: var(--text-color); font-size: 0.93rem; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-circle-info" style="color: #3b82f6; font-size: 1.1rem;"></i>
          <span>Tổng hợp 25 cặp bộ thủ có hình dáng tương đồng và bí quyết phân biệt chi tiết:</span>
        </div>
    `;i.forEach((t,r)=>{n+=`
        <div class="rad-card" onclick="window.openRadicalDetailByIndex(${r})">
          <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px dashed rgba(255,255,255,0.15); padding-bottom: 12px; flex-wrap: wrap; gap: 10px;">
            <div style="display: flex; align-items: center; gap: 14px;">
              <span style="background: rgba(37, 99, 235, 0.2); color: #3b82f6; border: 1.5px solid #2563eb; padding: 6px 16px; border-radius: 10px; font-weight: 800; font-family: var(--font-hanzi); font-size: 1.5rem;">
                ${t.rad1} <span style="font-size: 0.95rem; font-weight: 600;">(${t.meaning1})</span>
              </span>
              <span style="font-weight: 800; color: #ef4444; font-size: 1.1rem;">VS</span>
              <span style="background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1.5px solid #10b981; padding: 6px 16px; border-radius: 10px; font-weight: 800; font-family: var(--font-hanzi); font-size: 1.5rem;">
                ${t.rad2} <span style="font-size: 0.95rem; font-weight: 600;">(${t.meaning2})</span>
              </span>
            </div>
          </div>

          <div style="font-size: 0.98rem; line-height: 1.55;">
            <strong style="color: #fbbf24;"><i class="fa-solid fa-scale-balanced" style="margin-right: 4px;"></i> Phân biệt:</strong> ${t.difference}
          </div>

          ${t.example?`
            <div style="font-size: 0.92rem; background: rgba(0,0,0,0.25); border-left: 3px solid #3b82f6; padding: 10px 14px; border-radius: 0 8px 8px 0;">
              <i class="fa-solid fa-book" style="color: #3b82f6; margin-right: 6px;"></i> <strong>Ví dụ:</strong> ${t.example}
            </div>
          `:""}
        </div>
      `}),n+="</div>",e.innerHTML=n}else{const i=(I.radicals||[]).filter(t=>t.category===C);c=i;let n='<div class="grid-container">';i.forEach((t,r)=>{n+=`
        <div class="rad-card" onclick="window.openRadicalDetailByIndex(${r})">
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div style="display: flex; align-items: baseline; gap: 8px;">
              <span style="font-family: var(--font-hanzi); font-size: 2.4rem; font-weight: 800; color: #2563eb;">
                ${t.radical}
              </span>
              ${t.variant?`<span style="font-family: var(--font-hanzi); font-size: 1.5rem; color: #0284c7; font-weight: 700;">(${t.variant})</span>`:""}
            </div>
            <span style="font-family: var(--font-pinyin); font-size: 1.15rem; font-weight: 700; color: #0284c7;">
              ${t.pinyin}
            </span>
          </div>

          <div style="font-size: 1.1rem; font-weight: 800; border-top: 1px solid rgba(148, 163, 184, 0.2); padding-top: 8px;">
            Hán-Việt: ${t.name} - <span style="color: #10b981;">${t.meaning}</span>
          </div>

          ${t.note?`
            <div style="font-size: 0.88rem; font-style: italic; line-height: 1.4; background: rgba(37, 99, 235, 0.08); padding: 8px 12px; border-radius: 8px;" class="rad-text-sub">
              <i class="fa-solid fa-circle-info" style="color: #2563eb; margin-right: 4px;"></i> ${t.note}
            </div>
          `:""}

          ${t.example?`
            <div style="font-size: 0.9rem; font-weight: 600; margin-top: 2px;" class="rad-text-primary">
              <i class="fa-solid fa-lightbulb" style="color: #fbbf24; margin-right: 4px;"></i> Ví dụ: ${t.example}
            </div>
          `:""}
        </div>
      `}),n+="</div>",e.innerHTML=n}}window.startRadicalFlashcardMode=function(){const e=document.getElementById("radicals-grid-view"),i=document.getElementById("radicals-flashcard-view");e&&(e.style.display="none"),i&&(i.style.display="block"),window.scrollTo({top:0,behavior:"smooth"}),window.selectRadicalByIndex(0)};window.openRadicalDetailByIndex=function(e){const i=document.getElementById("radicals-grid-view"),n=document.getElementById("radicals-flashcard-view");i&&(i.style.display="none"),n&&(n.style.display="block"),window.scrollTo({top:0,behavior:"smooth"}),window.selectRadicalByIndex(e)};window.showGridView=function(){const e=document.getElementById("radicals-grid-view"),i=document.getElementById("radicals-flashcard-view");e&&(e.style.display="block"),i&&(i.style.display="none"),window.scrollTo({top:0,behavior:"smooth"})};window.selectRadicalByIndex=function(e){if(!c||c.length===0)return;e<0&&(e=c.length-1),e>=c.length&&(e=0),b=e;const i=c[b],n=document.getElementById("radicals-count-badge");n&&(n.textContent=`${c.length} ${C==="So sánh"?"cặp phân biệt":"bộ thủ"}`),J(i),Q()};window.nextRadicalFlashcard=function(){c.length>0&&window.selectRadicalByIndex(b+1)};window.prevRadicalFlashcard=function(){c.length>0&&window.selectRadicalByIndex(b-1)};function J(e){const i=document.getElementById("hero-card-content");!i||!e||(i.innerHTML=`
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
  `,setTimeout(()=>{const n=document.getElementById("hero-tianzige-box");if(n&&window.HanziWriter){n.innerHTML="";const t=(e.radical||"").split("/")[0].trim();W=window.HanziWriter.create("hero-tianzige-box",t,{width:170,height:170,padding:10,showOutline:!0,strokeColor:"#dc2626",outlineColor:"#cbd5e1",showCharacter:!0}),W.animateCharacter()}},50))}function Q(){const e=document.getElementById("mini-cards-grid");if(!e)return;let i="";c.forEach((n,t)=>{i+=`
      <div class="mini-rad-card ${t===b?"active":""}" onclick="window.selectRadicalByIndex(${t})" id="mini-card-${t}">
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
    `}),e.innerHTML=i,setTimeout(()=>{const n=document.getElementById("mini-cards-grid"),t=document.getElementById(`mini-card-${b}`);if(n&&t){const r=t.offsetLeft-n.clientWidth/2+t.offsetWidth/2;n.scrollTo({left:Math.max(0,r),behavior:"smooth"})}},100)}window.animateRadicalStroke=function(){W&&W.animateCharacter()};document.addEventListener("keydown",e=>{const i=document.getElementById("radicals-flashcard-view");i&&i.style.display!=="none"&&(e.key==="ArrowLeft"?window.prevRadicalFlashcard():e.key==="ArrowRight"?window.nextRadicalFlashcard():(e.key===" "||e.key==="Spacebar")&&(e.preventDefault(),c[b]&&A(c[b].radical)))});document.addEventListener("DOMContentLoaded",()=>{M()});let E="all",F="fit_multi",_="4",O="2",U=!0,X=!0;window.printRadicalWorksheet=function(){openRadicalPrintWorksheetModal("all")};window.openRadicalPrintWorksheetModal=function(e="all"){E=e;let i=document.getElementById("print-radical-worksheet-modal");i||(i=document.createElement("div"),i.id="print-radical-worksheet-modal",i.style.cssText="display:none; position:fixed; top:0; left:0; width:100vw; height:100vh; background:rgba(11,15,25,0.92); z-index:9999999; align-items:center; justify-content:center; padding:16px; box-sizing:border-box; backdrop-filter:blur(8px);",document.body.appendChild(i));const n=document.getElementById("seasonal-particle-canvas");n&&(n.style.display="none"),i.innerHTML=`
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
            <option value="all" ${E==="all"?"selected":""}>Tất cả bộ thủ (${C})</option>
            <option value="single" ${E==="single"?"selected":""}>Chỉ bộ thủ đang chọn</option>
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
  `,i.style.display="flex",updateRadicalWorksheetPreviewConfig()};window.closeRadicalPrintWorksheetModal=function(){const e=document.getElementById("print-radical-worksheet-modal");e&&(e.style.display="none");const i=document.getElementById("seasonal-particle-canvas");i&&localStorage.getItem("particles_enabled")!=="false"&&(i.style.display="block")};window.updateRadicalWorksheetPreviewConfig=function(){const e=document.getElementById("radical-print-scope"),i=document.getElementById("radical-print-layout"),n=document.getElementById("radical-print-rows"),t=document.getElementById("radical-print-trace-rows"),r=document.getElementById("radical-print-show-pinyin"),p=document.getElementById("radical-print-show-meaning");e&&(E=e.value),i&&(F=i.value),n&&(_=n.value),t&&(O=t.value),r&&(U=r.checked),p&&(X=p.checked);let d=C;(!d||d==="So sánh"||d==="Còn lại")&&(d="50 bộ (1)");let l=(I.radicals||[]).filter(f=>f.category===d);if(l.length===0&&(l=(I.radicals||[]).slice(0,50)),E==="single"&&c[b]){const f=c[b];f&&f.radical?(l=l.filter(P=>P.radical===f.radical),l.length===0&&(l=[f])):l=l.slice(0,1)}Z(l)};function Z(e){const i=document.getElementById("radical-print-worksheet-content-wrap");if(!i)return;const n=new Date,t=`${n.getDate()}/${n.getMonth()+1}/${n.getFullYear()}`,r=13,p=48,d=parseInt(_)||4,l=O,f=U,P=X;function j(o,a=""){return`
      <div style="
        width:${o}px; height:${o}px;
        border:1px solid #16a34a;
        position:relative;
        display:flex; align-items:center; justify-content:center;
        box-sizing:border-box; background:#fff;
        margin-right:-1px; margin-bottom:-1px;
        flex-shrink:0;
      ">
        <svg style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;" viewBox="0 0 ${o} ${o}">
          <line x1="0" y1="${o/2}" x2="${o}" y2="${o/2}" stroke="#86efac" stroke-dasharray="2,2" />
          <line x1="${o/2}" y1="0" x2="${o/2}" y2="${o}" stroke="#86efac" stroke-dasharray="2,2" />
          <line x1="0" y1="0" x2="${o}" y2="${o}" stroke="#dcfce7" stroke-dasharray="2,2" />
          <line x1="${o}" y1="0" x2="0" y2="${o}" stroke="#dcfce7" stroke-dasharray="2,2" />
        </svg>
        ${a}
      </div>`}const N=[];let V="";if(F==="fit_multi"){let o=e.length,a=3;d<=2?a=5:d===3?a=4:d===4?a=3:d>=5&&(a=2);let g=Math.ceil(o/a)||1;const y=document.getElementById("modal-radical-print-total-pages");y&&(y.textContent=`${g} trang`);for(let h=0;h<g;h++){const u=e.slice(h*a,(h+1)*a);let $="";u.forEach((s,z)=>{const k=h*a+z,T=s.radical,m=s.radical+(s.variant?` / ${s.variant}`:""),H=[T];function L(x){let K="";for(let D=0;D<r;D++){let R=!1;(l==="all"||l==="1"&&x===0||l==="2"&&(x===0||x===1)||l==="3"&&(x===0||x===1||x===2))&&(R=!0);let G="";R&&(G=`<span style="
                font-size:${p*.72}px;
                font-family:'LXGW WenKai Lite','Kaiti','STKaiti','Kai','PingFang SC','Noto Serif SC',serif;
                font-weight:normal; color:#111827; opacity:0.18;
                line-height:1; position:relative; z-index:2; pointer-events:none;
              ">${T}</span>`),K+=j(p,G)}return`<div style="display:flex;">${K}</div>`}let v="";for(let x=0;x<d;x++)v+=L(x);const S=`radical-stroke-steps-modal-${k}`;N.push({id:S,wordChars:H});const Y=`
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
                ">${m}</span>
                ${f&&s.pinyin?`<span style="font-size:1.05rem; font-weight:800; color:#ea580c;">${s.pinyin}</span>`:""}
                ${P?`<span style="font-size:0.9rem; color:#374151; font-weight:700;">${s.name?`${s.name} (${s.meaning||""})`:s.meaning||""}</span>`:""}
              </div>
              <div style="font-size:0.75rem; color:#16a34a; font-weight:700; background:#f0fdf4; padding:3px 10px; border-radius:12px; border:1px solid #bbf7d0;">
                ${s.category||"50 BỘ THỦ"}
              </div>
            </div>

            <div style="margin-top:6px;">
              <div id="${S}" style="display:flex; flex-wrap:wrap; gap:12px; align-items:center;">
                <span style="font-size:0.75rem; color:#9ca3af;">Đang tải nét bút...</span>
              </div>
            </div>
          </div>`;$+=`
          <div class="print-word-card" style="margin-bottom:18px; page-break-inside:avoid; break-inside:avoid;">
            <div style="font-size:0.75rem; font-weight:800; color:#16a34a; margin-bottom:4px;">
              Bộ thủ #${k+1}: ${s.radical}
            </div>
            ${Y}
            <div style="display:inline-flex; flex-direction:column; border:2px solid #22c55e; border-radius:6px; overflow:hidden; box-sizing:border-box; width:100%;">
              ${v}
            </div>
          </div>
        `});const w=h===g-1;V+=`
        <div class="print-page-area" style="
          font-family:'Be Vietnam Pro','Segoe UI',sans-serif;
          padding:24px 28px;
          background:#fff; color:#000;
          max-width:${r*p+80}px;
          margin:0 auto ${w?"0":"30px"} auto;
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
              <div>Trang ${h+1}/${g} - Ngày in: ${t}</div>
            </div>
          </div>

          <!-- HÀNG TÊN / LỚP / NGÀY -->
          <div style="display:flex; gap:20px; margin-bottom:12px; font-size:0.8rem; font-weight:700; color:#16a34a; border-bottom:1px dashed #cbd5e1; padding-bottom:8px;">
            <span>Tên: <span style="display:inline-block; border-bottom:1.5px solid #22c55e; min-width:150px;">&nbsp;</span></span>
            <span>Lớp: <span style="display:inline-block; border-bottom:1.5px solid #22c55e; min-width:80px;">&nbsp;</span></span>
            <span>Ngày: <span style="display:inline-block; border-bottom:1.5px solid #22c55e; min-width:110px;">&nbsp;</span></span>
          </div>

          <!-- DANH SÁCH CÁC THẺ BỘ THỦ GHÉP -->
          ${$}

          <!-- FOOTER -->
          <div style="margin-top:12px; border-top:1px dashed #86efac; padding-top:6px; display:flex; justify-content:space-between; font-size:0.72rem; color:#9ca3af; page-break-inside: avoid; break-inside: avoid;">
            <span>💡 Viết theo các ô mờ mẫu ➔ Tự viết vào các ô trống (tự điều chỉnh số hàng để ghép vừa 1 trang A4).</span>
            <span style="font-weight:800; color:#f97316;">Tiếng Trung HongTai</span>
          </div>
        </div>
      `}}else{const o=document.getElementById("modal-radical-print-total-pages");o&&(o.textContent=`${e.length} trang`),e.forEach((a,g)=>{const y=a.radical,h=a.radical+(a.variant?` / ${a.variant}`:""),u=[y];function $(m){let H="";for(let L=0;L<r;L++){let v=!1;(l==="all"||l==="1"&&m===0||l==="2"&&(m===0||m===1)||l==="3"&&(m===0||m===1||m===2))&&(v=!0);let S="";v&&(S=`<span style="
              font-size:${p*.72}px;
              font-family:'LXGW WenKai Lite','Kaiti','STKaiti','Kai','PingFang SC','Noto Serif SC',serif;
              font-weight:normal; color:#111827; opacity:0.18;
              line-height:1; position:relative; z-index:2; pointer-events:none;
            ">${y}</span>`),H+=j(p,S)}return`<div style="display:flex;">${H}</div>`}let w="";for(let m=0;m<d;m++)w+=$(m);const s=`radical-stroke-steps-modal-${g}`;N.push({id:s,wordChars:u});const z=`
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
              ">${h}</span>
              ${f&&a.pinyin?`<span style="font-size:1.15rem; font-weight:800; color:#ea580c;">${a.pinyin}</span>`:""}
              ${P?`<span style="font-size:0.95rem; color:#374151; font-weight:600;">${a.name?`${a.name} (${a.meaning||""})`:a.meaning||""}</span>`:""}
            </div>
            <div style="font-size:0.75rem; color:#16a34a; font-weight:700; background:#f0fdf4; padding:4px 12px; border-radius:12px; border:1px solid #bbf7d0;">
              ${a.category||"50 BỘ THỦ"}
            </div>
          </div>

          <div style="margin-top:8px;">
            <div id="${s}" style="display:flex; flex-wrap:wrap; gap:16px; align-items:center;">
              <span style="font-size:0.8rem; color:#9ca3af;">Đang tải nét bút...</span>
            </div>
          </div>
        </div>`,k=`
        <div style="display:inline-flex; flex-direction:column; border:2px solid #22c55e; border-radius:6px; overflow:hidden; box-sizing:border-box; width:100%;">
          ${w}
        </div>`,T=g===e.length-1;V+=`
        <div class="print-page-area" style="
          font-family:'Be Vietnam Pro','Segoe UI',sans-serif;
          padding:24px 28px;
          background:#fff; color:#000;
          max-width:${r*p+80}px;
          margin:0 auto ${T?"0":"30px"} auto;
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
              <div>Trang ${g+1}/${e.length} - Ngày in: ${t}</div>
            </div>
          </div>

          <!-- HÀNG TÊN / LỚP / NGÀY -->
          <div style="display:flex; gap:20px; margin-bottom:12px; font-size:0.8rem; font-weight:700; color:#16a34a;">
            <span>Tên: <span style="display:inline-block; border-bottom:1.5px solid #22c55e; min-width:150px;">&nbsp;</span></span>
            <span>Lớp: <span style="display:inline-block; border-bottom:1.5px solid #22c55e; min-width:80px;">&nbsp;</span></span>
            <span>Ngày: <span style="display:inline-block; border-bottom:1.5px solid #22c55e; min-width:110px;">&nbsp;</span></span>
          </div>

          <!-- KHUNG THÔNG TIN BỘ THỦ -->
          ${z}

          <!-- KHỐI LƯỚI LUYỆN VIẾT -->
          <div style="text-align:center;">
            ${k}
          </div>

          <!-- FOOTER -->
          <div style="margin-top:14px; border-top:1px dashed #86efac; padding-top:8px; display:flex; justify-content:space-between; font-size:0.72rem; color:#9ca3af;">
            <span>💡 Viết theo các ô mờ mẫu ➔ Tự viết vào các ô trống (mỗi ô 1 chữ, viết lần lượt theo thứ tự từ).</span>
            <span style="font-weight:800; color:#f97316;">Tiếng Trung HongTai</span>
          </div>
        </div>
      `})}i.innerHTML=V,typeof HanziWriter<"u"&&N.forEach(o=>{const a=document.getElementById(o.id);if(!a)return;let g="",y=o.wordChars.length;o.wordChars.forEach(h=>{HanziWriter.loadCharacterData(h).then(u=>{if(u&&u.strokes){const $=u.strokes.length;let w='<div style="display:inline-flex; align-items:center; gap:5px; background:#f8fafc; padding:3px 8px; border-radius:6px; border:1px solid #e2e8f0;">';w+=`<span style="font-weight:bold; color:#111827; font-size:1.05rem; margin-right:4px;">${h}:</span>`;for(let s=1;s<=$;s++){const z=u.strokes.slice(0,s);let k="";z.forEach(T=>{k+=`<path d="${T}" fill="#111827" transform="scale(0.022, -0.022) translate(0, -900)" />`}),w+=`
                <div style="display:inline-flex; align-items:center; justify-content:center; width:24px; height:24px;">
                  <svg width="22" height="22" viewBox="0 0 24 24" style="overflow:visible;">
                    ${k}
                  </svg>
                </div>`}w+="</div>",g+=w}y--,y===0&&(a.innerHTML=g||"")}).catch(u=>{y--,y===0&&!g&&(a.innerHTML="")})})})}window.triggerRadicalPrintWorksheet=function(){if(/iPad|iPhone|iPod/.test(navigator.userAgent)||navigator.platform==="MacIntel"&&navigator.maxTouchPoints>1){window.print();return}const i=document.getElementById("radical-print-worksheet-content-wrap");if(!i){window.print();return}const n=window.open("","_blank","width=920,height=900");if(!n){window.print();return}const t=i.innerHTML;n.document.open(),n.document.write(`
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
      ${t}
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
