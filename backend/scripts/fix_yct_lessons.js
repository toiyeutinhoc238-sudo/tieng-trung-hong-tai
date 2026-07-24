import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = path.join(__dirname, '../database.json');
const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

const yctTitles = {
  1: [
    'Bài 1: Chào hỏi - 你好',
    'Bài 2: Bạn tên là gì? - 你叫什么名字',
    'Bài 3: Anh ấy là ai? - 他是谁',
    'Bài 4: Nhà tôi có 4 người - 我家有四个人',
    'Bài 5: Tôi 6 tuổi - 我六岁',
    'Bài 6: Bạn cao thật đấy - 你的个子真高',
    'Bài 7: Đây là cặp của ai? - 这是谁的包',
    'Bài 8: Tôi đi cửa hàng - 我去商店',
    'Bài 9: Hôm nay thứ hai - 今天星期一',
    'Bài 10: Bây giờ mấy giờ? - 现在几点',
    'Bài 11: Bạn thích ăn gì? - 你喜欢吃什么',
    'Bài 12: Ôn tập & Thời tiết - 天气怎么样'
  ],
  2: [
    'Bài 1: Chào hỏi nâng cao - 早上好',
    'Bài 2: Bạn đi đâu đấy? - 你去哪儿',
    'Bài 3: Cái này bao nhiêu tiền? - 这个多少钱',
    'Bài 4: Bây giờ là mấy giờ? - 现在几点钟',
    'Bài 5: Hôm nay là sinh nhật tôi - 今天是我的生日',
    'Bài 6: Bạn thích con vật gì? - 你喜欢什么动物',
    'Bài 7: Tôi biết bơi - 我会游泳',
    'Bài 8: Bố tôi là bác sĩ - 我爸爸是医生',
    'Bài 9: Quần áo đẹp quá - 衣服真漂亮',
    'Bài 10: Hôm nay trời mưa - 今天下雨了',
    'Bài 11: Tôi không khỏe - 我身体不舒服',
    'Bài 12: Ôn tập tổng hợp YCT 2 - 综合复习'
  ],
  3: [
    'Bài 1: Kỳ nghỉ hè vui vẻ - 暑假快乐',
    'Bài 2: Bạn học ở trường nào? - 你在哪个学校学习',
    'Bài 3: Tôi muốn mua đồ - 我想买东西',
    'Bài 4: Món ăn này ngon quá - 这个菜很好吃',
    'Bài 5: Bạn có thể giúp tôi không? - 你能帮我吗',
    'Bài 6: Chúng ta cùng đi xem phim - 我们一起去看电影',
    'Bài 7: Thể thao yêu thích - 我最喜欢的运动',
    'Bài 8: Thời tiết bốn mùa - 一年四季',
    'Bài 9: Giao thông và di chuyển - 交通与出行',
    'Bài 10: Sở thích cá nhân - 我的爱好',
    'Bài 11: Cuộc sống hàng ngày - 日常生活',
    'Bài 12: Ôn tập tổng hợp YCT 3 - 综合复习'
  ],
  4: [
    'Bài 1: Kế hoạch tương lai - 未来的计划',
    'Bài 2: Bảo vệ môi trường - 保护环境',
    'Bài 3: Du lịch và khám phá - 旅游与探索',
    'Bài 4: Văn hóa và phong tục - 文化与习俗',
    'Bài 5: Khoa học công nghệ - 科技与生活',
    'Bài 6: Tình bạn và sự sẻ chia - 友谊与分享',
    'Bài 7: Thói quen tốt - 良好的习惯',
    'Bài 8: Âm nhạc và nghệ thuật - 音乐与艺术',
    'Bài 9: Đọc sách và tri thức - 阅读与知识',
    'Bài 10: Thử thách và cố gắng - 挑战与努力',
    'Bài 11: Giao lưu quốc tế - 国际交流',
    'Bài 12: Ôn tập tổng hợp YCT 4 - 综合复习'
  ]
};

[1, 2, 3, 4].forEach(level => {
  const words = data.filter(w => (w.curriculum === 'yct' || w.hskVersion === 'yct') && w.level.toString() === level.toString());
  const totalWords = words.length;

  words.forEach((w, idx) => {
    // Partition exactly into 12 buckets
    let lessonNum = Math.floor((idx * 12) / totalWords) + 1;
    if (lessonNum > 12) lessonNum = 12;

    w.lessonId = lessonNum;
    w.curriculum = 'yct';
    w.hskVersion = 'yct';
    w.lessonTitle = yctTitles[level][lessonNum - 1];
    w.lessonDesc = `YCT Thiếu Nhi Cấp ${level} - Bài ${lessonNum}`;
  });
});

fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
console.log('Successfully updated YCT 1..4 to EXACTLY 12 lessons (Bài 1..12) each!');
