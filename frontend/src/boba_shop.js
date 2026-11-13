/**
 * Tiệm Trà Sữa Của Tôi (我的奶茶店) — chia 3 giai đoạn như Tiệm Tạp Hóa:
 *   1. 点单台 Đón khách: khách xếp hàng, gọi món bằng tiếng Trung → nhận đơn
 *   2. 调制台 Pha chế: ① chọn ly & nhấn giữ rót trà tới vạch ② độ ngọt & lượng đá ③ topping & đóng nắp
 *   3. 收银台 Tính tiền: tự tính tiền thối, lấy đúng tờ tiền/đồng xu → chấm điểm
 * Ngày tính theo giờ (08:00 → 20:00), mở thêm loại trà/topping bằng tiền, lưu tiến trình theo tài khoản,
 * bảng xếp hạng giữ thành tích cao nhất.
 *
 * Lưu ý: file còn được nạp dạng <script> thường khi mở bằng file:// → không dùng import/export.
 */

// ============================================================================
// 1. ÂM THANH
// ============================================================================
class BobaAudio {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.voiceEnabled = true;
    this.voices = [];
    this.pourNode = null;
    if ('speechSynthesis' in window) {
      const load = () => { try { this.voices = window.speechSynthesis.getVoices(); } catch (e) {} };
      load();
      try { window.speechSynthesis.onvoiceschanged = load; } catch (e) {}
    }
  }

  init() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) { try { this.ctx = new AC(); } catch (e) { this.ctx = null; } }
    }
    if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
  }

  tone(freq, dur, { type = 'sine', vol = 0.25, delay = 0, slideTo = null } = {}) {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  pop() { this.tone(420, 0.09, { slideTo: 700, vol: 0.2 }); }
  pick() { this.tone(330, 0.08, { slideTo: 560, vol: 0.22 }); }
  plop() { this.tone(240, 0.12, { slideTo: 120, vol: 0.25, type: 'triangle' }); }
  ice() { this.tone(2200, 0.06, { vol: 0.12 }); this.tone(2900, 0.05, { vol: 0.1, delay: 0.05 }); }
  seal() { this.tone(160, 0.18, { type: 'square', vol: 0.12, slideTo: 90 }); this.tone(900, 0.12, { vol: 0.15, delay: 0.12 }); }
  coin() { this.tone(1800, 0.12, { vol: 0.16 }); this.tone(2400, 0.12, { vol: 0.14, delay: 0.03 }); }
  bell() { this.tone(1320, 0.5, { type: 'triangle', vol: 0.2 }); this.tone(1980, 0.4, { type: 'triangle', vol: 0.1, delay: 0.05 }); }
  error() { this.tone(160, 0.3, { type: 'sawtooth', vol: 0.22, slideTo: 110 }); }
  register() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, 0.32, { type: 'triangle', vol: 0.22, delay: i * 0.08 })); }
  sad() { this.tone(400, 0.35, { type: 'triangle', vol: 0.18, slideTo: 220 }); }
  unlock() { [659.25, 880, 1174.66].forEach((f, i) => this.tone(f, 0.28, { type: 'triangle', vol: 0.2, delay: i * 0.09 })); }
  drain() { this.tone(380, 0.25, { vol: 0.25, slideTo: 140 }); }

  // Tiếng rót trà liên tục (tiếng ồn trắng lọc thấp)
  startPour() {
    if (!this.sfxEnabled) return;
    this.init();
    if (!this.ctx || this.pourNode) return;
    try {
      const len = this.ctx.sampleRate;
      const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 900;
      const gain = this.ctx.createGain();
      gain.gain.value = 0.08;
      src.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      src.start();
      this.pourNode = src;
    } catch (e) { this.pourNode = null; }
  }

  stopPour() {
    if (this.pourNode) { try { this.pourNode.stop(); } catch (e) {} this.pourNode = null; }
  }

  speak(text) {
    if (!this.voiceEnabled || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = 'zh-CN';
      u.rate = 0.88;
      u.pitch = 1.05;
      if (!this.voices.length) this.voices = window.speechSynthesis.getVoices();
      const zh = this.voices.find(v => /zh|cmn/i.test(v.lang));
      if (zh) u.voice = zh;
      window.speechSynthesis.speak(u);
    } catch (e) {}
  }
}

// ============================================================================
// 2. DỮ LIỆU: LY · TRÀ · TOPPING · ĐƯỜNG · ĐÁ · KHÁCH · TỪ VỰNG
// ============================================================================
const SIZES = [
  { id: 'S', chn: '小杯', pin: 'xiǎo bēi', vi: 'ly nhỏ', price: 10, scale: 0.8 },
  { id: 'M', chn: '中杯', pin: 'zhōng bēi', vi: 'ly vừa', price: 12, scale: 0.9 },
  { id: 'L', chn: '大杯', pin: 'dà bēi', vi: 'ly lớn', price: 14, scale: 1 }
];

// premium: tiền cộng thêm theo loại trà; unlockCost 0 = có sẵn
const TEAS = [
  { id: 'milktea', chn: '奶茶', pin: 'nǎichá', vi: 'trà sữa', color: '#d9a066', premium: 0, unlockCost: 0 },
  { id: 'blacktea', chn: '红茶', pin: 'hóngchá', vi: 'hồng trà', color: '#8b3a12', premium: 0, unlockCost: 0 },
  { id: 'greentea', chn: '绿茶', pin: 'lǜchá', vi: 'lục trà', color: '#9cc24a', premium: 0, unlockCost: 20 },
  { id: 'oolong', chn: '乌龙茶', pin: 'wūlóngchá', vi: 'trà ô long', color: '#c27a26', premium: 1, unlockCost: 35 },
  { id: 'matcha', chn: '抹茶', pin: 'mǒchá', vi: 'trà matcha', color: '#5f9e2f', premium: 2, unlockCost: 50 },
  { id: 'milk', chn: '鲜奶', pin: 'xiānnǎi', vi: 'sữa tươi', color: '#f4efe6', premium: 2, unlockCost: 70 },
  { id: 'taro', chn: '芋泥奶茶', pin: 'yùní nǎichá', vi: 'trà sữa khoai môn', color: '#b58bc4', premium: 4, unlockCost: 90 }
];

const TOPPINGS = [
  { id: 'boba', chn: '珍珠', pin: 'zhēnzhū', vi: 'trân châu đen', icon: '⚫', color: '#2a1810', price: 2, unlockCost: 0 },
  { id: 'coconut', chn: '椰果', pin: 'yēguǒ', vi: 'thạch dừa', icon: '🥥', color: '#f3f7fb', price: 2, unlockCost: 15 },
  { id: 'redbean', chn: '红豆', pin: 'hóngdòu', vi: 'đậu đỏ', icon: '🫘', color: '#8b1e1e', price: 2, unlockCost: 30 },
  { id: 'whiteboba', chn: '白珍珠', pin: 'bái zhēnzhū', vi: 'trân châu trắng', icon: '⚪', color: '#f1f5f9', price: 2, unlockCost: 40 },
  { id: 'matchajelly', chn: '抹茶冻', pin: 'mǒchá dòng', vi: 'thạch matcha', icon: '🟩', color: '#4f8a1c', price: 3, unlockCost: 55 },
  { id: 'mango', chn: '芒果布丁', pin: 'mángguǒ bùdīng', vi: 'pudding xoài', icon: '🥭', color: '#f5b52e', price: 3, unlockCost: 70 },
  { id: 'taroball', chn: '芋圆', pin: 'yùyuán', vi: 'khoai dẻo', icon: '🍠', color: '#b07ad6', price: 3, unlockCost: 90 }
];

const SUGARS = [
  { id: 'no_sugar', chn: '无糖', pin: 'wú táng', vi: 'không đường', pct: 0 },
  { id: 'micro_sugar', chn: '微糖', pin: 'wēi táng', vi: 'hơi ngọt (30%)', pct: 30 },
  { id: 'half_sugar', chn: '半糖', pin: 'bàn táng', vi: 'nửa đường (50%)', pct: 50 },
  { id: 'less_sugar', chn: '少糖', pin: 'shǎo táng', vi: 'ít đường (70%)', pct: 70 },
  { id: 'extra_sugar', chn: '多糖', pin: 'duō táng', vi: 'nhiều đường (100%)', pct: 100 }
];

const ICES = [
  { id: 'no_ice', chn: '去冰', pin: 'qù bīng', vi: 'không đá', cubes: 0, label: '0%' },
  { id: 'less_ice', chn: '少冰', pin: 'shǎo bīng', vi: 'ít đá', cubes: 2, label: '30%' },
  { id: 'regular_ice', chn: '正常冰', pin: 'zhèngcháng bīng', vi: 'đá vừa', cubes: 4, label: '50%' },
  { id: 'extra_ice', chn: '多冰', pin: 'duō bīng', vi: 'nhiều đá', cubes: 6, label: '100%' }
];

const CUSTOMERS = [
  { id: 'xiaoyu', nameChn: '小雨', nameVi: 'Bé Mưa', img: 'boba_customer_girl.jpg' },
  { id: 'xiaohao', nameChn: '小浩', nameVi: 'Tiểu Hạo', img: 'boba_customer_boy.jpg' },
  { id: 'xiaotong', nameChn: '晓彤', nameVi: 'Hiểu Đồng', img: 'boba_customer_xiaotong.jpg' },
  { id: 'linjie', nameChn: '林姐', nameVi: 'Chị Lâm', img: 'boba_customer_linjie.jpg' },
  { id: 'wangshu', nameChn: '王叔', nameVi: 'Chú Vương', img: 'boba_customer_wangshu.jpg' },
  { id: 'grandma', nameChn: '李奶奶', nameVi: 'Bà Lý', img: 'boba_customer_grandma.jpg' },
  { id: 'abao', nameChn: '阿宝', nameVi: 'Gấu A Bảo', img: 'boba_customer_abao.jpg' }
];

const MARKET_ZONES = [
  { id: 'teas', chn: '茶底', pin: 'chádǐ', vi: 'Loại trà', short: 'Loại trà', icon: '🍵' },
  { id: 'toppings', chn: '配料', pin: 'pèiliào', vi: 'Topping', short: 'Topping', icon: '🧋' }
];

// Từ lóng / khẩu ngữ hay gặp trong đánh giá của khách → tự vào sổ từ vựng khi khách viết đánh giá có từ đó
const REVIEW_SLANG = [
  { chn: 'Q弹', pin: 'Q tán', vi: 'dai dai, dẻo (trân châu, thạch)', match: 'Q弹' },
  { chn: '真绝', pin: 'zhēn jué', vi: 'đỉnh thật, tuyệt cú mèo', match: '真绝' },
  { chn: '刚刚好', pin: 'gānggāng hǎo', vi: 'vừa xinh, vừa chuẩn', match: '刚刚好' },
  { chn: '满分好评', pin: 'mǎnfēn hǎopíng', vi: 'khen 10 điểm, đánh giá tuyệt đối', match: '满分好评' },
  { chn: '必备', pin: 'bìbèi', vi: 'thứ không thể thiếu', match: '必备' },
  { chn: '清甜爽口', pin: 'qīngtián shuǎngkǒu', vi: 'ngọt thanh, mát miệng', match: '清甜爽口' },
  { chn: '正宗', pin: 'zhèngzōng', vi: 'chuẩn vị, chính gốc', match: '正宗' },
  { chn: '见底', pin: 'jiàndǐ', vi: 'uống cạn tới đáy (ngon tới giọt cuối)', match: '见底' },
  { chn: '性价比高', pin: 'xìngjiàbǐ gāo', vi: 'đáng đồng tiền, giá hời', match: '性价比高' },
  { chn: '一般般', pin: 'yìbānbān', vi: 'tàm tạm, bình thường thôi', match: '一般般' },
  { chn: '粗心', pin: 'cūxīn', vi: 'cẩu thả, bất cẩn', match: '粗心' },
  { chn: '等得花儿都谢了', pin: 'děng de huār dōu xiè le', vi: 'chờ đến hoa cũng tàn (chờ dài cổ)', match: '等得花儿都谢了' }
];

const VOCAB_TABS = [
  { id: 'teas', label: '🍵 Loại trà', words: TEAS.map(t => ({ chn: t.chn, pin: t.pin, vi: t.vi })) },
  { id: 'toppings', label: '🧋 Topping', words: TOPPINGS.map(t => ({ chn: t.chn, pin: t.pin, vi: t.vi })) },
  { id: 'sizes', label: '🥤 Cỡ ly', words: SIZES.map(s => ({ chn: s.chn, pin: s.pin, vi: s.vi })) },
  { id: 'sugarice', label: '🍬 Đường & đá', words: [...SUGARS, ...ICES].map(x => ({ chn: x.chn, pin: x.pin, vi: x.vi })) },
  {
    id: 'business', label: '🏪 Gọi món',
    words: [
      { chn: '奶茶店', pin: 'nǎichá diàn', vi: 'tiệm trà sữa' },
      { chn: '欢迎光临', pin: 'huānyíng guānglín', vi: 'chào mừng quý khách' },
      { chn: '老板', pin: 'lǎobǎn', vi: 'ông chủ, chủ quán' },
      { chn: '菜单', pin: 'càidān', vi: 'thực đơn' },
      { chn: '不加料', pin: 'bù jiā liào', vi: 'không thêm topping' },
      { chn: '封口', pin: 'fēngkǒu', vi: 'đóng nắp (ép miệng ly)' },
      { chn: '倒掉', pin: 'dàodiào', vi: 'đổ đi' },
      { chn: '抱歉', pin: 'bàoqiàn', vi: 'xin lỗi' },
      { chn: '破产', pin: 'pòchǎn', vi: 'phá sản' },
      { chn: '一共', pin: 'yígòng', vi: 'tổng cộng' },
      { chn: '找零', pin: 'zhǎolíng', vi: 'thối tiền' },
      { chn: '进货', pin: 'jìnhuò', vi: 'nhập hàng' },
      { chn: '营业', pin: 'yíngyè', vi: 'mở cửa kinh doanh' },
      { chn: '打烊', pin: 'dǎyàng', vi: 'đóng cửa tiệm' },
      { chn: '猫', pin: 'māo', vi: 'con mèo' }
    ]
  },
  { id: 'slang', label: '💬 Từ lóng', words: REVIEW_SLANG.map(w => ({ chn: w.chn, pin: w.pin, vi: w.vi })) }
];
function markSlang(zhEscaped) {
  let out = zhEscaped;
  REVIEW_SLANG.forEach(w => {
    if (!out.includes(w.match)) return;
    out = out.split(w.match).join(`<span class="slang" data-slang="${REVIEW_SLANG.indexOf(w)}" title="${w.pin} · ${w.vi}">${w.match}</span>`);
  });
  return out;
}
const VOCAB_TOTAL = VOCAB_TABS.reduce((s, t) => s + t.words.length, 0);

// ============================================================================
// 3. LUẬT CHƠI
// ============================================================================
const DAY_RULES = { lengthMs: 120000, openMin: 8 * 60, closeMin: 20 * 60 }; // 1 ngày = 2 phút thật

const QUEUE_RULES = {
  maxLine: 4,
  patienceMs: 42000,       // chờ quá 42s mà chưa được nhận đơn → bỏ về
  firstArrivalMs: 400,     // 0.4s khách đầu tiên ghé ngay
  arriveBaseMs: 7500,      // khách đến tấp nập, đều đặn 7-9s
  arrivePerDayMs: 400,
  arriveMinMs: 4500,
  arriveJitterMs: 2000
};

const INGREDIENT_RULES = {
  batchPortions: 5,       // mỗi lần nấu ra 5 phần
  teaBatchCost: 5.0,      // chi phí 1 mẻ trà (5 phần) = 5.00 ¥
  toppingBatchCost: 4.0   // chi phí 1 mẻ topping (5 phần) = 4.00 ¥
};

const PRAISE_REVIEWS = [
  { zh: '太好喝了！珍珠很Q弹，甜度也刚刚好，老板手艺真绝！', vi: 'Ngon tuyệt cú mèo! Trân châu dẻo dai vừa miệng, vị ngọt đúng chuẩn, chủ quán pha siêu đỉnh!' },
  { zh: '出餐速度很快，茶香浓郁，冰块给得正合适，满分好评！', vi: 'Phục vụ siêu nhanh, trà thơm lừng, lượng đá chuẩn chỉnh không chê vào đâu được! 5 sao!' },
  { zh: '非常满意！这家奶茶店已经成了我的每日必备！', vi: 'Cực kỳ hài lòng! Tiệm trà sữa này chính là quán ruột mỗi ngày của mình!' },
  { zh: '老板很热情，算账找零又快又准，奶茶清甜爽口！', vi: 'Chủ quán niềm nở, tính tiền chuẩn xác, trà thanh mát uống đã cơn khát!' },
  { zh: '茶底很正宗，配料给得很足，喝到见底还想再来一杯！', vi: 'Vị trà chuẩn đét, topping đầy đặn, uống hết ly mà vẫn thòm thèm muốn uống thêm!' }
];

const GOOD_REVIEWS = [
  { zh: '味道挺不错的，就是排队等得有点久，总体很满意！', vi: 'Trà khá ngon, chỉ là phải xếp hàng chờ hơi lâu chút xíu, nhìn chung rất hài lòng!' },
  { zh: '茶味很浓，配料很新鲜，下次还会来！', vi: 'Vị trà đậm đà, nguyên liệu tươi mới, lần sau nhất định ghé lại!' },
  { zh: '杯子包装很好看，甜度合适，性价比高！', vi: 'Ly đóng nắp đẹp, độ ngọt vừa phải, giá cả rất hợp lý!' },
  { zh: '服务态度很好，奶茶味道纯正！', vi: 'Thái độ phục vụ rất tốt, hương vị trà sữa thanh khiết!' }
];

const OK_REVIEWS = [
  { zh: '味道一般般，冰块化了之后茶味有点淡。', vi: 'Uống tạm được, nhưng đá tan ra làm trà hơi nhạt một chút.' },
  { zh: '速度稍微有点慢，希望人多的时候能再快点。', vi: 'Làm hơi chậm một xíu, hy vọng lúc đông khách quán đẩy nhanh tốc độ hơn.' },
  { zh: '感觉甜度比我平时喝的偏甜了一点点。', vi: 'Cảm giác độ ngọt hơi đậm hơn so với khẩu vị thường ngày của mình.' }
];

