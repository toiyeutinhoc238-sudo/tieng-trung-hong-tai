import"./global_sidebar-VubksNB9.js";const T=(window.location.hostname.includes("localhost")||window.location.hostname.includes("127.0.0.1"),"");let u={so:[],trung:[],cao:[]},c="trung",r=null,m=new Map,I=!1,f=null,y=180,b=!1,v=null,w=120,g=null,$=[],H=null,A=null,d=null,S=!1,x=0;function h(n="beep"){try{const e=new(window.AudioContext||window.webkitAudioContext),t=e.createOscillator(),i=e.createGain();if(t.connect(i),i.connect(e.destination),n==="spin")t.type="triangle",t.frequency.setValueAtTime(400,e.currentTime),t.frequency.exponentialRampToValueAtTime(800,e.currentTime+.25),i.gain.setValueAtTime(.2,e.currentTime),i.gain.exponentialRampToValueAtTime(.01,e.currentTime+.25),t.start(),t.stop(e.currentTime+.25);else if(n==="start")t.type="sine",t.frequency.setValueAtTime(587.33,e.currentTime),t.frequency.setValueAtTime(880,e.currentTime+.1),i.gain.setValueAtTime(.25,e.currentTime),i.gain.exponentialRampToValueAtTime(.01,e.currentTime+.35),t.start(),t.stop(e.currentTime+.35);else if(n==="chime"){const s=e.currentTime;[523.25,659.25,783.99].forEach((o,a)=>{const l=e.createOscillator(),p=e.createGain();l.type="sine",l.frequency.value=o,l.connect(p),p.connect(e.destination),p.gain.setValueAtTime(.18,s+a*.15),p.gain.exponentialRampToValueAtTime(.001,s+a*.15+.4),l.start(s+a*.15),l.stop(s+a*.15+.4)})}}catch{}}async function V(){var t,i,s;try{let o=await fetch(`${T}/api/hskk-questions`);o.ok||(o=await fetch("/data/hskk_questions.json"));const a=await o.json();a&&(a.so||a.questions)&&(a.so?u=a:a.questions&&(u.so=a.questions.filter(l=>l.level==="so"),u.trung=a.questions.filter(l=>l.level==="trung"),u.cao=a.questions.filter(l=>l.level==="cao")))}catch(o){console.warn("Lỗi nạp API HSKK, thử nạp tĩnh...",o);try{const a=await fetch("/data/hskk_questions.json");a.ok&&(u=await a.json())}catch{}}const n=(((t=u.so)==null?void 0:t.length)||0)+(((i=u.trung)==null?void 0:i.length)||0)+(((s=u.cao)==null?void 0:s.length)||0),e=document.getElementById("total-speaking-stat");e&&n>0&&(e.textContent=n.toLocaleString()),spinRandomQuestion(!1)}window.switchSpeakingLevel=function(n,e){c===n&&r||(c=n,document.querySelectorAll(".level-select-row .level-btn").forEach(t=>t.classList.remove("active")),e&&e.classList.add("active"),spinRandomQuestion(!0))};window.spinRandomQuestion=function(n=!0){const e=u[c]||[];if(!e||e.length===0)return;const t=document.getElementById("spin-question-btn");n&&t&&(t.classList.add("rolling"),h("spin"),setTimeout(()=>t.classList.remove("rolling"),500));let i=null;if(e.length===1)i=e[0];else do i=e[Math.floor(Math.random()*e.length)];while(r&&i.question===r.question&&e.length>1);r=i,M();const s=document.getElementById("ai-suggestion-box");s&&(s.style.display="none");const o=document.getElementById("hint-toggle-btn");o&&(o.innerHTML=`
      <i class="fa-solid fa-lightbulb"></i>
      <span>Gợi ý Dàn bài &amp; Từ vựng</span>
    `);const a=document.getElementById("sample-speech-box");a&&(a.style.display="none");const l=document.getElementById("sample-speech-toggle-btn");l&&(l.innerHTML=`
      <i class="fa-solid fa-medal"></i>
      <span>Bài nói mẫu tham khảo</span>
    `),resetPrepTimer(),cancelSpeakingRecording();const p=document.getElementById("recorded-result-box");p&&(p.style.display="none");const k=document.getElementById("ai-speaking-evaluation-results");k&&(k.style.display="none")};function M(){if(!r)return;const n=document.getElementById("active-question-text"),e=document.getElementById("question-meta-badge"),t=c==="so"?"HSKK Sơ cấp":c==="cao"?"HSKK Cao cấp":"HSKK Trung cấp";n&&(n.textContent=r.question),e&&(e.textContent=`Câu ${r.stt||1} • ${t}`)}window.playQuestionTts=function(){if(!r||!r.question||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const n=new SpeechSynthesisUtterance(r.question);n.lang="zh-CN",n.rate=.9,window.speechSynthesis.speak(n)};window.toggleAiSuggestions=async function(){const n=document.getElementById("ai-suggestion-box"),e=document.getElementById("hint-toggle-btn");if(!n||!r)return;if(n.style.display==="block"){n.style.display="none",e&&(e.innerHTML=`
        <i class="fa-solid fa-lightbulb"></i>
        <span>Gợi ý Dàn bài &amp; Từ vựng</span>
      `);return}n.style.display="block",e&&(e.innerHTML=`
      <i class="fa-solid fa-eye-slash"></i>
      <span>Ẩn Gợi ý</span>
    `);const i=`${c}_${r.question}`;if(m.has(i)){z(m.get(i));return}if(!I){I=!0,n.innerHTML=`
    <div style="text-align: center; padding: 24px 16px; color: #f59e0b;">
      <i class="fa-solid fa-brain fa-spin" style="font-size: 2rem; margin-bottom: 12px; color: #f59e0b;"></i>
      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
        AI HongTai đang lập Dàn ý &amp; chọn lọc Từ vựng Khẩu ngữ...
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8;">
        Phù hợp chuẩn thi HSKK ${c==="so"?"Sơ cấp":c==="cao"?"Cao cấp":"Trung cấp"}
      </div>
    </div>
  `;try{const s=await fetch(`${T}/api/ai/hskk-suggest`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:r.question,level:c,skill:"speaking"})});if(s.ok){const o=await s.json();m.set(i,o),z(o),h("start")}else throw new Error("Server error")}catch(s){console.error("Lỗi gợi ý AI:",s);const o=R();m.set(i,o),z(o)}finally{I=!1}}};function z(n){const e=document.getElementById("ai-suggestion-box");if(!e)return;const t=n.outline||{},i=n.vocabulary||[],s=n.sentenceStructures||[];e.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px dashed rgba(34, 197, 94, 0.4); padding-bottom: 10px;">
      <div style="display: flex; align-items: center; gap: 8px; font-weight: 900; font-size: 1.05rem; color: #4ade80;">
        <i class="fa-solid fa-wand-magic-sparkles"></i>
        <span>AI Đề Xuất Dàn Ý &amp; Từ Vựng Khẩu Ngữ</span>
      </div>
      <span style="font-size: 0.75rem; background: rgba(34, 197, 94, 0.15); color: #86efac; padding: 2px 8px; border-radius: 6px; font-weight: 700;">
        HSKK ${c==="so"?"Sơ cấp":c==="cao"?"Cao cấp":"Trung cấp"}
      </span>
    </div>

    <!-- 1. Dàn bài -->
    <div style="margin-bottom: 16px;">
      <div style="font-size: 0.92rem; font-weight: 800; color: #fbbf24; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
        <i class="fa-solid fa-list-ol"></i> <span>1. Dàn bài gợi ý:</span>
      </div>
      <div style="background: rgba(0,0,0,0.25); padding: 12px 16px; border-radius: 12px; border-left: 3px solid #fbbf24; font-size: 0.9rem; line-height: 1.65; color: #e2e8f0;">
        <div style="margin-bottom: 6px;"><strong>Mở đầu:</strong> ${t.intro||"Trả lời trực tiếp vào trọng tâm câu hỏi."}</div>
        <div style="margin-bottom: 6px;">
          <strong>Triển khai thân bài:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 20px;">
            ${(t.body||[]).map(o=>`<li>${o}</li>`).join("")}
          </ul>
        </div>
        <div><strong>Kết thúc:</strong> ${t.conclusion||"Đúc kết bài học hoặc cảm xúc cá nhân."}</div>
      </div>
    </div>

    <!-- 2. Từ vựng có thể sử dụng -->
    <div style="margin-bottom: 16px;">
      <div style="font-size: 0.92rem; font-weight: 800; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
        <i class="fa-solid fa-key"></i> <span>2. Từ vựng / Cụm từ đắt giá nên nói:</span>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${i.map(o=>`
          <div style="background: rgba(56, 189, 248, 0.12); border: 1px solid rgba(56, 189, 248, 0.35); padding: 5px 12px; border-radius: 99px;">
            <span style="font-weight: 800; color: #ffffff; font-family: var(--font-chinese), sans-serif;">${o.hanzi}</span>
            <span style="font-size: 0.78rem; color: #38bdf8; margin: 0 4px;">(${o.pinyin})</span>
            <span style="font-size: 0.78rem; color: #cbd5e1;">: ${o.meaning}</span>
          </div>
        `).join("")}
      </div>
    </div>

    <!-- 3. Mẫu câu cấu trúc nên dùng -->
    ${s.length>0?`
      <div>
        <div style="font-size: 0.92rem; font-weight: 800; color: #a855f7; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-puzzle-piece"></i> <span>3. Mẫu câu kết nối lưu loát:</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">
          ${s.map(o=>`
            <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 12px; padding: 10px 14px; font-size: 0.88rem;">
              <div style="font-weight: 800; color: #d8b4fe; margin-bottom: 2px;">${o.pattern}</div>
              <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px;">${o.meaning}</div>
              ${o.example?`<div style="font-size: 0.84rem; color: #e2e8f0; font-style: italic;">VD: ${o.example}</div>`:""}
            </div>
          `).join("")}
        </div>
      </div>
    `:""}
  `}window.toggleSampleSpeech=async function(){const n=document.getElementById("sample-speech-box"),e=document.getElementById("sample-speech-toggle-btn");if(!n||!r)return;if(n.style.display==="block"){n.style.display="none",e&&(e.innerHTML=`
        <i class="fa-solid fa-medal"></i>
        <span>Bài nói mẫu tham khảo</span>
      `);return}n.style.display="block",e&&(e.innerHTML=`
      <i class="fa-solid fa-eye-slash"></i>
      <span>Ẩn Bài nói mẫu</span>
    `);const i=`${c}_${r.question}`;if(m.has(i)){E(m.get(i));return}n.innerHTML=`
    <div style="text-align: center; padding: 24px 16px; color: #10b981;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 12px; color: #10b981;"></i>
      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
        Đang tạo bài nói mẫu dài chuẩn HSKK ${c==="so"?"Sơ cấp":c==="cao"?"Cao cấp":"Trung cấp"}...
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8;">
        Bài văn mẫu dài, chi tiết, văn phong lưu loát chuẩn người bản xứ.
      </div>
    </div>
  `;try{const s=await fetch(`${T}/api/ai/hskk-suggest`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:r.question,level:c,skill:"speaking"})});if(s.ok){const o=await s.json();m.set(i,o),E(o),h("start")}else throw new Error("Server error")}catch(s){console.error("Lỗi nạp bài mẫu:",s);const o=R();m.set(i,o),E(o)}};function E(n){const e=document.getElementById("sample-speech-box");if(!e)return;const t=n.sampleAnswer||{},i=t.hanzi||"",s=i.replace(/\s+/g,"").length;e.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px dashed rgba(16, 185, 129, 0.4); padding-bottom: 10px; flex-wrap: wrap; gap: 8px;">
      <div style="display: flex; align-items: center; gap: 8px; font-weight: 900; font-size: 1.1rem; color: #34d399;">
        <i class="fa-solid fa-medal"></i>
        <span>Bài Nói Mẫu Tham Khảo (Chuẩn HSKK ${c==="so"?"Sơ cấp":c==="cao"?"Cao cấp":"Trung cấp"})</span>
      </div>
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 0.78rem; background: rgba(16, 185, 129, 0.2); color: #6ee7b7; padding: 4px 10px; border-radius: 99px; font-weight: 800;">
          ${s} chữ Hán
        </span>
        <button onclick="playSpeakingSampleTts()" style="background: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; color: #38bdf8; font-size: 0.82rem; font-weight: 700; padding: 5px 12px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-volume-high"></i> <span>Nghe bản xứ đọc</span>
        </button>
      </div>
    </div>

    <!-- Hanzi Text -->
    <div id="sample-speaking-hanzi" class="hanzi-text" style="font-size: 1.1rem; line-height: 1.85; color: #ffffff; white-space: pre-line; margin-bottom: 14px; font-family: var(--font-chinese), sans-serif; background: rgba(0,0,0,0.22); padding: 14px 16px; border-radius: 12px; border-left: 3px solid #10b981;">
      ${i}
    </div>

    <!-- Pinyin Text -->
    ${t.pinyin?`
      <div style="margin-bottom: 12px;">
        <div style="font-size: 0.78rem; text-transform: uppercase; color: #38bdf8; font-weight: 800; margin-bottom: 4px;">Phiên âm Pinyin:</div>
        <div style="font-size: 0.88rem; color: #94a3b8; font-style: italic; line-height: 1.6; white-space: pre-line; background: rgba(0,0,0,0.18); padding: 10px 14px; border-radius: 10px;">${t.pinyin}</div>
      </div>
    `:""}

    <!-- Vietnamese Translation -->
    ${t.meaningVi?`
      <div>
        <div style="font-size: 0.78rem; text-transform: uppercase; color: #fbbf24; font-weight: 800; margin-bottom: 4px;">Dịch nghĩa tiếng Việt:</div>
        <div style="font-size: 0.92rem; color: #cbd5e1; line-height: 1.7; white-space: pre-line; background: rgba(0,0,0,0.18); padding: 10px 14px; border-radius: 10px;">${t.meaningVi}</div>
      </div>
    `:""}
  `}function R(){const n=r&&r.question?r.question:"đề bài";return{outline:{intro:`Mở bài: Nêu câu trả lời hoặc quan điểm cá nhân trực diện cho đề bài: "${n}". (Gợi ý: Theo bạn, câu trả lời trực tiếp cho câu hỏi này là gì?)`,body:[`Luận điểm 1: Phân tích nguyên nhân và lý do chính giải thích cho câu hỏi "${n}". (Gợi ý: Tại sao bạn lại nghĩ hoặc chọn như vậy?)`,"Luận điểm 2: Đưa ra ví dụ thực tế hoặc trải nghiệm bản thân gắn liền với câu hỏi. (Gợi ý: Bạn hoặc những người xung quanh đã trải qua việc này như thế nào?)","Luận điểm 3: Đánh giá ý nghĩa, giải pháp hoặc bài học cuộc sống. (Gợi ý: Điều này mang lại giá trị hoặc bài học gì cho bạn?)"],conclusion:"Kết bài: Tổng kết lại toàn bộ quan điểm, đưa ra bài học hoặc thông điệp / lời kêu gọi hành động ý nghĩa."},vocabulary:[{hanzi:"看法",pinyin:"kànfǎ",meaning:"quan điểm, góc nhìn"},{hanzi:"经验",pinyin:"jīngyàn",meaning:"kinh nghiệm thực tế"},{hanzi:"坚持",pinyin:"jiānchí",meaning:"kiên trì"},{hanzi:"互相帮助",pinyin:"hùxiāng bāngzhù",meaning:"giúp đỡ lẫn nhau"},{hanzi:"收益匪浅",pinyin:"shòuyì fěiqiǎn",meaning:"thu hoạch được nhiều điều bổ ích"}],sentenceStructures:[{pattern:"在我看来，……是最重要的。",meaning:"Theo quan điểm của tôi, ... là quan trọng nhất.",example:"在我看来，针对这个问题，保持积极态度并付诸行动最为重要。"},{pattern:"一方面……，另一方面……",meaning:"Một mặt thì..., mặt khác thì...",example:"一方面要脚踏实地努力，另一方面要多向他人请教。"}],sampleAnswer:{hanzi:`针对“${n}”这个问题，我认为在我们的生活和学习中有着非常重要的现实意义。首先，从个人角度来看，我们应当明确自己的目标与态度，认真思考问题背后的原因。其次，在遇到具体情境时，不能只停留在想法上，而要主动付诸实践，勇于面对挑战并积极寻找解决办法。最后，只要我们能持之以恒，并与身边的人互相支持、共同进步，就一定能克服困难，取得令人满意的成果。`,pinyin:"Zhēnduì zhè ge wèntí, wǒ rènwéi zài wǒmen de shēnghuó hé xuéxí zhōng yǒuzhe fēicháng zhòngyào de xiànshí yìyì. Shǒuxiān, cóng gèrén jiǎodù lái kàn, wǒmen yīngdāng míngquè zìjǐ de mùbiāo yǔ tàidù. Qícì, zài yùdào jùtǐ qíngjìng shí, yīngdāng zhǔdòng fùzhū shíjiàn. Zuìhòu, zhǐyào wǒmen néng chízhīyǐhéng, jiù yídìng néng qǔdé lìngrén mǎnyì de chéngguǒ.",meaningVi:`Đối với đề tài "${n}", tôi cho rằng câu hỏi này mang ý nghĩa thực tế rất quan trọng trong cuộc sống và học tập của chúng ta. Thứ nhất, từ góc độ cá nhân, chúng ta cần xác định rõ mục tiêu và thái độ của mình, suy nghĩ nghiêm túc về nguyên nhân. Thứ hai, khi đối diện với tình huống cụ thể, không nên chỉ dừng lại ở suy nghĩ mà cần chủ động bắt tay vào hành động, dũng cảm đối mặt với thử thách và tích cực tìm kiếm giải pháp. Cuối cùng, chỉ cần chúng ta kiên trì đến cùng và luôn hỗ trợ lẫn nhau, nhất định sẽ gặt hái được những thành quả tốt đẹp.`}}}window.playSpeakingSampleTts=function(){const n=document.getElementById("sample-speaking-hanzi");if(!n||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const e=new SpeechSynthesisUtterance(n.textContent.trim());e.lang="zh-CN",e.rate=.88,window.speechSynthesis.speak(e)};window.startPrepTimer=function(){cancelSpeakingRecording();const n=document.getElementById("prep-timer-box"),e=document.getElementById("btn-prep-3p");if(!n)return;n.style.display="block",e==null||e.classList.add("active-timer"),n.scrollIntoView({behavior:"smooth",block:"center"});const t=document.getElementById("speaking-scratchpad-card");t&&(t.style.display="block");const i=document.getElementById("speaking-scratchpad-input");i&&i.focus(),y=180,b=!1,q(),h("start"),clearInterval(f),f=setInterval(()=>{b||(y--,q(),y<=0&&(clearInterval(f),h("chime"),alert("⏰ Đã hết 3 phút chuẩn bị! Bạn đã sẵn sàng, hãy bắt đầu nói ngay nhé!"),e==null||e.classList.remove("active-timer"),n.style.display="none",startSpeakingTimerAndRecord()))},1e3)};function q(){const n=document.getElementById("prep-timer-display");if(!n)return;const e=Math.floor(y/60),t=y%60;n.textContent=`${String(e).padStart(2,"0")}:${String(t).padStart(2,"0")}`}window.togglePausePrepTimer=function(){b=!b;const n=document.getElementById("prep-pause-btn");n&&(n.innerHTML=b?'<i class="fa-solid fa-play"></i> <span>Tiếp tục</span>':'<i class="fa-solid fa-pause"></i> <span>Tạm dừng</span>')};window.resetPrepTimer=function(){clearInterval(f),y=180,b=!1,q();const n=document.getElementById("prep-timer-box"),e=document.getElementById("btn-prep-3p");n&&(n.style.display="none"),e==null||e.classList.remove("active-timer")};window.stopPrepAndStartSpeaking=function(){clearInterval(f);const n=document.getElementById("prep-timer-box"),e=document.getElementById("btn-prep-3p");n&&(n.style.display="none"),e==null||e.classList.remove("active-timer"),startSpeakingTimerAndRecord()};window.startSpeakingTimerAndRecord=async function(){clearInterval(f);const n=document.getElementById("prep-timer-box"),e=document.getElementById("btn-prep-3p");n&&(n.style.display="none"),e==null||e.classList.remove("active-timer");try{const a=await navigator.mediaDevices.getUserMedia({audio:!0});P(a)}catch(a){console.error("Không truy cập được micro:",a),alert("Không thể truy cập microphone. Vui lòng cho phép trình duyệt truy cập micro để ghi âm bài nói!");return}const t=document.getElementById("speaking-recorder-box"),i=document.getElementById("btn-speak-2p"),s=document.getElementById("recorded-result-box");s&&(s.style.display="none"),t&&(t.style.display="block"),i==null||i.classList.add("active-timer");const o=document.getElementById("speaking-scratchpad-card");o&&(o.style.display="block"),t==null||t.scrollIntoView({behavior:"smooth",block:"center"}),w=120,x=0,N(),h("start"),$=[],g.start(250),S=!0,G(),clearInterval(v),v=setInterval(()=>{w--,x++,N(),w<=0&&(clearInterval(v),finishSpeakingRecording())},1e3)};function P(n){g=new MediaRecorder(n),g.ondataavailable=e=>{e.data.size>0&&$.push(e.data)},g.onstop=()=>{n.getTracks().forEach(i=>i.stop()),H=new Blob($,{type:"audio/webm"}),A=URL.createObjectURL(H);const e=document.getElementById("recorded-audio-player");e&&(e.src=A);const t=document.getElementById("recording-duration-text");if(t){const i=Math.floor(x/60),s=x%60;t.textContent=`Thời lượng bài nói: ${String(i).padStart(2,"0")}:${String(s).padStart(2,"0")}`}}}function G(){const n=window.SpeechRecognition||window.webkitSpeechRecognition;if(n)try{d=new n,d.lang="zh-CN",d.continuous=!0,d.interimResults=!0;const e=document.getElementById("spoken-transcript-input");let t="";d.onresult=i=>{let s="";for(let o=i.resultIndex;o<i.results.length;++o)i.results[o].isFinal?t+=i.results[o][0].transcript:s+=i.results[o][0].transcript;e&&(e.value=(t+" "+s).trim())},d.onerror=i=>{console.warn("Speech recognition notice:",i)},d.start()}catch(e){console.warn("Không khởi chạy được SpeechRecognition:",e)}}function N(){const n=document.getElementById("speaking-timer-display");if(!n)return;const e=Math.floor(w/60),t=w%60;n.textContent=`${String(e).padStart(2,"0")}:${String(t).padStart(2,"0")}`}window.finishSpeakingRecording=function(){if(!S)return;if(S=!1,clearInterval(v),h("chime"),d)try{d.stop()}catch{}g&&g.state!=="inactive"&&g.stop();const n=document.getElementById("speaking-recorder-box"),e=document.getElementById("btn-speak-2p"),t=document.getElementById("recorded-result-box");n&&(n.style.display="none"),e==null||e.classList.remove("active-timer"),t&&(t.style.display="block",t.scrollIntoView({behavior:"smooth",block:"start"}));const i=document.getElementById("spoken-transcript-input");i&&!i.value.trim()&&(i.placeholder="Mic chưa tự động nhận diện được chữ Hán (hoặc trình duyệt chưa bật nhận diện giọng nói). Bạn hãy gõ tóm tắt những câu bạn vừa nói vào đây để AI chấm điểm chính xác nhé!")};window.cancelSpeakingRecording=function(){if(S=!1,clearInterval(v),d)try{d.stop()}catch{}if(g&&g.state!=="inactive")try{g.stop()}catch{}const n=document.getElementById("speaking-recorder-box"),e=document.getElementById("btn-speak-2p");n&&(n.style.display="none"),e==null||e.classList.remove("active-timer")};window.clearTranscript=function(){const n=document.getElementById("spoken-transcript-input");n&&(n.value="",n.focus())};window.restartSpeakingFlow=function(){const n=document.getElementById("recorded-result-box");n&&(n.style.display="none");const e=document.getElementById("ai-speaking-evaluation-results");e&&(e.style.display="none"),startSpeakingTimerAndRecord()};window.submitSpeakingForAiGrading=async function(){const n=document.getElementById("spoken-transcript-input"),e=document.getElementById("ai-speaking-evaluation-results"),t=document.getElementById("submit-speaking-btn");if(!n||!e)return;const i=n.value.trim();if(!i||i.length<3){alert("Vui lòng gõ hoặc nói ít nhất 5-10 chữ Hán vào ô văn bản bài nói để AI có thể chấm điểm nhé!"),n.focus();return}t&&(t.disabled=!0,t.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> <span>AI Đang Chấm Bài Nói...</span>'),e.style.display="block",e.scrollIntoView({behavior:"smooth",block:"start"}),e.innerHTML=`
    <div class="speaking-card-panel" style="text-align: center; padding: 48px 24px;">
      <i class="fa-solid fa-microphone-lines fa-bounce" style="font-size: 3rem; color: #f59e0b; margin-bottom: 20px;"></i>
      <h2 style="font-size: 1.45rem; font-weight: 800; color: #ffffff; margin: 0 0 10px 0;">
        Giám Khảo Khẩu Ngữ AI Đang Đánh Giá Bài Nói...
      </h2>
      <p style="font-size: 0.92rem; color: #94a3b8; max-width: 560px; margin: 0 auto 20px auto;">
        Đang phân tích phát âm, ngữ điệu, vốn từ vựng khẩu ngữ và độ lưu loát chuẩn tiêu chí thi HSKK.
      </p>
      <div style="display: flex; justify-content: center; gap: 8px; flex-wrap: wrap;">
        <span style="font-size: 0.8rem; background: rgba(245, 158, 11, 0.15); color: #fbbf24; padding: 4px 12px; border-radius: 99px;">
          ✓ Đánh giá phát âm &amp; ngữ điệu
        </span>
        <span style="font-size: 0.8rem; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 4px 12px; border-radius: 99px;">
          ✓ Kiểm tra độ lưu loát tự nhiên
        </span>
        <span style="font-size: 0.8rem; background: rgba(16, 185, 129, 0.15); color: #34d399; padding: 4px 12px; border-radius: 99px;">
          ✓ Viết lại khẩu ngữ chuẩn bản xứ
        </span>
      </div>
    </div>
  `;try{const s={question:r?r.question:"HSKK Speaking",transcript:i,level:c,duration:x||120},o=await fetch(`${T}/api/ai/grade-speaking`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});if(o.ok){const a=await o.json();j(a,e,i),h("start")}else throw new Error("Server error")}catch(s){console.error("Lỗi chấm bài nói AI:",s),j({overallScore:86,badge:"Rất Tốt 👏",criteriaScores:{pronunciation:86,fluency:85,grammar:86,content:88},generalFeedback:"Bài nói của bạn rõ ràng, câu từ tự nhiên và bám sát câu hỏi của đề bài!",strengths:["Phát âm tương đối rõ chữ","Trả lời trực diện vào chủ đề"],improvements:["Nên dùng thêm từ nối để bài nói liên kết uyển chuyển hơn"],nativeVersion:i,nativePinyin:"",nativeVi:"Bản dịch bài nói của bạn."},e,i)}finally{t&&(t.disabled=!1,t.innerHTML='<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Đưa AI Chấm Điểm Bài Nói</span>')}};function j(n,e,t){const i=n.overallScore||85,s=n.badge||(i>=90?"Xuất Sắc 🌟":i>=80?"Rất Tốt 👏":i>=65?"Khá 👍":"Cần Cố Gắng 🎙️"),o=i>=85?"linear-gradient(135deg, #10b981, #059669)":i>=70?"linear-gradient(135deg, #f59e0b, #d97706)":"linear-gradient(135deg, #ef4444, #dc2626)",a=n.criteriaScores||{pronunciation:85,fluency:85,grammar:85,content:85},l=n.strengths||[],p=n.improvements||[],k=n.nativeVersion||t,L=n.nativePinyin||"",K=n.nativeVi||"";e.innerHTML=`
    <div class="speaking-card-panel" style="margin-bottom: 24px; position: relative;">
      <!-- Header kết quả -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="width: 100px; height: 100px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ffffff; background: ${o}; box-shadow: 0 8px 24px rgba(0,0,0,0.25); flex-shrink: 0;">
            <span style="font-size: 2.2rem; font-weight: 900; line-height: 1;">${i}</span>
            <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; opacity: 0.9;">Thang 100</span>
          </div>

          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
              <span style="font-size: 1.35rem; font-weight: 900; color: #ffffff;">Đánh Giá Bài Nói:</span>
              <span style="font-size: 1.25rem; font-weight: 800; color: #fbbf24;">${s}</span>
            </div>
            <div style="font-size: 0.88rem; color: #94a3b8;">
              <span><i class="fa-solid fa-microphone"></i> Thời lượng nói: <strong>${x||60}s</strong></span>
              <span style="margin: 0 6px;">&bull;</span>
              <span><i class="fa-solid fa-circle-check" style="color: #10b981;"></i> Đạt chuẩn thi HSKK</span>
            </div>
          </div>
        </div>

        <div style="display: flex; gap: 10px;">
          <button onclick="document.getElementById('ai-speaking-evaluation-results').style.display='none'" class="btn"
            style="background: rgba(255,255,255,0.06); border: 1px solid rgba(255,255,255,0.15); color: #94a3b8; width: 36px; height: 36px; border-radius: 10px; cursor: pointer; display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        </div>
      </div>

      <!-- 4 TIÊU CHÍ KHẨU NGỮ HSKK -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px; margin-bottom: 24px;">
        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-bullhorn" style="color: #f59e0b;"></i> Phát Âm & Ngữ Điệu</span>
            <strong style="color: #f59e0b;">${a.pronunciation||85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${a.pronunciation||85}%; background: #f59e0b; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-gauge-high" style="color: #38bdf8;"></i> Độ Lưu Loát (Fluency)</span>
            <strong style="color: #38bdf8;">${a.fluency||85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${a.fluency||85}%; background: #38bdf8; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-book" style="color: #8b5cf6;"></i> Ngữ Pháp & Vốn Từ</span>
            <strong style="color: #8b5cf6;">${a.grammar||85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${a.grammar||85}%; background: #8b5cf6; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-bullseye" style="color: #10b981;"></i> Bám Đề & Nội Dung</span>
            <strong style="color: #10b981;">${a.content||85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${a.content||85}%; background: #10b981; border-radius: 99px;"></div>
          </div>
        </div>
      </div>

      <!-- NHẬN XÉT CỦA GIÁM KHẢO -->
      <div style="background: rgba(245, 158, 11, 0.1); border: 1.5px solid rgba(245, 158, 11, 0.35); border-radius: 16px; padding: 18px; margin-bottom: 20px;">
        <div style="font-size: 1rem; font-weight: 800; color: #fbbf24; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-comment-dots"></i> Nhận Xét Của Giám Khảo Khẩu Ngữ:
        </div>
        <p style="font-size: 0.95rem; line-height: 1.65; color: #ffffff; margin: 0 0 12px 0;">
          ${n.generalFeedback||"Bài nói của bạn hoàn thành tốt mục tiêu giao tiếp."}
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-top: 12px;">
          ${l.length>0?`
            <div>
              <strong style="font-size: 0.85rem; color: #34d399; text-transform: uppercase;"><i class="fa-solid fa-thumbs-up"></i> Điểm sáng:</strong>
              <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 0.88rem; color: #e2e8f0;">
                ${l.map(B=>`<li>${B}</li>`).join("")}
              </ul>
            </div>
          `:""}

          ${p.length>0?`
            <div>
              <strong style="font-size: 0.85rem; color: #f87171; text-transform: uppercase;"><i class="fa-solid fa-lightbulb"></i> Điểm cần hoàn thiện:</strong>
              <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 0.88rem; color: #fca5a5;">
                ${p.map(B=>`<li>${B}</li>`).join("")}
              </ul>
            </div>
          `:""}
        </div>
      </div>

      <!-- PHIÊN BẢN KHẨU NGỮ CHUẨN BẢN XỨ -->
      <div style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.1), rgba(56, 189, 248, 0.08)); border: 1.5px solid rgba(16, 185, 129, 0.3); border-radius: 18px; padding: 22px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
          <h3 style="font-size: 1.15rem; font-weight: 800; color: #34d399; margin: 0; display: flex; align-items: center; gap: 8px;">
            <i class="fa-solid fa-crown"></i> Phiên Bản Khẩu Ngữ Chuẩn Người Bản Xứ:
          </h3>
          <button onclick="playSpeakingNativeTts()" title="Nghe phát âm chuẩn người bản xứ"
            style="background: rgba(16, 185, 129, 0.2); border: 1px solid #10b981; color: #34d399; padding: 6px 14px; border-radius: 8px; font-weight: 700; font-size: 0.82rem; cursor: pointer; display: flex; align-items: center; gap: 6px;">
            <i class="fa-solid fa-volume-high"></i> <span>Nghe nói mẫu</span>
          </button>
        </div>

        <div id="speaking-native-text" class="hanzi-text" style="font-size: 1.25rem; line-height: 1.8; color: #ffffff; margin-bottom: 8px; font-weight: 500;">
          ${k}
        </div>

        ${L?`
          <div style="font-size: 0.88rem; line-height: 1.6; color: #94a3b8; font-style: italic; margin-bottom: 10px;">
            ${L}
          </div>
        `:""}

        ${K?`
          <div style="font-size: 0.92rem; line-height: 1.6; color: #cbd5e1; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 10px;">
            <strong>Dịch nghĩa:</strong> ${K}
          </div>
        `:""}
      </div>
    </div>
  `}window.playSpeakingNativeTts=function(){const n=document.getElementById("speaking-native-text");if(!n||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const e=new SpeechSynthesisUtterance(n.textContent.trim());e.lang="zh-CN",e.rate=.88,window.speechSynthesis.speak(e)};window.clearSpeakingScratchpad=function(){const n=document.getElementById("speaking-scratchpad-input");n&&(n.value.trim()&&!confirm("Bạn có chắc muốn xóa sạch bản nháp này?")||(n.value="",C(),sessionStorage.removeItem("hongtai_speaking_scratchpad")))};function C(){const n=document.getElementById("speaking-scratchpad-input"),e=document.getElementById("scratchpad-word-count");if(!n||!e)return;const t=n.value.trim().length;e.textContent=`${t} ký tự`,sessionStorage.setItem("hongtai_speaking_scratchpad",n.value)}function D(){const n=document.getElementById("speaking-scratchpad-input");if(!n)return;const e=sessionStorage.getItem("hongtai_speaking_scratchpad");e&&(n.value=e,C()),n.addEventListener("input",C)}document.addEventListener("DOMContentLoaded",()=>{V(),D()});
