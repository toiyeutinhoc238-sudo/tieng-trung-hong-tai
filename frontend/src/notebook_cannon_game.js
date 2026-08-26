/**
 * Tiếng Trung HongTai - PHI ĐAO LUYỆN TỪ
 * Cơ chế: Từ vựng rơi từ trên xuống. Gõ pinyin tự do → phi đao bay ra tiêu diệt từ khớp.
 * Inspired by: Hanzii Falling Words (hanzii.net)
 */

function normalizePinyin(str) {
  if (!str) return '';
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/ü/g,'v').replace(/[^a-z0-9]/g,'').trim();
}

class AmbientMusicEngine {
  constructor() { this.ctx=null; this.isPlaying=false; this.masterGain=null; this.noteTimeout=null; this.droneNodes=[]; this.noteIdx=0; this.patternIdx=0; }
  init() {
    if(this.ctx)return;
    const AC=window.AudioContext||window.webkitAudioContext;
    if(!AC)return;
    this.ctx=new AC();
    this.masterGain=this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0,this.ctx.currentTime);
    this.masterGain.connect(this.ctx.destination);
  }
  playNote(freq,duration=1.2,vol=0.08,type='sine'){
    if(!this.ctx)return;
    if(this.ctx.state==='suspended')this.ctx.resume();
    try{
      const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();
      osc.type=type;osc.frequency.setValueAtTime(freq,this.ctx.currentTime);
      gain.gain.setValueAtTime(0,this.ctx.currentTime);
      gain.gain.linearRampToValueAtTime(vol,this.ctx.currentTime+0.1);
      gain.gain.exponentialRampToValueAtTime(0.001,this.ctx.currentTime+duration);
      osc.connect(gain);gain.connect(this.masterGain);osc.start();osc.stop(this.ctx.currentTime+duration+0.05);
    }catch(e){}
  }
  startDrone(){
    if(!this.ctx)return;
    [130.81,196.00].forEach(f=>{
      try{
        const osc=this.ctx.createOscillator();const gain=this.ctx.createGain();
        osc.type='sine';osc.frequency.setValueAtTime(f,this.ctx.currentTime);
        gain.gain.setValueAtTime(0.03,this.ctx.currentTime);
        osc.connect(gain);gain.connect(this.masterGain);osc.start();
        this.droneNodes.push({osc,gain});
      }catch(e){}
    });
  }
  stopDrone(){
    this.droneNodes.forEach(({osc,gain})=>{
      try{gain.gain.exponentialRampToValueAtTime(0.001,this.ctx.currentTime+0.5);osc.stop(this.ctx.currentTime+0.55);}catch(e){}
    });
    this.droneNodes=[];
  }
  start(){
    this.init();
    if(!this.ctx||this.isPlaying)return;
    this.isPlaying=true;
    if(this.ctx.state==='suspended')this.ctx.resume();
    this.masterGain.gain.linearRampToValueAtTime(1.0,this.ctx.currentTime+2.0);
    this.startDrone();
    const patterns=[[392,440,523,392,329,261,293,261],[261,329,392,440,392,329,261,220],[523,440,392,329,261,293,329,392],[440,392,329,261,293,329,392,440]];
    const scheduleNote=()=>{
      if(!this.isPlaying||!this.ctx)return;
      const pattern=patterns[this.patternIdx%patterns.length];
      const freq=pattern[this.noteIdx%pattern.length];
      const dur=1.6+Math.random()*0.8;const vol=0.045+Math.random()*0.025;
      this.playNote(freq,dur,vol,'sine');
      if(Math.random()<0.3)setTimeout(()=>{if(this.isPlaying)this.playNote(freq*2,dur*0.7,vol*0.4,'sine');},300);
      if(Math.random()<0.15)setTimeout(()=>{if(this.isPlaying)this.playNote(130.81,2.5,0.03,'triangle');},600);
      this.noteIdx++;
      if(this.noteIdx%pattern.length===0)this.patternIdx++;
      this.noteTimeout=setTimeout(scheduleNote,900+Math.random()*600);
    };
    setTimeout(scheduleNote,800);
  }
  stop(){
    this.isPlaying=false;
    if(this.noteTimeout){clearTimeout(this.noteTimeout);this.noteTimeout=null;}
    if(this.ctx&&this.masterGain){try{this.masterGain.gain.linearRampToValueAtTime(0.001,this.ctx.currentTime+1.0);}catch(e){}}
    this.stopDrone();
  }
  playSFX(freqs,vols,type='sine',interval=60){
    if(!this.ctx)return;
    if(this.ctx.state==='suspended')this.ctx.resume();
    freqs.forEach((f,i)=>setTimeout(()=>{if(this.ctx)this.playNote(f,0.25,vols[i]||0.1,type);},i*interval));
  }
  playHit(){this.playSFX([880,1108],[0.15,0.1],'triangle',60);}
  playMiss(){this.playNote(180,0.3,0.12,'sawtooth');}
  playStreak(){this.playSFX([523,659,784,1047],[0.12,0.12,0.12,0.12],'sine',60);}
  playHeartRestore(){this.playSFX([523,659,784,1047,1319],[0.1,0.1,0.1,0.1,0.1],'sine',80);}
  playGameOver(){this.playSFX([440,370,330,261],[0.15,0.15,0.15,0.15],'sawtooth',150);}
  playVictory(){this.playSFX([523,659,784,1047,1319,1568],[0.12,0.12,0.12,0.12,0.12,0.12],'sine',100);}
}

export class CannonGameEngine {
  constructor(containerEl,wordsList,onExitCallback){
    this.container=containerEl;
    this.rawWords=wordsList&&wordsList.length>0?wordsList:[
      {word:'老师',pinyin:'laoshi',meaning:'giáo viên'},{word:'学生',pinyin:'xuesheng',meaning:'học sinh'},
      {word:'学校',pinyin:'xuexiao',meaning:'trường học'},{word:'电脑',pinyin:'diannao',meaning:'máy tính'},
      {word:'苹果',pinyin:'pingguo',meaning:'quả táo'},{word:'香蕉',pinyin:'xiangjiao',meaning:'quả chuối'},
    ];
    this.onExit=onExitCallback;
    this.music=new AmbientMusicEngine();
    this.score=0;this.combo=0;this.maxCombo=0;this.lives=3;this.maxLives=3;
    this.timeLeft=90;this.isRunning=false;this.isPaused=false;
    this.lastFrameTime=0;this.spawnTimer=0;
    this.wordQueue=[];this.activeWords=[];this.correctWordsSet=new Set();
    this.wordsDestroyedCount=0;this.typedBuffer='';this.lockedTarget=null;
    this.slowMoTimer=0;this.score2xTimer=0;this.shieldActive=false;this.shieldTimer=0;
    this.timerInterval=null;this.animFrameId=null;this.keyHandler=null;
    this.renderLayout();this.bindEvents();
  }

