import './shop_engine.css';
import D from './shop_data/banhmi.js';
import { mountShop, say } from './shop_engine.js';
import { banhmiMode } from './shop_modes.js';

const mode = banhmiMode(D);
const R = (stars, zh, vi) => ({ stars, ...say(zh, vi) });
mountShop({
  key: 'banhmi', title: 'Tiệm Bánh Mì Của Tôi', chn: '我的面包店', pin: 'Wǒ de miànbāo diàn', emoji: '🥖',
  prepIcon: '🥪', prepZh: '做面包', prepVi: 'Làm bánh', startMoney: 100, dayMs: 300000, tip: 2, starBonus: 15, starter: 6, maxStock: 14, costRate: 0.5, pace: 1, upgradeScale: 0.7, restockGoal: 9,
  goal: (day) => 70 + 15 * (day - 1),
  chat: [
    say('欢迎光临！想吃点什么？', 'Chào mừng quý khách! Bạn muốn ăn gì?'),
    say('刚烤好的面包，又脆又香！', 'Bánh mì vừa nướng xong, giòn và thơm lắm!'),
    say('今天的面包卖得特别好。', 'Hôm nay bánh mì bán chạy đặc biệt.'),
    say('请稍等，马上就好。', 'Xin đợi một chút, sắp xong rồi.'),
    say('你要加辣椒酱吗？', 'Bạn có muốn thêm tương ớt không?'),
    say('不要香菜，对吗？', 'Không lấy ngò đúng không?'),
    say('小心，面包很烫。', 'Cẩn thận, bánh mì còn nóng.'),
    say('谢谢，欢迎下次再来！', 'Cảm ơn, hẹn lần sau ghé nhé!')
  ],
  reviews: [
    R(5, '面包很脆，馅料很足！', 'Bánh mì giòn, nhân rất đầy đặn!'), R(5, '老板做得又快又好吃。', 'Chủ quán làm vừa nhanh vừa ngon.'),
    R(5, '正是我要的味道，谢谢！', 'Đúng vị tôi muốn, cảm ơn nhé!'), R(4, '味道不错，就是有点慢。', 'Vị khá ngon, chỉ hơi chậm một chút.'),
    R(4, '面包很好吃，下次还来。', 'Bánh mì rất ngon, lần sau tôi lại đến.'), R(3, '还可以，下次再来看看。', 'Tạm được, lần sau tôi ghé xem thử.'),
    R(2, '少了一样配料，有点失望。', 'Thiếu một loại nhân, hơi thất vọng.'), R(2, '等太久了，面包都凉了。', 'Chờ lâu quá, bánh mì nguội mất rồi.'),
    R(1, '做错了，我要的不是这个。', 'Làm sai rồi, tôi gọi đâu phải món này.')
  ],
  guideHtml: `<ul>
    <li>🛎️ <b>Đón khách:</b> khách gọi một loại bánh (bánh mì, hamburger, sandwich) kèm yêu cầu <b>bỏ</b> (不要) hoặc <b>thêm</b> (多加) topping, đôi khi gọi thêm nước uống.</li>
    <li>🥪 <b>Làm bánh:</b> chọn đúng loại bánh — nhân chuẩn sẽ tự được bật sẵn. Bấm topping để bỏ hoặc thêm cho đúng lời khách, rồi chọn nước uống nếu có.</li>
    <li>💬 <b>Thanh toán:</b> chọn câu tiếng Trung đúng để báo tiền và nhận thanh toán.</li>
    <li>📦 <b>Nhập hàng trước, bán sau:</b> đầu mỗi ngày xem <b>dự báo thời tiết</b> (trời đẹp khách đông, mưa bão khách thưa), bấm “Nhập hàng” để bổ sung kho rồi mới “Mở cửa”. Hết hàng thì khách ra về tay không.</li>
    <li>🔧 <b>Nâng cấp &amp; mở rộng:</b> ở chợ nhập hàng, dùng tiền mở khu Hamburger / Sandwich và các món mới và nâng cấp biển hiệu, ghế chờ, giờ mở cửa.</li>
    <li>💬 <b>Feedback:</b> mỗi khách để lại một lời đánh giá bằng tiếng Trung; cuối ngày xem lại cả lãi / lỗ.</li>
    <li>🏆 Mỗi ngày bán được ghi lên bảng xếp hạng (đăng nhập để lưu).</li></ul>`
}, mode);
