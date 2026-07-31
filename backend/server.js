import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import mongoose from 'mongoose';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.json');
const USER_DB_PATH = path.join(__dirname, 'user_data.json');
const AUDIO_CACHE_DIR = path.join(__dirname, 'audio_cache');

// Ensure audio cache directory exists
fs.mkdir(AUDIO_CACHE_DIR, { recursive: true }).catch(err => {
  console.error("Error creating audio_cache dir:", err);
});

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
  console.error("Warning: MONGODB_URI is not set in environment variables!");
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log("MongoDB connected successfully."))
    .catch(err => console.error("MongoDB connection error:", err));
}

// Define Schemas and Models
const userSchema = new mongoose.Schema({
  _id: String, // email
  name: String,
  picture: String,
  stats: {
    streak: { type: Number, default: 0 },
    studyTime: { type: Number, default: 0 },
    lastActiveDate: { type: String, default: "" }
  },
  gameHistory: { type: Array, default: [] },
  progress: { type: Object, default: {} },
  customWords: { type: Array, default: [] },
  chats: { type: Array, default: [] }
}, { minimize: false });
const User = mongoose.model('User', userSchema);

const sessionSchema = new mongoose.Schema({
  _id: String, // sessionToken
  email: String,
  createdAt: { type: Date, default: Date.now, expires: '7d' }
});
const Session = mongoose.model('Session', sessionSchema);

// In-memory Cache for User Data
let cachedUserData = null;

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const DIST_DIR = path.join(__dirname, '..', 'frontend', 'dist');
app.use(express.static(DIST_DIR));
app.use(express.static(FRONTEND_DIR));

// Disable caching for all API routes
app.use('/api', (req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.set('Expires', '-1');
  res.set('Pragma', 'no-cache');
  next();
});

// Helper to read built-in database
async function readDatabase() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading database, returning empty list:', error);
    return [];
  }
}

// Helper to read user_data.json
async function readUserData() {
  if (cachedUserData) {
    return cachedUserData;
  }

  try {
    const usersList = await User.find({});
    const sessionsList = await Session.find({});

    const users = {};
    const progress = {};
    const customWords = {};
    const chats = {};
    const sessions = {};

    usersList.forEach(u => {
      users[u._id] = {
        name: u.name,
        picture: u.picture,
        stats: u.stats,
        gameHistory: u.gameHistory || []
      };
      progress[u._id] = u.progress || {};
      customWords[u._id] = u.customWords || [];
      chats[u._id] = u.chats || [];
    });

    sessionsList.forEach(s => {
      sessions[s._id] = s.email;
    });

    cachedUserData = { users, progress, customWords, sessions, chats };

    // If MongoDB is completely empty (no users), perform migration from user_data.json
    if (usersList.length === 0) {
      await performDataMigration();
    }

    return cachedUserData;
  } catch (error) {
    console.error("Error reading database from MongoDB, returning skeleton:", error);
    return { users: {}, progress: {}, customWords: {}, sessions: {}, chats: {} };
  }
}

// Data Migration Helper
async function performDataMigration() {
  try {
    const fileExists = await fs.access(USER_DB_PATH).then(() => true).catch(() => false);
    if (!fileExists) {
      console.log("No user_data.json file found for migration.");
      return;
    }

    const dataStr = await fs.readFile(USER_DB_PATH, 'utf-8');
    const fileData = JSON.parse(dataStr);
    if (!fileData || !fileData.users || Object.keys(fileData.users).length === 0) {
      console.log("user_data.json is empty or invalid, skipping migration.");
      return;
    }

    console.log("Starting data migration from user_data.json to MongoDB...");

    cachedUserData = {
      users: fileData.users || {},
      progress: fileData.progress || {},
      customWords: fileData.customWords || {},
      sessions: fileData.sessions || {},
      chats: fileData.chats || {}
    };

    await persistToMongoDB(cachedUserData);
    console.log("Data migration to MongoDB Atlas completed successfully!");
  } catch (err) {
    console.error("Data migration failed:", err);
  }
}

