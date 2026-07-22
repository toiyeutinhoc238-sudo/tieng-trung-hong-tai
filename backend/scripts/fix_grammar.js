import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.join(__dirname, '..', 'database.json');

const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

// ============================================================
// Danh sách sửa lỗi - đã kiểm chứng từ nguồn uy tín
// Nguồn: chinesepod.com, elon.io, fluentide.com, hanzii.net,
//        stackexchange.com, yellowbridge.com, vdict.com
// ============================================================

const fixes = [
  // ─────────────────────────────────────────────────
  // 🔴 LỖI NGHIÊM TRỌNG: Dịch sai hoàn toàn / sai đại từ
  // ─────────────────────────────────────────────────

  // ID 246 | 了 (liǎo) | 这件事我忘不了
  // 忘不了 (wàng bù liǎo) = cannot forget [Nguồn: chinesepod.com, elon.io]
  {
    id: 246,
    field: 'example_vi',
    from: 'Tôi hiểu rồi.',
    to: 'Chuyện này tôi không thể quên được.'
  },

  // ID 281 | 它们 (tāmen) | 它们正在吃东西
  // 它们 = chúng (dùng cho vật/động vật), KHÔNG dùng "Họ" [Nguồn: vdict.com, ling-app.com]
  {
    id: 281,
    field: 'example_vi',
    from: 'Họ đang ăn.',
    to: 'Chúng đang ăn đồ ăn.'
  },

  // ID 404 | 饭馆 (fànguǎn) | 这家饭馆的菜很好吃
  // Câu VI hoàn toàn không khớp câu CN
  {
    id: 404,
    field: 'example_vi',
    from: 'Tôi đã tìm thấy một nơi tuyệt đẹp.',
    to: 'Đồ ăn của quán cơm này rất ngon.'
  },

  // ID 497 | 发现 (fāxiàn) | 我发现了一个很美的地方
  // CN nói về "nơi đẹp", VI dịch thành "anh ấy không có ở nhà"
  {
    id: 497,
    field: 'example_vi',
    from: 'Tôi phát hiện anh ấy không có ở nhà.',
    to: 'Tôi phát hiện ra một nơi rất đẹp.'
  },

  // ID 730 | 别人 (biérén) | 这本书可能是别人的
  // CN chỉ nói về sách, VI hoàn toàn sai
  {
    id: 730,
    field: 'example_vi',
    from: 'Ngoại trừ Tiểu Lệ ra, những người khác đều không muốn đi.',
    to: 'Cuốn sách này có thể là của người khác.'
  },

  // ID 955 | 汽车 (qìchē) | 这辆汽车是我爸爸的
  // 这辆 = chiếc này (số ít), dịch thành "hai chiếc" là sai
  {
    id: 955,
    field: 'example_vi',
    from: 'Hai chiếc ô tô này là của bố tôi.',
    to: 'Chiếc ô tô này là của bố tôi.'
  },

  // ID 1004 | 不如 (bùrú) | 我的中文不如他的好
  // 我的中文不如他的好 = Tiếng Trung của TÔI không bằng của ANH ẤY
  {
    id: 1004,
    field: 'example_vi',
    from: 'Tiếng Trung của anh ấy không giỏi bằng tôi.',
    to: 'Tiếng Trung của tôi không giỏi bằng anh ấy.'
  },

  // ID 1054 | 东北 (dōngběi) | 他们都是东北人
  // Thiếu "là" trong câu dịch
  {
    id: 1054,
    field: 'example_vi',
    from: 'Họ đều người Đông Bắc.',
    to: 'Họ đều là người miền Đông Bắc.'
  },

  // ID 1309 | 西医 (xīyī) | 他是西医
  // 西医 = bác sĩ Tây y (phân biệt với 中医 = Đông y)
  {
    id: 1309,
    field: 'example_vi',
    from: 'Anh ấy là bác sĩ.',
    to: 'Anh ấy là bác sĩ Tây y.'
  },

  // ID 1482 | 才能 (cáinéng) | 她有音乐方面的才能
  // 她 = cô ấy, dịch nhầm thành "anh ấy"
  {
    id: 1482,
    field: 'example_vi',
    from: 'Anh ấy có tài năng âm nhạc.',
    to: 'Cô ấy có tài năng về âm nhạc.'
  },

  // ID 1493 | 吵 (chǎo) | 你们吵得我头疼了
  // 你们 = các bạn, không phải "họ"
  {
    id: 1493,
    field: 'example_vi',
    from: 'Họ đang cãi nhau, tôi không muốn nghe.',
    to: 'Các bạn cãi nhau làm tôi đau đầu rồi.'
  },

  // ID 1569 | 对待 (duìdài) | 她总是友好地对待别人
  // Dịch sai hoàn toàn, chủ từ là 她 (cô ấy), không phải thầy giáo
  {
    id: 1569,
    field: 'example_vi',
    from: 'Thầy giáo đối xử công bằng với mỗi học sinh.',
    to: 'Cô ấy luôn luôn đối xử thân thiện với người khác.'
  },

  // ID 1571 | 对手 (duìshǒu) | 他是我踢足球比赛中的强大对手
  // 踢足球 = đá bóng, không phải bóng rổ
  {
    id: 1571,
    field: 'example_vi',
    from: 'Trong trận đấu bóng rổ, anh ấy là đối thủ mạnh nhất của tôi.',
    to: 'Trong trận đấu bóng đá, anh ấy là đối thủ mạnh của tôi.'
  },

  // ID 1579 | 发送 (fāsòng) | 我已经发送电子邮件给他了
  // Câu CN là "Tôi đã gửi", VI dịch thành "Vui lòng gửi"
  {
    id: 1579,
    field: 'example_vi',
    from: 'Vui lòng gửi bức thư này đi.',
    to: 'Tôi đã gửi email cho anh ấy rồi.'
  },

  // ID 1688 | 气候 (qìhòu) | 北京的气候和上海不一样
  // 不一样 = khác nhau [Nguồn: elon.io, fluentide.com]
  // Dịch thành "giống nhau" là SAI NGƯỢC NGHĨA
  {
    id: 1688,
    field: 'example_vi',
    from: 'Khí hậu ở Bắc Kinh và Thượng hải thì giống nhau.',
    to: 'Khí hậu ở Bắc Kinh và Thượng Hải thì khác nhau.'
  },

  // ID 1819 | 利用 (lìyòng) | 我利用休息时间去旅游
  // Chủ từ là 我 (tôi), dịch thành "Cô ấy"
  {
    id: 1819,
    field: 'example_vi',
    from: 'Cô ấy tận dụng thời gian nghỉ ngơi đi du lịch.',
    to: 'Tôi tận dụng thời gian nghỉ để đi du lịch.'
  },

  // ID 1821 | 连忙 (liánmáng) | 听到声音，她连忙跑出去
  // 她 = cô ấy, dịch nhầm thành "anh ấy"
  {
    id: 1821,
    field: 'example_vi',
    from: 'Anh ấy nghe thấy tiếng động liền chạy ra.',
    to: 'Cô ấy nghe thấy tiếng động liền vội vàng chạy ra ngoài.'
  },

  // ID 1832 | 另一方面 | 她很聪明，另一方面也很努力
  // 她 = cô ấy, dịch nhầm thành "anh ấy"
  {
    id: 1832,
    field: 'example_vi',
    from: 'Anh ấy thông minh, mặt khác cũng rất chăm chỉ.',
    to: 'Cô ấy thông minh, mặt khác cũng rất chăm chỉ.'
  },

  // ID 1894 | 配合 (pèihé) | 这个病人一点儿也不配合医生！
  // Dịch sai hoàn toàn
  {
    id: 1894,
    field: 'example_vi',
    from: 'Cảm ơn sự phối hợp và ủng hộ của mọi người.',
    to: 'Bệnh nhân này hoàn toàn không hợp tác với bác sĩ!'
  },

  // ID 1908 | 气候 (qìhòu) - entry thứ 2 | 北京的气候和上海不一样
  // Trùng lỗi ID 1688: 不一样 = khác nhau
  {
    id: 1908,
    field: 'example_vi',
    from: 'Khí hậu ở Bắc Kinh và Thượng hải thì giống nhau',
    to: 'Khí hậu ở Bắc Kinh và Thượng Hải thì khác nhau.'
  },

  // ID 2068 | 提前 (tíqián) | 会议提前十分钟结束
  // CN nói "cuộc họp kết thúc sớm 10 phút", VI dịch về "đặt lịch hẹn trước hai ngày"
  {
    id: 2068,
    field: 'example_vi',
    from: 'Xin hãy đặt lịch hẹn trước hai ngày.',
    to: 'Cuộc họp kết thúc sớm hơn mười phút.'
  },

  // ID 2128 | 武器 (wŭqì) | 知识是你最有力的武器
  // Dịch sai hoàn toàn
  {
    id: 2128,
    field: 'example_vi',
    from: 'Họ đã mang theo vũ khí.',
    to: 'Kiến thức là vũ khí mạnh nhất của bạn.'
  },

  // ID 2171 | 性(积极性) | 学生们学习很有积极性
  // Dịch sai hoàn toàn
  {
    id: 2171,
    field: 'example_vi',
    from: 'Việc này mang tính nguy hiểm nhất định.',
    to: 'Học sinh học tập rất tích cực.'
  },

  // ID 2173 | 性格 (xìnggé) | 他的性格非常开朗
  // VI bị hoán đổi sang ví dụ của từ khác
  {
    id: 2173,
    field: 'example_vi',
    from: 'Học sinh học tập rất tích cực.',
    to: 'Tính cách của anh ấy rất cởi mở/vui vẻ.'
  },

  // ─────────────────────────────────────────────────
  // 🟡 LỖI VỪA: Dịch không chính xác / Thiếu ý
  // ─────────────────────────────────────────────────

  // ID 184 | 那些 (nàxiē) | 那些书都送给你吧
  // 那些 = những cái ĐÓ (chỉ xa), dịch thành "này" là sai
  {
    id: 184,
    field: 'example_vi',
    from: 'Những cuốn sách này đều cho cậu.',
    to: 'Những cuốn sách đó đều tặng cho cậu nhé.'
  },

  // ID 362 | 面 (miàn) | 她有一面镜子
  // 她 = cô ấy, dịch nhầm thành "Anh ấy"
  {
    id: 362,
    field: 'example_vi',
    from: 'Anh ấy có một cái gương.',
    to: 'Cô ấy có một cái gương.'
  },

  // ID 640 | 斤 (jīn) | 我买了两斤苹果
  // 两斤 = hai cân, dịch thành "một cân" là sai
  {
    id: 640,
    field: 'example_vi',
    from: 'Tôi mua một cân táo.',
    to: 'Tôi mua hai cân táo.'
  },

  // ID 881 | 起 (qǐ) | 今天睡到上午10点才起
  // "Nay" không tự nhiên
  {
    id: 881,
    field: 'example_vi',
    from: 'Nay ngủ đến 10 giờ mới dậy.',
    to: 'Hôm nay ngủ đến 10 giờ sáng mới dậy.'
  },

  // ID 919 | 出 (chū) | 他出去买东西了
  // 东西 = đồ vật nói chung, không phải "đồ ăn"
  {
    id: 919,
    field: 'example_vi',
    from: 'Anh ấy ra ngoài mua đồ ăn rồi.',
    to: 'Anh ấy ra ngoài mua đồ rồi.'
  },

  // ID 921 | 打球 (dǎqiú) | 他们很喜欢打球
  // 他们 = họ (số nhiều), dịch thành "cậu ấy" (số ít) là sai
  {
    id: 921,
    field: 'example_vi',
    from: 'Cậu ấy thích chơi bóng rổ.',
    to: 'Họ rất thích chơi bóng.'
  },

  // ID 983 | 知识 (zhīshi) | 学习知识很重要
  // Thiếu dịch "知识" = kiến thức
  {
    id: 983,
    field: 'example_vi',
    from: 'Việc học rất quan trọng.',
    to: 'Việc học kiến thức rất quan trọng.'
  },

  // ID 1041 | 当时 (dāngshí) | 当时我也没想那么多
  // Lỗi chính tả: "Lức" -> "Lúc"
  {
    id: 1041,
    field: 'example_vi',
    from: 'Lức đó, tôi cũng không có nghĩ nhiều đến vậy.',
    to: 'Lúc đó, tôi cũng không nghĩ nhiều đến vậy.'
  },

  // ID 1897 | 皮 (pí) | 包子的皮很薄
  // Lỗi chính tả: "báo" -> "bao"
  {
    id: 1897,
    field: 'example_vi',
    from: 'Vỏ bánh báo rất mỏng.',
    to: 'Vỏ bánh bao rất mỏng.'
  },

  // ID 2082 | 通常 (tōngcháng) | 我通常七点起床
  // Lỗi chính tả: "Thông thườnh" -> "Thông thường"
  {
    id: 2082,
    field: 'example_vi',
    from: 'Thông thườnh, tôi dậy lúc 7 giờ.',
    to: 'Thông thường, tôi dậy lúc 7 giờ.'
  },

  // ─────────────────────────────────────────────────
  // 🟢 LỖI CẤU TRÚC: Câu CN sai ngữ pháp / chữ Hán sai
  // ─────────────────────────────────────────────────

  // ID 1101 | 黄 (huáng) | 她穿了一条黄色的群子
  // 群子 sai chữ Hán → 裙子
  {
    id: 1101,
    field: 'example_zh',
    from: '她穿了一条黄色的群子。',
    to: '她穿了一条黄色的裙子。'
  },

  // ID 2033 | 首都 (shǒudū) | 河内是首都的越南
  // "的" bị đặt sai vị trí - sai ngữ pháp CN
  {
    id: 2033,
    field: 'example_zh',
    from: '河内是首都的越南。',
    to: '河内是越南的首都。'
  },

  // ID 2236 | 杂志 (zázhì) | Câu CN bị dán nhầm từ từ khác
  {
    id: 2236,
    field: 'example_zh',
    from: '航空运输的速度最快。',
    to: '我喜欢看时尚杂志。'
  },
  {
    id: 2236,
    field: 'example_vi',
    from: 'Tôi thích đọc tạp chí thời trang.',
    to: 'Tôi thích đọc tạp chí thời trang.'
  },

  // ID 1853 | 美元 (měiyuán) | Dấu chấm đôi "。。"
  {
    id: 1853,
    field: 'example_zh',
    from: '他换了一百美元的现金。。',
    to: '他换了一百美元的现金。'
  },
];

