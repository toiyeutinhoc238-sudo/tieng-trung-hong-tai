import './shop_engine.css';
import D from './shop_data/clothes.js';
import { mountShop } from './shop_engine.js';
import { clothesMode } from './shop_modes.js';

const mode = clothesMode(D);
mountShop({
  key: 'clothes', title: 'Tiệm Quần Áo Của Tôi', chn: '我的服装店', pin: 'Wǒ de fúzhuāng diàn', emoji: '👗',
  prepIcon: '🛍️', prepZh: '选衣', prepVi: 'Chọn đồ', startMoney: 120, dayMs: 170000, tip: 4, starBonus: 30,
  goal: (day) => 220 + 50 * (day - 1),
  chat: D.dialogue.filter((d) => d.stage !== 'Đổi trả').map((d) => ({ zh: d.zh, pin: d.pin, vi: d.vi })),
  reviews: D.reviews,
  guideHtml: `<ul>
    <li>🛎️ <b>Đón khách:</b> nghe (hoặc đọc) lời khách gọi — khách nói tên món, <b>màu</b> và <b>size</b>.</li>
    <li>🛍️ <b>Chọn đồ:</b> chọn đúng sản phẩm, đúng size, đúng màu rồi bấm “Thêm vào túi”. Mỗi mẫu chỉ có một số size / màu nhất định. Chọn sai sẽ bị trừ điểm.</li>
    <li>💬 <b>Thanh toán:</b> đóng vai chủ tiệm, chọn câu tiếng Trung đúng để báo tiền và nhận thanh toán.</li>
    <li>📦 <b>Nhập hàng:</b> dùng tiền mở khu mới (Quần, Váy, Giày dép) và các mẫu mới.</li>
    <li>🏆 Mỗi ngày bán được ghi lên bảng xếp hạng (đăng nhập để lưu).</li></ul>`
}, mode);
