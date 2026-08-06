import"./modulepreload-polyfill-B5Qt9EMX.js";import"./particles-Dl8CQUZ9.js";let p={radicals:[],comparisons:[]};async function v(){try{let e=await fetch("/radicals_data.json");e.ok||(e=await fetch("/src/radicals_data.json")),e.ok&&(p=await e.json(),typeof m=="function"&&m())}catch(e){console.warn("Could not load radicals_data.json:",e)}}v();let f="50 bộ (1)",g=null,d=null,s=0,r=[];function w(e){if(!e)return;const n=e.trim();if(!n)return;if(d){try{d.pause(),d.currentTime=0,d.src=""}catch{}d=null}const i=parseFloat(localStorage.getItem("speech_playback_rate"))||1,a=`${window.location.origin.includes("5173")?"http://localhost:5000":window.location.origin}/api/tts?text=${encodeURIComponent(n)}&voice=baidu-female`,o=new Audio(a);o.playbackRate=i,d=o,o.play().catch(l=>{console.warn("Retrying Baidu female voice audio playback...",l),setTimeout(()=>{o.play().catch(y=>{if(console.error("Audio playback error:",y),"speechSynthesis"in window){window.speechSynthesis.cancel();const c=new SpeechSynthesisUtterance(n);c.lang="zh-CN",c.rate=i,window.speechSynthesis.speak(c)}})},200)})}window.speakText=w;window.switchRadicalPageTab=function(e){f=e,Object.entries({"50 bộ (1)":"tab-50-1","50 bộ (2)":"tab-50-2","50 bộ (3)":"tab-50-3","Còn lại":"tab-rest","So sánh":"tab-comp"}).forEach(([i,t])=>{const a=document.getElementById(t);a&&(i===e?a.classList.add("active"):a.classList.remove("active"))}),m()};function m(){const e=document.getElementById("radicals-content-area");if(e)if(f==="So sánh"){const n=p.comparisons||[];r=n.map((t,a)=>({id:`comp_${a}`,radical:`${t.rad1} / ${t.rad2}`,variant:"",pinyin:`${t.meaning1} vs ${t.meaning2}`,name:"Phân biệt",meaning:t.difference,note:t.difference,example:t.example,category:"So sánh"}));let i=`
      <div style="display: flex; flex-direction: column; gap: 16px;">
        <div style="background: rgba(37, 99, 235, 0.12); border: 1px solid rgba(37, 99, 235, 0.3); border-radius: 14px; padding: 14px 18px; color: var(--text-color); font-size: 0.93rem; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-circle-info" style="color: #3b82f6; font-size: 1.1rem;"></i>
          <span>Tổng hợp 25 cặp bộ thủ có hình dáng tương đồng và bí quyết phân biệt chi tiết:</span>
        </div>
    `;n.forEach((t,a)=>{i+=`
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
      `}),i+="</div>",e.innerHTML=i}else{const n=(p.radicals||[]).filter(t=>t.category===f);r=n;let i='<div class="grid-container">';n.forEach((t,a)=>{i+=`
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
      `}),i+="</div>",e.innerHTML=i}}window.startRadicalFlashcardMode=function(){const e=document.getElementById("radicals-grid-view"),n=document.getElementById("radicals-flashcard-view");e&&(e.style.display="none"),n&&(n.style.display="block"),window.scrollTo({top:0,behavior:"smooth"}),window.selectRadicalByIndex(0)};window.openRadicalDetailByIndex=function(e){const n=document.getElementById("radicals-grid-view"),i=document.getElementById("radicals-flashcard-view");n&&(n.style.display="none"),i&&(i.style.display="block"),window.scrollTo({top:0,behavior:"smooth"}),window.selectRadicalByIndex(e)};window.showGridView=function(){const e=document.getElementById("radicals-grid-view"),n=document.getElementById("radicals-flashcard-view");e&&(e.style.display="block"),n&&(n.style.display="none"),window.scrollTo({top:0,behavior:"smooth"})};window.selectRadicalByIndex=function(e){if(!r||r.length===0)return;e<0&&(e=r.length-1),e>=r.length&&(e=0),s=e;const n=r[s],i=document.getElementById("radicals-count-badge");i&&(i.textContent=`${r.length} ${f==="So sánh"?"cặp phân biệt":"bộ thủ"}`),u(n),$()};window.nextRadicalFlashcard=function(){r.length>0&&window.selectRadicalByIndex(s+1)};window.prevRadicalFlashcard=function(){r.length>0&&window.selectRadicalByIndex(s-1)};function u(e){const n=document.getElementById("hero-card-content");!n||!e||(n.innerHTML=`
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
  `,setTimeout(()=>{const i=document.getElementById("hero-tianzige-box");if(i&&window.HanziWriter){i.innerHTML="";const t=(e.radical||"").split("/")[0].trim();g=window.HanziWriter.create("hero-tianzige-box",t,{width:170,height:170,padding:10,showOutline:!0,strokeColor:"#dc2626",outlineColor:"#cbd5e1",showCharacter:!0}),g.animateCharacter()}},50))}function $(){const e=document.getElementById("mini-cards-grid");if(!e)return;let n="";r.forEach((i,t)=>{n+=`
      <div class="mini-rad-card ${t===s?"active":""}" onclick="window.selectRadicalByIndex(${t})" id="mini-card-${t}">
        <div style="font-family: var(--font-hanzi); font-size: 2.1rem; font-weight: 800; color: #2563eb;">
          ${i.radical}
        </div>
        <div style="font-family: var(--font-pinyin); font-size: 0.9rem; font-weight: 700; color: #0284c7; margin-top: 2px;">
          ${i.pinyin}
        </div>
        <div style="font-size: 0.78rem; font-weight: 600; margin-top: 4px; text-align: center; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%;" class="hero-text-sub">
          ${i.name}
        </div>
      </div>
    `}),e.innerHTML=n,setTimeout(()=>{const i=document.getElementById("mini-cards-grid"),t=document.getElementById(`mini-card-${s}`);if(i&&t){const a=t.offsetLeft-i.clientWidth/2+t.offsetWidth/2;i.scrollTo({left:Math.max(0,a),behavior:"smooth"})}},100)}window.animateRadicalStroke=function(){g&&g.animateCharacter()};document.addEventListener("keydown",e=>{const n=document.getElementById("radicals-flashcard-view");n&&n.style.display!=="none"&&(e.key==="ArrowLeft"?window.prevRadicalFlashcard():e.key==="ArrowRight"?window.nextRadicalFlashcard():(e.key===" "||e.key==="Spacebar")&&(e.preventDefault(),r[s]&&w(r[s].radical)))});document.addEventListener("DOMContentLoaded",()=>{m()});window.printRadicalWorksheet=function(){let e=f;(!e||e==="So sánh"||e==="Còn lại")&&(e="50 bộ (1)");const n=(p.radicals||[]).filter(o=>o.category===e);if(n.length===0){alert("Không tìm thấy dữ liệu bộ thủ để in!");return}let i=document.getElementById("printable-radical-worksheet");i||(i=document.createElement("div"),i.id="printable-radical-worksheet",document.body.appendChild(i));const t=(o="",l=!1)=>`
      <div style="width: 32px; height: 32px; border: 1px solid #64748b; position: relative; display: flex; align-items: center; justify-content: center; box-sizing: border-box; background: #fff;">
        <svg style="position: absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;" viewBox="0 0 32 36">
          <line x1="0" y1="16" x2="32" y2="16" stroke="#cbd5e1" stroke-dasharray="2,2" />
          <line x1="16" y1="0" x2="16" y2="32" stroke="#cbd5e1" stroke-dasharray="2,2" />
          <line x1="0" y1="0" x2="32" y2="32" stroke="#e2e8f0" stroke-dasharray="2,2" />
          <line x1="32" y1="0" x2="0" y2="32" stroke="#e2e8f0" stroke-dasharray="2,2" />
        </svg>
        ${o?`<span style="font-family: KaiTi, STKaiti, 'SimSun', serif; font-size: 1.4rem; font-weight: 800; color: ${l?"#cbd5e1":"#0f172a"}; z-index: 1;">${o}</span>`:""}
      </div>
    `;let a="";n.forEach((o,l)=>{const y=o.radical+(o.variant?` / ${o.variant}`:""),c=o.variant||o.radical;let h="",x="";for(let b=0;b<8;b++)h+=t(c,!0),x+=t("",!1);a+=`
      <div style="display: flex; align-items: stretch; border: 1px solid #94a3b8; border-radius: 6px; margin-bottom: 6px; page-break-inside: avoid; background: #fff;">
        <div style="width: 140px; padding: 4px 8px; border-right: 1.5px solid #64748b; display: flex; flex-direction: column; justify-content: center; background: #f8fafc;">
          <div style="font-size: 0.75rem; font-weight: 800; color: #3b82f6;">STT ${l+1}</div>
          <div style="font-family: KaiTi, STKaiti, 'SimSun', serif; font-size: 1.5rem; font-weight: 900; color: #0f172a; line-height: 1.1; margin: 1px 0;">${y}</div>
          <div style="font-size: 0.78rem; font-weight: 700; color: #334155;">${o.name||""} (${o.meaning||""})</div>
        </div>

        <div style="flex: 1; padding: 4px 8px; display: flex; flex-direction: column; gap: 3px; justify-content: center;">
          <div style="display: flex; gap: 3px; align-items: center;">
            <span style="font-size: 0.65rem; font-weight: 700; color: #64748b; width: 44px;">Mờ:</span>
            ${h}
          </div>
          <div style="display: flex; gap: 3px; align-items: center;">
            <span style="font-size: 0.65rem; font-weight: 700; color: #64748b; width: 44px;">Trống:</span>
            ${x}
          </div>
        </div>
      </div>
    `}),i.innerHTML=`
    <style>
      @media print {
        body * { visibility: hidden !important; }
        #printable-radical-worksheet, #printable-radical-worksheet * { visibility: visible !important; }
        #printable-radical-worksheet {
          position: absolute !important;
          left: 0 !important;
          top: 0 !important;
          width: 100% !important;
          padding: 8mm !important;
          box-sizing: border-box !important;
          background: #fff !important;
          color: #000 !important;
        }
        @page { size: A4 portrait; margin: 6mm; }
      }
    </style>
    <div style="padding: 10px; font-family: 'Inter', sans-serif; color: #0f172a;">
      <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 12px;">
        <h1 style="font-size: 1.25rem; font-weight: 900; margin: 0; text-transform: uppercase; color: #0f172a;">PHIẾU TẬP TÔ BỘ THỦ TIẾNG TRUNG — ${e.toUpperCase()}</h1>
        <p style="font-size: 0.78rem; color: #475569; margin: 2px 0 0 0; font-weight: 700;">TIẾNG TRUNG HỒNG THÁI — BẢNG 50 BỘ THỦ CỐ ĐỊNH (CHỮ HÁN & NGHĨA HÁN-VIỆT)</p>
      </div>

      <div>
        ${a}
      </div>
    </div>
  `,setTimeout(()=>{window.print()},200)};