  renderLayout(){
    this.container.innerHTML=`
<div class="phidao-wrapper">
<style>
.phidao-wrapper{position:relative;width:100%;height:100%;min-height:560px;background:linear-gradient(180deg,#0b1528 0%,#111e38 50%,#0d172a 100%);display:flex;flex-direction:column;overflow:hidden;font-family:'Inter','Segoe UI',system-ui,sans-serif;color:#f8fafc;}
.phidao-bg{position:absolute;inset:0;pointer-events:none;z-index:0;background:radial-gradient(circle at 82% 18%,rgba(56,189,248,.18) 0%,transparent 40%),radial-gradient(circle at 20% 40%,rgba(168,85,247,.15) 0%,transparent 45%),linear-gradient(180deg,#071120 0%,#0e1e38 45%,#132746 80%,#0f1c32 100%);}
.phidao-moon{position:absolute;top:20px;right:90px;width:76px;height:76px;background:radial-gradient(circle at 35% 35%,#fffdf0 0%,#fef08a 40%,#eab308 85%,#ca8a04 100%);border-radius:50%;box-shadow:0 0 40px 15px rgba(254,240,138,.4),0 0 90px 45px rgba(234,179,8,.15);opacity:.95;}
.phidao-star{position:absolute;border-radius:50%;background:#ffffff;box-shadow:0 0 6px rgba(255,255,255,.9);animation:starTwinkle var(--dur,3s) ease-in-out infinite;animation-delay:var(--delay,0s);}
@keyframes starTwinkle{0%,100%{opacity:.9;transform:scale(1)}50%{opacity:.3;transform:scale(.6)}}
.phidao-sakura-p{position:absolute;font-size:14px;opacity:.75;filter:drop-shadow(0 0 6px rgba(244,114,182,.6));animation:sakuraFall linear infinite;animation-duration:var(--dur,8s);animation-delay:var(--delay,0s);}
@keyframes sakuraFall{0%{transform:translateY(-20px) rotate(0deg);opacity:.8}100%{transform:translateY(120vh) rotate(720deg);opacity:0}}

/* TOP HUD */
.phidao-hud{position:relative;z-index:10;display:flex;align-items:center;justify-content:space-between;padding:10px 18px;background:rgba(15,23,42,.88);backdrop-filter:blur(12px);border-bottom:1.5px solid rgba(255,255,255,.15);box-shadow:0 4px 20px rgba(0,0,0,.35);flex-shrink:0;}
.phidao-hud-center{display:flex;align-items:center;gap:20px;}
.phidao-hud-left,.phidao-hud-right{display:flex;gap:8px;}
.phidao-btn-icon{background:rgba(255,255,255,.1);border:1px solid rgba(255,255,255,.2);color:#f1f5f9;border-radius:10px;width:36px;height:36px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:.95rem;transition:all .2s;}
.phidao-btn-icon:hover{background:rgba(255,255,255,.25);transform:scale(1.08);}
.phidao-stat{display:flex;align-items:center;gap:8px;color:#ffffff;font-weight:800;font-size:1.1rem;text-shadow:0 2px 4px rgba(0,0,0,.5);}
.phidao-lives-row{display:flex;gap:5px;font-size:1.2rem;filter:drop-shadow(0 0 6px rgba(239,68,68,.5));}

/* BUFF BANNER */
.phidao-buff-banner{position:relative;z-index:10;text-align:center;background:linear-gradient(90deg,rgba(245,158,11,.2),rgba(239,68,68,.25),rgba(245,158,11,.2));border-bottom:1.5px solid rgba(245,158,11,.4);color:#fef08a;font-size:.85rem;font-weight:800;padding:5px 12px;flex-shrink:0;text-shadow:0 1px 3px #000;}

/* PLAYFIELD - MAX EXPANDED SKY */
.phidao-playfield{position:relative;z-index:5;flex:1;overflow:hidden;min-height:480px;}
.phidao-words-layer,.phidao-fx-layer{position:absolute;inset:0;pointer-events:none;}

/* FLOATING SKILL DOCK (Góc Phải) */
.phidao-floating-skills{position:absolute;right:14px;top:20px;z-index:20;display:flex;flex-direction:column;gap:7px;background:rgba(15,23,42,.78);backdrop-filter:blur(10px);border:1.5px solid rgba(255,255,255,.14);border-radius:16px;padding:8px 6px;box-shadow:0 8px 30px rgba(0,0,0,.45);}
.phidao-skills-label{font-size:.62rem;font-weight:800;color:#94a3b8;text-align:center;letter-spacing:.05em;padding-bottom:3px;border-bottom:1px solid rgba(255,255,255,.08);}
.phidao-skill-btn{display:flex;flex-direction:column;align-items:center;gap:1px;background:rgba(30,41,59,.8);border:1.5px solid rgba(255,255,255,.12);border-radius:10px;padding:5px 10px;color:#cbd5e1;cursor:pointer;transition:all .2s;min-width:68px;}
.phidao-skill-btn .s-emoji{font-size:1.1rem;}
.phidao-skill-btn .s-label{font-size:.64rem;font-weight:800;color:#ffffff;}
.phidao-skill-btn .s-cost{font-size:.58rem;color:#94a3b8;font-weight:700;}
.phidao-skill-btn.affordable{border-color:#fbbf24;background:linear-gradient(135deg,rgba(251,191,36,.25),rgba(245,158,11,.15));box-shadow:0 0 14px rgba(251,191,36,.4);}
.phidao-skill-btn.affordable .s-cost{color:#fde047;}
.phidao-skill-btn:hover.affordable{transform:scale(1.08);}

/* CHARACTER & LUMINOUS GROUND */
.phidao-char-zone{position:absolute;bottom:0;left:0;right:0;height:70px;display:flex;align-items:flex-end;justify-content:center;}
.phidao-ground-snow{position:absolute;bottom:0;left:0;right:0;height:42px;background:linear-gradient(180deg,#f1f5f9 0%,#e2e8f0 40%,#cbd5e1 100%);border-top:3px solid #38bdf8;box-shadow:0 -4px 20px rgba(56,189,248,.4),inset 0 2px 6px #ffffff;}
.phidao-ground-line{position:absolute;bottom:40px;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(56,189,248,.6) 20%,#38bdf8 50%,rgba(56,189,248,.6) 80%,transparent);box-shadow:0 0 10px #38bdf8;}
.phidao-character{position:relative;z-index:6;font-size:2.8rem;bottom:26px;animation:charBreathe 3s ease-in-out infinite;filter:drop-shadow(0 6px 16px rgba(0,0,0,.5)) drop-shadow(0 0 12px rgba(56,189,248,.6));user-select:none;}
@keyframes charBreathe{0%,100%{transform:translateY(0) scale(1)}50%{transform:translateY(-4px) scale(1.04)}}
.phidao-character.throw-anim{animation:charThrow .25s ease-out;}
@keyframes charThrow{0%{transform:translateX(0) rotate(0deg)}30%{transform:translateX(-10px) rotate(-12deg)}70%{transform:translateX(12px) rotate(8deg)}100%{transform:translateX(0) rotate(0deg)}}

/* FLOATING INPUT INDICATOR (Dưới cùng chính giữa) */
.phidao-floating-input-bar{position:absolute;bottom:6px;left:50%;transform:translateX(-50%);z-index:20;display:flex;flex-direction:column;align-items:center;gap:3px;pointer-events:none;}
.phidao-typed-buf{min-width:160px;min-height:36px;background:rgba(15,23,42,.92);border:2px solid rgba(56,189,248,.5);border-radius:10px;padding:4px 16px;font-size:1.15rem;font-weight:900;color:#fde047;font-family:monospace;letter-spacing:.08em;text-align:center;display:flex;align-items:center;justify-content:center;gap:3px;box-shadow:0 0 16px rgba(56,189,248,.25);transition:all .2s;}
.phidao-typed-buf.has-match{border-color:#fbbf24;background:rgba(251,191,36,.15);box-shadow:0 0 25px rgba(251,191,36,.5);}
.phidao-cursor-blink{animation:blink 1s step-end infinite;color:#fbbf24;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
.phidao-input-tip-sub{font-size:.7rem;font-weight:700;color:#cbd5e1;background:rgba(15,23,42,.75);padding:2px 10px;border-radius:20px;backdrop-filter:blur(4px);text-shadow:0 1px 2px #000;border:1px solid rgba(255,255,255,.08);}
.phidao-target-hint{font-size:.82rem;color:#fef08a;font-weight:700;min-width:100px;text-align:center;}

/* WORD CARDS: HIGH CONTRAST & BRIGHT */
.phidao-word-card{position:absolute;display:flex;flex-direction:column;align-items:center;gap:2px;background:linear-gradient(145deg,#1e293b 0%,#0f172a 100%);border:2px solid #38bdf8;border-radius:16px;padding:8px 16px;min-width:80px;box-shadow:0 10px 25px rgba(0,0,0,.5),0 0 18px rgba(56,189,248,.35);will-change:transform;transition:border-color .15s,box-shadow .15s,transform .1s;}
.phidao-word-card.is-targeted{border-color:#fbbf24 !important;background:linear-gradient(145deg,#451a03 0%,#1e1b4b 100%) !important;box-shadow:0 0 28px rgba(251,191,36,.8),0 0 50px rgba(251,191,36,.4) !important;transform:scale(1.06);}
.phidao-word-card.type-star{border-color:#c084fc;background:linear-gradient(145deg,#3b0764 0%,#1e1b4b 100%);box-shadow:0 0 28px rgba(192,132,252,.7),0 0 50px rgba(192,132,252,.3);}
.phidao-word-card .word-py-tone{font-size:.82rem;font-weight:700;color:#7dd3fc;text-shadow:0 1px 3px rgba(0,0,0,.8);}
.phidao-word-card .word-zh{font-family:'Noto Sans SC','PingFang SC','Microsoft YaHei',sans-serif;font-size:1.8rem;font-weight:800;color:#ffffff;line-height:1.1;text-shadow:0 0 12px rgba(255,255,255,.8),0 2px 6px rgba(0,0,0,.9);letter-spacing:.05em;}
.phidao-word-card .pinyin-prog{font-size:.82rem;font-family:'Courier New',Courier,monospace;font-weight:800;letter-spacing:.06em;background:rgba(0,0,0,.45);padding:2px 8px;border-radius:6px;margin-top:2px;}
.phidao-word-card .py-typed{color:#fde047;text-shadow:0 0 8px #eab308;}
.phidao-word-card .py-rem{color:#93c5fd;}
.phidao-word-card.type-star .word-zh{background:linear-gradient(135deg,#f0abfc 0%,#c084fc 50%,#818cf8 100%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;filter:drop-shadow(0 0 10px rgba(192,132,252,.9));}

/* VIETNAMESE MEANING POPUP ON HIT */
.phidao-hit-meaning-card{position:absolute;background:linear-gradient(135deg,rgba(16,185,129,.95),rgba(5,150,105,.95));border:1.5px solid #6ee7b7;border-radius:12px;padding:6px 14px;color:#ffffff;pointer-events:none;z-index:25;box-shadow:0 8px 24px rgba(0,0,0,.4),0 0 20px rgba(16,185,129,.6);animation:hitPopupFloat 2.2s ease-out forwards;min-width:140px;text-align:center;}
@keyframes hitPopupFloat{0%{transform:translateY(0) scale(.7);opacity:0}15%{transform:translateY(-10px) scale(1.08);opacity:1}30%{transform:translateY(-18px) scale(1);opacity:1}80%{transform:translateY(-35px) scale(.98);opacity:1}100%{transform:translateY(-55px) scale(.85);opacity:0}}
.phidao-hit-top{display:flex;align-items:center;justify-content:center;gap:6px;font-size:.85rem;font-weight:800;}
.phidao-hit-pts{color:#fef08a;font-weight:900;font-size:.95rem;}
.phidao-hit-zh{font-family:'Noto Sans SC',sans-serif;font-size:1.15rem;font-weight:800;}
.phidao-hit-py{color:#a7f3d0;font-size:.8rem;}
.phidao-hit-mean{font-size:.88rem;font-weight:700;color:#ffffff;margin-top:2px;text-shadow:0 1px 3px rgba(0,0,0,.6);}

.phidao-dagger{position:absolute;font-size:1.4rem;pointer-events:none;z-index:20;filter:drop-shadow(0 0 10px rgba(251,191,36,.8));}
.phidao-explosion{position:absolute;width:55px;height:55px;border-radius:50%;pointer-events:none;z-index:20;animation:explode .4s ease-out forwards;}
@keyframes explode{0%{transform:scale(.3);opacity:1}100%{transform:scale(2.2);opacity:0}}
.phidao-explosion.type-normal{background:radial-gradient(circle,rgba(251,191,36,.9),rgba(249,115,22,.4) 60%,transparent);}
.phidao-explosion.type-star{background:radial-gradient(circle,rgba(192,132,252,.95),rgba(129,140,248,.5) 60%,transparent);}
.phidao-float-text{position:absolute;font-size:1.05rem;font-weight:900;pointer-events:none;z-index:25;animation:floatUp .9s ease-out forwards;white-space:nowrap;text-shadow:0 2px 8px rgba(0,0,0,.8);}
@keyframes floatUp{0%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(-48px) scale(.85);opacity:0}}
.phidao-miss-flash{position:absolute;inset:0;background:rgba(239,68,68,.3);pointer-events:none;z-index:30;animation:missFlash .35s ease-out forwards;}
@keyframes missFlash{0%{opacity:1}100%{opacity:0}}

.phidao-modal-overlay{position:absolute;inset:0;z-index:100;background:rgba(7,16,30,.88);backdrop-filter:blur(12px);display:flex;align-items:center;justify-content:center;padding:16px;}
.phidao-result-card{position:relative;background:linear-gradient(160deg,rgba(10,20,40,.98),rgba(15,30,55,.96));border:1px solid rgba(255,255,255,.12);border-radius:24px;padding:32px 28px 28px;max-width:540px;width:95%;max-height:90vh;overflow-y:auto;box-shadow:0 32px 80px rgba(0,0,0,.7);text-align:center;}
.phidao-modal-close-x{position:absolute;top:14px;right:18px;background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.15);color:#94a3b8;font-size:1.4rem;line-height:1;width:32px;height:32px;border-radius:50%;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;z-index:10;}
.phidao-modal-close-x:hover{background:rgba(239,68,68,.2);color:#ef4444;border-color:rgba(239,68,68,.4);}
.phidao-result-icon{font-size:2.8rem;margin-bottom:6px;}
.phidao-result-title{font-size:1.45rem;font-weight:900;color:#f1f5f9;margin:0 0 6px;}
.phidao-result-desc{font-size:.88rem;color:#94a3b8;margin:0 0 16px;}
.phidao-result-stats{display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:14px;}
.phidao-stat-pill{background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);border-radius:12px;padding:8px 16px;display:flex;flex-direction:column;gap:2px;}
.phidao-stat-pill span{font-size:.68rem;color:#64748b;text-transform:uppercase;letter-spacing:.06em;}
.phidao-stat-pill strong{font-size:1.3rem;font-weight:900;color:#fbbf24;}
.phidao-summary-section-title{display:flex;align-items:center;justify-content:center;gap:8px;font-size:.88rem;font-weight:800;color:#fbbf24;text-transform:uppercase;letter-spacing:.05em;margin:14px 0 8px;padding-bottom:6px;border-bottom:1px solid rgba(255,255,255,.08);}
.phidao-result-tip{background:rgba(251,191,36,.08);border:1px dashed rgba(251,191,36,.25);border-radius:12px;padding:8px 12px;font-size:.76rem;color:#cbd5e1;text-align:left;margin:8px 0 14px;line-height:1.4;}
.phidao-result-actions{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:16px;}
.phidao-action-btn{padding:9px 18px;border-radius:12px;font-weight:700;font-size:.86rem;cursor:pointer;display:flex;align-items:center;gap:7px;transition:all .2s;border:none;}
.phidao-action-btn.primary{background:linear-gradient(135deg,#f59e0b,#d97706);color:#1a0a00;}
.phidao-action-btn.warn{background:linear-gradient(135deg,#ef4444,#b91c1c);color:#ffffff;}
.phidao-action-btn.warn:hover{transform:scale(1.04);box-shadow:0 4px 16px rgba(239,68,68,.35);}
.phidao-action-btn.secondary{background:rgba(255,255,255,.08);color:#e2e8f0;border:1px solid rgba(255,255,255,.15);}
.phidao-action-btn.outline{background:transparent;color:#94a3b8;border:1px solid rgba(255,255,255,.1);}
.phidao-action-btn:hover{transform:scale(1.04);}
.game-center-countdown-tick{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%) scale(2);font-size:3rem;font-weight:900;color:#ef4444;pointer-events:none;z-index:50;opacity:0;}
.game-center-countdown-tick.tick-anim{animation:tickPop .7s ease-out forwards;}
@keyframes tickPop{0%{transform:translate(-50%,-50%) scale(2.5);opacity:1}100%{transform:translate(-50%,-50%) scale(.8);opacity:0}}
</style>
<div class="phidao-bg"><div class="phidao-moon"></div><div id="phidao-stars"></div><div id="phidao-sakura"></div></div>
<div class="phidao-hud">
  <div class="phidao-hud-left">
    <button id="cannon-top-back-btn" class="phidao-btn-icon"><i class="fa-solid fa-arrow-left"></i></button>
    <button id="cannon-pause-btn" class="phidao-btn-icon"><i class="fa-solid fa-pause"></i></button>
  </div>
  <div class="phidao-hud-center">
    <div class="phidao-stat"><i class="fa-solid fa-star" style="color:#fbbf24;"></i><span id="cannon-score-val">0</span></div>
    <div class="phidao-lives-row" id="cannon-lives-container">
      <i class="fa-solid fa-heart" style="color:#ef4444;"></i><i class="fa-solid fa-heart" style="color:#ef4444;"></i><i class="fa-solid fa-heart" style="color:#ef4444;"></i>
    </div>
    <div class="phidao-stat"><i class="fa-solid fa-fire" style="color:#f97316;"></i><span id="cannon-combo-val">x0</span></div>
  </div>
  <div class="phidao-hud-right">
    <button id="cannon-exit-btn" class="phidao-btn-icon"><i class="fa-solid fa-xmark"></i></button>
  </div>
</div>
<div id="cannon-buff-banner" class="phidao-buff-banner" style="display:none;"></div>
<div class="phidao-playfield" id="cannon-playfield">
  <div id="cannon-words-layer" class="phidao-words-layer"></div>
  <div id="cannon-fx-layer" class="phidao-fx-layer"></div>
  
  <!-- FLOATING SKILL DOCK (Góc Phải) -->
  <div class="phidao-floating-skills">
    <div class="phidao-skills-label"><i class="fa-solid fa-wand-magic-sparkles"></i> KỸ NĂNG</div>
    <button class="phidao-skill-btn" id="skill-ice" data-cost="10" title="Alt+1: Làm chậm">
      <span class="s-emoji">❄️</span><span class="s-label">Mưa Băng</span><span class="s-cost">10 combo</span>
    </button>
    <button class="phidao-skill-btn" id="skill-heal" data-cost="20" title="Alt+2: Hồi máu">
      <span class="s-emoji">💚</span><span class="s-label">Hồi Máu</span><span class="s-cost">20 combo</span>
    </button>
    <button class="phidao-skill-btn" id="skill-x2" data-cost="30" title="Alt+3: Nhân đôi">
      <span class="s-emoji">⭐</span><span class="s-label">Nhân Điểm</span><span class="s-cost">30 combo</span>
    </button>
    <button class="phidao-skill-btn" id="skill-shield" data-cost="20" title="Alt+4: Khiên">
      <span class="s-emoji">🛡️</span><span class="s-label">Lá Chắn</span><span class="s-cost">20 combo</span>
    </button>
  </div>

  <!-- CHARACTER & LUMINOUS GROUND (Ở Đáy) -->
  <div class="phidao-char-zone">
    <div class="phidao-ground-line"></div>
    <div class="phidao-character" id="phidao-character">🥷</div>
    <div class="phidao-ground-snow"></div>
  </div>

  <!-- FLOATING INPUT INDICATOR (Dưới cùng chính giữa) -->
  <div class="phidao-floating-input-bar">
    <div class="phidao-typed-buf" id="phidao-typed-buf"><span class="phidao-cursor-blink">|</span></div>
    <div class="phidao-input-tip-sub"><i class="fa-solid fa-keyboard" style="color:#38bdf8;"></i> Gõ Pinyin không dấu để phi đao phóng ra</div>
    <div class="phidao-target-hint" id="phidao-target-hint"></div>
  </div>
</div>
<div id="cannon-modal-overlay" class="phidao-modal-overlay" style="display:none;">
  <div class="phidao-result-card">
    <button type="button" id="cannon-modal-close-x" class="phidao-modal-close-x" title="Đóng">&times;</button>
    <div id="cannon-result-icon" class="phidao-result-icon">🏆</div>
    <h2 id="cannon-result-title" class="phidao-result-title">Hoàn Thành!</h2>
    <p id="cannon-result-desc" class="phidao-result-desc"></p>
    <div class="phidao-result-stats">
      <div class="phidao-stat-pill"><span>Điểm</span><strong id="res-score">0</strong></div>
      <div class="phidao-stat-pill"><span>Combo cao nhất</span><strong id="res-combo">0</strong></div>
      <div class="phidao-stat-pill"><span>Từ bắn trúng</span><strong id="res-words">0</strong></div>
    </div>
    <div class="phidao-summary-section-title"><i class="fa-solid fa-graduation-cap" style="color:#fbbf24;"></i> CỦNG CỐ KIẾN THỨC TỪ VỰNG</div>
    <div id="cannon-words-summary-wrap"></div>
    <div class="phidao-result-tip"><i class="fa-solid fa-lightbulb" style="color:#fbbf24;"></i> <strong>Củng cố kiến thức:</strong> Nhấn vào từng từ để nghe lại phát âm và ghi nhớ mặt chữ của những từ chưa gõ kịp nhé!</div>
    <div class="phidao-result-actions">
      <button type="button" id="cannon-retry-wrong-btn" class="phidao-action-btn warn" style="display:none;"><i class="fa-solid fa-bolt"></i> Luyện Lại Từ Chưa Thuộc (<span id="wrong-count-span">0</span>)</button>
      <button type="button" id="cannon-retry-btn" class="phidao-action-btn primary"><i class="fa-solid fa-rotate-right"></i> Chơi Lại Toàn Bộ</button>
      <button type="button" id="cannon-back-hub-btn" class="phidao-action-btn secondary"><i class="fa-solid fa-gamepad"></i> Đổi Trò</button>
      <button type="button" id="cannon-finish-btn" class="phidao-action-btn outline"><i class="fa-solid fa-book-bookmark"></i> Sổ Tay</button>
    </div>
  </div>
</div>
</div>`;
    this._genStars();this._genSakura();
  }