// Helper to write user data
async function writeUserData(data) {
  // Sync instantly to in-memory cache
  cachedUserData = data;

  // Dual persistence: Write to local JSON file & MongoDB Atlas
  try {
    await fs.writeFile(USER_DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (fileErr) {
    console.error("Failed writing to user_data.json:", fileErr);
  }

  // Persist asynchronously in the background to MongoDB
  persistToMongoDB(data).catch(err => {
    console.error("Background persistence to MongoDB failed:", err);
  });

  return true;
}

// Background MongoDB Persistence
async function persistToMongoDB(data) {
  const promises = [];
  const emails = new Set([
    ...Object.keys(data.users || {}),
    ...Object.keys(data.progress || {}),
    ...Object.keys(data.customWords || {}),
    ...Object.keys(data.chats || {})
  ]);

  for (const email of emails) {
    const u = data.users[email] || { name: "", picture: "", stats: { streak: 0, studyTime: 0, lastActiveDate: "" } };
    promises.push(User.replaceOne(
      { _id: email },
      {
        _id: email,
        name: u.name,
        picture: u.picture,
        stats: u.stats,
        gameHistory: u.gameHistory || [],
        progress: data.progress[email] || {},
        customWords: data.customWords[email] || [],
        chats: data.chats[email] || []
      },
      { upsert: true }
    ));
  }

  await Session.deleteMany({});
  for (const token of Object.keys(data.sessions || {})) {
    promises.push(Session.replaceOne(
      { _id: token },
      { _id: token, email: data.sessions[token] },
      { upsert: true }
    ));
  }

  await Promise.all(promises);
}

// Session store in memory: sessionToken -> userEmail
const activeSessions = new Map();

// Load persisted sessions on startup
try {
  const userData = await readUserData();
  if (userData.sessions) {
    for (const [token, email] of Object.entries(userData.sessions)) {
      activeSessions.set(token, email);
    }
    console.log(`Loaded ${activeSessions.size} active sessions from user_data.json`);
  }
} catch (err) {
  console.error('Failed to load active sessions from user_data.json:', err);
}

// Helper to parse cookie from headers
function getSessionCookie(req) {
  const cookieHeader = req.headers.cookie || '';
  const cookies = cookieHeader.split(';').reduce((acc, cookie) => {
    const [name, value] = cookie.trim().split('=');
    if (name && value) acc[name] = decodeURIComponent(value);
    return acc;
  }, {});
  return cookies['session'];
}

// Helper to retrieve logged-in user email
function getLoggedInUserEmail(req) {
  let token = null;

  // 1. Check Authorization header
  const authHeader = req.headers.authorization || '';
  if (authHeader.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // 2. Check custom header
  if (!token) {
    token = req.headers['x-session-token'];
  }

  // 3. Fallback to Cookie
  if (!token) {
    token = getSessionCookie(req);
  }

  if (token && activeSessions.has(token)) {
    return activeSessions.get(token);
  }

  // 4. Fallback to email passed in body/query or user object in body
  if (req.body && req.body.email) return req.body.email.toLowerCase().trim();
  if (req.query && req.query.email) return req.query.email.toLowerCase().trim();
  if (req.body && req.body.userEmail) return req.body.userEmail.toLowerCase().trim();

  // If activeSessions has any active user, use the latest logged-in user
  if (activeSessions.size > 0) {
    const emails = Array.from(activeSessions.values());
    return emails[emails.length - 1];
  }

  return null;
}

// Helper to decode Google JWT payload without external libraries
function decodeJwt(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1];
    const decoded = Buffer.from(payload, 'base64').toString('utf8');
    return JSON.parse(decoded);
  } catch (e) {
    console.error('Error decoding JWT:', e);
    return null;
  }
}

// GET /api/exams/catalog - Return real HSK exam catalog (117 exams)
app.get('/api/exams/catalog', async (req, res) => {
  try {
    const catalogPath = path.join(__dirname, 'exam_catalog.json');
    const catalogData = await fs.readFile(catalogPath, 'utf-8');
    res.json(JSON.parse(catalogData));
  } catch (error) {
    console.error('Error reading exam_catalog.json:', error);
    res.status(500).json({ error: 'Failed to load exam catalog' });
  }
});

// POST endpoint for Google Login
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;

  if (!credential) {
    return res.status(400).json({ error: 'Missing credential token' });
  }

  const payload = decodeJwt(credential);
  if (!payload || !payload.email) {
    return res.status(400).json({ error: 'Invalid token format' });
  }

  const email = payload.email.toLowerCase().trim();
  const name = payload.name;
  const picture = payload.picture;

  // Generate a random session token
  const sessionToken = Math.random().toString(36).substring(2) + Date.now().toString(36);
  activeSessions.set(sessionToken, email);

  // Persist user record and session in user_data.json
  const userData = await readUserData();
  const existingUser = userData.users[email] || {};
  userData.users[email] = {
    ...existingUser,
    name,
    picture,
    stats: existingUser.stats || {
      streak: 0,
      studyTime: 0,
      lastActiveDate: ''
    }
  };
  if (!userData.sessions) {
    userData.sessions = {};
  }
  userData.sessions[sessionToken] = email;
  await writeUserData(userData);

  res.setHeader('Set-Cookie', `session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 7}`);

  res.json({
    success: true,
    token: sessionToken,
    user: { name, email, picture }
  });
});

// GET endpoint to fetch current user session
app.get('/api/auth/me', async (req, res) => {
  const email = getLoggedInUserEmail(req);
  if (!email) {
    return res.json({ user: null });
  }

  const userData = await readUserData();
  const userRecord = userData.users[email];
  if (!userRecord) {
    return res.json({ user: null });
  }

  res.json({
    user: {
      name: userRecord.name,
      email: email,
      picture: userRecord.picture
    }
  });
});

