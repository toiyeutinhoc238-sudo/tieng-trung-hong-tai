/**
 * Tiệm Tạp Hóa Của Tôi (我的小卖部)
 * Mô phỏng quản lý tiệm tạp hóa kiểu Papa's:
 *   - Mỗi ngày mở cửa 08:00 → 20:00 (tính theo thời gian). Khách đến liên tục, phục vụ được bao nhiêu thì phục vụ.
 *   - Nhận đơn → nhặt hàng (theo từng khu kệ) → quét mã → thu tiền & thối tiền → chấm điểm.
 *   - Hàng chia theo khu như tiệm thật (đồ uống, bánh kẹo, đồ ăn vặt…). Khu kệ và từng món đều mở bằng tiền ở 批发市场.
 *
 * LƯU TIẾN TRÌNH: đã đăng nhập → lưu theo tài khoản (server) + bản sao trên máy; khách → lưu trên trình duyệt.
 * Lưu ở các mốc an toàn (đầu ngày, cuối ngày, sau khi nhập hàng ngoài giờ bán). Thoát giữa ngày → vào lại chơi lại ngày đó.
 * Kết quả mỗi ngày gửi lên tài khoản → bảng xếp hạng giữ thành tích cao nhất.
 *
 * Lưu ý: file này còn được nạp dạng <script> thường khi mở bằng file:// → không dùng import/export.
 */