  _genStars(){
    const el=this.container.querySelector('#phidao-stars');if(!el)return;
    for(let i=0;i<75;i++){
      const s=document.createElement('div');s.className='phidao-star';
      const size=1+Math.random()*2.2;
      s.style.cssText=`width:${size}px;height:${size}px;left:${Math.random()*100}%;top:${5+Math.random()*65}%;--dur:${2+Math.random()*4}s;--delay:${Math.random()*4}s;`;
      el.appendChild(s);
    }
  }
  _genSakura(){
    const el=this.container.querySelector('#phidao-sakura');if(!el)return;
    const petals=['🌸','🌺','✿'];
    for(let i=0;i<10;i++){
      const p=document.createElement('div');p.className='phidao-sakura-p';p.textContent=petals[i%3];
      p.style.cssText=`left:${Math.random()*100}%;top:-20px;--dur:${7+Math.random()*8}s;--delay:${Math.random()*10}s;`;
      el.appendChild(p);
    }
  }


  bindEvents(){
    const qs=(id)=>this.container.querySelector(id);
    if(qs('#cannon-top-back-btn'))qs('#cannon-top-back-btn').addEventListener('click',e=>{e.preventDefault();this.stopAndExit();});
    if(qs('#cannon-pause-btn'))qs('#cannon-pause-btn').addEventListener('click',e=>{e.preventDefault();this.togglePause();});
    if(qs('#cannon-exit-btn'))qs('#cannon-exit-btn').addEventListener('click',e=>{e.preventDefault();this.stopAndExit();if(typeof window.exitNotebookGamesHub==='function')window.exitNotebookGamesHub();});
    if(qs('#cannon-retry-btn'))qs('#cannon-retry-btn').addEventListener('click',e=>{e.preventDefault();this.restart();});
    if(qs('#cannon-back-hub-btn'))qs('#cannon-back-hub-btn').addEventListener('click',e=>{e.preventDefault();this.stopAndExit();});
    if(qs('#cannon-finish-btn'))qs('#cannon-finish-btn').addEventListener('click',e=>{e.preventDefault();this.stopAndExit();if(typeof window.exitNotebookGamesHub==='function')window.exitNotebookGamesHub();});

    this.container.querySelectorAll('.phidao-skill-btn').forEach(btn=>{
      btn.addEventListener('click',e=>{e.preventDefault();const map={'skill-ice':'ice','skill-heal':'heal','skill-x2':'x2','skill-shield':'shield'};if(map[btn.id])this.activateSkill(map[btn.id]);});
    });

    this.keyHandler=(e)=>{
      if(!this.isRunning||this.isPaused)return;
      const overlay=this.container.querySelector('#cannon-modal-overlay');
      if(overlay&&overlay.style.display!=='none')return;
      if(e.altKey){const map={'1':'ice','2':'heal','3':'x2','4':'shield'};if(map[e.key]){e.preventDefault();this.activateSkill(map[e.key]);return;}}
      if(e.key==='Backspace'){e.preventDefault();this.typedBuffer=this.typedBuffer.slice(0,-1);this.lockedTarget=null;this.updateTypedDisplay();this.highlightTargets();return;}
      if(e.key==='Escape'){this.typedBuffer='';this.lockedTarget=null;this.updateTypedDisplay();this.highlightTargets();return;}
      if(e.key.length===1&&/^[a-zA-Z]$/.test(e.key)&&!e.ctrlKey&&!e.altKey&&!e.metaKey){e.preventDefault();this.typedBuffer+=e.key.toLowerCase();this.handleTypingInput();}
    };
    window.addEventListener('keydown',this.keyHandler);
  }