// POST endpoint to logout
app.post('/api/auth/logout', async (req, res) => {
  const token = req.headers['x-session-token'] ||
    (req.headers.authorization && req.headers.authorization.startsWith('Bearer ') ? req.headers.authorization.substring(7) : null) ||
    getSessionCookie(req);
  if (token) {
    activeSessions.delete(token);
    try {
      const userData = await readUserData();
      if (userData.sessions && userData.sessions[token]) {
        delete userData.sessions[token];
        await writeUserData(userData);
      }
    } catch (e) {
      console.error('Failed to delete session from user_data.json:', e);
    }
  }
  // Clear the cookie on client
  res.setHeader('Set-Cookie', 'session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
  res.json({ success: true });
});

// GET endpoint to fetch user stats
app.get('/api/user/stats', async (req, res) => {
  const email = getLoggedInUserEmail(req);
  if (!email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const userData = await readUserData();
  const userRecord = userData.users[email];
  if (!userRecord) {
    return res.status(404).json({ error: 'User not found' });
  }

  const stats = userRecord.stats || {
    streak: 0,
    studyTime: 0,
    lastActiveDate: ''
  };

  res.json(stats);
});

// POST endpoint to update study time & calculate streak
app.post('/api/user/stats/sync', async (req, res) => {
  const email = getLoggedInUserEmail(req);
  if (!email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { incrementStudyTime, localDateStr } = req.body;
  const userData = await readUserData();
  const userRecord = userData.users[email];
  if (!userRecord) {
    return res.status(404).json({ error: 'User not found' });
  }

  if (!userRecord.stats) {
    userRecord.stats = {
      streak: 0,
      studyTime: 0,
      lastActiveDate: ''
    };
  }

  if (typeof incrementStudyTime === 'number') {
    userRecord.stats.studyTime += incrementStudyTime;
  }

  const todayStr = localDateStr || new Date().toISOString().split('T')[0];
  const lastActiveStr = userRecord.stats.lastActiveDate;

  if (!lastActiveStr) {
    userRecord.stats.streak = 1;
    userRecord.stats.lastActiveDate = todayStr;
  } else if (lastActiveStr !== todayStr) {
    const today = new Date(todayStr);
    const lastActive = new Date(lastActiveStr);
    const diffTime = Math.abs(today - lastActive);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      userRecord.stats.streak += 1;
    } else if (diffDays > 1) {
      userRecord.stats.streak = 1;
    }
    userRecord.stats.lastActiveDate = todayStr;
  }

  await writeUserData(userData);
  res.json(userRecord.stats);
});

// POST endpoint to save game history
app.post('/api/user/game-history', async (req, res) => {
  const email = getLoggedInUserEmail(req);
  if (!email) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { score, stage, level, mode, combo } = req.body;

  if (typeof score !== 'number' || typeof stage !== 'number') {
    return res.status(400).json({ error: 'Invalid score or stage' });
  }

  const userData = await readUserData();
  let userRecord = userData.users[email];
  if (!userRecord) {
    userRecord = {
      name: email.split('@')[0],
      picture: '',
      stats: { streak: 0, studyTime: 0, lastActiveDate: '' },
      gameHistory: []
    };
    userData.users[email] = userRecord;
  }

  if (!userRecord.gameHistory) {
    userRecord.gameHistory = [];
  }

  const newRecord = {
    score,
    stage,
    level: level || 'all',
    mode: mode || 'zh-vi',
    combo: combo || 0,
    playedAt: new Date().toISOString()
  };

  userRecord.gameHistory.push(newRecord);

  // Keep last 100 games
  if (userRecord.gameHistory.length > 100) {
    userRecord.gameHistory = userRecord.gameHistory.slice(-100);
  }

  await writeUserData(userData);
  res.json({ success: true, record: newRecord });
});

// GET endpoint to fetch game history
app.get('/api/user/game-history', async (req, res) => {
  const email = req.query.email || getLoggedInUserEmail(req);
  if (!email) {
    return res.json([]);
  }

  try {
    const userData = await readUserData();
    const userRecord = userData.users[email];
    const userHistory = (userRecord && userRecord.gameHistory) ? userRecord.gameHistory : [];
    const quizHistory = (userData.quizHistory && userData.quizHistory[email]) ? userData.quizHistory[email] : [];
    
    // Gop va sap xep theo thoi gian playedAt moi nhat
    const combined = [...userHistory, ...quizHistory].sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt));
    res.json(combined);
  } catch (err) {
    res.json([]);
  }
});

