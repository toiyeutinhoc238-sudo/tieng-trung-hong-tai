import './shop_engine.css';
import D from './shop_data/cavien.js';
import { mountShop } from './shop_engine.js';
import { cavienMode } from './shop_modes.js';

const mode = cavienMode(D);
mountShop({
  key: 'cavien', title: 'Quầy Cá Viên Chiên Của Tôi', chn: '我的鱼丸店', pin: 'Wǒ de yúwán diàn', emoji: '🍢',
  prepIcon: '🍤', prepZh: '炸串', prepVi: 'Chiên & gói', startMoney: 60, dayMs: 170000, tip: 2, starBonus: 15,
  goal: (day) => 100 + 25 * (day - 1),
  chat: D.phrases.filter((p) => p.who === 'shop').map((p) => ({ zh: p.zh, pin: p.pin, vi: p.vi })),
  reviews: D.reviews,
  guideHtml: `<ul>
    <li>🛎️ <b>Đón khách:</b> khách gọi món kèm <b>lượng từ</b> (串 xiên, 根 cây, 份 phần, 个 cái…) và số lượng, rồi nước chấm, mang đi hay ăn tại đây, độ chiên.</li>
    <li>🍤 <b>Chiên &amp; gói:</b> chọn đúng món và số lượng bằng nút + / −, thêm nước chấm ở tab “Nước chấm”, chọn mang đi / ăn tại đây và độ chiên.</li>
    <li>💬 <b>Thanh toán:</b> chọn câu tiếng Trung đúng để báo tiền và nhận thanh toán.</li>
    <li>📦 <b>Nhập hàng:</b> dùng tiền mở khu món nướng · xào, nước uống và các món mới.</li>
    <li>🏆 Mỗi ngày bán được ghi lên bảng xếp hạng (đăng nhập để lưu).</li></ul>`
}, mode);
