import './shop_engine.css';
import D from './shop_data/cavien.js';
import { mountShop } from './shop_engine.js';
import { cavienMode } from './shop_modes.js';

const mode = cavienMode(D);
mountShop({
  key: 'cavien', title: 'Quầy Cá Viên Chiên Của Tôi', chn: '我的鱼丸店', pin: 'Wǒ de yúwán diàn', emoji: '🍢',
  prepIcon: '🍤', prepZh: '炸串', prepVi: 'Chiên & gói', startMoney: 110, dayMs: 300000, tip: 2, starBonus: 15, starter: 10, maxStock: 24, costRate: 0.45, pace: 1.25, upgradeScale: 0.7, restockGoal: 14,
  goal: (day) => 80 + 15 * (day - 1),
  chat: D.phrases.filter((p) => p.who === 'shop').map((p) => ({ zh: p.zh, pin: p.pin, vi: p.vi })),
  reviews: D.reviews,
  guideHtml: `<ul>
    <li>🛎️ <b>Đón khách:</b> khách gọi món kèm <b>lượng từ</b> (串 xiên, 根 cây, 份 phần, 个 cái…) và số lượng, rồi nước chấm, mang đi hay ăn tại đây, độ chiên.</li>
    <li>🍤 <b>Chiên &amp; gói:</b> chọn đúng món và số lượng bằng nút + / −, thêm nước chấm ở tab “Nước chấm”, chọn mang đi / ăn tại đây và độ chiên.</li>
    <li>💬 <b>Thanh toán:</b> chọn câu tiếng Trung đúng để báo tiền và nhận thanh toán.</li>
    <li>📦 <b>Nhập hàng trước, bán sau:</b> đầu mỗi ngày xem <b>dự báo thời tiết</b> (trời đẹp khách đông, mưa bão khách thưa), bấm “Nhập hàng” để bổ sung kho rồi mới “Mở cửa”. Hết hàng thì khách ra về tay không.</li>
    <li>🔧 <b>Nâng cấp &amp; mở rộng:</b> ở chợ nhập hàng, dùng tiền mở khu món nướng · xào, nước uống và các món mới và nâng cấp biển hiệu, ghế chờ, giờ mở cửa.</li>
    <li>💬 <b>Feedback:</b> mỗi khách để lại một lời đánh giá bằng tiếng Trung; cuối ngày xem lại cả lãi / lỗ.</li>
    <li>🏆 Mỗi ngày bán được ghi lên bảng xếp hạng (đăng nhập để lưu).</li></ul>`
}, mode);