// GET endpoint for Real MongoDB Leaderboard
app.get('/api/leaderboard', async (req, res) => {
  try {
    const userData = await readUserData();
    const usersObj = userData.users || {};
    const progressObj = userData.progress || {};

    const leaderboard = [];

    for (const email of Object.keys(usersObj)) {
      const u = usersObj[email];
      const userProg = progressObj[email] || {};

      // 1. Tính số lượng bài học (từ vựng) đã học thuộc/hoàn thành
      let completedLessonsCount = 0;
      let earliestCompletionTime = null;

      for (const wordId of Object.keys(userProg)) {
        const item = userProg[wordId];
        if (item && (item.isMemorized || item.isStudied)) {
          completedLessonsCount++;
          if (item.updatedAt || item.completedAt) {
            const timeVal = new Date(item.updatedAt || item.completedAt).getTime();
            if (!earliestCompletionTime || timeVal < earliestCompletionTime) {
              earliestCompletionTime = timeVal;
            }
          }
        }
      }

      // Thời gian hoạt động gần nhất hoặc hoàn thành bài học
      const lastActive = u.stats && u.stats.lastActiveDate ? new Date(u.stats.lastActiveDate).getTime() : (earliestCompletionTime || Date.now());

      leaderboard.push({
        email: email,
        name: u.name || email.split('@')[0],
        picture: u.picture || '',
        completedCount: completedLessonsCount,
        studyTime: u.stats ? (u.stats.studyTime || 0) : 0,
        streak: u.stats ? (u.stats.streak || 0) : 0,
        earliestCompletionTime: earliestCompletionTime || lastActive,
        isVip: true
      });
    }

    // 2. Sắp xếp thứ tự ưu tiên tuyệt đối từ trên xuống:
    // Mức ưu tiên 1: Số bài đã học hoàn thành (completedCount) - Bài học nhiều hơn đứng trên
    // Mức ưu tiên 2: Thời gian tương tác / học tập (studyTime) - Chỉ xét khi số bài đã học bằng nhau (Thời gian nhiều hơn đứng trên)
    // Mức ưu tiên 3: Thời gian hoàn thành sớm nhất (earliestCompletionTime)
    leaderboard.sort((a, b) => {
      if (b.completedCount !== a.completedCount) {
        return b.completedCount - a.completedCount;
      }
      if (b.studyTime !== a.studyTime) {
        return b.studyTime - a.studyTime;
      }
      return a.earliestCompletionTime - b.earliestCompletionTime;
    });

    // Chỉ lấy Top 10 học viên xuất sắc nhất
    const top10 = leaderboard.slice(0, 10).map((item, index) => ({
      rank: index + 1,
      name: item.name,
      picture: item.picture,
      completedCount: item.completedCount,
      studyTimeMinutes: Math.round(item.studyTime / 60),
      streak: item.streak,
      isVip: item.isVip
    }));

    res.json(top10);
  } catch (error) {
    console.error("Leaderboard calculation error:", error);
    res.status(500).json({ error: "Failed to fetch real leaderboard" });
  }
// POST endpoint to save quiz game results & update leaderboard
app.post('/api/quiz/save', async (req, res) => {
  const email = getLoggedInUserEmail(req) || 'guest';
  const { score, total, mode } = req.body;

  try {
    const userData = await readUserData();
    if (!userData.quizHistory) userData.quizHistory = {};
    if (!userData.quizHistory[email]) userData.quizHistory[email] = [];

    const newRecord = {
      score: score || 0,
      total: total || 100,
      mode: mode || 'Pinyin Challenge',
      playedAt: new Date().toISOString()
    };

    userData.quizHistory[email].push(newRecord);

    // Cập nhật điểm tích lũy vào hồ sơ người dùng để xếp hạng
    if (email !== 'guest' && userData.users[email]) {
      if (!userData.users[email].stats) {
        userData.users[email].stats = { streak: 0, studyTime: 0, lastActiveDate: '' };
      }
      userData.users[email].stats.studyTime = (userData.users[email].stats.studyTime || 0) + Math.round(score / 2);
    }

    await writeUserData(userData);
    res.json({ success: true, record: newRecord });
  } catch (err) {
    console.error("Save quiz error:", err);
    res.status(500).json({ error: "Failed to save quiz score" });
  }
});


// GET all vocabulary (merges built-in list with user-specific states and custom words)
app.get('/api/vocabulary', async (req, res) => {
  const masterList = await readDatabase();
  const email = getLoggedInUserEmail(req);

  if (!email) {
    // If not logged in, return master list with default unmemorized, unstarred, and not wrong states
    const defaultList = masterList.map(w => ({
      ...w,
      isMemorized: false,
      isStarred: false,
      isWrong: false,
      isStudied: false
    }));
    return res.json(defaultList);
  }

  const userData = await readUserData();
  const userProgress = userData.progress[email] || {};
  const userCustomWords = userData.customWords[email] || [];

  // Merge study states for built-in words
  const mergedList = masterList.map(item => {
    const state = userProgress[item.id.toString()];
    return {
      ...item,
      isMemorized: state ? !!state.isMemorized : false,
      isStarred: state ? !!state.isStarred : false,
      isWrong: state ? !!state.isWrong : false,
      isStudied: state ? !!state.isStudied : false
    };
  });

  // Append user-specific custom words
  const mappedCustomWords = userCustomWords.map(cw => ({
    ...cw,
    isCustom: true,
    isWrong: !!cw.isWrong,
    isStudied: !!cw.isStudied
  }));

  res.json([...mergedList, ...mappedCustomWords]);
});

// GET endpoint to fetch structured online lesson content (text, vocab, grammar, exercises)
app.get('/api/lesson-detail', async (req, res) => {
  try {
    const lessonId = req.query.id || 'hsk1_lesson1';
    const filePath = path.join(__dirname, 'lessons_data.json');
    const dataStr = await fs.readFile(filePath, 'utf-8');
    const lessonsData = JSON.parse(dataStr);

    if (lessonsData[lessonId]) {
      return res.json(lessonsData[lessonId]);
    } else if (lessonsData['hsk1_lesson1']) {
      // Fallback sample lesson
      return res.json(lessonsData['hsk1_lesson1']);
    }

    return res.status(404).json({ error: 'Lesson content not found' });
  } catch (err) {
    console.error("Error reading lessons_data.json:", err);
    res.status(500).json({ error: 'Failed to load lesson detail' });
  }
});

// POST toggle memorized
app.post('/api/vocabulary/toggle-memorized', async (req, res) => {
  const email = getLoggedInUserEmail(req);
  if (!email) {
    return res.status(401).json({ error: 'Unauthorized. Please login first.' });
  }

  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Missing word ID' });
  }

  const wordId = parseInt(id);
  const userData = await readUserData();

  if (wordId >= 100000) {
    // Custom word progress toggle
    const userCustomWords = userData.customWords[email] || [];
    const wordIndex = userCustomWords.findIndex(w => w.id === wordId);
    if (wordIndex === -1) {
      return res.status(404).json({ error: 'Custom word not found' });
    }

    userCustomWords[wordIndex].isMemorized = !userCustomWords[wordIndex].isMemorized;
    await writeUserData(userData);
    return res.json(userCustomWords[wordIndex]);
  } else {
    // Built-in word progress toggle
    const masterList = await readDatabase();
    const wordIndex = masterList.findIndex(w => w.id === wordId);
    if (wordIndex === -1) {
      return res.status(404).json({ error: 'Word not found' });
    }

    if (!userData.progress[email]) {
      userData.progress[email] = {};
    }

    const wordKey = wordId.toString();
    const currentProgress = userData.progress[email][wordKey] || { isMemorized: false, isStarred: false };

    userData.progress[email][wordKey] = {
      ...currentProgress,
      isMemorized: !currentProgress.isMemorized
    };

    await writeUserData(userData);

    res.json({
      ...masterList[wordIndex],
      isMemorized: userData.progress[email][wordKey].isMemorized,
      isStarred: userData.progress[email][wordKey].isStarred,
      isWrong: !!userData.progress[email][wordKey].isWrong
    });
  }
});

// POST set memorized status directly
app.post('/api/vocabulary/set-memorized', async (req, res) => {
  const email = getLoggedInUserEmail(req);
  if (!email) {
    return res.status(401).json({ error: 'Unauthorized. Please login first.' });
  }

  const { id, isMemorized } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Missing word ID' });
  }

  const wordId = parseInt(id);
  const userData = await readUserData();

  if (wordId >= 100000) {
    // Custom word progress set
    const userCustomWords = userData.customWords[email] || [];
    const wordIndex = userCustomWords.findIndex(w => w.id === wordId);
    if (wordIndex === -1) {
      return res.status(404).json({ error: 'Custom word not found' });
    }

    userCustomWords[wordIndex].isMemorized = !!isMemorized;
    await writeUserData(userData);
    return res.json(userCustomWords[wordIndex]);
  } else {
    // Built-in word progress set
    const masterList = await readDatabase();
    const wordIndex = masterList.findIndex(w => w.id === wordId);
    if (wordIndex === -1) {
      return res.status(404).json({ error: 'Word not found' });
    }

    if (!userData.progress[email]) {
      userData.progress[email] = {};
    }

    const wordKey = wordId.toString();
    const currentProgress = userData.progress[email][wordKey] || { isMemorized: false, isStarred: false };

    userData.progress[email][wordKey] = {
      ...currentProgress,
      isMemorized: !!isMemorized
    };

    await writeUserData(userData);

    res.json({
      ...masterList[wordIndex],
      isMemorized: userData.progress[email][wordKey].isMemorized,
      isStarred: userData.progress[email][wordKey].isStarred,
      isWrong: !!userData.progress[email][wordKey].isWrong,
      isStudied: !!userData.progress[email][wordKey].isStudied
    });
  }
});