// ============================================================================
// 1. ÂM THANH (Web Audio + giọng đọc tiếng Trung)
// ============================================================================
class GroceryAudio {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.voiceEnabled = true;
    this.voices = [];
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
  beep() { this.tone(1760, 0.1, { vol: 0.28 }); }
  coin() { this.tone(1800, 0.12, { vol: 0.16 }); this.tone(2400, 0.12, { vol: 0.14, delay: 0.03 }); }
  bell() { this.tone(1320, 0.5, { type: 'triangle', vol: 0.2 }); this.tone(1980, 0.4, { type: 'triangle', vol: 0.1, delay: 0.05 }); }
  error() { this.tone(160, 0.3, { type: 'sawtooth', vol: 0.22, slideTo: 110 }); }
  register() { [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => this.tone(f, 0.32, { type: 'triangle', vol: 0.22, delay: i * 0.08 })); }
  sad() { this.tone(400, 0.35, { type: 'triangle', vol: 0.18, slideTo: 220 }); }
  unlock() { [659.25, 880, 1174.66].forEach((f, i) => this.tone(f, 0.28, { type: 'triangle', vol: 0.2, delay: i * 0.09 })); }

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
// 2. DỮ LIỆU: KHU KỆ · HÀNG HÓA · KHÁCH · TỪ VỰNG
// ============================================================================
// Khu kệ (giống tiệm tạp hóa thật). unlockCost 0 = có sẵn từ đầu.
// ==== SINH TỰ ĐỘNG từ "Tạp hóa.xlsx" (scripts/gen_grocery_catalog.cjs) — sửa file Excel rồi chạy lại, đừng sửa tay khối này ====
const GROCERY_ZONES = [
  { id: 'food', chn: '食品调料', pin: 'shípǐn tiáoliào', vi: 'Đồ ăn & gia vị', short: 'Đồ ăn', icon: '🍜', unlockCost: 0 },
  { id: 'drinks', chn: '饮料', pin: 'yǐnliào', vi: 'Đồ uống', short: 'Đồ uống', icon: '🧃', unlockCost: 0 },
  { id: 'dairy', chn: '冷藏食品', pin: 'lěngcáng shípǐn', vi: 'Sữa & thực phẩm lạnh', short: 'Đồ lạnh', icon: '🧊', unlockCost: 150 },
  { id: 'household', chn: '日用清洁', pin: 'rìyòng qīngjié', vi: 'Đồ vệ sinh & gia dụng', short: 'Gia dụng', icon: '🧺', unlockCost: 300 },
  { id: 'personal', chn: '个人护理', pin: 'gèrén hùlǐ', vi: 'Chăm sóc cá nhân', short: 'Cá nhân', icon: '🧴', unlockCost: 400 },
  { id: 'stationery', chn: '文具', pin: 'wénjù', vi: 'Văn phòng phẩm & đồ dùng', short: 'Văn phòng phẩm', icon: '✏️', unlockCost: 200 }
];

// Hàng hóa (đúng tên / pinyin / nghĩa / lượng từ / giá trong file). unlockCost 0 = bán ngay khi khu được mở; còn lại mở ở 批发市场.
const I = (zone, id, nameChn, pinyin, nameVi, quantifier, qPin, quantifierVi, cost, price, maxStock, emoji, unlockCost) =>
  ({ zone, id, nameChn, pinyin, nameVi, quantifier, qPin, quantifierVi, cost, price, maxStock, emoji, unlockCost });

const GROCERY_ITEMS = [
  // 食品调料 · Đồ ăn & gia vị
  I('food', 'tp001', '大米', 'dàmǐ', 'gạo', '袋', 'dài', 'túi', 15, 25, 8, '', 75),
  I('food', 'tp002', '方便面', 'fāngbiànmiàn', 'mì ăn liền / mì gói', '包', 'bāo', 'gói', 2, 3, 12, '', 0),
  I('food', 'tp003', '面包', 'miànbāo', 'bánh mì', '个', 'gè', 'ổ/chiếc', 3, 5, 12, '', 0),
  I('food', 'tp004', '鸡蛋', 'jīdàn', 'trứng gà', '盒', 'hé', 'hộp', 7, 12, 10, '', 40),
  I('food', 'tp005', '香肠', 'xiāngcháng', 'xúc xích', '根', 'gēn', 'cây', 2.5, 4, 12, '', 0),
  I('food', 'tp006', '火腿', 'huǒtuǐ', 'giăm bông', '包', 'bāo', 'gói', 9, 15, 8, '', 45),
  I('food', 'tp007', '罐头鱼', 'guàntóuyú', 'cá hộp', '罐', 'guàn', 'hộp', 6, 10, 10, '', 30),
  I('food', 'tp008', '饼干', 'bǐnggān', 'bánh quy', '包', 'bāo', 'gói', 5, 8, 10, '', 25),
  I('food', 'tp009', '薯片', 'shǔpiàn', 'khoai tây chiên lát / snack khoai tây', '包', 'bāo', 'gói', 6, 10, 10, '', 30),
  I('food', 'tp010', '糖果', 'tángguǒ', 'kẹo', '包', 'bāo', 'gói', 4, 7, 10, '', 25),
  I('food', 'tp011', '巧克力', 'qiǎokèlì', 'sô-cô-la', '块', 'kuài', 'thanh/miếng', 7, 12, 10, '', 40),
  I('food', 'tp012', '花生', 'huāshēng', 'đậu phộng', '包', 'bāo', 'gói', 5, 8, 10, '', 25),
  I('food', 'tp013', '盐', 'yán', 'muối', '包', 'bāo', 'gói', 3, 5, 12, '', 15),
  I('food', 'tp014', '糖', 'táng', 'đường', '包', 'bāo', 'túi', 4, 7, 10, '', 25),
  I('food', 'tp015', '鱼露', 'yúlù', 'nước mắm', '瓶', 'píng', 'chai', 11, 18, 8, '', 55),
  I('food', 'tp016', '酱油', 'jiàngyóu', 'nước tương', '瓶', 'píng', 'chai', 9, 15, 8, '', 45),
  I('food', 'tp017', '食用油', 'shíyòngyóu', 'dầu ăn', '瓶', 'píng', 'chai', 21, 35, 6, '', 105),
  // 饮料 · Đồ uống
  I('drinks', 'du001', '矿泉水', 'kuàngquánshuǐ', 'nước suối', '瓶', 'píng', 'chai', 3, 5, 12, '', 0),
  I('drinks', 'du002', '纯净水', 'chúnjìngshuǐ', 'nước tinh khiết', '瓶', 'píng', 'chai', 2.5, 4, 12, '', 0),
  I('drinks', 'du003', '可乐', 'kělè', 'nước cola', '瓶', 'píng', 'chai', 6, 10, 10, '', 30),
  I('drinks', 'du004', '汽水', 'qìshuǐ', 'nước ngọt có ga', '罐', 'guàn', 'lon', 5.5, 9, 10, '', 30),
  I('drinks', 'du005', '橙汁', 'chéngzhī', 'nước cam', '盒', 'hé', 'hộp', 7, 12, 10, '', 40),
  I('drinks', 'du006', '牛奶', 'niúnǎi', 'sữa tươi', '盒', 'hé', 'hộp', 5.5, 9, 10, '', 30),
  I('drinks', 'du007', '豆浆', 'dòujiāng', 'sữa đậu nành', '瓶', 'píng', 'chai', 5, 8, 10, '', 25),
  I('drinks', 'du008', '咖啡', 'kāfēi', 'cà phê', '包', 'bāo', 'gói', 2, 3, 12, '', 0),
  I('drinks', 'du009', '茶', 'chá', 'trà', '盒', 'hé', 'hộp', 12, 20, 8, '', 60),
  // 冷藏食品 · Sữa & thực phẩm lạnh
  I('dairy', 'sl001', '酸奶', 'suānnǎi', 'sữa chua', '杯', 'bēi', 'hũ', 5, 8, 10, '', 0),
  I('dairy', 'sl002', '奶酪', 'nǎilào', 'phô mai', '片', 'piàn', 'lát', 3, 5, 12, '', 0),
  I('dairy', 'sl003', '黄油', 'huángyóu', 'bơ', '盒', 'hé', 'hộp', 15, 25, 8, '', 75),
  I('dairy', 'sl004', '冰淇淋', 'bīngqílín', 'kem', '支', 'zhī', 'cây', 6, 10, 10, '', 0),
  // 日用清洁 · Đồ vệ sinh & gia dụng
  I('household', 'gd001', '洗衣粉', 'xǐyīfěn', 'bột giặt', '袋', 'dài', 'gói', 15, 25, 8, '', 75),
  I('household', 'gd002', '洗衣液', 'xǐyīyè', 'nước giặt', '瓶', 'píng', 'chai', 27, 45, 6, '', 135),
  I('household', 'gd003', '洗洁精', 'xǐjiéjīng', 'nước rửa chén', '瓶', 'píng', 'chai', 12, 20, 8, '', 60),
  I('household', 'gd004', '纸巾', 'zhǐjīn', 'khăn giấy', '包', 'bāo', 'gói', 3, 5, 12, '', 0),
  I('household', 'gd005', '卫生纸', 'wèishēngzhǐ', 'giấy vệ sinh', '提', 'tí', 'lốc', 18, 30, 6, '', 90),
  I('household', 'gd006', '垃圾袋', 'lājīdài', 'túi đựng rác', '卷', 'juǎn', 'cuộn', 7, 12, 10, '', 40),
  I('household', 'gd007', '电池', 'diànchí', 'pin', '节', 'jié', 'viên', 6, 10, 10, '', 0),
  I('household', 'gd008', '打火机', 'dǎhuǒjī', 'bật lửa', '个', 'gè', 'cái', 3, 5, 12, '', 0),
  // 个人护理 · Chăm sóc cá nhân
  I('personal', 'cn001', '牙膏', 'yágāo', 'kem đánh răng', '支', 'zhī', 'tuýp', 12, 20, 8, '', 60),
  I('personal', 'cn002', '牙刷', 'yáshuā', 'bàn chải đánh răng', '把', 'bǎ', 'cái', 7, 12, 10, '', 0),
  I('personal', 'cn003', '洗发水', 'xǐfàshuǐ', 'dầu gội', '瓶', 'píng', 'chai', 27, 45, 6, '', 135),
  I('personal', 'cn004', '沐浴露', 'mùyùlù', 'sữa tắm', '瓶', 'píng', 'chai', 24, 40, 6, '', 120),
  I('personal', 'cn005', '香皂', 'xiāngzào', 'xà phòng cục', '块', 'kuài', 'cục', 6, 10, 10, '', 0),
  I('personal', 'cn006', '洗手液', 'xǐshǒuyè', 'nước rửa tay', '瓶', 'píng', 'chai', 15, 25, 8, '', 75),
  I('personal', 'cn007', '梳子', 'shūzi', 'lược', '把', 'bǎ', 'cái', 6, 10, 10, '', 0),
  I('personal', 'cn008', '口罩', 'kǒuzhào', 'khẩu trang', '包', 'bāo', 'gói', 9, 15, 8, '', 45),
  // 文具 · Văn phòng phẩm & đồ dùng
  I('stationery', 'vp001', '笔', 'bǐ', 'bút', '支', 'zhī', 'cây', 3, 5, 12, '', 15),
  I('stationery', 'vp002', '铅笔', 'qiānbǐ', 'bút chì', '支', 'zhī', 'cây', 2.5, 4, 12, '', 0),
  I('stationery', 'vp003', '橡皮', 'xiàngpí', 'gôm / tẩy', '块', 'kuài', 'cục', 2, 3, 12, '', 0),
  I('stationery', 'vp004', '笔记本', 'bǐjìběn', 'tập / sổ ghi chép', '本', 'běn', 'quyển', 7, 12, 10, '', 40),
  I('stationery', 'vp005', '作业本', 'zuòyèběn', 'vở bài tập', '本', 'běn', 'quyển', 6, 10, 10, '', 30),
  I('stationery', 'vp006', '胶带', 'jiāodài', 'băng keo', '卷', 'juǎn', 'cuộn', 5, 8, 10, '', 25),
  I('stationery', 'vp007', '剪刀', 'jiǎndāo', 'kéo', '把', 'bǎ', 'cái', 9, 15, 8, '', 45),
  I('stationery', 'vp008', '塑料袋', 'sùliàodài', 'túi ni-lông', '个', 'gè', 'cái', 0.5, 1, 12, '', 0)
];

// Lượng từ (sheet "Lượng từ")
const QUANTIFIER_WORDS = [
  { chn: '个', pin: 'gè', vi: 'Lượng từ phổ biến cho đồ vật, người; dùng khi chưa có lượng từ chuyên biệt. VD: 一个打火机 (một cái bật lửa)' },
  { chn: '包', pin: 'bāo', vi: 'Gói, bao nhỏ. VD: 一包方便面 (một gói mì)' },
  { chn: '袋', pin: 'dài', vi: 'Túi, bao. VD: 一袋大米 (một túi gạo)' },
  { chn: '瓶', pin: 'píng', vi: 'Chai. VD: 一瓶矿泉水 (một chai nước suối)' },
  { chn: '罐', pin: 'guàn', vi: 'Lon hoặc hộp kim loại. VD: 一罐可乐 (một lon cola)' },
  { chn: '盒', pin: 'hé', vi: 'Hộp. VD: 一盒牛奶 (một hộp sữa)' },
  { chn: '杯', pin: 'bēi', vi: 'Cốc, ly hoặc hũ nhỏ dạng cốc. VD: 一杯酸奶 (một hũ sữa chua)' },
  { chn: '支', pin: 'zhī', vi: 'Vật dài, nhỏ như bút, kem đánh răng dạng tuýp, cây kem. VD: 一支笔 (một cây bút)' },
  { chn: '根', pin: 'gēn', vi: 'Vật dài, dạng que/cây. VD: 一根香肠 (một cây xúc xích)' },
  { chn: '条', pin: 'tiáo', vi: 'Vật dài, dạng dải. VD: 一条毛巾 (một chiếc khăn)' },
  { chn: '张', pin: 'zhāng', vi: 'Vật phẳng, mỏng. VD: 一张纸 (một tờ giấy)' },
  { chn: '片', pin: 'piàn', vi: 'Lát, miếng mỏng. VD: 一片奶酪 (một lát phô mai)' },
  { chn: '块', pin: 'kuài', vi: 'Miếng/cục; cũng dùng để nói tiền tệ trong khẩu ngữ. VD: 一块香皂 (một cục xà phòng)' },
  { chn: '颗', pin: 'kē', vi: 'Viên nhỏ, tròn. VD: 一颗糖 (một viên kẹo)' },
  { chn: '把', pin: 'bǎ', vi: 'Đồ vật có tay cầm hoặc nắm được. VD: 一把牙刷 (một cái bàn chải)' },
  { chn: '卷', pin: 'juǎn', vi: 'Đồ vật cuộn thành cuộn. VD: 一卷胶带 (một cuộn băng keo)' },
  { chn: '本', pin: 'běn', vi: 'Sách, vở, tập. VD: 一本笔记本 (một quyển tập)' },
  { chn: '提', pin: 'tí', vi: 'Một lốc/bó hàng được xách hoặc đóng thành cụm. VD: 一提卫生纸 (một lốc giấy vệ sinh)' },
  { chn: '节', pin: 'jié', vi: 'Viên pin. VD: 两节电池 (hai viên pin)' },
  { chn: '斤', pin: 'jīn', vi: 'Đơn vị cân truyền thống Trung Quốc, bằng 500 gram. VD: 一斤大米 (nửa ký gạo)' }
];

// Mẫu câu (sheet "Mẫu câu") — who: 顾客 khách / 店员 nhân viên
const SHOP_SENTENCES = [
  { chn: '您好，欢迎光临。', pin: 'Nín hǎo, huānyíng guānglín.', vi: 'Xin chào, hoan nghênh quý khách.', topic: 'Chào hỏi', who: '店员' },
  { chn: '你好，我想买东西。', pin: 'Nǐ hǎo, wǒ xiǎng mǎi dōngxi.', vi: 'Xin chào, tôi muốn mua ít đồ.', topic: 'Chào hỏi', who: '顾客' },
  { chn: '请问，……在哪里？', pin: 'Qǐngwèn, ... zài nǎlǐ?', vi: 'Xin hỏi, ... ở đâu?', topic: 'Tìm hàng', who: '顾客' },
  { chn: '有……吗？', pin: 'Yǒu ... ma?', vi: 'Có ... không?', topic: 'Tìm hàng', who: '顾客' },
  { chn: '这个多少钱？', pin: 'Zhège duōshao qián?', vi: 'Cái này bao nhiêu tiền?', topic: 'Hỏi giá', who: '顾客' },
  { chn: '一瓶水多少钱？', pin: 'Yì píng shuǐ duōshao qián?', vi: 'Một chai nước bao nhiêu tiền?', topic: 'Hỏi giá', who: '顾客' },
  { chn: '我要两包方便面。', pin: 'Wǒ yào liǎng bāo fāngbiànmiàn.', vi: 'Tôi lấy hai gói mì.', topic: 'Chọn hàng & số lượng', who: '顾客' },
  { chn: '请给我一袋米。', pin: 'Qǐng gěi wǒ yí dài mǐ.', vi: 'Làm ơn lấy cho tôi một túi gạo.', topic: 'Chọn hàng & số lượng', who: '顾客' },
  { chn: '这个有优惠吗？', pin: 'Zhège yǒu yōuhuì ma?', vi: 'Món này có giảm giá không?', topic: 'Khuyến mãi', who: '顾客' },
  { chn: '有打折吗？', pin: 'Yǒu dǎzhé ma?', vi: 'Có giảm giá không?', topic: 'Khuyến mãi', who: '顾客' },
  { chn: '这个多少钱一斤？', pin: 'Zhège duōshao qián yì jīn?', vi: 'Món này bao nhiêu tiền một cân?', topic: 'Hỏi giá', who: '顾客' },
  { chn: '我要这个，不要那个。', pin: 'Wǒ yào zhège, bú yào nàge.', vi: 'Tôi lấy cái này, không lấy cái kia.', topic: 'Chọn hàng', who: '顾客' },
  { chn: '可以便宜一点吗？', pin: 'Kěyǐ piányi yìdiǎn ma?', vi: 'Có thể rẻ hơn một chút không?', topic: 'Mặc cả', who: '顾客' },
  { chn: '不好意思，这个卖完了。', pin: 'Bù hǎoyìsi, zhège mài wán le.', vi: 'Xin lỗi, món này bán hết rồi.', topic: 'Hết hàng', who: '店员' },
  { chn: '还有别的牌子吗？', pin: 'Hái yǒu bié de páizi ma?', vi: 'Còn nhãn hiệu khác không?', topic: 'Chọn hàng', who: '顾客' },
  { chn: '这个什么时候过期？', pin: 'Zhège shénme shíhou guòqī?', vi: 'Cái này khi nào hết hạn?', topic: 'Kiểm tra sản phẩm', who: '顾客' },
  { chn: '请问，可以用手机付款吗？', pin: 'Qǐngwèn, kěyǐ yòng shǒujī fùkuǎn ma?', vi: 'Xin hỏi, có thể thanh toán bằng điện thoại không?', topic: 'Thanh toán', who: '顾客' },
  { chn: '可以扫码付款。', pin: 'Kěyǐ sǎomǎ fùkuǎn.', vi: 'Có thể quét mã để thanh toán.', topic: 'Thanh toán', who: '店员' },
  { chn: '我付现金。', pin: 'Wǒ fù xiànjīn.', vi: 'Tôi trả tiền mặt.', topic: 'Thanh toán', who: '顾客' },
  { chn: '一共多少钱？', pin: 'Yígòng duōshao qián?', vi: 'Tổng cộng bao nhiêu tiền?', topic: 'Thanh toán', who: '顾客' },
  { chn: '一共三十五块。', pin: 'Yígòng sānshíwǔ kuài.', vi: 'Tổng cộng 35 tệ.', topic: 'Thanh toán', who: '店员' },
  { chn: '请给我一个袋子。', pin: 'Qǐng gěi wǒ yí ge dàizi.', vi: 'Làm ơn cho tôi một cái túi.', topic: 'Đóng gói', who: '顾客' },
  { chn: '不用袋子，谢谢。', pin: 'Bú yòng dàizi, xièxie.', vi: 'Không cần túi, cảm ơn.', topic: 'Đóng gói', who: '顾客' },
  { chn: '需要小票吗？', pin: 'Xūyào xiǎopiào ma?', vi: 'Bạn có cần hóa đơn/biên lai không?', topic: 'Thanh toán', who: '店员' },
  { chn: '不用了，谢谢。', pin: 'Bú yòng le, xièxie.', vi: 'Không cần đâu, cảm ơn.', topic: 'Kết thúc', who: '顾客' },
  { chn: '欢迎下次再来。', pin: 'Huānyíng xià cì zài lái.', vi: 'Hoan nghênh lần sau ghé lại.', topic: 'Kết thúc', who: '店员' }
];
// ==== HẾT KHỐI SINH TỰ ĐỘNG ====

// Khách gọi hàng theo các mẫu câu trong file (one = chỉ dùng khi khách mua 1 món)
const ORDER_TEMPLATES = [
  { id: 'want', learn: ['我要两包方便面。'],
    zh: (L) => `我要${L}。`, pin: (P) => `Wǒ yào ${P}.`, vi: (V) => `Tôi lấy ${V}.` },
  { id: 'give', learn: ['请给我一袋米。'],
    zh: (L) => `请给我${L}。`, pin: (P) => `Qǐng gěi wǒ ${P}.`, vi: (V) => `Làm ơn lấy cho tôi ${V}.` },
  { id: 'greet', learn: ['你好，我想买东西。', '我要两包方便面。'],
    zh: (L) => `你好，我想买东西。我要${L}。`, pin: (P) => `Nǐ hǎo, wǒ xiǎng mǎi dōngxi. Wǒ yào ${P}.`, vi: (V) => `Xin chào, tôi muốn mua ít đồ. Tôi lấy ${V}.` },
  { id: 'have', one: true, learn: ['有……吗？', '我要两包方便面。'],
    zh: (L, N) => `有${N}吗？我要${L}。`, pin: (P, NP) => `Yǒu ${NP} ma? Wǒ yào ${P}.`, vi: (V, NV) => `Có ${NV} không? Tôi lấy ${V}.` },
  { id: 'where', one: true, learn: ['请问，……在哪里？', '我要两包方便面。'],
    zh: (L, N) => `请问，${N}在哪里？我要${L}。`, pin: (P, NP) => `Qǐngwèn, ${NP} zài nǎlǐ? Wǒ yào ${P}.`, vi: (V, NV) => `Xin hỏi, ${NV} ở đâu? Tôi lấy ${V}.` }
];

// Sự cố cho tiệm có nhiều tình huống
const INCIDENT_RULES = {
  // hàng tươi: còn trên kệ cuối ngày thì một nửa bị hủy (过期 hết hạn)
  perishable: ['tp003', 'tp004', 'tp005', 'tp006', 'du006', 'du007', 'sl001', 'sl002', 'sl003', 'sl004'],
  overnightSpoilRate: 0.5,
  haggleChance: 0.18,      // khách mặc cả (đơn từ haggleMinDue ¥)
  haggleMinDue: 8,
  soldOutChance: 0.35      // có món đã mở bán mà hết hàng → khách hỏi đúng món đó
};
const HAGGLE_LINES = ['可以便宜一点吗？', '有打折吗？', '这个有优惠吗？'];
const START_MONEY = 120;     // vốn đầu game (giá hàng theo file Excel)
const SHELF_COLS = 4;
const SHELF_ROWS = 2;
const PORTRAIT_W = 480;       // bề rộng sân khấu khi cầm điện thoại dọc
const PORTRAIT_MIN_H = 900;   // chiều cao tối thiểu khung dọc (tablet 3:4 → 675×900)
const STARTER_STOCK = 6;    // hàng có sẵn lúc mới mở tiệm
const ZONE_GIFT_STOCK = 4;  // tặng kèm khi mở khu mới

const GROCERY_CUSTOMERS = [
  { id: 'xiaoyu', nameChn: '小雨', nameVi: 'Bé Mưa', img: 'boba_customer_girl.jpg' },
  { id: 'xiaohao', nameChn: '小浩', nameVi: 'Tiểu Hạo', img: 'boba_customer_boy.jpg' },
  { id: 'xiaotong', nameChn: '晓彤', nameVi: 'Hiểu Đồng', img: 'boba_customer_xiaotong.jpg' },
  { id: 'linjie', nameChn: '林姐', nameVi: 'Chị Lâm', img: 'boba_customer_linjie.jpg' },
  { id: 'wangshu', nameChn: '王叔', nameVi: 'Chú Vương', img: 'boba_customer_wangshu.jpg' },
  { id: 'nainai', nameChn: '奶奶', nameVi: 'Bà nội', img: 'boba_customer_grandma.jpg' },
  { id: 'abao', nameChn: '阿宝', nameVi: 'Gấu A Bảo', img: 'boba_customer_abao.jpg' }
];

// Sổ từ vựng: mỗi khu 1 tab + lượng từ + mua bán
const VOCAB_TABS = [
  ...GROCERY_ZONES.map(z => ({ id: z.id, label: `${z.icon} ${z.short}`, words: GROCERY_ITEMS.filter(i => i.zone === z.id).map(i => ({ chn: i.nameChn, pin: i.pinyin, vi: i.nameVi })) })),
  { id: 'quantifiers', label: '🔢 Lượng từ', words: QUANTIFIER_WORDS },
  { id: 'sentences', label: '💬 Mẫu câu', words: SHOP_SENTENCES.map(x => ({ chn: x.chn, pin: x.pin, vi: `${x.vi} · ${x.topic} (${x.who === '店员' ? 'nhân viên' : 'khách'})` })) },
  {
    id: 'business', label: '🏪 Mua bán',
    words: [
      { chn: '小卖部', pin: 'xiǎomàibù', vi: 'tiệm tạp hóa nhỏ' },
      { chn: '欢迎光临', pin: 'huānyíng guānglín', vi: 'chào mừng quý khách' },
      { chn: '老板', pin: 'lǎobǎn', vi: 'ông chủ, chủ tiệm' },
      { chn: '货架', pin: 'huòjià', vi: 'kệ hàng' },
      { chn: '一共', pin: 'yígòng', vi: 'tổng cộng' },
      { chn: '找零', pin: 'zhǎolíng', vi: 'thối tiền' },
      { chn: '进货', pin: 'jìnhuò', vi: 'nhập hàng' },
      { chn: '批发市场', pin: 'pīfā shìchǎng', vi: 'chợ đầu mối (bán sỉ)' },
      { chn: '营业', pin: 'yíngyè', vi: 'mở cửa kinh doanh' },
      { chn: '打烊', pin: 'dǎyàng', vi: 'đóng cửa tiệm' },
      { chn: '猫', pin: 'māo', vi: 'con mèo' },
      { chn: '过期', pin: 'guòqī', vi: 'hết hạn (sử dụng)' },
      { chn: '打碎', pin: 'dǎsuì', vi: 'làm vỡ' },
      { chn: '老鼠', pin: 'lǎoshǔ', vi: 'con chuột' },
      { chn: '停电', pin: 'tíngdiàn', vi: 'mất điện' },
      { chn: '冰箱', pin: 'bīngxiāng', vi: 'tủ lạnh' },
      { chn: '便宜', pin: 'piányi', vi: 'rẻ' },
      { chn: '打折', pin: 'dǎzhé', vi: 'giảm giá' },
      { chn: '卖完了', pin: 'mài wán le', vi: 'bán hết rồi' }
    ]
  }
];
const VOCAB_TOTAL = VOCAB_TABS.reduce((s, t) => s + t.words.length, 0);

// ============================================================================
// 3. LUẬT CHƠI
// ============================================================================
const DAY_RULES = {
  lengthMs: 120000,        // 1 ngày bán hàng = 2 phút thật (đúng 120s theo yêu cầu)
  openMin: 8 * 60,
  closeMin: 20 * 60
};

const QUEUE_RULES = {
  maxLine: 4,              // tối đa 4 người xếp hàng bên ngoài
  patienceMs: 45000,       // chờ quá 45s mà chưa được nhận đơn → bỏ về
  firstArrivalMs: 400,     // 0.4s sau khi mở cửa là khách đầu tiên tới ngay!
  arriveBaseMs: 7000,      // cứ 6-8s là có khách mới ghé tiệm! (dồn dập, tấp nập)
  arrivePerDayMs: 400,
  arriveMinMs: 4000,       // những ngày sau càng đông khách hơn (4-5s)!
  arriveJitterMs: 2000
};

const MISSION_RULES = {
  baseTarget: 60,          // doanh thu mục tiêu ngày 1 (giá theo file Excel)
  targetPerDay: 20,        // tăng mỗi ngày
  maxTarget: 400,
  roundTo: 5,
  baseMaxLost: 2,
  minChangeAccuracy: 80,   // % khách được thối đúng ngay lần đầu
  bonusPerStar: 10
};

const SCORE_RULES = {
  pickPenalty: 20,
  changePenalty: 30,
  hintPenalty: 20,
  speedBaseMs: 24000,
  speedPerUnitMs: 6000,
  tipMax: 5.5,
  weights: { pick: 0.3, speed: 0.2, change: 0.3, wait: 0.2 }
};

// Mẫu câu giao tiếp tính tiền thực tế (Hỏi giá, Tính tiền, Thối tiền, Cảm ơn)
const CHECKOUT_PHRASES = [
  { role: 'Khách', roleZh: '顾客', chn: '老板，一共多少钱？', pin: 'Lǎobǎn, yīgòng duōshao qián?', vi: 'Ông chủ, tổng cộng bao nhiêu tiền?' },
  { role: 'Khách', roleZh: '顾客', chn: '请问这个怎么卖？', pin: 'Qǐngwèn zhège zěnme mài?', vi: 'Xin hỏi món này bán thế nào?' },
  { role: 'Khách', roleZh: '顾客', chn: '总共多少钱？', pin: 'Zǒnggòng duōshao qián?', vi: 'Tất cả hết bao nhiêu tiền?' },
  { role: 'Chủ tiệm', roleZh: '店家', chn: '一共是二十块钱。', pin: 'Yīgòng shì èrshí kuài qián.', vi: 'Tổng cộng là hai mươi đồng ạ.' },
  { role: 'Khách', roleZh: '顾客', chn: '微信还是现金支付？', pin: 'Wēixìn háishì xiànjīn zhīfù?', vi: 'Quét WeChat hay trả tiền mặt vậy?' },
  { role: 'Chủ tiệm', roleZh: '店家', chn: '都可以，扫这里就行。', pin: 'Dōu kěyǐ, sǎo zhèlǐ jiù xíng.', vi: 'Đều được ạ, quét ở đây là được.' },
  { role: 'Khách', roleZh: '顾客', chn: '给您钱，正好不用找。', pin: 'Gěi nín qián, zhènghǎo bú yòng zhǎo.', vi: 'Gửi bạn tiền, vừa đủ không cần thối.' },
  { role: 'Chủ tiệm', roleZh: '店家', chn: '收您五十，找您二十块。', pin: 'Shōu nín wǔshí, zhǎo nín èrshí kuài.', vi: 'Nhận của bạn 50, thối lại bạn 20 đồng.' },
  { role: 'Chủ tiệm', roleZh: '店家', chn: '找您零钱，请数一数。', pin: 'Zhǎo nín língqián, qǐng shǔ yi shǔ.', vi: 'Thối bạn tiền thừa, bạn đếm lại nhé.' },
  { role: 'Khách', roleZh: '顾客', chn: '找零一分不差，谢谢！', pin: 'Zhǎolíng yì fēn bù chà, xièxie!', vi: 'Thối tiền chuẩn từng xu, cảm ơn bạn!' },
  { role: 'Khách', roleZh: '顾客', chn: '谢谢老板，东西真好！', pin: 'Xièxie lǎobǎn, dōngxi zhēn hǎo!', vi: 'Cảm ơn ông chủ, đồ tốt lắm!' },
  { role: 'Khách', roleZh: '顾客', chn: '太划算了，下次我还来！', pin: 'Tài huásuàn le, xià cì wǒ hái lái!', vi: 'Giá tốt quá, lần sau tôi lại đến!' },
  { role: 'Chủ tiệm', roleZh: '店家', chn: '慢走，欢迎下次光临！', pin: 'Màn zǒu, huānyíng xià cì guānglín!', vi: 'Đi thong thả, hoan nghênh lần sau lại ghé!' }
];

// Những câu tám chuyện vui nhộn khi rảnh rỗi / chờ khách
const IDLE_CHITCHATS = [
  { chn: '今天天气真好，生意一定会很火爆！', pin: 'Jīntiān tiānqì zhēn hǎo, shēngyì yídìng huì hěn huǒbào!', vi: 'Hôm nay trời đẹp ghê, buôn bán nhất định sẽ đắt hàng!' },
  { chn: '老板，等会儿赚了钱给我买条小鱼干喵~', pin: 'Lǎobǎn, děnghuǐr zhuàn le qián gěi wǒ mǎi tiáo xiǎoyúgān miāo~', vi: 'Ông chủ ơi, lát kiếm được tiền thưởng em con cá khô nha meo~' },
  { chn: '听说隔壁新开了一家奶茶店，好多人在排队！', pin: 'Tīngshuō gébì xīn kāi le yì jiā nǎichá diàn, hǎoduō rén zài páiduì!', vi: 'Nghe nói sát bên mới mở quán trà sữa, đông người xếp hàng lắm!' },
  { chn: '最近方便面超级抢手，不知道还要不要进货？', pin: 'Zuìjìn fāngbiànmiàn chāojí qiǎngshǒu, bù zhīdào hái yào bu yào jìnhuò?', vi: 'Dạo này mì gói đắt hàng dã man, không biết có nên nhập thêm không nhỉ?' },
  { chn: '打工人，打工魂，做生意要有耐心喵！', pin: 'Dǎgōngrén, dǎgōnghún, zuò shēngyì yào yǒu nàixīn miāo!', vi: 'Lao động hăng say, buôn bán là phải kiên nhẫn nha meo!' },
  { chn: '外面的天气好热，冰可乐一定很好卖。', pin: 'Wàimiàn de tiānqì hǎo rè, bīng kělè yídìng hěn hǎomài.', vi: 'Ngoài trời nóng ghê, món Coca ướp lạnh chắc chắn đắt hàng.' },
  { chn: '刚才那位客人真爽快，连零钱都没细看。', pin: 'Gāngcái nà wèi kèrén zhēn shuǎngkuai, lián língqián dōu méi xì kàn.', vi: 'Vị khách lúc nãy sảng khoái thật, chẳng thèm đếm lại tiền thối luôn.' },
  { chn: '老板服务态度这么好，回头客一定很多！', pin: 'Lǎobǎn fúwù tàidù zhème hǎo, huítóukè yídìng hěn duō!', vi: 'Chủ quán phục vụ nhiệt tình thế này, khách quen nhất định sẽ tới hoài!' },
  { chn: '伸个懒腰，晒晒太阳，感觉好舒服喵~', pin: 'Shēn gè lǎnyāo, shài shai tàiyáng, gǎnjué hǎo shūfu miāo~', vi: 'Vươn vai phơi nắng chút nào, sướng tê người meo~' },
  { chn: '有客人在看招牌了，马上就要进来了哦！', pin: 'Yǒu kèrén zài kàn zhāopai le, mǎshàng jiù yào jìnlái le o!', vi: 'Có khách đang ngó bảng hiệu kìa, sắp bước vào tiệm rồi đấy!' },
  { chn: '童年的零食真让人怀念，每一包都是回忆。', pin: 'Tóngnián de língshí zhēn ràng rén huáiniàn, měi yì bāo dōu shì huíyì.', vi: 'Mấy món ăn vặt tuổi thơ hoài niệm ghê, gói nào cũng là kỷ niệm.' },
  { chn: '欢迎光临我的小卖部，好吃好喝样样有！', pin: 'Huānyíng guānglín wǒ de xiǎomàibù, hǎochī hǎohē yàngyàng yǒu!', vi: 'Kính chào quý khách ghé tiệm tạp hoá, món gì ngon cũng có nha!' }
];

const STAGE_W = 1280;
const STAGE_H = 720;
const STATION_ORDER = ['view-order-station', 'view-shelves-station', 'view-scan-station', 'view-change-station'];
const SAVE_VERSION = 3;
// Bản lưu v2 (danh mục cũ 40 món) → v3: giữ ngày, quy đổi tiền theo giá mới, giữ món trùng tên đã mở
const OLD_ZONE_MAP = { drinks: ['drinks'], candy: ['food'], snacks: ['food'], instant: ['food'], cold: ['dairy'], daily: ['household', 'personal'] };
const OLD_ITEM_NAMES = { water: '矿泉水', cola: '可乐', orange_juice: '橙汁', milk: '牛奶', yogurt: '酸奶', coffee: '咖啡', biscuit: '饼干', chocolate: '巧克力', peanuts: '花生', chips: '薯片', instant_noodles: '方便面', bread: '面包', ice_cream: '冰淇淋', tissue: '纸巾', battery: '电池', toothbrush: '牙刷', toothpaste: '牙膏' };
function migrateSaveV2(s) {
  if (!s || s.v !== 2) return s;
  const zones = new Set();
  (Array.isArray(s.zones) ? s.zones : []).forEach(z => (OLD_ZONE_MAP[z] || []).forEach(n => zones.add(n)));
  const items = {};
  Object.entries(s.items && typeof s.items === 'object' ? s.items : {}).forEach(([oldId, rec]) => {
    const name = OLD_ITEM_NAMES[oldId];
    const it = name && GROCERY_ITEMS.find(x => x.nameChn === name);
    if (it && Array.isArray(rec) && rec[0]) items[it.id] = [1, Math.min(it.maxStock, STARTER_STOCK)];
  });
  const money = Number(s.money);
  return { ...s, v: 3, zones: [...zones], items, money: Math.max(START_MONEY, Math.round((Number.isFinite(money) ? money : 0) * 2.5 * 100) / 100), migratedFrom: 2 };
}
const ASSET = (f) => `./assets/${f}`;
const cents = (v) => Math.round(Number(v) * 100);
const fmt = (v) => (Math.round(Number(v) * 100) / 100).toFixed(2);
const escapeHtml = (s) => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const NUM_CHN = { 1: '一', 2: '两', 3: '三' };
const randInt = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
// Thiếu hàm này → mỗi lần tính tiền xong renderSingleCheckoutPhrase() ném ReferenceError, bảng điểm không hiện, khách kẹt lại, ngày không kết thúc
const pickOne = (arr) => (Array.isArray(arr) && arr.length ? arr[randInt(0, arr.length - 1)] : null);
const zoneOf = (id) => GROCERY_ZONES.find(z => z.id === id);
// Hình riêng của từng món (scripts/gen_grocery_icons.cjs) — mỗi món trong Tạp hóa.xlsx đúng 1 hình
const itemImg = (it, cls = '') => `<img class="gi ${cls}" src="${ASSET(`grocery/${it.id}.svg`)}" alt="${escapeHtml(it.nameChn)}" draggable="false">`;

// "一" đổi thanh: yí trước thanh 4, yì trước các thanh khác
function yiPinyin(nextPin) {
  return /[àèìòùǜ]/.test(nextPin) ? 'yí' : 'yì';
}

// ============================================================================
// 4. MÁY CHỦ: TÀI KHOẢN, LƯU TIẾN TRÌNH, BẢNG XẾP HẠNG
// ============================================================================
const GameCloud = {
  key: 'grocery',
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

// Bản lưu trên máy: tách riêng theo từng tài khoản (khách = 'guest') → không bao giờ lẫn dữ liệu
const LocalSave = {
  key(owner) { return `${GameCloud.key}_save_${owner || 'guest'}`; },
  read(owner) {
    try {
      const s = JSON.parse(localStorage.getItem(this.key(owner)) || 'null');
      const m = s && typeof s === 'object' ? migrateSaveV2(s) : null; // bản lưu cũ (v2) → chuyển đổi, không bỏ
      return m && m.v === SAVE_VERSION ? m : null;
    } catch (e) { return null; }
  },
  write(owner, s) { try { localStorage.setItem(this.key(owner), JSON.stringify(s)); } catch (e) {} },
  clear(owner) { try { localStorage.removeItem(this.key(owner)); } catch (e) {} }
};

// ============================================================================
// 5. GAME
// ============================================================================
class GroceryGame {
  constructor() {
    this.audio = new GroceryAudio();

    // Dọn dữ liệu do các phiên bản rất cũ để lại (không còn dùng)
    try { ['grocery_money', 'grocery_day', 'grocery_shelves'].forEach(k => localStorage.removeItem(k)); } catch (e) {}

    this.showPinyin = true;
    this.showVietnamese = true;
    this.relaxedMode = false;

    this.resetProgressState();

    // Vòng đời ngày
    this.gameTime = 0;
    this.lastTickAt = performance.now();
    this.dayStarted = false;
    this.dayEnded = false;
    this.closed = false;
    this.dayStartAt = 0;
    this.stats = this.freshStats();
    this.mission = null;

    // Khách
    this.line = [];
    this.current = null;
    this.ticketSeq = 0;
    this.customerDeck = [];
    this.nextArrivalAt = 0;
    this.curChitChatIdx = 0;
    this.nextChitChatTime = 0;

    // Bàn làm việc của đơn hiện tại
    this.basket = [];
    this.scanItems = [];
    this.changeTray = [];
    this.restockQty = {};
    this.currentStation = 'view-order-station';
    this.shelfZone = GROCERY_ZONES[0].id;
    this.marketZone = GROCERY_ZONES[0].id;
    this.shelfPage = {};

    // Tài khoản: tạm coi chủ dữ liệu theo phiên đăng nhập trên máy, xác nhận lại với server sau
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

  // Tiến trình "dài hạn" của tiệm (được lưu)
  resetProgressState() {
    this.money = START_MONEY;
    this.day = 1;
    this.zones = Object.fromEntries(GROCERY_ZONES.map(z => [z.id, z.unlockCost === 0]));
    this.shelves = GROCERY_ITEMS.map(it => {
      const unlocked = this.zones[it.zone] && it.unlockCost === 0;
      return { ...it, unlocked, currentStock: unlocked ? STARTER_STOCK : 0 };
    });
    this.learnedVocab = new Set(['小卖部', '老板']);
    this.records = [];
    this.savedAt = 0;
  }

  // --------------------------------------------------------------------------
  // Lưu / tải tiến trình
  // --------------------------------------------------------------------------
  snapshot(dayOverride = null) {
    return {
      v: SAVE_VERSION,
      day: dayOverride || this.day,
      money: Math.round(this.money * 100) / 100,
      zones: GROCERY_ZONES.filter(z => this.zones[z.id]).map(z => z.id),
      items: Object.fromEntries(this.shelves.filter(s => s.unlocked || s.currentStock > 0).map(s => [s.id, [s.unlocked ? 1 : 0, s.currentStock]])),
      vocab: [...this.learnedVocab].slice(0, 300),
      records: this.records.slice(-30),
      relaxed: !!this.relaxedMode,
      updatedAt: Date.now()
    };
  }

  applySnapshot(s) {
    s = migrateSaveV2(s);
    if (!s || s.v !== SAVE_VERSION) return false;
    const num = (v, d) => (Number.isFinite(Number(v)) ? Number(v) : d);
    this.resetProgressState();
    this.day = Math.max(1, Math.round(num(s.day, 1)));
    this.money = Math.round(num(s.money, START_MONEY) * 100) / 100;
    GROCERY_ZONES.forEach(z => { this.zones[z.id] = z.unlockCost === 0 || (Array.isArray(s.zones) && s.zones.includes(z.id)); });
    const items = s.items && typeof s.items === 'object' ? s.items : {};
    this.shelves.forEach(it => {
      const rec = items[it.id];
      if (Array.isArray(rec)) {
        it.unlocked = !!rec[0] && this.zones[it.zone];
        it.currentStock = Math.max(0, Math.min(it.maxStock, Math.round(num(rec[1], 0))));
      } else {
        it.unlocked = false;
        it.currentStock = 0;
      }
    });
    if (Array.isArray(s.vocab)) s.vocab.forEach(w => { if (typeof w === 'string') this.learnedVocab.add(w); });
    this.records = Array.isArray(s.records) ? s.records.filter(r => r && Number.isFinite(Number(r.earnings))) : [];
    this.relaxedMode = !!s.relaxed;
    const relaxed = document.getElementById('setting-relaxed');
    if (relaxed) relaxed.checked = this.relaxedMode;
    this.savedAt = num(s.updatedAt, 0);
    return true;
  }

  // Lưu ở mốc an toàn (không giữa ngày). dayOverride: lưu sẵn "ngày kế tiếp" ngay khi tổng kết xong.
  saveProgress(dayOverride = null) {
    if (this.isDayInProgress() && !dayOverride) return;
    const snap = this.snapshot(dayOverride);
    this.savedAt = snap.updatedAt;
    LocalSave.write(this.owner, snap);
    if (this.cloud.loggedIn) {
      GameCloud.post({ save: snap }).catch(() => { this.cloud.pendingSave = true; });
    }
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

  isModalOpen() {
    return [...document.querySelectorAll('.g-modal')].some(m => m.style.display && m.style.display !== 'none');
  }

  isTitleVisible() {
    const t = this.$('title-screen');
    return !!t && !t.classList.contains('hidden');
  }

  isClockPaused() {
    return this.isTitleVisible() || this.isModalOpen() || document.hidden;
  }

  openModal(id) {
    const m = this.$(id);
    if (m) m.style.display = 'flex';
  }

  closeModal(id) {
    const m = this.$(id);
    if (m) m.style.display = 'none';
  }

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
    const on = (id, ev, fn) => { const el = this.$(id); if (el) el.addEventListener(ev, fn); };

    window.addEventListener('resize', () => this.fitStage());
    window.addEventListener('orientationchange', () => setTimeout(() => this.fitStage(), 200));
    document.addEventListener('visibilitychange', () => { this.lastTickAt = performance.now(); });

    // Màn hình chờ
    on('btn-title-play', 'click', () => this.onTitlePlay());
    on('btn-title-guide', 'click', () => { this.audio.pop(); this.openModal('modal-guide'); });
    on('btn-title-rank', 'click', () => { this.audio.pop(); this.openRankModal(); });

    // HUD
    on('btn-hud-home', 'click', () => { this.audio.pop(); this.showTitleScreen(); });
    on('btn-pause-game', 'click', () => { this.audio.pop(); this.openModal('modal-settings'); });
    on('btn-fullscreen', 'click', () => this.toggleFullscreen());
    on('btn-rotate-fullscreen', 'click', () => this.toggleFullscreen());
    on('btn-open-vocab', 'click', () => { this.audio.pop(); this.openVocabModal(); });
    on('btn-open-restock', 'click', () => this.openMarket());

    // Trạm
    document.querySelectorAll('.g-tab').forEach(btn => btn.addEventListener('click', () => this.switchStation(btn.dataset.target)));
    on('btn-goto-shelves-from-order', 'click', () => this.switchStation('view-shelves-station'));
    on('btn-goto-scan', 'click', () => this.switchStation('view-scan-station'));
    on('btn-goto-change', 'click', () => this.switchStation('view-change-station'));

    on('btn-take-order-action', 'click', () => this.takeOrder());
    on('btn-take-order-footer', 'click', () => this.takeOrder());
    on('btn-sold-out', 'click', () => this.soldOutApology());
    on('btn-inc-say', 'click', () => { if (this.incidentSay) this.audio.speak(this.incidentSay); });
    on('speech-bubble', 'click', (e) => {
      // nút loa & nút "Xin lỗi, hết hàng" nằm trong bong bóng — bấm chúng KHÔNG được tính là nhận đơn
      if (e.target.closest('#btn-replay-order-audio, #btn-sold-out')) return;
      if (this.current && !this.current.takenAt) this.takeOrder();
    });
    on('btn-replay-order-audio', 'click', () => this.speakOrder());
    on('btn-cat', 'click', () => this.petCat());
    on('btn-chitchat-audio', 'click', () => {
      const item = IDLE_CHITCHATS[this.curChitChatIdx % IDLE_CHITCHATS.length];
      if (item) this.audio.speak(item.chn);
    });
    on('btn-chitchat-next', 'click', () => this.nextChitChat(true));
    on('btn-clear-basket-station', 'click', () => this.clearBasket());
    on('btn-quick-restock-header', 'click', () => this.openMarket(this.shelfZone));
    on('btn-trigger-scanner', 'click', () => this.scanNextItem());
    on('btn-reset-tray-action', 'click', () => this.resetTray());
    on('btn-change-hint', 'click', () => this.useChangeHint());
    on('btn-confirm-and-deliver', 'click', () => this.deliver());
    document.querySelectorAll('.drawer-grid .rmb').forEach(btn => btn.addEventListener('click', () => this.addToTray(parseFloat(btn.dataset.val))));

    // Bảng điểm, nhiệm vụ, tổng kết
    on('btn-next-customer-grocery', 'click', () => this.closeScorecard());
    on('btn-replay-score-speech', 'click', () => {
      if (this.lastScoreReactionZh) this.audio.speak(this.lastScoreReactionZh);
    });
    on('btn-refresh-phrase-grocery', 'click', () => {
      this.audio.pop();
      this.renderSingleCheckoutPhrase();
    });
    on('btn-mission-start', 'click', () => this.startDay());
    on('btn-mission-restock', 'click', () => this.openMarket());
    on('btn-next-day-start', 'click', () => this.startNextDay());

    // Chợ đầu mối (nhập hàng & mở hàng)
    on('btn-autofill-all-stock', 'click', () => this.autofillRestock());
    on('btn-confirm-restock-open', 'click', () => this.confirmRestock());

    // Xếp hạng
    document.querySelectorAll('.rank-tab').forEach(btn => btn.addEventListener('click', () => { this.audio.pop(); this.switchRankTab(btn.dataset.rankTab); }));

    // Đóng modal
    document.querySelectorAll('[data-close]').forEach(btn => btn.addEventListener('click', () => {
      this.closeModal(btn.dataset.close);
      this.lastTickAt = performance.now();
      if (btn.dataset.close === 'modal-restock') this.afterMarketClosed();
    }));

    // Cài đặt
    on('setting-sfx', 'change', (e) => { this.audio.sfxEnabled = e.target.checked; });
    on('setting-voice', 'change', (e) => { this.audio.voiceEnabled = e.target.checked; });
    on('setting-pinyin', 'change', (e) => { this.showPinyin = e.target.checked; this.renderSpeech(); });
    on('setting-vietnamese', 'change', (e) => { this.showVietnamese = e.target.checked; this.renderSpeech(); });
    on('setting-relaxed', 'change', (e) => {
      this.relaxedMode = e.target.checked;
      this.updatePatienceUI();
      this.saveProgress();
      this.showToast(this.relaxedMode ? '🍃' : '⏱️', this.relaxedMode ? 'Chế độ thư giãn: khách chờ bao lâu cũng được.' : 'Chế độ thường: khách chờ quá lâu sẽ bỏ về!');
    });
    on('btn-back-to-title', 'click', () => { this.closeModal('modal-settings'); this.showTitleScreen(); });
    on('btn-reset-save', 'click', () => this.resetGame());
  }

  // Màn ngang: sân khấu 1280×720. Màn dọc (điện thoại cầm dọc): sân khấu rộng 480, cao theo tỉ lệ máy,
  // các khối xếp chồng theo chiều dọc (body.g-portrait). Cả hai đều co giãn vừa khít màn hình.
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
    const changed = this.isPortrait !== portrait;
    this.isPortrait = portrait;
    document.body.classList.toggle('g-portrait', portrait);
    if (changed && this.shelves) this.renderShelves();
  }

  shelfGrid() {
    return this.isPortrait ? { cols: 3, rows: 3 } : { cols: SHELF_COLS, rows: SHELF_ROWS };
  }

  toggleFullscreen() {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen()
          .then(() => screen.orientation?.lock?.('landscape').catch(() => {}))
          .catch(() => {});
      } else if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    } catch (e) {}
  }

