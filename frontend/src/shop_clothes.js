import './shop_engine.css';
import D from './shop_data/clothes.js';
import { mountShop, buildGuide } from './shop_engine.js';
import { clothesMode } from './shop_modes.js';

const mode = clothesMode(D);
mountShop({
  key: 'clothes', title: 'Tiệm Quần Áo Của Tôi', chn: '我的服装店', pin: 'Wǒ de fúzhuāng diàn', emoji: '👗',
  prepIcon: '🛍️', prepZh: '选衣', prepVi: 'Chọn đồ', startMoney: 200, dayMs: 300000, tip: 4, starBonus: 30, starter: 3, maxStock: 8, costRate: 0.55, pace: 1, upgradeScale: 1.3, restockGoal: 5,
  goal: (day) => 150 + 40 * (day - 1),
  chat: D.dialogue.filter((d) => d.stage !== 'Đổi trả').map((d) => ({ zh: d.zh, pin: d.pin, vi: d.vi })),
  reviews: D.reviews,
  guideSteps: buildGuide({ icon: '🛍️', title: 'Chọn đồ · 选衣', text: 'Hàng chia 4 khu: <b>上衣 áo</b>, <b>裤子 quần</b>, <b>裙子 váy</b>, <b>鞋子 giày dép</b>. Chọn đúng sản phẩm, đúng <b>size</b> (S M L XL XXL hoặc cỡ giày 35–42) và đúng <b>màu</b> khách nói rồi bấm “Thêm vào túi”. Mỗi mẫu chỉ có một số size và màu nhất định. Chọn sai sẽ bị trừ điểm.' }, 'khu Quần, Váy, Giày dép và các mẫu mới')
}, mode);