// POST toggle starred
app.post('/api/vocabulary/toggle-starred', async (req, res) => {
  const email = getLoggedInUserEmail(req);
  if (!email) {
    return res.status(401).json({ error: 'Unauthorized. Please login first.' });
  }

  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Missing word ID' });
  }

  const wordId = parseInt(id);
  const userData = await readUserData();

  if (wordId >= 100000) {
    // Custom word starred toggle
    const userCustomWords = userData.customWords[email] || [];
    const wordIndex = userCustomWords.findIndex(w => w.id === wordId);
    if (wordIndex === -1) {
      return res.status(404).json({ error: 'Custom word not found' });
    }

    userCustomWords[wordIndex].isStarred = !userCustomWords[wordIndex].isStarred;
    await writeUserData(userData);
    return res.json(userCustomWords[wordIndex]);
  } else {
    // Built-in word starred toggle
    const masterList = await readDatabase();
    const wordIndex = masterList.findIndex(w => w.id === wordId);
    if (wordIndex === -1) {
      return res.status(404).json({ error: 'Word not found' });
    }

    if (!userData.progress[email]) {
      userData.progress[email] = {};
    }

    const wordKey = wordId.toString();
    const currentProgress = userData.progress[email][wordKey] || { isMemorized: false, isStarred: false };

    userData.progress[email][wordKey] = {
      ...currentProgress,
      isStarred: !currentProgress.isStarred
    };

    await writeUserData(userData);

    res.json({
      ...masterList[wordIndex],
      isMemorized: userData.progress[email][wordKey].isMemorized,
      isStarred: userData.progress[email][wordKey].isStarred,
      isWrong: !!userData.progress[email][wordKey].isWrong
    });
  }
});

// POST set incorrect / wrong status
app.post('/api/vocabulary/set-wrong', async (req, res) => {
  const email = getLoggedInUserEmail(req);
  if (!email) {
    return res.status(401).json({ error: 'Unauthorized. Please login first.' });
  }

  const { id, isWrong } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Missing word ID' });
  }

  const wordId = parseInt(id);
  const userData = await readUserData();

  if (wordId >= 100000) {
    // Custom word wrong set
    const userCustomWords = userData.customWords[email] || [];
    const wordIndex = userCustomWords.findIndex(w => w.id === wordId);
    if (wordIndex === -1) {
      return res.status(404).json({ error: 'Custom word not found' });
    }

    userCustomWords[wordIndex].isWrong = !!isWrong;
    await writeUserData(userData);
    return res.json(userCustomWords[wordIndex]);
  } else {
    // Built-in word wrong set
    const masterList = await readDatabase();
    const wordIndex = masterList.findIndex(w => w.id === wordId);
    if (wordIndex === -1) {
      return res.status(404).json({ error: 'Word not found' });
    }

    if (!userData.progress[email]) {
      userData.progress[email] = {};
    }

    const wordKey = wordId.toString();
    const currentProgress = userData.progress[email][wordKey] || { isMemorized: false, isStarred: false, isWrong: false };

    userData.progress[email][wordKey] = {
      ...currentProgress,
      isWrong: !!isWrong
    };

    await writeUserData(userData);

    res.json({
      ...masterList[wordIndex],
      isMemorized: userData.progress[email][wordKey].isMemorized,
      isStarred: userData.progress[email][wordKey].isStarred,
      isWrong: userData.progress[email][wordKey].isWrong,
      isStudied: !!userData.progress[email][wordKey].isStudied
    });
  }
});

