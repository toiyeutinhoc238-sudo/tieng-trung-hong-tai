import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../database.json');
const extractedPath = path.join(__dirname, '../yct_extracted.json');

// Official lesson titles from the standard YCT textbooks (Mục lục Giáo trình chuẩn YCT 1 - 4)
const yctOfficialTitles = {
  1: [
    'Bài 1: 你好！ Xin chào!',
    'Bài 2: 你叫什么？ Bạn tên gì?',
    'Bài 3: 他是谁？ Ông ấy là ai?',
    'Bài 4: 我家有四口人。 Nhà mình có bốn người.',
    'Bài 5: 我6岁。 Mình sáu tuổi.',
    'Bài 6: 你的个子真高！ Bạn cao thật đấy!',
    'Bài 7: 这是谁的狗？ Đây là con chó của ai?',
    'Bài 8: 我去商店。 Tôi đi cửa hàng.',
    'Bài 9: 今天星期几？ Hôm nay là thứ mấy?',
    'Bài 10: 现在几点？ Bây giờ là mấy giờ?',
    'Bài 11: 你吃什么？ Bạn ăn gì?',
    'Bài 12: 复习 Ôn tập tổng hợp'
  ],
  2: [
    'Bài 1: 我可以坐这儿吗？ Mình có thể ngồi ở đây được không?',
    'Bài 2: 你早上几点起床？ Buổi sáng cậu thức dậy lúc mấy giờ?',
    'Bài 3: 你的铅笔呢？ Bút chì của chị đâu?',
    'Bài 4: 书包里有两本书。 Trong cặp có hai quyển sách.',
    'Bài 5: 你会不会做饭？ Chị có biết nấu ăn không?',
    'Bài 6: 包子多少钱一个？ Một cái bánh bao có giá bao nhiêu?',
    'Bài 7: 今天比昨天热。 Hôm nay nóng hơn hôm qua.',
    'Bài 8: 马丁比我大三岁。 Martin lớn hơn con ba tuổi.',
    'Bài 9: 你今天做什么了？ Hôm nay con đã làm gì?',
    'Bài 10: 你怎么了？ Con bị sao thế?',
    'Bài 11: 我来北京一年了。 Mình đã đến Bắc Kinh một năm rồi.',
    'Bài 12: 复习 Ôn tập tổng hợp'
  ],
  3: [
    'Bài 1: 我三年级。 Chị học lớp ba.',
    'Bài 2: 你喜欢什么运动？ Bạn thích môn thể thao nào?',
    'Bài 3: 我在画画儿呢。 Tớ đang vẽ tranh.',
    'Bài 4: 喂，您好！ Alô, xin chào!',
    'Bài 5: 再吃几个。 Cháu ăn thêm vài cái đi.',
    'Bài 6: 我能自己穿。 Em tự mặc được.',
    'Bài 7: 生日快乐！ Sinh nhật vui vẻ!',
    'Bài 8: 下雪了。 Tuyết rơi rồi.',
    'Bài 9: 笑一笑！ Cười lên đi!',
    'Bài 10: 谁跑得快？ Ai chạy nhanh?',
    'Bài 11: 妈妈把糖给弟弟了。 Mẹ đưa kẹo cho em (trai) rồi.',
    'Bài 12: 复习 Ôn tập tổng hợp'
  ],
  4: [
    'Bài 1: 我们有一百零八个学生。 Trường bọn mình có 108 học sinh.',
    'Bài 2: 你学汉语多长时间了？ Em học tiếng Trung Quốc bao lâu rồi?',
    'Bài 3: 早上八点半就开门。 Tám giờ rưỡi sáng cửa hàng đã mở cửa.',
    'Bài 4: 我感冒了。 Tôi bị cảm rồi.',
    'Bài 5: 把门关上。 Đóng cửa lại.',
    'Bài 6: 你去过我们的新教室吗？ Bạn đã đến phòng học mới của chúng mình chưa?',
    'Bài 7: 你们每天怎么去学校？ Mỗi ngày các bạn đến trường như thế nào?',
    'Bài 8: 要下雨了。 Trời sắp mưa rồi.',
    'Bài 9: 你是什么时候去的？ Bạn đã đến đó khi nào?',
    'Bài 10: 爸爸为什么不休息？ Vì sao bố không nghỉ ngơi?',
    'Bài 11: 它长得很快。 Nó lớn rất nhanh.',
    'Bài 12: 复习 Ôn tập tổng hợp'
  ]
};