  async resetGame() {
    if (!confirm('Chơi lại từ đầu? Tiến trình (ngày, tiền, kệ hàng) sẽ bị xóa. Kỷ lục trên bảng xếp hạng vẫn được giữ.')) return;
    LocalSave.clear(this.owner);
    if (this.cloud.loggedIn) {
      try { await GameCloud.post({ resetSave: true }); } catch (e) {}
    }
    location.reload();
  }

  // --------------------------------------------------------------------------
  // Màn hình chờ
  // --------------------------------------------------------------------------
  isDayInProgress() {
    return this.dayStarted && !this.dayEnded;
  }

  showTitleScreen() {
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
      const zones = GROCERY_ZONES.filter(z => this.zones[z.id]).length;
      prog.innerHTML = (this.day > 1 || this.dayStarted)
        ? `<span>📅 Ngày ${this.day}</span><span>🪙 ${fmt(this.money)} ¥</span><span>🏪 ${zones}/${GROCERY_ZONES.length} khu hàng</span>`
        : '<span>✨ Vừa bán tạp hóa · vừa học tiếng Trung</span>';
    }
  }

  hideTitleScreen() {
    const el = this.$('title-screen');
    if (el) el.classList.add('hidden');
    document.body.classList.remove('on-title');
    this.lastTickAt = performance.now();
  }

  onTitlePlay() {
    if (!this.cloud.checked && GameCloud.signedIn()) return; // đang tải tiến trình từ tài khoản
    this.audio.init();
    this.audio.pop();
    this.hideTitleScreen();
    if (this.isDayInProgress()) {
      this.showToast('▶️', `Tiếp tục ngày ${this.day}!`);
    } else if (!this.dayEnded) {
      this.showMissionBriefing();
    }
  }

  // --------------------------------------------------------------------------
  // Nhiệm vụ ngày
  // --------------------------------------------------------------------------
  freshStats() {
    return { spawned: 0, served: 0, lost: 0, revenue: 0, cost: 0, scoreSum: 0, changeFirstTry: 0, incidentLoss: 0, incidents: [] };
  }

  buildMission() {
    const raw = MISSION_RULES.baseTarget + (this.day - 1) * MISSION_RULES.targetPerDay;
    const target = Math.min(MISSION_RULES.maxTarget, Math.ceil(raw / MISSION_RULES.roundTo) * MISSION_RULES.roundTo);
    const maxLost = MISSION_RULES.baseMaxLost + Math.floor((this.day - 1) / 3);
    return { day: this.day, target, maxLost, minAccuracy: MISSION_RULES.minChangeAccuracy, rewarded: false };
  }

  showMissionBriefing() {
    this.mission = this.buildMission();
    const m = this.mission;
    this.setText('mission-day-chn', `第${this.day}天`);
    const low = this.shelves.filter(s => s.unlocked && s.currentStock <= 2).length;
    const sub = this.$('mission-sub');
    if (sub) {
      sub.innerHTML = `Mỗi ngày bán hàng gồm <b>${Math.round(DAY_RULES.lengthMs / 60000)} phút đếm ngược</b>. Khách đến liên tục tấp nập — phục vụ được càng nhiều càng tốt!`
        + (low ? `<br>⚠️ <b>${low} món</b> sắp hết hàng — nên nhập thêm trước khi mở cửa.` : '')
        + '<br>🕒 Đồ tươi còn trên kệ cuối ngày sẽ <b>hết hạn một nửa</b>; trong ngày có thể có <b>sự cố bất ngờ</b>!';
    }
    const goals = this.$('mission-goals');
    if (goals) {
      goals.innerHTML = `
        <div class="mgoal main"><span class="mg-icon">💰</span><span>Doanh thu đạt <b>${m.target} ¥</b></span><span class="mg-star">⭐</span></div>
        <div class="mgoal"><span class="mg-icon">😊</span><span>Không để quá <b>${m.maxLost}</b> khách bỏ về</span><span class="mg-star">⭐</span></div>
        <div class="mgoal"><span class="mg-icon">💴</span><span>Thối đúng ngay lần đầu cho <b>${m.minAccuracy}%</b> khách</span><span class="mg-star">⭐</span></div>`;
    }
    this.renderHUDGoal();
    this.openModal('modal-day-mission');
  }

  startDay() {
    this.closeModal('modal-day-mission');
    this.saveProgress(); // mốc đầu ngày: thoát giữa ngày thì vào lại chơi lại từ đây
    this.audio.init();
    this.audio.bell();
    this.dayStarted = true;
    this.dayEnded = false;
    this.closed = false;
    this.dayStartAt = this.gameTime;
    this.nextArrivalAt = this.gameTime + QUEUE_RULES.firstArrivalMs;
    // sự cố bất ngờ: ngày 1 có 1 lần, từ ngày 2 có 1–2 lần, rơi vào khoảng 20%–85% thời gian bán
    const nInc = this.day === 1 ? 1 : randInt(1, 2);
    this.incidentTimes = Array.from({ length: nInc }, () => this.dayStartAt + DAY_RULES.lengthMs * (0.2 + Math.random() * 0.65)).sort((a, b) => a - b);
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
    const accuracy = s.served > 0 ? Math.round((s.changeFirstTry / s.served) * 100) : 0;
    return [
      { icon: '💰', text: `Doanh thu ${m.target} ¥`, value: `${fmt(s.revenue)} ¥`, done: s.revenue >= m.target },
      { icon: '😊', text: `Tối đa ${m.maxLost} khách bỏ về`, value: `${s.lost} khách`, done: s.lost <= m.maxLost },
      { icon: '💴', text: `Thối đúng ngay ≥ ${m.minAccuracy}%`, value: s.served > 0 ? `${accuracy}%` : '—', done: s.served > 0 && accuracy >= m.minAccuracy }
    ];
  }

  // --------------------------------------------------------------------------
  // Đồng hồ & hàng đợi
  // --------------------------------------------------------------------------
  dayElapsed() {
    return Math.max(0, this.gameTime - this.dayStartAt);
  }

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
    this.gameTime += dt;

    // Đến giờ đóng cửa: không nhận khách mới, phục vụ nốt khách đang chờ
    if (!this.closed && this.dayElapsed() >= DAY_RULES.lengthMs) {
      this.closed = true;
      this.learn('打烊');
      this.audio.bell();
      this.showToast('🌙', this.line.length || this.current
        ? '打烊 Hết giờ bán hôm nay! Phục vụ nốt khách đang chờ nhé.'
        : '打烊 Hết giờ bán hôm nay!');
      this.renderRail();
      this.renderCounter();
    }

    // Khách mới đến theo lịch
    if (!this.closed && this.gameTime >= this.nextArrivalAt) {
      if (this.line.length < QUEUE_RULES.maxLine) {
        this.spawnArrival();
      } else {
        this.nextArrivalAt = this.gameTime + 2000; // hàng đầy → kiểm tra lại nhanh
      }
    }

    // Hết kiên nhẫn → bỏ về (chỉ khi chưa được nhận đơn)
    if (!this.relaxedMode) {
      [...this.line].forEach(c => { if (this.gameTime - c.arrivedAt >= QUEUE_RULES.patienceMs) this.loseCustomer(c); });
      const cur = this.current;
      if (cur && !cur.takenAt && !cur.leaving && this.gameTime - cur.arrivedAt >= QUEUE_RULES.patienceMs) this.loseCustomer(cur);
    }

    // Sự cố bất ngờ giữa ngày
    if (!this.closed && this.incidentTimes && this.incidentTimes.length && this.gameTime >= this.incidentTimes[0]) {
      this.incidentTimes.shift();
      this.triggerIncident();
    }

    // Tự động đổi câu tám chuyện khi chờ khách rảnh rỗi (mỗi 6-7s)
    if (!this.current && this.dayStarted && !this.closed && this.gameTime >= this.nextChitChatTime) {
      this.nextChitChat(false);
      this.nextChitChatTime = this.gameTime + 6500;
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
    for (let i = 0; i < GROCERY_CUSTOMERS.length * 2; i++) {
      if (!this.customerDeck.length) this.customerDeck = [...GROCERY_CUSTOMERS].sort(() => Math.random() - 0.5);
      const c = this.customerDeck.shift();
      if (!present.has(c.id)) return c;
    }
    return GROCERY_CUSTOMERS[randInt(0, GROCERY_CUSTOMERS.length - 1)];
  }

  spawnArrival() {
    this.ticketSeq += 1;
    const c = { id: this.ticketSeq, profile: this.nextCustomerProfile(), arrivedAt: this.gameTime };
    this.line.push(c);
    this.stats.spawned += 1;
    this.nextArrivalAt = this.gameTime + this.getArrivalGapMs();
    this.audio.bell();
    const bell = document.querySelector('.door-bell');
    if (bell) { bell.classList.remove('ring'); void bell.offsetWidth; bell.classList.add('ring'); }
    if (this.current) this.showToast('🔔', `${c.profile.nameChn} (${c.profile.nameVi}) vừa vào tiệm và đang xếp hàng.`);
    this.renderRail();
  }

  promoteNext() {
    if (this.current || !this.line.length) return;
    const c = this.line.shift();
    c.order = this.makeOrder();
    c.wrongPicks = 0;
    c.changeWrong = 0;
    c.hintUsed = false;
    this.current = c;
    this.resetWorkbench();
    if (!c.order) {
      this.renderCounter(true);
      this.audio.sad();
      this.showToast('📦', `Kệ hết sạch hàng! ${c.profile.nameChn} không mua được gì. Hãy vào 批发市场 nhập hàng!`, 'warn');
      c.leaving = true;
      setTimeout(() => { if (this.current === c) this.loseCustomer(c, true); }, 2600);
      return;
    }
    this.renderCounter(true);
    this.renderRail();
    setTimeout(() => { if (this.current === c && !c.takenAt) this.speakOrder(); }, 450);
  }

  loseCustomer(c, silent = false) {
    const isCurrent = this.current === c;
    if (isCurrent) {
      this.clearBasket(true);
      this.current = null;
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
    setTimeout(() => { this.promoteNext(); this.renderCounter(); }, isCurrent ? 550 : 0);
  }

  checkDayEnd() {
    if (!this.dayStarted || this.dayEnded || !this.closed) return;
    if (!this.line.length && !this.current && !this.isModalOpen()) this.showDaySummary();
  }

  patienceUsed(c) {
    if (!c) return 0;
    return Math.min(1, (this.gameTime - c.arrivedAt) / QUEUE_RULES.patienceMs);
  }

  // --------------------------------------------------------------------------
  // Đơn hàng
  // --------------------------------------------------------------------------
  makeOrder(allowSoldOut = true) {
    const avail = this.shelves.filter(s => s.unlocked && this.zones[s.zone] && s.currentStock > 0);
    if (!avail.length) return null;
    // Khách hỏi đúng món đã mở bán nhưng đang hết hàng → phải xin lỗi "不好意思，这个卖完了。"
    const soldOut = this.shelves.filter(s => s.unlocked && this.zones[s.zone] && s.currentStock <= 0);
    if (allowSoldOut && soldOut.length && Math.random() < INCIDENT_RULES.soldOutChance) {
      const it = pickOne(soldOut);
      const due = it.price;
      const paid = this.pickPaidAmount(due);
      return { items: [{ item: it, qty: 1 }], due, paid, change: Math.round((paid - due) * 100) / 100, tpl: 'have', soldOut: true };
    }
    const wantTwo = Math.random() < Math.min(0.75, 0.35 + this.day * 0.08);
    const count = Math.min(avail.length, wantTwo ? 2 : 1);
    const picked = [...avail].sort(() => Math.random() - 0.5).slice(0, count);
    const items = picked.map(it => {
      const cap = it.price > 8 ? 1 : (this.day >= 3 ? 3 : 2);
      return { item: it, qty: randInt(1, Math.min(it.currentStock, cap)) };
    });
    const due = items.reduce((s, x) => s + cents(x.item.price) * x.qty, 0) / 100;
    const paid = this.pickPaidAmount(due);
    const tpls = ORDER_TEMPLATES.filter(t => !t.one || items.length === 1);
    const haggle = due >= INCIDENT_RULES.haggleMinDue && Math.random() < INCIDENT_RULES.haggleChance ? pickOne(HAGGLE_LINES) : null;
    return { items, due, paid, change: Math.round((paid - due) * 100) / 100, tpl: pickOne(tpls).id, haggle };
  }

  // Khách trả bằng tờ tiền "tròn" lớn hơn số phải trả
  pickPaidAmount(due) {
    const options = new Set();
    const up = (step) => Math.ceil((due + 0.001) / step) * step;
    options.add(up(5));
    options.add(up(10));
    [20, 50, 100].forEach(n => { if (n > due) options.add(n); });
    const list = [...options].filter(v => v > due && v - due <= 47).sort((a, b) => a - b).slice(0, 3);
    return list.length ? list[randInt(0, list.length - 1)] : up(10);
  }

  orderPhrase(order) {
    const zh = order.items.map(x => `${NUM_CHN[x.qty] || x.qty}${x.item.quantifier}${x.item.nameChn}`);
    const pin = order.items.map(x => {
      const num = x.qty === 1 ? yiPinyin(x.item.qPin) : x.qty === 2 ? 'liǎng' : 'sān';
      return `${num} ${x.item.qPin} ${x.item.pinyin}`;
    });
    // câu nói dùng nghĩa đầu tiên (file ghi "mì ăn liền / mì gói")
    const shortVi = (it) => it.nameVi.split(' / ')[0];
    const vi = order.items.map(x => `${x.qty} ${x.item.quantifierVi} ${shortVi(x.item)}`);
    const t = ORDER_TEMPLATES.find(x => x.id === order.tpl) || ORDER_TEMPLATES[0];
    const first = order.items[0].item;
    const L = zh.join('和');
    const Lhtml = zh.map(z => `<em>${z}</em>`).join('和');
    return {
      zh: t.zh(L, first.nameChn),
      zhHtml: t.zh(Lhtml, first.nameChn),
      pin: t.pin(pin.join(' hé '), first.pinyin),
      vi: `(${t.vi(vi.join(' và '), shortVi(first))})`,
      learn: t.learn
    };
  }

  speakOrder() {
    if (!this.current || !this.current.order) return;
    this.audio.speak(this.orderPhrase(this.current.order).zh);
  }

  takeOrder() {
    const c = this.current;
    if (!c || !c.order || c.takenAt) return;
    if (c.order.soldOut) {
      this.audio.error();
      this.showToast('📦', `${c.order.items[0].item.nameChn} đã HẾT HÀNG trên kệ! Hãy bấm "不好意思，这个卖完了" để xin lỗi khách.`, 'warn');
      return;
    }
    this.audio.pick();
    c.takenAt = this.gameTime;
    const used = this.patienceUsed(c);
    c.waitScore = this.relaxedMode ? 100 : Math.round(100 - 60 * Math.max(0, Math.min(1, (used - 0.25) / 0.75)));
    c.order.items.forEach(x => { this.learn(x.item.quantifier); });
    (this.orderPhrase(c.order).learn || []).forEach(w => this.learn(w));
    this.learn('老板');
    this.focusNeededZone();
    this.renderCounter();
    this.renderOrderChecklist();
    this.renderShelves();
    this.renderRail();
    this.setAttention('view-shelves-station');
    this.showToast('📝', 'Đã nhận đơn! Sang 货架区 để nhặt hàng vào giỏ.');
  }

  // ---------------- Sự cố
  // Xin lỗi khách vì món đã hết: khách đổi món khác hoặc rời tiệm
  soldOutApology() {
    const c = this.current;
    if (!c || !c.order || c.takenAt || c.leaving) return;
    if (!c.order.soldOut) {
      this.audio.error();
      this.showToast('🧐', 'Món khách gọi vẫn còn hàng trên kệ mà! Bấm Nhận đơn để bán cho khách.', 'warn');
      return;
    }
    const sorry = '不好意思，这个卖完了。';
    this.learn(sorry); this.learn('卖完了');
    this.audio.speak(sorry);
    const it = c.order.items[0].item;
    const next = Math.random() < 0.6 ? this.makeOrder(false) : null;
    if (next) {
      c.order = next;
      this.renderCounter();
      this.showToast('🔁', `不好意思，这个卖完了 · ${c.profile.nameChn} đổi sang món khác. Nhớ nhập thêm ${it.nameChn}!`);
      setTimeout(() => { if (this.current === c && !c.takenAt) this.speakOrder(); }, 1400);
    } else {
      c.leaving = true;
      this.showToast('😞', `Hết ${it.nameChn} nên ${c.profile.nameChn} đành rời tiệm (tính 1 khách bỏ về). Nhớ vào 批发市场 nhập hàng!`, 'warn');
      setTimeout(() => { if (this.current === c) this.loseCustomer(c, true); }, 1500);
    }
  }

  // Sự cố bất ngờ giữa ngày (làm vỡ chai, chuột cắn túi, mất điện) — không đụng món khách đang mua
  triggerIncident() {
    const busy = new Set(this.current && this.current.order ? this.current.order.items.map(x => x.item.id) : []);
    const stocked = this.shelves.filter(it => it.unlocked && this.zones[it.zone] && it.currentStock > 0 && !busy.has(it.id));
    const types = [];
    const bottles = stocked.filter(it => it.quantifier === '瓶' || it.quantifier === '罐');
    const bags = stocked.filter(it => it.quantifier === '包' || it.quantifier === '袋');
    const cold = stocked.filter(it => it.zone === 'dairy');
    if (bottles.length) types.push('break');
    if (bags.length) types.push('rat');
    if (cold.length) types.push('power');
    if (!types.length) return;
    const type = pickOne(types);
    const lost = [];
    const take = (it, n) => { const q = Math.min(it.currentStock, n); if (q > 0) { it.currentStock -= q; lost.push({ item: it, qty: q }); } };
    let ev;
    if (type === 'break') {
      const it = pickOne(bottles);
      const n = Math.min(it.currentStock, randInt(1, 2));
      take(it, n);
      ev = { icon: '💥', title: 'Làm vỡ hàng!', zh: `哎呀！${NUM_CHN[n] || n}${it.quantifier}${it.nameChn}打碎了！`, pin: `Āiyā! ${n === 1 ? yiPinyin(it.qPin) : 'liǎng'} ${it.qPin} ${it.pinyin} dǎsuì le!`, vi: `Ôi! Làm vỡ ${n} ${it.quantifierVi} ${it.nameVi.split(' / ')[0]} rồi!`, words: ['打碎'] };
    } else if (type === 'rat') {
      const it = pickOne(bags);
      take(it, randInt(1, 2));
      ev = { icon: '🐭', title: 'Chuột cắn hàng!', zh: `糟糕！老鼠把${it.nameChn}的袋子咬破了！`, pin: `Zāogāo! Lǎoshǔ bǎ ${it.pinyin} de dàizi yǎopò le!`, vi: `Chết rồi! Chuột cắn thủng túi ${it.nameVi.split(' / ')[0]}!`, words: ['老鼠'] };
    } else {
      cold.forEach(it => take(it, Math.max(1, Math.ceil(it.currentStock * 0.3))));
      ev = { icon: '🔌', title: 'Mất điện!', zh: '停电了！冰箱不冷了，冷藏食品坏了一些。', pin: 'Tíngdiàn le! Bīngxiāng bù lěng le, lěngcáng shípǐn huài le yìxiē.', vi: 'Mất điện rồi! Tủ lạnh không lạnh nữa, đồ lạnh bị hỏng một ít.', words: ['停电', '冰箱'] };
    }
    const loss = lost.reduce((a, x) => a + cents(x.item.cost) * x.qty, 0) / 100;
    this.stats.incidentLoss = Math.round(((this.stats.incidentLoss || 0) + loss) * 100) / 100;
    (this.stats.incidents = this.stats.incidents || []).push({ type, lost: lost.map(x => ({ id: x.item.id, qty: x.qty })), loss });
    ev.words.forEach(w => this.learn(w));
    this.audio.error();
    this.showIncident({ ...ev, loss: `Mất: ${lost.map(x => `${x.item.nameChn} ×${x.qty}`).join(', ')} · thiệt hại ${fmt(loss)} ¥ (giá nhập)` });
    this.renderShelves();
    this.renderRail();
  }

  // Bảng sự cố / tình huống (dùng chung cho sự cố & mặc cả). actions: [{ label, cls, fn }]
  showIncident({ icon, title, zh, pin, vi, loss = '', actions = null }) {
    this.setText('inc-icon', icon);
    this.setText('inc-title', title);
    this.setText('inc-chn', zh);
    this.setText('inc-pin', pin);
    this.setText('inc-vi', vi);
    this.setText('inc-loss', loss);
    const lossEl = this.$('inc-loss');
    if (lossEl) lossEl.style.display = loss ? '' : 'none';
    const box = this.$('inc-actions');
    if (box) {
      const list = actions || [{ label: '<i class="fa-solid fa-check"></i> Biết rồi', cls: 'g-btn-primary', fn: () => {} }];
      box.innerHTML = list.map((a, i) => `<button type="button" class="${a.cls || 'g-btn-ghost'}" data-inc="${i}">${a.label}</button>`).join('');
      box.querySelectorAll('[data-inc]').forEach(b => b.addEventListener('click', () => {
        this.closeModal('modal-incident');
        this.lastTickAt = performance.now();
        list[+b.dataset.inc].fn();
      }));
    }
    this.incidentSay = zh;
    this.openModal('modal-incident');
    setTimeout(() => this.audio.speak(zh), 350);
  }

  // Khách mặc cả ở quầy thối tiền: bớt 1¥ (khách vui) hoặc từ chối lịch sự (khách hơi phật ý)
  askHaggle() {
    const c = this.current;
    const o = c && c.order;
    if (!o || !o.haggle || o.haggleDone) return;
    const line = SHOP_SENTENCES.find(x => x.chn === o.haggle);
    this.learn(o.haggle); this.learn('便宜'); this.learn('打折');
    this.showIncident({
      icon: '🤝', title: `${c.profile.nameChn} mặc cả`, zh: o.haggle, pin: line ? line.pin : '', vi: line ? line.vi : '',
      loss: `Tổng tiền ${fmt(o.due)} ¥ · khách đưa ${fmt(o.paid)} ¥`,
      actions: [
        { label: '<span class="zh">好吧，便宜一块钱。</span> Bớt 1 ¥', cls: 'g-btn-primary', fn: () => {
          o.due = Math.round((o.due - 1) * 100) / 100;
          o.change = Math.round((o.paid - o.due) * 100) / 100;
          o.haggleDone = 'discount';
          c.waitScore = Math.min(100, (c.waitScore ?? 100) + 10);
          this.audio.speak('好吧，给您便宜一块钱。');
          this.showToast('😊', 'Đã bớt 1 ¥ — khách vui vẻ! Tổng tiền mới ' + fmt(o.due) + ' ¥, nhớ tính lại tiền thối.');
          this.renderChange();
        } },
        { label: '<span class="zh">不好意思，不能便宜了。</span> Giữ giá', cls: 'g-btn-ghost', fn: () => {
          o.haggleDone = 'refuse';
          c.waitScore = Math.max(0, (c.waitScore ?? 100) - 15);
          this.audio.speak('不好意思，这已经是最低价了。');
          this.showToast('😐', 'Giữ nguyên giá — khách hơi phật ý (trừ điểm chờ).');
          this.renderChange();
        } }
      ]
    });
  }

  // Cuối ngày: hàng tươi còn trên kệ bị hủy một phần (过期)
  spoilPerishables() {
    const out = [];
    this.shelves.forEach(it => {
      if (!INCIDENT_RULES.perishable.includes(it.id) || !it.unlocked || it.currentStock <= 0) return;
      const qty = Math.ceil(it.currentStock * INCIDENT_RULES.overnightSpoilRate);
      it.currentStock -= qty;
      out.push({ item: it, qty, loss: Math.round(cents(it.cost) * qty) / 100 });
    });
    if (out.length) this.learn('过期');
    return out;
  }

  // Chuyển kệ đang xem tới khu còn món khách cần
  focusNeededZone() {
    const c = this.current;
    if (!c || !c.order) return;
    const pending = c.order.items.find(x => {
      const b = this.basket.find(y => y.item.id === x.item.id);
      return !b || b.qty < x.qty;
    });
    if (pending) {
      this.shelfZone = pending.item.zone;
      this.shelfPage[pending.item.zone] = this.pageOfItem(pending.item);
    }
  }

  resetWorkbench() {
    this.basket = [];
    this.scanItems = [];
    this.changeTray = [];
    this.renderBasket();
    this.renderScan();
    this.renderChange();
    this.renderOrderChecklist();
    this.renderShelves();
  }

  // --------------------------------------------------------------------------
  // Trạm
  // --------------------------------------------------------------------------
  switchStation(id, silent = false) {
    if (!STATION_ORDER.includes(id)) return;
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
    if (id === 'view-shelves-station') { this.learn('货架'); this.renderShelves(); }
    if (id === 'view-scan-station') this.prepareScan();
    if (id === 'view-change-station') this.prepareChange();
    if (!silent && prevIdx !== nextIdx) this.audio.pop();
  }

  setAttention(id) {
    document.querySelectorAll('.g-tab').forEach(b => b.classList.toggle('attention', b.dataset.target === id && this.currentStation !== id));
  }

  // ---------------- Trạm 2: kệ hàng
  zoneShelfList(zoneId) {
    return this.shelves.filter(s => s.zone === zoneId)
      .sort((a, b) => (b.unlocked - a.unlocked) || (a.unlocked ? 0 : a.unlockCost - b.unlockCost));
  }

  shelfPerPage() { const g = this.shelfGrid(); return g.cols * g.rows; }

  // trang chứa món (để tự lật tới món khách cần)
  pageOfItem(item) {
    const idx = this.zoneShelfList(item.zone).findIndex(s => s.id === item.id);
    return idx < 0 ? 0 : Math.floor(idx / this.shelfPerPage());
  }

  pendingItems() {
    const c = this.current;
    if (!c || !c.takenAt || !c.order) return [];
    return c.order.items.filter(x => { const b = this.basket.find(y => y.item.id === x.item.id); return !b || b.qty < x.qty; }).map(x => x.item);
  }

  setShelfPage(p) {
    const pages = Math.max(1, Math.ceil(this.zoneShelfList(this.shelfZone).length / this.shelfPerPage()));
    this.shelfPage[this.shelfZone] = Math.max(0, Math.min(pages - 1, p));
    this.audio.pop();
    this.renderShelves();
  }

  selectAisle(zoneId) {
    const z = zoneOf(zoneId);
    if (!z) return;
    if (!this.zones[zoneId]) { this.openMarket(zoneId); return; }
    this.shelfZone = zoneId;
    const need = this.pendingItems().find(it => it.zone === zoneId);
    if (need) this.shelfPage[zoneId] = this.pageOfItem(need);
    this.audio.pop();
    this.renderShelves();
  }

  pickItem(item, el) {
    const c = this.current;
    if (!c || !c.takenAt) {
      this.audio.error();
      this.showToast('🛎️', 'Chưa có đơn! Hãy về 点单台 nhận đơn của khách trước.', 'warn');
      return;
    }
    if (item.currentStock <= 0) return;
    const need = c.order.items.find(x => x.item.id === item.id);
    const inBasket = this.basket.find(b => b.item.id === item.id);
    const have = inBasket ? inBasket.qty : 0;
    if (!need || have >= need.qty) {
      c.wrongPicks += 1;
      this.audio.error();
      if (el) { el.classList.remove('wrong'); void el.offsetWidth; el.classList.add('wrong'); }
      this.showToast('❌', need ? `Khách chỉ cần ${need.qty}${item.quantifier} ${item.nameChn} thôi!` : `Khách không mua ${item.nameChn} (${item.nameVi})!`, 'warn');
      return;
    }
    item.currentStock -= 1;
    if (inBasket) inBasket.qty += 1; else this.basket.push({ item, qty: 1 });
    this.learn(item.nameChn);
    this.audio.pick();
    this.flyToBasket(item, el);
    const zoneBefore = this.shelfZone;
    this.focusNeededZone();
    this.renderShelves();
    this.renderBasket();
    this.renderOrderChecklist();
    if (this.isBasketComplete()) {
      this.setAttention('view-scan-station');
      this.showToast('✨', 'Đã nhặt đủ hàng! Sang 扫码台 để quét mã.');
    } else if (this.shelfZone !== zoneBefore) {
      const z = zoneOf(this.shelfZone);
      this.showToast('➡️', `Món tiếp theo ở khu ${z.icon} ${z.chn} (${z.vi}).`);
    }
  }

  flyToBasket(item, el) {
    const target = document.querySelector('.basket-card');
    const stage = this.$('g-stage');
    if (!el || !target || !stage || !el.isConnected) return;
    const a = this.stagePos(el);
    const b = this.stagePos(target);
    const f = document.createElement('div');
    f.className = 'fly-item';
    f.innerHTML = itemImg(item);
    f.style.left = `${a.x + a.w / 2 - 16}px`;
    f.style.top = `${a.y + 10}px`;
    stage.appendChild(f);
    requestAnimationFrame(() => {
      f.style.transform = `translate(${b.x + b.w / 2 - (a.x + a.w / 2)}px, ${b.y + b.h / 2 - a.y}px) scale(0.6)`;
      f.style.opacity = '0.2';
    });
    setTimeout(() => f.remove(), 600);
  }

  removeFromBasket(itemId) {
    const idx = this.basket.findIndex(b => b.item.id === itemId);
    if (idx < 0) return;
    const b = this.basket[idx];
    b.item.currentStock += 1;
    b.qty -= 1;
    if (b.qty <= 0) this.basket.splice(idx, 1);
    this.audio.pick();
    this.scanItems = [];
    this.renderShelves();
    this.renderBasket();
    this.renderOrderChecklist();
  }

  clearBasket(silent = false) {
    this.basket.forEach(b => { b.item.currentStock += b.qty; });
    this.basket = [];
    this.scanItems = [];
    this.changeTray = [];
    if (!silent) this.audio.pick();
    this.focusNeededZone();
    this.renderShelves();
    this.renderBasket();
    this.renderOrderChecklist();
  }

  isBasketComplete() {
    const c = this.current;
    if (!c || !c.order || !c.takenAt) return false;
    return c.order.items.every(x => {
      const b = this.basket.find(y => y.item.id === x.item.id);
      return b && b.qty === x.qty;
    }) && this.basket.length === c.order.items.length;
  }

  // ---------------- Trạm 3: quét mã
  prepareScan() {
    if (!this.isBasketComplete()) { this.renderScan(); return; }
    if (!this.scanItems.length) {
      this.basket.forEach(b => { for (let i = 0; i < b.qty; i++) this.scanItems.push({ item: b.item, scanned: false }); });
    }
    this.learn('一共');
    this.renderScan();
  }

  scanItem(idx) {
    const si = this.scanItems[idx];
    if (!si || si.scanned) return;
    si.scanned = true;
    this.audio.beep();
    const laser = this.$('scanner-laser');
    if (laser) { laser.classList.remove('fire'); void laser.offsetWidth; laser.classList.add('fire'); }
    this.renderScan(idx);
    if (this.scanItems.every(x => x.scanned)) {
      this.setAttention('view-change-station');
      const total = this.current ? this.current.order.due : 0;
      this.audio.speak(`一共${this.yuanToChinese(total)}`);
      this.showToast('🧾', `Đã in hóa đơn: 一共 ${fmt(total)} ¥. Sang 找零台 thu tiền!`);
    }
  }

  // 12.5 → 12块5 (đọc tiền kiểu khẩu ngữ)
  yuanToChinese(v) {
    const c = cents(v);
    const yuan = Math.floor(c / 100);
    const jiao = Math.round((c % 100) / 10);
    return `${yuan}块${jiao ? jiao : ''}`;
  }

  scanNextItem() {
    const idx = this.scanItems.findIndex(x => !x.scanned);
    if (idx >= 0) this.scanItem(idx);
  }

  // ---------------- Trạm 4: thu tiền & thối tiền
  prepareChange() {
    this.renderChange();
    if (this.isReadyToCharge()) {
      this.learn('找零');
      const o = this.current.order;
      if (o.haggle && !o.haggleDone) setTimeout(() => this.askHaggle(), 250);
    }
  }

  isReadyToCharge() {
    return !!(this.current && this.current.takenAt && this.isBasketComplete() && this.scanItems.length && this.scanItems.every(x => x.scanned));
  }

  addToTray(val) {
    if (!this.isReadyToCharge()) {
      this.audio.error();
      this.showToast('📠', 'Chưa quét xong hàng! Hoàn tất 扫码台 trước khi thối tiền.', 'warn');
      return;
    }
    this.changeTray.push(val);
    this.audio.coin();
    this.renderTray();
  }

  removeFromTray(i) {
    this.changeTray.splice(i, 1);
    this.audio.coin();
    this.renderTray();
  }

  resetTray() {
    this.changeTray = [];
    this.renderTray();
  }

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
      this.showToast('⚠️', 'Chưa đủ bước: nhận đơn → nhặt đủ hàng → quét mã → rồi mới thối tiền.', 'warn');
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
    this.completeOrder();
  }

  completeOrder() {
    const c = this.current;
    const o = c.order;
    const units = o.items.reduce((s, x) => s + x.qty, 0);
    const elapsed = this.gameTime - c.takenAt;
    const target = SCORE_RULES.speedBaseMs + SCORE_RULES.speedPerUnitMs * units;
    const scores = {
      pick: Math.max(0, 100 - SCORE_RULES.pickPenalty * c.wrongPicks),
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
      const bonus = (total >= 95 ? 1.5 : 0.8) + (this.line.length >= 2 ? 0.7 : 0.2);
      tip = Math.round(Math.min(3.5, bonus) * 100) / 100;
    }
    const earned = Math.round((o.due + tip) * 100) / 100;

    this.money = Math.round((this.money + earned) * 100) / 100;
    this.stats.revenue = Math.round((this.stats.revenue + earned) * 100) / 100;
    this.stats.served += 1;
    this.stats.scoreSum += total;
    if (c.changeWrong === 0 && !c.hintUsed) this.stats.changeFirstTry += 1;

    this.audio.register();
    this.floatCoins();
    this.showScorecard(c, scores, total, tip, earned);

    this.current = null;
    this.basket = [];
    this.scanItems = [];
    this.changeTray = [];
    this.renderAll();
  }

  floatCoins() {
    const stage = this.$('g-stage');
    const from = document.querySelector('.change-tray') || document.querySelector('.shop-counter');
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

  showScorecard(c, scores, total, tip, earned) {
    this.setText('score-ticket-title', `Phiếu #G-${c.id} · ${c.profile.nameChn} (${c.profile.nameVi})`);
    this.setText('score-cust-name-text', `${c.profile.nameChn} (${c.profile.nameVi})`);
    const stars = total >= 90 ? 5 : total >= 75 ? 4 : total >= 50 ? 3 : 2;
    this.setText('score-stars', '⭐'.repeat(stars) + '☆'.repeat(5 - stars));
    this.setText('score-base-price', `${fmt(c.order.due)} ¥`);
    this.setText('score-tip-price', tip > 0 ? `+${fmt(tip)} ¥` : '0.00 ¥');
    const badge = this.$('score-tip-badge');
    if (badge) {
      badge.textContent = tip > 0 ? `🔥 Đông khách thưởng (+${fmt(tip)}¥)` : 'Bình thường không tip';
      badge.className = `tip-badge ${tip > 0 ? 'busy' : 'normal'}`;
    }
    this.setText('score-final-receive', `${fmt(earned)} ¥`);

    const img = this.$('score-reaction-img');
    if (img) img.src = ASSET(c.profile.img);

    let zh, vi;
    if (total >= 90) {
      zh = '老板服务真好，找零一分不差，谢谢您！';
      vi = '(Chủ tiệm phục vụ tốt quá, thối tiền chuẩn từng xu, cảm ơn nhé!)';
    } else if (total >= 70) {
      zh = '谢谢老板，下次再来！';
      vi = '(Cảm ơn chủ tiệm, lần sau tôi lại đến!)';
    } else {
      zh = '嗯……下次快一点吧。';
      vi = '(Ừm… lần sau nhanh hơn chút nhé.)';
    }
    this.lastScoreReactionZh = zh;
    this.setText('score-reaction-chn', `“${zh}”`);
    this.setText('score-reaction-vi', vi);

    // Mẫu câu tính tiền thông dụng (hiện 1 mẫu câu ngẫu nhiên)
    this.renderSingleCheckoutPhrase();

    this.openModal('modal-grocery-score');
    setTimeout(() => this.audio.speak(zh), 500);
  }

  renderSingleCheckoutPhrase() {
    const item = pickOne(CHECKOUT_PHRASES);
    const box = this.$('sp-phrase-list-grocery');
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
    this.closeModal('modal-grocery-score');
    this.lastTickAt = performance.now();
    this.switchStation('view-order-station');
    this.promoteNext();
    this.renderAll();
    this.checkDayEnd();
  }

  petCat() {
    this.audio.speak('喵～');
    this.learn('猫');
    const cat = this.$('btn-cat');
    if (cat) { cat.classList.remove('meow'); void cat.offsetWidth; cat.classList.add('meow'); }
    this.nextChitChat(true);
  }

  nextChitChat(speak = false) {
    if (!IDLE_CHITCHATS || !IDLE_CHITCHATS.length) return;
    this.curChitChatIdx = (this.curChitChatIdx + 1 + Math.floor(Math.random() * (IDLE_CHITCHATS.length - 1))) % IDLE_CHITCHATS.length;
    const item = IDLE_CHITCHATS[this.curChitChatIdx];
    this.setText('cc-chn-text', item.chn);
    this.setText('cc-pin-text', item.pin);
    this.setText('cc-vi-text', `(${item.vi})`);
    const cc = this.$('cat-chitchat');
    if (cc && !this.current) cc.classList.remove('hidden');
    if (speak) this.audio.speak(item.chn);
  }

  // --------------------------------------------------------------------------
  // Tổng kết ngày
  // --------------------------------------------------------------------------
  showDaySummary() {
    this.dayEnded = true;
    const s = this.stats;
    const spoiled = this.spoilPerishables();
    const spoilLoss = spoiled.reduce((a, x) => a + x.loss, 0);
    const spBox = this.$('summary-incidents');
    if (spBox) {
      const inc = s.incidents || [];
      const incLabel = { break: '💥 Làm vỡ hàng', rat: '🐭 Chuột cắn', power: '🔌 Mất điện' };
      spBox.innerHTML = `
        <div class="si-row ${spoiled.length ? 'bad' : 'ok'}"><b>🗑️ <span class="zh">过期</span> · Hàng tươi hết hạn qua đêm</b>
          <span>${spoiled.length ? spoiled.map(x => `<span class="zh">${x.item.nameChn}</span> ×${x.qty}`).join(', ') + ` — thiệt hại <b>${fmt(spoilLoss)} ¥</b>` : '✨ Không có hàng tươi nào bị hủy — nhập hàng vừa đủ, giỏi lắm!'}</span></div>
        <div class="si-row ${inc.length ? 'bad' : 'ok'}"><b>⚠️ Sự cố trong ngày</b>
          <span>${inc.length ? inc.map(e => `${incLabel[e.type] || e.type} (−${fmt(e.loss)} ¥)`).join(' · ') : 'Không có sự cố nào.'}</span></div>
        <div class="si-tip">💡 Đồ tươi (🕒) còn trên kệ cuối ngày sẽ bị hủy một nửa — nhập vừa đủ bán trong ngày.</div>`;
    }
    const goals = this.evaluateMission();
    const stars = goals.filter(g => g.done).length;
    const bonus = stars * MISSION_RULES.bonusPerStar;
    if (this.mission && !this.mission.rewarded) {
      this.mission.rewarded = true;
      if (bonus > 0) this.money = Math.round((this.money + bonus) * 100) / 100;
    }
    const avg = s.served > 0 ? Math.round(s.scoreSum / s.served) : 0;
    const accuracy = s.served > 0 ? Math.round((s.changeFirstTry / s.served) * 100) : 0;
    const profit = s.revenue - s.cost;

    const title = this.$('summary-day-title');
    if (title) title.innerHTML = `<span class="zh">第${this.day}天</span> · Tổng kết ngày`;
    this.setText('summary-revenue-val', `${fmt(s.revenue)} ¥`);
    this.setText('summary-cost-val', `${fmt(s.cost)} ¥`);
    this.setText('summary-profit-val', `${profit >= 0 ? '+' : ''}${fmt(profit)} ¥`);
    const pEl = this.$('summary-profit-val');
    if (pEl) pEl.className = profit >= 0 ? 'green' : 'rose';
    this.setText('summary-customers-val', `${s.served}/${s.spawned}`);
    this.setText('summary-avg-val', s.served ? `${avg}%` : '—');
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

    const now = new Date();
    const record = {
      day: this.day,
      earnings: Math.round(s.revenue * 100) / 100,
      served: s.served,
      total: Math.max(1, s.spawned),
      lost: s.lost,
      avg,
      stars,
      date: `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`
    };
    this.records = this.records.filter(r => r.day !== this.day);
    this.records.push(record);
    if (this.cloud.loggedIn) {
      // Gửi kết quả ngày + tiến trình "đầu ngày kế tiếp" trong 1 lần
      const snap = this.snapshot(this.day + 1);
      LocalSave.write(this.owner, snap);
      if (s.spawned > 0) this.pushDayResult(record, snap);
      else GameCloud.post({ save: snap }).catch(() => {});
    } else {
      this.saveProgress(this.day + 1);
      if (this.cloud.checked) setTimeout(() => this.showToast('🔐', 'Đăng nhập ở trang chủ để lưu thành tích lên bảng xếp hạng!'), 1500);
    }

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
    this.stats = this.freshStats();
    this.resetWorkbench();
    this.saveProgress();
    this.renderAll();
    this.showMissionBriefing();
  }

  // --------------------------------------------------------------------------
  // 批发市场 · Chợ đầu mối: nhập hàng, mở món mới, mở khu kệ mới
  // --------------------------------------------------------------------------
  openMarket(zoneId = null) {
    this.audio.pop();
    this.restockQty = {};
    if (zoneId && zoneOf(zoneId)) this.marketZone = zoneId;
    this.learn('进货');
    this.learn('批发市场');
    this.renderMarket();
    this.openModal('modal-restock');
  }

  // giữ tên cũ cho tương thích
  openRestockModal() { this.openMarket(); }

  afterMarketClosed() {
    this.restockQty = {};
    this.renderAll();
    if (!this.isDayInProgress()) this.saveProgress();
    if (this.$('modal-day-mission').style.display === 'flex') this.showMissionBriefing();
  }

  restockTotal() {
    return this.shelves.reduce((s, it) => s + cents(it.cost) * (this.restockQty[it.id] || 0), 0) / 100;
  }

  changeRestock(id, delta) {
    const it = this.shelves.find(s => s.id === id);
    if (!it || !it.unlocked) return;
    const room = it.maxStock - it.currentStock;
    const cur = this.restockQty[id] || 0;
    const next = Math.max(0, Math.min(room, cur + delta));
    if (delta > 0 && this.restockTotal() + it.cost > this.money + 1e-9) {
      this.audio.error();
      this.showToast('🪙', 'Không đủ vốn để nhập thêm!', 'warn');
      return;
    }
    if (next === cur) return;
    this.audio.pick();
    this.restockQty[id] = next;
    this.renderMarket();
  }

  // Nhập đầy: ưu tiên khu đang xem, trong mỗi khu ưu tiên món còn ít hàng
  autofillRestock() {
    let budget = cents(this.money) - cents(this.restockTotal());
    const list = this.shelves.filter(s => s.unlocked && this.zones[s.zone])
      .sort((a, b) => (a.zone === this.marketZone ? 0 : 1) - (b.zone === this.marketZone ? 0 : 1) || a.currentStock / a.maxStock - b.currentStock / b.maxStock);
    list.forEach(it => {
      const cur = this.restockQty[it.id] || 0;
      const room = it.maxStock - it.currentStock - cur;
      const afford = Math.floor(budget / cents(it.cost));
      const q = Math.max(0, Math.min(room, afford));
      this.restockQty[it.id] = cur + q;
      budget -= q * cents(it.cost);
    });
    this.audio.pop();
    this.renderMarket();
  }

  confirmRestock() {
    const total = this.restockTotal();
    if (total > this.money + 1e-9) { this.audio.error(); return; }
    let units = 0;
    this.shelves.forEach(it => {
      const q = this.restockQty[it.id] || 0;
      if (q > 0) { it.currentStock += q; units += q; }
    });
    this.money = Math.round((this.money - total) * 100) / 100;
    this.stats.cost = Math.round((this.stats.cost + total) * 100) / 100;
    this.restockQty = {};
    this.closeModal('modal-restock');
    this.lastTickAt = performance.now();
    if (units > 0) {
      this.audio.register();
      this.showToast('📦', `Đã nhập ${units} món lên kệ (−${fmt(total)} ¥).`);
    }
    this.afterMarketClosed();
  }

  unlockZone(zoneId) {
    const z = zoneOf(zoneId);
    if (!z || this.zones[zoneId]) return;
    if (this.money - this.restockTotal() < z.unlockCost - 1e-9) {
      this.audio.error();
      this.showToast('🪙', `Cần ${fmt(z.unlockCost)} ¥ để mở khu ${z.chn}.`, 'warn');
      return;
    }
    this.money = Math.round((this.money - z.unlockCost) * 100) / 100;
    this.zones[zoneId] = true;
    this.shelves.filter(it => it.zone === zoneId && it.unlockCost === 0).forEach(it => {
      it.unlocked = true;
      it.currentStock = Math.max(it.currentStock, ZONE_GIFT_STOCK);
      this.learn(it.nameChn);
    });
    this.learn(z.chn);
    this.audio.unlock();
    this.showToast('🎉', `Đã mở khu ${z.icon} ${z.chn} (${z.vi})! Tặng kèm ${ZONE_GIFT_STOCK} món mỗi loại có sẵn.`);
    this.renderMarket();
    this.updateHUD();
  }

  unlockItem(itemId) {
    const it = this.shelves.find(s => s.id === itemId);
    if (!it || it.unlocked || !this.zones[it.zone]) return;
    if (this.money - this.restockTotal() < it.unlockCost - 1e-9) {
      this.audio.error();
      this.showToast('🪙', `Cần ${fmt(it.unlockCost)} ¥ để mở bán ${it.nameChn}.`, 'warn');
      return;
    }
    this.money = Math.round((this.money - it.unlockCost) * 100) / 100;
    it.unlocked = true;
    this.learn(it.nameChn);
    this.audio.unlock();
    // Gợi ý luôn số lượng nhập (vừa túi tiền)
    const afford = Math.floor((cents(this.money) - cents(this.restockTotal())) / cents(it.cost));
    this.restockQty[it.id] = Math.max(0, Math.min(it.maxStock - it.currentStock, 4, afford));
    this.showToast('🆕', `Đã mở bán ${it.nameChn} (${it.nameVi})! Bấm "Xác nhận nhập hàng" để bày lên kệ.`);
    this.renderMarket();
    this.updateHUD();
  }

  // --------------------------------------------------------------------------
  // Từ vựng
  // --------------------------------------------------------------------------
  openVocabModal() {
    this.renderVocabTabs('drinks');
    this.openModal('modal-vocab');
  }

  renderVocabTabs(active) {
    const box = this.$('vocab-tabs');
    if (box) {
      box.innerHTML = VOCAB_TABS.map(t => `<button type="button" class="vocab-tab ${t.id === active ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>`).join('');
      box.querySelectorAll('[data-tab]').forEach(btn => btn.addEventListener('click', () => this.renderVocabTabs(btn.dataset.tab)));
    }
    this.renderVocab(active);
  }

  renderVocab(tabId) {
    const grid = this.$('vocab-items-grid');
    if (!grid) return;
    const tab = VOCAB_TABS.find(t => t.id === tabId) || VOCAB_TABS[0];
    const list = tab.words;
    grid.classList.toggle('long', tab.id === 'sentences' || tab.id === 'quantifiers');
    grid.innerHTML = list.map((v, i) => `
      <div class="vc ${this.learnedVocab.has(v.chn) ? 'learned' : ''}">
        <span class="zh">${v.chn}</span>
        <div class="pin">${escapeHtml(v.pin)}</div>
        <div class="vi">${escapeHtml(v.vi)}</div>
        <button type="button" data-say="${i}" title="Nghe phát âm"><i class="fa-solid fa-volume-high"></i></button>
      </div>`).join('');
    grid.querySelectorAll('[data-say]').forEach(btn => btn.addEventListener('click', () => this.audio.speak(list[+btn.dataset.say].chn)));
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
    this.renderShelves();
    this.renderBasket();
    this.renderOrderChecklist();
    this.renderScan();
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
    const g = this.$('hud-goal');
    if (g) g.classList.toggle('reached', target > 0 && rev >= target);
  }

  renderRail() {
    const box = this.$('rail-queue');
    if (!box) return;
    const people = [];
    if (this.current) people.push({ c: this.current, serving: true });
    this.line.forEach(c => people.push({ c, serving: false }));
    if (!people.length) {
      box.innerHTML = `<span class="q-empty">${!this.dayStarted ? 'Tiệm chưa mở cửa' : this.closed ? '打烊 · Hết giờ bán hôm nay' : 'Chưa có ai xếp hàng…'}</span>`;
    } else {
      box.innerHTML = people.map(({ c, serving }) => `
        <span class="q-chip ${serving ? 'serving' : ''}" data-cid="${c.id}">
          <img src="${ASSET(c.profile.img)}" alt="">
          <span class="zh">${c.profile.nameChn}</span>
          ${serving && c.takenAt ? '' : '<span class="mini-pat"><i></i></span>'}
        </span>`).join('');
    }
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
      if (!c || c.takenAt || this.relaxedMode) {
        p.classList.add('off');
      } else {
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
    const nextBtn = this.$('btn-goto-shelves-from-order');
    const hint = this.$('order-footer-hint');
    const reg = this.$('reg-screen');
    if (!door) return;

    if (!c) {
      door.classList.add('empty');
      bubble?.classList.add('hidden');
      tag?.classList.add('hidden');
      if (nextBtn) nextBtn.style.display = 'none';
      let text = 'Đang chờ khách...';
      if (!this.dayStarted) text = 'Tiệm chưa mở cửa';
      else if (this.closed) text = 'Hết giờ bán hôm nay';
      this.setText('door-empty-text', text);
      this.setText('door-empty-chn', this.closed ? '打烊' : '欢迎光临');
      if (hint) hint.innerHTML = !this.dayStarted
        ? '💡 Bấm <b>Mở cửa bán hàng</b> để bắt đầu ngày mới.'
        : this.closed ? '🌙 Đã đóng cửa. Đang tổng kết ngày…'
          : '💡 Chờ khách bước vào… Nhân lúc rảnh hãy vào <b>批发市场</b> nhập hàng hoặc mở hàng mới.';
      if (reg) reg.textContent = '0.00';
      const takeBtnFooter = this.$('btn-take-order-footer');
      if (takeBtnFooter) takeBtnFooter.style.display = 'none';
      const cc = this.$('cat-chitchat');
      if (cc) cc.classList.toggle('hidden', !this.dayStarted || this.closed);
      return;
    }

    const cc = this.$('cat-chitchat');
    if (cc) cc.classList.add('hidden');

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

    const btn = this.$('btn-take-order-action');
    const takeBtnFooter = this.$('btn-take-order-footer');
    if (!c.order) {
      bubble?.classList.remove('hidden', 'taken');
      const chn = this.$('order-chn-text');
      if (chn) chn.textContent = '老板，货架上怎么都空了？';
      this.setText('order-pin-text', 'Lǎobǎn, huòjià shàng zěnme dōu kōng le?');
      this.setText('order-vi-text', '(Ông chủ ơi, sao kệ hàng trống trơn vậy?)');
      if (btn) btn.style.display = 'none';
      if (takeBtnFooter) takeBtnFooter.style.display = 'none';
      const soBtn0 = this.$('btn-sold-out');
      if (soBtn0) soBtn0.style.display = 'none';
      return;
    }
    if (btn) btn.style.display = c.takenAt ? 'none' : 'inline-flex';
    if (takeBtnFooter) takeBtnFooter.style.display = c.takenAt ? 'none' : 'inline-flex';
    const soBtn = this.$('btn-sold-out');
    if (soBtn) soBtn.style.display = c.takenAt || c.leaving ? 'none' : 'inline-flex';
    bubble?.classList.remove('hidden');
    bubble?.classList.toggle('taken', !!c.takenAt);
    this.renderSpeech();
    if (nextBtn) nextBtn.style.display = c.takenAt ? 'inline-flex' : 'none';
    if (hint) hint.innerHTML = c.takenAt
      ? `✅ Đã nhận đơn <b>#G-${c.id}</b>. Sang <b>货架区</b> nhặt hàng → <b>扫码台</b> quét mã → <b>找零台</b> thối tiền.`
      : '💡 Nghe khách gọi hàng rồi bấm <b>Nhận đơn</b>. Để khách chờ lâu sẽ bị trừ điểm và có thể bỏ về!';
    if (reg) reg.textContent = c.takenAt ? fmt(c.order.due) : '0.00';
    this.updatePatienceUI();
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

  renderChalkboard() {
    const ul = this.$('chalk-specials');
    if (!ul) return;
    ul.innerHTML = this.shelves.filter(s => s.unlocked && this.zones[s.zone]).slice(-4).reverse()
      .map(s => `<li><span>${itemImg(s)} <span class="zh">${s.nameChn}</span></span><b>${fmt(s.price)}¥</b></li>`).join('');
  }

  wantedByZone() {
    const c = this.current;
    const out = {};
    if (!c || !c.takenAt || !c.order) return out;
    c.order.items.forEach(x => {
      const b = this.basket.find(y => y.item.id === x.item.id);
      if (!b || b.qty < x.qty) out[x.item.zone] = (out[x.item.zone] || 0) + 1;
    });
    return out;
  }

  renderShelves() {
    const rack = this.$('shelves-display-rack');
    const tabs = this.$('aisle-tabs');
    if (!rack) return;
    if (!this.zones[this.shelfZone]) this.shelfZone = GROCERY_ZONES.find(z => this.zones[z.id]).id;
    const wantedZones = this.wantedByZone();

    if (tabs) {
      tabs.innerHTML = GROCERY_ZONES.map(z => {
        const open = this.zones[z.id];
        const need = wantedZones[z.id];
        return `<button type="button" class="aisle-tab ${z.id === this.shelfZone ? 'active' : ''} ${open ? '' : 'locked'} ${need ? 'need' : ''}" data-aisle="${z.id}" title="${escapeHtml(z.vi)}">
          <span class="a-icon">${open ? z.icon : '🔒'}</span>
          <span class="a-txt"><b class="zh">${z.chn}</b><small>${open ? escapeHtml(z.short) : `${fmt(z.unlockCost)} ¥`}</small></span>
          ${need ? `<span class="a-need">${need}</span>` : ''}
        </button>`;
      }).join('');
      tabs.querySelectorAll('[data-aisle]').forEach(b => b.addEventListener('click', () => this.selectAisle(b.dataset.aisle)));
    }

    const c = this.current;
    const wanted = new Set(c && c.takenAt && c.order ? c.order.items.map(x => x.item.id) : []);
    const all = this.zoneShelfList(this.shelfZone);
    const { cols, rows: rowCount } = this.shelfGrid();
    const per = cols * rowCount;
    const pages = Math.max(1, Math.ceil(all.length / per));
    const page = Math.max(0, Math.min(pages - 1, this.shelfPage[this.shelfZone] || 0));
    this.shelfPage[this.shelfZone] = page;
    const items = all.slice(page * per, page * per + per);
    const pager = this.$('shelf-pager');
    if (pager) {
      pager.style.display = pages > 1 ? 'flex' : 'none';
      if (pages > 1) {
        const needPages = new Set(all.map((it, i) => (wanted.has(it.id) ? Math.floor(i / per) : -1)).filter(p => p >= 0 && p !== page));
        pager.innerHTML = `
          <button type="button" class="sp-btn" data-page="${page - 1}" ${page === 0 ? 'disabled' : ''} aria-label="Trang trước"><i class="fa-solid fa-chevron-left"></i></button>
          <span class="sp-dots">${Array.from({ length: pages }, (_, i) => `<button type="button" class="sp-dot ${i === page ? 'on' : ''} ${needPages.has(i) ? 'need' : ''}" data-page="${i}" aria-label="Trang ${i + 1}">${i + 1}</button>`).join('')}</span>
          <span class="sp-label">Trang ${page + 1}/${pages}${needPages.size ? ' · <b>món khách cần ở trang khác</b>' : ''}</span>
          <button type="button" class="sp-btn" data-page="${page + 1}" ${page === pages - 1 ? 'disabled' : ''} aria-label="Trang sau"><i class="fa-solid fa-chevron-right"></i></button>`;
        pager.querySelectorAll('[data-page]').forEach(b => b.addEventListener('click', () => this.setShelfPage(+b.dataset.page)));
      }
    }
    rack.style.setProperty('--shelf-cols', cols);
    rack.style.setProperty('--shelf-rows', rowCount);
    const slots = [];
    for (let i = 0; i < cols * rowCount; i++) slots.push(items[i] || null);
    const rows = [];
    for (let r = 0; r < rowCount; r++) rows.push(slots.slice(r * cols, (r + 1) * cols));
    rack.innerHTML = rows.map(row => `<div class="shelf-row">${row.map(it => {
      if (!it) return '<div class="prod empty-slot"></div>';
      if (!it.unlocked) {
        return `<button type="button" class="prod locked" data-locked="${it.id}">
          <span class="lock-emoji">${itemImg(it)}</span>
          <span class="zh lock-name">${it.nameChn}</span>
          <span class="lock-price"><i class="fa-solid fa-lock"></i> Mở ở 批发市场 · ${fmt(it.unlockCost)} ¥</span>
        </button>`;
      }
      const out = it.currentStock <= 0;
      const stackN = Math.max(1, Math.min(3, it.currentStock));
      return `<button type="button" class="prod ${out ? 'out' : ''} ${wanted.has(it.id) ? 'wanted' : ''}" data-pid="${it.id}" title="${escapeHtml(it.nameVi)}">
        <span class="prod-stock ${it.currentStock <= 2 ? 'low' : ''}">${out ? 'Hết hàng' : `Còn ${it.currentStock}`}</span>
        <span class="prod-tag">${fmt(it.price)}¥</span>
        <span class="prod-stack">${out ? `<span style="opacity:.3;filter:grayscale(1)">${itemImg(it)}</span>` : `<span>${itemImg(it)}</span>`.repeat(stackN)}</span>
        <span class="prod-name zh">${it.nameChn}</span>
        <span class="prod-pin">${escapeHtml(it.pinyin)} · ${escapeHtml(it.nameVi)}</span>
      </button>`;
    }).join('')}</div>`).join('');
    rack.querySelectorAll('[data-pid]').forEach(el => el.addEventListener('click', () => {
      const it = this.shelves.find(s => s.id === el.dataset.pid);
      if (it && it.currentStock > 0) this.pickItem(it, el);
      else if (it) { this.audio.error(); this.showToast('📦', `${it.nameChn} hết hàng rồi! Vào 批发市场 nhập thêm.`, 'warn'); }
    }));
    rack.querySelectorAll('[data-locked]').forEach(el => el.addEventListener('click', () => this.openMarket(this.shelfZone)));
  }

  renderOrderChecklist() {
    const list = this.$('oc-list');
    if (!list) return;
    const c = this.current;
    this.setText('oc-ticket-id', c ? `#G-${c.id}` : '');
    if (!c || !c.takenAt || !c.order) {
      list.innerHTML = '<div class="oc-none">Chưa có đơn. Về 点单台 nhận đơn của khách.</div>';
    } else {
      list.innerHTML = c.order.items.map(x => {
        const b = this.basket.find(y => y.item.id === x.item.id);
        const have = b ? b.qty : 0;
        const z = zoneOf(x.item.zone);
        return `<button type="button" class="oc-item ${have === x.qty ? 'done' : ''}" data-goto-zone="${z.id}" title="Tới khu ${escapeHtml(z.vi)}">
          <span class="em">${itemImg(x.item)}</span>
          <span class="oc-txt"><span class="zh">${NUM_CHN[x.qty] || x.qty}${x.item.quantifier}${x.item.nameChn}</span><small>${z.icon} ${z.chn} · ${escapeHtml(z.vi)}</small></span>
          <span class="cnt">${have}/${x.qty}</span>
        </button>`;
      }).join('');
      list.querySelectorAll('[data-goto-zone]').forEach(b => b.addEventListener('click', () => this.selectAisle(b.dataset.gotoZone)));
    }
    const next = this.$('btn-goto-scan');
    if (next) next.disabled = !this.isBasketComplete();
    const hint = this.$('shelves-hint');
    if (hint) hint.innerHTML = this.isBasketComplete()
      ? '✨ Đủ hàng rồi! Bấm <b>Sang quét mã</b>.'
      : '💡 Chọn đúng <b>khu kệ</b> (tab có chấm đỏ), chạm món <b>tô vàng</b> để bỏ vào giỏ. Nhặt nhầm bị trừ điểm!';
  }

  renderBasket() {
    const box = this.$('basket-items-scroll');
    if (!box) return;
    if (!this.basket.length) {
      box.innerHTML = '<div class="basket-empty"><span>🧺</span>Giỏ còn trống</div>';
    } else {
      box.innerHTML = this.basket.map(b => `
        <div class="basket-row">
          <span class="em">${itemImg(b.item)}</span>
          <span class="zh">${b.item.nameChn}</span>
          <span class="qty">${fmt(b.item.price)}¥ × ${b.qty}</span>
          <button type="button" data-remove="${b.item.id}" title="Trả 1 món về kệ"><i class="fa-solid fa-minus"></i></button>
        </div>`).join('');
      box.querySelectorAll('[data-remove]').forEach(btn => btn.addEventListener('click', () => this.removeFromBasket(btn.dataset.remove)));
    }
    const sub = this.basket.reduce((s, b) => s + cents(b.item.price) * b.qty, 0) / 100;
    this.setText('basket-subtotal-val', `${fmt(sub)} ¥`);
  }

  renderScan(flashIdx = -1) {
    const track = this.$('conveyor-items-track');
    if (!track) return;
    const ready = this.isBasketComplete();
    if (ready && !this.scanItems.length) {
      this.basket.forEach(b => { for (let i = 0; i < b.qty; i++) this.scanItems.push({ item: b.item, scanned: false }); });
    }
    if (!ready || !this.scanItems.length) {
      track.innerHTML = '<div class="basket-empty" style="color:#e2e8f0">🧺 Chưa có hàng trên băng chuyền.<br>Nhặt đủ hàng ở 货架区 trước.</div>';
    } else {
      track.innerHTML = this.scanItems.map((si, i) => `
        <button type="button" class="belt-item ${si.scanned ? 'scanned' : ''} ${i === flashIdx ? 'beep' : ''}" data-scan="${i}">
          <span class="em">${itemImg(si.item)}</span>
          <span class="zh">${si.item.nameChn}</span>
          <span class="pr">${fmt(si.item.price)}¥</span>
          <span class="barcode"></span>
        </button>`).join('');
      track.querySelectorAll('[data-scan]').forEach(el => el.addEventListener('click', () => this.scanItem(+el.dataset.scan)));
    }
    const scanned = this.scanItems.filter(x => x.scanned);
    const total = scanned.reduce((s, x) => s + cents(x.item.price), 0) / 100;
    this.setText('scan-scanned-count', `${scanned.length} / ${this.scanItems.length}`);
    this.setText('scan-total-due', `${fmt(total)} ¥`);
    this.setText('receipt-total-num', `${fmt(total)} ¥`);
    const lines = this.$('receipt-items-lines');
    if (lines) lines.innerHTML = scanned.map(x => `<div><span class="zh">${x.item.nameChn}</span><b>${fmt(x.item.price)}</b></div>`).join('');
    const all = this.scanItems.length > 0 && scanned.length === this.scanItems.length;
    const btn = this.$('btn-trigger-scanner');
    if (btn) btn.disabled = !this.scanItems.length || all;
    const next = this.$('btn-goto-change');
    if (next) next.disabled = !all;
    document.querySelector('.conveyor-belt')?.classList.toggle('paused', !this.scanItems.length || all);
    const hint = this.$('scan-hint');
    if (hint) hint.innerHTML = all ? '🧾 Đã in hóa đơn! Bấm <b>Sang thu tiền</b>.' : '💡 Chạm từng món trên băng chuyền (hoặc nút quét) để quét mã.';
  }

  renderChange() {
    const c = this.current;
    const ready = this.isReadyToCharge();
    this.setText('change-due-amount', ready ? `${fmt(c.order.due)} ¥` : '—');
    this.setText('change-paid-amount', ready ? `${fmt(c.order.paid)} ¥` : '—');
    this.setText('change-needed-amount', ready && c.hintUsed ? `${fmt(c.order.change)} ¥` : '? ¥');
    const hintBtn = this.$('btn-change-hint');
    if (hintBtn) {
      hintBtn.classList.toggle('used', !!(c && c.hintUsed));
      hintBtn.innerHTML = c && c.hintUsed ? '<i class="fa-solid fa-lightbulb"></i> Đã xem gợi ý' : '<i class="fa-solid fa-lightbulb"></i> Gợi ý (−20 điểm)';
    }
    const bills = this.$('customer-bill-render');
    if (bills) {
      bills.innerHTML = !ready
        ? '<div class="tray-empty" style="color:#fff4dd">Khách sẽ đưa tiền khi bạn quét xong hàng.</div>'
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
      box.innerHTML = `<div class="tray-empty">${this.isReadyToCharge() ? 'Chạm tờ tiền/đồng xu trong ngăn kéo để lấy tiền thối.' : 'Hoàn tất quét mã trước khi thối tiền.'}</div>`;
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
    const grid = this.$('stock-table-body');
    if (!grid) return;
    const z = zoneOf(this.marketZone) || GROCERY_ZONES[0];
    const zoneOpen = this.zones[z.id];
    const free = this.money - this.restockTotal();

    if (zonesBox) {
      zonesBox.innerHTML = GROCERY_ZONES.map(zz => {
        const open = this.zones[zz.id];
        const items = this.shelves.filter(s => s.zone === zz.id);
        const sold = items.filter(s => s.unlocked).length;
        const low = open && items.some(s => s.unlocked && s.currentStock <= 2);
        return `<button type="button" class="mz ${zz.id === z.id ? 'active' : ''} ${open ? '' : 'locked'}" data-mz="${zz.id}">
          <span class="mz-icon">${zz.icon}</span>
          <span class="mz-txt"><b class="zh">${zz.chn}</b><small>${escapeHtml(zz.short)}</small></span>
          <span class="mz-state">${open ? `${sold}/${items.length}${low ? ' ⚠️' : ''}` : `🔒 ${fmt(zz.unlockCost)}¥`}</span>
        </button>`;
      }).join('');
      zonesBox.querySelectorAll('[data-mz]').forEach(b => b.addEventListener('click', () => { this.marketZone = b.dataset.mz; this.audio.pop(); this.renderMarket(); }));
    }

    if (head) {
      head.innerHTML = zoneOpen
        ? `<span class="mzh-icon">${z.icon}</span><div><b class="zh">${z.chn}区</b> <span class="mzh-pin">${escapeHtml(z.pin)}</span><small>Khu ${escapeHtml(z.vi)} · Chạm <b>+</b> để nhập hàng, mở bán món mới bằng tiền</small></div>`
        : `<span class="mzh-icon">🔒</span><div><b class="zh">${z.chn}区</b> <span class="mzh-pin">${escapeHtml(z.pin)}</span><small>Khu ${escapeHtml(z.vi)} chưa mở. Mở khu để có thêm kệ & món mới!</small></div>
           <button type="button" class="g-btn-primary" id="btn-unlock-zone" ${free >= z.unlockCost ? '' : 'disabled'}><i class="fa-solid fa-unlock"></i> Mở khu · ${fmt(z.unlockCost)} ¥</button>`;
      this.$('btn-unlock-zone')?.addEventListener('click', () => this.unlockZone(z.id));
    }

    const items = this.shelves.filter(s => s.zone === z.id);
    grid.innerHTML = items.map(it => {
      const q = this.restockQty[it.id] || 0;
      const room = it.maxStock - it.currentStock;
      const profit = it.price - it.cost;
      if (!it.unlocked) {
        const canUnlock = zoneOpen && free >= it.unlockCost;
        return `<div class="mk-card locked ${zoneOpen ? '' : 'zone-locked'}">
          <span class="mk-emoji">${itemImg(it)}</span>
          <b class="zh mk-name">${it.nameChn}</b>${INCIDENT_RULES.perishable.includes(it.id) ? '<span class="mk-fresh">🕒 Hàng tươi</span>' : ''}
          <span class="mk-pin">${escapeHtml(it.pinyin)}</span>
          <span class="mk-vi">${escapeHtml(it.nameVi)}</span>
          <span class="mk-price">Bán ${fmt(it.price)} ¥ / ${it.quantifier} · lãi ${fmt(profit)}</span>
          <button type="button" class="mk-unlock" data-unlock="${it.id}" ${canUnlock ? '' : 'disabled'}>
            ${zoneOpen ? `<i class="fa-solid fa-unlock"></i> Mở bán · ${fmt(it.unlockCost)} ¥` : '<i class="fa-solid fa-lock"></i> Mở khu trước'}
          </button>
        </div>`;
      }
      const pct = Math.round(((it.currentStock + q) / it.maxStock) * 100);
      return `<div class="mk-card ${it.currentStock <= 2 ? 'low' : ''}">
        <span class="mk-stock">Kệ ${it.currentStock}/${it.maxStock}${q ? ` <b>+${q}</b>` : ''}</span>
        <span class="mk-emoji">${itemImg(it)}</span>
        <b class="zh mk-name">${it.nameChn}</b>${INCIDENT_RULES.perishable.includes(it.id) ? '<span class="mk-fresh">🕒 Hàng tươi</span>' : ''}
        <span class="mk-pin">${escapeHtml(it.pinyin)}</span>
        <span class="mk-vi">${escapeHtml(it.nameVi)}</span>
        <span class="mk-price">Nhập <b class="cost">${fmt(it.cost)}</b> → bán <b class="sell">${fmt(it.price)}</b> ¥</span>
        <div class="mk-bar"><i style="width:${pct}%"></i></div>
        <div class="mk-qty">
          <button type="button" data-rs="${it.id}" data-d="-1" ${q <= 0 ? 'disabled' : ''}>−</button>
          <b>${q}</b>
          <button type="button" data-rs="${it.id}" data-d="1" ${q >= room ? 'disabled' : ''}>+</button>
        </div>
      </div>`;
    }).join('');
    grid.querySelectorAll('[data-rs]').forEach(btn => btn.addEventListener('click', () => this.changeRestock(btn.dataset.rs, +btn.dataset.d)));
    grid.querySelectorAll('[data-unlock]').forEach(btn => btn.addEventListener('click', () => this.unlockItem(btn.dataset.unlock)));

    const total = this.restockTotal();
    this.setText('modal-stock-current-bal', `${fmt(this.money)} ¥`);
    this.setText('modal-stock-total-cost', `${fmt(total)} ¥`);
    this.setText('modal-stock-remaining-bal', `${fmt(this.money - total)} ¥`);
    const confirm = this.$('btn-confirm-restock-open');
    if (confirm) confirm.disabled = total > this.money + 1e-9;
  }

  // --------------------------------------------------------------------------
  // Tài khoản & bảng xếp hạng
  // --------------------------------------------------------------------------
  async initCloud() {
    // Luôn hỏi server (kể cả khi không có token): server nhận cookie phiên & email đã lưu như các trang khác
    let data;
    try {
      data = await GameCloud.getProgress();
    } catch (e) {
      // Mất mạng: vẫn chơi bằng bản lưu trên máy của tài khoản này
      this.cloud.checked = true;
      this.cloud.offline = true;
      const lu = GameCloud.localUser();
      if (lu) this.cloud.name = lu.name || lu.email;
      this.renderAccountChip();
      return;
    }
    this.cloud.checked = true;
    if (!data || !data.loggedIn) {
      // Phiên đăng nhập hết hạn → coi như khách
      this.switchOwner('guest');
      this.renderAccountChip();
      return;
    }
    const lu = GameCloud.localUser();
    this.cloud.loggedIn = true;
    this.cloud.name = (data.user && data.user.name) || (lu && lu.name) || 'Bạn';
    this.cloud.picture = (data.user && data.user.picture) || (lu && lu.picture) || '';
    this.cloud.best = data.best || null;
    this.cloud.history = Array.isArray(data.history) ? data.history : [];

    // Chủ bản lưu trên máy phải là đúng tài khoản này (không bao giờ dùng bản của khách / tài khoản khác)
    const email = lu && lu.email ? String(lu.email).toLowerCase().trim() : '';
    this.owner = email || 'account';
    // Đồng bộ tiến trình: bản nào mới hơn thì dùng bản đó; không có bản nào → ván mới
    const migrated = data.save ? migrateSaveV2(data.save) : null; // tiến trình cũ trên tài khoản (v2) → chuyển đổi
    const server = migrated && migrated.v === SAVE_VERSION ? migrated : null;
    const local = email ? LocalSave.read(email) : null;
    const sTime = server ? Number(server.updatedAt) || 0 : -1;
    const lTime = local ? Number(local.updatedAt) || 0 : -1;
    if (!this.isDayInProgress()) {
      if (server && sTime >= lTime) {
        this.applySnapshot(server);
        if (email) LocalSave.write(email, server);
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

  // Đổi "chủ" của bản lưu (vd: phiên đăng nhập hết hạn → về bản lưu của khách)
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

  openRankModal(tab = this.rankTab || 'global') {
    this.openModal('modal-rank');
    this.switchRankTab(tab);
  }

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
      <div class="rs-item"><span>👥</span><strong>${data.totalPlayers || 0}</strong><small>Chủ tiệm</small></div>
      <div class="rs-item"><span>🏅</span><strong>${me ? `#${me.rank}` : '—'}</strong><small>Hạng của bạn</small></div>
      <div class="rs-item"><span>🏆</span><strong>${me ? `${fmt(me.earnings)} ¥` : '—'}</strong><small>Kỷ lục của bạn</small></div>
      <div class="rs-item"><span>📅</span><strong>${me ? me.daysPlayed || 0 : '—'}</strong><small>Ngày đã bán</small></div>`;
    const cta = !data.loggedIn ? '<div class="rank-cta"><span>🔐 Bạn đang chơi với tư cách khách — đăng nhập để ghi tên lên bảng!</span><a href="index.html">Đăng nhập</a></div>' : '';
    const top = Array.isArray(data.top) ? data.top : [];
    if (!top.length) {
      list.innerHTML = cta + '<div class="rank-empty">🏪 Chưa có ai trên bảng xếp hạng.<br>Hoàn thành 1 ngày bán hàng để là người đầu tiên!</div>';
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
        <span>🧺 ${r.served}/${r.total}${r.lost ? ` · 😠 ${r.lost}` : ''}</span>
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
    this.setText('rank-note', this.cloud.loggedIn
      ? '☁️ Các ngày bán đã lưu trong tài khoản · Xếp theo doanh thu trong ngày'
      : 'Đang lưu trên máy này · Đăng nhập để lưu vào tài khoản và lên bảng xếp hạng');
    const recs = [...src].filter(r => r && Number.isFinite(Number(r.earnings))).sort((a, b) => b.earnings - a.earnings);
    if (summary) {
      const totalEarn = recs.reduce((s, r) => s + Number(r.earnings), 0);
      const served = recs.reduce((s, r) => s + (r.served || 0), 0);
      const stars = recs.reduce((s, r) => s + (r.stars || 0), 0);
      summary.innerHTML = `
        <div class="rs-item"><span>📅</span><strong>${recs.length}</strong><small>Ngày đã bán</small></div>
        <div class="rs-item"><span>🧺</span><strong>${served}</strong><small>Khách đã phục vụ</small></div>
        <div class="rs-item"><span>🪙</span><strong>${fmt(totalEarn)} ¥</strong><small>Tổng doanh thu</small></div>
        <div class="rs-item"><span>⭐</span><strong>${stars}</strong><small>Tổng sao</small></div>`;
    }
    if (!list) return;
    if (!recs.length) {
      list.innerHTML = '<div class="rank-empty">🏪 Chưa có ngày bán nào.<br>Hoàn thành ngày đầu tiên để ghi kỷ lục!</div>';
      return;
    }
    const medals = ['🥇', '🥈', '🥉'];
    list.innerHTML = recs.slice(0, 15).map((r, i) => `
      <div class="rank-row ${i < 3 ? 'top' : ''}">
        <span class="rr-pos">${medals[i] || i + 1}</span>
        <span class="rr-name"><b class="zh">第${r.day}天</b><small>${escapeHtml(r.date || '')}</small></span>
        <span class="rr-earn">${fmt(r.earnings)} ¥</span>
        <span>🧺 ${r.served}/${r.total}${r.lost ? ` · 😠 ${r.lost}` : ''}</span>
        <span class="rr-avg">${r.served > 0 ? `${r.avg}%` : '—'}</span>
        <span class="rr-stars">${'⭐'.repeat(r.stars || 0)}${'☆'.repeat(3 - (r.stars || 0))}</span>
      </div>`).join('');
  }
}

// Khởi tạo (module: DOM đã sẵn sàng; script thường ở cuối body cũng vậy)
(function bootGrocery() {
  const start = () => { if (!window.groceryGame) window.groceryGame = new GroceryGame(); };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
