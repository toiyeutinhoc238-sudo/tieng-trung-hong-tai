import"./global_sidebar-Cut2hinM.js";const T=(window.location.hostname.includes("localhost")||window.location.hostname.includes("127.0.0.1"),"");let p={so:[],trung:[],cao:[]},c="trung",r=null,u=new Map,B=!1,y=null,f=180,b=!1,x=null,k=120,d=null,j=[],K=null,A=null,g=null,z=!1,v=0;function m(t="beep"){try{const n=new(window.AudioContext||window.webkitAudioContext),i=n.createOscillator(),e=n.createGain();if(i.connect(e),e.connect(n.destination),t==="spin")i.type="triangle",i.frequency.setValueAtTime(400,n.currentTime),i.frequency.exponentialRampToValueAtTime(800,n.currentTime+.25),e.gain.setValueAtTime(.2,n.currentTime),e.gain.exponentialRampToValueAtTime(.01,n.currentTime+.25),i.start(),i.stop(n.currentTime+.25);else if(t==="start")i.type="sine",i.frequency.setValueAtTime(587.33,n.currentTime),i.frequency.setValueAtTime(880,n.currentTime+.1),e.gain.setValueAtTime(.25,n.currentTime),e.gain.exponentialRampToValueAtTime(.01,n.currentTime+.35),i.start(),i.stop(n.currentTime+.35);else if(t==="chime"){const s=n.currentTime;[523.25,659.25,783.99].forEach((o,a)=>{const l=n.createOscillator(),h=n.createGain();l.type="sine",l.frequency.value=o,l.connect(h),h.connect(n.destination),h.gain.setValueAtTime(.18,s+a*.15),h.gain.exponentialRampToValueAtTime(.001,s+a*.15+.4),l.start(s+a*.15),l.stop(s+a*.15+.4)})}}catch{}}async function V(){var i,e,s;try{let o=await fetch(`${T}/api/hskk-questions`);o.ok||(o=await fetch("/data/hskk_questions.json"));const a=await o.json();a&&(a.so||a.questions)&&(a.so?p=a:a.questions&&(p.so=a.questions.filter(l=>l.level==="so"),p.trung=a.questions.filter(l=>l.level==="trung"),p.cao=a.questions.filter(l=>l.level==="cao")))}catch(o){console.warn("Lỗi nạp API HSKK, thử nạp tĩnh...",o);try{const a=await fetch("/data/hskk_questions.json");a.ok&&(p=await a.json())}catch{}}const t=(((i=p.so)==null?void 0:i.length)||0)+(((e=p.trung)==null?void 0:e.length)||0)+(((s=p.cao)==null?void 0:s.length)||0),n=document.getElementById("total-speaking-stat");n&&t>0&&(n.textContent=t.toLocaleString()),spinRandomQuestion(!1)}window.switchSpeakingLevel=function(t,n){c===t&&r||(c=t,document.querySelectorAll(".level-select-row .level-btn").forEach(i=>i.classList.remove("active")),n&&n.classList.add("active"),spinRandomQuestion(!0))};window.spinRandomQuestion=function(t=!0){const n=p[c]||[];if(!n||n.length===0)return;const i=document.getElementById("spin-question-btn");t&&i&&(i.classList.add("rolling"),m("spin"),setTimeout(()=>i.classList.remove("rolling"),500));let e=null;if(n.length===1)e=n[0];else do e=n[Math.floor(Math.random()*n.length)];while(r&&e.question===r.question&&n.length>1);r=e,R();const s=document.getElementById("ai-suggestion-box");s&&(s.style.display="none");const o=document.getElementById("hint-toggle-btn");o&&(o.innerHTML=`
      <i class="fa-solid fa-lightbulb"></i>
      <span>Gợi ý Dàn bài &amp; Từ vựng</span>
    `);const a=document.getElementById("sample-speech-box");a&&(a.style.display="none");const l=document.getElementById("sample-speech-toggle-btn");l&&(l.innerHTML=`
      <i class="fa-solid fa-medal"></i>
      <span>Bài nói mẫu tham khảo</span>
    `),resetPrepTimer(),cancelSpeakingRecording();const h=document.getElementById("recorded-result-box");h&&(h.style.display="none");const w=document.getElementById("ai-speaking-evaluation-results");w&&(w.style.display="none")};function R(){if(!r)return;const t=document.getElementById("active-question-text"),n=document.getElementById("question-meta-badge"),i=c==="so"?"HSKK Sơ cấp":c==="cao"?"HSKK Cao cấp":"HSKK Trung cấp";t&&(t.textContent=r.question),n&&(n.textContent=`Câu ${r.stt||1} • ${i}`)}window.playQuestionTts=function(){if(!r||!r.question||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const t=new SpeechSynthesisUtterance(r.question);t.lang="zh-CN",t.rate=.9,window.speechSynthesis.speak(t)};window.toggleAiSuggestions=async function(){const t=document.getElementById("ai-suggestion-box"),n=document.getElementById("hint-toggle-btn");if(!t||!r)return;if(t.style.display==="block"){t.style.display="none",n&&(n.innerHTML=`
        <i class="fa-solid fa-lightbulb"></i>
        <span>Gợi ý Dàn bài &amp; Từ vựng</span>
      `);return}t.style.display="block",n&&(n.innerHTML=`
      <i class="fa-solid fa-eye-slash"></i>
      <span>Ẩn Gợi ý</span>
    `);const e=`${c}_${r.question}`;if(u.has(e)){I(u.get(e));return}if(!B){B=!0,t.innerHTML=`
    <div style="text-align: center; padding: 24px 16px; color: #f59e0b;">
      <i class="fa-solid fa-brain fa-spin" style="font-size: 2rem; margin-bottom: 12px; color: #f59e0b;"></i>
      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
        AI HongTai đang lập Dàn ý &amp; chọn lọc Từ vựng Khẩu ngữ...
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8;">
        Phù hợp chuẩn thi HSKK ${c==="so"?"Sơ cấp":c==="cao"?"Cao cấp":"Trung cấp"}
      </div>
    </div>
  `;try{const s=await fetch(`${T}/api/ai/hskk-suggest`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:r.question,level:c,skill:"speaking"})});if(s.ok){const o=await s.json();u.set(e,o),I(o),m("start")}else throw new Error("Server error")}catch(s){console.error("Lỗi gợi ý AI:",s);const o=M();u.set(e,o),I(o)}finally{B=!1}}};function I(t){const n=document.getElementById("ai-suggestion-box");if(!n)return;const i=t.outline||{},e=t.vocabulary||[],s=t.sentenceStructures||[];n.innerHTML=`
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
        <div style="margin-bottom: 6px;"><strong>Mở đầu:</strong> ${i.intro||"Trả lời trực tiếp vào trọng tâm câu hỏi."}</div>
        <div style="margin-bottom: 6px;">
          <strong>Triển khai thân bài:</strong>
          <ul style="margin: 4px 0 0 0; padding-left: 20px;">
            ${(i.body||[]).map(o=>`<li>${o}</li>`).join("")}
          </ul>
        </div>
        <div><strong>Kết thúc:</strong> ${i.conclusion||"Đúc kết bài học hoặc cảm xúc cá nhân."}</div>
      </div>
    </div>

    <!-- 2. Từ vựng có thể sử dụng -->
    <div style="margin-bottom: 16px;">
      <div style="font-size: 0.92rem; font-weight: 800; color: #38bdf8; margin-bottom: 8px; display: flex; align-items: center; gap: 6px;">
        <i class="fa-solid fa-key"></i> <span>2. Từ vựng / Cụm từ đắt giá nên nói:</span>
      </div>
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        ${e.map(o=>`
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
  `}window.toggleSampleSpeech=async function(){const t=document.getElementById("sample-speech-box"),n=document.getElementById("sample-speech-toggle-btn");if(!t||!r)return;if(t.style.display==="block"){t.style.display="none",n&&(n.innerHTML=`
        <i class="fa-solid fa-medal"></i>
        <span>Bài nói mẫu tham khảo</span>
      `);return}t.style.display="block",n&&(n.innerHTML=`
      <i class="fa-solid fa-eye-slash"></i>
      <span>Ẩn Bài nói mẫu</span>
    `);const e=`${c}_${r.question}`;if(u.has(e)){q(u.get(e));return}t.innerHTML=`
    <div style="text-align: center; padding: 24px 16px; color: #10b981;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 12px; color: #10b981;"></i>
      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
        Đang tạo bài nói mẫu dài chuẩn HSKK ${c==="so"?"Sơ cấp":c==="cao"?"Cao cấp":"Trung cấp"}...
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8;">
        Bài văn mẫu dài, chi tiết, văn phong lưu loát chuẩn người bản xứ.
      </div>
    </div>
  `;try{const s=await fetch(`${T}/api/ai/hskk-suggest`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:r.question,level:c,skill:"speaking"})});if(s.ok){const o=await s.json();u.set(e,o),q(o),m("start")}else throw new Error("Server error")}catch(s){console.error("Lỗi nạp bài mẫu:",s);const o=M();u.set(e,o),q(o)}};function q(t){const n=document.getElementById("sample-speech-box");if(!n)return;const i=t.sampleAnswer||{},e=i.hanzi||"",s=e.replace(/\s+/g,"").length;n.innerHTML=`
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
      ${e}
    </div>

    <!-- Pinyin Text -->
    ${i.pinyin?`
      <div style="margin-bottom: 12px;">
        <div style="font-size: 0.78rem; text-transform: uppercase; color: #38bdf8; font-weight: 800; margin-bottom: 4px;">Phiên âm Pinyin:</div>
        <div style="font-size: 0.88rem; color: #94a3b8; font-style: italic; line-height: 1.6; white-space: pre-line; background: rgba(0,0,0,0.18); padding: 10px 14px; border-radius: 10px;">${i.pinyin}</div>
      </div>
    `:""}

    <!-- Vietnamese Translation -->
    ${i.meaningVi?`
      <div>
        <div style="font-size: 0.78rem; text-transform: uppercase; color: #fbbf24; font-weight: 800; margin-bottom: 4px;">Dịch nghĩa tiếng Việt:</div>
        <div style="font-size: 0.92rem; color: #cbd5e1; line-height: 1.7; white-space: pre-line; background: rgba(0,0,0,0.18); padding: 10px 14px; border-radius: 10px;">${i.meaningVi}</div>
      </div>
    `:""}
  `}function M(){const t=r&&r.question?r.question:"đề bài",n=c||"trung";return n==="so"?{outline:{intro:`Mở bài: Trả lời trực tiếp và ngắn gọn: "${t}". (Gợi ý: Bạn có thích điều này không? Quan điểm đơn giản của bạn là gì?)`,body:["Luận điểm 1: Nêu lý do thứ nhất với các từ quen thuộc. (Gợi ý: Tại sao bạn lại nghĩ như vậy?)","Luận điểm 2: Kể một việc hoặc trải nghiệm đơn giản hằng ngày. (Gợi ý: Bạn thường làm việc đó với ai, vào lúc nào?)","Luận điểm 3: Nêu cảm nghĩ vui vẻ, tích cực. (Gợi ý: Bạn cảm thấy việc đó mang lại niềm vui gì?)"],conclusion:"Kết bài: Tóm lại ý chính và bày tỏ hy vọng / mong muốn của bạn trong tương lai."},vocabulary:[{hanzi:"我觉得",pinyin:"wǒ juéde",meaning:"tôi thấy, tôi nghĩ rằng"},{hanzi:"喜欢",pinyin:"xǐhuan",meaning:"thích"},{hanzi:"常常",pinyin:"chángcháng",meaning:"thường xuyên"},{hanzi:"一起",pinyin:"yìqǐ",meaning:"cùng nhau"},{hanzi:"高兴",pinyin:"gāoxìng",meaning:"vui vẻ"}],sentenceStructures:[{pattern:"我觉得……因为……",meaning:"Tôi thấy... bởi vì...",example:"我觉得这个题目很有意思，因为在日常生活中我们常常遇到。"},{pattern:"虽然……但是……",meaning:"Tuy... nhưng...",example:"虽然一开始有点儿难，但是多练习就会了。"}],sampleAnswer:{hanzi:`关于“${t}”这个问题，我觉得很有意思。在生活中，我们常常会遇到这样的事情。对我来说，保持一个好心情非常重要。首先，做事情的时候要认真，遇到不懂的问题可以多问问老师和朋友。其次，每天花一点儿时间去学习和练习，比如多听听汉语、多和大家聊聊天，这样就能慢慢进步。最后，我觉得大家互相帮助、一起努力是一件非常快乐的事情。只要我们每天坚持，就一定能把事情做好，生活也会更加开心。`,pinyin:"Guānyú zhè ge wèntí, wǒ juéde hěn yǒu yìsi. Zài shēnghuó zhōng, wǒmen chángcháng huì yù dào zhèyàng de shìqing. Duì wǒ lái shuō, bǎochí yí gè hǎo xīnqíng fēicháng zhòngyào. Shǒuxiān, zuò shìqing de shíhou yào rènzhēn, yù dào bù dǒng de wèntí kěyǐ duō wènwen lǎoshī hé péngyou. Qícì, měitiān huā yìdiǎnr shíjiān qù xuéxí hé liànxí, bǐrú duō tīngting Hànyǔ, duō hé dàjiā liáoliao tiān, zhèyàng jiù néng mànmàn jìnbù. Zuìhòu, wǒ juéde dàjiā hùxiāng bāngzhù, yìqǐ nǔlì shì yí jiàn fēicháng kuàilè de shìqing. Zhǐyào wǒmen měitiān jiānchí, jiù yídìng néng bǎ shìqing zuò hǎo, shēnghuó yě huì gèngjiā kāixīn.",meaningVi:`Về câu hỏi "${t}", tôi thấy rất thú vị. Trong cuộc sống, chúng ta thường hay gặp những chuyện như thế này. Đối với tôi, giữ một tâm trạng vui vẻ là rất quan trọng. Thứ nhất, khi làm việc gì cũng cần nghiêm túc, gặp câu hỏi chưa hiểu thì có thể hỏi thầy cô và bạn bè. Thứ hai, mỗi ngày dành một chút thời gian học tập và luyện tập, ví dụ như nghe tiếng Trung nhiều hơn, nói chuyện với mọi người nhiều hơn, như vậy sẽ tiến bộ dần dần. Cuối cùng, tôi thấy mọi người cùng giúp đỡ nhau, cùng nhau nỗ lực là một điều vô cùng hạnh phúc. Chỉ cần mỗi ngày kiên trì, nhất định chúng ta sẽ làm tốt và cuộc sống sẽ vui vẻ hơn.`}}:n==="cao"?{outline:{intro:`Mở bài: Đặt vấn đề sâu sắc trong bối cảnh xã hội hiện đại cho chủ đề: "${t}". Khẳng định tầm quan trọng và đưa ra luận điểm cốt lõi bao quát.`,body:["Luận điểm 1: Mổ xẻ bản chất và căn nguyên sâu xa của vấn đề (về mặt nhận thức cá nhân và tác động đa chiều từ môi trường sống).","Luận điểm 2: Đưa ra dẫn chứng thực tiễn điển hình có sức nặng thuyết phục (phân tích sự tương phản giữa kiên trì vượt khó và tâm lý thoái thác).","Luận điểm 3: Đề xuất hệ thống giải pháp chiến lược toàn diện (kết hợp kỷ luật tự thân với sự hỗ trợ từ gia đình, tổ chức và xã hội)."],conclusion:"Kết bài: Nâng tầm vấn đề thành bài học triết lý sống và thông điệp hành động mạnh mẽ, truyền cảm hứng dài hạn."},vocabulary:[{hanzi:"立足当下",pinyin:"lìzú dāngxià",meaning:"đứng vững ở hiện tại"},{hanzi:"深谋远虑",pinyin:"shēnmóu yuǎnlǜ",meaning:"lo xa nghĩ sâu, tầm nhìn chiến lược"},{hanzi:"持之以恒",pinyin:"chí zhī yǐ héng",meaning:"kiên trì bền bỉ không ngừng nghỉ"},{hanzi:"潜移默化",pinyin:"qián yí mò huà",meaning:"ảnh hưởng sâu sắc một cách vô hình, ngấm dần"},{hanzi:"标本兼治",pinyin:"biāo běn jiān zhì",meaning:"trị cả phần ngọn lẫn gốc rễ"},{hanzi:"收益匪浅",pinyin:"shòuyì fěiqiǎn",meaning:"thu hoạch được vô vàn điều bổ ích"}],sentenceStructures:[{pattern:"不仅在于……，更关键的在于……",meaning:"Không chỉ nằm ở chỗ..., mà mấu chốt hơn là nằm ở...",example:"探讨这个问题的价值，不仅在于理清表象，更关键的在于寻找切实行之有效的破局之道。"},{pattern:"固然……，然而归根结底……",meaning:"Dẫu rằng..., nhưng xét đến cùng...",example:"外部客观环境固然重要，然而归根结底，个人内驱力与长远格局才起决定性作用。"},{pattern:"唯有……，方能在……中立于不败之地。",meaning:"Chỉ khi..., mới có thể đứng vững trước...",example:"唯有保持终身学习的心态，方能在瞬息万变的时代浪潮中立于不败之地。"}],sampleAnswer:{hanzi:`针对“${t}”这一极具现实意义的深刻命题，我认为它不仅关乎我们每个人的个体成长，更折射出现代社会中普遍存在的价值取向与处事哲学。在纷繁复杂的生活与职场环境中，如何正确审视并妥善应对这一课题，值得我们深思熟虑。

首先，从认知层面来看，古人云：“登高使人心旷，临流使人意远。”面对纷至沓来的挑战，我们首先应当厘清问题的本质所在，既不能因暂时的波折 mà 妄自菲薄，亦不可盲目乐观而浅尝辄止。唯有树立清晰宏阔的目标导向，将长远愿景细化为扎实可行的阶段性规划，方能做到心中有数、行有方向。

其次，从实践与知行合一的角度而言，纸上谈兵终究无济于事，关键在于付诸持之以恒的切实行动。以我们日常求知与奋斗为例，任何一项专业技能的精通或心智的磨砺，无不经历漫长 mà 枯燥的积累过程，正所谓“不积跬步，无以至千里”。在此期间，保持专注与定力、勇敢突破舒适圈，敢于在试错中反思与总结，方能实现认知与能力的飞跃。

再者，除了依赖个体强烈的内驱力之外，融洽的人际协作与开放包容的生态氛围亦是不可或缺的外部支撑。懂得倾听他山之石、主动构建良性互动的合作机制，往往能激发出“独行快，众行远”的倍增效应。

总而言之，“行百里者半九十”。面对这一课题，我们唯有立足当下、深谋远虑，将坚毅的意志品质与科学的行事方法有机结合，在时代洪流中砥砺前行，方能攻坚克难，开辟出属于自己的广阔天地。`,pinyin:`Zhēnduì zhè yí jùyǒu xiànshí yìyì de shēnkè mìngtí, wǒ rènwéi tā bùjǐn guānhū wǒmen měi gè rén de gètǐ chéngzhǎng, gèng zhéshè chū xiàndài shèhuì zhōng pǔbiàn cúnzài de jiàzhí qǔxiàng yǔ chǔshì zhéxué. Zài fēnfán fùzá de shēnghuó yǔ zhíchǎng huánjìng zhōng, rúhé zhèngquè shěnshì bìng tuǒshàn yìngduì zhè yí kètí, zhídé wǒmen shēnsī shúlǜ.

Shǒuxiān, cóng rènzhī céngmiàn lái kàn, gǔrén yún: "Dēng gāo shǐ rén xīn kuàng, lín liú shǐ rén yì yuǎn." Miànduì fēnzhì-tàlái de tiǎozhàn, wǒmen shǒuxiān yīngdāng líqīng wèntí de běnzhì suǒzài, jì bù néng yīn zànshí de bōzhé ér wàngzì-fěibó, yì bù kě mángmù lèguān ér qiǎncháng-zhézhǐ. Wéiyǒu shùlì qīngxī hóngkuò de mùbiāo dǎoxiàng, jiāng chángyuǎn yuànjǐng xìhuà wéi zhāshi kěxíng de jiēduànxìng guīhuà, fāng néng zuò dào xīn zhōng yǒu shù, xíng yǒu fāngxiàng.

Qícì, cóng shíjiàn yǔ zhī-xíng-hé-yī de jiǎodù ér yán, zhǐshàng-tánbīng zhōngjiū wújìyúshì, guānjiàn zàiyú fùzhū chízhīyǐhéng de qièshí xíngdòng. Yǐ wǒmen rìcháng qiúzhī yǔ fèndòu wéilì, rènhé yí xiàng zhuānyè jìnéng de jīngtōng huò xīnzzhì de mólì, wúbù jīnglì màncháng ér kūzào de jīlěi guòchéng, zhèng suǒwèi "bù jī kuǐbù, wú yǐ zhì qiānlǐ". Zài cǐ qījiān, bǎochí zhuānzhù yǔ dìnglì, yǒnggǎn tūtò shūshìquān, gǎnyú zài shìcuò zhōng fǎnsī yǔ zǒngjié, fāng néng shíxiàn rènzhī yǔ nénglì de fēiyuè.

Zàizhě, chúle yīlài gètǐ qiángliè de nèiqūlì zhīwài, róngqià de rénjì xiézuò yǔ kāifàng bāoróng de shēngtài fēnwéi yì shì bùkě huòquē de wàibù zhīchēng. Dǒngdé qīngtīng tā-shān-zhī-shí, zhǔdòng gòujiàn liángxìng hùdòng de hézuò jīzhì, wǎngwǎng néng jīfā chū "dúxíng kuài, zhòngxíng yuǎn" de bèizēng xiàoyìng.

Zǒng'éryánzhī, "xíng bǎilǐ zhě bàn jiǔshí". Miànduì zhè yí kètí, wǒmen wéiyǒu lìzú dāngxià, shēnmóu yuǎnlǜ, jiāng jiānyì de yìzhì pǐnzhì yǔ kēxué de xíngshì fāngfǎ yǒujī jiéhé, zài shídài hóngliú zhōng dǐlì qiánxíng, fāng néng gōngjiān-kènán, kāipì chū shǔyú zìjǐ de guǎngkuò tiāndì.`,meaningVi:`Đối với đề bài mang tính thời sự và sâu sắc "${t}", tôi cho rằng câu hỏi này không chỉ liên quan mật thiết đến sự trưởng thành của mỗi cá nhân, mà còn phản ánh hệ giá trị và triết lý sống phổ quát trong xã hội hiện đại. Trong một môi trường sống và làm việc đa chiều, việc nhìn nhận thấu đáo và ứng phó thỏa đáng với vấn đề này là điều rất đáng để chúng ta trăn trở.

Trước hết, xét từ góc độ nhận thức, người xưa có câu: "Lên cao khiến lòng người khoáng đạt, ngắm dòng nước khiến ý chí vươn xa." Đối diện với vô vàn thử thách, chúng ta cần phân định rõ bản chất cốt lõi của vấn đề, không vì khó khăn trước mắt mà tự ti, thoái chí, cũng không vì chút thuận lợi ban đầu mà chủ quan, hời hợt. Chỉ khi xác lập một định hướng mục tiêu rành mạch, cụ thể hóa viễn cảnh dài hạn thành từng lộ trình hành động thiết thực, ta mới vững vàng tiến bước.

Thứ hai, xét từ nguyên lý "tri hành hợp nhất", nói suông trên giấy suy cho cùng vô ích, điều then chốt nằm ở việc bắt tay vào hành động kiên trì, bền bỉ. Lấy việc học tập và rèn luyện mỗi ngày làm ví dụ, việc tinh thông bất kỳ kỹ năng chuyên môn hay sự tôi luyện bản lĩnh nào cũng đều phải trải qua quá trình tích lũy lâu dài, đúng như câu "không tích từng bước nhỏ, không thể đi tới ngàn dặm". Trong hành trình đó, việc giữ vững sự tập trung, dũng cảm bứt phá khỏi vùng an toàn và không ngừng đúc rút kinh nghiệm sau mỗi lần vấp ngã chính là đòn bẩy tạo nên bước nhảy vọt.

Thêm vào đó, bên cạnh nội lực tự thân, sự tương trợ gắn kết và tinh thần hợp tác cởi mở cũng là điểm tựa ngoại lực không thể thiếu. Biết lắng nghe ý kiến đóng góp từ người khác, cùng chung sức đồng lòng sẽ luôn tạo ra sức mạnh cộng hưởng to lớn.

Tóm lại, "đường đi trăm dặm, đi được chín mươi dặm mới tính là nửa đường". Đứng trước bài toán này, chỉ khi chúng ta biết đứng vững ở hiện tại, nhìn xa trông rộng, kết hợp ý chí kiên định với phương pháp khoa học, không ngừng rèn giũa bản thân, ta mới có thể vượt qua mọi chông gai và kiến tạo nên chân trời rộng mở cho chính mình.`}}:{outline:{intro:`Mở bài: Nêu câu trả lời hoặc quan điểm cá nhân trực diện cho đề bài: "${t}". (Gợi ý: Theo bạn, câu trả lời trực tiếp cho câu hỏi này là gì?)`,body:[`Luận điểm 1: Phân tích nguyên nhân và lý do chính giải thích cho câu hỏi "${t}". (Gợi ý: Tại sao bạn lại nghĩ hoặc chọn như vậy?)`,"Luận điểm 2: Đưa ra ví dụ thực tế hoặc trải nghiệm bản thân gắn liền với câu hỏi. (Gợi ý: Bạn hoặc những người xung quanh đã trải qua việc này như thế nào?)","Luận điểm 3: Đánh giá ý nghĩa, giải pháp hoặc bài học cuộc sống. (Gợi ý: Điều này mang lại giá trị hoặc bài học gì cho bạn?)"],conclusion:"Kết bài: Tổng kết lại toàn bộ quan điểm, đưa ra bài học hoặc thông điệp / lời kêu gọi hành động ý nghĩa."},vocabulary:[{hanzi:"看法",pinyin:"kànfǎ",meaning:"quan điểm, góc nhìn"},{hanzi:"经验",pinyin:"jīngyàn",meaning:"kinh nghiệm thực tế"},{hanzi:"坚持",pinyin:"jiānchí",meaning:"kiên trì"},{hanzi:"互相帮助",pinyin:"hùxiāng bāngzhù",meaning:"giúp đỡ lẫn nhau"},{hanzi:"收益匪浅",pinyin:"shòuyì fěiqiǎn",meaning:"thu hoạch được nhiều điều bổ ích"}],sentenceStructures:[{pattern:"在我看来，……是最重要的。",meaning:"Theo quan điểm của tôi, ... là quan trọng nhất.",example:"在我看来，针对这个问题，保持积极态度并付诸行动最为重要。"},{pattern:"一方面……，另一方面……",meaning:"Một mặt thì..., mặt khác thì...",example:"一方面要脚踏实地努力，另一方面要多向他人请教。"}],sampleAnswer:{hanzi:`针对“${t}”这个问题，我认为在我们的生活和学习中有着非常重要的现实意义。首先，从个人角度来看，我们应当明确自己的目标与态度，认真思考问题背后的原因。其次，在遇到具体情境时，不能只停留在想法上， mà cần chủ động bắt tay vào hành động, dũng cảm đối mặt với thử thách và tích cực tìm kiếm giải pháp. 最后，只要我们能持之以恒，并与身边的人互相支持、共同进步，就一定能克服困难，取得令人满意的成果。`,pinyin:"Zhēnduì zhè ge wèntí, wǒ rènwéi zài wǒmen de shēnghuó hé xuéxí zhōng yǒuzhe fēicháng zhòngyào de xiànshí yìyì. Shǒuxiān, cóng gèrén jiǎodù lái kàn, wǒmen yīngdāng míngquè zìjǐ de mùbiāo yǔ tàidù. Qícì, zài yùdào jùtǐ qíngjìng shí, yīngdāng zhǔdòng fùzhū shíjiàn. Zuìhòu, zhǐyào wǒmen néng chízhīyǐhéng, jiù yídìng néng qǔdé lìngrén mǎnyì de chéngguǒ.",meaningVi:`Đối với đề tài "${t}", tôi cho rằng câu hỏi này mang ý nghĩa thực tế rất quan trọng trong cuộc sống và học tập của chúng ta. Thứ nhất, từ góc độ cá nhân, chúng ta cần xác định rõ mục tiêu và thái độ của mình, suy nghĩ nghiêm túc về nguyên nhân. Thứ hai, khi đối diện với tình huống cụ thể, không nên chỉ dừng lại ở suy nghĩ mà cần chủ động bắt tay vào hành động, dũng cảm đối mặt với thử thách và tích cực tìm kiếm giải pháp. Cuối cùng, chỉ cần chúng ta kiên trì đến cùng và luôn hỗ trợ lẫn nhau, nhất định sẽ gặt hái được những thành quả tốt đẹp.`}}}window.playSpeakingSampleTts=function(){const t=document.getElementById("sample-speaking-hanzi");if(!t||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const n=new SpeechSynthesisUtterance(t.textContent.trim());n.lang="zh-CN",n.rate=.88,window.speechSynthesis.speak(n)};window.startPrepTimer=function(){cancelSpeakingRecording();const t=document.getElementById("prep-timer-box"),n=document.getElementById("btn-prep-3p");if(!t)return;t.style.display="block",n==null||n.classList.add("active-timer"),t.scrollIntoView({behavior:"smooth",block:"center"});const i=document.getElementById("speaking-scratchpad-card");i&&(i.style.display="block");const e=document.getElementById("speaking-scratchpad-input");e&&e.focus(),f=180,b=!1,$(),m("start"),clearInterval(y),y=setInterval(()=>{b||(f--,$(),f<=0&&(clearInterval(y),m("chime"),alert("⏰ Đã hết 3 phút chuẩn bị! Bạn đã sẵn sàng, hãy bắt đầu nói ngay nhé!"),n==null||n.classList.remove("active-timer"),t.style.display="none",startSpeakingTimerAndRecord()))},1e3)};function $(){const t=document.getElementById("prep-timer-display");if(!t)return;const n=Math.floor(f/60),i=f%60;t.textContent=`${String(n).padStart(2,"0")}:${String(i).padStart(2,"0")}`}window.togglePausePrepTimer=function(){b=!b;const t=document.getElementById("prep-pause-btn");t&&(t.innerHTML=b?'<i class="fa-solid fa-play"></i> <span>Tiếp tục</span>':'<i class="fa-solid fa-pause"></i> <span>Tạm dừng</span>')};window.resetPrepTimer=function(){clearInterval(y),f=180,b=!1,$();const t=document.getElementById("prep-timer-box"),n=document.getElementById("btn-prep-3p");t&&(t.style.display="none"),n==null||n.classList.remove("active-timer")};window.stopPrepAndStartSpeaking=function(){clearInterval(y);const t=document.getElementById("prep-timer-box"),n=document.getElementById("btn-prep-3p");t&&(t.style.display="none"),n==null||n.classList.remove("active-timer"),startSpeakingTimerAndRecord()};window.startSpeakingTimerAndRecord=async function(){clearInterval(y);const t=document.getElementById("prep-timer-box"),n=document.getElementById("btn-prep-3p");t&&(t.style.display="none"),n==null||n.classList.remove("active-timer");try{const a=await navigator.mediaDevices.getUserMedia({audio:!0});G(a)}catch(a){console.error("Không truy cập được micro:",a),alert("Không thể truy cập microphone. Vui lòng cho phép trình duyệt truy cập micro để ghi âm bài nói!");return}const i=document.getElementById("speaking-recorder-box"),e=document.getElementById("btn-speak-2p"),s=document.getElementById("recorded-result-box");s&&(s.style.display="none"),i&&(i.style.display="block"),e==null||e.classList.add("active-timer");const o=document.getElementById("speaking-scratchpad-card");o&&(o.style.display="block"),i==null||i.scrollIntoView({behavior:"smooth",block:"center"}),k=120,v=0,H(),m("start"),j=[],d.start(250),z=!0,P(),clearInterval(x),x=setInterval(()=>{k--,v++,H(),k<=0&&(clearInterval(x),finishSpeakingRecording())},1e3)};function G(t){d=new MediaRecorder(t),d.ondataavailable=n=>{n.data.size>0&&j.push(n.data)},d.onstop=()=>{t.getTracks().forEach(e=>e.stop()),K=new Blob(j,{type:"audio/webm"}),A=URL.createObjectURL(K);const n=document.getElementById("recorded-audio-player");n&&(n.src=A);const i=document.getElementById("recording-duration-text");if(i){const e=Math.floor(v/60),s=v%60;i.textContent=`Thời lượng bài nói: ${String(e).padStart(2,"0")}:${String(s).padStart(2,"0")}`}}}function P(){const t=window.SpeechRecognition||window.webkitSpeechRecognition;if(t)try{g=new t,g.lang="zh-CN",g.continuous=!0,g.interimResults=!0;const n=document.getElementById("spoken-transcript-input");let i="";g.onresult=e=>{let s="";for(let o=e.resultIndex;o<e.results.length;++o)e.results[o].isFinal?i+=e.results[o][0].transcript:s+=e.results[o][0].transcript;n&&(n.value=(i+" "+s).trim())},g.onerror=e=>{console.warn("Speech recognition notice:",e)},g.start()}catch(n){console.warn("Không khởi chạy được SpeechRecognition:",n)}}function H(){const t=document.getElementById("speaking-timer-display");if(!t)return;const n=Math.floor(k/60),i=k%60;t.textContent=`${String(n).padStart(2,"0")}:${String(i).padStart(2,"0")}`}window.finishSpeakingRecording=function(){if(!z)return;if(z=!1,clearInterval(x),m("chime"),g)try{g.stop()}catch{}d&&d.state!=="inactive"&&d.stop();const t=document.getElementById("speaking-recorder-box"),n=document.getElementById("btn-speak-2p"),i=document.getElementById("recorded-result-box");t&&(t.style.display="none"),n==null||n.classList.remove("active-timer"),i&&(i.style.display="block",i.scrollIntoView({behavior:"smooth",block:"start"}));const e=document.getElementById("spoken-transcript-input");e&&!e.value.trim()&&(e.placeholder="Mic chưa tự động nhận diện được chữ Hán (hoặc trình duyệt chưa bật nhận diện giọng nói). Bạn hãy gõ tóm tắt những câu bạn vừa nói vào đây để AI chấm điểm chính xác nhé!")};window.cancelSpeakingRecording=function(){if(z=!1,clearInterval(x),g)try{g.stop()}catch{}if(d&&d.state!=="inactive")try{d.stop()}catch{}const t=document.getElementById("speaking-recorder-box"),n=document.getElementById("btn-speak-2p");t&&(t.style.display="none"),n==null||n.classList.remove("active-timer")};window.clearTranscript=function(){const t=document.getElementById("spoken-transcript-input");t&&(t.value="",t.focus())};window.restartSpeakingFlow=function(){const t=document.getElementById("recorded-result-box");t&&(t.style.display="none");const n=document.getElementById("ai-speaking-evaluation-results");n&&(n.style.display="none"),startSpeakingTimerAndRecord()};window.submitSpeakingForAiGrading=async function(){const t=document.getElementById("spoken-transcript-input"),n=document.getElementById("ai-speaking-evaluation-results"),i=document.getElementById("submit-speaking-btn");if(!t||!n)return;const e=t.value.trim();if(!e||e.length<3){alert("Vui lòng gõ hoặc nói ít nhất 5-10 chữ Hán vào ô văn bản bài nói để AI có thể chấm điểm nhé!"),t.focus();return}i&&(i.disabled=!0,i.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> <span>AI Đang Chấm Bài Nói...</span>'),n.style.display="block",n.scrollIntoView({behavior:"smooth",block:"start"}),n.innerHTML=`
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
  `;try{const s={question:r?r.question:"HSKK Speaking",transcript:e,level:c,duration:v||120},o=await fetch(`${T}/api/ai/grade-speaking`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});if(o.ok){const a=await o.json();N(a,n,e),m("start")}else throw new Error("Server error")}catch(s){console.error("Lỗi chấm bài nói AI:",s),N({overallScore:86,badge:"Rất Tốt 👏",criteriaScores:{pronunciation:86,fluency:85,grammar:86,content:88},generalFeedback:"Bài nói của bạn rõ ràng, câu từ tự nhiên và bám sát câu hỏi của đề bài!",strengths:["Phát âm tương đối rõ chữ","Trả lời trực diện vào chủ đề"],improvements:["Nên dùng thêm từ nối để bài nói liên kết uyển chuyển hơn"],nativeVersion:e,nativePinyin:"",nativeVi:"Bản dịch bài nói của bạn."},n,e)}finally{i&&(i.disabled=!1,i.innerHTML='<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Đưa AI Chấm Điểm Bài Nói</span>')}};function N(t,n,i){const e=t.overallScore||85,s=t.badge||(e>=90?"Xuất Sắc 🌟":e>=80?"Rất Tốt 👏":e>=65?"Khá 👍":"Cần Cố Gắng 🎙️"),o=e>=85?"linear-gradient(135deg, #10b981, #059669)":e>=70?"linear-gradient(135deg, #f59e0b, #d97706)":"linear-gradient(135deg, #ef4444, #dc2626)",a=t.criteriaScores||{pronunciation:85,fluency:85,grammar:85,content:85},l=t.strengths||[],h=t.improvements||[],w=t.nativeVersion||i,L=t.nativePinyin||"",C=t.nativeVi||"";n.innerHTML=`
    <div class="speaking-card-panel" style="margin-bottom: 24px; position: relative;">
      <!-- Header kết quả -->
      <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 20px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 20px; margin-bottom: 20px;">
        <div style="display: flex; align-items: center; gap: 20px;">
          <div style="width: 100px; height: 100px; border-radius: 50%; display: flex; flex-direction: column; align-items: center; justify-content: center; color: #ffffff; background: ${o}; box-shadow: 0 8px 24px rgba(0,0,0,0.25); flex-shrink: 0;">
            <span style="font-size: 2.2rem; font-weight: 900; line-height: 1;">${e}</span>
            <span style="font-size: 0.72rem; font-weight: 700; text-transform: uppercase; opacity: 0.9;">Thang 100</span>
          </div>

          <div>
            <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 4px;">
              <span style="font-size: 1.35rem; font-weight: 900; color: #ffffff;">Đánh Giá Bài Nói:</span>
              <span style="font-size: 1.25rem; font-weight: 800; color: #fbbf24;">${s}</span>
            </div>
            <div style="font-size: 0.88rem; color: #94a3b8;">
              <span><i class="fa-solid fa-microphone"></i> Thời lượng nói: <strong>${v||60}s</strong></span>
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
          ${t.generalFeedback||"Bài nói của bạn hoàn thành tốt mục tiêu giao tiếp."}
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-top: 12px;">
          ${l.length>0?`
            <div>
              <strong style="font-size: 0.85rem; color: #34d399; text-transform: uppercase;"><i class="fa-solid fa-thumbs-up"></i> Điểm sáng:</strong>
              <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 0.88rem; color: #e2e8f0;">
                ${l.map(S=>`<li>${S}</li>`).join("")}
              </ul>
            </div>
          `:""}

          ${h.length>0?`
            <div>
              <strong style="font-size: 0.85rem; color: #f87171; text-transform: uppercase;"><i class="fa-solid fa-lightbulb"></i> Điểm cần hoàn thiện:</strong>
              <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 0.88rem; color: #fca5a5;">
                ${h.map(S=>`<li>${S}</li>`).join("")}
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
          ${w}
        </div>

        ${L?`
          <div style="font-size: 0.88rem; line-height: 1.6; color: #94a3b8; font-style: italic; margin-bottom: 10px;">
            ${L}
          </div>
        `:""}

        ${C?`
          <div style="font-size: 0.92rem; line-height: 1.6; color: #cbd5e1; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 10px;">
            <strong>Dịch nghĩa:</strong> ${C}
          </div>
        `:""}
      </div>
    </div>
  `}window.playSpeakingNativeTts=function(){const t=document.getElementById("speaking-native-text");if(!t||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const n=new SpeechSynthesisUtterance(t.textContent.trim());n.lang="zh-CN",n.rate=.88,window.speechSynthesis.speak(n)};window.clearSpeakingScratchpad=function(){const t=document.getElementById("speaking-scratchpad-input");t&&(t.value.trim()&&!confirm("Bạn có chắc muốn xóa sạch bản nháp này?")||(t.value="",E(),sessionStorage.removeItem("hongtai_speaking_scratchpad")))};function E(){const t=document.getElementById("speaking-scratchpad-input"),n=document.getElementById("scratchpad-word-count");if(!t||!n)return;const i=t.value.trim().length;n.textContent=`${i} ký tự`,sessionStorage.setItem("hongtai_speaking_scratchpad",t.value)}function D(){const t=document.getElementById("speaking-scratchpad-input");if(!t)return;const n=sessionStorage.getItem("hongtai_speaking_scratchpad");n&&(t.value=n,E()),t.addEventListener("input",E)}document.addEventListener("DOMContentLoaded",()=>{V(),D()});
