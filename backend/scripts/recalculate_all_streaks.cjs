const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const MONGODB_URI = process.env.MONGODB_URI;
const USER_DATA_PATH = path.join(__dirname, '..', 'user_data.json');

function getPreviousDateStr(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().split('T')[0];
}

function calculateStreakFromHistory(dailyHistory) {
  if (!dailyHistory || typeof dailyHistory !== 'object') return 0;
  const activeDates = new Set(
    Object.keys(dailyHistory).filter(d => (dailyHistory[d] || 0) > 0)
  );
  if (activeDates.size === 0) return 0;

  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
  const yesterdayStr = getPreviousDateStr(todayStr);

  if (!activeDates.has(todayStr) && !activeDates.has(yesterdayStr)) {
    return 0;
  }

  let curr = activeDates.has(todayStr) ? todayStr : yesterdayStr;
  let streak = 0;
  while (activeDates.has(curr)) {
    streak++;
    curr = getPreviousDateStr(curr);
  }
  return streak;
}

async function run() {
  console.log('=== BẮT ĐẦU ĐỒNG BỘ CHUỖI NGÀY HỌC (STREAK) ===');
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
  console.log(`Ngày hiện tại theo giờ Việt Nam: ${todayStr}`);

  // 1. Cập nhật MongoDB nếu có kết nối
  if (MONGODB_URI) {
    try {
      console.log('Đang kết nối MongoDB...');
      await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
      console.log('Kết nối MongoDB thành công!');

      const User = mongoose.model('User', new mongoose.Schema({
        _id: String,
        name: String,
        stats: Object
      }, { strict: false }));

      const users = await User.find({});
      console.log(`Tìm thấy ${users.length} học viên trong MongoDB.`);

      let updatedCount = 0;
      for (const u of users) {
        const currentStats = u.stats || {};
        const oldStreak = currentStats.streak;
        const newStreak = calculateStreakFromHistory(currentStats.dailyHistory);

        if (oldStreak !== newStreak) {
          await User.updateOne(
            { _id: u._id },
            { $set: { 'stats.streak': newStreak } }
          );
          console.log(`[MongoDB] ${u.name || u._id} (${u._id}): Streak cũ = ${oldStreak} -> Streak mới = ${newStreak}`);
          updatedCount++;
        }
      }

      console.log(`=> Đã cập nhật thành công ${updatedCount} học viên trong MongoDB.`);
    } catch (err) {
      console.error('Lỗi khi cập nhật MongoDB:', err);
    }
  }

  // 2. Cập nhật file fallback user_data.json
  if (fs.existsSync(USER_DATA_PATH)) {
    try {
      const raw = fs.readFileSync(USER_DATA_PATH, 'utf-8');
      const data = JSON.parse(raw);
      if (data && data.users) {
        let fileUpdatedCount = 0;
        for (const [email, u] of Object.entries(data.users)) {
          const currentStats = u.stats || {};
          const oldStreak = currentStats.streak;
          const newStreak = calculateStreakFromHistory(currentStats.dailyHistory);

          if (oldStreak !== newStreak) {
            if (!data.users[email].stats) data.users[email].stats = {};
            data.users[email].stats.streak = newStreak;
            console.log(`[user_data.json] ${u.name || email} (${email}): Streak cũ = ${oldStreak} -> Streak mới = ${newStreak}`);
            fileUpdatedCount++;
          }
        }
        fs.writeFileSync(USER_DATA_PATH, JSON.stringify(data, null, 2), 'utf-8');
        console.log(`=> Đã cập nhật thành công ${fileUpdatedCount} học viên trong user_data.json.`);
      }
    } catch (err) {
      console.error('Lỗi khi cập nhật user_data.json:', err);
    }
  }

  console.log('=== HOÀN TẤT ĐỒNG BỘ CHUỖI NGÀY HỌC ===');
  process.exit(0);
}

run();