  handleTypingInput(){
    const buf=this.typedBuffer;
    if(!this.lockedTarget){
      const matches=this.activeWords.filter(w=>!w.isDestroyed&&normalizePinyin(w.wordObj.pinyin).startsWith(buf)).sort((a,b)=>b.y-a.y);
      if(matches.length>0){this.lockedTarget=matches[0];}
      else{this.typedBuffer='';this.music.playMiss();}
    }else{
      const tNorm=normalizePinyin(this.lockedTarget.wordObj.pinyin);
      if(!tNorm.startsWith(buf)){
        this.lockedTarget=null;
        const nm=this.activeWords.filter(w=>!w.isDestroyed&&normalizePinyin(w.wordObj.pinyin).startsWith(buf)).sort((a,b)=>b.y-a.y);
        if(nm.length>0){this.lockedTarget=nm[0];}
        else{this.typedBuffer='';this.music.playMiss();}
      }
    }
    if(this.lockedTarget&&!this.lockedTarget.isDestroyed){
      const tNorm=normalizePinyin(this.lockedTarget.wordObj.pinyin);
      if(buf===tNorm){const t=this.lockedTarget;this.typedBuffer='';this.lockedTarget=null;this.fireDagger(t);}
    }
    this.updateTypedDisplay();this.highlightTargets();
  }

