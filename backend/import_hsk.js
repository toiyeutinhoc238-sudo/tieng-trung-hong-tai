import XLSX from 'xlsx';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.json');
const MAP_PATH = path.join(__dirname, 'lessons_mapping.json');
const HSK2_EXTRACTED_PATH = path.join(__dirname, 'hsk2_extracted.json');

const files = [
  { level: 1, filename: 'TỔNG HỢP TỪ VỰNG HSK 1 PHIÊN BẢN 3.0.xlsx' },
  { level: 2, filename: 'TỔNG HỢP TỪ VỰNG HSK 2 PHIÊN BẢN 3.0.xlsx' },
  { level: 3, filename: 'TỔNG HỢP TỪ VỰNG HSK 3 PHIÊN BẢN 3.0.xlsx' }
];

const LESSONS_METADATA = {
  1: {
    1: { title: "Bài 1: Chào hỏi - 你好", desc: "Học cách chào hỏi cơ bản, từ vựng thông dụng và cách nói lời xin lỗi." },
    2: { title: "Bài 2: Cảm ơn - 谢谢你", desc: "Học cách bày tỏ lòng biết ơn, nói lời tạm biệt và các đại từ chỉ bạn bè." },
    3: { title: "Bài 3: Bạn tên là gì? - 你叫什么名字", desc: "Học cách tự giới thiệu bản thân, quốc tịch, tên tuổi và nghề nghiệp." },
    4: { title: "Bài 4: Cô ấy là giáo viên của tôi - 她es我的老师", desc: "Học cách nói về mối quan hệ, nghề nghiệp và giới thiệu người khác." },
    5: { title: "Bài 5: Gia đình tôi có 4 người - 我家有四口人", desc: "Học cách đếm số, giới thiệu các thành viên trong gia đình." },
    6: { title: "Bài 6: Tôi biết nói tiếng Trung - 我会说汉语", desc: "Nói về khả năng, kỹ năng và các ngôn ngữ phổ biến." },
    7: { title: "Bài 7: Hôm nay là thứ mấy? - 今天星期几", desc: "Cách hỏi và trả lời về thời gian, ngày tháng trong tuần." },
    8: { title: "Bài 8: Tôi muốn mua quả táo - 我想买苹果", desc: "Học cách mua sắm, hỏi giá tiền và các loại hoa quả cơ bản." },
    9: { title: "Bài 9: Thời tiết hôm nay thế nào? - 今天天气怎么样", desc: "Mô tả thời tiết, nhiệt độ và các trạng thái tự nhiên." },
    10: { title: "Bài 10: Tôi đang xem phim - 我在看电影", desc: "Diễn tả các hành động đang xảy ra và sở thích giải trí." },
    11: { title: "Bài 11: Thời gian và Công việc - 时间与工作", desc: "Học cách nói về giờ giấc, lịch trình hàng ngày và công việc." },
    12: { title: "Bài 12: Sức khỏe và Cảm xúc - 健康与情感", desc: "Học cách nói về cảm giác cơ thể, tình trạng sức khỏe và cảm xúc." },
    13: { title: "Bài 13: Ăn uống và Nhà hàng - 饮食与餐馆", desc: "Học từ vựng đặt món, ăn uống và giao tiếp tại nhà hàng." },
    14: { title: "Bài 14: Phương tiện giao thông - 交通出行", desc: "Học cách nói về các phương tiện đi lại như tàu hỏa, xe buýt." },
    15: { title: "Bài 15: Du lịch và Trải nghiệm - 旅游与体验", desc: "Học từ vựng về đi du lịch, hỏi đường và trải nghiệm văn hóa." }
  },
  2: {
    1: { title: "Bài 1: Cuộc sống hàng ngày - 日常生活", desc: "Học từ vựng mô tả thói quen sinh hoạt và ăn uống hàng ngày." },
    2: { title: "Bài 2: Thể thao và Sức khỏe - 运动与健康", desc: "Từ vựng các môn thể thao, rèn luyện thân thể và cảm giác cơ thể." },
    3: { title: "Bài 3: Phương tiện giao thông - 交通工具", desc: "Học từ vựng du lịch, các phương tiện đi lại như tàu hỏa, máy bay." },
    4: { title: "Bài 4: Sở thích và giải trí - 兴趣与娱乐", desc: "Thảo luận về âm nhạc, phim ảnh, đọc sách và các hoạt động thư giãn." },
    5: { title: "Bài 5: Gia đình và Bạn bè - 家庭与朋友", desc: "Mô tả các mối quan hệ xã hội, gia đình và bạn bè thân thiết." },
    6: { title: "Bài 6: Mua sắm và Thời trang - 购物与时尚", desc: "Học từ vựng quần áo, màu sắc, giá cả và mua sắm." },
    7: { title: "Bài 7: Trường học và Học tập - 学校与学习", desc: "Mô tả trường lớp, các môn học, thi cử và kết quả học tập." },
    8: { title: "Bài 8: Thời tiết và Bốn mùa - 天气与四季", desc: "Mô tả các mùa trong năm, nhiệt độ và trạng thái thời tiết." },
    9: { title: "Bài 9: Ăn uống và Ẩm thực - 饮食与 ẩm thực", desc: "Thảo luận món ăn yêu thích, các bữa ăn và văn hóa ẩm thực." },
    10: { title: "Bài 10: Công việc và Nghề nghiệp - 工作与职业", desc: "Nói về các nghề nghiệp phổ biến, nơi làm việc và công vụ." },
    11: { title: "Bài 11: Cơ thể và Sức khỏe - 身体与健康", desc: "Nói về các bộ phận cơ thể, triệu chứng ốm đau và khám bệnh." },
    12: { title: "Bài 12: Nhà cửa và Môi trường - 住宅与环境", desc: "Mô tả nhà cửa, phòng ốc và môi trường sống xung quanh." },
    13: { title: "Bài 13: Giao tiếp xã hội - 社交礼仪", desc: "Học cách chào hỏi lịch sự, cảm ơn, xin lỗi và giao tiếp lịch thiệp." },
    14: { title: "Bài 14: Lễ hội và Kỳ nghỉ - 节日与假期", desc: "Nói về các ngày lễ truyền thống, hoạt động vui chơi ngày nghỉ." },
    15: { title: "Bài 15: Kế hoạch tương lai - 计划与未来", desc: "Thảo luận dự định tương lai, ước mơ và kế hoạch cuộc sống." }
  },
  3: {
    1: { title: "Bài 1: Giao tiếp văn phòng - 办公室", desc: "Học từ vựng liên quan đến công việc, đồng nghiệp và công sở." },
    2: { title: "Bài 2: Kỳ nghỉ lý thú - 快乐假期", desc: "Học từ vựng đi du lịch nước ngoài, hỏi đường và trải nghiệm văn hóa." },
    3: { title: "Bài 3: Mua sắm và Ẩm thực - 购物与美食", desc: "Đặt món ăn tại nhà hàng, từ vựng các món ăn Trung Hoa nổi tiếng." },
    4: { title: "Bài 4: Sức khỏe và Thể thao - 健康与运动", desc: "Thảo luận về sức khỏe, các bài tập thể dục và thói quen lành mạnh." },
    5: { title: "Bài 5: Nhà cửa và Cuộc sống - Vị trí & Phòng", desc: "Mô tả cách bày trí phòng ốc, đồ gia dụng và dọn dẹp nhà cửa." },
    6: { title: "Bài 6: Giao thông và Đi lại - Du lịch & Vé", desc: "Từ vựng về phương tiện giao thông công cộng, mua vé và ga tàu." },
    7: { title: "Bài 7: Mối quan hệ và Giao tiếp - Hẹn hò & Gặp gỡ", desc: "Học từ vựng về giao tiếp xã hội, hẹn hò và kết nối bạn bè." },
    8: { title: "Bài 8: Thời tiết và Thiên nhiên - Khí hậu & Địa lý", desc: "Mô tả các hiện tượng thời tiết phức tạp và danh lam thắng cảnh." },
    9: { title: "Bài 9: Sở thích và Nghệ thuật - Âm nhạc & Phim", desc: "Nói về các sở thích cá nhân, nhạc cụ và các loại hình nghệ thuật." },
    10: { title: "Bài 10: Học tập và Ngôn ngữ - Trường học & Sách", desc: "Từ vựng về việc học tiếng Trung, sử dụng từ điển và đọc sách." },
    11: { title: "Bài 11: Công việc và Kinh doanh - Dự án & Họp", desc: "Thảo luận về các cuộc họp công sở, đàm phán và dự án." },
    12: { title: "Bài 12: Mua sắm và Dịch vụ - Giá cả & Thanh toán", desc: "Học từ vựng thanh toán, giao dịch ngân hàng và hoàn trả hàng hóa." },
    13: { title: "Bài 13: Động vật và Môi trường - Thú cưng & Bảo tồn", desc: "Nói về thế giới động vật, thú cưng và các vấn đề bảo vệ môi trường." },
    14: { title: "Bài 14: Lịch sử và Văn hóa - Truyền thống & Di sản", desc: "Học về các ngày lễ hội cổ truyền và nét đẹp văn hóa Trung Hoa." },
    15: { title: "Bài 15: Kế hoạch và Dự định - Tương lai & Ước mơ", desc: "Thảo luận về mục tiêu dài hạn, phỏng vấn xin việc và ước mơ." },
    16: { title: "Bài 16: Cảm xúc và Thái độ - Suy nghĩ & Hành vi", desc: "Bày tỏ cảm xúc vui buồn, sự lo lắng, tự tin và thái độ sống." },
    17: { title: "Bài 17: Khoa học và Công nghệ - Thiết bị & Internet", desc: "Từ vựng về sử dụng điện thoại thông minh, internet và công nghệ." },
    18: { title: "Bài 18: Tổng kết và Ôn tập - HSK 3", desc: "Bài học ôn tập tổng hợp toàn bộ từ vựng cốt lõi của giáo trình HSK 3." }
  }
};