const BAD_REVIEWS = [
  { zh: '做错了配方，完全不是我想要的味道，很失望！', vi: 'Pha sai công thức rồi, hoàn toàn không đúng vị tôi dặn, rất thất vọng!' },
  { zh: '太甜了，跟点了全糖一样，根本喝不下去！', vi: 'Ngọt quá, như cho 100% đường vậy, không uống nổi luôn!' },
  { zh: '等了大半天，找零还算错了好几次，服务太粗心了！', vi: 'Chờ cả buổi mà thối tiền còn sai tới sai lui, làm ăn quá bất cẩn!' },
  { zh: '忘加我最喜欢的配料了，太难过了！', vi: 'Quên cho topping ruột của tôi rồi, buồn quá!' }
];

const MISSION_RULES = { baseTarget: 70, targetPerDay: 15, maxTarget: 300, roundTo: 5, baseMaxLost: 2, minAvgScore: 80, bonusPerStar: 10 };

const POUR_RULES = { target: 80, ratePerSec: 28, tickMs: 50 };

const SCORE_RULES = {
  changePenalty: 30,
  hintPenalty: 20,
  speedBaseMs: 40000,
  trashPenaltyMs: 8000,
  tipMax: 6,
  weights: { pick: 0.4, speed: 0.15, change: 0.25, wait: 0.2 }
};

// Mẫu câu giao tiếp tính tiền thực tế (Hỏi giá, Tính tiền, Thối tiền, Cảm ơn)
const CHECKOUT_PHRASES = [
  { role: 'Khách', roleZh: '顾客', chn: '老板，一共多少钱？', pin: 'Lǎobǎn, yīgòng duōshao qián?', vi: 'Ông chủ, tổng cộng bao nhiêu tiền?' },
  { role: 'Khách', roleZh: '顾客', chn: '请问一杯多少钱？', pin: 'Qǐngwèn yì bēi duōshao qián?', vi: 'Xin hỏi một ly bao nhiêu tiền?' },
  { role: 'Khách', roleZh: '顾客', chn: '大杯和中杯差多少钱？', pin: 'Dà bēi hé zhōng bēi chà duōshao qián?', vi: 'Ly lớn và ly vừa chênh bao nhiêu tiền?' },
  { role: 'Chủ quán', roleZh: '店家', chn: '一共是十五块钱。', pin: 'Yīgòng shì shíwǔ kuài qián.', vi: 'Tổng cộng là mười lăm đồng ạ.' },
  { role: 'Khách', roleZh: '顾客', chn: '微信还是现金支付？', pin: 'Wēixìn háishì xiànjīn zhīfù?', vi: 'Quét WeChat hay trả tiền mặt vậy?' },
  { role: 'Chủ quán', roleZh: '店家', chn: '都可以，扫这里就行。', pin: 'Dōu kěyǐ, sǎo zhèlǐ jiù xíng.', vi: 'Đều được ạ, quét ở đây là được.' },
  { role: 'Khách', roleZh: '顾客', chn: '给您钱，正好不用找。', pin: 'Gěi nín qián, zhènghǎo bú yòng zhǎo.', vi: 'Gửi bạn tiền, vừa đủ không cần thối.' },
  { role: 'Chủ quán', roleZh: '店家', chn: '收您五十，找您三十五块。', pin: 'Shōu nín wǔshí, zhǎo nín sānshíwǔ kuài.', vi: 'Nhận của bạn 50, thối lại bạn 35 đồng.' },
  { role: 'Chủ quán', roleZh: '店家', chn: '找您零钱，请数一数。', pin: 'Zhǎo nín língqián, qǐng shǔ yi shǔ.', vi: 'Thối bạn tiền thừa, bạn đếm lại nhé.' },
  { role: 'Khách', roleZh: '顾客', chn: '找零一分不差，谢谢！', pin: 'Zhǎolíng yì fēn bù chà, xièxie!', vi: 'Thối tiền chuẩn từng xu, cảm ơn bạn!' },
  { role: 'Khách', roleZh: '顾客', chn: '太好喝了！下次我还来！', pin: 'Tài hǎohē le! Xià cì wǒ hái lái!', vi: 'Ngon tuyệt cú mèo! Lần sau tôi lại đến!' },
  { role: 'Khách', roleZh: '顾客', chn: '谢谢老板，服务真好！', pin: 'Xièxie lǎobǎn, fúwù zhēn hǎo!', vi: 'Cảm ơn chủ quán, phục vụ tốt quá!' },
  { role: 'Chủ quán', roleZh: '店家', chn: '慢走，欢迎下次光临！', pin: 'Màn zǒu, huānyíng xià cì guānglín!', vi: 'Đi thong thả, hoan nghênh lần sau lại ghé!' }
];

const START_MONEY = 80;
const STAGE_W = 1280;
const STAGE_H = 720;
const PORTRAIT_W = 480;
const PORTRAIT_MIN_H = 900;   // chiều cao tối thiểu khung dọc (tablet 3:4 → 675×900)
const STATION_ORDER = ['view-order-station', 'view-make-station', 'view-change-station'];
const SAVE_VERSION = 2;
const ASSET = (f) => `./assets/${f}`;
const cents = (v) => Math.round(Number(v) * 100);
const fmt = (v) => (Math.round(Number(v) * 100) / 100).toFixed(2);
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pickOne = (arr) => arr[randInt(0, arr.length - 1)];
const byId = (arr, id) => arr.find(x => x.id === id);
const freshCup = () => ({ size: null, tea: null, fill: 0, mixed: false, spilled: false, sugar: null, ice: null, toppings: [], lid: false });

// ============================================================================
// 4. MÁY CHỦ: TÀI KHOẢN, LƯU TIẾN TRÌNH, BẢNG XẾP HẠNG
// ============================================================================
const GameCloud = {
  key: 'boba',
  apiBase() {
    const h = window.location.hostname;
    if (window.location.protocol === 'file:' || h === 'localhost' || h === '127.0.0.1' || h === '') return 'http://localhost:5000';
    if (h.includes('tieng-trung-hong-tai-1.onrender.com')) return 'https://tiengtrunghongtai.online';
    return window.location.origin;
  },
  token() {
    try {
      const t = localStorage.getItem('session_token') || localStorage.getItem('sessionToken') || '';
      return t && t !== 'null' && t !== 'undefined' && t !== 'guest' ? t : '';
    } catch (e) { return ''; }
  },
  // Trang chính coi là đã đăng nhập khi có token HOẶC có thông tin user (đăng nhập Google không phải lúc nào cũng có token)
  signedIn() { return !!(this.token() || this.localUser()); },
  localUser() {
    try {
      const u = JSON.parse(localStorage.getItem('user') || localStorage.getItem('currentUser') || 'null');
      return u && u.email ? u : null;
    } catch (e) { return null; }
  },
  async request(path, options = {}, timeoutMs = 8000) {
    const ctrl = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timer = ctrl ? setTimeout(() => ctrl.abort(), timeoutMs) : null;
    const headers = { 'Content-Type': 'application/json' };
    const t = this.token();
    if (t) { headers.Authorization = `Bearer ${t}`; headers['x-session-token'] = t; }
    // giống getAuthHeaders() của trang chính: đăng nhập không có token vẫn được nhận diện qua email đã lưu
    const lu = this.localUser();
    if (lu && lu.email) headers['x-user-email'] = String(lu.email).toLowerCase().trim();
    try {
      const res = await fetch(this.apiBase() + path, { credentials: 'include', cache: 'no-store', ...options, headers, signal: ctrl ? ctrl.signal : undefined });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      if (timer) clearTimeout(timer);
    }
  },
  getProgress() { return this.request(`/api/${this.key}/progress`); },
  post(body) { return this.request(`/api/${this.key}/progress`, { method: 'POST', body: JSON.stringify(body), keepalive: true }); },
  getLeaderboard() { return this.request(`/api/${this.key}/leaderboard?limit=50`); }
};

// Chuyển bản lưu của phiên bản trước (v1: coins/level/words) sang bản mới
function migrateSave(s) {
  if (!s || typeof s !== 'object') return null;
  if (s.v === SAVE_VERSION) return s;
  if (s.v === 1) {
    return {
      v: SAVE_VERSION,
      day: s.day,
      money: Number.isFinite(Number(s.coins)) ? Number(s.coins) : START_MONEY,
      teas: [], toppings: [],
      vocab: Array.isArray(s.words) ? s.words : [],
      records: Array.isArray(s.records) ? s.records : [],
      relaxed: !!s.relaxed,
      updatedAt: Number(s.updatedAt) || 0
    };
  }
  return null;
}

// Bản lưu trên máy: tách riêng theo từng tài khoản (khách = 'guest')
const LocalSave = {
  key(owner) { return `${GameCloud.key}_save_${owner || 'guest'}`; },
  read(owner) {
    try { return migrateSave(JSON.parse(localStorage.getItem(this.key(owner)) || 'null')); } catch (e) { return null; }
  },
  write(owner, s) { try { localStorage.setItem(this.key(owner), JSON.stringify(s)); } catch (e) {} },
  clear(owner) { try { localStorage.removeItem(this.key(owner)); } catch (e) {} }
};

// ============================================================================
// 5. GAME
// ============================================================================
class BobaShop {
  constructor() {
    this.audio = new BobaAudio();
    // Dọn key rời rạc của các phiên bản rất cũ
    try { ['boba_coins', 'boba_level', 'boba_exp', 'boba_orders', 'boba_words', 'boba_day', 'boba_tickets', 'boba_relaxed', 'boba_records', 'boba_saved_at', 'boba_owner'].forEach(k => localStorage.removeItem(k)); } catch (e) {}

    this.showPinyin = true;
    this.showVietnamese = true;
    this.relaxedMode = false;
    this.resetProgressState();

    this.gameTime = 0;
    this.lastTickAt = performance.now();
    this.dayStarted = false;
    this.dayEnded = false;
    this.closed = false;
    this.dayStartAt = 0;
    this.stats = this.freshStats();
    this.mission = null;

    this.line = [];
    this.current = null;
    this.ticketSeq = 0;
    this.customerDeck = [];
    this.nextArrivalAt = 0;

    this.cup = freshCup();
    this.changeTray = [];
    this.makeStep = 1;
    this.pourTimer = null;
    this.pouringTea = null;
    this.currentStation = 'view-order-station';
    this.marketZone = 'teas';

    const lu = GameCloud.localUser();
    this.owner = lu ? String(lu.email).toLowerCase().trim() : 'guest';
    this.cloud = { checked: false, loggedIn: false, offline: false, name: '', picture: '', best: null, history: [] };
    this.rankTab = 'global';

    const local = LocalSave.read(this.owner);
    if (local) this.applySnapshot(local);

    this.initDOM();
    this.fitStage();
    this.renderAll();
    this.showTitleScreen();
    this.tickTimer = setInterval(() => this.tick(), 200);
    this.cloudReady = this.initCloud().catch(() => {}).finally(() => {
      this.cloud.checked = true;
      this.renderAccountChip();
      if (this.isTitleVisible()) this.showTitleScreen();
    });
  }

  resetProgressState() {
    this.money = START_MONEY;
    this.day = 1;
    this.teasOwned = new Set(TEAS.filter(t => t.unlockCost === 0).map(t => t.id));
    this.toppingsOwned = new Set(TOPPINGS.filter(t => t.unlockCost === 0).map(t => t.id));
    this.learnedVocab = new Set(['奶茶店', '老板', '奶茶', '珍珠']);
    this.records = [];
    this.savedAt = 0;
    this.teaStock = {};
    this.toppingStock = {};
    this.reviews = [];
    this.todayReviews = [];
    this.spoiledStats = { teas: 0, toppings: 0, cost: 0 };
  }

  // --------------------------------------------------------------------------
  // Lưu / tải
  // --------------------------------------------------------------------------
  snapshot(dayOverride = null) {
    return {
      v: SAVE_VERSION,
      day: dayOverride || this.day,
      money: Math.round(this.money * 100) / 100,
      teas: [...this.teasOwned],
      toppings: [...this.toppingsOwned],
      vocab: [...this.learnedVocab].slice(0, 300),
      records: this.records.slice(-30),
      // reviews mới nhất nằm ở ĐẦU mảng (unshift) → giữ 50 cái đầu, không phải 50 cái cuối
      reviews: this.reviews.slice(0, 50),
      relaxed: !!this.relaxedMode,
      updatedAt: Date.now()
    };
  }