  updateTypedDisplay(){
    const bufEl=this.container.querySelector('#phidao-typed-buf');
    const hintEl=this.container.querySelector('#phidao-target-hint');
    const buf=this.typedBuffer;
    if(bufEl){
      if(buf){bufEl.className=`phidao-typed-buf${this.lockedTarget?' has-match':''}`;bufEl.innerHTML=`<span>${buf}</span><span class="phidao-cursor-blink">|</span>`;}
      else{bufEl.className='phidao-typed-buf';bufEl.innerHTML=`<span class="phidao-cursor-blink">|</span>`;}
    }
    if(hintEl){
      if(this.lockedTarget&&buf){const norm=normalizePinyin(this.lockedTarget.wordObj.pinyin);const rem=norm.slice(buf.length);hintEl.innerHTML=`<span style="color:#fbbf24;">${buf}</span><span style="color:rgba(148,163,184,.45);">${rem}</span> → ${this.lockedTarget.wordObj.word}`;}
      else hintEl.textContent='';
    }
  }

  highlightTargets(){
    this.activeWords.forEach(w=>{
      if(!w.el||w.isDestroyed)return;
      const isTgt=this.lockedTarget&&w.id===this.lockedTarget.id;
      w.el.classList.toggle('is-targeted',isTgt);
      const prog=w.el.querySelector('.pinyin-prog');
      if(prog){
        const norm=normalizePinyin(w.wordObj.pinyin);
        if(isTgt&&this.typedBuffer){const rem=norm.slice(this.typedBuffer.length);prog.innerHTML=`<span class="py-typed">${this.typedBuffer}</span><span class="py-rem">${rem}</span>`;}
        else prog.innerHTML=`<span class="py-rem">${norm}</span>`;
      }
    });
  }