// Thực hiện sửa lỗi
let fixedCount = 0;
let notFoundCount = 0;
const notFound = [];

for (const fix of fixes) {
  const entry = db.find(e => e.id === fix.id);
  if (!entry) {
    notFoundCount++;
    notFound.push(fix.id);
    continue;
  }

  const currentValue = entry[fix.field];
  if (currentValue === fix.from) {
    entry[fix.field] = fix.to;
    fixedCount++;
    console.log(`✅ Fixed ID ${fix.id} [${fix.field}]`);
    console.log(`   FROM: ${fix.from}`);
    console.log(`   TO:   ${fix.to}`);
    console.log('');
  } else if (currentValue === fix.to) {
    console.log(`⏭️  ID ${fix.id} [${fix.field}] - already correct, skipping`);
  } else {
    console.log(`⚠️  ID ${fix.id} [${fix.field}] - value does not match expected`);
    console.log(`   Expected: "${fix.from}"`);
    console.log(`   Actual:   "${currentValue}"`);
    notFoundCount++;
    notFound.push(`${fix.id} (value mismatch)`);
  }
}

// Ghi lại file
fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');

console.log('\n========================================');
console.log(`✅ Đã sửa: ${fixedCount} lỗi`);
console.log(`⚠️  Không tìm thấy / không khớp: ${notFoundCount}`);
if (notFound.length > 0) {
  console.log(`   IDs: ${notFound.join(', ')}`);
}
console.log('========================================');