  applySnapshot(raw) {
    const s = migrateSave(raw);
    if (!s) return false;
    const num = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);
    this.resetProgressState();
    this.day = Math.max(1, Math.round(num(s.day, 1)));
    this.money = Math.round(num(s.money, START_MONEY) * 100) / 100;
    (Array.isArray(s.teas) ? s.teas : []).forEach(id => { if (byId(TEAS, id)) this.teasOwned.add(id); });
    (Array.isArray(s.toppings) ? s.toppings : []).forEach(id => { if (byId(TOPPINGS, id)) this.toppingsOwned.add(id); });
    (Array.isArray(s.vocab) ? s.vocab : []).forEach(w => { if (typeof w === 'string') this.learnedVocab.add(w); });
    this.records = Array.isArray(s.records) ? s.records.filter(r => r && Number.isFinite(Number(r.earnings))) : [];
    this.reviews = (Array.isArray(s.reviews) ? s.reviews : [])
      .filter(r => r && typeof r === 'object' && Number.isFinite(Number(r.stars)))
      .map(r => ({ ...r, stars: Math.min(5, Math.max(1, Math.round(Number(r.stars)))) }))
      .slice(0, 50);
    this.todayReviews = [];
    this.relaxedMode = !!s.relaxed;
    const relaxed = document.getElementById('setting-relaxed');
    if (relaxed) relaxed.checked = this.relaxedMode;
    this.savedAt = num(s.updatedAt, 0);
    return true;
  }

  saveProgress(dayOverride = null) {
    if (this.isDayInProgress() && !dayOverride) return;
    const snap = this.snapshot(dayOverride);
    this.savedAt = snap.updatedAt;
    LocalSave.write(this.owner, snap);
    if (this.cloud.loggedIn) GameCloud.post({ save: snap }).catch(() => {});
  }

  // --------------------------------------------------------------------------
  // Tiện ích
  // --------------------------------------------------------------------------
  $(id) { return document.getElementById(id); }
  setText(id, text) { const el = this.$(id); if (el) el.textContent = text; }

  showToast(icon, text, kind = '') {
    const box = this.$('g-toasts');
    if (!box) return;
    const t = document.createElement('div');
    t.className = `g-toast ${kind}`;
    t.innerHTML = `<span class="t-icon">${icon}</span><span>${escapeHtml(text)}</span>`;
    box.appendChild(t);
    while (box.children.length > (this.isPortrait ? 1 : 2)) box.firstChild.remove();
    setTimeout(() => { t.classList.add('out'); setTimeout(() => t.remove(), 320); }, 2800);
  }

  learn(word) {
    if (!word || this.learnedVocab.has(word)) return;
    this.learnedVocab.add(word);
    this.updateHUD();
  }

  isModalOpen() { return [...document.querySelectorAll('.g-modal')].some(m => m.style.display && m.style.display !== 'none'); }
  isTitleVisible() { const t = this.$('title-screen'); return !!t && !t.classList.contains('hidden'); }
  isClockPaused() { return this.isTitleVisible() || this.isModalOpen() || document.hidden; }
  openModal(id) { const m = this.$(id); if (m) m.style.display = 'flex'; }
  closeModal(id) { const m = this.$(id); if (m) m.style.display = 'none'; }

  stagePos(el) {
    const stage = this.$('g-stage').getBoundingClientRect();
    const r = el.getBoundingClientRect();
    const s = this.stageScale || 1;
    return { x: (r.left - stage.left) / s, y: (r.top - stage.top) / s, w: r.width / s, h: r.height / s };
  }

  // --------------------------------------------------------------------------
  // Khởi tạo giao diện & sự kiện
  // --------------------------------------------------------------------------
  initDOM() {
    document.getElementById('btn-bankrupt-restart')?.addEventListener('click', () => this.restartAfterBankrupt());
    document.getElementById('btn-bankrupt-say')?.addEventListener('click', () => this.audio.speak('钱花光了，奶茶店破产了！'));
    const on = (id, ev, fn) => { const el = this.$(id); if (el) el.addEventListener(ev, fn); };
    window.addEventListener('resize', () => this.fitStage());
    window.addEventListener('orientationchange', () => setTimeout(() => this.fitStage(), 200));
    document.addEventListener('visibilitychange', () => { this.lastTickAt = performance.now(); if (document.hidden) this.stopPour(); });

    on('btn-title-play', 'click', () => this.onTitlePlay());
    on('btn-title-guide', 'click', () => { this.audio.pop(); this.openModal('modal-guide'); });
    on('btn-title-rank', 'click', () => { this.audio.pop(); this.openRankModal(); });

    on('btn-hud-home', 'click', () => { this.audio.pop(); this.stopPour(); this.showTitleScreen(); });
    on('btn-pause-game', 'click', () => { this.audio.pop(); this.stopPour(); this.openModal('modal-settings'); });
    on('btn-fullscreen', 'click', () => this.toggleFullscreen());
    on('btn-open-vocab', 'click', () => { this.audio.pop(); this.openVocabModal(); });
    on('btn-open-restock', 'click', () => this.openMarket());
    on('btn-open-reviews', 'click', () => { this.audio.pop(); this.openReviewsModal(); });
    on('btn-prep-all', 'click', () => this.brewAll());
    // Đánh giá hiện tiếng Trung; bấm "Xem nghĩa" mới hiện tiếng Việt
    // chạm vào từ lóng (tô màu) trong đánh giá → đọc to + hiện pinyin, nghĩa
    document.addEventListener('click', (e) => {
      const sl = e.target.closest('[data-slang]');
      const w = sl && REVIEW_SLANG[+sl.dataset.slang];
      if (!w) return;
      this.audio.speak(w.chn);
      this.showToast('💬', `${w.chn} (${w.pin}) · ${w.vi}`);
    });
    document.addEventListener('click', (e) => {
      const b = e.target.closest('[data-show-vi]');
      const w = b && b.closest('.rev-wrap');
      if (!w) return;
      const open = w.classList.toggle('vi-open');
      if (b.textContent.trim() !== '👁' && b.textContent.trim() !== '🙈') b.textContent = open ? '🙈 Ẩn nghĩa' : '👁 Xem nghĩa';
      else b.textContent = open ? '🙈' : '👁';
    });
    on('btn-open-prep', 'click', () => { this.audio.pop(); this.renderPrepModal(); this.openModal('modal-prep'); });

    // Nấu trà và topping trực tiếp từ nút "+5 Nấu"
    document.addEventListener('click', (e) => {
      const cookTea = e.target.closest('[data-cook-tea]');
      if (cookTea) {
        e.stopPropagation();
        e.preventDefault();
        this.brewTeaBatch(cookTea.dataset.cookTea);
        return;
      }
      const cookTop = e.target.closest('[data-cook-top]');
      if (cookTop) {
        e.stopPropagation();
        e.preventDefault();
        this.cookToppingBatch(cookTop.dataset.cookTop);
        return;
      }
    });

    // Bố cục 1 màn hình: không còn chuyển trạm. Nút "Sang tính tiền" mở lại bảng thanh toán
    // (nếu người chơi lỡ bấm ✕ đóng bảng sau khi đóng nắp, trước đây không có cách mở lại → kẹt cả ngày)
    document.querySelectorAll('.g-tab').forEach(btn => btn.addEventListener('click', () => this.switchStation(btn.dataset.target)));
    on('btn-goto-make-from-order', 'click', () => this.switchStation('view-make-station'));
    on('btn-goto-pay', 'click', () => this.switchStation('view-change-station'));
    on('btn-take-order-action', 'click', () => this.takeOrder());
    on('btn-take-order-footer', 'click', () => this.takeOrder());
    on('speech-bubble', 'click', (e) => {
      if (e.target.closest('#btn-replay-order-audio')) return;
      if (this.current && !this.current.takenAt) this.takeOrder();
    });
    on('btn-replay-order-audio', 'click', () => this.speakOrder());
    on('btn-cat', 'click', () => this.petCat());

    // Pha chế
    document.querySelectorAll('.step-tab').forEach(b => b.addEventListener('click', () => { this.audio.pop(); this.setMakeStep(+b.dataset.step); }));
    on('btn-undo-topping', 'click', () => this.undoTopping());
    // Đã đóng nắp → nút thành "Tính tiền" (mở lại bảng thanh toán)
    // Đã đóng nắp → nút thành "Sang tính tiền"
    on('btn-seal-lid', 'click', () => (this.cup.lid && this.isReadyToCharge() ? this.switchStation('view-change-station') : this.sealLid()));
    on('btn-trash-cup', 'click', () => this.trashCup());
    on('btn-cancel-order', 'click', () => this.cancelOrder());
    // Thả tay ở bất cứ đâu → dừng rót
    ['pointerup', 'pointercancel', 'blur'].forEach(ev => window.addEventListener(ev, () => this.stopPour()));

    // Tính tiền
    on('btn-reset-tray-action', 'click', () => this.resetTray());
    on('btn-change-hint', 'click', () => this.useChangeHint());
    on('btn-confirm-and-deliver', 'click', () => this.deliver());
    document.querySelectorAll('.drawer-grid .rmb').forEach(btn => btn.addEventListener('click', () => this.addToTray(parseFloat(btn.dataset.val))));

    on('btn-next-customer', 'click', () => this.closeScorecard());
    on('btn-replay-boba-speech', 'click', () => {
      if (this.lastScoreReactionZh) this.audio.speak(this.lastScoreReactionZh);
    });
    on('btn-refresh-phrase-boba', 'click', () => {
      this.audio.pop();
      this.renderSingleCheckoutPhrase();
    });
    on('btn-mission-start', 'click', () => this.startDay());
    on('btn-mission-restock', 'click', () => this.openMarket());
    on('btn-next-day-start', 'click', () => this.startNextDay());

    document.querySelectorAll('.rank-tab').forEach(btn => btn.addEventListener('click', () => { this.audio.pop(); this.switchRankTab(btn.dataset.rankTab); }));
    document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => {
      this.closeModal(btn.dataset.close);
      this.lastTickAt = performance.now();
      if (btn.dataset.close === 'modal-restock') this.afterMarketClosed();
      if (btn.dataset.close === 'modal-prep') { this.renderPrepModal(); this.checkBankrupt(); }
    }));

    on('setting-sfx', 'change', (e) => { this.audio.sfxEnabled = e.target.checked; });
    on('setting-voice', 'change', (e) => { this.audio.voiceEnabled = e.target.checked; });
    on('setting-pinyin', 'change', (e) => { this.showPinyin = e.target.checked; this.renderSpeech(); });
    on('setting-vietnamese', 'change', (e) => { this.showVietnamese = e.target.checked; this.renderSpeech(); this.renderTicket(); });
    on('setting-relaxed', 'change', (e) => {
      this.relaxedMode = e.target.checked;
      this.updatePatienceUI();
      this.saveProgress();
      this.showToast(this.relaxedMode ? '🍃' : '⏱️', this.relaxedMode ? 'Chế độ thư giãn: khách chờ bao lâu cũng được.' : 'Chế độ thường: khách chờ quá lâu sẽ bỏ về!');
    });
    on('btn-back-to-title', 'click', () => { this.closeModal('modal-settings'); this.showTitleScreen(); });
    on('btn-reset-save', 'click', () => this.resetGame());
  }

  fitStage() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    const portrait = h > w * 1.05;
    let sw = STAGE_W;
    let sh = STAGE_H;
    if (portrait) {
      sw = PORTRAIT_W;
      sh = Math.round((PORTRAIT_W * h) / Math.max(1, w));
      // Màn dọc "thấp" (máy tính bảng 3:4, điện thoại màn ngắn): giữ đủ chiều cao rồi giãn ngang lấp kín màn hình
      // → mọi thứ nhỏ lại một chút, kệ hàng đủ chỗ, không còn dải trống 2 bên.
      if (sh < PORTRAIT_MIN_H) {
        sh = PORTRAIT_MIN_H;
        sw = Math.max(PORTRAIT_W, Math.round((PORTRAIT_MIN_H * w) / Math.max(1, h)));
      }
    }
    const scale = Math.min(w / sw, h / sh);
    this.stageScale = scale > 0 ? scale : 1;
    const root = document.documentElement.style;
    root.setProperty('--stage-scale', this.stageScale.toFixed(4));
    root.setProperty('--stage-w', `${sw}px`);
    root.setProperty('--stage-h', `${sh}px`);
    const flush = portrait || (w - sw * this.stageScale < 24 && h - sh * this.stageScale < 24) || w < 900;
    document.body.classList.toggle('stage-flush', flush);
    this.isPortrait = portrait;
    document.body.classList.toggle('g-portrait', portrait);
  }

  toggleFullscreen() {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen().catch(() => {});
      } else if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}
  }

  // ---------------- Phá sản: không thể kinh doanh tiếp → bắt đầu lại từ đầu
  isBankrupt() {
    const hasTea = [...this.teasOwned].some(id => (this.teaStock[id] || 0) > 0);
    const cupInProgress = !!(this.current && this.current.takenAt && (this.cup.fill > 0 || this.cup.lid));
    return !hasTea && !cupInProgress && this.money < INGREDIENT_RULES.teaBatchCost - 1e-9;
  }

  checkBankrupt() {
    if (this.bankrupt || !this.isBankrupt()) return false;
    this.bankrupt = true;
    if (this.stopPour) this.stopPour();
    ['modal-day-mission', 'modal-prep', 'modal-restock', 'modal-settings'].forEach(id => this.closeModal(id));
    this.learn('破产');
    this.setText('bk-day', String(this.day));
    this.setText('bk-reason', `Không còn trà nào đã nấu và không đủ ${fmt(INGREDIENT_RULES.teaBatchCost)} ¥ để nấu thêm.`);
    this.openModal('modal-bankrupt');
    this.audio.sad && this.audio.sad();
    setTimeout(() => this.audio.speak('钱花光了，奶茶店破产了！'), 400);
    return true;
  }

  // Bắt đầu lại từ đầu sau khi phá sản (không hỏi lại; kỷ lục trên bảng xếp hạng vẫn giữ)
  async restartAfterBankrupt() {
    const btn = this.$('btn-bankrupt-restart');
    if (btn) btn.disabled = true;
    LocalSave.clear(this.owner);
    if (this.cloud.loggedIn) { try { await GameCloud.post({ resetSave: true }); } catch (e) {} }
    location.reload();
  }

  async resetGame() {
    if (!confirm('Chơi lại từ đầu? Tiến trình (ngày, tiền, món đã mở) sẽ bị xóa. Kỷ lục trên bảng xếp hạng vẫn được giữ.')) return;
    LocalSave.clear(this.owner);
    if (this.cloud.loggedIn) { try { await GameCloud.post({ resetSave: true }); } catch (e) {} }
    location.reload();
  }

  // --------------------------------------------------------------------------
  // Màn hình chờ
  // --------------------------------------------------------------------------
  isDayInProgress() { return this.dayStarted && !this.dayEnded; }

  showTitleScreen() {
    this.stopPour();
    const el = this.$('title-screen');
    if (el) el.classList.remove('hidden');
    document.body.classList.add('on-title');
    const busy = this.isDayInProgress();
    const loading = !this.cloud.checked && GameCloud.signedIn();
    this.setText('title-play-chn', busy ? '继续营业' : '开门营业');
    this.setText('title-play-vi', loading ? 'Đang tải…' : busy ? `Tiếp tục ngày ${this.day}` : (this.day > 1 ? `Vào ngày ${this.day}` : 'Bắt đầu'));
    const play = this.$('btn-title-play');
    if (play) play.disabled = !!loading;
    const prog = this.$('title-progress');
    if (prog) {
      prog.innerHTML = (this.day > 1 || this.dayStarted)
        ? `<span>📅 Ngày ${this.day}</span><span>🪙 ${fmt(this.money)} ¥</span><span>🧋 ${this.teasOwned.size + this.toppingsOwned.size} món trong thực đơn</span>`
        : '<span>✨ Vừa bán trà sữa · vừa học tiếng Trung</span>';
    }
  }

  hideTitleScreen() {
    const el = this.$('title-screen');
    if (el) el.classList.add('hidden');
    document.body.classList.remove('on-title');
    this.lastTickAt = performance.now();
  }

  onTitlePlay() {
    if (!this.cloud.checked && GameCloud.signedIn()) return;
    this.audio.init();
    this.audio.pop();
    this.hideTitleScreen();
    if (this.isDayInProgress()) this.showToast('▶️', `Tiếp tục ngày ${this.day}!`);
    else if (!this.dayEnded) this.showMissionBriefing();
  }

  // --------------------------------------------------------------------------
  // Nhiệm vụ ngày
  // --------------------------------------------------------------------------
  freshStats() { return { spawned: 0, served: 0, lost: 0, revenue: 0, scoreSum: 0, changeFirstTry: 0, perfect: 0 }; }

  buildMission() {
    const raw = MISSION_RULES.baseTarget + (this.day - 1) * MISSION_RULES.targetPerDay;
    const target = Math.min(MISSION_RULES.maxTarget, Math.ceil(raw / MISSION_RULES.roundTo) * MISSION_RULES.roundTo);
    return { day: this.day, target, maxLost: MISSION_RULES.baseMaxLost + Math.floor((this.day - 1) / 3), minAvg: MISSION_RULES.minAvgScore, rewarded: false };
  }

  showMissionBriefing() {
    this.mission = this.buildMission();
    const m = this.mission;
    this.setText('mission-day-chn', `第${this.day}天`);
    const sub = this.$('mission-sub');
    if (sub) {
      sub.innerHTML = `Quán mở cửa <b>08:00 → 20:00</b> (khoảng ${Math.round(DAY_RULES.lengthMs / 60000)} phút). Khách đến liên tục — hãy chuẩn bị nguyên liệu trước!<br>Thực đơn hôm nay: <b>${this.teasOwned.size}</b> loại trà · <b>${this.toppingsOwned.size}</b> topping.`;
    }
    const goals = this.$('mission-goals');
    if (goals) {
      goals.innerHTML = `
        <div class="mgoal main"><span class="mg-icon">💰</span><span>Doanh thu đạt <b>${m.target} ¥</b></span><span class="mg-star">⭐</span></div>
        <div class="mgoal"><span class="mg-icon">😊</span><span>Không để quá <b>${m.maxLost}</b> khách bỏ về</span><span class="mg-star">⭐</span></div>
        <div class="mgoal"><span class="mg-icon">⭐</span><span>Điểm phục vụ trung bình từ <b>${m.minAvg}%</b></span><span class="mg-star">⭐</span></div>`;
    }
    this.renderHUDGoal();
    this.renderPrepModal();
    this.openModal('modal-day-mission');
    this.checkBankrupt();
  }

  startDay() {
    this.closeModal('modal-day-mission');
    this.closeModal('modal-prep');
    this.saveProgress();
    this.audio.init();
    this.audio.bell();
    this.dayStarted = true;
    this.dayEnded = false;
    this.closed = false;
    this.dayStartAt = this.gameTime;
    this.nextArrivalAt = this.gameTime + QUEUE_RULES.firstArrivalMs;
    this.learn('欢迎光临');
    this.learn('营业');
    this.lastTickAt = performance.now();
    this.switchStation('view-order-station', true);
    this.renderAll();
    this.showToast('🌅', `第${this.day}天 · 08:00 mở cửa! Mục tiêu hôm nay: ${this.mission.target} ¥.`);
  }

  evaluateMission() {
    const m = this.mission;
    const s = this.stats;
    if (!m) return [];
    const avg = s.served > 0 ? Math.round(s.scoreSum / s.served) : 0;
    return [
      { icon: '💰', text: `Doanh thu ${m.target} ¥`, value: `${fmt(s.revenue)} ¥`, done: s.revenue >= m.target },
      { icon: '😊', text: `Tối đa ${m.maxLost} khách bỏ về`, value: `${s.lost} khách`, done: s.lost <= m.maxLost },
      { icon: '⭐', text: `Điểm trung bình ≥ ${m.minAvg}%`, value: s.served > 0 ? `${avg}%` : '—', done: s.served > 0 && avg >= m.minAvg }
    ];
  }

  // --------------------------------------------------------------------------
  // Đồng hồ & hàng đợi
  // --------------------------------------------------------------------------
  dayElapsed() { return Math.max(0, this.gameTime - this.dayStartAt); }

  clockMinutes() {
    if (!this.dayStarted) return DAY_RULES.openMin;
    const p = Math.min(1, this.dayElapsed() / DAY_RULES.lengthMs);
    return DAY_RULES.openMin + Math.floor(p * (DAY_RULES.closeMin - DAY_RULES.openMin));
  }

  tick() {
    const now = performance.now();
    const dt = Math.min(1000, now - this.lastTickAt);
    this.lastTickAt = now;
    if (this.isClockPaused() || !this.dayStarted || this.dayEnded) return;
    if (this.checkBankrupt()) return;
    this.gameTime += dt;

    if (!this.closed && this.dayElapsed() >= DAY_RULES.lengthMs) {
      this.closed = true;
      this.learn('打烊');
      this.audio.bell();
      this.showToast('🌙', this.line.length || this.current ? '20:00 · 打烊 Đến giờ đóng cửa! Phục vụ nốt khách đang chờ nhé.' : '20:00 · 打烊 Đến giờ đóng cửa!');
      this.renderRail();
      this.renderCounter();
    }

    if (!this.closed && this.gameTime >= this.nextArrivalAt) {
      if (this.line.length < QUEUE_RULES.maxLine) this.spawnArrival();
      else this.nextArrivalAt = this.gameTime + 3000;
    }

    if (!this.relaxedMode) {
      // chỉ khách CHƯA được chốt đơn mới bỏ về (đã chốt thì chờ lấy nước)
      [...this.line].forEach(c => { if (!c.takenAt && this.gameTime - c.arrivedAt >= QUEUE_RULES.patienceMs) this.loseCustomer(c); });
      const cur = this.current;
      if (cur && !cur.takenAt && this.gameTime - cur.arrivedAt >= QUEUE_RULES.patienceMs) this.loseCustomer(cur);
    }

    if (!this.current) this.promoteNext();
    this.updateClockUI();
    this.updatePatienceUI();
    this.checkDayEnd();
  }

  getArrivalGapMs() {
    const base = Math.max(QUEUE_RULES.arriveMinMs, QUEUE_RULES.arriveBaseMs - (this.day - 1) * QUEUE_RULES.arrivePerDayMs);
    return base + Math.random() * QUEUE_RULES.arriveJitterMs;
  }

  nextCustomerProfile() {
    const present = new Set([...this.line.map(c => c.profile.id), this.current && this.current.profile.id]);
    for (let i = 0; i < CUSTOMERS.length * 2; i++) {
      if (!this.customerDeck.length) this.customerDeck = [...CUSTOMERS].sort(() => Math.random() - 0.5);
      const c = this.customerDeck.shift();
      if (!present.has(c.id)) return c;
    }
    return pickOne(CUSTOMERS);
  }

  spawnArrival() {
    this.ticketSeq += 1;
    const c = { id: this.ticketSeq, profile: this.nextCustomerProfile(), arrivedAt: this.gameTime };
    this.prepCustomer(c); // có sẵn món muốn gọi ngay khi vào quán (chọn khách nào trên hàng chờ cũng được)
    this.line.push(c);
    this.stats.spawned += 1;
    this.nextArrivalAt = this.gameTime + this.getArrivalGapMs();
    this.audio.bell();
    const bell = document.querySelector('.door-bell');
    if (bell) { bell.classList.remove('ring'); void bell.offsetWidth; bell.classList.add('ring'); }
    if (this.current) this.showToast('🔔', `${c.profile.nameChn} (${c.profile.nameVi}) vừa vào quán và đang xếp hàng.`);
    this.renderRail();
  }

  // Mỗi khách giữ riêng: món gọi, ly đang pha dở, khay tiền thối, bước pha
  prepCustomer(c) {
    if (c.order) return;
    c.order = this.makeOrder();
    c.changeWrong = 0;
    c.hintUsed = false;
    c.trashCount = 0;
    c.cup = freshCup();
    c.tray = [];
    c.makeStep = 1;
  }

  // Đưa khách c lên quầy (dùng chung cho "khách kế tiếp" và "bấm chọn khách trên hàng chờ")
  bringToCounter(c) {
    this.prepCustomer(c);
    this.current = c;
    this.cup = c.cup || freshCup();
    this.changeTray = c.tray || [];
    this.makeStep = c.makeStep || 1;
  }

  // Cất trạng thái của khách đang ở quầy (ly pha dở, khay tiền, bước) trước khi đổi khách
  stashCurrent() {
    const c = this.current;
    if (!c) return;
    c.cup = this.cup;
    c.tray = this.changeTray;
    c.makeStep = this.makeStep;
  }

  promoteNext() {
    if (this.current || !this.line.length) return;
    const c = this.line.shift();
    this.bringToCounter(c);
    this.renderCounter(true);
    this.renderRail();
    this.renderMakeStation();
    this.renderChange();
    setTimeout(() => { if (this.current === c && !c.takenAt) this.speakOrder(); }, 450);
  }

  // Kiểu Papa's: bấm vào khách trên hàng chờ → khách đó lên quầy (xem món, chốt đơn, pha trước cho họ)
  selectCustomer(id) {
    if (!this.dayStarted || this.dayEnded || this.isModalOpen()) return;
    const cur = this.current;
    if (cur && cur.id === id) {
      // bấm lại khách đang ở quầy → đưa tới trạm phù hợp
      this.switchStation(!cur.takenAt ? 'view-order-station' : this.cup.lid ? 'view-change-station' : 'view-make-station');
      return;
    }
    const target = this.line.find(x => x.id === id);
    if (!target) return;
    this.stopPour();
    this.stashCurrent();
    this.line = this.line.filter(x => x !== target);
    if (cur) { this.line.push(cur); this.line.sort((a, b) => a.id - b.id); }
    this.bringToCounter(target);
    this.audio.pop();
    this.renderCounter(true);
    this.renderRail();
    this.renderMakeStation();
    this.renderChange();
    if (!target.takenAt) {
      this.switchStation('view-order-station', true);
      setTimeout(() => { if (this.current === target && !target.takenAt) this.speakOrder(); }, 350);
    } else {
      this.switchStation(this.cup.lid ? 'view-change-station' : 'view-make-station', true);
      this.showToast('📝', `Đơn #B-${target.id} của ${target.profile.nameChn}${this.cup.lid ? ' — ly đã đóng nắp, tính tiền thôi!' : ' — tiếp tục pha chế.'}`);
    }
  }

  loseCustomer(c, silent = false) {
    const isCurrent = this.current === c;
    if (isCurrent) {
      this.stopPour();
      this.current = null;
      this.cup = freshCup();
      this.changeTray = [];
      const door = this.$('door-customer');
      if (door) { door.classList.remove('enter'); door.classList.add('leave', 'angry'); }
    } else {
      this.line = this.line.filter(x => x !== c);
    }
    this.stats.lost += 1;
    if (!silent) {
      this.audio.sad();
      this.showToast('😠', `${c.profile.nameChn} (${c.profile.nameVi}) chờ lâu quá nên bỏ về!`, 'warn');
    }
    this.renderRail();
    this.renderMakeStation();
    setTimeout(() => { this.promoteNext(); this.renderCounter(); }, isCurrent ? 550 : 0);
  }

  // Đơn đã nhận nhưng KHÔNG THỂ pha: món hết mà không đủ tiền nấu thêm.
  // Khách đã nhận đơn thì không tự bỏ về → nếu không có lối thoát, khách đứng mãi và ngày không bao giờ kết thúc.
  orderBlockedReason() {
    const c = this.current;
    if (!c || !c.takenAt || !c.order || this.cup.lid) return '';
    const o = c.order;
    const teaInCup = this.cup.tea === o.tea.id && this.cup.fill > 0 && !this.cup.mixed;
    if (!teaInCup && (this.teaStock[o.tea.id] || 0) <= 0 && this.money < INGREDIENT_RULES.teaBatchCost - 1e-9) return `trà ${o.tea.chn}`;
    const topInCup = o.topping && this.cup.toppings.includes(o.topping.id);
    if (o.topping && !topInCup && (this.toppingStock[o.topping.id] || 0) <= 0 && this.money < INGREDIENT_RULES.toppingBatchCost - 1e-9) return `topping ${o.topping.chn}`;
    return '';
  }

  cancelOrder() {
    const c = this.current;
    const why = this.orderBlockedReason();
    if (!c || !why) return;
    this.learn('抱歉');
    this.loseCustomer(c, true);
    this.audio.sad();
    this.showToast('🙇', `抱歉 (bàoqiàn) · Hết ${why} và không đủ tiền nấu thêm — ${c.profile.nameChn} đành rời quán.`, 'warn');
    this.switchStation('view-order-station', true);
  }

  checkDayEnd() {
    if (!this.dayStarted || this.dayEnded || !this.closed) return;
    if (!this.line.length && !this.current && !this.isModalOpen()) this.showDaySummary();
  }

  patienceUsed(c) { return c ? Math.min(1, (this.gameTime - c.arrivedAt) / QUEUE_RULES.patienceMs) : 0; }

  // --------------------------------------------------------------------------
  // Đơn hàng
  // --------------------------------------------------------------------------
  orderPrice(o) {
    return o.size.price + o.tea.premium + (o.topping ? o.topping.price : 0);
  }

  makeOrder() {
    const teas = TEAS.filter(t => this.teasOwned.has(t.id));
    const tops = TOPPINGS.filter(t => this.toppingsOwned.has(t.id));
    const o = {
      size: pickOne(SIZES),
      tea: pickOne(teas),
      topping: Math.random() < 0.8 && tops.length ? pickOne(tops) : null,
      sugar: pickOne(SUGARS),
      ice: pickOne(ICES)
    };
    o.due = this.orderPrice(o);
    o.paid = this.pickPaidAmount(o.due);
    o.change = Math.round((o.paid - o.due) * 100) / 100;
    return o;
  }

  pickPaidAmount(due) {
    const options = new Set();
    const up = (step) => Math.ceil((due + 0.001) / step) * step;
    options.add(up(5));
    options.add(up(10));
    [20, 50].forEach(n => { if (n > due) options.add(n); });
    const list = [...options].filter(v => v > due && v - due <= 40).sort((a, b) => a - b).slice(0, 3);
    return list.length ? pickOne(list) : up(10);
  }

  orderPhrase(o) {
    const drinkZh = `${o.size.chn}${o.topping ? o.topping.chn : ''}${o.tea.chn}`;
    const parts = [drinkZh, ...(o.topping ? [] : ['不加料']), o.sugar.chn, o.ice.chn];
    const drinkPin = `${o.size.pin} ${o.topping ? o.topping.pin + ' ' : ''}${o.tea.pin}`;
    const pinParts = [drinkPin, ...(o.topping ? [] : ['bù jiā liào']), o.sugar.pin, o.ice.pin];
    const vi = `1 ${o.size.vi} ${o.tea.vi}${o.topping ? ' ' + o.topping.vi : ', không topping'}, ${o.sugar.vi}, ${o.ice.vi}`;
    return {
      zh: `老板，我要${parts.join('，')}！`,
      zhHtml: `老板，我要${parts.map(p => `<em>${p}</em>`).join('，')}！`,
      pin: `Lǎobǎn, wǒ yào ${pinParts.join(', ')}!`,
      vi: `(Ông chủ ơi, cho tôi ${vi}!)`
    };
  }

  speakOrder() {
    if (this.current && this.current.order) this.audio.speak(this.orderPhrase(this.current.order).zh);
  }

  takeOrder() {
    const c = this.current;
    if (!c || !c.order || c.takenAt) return;
    this.audio.pick();
    c.takenAt = this.gameTime;
    const used = this.patienceUsed(c);
    c.waitScore = this.relaxedMode ? 100 : Math.round(100 - 60 * Math.max(0, Math.min(1, (used - 0.25) / 0.75)));
    this.learn('老板');
    this.makeStep = 1;
    this.renderCounter();
    this.renderRail();
    this.renderMakeStation();
    this.setAttention('view-make-station');
    this.showToast('📝', 'Đã nhận đơn! Sang 调制台 để pha chế.');
  }

  // --------------------------------------------------------------------------
  // Trạm
  // --------------------------------------------------------------------------
  switchStation(id, silent = false) {
    if (!STATION_ORDER.includes(id)) return;
    this.stopPour();
    const prevIdx = STATION_ORDER.indexOf(this.currentStation);
    const nextIdx = STATION_ORDER.indexOf(id);
    this.currentStation = id;
    document.querySelectorAll('.g-station').forEach(v => {
      const active = v.id === id;
      v.classList.toggle('from-left', !active && STATION_ORDER.indexOf(v.id) < nextIdx);
      v.classList.toggle('active', active);
    });
    document.querySelectorAll('.g-tab').forEach(b => {
      b.classList.toggle('active', b.dataset.target === id);
      if (b.dataset.target === id) b.classList.remove('attention');
    });
    if (id === 'view-make-station') this.renderMakeStation();
    if (id === 'view-change-station') { this.renderChange(); if (this.isReadyToCharge()) { this.learn('一共'); this.learn('找零'); } }
    if (!silent && prevIdx !== nextIdx) this.audio.pop();
  }

  setAttention(id) {
    document.querySelectorAll('.g-tab').forEach(b => b.classList.toggle('attention', b.dataset.target === id && this.currentStation !== id));
  }

  // ---------------- Trạm 2: pha chế
  canMake(showWhy = true) {
    const c = this.current;
    if (!c || !c.order || !c.takenAt) {
      if (showWhy) { this.audio.error(); this.showToast('🛎️', 'Chưa có đơn! Về 点单台 nhận đơn của khách trước.', 'warn'); }
      return false;
    }
    if (this.cup.lid) {
      if (showWhy) { this.audio.error(); this.showToast('🔒', 'Ly đã đóng nắp. Muốn sửa thì bấm 倒掉 Đổ đi làm lại.', 'warn'); }
      return false;
    }
    return true;
  }

  setMakeStep(n) {
    this.makeStep = Math.max(1, Math.min(3, n));
    document.querySelectorAll('.step-tab').forEach(b => b.classList.toggle('active', +b.dataset.step === this.makeStep));
    document.querySelectorAll('.step-panel').forEach(p => p.classList.toggle('active', p.id === `step-${this.makeStep}`));
  }

  chooseSize(id) {
    if (!this.canMake()) return;
    const size = byId(SIZES, id);
    if (!size) return;
    if (this.cup.fill > 0 && this.cup.size !== id) {
      this.audio.error();
      this.showToast('🥤', 'Đã rót trà rồi, không đổi cỡ ly được. Bấm Đổ đi để làm lại.', 'warn');
      return;
    }
    this.cup.size = id;
    this.learn(size.chn);
    this.audio.pick();
    this.renderMakeStation();
  }

  startPour(teaId) {
    if (!this.canMake()) return;
    const tea = byId(TEAS, teaId);
    if (!tea) return;
    if (!this.teasOwned.has(teaId)) { this.openMarket('teas'); return; }
    if (!this.cup.size) {
      this.audio.error();
      this.showToast('🥤', 'Chọn cỡ ly (小杯 / 中杯 / 大杯) trước khi rót trà!', 'warn');
      return;
    }
    if ((this.teaStock[teaId] || 0) <= 0) {
      this.audio.error();
      this.showToast('⚠️', `Đã hết trà ${tea.chn}! Bấm "+5 Nấu" để chuẩn bị thêm 5 phần.`, 'warn');
      return;
    }
    if (this.cup.spilled) return;
    this.stopPour();
    if (this.cup.tea && this.cup.tea !== teaId && this.cup.fill > 0) this.cup.mixed = true;
    if (!this.cup.tea || this.cup.fill === 0) this.cup.tea = teaId;
    this.pouringTea = teaId;
    this.learn(tea.chn);
    this.audio.startPour();
    document.querySelector(`[data-tea="${teaId}"]`)?.classList.add('pouring');
    this.$('cup-stage')?.classList.add('pouring');
    this.$('cup-stage')?.style.setProperty('--stream', tea.color);
    const step = (POUR_RULES.ratePerSec * POUR_RULES.tickMs) / 1000;
    this.pourTimer = setInterval(() => {
      this.cup.fill = Math.round((this.cup.fill + step) * 10) / 10;
      if (this.cup.fill >= 20 && !this.cup.teaDeducted) {
        this.teaStock[teaId] = Math.max(0, (this.teaStock[teaId] || 0) - 1);
        this.cup.teaDeducted = true;
        this.renderMakeStation();
      }
      if (this.cup.fill >= 100) {
        this.cup.fill = 100;
        this.cup.spilled = true;
        this.stopPour();
        this.audio.error();
        this.showToast('💦', 'Tràn ly rồi! Bấm 倒掉 Đổ đi để làm lại.', 'warn');
      }
      this.renderCup();
      this.renderTicket();
    }, POUR_RULES.tickMs);
  }

  stopPour() {
    if (!this.pourTimer) return;
    clearInterval(this.pourTimer);
    this.pourTimer = null;
    this.audio.stopPour();
    document.querySelectorAll('.tea-tap.pouring').forEach(b => b.classList.remove('pouring'));
    this.$('cup-stage')?.classList.remove('pouring');
    this.pouringTea = null;
    this.renderMakeStation();
    // Rót xong (gần vạch) → tự sang bước 2
    if (this.cup.fill >= 60 && !this.cup.spilled && this.makeStep === 1) setTimeout(() => { if (this.makeStep === 1 && !this.pourTimer) this.setMakeStep(2); }, 500);
  }

  // Dùng cho kiểm thử tự động: rót đúng 1 lượng (không cần giữ chuột)
  pourAmount(teaId, amount) {
    this.startPour(teaId);
    if (!this.pourTimer) return;
    clearInterval(this.pourTimer);
    this.pourTimer = null;
    this.cup.fill = Math.min(100, Math.round((this.cup.fill + amount) * 10) / 10);
    if (this.cup.fill >= 20 && !this.cup.teaDeducted) {
      this.teaStock[teaId] = Math.max(0, (this.teaStock[teaId] || 0) - 1);
      this.cup.teaDeducted = true;
    }
    if (this.cup.fill >= 100) this.cup.spilled = true;
    this.pourTimer = -1;
    this.stopPour();
  }

  chooseSugar(id) {
    if (!this.canMake()) return;
    const s = byId(SUGARS, id);
    if (!s) return;
    this.cup.sugar = id;
    this.learn(s.chn);
    this.audio.pick();
    this.renderMakeStation();
    this.autoStep3();
  }

  chooseIce(id) {
    if (!this.canMake()) return;
    const ice = byId(ICES, id);
    if (!ice) return;
    this.cup.ice = id;
    this.learn(ice.chn);
    this.audio.ice();
    this.renderMakeStation();
    this.autoStep3();
  }

  autoStep3() {
    if (this.cup.sugar && this.cup.ice && this.makeStep === 2) setTimeout(() => { if (this.makeStep === 2) this.setMakeStep(3); }, 450);
  }

  addTopping(id) {
    if (!this.canMake()) return;
    const t = byId(TOPPINGS, id);
    if (!t) return;
    if (!this.toppingsOwned.has(id)) { this.openMarket('toppings'); return; }
    if (!this.cup.size) { this.audio.error(); this.showToast('🥤', 'Chọn cỡ ly trước đã!', 'warn'); return; }
    if ((this.toppingStock[id] || 0) <= 0) {
      this.audio.error();
      this.showToast('⚠️', `Đã hết topping ${t.chn}! Bấm "+5 Nấu" để chuẩn bị thêm 5 phần.`, 'warn');
      return;
    }
    if (this.cup.toppings.length >= 2) { this.audio.error(); this.showToast('🧋', 'Ly đầy topping rồi! Bấm "Bớt topping" nếu thêm nhầm.', 'warn'); return; }
    this.cup.toppings.push(id);
    this.toppingStock[id] = Math.max(0, (this.toppingStock[id] || 0) - 1);
    this.learn(t.chn);
    this.audio.plop();
    this.renderMakeStation();
  }

  undoTopping() {
    if (!this.canMake()) return;
    if (!this.cup.toppings.length) return;
    const popped = this.cup.toppings.pop();
    if (popped) {
      this.toppingStock[popped] = (this.toppingStock[popped] || 0) + 1;
    }
    this.audio.pop();
    this.renderMakeStation();
  }

  sealLid() {
    if (!this.canMake()) return;
    if (!this.cup.size || this.cup.fill <= 0) {
      this.audio.error();
      this.showToast('🥤', 'Ly còn trống! Chọn cỡ ly và rót trà trước khi đóng nắp.', 'warn');
      return;
    }
    this.stopPour();
    this.cup.lid = true;
    this.learn('封口');
    this.audio.seal();
    this.renderMakeStation();
    this.renderRail();
    this.setAttention('view-change-station');
    this.showToast('✅', 'Đã đóng nắp! Sang 收银台 tính tiền cho khách.');
  }

  trashCup() {
    const c = this.current;
    if (!c || !c.takenAt) return;
    const empty = !this.cup.size && !this.cup.fill && !this.cup.toppings.length && !this.cup.sugar && !this.cup.ice;
    if (empty) return;
    this.stopPour();
    this.cup = freshCup();
    c.trashCount = (c.trashCount || 0) + 1;
    this.changeTray = [];
    this.learn('倒掉');
    this.audio.drain();
    this.setMakeStep(1);
    this.renderMakeStation();
    this.renderChange();
    this.renderRail();
    this.showToast('🗑️', 'Đã đổ ly cũ (nguyên liệu trong ly đã bị huỷ). Làm lại ly mới nhé!');
  }

  // Chấm "pha đúng món"
  evaluateCup(o, cup) {
    const mistakes = [];
    let score = 0;
    const size = byId(SIZES, cup.size);
    if (cup.size === o.size.id) score += 15; else mistakes.push(`Cỡ ly: cần <b class="zh">${o.size.chn}</b>${size ? `, đã chọn ${size.chn}` : ''}`);
    if (cup.tea === o.tea.id && !cup.mixed) score += 25;
    else mistakes.push(cup.mixed ? 'Trà bị pha lẫn 2 loại' : `Loại trà: cần <b class="zh">${o.tea.chn}</b>${cup.tea ? `, đã rót ${byId(TEAS, cup.tea).chn}` : ''}`);
    const d = Math.abs(cup.fill - POUR_RULES.target);
    const fillScore = cup.spilled ? 20 : cup.fill <= 0 ? 0 : d <= 5 ? 100 : d <= 10 ? 80 : d <= 20 ? 50 : 20;
    score += (20 * fillScore) / 100;
    if (fillScore < 100) mistakes.push(cup.spilled ? 'Rót tràn ly' : `Rót ${Math.round(cup.fill)}% (vạch chuẩn ${POUR_RULES.target}%)`);
    if (cup.sugar === o.sugar.id) score += 15; else mistakes.push(`Độ ngọt: cần <b class="zh">${o.sugar.chn}</b>`);
    if (cup.ice === o.ice.id) score += 15; else mistakes.push(`Lượng đá: cần <b class="zh">${o.ice.chn}</b>`);
    const wantTop = o.topping ? [o.topping.id] : [];
    const topOk = cup.toppings.length === wantTop.length && cup.toppings.every((t, i) => t === wantTop[i]);
    if (topOk) score += 10; else mistakes.push(o.topping ? `Topping: cần <b class="zh">${o.topping.chn}</b>` : 'Khách không gọi topping (<span class="zh">不加料</span>)');
    return { score: Math.round(score), mistakes };
  }

  // ---------------- Trạm 3: tính tiền
  isReadyToCharge() { return !!(this.current && this.current.takenAt && this.cup.lid); }

  addToTray(val) {
    if (!this.isReadyToCharge()) {
      this.audio.error();
      this.showToast('🧋', 'Chưa pha xong ly! Hoàn tất pha chế & đóng nắp trước khi tính tiền.', 'warn');
      return;
    }
    this.changeTray.push(val);
    this.audio.coin();
    this.renderTray();
  }

  removeFromTray(i) { this.changeTray.splice(i, 1); this.audio.coin(); this.renderTray(); }
  resetTray() { this.changeTray = []; this.renderTray(); }

  useChangeHint() {
    const c = this.current;
    if (!c || !c.order || c.hintUsed || !this.isReadyToCharge()) return;
    c.hintUsed = true;
    this.renderChange();
  }

  deliver() {
    const c = this.current;
    if (!this.isReadyToCharge()) {
      this.audio.error();
      this.showToast('⚠️', 'Chưa đủ bước: nhận đơn → pha chế & đóng nắp → rồi mới tính tiền.', 'warn');
      return;
    }
    const tray = this.changeTray.reduce((s, v) => s + cents(v), 0);
    const need = cents(c.order.change);
    if (tray !== need) {
      c.changeWrong += 1;
      this.audio.error();
      this.audio.speak('老板，钱找错啦！');
      const diff = (tray - need) / 100;
      this.showToast('💢', diff > 0 ? `Thối THỪA ${fmt(diff)} ¥ rồi! Đếm lại nhé.` : `Thối THIẾU ${fmt(-diff)} ¥ rồi! Đếm lại nhé.`, 'warn');
      return;
    }
    this.closeModal('modal-checkout');
    this.completeOrder();
  }

  completeOrder() {
    const c = this.current;
    const o = c.order;
    const evalCup = this.evaluateCup(o, this.cup);
    const elapsed = this.gameTime - c.takenAt;
    const target = SCORE_RULES.speedBaseMs;
    const scores = {
      pick: evalCup.score,
      speed: elapsed <= target ? 100 : Math.max(40, Math.round(100 - 60 * ((elapsed - target) / (2 * target)))),
      change: Math.max(0, 100 - SCORE_RULES.changePenalty * c.changeWrong - (c.hintUsed ? SCORE_RULES.hintPenalty : 0)),
      wait: c.waitScore ?? 100
    };
    const w = SCORE_RULES.weights;
    const total = Math.round(scores.pick * w.pick + scores.speed * w.speed + scores.change * w.change + scores.wait * w.wait);
    
    // Đông khách mới có tip, bình thường không cần tip
    const isBusy = (this.line && this.line.length >= 1);
    let tip = 0;
    if (isBusy && total >= 80 && c.changeWrong === 0) {
      const bonus = (total >= 95 ? 2.0 : 1.0) + (this.line.length >= 2 ? 0.8 : 0.3);
      tip = Math.round(Math.min(4.0, bonus) * 100) / 100;
    }
    const earned = Math.round((o.due + tip) * 100) / 100;

    this.money = Math.round((this.money + earned) * 100) / 100;
    this.stats.revenue = Math.round((this.stats.revenue + earned) * 100) / 100;
    this.stats.served += 1;
    this.stats.scoreSum += total;
    if (evalCup.score === 100) this.stats.perfect += 1;
    if (c.changeWrong === 0 && !c.hintUsed) this.stats.changeFirstTry += 1;

    // Sinh đánh giá của khách (Review)
    const review = this.generateCustomerReview(c, o, evalCup, total, scores, tip);
    this.reviews.unshift(review);
    const fresh = REVIEW_SLANG.filter(w => review.commentZh.includes(w.match) && !this.learnedVocab.has(w.chn));
    fresh.forEach(w => this.learn(w.chn));
    if (fresh.length) setTimeout(() => this.showToast('📖', `Từ lóng mới vào sổ: ${fresh.map(w => `${w.chn} (${w.pin})`).join(', ')}`), 600);
    this.todayReviews.unshift(review);
    this.updateHUDReviews();

    this.audio.register();
    this.floatCoins();
    this.showScorecard(c, scores, total, tip, earned, evalCup.mistakes, review);

    this.current = null;
    this.cup = freshCup();
    this.changeTray = [];
    this.renderAll();
  }

  generateCustomerReview(customer, order, evalCup, totalScore, scores, tip) {
    let stars = 5;
    let commentZh = '';
    let commentVi = '';

    if (totalScore >= 95) {
      stars = 5;
      const q = pickOne(PRAISE_REVIEWS);
      commentZh = q.zh;
      commentVi = q.vi;
    } else if (totalScore >= 80) {
      stars = 4;
      const q = pickOne(GOOD_REVIEWS);
      commentZh = q.zh;
      commentVi = q.vi;
    } else if (totalScore >= 65) {
      stars = 3;
      const q = pickOne(OK_REVIEWS);
      commentZh = q.zh;
      commentVi = q.vi;
    } else {
      stars = totalScore >= 45 ? 2 : 1;
      if (evalCup.mistakes.some(m => m.includes('Loại trà') || m.includes('pha lẫn'))) {
        commentZh = '做错了茶底，完全不是我想要的味道，很失望！';
        commentVi = 'Pha sai loại trà rồi, không đúng vị tôi gọi, rất thất vọng!';
      } else if (evalCup.mistakes.some(m => m.includes('Độ ngọt') || m.includes('đường'))) {
        commentZh = '甜度完全不对，我说了少糖结果很甜，喝不下去！';
        commentVi = 'Độ ngọt sai rồi, tôi dặn ít đường mà quá ngọt, không uống nổi!';
      } else if (evalCup.mistakes.some(m => m.includes('Topping') || m.includes('topping'))) {
        commentZh = '忘加我选的配料了，做奶茶太粗心了！';
        commentVi = 'Quên cho topping tôi gọi rồi, làm ăn bất cẩn quá!';
      } else if (scores.change < 70) {
        commentZh = '找零钱算错了好几次，老板算账不行啊！';
        commentVi = 'Thối tiền sai mấy lần, chủ quán tính nhẩm kém quá!';
      } else if (scores.speed < 60) {
        commentZh = '等得花儿都谢了，出餐速度实在太慢了！';
        commentVi = 'Chờ dài cả cổ, quán làm nước quá chậm!';
      } else {
        const q = pickOne(BAD_REVIEWS);
        commentZh = q.zh;
        commentVi = q.vi;
      }
    }

    const now = new Date();
    const dateStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    return {
      id: Date.now() + Math.random(),
      customerNameChn: customer.profile.nameChn,
      customerNameVi: customer.profile.nameVi,
      customerImg: customer.profile.img,
      orderText: `${order.size.chn} ${order.tea.chn}${order.topping ? ' + ' + order.topping.chn : ''}`,
      stars,
      score: totalScore,
      commentZh,
      commentVi,
      day: this.day,
      time: dateStr
    };
  }

  brewTeaBatch(teaId) {
    const tea = byId(TEAS, teaId);
    if (!tea) return;
    const cost = INGREDIENT_RULES.teaBatchCost;
    if (this.money < cost - 1e-9) {
      this.audio.error();
      this.showToast('🪙', `Không đủ tiền nấu trà ${tea.chn}! Cần ${fmt(cost)} ¥.`, 'warn');
      return;
    }
    this.money = Math.round((this.money - cost) * 100) / 100;
    this.teaStock[teaId] = (this.teaStock[teaId] || 0) + INGREDIENT_RULES.batchPortions;
    this.audio.pop();
    this.showToast('🍵', `Đã nấu xong 5 phần ${tea.chn} (${tea.vi})! Còn: ${this.teaStock[teaId]} phần.`);
    this.updateHUD();
    this.renderMakeStation();
    this.renderPrepModal();
  }

  cookToppingBatch(topId) {
    const top = byId(TOPPINGS, topId);
    if (!top) return;
    const cost = INGREDIENT_RULES.toppingBatchCost;
    if (this.money < cost - 1e-9) {
      this.audio.error();
      this.showToast('🪙', `Không đủ tiền nấu topping ${top.chn}! Cần ${fmt(cost)} ¥.`, 'warn');
      return;
    }
    this.money = Math.round((this.money - cost) * 100) / 100;
    this.toppingStock[topId] = (this.toppingStock[topId] || 0) + INGREDIENT_RULES.batchPortions;
    this.audio.plop();
    this.showToast('🧋', `Đã nấu xong 5 phần ${top.chn} (${top.vi})! Còn: ${this.toppingStock[topId]} phần.`);
    this.updateHUD();
    this.renderMakeStation();
    this.renderPrepModal();
  }

  brewAll() {
    const teas = TEAS.filter(t => this.teasOwned.has(t.id));
    const tops = TOPPINGS.filter(t => this.toppingsOwned.has(t.id));
    let brewedCount = 0;
    for (const t of teas) {
      if (this.money >= INGREDIENT_RULES.teaBatchCost) {
        this.money = Math.round((this.money - INGREDIENT_RULES.teaBatchCost) * 100) / 100;
        this.teaStock[t.id] = (this.teaStock[t.id] || 0) + INGREDIENT_RULES.batchPortions;
        brewedCount += 1;
      }
    }
    for (const top of tops) {
      if (this.money >= INGREDIENT_RULES.toppingBatchCost) {
        this.money = Math.round((this.money - INGREDIENT_RULES.toppingBatchCost) * 100) / 100;
        this.toppingStock[top.id] = (this.toppingStock[top.id] || 0) + INGREDIENT_RULES.batchPortions;
        brewedCount += 1;
      }
    }
    if (brewedCount > 0) {
      this.audio.register();
      this.showToast('✨', `Đã nấu nhanh ${brewedCount} mẻ nguyên liệu (+5 mỗi loại)!`);
      this.updateHUD();
      this.renderMakeStation();
      this.renderPrepModal();
    } else {
      this.audio.error();
      this.showToast('🪙', 'Không đủ tiền để nấu nhanh nguyên liệu!', 'warn');
    }
  }

  // Dòng tóm tắt nguyên liệu đã nấu trên bảng nhiệm vụ
  renderMissionStock() {
    const box = this.$('mission-stock');
    if (!box) return;
    const items = [
      ...TEAS.filter(t => this.teasOwned.has(t.id)).map(t => ({ chn: t.chn, n: this.teaStock[t.id] || 0 })),
      ...TOPPINGS.filter(t => this.toppingsOwned.has(t.id)).map(t => ({ chn: t.chn, n: this.toppingStock[t.id] || 0 }))
    ];
    const none = items.every(x => x.n <= 0);
    box.classList.toggle('empty', none);
    box.innerHTML = none
      ? '⚠️ <b>Chưa nấu nguyên liệu nào</b> — bấm <b>Nấu nguyên liệu</b> trước khi mở cửa (hoặc bấm <b>+5 Nấu</b> ở trạm pha chế).'
      : '🍲 <b>Đã nấu:</b> ' + items.map(x => `<span class="ms-item ${x.n ? '' : 'zero'}"><span class="zh">${x.chn}</span> ${x.n}</span>`).join('');
  }

  renderPrepModal() {
    this.renderMissionStock();
    this.setText('prep-money-val', `${fmt(this.money)} ¥`);
    const teaBox = this.$('prep-tea-grid');
    const topBox = this.$('prep-topping-grid');
    if (teaBox) {
      const teas = TEAS.filter(t => this.teasOwned.has(t.id));
      teaBox.innerHTML = teas.map(t => {
        const stock = this.teaStock[t.id] || 0;
        return `
          <div class="prep-item">
            <div class="prep-item-info">
              <b class="zh">${t.chn}</b>
              <small>${escapeHtml(t.vi)} · Còn: <b>${stock}</b></small>
            </div>
            <button type="button" class="btn-cook-batch" data-cook-tea="${t.id}"><i class="fa-solid fa-fire"></i> +5 Nấu (5¥)</button>
          </div>`;
      }).join('');
    }
    if (topBox) {
      const tops = TOPPINGS.filter(t => this.toppingsOwned.has(t.id));
      topBox.innerHTML = tops.map(t => {
        const stock = this.toppingStock[t.id] || 0;
        return `
          <div class="prep-item">
            <div class="prep-item-info">
              <b class="zh">${t.icon} ${t.chn}</b>
              <small>${escapeHtml(t.vi)} · Còn: <b>${stock}</b></small>
            </div>
            <button type="button" class="btn-cook-batch" data-cook-top="${t.id}"><i class="fa-solid fa-fire"></i> +5 Nấu (4¥)</button>
          </div>`;
      }).join('');
    }
  }

  updateHUDReviews() {
    const box = this.$('hud-reviews-val');
    if (!box) return;
    if (!this.reviews.length) {
      box.textContent = '5.0★ (0)';
      return;
    }
    const avg = this.reviews.reduce((s, r) => s + r.stars, 0) / this.reviews.length;
    box.textContent = `${avg.toFixed(1)}★ (${this.reviews.length})`;
  }

  openReviewsModal() {
    const avgEl = this.$('rb-avg-score');
    const starsEl = this.$('rb-stars-icon');
    const totalEl = this.$('rb-total-count');
    const listEl = this.$('rb-reviews-list');
    if (!listEl) return;

    const count = this.reviews.length;
    const avg = count ? (this.reviews.reduce((s, r) => s + r.stars, 0) / count) : 5.0;
    const roundedStars = Math.round(avg);

    if (avgEl) avgEl.textContent = avg.toFixed(1);
    if (starsEl) starsEl.textContent = '⭐'.repeat(roundedStars) + '☆'.repeat(5 - roundedStars);
    if (totalEl) totalEl.textContent = `${count} đánh giá của khách`;

    if (!count) {
      listEl.innerHTML = '<div class="rank-empty">🧋 Chưa có đánh giá nào.<br>Phục vụ khách để nhận những đánh giá đầu tiên!</div>';
    } else {
      listEl.innerHTML = this.reviews.map(r => `
        <div class="rb-item">
          <img src="${ASSET(r.customerImg)}" alt="">
          <div class="rb-item-main">
            <div class="rb-item-head">
              <b>${escapeHtml(r.customerNameChn)} (${escapeHtml(r.customerNameVi)}) <small style="color:#a08670;font-weight:normal">· Ngày ${r.day}</small></b>
              <span class="rb-item-stars">${'⭐'.repeat(r.stars)}${'☆'.repeat(5 - r.stars)}</span>
            </div>
            <div style="font-size:0.72rem;color:#8a6d57">Đơn: ${escapeHtml(r.orderText)}</div>
            <div class="rev-wrap">
              <div class="rb-item-zh zh">“${markSlang(escapeHtml(r.commentZh))}”</div>
              <button type="button" class="btn-show-vi" data-show-vi>👁 Xem nghĩa</button>
              <div class="rev-vi">${escapeHtml(r.commentVi)}</div>
            </div>
          </div>
        </div>`).join('');
    }
    this.openModal('modal-reviews');
  }

  floatCoins() {
    const stage = this.$('g-stage');
    const from = document.querySelector('.change-tray');
    const to = document.querySelector('.g-pill.money');
    if (!stage || !from || !to) return;
    const a = this.stagePos(from);
    const b = this.stagePos(to);
    for (let i = 0; i < 6; i++) {
      const coin = document.createElement('div');
      coin.className = 'coin-float';
      coin.textContent = '🪙';
      const x = a.x + a.w / 2 + (Math.random() * 80 - 40);
      const y = a.y + a.h / 2 + (Math.random() * 40 - 20);
      coin.style.left = `${x}px`;
      coin.style.top = `${y}px`;
      coin.style.setProperty('--dx', `${b.x + 20 - x}px`);
      coin.style.setProperty('--dy', `${b.y + 6 - y}px`);
      coin.style.animationDelay = `${i * 60}ms`;
      stage.appendChild(coin);
      setTimeout(() => coin.remove(), 1300);
    }
    setTimeout(() => { to.classList.remove('bump'); void to.offsetWidth; to.classList.add('bump'); }, 700);
  }

  showScorecard(c, scores, total, tip, earned, mistakes, review = null) {
    this.setText('score-ticket-title', `Phiếu #B-${c.id} · ${c.profile.nameChn} (${c.profile.nameVi})`);
    this.setText('score-base-price', `${fmt(c.order.due)} ¥`);
    this.setText('score-tip-price', tip > 0 ? `+${fmt(tip)} ¥` : '0.00 ¥');
    const badge = this.$('score-tip-badge');
    if (badge) {
      badge.textContent = tip > 0 ? `🔥 Đông khách thưởng (+${fmt(tip)}¥)` : 'Bình thường không tip';
      badge.className = `tip-badge ${tip > 0 ? 'busy' : 'normal'}`;
    }
    this.setText('score-final-receive', `${fmt(earned)} ¥`);

    const rev = review || (this.todayReviews && this.todayReviews[0]);
    let sayZh = '';
    if (rev) {
      this.setText('score-customer-name', `${rev.customerNameChn} (${rev.customerNameVi})`);
      this.setText('scr-stars', '⭐'.repeat(rev.stars) + '☆'.repeat(5 - rev.stars));
      { const el = this.$('score-reaction-chn'); if (el) el.innerHTML = `“${markSlang(escapeHtml(rev.commentZh))}”`; }
      this.setText('score-reaction-vi', rev.commentVi);
      const img = this.$('score-reaction-img');
      if (img) img.src = ASSET(rev.customerImg);
      sayZh = rev.commentZh;
    } else {
      const img = this.$('score-reaction-img');
      if (img) img.src = ASSET(c.profile.img);
      const stars = total >= 90 ? 5 : total >= 75 ? 4 : total >= 50 ? 3 : 2;
      this.setText('score-customer-name', `${c.profile.nameChn} (${c.profile.nameVi})`);
      this.setText('scr-stars', '⭐'.repeat(stars) + '☆'.repeat(5 - stars));
      sayZh = total >= 90 ? '太好喝了！谢谢老板！' : total >= 70 ? '还不错，下次再来！' : '嗯……下次快一点吧。';
      let vi = total >= 90 ? 'Ngon quá! Cảm ơn chủ quán!' : total >= 70 ? 'Cũng ngon, lần sau tôi lại đến!' : 'Ừm… lần sau nhanh hơn chút nhé.';
      this.setText('score-reaction-chn', `“${sayZh}”`);
      this.setText('score-reaction-vi', vi);
    }
    // khách mới → thu gọn lại phần nghĩa
    const rw = this.$('score-reaction-vi')?.closest('.rev-wrap');
    if (rw) { rw.classList.remove('vi-open'); const b = rw.querySelector('[data-show-vi]'); if (b) b.textContent = '👁 Xem nghĩa'; }
    this.lastScoreReactionZh = sayZh;

    // Mẫu câu tính tiền thông dụng (hiện 1 mẫu câu ngẫu nhiên)
    this.renderSingleCheckoutPhrase();

    this.openModal('modal-score');
    if (sayZh) {
      setTimeout(() => this.audio.speak(sayZh), 500);
    }
  }

  renderSingleCheckoutPhrase() {
    const item = pickOne(CHECKOUT_PHRASES);
    const box = this.$('sp-phrase-list-boba');
    if (!box || !item) return;
    box.innerHTML = `
      <div class="sp-phrase-item single">
        <span class="sp-role-badge ${item.role.includes('Chủ') ? 'owner' : 'cust'}">${item.role} <small class="zh">${item.roleZh}</small></span>
        <div class="sp-content">
          <div class="sp-chn zh">${item.chn}</div>
          <div class="sp-pin">${item.pin}</div>
          <div class="sp-vi">${item.vi}</div>
        </div>
        <button type="button" class="sp-audio-btn" data-say-chn="${escapeHtml(item.chn)}" title="Nghe phát âm">
          <i class="fa-solid fa-volume-high"></i>
        </button>
      </div>`;
    box.querySelector('[data-say-chn]')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.audio.speak(item.chn);
    });
  }

  closeScorecard() {
    this.closeModal('modal-score');
    this.lastTickAt = performance.now();
    this.switchStation('view-order-station');
    this.promoteNext();
    this.renderAll();
    this.checkDayEnd();
  }

  // --------------------------------------------------------------------------
  // Tổng kết ngày
  // --------------------------------------------------------------------------
  showDaySummary() {
    this.dayEnded = true;
    const s = this.stats;
    const goals = this.evaluateMission();
    const stars = goals.filter(g => g.done).length;
    const bonus = stars * MISSION_RULES.bonusPerStar;
    if (this.mission && !this.mission.rewarded) {
      this.mission.rewarded = true;
      if (bonus > 0) this.money = Math.round((this.money + bonus) * 100) / 100;
    }
    const avg = s.served > 0 ? Math.round(s.scoreSum / s.served) : 0;
    const accuracy = s.served > 0 ? Math.round((s.changeFirstTry / s.served) * 100) : 0;
    const title = this.$('summary-day-title');
    if (title) title.innerHTML = `<span class="zh">第${this.day}天</span> · Tổng kết ngày`;
    this.setText('summary-revenue-val', `${fmt(s.revenue)} ¥`);
    this.setText('summary-customers-val', `${s.served}/${s.spawned}`);
    this.setText('summary-lost-val', String(s.lost));
    this.setText('summary-avg-val', s.served ? `${avg}%` : '—');
    this.setText('summary-perfect-val', String(s.perfect));
    this.setText('summary-accuracy-val', s.served ? `${accuracy}%` : '—');
    let msg;
    if (stars === 3) msg = '🏆 Ngày hoàn hảo! Hoàn thành mọi nhiệm vụ!';
    else if (goals[0] && goals[0].done) msg = '🎉 Đạt mục tiêu doanh thu! Cố thêm để lấy đủ 3 ⭐ nhé!';
    else if (s.lost > s.served) msg = '😥 Nhiều khách bỏ về quá, ngày mai nhanh tay hơn nhé!';
    else msg = '💪 Chưa đạt mục tiêu doanh thu, ngày mai cố lên!';
    this.setText('summary-msg', msg);
    const box = this.$('day-mission-results');
    if (box) {
      box.innerHTML = `
        <div class="mr-head"><span><span class="zh">今日任务</span> · Nhiệm vụ hôm nay</span><span>${'⭐'.repeat(stars)}${'☆'.repeat(3 - stars)}</span></div>
        ${goals.map(g => `<div class="mr-row ${g.done ? 'done' : 'fail'}"><span>${g.done ? '✅' : '❌'}</span><span>${g.icon} ${g.text}</span><span class="mr-val">${g.value}</span></div>`).join('')}
        ${bonus > 0 ? `<div class="mr-bonus">🎁 Thưởng nhiệm vụ: +${bonus} ¥</div>` : ''}`;
    }

    // Báo cáo nguyên liệu qua đêm đã hủy (Overnight Spoilage)
    const spoiledTeas = Object.values(this.teaStock).reduce((sum, v) => sum + (v || 0), 0);
    const spoiledToppings = Object.values(this.toppingStock).reduce((sum, v) => sum + (v || 0), 0);
    const spoiledCost = Math.round((spoiledTeas * 1.0 + spoiledToppings * 0.8) * 100) / 100;
    this.spoiledStats = { teas: spoiledTeas, toppings: spoiledToppings, cost: spoiledCost };
    this.teaStock = {};
    this.toppingStock = {};

    const spoilBox = this.$('summary-spoilage-details');
    if (spoilBox) {
      if (spoiledTeas > 0 || spoiledToppings > 0) {
        spoilBox.innerHTML = `⚠️ Đã huỷ bỏ <b>${spoiledTeas}</b> phần nước trà và <b>${spoiledToppings}</b> phần topping thừa qua đêm (thiệt hại ước tính: <b>${fmt(spoiledCost)} ¥</b>).<br><small style="color:#881337">💡 Ly, đá và đường không bị hỏng, vẫn được giữ lại nguyên vẹn!</small>`;
      } else {
        spoilBox.innerHTML = `✨ Quán dùng hết nguyên liệu đã chuẩn bị trong ngày, không bị lãng phí phần nào!`;
      }
    }

    // Nhận xét của khách hàng hôm nay
    const todayList = this.$('summary-today-reviews-list');
    const starsHead = this.$('summary-reviews-stars');
    if (todayList) {
      if (!this.todayReviews.length) {
        todayList.innerHTML = '<div style="font-size:0.75rem;color:#6b7280;text-align:center;padding:6px">Hôm nay chưa có đánh giá nào.</div>';
        if (starsHead) starsHead.textContent = '—';
      } else {
        const todayAvg = this.todayReviews.reduce((sum, r) => sum + r.stars, 0) / this.todayReviews.length;
        if (starsHead) starsHead.textContent = `${todayAvg.toFixed(1)}★ (${this.todayReviews.length} khách)`;
        todayList.innerHTML = this.todayReviews.slice(0, 6).map(r => `
          <div class="summary-rev-row">
            <img src="${ASSET(r.customerImg)}" alt="">
            <span>${'⭐'.repeat(r.stars)}</span>
            <div class="summary-rev-text rev-wrap"><b>${escapeHtml(r.customerNameChn)}:</b> <span class="zh">“${markSlang(escapeHtml(r.commentZh))}”</span>
              <button type="button" class="btn-show-vi" data-show-vi>👁</button>
              <div class="rev-vi">${escapeHtml(r.commentVi)}</div></div>
          </div>`).join('');
      }
    }

    const now = new Date();
    const record = {
      day: this.day, earnings: Math.round(s.revenue * 100) / 100, served: s.served, total: Math.max(1, s.spawned),
      lost: s.lost, avg, stars,
      date: `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
    };
    this.records = this.records.filter(r => r.day !== this.day);
    this.records.push(record);
    if (this.cloud.loggedIn) {
      const snap = this.snapshot(this.day + 1);
      LocalSave.write(this.owner, snap);
      if (s.spawned > 0) this.pushDayResult(record, snap);
      else GameCloud.post({ save: snap }).catch(() => {});
    } else {
      this.saveProgress(this.day + 1);
    }
    // Nhắc đăng nhập nằm trong bảng tổng kết (toast nổi sẽ đè lên tiêu đề bảng trên điện thoại)
    const guestNote = this.$('summary-guest-note');
    if (guestNote) guestNote.style.display = !this.cloud.loggedIn && this.cloud.checked ? 'block' : 'none';
    this.updateHUD();
    this.openModal('modal-day-summary');
    this.audio.register();
  }

  startNextDay() {
    this.closeModal('modal-day-summary');
    this.day += 1;
    this.dayStarted = false;
    this.dayEnded = false;
    this.closed = false;
    this.line = [];
    this.current = null;
    this.cup = freshCup();
    this.changeTray = [];
    this.todayReviews = [];
    this.stats = this.freshStats();
    this.saveProgress();
    this.renderAll();
    this.showMissionBriefing();
  }

  // --------------------------------------------------------------------------
  // 进货 · Mở món mới
  // --------------------------------------------------------------------------
  openMarket(zoneId = null) {
    this.stopPour();
    this.audio.pop();
    if (zoneId && byId(MARKET_ZONES, zoneId)) this.marketZone = zoneId;
    this.learn('进货');
    this.learn('菜单');
    this.renderMarket();
    this.openModal('modal-restock');
  }

  afterMarketClosed() {
    this.renderAll();
    if (!this.isDayInProgress()) this.saveProgress();
    if (this.$('modal-day-mission').style.display === 'flex') this.showMissionBriefing();
    else this.checkBankrupt();
    if (this.$('modal-prep').style.display === 'flex') this.renderPrepModal();
  }

  unlockItem(zone, id) {
    const list = zone === 'teas' ? TEAS : TOPPINGS;
    const owned = zone === 'teas' ? this.teasOwned : this.toppingsOwned;
    const it = byId(list, id);
    if (!it || owned.has(id)) return;
    if (this.money < it.unlockCost - 1e-9) {
      this.audio.error();
      this.showToast('🪙', `Cần ${fmt(it.unlockCost)} ¥ để mở ${it.chn}.`, 'warn');
      return;
    }
    this.money = Math.round((this.money - it.unlockCost) * 100) / 100;
    owned.add(id);
    this.learn(it.chn);
    this.audio.unlock();
    this.showToast('🆕', `Đã thêm ${it.chn} (${it.vi}) vào thực đơn! Khách sẽ bắt đầu gọi món này.`);
    this.renderMarket();
    this.updateHUD();
  }

  // --------------------------------------------------------------------------
  // Từ vựng
  // --------------------------------------------------------------------------
  openVocabModal() { this.renderVocabTabs('teas'); this.openModal('modal-vocab'); }

  renderVocabTabs(active) {
    const box = this.$('vocab-tabs');
    if (box) {
      box.innerHTML = VOCAB_TABS.map(t => `<button type="button" class="vocab-tab ${t.id === active ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>`).join('');
      box.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => this.renderVocabTabs(btn.dataset.tab)));
    }
    const grid = this.$('vocab-items-grid');
    if (!grid) return;
    const tab = VOCAB_TABS.find(t => t.id === active) || VOCAB_TABS[0];
    grid.innerHTML = tab.words.map((v, i) => `
      <div class="vc ${this.learnedVocab.has(v.chn) ? 'learned' : ''}">
        <span class="zh">${v.chn}</span>
        <div class="pin">${escapeHtml(v.pin)}</div>
        <div class="vi">${escapeHtml(v.vi)}</div>
        <button type="button" data-say="${i}" title="Nghe phát âm"><i class="fa-solid fa-volume-high"></i></button>
      </div>`).join('');
    grid.querySelectorAll('[data-say]').forEach(btn => btn.addEventListener('click', () => this.audio.speak(tab.words[+btn.dataset.say].chn)));
  }

  learnedCount() {
    let n = 0;
    VOCAB_TABS.forEach(t => t.words.forEach(v => { if (this.learnedVocab.has(v.chn)) n += 1; }));
    return n;
  }

  // --------------------------------------------------------------------------
  // VẼ GIAO DIỆN
  // --------------------------------------------------------------------------
  renderAll() {
    this.updateHUD();
    this.renderRail();
    this.renderCounter();
    this.renderMakeStation();
    this.renderChange();
    this.renderChalkboard();
  }

  updateHUD() {
    this.setText('hud-money-val', `${fmt(this.money)} ¥`);
    this.setText('hud-day-val', `第${this.day}天`);
    this.setText('hud-vocab-val', `${this.learnedCount()}/${VOCAB_TOTAL}`);
    this.setText('stats-rev-val', `${fmt(this.stats.revenue)} ¥`);
    this.setText('stats-cust-val', String(this.stats.served));
    this.setText('stats-lost-val', String(this.stats.lost));
    this.updateClockUI();
    this.renderHUDGoal();
    this.updateHUDReviews();
  }

  updateClockUI() {
    const elapsed = this.dayElapsed();
    const remainMs = Math.max(0, DAY_RULES.lengthMs - elapsed);
    const remainSec = Math.ceil(remainMs / 1000);
    const mm = String(Math.floor(remainSec / 60)).padStart(2, '0');
    const ss = String(remainSec % 60).padStart(2, '0');
    const remainRatio = this.dayStarted ? Math.max(0, remainMs / DAY_RULES.lengthMs) : 1;

    // Đếm ngược thời gian (mm:ss) thay vì giờ đồng hồ
    const valText = !this.dayStarted ? '02:00' : this.closed ? '00:00' : `${mm}:${ss}`;
    this.setText('hud-clock-val', valText);
    const fill = this.$('hud-clock-fill');
    if (fill) fill.style.width = `${Math.round(remainRatio * 100)}%`;
    const label = !this.dayStarted ? 'Chưa mở' : this.closed ? '🌙 Hết giờ' : remainSec <= 20 ? '⏰ Sắp hết' : '⏳ Còn lại';
    this.setText('hud-clock-label', label);
    const pill = this.$('hud-clock');
    if (pill) {
      pill.classList.toggle('closing', this.dayStarted && !this.closed && remainSec <= 20);
      pill.classList.toggle('closed', this.closed);
    }
  }

  renderHUDGoal() {
    const target = this.mission ? this.mission.target : 0;
    const rev = this.stats.revenue;
    this.setText('hud-goal-val', `${fmt(rev)} / ${target} ¥`);
    const fill = this.$('hud-goal-fill');
    if (fill) fill.style.width = `${target ? Math.min(100, (rev / target) * 100) : 0}%`;
    this.$('hud-goal')?.classList.toggle('reached', target > 0 && rev >= target);
  }

  renderRail() {
    const box = this.$('rail-queue');
    if (!box) return;
    const people = [];
    if (this.current) people.push({ c: this.current, serving: true });
    this.line.forEach(c => people.push({ c, serving: false }));
    box.innerHTML = !people.length
      ? `<span class="q-empty">${!this.dayStarted ? 'Quán chưa mở cửa' : this.closed ? '打烊 · Hết giờ bán hôm nay' : 'Chưa có ai xếp hàng…'}</span>`
      : people.map(({ c, serving }) => {
        const sealed = serving ? this.cup.lid : !!(c.cup && c.cup.lid);
        const state = !c.takenAt ? '' : sealed ? 'ready' : 'taken';
        const badge = !c.takenAt ? '<span class="mini-pat"><i></i></span>'
          : `<span class="q-badge" title="${sealed ? 'Đã đóng nắp — chờ tính tiền' : 'Đã chốt đơn — chờ pha'}">${sealed ? '🧋' : '📝'}</span>`;
        const tip = !c.takenAt ? 'Bấm để xem khách gọi món gì' : sealed ? 'Bấm để tính tiền' : 'Bấm để pha tiếp đơn này';
        return `
        <button type="button" class="q-chip ${serving ? 'serving' : ''} ${state}" data-cid="${c.id}" title="${tip}">
          <img src="${ASSET(c.profile.img)}" alt="">
          <span class="zh">${c.profile.nameChn}</span>
          ${badge}
        </button>`;
      }).join('');
    box.querySelectorAll('[data-cid]').forEach(el => el.addEventListener('click', () => this.selectCustomer(+el.dataset.cid)));
    const s = this.stats;
    this.setText('rail-info', this.dayStarted ? `✅ Đã phục vụ ${s.served} · 😠 Bỏ về ${s.lost} · Đang chờ ${this.line.length}` : '');
    this.updatePatienceUI();
    this.updateHUD();
  }

  updatePatienceUI() {
    const level = (u) => (u >= 0.75 ? 'low' : u >= 0.45 ? 'mid' : '');
    document.querySelectorAll('.q-chip').forEach(chip => {
      const id = +chip.dataset.cid;
      const c = (this.current && this.current.id === id) ? this.current : this.line.find(x => x.id === id);
      const bar = chip.querySelector('.mini-pat');
      if (!c || !bar) return;
      const u = this.relaxedMode ? 0 : this.patienceUsed(c);
      bar.className = `mini-pat ${level(u)}`;
      bar.firstElementChild.style.width = `${Math.round((1 - u) * 100)}%`;
    });
    const p = this.$('counter-patience');
    if (p) {
      const c = this.current;
      if (!c || c.takenAt || this.relaxedMode) p.classList.add('off');
      else {
        const u = this.patienceUsed(c);
        p.className = `patience ${level(u)}`;
        p.querySelector('.patience-fill').style.width = `${Math.round((1 - u) * 100)}%`;
        p.querySelector('.patience-mood').textContent = u >= 0.75 ? '😠' : u >= 0.45 ? '😐' : '😊';
      }
    }
  }

  renderCounter(entering = false) {
    const door = this.$('shop-door');
    const c = this.current;
    const bubble = this.$('speech-bubble');
    const tag = this.$('customer-tag');
    const nextBtn = this.$('btn-goto-make-from-order');
    const hint = this.$('order-footer-hint');
    const reg = this.$('reg-screen');
    if (!door) return;
    if (!c) {
      door.classList.add('empty');
      bubble?.classList.add('hidden');
      tag?.classList.add('hidden');
      if (nextBtn) nextBtn.style.display = 'none';
      const takeBtnFooter = this.$('btn-take-order-footer');
      if (takeBtnFooter) takeBtnFooter.style.display = 'none';
      this.setText('door-empty-text', !this.dayStarted ? 'Quán chưa mở cửa' : this.closed ? 'Hết giờ bán hôm nay' : 'Đang chờ khách...');
      this.setText('door-empty-chn', this.closed ? '打烊' : '欢迎光临');
      if (hint) hint.innerHTML = !this.dayStarted ? '💡 Bấm <b>Mở cửa bán hàng</b> để bắt đầu ngày mới.'
        : this.closed ? '🌙 Đã đóng cửa. Đang tổng kết ngày…' : '💡 Chờ khách bước vào… Rảnh tay thì vào <b>进货</b> mở món mới cho thực đơn.';
      if (reg) reg.textContent = '0.00';
      return;
    }
    door.classList.remove('empty');
    const wrap = this.$('door-customer');
    const img = this.$('customer-img');
    if (img && !img.src.endsWith(c.profile.img)) img.src = ASSET(c.profile.img);
    if (wrap) {
      wrap.classList.remove('leave', 'angry');
      if (entering) { wrap.classList.remove('enter'); void wrap.offsetWidth; wrap.classList.add('enter'); }
    }
    tag?.classList.remove('hidden');
    this.setText('customer-name-chn', c.profile.nameChn);
    this.setText('customer-name-vi', c.profile.nameVi);
    bubble?.classList.remove('hidden');
    bubble?.classList.toggle('taken', !!c.takenAt);
    this.renderSpeech();

    const takeBtnBubble = this.$('btn-take-order-action');
    if (takeBtnBubble) takeBtnBubble.style.display = c.takenAt ? 'none' : 'inline-flex';

    const takeBtnFooter = this.$('btn-take-order-footer');
    if (takeBtnFooter) takeBtnFooter.style.display = c.takenAt ? 'none' : 'inline-flex';

    if (nextBtn) nextBtn.style.display = c.takenAt ? 'inline-flex' : 'none';
    if (hint) hint.innerHTML = c.takenAt
      ? `✅ Đã nhận đơn <b>#B-${c.id}</b>. Sang <b>调制台</b> pha chế → <b>收银台</b> tính tiền.`
      : '💡 Nghe khách gọi món rồi bấm <b>Nhận đơn</b>. Muốn phục vụ khách khác trước? <b>Bấm vào khách trên hàng chờ</b>.';
    if (reg) reg.textContent = c.takenAt ? fmt(c.order.due) : '0.00';
    this.updatePatienceUI();
  }

  petCat() {
    this.audio.speak('喵～');
    this.learn('猫');
    const cat = this.$('btn-cat');
    if (cat) { cat.classList.remove('meow'); void cat.offsetWidth; cat.classList.add('meow'); }
    this.showToast('🐈', '猫 (māo) · Con mèo của quán đang phơi nắng. 喵～');
  }

  renderChalkboard() {
    const ul = this.$('chalk-specials');
    if (!ul) return;
    const m = byId(SIZES, 'M');
    ul.innerHTML = TEAS.filter(t => this.teasOwned.has(t.id)).slice(-4).reverse()
      .map(t => `<li><span>🧋 <span class="zh">${t.chn}</span></span><b>${fmt(m.price + t.premium)}¥</b></li>`).join('');
  }

  renderSpeech() {
    const c = this.current;
    if (!c || !c.order) return;
    const p = this.orderPhrase(c.order);
    const chn = this.$('order-chn-text');
    if (chn) chn.innerHTML = p.zhHtml;
    const pin = this.$('order-pin-text');
    if (pin) { pin.textContent = p.pin; pin.style.display = this.showPinyin ? '' : 'none'; }
    const vi = this.$('order-vi-text');
    if (vi) { vi.textContent = p.vi; vi.style.display = this.showVietnamese ? '' : 'none'; }
  }


  // ---------------- Trạm pha chế
  renderTicket() {
    const c = this.current;
    const list = this.$('mt-list');
    if (!list) return;
    this.setText('mt-id', c ? `#B-${c.id}` : '');
    const cust = this.$('mt-cust');
    if (!c || !c.takenAt || !c.order) {
      if (cust) cust.innerHTML = '';
      list.innerHTML = '<li class="mt-none">Chưa có đơn.<br>Về <b class="zh">点单台</b> nhận đơn của khách.</li>';
      return;
    }
    if (cust) cust.innerHTML = `<img src="${ASSET(c.profile.img)}" alt=""><span class="zh">${c.profile.nameChn}</span>`;
    const o = c.order;
    const cup = this.cup;
    const v = (t) => (this.showVietnamese ? `<small>${escapeHtml(t)}</small>` : '');
    const now = (val) => `<span class="mt-now ${val ? 'set' : ''}">${val || '—'}</span>`;
    const top = cup.toppings.map(id => byId(TOPPINGS, id).chn).join(' + ');
    list.innerHTML = `
      <li><span class="mt-k">🥤 Ly</span><span class="mt-v"><b class="zh">${o.size.chn}</b>${v(o.size.vi)}</span>${now(cup.size ? byId(SIZES, cup.size).chn : '')}</li>
      <li><span class="mt-k">🍵 Trà</span><span class="mt-v"><b class="zh">${o.tea.chn}</b>${v(o.tea.vi)}</span>${now(cup.mixed ? 'lẫn' : cup.tea ? `${byId(TEAS, cup.tea).chn} ${Math.round(cup.fill)}%` : '')}</li>
      <li><span class="mt-k">🍬 Đường</span><span class="mt-v"><b class="zh">${o.sugar.chn}</b>${v(o.sugar.vi)}</span>${now(cup.sugar ? byId(SUGARS, cup.sugar).chn : '')}</li>
      <li><span class="mt-k">🧊 Đá</span><span class="mt-v"><b class="zh">${o.ice.chn}</b>${v(o.ice.vi)}</span>${now(cup.ice ? byId(ICES, cup.ice).chn : '')}</li>
      <li><span class="mt-k">🧋 Topping</span><span class="mt-v"><b class="zh">${o.topping ? o.topping.chn : '不加料'}</b>${v(o.topping ? o.topping.vi : 'không topping')}</span>${now(top)}</li>
      <li><span class="mt-k">🔒 Nắp</span><span class="mt-v"><b class="zh">封口</b>${v('đóng nắp')}</span>${now(cup.lid ? '✓' : '')}</li>`;
  }

  renderCup() {
    const cup = this.cup;
    const stage = this.$('cup-stage');
    if (!stage) return;
    const size = byId(SIZES, cup.size);
    stage.classList.toggle('no-cup', !size);
    stage.style.setProperty('--cup-scale', size ? size.scale : 0.9);
    const tea = byId(TEAS, cup.tea);
    const liquid = this.$('cup-liquid');
    if (liquid) {
      liquid.style.height = `${cup.fill}%`;
      liquid.style.background = cup.mixed ? 'linear-gradient(180deg, #a08b74, #6f5b47)' : tea ? `linear-gradient(180deg, ${tea.color}, ${tea.color})` : 'transparent';
    }
    const ice = byId(ICES, cup.ice);
    const iceBox = this.$('cup-ice');
    if (iceBox) iceBox.innerHTML = ice ? Array.from({ length: ice.cubes }, (_, i) => `<i style="--r:${(i * 37) % 30 - 15}deg;--x:${(i * 29) % 70}%;--y:${10 + ((i * 41) % 45)}%"></i>`).join('') : '';
    const tops = this.$('cup-toppings');
    if (tops) {
      tops.innerHTML = cup.toppings.map(id => {
        const t = byId(TOPPINGS, id);
        return Array.from({ length: 9 }, (_, i) => `<i style="background:${t.color};--x:${(i * 11) % 90}%;--y:${(i * 7) % 18}px"></i>`).join('');
      }).join('');
    }
    const sugar = byId(SUGARS, cup.sugar);
    this.setText('cup-sugar-tag', sugar ? `🍬 ${sugar.pct}%` : '');
    this.setText('cup-size-tag', size ? `${size.chn} · ${size.id}` : '');
    this.$('cup-lid')?.classList.toggle('on', cup.lid);
    this.setText('cup-fill-val', `${Math.round(cup.fill)}%`);
    const read = document.querySelector('.cup-fill-readout');
    if (read) {
      const d = Math.abs(cup.fill - POUR_RULES.target);
      read.classList.toggle('good', cup.fill > 0 && d <= 5 && !cup.spilled);
      read.classList.toggle('bad', cup.spilled);
    }
  }

  renderMakeStation() {
    this.renderTicket();
    this.renderCup();
    const cup = this.cup;
    const locked = !!cup.lid;
    const has = !!(this.current && this.current.takenAt);

    const sizeRow = this.$('size-row');
    if (sizeRow) {
      sizeRow.innerHTML = SIZES.map(s => `
        <button type="button" class="opt-btn size-btn ${cup.size === s.id ? 'on' : ''}" data-size="${s.id}" ${locked ? 'disabled' : ''}>
          <span class="ob-icon" style="--s:${s.scale}">🥤</span><b class="zh">${s.chn}</b><small>${escapeHtml(s.pin)}</small><em>${s.price}¥</em>
        </button>`).join('');
      sizeRow.querySelectorAll('[data-size]').forEach(b => b.addEventListener('click', () => this.chooseSize(b.dataset.size)));
    }

    const teaGrid = this.$('tea-grid');
    if (teaGrid && !this.pourTimer) {
      teaGrid.innerHTML = TEAS.map(t => {
        const own = this.teasOwned.has(t.id);
        const stock = this.teaStock[t.id] || 0;
        const out = own && stock <= 0;
        return `<div class="tea-tap-item">
          <button type="button" class="tea-tap ${own ? '' : 'locked'} ${out ? 'out-of-stock' : ''} ${cup.tea === t.id ? 'on' : ''}" data-tea="${t.id}" ${locked || out ? 'disabled' : ''} style="--tea:${t.color}">
            <span class="tap-nozzle" aria-hidden="true"></span>
            <span class="tap-drop" aria-hidden="true"></span>
            <b class="zh">${t.chn}</b>
            <small>${own ? escapeHtml(t.pin) : `<i class="fa-solid fa-lock"></i> ${fmt(t.unlockCost)}¥`}</small>
            ${own ? `<span class="batch-stock ${out ? 'empty' : ''}">${out ? 'Hết' : `Còn ${stock}`}</span>` : ''}
          </button>
          ${own ? `<button type="button" class="btn-cook-batch" data-cook-tea="${t.id}" title="Nấu thêm 5 phần (5¥)">+5 Nấu (5¥)</button>` : ''}
        </div>`;
      }).join('');
      teaGrid.querySelectorAll('[data-tea]').forEach(b => {
        b.addEventListener('pointerdown', (e) => { e.preventDefault(); this.startPour(b.dataset.tea); });
        b.addEventListener('pointerleave', () => this.stopPour());
        b.addEventListener('contextmenu', (e) => e.preventDefault());
        b.addEventListener('keydown', (e) => { if ((e.key === 'Enter' || e.key === ' ') && !e.repeat) { e.preventDefault(); this.pourAmount(b.dataset.tea, 10); } });
      });
    }

    const sugarRow = this.$('sugar-row');
    if (sugarRow) {
      sugarRow.innerHTML = SUGARS.map(s => `
        <button type="button" class="opt-btn ${cup.sugar === s.id ? 'on' : ''}" data-sugar="${s.id}" ${locked ? 'disabled' : ''}>
          <b>${s.pct}%</b><span class="zh">${s.chn}</span><small>${escapeHtml(s.pin)}</small>
        </button>`).join('');
      sugarRow.querySelectorAll('[data-sugar]').forEach(b => b.addEventListener('click', () => this.chooseSugar(b.dataset.sugar)));
    }

    const iceRow = this.$('ice-row');
    if (iceRow) {
      iceRow.innerHTML = ICES.map(i => `
        <button type="button" class="opt-btn ${cup.ice === i.id ? 'on' : ''}" data-ice="${i.id}" ${locked ? 'disabled' : ''}>
          <b>${i.cubes ? '🧊' : '🚫'} ${i.label}</b><span class="zh">${i.chn}</span><small>${escapeHtml(i.pin)}</small>
        </button>`).join('');
      iceRow.querySelectorAll('[data-ice]').forEach(b => b.addEventListener('click', () => this.chooseIce(b.dataset.ice)));
    }

    const topGrid = this.$('topping-grid');
    if (topGrid) {
      topGrid.innerHTML = TOPPINGS.map(t => {
        const own = this.toppingsOwned.has(t.id);
        const stock = this.toppingStock[t.id] || 0;
        const out = own && stock <= 0;
        const n = cup.toppings.filter(x => x === t.id).length;
        return `<div class="topping-bin-item">
          <button type="button" class="opt-btn top-btn ${own ? '' : 'locked'} ${out ? 'out-of-stock' : ''} ${n ? 'on' : ''}" data-top="${t.id}" ${locked || out ? 'disabled' : ''}>
            <span class="ob-icon">${t.icon}</span>
            <b class="zh">${t.chn}</b>
            <small>${own ? escapeHtml(t.pin) : `<i class="fa-solid fa-lock"></i> ${fmt(t.unlockCost)}¥`}</small>
            ${own ? `<span class="batch-stock ${out ? 'empty' : ''}">${out ? 'Hết' : `Còn ${stock}`}</span>` : ''}
            ${n ? `<em class="cnt">×${n}</em>` : ''}
          </button>
          ${own ? `<button type="button" class="btn-cook-batch" data-cook-top="${t.id}" title="Nấu thêm 5 phần (4¥)">+5 Nấu (4¥)</button>` : ''}
        </div>`;
      }).join('');
      topGrid.querySelectorAll('[data-top]').forEach(b => b.addEventListener('click', () => this.addTopping(b.dataset.top)));
    }

    const undo = this.$('btn-undo-topping');
    if (undo) undo.disabled = locked || !cup.toppings.length;
    const lid = this.$('btn-seal-lid');
    if (lid) {
      // Đã đóng nắp → nút thành "Sang tính tiền"; pha đủ → nút Đóng nắp nhấp nháy
      lid.disabled = !has;
      lid.classList.toggle('to-pay', locked);
      lid.classList.toggle('ready-pulse', !locked && has && !!(cup.size && cup.tea && cup.sugar && cup.ice && cup.fill >= 60));
      lid.innerHTML = locked ? '<i class="fa-solid fa-cash-register"></i> <span class="zh">收银台</span> Sang tính tiền' : '<i class="fa-solid fa-circle-check"></i> <span class="zh">封口</span> Đóng nắp';
    }
    const trash = this.$('btn-trash-cup');
    if (trash) trash.disabled = !has;
    const pay = this.$('btn-goto-pay');
    if (pay) pay.disabled = !this.isReadyToCharge();
    const blocked = this.orderBlockedReason();
    const cancel = this.$('btn-cancel-order');
    if (cancel) {
      cancel.style.display = blocked ? 'inline-flex' : 'none';
      cancel.parentElement.classList.toggle('has-cancel', !!blocked);
    }

    // Đánh dấu bước đã xong
    const done = { 1: !!(cup.size && cup.fill > 0), 2: !!(cup.sugar && cup.ice), 3: locked };
    document.querySelectorAll('.step-tab').forEach(b => b.classList.toggle('done', done[+b.dataset.step]));
    this.setMakeStep(this.makeStep);
    this.$('view-make-station')?.classList.toggle('no-order', !has);

    const hint = this.$('make-hint');
    if (hint) {
      if (!has) hint.innerHTML = '💡 Chưa có đơn. Về <b>点单台</b> nhận đơn trước.';
      else if (locked) hint.innerHTML = '✅ Ly đã đóng nắp! Bấm <b>Sang tính tiền</b>.';
      else if (blocked) hint.innerHTML = `⚠️ Hết <b>${escapeHtml(blocked)}</b> mà không đủ tiền nấu thêm → bấm <b>Xin lỗi, hết món</b>.`;
      else if (!cup.size) hint.innerHTML = '💡 Bước 1: chọn <b>cỡ ly</b> theo phiếu (小杯 / 中杯 / 大杯).';
      else if (!cup.fill) hint.innerHTML = '💡 <b>Nhấn giữ</b> vòi trà đúng loại, thả tay khi tới <b>vạch 80%</b>. Hết trà thì bấm <b>+5 Nấu</b>.';
      else if (!cup.sugar || !cup.ice) hint.innerHTML = '💡 Bước 2: chọn <b>độ ngọt</b> và <b>lượng đá</b> theo phiếu.';
      else hint.innerHTML = '💡 Bước 3: thêm <b>topping</b> (nếu khách gọi) rồi <b>đóng nắp</b>.';
    }
  }

  // ---------------- Trạm tính tiền
  renderChange() {
    const c = this.current;
    const ready = this.isReadyToCharge();
    this.setText('change-due-amount', ready ? `${fmt(c.order.due)} ¥` : '—');
    this.setText('change-paid-amount', ready ? `${fmt(c.order.paid)} ¥` : '—');
    this.setText('change-needed-amount', ready && c.hintUsed ? `${fmt(c.order.change)} ¥` : '? ¥');
    const lines = this.$('bill-lines');
    if (lines) {
      if (!ready) lines.innerHTML = '';
      else {
        const o = c.order;
        lines.innerHTML = `
          <div><span><span class="zh">${o.size.chn}</span> ${escapeHtml(o.size.vi)}</span><b>${fmt(o.size.price)}</b></div>
          ${o.tea.premium ? `<div><span><span class="zh">${o.tea.chn}</span> +</span><b>${fmt(o.tea.premium)}</b></div>` : ''}
          ${o.topping ? `<div><span><span class="zh">${o.topping.chn}</span> +</span><b>${fmt(o.topping.price)}</b></div>` : ''}`;
      }
    }
    const hintBtn = this.$('btn-change-hint');
    if (hintBtn) {
      hintBtn.classList.toggle('used', !!(c && c.hintUsed));
      hintBtn.innerHTML = c && c.hintUsed ? '<i class="fa-solid fa-lightbulb"></i> Đã xem gợi ý' : '<i class="fa-solid fa-lightbulb"></i> Gợi ý (−20 điểm)';
    }
    const bills = this.$('customer-bill-render');
    if (bills) {
      bills.innerHTML = !ready
        ? '<div class="tray-empty" style="color:#fff4dd">Khách sẽ trả tiền khi ly đã pha xong &amp; đóng nắp.</div>'
        : this.splitIntoNotes(c.order.paid).map(v => this.noteHtml(v)).join('');
    }
    this.renderTray();
  }

  splitIntoNotes(amount) {
    const out = [];
    let left = cents(amount);
    [10000, 5000, 2000, 1000, 500, 100, 50, 10].forEach(d => { while (left >= d) { out.push(d / 100); left -= d; } });
    return out;
  }

  noteHtml(v) {
    if (v >= 1) {
      const cls = { 100: 'n100', 50: 'n50', 20: 'n20', 10: 'n10', 5: 'n5', 1: 'n1' }[v] || 'n1';
      return `<span class="rmb note ${cls}" style="width:120px;height:66px;cursor:default"><b>${v}</b><span class="zh">元</span></span>`;
    }
    return `<span class="rmb coin ${v === 0.5 ? 'c5' : 'c1'}" style="width:56px;height:56px;cursor:default"><b>${v === 0.5 ? 5 : 1}</b><span class="zh">角</span></span>`;
  }

  renderTray() {
    const box = this.$('tray-dropped-tokens');
    if (!box) return;
    if (!this.changeTray.length) {
      box.innerHTML = `<div class="tray-empty">${this.isReadyToCharge() ? 'Chạm tờ tiền/đồng xu trong ngăn kéo để lấy tiền thối.' : 'Pha xong & đóng nắp ly trước khi thối tiền.'}</div>`;
    } else {
      box.innerHTML = this.changeTray.map((v, i) => {
        if (v >= 1) {
          const cls = { 20: 'n20', 10: 'n10', 5: 'n5', 1: 'n1' }[v] || 'n1';
          return `<button type="button" class="token ${cls}" data-tray="${i}" title="Bỏ lại ngăn kéo">${v}<span class="zh">元</span></button>`;
        }
        return `<button type="button" class="token coin ${v === 0.5 ? 'c5' : 'c1'}" data-tray="${i}" title="Bỏ lại ngăn kéo">${v === 0.5 ? 5 : 1}<span class="zh">角</span></button>`;
      }).join('');
      box.querySelectorAll('[data-tray]').forEach(el => el.addEventListener('click', () => this.removeFromTray(+el.dataset.tray)));
    }
    const sum = this.changeTray.reduce((s, v) => s + cents(v), 0) / 100;
    const sumEl = this.$('tray-total-picked');
    if (sumEl) {
      sumEl.textContent = `Đã lấy: ${fmt(sum)} ¥`;
      const c = this.current;
      sumEl.classList.toggle('match', !!(c && c.hintUsed && this.isReadyToCharge() && cents(sum) === cents(c.order.change)));
    }
    const btn = this.$('btn-confirm-and-deliver');
    if (btn) btn.disabled = !this.isReadyToCharge();
  }

  renderMarket() {
    const zonesBox = this.$('market-zones');
    const head = this.$('market-zone-head');
    const grid = this.$('market-grid');
    if (!grid) return;
    const z = byId(MARKET_ZONES, this.marketZone) || MARKET_ZONES[0];
    const list = z.id === 'teas' ? TEAS : TOPPINGS;
    const owned = z.id === 'teas' ? this.teasOwned : this.toppingsOwned;
    if (zonesBox) {
      zonesBox.innerHTML = MARKET_ZONES.map(zz => {
        const l = zz.id === 'teas' ? TEAS : TOPPINGS;
        const o = zz.id === 'teas' ? this.teasOwned : this.toppingsOwned;
        return `<button type="button" class="mz ${zz.id === z.id ? 'active' : ''}" data-mz="${zz.id}">
          <span class="mz-icon">${zz.icon}</span>
          <span class="mz-txt"><b class="zh">${zz.chn}</b><small>${escapeHtml(zz.short)}</small></span>
          <span class="mz-state">${o.size}/${l.length}</span>
        </button>`;
      }).join('');
      zonesBox.querySelectorAll('[data-mz]').forEach(b => b.addEventListener('click', () => { this.marketZone = b.dataset.mz; this.audio.pop(); this.renderMarket(); }));
    }
    if (head) head.innerHTML = `<span class="mzh-icon">${z.icon}</span><div><b class="zh">${z.chn}</b> <span class="mzh-pin">${escapeHtml(z.pin)}</span><small>${z.id === 'teas' ? 'Mở thêm loại trà — khách sẽ gọi đa dạng hơn, ly đắt hơn' : 'Mở thêm topping — mỗi topping cộng thêm tiền vào ly'}</small></div>`;
    grid.innerHTML = list.map(it => {
      const own = owned.has(it.id);
      const ok = this.money >= it.unlockCost;
      const extra = z.id === 'teas' ? (it.premium ? `+${fmt(it.premium)} ¥ / ly` : 'Giá gốc') : `+${fmt(it.price)} ¥ / ly`;
      const swatch = z.id === 'teas' ? `<span class="mk-swatch" style="--tea:${it.color}">🧋</span>` : `<span class="mk-emoji">${it.icon}</span>`;
      return `<div class="mk-card ${own ? 'owned' : 'locked'}">
        ${swatch}
        <b class="zh mk-name">${it.chn}</b>
        <span class="mk-pin">${escapeHtml(it.pin)}</span>
        <span class="mk-vi">${escapeHtml(it.vi)}</span>
        <span class="mk-price">${extra}</span>
        ${own ? '<span class="mk-owned"><i class="fa-solid fa-check"></i> Đang bán</span>'
          : `<button type="button" class="mk-unlock" data-unlock="${it.id}" ${ok ? '' : 'disabled'}><i class="fa-solid fa-unlock"></i> Mở · ${fmt(it.unlockCost)} ¥</button>`}
      </div>`;
    }).join('');
    grid.querySelectorAll('[data-unlock]').forEach(btn => btn.addEventListener('click', () => this.unlockItem(z.id, btn.dataset.unlock)));
    this.setText('market-money', `${fmt(this.money)} ¥`);
    this.setText('market-count', `${this.teasOwned.size} trà · ${this.toppingsOwned.size} topping`);
  }

  // --------------------------------------------------------------------------
  // Tài khoản & bảng xếp hạng
  // --------------------------------------------------------------------------
  async initCloud() {
    // (trước đây: thiếu token là coi như khách ngay → người đã đăng nhập ở trang chính vẫn bị báo "Khách")
    let data;
    try {
      data = await GameCloud.getProgress();
    } catch (e) {
      this.cloud.checked = true;
      this.cloud.offline = true;
      const lu = GameCloud.localUser();
      if (lu) this.cloud.name = lu.name || lu.email;
      this.renderAccountChip();
      return;
    }
    this.cloud.checked = true;
    if (!data || !data.loggedIn) { this.switchOwner('guest'); this.renderAccountChip(); return; }
    const lu = GameCloud.localUser();
    this.cloud.loggedIn = true;
    this.cloud.name = (data.user && data.user.name) || (lu && lu.name) || 'Bạn';
    this.cloud.picture = (data.user && data.user.picture) || (lu && lu.picture) || '';
    this.cloud.best = data.best || null;
    this.cloud.history = Array.isArray(data.history) ? data.history : [];
    const email = lu && lu.email ? String(lu.email).toLowerCase().trim() : '';
    this.owner = email || 'account';
    const server = migrateSave(data.save);
    const local = email ? LocalSave.read(email) : null;
    const sTime = server ? Number(server.updatedAt) || 0 : -1;
    const lTime = local ? Number(local.updatedAt) || 0 : -1;
    if (!this.isDayInProgress()) {
      if (server && sTime >= lTime) {
        this.applySnapshot(server);
        if (email) LocalSave.write(email, this.snapshotKeepTime(server));
      } else if (local) {
        this.applySnapshot(local);
        GameCloud.post({ save: local }).catch(() => {});
      } else {
        this.resetProgressState();
      }
      this.renderAll();
    }
    this.renderAccountChip();
  }

  // Bản lưu đã chuyển đổi (giữ nguyên thời điểm lưu gốc)
  snapshotKeepTime(s) { return { ...this.snapshot(), day: this.day, updatedAt: Number(s.updatedAt) || Date.now() }; }

  switchOwner(owner) {
    if (this.owner === owner) return;
    this.owner = owner;
    if (this.isDayInProgress()) return;
    const s = LocalSave.read(owner);
    if (s) this.applySnapshot(s); else this.resetProgressState();
    this.renderAll();
  }

  renderAccountChip() {
    const chip = this.$('title-account');
    if (!chip) return;
    const c = this.cloud;
    const avatar = this.$('title-account-avatar');
    if (c.loggedIn) {
      chip.classList.remove('guest');
      chip.removeAttribute('href');
      this.setText('title-account-name', c.name);
      this.setText('title-account-status', c.best ? `☁️ Đã lưu · Kỷ lục ${fmt(c.best.earnings)} ¥` : '☁️ Tiến trình được lưu vào tài khoản');
      if (avatar) avatar.innerHTML = c.picture ? `<img src="${escapeHtml(c.picture)}" alt="" referrerpolicy="no-referrer">` : '<i class="fa-solid fa-user"></i>';
    } else {
      chip.classList.add('guest');
      chip.setAttribute('href', 'index.html');
      this.setText('title-account-name', c.offline && c.name ? c.name : 'Khách');
      this.setText('title-account-status', c.offline ? '⚠️ Mất kết nối · lưu tạm trên máy' : 'Đăng nhập để lưu vào tài khoản');
      if (avatar) avatar.innerHTML = '<i class="fa-solid fa-user"></i>';
    }
  }

  async pushDayResult(dayResult, save = null) {
    try {
      const body = { dayResult };
      if (save) body.save = save;
      const r = await GameCloud.post(body);
      if (r && r.best) this.cloud.best = r.best;
      if (r && Array.isArray(r.history)) this.cloud.history = r.history;
      if (r && r.newBest) this.showToast('🏆', `Kỷ lục mới: ${fmt(r.best.earnings)} ¥ — đã cập nhật bảng xếp hạng!`);
      this.renderAccountChip();
    } catch (e) {
      this.showToast('⚠️', 'Chưa gửi được kết quả lên bảng xếp hạng (mất kết nối).', 'warn');
    }
  }

  openRankModal(tab = this.rankTab || 'global') { this.openModal('modal-rank'); this.switchRankTab(tab); }

  switchRankTab(tab) {
    this.rankTab = tab === 'mine' ? 'mine' : 'global';
    document.querySelectorAll('.rank-tab').forEach(b => b.classList.toggle('active', b.dataset.rankTab === this.rankTab));
    if (this.rankTab === 'mine') this.renderMyRank(); else this.renderGlobalRank();
  }

  async renderGlobalRank() {
    const list = this.$('rank-list');
    const summary = this.$('rank-summary');
    if (!list || !summary) return;
    this.setText('rank-note', 'Mỗi người chỉ tính thành tích cao nhất · Xếp theo doanh thu 1 ngày → số sao → điểm trung bình');
    summary.innerHTML = '';
    list.innerHTML = '<div class="rank-loading"><i class="fa-solid fa-spinner fa-spin"></i> Đang tải bảng xếp hạng...</div>';
    const req = (this.rankReq = (this.rankReq || 0) + 1);
    let data;
    try {
      data = await GameCloud.getLeaderboard();
    } catch (e) {
      if (req !== this.rankReq || this.rankTab !== 'global') return;
      list.innerHTML = '<div class="rank-empty">📡 Không kết nối được máy chủ.<br>Kiểm tra mạng rồi thử lại nhé!<br><br><button type="button" class="g-btn-chip" id="btn-rank-retry">🔄 Thử lại</button></div>';
      this.$('btn-rank-retry')?.addEventListener('click', () => this.renderGlobalRank());
      return;
    }
    if (req !== this.rankReq || this.rankTab !== 'global') return;
    const me = data.me;
    summary.innerHTML = `
      <div class="rs-item"><span>👥</span><strong>${data.totalPlayers || 0}</strong><small>Chủ quán</small></div>
      <div class="rs-item"><span>🏅</span><strong>${me ? `#${me.rank}` : '—'}</strong><small>Hạng của bạn</small></div>
      <div class="rs-item"><span>🏆</span><strong>${me ? `${fmt(me.earnings)} ¥` : '—'}</strong><small>Kỷ lục của bạn</small></div>
      <div class="rs-item"><span>📅</span><strong>${me ? me.daysPlayed || 0 : '—'}</strong><small>Ngày đã bán</small></div>`;
    const cta = !data.loggedIn ? '<div class="rank-cta"><span>🔐 Bạn đang chơi với tư cách khách — đăng nhập để ghi tên lên bảng!</span><a href="index.html">Đăng nhập</a></div>' : '';
    const top = Array.isArray(data.top) ? data.top : [];
    if (!top.length) {
      list.innerHTML = cta + '<div class="rank-empty">🧋 Chưa có ai trên bảng xếp hạng.<br>Hoàn thành 1 ngày bán hàng để là người đầu tiên!</div>';
      return;
    }
    const medals = ['🥇', '🥈', '🥉'];
    const row = (r) => `
      <div class="rank-row ${r.rank <= 3 ? 'top' : ''} ${r.isMe ? 'me' : ''}">
        <span class="rr-pos">${medals[r.rank - 1] || r.rank}</span>
        <span class="rr-player">
          ${r.picture ? `<img class="rr-avatar" src="${escapeHtml(r.picture)}" alt="" referrerpolicy="no-referrer" loading="lazy">` : '<span class="rr-avatar"><i class="fa-solid fa-user"></i></span>'}
          <span class="rr-name"><b>${escapeHtml(r.name)}${r.isMe ? '<span class="rr-me">Bạn</span>' : ''}</b><small><span class="zh">第${Number(r.day) || 1}天</span>${r.achievedAt ? ` · ${new Date(r.achievedAt).toLocaleDateString('vi-VN')}` : ''}</small></span>
        </span>
        <span class="rr-earn">${fmt(r.earnings)} ¥</span>
        <span>🧋 ${r.served}/${r.total}${r.lost ? ` · 😠 ${r.lost}` : ''}</span>
        <span class="rr-avg">${r.served > 0 ? `${r.avg}%` : '—'}</span>
        <span class="rr-stars">${'⭐'.repeat(r.stars || 0)}${'☆'.repeat(3 - (r.stars || 0))}</span>
      </div>`;
    const meOutside = me && !top.some(r => r.isMe);
    list.innerHTML = cta + top.map(row).join('') + (meOutside ? `<div class="rank-gap">⋮</div>${row(me)}` : '');
  }

  renderMyRank() {
    const list = this.$('rank-list');
    const summary = this.$('rank-summary');
    const fmtDate = (iso) => { const d = new Date(iso); return Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('vi-VN'); };
    const src = this.cloud.loggedIn ? this.cloud.history.map(h => ({ ...h, date: fmtDate(h.playedAt) })) : this.records;
    this.setText('rank-note', this.cloud.loggedIn ? '☁️ Các ngày bán đã lưu trong tài khoản · Xếp theo doanh thu trong ngày' : 'Đang lưu trên máy này · Đăng nhập để lưu vào tài khoản và lên bảng xếp hạng');
    const recs = [...src].filter(r => r && Number.isFinite(Number(r.earnings))).sort((a, b) => b.earnings - a.earnings);
    if (summary) {
      const totalEarn = recs.reduce((s, r) => s + Number(r.earnings), 0);
      const served = recs.reduce((s, r) => s + (r.served || 0), 0);
      const stars = recs.reduce((s, r) => s + (r.stars || 0), 0);
      summary.innerHTML = `
        <div class="rs-item"><span>📅</span><strong>${recs.length}</strong><small>Ngày đã bán</small></div>
        <div class="rs-item"><span>🧋</span><strong>${served}</strong><small>Ly đã bán</small></div>
        <div class="rs-item"><span>🪙</span><strong>${fmt(totalEarn)} ¥</strong><small>Tổng doanh thu</small></div>
        <div class="rs-item"><span>⭐</span><strong>${stars}</strong><small>Tổng sao</small></div>`;
    }
    if (!list) return;
    if (!recs.length) { list.innerHTML = '<div class="rank-empty">🧋 Chưa có ngày bán nào.<br>Hoàn thành ngày đầu tiên để ghi kỷ lục!</div>'; return; }
    const medals = ['🥇', '🥈', '🥉'];
    list.innerHTML = recs.slice(0, 15).map((r, i) => `
      <div class="rank-row ${i < 3 ? 'top' : ''}">
        <span class="rr-pos">${medals[i] || i + 1}</span>
        <span class="rr-name"><b class="zh">第${r.day}天</b><small>${escapeHtml(r.date || '')}</small></span>
        <span class="rr-earn">${fmt(r.earnings)} ¥</span>
        <span>🧋 ${r.served}/${r.total}${r.lost ? ` · 😠 ${r.lost}` : ''}</span>
        <span class="rr-avg">${r.served > 0 ? `${r.avg}%` : '—'}</span>
        <span class="rr-stars">${'⭐'.repeat(r.stars || 0)}${'☆'.repeat(3 - (r.stars || 0))}</span>
      </div>`).join('');
  }
}

(function bootBoba() {
  const start = () => { if (!window.bobaGame) window.bobaGame = new BobaShop(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
