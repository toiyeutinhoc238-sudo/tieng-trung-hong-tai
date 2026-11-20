import './shop_engine.css';
import D from './shop_data/stationery.js';
import { mountShop, buildGuide } from './shop_engine.js';
import { stationeryMode } from './shop_stationery_mode.js';

const mode = stationeryMode(D);
const guide = buildGuide({ icon: '🛒', title: 'Chọn hàng · 选商品', text: 'Nghe khách gọi: <b>sản phẩm</b>, <b>màu</b> và <b>số lượng</b> (本 quyển, 支 cây, 把 cái, 个 cái…). Chọn nhóm ở cột trái, chạm sản phẩm, chọn màu ở bảng “Chọn màu” rồi bấm ＋. Giỏ hàng phải khớp đơn (có dấu ✔) rồi bấm <b>去结账</b>.' }, 'nhóm hàng Dụng cụ, Cặp & hộp bút, Mỹ thuật, Sản phẩm khác và các mẫu mới');
guide.splice(5, 0, { icon: '📠', title: 'Quét mã & đóng gói · 扫码与打包', text: 'Giỏ đúng rồi thì đưa từng món qua <b>máy quét</b> (bấm vào món). Đôi khi có món thừa trên băng chuyền — bỏ ra! Quét đủ thì bấm <b>打包</b> để cho vào túi, rồi mới tới thanh toán.' });
mountShop({
  key: 'stationery', title: 'Cửa Hàng Văn Phòng Phẩm Của Tôi', chn: '我的文具店', pin: 'Wǒ de wénjù diàn', emoji: '✏️',
  prepIcon: '🛒', prepZh: '选商品', prepVi: 'Chọn hàng', startMoney: 150, dayMs: 300000, tip: 3, starBonus: 20, starter: 6, maxStock: 20, costRate: 0.55, pace: 1, upgradeScale: 1, restockGoal: 10,
  goal: (day) => 110 + 25 * (day - 1),
  chat: [
    { zh: '你好，欢迎光临！', pin: 'Nǐ hǎo, huānyíng guānglín!', vi: 'Xin chào, hoan nghênh quý khách!' },
    { zh: '请问需要什么？', pin: 'Qǐngwèn xūyào shénme?', vi: 'Xin hỏi bạn cần gì?' },
    { zh: '这个多少钱？', pin: 'Zhège duōshao qián?', vi: 'Cái này bao nhiêu tiền?' },
    { zh: '您要几个？', pin: 'Nín yào jǐ ge?', vi: 'Bạn muốn mấy cái?' },
    { zh: '请稍等。', pin: 'Qǐng shāo děng.', vi: 'Vui lòng chờ một chút.' },
    { zh: '不好意思，这个卖完了。', pin: 'Bù hǎoyìsi, zhège mài wán le.', vi: 'Xin lỗi, món này đã hết hàng.' },
    { zh: '你们有蓝色的笔吗？', pin: 'Nǐmen yǒu lánsè de bǐ ma?', vi: 'Cửa hàng có bút màu xanh không?' },
    { zh: '不客气，欢迎下次再来！', pin: 'Bú kèqi, huānyíng xià cì zài lái!', vi: 'Không có gì, lần sau lại ghé nhé!' }
  ],
  reviews: [
    { stars: 5, zh: '东西都对，服务也很好！', pin: 'Dōngxi dōu duì, fúwù yě hěn hǎo!', vi: 'Hàng đều đúng, phục vụ cũng rất tốt!' },
    { stars: 5, zh: '颜色和数量都没错，谢谢！', pin: 'Yánsè hé shùliàng dōu méi cuò, xièxie!', vi: 'Màu và số lượng đều không sai, cảm ơn!' },
    { stars: 5, zh: '这家文具店真可爱！', pin: 'Zhè jiā wénjù diàn zhēn kě\'ài!', vi: 'Tiệm văn phòng phẩm này dễ thương quá!' },
    { stars: 4, zh: '不错，下次还会来。', pin: 'Búcuò, xià cì hái huì lái.', vi: 'Khá tốt, lần sau tôi sẽ lại đến.' },
    { stars: 4, zh: '东西很齐，就是有点慢。', pin: 'Dōngxi hěn qí, jiùshì yǒudiǎn màn.', vi: 'Hàng đầy đủ, chỉ hơi chậm một chút.' },
    { stars: 3, zh: '还可以，下次再看看。', pin: 'Hái kěyǐ, xià cì zài kànkan.', vi: 'Tạm được, lần sau tôi xem thêm.' },
    { stars: 2, zh: '颜色拿错了，有点失望。', pin: 'Yánsè ná cuò le, yǒudiǎn shīwàng.', vi: 'Lấy nhầm màu rồi, hơi thất vọng.' },
    { stars: 2, zh: '等了好久，笔都没找到。', pin: 'Děng le hǎojiǔ, bǐ dōu méi zhǎodào.', vi: 'Chờ rất lâu mà vẫn chưa tìm thấy bút.' },
    { stars: 1, zh: '少了东西，我很不满意。', pin: 'Shǎo le dōngxi, wǒ hěn bù mǎnyì.', vi: 'Thiếu hàng, tôi rất không hài lòng.' }
  ],
  guideSteps: guide
}, mode);
