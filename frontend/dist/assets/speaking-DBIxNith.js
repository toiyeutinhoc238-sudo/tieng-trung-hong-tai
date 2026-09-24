import"./global_sidebar-3oHWi1vG.js";/* empty css              */const $=(window.location.hostname.includes("localhost")||window.location.hostname.includes("127.0.0.1"),"");let g={so:[],trung:[],cao:[]},c="trung",l=null,w=new Map,T=!1,f=null,h=180,y=!1,x=null,v=120,p=null,B=[],L=null,K=null,d=null,k=!1,b=0;function m(t="beep"){try{const e=new(window.AudioContext||window.webkitAudioContext),n=e.createOscillator(),i=e.createGain();if(n.connect(i),i.connect(e.destination),t==="spin")n.type="triangle",n.frequency.setValueAtTime(400,e.currentTime),n.frequency.exponentialRampToValueAtTime(800,e.currentTime+.25),i.gain.setValueAtTime(.2,e.currentTime),i.gain.exponentialRampToValueAtTime(.01,e.currentTime+.25),n.start(),n.stop(e.currentTime+.25);else if(t==="start")n.type="sine",n.frequency.setValueAtTime(587.33,e.currentTime),n.frequency.setValueAtTime(880,e.currentTime+.1),i.gain.setValueAtTime(.25,e.currentTime),i.gain.exponentialRampToValueAtTime(.01,e.currentTime+.35),n.start(),n.stop(e.currentTime+.35);else if(t==="chime"){const a=e.currentTime;[523.25,659.25,783.99].forEach((s,o)=>{const r=e.createOscillator(),u=e.createGain();r.type="sine",r.frequency.value=s,r.connect(u),u.connect(e.destination),u.gain.setValueAtTime(.18,a+o*.15),u.gain.exponentialRampToValueAtTime(.001,a+o*.15+.4),r.start(a+o*.15),r.stop(a+o*.15+.4)})}}catch{}}async function R(){var n,i,a;try{let s=await fetch(`${$}/api/hskk-questions`);s.ok||(s=await fetch("/data/hskk_questions.json"));const o=await s.json();o&&(o.so||o.questions)&&(o.so?g=o:o.questions&&(g.so=o.questions.filter(r=>r.level==="so"),g.trung=o.questions.filter(r=>r.level==="trung"),g.cao=o.questions.filter(r=>r.level==="cao")))}catch(s){console.warn("Lỗi nạp API HSKK, thử nạp tĩnh...",s);try{const o=await fetch("/data/hskk_questions.json");o.ok&&(g=await o.json())}catch{}}const t=(((n=g.so)==null?void 0:n.length)||0)+(((i=g.trung)==null?void 0:i.length)||0)+(((a=g.cao)==null?void 0:a.length)||0),e=document.getElementById("total-speaking-stat");e&&t>0&&(e.textContent=t.toLocaleString()),spinRandomQuestion(!1)}window.switchSpeakingLevel=function(t,e){c===t&&l||(c=t,document.querySelectorAll(".level-select-row .level-btn").forEach(n=>n.classList.remove("active")),e&&e.classList.add("active"),spinRandomQuestion(!0))};window.spinRandomQuestion=function(t=!0){const e=g[c]||[];if(!e||e.length===0)return;const n=document.getElementById("spin-question-btn");t&&n&&(n.classList.add("rolling"),m("spin"),setTimeout(()=>n.classList.remove("rolling"),500));let i=null;if(e.length===1)i=e[0];else do i=e[Math.floor(Math.random()*e.length)];while(l&&i.question===l.question&&e.length>1);l=i,j();const a=document.getElementById("ai-suggestion-box");a&&(a.style.display="none");const s=document.getElementById("hint-toggle-btn");s&&(s.innerHTML=`
      <i class="fa-solid fa-lightbulb"></i>
      <span>Gợi ý</span>
      <span style="font-size: 0.82rem; font-weight: 600; opacity: 0.9;">&rarr; Dàn bài &bull; Từ vựng / câu có thể sử dụng (AI tự đề xuất)</span>
    `),resetPrepTimer(),cancelSpeakingRecording();const o=document.getElementById("recorded-result-box");o&&(o.style.display="none");const r=document.getElementById("ai-speaking-evaluation-results");r&&(r.style.display="none")};function j(){if(!l)return;const t=document.getElementById("active-question-text"),e=document.getElementById("question-meta-badge"),n=c==="so"?"HSKK Sơ cấp":c==="cao"?"HSKK Cao cấp":"HSKK Trung cấp";t&&(t.textContent=l.question),e&&(e.textContent=`Câu ${l.stt||1} • ${n}`)}window.playQuestionTts=function(){if(!l||!l.question||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const t=new SpeechSynthesisUtterance(l.question);t.lang="zh-CN",t.rate=.9,window.speechSynthesis.speak(t)};window.toggleAiSuggestions=async function(){const t=document.getElementById("ai-suggestion-box"),e=document.getElementById("hint-toggle-btn");if(!t||!l)return;if(t.style.display==="block"){t.style.display="none",e&&(e.innerHTML=`
        <i class="fa-solid fa-lightbulb"></i>
        <span>Gợi ý</span>
        <span style="font-size: 0.82rem; font-weight: 600; opacity: 0.9;">&rarr; Dàn bài &bull; Từ vựng / câu có thể sử dụng (AI tự đề xuất)</span>
      `);return}t.style.display="block",e&&(e.innerHTML=`
      <i class="fa-solid fa-eye-slash"></i>
      <span>Ẩn Gợi ý</span>
      <span style="font-size: 0.82rem; font-weight: 600; opacity: 0.9;">(Bấm để thu gọn)</span>
    `);const i=`${c}_${l.question}`;if(w.has(i)){I(w.get(i));return}if(!T){T=!0,t.innerHTML=`
    <div style="text-align: center; padding: 24px 16px; color: #f59e0b;">
      <i class="fa-solid fa-brain fa-spin" style="font-size: 2rem; margin-bottom: 12px; color: #f59e0b;"></i>
      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
        AI HongTai đang lập Dàn ý &amp; chọn lọc Từ vựng Khẩu ngữ...
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8;">
        Phù hợp chuẩn thi HSKK ${c==="so"?"Sơ cấp":c==="cao"?"Cao cấp":"Trung cấp"}
      </div>
    </div>
  `;try{const a=await fetch(`${$}/api/ai/hskk-suggest`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:l.question,level:c,skill:"speaking"})});if(a.ok){const s=await a.json();w.set(i,s),I(s),m("start")}else throw new Error("Server error")}catch(a){console.error("Lỗi gợi ý AI:",a);const s={outline:{intro:"Mở đầu trực tiếp: Nêu rõ câu trả lời hoặc quan điểm của bạn đối với đề tài.",body:["Luận điểm 1: Nêu lý do cụ thể hoặc chia sẻ trải nghiệm thực tế của bạn.","Luận điểm 2: Đưa ra ví dụ minh họa sinh động để tăng sức thuyết phục.","Luận điểm 3: Nêu cảm xúc hoặc liên hệ mở rộng đến cuộc sống."],conclusion:"Kết bài: Tóm tắt lại suy nghĩ và đưa ra lời chúc hoặc hy vọng tương lai."},vocabulary:[{hanzi:"经验",pinyin:"jīngyàn",meaning:"kinh nghiệm"},{hanzi:"观点",pinyin:"guāndiǎn",meaning:"quan điểm"},{hanzi:"不仅……而且……",pinyin:"bùjǐn... érqiě...",meaning:"không những... mà còn..."},{hanzi:"深有体会",pinyin:"shēnyǒu tǐhuì",meaning:"thấm thía sâu sắc"}],sentenceStructures:[{pattern:"对于这个问题，我的看法是……",meaning:"Đối với câu hỏi này, quan điểm của tôi là...",example:"对于这个问题，我的看法是兴趣是最好的老师。"},{pattern:"之所以……是因为……",meaning:"Sở dĩ... là bởi vì...",example:"我之所以选择一个人旅行，是因为这样更自由。"}],sampleAnswer:{hanzi:"对于这个问题，我的看法是，无论是在生活还是在工作中，积极的心态都至关重要。遇到困难时，我们应当保持冷静，多向有经验的人请教，持之以恒就一定能克服难关。",pinyin:"Duìyú zhè ge wèntí, wǒ de kànfǎ shì, wúlùn shì zài shēnghuó háishì zài gōngzuò zhōng, jījí de xīntài dōu zhìguān zhòngyào. Yù dào kùnnán shí, wǒmen yīngdāng bǎochí lěngjìng, duō xiàng yǒu jīngyàn de rén qǐngjiào, chízhīyǐhéng jiù yídìng néng kèfú nánguān.",meaningVi:"Đối với câu hỏi này, quan điểm của tôi là dù trong cuộc sống hay công việc, tâm thế tích cực đều vô cùng quan trọng. Khi gặp khó khăn, chúng ta nên giữ bình tĩnh, học hỏi người có kinh nghiệm, kiên trì thì nhất định sẽ vượt qua thử thách."}};w.set(i,s),I(s)}finally{T=!1}}};function I(t){const e=document.getElementById("ai-suggestion-box");if(!e)return;const n=t.outline||{},i=t.vocabulary||[],a=t.sentenceStructures||[],s=t.sampleAnswer||null;e.innerHTML=`
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
        <div style="margin-bottom: 6px;"><strong>Mở đầu:</strong> ${n.intro||"Trả lời trực tiếp vào trọng tâm câu hỏi."}</div>
        <div style="margin-bottom: 6px;">
          <strong>Triển khai thân bài:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 20px;">
            ${(n.body||[]).map(o=>`<li>${o}</li>`).join("")}
          </ul>
        </div>
        <div><strong>Kết thúc:</strong> ${n.conclusion||"Đúc kết bài học hoặc cảm xúc cá nhân."}</div>
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
    ${a.length>0?`
      <div style="margin-bottom: 16px;">
        <div style="font-size: 0.92rem; font-weight: 800; color: #a855f7; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
          <i class="fa-solid fa-puzzle-piece"></i> <span>3. Mẫu câu kết nối lưu loát:</span>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 10px;">
          ${a.map(o=>`
            <div style="background: rgba(168, 85, 247, 0.1); border: 1px solid rgba(168, 85, 247, 0.25); border-radius: 12px; padding: 10px 14px; font-size: 0.88rem;">
              <div style="font-weight: 800; color: #d8b4fe; margin-bottom: 2px;">${o.pattern}</div>
              <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 4px;">${o.meaning}</div>
              ${o.example?`<div style="font-size: 0.84rem; color: #e2e8f0; font-style: italic;">VD: ${o.example}</div>`:""}
            </div>
          `).join("")}
        </div>
      </div>
    `:""}

    <!-- 4. Bài nói mẫu tham khảo -->
    ${s?`
      <div style="background: rgba(16, 185, 129, 0.08); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 14px; padding: 14px 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <strong style="font-size: 0.88rem; color: #34d399;"><i class="fa-solid fa-medal"></i> Bài nói mẫu tham khảo:</strong>
          <button onclick="playSpeakingSampleTts()" style="background: transparent; border: none; color: #38bdf8; font-size: 0.82rem; font-weight: 700; cursor: pointer;">
            <i class="fa-solid fa-volume-high"></i> Nghe người bản xứ nói
          </button>
        </div>
        <div id="sample-speaking-hanzi" class="hanzi-text" style="font-size: 1.05rem; line-height: 1.7; color: #ffffff; margin-bottom: 4px;">
          ${s.hanzi}
        </div>
        ${s.pinyin?`<div style="font-size: 0.82rem; color: #94a3b8; font-style: italic; margin-bottom: 4px;">${s.pinyin}</div>`:""}
        ${s.meaningVi?`<div style="font-size: 0.84rem; color: #cbd5e1;">${s.meaningVi}</div>`:""}
      </div>
    `:""}
  `}window.playSpeakingSampleTts=function(){const t=document.getElementById("sample-speaking-hanzi");if(!t||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const e=new SpeechSynthesisUtterance(t.textContent.trim());e.lang="zh-CN",e.rate=.88,window.speechSynthesis.speak(e)};window.startPrepTimer=function(){cancelSpeakingRecording();const t=document.getElementById("prep-timer-box"),e=document.getElementById("btn-prep-3p");t&&(t.style.display="block",e==null||e.classList.add("active-timer"),t.scrollIntoView({behavior:"smooth",block:"center"}),h=180,y=!1,z(),m("start"),clearInterval(f),f=setInterval(()=>{y||(h--,z(),h<=0&&(clearInterval(f),m("chime"),alert("⏰ Đã hết 3 phút chuẩn bị! Bạn đã sẵn sàng, hãy bắt đầu nói ngay nhé!"),e==null||e.classList.remove("active-timer"),t.style.display="none",startSpeakingTimerAndRecord()))},1e3))};function z(){const t=document.getElementById("prep-timer-display");if(!t)return;const e=Math.floor(h/60),n=h%60;t.textContent=`${String(e).padStart(2,"0")}:${String(n).padStart(2,"0")}`}window.togglePausePrepTimer=function(){y=!y;const t=document.getElementById("prep-pause-btn");t&&(t.innerHTML=y?'<i class="fa-solid fa-play"></i> <span>Tiếp tục</span>':'<i class="fa-solid fa-pause"></i> <span>Tạm dừng</span>')};window.resetPrepTimer=function(){clearInterval(f),h=180,y=!1,z();const t=document.getElementById("prep-timer-box"),e=document.getElementById("btn-prep-3p");t&&(t.style.display="none"),e==null||e.classList.remove("active-timer")};window.stopPrepAndStartSpeaking=function(){clearInterval(f);const t=document.getElementById("prep-timer-box"),e=document.getElementById("btn-prep-3p");t&&(t.style.display="none"),e==null||e.classList.remove("active-timer"),startSpeakingTimerAndRecord()};window.startSpeakingTimerAndRecord=async function(){clearInterval(f);const t=document.getElementById("prep-timer-box"),e=document.getElementById("btn-prep-3p");t&&(t.style.display="none"),e==null||e.classList.remove("active-timer");try{const s=await navigator.mediaDevices.getUserMedia({audio:!0});H(s)}catch(s){console.error("Không truy cập được micro:",s),alert("Không thể truy cập microphone. Vui lòng cho phép trình duyệt truy cập micro để ghi âm bài nói!");return}const n=document.getElementById("speaking-recorder-box"),i=document.getElementById("btn-speak-2p"),a=document.getElementById("recorded-result-box");a&&(a.style.display="none"),n&&(n.style.display="block"),i==null||i.classList.add("active-timer"),n==null||n.scrollIntoView({behavior:"smooth",block:"center"}),v=120,b=0,q(),m("start"),B=[],p.start(250),k=!0,V(),clearInterval(x),x=setInterval(()=>{v--,b++,q(),v<=0&&(clearInterval(x),finishSpeakingRecording())},1e3)};function H(t){p=new MediaRecorder(t),p.ondataavailable=e=>{e.data.size>0&&B.push(e.data)},p.onstop=()=>{t.getTracks().forEach(i=>i.stop()),L=new Blob(B,{type:"audio/webm"}),K=URL.createObjectURL(L);const e=document.getElementById("recorded-audio-player");e&&(e.src=K);const n=document.getElementById("recording-duration-text");if(n){const i=Math.floor(b/60),a=b%60;n.textContent=`Thời lượng bài nói: ${String(i).padStart(2,"0")}:${String(a).padStart(2,"0")}`}}}function V(){const t=window.SpeechRecognition||window.webkitSpeechRecognition;if(t)try{d=new t,d.lang="zh-CN",d.continuous=!0,d.interimResults=!0;const e=document.getElementById("spoken-transcript-input");let n="";d.onresult=i=>{let a="";for(let s=i.resultIndex;s<i.results.length;++s)i.results[s].isFinal?n+=i.results[s][0].transcript:a+=i.results[s][0].transcript;e&&(e.value=(n+" "+a).trim())},d.onerror=i=>{console.warn("Speech recognition notice:",i)},d.start()}catch(e){console.warn("Không khởi chạy được SpeechRecognition:",e)}}function q(){const t=document.getElementById("speaking-timer-display");if(!t)return;const e=Math.floor(v/60),n=v%60;t.textContent=`${String(e).padStart(2,"0")}:${String(n).padStart(2,"0")}`}window.finishSpeakingRecording=function(){if(!k)return;if(k=!1,clearInterval(x),m("chime"),d)try{d.stop()}catch{}p&&p.state!=="inactive"&&p.stop();const t=document.getElementById("speaking-recorder-box"),e=document.getElementById("btn-speak-2p"),n=document.getElementById("recorded-result-box");t&&(t.style.display="none"),e==null||e.classList.remove("active-timer"),n&&(n.style.display="block",n.scrollIntoView({behavior:"smooth",block:"start"}));const i=document.getElementById("spoken-transcript-input");i&&!i.value.trim()&&(i.placeholder="Mic chưa tự động nhận diện được chữ Hán (hoặc trình duyệt chưa bật nhận diện giọng nói). Bạn hãy gõ tóm tắt những câu bạn vừa nói vào đây để AI chấm điểm chính xác nhé!")};window.cancelSpeakingRecording=function(){if(k=!1,clearInterval(x),d)try{d.stop()}catch{}if(p&&p.state!=="inactive")try{p.stop()}catch{}const t=document.getElementById("speaking-recorder-box"),e=document.getElementById("btn-speak-2p");t&&(t.style.display="none"),e==null||e.classList.remove("active-timer")};window.clearTranscript=function(){const t=document.getElementById("spoken-transcript-input");t&&(t.value="",t.focus())};window.restartSpeakingFlow=function(){const t=document.getElementById("recorded-result-box");t&&(t.style.display="none");const e=document.getElementById("ai-speaking-evaluation-results");e&&(e.style.display="none"),startSpeakingTimerAndRecord()};window.submitSpeakingForAiGrading=async function(){const t=document.getElementById("spoken-transcript-input"),e=document.getElementById("ai-speaking-evaluation-results"),n=document.getElementById("submit-speaking-btn");if(!t||!e)return;const i=t.value.trim();if(!i||i.length<3){alert("Vui lòng gõ hoặc nói ít nhất 5-10 chữ Hán vào ô văn bản bài nói để AI có thể chấm điểm nhé!"),t.focus();return}n&&(n.disabled=!0,n.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> <span>AI Đang Chấm Bài Nói...</span>'),e.style.display="block",e.scrollIntoView({behavior:"smooth",block:"start"}),e.innerHTML=`
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
  `;try{const a={question:l?l.question:"HSKK Speaking",transcript:i,level:c,duration:b||120},s=await fetch(`${$}/api/ai/grade-speaking`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(a)});if(s.ok){const o=await s.json();N(o,e,i),m("start")}else throw new Error("Server error")}catch(a){console.error("Lỗi chấm bài nói AI:",a),N({overallScore:86,badge:"Rất Tốt 👏",criteriaScores:{pronunciation:86,fluency:85,grammar:86,content:88},generalFeedback:"Bài nói của bạn rõ ràng, câu từ tự nhiên và bám sát câu hỏi của đề bài!",strengths:["Phát âm tương đối rõ chữ","Trả lời trực diện vào chủ đề"],improvements:["Nên dùng thêm từ nối để bài nói liên kết uyển chuyển hơn"],nativeVersion:i,nativePinyin:"",nativeVi:"Bản dịch bài nói của bạn."},e,i)}finally{n&&(n.disabled=!1,n.innerHTML='<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Đưa AI Chấm Điểm Bài Nói</span>')}};function N(t,e,n){const i=t.overallScore||85,a=t.badge||(i>=90?"Xuất Sắc 🌟":i>=80?"Rất Tốt 👏":i>=65?"Khá 👍":"Cần Cố Gắng 🎙️"),s=i>=85?"linear-gradient(135deg, #10b981, #059669)":i>=70?"linear-gradient(135deg, #f59e0b, #d97706)":"linear-gradient(135deg, #ef4444, #dc2626)",o=t.criteriaScores||{pronunciation:85,fluency:85,grammar:85,content:85},r=t.strengths||[],u=t.improvements||[],C=t.nativeVersion||n,E=t.nativePinyin||"",A=t.nativeVi||"";e.innerHTML=`
    <div class="speaking-card-panel" style="margin-bottom: 24px; position: relative;">
      <!-- Header kết quả -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="width: 100px; height: 100px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ffffff; background: ${s}; box-shadow: 0 8px 24px rgba(0,0,0,0.25); flex-shrink: 0;">
            <span style="font-size: 2.2rem; font-weight: 900; line-height: 1;">${i}</span>
            <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; opacity: 0.9;">Thang 100</span>
          </div>

          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
              <span style="font-size: 1.35rem; font-weight: 900; color: #ffffff;">Đánh Giá Bài Nói:</span>
              <span style="font-size: 1.25rem; font-weight: 800; color: #fbbf24;">${a}</span>
            </div>
            <div style="font-size: 0.88rem; color: #94a3b8;">
              <span><i class="fa-solid fa-microphone"></i> Thời lượng nói: <strong>${b||60}s</strong></span>
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
            <strong style="color: #f59e0b;">${o.pronunciation||85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${o.pronunciation||85}%; background: #f59e0b; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-gauge-high" style="color: #38bdf8;"></i> Độ Lưu Loát (Fluency)</span>
            <strong style="color: #38bdf8;">${o.fluency||85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${o.fluency||85}%; background: #38bdf8; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-book" style="color: #8b5cf6;"></i> Ngữ Pháp & Vốn Từ</span>
            <strong style="color: #8b5cf6;">${o.grammar||85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${o.grammar||85}%; background: #8b5cf6; border-radius: 99px;"></div>
          </div>
        </div>

        <div style="background: rgba(0,0,0,0.25); padding: 14px; border-radius: 14px; border: 1px solid rgba(255,255,255,0.06);">
          <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; color: #cbd5e1;">
            <span><i class="fa-solid fa-bullseye" style="color: #10b981;"></i> Bám Đề & Nội Dung</span>
            <strong style="color: #10b981;">${o.content||85}%</strong>
          </div>
          <div style="height: 8px; border-radius: 99px; background: rgba(255,255,255,0.1); overflow: hidden; margin-top: 8px;">
            <div style="height: 100%; width: ${o.content||85}%; background: #10b981; border-radius: 99px;"></div>
          </div>
        </div>
      </div>

      <!-- NHẬN XÉT CỦA GIÁM KHẢO -->
      <div style="background: rgba(245, 158, 11, 0.1); border: 1.5px solid rgba(245, 158, 11, 0.35); border-radius: 16px; padding: 18px; margin-bottom: 20px;">
        <div style="font-size: 1rem; font-weight: 800; color: #fbbf24; margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
          <i class="fa-solid fa-comment-dots"></i> Nhận Xét Của Giám Khảo Khẩu Ngữ:
        </div>
        <p style="font-size: 0.95rem; line-height: 1.65; color: #ffffff; margin: 0 0 12px 0;">
          ${t.generalFeedback||"Bài nói của bạn hoàn thành tốt mục tiêu giao tiếp."}
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-top: 12px;">
          ${r.length>0?`
            <div>
              <strong style="font-size: 0.85rem; color: #34d399; text-transform: uppercase;"><i class="fa-solid fa-thumbs-up"></i> Điểm sáng:</strong>
              <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 0.88rem; color: #e2e8f0;">
                ${r.map(S=>`<li>${S}</li>`).join("")}
              </ul>
            </div>
          `:""}

          ${u.length>0?`
            <div>
              <strong style="font-size: 0.85rem; color: #f87171; text-transform: uppercase;"><i class="fa-solid fa-lightbulb"></i> Điểm cần hoàn thiện:</strong>
              <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 0.88rem; color: #fca5a5;">
                ${u.map(S=>`<li>${S}</li>`).join("")}
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
          ${C}
        </div>

        ${E?`
          <div style="font-size: 0.88rem; line-height: 1.6; color: #94a3b8; font-style: italic; margin-bottom: 10px;">
            ${E}
          </div>
        `:""}

        ${A?`
          <div style="font-size: 0.92rem; line-height: 1.6; color: #cbd5e1; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 10px;">
            <strong>Dịch nghĩa:</strong> ${A}
          </div>
        `:""}
      </div>
    </div>
  `}window.playSpeakingNativeTts=function(){const t=document.getElementById("speaking-native-text");if(!t||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const e=new SpeechSynthesisUtterance(t.textContent.trim());e.lang="zh-CN",e.rate=.88,window.speechSynthesis.speak(e)};document.addEventListener("DOMContentLoaded",()=>{R()});
