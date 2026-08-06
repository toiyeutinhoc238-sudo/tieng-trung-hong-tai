import"./modulepreload-polyfill-B5Qt9EMX.js";import"./particles-Dl8CQUZ9.js";let g={radicals:[],comparisons:[]};async function k(){try{let e=await fetch("/radicals_data.json");e.ok||(e=await fetch("/src/radicals_data.json")),e.ok&&(g=await e.json(),typeof y=="function"&&y())}catch(e){console.warn("Could not load radicals_data.json:",e)}}k();let f="50 bộ (1)",m=null,c=null,l=0,r=[];function w(e){if(!e)return;const i=e.trim();if(!i)return;if(c){try{c.pause(),c.currentTime=0,c.src=""}catch{}c=null}const n=parseFloat(localStorage.getItem("speech_playback_rate"))||1,a=`${window.location.origin.includes("5173")?"http://localhost:5000":window.location.origin}/api/tts?text=${encodeURIComponent(i)}&voice=baidu-female`,s=new Audio(a);s.playbackRate=n,c=s,s.play().catch(p=>{console.warn("Retrying Baidu female voice audio playback...",p),setTimeout(()=>{s.play().catch(o=>{if(console.error("Audio playback error:",o),"speechSynthesis"in window){window.speechSynthesis.cancel();const d=new SpeechSynthesisUtterance(i);d.lang="zh-CN",d.rate=n,window.speechSynthesis.speak(d)}})},200)})}window.speakText=w;window.switchRadicalPageTab=function(e){f=e,Object.entries({"50 bộ (1)":"tab-50-1","50 bộ (2)":"tab-50-2","50 bộ (3)":"tab-50-3","Còn lại":"tab-rest","So sánh":"tab-comp"}).forEach(([n,t])=>{const a=document.getElementById(t);a&&(n===e?a.classList.add("active"):a.classList.remove("active"))}),y()};function y(){const e=document.getElementById("radicals-content-area");if(e)if(f==="So sánh"){const i=g.comparisons||[];r=i.map((t,a)=>({id:`comp_${a}`,radical:`${t.rad1} / ${t.rad2}`,variant:"",pinyin:`${t.meaning1} vs ${t.meaning2}`,name:"Phân biệt",meaning:t.difference,note:t.difference,example:t.example,category:"So sánh"}));let n=`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="background: rgba(37, 99, 235, 0.12); border: 1px solid rgba(37, 99, 235, 0.3); border-radius: 14px; padding: 14px 18px; color: var(--text-color); font-size: 0.93rem; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-circle-info" style="color: #3b82f6; font-size: 1.1rem;"></i>
          <span>Tổng hợp 25 cặp bộ thủ có hình dáng tương đồng và bí quyết phân biệt chi tiết:</span>
        </div>
    `;i.forEach((t,a)=>{n+=`
        <div class="rad-card" onclick="window.openRadicalDetailByIndex(${a})">
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
      `}),n+="</div>",e.innerHTML=n}else{const i=(g.radicals||[]).filter(t=>t.category===f);r=i;let n='<div class="grid-container">';i.forEach((t,a)=>{n+=`
        <div class="rad-card" onclick="window.openRadicalDetailByIndex(${a})">
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
      `}),n+="</div>",e.innerHTML=n}}window.startRadicalFlashcardMode=function(){const e=document.getElementById("radicals-grid-view"),i=document.getElementById("radicals-flashcard-view");e&&(e.style.display="none"),i&&(i.style.display="block"),window.scrollTo({top:0,behavior:"smooth"}),window.selectRadicalByIndex(0)};window.openRadicalDetailByIndex=function(e){const i=document.getElementById("radicals-grid-view"),n=document.getElementById("radicals-flashcard-view");i&&(i.style.display="none"),n&&(n.style.display="block"),window.scrollTo({top:0,behavior:"smooth"}),window.selectRadicalByIndex(e)};window.showGridView=function(){const e=document.getElementById("radicals-grid-view"),i=document.getElementById("radicals-flashcard-view");e&&(e.style.display="block"),i&&(i.style.display="none"),window.scrollTo({top:0,behavior:"smooth"})};window.selectRadicalByIndex=function(e){if(!r||r.length===0)return;e<0&&(e=r.length-1),e>=r.length&&(e=0),l=e;const i=r[l],n=document.getElementById("radicals-count-badge");n&&(n.textContent=`${r.length} ${f==="So sánh"?"cặp phân biệt":"bộ thủ"}`),z(i),$()};window.nextRadicalFlashcard=function(){r.length>0&&window.selectRadicalByIndex(l+1)};window.prevRadicalFlashcard=function(){r.length>0&&window.selectRadicalByIndex(l-1)};function z(e){const i=document.getElementById("hero-card-content");!i||!e||(i.innerHTML=`
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
  `,setTimeout(()=>{const n=document.getElementById("hero-tianzige-box");if(n&&window.HanziWriter){n.innerHTML="";const t=(e.radical||"").split("/")[0].trim();m=window.HanziWriter.create("hero-tianzige-box",t,{width:170,height:170,padding:10,showOutline:!0,strokeColor:"#dc2626",outlineColor:"#cbd5e1",showCharacter:!0}),m.animateCharacter()}},50))}function $(){const e=document.getElementById("mini-cards-grid");if(!e)return;let i="";r.forEach((n,t)=>{i+=`
      <div class="mini-rad-card ${t===l?"active":""}" onclick="window.selectRadicalByIndex(${t})" id="mini-card-${t}">
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
    `}),e.innerHTML=i,setTimeout(()=>{const n=document.getElementById("mini-cards-grid"),t=document.getElementById(`mini-card-${l}`);if(n&&t){const a=t.offsetLeft-n.clientWidth/2+t.offsetWidth/2;n.scrollTo({left:Math.max(0,a),behavior:"smooth"})}},100)}window.animateRadicalStroke=function(){m&&m.animateCharacter()};document.addEventListener("keydown",e=>{const i=document.getElementById("radicals-flashcard-view");i&&i.style.display!=="none"&&(e.key==="ArrowLeft"?window.prevRadicalFlashcard():e.key==="ArrowRight"?window.nextRadicalFlashcard():(e.key===" "||e.key==="Spacebar")&&(e.preventDefault(),r[l]&&w(r[l].radical)))});document.addEventListener("DOMContentLoaded",()=>{y()});window.printRadicalWorksheet=function(){const e=document.getElementById("printable-radical-worksheet");e&&e.remove();let i=f;(!i||i==="So sánh"||i==="Còn lại")&&(i="50 bộ (1)");const n=(g.radicals||[]).filter(o=>o.category===i);if(n.length===0){alert("Không tìm thấy dữ liệu bộ thủ để in!");return}let t=document.getElementById("printable-radical-worksheet-modal");t||(t=document.createElement("div"),t.id="printable-radical-worksheet-modal",document.body.appendChild(t));const a=document.getElementById("seasonal-particle-canvas");a&&(a.style.display="none"),t.style.cssText="position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: rgba(15, 23, 42, 0.92); backdrop-filter: blur(10px); z-index: 9999999; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 16px; box-sizing: border-box;";const s=(o="",d=!1)=>`
      <div style="width: 32px; height: 32px; border: 1px solid #64748b; position: relative; display: flex; align-items: center; justify-content: center; box-sizing: border-box; background: #fff; flex-shrink: 0;">
        <svg style="position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;" viewBox="0 0 32 32">
          <line x1="0" y1="16" x2="32" y2="16" stroke="#cbd5e1" stroke-dasharray="2,2" />
          <line x1="16" y1="0" x2="16" y2="32" stroke="#cbd5e1" stroke-dasharray="2,2" />
          <line x1="0" y1="0" x2="32" y2="32" stroke="#e2e8f0" stroke-dasharray="2,2" />
          <line x1="32" y1="0" x2="0" y2="32" stroke="#e2e8f0" stroke-dasharray="2,2" />
        </svg>
        ${o?`<span style="font-family: KaiTi, STKaiti, 'SimSun', serif; font-size: 1.4rem; font-weight: 800; color: ${d?"#cbd5e1":"#0f172a"}; z-index: 1;">${o}</span>`:""}
      </div>
    `;let p="";n.forEach((o,d)=>{const v=o.radical+(o.variant?` / ${o.variant}`:""),u=o.variant||o.radical;let x="",h="";for(let b=0;b<15;b++)x+=s(u,!0),h+=s("",!1);p+=`
      <div style="display: flex; align-items: stretch; border: 1.5px solid #64748b; border-radius: 6px; margin-bottom: 8px; page-break-inside: avoid; background: #fff;">
        <div style="width: 135px; min-width: 135px; padding: 6px 10px; border-right: 1.5px solid #64748b; display: flex; flex-direction: column; justify-content: center; background: #f8fafc; flex-shrink: 0;">
          <div style="font-size: 0.75rem; font-weight: 800; color: #2563eb;">STT ${d+1}</div>
          <div style="font-family: KaiTi, STKaiti, 'SimSun', serif; font-size: 1.6rem; font-weight: 900; color: #0f172a; line-height: 1.1; margin: 2px 0;">${v}</div>
          <div style="font-size: 0.8rem; font-weight: 700; color: #334155;">${o.name||""} (${o.meaning||""})</div>
        </div>

        <div style="flex: 1; padding: 6px 8px; display: flex; flex-direction: column; gap: 4px; justify-content: center; overflow-x: auto;">
          <div style="display: flex; gap: 3px; align-items: center; width: 100%;">
            <span style="font-size: 0.7rem; font-weight: 800; color: #475569; width: 48px; flex-shrink: 0;">Mờ:</span>
            <div style="display: flex; gap: 3px; flex-wrap: nowrap; overflow: hidden; flex: 1;">${x}</div>
          </div>
          <div style="display: flex; gap: 3px; align-items: center; width: 100%;">
            <span style="font-size: 0.7rem; font-weight: 800; color: #475569; width: 48px; flex-shrink: 0;">Trống:</span>
            <div style="display: flex; gap: 3px; flex-wrap: nowrap; overflow: hidden; flex: 1;">${h}</div>
          </div>
        </div>
      </div>
    `}),t.innerHTML=`
    <style>
      @media print {
        body * { visibility: hidden !important; }
        #printable-radical-worksheet-content, #printable-radical-worksheet-content * { visibility: visible !important; }
        #printable-radical-worksheet-content {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          padding: 8mm !important;
          box-sizing: border-box !important;
          background: #fff !important;
          color: #0f172a !important;
          max-height: none !important;
          overflow: visible !important;
          box-shadow: none !important;
        }
        .no-print { display: none !important; }
        @page { size: A4 portrait; margin: 6mm; }
      }
    </style>
    
    <!-- Top Action Header inside Modal -->
    <div class="no-print" style="width: 100%; max-width: 880px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 12px; gap: 12px; flex-wrap: wrap;">
      <div style="color: #ffffff; font-weight: 800; font-size: 1.15rem; display: flex; align-items: center; gap: 8px;">
        <i class="fa-solid fa-file-pdf" style="color: #10b981; font-size: 1.3rem;"></i> Xem Trước Phiếu Tập Tô A4 — ${i}
      </div>
      <div style="display: flex; gap: 10px;">
        <button onclick="window.printWorksheetDocument()" style="background: linear-gradient(135deg, #10b981, #059669); color: #fff; border: none; padding: 9px 22px; border-radius: 99px; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4); font-size: 0.95rem;">
          <i class="fa-solid fa-print"></i> In Ngay / Tải PDF
        </button>
        <button onclick="window.closePrintWorksheetModal()" style="background: rgba(255, 255, 255, 0.15); color: #fff; border: 1px solid rgba(255, 255, 255, 0.3); padding: 9px 20px; border-radius: 99px; font-weight: 700; cursor: pointer; font-size: 0.95rem;">
          Đóng
        </button>
      </div>
    </div>

    <!-- Paper Sheet Container (Always White Paper Background) -->
    <div id="printable-radical-worksheet-content" style="background: #ffffff !important; color: #0f172a !important; max-width: 880px; width: 100%; border-radius: 14px; padding: 24px; box-shadow: 0 25px 60px rgba(0,0,0,0.6); max-height: 82vh; overflow-y: auto; box-sizing: border-box; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Be Vietnam Pro', sans-serif;">
      <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 16px;">
        <h1 style="font-size: 1.3rem; font-weight: 800; margin: 0; text-transform: uppercase; color: #0f172a; letter-spacing: 0.3px; line-height: 1.3;">PHIẾU TẬP TÔ BỘ THỦ TIẾNG TRUNG — ${i.toUpperCase()}</h1>
        <p style="font-size: 0.82rem; color: #475569; margin: 4px 0 0 0; font-weight: 700; letter-spacing: 0.2px;">TIẾNG TRUNG HỒNG THÁI — BẢNG 50 BỘ THỦ CỐ ĐỊNH (CHỮ HÁN & NGHĨA HÁN-VIỆT)</p>
      </div>

      <div>
        ${p}
      </div>
    </div>
  `,t.style.display="flex"};window.closePrintWorksheetModal=function(){const e=document.getElementById("printable-radical-worksheet-modal");e&&(e.style.display="none");const i=document.getElementById("seasonal-particle-canvas");i&&localStorage.getItem("particles_enabled")!=="false"&&(i.style.display="block")};window.printWorksheetDocument=function(){window.print()};
