import './shop_engine.css';
import D from './shop_data/clothes.js';
import { mountShop } from './shop_engine.js';
import { clothesMode } from './shop_modes.js';

const mode = clothesMode(D);
mountShop({
  key: 'clothes', title: 'Tiệm Quần Áo Của Tôi', chn: '我的服装店', pin: 'Wǒ de fúzhuāng diàn', emoji: '👗',
  prepIcon: '🛍️', prepZh: '选衣', prepVi: 'Chọn đồ', startMoney: 200, dayMs: 300000, tip: 4, starBonus: 30, starter: 3, maxStock: 8, costRate: 0.55, pace: 1, upgradeScale: 1.3, restockGoal: 5,
  goal: (day) => 150 + 40 * (day - 1),
  chat: D.dialogue.filter((d) => d.stage !== 'Đổi trả').map((d) => ({ zh: d.zh, pin: d.pin, vi: d.vi })),
  reviews: D.reviews,
  guideHtml: `<ul>
    <li>🛎️ <b>Đón khách:</b> nghe (hoặc đọc) lời khách gọi — khách nói tên món, <b>màu</b> và <b>size</b>.</li>
    <li>🛍️ <b>Chọn đồ:</b> chọn đúng sản phẩm, đúng size, đúng màu rồi bấm “Thêm vào túi”. Mỗi mẫu chỉ có một số size / màu nhất định. Chọn sai sẽ bị trừ điểm.</li>
    <li>💬 <b>Thanh toán:</b> đóng vai chủ tiệm, chọn câu tiếng Trung đúng để báo tiền và nhận thanh toán.</li>
    <li>📦 <b>Nhập hàng trước, bán sau:</b> đầu mỗi ngày xem <b>dự báo thời tiết</b> (trời đẹp khách đông, mưa bão khách thưa), bấm “Nhập hàng” để bổ sung kho rồi mới “Mở cửa”. Hết hàng thì khách ra về tay không.</li>
    <li>🔧 <b>Nâng cấp &amp; mở rộng:</b> ở chợ nhập hàng, dùng tiền mở khu Quần, Váy, Giày dép và các mẫu mới và nâng cấp biển hiệu, ghế chờ, giờ mở cửa.</li>
    <li>💬 <b>Feedback:</b> mỗi khách để lại một lời đánh giá bằng tiếng Trung; cuối ngày xem lại cả lãi / lỗ.</li>
    <li>🏆 Mỗi ngày bán được ghi lên bảng xếp hạng (đăng nhập để lưu).</li></ul>`
}, mode);
