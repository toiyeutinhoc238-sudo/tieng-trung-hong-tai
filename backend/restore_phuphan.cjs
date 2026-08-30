const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Thiếu MONGODB_URI trong .env");
  process.exit(1);
}

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

async function restoreData() {
  try {
    await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 3000
    });
    console.log("Đã kết nối MongoDB.");

    const email = "phanphiphu04@gmail.com";
    const user = await User.findById(email);

    if (!user) {
      console.log("Không tìm thấy user Phú Phan trong database.");
      process.exit(0);
    }

    console.log(`Dữ liệu hiện tại của ${email}:`);
    console.log(`- Study Time: ${user.stats.studyTime} giây`);
    console.log(`- Streak: ${user.stats.streak} ngày`);

    // Phục hồi thời gian (3 giờ 41 phút = 13260 giây)
    const targetStudyTime = 13260; 
    
    // Cộng phần còn thiếu vào ngày gần nhất (hôm nay) để đồng bộ dailyHistory
    const currentStudyTime = user.stats.studyTime || 0;
    if (currentStudyTime < targetStudyTime) {
      const diff = targetStudyTime - currentStudyTime;
      user.stats.studyTime = targetStudyTime;
      
      const vnTimeNow = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
      const todayStr = vnTimeNow.toISOString().split('T')[0];
      
      if (!user.stats.dailyHistory) user.stats.dailyHistory = {};
      user.stats.dailyHistory[todayStr] = (user.stats.dailyHistory[todayStr] || 0) + diff;
      
      console.log(`Đã cộng thêm ${diff} giây vào ngày ${todayStr}.`);
    } else {
      console.log("Thời gian học hiện tại đã lớn hơn hoặc bằng 3 giờ 41 phút, không cần khôi phục thời gian.");
    }

    // Phục hồi chuỗi (set lại thành 9 ngày vì bạn bảo "không đến 10 ngày")
    user.stats.streak = 9;
    
    // Cập nhật Database (dùng updateOne vì thuộc tính bên trong stats có Mixed Type)
    await User.updateOne({ _id: email }, { $set: { 'stats': user.stats } });
    
    console.log("Khôi phục thành công! StudyTime mới:", user.stats.studyTime, "giây, Streak:", user.stats.streak);
    
    process.exit(0);
  } catch (error) {
    console.error("Lỗi:", error);
    process.exit(1);
  }
}

restoreData();