  fireDagger(target){
    if(!target||target.isDestroyed)return;
    target.isDestroyed=true;target.isTargeted=false;
    const charEl=this.container.querySelector('#phidao-character');
    if(charEl){charEl.classList.remove('throw-anim');void charEl.offsetWidth;charEl.classList.add('throw-anim');setTimeout(()=>charEl&&charEl.classList.remove('throw-anim'),300);}
    this.music.playHit();
    const fxLayer=this.container.querySelector('#cannon-fx-layer');
    const playfield=this.container.querySelector('#cannon-playfield');
    if(!fxLayer||!playfield){this.handleHitWord(target);return;}
    const pfW=playfield.clientWidth;const pfH=playfield.clientHeight;
    const sX=pfW/2;const sY=pfH-48;const eX=target.x+40;const eY=target.y+30;
    const dagger=document.createElement('div');dagger.className='phidao-dagger';dagger.textContent='🗡️';
    dagger.style.left=`${sX}px`;dagger.style.top=`${sY}px`;
    const dx=eX-sX;const dy=eY-sY;const angle=Math.atan2(dy,dx)*180/Math.PI-45;
    dagger.style.transform=`rotate(${angle}deg)`;
    fxLayer.appendChild(dagger);
    const dist=Math.sqrt(dx*dx+dy*dy);const dur=Math.max(100,Math.min(300,dist*0.55));const st=performance.now();
    const animate=(now)=>{
      const p=Math.min(1,(now-st)/dur);const t=p<0.5?2*p*p:-1+(4-2*p)*p;
      dagger.style.left=`${sX+dx*t}px`;dagger.style.top=`${sY+dy*t}px`;
      if(p<1)requestAnimationFrame(animate);else{dagger.remove();this.handleHitWord(target);}
    };
    requestAnimationFrame(animate);
  }

  handleHitWord(targetItem){
    const idx=this.activeWords.findIndex(w=>w.id===targetItem.id);if(idx===-1)return;
    const isStar=targetItem.type==='star';const mult=this.score2xTimer>0?2:1;
    const pinLen=normalizePinyin(targetItem.wordObj.pinyin).length;
    const pts=Math.round((isStar?(75+pinLen*30):(pinLen*15))*mult);
    this.score+=pts;this.combo++;this.wordsDestroyedCount++;
    if(this.combo>this.maxCombo)this.maxCombo=this.combo;
    if(targetItem.wordObj.word)this.correctWordsSet.add(targetItem.wordObj.word);

    // HIỂN THỊ NGHĨA TIẾNG VIỆT NGAY KHI BẮN TRÚNG
    this.showHitMeaningPopup(targetItem.x, targetItem.y, targetItem.wordObj, pts, isStar);

    if(window.speakText){try{window.speakText(targetItem.wordObj.word);}catch(e){}}
    if(this.combo>0&&this.combo%10===0){
      if(this.lives<this.maxLives){this.lives++;this.music.playHeartRestore();this.showFloatingText(targetItem.x,targetItem.y-36,`💖 Chuỗi ${this.combo}! +1 Tim!`,'#ef4444');}
      else{this.music.playStreak();this.showFloatingText(targetItem.x,targetItem.y-36,`🔥 Chuỗi ${this.combo}! Thần Kỳ!`,'#f97316');}
    }
    const fxLayer=this.container.querySelector('#cannon-fx-layer');
    if(fxLayer){const boom=document.createElement('div');boom.className=`phidao-explosion type-${targetItem.type}`;boom.style.left=`${targetItem.x+15}px`;boom.style.top=`${targetItem.y+10}px`;fxLayer.appendChild(boom);setTimeout(()=>boom.remove(),450);}
    if(targetItem.el&&targetItem.el.parentNode)targetItem.el.parentNode.removeChild(targetItem.el);
    this.activeWords.splice(idx,1);
    if(this.lockedTarget&&this.lockedTarget.id===targetItem.id){this.lockedTarget=null;this.typedBuffer='';this.updateTypedDisplay();this.highlightTargets();}
    this.updateHUD();
    if(this.wordQueue.length===0&&this.activeWords.length===0)setTimeout(()=>this.gameOver(true),500);
  }

  showHitMeaningPopup(x, y, wordObj, pts, isStar) {
    const fxLayer = this.container.querySelector('#cannon-fx-layer');
    if (!fxLayer) return;
    const el = document.createElement('div');
    el.className = 'phidao-hit-meaning-card';
    el.innerHTML = `
      <div class="phidao-hit-top">
        <span class="phidao-hit-pts">+${pts}${isStar ? ' ✨' : ''}</span>
        <span class="phidao-hit-zh">${wordObj.word}</span>
        <span class="phidao-hit-py">[${wordObj.pinyin || ''}]</span>
      </div>
      <div class="phidao-hit-mean">💡 ${wordObj.meaning || ''}</div>
    `;
    const playfield = this.container.querySelector('#cannon-playfield');
    const pfW = playfield ? playfield.clientWidth : 600;
    const clampedX = Math.max(12, Math.min(x - 30, pfW - 200));
    el.style.left = `${clampedX}px`;
    el.style.top = `${Math.max(10, y - 10)}px`;
    fxLayer.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }

  spawnWord(){
    if(this.activeWords.length>=4)return;
    if(!this.wordQueue||this.wordQueue.length===0){if(this.activeWords.length===0)this.gameOver(true);return;}
    const playfield=this.container.querySelector('#cannon-playfield');if(!playfield)return;
    const pfW=playfield.clientWidth||600;const margin=40;
    const wordObj=this.wordQueue.pop();if(!wordObj)return;
    const isStar=Math.random()<0.15;
    const spawnX=margin+Math.random()*Math.max(0,pfW-margin*2-140);const spawnY=-20;
    // TỐC ĐỘ RƠI CHẬM VÀ ÊM ÁI
    const baseSpeed=10;const speed=baseSpeed*(0.85+Math.random()*0.25);
    const el=document.createElement('div');el.className=`phidao-word-card type-${isStar?'star':'normal'}`;
    const norm=normalizePinyin(wordObj.pinyin);
    el.innerHTML=`<div class="word-py-tone">${wordObj.pinyin||''}</div><div class="word-zh">${isStar?'✨ ':''}${wordObj.word}</div><div class="pinyin-prog"><span class="py-rem">${norm}</span></div>`;
    const item={id:`${Date.now()}_${Math.random()}`,wordObj,type:isStar?'star':'normal',x:spawnX,y:spawnY,speed,el,isDestroyed:false,isTargeted:false};
    const wordsLayer=this.container.querySelector('#cannon-words-layer');
    if(wordsLayer){wordsLayer.appendChild(el);this.activeWords.push(item);el.style.transform=`translate3d(${spawnX}px,${spawnY}px,0)`;}
  }