// Word to lesson mappings based on textbook page references & pedagogy
const yctLessonMaps = {
  1: {
    // Bài 1 (14)
    '一': 1, '二': 1, '三': 1, '四': 1, '五': 1, '六': 1, '七': 1, '八': 1, '九': 1, '十': 1, '你': 1, '好': 1, '老师': 1, '再见': 1,
    // Bài 2 (9)
    '不': 2, '高兴': 2, '很': 2, '叫': 2, '吗': 2, '认识': 2, '什么': 2, '她': 2, '我': 2,
    // Bài 3 (7)
    '国': 3, '哪': 3, '人': 3, '谁': 3, '是': 3, '他': 3, '中国人': 3,
    // Bài 4 (12)
    '爸爸': 4, '哥哥': 4, '个': 4, '和': 4, '几': 4, '家': 4, '姐姐': 4, '口': 4, '妈妈': 4, '没有': 4, '妹妹': 4, '有': 4,
    // Bài 5 (3)
    '多大': 5, '岁': 5, '也': 5,
    // Bài 6 (12)
    '鼻子': 6, '长': 6, '大': 6, '的': 6, '耳朵': 6, '高': 6, '个子': 6, '手': 6, '头发': 6, '小': 6, '眼睛': 6, '真': 6,
    // Bài 7 (10)
    '多': 7, '狗': 7, '看': 7, '猫': 7, '那': 7, '那儿': 7, '鸟': 7, '鱼': 7, '这': 7, '这儿': 7,
    // Bài 8 (8)
    '哪儿': 8, '你们': 8, '去': 8, '商店': 8, '我们': 8, '谢谢': 8, '学校': 8, '在': 8,
    // Bài 9 (14)
    '号': 9, '今天': 9, '明天': 9, '生日': 9, '喜欢': 9, '星期': 9, '星期一': 9, '星期二': 9, '星期三': 9, '星期四': 9, '星期五': 9, '星期六': 9, '星期天': 9, '月': 9,
    // Bài 10 (6)
    '点': 10, '分': 10, '见': 10, '太早了': 10, '现在': 10, '早上': 10,
    // Bài 11 (9)
    '爱': 11, '吃': 11, '蛋糕': 11, '喝': 11, '米饭': 11, '面条': 11, '牛奶': 11, '苹果': 11, '水': 11
  },
  2: {
    // Bài 1: 我可以坐这儿吗？ (8 từ - Trang 9)
    '不客气': 1, '不要': 1, '对不起': 1, '可以': 1, '没关系': 1, '请': 1, '说话': 1, '坐': 1,
    // Bài 2: 你早上几点起床？ (7 từ - Trang 14)
    '到': 2, '呢': 2, '起床': 2, '睡觉': 2, '晚上': 2, '要': 2, '早上': 2,
    // Bài 3: 你的铅笔呢？ (10 từ - Trang 19)
    '矮': 3, '床': 3, '电视': 3, '房间': 3, '里(面)': 3, '铅笔': 3, '上(边)': 3, '书包': 3, '椅子': 3, '桌子': 3,
    // Bài 4: 书包里有两本书。 (9 từ - Trang 24)
    '本': 4, '红色': 4, '黄色': 4, '两': 4, '绿色': 4, '名字': 4, '漂亮': 4, '颜色': 4, '只': 4,
    // Bài 5: 你会不会做饭？ (7 từ - Trang 29)
    '包子': 5, '厨师': 5, '好吃': 5, '会': 5, '医生': 5, '真': 5, '做': 5,
    // Bài 6: 包子多少钱一个？ (7 từ - Trang 34)
    '杯': 6, '茶': 6, '多少': 6, '块': 6, '买': 6, '钱': 6, '太贵了！': 6,
    // Bài 7: 今天比昨天热。 (11 từ - Trang 39)
    '北京': 7, '比': 7, '冰水': 7, '好喝': 7, '觉得': 7, '冷': 7, '纽约': 7, '热': 7, '天气': 7, '怎么样': 7, '昨天': 7,
    // Bài 8: 马丁比我大三岁。 (6 từ - Trang 44)
    '弟弟': 8, '妹妹': 8, '朋友': 8, '同学': 8, '学生': 8, '也': 8,
    // Bài 9: 你今天做什么了？ (6 từ - Trang 49)
    '画': 9, '了': 9, '没(有)': 9, '水果': 9, '香蕉': 9, '熊猫': 9,
    // Bài 10: 你怎么了？ (4 từ - Trang 54)
    '脚': 10, '疼': 10, '医院': 10, '怎么了': 10,
    // Bài 11: 我来北京一年了。 (10 từ - Trang 59)
    '打电话': 11, '分钟': 11, '汉语': 11, '来': 11, '零': 11, '年': 11, '玩': 11, '学习': 11, '以前': 11, '用': 11
  },
  3: {
    // Bài 1: 我三年级。 (9 từ - Trang 9)
    '班': 1, '都': 1, '还': 1, '课': 1, '男': 1, '年级': 1, '女': 1, '新': 1, '张': 1,
    // Bài 2: 你喜欢什么运动？ (8 từ - Trang 14)
    '打篮球': 2, '欢迎': 2, '每': 2, '太': 2, '踢足球': 2, '一起': 2, '游泳': 2, '运动': 2,
    // Bài 3: 我在画画儿呢。 (8 từ - Trang 19)
    '唱歌': 3, '奶奶': 3, '跑步': 3, '让': 3, '太阳': 3, '跳舞': 3, '爷爷': 3, '月亮': 3,
    // Bài 4: 喂，您好！ (6 từ - Trang 24)
    '回': 4, '您': 4, '喂': 4, '问': 4, '问题': 4, '找': 4,
    // Bài 5: 再吃几个。 (7 từ - Trang 29)
    '饱': 5, '饿': 5, '饺子': 5, '面条儿': 5, '想': 5, '再': 5, '最': 5,
    // Bài 6: 我能自己穿。 (6 từ - Trang 34)
    '帮': 6, '穿': 6, '能': 6, '鞋': 6, '衣服': 6, '自己': 6,
    // Bài 7: 生日快乐！ (9 từ - Trang 39)
    '吧': 7, '但是': 7, '蛋糕': 7, '给': 7, '花': 7, '快乐': 7, '礼物': 7, '生日': 7, '送': 7,
    // Bài 8: 下雪了。 (7 từ - Trang 44)
    '别': 8, '出': 8, '听': 8, '外面': 8, '下雪': 8, '下雨': 8, '作业': 8,
    // Bài 9: 笑一笑！ (5 từ - Trang 49)
    '到': 9, '丢': 9, '东西': 9, '哭': 9, '笑': 9,
    // Bài 10: 谁跑得快？ (8 từ - Trang 54)
    '得': 10, '第一': 10, '快': 10, '老虎': 10, '胖': 10, '瘦': 10, '些': 10, '知道': 10,
    // Bài 11: 妈妈把糖给弟弟了。 (5 từ - Trang 59)
    '把': 11, '鸡蛋': 11, '水果': 11, '糖': 11, '西瓜': 11
  },
  4: {
    // Bài 1: 我们有一百零八个学生。 (7 từ - Trang 9)
    '百': 1, '零': 1, '千': 1, '电脑': 1, '手机': 1, '上网': 1, '少': 1,
    // Bài 2: 你学汉语多长时间了？ (9 từ - Trang 14)
    '半': 2, '懂': 2, '读': 2, '难': 2, '时间': 2, '题': 2, '小时': 2, '看书': 2, '读不懂': 2,
    // Bài 3: 早上八点半就开门。 (7 từ - Trang 19)
    '杯子': 3, '关': 3, '就': 3, '卖': 3, '门': 3, '完': 3, '中午': 3,
    // Bài 4: 我感冒了。 (10 từ - Trang 24)
    '感冒': 4, '生病': 4, '身体': 4, '舒服': 4, '疼': 4, '休息': 4, '药': 4, '一点儿': 4, '头疼': 4, '吃药': 4,
    // Bài 5: 把门关上。 (6 từ - Trang 29)
    '菜': 5, '果汁': 5, '进': 5, '它': 5, '洗澡': 5, '鱼': 5,
    // Bài 6: 你去过我们的新教室吗？ (7 từ - Trang 34)
    '教室': 6, '过': 6, '后': 6, '前': 6, '右': 6, '走': 6, '左': 6,
    // Bài 7: 你们每天怎么去学校？ (10 từ - Trang 39)
    '公共汽车': 7, '车站': 7, '路': 7, '动物园': 7, '对': 7, '近': 7, '开': 7, '旁边': 7, '条': 7, '远': 7,
    // Bài 8: 要下雨了。 (6 từ - Trang 44)
    '雨伞': 8, '迟到': 8, '坏': 8, '蓝': 8, '慢': 8, '拿': 8,
    // Bài 9: 你是什么时候去的？ (5 từ - Trang 49)
    '飞机': 9, '次': 9, '累': 9, '去年': 9, '时候': 9,
    // Bài 10: 爸爸为什么不休息？ (8 từ - Trang 54)
    '为什么': 10, '因为……': 10, '所以……': 10, '事情': 10, '意思': 10, '忙': 10, '电影': 10, '看电影': 10,
    // Bài 11: 它长得很快。 (8 từ - Trang 59)
    '长': 11, '可爱': 11, '出生': 11, '白': 11, '黑': 11, '件': 11, '裤子': 11, '裙子': 11
  }
};

