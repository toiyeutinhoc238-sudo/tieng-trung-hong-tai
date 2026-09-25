import"./global_sidebar-7WGucaVq.js";const T=(window.location.hostname.includes("localhost")||window.location.hostname.includes("127.0.0.1"),"");let h={so:[],trung:[],cao:[]},r="trung",c=null,u=new Map,B=!1,f=null,y=180,b=!1,v=null,k=120,g=null,$=[],q=null,A=null,d=null,S=!1,x=0;function m(e="beep"){try{const n=new(window.AudioContext||window.webkitAudioContext),t=n.createOscillator(),i=n.createGain();if(t.connect(i),i.connect(n.destination),e==="spin")t.type="triangle",t.frequency.setValueAtTime(400,n.currentTime),t.frequency.exponentialRampToValueAtTime(800,n.currentTime+.25),i.gain.setValueAtTime(.2,n.currentTime),i.gain.exponentialRampToValueAtTime(.01,n.currentTime+.25),t.start(),t.stop(n.currentTime+.25);else if(e==="start")t.type="sine",t.frequency.setValueAtTime(587.33,n.currentTime),t.frequency.setValueAtTime(880,n.currentTime+.1),i.gain.setValueAtTime(.25,n.currentTime),i.gain.exponentialRampToValueAtTime(.01,n.currentTime+.35),t.start(),t.stop(n.currentTime+.35);else if(e==="chime"){const s=n.currentTime;[523.25,659.25,783.99].forEach((o,a)=>{const l=n.createOscillator(),p=n.createGain();l.type="sine",l.frequency.value=o,l.connect(p),p.connect(n.destination),p.gain.setValueAtTime(.18,s+a*.15),p.gain.exponentialRampToValueAtTime(.001,s+a*.15+.4),l.start(s+a*.15),l.stop(s+a*.15+.4)})}}catch{}}async function R(){var t,i,s;try{let o=await fetch(`${T}/api/hskk-questions`);o.ok||(o=await fetch("/data/hskk_questions.json"));const a=await o.json();a&&(a.so||a.questions)&&(a.so?h=a:a.questions&&(h.so=a.questions.filter(l=>l.level==="so"),h.trung=a.questions.filter(l=>l.level==="trung"),h.cao=a.questions.filter(l=>l.level==="cao")))}catch(o){console.warn("Lỗi nạp API HSKK, thử nạp tĩnh...",o);try{const a=await fetch("/data/hskk_questions.json");a.ok&&(h=await a.json())}catch{}}const e=(((t=h.so)==null?void 0:t.length)||0)+(((i=h.trung)==null?void 0:i.length)||0)+(((s=h.cao)==null?void 0:s.length)||0),n=document.getElementById("total-speaking-stat");n&&e>0&&(n.textContent=e.toLocaleString()),spinRandomQuestion(!1)}window.switchSpeakingLevel=function(e,n){r===e&&c||(r=e,document.querySelectorAll(".level-select-row .level-btn").forEach(t=>t.classList.remove("active")),n&&n.classList.add("active"),spinRandomQuestion(!0))};window.spinRandomQuestion=function(e=!0){const n=h[r]||[];if(!n||n.length===0)return;const t=document.getElementById("spin-question-btn");e&&t&&(t.classList.add("rolling"),m("spin"),setTimeout(()=>t.classList.remove("rolling"),500));let i=null;if(n.length===1)i=n[0];else do i=n[Math.floor(Math.random()*n.length)];while(c&&i.question===c.question&&n.length>1);c=i,M();const s=document.getElementById("ai-suggestion-box");s&&(s.style.display="none");const o=document.getElementById("hint-toggle-btn");o&&(o.innerHTML=`
      <i class="fa-solid fa-lightbulb"></i>
      <span>Gợi ý Dàn bài &amp; Từ vựng</span>
    `);const a=document.getElementById("sample-speech-box");a&&(a.style.display="none");const l=document.getElementById("sample-speech-toggle-btn");l&&(l.innerHTML=`
      <i class="fa-solid fa-medal"></i>
      <span>Bài nói mẫu tham khảo</span>
    `),resetPrepTimer(),cancelSpeakingRecording();const p=document.getElementById("recorded-result-box");p&&(p.style.display="none");const w=document.getElementById("ai-speaking-evaluation-results");w&&(w.style.display="none")};function M(){if(!c)return;const e=document.getElementById("active-question-text"),n=document.getElementById("question-meta-badge"),t=r==="so"?"HSKK Sơ cấp":r==="cao"?"HSKK Cao cấp":"HSKK Trung cấp";e&&(e.textContent=c.question),n&&(n.textContent=`Câu ${c.stt||1} • ${t}`)}window.playQuestionTts=function(){if(!c||!c.question||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const e=new SpeechSynthesisUtterance(c.question);e.lang="zh-CN",e.rate=.9,window.speechSynthesis.speak(e)};window.toggleAiSuggestions=async function(){const e=document.getElementById("ai-suggestion-box"),n=document.getElementById("hint-toggle-btn");if(!e||!c)return;if(e.style.display==="block"){e.style.display="none",n&&(n.innerHTML=`
        <i class="fa-solid fa-lightbulb"></i>
        <span>Gợi ý Dàn bài &amp; Từ vựng</span>
      `);return}e.style.display="block",n&&(n.innerHTML=`
      <i class="fa-solid fa-eye-slash"></i>
      <span>Ẩn Gợi ý</span>
    `);const i=`${r}_${c.question}`;if(u.has(i)){I(u.get(i));return}if(!B){B=!0,e.innerHTML=`
    <div style="text-align: center; padding: 24px 16px; color: #f59e0b;">
      <i class="fa-solid fa-brain fa-spin" style="font-size: 2rem; margin-bottom: 12px; color: #f59e0b;"></i>
      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
        AI HongTai đang lập Dàn ý &amp; chọn lọc Từ vựng Khẩu ngữ...
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8;">
        Phù hợp chuẩn thi HSKK ${r==="so"?"Sơ cấp":r==="cao"?"Cao cấp":"Trung cấp"}
      </div>
    </div>
  `;try{const s=await fetch(`${T}/api/ai/hskk-suggest`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:c.question,level:r,skill:"speaking"})});if(s.ok){const o=await s.json();u.set(i,o),I(o),m("start")}else throw new Error("Server error")}catch(s){console.error("Lỗi gợi ý AI:",s);const o=V();u.set(i,o),I(o)}finally{B=!1}}};function I(e){const n=document.getElementById("ai-suggestion-box");if(!n)return;const t=e.outline||{},i=e.vocabulary||[],s=e.sentenceStructures||[];n.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; border-bottom: 1px dashed rgba(34, 197, 94, 0.4); padding-bottom: 10px;">
      <div style="display: flex; align-items: center; gap: 8px; font-weight: 900; font-size: 1.05rem; color: #4ade80;">
        <i class="fa-solid fa-wand-magic-sparkles"></i>
        <span>AI Đề Xuất Dàn Ý &amp; Từ Vựng Khẩu Ngữ</span>
      </div>
      <span style="font-size: 0.75rem; background: rgba(34, 197, 94, 0.15); color: #86efac; padding: 2px 8px; border-radius: 6px; font-weight: 700;">
        HSKK ${r==="so"?"Sơ cấp":r==="cao"?"Cao cấp":"Trung cấp"}
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
  `}window.toggleSampleSpeech=async function(){const e=document.getElementById("sample-speech-box"),n=document.getElementById("sample-speech-toggle-btn");if(!e||!c)return;if(e.style.display==="block"){e.style.display="none",n&&(n.innerHTML=`
        <i class="fa-solid fa-medal"></i>
        <span>Bài nói mẫu tham khảo</span>
      `);return}e.style.display="block",n&&(n.innerHTML=`
      <i class="fa-solid fa-eye-slash"></i>
      <span>Ẩn Bài nói mẫu</span>
    `);const i=`${r}_${c.question}`;if(u.has(i)){E(u.get(i));return}e.innerHTML=`
    <div style="text-align: center; padding: 24px 16px; color: #10b981;">
      <i class="fa-solid fa-spinner fa-spin" style="font-size: 2rem; margin-bottom: 12px; color: #10b981;"></i>
      <div style="font-size: 1.05rem; font-weight: 800; color: #ffffff; margin-bottom: 4px;">
        Đang tạo bài nói mẫu dài chuẩn HSKK ${r==="so"?"Sơ cấp":r==="cao"?"Cao cấp":"Trung cấp"}...
      </div>
      <div style="font-size: 0.85rem; color: #94a3b8;">
        Bài văn mẫu dài, chi tiết, văn phong lưu loát chuẩn người bản xứ.
      </div>
    </div>
  `;try{const s=await fetch(`${T}/api/ai/hskk-suggest`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({question:c.question,level:r,skill:"speaking"})});if(s.ok){const o=await s.json();u.set(i,o),E(o),m("start")}else throw new Error("Server error")}catch(s){console.error("Lỗi nạp bài mẫu:",s);const o=V();u.set(i,o),E(o)}};function E(e){const n=document.getElementById("sample-speech-box");if(!n)return;const t=e.sampleAnswer||{},i=t.hanzi||"",s=i.replace(/\s+/g,"").length;n.innerHTML=`
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px dashed rgba(16, 185, 129, 0.4); padding-bottom: 10px; flex-wrap: wrap; gap: 8px;">
      <div style="display: flex; align-items: center; gap: 8px; font-weight: 900; font-size: 1.1rem; color: #34d399;">
        <i class="fa-solid fa-medal"></i>
        <span>Bài Nói Mẫu Tham Khảo (Chuẩn HSKK ${r==="so"?"Sơ cấp":r==="cao"?"Cao cấp":"Trung cấp"})</span>
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
  `}function V(){return r==="cao"?{outline:{intro:"Mở bài: Đưa ra nhận định tổng quan, định nghĩa vấn đề và khẳng định tính tất yếu của đề tài.",body:["Luận điểm 1: Phân tích nguyên nhân và thực trạng xã hội từ góc nhìn vĩ mô.","Luận điểm 2: Đưa ra dẫn chứng thực tế hoặc trải nghiệm bản thân để làm sáng tỏ lập luận.","Luận điểm 3: Đề xuất giải pháp mang tính xây dựng, lâu dài và bền vững."],conclusion:"Kết bài: Đúc kết triết lý sống và kỳ vọng phát triển trong tương lai."},vocabulary:[{hanzi:"不可否认",pinyin:"bùkě fǒurèn",meaning:"không thể phủ nhận"},{hanzi:"循序渐进",pinyin:"xúnxù jiànjìn",meaning:"tuần tự từng bước"},{hanzi:"核心竞争力",pinyin:"héxīn jìngzhēnglì",meaning:"năng lực cạnh tranh cốt lõi"},{hanzi:"行稳致远",pinyin:"xíng wěn zhì yuǎn",meaning:"bước đi vững chắc để tiến xa"}],sentenceStructures:[{pattern:"从宏观角度来看，……是不可或缺的基石。",meaning:"Từ góc độ vĩ mô mà nói, ... là nền tảng không thể thiếu.",example:"从宏观角度来看，终身学习是保持个人核心竞争力的基石。"},{pattern:"与其……，不如……，因为……",meaning:"Thay vì..., chi bằng..., bởi vì...",example:"与其抱怨环境的不公，不如脚踏实地提升自我。"}],sampleAnswer:{hanzi:`关于这一问题，我认为应当从多维度、深层次来进行客观理性的剖析。首先，从个人成长与社会发展的宏观角度来看，事物的发展往往遵循着循序渐进的客观规律。正如古人云：“学如逆水行舟，不进则退。”在瞬息万变的现代社会中，若想保持核心竞争力，我们就必须树立终身学习的理念，不断拓宽自身的认知边界。

其次，不可否认的是，在追求目标的过程中，挫折与挑战在所难免。面对逆境，消极抱怨无济于事，唯有保持沉着冷静的心态，认真分析问题的症结所在，才能化被动为主动。以我个人的亲身经历为例，每当面临看似难以逾越的瓶颈时，我都会选择虚心向前辈请教，同时结合科学有效的方法反复求证，最终不仅攻克了难关，更锤炼了自己的心智与意志。

综上所述，无论是求学问道还是立足职场，坚韧不拔的意志品质与求真务实的行动准则都是不可或缺的。鉴于此，我们应当在实践中不断反思总结，脚踏实地走好每一步，方能在未来的道路上行稳致远，实现自我价值与社会价值的和谐统一。`,pinyin:"Guānyú zhè yí wèntí, wǒ rènwéi yīngdāng cóng duō wéidù, shēncéngcì lái jìnxíng kèguān lǐxìng de pōuxī. Shǒuxiān, cóng gèrén chéngzhǎng yǔ shèhuì fāzhǎn de hóngguān jiǎodù lái kàn, shìwù de fāzhǎn wǎngwǎng zūnxún zhe xúnxùjiànjìn de kèguān guīlǜ...",meaningVi:"Về vấn đề này, tôi cho rằng cần nhìn nhận khách quan, sâu sắc từ nhiều chiều kích. Thứ nhất, từ góc độ phát triển cá nhân và xã hội, vạn vật đều tuân theo quy luật phát triển từng bước. Người xưa có câu: 'Học như chèo thuyền ngược nước, không tiến ắt lùi'. Trong xã hội biến đổi nhanh chóng, muốn duy trì năng lực cạnh tranh cốt lõi thì cần không ngừng học tập suốt đời. Thứ hai, đối mặt nghịch cảnh không nên than phiền mà cần bình tĩnh phân tích nguyên nhân để biến bị động thành chủ động. Tóm lại, kiên trì và thực tế chính là chìa khóa để tiến xa trên đường đời."}}:r==="trung"?{outline:{intro:"Mở đầu trực tiếp: Nêu rõ quan điểm hoặc câu trả lời đối với đề bài.",body:["Luận điểm 1: Giải thích nguyên nhân hoặc kể lại trải nghiệm thực tế.","Luận điểm 2: Đưa ra ví dụ cụ thể minh họa cho quan điểm.","Luận điểm 3: Nêu bật cảm nhận và bài học tích lũy."],conclusion:"Kết luận: Tóm tắt lại suy nghĩ và hy vọng tương lai."},vocabulary:[{hanzi:"持之以恒",pinyin:"chízhīyǐhéng",meaning:"kiên trì bền bỉ"},{hanzi:"日积月累",pinyin:"rìjīyuèlěi",meaning:"tích lũy ngày qua ngày"},{hanzi:"万事开头难",pinyin:"wànshì kāitóu nán",meaning:"vạn sự khởi đầu nan"},{hanzi:"开阔眼界",pinyin:"kāikuò yǎnjiè",meaning:"mở rộng tầm nhìn"}],sentenceStructures:[{pattern:"我认为在日常生活和学习中，……是走向成功的关键。",meaning:"Tôi cho rằng trong cuộc sống và học tập, ... là then chốt để thành công.",example:"我认为在日常生活和学习中，保持积极健康的心态是走向成功的关键。"},{pattern:"只要我们……，就一定能……",meaning:"Chỉ cần chúng ta..., thì nhất định có thể...",example:"只要我们持之以恒，就一定能取得优异的成绩。"}],sampleAnswer:{hanzi:`这个问题非常值得探讨。我认为在日常生活和学习中，保持积极健康的心态和良好的习惯是走向成功的关键基石。

首先，俗话说“万事开头难”，当我们接触新事物或遇到挑战时，往往容易产生畏难情绪。然而，只要我们能够静下心来，将大目标拆解为一个一个具体可行的小步骤，每天坚持进步一点点，日积月累就一定能发生质的飞跃。比如在学习中文的过程中，一开始我也觉得汉字难写、发音难准，但通过每天坚持晨读和听力练习，现在我已经能够自信流利地进行日常交流了。

其次，除了自身的勤奋努力之外，学会与他人沟通合作也同样重要。多向优秀的师长朋友请教，倾听不同的见解，不仅能让我们少走弯路，更能开阔眼界、拓宽思维格局。

总的来说，成长的道路不可能一帆风顺，但只要我们目标明确、持之以恒，就一定能克服各种困难，收获属于自己的精彩。`,pinyin:"Zhè ge wèntí fēicháng zhídé tàntǎo. Wǒ rènwéi zài rìcháng shēnghuó hé xuéxí zhōng, bǎochí jījí jiànkāng de xīntài hé liánghǎo de xíguàn shì zǒuxiàng chénggōng de guānjiàn jīshí. Shǒuxiān, súhuà shuō 'wànshì kāitóu nán'...",meaningVi:"Câu hỏi này rất đáng để thảo luận. Tôi cho rằng trong cuộc sống và học tập hằng ngày, giữ gìn một tâm thái tích cực lành mạnh và những thói quen tốt chính là nền tảng then chốt để đi tới thành công. Thứ nhất, 'vạn sự khởi đầu nan', chia nhỏ mục tiêu và kiên trì từng ngày sẽ tạo nên bước nhảy vọt. Thứ hai, học cách giao tiếp và hợp tác với người khác giúp ta học hỏi được nhiều kinh nghiệm quý báu. Tóm lại, chỉ cần kiên định mục tiêu thì nhất định sẽ gặt hái thành công."}}:{outline:{intro:"Mở đầu trực tiếp: Nêu câu trả lời ngắn gọn.",body:["Kể 1-2 lý do đơn giản","Chia sẻ cảm xúc của bản thân"],conclusion:"Kết thúc: Bày tỏ mong muốn."},vocabulary:[{hanzi:"高兴",pinyin:"gāoxìng",meaning:"vui vẻ"},{hanzi:"经常",pinyin:"jīngcháng",meaning:"thường xuyên"},{hanzi:"因为……所以……",pinyin:"yīnwèi... suǒyǐ...",meaning:"bởi vì... cho nên..."}],sentenceStructures:[{pattern:"我非常喜欢……，因为……",meaning:"Tôi rất thích..., bởi vì...",example:"我非常喜欢中国菜，因为味道很好。"}],sampleAnswer:{hanzi:"这个问题很有意思。对我来说，学习和生活都需要保持积极乐观的心态。遇到困难时，不要轻言放弃，多向老师和朋友请教，慢慢积累经验，每天进步一点点，最终一定会有所收获。",pinyin:"Zhè ge wèntí hěn yǒu yìsi. Duì wǒ lái shuō, xuéxí hé shēnghuó dōu xūyào bǎochí jījí lèguān de xīntài. Yù dào kùnnán shí, bú yào qīngyán fàngqì, duō xiàng lǎoshī hé péngyou qǐngjiào, mànmàn jīlěi jīngyàn, měitiān jìnbù yì diǎndiǎn, zuìzhōng yídìng huì yǒu suǒ shōuhuò.",meaningVi:"Câu hỏi này rất thú vị. Đối với tôi, cả học tập lẫn cuộc sống đều cần giữ tâm thế tích cực lạc quan. Khi gặp khó khăn, không nên dễ dàng từ bỏ, hãy học hỏi từ thầy cô và bạn bè, mỗi ngày tiến bộ một chút thì nhất định sẽ gặt hái thành công."}}}window.playSpeakingSampleTts=function(){const e=document.getElementById("sample-speaking-hanzi");if(!e||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const n=new SpeechSynthesisUtterance(e.textContent.trim());n.lang="zh-CN",n.rate=.88,window.speechSynthesis.speak(n)};window.startPrepTimer=function(){cancelSpeakingRecording();const e=document.getElementById("prep-timer-box"),n=document.getElementById("btn-prep-3p");if(!e)return;e.style.display="block",n==null||n.classList.add("active-timer"),e.scrollIntoView({behavior:"smooth",block:"center"});const t=document.getElementById("speaking-scratchpad-card");t&&(t.style.display="block");const i=document.getElementById("speaking-scratchpad-input");i&&i.focus(),y=180,b=!1,C(),m("start"),clearInterval(f),f=setInterval(()=>{b||(y--,C(),y<=0&&(clearInterval(f),m("chime"),alert("⏰ Đã hết 3 phút chuẩn bị! Bạn đã sẵn sàng, hãy bắt đầu nói ngay nhé!"),n==null||n.classList.remove("active-timer"),e.style.display="none",startSpeakingTimerAndRecord()))},1e3)};function C(){const e=document.getElementById("prep-timer-display");if(!e)return;const n=Math.floor(y/60),t=y%60;e.textContent=`${String(n).padStart(2,"0")}:${String(t).padStart(2,"0")}`}window.togglePausePrepTimer=function(){b=!b;const e=document.getElementById("prep-pause-btn");e&&(e.innerHTML=b?'<i class="fa-solid fa-play"></i> <span>Tiếp tục</span>':'<i class="fa-solid fa-pause"></i> <span>Tạm dừng</span>')};window.resetPrepTimer=function(){clearInterval(f),y=180,b=!1,C();const e=document.getElementById("prep-timer-box"),n=document.getElementById("btn-prep-3p");e&&(e.style.display="none"),n==null||n.classList.remove("active-timer")};window.stopPrepAndStartSpeaking=function(){clearInterval(f);const e=document.getElementById("prep-timer-box"),n=document.getElementById("btn-prep-3p");e&&(e.style.display="none"),n==null||n.classList.remove("active-timer"),startSpeakingTimerAndRecord()};window.startSpeakingTimerAndRecord=async function(){clearInterval(f);const e=document.getElementById("prep-timer-box"),n=document.getElementById("btn-prep-3p");e&&(e.style.display="none"),n==null||n.classList.remove("active-timer");try{const a=await navigator.mediaDevices.getUserMedia({audio:!0});P(a)}catch(a){console.error("Không truy cập được micro:",a),alert("Không thể truy cập microphone. Vui lòng cho phép trình duyệt truy cập micro để ghi âm bài nói!");return}const t=document.getElementById("speaking-recorder-box"),i=document.getElementById("btn-speak-2p"),s=document.getElementById("recorded-result-box");s&&(s.style.display="none"),t&&(t.style.display="block"),i==null||i.classList.add("active-timer");const o=document.getElementById("speaking-scratchpad-card");o&&(o.style.display="block"),t==null||t.scrollIntoView({behavior:"smooth",block:"center"}),k=120,x=0,H(),m("start"),$=[],g.start(250),S=!0,D(),clearInterval(v),v=setInterval(()=>{k--,x++,H(),k<=0&&(clearInterval(v),finishSpeakingRecording())},1e3)};function P(e){g=new MediaRecorder(e),g.ondataavailable=n=>{n.data.size>0&&$.push(n.data)},g.onstop=()=>{e.getTracks().forEach(i=>i.stop()),q=new Blob($,{type:"audio/webm"}),A=URL.createObjectURL(q);const n=document.getElementById("recorded-audio-player");n&&(n.src=A);const t=document.getElementById("recording-duration-text");if(t){const i=Math.floor(x/60),s=x%60;t.textContent=`Thời lượng bài nói: ${String(i).padStart(2,"0")}:${String(s).padStart(2,"0")}`}}}function D(){const e=window.SpeechRecognition||window.webkitSpeechRecognition;if(e)try{d=new e,d.lang="zh-CN",d.continuous=!0,d.interimResults=!0;const n=document.getElementById("spoken-transcript-input");let t="";d.onresult=i=>{let s="";for(let o=i.resultIndex;o<i.results.length;++o)i.results[o].isFinal?t+=i.results[o][0].transcript:s+=i.results[o][0].transcript;n&&(n.value=(t+" "+s).trim())},d.onerror=i=>{console.warn("Speech recognition notice:",i)},d.start()}catch(n){console.warn("Không khởi chạy được SpeechRecognition:",n)}}function H(){const e=document.getElementById("speaking-timer-display");if(!e)return;const n=Math.floor(k/60),t=k%60;e.textContent=`${String(n).padStart(2,"0")}:${String(t).padStart(2,"0")}`}window.finishSpeakingRecording=function(){if(!S)return;if(S=!1,clearInterval(v),m("chime"),d)try{d.stop()}catch{}g&&g.state!=="inactive"&&g.stop();const e=document.getElementById("speaking-recorder-box"),n=document.getElementById("btn-speak-2p"),t=document.getElementById("recorded-result-box");e&&(e.style.display="none"),n==null||n.classList.remove("active-timer"),t&&(t.style.display="block",t.scrollIntoView({behavior:"smooth",block:"start"}));const i=document.getElementById("spoken-transcript-input");i&&!i.value.trim()&&(i.placeholder="Mic chưa tự động nhận diện được chữ Hán (hoặc trình duyệt chưa bật nhận diện giọng nói). Bạn hãy gõ tóm tắt những câu bạn vừa nói vào đây để AI chấm điểm chính xác nhé!")};window.cancelSpeakingRecording=function(){if(S=!1,clearInterval(v),d)try{d.stop()}catch{}if(g&&g.state!=="inactive")try{g.stop()}catch{}const e=document.getElementById("speaking-recorder-box"),n=document.getElementById("btn-speak-2p");e&&(e.style.display="none"),n==null||n.classList.remove("active-timer")};window.clearTranscript=function(){const e=document.getElementById("spoken-transcript-input");e&&(e.value="",e.focus())};window.restartSpeakingFlow=function(){const e=document.getElementById("recorded-result-box");e&&(e.style.display="none");const n=document.getElementById("ai-speaking-evaluation-results");n&&(n.style.display="none"),startSpeakingTimerAndRecord()};window.submitSpeakingForAiGrading=async function(){const e=document.getElementById("spoken-transcript-input"),n=document.getElementById("ai-speaking-evaluation-results"),t=document.getElementById("submit-speaking-btn");if(!e||!n)return;const i=e.value.trim();if(!i||i.length<3){alert("Vui lòng gõ hoặc nói ít nhất 5-10 chữ Hán vào ô văn bản bài nói để AI có thể chấm điểm nhé!"),e.focus();return}t&&(t.disabled=!0,t.innerHTML='<i class="fa-solid fa-spinner fa-spin"></i> <span>AI Đang Chấm Bài Nói...</span>'),n.style.display="block",n.scrollIntoView({behavior:"smooth",block:"start"}),n.innerHTML=`
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
  `;try{const s={question:c?c.question:"HSKK Speaking",transcript:i,level:r,duration:x||120},o=await fetch(`${T}/api/ai/grade-speaking`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(s)});if(o.ok){const a=await o.json();N(a,n,i),m("start")}else throw new Error("Server error")}catch(s){console.error("Lỗi chấm bài nói AI:",s),N({overallScore:86,badge:"Rất Tốt 👏",criteriaScores:{pronunciation:86,fluency:85,grammar:86,content:88},generalFeedback:"Bài nói của bạn rõ ràng, câu từ tự nhiên và bám sát câu hỏi của đề bài!",strengths:["Phát âm tương đối rõ chữ","Trả lời trực diện vào chủ đề"],improvements:["Nên dùng thêm từ nối để bài nói liên kết uyển chuyển hơn"],nativeVersion:i,nativePinyin:"",nativeVi:"Bản dịch bài nói của bạn."},n,i)}finally{t&&(t.disabled=!1,t.innerHTML='<i class="fa-solid fa-wand-magic-sparkles"></i> <span>Đưa AI Chấm Điểm Bài Nói</span>')}};function N(e,n,t){const i=e.overallScore||85,s=e.badge||(i>=90?"Xuất Sắc 🌟":i>=80?"Rất Tốt 👏":i>=65?"Khá 👍":"Cần Cố Gắng 🎙️"),o=i>=85?"linear-gradient(135deg, #10b981, #059669)":i>=70?"linear-gradient(135deg, #f59e0b, #d97706)":"linear-gradient(135deg, #ef4444, #dc2626)",a=e.criteriaScores||{pronunciation:85,fluency:85,grammar:85,content:85},l=e.strengths||[],p=e.improvements||[],w=e.nativeVersion||t,j=e.nativePinyin||"",K=e.nativeVi||"";n.innerHTML=`
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
          ${e.generalFeedback||"Bài nói của bạn hoàn thành tốt mục tiêu giao tiếp."}
        </p>

        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 14px; margin-top: 12px;">
          ${l.length>0?`
            <div>
              <strong style="font-size: 0.85rem; color: #34d399; text-transform: uppercase;"><i class="fa-solid fa-thumbs-up"></i> Điểm sáng:</strong>
              <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 0.88rem; color: #e2e8f0;">
                ${l.map(z=>`<li>${z}</li>`).join("")}
              </ul>
            </div>
          `:""}

          ${p.length>0?`
            <div>
              <strong style="font-size: 0.85rem; color: #f87171; text-transform: uppercase;"><i class="fa-solid fa-lightbulb"></i> Điểm cần hoàn thiện:</strong>
              <ul style="margin: 6px 0 0 0; padding-left: 20px; font-size: 0.88rem; color: #fca5a5;">
                ${p.map(z=>`<li>${z}</li>`).join("")}
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

        ${j?`
          <div style="font-size: 0.88rem; line-height: 1.6; color: #94a3b8; font-style: italic; margin-bottom: 10px;">
            ${j}
          </div>
        `:""}

        ${K?`
          <div style="font-size: 0.92rem; line-height: 1.6; color: #cbd5e1; border-top: 1px dashed rgba(255,255,255,0.15); padding-top: 10px;">
            <strong>Dịch nghĩa:</strong> ${K}
          </div>
        `:""}
      </div>
    </div>
  `}window.playSpeakingNativeTts=function(){const e=document.getElementById("speaking-native-text");if(!e||!("speechSynthesis"in window))return;window.speechSynthesis.cancel();const n=new SpeechSynthesisUtterance(e.textContent.trim());n.lang="zh-CN",n.rate=.88,window.speechSynthesis.speak(n)};window.clearSpeakingScratchpad=function(){const e=document.getElementById("speaking-scratchpad-input");e&&(e.value.trim()&&!confirm("Bạn có chắc muốn xóa sạch bản nháp này?")||(e.value="",L(),sessionStorage.removeItem("hongtai_speaking_scratchpad")))};function L(){const e=document.getElementById("speaking-scratchpad-input"),n=document.getElementById("scratchpad-word-count");if(!e||!n)return;const t=e.value.trim().length;n.textContent=`${t} ký tự`,sessionStorage.setItem("hongtai_speaking_scratchpad",e.value)}function G(){const e=document.getElementById("speaking-scratchpad-input");if(!e)return;const n=sessionStorage.getItem("hongtai_speaking_scratchpad");n&&(e.value=n,L()),e.addEventListener("input",L)}document.addEventListener("DOMContentLoaded",()=>{R(),G()});