  loop(currentTime){
    if(!this.isRunning)return;
    if(!this.isPaused){
      const dt=Math.min(0.05,(currentTime-this.lastFrameTime)/1000);
      this.lastFrameTime=currentTime;
      this.spawnTimer+=dt*1000;
      // KHOẢNG CÁCH SINH TỪ THOÁNG ĐÃNG
      const baseInterval=3200;
      const spawnInterval=this.slowMoTimer>0?baseInterval*1.8:baseInterval;
      if(this.spawnTimer>=spawnInterval){this.spawnTimer=0;this.spawnWord();}
      const playfield=this.container.querySelector('#cannon-playfield');
      const groundY=playfield?playfield.clientHeight-60:450;
      const speedMod=this.slowMoTimer>0?0.35:1.0;
      for(let i=this.activeWords.length-1;i>=0;i--){
        const item=this.activeWords[i];if(item.isDestroyed)continue;
        item.y+=item.speed*speedMod*dt;
        if(item.el)item.el.style.transform=`translate3d(${item.x}px,${item.y}px,0)`;
        if(item.y>=groundY){
          if(item.el&&item.el.parentNode)item.el.parentNode.removeChild(item.el);
          this.activeWords.splice(i,1);
          if(this.lockedTarget&&this.lockedTarget.id===item.id){this.lockedTarget=null;this.typedBuffer='';this.updateTypedDisplay();}
          if(this.shieldActive){this.shieldActive=false;this.shieldTimer=0;this.showFloatingText(item.x,groundY-20,'🛡️ Lá Chắn Chặn!','#38bdf8');}
          else{this.lives--;this.combo=0;this.music.playMiss();this.showMissFlash();this.showFloatingText(item.x,groundY-22,`💔 ${item.wordObj.word} (${item.wordObj.meaning || ''})`,'#ef4444');}
          if(this.lives<=0){this.gameOver(false);return;}
          this.updateHUD();
        }
      }
    }else{this.lastFrameTime=currentTime;}
    this.animFrameId=requestAnimationFrame(t=>this.loop(t));
  }

  showMissFlash(){
    const pf=this.container.querySelector('#cannon-playfield');if(!pf)return;
    const el=document.createElement('div');el.className='phidao-miss-flash';pf.appendChild(el);setTimeout(()=>el.remove(),380);
  }

  startTimers(){
    if(this.timerInterval)clearInterval(this.timerInterval);
    this.timerInterval=setInterval(()=>{
      if(!this.isRunning||this.isPaused)return;
      if(this.slowMoTimer>0)this.slowMoTimer--;
      if(this.score2xTimer>0)this.score2xTimer--;
      if(this.shieldTimer>0){this.shieldTimer--;if(this.shieldTimer===0)this.shieldActive=false;}
      this.updateBuffBanner();
      this.updateHUD();
    },1000);
  }

  showCenterTick(num){}

  updateBuffBanner(){
    const banner=this.container.querySelector('#cannon-buff-banner');if(!banner)return;
    const buffs=[];
    if(this.slowMoTimer>0)buffs.push(`❄️ Mưa Băng (${this.slowMoTimer}s)`);
    if(this.score2xTimer>0)buffs.push(`⭐ Nhân Điểm (${this.score2xTimer}s)`);
    if(this.shieldTimer>0)buffs.push(`🛡️ Lá Chắn (${this.shieldTimer}s)`);
    banner.style.display=buffs.length>0?'block':'none';banner.textContent=buffs.join('  |  ');
  }

  activateSkill(skillKey){
    const costs={ice:10,heal:20,x2:30,shield:20};const cost=costs[skillKey]||999;
    if(this.combo<cost){this.showToast(`Cần ${cost} Combo (Hiện: ${this.combo})`);return;}
    this.combo-=cost;this.music.playStreak();
    if(skillKey==='ice'){this.slowMoTimer=6;this.showToast('❄️ Mưa Băng: Làm chậm 6s!');}
    else if(skillKey==='heal'){if(this.lives<this.maxLives){this.lives++;this.music.playHeartRestore();this.showToast('💚 +1 Tim!');}else this.showToast('💚 Tim đã đầy!');}
    else if(skillKey==='x2'){this.score2xTimer=8;this.showToast('⭐ Nhân Đôi Điểm 8s!');}
    else if(skillKey==='shield'){this.shieldActive=true;this.shieldTimer=6;this.showToast('🛡️ Lá Chắn Bảo Vệ 6s!');}
    this.updateBuffBanner();this.updateHUD();
  }

  updateHUD(){
    const scoreEl=this.container.querySelector('#cannon-score-val');
    const comboEl=this.container.querySelector('#cannon-combo-val');
    const livesEl=this.container.querySelector('#cannon-lives-container');
    if(scoreEl)scoreEl.textContent=this.score;
    if(comboEl)comboEl.textContent=`x${this.combo}`;
    if(livesEl){livesEl.innerHTML='';for(let i=0;i<this.maxLives;i++){const ic=document.createElement('i');const alive=i<this.lives;ic.className=alive?'fa-solid fa-heart':'fa-regular fa-heart';ic.style.color=alive?'#ef4444':'rgba(255,255,255,.2)';livesEl.appendChild(ic);}}
    this.container.querySelectorAll('.phidao-skill-btn').forEach(btn=>btn.classList.toggle('affordable',this.combo>=parseInt(btn.dataset.cost,10)));
  }

  showFloatingText(x,y,text,color){
    const fxLayer=this.container.querySelector('#cannon-fx-layer');if(!fxLayer)return;
    const el=document.createElement('div');el.className='phidao-float-text';el.textContent=text;
    el.style.cssText=`left:${x}px;top:${y}px;color:${color};`;fxLayer.appendChild(el);setTimeout(()=>el.remove(),950);
  }

  showToast(msg){if(typeof window.showToast==='function')window.showToast(msg);}

  togglePause(){
    this.isPaused=!this.isPaused;
    const btn=this.container.querySelector('#cannon-pause-btn');
    if(btn)btn.innerHTML=`<i class="fa-solid fa-${this.isPaused?'play':'pause'}"></i>`;
    if(this.isPaused)this.music.stop();else this.music.start();
    this.showToast(this.isPaused?'⏸ Đã tạm dừng':'▶️ Tiếp tục');
  }

  start(){
    if(this.animFrameId){cancelAnimationFrame(this.animFrameId);this.animFrameId=null;}
    if(this.timerInterval){clearInterval(this.timerInterval);this.timerInterval=null;}
    this.isStopping=false;this.isRunning=true;this.isPaused=false;
    this.score=0;this.combo=0;this.maxCombo=0;this.lives=3;
    this.activeWords=[];this.wordsDestroyedCount=0;this.correctWordsSet=new Set();
    this.typedBuffer='';this.lockedTarget=null;
    this.wordQueue=[...this.rawWords].sort(()=>Math.random()-0.5);
    this.slowMoTimer=0;this.score2xTimer=0;this.shieldActive=false;this.shieldTimer=0;
    this.lastFrameTime=performance.now();this.spawnTimer=0;
    const overlay=this.container.querySelector('#cannon-modal-overlay');if(overlay)overlay.style.setProperty('display','none','important');
    const wordsLayer=this.container.querySelector('#cannon-words-layer');if(wordsLayer)wordsLayer.innerHTML='';
    const fxLayer=this.container.querySelector('#cannon-fx-layer');if(fxLayer)fxLayer.innerHTML='';
    this.updateHUD();this.updateTypedDisplay();this.startTimers();this.music.start();
    this.animFrameId=requestAnimationFrame(t=>this.loop(t));
  }