const HSK2_LESSONS_METADATA = {
  1: {
    1: { title: "Bài 1: Chào hỏi - 你好", desc: "Học cách chào hỏi cơ bản, từ vựng thông dụng." },
    2: { title: "Bài 2: Cảm ơn - 谢谢你", desc: "Học cách bày tỏ lòng biết ơn, nói lời tạm biệt." },
    3: { title: "Bài 3: Bạn tên là gì? - 你叫什么名字？", desc: "Học cách tự giới thiệu bản thân, quốc tịch." },
    4: { title: "Bài 4: Cô ấy là giáo viên tiếng Trung của tôi - 她是我的汉语老师", desc: "Học cách giới thiệu người khác, mối quan hệ." },
    5: { title: "Bài 5: Con gái cô ấy năm nay 20 tuổi rồi - 她女儿今年二十岁了", desc: "Học cách hỏi và nói về tuổi tác, con số." },
    6: { title: "Bài 6: Tôi biết nói tiếng Trung - 我会说汉语", desc: "Học cách nói về khả năng và ngôn ngữ." },
    7: { title: "Bài 7: Hôm nay là ngày mấy? - 今天几号", desc: "Học cách nói về ngày tháng, thứ ngày." },
    8: { title: "Bài 8: Tôi muốn uống trà - 我想喝茶", desc: "Học cách hỏi nhu cầu, mua sắm cơ bản." },
    9: { title: "Bài 9: Con trai bạn làm việc ở đâu? - 你儿子在哪儿工作", desc: "Học cách hỏi địa điểm và nói về công việc." },
    10: { title: "Bài 10: Anh ấy sống ở đâu? - 他住哪儿", desc: "Học cách hỏi về nơi cư trú, số điện thoại." },
    11: { title: "Bài 11: Bây giờ là mấy giờ? - 现在几点", desc: "Học cách hỏi giờ và nói về lịch trình." },
    12: { title: "Bài 12: Thời tiết ngày mai thế nào? - 明天天气怎么样", desc: "Học cách mô tả thời tiết và tình trạng sức khỏe." },
    13: { title: "Bài 13: Tôi mua quần áo ở cửa hàng - 我在商店买衣服", desc: "Học cách mô tả hành động xảy ra tại địa điểm." },
    14: { title: "Bài 14: Tôi đang đọc sách - 我在看书呢", desc: "Học cách diễn tả hành động đang tiếp diễn." },
    15: { title: "Bài 15: Tôi đi máy bay đến đây - 我是坐飞机来的", desc: "Học cấu trúc nhấn mạnh cách thức, thời gian." }
  },
  2: {
    1: { title: "Bài 1: Đi du lịch Bắc Kinh vào tháng 9 là tốt nhất - 九月去北京旅游最好", desc: "Nói về sở thích, thời điểm tốt nhất để đi du lịch." },
    2: { title: "Bài 2: Hàng ngày tôi thức dậy lúc 6 giờ - 我每天六点起床", desc: "Nói về thói quen sinh hoạt và sức khỏe." },
    3: { title: "Bài 3: Cái màu đỏ bên trái là của tôi - 左边那个红色的是我的", desc: "Học cách mô tả vị trí và màu sắc đồ vật." },
    4: { title: "Bài 4: Tuy tôi rất thích nó, nhưng... - 虽然我很喜欢 it，但是……", desc: "Diễn đạt mối quan hệ nhượng bộ, lý do mua sắm." },
    5: { title: "Bài 5: Mua cái này đi - 就买这件吧", desc: "Đưa ra gợi ý, bàn bạc lựa chọn khi mua sắm." },
    6: { title: "Bài 6: Sao đột nhiên lại không tìm thấy? - 怎么突然找不到了？", desc: "Mô tả trạng thái đột xuất và khả năng." },
    7: { title: "Bài 7: Nhà bạn có xa công ty không? - 你家离公司远吗？", desc: "Hỏi khoảng cách địa lý và phương tiện đi lại." },
    8: { title: "Bài 8: Để tôi nghĩ lại rồi nói cho bạn biết - 让我想想再告诉你", desc: "Đưa ra lời từ chối khéo léo hoặc trì hoãn trả lời." },
    9: { title: "Bài 9: Ý nghĩa là gì? - 意思是什么？", desc: "Tìm hiểu ý nghĩa từ ngữ, giải thích vấn đề." },
    10: { title: "Bài 10: Anh ấy đã làm giáo viên tiếng Trung được 3 năm rồi - 他都做了三年的汉语老师了", desc: "Diễn tả khoảng thời gian duy trì của hành động." },
    11: { title: "Bài 11: Anh ấy lớn hơn tôi 3 tuổi - 他比我大三岁", desc: "So sánh hơn về chiều cao, độ tuổi và kích thước." },
    12: { title: "Bài 12: Hay là mặc cái này đi - 还是穿这件吧", desc: "Đề nghị lựa chọn giữa hai phương án." },
    13: { title: "Bài 13: Cửa đang mở - 门开着呢", desc: "Mô tả trạng thái tĩnh của đồ vật đang diễn ra." },
    14: { title: "Bài 14: Bạn để cái cốc trên bàn rồi - 你把杯子放在桌子上了", desc: "Học câu chữ 把 cơ bản để chỉ sự dịch chuyển đồ vật." },
    15: { title: "Bài 15: Năm mới sắp đến rồi - 新年就要到了", desc: "Diễn tả hành động sắp xảy ra trong tương lai gần." }
  },
  3: {
    1: { title: "Bài 1: Cuối tuần bạn có dự định gì? - 周末你有什么打算？", desc: "Bàn bạc về dự định và kế hoạch cuối tuần." },
    2: { title: "Bài 2: Khi nào anh ấy quay về? - 他什么时候回来？", desc: "Hỏi và nói về thời gian quay lại của ai đó." },
    3: { title: "Bài 3: Trên bàn có rất nhiều đồ uống - 桌子上放着很多饮料", desc: "Mô tả sự tồn tại của đồ vật ở một vị trí." },
    4: { title: "Bài 4: Cô ấy luôn cười khi nói chuyện với khách hàng - 她总是笑着跟客人说话", desc: "Mô tả hai hành động diễn ra đồng thời." },
    5: { title: "Bài 5: Dạo này tôi càng ngày càng béo ra - 我最近越来越胖了", desc: "Biểu thị sự thay đổi mức độ theo thời gian." },
    6: { title: "Bài 6: Sao bỗng dưng lại không tìm thấy rồi? - 怎么突然找不到了？", desc: "Mô tả tình huống mất mát đồ đạc bất ngờ." },
    7: { title: "Bài 7: Tôi và cô ấy quen nhau 5 năm rồi - 我跟她都认识五年了", desc: "Nói về mối quan hệ lâu năm và khoảng thời gian quen biết." },
    8: { title: "Bài 8: Bạn đi đến đâu tôi đi đến đó - 你去哪儿我就去哪儿", desc: "Sử dụng đại từ nghi vấn chỉ sự bất định." },
    9: { title: "Bài 9: Cô ấy nói tiếng Trung hay như người Trung Quốc vậy - 她的汉语说得跟中国人一样好", desc: "Học cấu trúc so sánh bằng (跟...一样)." },
    10: { title: "Bài 10: Môn Toán khó hơn môn Lịch sử nhiều - 数学比历史难多了", desc: "So sánh mức độ chênh lệch nhiều (cấu trúc 比...难多了)." },
    11: { title: "Bài 11: Đừng quên tắt điều hòa nhé! - 别忘了把空调关了！", desc: "Học cách nhắc nhở sử dụng câu chữ 把 phủ định." },
    12: { title: "Bài 12: Để những đồ quan trọng tại chỗ tôi đi - 把重要的东西放在我这儿吧", desc: "Học cách yêu cầu lưu trữ đồ đạc bằng câu chữ 把." },
    13: { title: "Bài 13: Tôi đi bộ về - 我是走回来的", desc: "Mô tả hướng di chuyển của hành động về phía người nói." },
    14: { title: "Bài 14: Bạn mang trái cây qua đây! - 你把水果拿过来！", desc: "Kết hợp câu chữ 把 và bổ ngữ xu hướng phức hợp." },
    15: { title: "Bài 15: Những câu khác đều không có vấn đề gì - 其他都没什么问题", desc: "Học cách biểu thị sự loại trừ hoặc bao hàm toàn bộ." },
    16: { title: "Bài 16: Bây giờ tôi mệt đến nỗi tan làm chỉ muốn đi ngủ - 我现在累得下了班就想睡觉", desc: "Mô tả bổ ngữ trạng thái chỉ mức độ cực đoan." },
    17: { title: "Bài 17: Ai cũng có cách chữa khỏi \"bệnh\" cho bạn - 谁都有办法看好你的“病”", desc: "Sử dụng đại từ nghi vấn để biểu thị sự phủ định hoặc khẳng định toàn bộ." },
    18: { title: "Bài 18: Tôi tin họ sẽ đồng ý - 我相信他们会同意的", desc: "Bày tỏ niềm tin, sự đồng ý và thuyết phục." },
    19: { title: "Bài 19: Bạn không nhìn ra được à? - 你没看出来吗？", desc: "Sử dụng bổ ngữ khả năng chỉ sự nhận biết (看出来)." },
    20: { title: "Bài 20: Tôi bị anh ấy ảnh hưởng! - 我被他 ảnh hưởng 了！", desc: "Học cấu trúc câu bị động (câu chữ 被) trong tiếng Trung." }
  }
};

