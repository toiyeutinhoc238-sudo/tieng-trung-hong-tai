import"./global_sidebar-D5ouXx7Q.js";import{p as f}from"./vendor-pinyin-haNF1LmB.js";import"./vendor-BfYXEYrK.js";function S(){if(typeof window.isUserLoggedIn=="function")return window.isUserLoggedIn();try{const n=localStorage.getItem("user")||localStorage.getItem("hongtai_current_user")||localStorage.getItem("currentUser")||sessionStorage.getItem("user");if(!n)return!1;const i=JSON.parse(n),t=((i==null?void 0:i.email)||"").toLowerCase().trim();return!!(t&&t!=="guest"&&!t.startsWith("guest")&&t.includes("@"))}catch{return!1}}function u(n="Luyện Viết Tiếng Trung"){return S()?!0:(typeof window.showGlobalAuthModal=="function"&&window.showGlobalAuthModal({isMandatoryPageLock:!0,actionName:n,title:`Đăng Nhập Để Dùng: ${n}`,desc:`Hệ thống yêu cầu bạn đăng nhập bằng Google trước khi sử dụng <strong>${n}</strong> để đồng bộ tiến độ và lưu kết quả học tập.`}),!1)}const v=(window.location.hostname.includes("localhost")||window.location.hostname.includes("127.0.0.1"),"");let m={so:[],trung:[],cao:[]},o="so",r=null,p=new Map,d=!1,w=!1;function y(n="click"){try{const i=new(window.AudioContext||window.webkitAudioContext),t=i.createOscillator(),e=i.createGain();t.connect(e),e.connect(i.destination),n==="spin"?(t.type="triangle",t.frequency.setValueAtTime(440,i.currentTime),t.frequency.exponentialRampToValueAtTime(880,i.currentTime+.25),e.gain.setValueAtTime(.2,i.currentTime),e.gain.exponentialRampToValueAtTime(.01,i.currentTime+.25),t.start(),t.stop(i.currentTime+.25)):n==="success"&&(t.type="sine",t.frequency.setValueAtTime(523.25,i.currentTime),t.frequency.setValueAtTime(659.25,i.currentTime+.1),e.gain.setValueAtTime(.18,i.currentTime),e.gain.exponentialRampToValueAtTime(.01,i.currentTime+.35),t.start(),t.stop(i.currentTime+.35))}catch{}}async function I(){var t,e,h;try{let a=await fetch(`${v}/api/hskk-questions`);a.ok||(a=await fetch("/data/hskk_questions.json"));const c=await a.json();c&&(c.so||c.questions)&&(c.so?m=c:c.questions&&(m.so=c.questions.filter(s=>s.level==="so"),m.trung=c.questions.filter(s=>s.level==="trung"),m.cao=c.questions.filter(s=>s.level==="cao")))}catch(a){console.warn("Không tải được API HSKK, thử nạp tĩnh...",a);try{const c=await fetch("/data/hskk_questions.json");c.ok&&(m=await c.json())}catch(c){console.error("Lỗi nạp câu hỏi HSKK:",c)}}const n=(((t=m.so)==null?void 0:t.length)||0)+(((e=m.trung)==null?void 0:e.length)||0)+(((h=m.cao)==null?void 0:h.length)||0),i=document.getElementById("total-questions-stat");i&&n>0&&(i.textContent=n.toLocaleString()),spinRandomQuestion(!1),S()||u("Luyện Viết Tiếng Trung")}window.selectWritingMode=function(n){if(!u("Luyện Viết Tiếng Trung"))return;const i=document.getElementById("wf-card-qa"),t=document.getElementById("wf-card-free"),e=document.getElementById("wf-pointer-arrow"),h=document.getElementById("qa-workspace-view"),a=document.getElementById("free-workspace-view");n==="qa"?(i==null||i.classList.add("active"),t==null||t.classList.remove("active"),e&&(e.style.display="flex"),h&&(h.style.display="block"),a&&(a.style.display="none")):n==="free"&&(i==null||i.classList.remove("active"),t==null||t.classList.add("active"),e&&(e.style.display="none"),h&&(h.style.display="none"),a&&(a.style.display="block"))};window.switchHskkLevel=function(n,i){if(n!=="so"&&typeof window.isUserVip=="function"&&!window.isUserVip()&&typeof window.requireVip=="function"){const t=n==="cao"?"Cao cấp":"Trung cấp";return window.requireVip(`Luyện viết HSKK ${t}`)}u("Chọn Cấp Độ HSKK")&&(o===n&&r||(o=n,document.querySelectorAll(".level-select-row .level-btn").forEach(t=>t.classList.remove("active")),i&&i.classList.add("active"),spinRandomQuestion(!0)))};window.spinRandomQuestion=function(n=!0){if(n&&!u("Quay Ngẫu Nhiên Đề Thi"))return;const i=m[o]||[];if(!i||i.length===0)return;const t=document.getElementById("spin-question-btn");n&&t&&(t.classList.add("rolling"),y("spin"),setTimeout(()=>t.classList.remove("rolling"),500));let e=null;if(i.length===1)e=i[0];else do e=i[Math.floor(Math.random()*i.length)];while(r&&e.question===r.question&&i.length>1);r=e,B();const h=document.getElementById("ai-suggestion-box");h&&(h.style.display="none");const a=document.getElementById("hint-toggle-btn");a&&(a.innerHTML=`
      <i class="fa-solid fa-lightbulb"></i>
      <span>Gợi ý Dàn bài &amp; Từ vựng</span>
    `);const c=document.getElementById("sample-writing-box");c&&(c.style.display="none");const s=document.getElementById("sample-writing-toggle-btn");s&&(s.innerHTML=`
      <i class="fa-solid fa-medal"></i>
      <span>Bài viết mẫu tham khảo</span>
    `)};function B(){if(!r)return;const n=document.getElementById("active-question-text"),i=document.getElementById("question-meta-badge"),t=o==="so"?"HSKK Sơ cấp":o==="cao"?"HSKK Cao cấp":"HSKK Trung cấp";n&&(n.textContent=r.question),i&&(i.textContent=`Câu ${r.stt||1} • ${t}`)}window.playQuestionTts=function(){if(!r||!r.question)return;if(!("speechSynthesis"in window)){alert("Trình duyệt của bạn không hỗ trợ phát âm thanh.");return}window.speechSynthesis.cancel();const n=new SpeechSynthesisUtterance(r.question);n.lang="zh-CN",n.rate=.9,window.speechSynthesis.speak(n)};window.toggleAiSuggestions=async function(){const n=document.getElementById("ai-suggestion-box"),i=document.getElementById("hint-toggle-btn");if(!n||!r)return;if(n.style.display==="block"){n.style.display="none",i&&(i.innerHTML=`
        <i class="fa-solid fa-lightbulb"></i>
        <span>Gợi ý Dàn bài &amp; Từ vựng</span>
      `);return}n.style.display="block",i&&(i.innerHTML=`
      <i class="fa-solid fa-eye-slash"></i>
      <span>Ẩn Gợi ý</span>
    `);const e=`${o}_${r.question}`;if(p.has(e)){q(p.get(e));return}if(!w){w=!0,n.innerHTML=`
    <div style="text-align: center; padding: 24px 16px; color: #a855f7;">
      <i class="fa-solid fa-brain fa-spin" style="font-size: 2rem; margin-bottom: 12px; color: #38bdf8;"></i>
      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
        AI HongTai đang tự động xây dựng Dàn bài &amp; chọn lọc Từ vựng...
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8;">
        Đối chiếu chuẩn ngữ cảnh thi HSKK ${o==="so"?"Sơ cấp":o==="cao"?"Cao cấp":"Trung cấp"}
      </div>
    </div>
  `;try{const h=await fetch(`${v}/api/ai/hskk-suggest`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:r.question,level:o,skill:"writing"})});if(h.ok){const a=await h.json();p.set(e,a),q(a),y("success")}else throw new Error("Server error")}catch(h){console.error("Lỗi gợi ý AI:",h),n.innerHTML=`
      <div style="text-align: center; padding: 24px 16px; color: #f87171;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size: 2rem; margin-bottom: 12px; color: #ef4444;"></i>
        <div style="font-weight: 700; font-size: 1rem; color: #ffffff; margin-bottom: 6px;">
          Chưa thể tạo gợi ý dàn bài lúc này
        </div>
        <div style="font-size: 0.85rem; color: #94a3b8; margin-bottom: 16px;">
          Hệ thống AI đang phản hồi chậm hoặc bận. Vui lòng bấm thử lại để nhận gợi ý chuẩn bám sát đề bài.
        </div>
        <button onclick="window.toggleAiSuggestion && window.toggleAiSuggestion()" style="background: #a855f7; color: #ffffff; border: none; padding: 8px 20px; border-radius: 8px; font-weight: 700; cursor: pointer; display: inline-flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-rotate-right"></i> Thử lại
        </button>
      </div>
    `}finally{w=!1}}};function q(n){const i=document.getElementById("ai-suggestion-box");if(!i)return;const t=n.outline||{},e=n.vocabulary||[],h=n.sentenceStructures||[];i.innerHTML=`
    <div class="ai-hint-box-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px dashed rgba(34, 197, 94, 0.4); padding-bottom: 10px;">
      <div class="ai-hint-box-title" style="display: flex; align-items: center; gap: 8px; font-weight: 900; font-size: 1.05rem; color: var(--hint-header-color, #15803d);">
        <i class="fa-solid fa-wand-magic-sparkles" style="color: #10b981;"></i>
        <span>AI Gợi Ý Dàn Bài &amp; Từ Vựng (Chuẩn HSKK ${o==="so"?"Sơ cấp":o==="cao"?"Cao cấp":"Trung cấp"})</span>
      </div>
      <span class="ai-hint-badge" style="font-size: 0.75rem; background: var(--hint-badge-bg, #dcfce7); color: var(--hint-badge-color, #15803d); border: 1px solid var(--hint-badge-border, #86efac); padding: 3px 10px; border-radius: 6px; font-weight: 800;">
        Tự động bám sát đề
      </span>
    </div>

    <!-- 1. Dàn bài gợi ý (Tiếng Việt) -->
    <div style="margin-bottom: 18px;">
      <div class="ai-outline-title" style="font-size: 0.94rem; font-weight: 800; color: var(--outline-title-color, #b45309); margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
        <i class="fa-solid fa-list-ol" style="color: #f59e0b;"></i> <span>1. Dàn bài gợi ý (Suy nghĩ và trả lời theo từng luận điểm):</span>
      </div>
      <div class="ai-outline-box" style="background: var(--outline-box-bg, #fffbeb); border: 1px solid var(--outline-box-border, #fde68a); border-left: 4px solid #f59e0b; padding: 14px 18px; border-radius: 12px; font-size: 0.92rem; line-height: 1.7; color: var(--outline-box-color, #1e293b);">
        <div style="margin-bottom: 8px;"><strong>Mở bài:</strong> ${t.intro||"Nêu trực tiếp câu trả lời cho đề bài."}</div>
        <div style="margin-bottom: 8px;">
          <strong>Thân bài:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 20px;">
            ${(t.body||[]).map(a=>`<li style="margin-bottom: 4px;">${a}</li>`).join("")}
          </ul>
        </div>
        <div><strong>Kết bài:</strong> ${t.conclusion||"Tổng kết suy nghĩ và cảm xúc."}</div>
      </div>
    </div>

    <!-- 2. Từ vựng then chốt có thể sử dụng -->
    <div style="margin-bottom: 18px;">
      <div class="ai-vocab-section-title" style="font-size: 0.94rem; font-weight: 800; color: var(--vocab-title-color, #0284c7); margin-bottom: 10px; display: flex; align-items: center; gap: 6px;">
        <i class="fa-solid fa-key" style="color: #0284c7;"></i> <span>2. Từ vựng then chốt (Bấm để chèn nhanh vào bài):</span>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${e.map(a=>{let c=a.pinyin;if(a.hanzi)try{const s=f(a.hanzi,{toneType:"symbol"});s&&(c=s)}catch{}return`
          <div onclick="insertVocabToWriting('${a.hanzi}')" title="Bấm để chèn từ này vào bài viết" class="ai-vocab-pill"
            style="cursor: pointer; background: var(--vocab-pill-bg, #f0f9ff); border: 1.5px solid var(--vocab-pill-border, #7dd3fc); padding: 6px 14px; border-radius: 99px; transition: all 0.2s; display: inline-flex; align-items: center; gap: 4px;">
            <span class="ai-vocab-hanzi" style="font-weight: 800; color: var(--vocab-hanzi-color, #0f172a); font-family: var(--font-chinese), sans-serif; font-size: 0.95rem;">${a.hanzi}</span>
            <span class="ai-vocab-pinyin" style="font-size: 0.8rem; color: var(--vocab-pinyin-color, #0284c7); font-weight: 700; margin: 0 3px;">(${c})</span>
            <span class="ai-vocab-meaning" style="font-size: 0.82rem; color: var(--vocab-meaning-color, #334155); font-weight: 600;">: ${a.meaning}</span>
          </div>
        `}).join("")}
      </div>
    </div>

    <!-- 3. Cấu trúc câu đắt giá -->
    ${h.length>0?`
      <div class="ai-grammar-section" style="margin-bottom: 14px;">
        <div class="ai-grammar-section-title" style="font-size: 1.02rem; font-weight: 900; color: var(--grammar-title-color, #6b21a8); margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-puzzle-piece" style="color: var(--grammar-icon-color, #7c3aed); font-size: 1.1rem;"></i>
          <span>3. Cấu trúc câu đắt giá ghi điểm:</span>
        </div>
        <div class="ai-grammar-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 14px;">
          ${h.map(a=>`
            <div class="ai-grammar-card" style="background: var(--grammar-card-bg, #ffffff); border: 2px solid var(--grammar-card-border, #a855f7); border-radius: 16px; padding: 16px 18px; box-shadow: var(--grammar-card-shadow, 0 4px 16px rgba(124, 58, 237, 0.12)); display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div class="ai-grammar-pattern" style="font-weight: 900; font-size: 1.18rem; color: var(--grammar-pattern-color, #581c87); margin-bottom: 6px; line-height: 1.4; font-family: var(--font-chinese), sans-serif; letter-spacing: 0.3px;">
                  ${a.pattern}
                </div>
                <div class="ai-grammar-meaning" style="font-size: 0.92rem; color: var(--grammar-meaning-color, #0f172a); font-weight: 700; margin-bottom: 10px; line-height: 1.5;">
                  ${a.meaning}
                </div>
              </div>
              ${a.example?`
                <div class="ai-grammar-example" style="font-size: 0.94rem; color: var(--grammar-example-color, #0f172a); font-weight: 600; background: var(--grammar-example-bg, #f3e8ff); border: 1px solid var(--grammar-example-border-sub, #ddd6fe); border-left: 4.5px solid var(--grammar-example-border, #7c3aed); padding: 10px 14px; border-radius: 10px; line-height: 1.65; font-family: var(--font-chinese), sans-serif; margin-top: 6px;">
                  <strong class="example-label" style="color: var(--grammar-vd-color, #6d28d9); font-weight: 900; font-family: var(--font-body), sans-serif; margin-right: 6px;">VD:</strong>${a.example}
                </div>
              `:""}
            </div>
          `).join("")}
        </div>
      </div>
    `:""}
  `}window.toggleSampleWriting=async function(n=!1){const i=document.getElementById("sample-writing-box"),t=document.getElementById("sample-writing-toggle-btn");if(!i||!r)return;if(i.style.display==="block"&&!n){i.style.display="none",t&&(t.innerHTML=`
        <i class="fa-solid fa-medal"></i>
        <span>Bài viết mẫu tham khảo</span>
      `);return}i.style.display="block",t&&(t.innerHTML=`
      <i class="fa-solid fa-eye-slash"></i>
      <span>Ẩn Bài viết mẫu</span>
    `);const h=`${o}_${r.question}`;if(!n&&p.has(h)){const a=p.get(h);if(a&&a.sampleAnswer&&a.sampleAnswer.hanzi&&!a.isFallback){T(a);return}}n&&p.delete(h),i.innerHTML=`
    <div style="text-align: center; padding: 24px 16px; color: #10b981;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 12px; color: #10b981;"></i>
      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
        Đang tạo bài viết mẫu chuẩn HSKK ${o==="so"?"Sơ cấp":o==="cao"?"Cao cấp":"Trung cấp"}...
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8;">
        Hệ thống AI đang xây dựng bài viết mẫu chuyên sâu bám sát: "${r.question}"
      </div>
    </div>
  `;try{const a=await fetch(`${v}/api/ai/hskk-suggest`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:r.question,level:o,skill:"writing"})});if(a.ok){const c=await a.json();p.set(h,c),T(c),y("success")}else throw new Error("Server error")}catch(a){console.error("Lỗi nạp bài mẫu viết AI, chuyển sang mẫu chuẩn dự phòng:",a);const c=E();p.set(h,c),T(c)}};window.regenerateSampleWriting=function(){window.toggleSampleWriting(!0)};function T(n){const i=document.getElementById("sample-writing-box");if(!i)return;const t=n.sampleAnswer||{};let e=t.hanzi||"";e=e.replace(/[a-zA-ZàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵÀÁẢÃẠĂẰẮẲẴẶÂẦẤẨẪẬÈÉẺẼẸÊỀẾỂỄỆĐÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴ]/g,"").replace(/[\uac00-\ud7af]/g,"").trim();const h=e.replace(/\s+/g,"").length;let a=t.pinyin||"";if(e)try{const c=f(e,{toneType:"symbol"});c&&(a=c)}catch{}i.innerHTML=`
    <div class="sample-box-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px dashed rgba(16, 185, 129, 0.4); padding-bottom: 10px; flex-wrap: wrap; gap: 8px;">
      <div class="sample-box-title" style="display: flex; align-items: center; gap: 8px; font-weight: 900; font-size: 1.1rem; color: var(--sample-title-color, #059669);">
        <i class="fa-solid fa-medal" style="color: #10b981;"></i>
        <span>Bài Viết Mẫu Tham Khảo (Chuẩn HSKK ${o==="so"?"Sơ cấp":o==="cao"?"Cao cấp":"Trung cấp"})</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
        ${n.isFallback?`
          <span style="font-size: 0.76rem; background: rgba(245, 158, 11, 0.16); color: #d97706; padding: 4px 10px; border-radius: 99px; font-weight: 800; border: 1px solid rgba(245, 158, 11, 0.35);">
            <i class="fa-solid fa-cloud-arrow-down"></i> Mẫu ngoại tuyến
          </span>
        `:`
          <span style="font-size: 0.76rem; background: rgba(16, 185, 129, 0.18); color: var(--sample-badge-color, #047857); padding: 4px 10px; border-radius: 99px; font-weight: 800; border: 1px solid rgba(16, 185, 129, 0.35);">
            <i class="fa-solid fa-wand-magic-sparkles"></i> AI HongTai Master
          </span>
        `}
        <span style="font-size: 0.78rem; background: rgba(16, 185, 129, 0.18); color: var(--sample-badge-color, #047857); padding: 4px 10px; border-radius: 99px; font-weight: 800; border: 1px solid rgba(16, 185, 129, 0.35);">
          ${h} chữ Hán
        </span>
        <button onclick="regenerateSampleWriting()" title="Yêu cầu AI tạo lại bài mẫu mới bám sát đề thi" style="background: rgba(168, 85, 247, 0.15); border: 1px solid #a855f7; color: #a855f7; font-size: 0.82rem; font-weight: 700; padding: 5px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-rotate-right"></i> <span>Làm mới (AI)</span>
        </button>
        <button onclick="playWritingSampleTts()" style="background: rgba(56, 189, 248, 0.15); border: 1px solid #0284c7; color: var(--btn-tts-color, #0284c7); font-size: 0.82rem; font-weight: 700; padding: 5px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-volume-high"></i> <span>Nghe đọc mẫu</span>
        </button>
        <button onclick="copySampleText()" style="background: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; color: var(--btn-copy-color, #059669); font-size: 0.82rem; font-weight: 700; padding: 5px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-copy"></i> <span>Sao chép mẫu</span>
        </button>
      </div>
    </div>

    <!-- Hanzi Text -->
    <div id="sample-writing-hanzi" class="sample-hanzi-card" style="font-size: 1.12rem; line-height: 1.85; color: var(--sample-hanzi-color, #0f172a); white-space: pre-line; margin-bottom: 14px; font-family: var(--font-chinese), sans-serif; background: var(--sample-hanzi-bg, #ffffff); padding: 16px 20px; border-radius: 12px; border: 1.5px solid var(--sample-hanzi-border, #a7f3d0); border-left: 4px solid #10b981; box-shadow: 0 2px 8px rgba(16, 185, 129, 0.08);">
      ${e}
    </div>

    <!-- Pinyin Text -->
    ${a?`
      <div style="margin-bottom: 12px;">
        <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--sample-pinyin-title, #0284c7); font-weight: 800; margin-bottom: 4px;">Phiên âm Pinyin:</div>
        <div class="sample-pinyin-card" style="font-size: 0.92rem; color: var(--sample-pinyin-color, #0369a1); font-style: italic; line-height: 1.65; white-space: pre-line; background: var(--sample-pinyin-bg, #f0f9ff); border: 1px solid var(--sample-pinyin-border, #bae6fd); padding: 12px 16px; border-radius: 10px;">${a}</div>
      </div>
    `:""}

    <!-- Vietnamese Translation -->
    ${t.meaningVi?`
      <div>
        <div style="font-size: 0.78rem; text-transform: uppercase; color: var(--sample-meaning-title, #b45309); font-weight: 800; margin-bottom: 4px;">Dịch nghĩa tiếng Việt:</div>
        <div class="sample-meaning-card" style="font-size: 0.94rem; color: var(--sample-meaning-color, #1e293b); line-height: 1.7; white-space: pre-line; background: var(--sample-meaning-bg, #fffbeb); border: 1px solid var(--sample-meaning-border, #fde68a); padding: 12px 16px; border-radius: 10px;">${t.meaningVi}</div>
      </div>
    `:""}
  `}function E(){const n=r&&r.question?r.question:"đề bài",i=o||"trung",t=/诚|信|欺诈|撒谎|真实|守约|道德/.test(n),e=/运动|锻炼|走路|健康|跑步|健身|身体/.test(n),h=/科技|互联网|手机|人工智能|网络|电脑|数字|微信|距离/.test(n),a=/成败|成功|失败|母|细节|努力|挫折|坚持|目标|知足/.test(n),c=/金钱|幸福|财富|富裕|快乐|心态|钱/.test(n),s=/快节奏|压力|生活|节奏|工作|平衡|忙碌|加班/.test(n);if(t){if(i==="so")return{isFallback:!0,outline:{intro:`Mở bài: Nêu quan điểm trực diện: "${n}". (Làm người thành thật giữ lời hứa là điều rất quan trọng trong cuộc sống.)`,body:["Luận điểm 1: Khi làm người thật thà thì bạn bè và mọi người mới tin tưởng. (Tại sao bạn bè cần tin nhau?)","Luận điểm 2: Làm sai thì phải dũng cảm thừa nhận, không nói dối. (Làm sai thì nên làm thế nào?)","Luận điểm 3: Bố mẹ và thầy cô luôn dạy chúng ta phải giữ lời hứa. (Bố mẹ dạy bạn điều gì?)"],conclusion:"Kết bài: Khuyên mọi người cùng nói thật và giữ chữ tín để cuộc sống vui vẻ, hạnh phúc."},vocabulary:[{hanzi:"诚实",pinyin:"chéngshí",meaning:"thành thật, trung thực"},{hanzi:"相信",pinyin:"xiāngxìn",meaning:"tin tưởng"},{hanzi:"答应",pinyin:"dāying",meaning:"đồng ý, hứa hẹn"},{hanzi:"朋友",pinyin:"péngyou",meaning:"bạn bè"},{hanzi:"重要",pinyin:"zhòngyào",meaning:"quan trọng"}],sentenceStructures:[{pattern:"我觉得……非常重要",meaning:"Tôi thấy... vô cùng quan trọng",example:"我觉得做一个诚实守信的人非常重要。"},{pattern:"只要……就一定能……",meaning:"Chỉ cần... thì nhất định có thể...",example:"只要常常说真话，就一定能得到大家的信任。"}],sampleAnswer:{hanzi:`关于“${n}”这个问题，我觉得做一个诚实守信的人非常重要。

在平时生活和学习中，如果一个人经常说真话、说到做到，大家就会很喜欢他，也愿意和他做朋友。相反，如果一个人常常撒谎骗人，别人就不会再相信他了。

首先，我们在学校里要诚实。做作业不能抄别人的，考试更不能作弊。遇到不会的问题，要主动请教老师和同学。其次，在家里做错了事情，要勇敢承认错误，不能对父母撒谎。

最后，答应别人的事情就一定要努力做到。只要我们每个人都讲信用、说真话，我们的生活就会更加美好，身边也会有更多知心的好朋友。`,meaningVi:`Về câu hỏi "${n}", tôi thấy làm một người thành thật và giữ chữ tín là điều vô cùng quan trọng.

Trong cuộc sống và học tập thường ngày, nếu một người thường xuyên nói thật, nói được làm được, mọi người sẽ rất quý mến và sẵn lòng kết bạn. Ngược lại, nếu một người hay nói dối lừa gạt, người khác sẽ không bao giờ tin tưởng nữa.

Trước hết, ở trường học chúng ta phải trung thực. Làm bài tập không được chép của người khác, khi đi thi càng không được gian lận. Gặp câu hỏi chưa hiểu thì chủ động hỏi thầy cô và bạn bè. Thứ hai, ở nhà nếu làm sai việc gì thì phải dũng cảm nhận lỗi, không được nói dối cha mẹ.

Cuối cùng, việc gì đã hứa với người khác thì nhất định phải nỗ lực thực hiện. Chỉ cần mỗi người chúng ta đều giữ chữ tín, nói lời thật lòng, cuộc sống sẽ ngày càng tươi đẹp và chúng ta sẽ có thêm nhiều bạn tốt tri kỷ.`}};if(i==="cao")return{isFallback:!0,outline:{intro:`Mở bài: Đặt vấn đề sâu sắc về chữ tín trong xã hội hiện đại: "${n}". Khẳng định chữ tín là sinh mệnh của một nền văn minh thịnh vượng.`,body:["Luận điểm 1: Từ góc độ văn hóa giáo dục: Nuôi dưỡng tinh thần liêm chính và sự tự giác đạo đức từ gia đình đến nhà trường.","Luận điểm 2: Từ góc độ kinh tế thị trường: Thượng tôn tinh thần khế ước, xây dựng hệ thống tín dụng doanh nghiệp công khai minh bạch.","Luận điểm 3: Từ góc độ pháp quyền thể chế: Xây dựng chế tài pháp luật nghiêm khắc trừng phạt hành vi bội tín gian lận, nâng cao cái giá phải trả cho sự thất tín."],conclusion:"Kết bài: Nâng tầm vấn đề, khẳng định chỉ khi kết hợp đạo đức với pháp trị, chữ tín mới thực sự trở thành chuẩn mực sống của toàn xã hội."},vocabulary:[{hanzi:"契约精神",pinyin:"qìyuē jīngshén",meaning:"tinh thần khế ước, tôn trọng hợp đồng"},{hanzi:"以身作则",pinyin:"yǐshēn zuòzé",meaning:"lấy mình làm gương"},{hanzi:"惩恶扬善",pinyin:"chéng'è yángshàn",meaning:"trừng phạt cái ác, biểu dương cái thiện"},{hanzi:"潜移默化",pinyin:"qián yí mò huà",meaning:"ảnh hưởng sâu sắc một cách vô hình, ngấm dần"},{hanzi:"标本兼治",pinyin:"biāo běn jiān zhì",meaning:"trị cả phần ngọn lẫn gốc rễ"}],sentenceStructures:[{pattern:"不仅关乎……，更折射出……",meaning:"Không chỉ liên quan đến..., mà càng phản ánh...",example:"诚信建设不仅关乎公民道德素养，更折射出整个社会的文明进程。"},{pattern:"唯有坚持……，方能……",meaning:"Chỉ khi kiên trì..., mới có thể...",example:"唯有坚持德法兼治，方能在全社会树立起坚不可摧的诚信基石。"}],sampleAnswer:{hanzi:`古人云：“人无信不立，业无信不兴，国无信则衰。”针对“${n}”这一具有深刻现实意义的时代命题，我认为在全社会涵养诚实守信的良好风气，绝非一日之功，必须坚持德法兼治、标本兼治，从道德自律、市场示范与法律制度三个维度协同发力。

首先，立德树人是培育诚信土壤的根本之策。家庭与各级学校应当将诚信教育贯穿于人才培养的全过程，注重以身作则、言传身教，引导青少年将诚实守信内化于心、外化于行。唯有在潜移默化中树立知荣明耻的价值观念，才能从源头上筑牢抗拒虚伪与侥幸的心理防线。

其次，弘扬契约精神是维系现代市场经济秩序的关键支柱。各级商业机构与社会公众人物应当以高标准严格约束自身行为，做到以诚立企、以信筑基，坚决杜绝商业欺诈与虚假宣传。一个恪守信用的商业环境，不仅能显著降低交易成本，更能激发出强大的市场活力与社会互信。

再者，健全严谨的法治体系与全方位的失信惩戒机制是不可或缺的刚性保障。有关部门应当加速完善覆盖全社会的信用信息网络，大幅提高失信违约的违法成本，真正形成“守信者处处通畅，失信者寸步难行”的强大震慑效应。

总而言之，诚信风气的形成离不开每个社会成员的躬行实践。只要我们每个人都能笃行不怠、守信践诺，必将汇聚成推动社会文明奔涌向前的磅礴力量。`,meaningVi:`Người xưa có câu: "Người không có chữ tín thì khó lập thân, doanh nghiệp không có chữ tín thì không hưng thịnh, quốc gia không có chữ tín tất suy tàn." Đối với câu hỏi giàu ý nghĩa thực tiễn "${n}", tôi cho rằng để bồi dưỡng phong khí trung thực giữ chữ tín trong toàn xã hội tuyệt đối không thể là chuyện một sớm một chiều, mà cần kết hợp hài hòa giữa đạo đức và pháp trị, trị cả gốc lẫn ngọn trên ba bình diện: tự giác đạo đức, mẫu mực thị trường và thể chế pháp luật.

Trước hết, bồi dưỡng nhân cách là phương sách gốc rễ để ươm mầm chữ tín. Gia đình và các cấp nhà trường cần lồng ghép giáo dục tính trung thực vào toàn bộ quá trình nuôi dưỡng nhân tài, chú trọng lấy mình làm gương, dạy bảo bằng cả lời nói lẫn hành động để thế hệ trẻ thấu hiểu và thực hành. Chỉ khi tư tưởng đúng đắn được ngấm sâu một cách tự nhiên, ta mới xây dựng được bức tường thành tâm lý vững chắc ngăn chặn thói giả dối.

Thứ hai, phát huy tinh thần khế ước là trụ cột then chốt bảo đảm trật tự kinh tế thị trường hiện đại. Các doanh nghiệp và người có uy tín trong xã hội cần tự giác chuẩn mực, lấy chân thành lập nghiệp, lấy chữ tín làm gốc, kiên quyết bài trừ gian lận thương mại và quảng cáo sai sự thật. Một môi trường kinh doanh trọng chữ tín sẽ giảm thiểu đáng kể chi phí giao dịch và nâng cao niềm tin trong xã hội.

Thêm vào đó, việc hoàn thiện khuôn khổ pháp chế nghiêm minh và cơ chế chế tài xử phạt người thất tín là bảo đảm không thể thiếu. Các cơ quan quản lý cần đẩy mạnh mạng lưới thông tin tín dụng xã hội, nâng cao cái giá phải trả của việc vi phạm, thực sự tạo lập hiệu ứng răn đe mạnh mẽ: "Người giữ chữ tín đi đâu cũng thuận lợi, kẻ thất tín một bước khó đi".

Tóm lại, phong khí chữ tín phụ thuộc vào sự dấn thân hành động của mỗi người. Chỉ cần mỗi cá nhân bền bỉ giữ trọn lời hứa, nhất định sẽ hội tụ thành sức mạnh to lớn đưa nền văn minh xã hội tiến bước mạnh mẽ.`}}}return e?{isFallback:!0,outline:{intro:`Mở bài: Khẳng định lợi ích to lớn của việc rèn luyện sức khỏe hằng ngày đối với câu hỏi: "${n}".`,body:["Luận điểm 1: Cải thiện thể chất, tăng cường sức đề kháng và giảm nguy cơ mắc các bệnh tim mạch.","Luận điểm 2: Giải tỏa căng thẳng áp lực tinh thần sau giờ học tập và làm việc bận rộn.","Luận điểm 3: Xây dựng thói quen kiên trì và lối sống khoa học, lành mạnh."],conclusion:"Kết bài: Kêu gọi mọi người bớt thời gian ngồi một chỗ, dành ra ít nhất 30 phút mỗi ngày để vận động vì một tương lai khỏe mạnh."},vocabulary:[{hanzi:"锻炼身体",pinyin:"duànliàn shēntǐ",meaning:"rèn luyện thân thể"},{hanzi:"增强体质",pinyin:"zēngqiáng tǐzhì",meaning:"tăng cường thể chất"},{hanzi:"缓解压力",pinyin:"huǎnjiě yālì",meaning:"giải tỏa áp lực"},{hanzi:"持之以恒",pinyin:"chí zhī yǐ héng",meaning:"kiên trì bền bỉ"},{hanzi:"健康生活",pinyin:"jiànkāng shēnghuó",meaning:"cuộc sống lành mạnh"}],sentenceStructures:[{pattern:"不仅能……，更能……",meaning:"Không chỉ có thể..., mà càng có thể...",example:"每天坚持走路，不仅能强健体魄，更能让人心情愉悦。"},{pattern:"俗话说：……",meaning:"Tục ngữ có câu:...",example:"俗话说：“生命在于运动”，健康是一切成功的基石。"}],sampleAnswer:{hanzi:`俗话说：“身体是革命的本钱。”针对“${n}”这个问题，我认为在快节奏的现代生活中，坚持运动与锻炼身体具有极其重要的价值。

首先，坚持锻炼能够显著增强体质。无论是晨跑、散步还是去健身房，规律的体育活动能够促进血液循环，提高免疫力，有效预防肥胖和颈椎病等现代文明病。拥有充沛的体魄，我们才能以饱满的精力投入到繁重的工作与学习当中。

其次，运动是缓解心理压力、调节情绪的最佳良药。在结束了一整天高强度的脑力劳动后，到户外走一走，呼吸新鲜空气，能够让紧绷的大脑得到充分放松，有助于提高睡眠质量，保持乐观开朗的心态。

最后，锻炼身体贵在持之以恒。很多人半途而废，主要是缺乏自律和清晰的目标。我们可以从每天快走半小时或慢跑两公里开始，循序渐进地养成习惯。

总而言之，健康是一切幸福的源泉。让我们放下手机、走出室内，积极参与到体育锻炼中来，享受健康带来的快乐生活。`,meaningVi:`Tục ngữ có câu: "Sức khỏe là vốn quý của cách mạng." Đối với câu hỏi "${n}", tôi cho rằng trong nhịp sống hiện đại hối hả, kiên trì vận động và rèn luyện thân thể có giá trị vô cùng quan trọng.

Trước hết, kiên trì tập luyện có thể tăng cường thể chất rõ rệt. Cho dù là chạy bộ buổi sáng, đi dạo hay đến phòng gym, các hoạt động thể thao đều đặn có thể thúc đẩy tuần hoàn máu, tăng cường miễn dịch, phòng ngừa béo phì và thoái hóa đốt sống cổ cùng nhiều căn bệnh thời hiện đại. Có được thể lực dồi dào, chúng ta mới có thể cống hiến hết mình cho công việc và học tập.

Thứ hai, vận động là liều thuốc hữu hiệu nhất để giải tỏa áp lực tâm lý và điều hòa cảm xúc. Sau một ngày dài làm việc trí óc căng thẳng, ra ngoài trời đi dạo vài vòng hít thở bầu không khí trong lành có thể giúp não bộ được thả lỏng hoàn toàn, nâng cao chất lượng giấc ngủ và duy trì tinh thần lạc quan yêu đời.

Cuối cùng, rèn luyện thân thể điều quý nhất là ở sự kiên trì bền bỉ. Rất nhiều người bỏ dở giữa chừng vì thiếu tính tự giác và mục tiêu cụ thể. Chúng ta có thể bắt đầu từ việc đi bộ nhanh nửa tiếng hoặc chạy chậm 2 km mỗi ngày, từng bước rèn luyện thành thói quen lâu dài.

Tóm lại, sức khỏe là cội nguồn của mọi hạnh phúc. Chúng ta hãy tạm buông điện thoại, bước ra khỏi phòng, tích cực hòa mình vào các hoạt động thể thao để tận hưởng niềm vui trọn vẹn mà một cơ thể khỏe mạnh mang lại.`}}:a?{isFallback:!0,outline:{intro:`Mở bài: Nêu quan điểm trực diện về quy luật thành công và thất bại: "${n}". Khẳng định thành công là sự kết tinh của bài học kinh nghiệm và ý chí kiên định.`,body:["Luận điểm 1: Thất bại là tấm gương soi chiếu những lỗ hổng, giúp tích lũy kinh nghiệm quý báu và rèn luyện nghị lực (dẫn chứng: Thomas Edison, Steve Jobs).","Luận điểm 2: Thành công ban đầu giúp thắp sáng sự tự tin và kiến tạo đòn bẩy tâm lý tích cực, tạo đà bứt phá cho những mục tiêu lớn hơn.","Luận điểm 3: Coi trọng chi tiết và sự kiên trì bền bỉ: 'Chi tiết quyết định thành bại', chỉ khi làm tốt từng khâu nhỏ mới dựng nên nghiệp lớn."],conclusion:"Kết bài: Đúc kết rằng không nên sợ thất bại cũng đừng ngủ quên trên chiến thắng; giữ tâm thế khiêm tốn học hỏi để bước tới thành công bền vững."},vocabulary:[{hanzi:"失败乃成功之母",pinyin:"shībài nǎi chénggōng zhī mǔ",meaning:"thất bại là mẹ thành công"},{hanzi:"挫折",pinyin:"cuòzhé",meaning:"trắc trở, nghịch cảnh"},{hanzi:"细节决定成败",pinyin:"xìjié juédìng chéngbài",meaning:"chi tiết quyết định thành bại"},{hanzi:"持之以恒",pinyin:"chí zhī yǐ héng",meaning:"kiên trì bền bỉ"},{hanzi:"厚积薄发",pinyin:"hòu jī bó fā",meaning:"tích lũy sâu dày rồi mới bộc phát rực rỡ"}],sentenceStructures:[{pattern:"……不仅是检验……的试金石，更是……",meaning:"... không chỉ là viên đá thử vàng kiểm nghiệm..., mà càng là...",example:"挫折不仅是检验意志的试金石，更是走向成熟的阶梯。"},{pattern:"正所谓“……”，只有……才能……",meaning:"Đúng như câu nói '...', chỉ khi... mới có thể...",example:"正所谓“细节决定成败”，只有把每一个细节做到极致，才能赢得最终的胜利。"}],sampleAnswer:{hanzi:`古人常讲：“不经一番寒彻骨，怎得梅花扑鼻香。”关于“${n}”这一耐人寻味的命题，我认为人生的成就绝非一蹴而就，而是在面对挫折与把握机遇的交替中不断淬炼出来的。

首先，失败是磨砺心智、累积经验的宝贵财富。正如爱迪生为了研制灯泡曾经历上千次尝试与挫败，每一次失利并没有击垮他，反而帮他排除了无数错误路线，最终迎来光明的突破。如果一个人害怕犯错而裹足不前，他就永远无法探索未知的可能性。

其次，初期的成功能够迅速激发内心强大的自信心与行动力。在团队与个人成长中，阶段性的小胜能够给人们带来成就感，形成积极向上的正向反馈。只要我们在取得成绩时不骄不躁，把成功当作新的起点，这种自信就会化作源源不断的创新动能。

再者，俗话说“细节决定成败”。无论目标多么宏大，最终都要落实到每一个具体的步骤与环节之中。古今中外无数案例证明，往往是某一个被忽视的细微疏漏导致全盘崩溃，而那些精益求精、把寻常事情做到极致的人，往往能在激烈的竞争中脱颖而出。

总的来说，失败让我们清醒，成功让我们笃定。只要我们胸怀远大目标，脚踏实地注重每一个细节，持之以恒、厚积薄发，就一定能在人生的赛道上行稳致远。`,meaningVi:`Người xưa thường nói: "Không qua một phen lạnh thấu xương, sao có hoa mai ngát hương thơm." Đối với vấn đề đầy ý nghĩa "${n}", tôi cho rằng thành tựu trong đời người không bao giờ đến sau một đêm, mà được tôi luyện qua sự đan xen giữa đối diện nghịch cảnh và nắm bắt thời cơ.

Trước hết, thất bại là tài sản vô giá tôi luyện tâm trí và tích lũy vốn sống. Như Thomas Edison từng trải qua hàng ngàn lần thử nghiệm bất thành khi chế tạo bóng đèn, mỗi lần thất bại không quật ngã ông mà ngược lại giúp ông loại bỏ những con đường sai lầm để chạm tay vào bước đột phá. Nếu một người vì sợ sai mà chùn bước, họ sẽ vĩnh viễn không thể khai phá những giới hạn mới.

Thứ hai, những thành công bước đầu có thể nhanh chóng thắp lên niềm tin và sự tự tin mạnh mẽ. Trong sự trưởng thành của cá nhân hay tập thể, những thắng lợi giai đoạn mang lại cảm giác thành tựu và tạo ra động lực tâm lý tích cực. Chỉ cần chúng ta không tự mãn, xem thành công là điểm khởi đầu mới, sự tự tin ấy sẽ biến thành đòn bẩy mạnh mẽ.

Thêm vào đó, tục ngữ có câu "Chi tiết quyết định thành bại". Cho dù mục tiêu to lớn đến đâu, cuối cùng đều phải được hiện thực hóa qua từng khâu từng việc cụ thể. Những ai biết tỉ mỉ cầu toàn, biến những điều bình dị thành xuất sắc nhất định sẽ vững vàng dẫn đầu.

Tóm lại, thất bại giúp ta tỉnh táo, thành công giúp ta thêm vững tâm. Chỉ cần chúng ta nuôi dưỡng hoài bão, chú trọng từng chi tiết và kiên trì không ngừng, nhất định sẽ đi được những bước đi dài và vững chắc trên đường đời.`}}:h?{isFallback:!0,outline:{intro:`Mở bài: Đặt vấn đề trực diện về sự tác động hai mặt của công nghệ hiện đại đối với câu hỏi: "${n}".`,body:["Luận điểm 1: Công nghệ xóa nhòa rào cản địa lý (video call, mạng xã hội giúp người thân ở xa gặp nhau hàng ngày, hợp tác toàn cầu).","Luận điểm 2: Mặt trái: Hiện tượng 'cúi đầu xem điện thoại' (低头族), giao tiếp ảo làm loãng tình cảm thực tế, ngồi cạnh nhau nhưng thiếu kết nối chân thành.","Luận điểm 3: Giải pháp: Làm chủ công nghệ, thiết lập ranh giới 'đồng hành chất lượng cao' (高质量陪伴), dành thời gian thực cho gia đình bạn bè."],conclusion:"Kết bài: Khẳng định công nghệ chỉ là công cụ, gần hay xa phụ thuộc vào trái tim và sự lựa chọn của mỗi con người."},vocabulary:[{hanzi:"拉近距离",pinyin:"lā jìn jùlí",meaning:"kéo gần khoảng cách"},{hanzi:"疏远",pinyin:"shūyuǎn",meaning:"xa cách, lạnh nhạt"},{hanzi:"低头族",pinyin:"dītóuzú",meaning:"hội người cúi đầu cắm mặt vào điện thoại"},{hanzi:"高质量陪伴",pinyin:"gāo zhìliàng péibàn",meaning:"sự đồng hành chất lượng cao, thực chất"},{hanzi:"双刃剑",pinyin:"shuāng rèn jiàn",meaning:"con dao hai lưỡi"}],sentenceStructures:[{pattern:"科技宛如一把双刃剑，既……又……",meaning:"Công nghệ như con dao hai lưỡi, vừa... lại vừa...",example:"现代科技宛如一把双刃剑，既拉近了地理上的距离，又可能疏远心灵的沟通。"},{pattern:"关键在于我们如何……，而不是……",meaning:"Điều then chốt nằm ở việc chúng ta làm thế nào..., chứ không phải...",example:"关键在于我们如何支配手机，而不是让手机支配我们的生活。"}],sampleAnswer:{hanzi:`在这个日新月异的信息时代，针对“${n}”这个引人深思的话题，我认为现代科技宛如一把双刃剑，它拉近了地理上的距离，却也在无形中给人们的心灵筑起了隔阂。

从积极的层面来看，互联网与智能通信技术彻底打破了时空的限制。以往“家书抵万金”，而如今远在千里之外的亲朋好友，只需轻点屏幕就能通过高清视频面对面交谈。跨国合作、线上办公也因为科技的赋能变得触手可及，极大地促进了人与人之间的协作效率与情感联结。

然而，从消极的一面来看，“低头族”现象在现代社会随处可见。无论是在家庭聚餐还是朋友聚会中，很多人习惯性地沉迷于虚拟世界，在社交软件上热火朝天，却对身边的亲友冷漠以对。这种浅层化的虚拟社交不仅剥夺了深度沟通的温度，甚至让不少年轻人产生了社交焦虑与现实疏离感。

因此，问题的根源并不在于科技本身，而在于我们使用科技的态度。我们应当倡导“高质量陪伴”的理念，学会给手机设置边界，在与家人朋友相处时放下电子设备，用真诚的眼神与倾听去感受彼此的温度。

总而言之，科技应当是温暖人心的桥梁，而不应成为阻隔温情的冰冷高墙。唯有理性自律地驾驭科技，我们才能在享受数字化便利的同时，守住最真挚的人间温情。`,meaningVi:`Trong kỷ nguyên thông tin biến đổi từng ngày, đối với chủ đề sâu sắc "${n}", tôi cho rằng công nghệ hiện đại tựa như một con dao hai lưỡi: nó kéo gần khoảng cách địa lý, nhưng cũng vô tình dựng lên những bức tường ngăn cách giữa tâm hồn con người.

Xét từ mặt tích cực, internet và thiết bị thông minh đã phá vỡ rào cản không gian và thời gian. Xưa kia 'thư nhà đáng giá ngàn vàng', ngày nay người thân bạn bè ở xa muôn trùng chỉ cần một nút chạm là có thể trò chuyện video trực diện. Hợp tác xuyên quốc gia và làm việc trực tuyến trở nên dễ dàng, thúc đẩy mạnh mẽ hiệu quả gắn kết công việc và tình cảm.

Tuy nhiên ở chiều ngược lại, hiện tượng 'cúi đầu lướt điện thoại' xuất hiện ở khắp mọi nơi. Dù là trong bữa cơm gia đình hay buổi tụ tập bạn bè, nhiều người mải mê với thế giới ảo, sôi nổi trên mạng nhưng lại thờ ơ lãnh đạm với người bên cạnh. Sự giao tiếp ảo hời hợt này tước đi hơi ấm của tương tác sâu sắc, khiến không ít người trẻ cảm thấy cô đơn giữa đám đông.

Bởi vậy, mấu chốt không nằm ở công nghệ, mà nằm ở thái độ làm chủ công nghệ của chúng ta. Chúng ta cần hướng tới sự 'đồng hành chất lượng cao', biết đặt ra ranh giới cho điện thoại, khi ở bên người thân hãy tạm gác màn hình để trao nhau ánh mắt lắng nghe chân thành.

Tóm lại, công nghệ nên là cây cầu nối liền những trái tim, chứ không phải bức tường lạnh lẽo ngăn cách yêu thương. Chỉ khi tự giác và làm chủ công nghệ, chúng ta mới vừa tận hưởng sự tiện lợi số hóa vừa giữ trọn vẹn sự ấm áp của tình người.`}}:c?{isFallback:!0,outline:{intro:`Mở bài: Đặt vấn đề biện chứng về mối quan hệ giữa tiền bạc và hạnh phúc: "${n}". Khẳng định tiền là điều kiện vật chất cần thiết nhưng không phải ngọn nguồn duy nhất của hạnh phúc đích thực.`,body:["Luận điểm 1: Tiền bạc đem lại nền tảng an toàn vật chất (cơm ăn áo mặc, y tế, giáo dục, giảm bớt nỗi lo cơm áo gạo tiền).","Luận điểm 2: Giới hạn của tiền tài: Tiền không mua được tình thân chân thành, sức khỏe thể chất và sự bình an, thanh thản trong tâm hồn.","Luận điểm 3: Hạnh phúc đích thực đến từ sự biết đủ (知足常乐), phong phú về thế giới tinh thần và giá trị cống hiến cho xã hội."],conclusion:"Kết bài: Đúc kết phương châm sống: Kiếm tiền bằng sự nỗ lực chân chính nhưng không biến mình thành nô lệ của đồng tiền; trân trọng giá trị tinh thần."},vocabulary:[{hanzi:"金钱",pinyin:"jīnqián",meaning:"tiền bạc"},{hanzi:"真正的幸福",pinyin:"zhēnzhèng de xìngfú",meaning:"hạnh phúc đích thực"},{hanzi:"物质保障",pinyin:"wùzhì bǎozhàng",meaning:"đảm bảo về mặt vật chất"},{hanzi:"知足常乐",pinyin:"zhī zú cháng lè",meaning:"biết đủ là vui, hài lòng với thực tại"},{hanzi:"精神世界",pinyin:"jīngshén shìjiè",meaning:"thế giới tinh thần"}],sentenceStructures:[{pattern:"金钱固然能够带来……，但它买不来……",meaning:"Tiền bạc dẫu có thể đem lại..., nhưng nó không mua được...",example:"金钱固然能够带来优越的物质享受，但它买不来内心的宁静与真挚的情感。"},{pattern:"真正的幸福往往不在于拥有多少，而在于……",meaning:"Hạnh phúc đích thực thường không nằm ở sở hữu bao nhiêu, mà nằm ở...",example:"真正的幸福往往不在于拥有多少财富，而在于懂得知足与关爱身边的人。"}],sampleAnswer:{hanzi:`古人云：“金玉满堂，莫之能守。”对于“${n}”这个永恒的话题，我认为金钱与幸福之间有着密不可分的关系，但金钱绝非衡量幸福的唯一标尺。

不可否认，一定的经济基础是生存与发展的基本前提。正如俗话所说：“巧妇难为无米之炊。”拥有足够的资金，我们能够改善居住条件、享受良好的医疗保健，并为子女提供优质的教育资源。免于贫困的匮乏与焦虑，能够在很大程度上赋予我们追求梦想的安全感与尊严。

然而，金钱的作用终究是有边界的。财富可以买来奢华的床榻，却买不来安稳的睡眠；可以买来昂贵的礼物，却买不来真挚的友谊与亲情。如果在追逐财富的过程中迷失了自我，沦为金钱的奴隶，甚至牺牲了健康与家庭，即使腰缠万贯，内心也依然会感到空虚与痛苦。

在我看来，真正的幸福往往源于内心的丰盈与从容。正如先贤所倡导的“知足常乐”，当我们学会珍惜眼前的点滴拥有，把时间倾注于热爱的事业、陪伴身边的至亲，并用自己的能力回馈社会时，那种精神上的充实与满足才是任何金钱都无法替代的。

总的来说，金钱是通向美好生活的一种工具，而不是终极目的。我们要通过双手创造财富，更要用智慧守护幸福，在物质与精神之间找到最惬意的平衡。`,meaningVi:`Người xưa có câu: 'Vàng ngọc đầy nhà, khó giữ bền lâu.' Đối với câu hỏi muôn thuở "${n}", tôi cho rằng giữa tiền tài và hạnh phúc có mối liên hệ mật thiết, nhưng tiền bạc tuyệt đối không phải là thước đo duy nhất của niềm hạnh phúc.

Không thể phủ nhận rằng một nền tảng kinh tế ổn định là điều kiện cơ bản để sinh tồn và phát triển. Có đủ tài chính, chúng ta có thể cải thiện đời sống, tiếp cận điều kiện y tế tốt và mang lại nền giáo dục ưu việt cho con cái. Không bị bủa vây bởi nỗi lo cơm áo gạo tiền sẽ đem lại cho ta cảm giác an toàn và sự tự tôn để theo đuổi ước mơ.

Thế nhưng, đồng tiền suy cho cùng luôn có giới hạn. Tiền có thể mua chiếc giường nhung lụa nhưng không mua được giấc ngủ bình yên; mua được món quà đắt giá nhưng không mua được tình thân và bạn bè tri kỷ. Nếu mải miết lao vào kiếm tiền mà đánh mất chính mình, đánh đổi sức khỏe và gia đình thì dẫu có gia tài bạc triệu tâm hồn vẫn cô độc và trống rỗng.

Theo tôi, hạnh phúc chân thực bắt nguồn từ sự phong phú và an nhiên trong nội tâm. Đúng như đạo lý 'biết đủ là vui', khi ta biết trân trọng những gì mình đang có, dành thời gian cho đam mê, người thân và sẻ chia với xã hội, sự thảnh thơi đó là thứ vàng bạc không thể đánh đổi.

Tóm lại, tiền bạc là công cụ hỗ trợ cuộc sống chứ không phải mục đích sau cùng. Chúng ta hãy nỗ lực tạo ra của cải bằng đôi tay, nhưng hãy dùng trí tuệ để gìn giữ hạnh phúc, tìm được điểm cân bằng trọn vẹn giữa vật chất và tinh thần.`}}:s?{isFallback:!0,outline:{intro:`Mở bài: Nêu quan điểm trực diện về lối sống nhịp nhanh (快节奏生活) đối với câu hỏi: "${n}". Nhịp sống nhanh mang lại hiệu suất cao nhưng cũng tạo áp lực lớn, cần tìm lại sự cân bằng.`,body:["Luận điểm 1: Tác động tiêu cực của nhịp sống hối hả: Thường xuyên tăng ca, thiếu ngủ, kiệt sức và căng thẳng tâm lý.","Luận điểm 2: Ảnh hưởng đến các mối quan hệ xã hội: Ít thời gian chất lượng dành cho gia đình, ăn bữa cơm vội vã, cắm mặt vào điện thoại.","Luận điểm 3: Giải pháp cá nhân: Học cách sống chậm (慢生活), phân bổ thời gian khoa học, biết từ chối yêu cầu không cần thiết để tái tạo năng lượng."],conclusion:"Kết bài: Đúc kết rằng cuộc sống không chỉ có guồng quay công việc; biết dừng lại hít thở để tận hưởng khoảnh khắc đời thường."},vocabulary:[{hanzi:"快节奏生活",pinyin:"kuài jièzòu shēnghuó",meaning:"cuộc sống nhịp điệu nhanh"},{hanzi:"身心俱疲",pinyin:"shēn xīn jù pí",meaning:"thân xác và tâm hồn đều mệt mỏi rã rời"},{hanzi:"劳逸结合",pinyin:"láo yì jiéhé",meaning:"kết hợp hài hòa giữa lao động và nghỉ ngơi"},{hanzi:"紧绷",pinyin:"jǐnběng",meaning:"căng thẳng, thắt chặt"},{hanzi:"有张有弛",pinyin:"yǒu zhāng yǒu chí",meaning:"biết căng biết chùng, điều hòa nhịp nhàng"}],sentenceStructures:[{pattern:"在享受……的同时，我们也必须正视……",meaning:"Trong khi tận hưởng..., chúng ta cũng phải nhìn nhận thẳng thắn...",example:"在享受高效率带来的便利的同时，我们也必须正视快节奏对身心健康的影响。"},{pattern:"只有做到……，才能在忙碌中保持……",meaning:"Chỉ khi làm được..., mới có thể duy trì... trong sự bận rộn",example:"只有做到劳逸结合，才能在忙碌中保持充沛的活力与清醒的头脑。"}],sampleAnswer:{hanzi:`在当今瞬息万变的现代社会，“快节奏生活”已经成为一种普遍的常态。针对“${n}”这个问题，我认为快节奏虽然极大地提升了社会运转的效率，但如果缺乏调适，也会给人们的身心健康和生活质量带来沉重的负担。

首先，持续的高压运转严重透支着现代人的身心健康。许多上班族和青年学生习惯了争分夺秒，加班熬夜成为家常便饭。长期的紧绷状态导致失眠、焦虑以及亚健康问题频发，很多人年纪轻轻就感到身心俱疲。如果生活只剩下奔波，效率的提升最终可能以健康为代价。

其次，快节奏在不知不觉中冲淡了人际交往的温情。为了赶进度，我们常常草草吃完一顿饭，很少有充裕的时间陪伴父母、倾听伴侣的心声。人与人之间的交流变得碎片化，即使坐在一起也常常心不在焉地刷着工作群，让原本温馨的家庭生活失去了应有的宁静。

古人讲：“文武之道，一张一弛。”面对快节奏的裹挟，我们最重要的课题是学会主动寻找生活的平衡。一方面要提高时间管理能力，拒绝无意义的内耗与伪勤奋；另一方面要勇敢地为自己保留一段“慢时光”，去户外散步、读一本好书，或者静静喝一杯茶，让疲惫的心灵得到抚慰与沉淀。

总的来说，人生的旅途不仅在于奔跑的速度，更在于沿途的风景与内心的感受。学会在忙碌中适时停下脚步，劳逸结合、从容前行，我们才能拥有真正健康而充实的人生。`,meaningVi:`Trong xã hội hiện đại biến chuyển không ngừng, 'cuộc sống nhịp nhanh' đã trở thành trạng thái phổ biến. Đối với đề bài "${n}", tôi cho rằng nhịp sống hối hả dẫu nâng cao năng suất xã hội, nhưng nếu thiếu sự điều hòa sẽ tạo nên gánh nặng lớn cho sức khỏe và chất lượng sống.

Trước hết, guồng quay liên tục khiến sức khỏe thể chất và tinh thần bị bào mòn. Rất nhiều người trẻ quen với việc chạy đua cùng thời gian, tăng ca thâu đêm trở thành điều thường nhật. Áp lực kéo dài dẫn đến mất ngủ, lo âu và suy nhược. Nếu cuộc sống chỉ còn lại sự hối hả, năng suất cao cuối cùng sẽ phải trả giá bằng chính sức khỏe.

Thứ hai, nhịp sống vội vã vô tình làm nguội lạnh hơi ấm của các mối quan hệ. Vì bận rộn, ta thường ăn bữa cơm vội vã, ít có thời gian chất lượng lắng nghe người thân và bạn bè. Giao tiếp bị phân mảnh, ngồi cạnh nhau nhưng tâm trí vẫn để ở công việc khiến gia đình mất đi sự ấm cúng thanh thản.

Người xưa dạy: 'Đạo văn võ, có lúc căng lúc chùng'. Đứng trước làn sóng hối hả, điều quan trọng nhất là ta phải chủ động tìm lại sự cân bằng. Một mặt cần quản lý thời gian khoa học, mặt khác hãy dành cho mình những khoảnh khắc 'sống chậm' như đi dạo hít thở khí trời, đọc một cuốn sách hay thưởng thức chén trà để tâm hồn được tái tạo.

Tóm lại, hành trình cuộc đời không chỉ tính bằng tốc độ chạy, mà còn ở cảnh sắc hai bên đường và sự thanh thản nội tâm. Biết dừng lại đúng lúc để nghỉ ngơi, làm việc và nghỉ ngơi hài hòa, ta mới có thể tận hưởng cuộc đời trọn vẹn.`}}:{isFallback:!0,outline:{intro:`Mở bài: Nêu quan điểm trực diện và rõ ràng cho câu hỏi đề bài: "${n}". Đặt ra câu hỏi gợi mở cho học viên.`,body:["Luận điểm 1: Phân tích bản chất hiện tượng từ góc nhìn thực tế đời sống và nguyên nhân cốt lõi.","Luận điểm 2: Đưa ra trải nghiệm, dẫn chứng thực tế sinh động để làm sáng tỏ vấn đề.","Luận điểm 3: Đề xuất giải pháp và bài học hành động để phát huy mặt tích cực và khắc phục mặt hạn chế."],conclusion:"Kết bài: Đúc kết lại toàn bộ vấn đề, đưa ra thông điệp tích cực và định hướng hành động thiết thực."},vocabulary:[{hanzi:"深思",pinyin:"shēnsī",meaning:"suy ngẫm sâu sắc"},{hanzi:"切身体会",pinyin:"qièshēn tǐhuì",meaning:"trải nghiệm thực tế của bản thân"},{hanzi:"脚踏实地",pinyin:"jiǎo tà shí dì",meaning:"chân đạp đất vững chắc, làm thật việc thật"},{hanzi:"因地制宜",pinyin:"yīn dì zhì yí",meaning:"tùy cơ ứng biến, linh hoạt theo tình hình"},{hanzi:"厚积薄发",pinyin:"hòu jī bó fā",meaning:"tích lũy sâu dày rồi bộc phát rực rỡ"}],sentenceStructures:[{pattern:"就我个人的体会而言，……最核心的要素在于……",meaning:"Xét từ trải nghiệm của cá nhân tôi, yếu tố cốt lõi nhất của... nằm ở...",example:"就我个人的体会而言，面对这个话题，最核心的要素在于理性思考与脚踏实地的行动。"},{pattern:"与其……，不如从……做起",meaning:"Thay vì..., chi bằng hãy bắt đầu từ việc...",example:"与其盲目焦虑，不如从身边的每一件小事做起。"}],sampleAnswer:{hanzi:`关于“${n}”这个非常具有启发性的题目，我认为它紧密贴合了我们当下的现实生活，很值得我们静下心来深入探讨。

首先，从现实生活的实际经验来看，任何事情的发展都有其内在的规律。面对各种纷繁复杂的现象，我们不能只停留在表面的讨论上，而应当善于抓住核心，弄清楚背后的根本原因。只有看清了方向，我们的努力才不会偏离轨道。

其次，就我个人的体会而言，面对这样的情境，保持积极而平和的心态至关重要。生活中往往充满了未知与变数，与其一味感到困惑或抱怨，不如静下心来认真总结经验。多向身边优秀的同行与长辈请教，把每一次考验都当作提升自我认知的契机，才能在复杂多变的环境中立于不败之地。

最后，纸上谈兵终究无法带来真实的改变，关键在于知行合一、脚踏实地。我们可以从力所能及的小事做起，循序渐进地积累经验。只要方向正确、方法得当，点滴的努力最终必将汇聚成可观的成果。

总的来说，面对这一问题，我们既要有长远的眼光，又要有求真务实的作风。在思考中前行、在行动中完善，我们就一定能从容应对，活出充实而有意义的人生。`,meaningVi:`Đối với câu hỏi giàu ý nghĩa gợi mở "${n}", tôi cho rằng đề bài này bám rất sát thực tế đời sống hiện nay và rất xứng đáng để chúng ta cùng suy ngẫm sâu sắc.

Trước hết, từ trải nghiệm thực tế đời thường, sự phát triển của vạn vật đều có quy luật riêng. Đứng trước những hiện tượng phức tạp, chúng ta không thể chỉ dừng lại ở bàn luận bề nổi, mà cần nắm bắt mắt xích cốt lõi, thấu suốt nguyên nhân căn bản. Chỉ khi nhìn rõ phương hướng, nỗ lực của chúng ta mới không bị chệch hướng.

Thứ hai, từ cảm nhận của bản thân tôi, giữ được một tâm thế bình hòa và tích cực là điều vô cùng quý giá. Cuộc sống luôn có những biến số, thay vì hoang mang hay than phiền, chi bằng ta hãy lắng lòng lại đúc kết kinh nghiệm, khiêm tốn học hỏi những người đi trước và biến mỗi thử thách thành đòn bẩy hoàn thiện năng lực.

Cuối cùng, mọi điều nói suông đều không tạo ra thay đổi thực chất, điều cốt yếu nằm ở việc 'tri hành hợp nhất', nói đi đôi với làm thật. Chúng ta hãy bắt đầu từ những việc nhỏ trong tầm tay, tích lũy từng bước để tạo nên thành tựu lớn.

Tóm lại, đối với vấn đề này, chúng ta vừa cần tầm nhìn xa trông rộng, vừa cần tác phong thực tế cầu thị. Vừa đi vừa ngẫm, vừa làm vừa hoàn thiện, nhất định chúng ta sẽ tự tin làm chủ cuộc sống và kiến tạo một tương lai ý nghĩa.`}}}window.playWritingSampleTts=function(){const n=document.getElementById("sample-writing-hanzi");if(!n||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const i=new SpeechSynthesisUtterance(n.textContent.trim());i.lang="zh-CN",i.rate=.88,window.speechSynthesis.speak(i)};window.insertVocabToWriting=function(n){const i=document.getElementById("qa-writing-input");i&&(i.value+=n,handleQaTextInput(),i.focus())};window.copySampleText=function(){const n=document.getElementById("sample-writing-hanzi")||document.getElementById("sample-hanzi-text");n&&(navigator.clipboard.writeText(n.textContent.trim()),alert("Đã sao chép bài văn mẫu vào clipboard!"))};window.handleQaTextInput=function(){const n=document.getElementById("qa-writing-input");if(!n)return;const i=n.value,e=(i.match(/[\u4e00-\u9fa5]/g)||[]).length,h=i.split(`
`).filter(s=>s.trim().length>0).length,a=document.getElementById("qa-char-count"),c=document.getElementById("qa-para-count");a&&(a.textContent=e),c&&(c.textContent=h)};window.clearQaInput=function(){const n=document.getElementById("qa-writing-input");if(n){if(n.value.trim().length>0&&!confirm("Bạn có chắc muốn xóa nội dung đã viết?"))return;n.value="",handleQaTextInput()}};document.addEventListener("keydown",n=>{if((n.ctrlKey||n.metaKey)&&n.key==="Enter"){const i=document.getElementById("wf-card-qa");i&&i.classList.contains("active")?submitQaForGrading():submitEssayForGrading("free")}});window.submitQaForGrading=async function(){if(!u("Nộp Bài Viết Cho AI Chấm")||d)return;const n=document.getElementById("qa-writing-input"),i=document.getElementById("ai-evaluation-results"),t=document.getElementById("qa-submit-btn");if(!n||!i)return;const e=n.value.trim(),h=(e.match(/[\u4e00-\u9fa5]/g)||[]).length;if(!e||h<5){alert("Vui lòng viết câu trả lời tiếng Trung ít nhất từ 10 chữ Hán để AI có thể đánh giá chính xác nhé!"),n.focus();return}d=!0,t&&(t.disabled=!0,t.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> <span>AI Đang Chấm Bài...</span>'),i.style.display="block",i.scrollIntoView({behavior:"smooth",block:"start"}),i.innerHTML=`
    <div class="writing-card-panel" style="text-align: center; padding: 48px 24px;">
      <i class="fa-solid fa-brain fa-bounce" style="font-size: 3rem; color: #8b5cf6; margin-bottom: 20px;"></i>
      <h2 style="font-size: 1.45rem; font-weight: 800; color: #ffffff; margin: 0 0 10px 0;">
        Giám Khảo AI HongTai Đang Chấm Bài Viết Của Bạn...
      </h2>
      <p style="font-size: 0.92rem; color: #94a3b8; max-width: 560px; margin: 0 auto 20px auto;">
        Đang đối chiếu ngữ pháp chuẩn thi HSKK, kiểm tra độ chính xác cú pháp, tính mạch lạc và biên soạn bản viết lại chuẩn người bản xứ.
      </p>
      <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
        <span style="font-size: 0.8rem; background: rgba(139, 92, 246, 0.15); color: #d8b4fe; padding: 4px 12px; border-radius: 99px;">
          ✓ Soát lỗi ngữ pháp & chính tả
        </span>
        <span style="font-size: 0.8rem; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 4px 12px; border-radius: 99px;">
          ✓ Đánh giá 4 tiêu chí HSKK
        </span>
        <span style="font-size: 0.8rem; background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 4px 12px; border-radius: 99px;">
          ✓ Viết lại chuẩn người bản xứ
        </span>
      </div>
    </div>
  `;try{const a={text:e,mode:"prompt",hskLevel:o==="so"?2:o==="cao"?5:3,topicTitle:`HSKK ${o==="so"?"Sơ cấp":o==="cao"?"Cao cấp":"Trung cấp"}`,topicPrompt:r?r.question:"Trả lời câu hỏi",requiredKeywords:[],minWords:o==="so"?40:o==="cao"?120:80},c=await fetch(`${v}/api/ai/grade-essay`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)});if(c.ok){const s=await c.json();$(s,i,e),y("success")}else throw new Error("Server returned error")}catch(a){console.error("Lỗi nộp bài chấm:",a),i.innerHTML=`
      <div class="eval-report-card" style="text-align: center; padding: 40px 24px;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.8rem; color: #f59e0b; margin-bottom: 16px;"></i>
        <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 10px;">Máy chủ AI đang bận hoặc gián đoạn mạng</h3>
        <p style="font-size: 0.95rem; opacity: 0.85; max-width: 520px; margin: 0 auto 20px auto;">
          Không thể hoàn thành chấm bài lúc này. Vui lòng bấm nút bên dưới để thử lại ngay!
        </p>
        <button onclick="submitPromptEssayForGrading()" class="submit-writing-btn" style="display: inline-flex; margin: 0 auto;">
          <i class="fa-solid fa-rotate-right"></i> <span>Thử Chấm Điểm Lại</span>
        </button>
      </div>
    `}finally{d=!1,t&&(t.disabled=!1,t.innerHTML='<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Viết rồi đưa AI chấm (Ctrl + Enter)</span>')}};window.submitEssayForGrading=async function(n){if(!u("Nộp Bài Viết Cho AI Chấm")||d)return;const i=document.getElementById("free-writing-input"),t=document.getElementById("ai-evaluation-results"),e=document.getElementById("free-submit-btn");if(!i||!t)return;const h=i.value.trim(),a=(h.match(/[\u4e00-\u9fa5]/g)||[]).length;if(!h||a<5){alert("Vui lòng nhập bài viết tiếng Trung ít nhất từ 10 chữ Hán để AI có thể chấm điểm chính xác nhé!"),i.focus();return}d=!0,e&&(e.disabled=!0,e.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> <span>AI Đang Chấm Bài...</span>'),t.style.display="block",t.scrollIntoView({behavior:"smooth",block:"start"}),t.innerHTML=`
    <div class="writing-card-panel" style="text-align: center; padding: 48px 24px;">
      <i class="fa-solid fa-brain fa-bounce" style="font-size: 3rem; color: #8b5cf6; margin-bottom: 20px;"></i>
      <h2 style="font-size: 1.45rem; font-weight: 800; color: #ffffff; margin: 0 0 10px 0;">
        Giám Khảo AI Đang Phân Tích Bài Viết Tự Do...
      </h2>
      <p style="font-size: 0.92rem; color: #94a3b8; max-width: 540px; margin: 0 auto 20px auto;">
        Đang quét toàn diện: soi lỗi ngữ pháp &amp; cấu trúc câu, kiểm tra cách dùng từ, thẩm định logic mạch lạc và biên soạn bản viết lại chuẩn người bản xứ.
      </p>
      <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
        <span style="font-size: 0.8rem; background: rgba(139, 92, 246, 0.15); color: #d8b4fe; padding: 4px 12px; border-radius: 99px;">
          ✓ Soi lỗi ngữ pháp &amp; cấu trúc
        </span>
        <span style="font-size: 0.8rem; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 4px 12px; border-radius: 99px;">
          ✓ Kiểm tra dùng từ &amp; lượng từ
        </span>
        <span style="font-size: 0.8rem; background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 4px 12px; border-radius: 99px;">
          ✓ Soát logic câu &amp; mạch lạc
        </span>
      </div>
    </div>
  `;try{const c={text:h,mode:"free",hskLevel:3,topicTitle:"Bài viết tự do",topicPrompt:"",requiredKeywords:[],minWords:0},s=await fetch(`${v}/api/ai/grade-essay`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(c)});if(s.ok){const b=await s.json();$(b,t,h)}else throw new Error("Server error")}catch(c){console.error("Grade free essay error:",c),t.innerHTML=`
      <div class="eval-report-card" style="text-align: center; padding: 40px 24px;">
        <i class="fa-solid fa-triangle-exclamation" style="font-size: 2.8rem; color: #f59e0b; margin-bottom: 16px;"></i>
        <h3 style="font-size: 1.3rem; font-weight: 800; margin-bottom: 10px;">Máy chủ AI đang bận hoặc gián đoạn mạng</h3>
        <p style="font-size: 0.95rem; opacity: 0.85; max-width: 520px; margin: 0 auto 20px auto;">
          Không thể hoàn thành chấm bài lúc này. Vui lòng bấm nút bên dưới để thử lại ngay!
        </p>
        <button onclick="submitEssayForGrading('free')" class="submit-writing-btn" style="display: inline-flex; margin: 0 auto;">
          <i class="fa-solid fa-rotate-right"></i> <span>Thử Chấm Điểm Lại</span>
        </button>
      </div>
    `}finally{d=!1,e&&(e.disabled=!1,e.innerHTML='<i class="fa-solid fa-wand-magic-sparkles"></i> <span>AI Chấm Điểm &amp; Sửa Lỗi</span>')}};window.handleTextInputChange=function(n){const i=document.getElementById("free-writing-input");if(!i)return;const t=i.value.match(/[\u4e00-\u9fa5]/g)||[],e=document.getElementById("free-char-count");e&&(e.textContent=t.length)};window.pasteFromClipboard=async function(){try{const n=await navigator.clipboard.readText(),i=document.getElementById("free-writing-input");i&&n&&(i.value=n,handleTextInputChange("free"))}catch{alert("Vui lòng nhấn Ctrl + V để dán trực tiếp vào ô soạn thảo.")}};window.clearWritingInput=function(){const n=document.getElementById("free-writing-input");n&&(n.value="",handleTextInputChange("free"))};function $(n,i,t){const e=Number(n.overallScore)||80,h=n.badge||(e>=90?"Xuất Sắc 🌟":e>=80?"Rất Tốt 👏":e>=65?"Khá 👍":"Cần Cố Gắng ✍️"),a=e>=85?"linear-gradient(135deg, #10b981, #059669)":e>=70?"linear-gradient(135deg, #0284c7, #0369a1)":"linear-gradient(135deg, #f59e0b, #d97706)",c=n.criteriaScores||{grammar:75,vocabulary:80,coherence:85,taskFulfillment:85},s=n.strengths||[],b=n.errorsList||[],x=n.nativeVersion||t,L=n.nativePinyin||"",z=n.nativeVi||"",C=n.advancedVocabSuggestions||[];i.innerHTML=`
    <div class="eval-report-card">
      <!-- Header kết quả -->
      <div class="eval-header-row">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div class="eval-score-badge" style="background: ${a};">
            <span style="font-size: 2.3rem; font-weight: 900; line-height: 1;">${e}</span>
            <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px;">Thang 100</span>
          </div>

          <div>
            <div class="eval-title-text">
              <span>Đánh Giá:</span>
              <span style="color: #38bdf8;">${h}</span>
            </div>
            <div class="eval-meta-sub">
              <span><i class="fa-solid fa-file-word"></i> Độ dài: <strong>${n.wordCount||t.length}</strong> chữ Hán</span>
              <span>&bull;</span>
              <span><i class="fa-solid fa-circle-check" style="color: #10b981;"></i> Đã soát kỹ ngữ pháp HSK, lượng từ &amp; từ vựng</span>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 10px;">
          <button onclick="window.print()" class="btn" style="background: rgba(148, 163, 184, 0.15); border: 1.5px solid rgba(148, 163, 184, 0.3); color: inherit; padding: 8px 16px; border-radius: 12px; font-weight: 700; font-size: 0.88rem; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-print"></i> <span>In kết quả</span>
          </button>
          <button onclick="document.getElementById('ai-evaluation-results').style.display='none'" class="btn" title="Đóng báo cáo" style="background: rgba(148, 163, 184, 0.15); border: 1.5px solid rgba(148, 163, 184, 0.3); color: inherit; width: 38px; height: 38px; border-radius: 12px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- 4 TIÊU CHÍ HSK -->
      <div class="eval-crit-grid">
        <!-- Ngữ pháp & Cú pháp -->
        <div class="eval-crit-card crit-grammar">
          <div class="eval-crit-title">
            <span class="eval-crit-label"><i class="fa-solid fa-spell-check" style="color: #8b5cf6;"></i> Ngữ Pháp &amp; Cú Pháp</span>
            <span class="eval-crit-val">${c.grammar||75}%</span>
          </div>
          <div class="eval-crit-track">
            <div style="height: 100%; width: ${Math.min(100,Math.max(5,c.grammar||75))}%; background: linear-gradient(90deg, #8b5cf6, #7c3aed); border-radius: 99px;"></div>
          </div>
        </div>

        <!-- Vốn từ & Biểu đạt -->
        <div class="eval-crit-card crit-vocab">
          <div class="eval-crit-title">
            <span class="eval-crit-label"><i class="fa-solid fa-book" style="color: #38bdf8;"></i> Vốn Từ &amp; Biểu Đạt</span>
            <span class="eval-crit-val">${c.vocabulary||80}%</span>
          </div>
          <div class="eval-crit-track">
            <div style="height: 100%; width: ${Math.min(100,Math.max(5,c.vocabulary||80))}%; background: linear-gradient(90deg, #38bdf8, #0284c7); border-radius: 99px;"></div>
          </div>
        </div>

        <!-- Mạch lạc & Bố cục -->
        <div class="eval-crit-card crit-coherence">
          <div class="eval-crit-title">
            <span class="eval-crit-label"><i class="fa-solid fa-link" style="color: #10b981;"></i> Mạch Lạc &amp; Bố Cục</span>
            <span class="eval-crit-val">${c.coherence||85}%</span>
          </div>
          <div class="eval-crit-track">
            <div style="height: 100%; width: ${Math.min(100,Math.max(5,c.coherence||85))}%; background: linear-gradient(90deg, #10b981, #059669); border-radius: 99px;"></div>
          </div>
        </div>

        <!-- Bám đề & Chi tiết -->
        <div class="eval-crit-card crit-task">
          <div class="eval-crit-title">
            <span class="eval-crit-label"><i class="fa-solid fa-bullseye" style="color: #f59e0b;"></i> Bám Đề &amp; Chi Tiết</span>
            <span class="eval-crit-val">${c.taskFulfillment||85}%</span>
          </div>
          <div class="eval-crit-track">
            <div style="height: 100%; width: ${Math.min(100,Math.max(5,c.taskFulfillment||85))}%; background: linear-gradient(90deg, #f59e0b, #d97706); border-radius: 99px;"></div>
          </div>
        </div>
      </div>

      <!-- NHẬN XÉT CHUNG -->
      <div class="eval-feedback-panel">
        <div class="eval-feedback-title">
          <i class="fa-solid fa-comment-dots"></i> Nhận Xét Chung Của Giám Khảo:
        </div>
        <p class="eval-feedback-desc">
          ${n.generalFeedback||"Bài viết đã truyền tải đầy đủ ý tưởng và hoàn thành tốt yêu cầu."}
        </p>

        ${s.length>0?`
          <div style="margin-top: 12px; border-top: 1px dashed rgba(168, 85, 247, 0.25); padding-top: 10px;">
            <strong style="font-size: 0.88rem; color: #10b981; text-transform: uppercase; display: flex; align-items: center; gap: 6px;">
              <i class="fa-solid fa-star"></i> Điểm sáng của bài viết:
            </strong>
            <ul class="eval-strengths-list">
              ${s.map(g=>`<li>${g}</li>`).join("")}
            </ul>
          </div>
        `:""}
      </div>

      <!-- CHI TIẾT LỖI SAI NẾU CÓ (Mục trọng tâm người dùng yêu cầu) -->
      ${b.length>0?`
        <div class="eval-errors-container">
          <div class="eval-errors-heading">
            <span><i class="fa-solid fa-triangle-exclamation"></i> Danh Sách Lỗi Sai &amp; Hướng Dẫn Sửa Chi Tiết:</span>
            <span style="font-size: 0.85rem; font-weight: 800; background: #ef4444; color: #ffffff; padding: 4px 12px; border-radius: 99px;">
              ${b.length} lỗi cần sửa
            </span>
          </div>

          ${b.map((g,l)=>`
            <div class="eval-error-card">
              <!-- Top bar với số thứ tự và phân loại lỗi -->
              <div class="eval-error-top-bar">
                <div style="display: flex; align-items: center; gap: 8px;">
                  <span class="eval-error-num-badge">Lỗi #${l+1}</span>
                  ${g.errorType?`<span class="eval-error-type-tag"><i class="fa-solid fa-tag"></i> ${g.errorType}</span>`:""}
                </div>
                <span style="font-size: 0.8rem; font-weight: 700; opacity: 0.8;">Cần sửa lại cho tự nhiên</span>
              </div>

              <!-- Lưới so sánh Câu gốc vs Sửa lại -->
              <div class="eval-compare-grid">
                <div class="eval-box-orig">
                  <div class="eval-box-orig-label">
                    <i class="fa-solid fa-circle-xmark"></i> Câu gốc chưa chuẩn:
                  </div>
                  <div class="hanzi-text eval-box-orig-text">
                    ${g.original}
                  </div>
                </div>

                <div class="eval-box-corr">
                  <div class="eval-box-corr-label">
                    <i class="fa-solid fa-circle-check"></i> Nên sửa thành:
                  </div>
                  <div class="hanzi-text eval-box-corr-text">
                    ${g.corrected}
                  </div>
                </div>
              </div>

              <!-- Giải thích chi tiết & quy tắc ngữ pháp -->
              <div class="eval-reason-box">
                <div class="eval-reason-label">
                  <i class="fa-solid fa-lightbulb"></i> Phân tích lỗi &amp; Quy tắc ngữ pháp chuẩn:
                </div>
                <div>${g.reason}</div>
              </div>
            </div>
          `).join("")}
        </div>
      `:`
        <div style="background: rgba(16, 185, 129, 0.1); border: 1.5px solid rgba(16, 185, 129, 0.35); border-radius: 16px; padding: 18px 20px; margin-bottom: 24px; display: flex; align-items: center; gap: 14px;">
          <i class="fa-solid fa-circle-check" style="font-size: 2rem; color: #10b981; flex-shrink: 0;"></i>
          <div>
            <strong style="font-size: 1.05rem; color: #10b981; display: block; margin-bottom: 3px;">Tuyệt vời! Không phát hiện lỗi sai ngữ pháp đáng kể</strong>
            <span style="font-size: 0.92rem; opacity: 0.95;">Bài viết của bạn được viết rất chuẩn ngữ pháp, câu từ mạch lạc và tự nhiên!</span>
          </div>
        </div>
      `}

      <!-- BẢN VIẾT LẠI CHUẨN BẢN XỨ -->
      <div class="eval-native-panel">
        <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
          <h3 class="eval-native-title" style="margin: 0;">
            <i class="fa-solid fa-crown" style="color: #f59e0b;"></i> Phiên Bản Viết Lại Chuẩn Người Bản Xứ:
          </h3>
          <button onclick="playNativeRewriteAudio()" title="Nghe phát âm bản viết lại"
            style="background: #10b981; border: none; color: #ffffff; padding: 7px 14px; border-radius: 10px; font-weight: 800; font-size: 0.82rem; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);">
            <i class="fa-solid fa-volume-high"></i> <span>Nghe đọc mẫu</span>
          </button>
        </div>

        <div id="native-rewrite-zh-text" class="hanzi-text eval-native-zh">
          ${x}
        </div>

        ${x?(()=>{let g=L;try{const l=f(x,{toneType:"symbol"});l&&(g=l)}catch{}return g?`
            <div class="eval-native-pinyin">
              ${g}
            </div>
          `:""})():""}

        ${z?`
          <div class="eval-native-vi">
            <strong><i class="fa-solid fa-language"></i> Bản dịch tham khảo:</strong> ${z}
          </div>
        `:""}
      </div>

      <!-- TỪ VỰNG NÂNG CAO ĐƯỢC GỢI Ý -->
      ${C.length>0?`
        <div style="margin-bottom: 14px;">
          <h4 style="font-size: 1.05rem; font-weight: 800; color: #38bdf8; margin: 0 0 12px 0; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-graduation-cap"></i> Gợi ý từ vựng &amp; Thành ngữ HSK nâng cao thay thế:
          </h4>
          <div class="eval-vocab-grid">
            ${C.map(g=>{let l=g.pinyin;if(g.suggested)try{const k=f(g.suggested,{toneType:"symbol"});k&&(l=k)}catch{}return`
              <div class="eval-vocab-item">
                <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                  <span style="text-decoration: line-through; opacity: 0.7; font-size: 0.95rem;">${g.original}</span>
                  <i class="fa-solid fa-arrow-right" style="color: #38bdf8; font-size: 0.8rem;"></i>
                  <strong style="color: #38bdf8; font-size: 1.15rem;">${g.suggested}</strong>
                  ${l?`<span style="font-size: 0.82rem; color: #a855f7; font-weight: 600;">(${l})</span>`:""}
                </div>
                ${g.meaning?`<div class="eval-vocab-text"><strong>Nghĩa:</strong> ${g.meaning}</div>`:""}
              </div>
            `}).join("")}
          </div>
        </div>
      `:""}
    </div>
  `}window.playNativeRewriteAudio=function(){const n=document.getElementById("native-rewrite-zh-text");if(!n)return;const i=n.textContent.trim();if(!i||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const t=new SpeechSynthesisUtterance(i);t.lang="zh-CN",t.rate=.88,window.speechSynthesis.speak(t)};document.addEventListener("DOMContentLoaded",()=>{I()});