  gameOver(isVictory){
    this.isRunning=false;
    if(this.timerInterval){clearInterval(this.timerInterval);this.timerInterval=null;}
    if(this.animFrameId){cancelAnimationFrame(this.animFrameId);this.animFrameId=null;}
    this.music.stop();

    const overlay=this.container.querySelector('#cannon-modal-overlay');
    if(!overlay)return;
    overlay.style.setProperty('display','flex','important');

    if(isVictory){
      this.music.playVictory();
      this.container.querySelector('#cannon-result-icon').textContent='🏆';
      this.container.querySelector('#cannon-result-title').textContent='Phi Đao Thần Sầu!';
      this.container.querySelector('#cannon-result-desc').textContent=`Bạn đã xuất sắc bắn hạ ${this.wordsDestroyedCount}/${this.rawWords.length} từ vựng!`;
    }else{
      this.music.playGameOver();
      this.container.querySelector('#cannon-result-icon').textContent='💔';
      this.container.querySelector('#cannon-result-title').textContent='Hết Tim - Kết Thúc Lượt Chơi!';
      this.container.querySelector('#cannon-result-desc').textContent='Đừng nản lòng! Hãy gõ pinyin thật nhanh và xem lại các từ vựng bên dưới nhé.';
    }

    this.container.querySelector('#res-score').textContent=this.score;
    this.container.querySelector('#res-combo').textContent=this.maxCombo;
    this.container.querySelector('#res-words').textContent=`${this.wordsDestroyedCount}/${this.rawWords.length}`;

    const wrongWords = this.rawWords.filter(w => !this.correctWordsSet.has(w.word));
    const retryWrongBtn = overlay.querySelector('#cannon-retry-wrong-btn');
    const wrongCountSpan = overlay.querySelector('#wrong-count-span');

    if (retryWrongBtn) {
      if (wrongWords.length > 0) {
        retryWrongBtn.style.display = 'inline-flex';
        if (wrongCountSpan) wrongCountSpan.textContent = wrongWords.length;
        retryWrongBtn.onclick = (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.retryWithWords(wrongWords);
        };
      } else {
        retryWrongBtn.style.display = 'none';
      }
    }

    const sw=overlay.querySelector('#cannon-words-summary-wrap');
    if(sw)this.renderWordSummaryList(sw,this.rawWords,this.correctWordsSet);

    [['#cannon-modal-close-x',()=>this.stopAndExit()],
     ['#cannon-retry-btn',()=>this.restart()],
     ['#cannon-back-hub-btn',()=>this.stopAndExit()],
     ['#cannon-finish-btn',()=>{this.stopAndExit();if(typeof window.exitNotebookGamesHub==='function')window.exitNotebookGamesHub();}]
    ].forEach(([sel,fn])=>{
      const btn=overlay.querySelector(sel);
      if(btn)btn.onclick=e=>{e.preventDefault();e.stopPropagation();fn();};
    });
  }

  renderWordSummaryList(containerEl,allWords,correctSet){
    if(!containerEl)return;
    const total=allWords.length;
    const correctCount=allWords.filter(w=>correctSet.has(w.word)).length;
    const wrongCount=total-correctCount;

    containerEl.innerHTML=`
      <div class="game-results-word-summary">
        <div class="summary-tabs-header">
          <button class="summary-tab-btn active" data-tab="all"><i class="fa-solid fa-list-check"></i> Tất cả (${total})</button>
          <button class="summary-tab-btn correct-tab" data-tab="correct"><i class="fa-solid fa-circle-check"></i> Đúng (${correctCount})</button>
          <button class="summary-tab-btn wrong-tab" data-tab="wrong"><i class="fa-solid fa-circle-xmark"></i> Cần ôn (${wrongCount})</button>
        </div>
        <div class="summary-words-list"></div>
      </div>`;

    const listEl=containerEl.querySelector('.summary-words-list');
    const render=(filter)=>{
      listEl.innerHTML='';
      const items=allWords.filter(w=>{
        const ok=correctSet.has(w.word);
        if(filter==='correct')return ok;
        if(filter==='wrong')return !ok;
        return true;
      });
      if(!items.length){
        listEl.innerHTML=`<div style="text-align:center;color:#64748b;padding:16px;font-size:.85rem;">Không có từ vựng nào trong mục này.</div>`;
        return;
      }
      items.forEach(w=>{
        const ok=correctSet.has(w.word);
        const card=document.createElement('div');
        card.className=`summary-word-card ${ok?'is-correct':'is-wrong'}`;
        card.title='Nhấn để nghe phát âm';
        card.innerHTML=`
          <div class="sw-badge ${ok?'badge-correct':'badge-wrong'}">
            <i class="fa-solid fa-${ok?'check':'xmark'}"></i> ${ok?'Đúng':'Cần ôn'}
          </div>
          <div class="sw-main">
            <div class="sw-hanzi">${w.word}</div>
            <div class="sw-pinyin">${w.pinyin?`[ ${w.pinyin} ]`:''}</div>
            <div class="sw-meaning">${w.meaning||''}</div>
          </div>
          <button type="button" class="sw-speak-btn" title="Nghe phát âm">
            <i class="fa-solid fa-volume-high"></i>
          </button>`;

        card.onclick=()=>{
          if(typeof window.speakText==='function')window.speakText(w.word);
        };
        const sb=card.querySelector('.sw-speak-btn');
        if(sb)sb.onclick=e=>{
          e.stopPropagation();
          if(typeof window.speakText==='function')window.speakText(w.word);
        };
        listEl.appendChild(card);
      });
    };

    render('all');
    containerEl.querySelectorAll('.summary-tab-btn').forEach(btn=>{
      btn.addEventListener('click',e=>{
        e.preventDefault();
        containerEl.querySelectorAll('.summary-tab-btn').forEach(b=>b.classList.remove('active'));
        btn.classList.add('active');
        render(btn.dataset.tab);
      });
    });
  }

  retryWithWords(customWords) {
    const overlay=this.container.querySelector('#cannon-modal-overlay');
    if(overlay)overlay.style.setProperty('display','none','important');
    const wl=this.container.querySelector('#cannon-words-layer');if(wl)wl.innerHTML='';
    const fl=this.container.querySelector('#cannon-fx-layer');if(fl)fl.innerHTML='';

    const origWords = this.rawWords;
    this.rawWords = customWords;
    this.start();
    this.rawWords = origWords; // restore for subsequent full retries
  }

  restart(){
    const overlay=this.container.querySelector('#cannon-modal-overlay');if(overlay)overlay.style.setProperty('display','none','important');
    const wl=this.container.querySelector('#cannon-words-layer');if(wl)wl.innerHTML='';
    const fl=this.container.querySelector('#cannon-fx-layer');if(fl)fl.innerHTML='';
    this.start();
  }

  stopAndExit(){
    this.isRunning=false;this.isStopping=true;this.music.stop();
    if(this.timerInterval){clearInterval(this.timerInterval);this.timerInterval=null;}
    if(this.animFrameId){cancelAnimationFrame(this.animFrameId);this.animFrameId=null;}
    if(this.keyHandler){window.removeEventListener('keydown',this.keyHandler);this.keyHandler=null;}
    const wl=this.container.querySelector('#cannon-words-layer');if(wl)wl.innerHTML='';
    const fl=this.container.querySelector('#cannon-fx-layer');if(fl)fl.innerHTML='';
    const cb=this.onExit;this.onExit=null;if(typeof cb==='function')cb();
  }
}
