import './shop_engine.css';
import D from './shop_data/cavien.js';
import { mountShop, buildGuide } from './shop_engine.js';
import { cavienMode } from './shop_modes.js';

const mode = cavienMode(D);
mountShop({
  key: 'cavien', title: 'Quầy Cá Viên Chiên Của Tôi', chn: '我的鱼丸店', pin: 'Wǒ de yúwán diàn', emoji: '🍢',
  prepIcon: '🍤', prepZh: '炸串', prepVi: 'Chiên & gói', startMoney: 110, dayMs: 300000, tip: 2, starBonus: 15, starter: 10, maxStock: 24, costRate: 0.45, pace: 1.25, upgradeScale: 0.7, restockGoal: 14,
  goal: (day) => 80 + 15 * (day - 1),
  chat: D.phrases.filter((p) => p.who === 'shop').map((p) => ({ zh: p.zh, pin: p.pin, vi: p.vi })),
  reviews: D.reviews,
  guideSteps: buildGuide({ icon: '🍤', title: 'Chiên & gói · 炸串', text: 'Chọn đúng món và số lượng bằng nút + / − (lượng từ <b>串</b> xiên, <b>根</b> cây, <b>份</b> phần, <b>个</b> cái). Thêm <b>酱料 nước chấm</b> ở tab “Nước chấm”, chọn <b>打包 mang đi</b> hay <b>在这里吃 ăn tại đây</b> và độ chiên giòn hay không cháy.' }, 'khu món nướng · xào, nước uống và các món mới')
}, mode);