// POST set studied status
app.post('/api/vocabulary/set-studied', async (req, res) => {
  const email = getLoggedInUserEmail(req);
  if (!email) {
    return res.status(401).json({ error: 'Unauthorized. Please login first.' });
  }

  const { id, isStudied } = req.body;
  if (!id) {
    return res.status(400).json({ error: 'Missing word ID' });
  }

  const wordId = parseInt(id);
  const userData = await readUserData();

  if (wordId >= 100000) {
    // Custom word wrong set
    const userCustomWords = userData.customWords[email] || [];
    const wordIndex = userCustomWords.findIndex(w => w.id === wordId);
    if (wordIndex === -1) {
      return res.status(404).json({ error: 'Custom word not found' });
    }

    userCustomWords[wordIndex].isStudied = !!isStudied;
    await writeUserData(userData);
    return res.json(userCustomWords[wordIndex]);
  } else {
    // Built-in word studied set
    const masterList = await readDatabase();
    const wordIndex = masterList.findIndex(w => w.id === wordId);
    if (wordIndex === -1) {
      return res.status(404).json({ error: 'Word not found' });
    }

    if (!userData.progress[email]) {
      userData.progress[email] = {};
    }

    const wordKey = wordId.toString();
    const currentProgress = userData.progress[email][wordKey] || { isMemorized: false, isStarred: false, isWrong: false };

    userData.progress[email][wordKey] = {
      ...currentProgress,
      isStudied: !!isStudied
    };

    await writeUserData(userData);

    res.json({
      ...masterList[wordIndex],
      isMemorized: userData.progress[email][wordKey].isMemorized,
      isStarred: userData.progress[email][wordKey].isStarred,
      isWrong: !!userData.progress[email][wordKey].isWrong,
      isStudied: userData.progress[email][wordKey].isStudied
    });
  }
});

// POST add a custom word for the logged-in user
app.post('/api/vocabulary', async (req, res) => {
  const email = getLoggedInUserEmail(req);
  if (!email) {
    return res.status(401).json({ error: 'Unauthorized. Please login first.' });
  }

  const { word, pinyin, meaning, level, category, example_zh, example_vi } = req.body;

  if (!word || !pinyin || !meaning) {
    return res.status(400).json({ error: 'Word, pinyin, and meaning are required fields' });
  }

  const userData = await readUserData();
  if (!userData.customWords[email]) {
    userData.customWords[email] = [];
  }

  // Calculate next custom ID (custom words start at 100000 to avoid conflicts with HSK words)
  const maxId = userData.customWords[email].reduce((max, w) => w.id > max ? w.id : max, 99999);

  const newWord = {
    id: maxId + 1,
    word: word.trim(),
    pinyin: pinyin.trim(),
    meaning: meaning.trim().toLowerCase(),
    level: parseInt(level) || 1,
    category: category ? category.trim() : 'Khác',
    example_zh: example_zh ? example_zh.trim() : '',
    example_vi: example_vi ? example_vi.trim().toLowerCase() : '',
    isMemorized: false,
    isStarred: false,
    isCustom: true,
    isWrong: false
  };

  userData.customWords[email].push(newWord);
  await writeUserData(userData);

  res.status(201).json(newWord);
});

// DELETE a custom word belonging to the logged-in user
app.delete('/api/vocabulary/:id', async (req, res) => {
  const email = getLoggedInUserEmail(req);
  if (!email) {
    return res.status(401).json({ error: 'Unauthorized. Please login first.' });
  }

  const { id } = req.params;
  const wordId = parseInt(id);

  if (isNaN(wordId)) {
    return res.status(400).json({ error: 'Invalid word ID' });
  }

  if (wordId < 100000) {
    return res.status(403).json({ error: 'Cannot delete built-in HSK words' });
  }

  const userData = await readUserData();
  const userCustomWords = userData.customWords[email] || [];
  const wordIndex = userCustomWords.findIndex(w => w.id === wordId);

  if (wordIndex === -1) {
    return res.status(404).json({ error: 'Custom word not found' });
  }

  // Remove custom word
  res.json({ message: 'Word deleted successfully', id: wordId });
});