// 1. Update database.json
const masterDb = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

[1, 2, 3, 4].forEach(level => {
  const words = masterDb.filter(w => (w.curriculum === 'yct' || w.hskVersion === 'yct') && String(w.level) === String(level));
  console.log(`Updating Level ${level}: ${words.length} words...`);

  words.forEach(w => {
    const rawWord = w.word.trim();
    const map = yctLessonMaps[level];
    const les = map[rawWord] || 1;

    w.lessonId = les;
    w.curriculum = 'yct';
    w.hskVersion = 'yct';
    w.lessonTitle = yctOfficialTitles[level][les - 1];
    w.lessonDesc = `YCT Thiếu Nhi Cấp ${level} - Bài ${les}`;

    // Fix specific pinyin typo if found
    if (level === 4 && w.word === '上网' && w.pinyin === 'shǎngwǎng') {
      w.pinyin = 'shàngwǎng';
    }
  });
});

fs.writeFileSync(dbPath, JSON.stringify(masterDb, null, 2), 'utf8');
console.log('Successfully updated all YCT 1..4 in database.json!');

// 2. Update yct_extracted.json
const yctExtracted = JSON.parse(fs.readFileSync(extractedPath, 'utf8'));

[2, 3, 4].forEach(level => {
  const list = yctExtracted[level.toString()] || [];
  const map = yctLessonMaps[level];

  list.forEach(item => {
    const rawWord = item.word.trim();
    if (map[rawWord]) {
      item.page = item.lesson; // preserve original page
      item.lesson = map[rawWord];
    }
    if (level === 4 && item.word === '上网' && item.pinyin === 'shǎngwǎng') {
      item.pinyin = 'shàngwǎng';
    }
  });
});

fs.writeFileSync(extractedPath, JSON.stringify(yctExtracted, null, 2), 'utf8');
console.log('Successfully updated yct_extracted.json for levels 2, 3, 4!');