// Helper to clean up pinyin by removing starting and trailing slashes
function cleanPinyin(pinyin) {
  if (!pinyin) return '';
  return pinyin.toString().replace(/^\/|\/$/g, '').trim();
}

// Helper to split a list of words into P parts as equal as possible
function splitIntoParts(array, maxChunkSize = 20, minChunkSize = 13) {
  const N = array.length;
  if (N < 26) {
    return [array];
  }
  
  let P = Math.ceil(N / maxChunkSize);
  // Ensure P doesn't create parts smaller than minChunkSize if we can avoid it
  if (P > 1 && Math.floor(N / P) < minChunkSize) {
    if (Math.floor(N / (P - 1)) <= maxChunkSize) {
      P = P - 1;
    }
  }
  
  const result = [];
  const baseSize = Math.floor(N / P);
  const extra = N % P;
  let offset = 0;
  for (let i = 0; i < P; i++) {
    const size = baseSize + (i < extra ? 1 : 0);
    result.push(array.slice(offset, offset + size));
    offset += size;
  }
  return result;
}

async function run() {
  console.log('Starting HSK vocabulary database build...');

  // 1. Read existing database.json to preserve user state and custom words
  let customWords = [];
  const existingStatusMap = new Map(); // key: word_level_version -> { isMemorized, isStarred }

  try {
    const dbContent = await fs.readFile(DB_PATH, 'utf-8');
    const existingList = JSON.parse(dbContent);

    existingList.forEach(item => {
      if (item.isCustom) {
        customWords.push(item);
      } else {
        const ver = item.hskVersion || '3.0';
        const key = `${item.word.trim()}_hsk${item.level}_v${ver}`;
        existingStatusMap.set(key, {
          isMemorized: !!item.isMemorized,
          isStarred: !!item.isStarred
        });
      }
    });
    console.log(`Loaded existing DB. Preserved custom words: ${customWords.length}. Map status count: ${existingStatusMap.size}`);
  } catch (err) {
    console.warn('Could not read existing database.json or it is empty. Starting fresh.', err.message);
  }

  // 2. Load lessons mapping from JSON for HSK 3.0
  let lessonsMapping = {};
  try {
    const mappingData = await fs.readFile(MAP_PATH, 'utf-8');
    lessonsMapping = JSON.parse(mappingData);
    console.log(`Loaded lessons mapping with ${Object.keys(lessonsMapping).length} entries.`);
  } catch (err) {
    console.warn('Could not read lessons_mapping.json. Will default to supplementary lesson grouping.', err.message);
  }

  // Build a fast lookup map for word to { level, lesson } for HSK 3.0
  const wordToPdfMap = new Map();
  for (const [key, lesson] of Object.entries(lessonsMapping)) {
    const match = key.match(/^(.*)_hsk(\d+)$/);
    if (match) {
      const word = match[1].trim();
      const level = parseInt(match[2]);
      wordToPdfMap.set(word, { level, lesson });
    }
  }

  function getPdfLessonInfo(word) {
    if (wordToPdfMap.has(word)) {
      return wordToPdfMap.get(word);
    }
    // Check split parts like "爸爸 | 爸"
    const parts = word.split('|').map(x => x.trim());
    for (const p of parts) {
      if (wordToPdfMap.has(p)) {
        return wordToPdfMap.get(p);
      }
    }
    return null;
  }

  // 3. Parse HSK 3.0 vocabulary from Excel files
  const parsedWords3 = [];

  for (const f of files) {
    const filePath = path.join(__dirname, '..', 'filetuvung', f.filename);
    console.log(`\nParsing HSK 3.0 Level ${f.level} from file: ${f.filename}`);
    try {
      const workbook = XLSX.readFile(filePath);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      let headerIdx = -1;
      for (let i = 0; i < rows.length; i++) {
        if (rows[i] && rows[i][0] === 'STT') {
          headerIdx = i;
          break;
        }
      }

      if (headerIdx === -1) {
        console.error(`Could not find header row (starting with 'STT') in Level ${f.level} file!`);
        continue;
      }

      let lastWord = '';
      let lastPinyin = '';
      let fileItemCount = 0;

      for (let i = headerIdx + 1; i < rows.length; i++) {
        const row = rows[i];
        if (!row || row.length === 0) continue;

        const sttValue = row[0];
        let wordVal = row[1];
        let pinyinVal = row[2];
        const categoryVal = row[3];
        const meaningVal = row[4];
        const exampleZhVal = row[5];
        const exampleViVal = row[7];

        let isSubMeaning = false;
        let isNewWord = false;

        if (sttValue && !isNaN(parseInt(sttValue.toString().trim()))) {
          isNewWord = true;
        } else if (!sttValue && (categoryVal || meaningVal)) {
          isSubMeaning = true;
        }

        if (isNewWord) {
          lastWord = (wordVal || '').toString().trim();
          lastPinyin = cleanPinyin(pinyinVal);
          if (!lastWord) continue;
        } else if (isSubMeaning) {
          wordVal = lastWord;
          pinyinVal = lastPinyin;
        } else {
          continue;
        }

        const word = (wordVal || lastWord).toString().trim();
        const pinyin = isSubMeaning ? lastPinyin : cleanPinyin(pinyinVal || lastPinyin);
        const category = (categoryVal || 'Chưa phân loại').toString().trim();
        const meaning = (meaningVal || '').toString().trim();
        const example_zh = (exampleZhVal || '').toString().trim();
        const example_vi = (exampleViVal || '').toString().trim();

        if (!word) continue;

        parsedWords3.push({
          excelLevel: f.level,
          word,
          pinyin,
          meaning,
          category,
          example_zh,
          example_vi
        });

        fileItemCount++;
      }

      console.log(`Successfully parsed ${fileItemCount} items for Level ${f.level}.`);
    } catch (err) {
      console.error(`Error processing Level ${f.level}:`, err);
    }
  }

  // 4. Align level and lesson for HSK 3.0, grouping unmatched words
  const finalList = [];
  let currentId = 1;

  // Separate textbook words by level and PDF lesson
  const textbookGroups3 = { 1: {}, 2: {}, 3: {} };
  const unmatchedByLevel3 = { 1: [], 2: [], 3: [] };

  parsedWords3.forEach(item => {
    const pdfInfo = getPdfLessonInfo(item.word);
    
    if (pdfInfo) {
      const lvl = pdfInfo.level;
      const les = pdfInfo.lesson;
      if (!textbookGroups3[lvl][les]) {
        textbookGroups3[lvl][les] = [];
      }
      textbookGroups3[lvl][les].push(item);
    } else {
      unmatchedByLevel3[item.excelLevel].push(item);
    }
  });

  // Helper to append a word with its lessonId, lessonTitle, and lessonDesc
  function appendWordToList(item, level, lessonId, lessonTitle, lessonDesc, version) {
    const statusKey = `${item.word}_hsk${level}_v${version}`;
    let isMemorized = false;
    let isStarred = false;
    if (existingStatusMap.has(statusKey)) {
      const status = existingStatusMap.get(statusKey);
      isMemorized = status.isMemorized;
      isStarred = status.isStarred;
    }

    const itemObj = {
      id: version === '2.0' ? 50000 + currentId++ : currentId++,
      word: item.word,
      pinyin: item.pinyin,
      meaning: item.meaning,
      level: level,
      hskVersion: version,
      lessonId: lessonId,
      lessonTitle: lessonTitle,
      lessonDesc: lessonDesc,
      category: item.category,
      example_zh: item.example_zh || "",
      example_vi: item.example_vi || "",
      isMemorized,
      isStarred,
      isCustom: false
    };

    finalList.push(itemObj);
  }

  // Process and split textbook lessons for HSK 3.0
  const nextLessonIdForLevel3 = { 1: 1, 2: 1, 3: 1 };

  for (let lvl = 1; lvl <= 3; lvl++) {
    const maxPdfLesson = lvl === 1 ? 15 : (lvl === 2 ? 15 : 18);
    
    for (let les = 1; les <= maxPdfLesson; les++) {
      const words = textbookGroups3[lvl][les] || [];
      if (words.length === 0) continue;
      
      const meta = (LESSONS_METADATA[lvl] && LESSONS_METADATA[lvl][les]) || { title: `Bài ${les}`, desc: `Từ vựng HSK ${lvl} Bài ${les}` };
      
      // Split into parts of 13-20 words
      const parts = splitIntoParts(words, 20, 13);
      
      if (parts.length === 1) {
        const lessonId = nextLessonIdForLevel3[lvl]++;
        parts[0].forEach(item => {
          appendWordToList(item, lvl, lessonId, meta.title, meta.desc, '3.0');
        });
      } else {
        parts.forEach((partWords, pIdx) => {
          const lessonId = nextLessonIdForLevel3[lvl]++;
          const partTitle = `${meta.title} (Phần ${pIdx + 1})`;
          partWords.forEach(item => {
            appendWordToList(item, lvl, lessonId, partTitle, meta.desc, '3.0');
          });
        });
      }
    }
  }

  // Process unmatched words into supplementary lessons for HSK 3.0
  for (let lvl = 1; lvl <= 3; lvl++) {
    const list = unmatchedByLevel3[lvl];
    list.sort((a, b) => a.word.localeCompare(b.word, 'zh'));

    const chunks = splitIntoParts(list, 20, 13);
    chunks.forEach((chunk, chunkIdx) => {
      const lessonId = nextLessonIdForLevel3[lvl]++;
      const partNum = chunkIdx + 1;
      const title = `Từ vựng bổ sung - Phần ${partNum}`;
      const desc = `Ôn tập từ vựng mở rộng của HSK Cấp ${lvl} phần ${partNum}.`;
      
      chunk.forEach(item => {
        appendWordToList(item, lvl, lessonId, title, desc, '3.0');
      });
    });
    console.log(`HSK 3.0 Level ${lvl}: Populated lessons up to Lesson ${nextLessonIdForLevel3[lvl] - 1}.`);
  }

  const hsk3Count = finalList.length;
  console.log(`Successfully processed HSK 3.0: ${hsk3Count} items.`);

  // Reset ID counter for HSK 2.0 to offset them cleanly starting at 50000 + 1
  currentId = 1;

  // 5. Parse and merge HSK 2.0 vocabulary from hsk2_extracted.json
  try {
    const hsk2Content = await fs.readFile(HSK2_EXTRACTED_PATH, 'utf-8');
    const hsk2Data = JSON.parse(hsk2Content);

    for (let lvl = 1; lvl <= 3; lvl++) {
      const lvlWords = hsk2Data[lvl.toString()] || [];
      console.log(`\nProcessing HSK 2.0 Level ${lvl}: ${lvlWords.length} words.`);

      // Group words by lesson
      const lessonGroups = {};
      lvlWords.forEach(w => {
        const les = parseInt(w.lesson) || 99; // 99 for supplementary/unmatched
        if (!lessonGroups[les]) lessonGroups[les] = [];
        lessonGroups[les].push(w);
      });

      // Sort lesson keys
      const lessons = Object.keys(lessonGroups).map(Number).sort((a, b) => a - b);

      lessons.forEach(les => {
        const words = lessonGroups[les];
        const meta = (HSK2_LESSONS_METADATA[lvl] && HSK2_LESSONS_METADATA[lvl][les]) || {
          title: les === 99 ? "Từ vựng bổ sung" : `Bài ${les}`,
          desc: les === 99 ? "Từ vựng bổ sung HSK 2.0" : `Từ vựng HSK 2.0 Cấp ${lvl} Bài ${les}`
        };

        // Split lessons that are too large (just like in HSK 3.0)
        const parts = splitIntoParts(words, 20, 13);

        if (parts.length === 1) {
          parts[0].forEach(item => {
            appendWordToList(item, lvl, les, meta.title, meta.desc, '2.0');
          });
        } else {
          parts.forEach((partWords, pIdx) => {
            const partTitle = `${meta.title} (Phần ${pIdx + 1})`;
            partWords.forEach(item => {
              appendWordToList(item, lvl, les, partTitle, meta.desc, '2.0');
            });
          });
        }
      });
    }
  } catch (err) {
    console.error('Error importing HSK 2.0 data:', err.message);
  }

  const totalBuiltInCount = finalList.length;
  console.log(`\nTotal built-in items (HSK 3.0 + HSK 2.0): ${totalBuiltInCount}`);
  console.log(`HSK 2.0 total words: ${totalBuiltInCount - hsk3Count}`);

  // 6. Append custom words at the end of database list with updated IDs (>= 100000)
  let customId = 100000;
  customWords.forEach(customItem => {
    finalList.push({
      ...customItem,
      id: customId++
    });
  });
  console.log(`Appended custom words: ${customWords.length}`);

  // 7. Write back to database.json
  try {
    await fs.writeFile(DB_PATH, JSON.stringify(finalList, null, 2), 'utf-8');
    console.log(`\nSuccessfully wrote ${finalList.length} total items to database.json!`);
  } catch (err) {
    console.error('Failed to save imported vocabulary list to database.json:', err);
  }
}

run();