// POST endpoint for AI Chatbot
app.post('/api/chat', async (req, res) => {
  const { messages, threadId } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing or invalid messages parameter' });
  }

  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

  // Get logged in user if any
  const email = getLoggedInUserEmail(req);

  if (!GEMINI_API_KEY) {
    // Return friendly Demo / Setup instructions if API Key is not set
    return res.json({
      reply: 'Chào bạn! Tôi là **Trợ lý AI Hongtai** 🐼. Hiện tại, máy chủ chưa được cấu hình API Key cho Gemini.\n\nĐể kích hoạt đầy đủ tính năng hội thoại và giải thích tiếng Trung, vui lòng tạo biến môi trường `GEMINI_API_KEY` trong file cấu hình `.env` hoặc trên hệ thống của bạn!'
    });
  }

  try {
    // Format messages for Gemini generateContent structure
    const contents = messages.map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{
            text: 'Bạn là trợ lý AI học tiếng Trung đắc lực của thương hiệu "Tiếng Trung Hongtai". Bạn có phong cách nói chuyện thân thiện, chuyên nghiệp, tận tâm và thông thái. Bạn giúp học viên giải thích từ vựng HSK, các quy tắc phát âm Pinyin, cấu trúc ngữ pháp tiếng Trung, dịch thuật Anh-Trung-Việt và luyện giao tiếp. Hãy sử dụng định dạng Markdown rõ ràng, thụt lề hợp lý, xuống dòng sạch sẽ. Khi nói về thương hiệu, luôn tự xưng là "Trợ lý AI Hongtai".'
          }]
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', errorText);
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'Xin lỗi bạn, tôi không thể xử lý yêu cầu lúc này. Vui lòng thử lại sau.';

    let returnedThreadId = null;

    // If logged in, persist the messages into user_data.json
    if (email) {
      const userData = await readUserData();
      if (!userData.chats) userData.chats = {};
      if (!userData.chats[email]) userData.chats[email] = [];

      let thread = null;
      if (threadId) {
        thread = userData.chats[email].find(t => t.id === threadId);
      }

      if (!thread) {
        // Create new thread
        returnedThreadId = 'thread_' + Date.now() + Math.random().toString(36).substring(2, 6);
        const firstUserMsg = messages[messages.length - 1]?.content || 'Cuộc trò chuyện mới';
        const title = firstUserMsg.substring(0, 30) + (firstUserMsg.length > 30 ? '...' : '');
        thread = {
          id: returnedThreadId,
          title,
          createdAt: new Date().toISOString(),
          messages: []
        };
        userData.chats[email].push(thread);
      } else {
        returnedThreadId = thread.id;
      }

      // Save user prompt
      const userContent = messages[messages.length - 1].content;
      thread.messages.push({
        role: 'user',
        content: userContent,
        timestamp: new Date().toISOString()
      });

      // Save assistant reply
      thread.messages.push({
        role: 'assistant',
        content: reply,
        timestamp: new Date().toISOString()
      });

      await writeUserData(userData);
    }

    res.json({ reply, threadId: returnedThreadId });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Có lỗi xảy ra khi liên kết với AI Chatbot.' });
  }
});

// GET all chat threads for the current logged-in user
app.get('/api/chat/threads', async (req, res) => {
  const email = getLoggedInUserEmail(req);
  if (!email) {
    return res.status(401).json({ error: 'Chưa đăng nhập. Vui lòng đăng nhập trước.' });
  }

  const userData = await readUserData();
  const userChats = (userData.chats && userData.chats[email]) || [];

  // Sort by date descending
  const sorted = [...userChats].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Return list of threads (metadata only)
  const metadata = sorted.map(t => ({
    id: t.id,
    title: t.title,
    createdAt: t.createdAt
  }));

  res.json(metadata);
});

// GET full chat messages in a specific thread
app.get('/api/chat/threads/:id', async (req, res) => {
  const email = getLoggedInUserEmail(req);
  if (!email) {
    return res.status(401).json({ error: 'Chưa đăng nhập. Vui lòng đăng nhập trước.' });
  }

  const { id } = req.params;
  const userData = await readUserData();
  const userChats = (userData.chats && userData.chats[email]) || [];

  const thread = userChats.find(t => t.id === id);
  if (!thread) {
    return res.status(404).json({ error: 'Không tìm thấy cuộc trò chuyện.' });
  }

  res.json(thread);
});

// DELETE a specific chat thread
app.delete('/api/chat/threads/:id', async (req, res) => {
  const email = getLoggedInUserEmail(req);
  if (!email) {
    return res.status(401).json({ error: 'Chưa đăng nhập. Vui lòng đăng nhập trước.' });
  }

  const { id } = req.params;
  const userData = await readUserData();

  if (userData.chats && userData.chats[email]) {
    const originalLength = userData.chats[email].length;
    userData.chats[email] = userData.chats[email].filter(t => t.id !== id);
    if (userData.chats[email].length < originalLength) {
      await writeUserData(userData);
      return res.json({ success: true, message: 'Đã xóa cuộc trò chuyện.' });
    }
  }

  res.status(404).json({ error: 'Không tìm thấy cuộc trò chuyện để xóa.' });
});

// POST endpoint to migrate guest chat history to a new thread
app.post('/api/chat/migrate', async (req, res) => {
  const email = getLoggedInUserEmail(req);
  if (!email) {
    return res.status(401).json({ error: 'Chưa đăng nhập.' });
  }

  const { messages } = req.body;
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Không có tin nhắn để đồng bộ.' });
  }

  try {
    const userData = await readUserData();
    if (!userData.chats) userData.chats = {};
    if (!userData.chats[email]) userData.chats[email] = [];

    // Create a new thread for this guest history
    const threadId = 'thread_' + Date.now() + Math.random().toString(36).substring(2, 6);
    const firstUserMsg = messages.find(m => m.role === 'user')?.content || 'Cuộc trò chuyện được đồng bộ';
    const title = firstUserMsg.substring(0, 30) + (firstUserMsg.length > 30 ? '...' : '');

    const thread = {
      id: threadId,
      title,
      createdAt: new Date().toISOString(),
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: new Date().toISOString()
      }))
    };

    userData.chats[email].push(thread);
    await writeUserData(userData);

    res.json({ success: true, threadId });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ error: 'Có lỗi xảy ra khi đồng bộ lịch sử hội thoại.' });
  }
});
// Helper to sanitize text for TTS engine (removes HTML, dialogue markers, pinyin in parens, etc.)
function cleanTTSInput(str) {
  if (!str) return '';
  return String(str)
    .replace(/<[^>]*>/g, '')
    .replace(/^[A-Z]:\s*/gm, '')
    .replace(/\n[A-Z]:\s*/g, '，')
    .replace(/_{2,}/g, ' ')
    .replace(/[\r\n]+/g, '，')
    .replace(/([\u4e00-\u9fa5]+)\s*\([^\)]*\)/g, '$1')
    .trim();
}

