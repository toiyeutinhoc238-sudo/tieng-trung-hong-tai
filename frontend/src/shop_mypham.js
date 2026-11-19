import './shop_engine.css';
import D from './shop_data/mypham.js';
import { mountShop, buildGuide } from './shop_engine.js';
import { mayphamMode } from './shop_modes.js';

const mode = mayphamMode(D);
mountShop({
  key: 'mypham', title: 'Tiệm Mỹ Phẩm Của Tôi', chn: '我的化妆品店', pin: 'Wǒ de huàzhuāngpǐn diàn', emoji: '💄',
  prepIcon: '🧴', prepZh: '选货', prepVi: 'Chọn sản phẩm', startMoney: 300, dayMs: 300000, tip: 6, starBonus: 40, starter: 3, maxStock: 8, costRate: 0.55, pace: 1.1, upgradeScale: 2, restockGoal: 5,
  goal: (day) => 260 + 50 * (day - 1),
  chat: D.phrases.filter((p) => p.who === 'shop').map((p) => ({ zh: p.zh, pin: p.pin, vi: p.vi })),
  reviews: D.reviews,
  guideSteps: buildGuide({ icon: '🧴', title: 'Chọn sản phẩm · 选货', text: 'Hàng chia 5 nhóm: chăm sóc da, trang điểm, chống nắng, tóc &amp; cơ thể, dụng cụ. Nghe kỹ tên sản phẩm và <b>lượng từ</b> (<b>瓶</b> chai, <b>支</b> thỏi / tuýp, <b>罐</b> hũ, <b>盒</b> hộp, <b>个</b> cái), bấm + / − chọn đúng số lượng. Chạm vào món để nghe phát âm.' }, 'nhóm hàng trang điểm, chống nắng, tóc &amp; cơ thể, dụng cụ')
}, mode);
