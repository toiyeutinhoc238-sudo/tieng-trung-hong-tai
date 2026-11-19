import './shop_engine.css';
import D from './shop_data/mypham.js';
import { mountShop } from './shop_engine.js';
import { mayphamMode } from './shop_modes.js';

const mode = mayphamMode(D);
mountShop({
  key: 'mypham', title: 'Tiệm Mỹ Phẩm Của Tôi', chn: '我的化妆品店', pin: 'Wǒ de huàzhuāngpǐn diàn', emoji: '💄',
  prepIcon: '🧴', prepZh: '选货', prepVi: 'Chọn sản phẩm', startMoney: 150, dayMs: 170000, tip: 6, starBonus: 40,
  goal: (day) => 380 + 80 * (day - 1),
  chat: D.phrases.filter((p) => p.who === 'shop').map((p) => ({ zh: p.zh, pin: p.pin, vi: p.vi })),
  reviews: D.reviews,
  guideHtml: `<ul>
    <li>🛎️ <b>Đón khách:</b> khách gọi sản phẩm kèm <b>lượng từ</b> đúng (瓶 chai, 支 thỏi / tuýp, 罐 hũ, 盒 hộp…) và số lượng.</li>
    <li>🧴 <b>Chọn sản phẩm:</b> chuyển tab theo nhóm hàng (chăm sóc da, trang điểm, chống nắng…), bấm + / − để chọn đúng số lượng. Chạm vào món để nghe phát âm.</li>
    <li>💬 <b>Thanh toán:</b> chọn câu tiếng Trung đúng để báo tiền và nhận thanh toán.</li>
    <li>📦 <b>Nhập hàng:</b> dùng tiền mở nhóm hàng mới (trang điểm, chống nắng, tóc &amp; cơ thể, dụng cụ).</li>
    <li>🏆 Mỗi ngày bán được ghi lên bảng xếp hạng (đăng nhập để lưu).</li></ul>`
}, mode);