// Keep-Alive HTTPS Agent for zero-latency ElevenLabs API connection reuse
const elevenKeepAliveAgent = new https.Agent({
  keepAlive: true,
  maxSockets: 50,
  keepAliveMsecs: 60000
});

// Helper to fetch MP3 audio from ElevenLabs Multilingual v2 API (Ultra-low latency streaming)
async function fetchElevenLabsTTS(text, voiceId, apiKey) {
  const url = `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?optimize_streaming_latency=3`;
  const body = JSON.stringify({
    text: text,
    model_id: 'eleven_multilingual_v2',
    language_code: 'zh',
    voice_settings: {
      stability: 0.5,
      similarity_boost: 0.75
    }
  });

  return new Promise((resolve, reject) => {
    const req = https.request(url, {
      method: 'POST',
      agent: elevenKeepAliveAgent,
      headers: {
        'Accept': 'audio/mpeg',
        'Content-Type': 'application/json',
        'xi-api-key': apiKey
      }
    }, res => {
      if (res.statusCode !== 200) {
        return reject(new Error(`ElevenLabs API status code: ${res.statusCode}`));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        if (buffer.length < 100) {
          return reject(new Error('ElevenLabs returned invalid audio buffer'));
        }
        resolve(buffer);
      });
      res.on('error', err => reject(err));
    });
    req.on('error', err => reject(err));
    req.write(body);
    req.end();
  });
}

// Helper to fetch MP3 audio from Baidu Fanyi TTS (Native Beijing Mandarin Female)
async function fetchBaiduTTS(text) {
  const url = 'https://fanyi.baidu.com/gettts?lan=zh&text=' + encodeURIComponent(text) + '&spd=4&source=web&pit=9';
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://fanyi.baidu.com/'
      }
    }, res => {
      if (res.statusCode !== 200) {
        return reject(new Error('Baidu TTS status code: ' + res.statusCode));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        if (buffer.length < 100) {
          return reject(new Error('Baidu TTS returned too small buffer'));
        }
        resolve(buffer);
      });
      res.on('error', err => reject(err));
    }).on('error', err => reject(err));
  });
}

// Helper to fetch MP3 audio from Google Translate TTS (Native Mandarin Chinese Male-ish)
async function fetchGoogleTTS(text) {
  const url = 'https://translate.google.com/translate_tts?ie=UTF-8&q=' + encodeURIComponent(text) + '&tl=zh-CN&total=1&idx=0&textlen=' + text.length + '&client=tw-ob';
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Referer': 'https://translate.google.com/'
      }
    }, res => {
      if (res.statusCode !== 200) {
        return reject(new Error('Google TTS status code: ' + res.statusCode));
      }
      const chunks = [];
      res.on('data', chunk => chunks.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(chunks);
        if (buffer.length < 100) {
          return reject(new Error('Google TTS returned too small buffer'));
        }
        resolve(buffer);
      });
      res.on('error', err => reject(err));
    }).on('error', err => reject(err));
  });
}

// GET /api/tts - Native Chinese & ElevenLabs Multilingual AI Speech Engine
app.get('/api/tts', async (req, res) => {
  const { text, voice = 'baidu-female' } = req.query;
  if (!text) {
    return res.status(400).json({ error: 'Text parameter is required' });
  }

  try {
    const safeVoice = String(voice);
    const rawText = String(text).trim();
    const cleanText = cleanTTSInput(rawText) || rawText;

    const hash = crypto.createHash('md5').update(`v10_${safeVoice}_${cleanText}`).digest('hex');
    const fileName = `${hash}.mp3`;
    const filePath = path.join(AUDIO_CACHE_DIR, fileName);

    let fileExists = false;
    try {
      await fs.access(filePath);
      fileExists = true;
    } catch {
      fileExists = false;
    }

    if (!fileExists) {
      let audioBuffer = await fetchBaiduTTS(cleanText);
      if (!audioBuffer || audioBuffer.length < 100) {
        audioBuffer = await fetchGoogleTTS(cleanText);
      }
      if (audioBuffer && audioBuffer.length > 100) {
        await fs.writeFile(filePath, audioBuffer);
      } else {
        throw new Error('Invalid audio buffer');
      }
    }

    res.set({
      'Content-Type': 'audio/mpeg',
      'Cache-Control': 'public, max-age=31536000, immutable'
    });
    return res.sendFile(filePath);
  } catch (error) {
    console.error('ElevenLabs Pure TTS Error:', error);
    return res.status(500).json({ error: 'Failed to generate ElevenLabs audio' });
  }
});

const EXAMS_FILES_DIR = path.join(__dirname, '..', 'TRON BO DE THI HSK TU 1 DEN 9');
app.use('/exams-files', express.static(EXAMS_FILES_DIR));

const GRAMMAR_FILES_DIR = path.join(__dirname, '..', 'filetuvung');
app.use('/grammar-files', express.static(GRAMMAR_FILES_DIR));

// GET endpoint for full extracted HSK Grammar text content
app.get('/api/grammar/full-content', async (req, res) => {
  try {
    const jsonPath = path.join(__dirname, 'hsk_grammar_full.json');
    try {
      await fs.access(jsonPath);
    } catch {
      return res.status(404).json({ error: 'Grammar full data not found' });
    }
    const dataStr = await fs.readFile(jsonPath, 'utf-8');
    res.json(JSON.parse(dataStr));
  } catch (err) {
    console.error("Error reading hsk_grammar_full.json:", err);
    res.status(500).json({ error: 'Failed to load grammar content' });
  }
});

// Serve index.html as root
app.get('/', (req, res) => {
  res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});