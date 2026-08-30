const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

const userSchema = new mongoose.Schema({
  _id: String, // email
  name: String,
  picture: String,
  role: { type: String, default: 'user' },
  lastSeenTime: { type: Date, default: Date.now },
  stats: {
    streak: { type: Number, default: 0 },
    studyTime: { type: Number, default: 0 },
    lastActiveDate: { type: String, default: "" },
    dailyHistory: { type: Object, default: {} }
  },
  gameHistory: { type: Array, default: [] },
  quizHistory: { type: Array, default: [] },
  progress: { type: Object, default: {} },
  customWords: { type: Array, default: [] },
  chats: { type: Array, default: [] },
  accessLogs: { type: Array, default: [] }
}, { minimize: false });

const User = mongoose.model('User', userSchema);

async function spreadData() {
  try {
    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 3000 });
    console.log("Đã kết nối MongoDB.");

    const email = "phanphiphu04@gmail.com";
    const user = await User.findById(email);

    if (!user) {
      console.log("Không tìm thấy user Phú Phan.");
      process.exit(0);
    }

    // Tổng thời gian học 13260 (3h 41m)
    user.stats.studyTime = 13260;
    user.stats.streak = 9;

    // Lấy ngày hôm nay (VN time)
    const vnTimeNow = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
    const todayStr = vnTimeNow.toISOString().split('T')[0];
    user.stats.lastActiveDate = todayStr;

    // Reset dailyHistory để phân bổ lại
    user.stats.dailyHistory = {};

    // Phân bổ 13260 giây cho 9 ngày qua (từ hôm nay lùi về 8 ngày trước)
    const days = 9;
    const avgSecs = Math.floor(13260 / days); // ~1473 giây / ngày
    let remainder = 13260 % days;

    for (let i = 0; i < days; i++) {
      const d = new Date(vnTimeNow.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = d.toISOString().split('T')[0];
      
      let secsForDay = avgSecs;
      // Cộng thêm ngẫu nhiên một chút cho tự nhiên, bù trừ vào ngày cuối
      // Hoặc phân bổ đều tuyệt đối + remainder vào hôm nay
      if (i === 0) secsForDay += remainder;
      
      user.stats.dailyHistory[dateStr] = secsForDay;
    }

    // Lưu vào DB
    await User.updateOne({ _id: email }, { $set: { 'stats': user.stats } });
    
    console.log(`Phân bổ thành công 13260 giây cho 9 ngày qua. Dữ liệu:`, user.stats.dailyHistory);
    process.exit(0);
  } catch (error) {
    console.error("Lỗi:", error);
    process.exit(1);
  }
}

spreadData();
