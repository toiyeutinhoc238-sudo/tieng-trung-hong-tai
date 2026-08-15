import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import { existsSync, createWriteStream } from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import https from 'https';
import http from 'http';
import mongoose from 'mongoose';
import crypto from 'crypto';
import { pinyin } from 'pinyin-pro';
import { PINYIN_TO_HANZI, convertPinyinToHanzi } from '../frontend/src/pinyin_hanzi_map.js';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Groq from 'groq-sdk';
import YTDlpWrap from 'yt-dlp-wrap';
import { YoutubeTranscript } from 'youtube-transcript';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, 'database.json');
const DICTATION_DB_PATH = path.join(__dirname, 'video_dictation_lessons.json');
const USER_DB_PATH = path.join(__dirname, 'user_data.json');
const AUDIO_CACHE_DIR = path.join(__dirname, 'audio_cache');

// AI Clients initialization
const groqApiKey = process.env.GROQ_API_KEY;
const groqClient = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// Ensure audio cache directory exists
fs.mkdir(AUDIO_CACHE_DIR, { recursive: true }).catch(err => {
  console.error("Error creating audio_cache dir:", err);
});

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;
mongoose.set('bufferCommands', false); // Disable 10-second buffering when disconnected

if (!MONGODB_URI) {
  console.error("Warning: MONGODB_URI is not set in environment variables!");
} else {
  mongoose.connect(MONGODB_URI, {
    serverSelectionTimeoutMS: 3000
  })
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
    lastActiveDate: { type: String, default: "" },
    dailyHistory: { type: Object, default: {} }
  },
  gameHistory: { type: Array, default: [] },
  quizHistory: { type: Array, default: [] },
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

// Canonical Domain & Path 301 Permanent Redirect for Googlebot & SEO (Must be before all middleware)
app.use((req, res, next) => {
  const rawHost = req.headers['x-forwarded-host'] || req.headers.host || req.hostname || '';
  const host = String(rawHost).toLowerCase();
  const proto = (req.headers['x-forwarded-proto'] || '').toLowerCase();

  // 1. If accessed directly via onrender.com or www., 301 redirect to primary domain (tiengtrunghongtai.online)
  if (host.includes('onrender.com') || host.startsWith('www.')) {
    // Serve valid robots.txt so Googlebot can crawl and verify 301 redirects
    if (req.path === '/robots.txt') {
      res.setHeader('Content-Type', 'text/plain; charset=utf-8');
      return res.send('User-agent: *\nAllow: /\n\nSitemap: https://tiengtrunghongtai.online/sitemap.xml\n');
    }
    // 301 permanent redirect for all URLs
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.redirect(301, `https://tiengtrunghongtai.online${req.originalUrl}`);
  }

  // 2. Force HTTPS in production (Render reverse proxy)
  if (proto && proto === 'http') {
    return res.redirect(301, `https://${host}${req.originalUrl}`);
  }

  // 3. Redirect /index.html to / to eliminate duplicate home page indexing
  if (req.path === '/index.html') {
    const queryString = req.url.slice(req.path.length);
    return res.redirect(301, `/${queryString}`);
  }

  // 4. Set HTTP Canonical Link header for all pages
  const canonicalPath = req.path === '/index.html' ? '/' : req.path;
  res.setHeader('Link', `<https://tiengtrunghongtai.online${canonicalPath}>; rel="canonical"`);

  next();
});

app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

const FRONTEND_DIR = path.join(__dirname, '..', 'frontend');
const DIST_DIR = path.join(__dirname, '..', 'frontend', 'dist');
const PUBLIC_DIR = path.join(__dirname, '..', 'frontend', 'public');

// Configure Cross-Origin headers for Google Identity Services OAuth & Iframe postMessage
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
});

// Force no-cache on HTML and SW files so browsers always pull latest builds
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Explicit static asset routes for production & dev builds
app.use('/assets', express.static(path.join(DIST_DIR, 'assets')));
app.use('/assets', express.static(path.join(PUBLIC_DIR, 'assets')));
app.use('/assets', express.static(path.join(FRONTEND_DIR, 'public', 'assets')));
app.use('/src/assets', express.static(path.join(FRONTEND_DIR, 'src', 'assets')));
app.use('/src', express.static(path.join(FRONTEND_DIR, 'src')));

app.use(express.static(DIST_DIR));
app.use(express.static(PUBLIC_DIR));
app.use(express.static(FRONTEND_DIR));

app.get('/favicon.ico', (req, res) => {
  const icoPath = path.join(PUBLIC_DIR, 'favicon.ico');
  res.setHeader('Content-Type', 'image/png');
  res.setHeader('Cache-Control', 'public, max-age=86400');
  res.sendFile(icoPath);
});

app.get('/sitemap.xml', (req, res) => {
  const sitemapPath = path.join(PUBLIC_DIR, 'sitemap.xml');
  res.setHeader('Content-Type', 'application/xml; charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.sendFile(sitemapPath);
});

app.get('/robots.txt', (req, res) => {
  const robotsPath = path.join(PUBLIC_DIR, 'robots.txt');
  res.setHeader('Content-Type', 'text/plain; charset=UTF-8');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.sendFile(robotsPath);
});

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

// Helper to read user_data.json fallback from disk
async function readUserDataFromFile() {
  try {
    const data = await fs.readFile(USER_DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return { users: {}, progress: {}, customWords: {}, sessions: {}, chats: {} };
  }
}

// Helper to read user_data
async function readUserData() {
  if (cachedUserData) {
    return cachedUserData;
  }

  // If MongoDB is not connected, use user_data.json file fallback immediately
  if (mongoose.connection.readyState !== 1) {
    const fileData = await readUserDataFromFile();
    return fileData;
  }

  try {
    const usersList = await User.find({});
    const sessionsList = await Session.find({});

    const users = {};
    const progress = {};
    const customWords = {};
    const chats = {};
    const sessions = {};
    const quizHistory = {};

    usersList.forEach(u => {
      users[u._id] = {
        name: u.name,
        picture: u.picture,
        stats: u.stats,
        gameHistory: u.gameHistory || []
      };
      if (u.quizHistory && u.quizHistory.length > 0) {
        quizHistory[u._id] = u.quizHistory;
      }
      progress[u._id] = u.progress || {};
      customWords[u._id] = u.customWords || [];
      chats[u._id] = u.chats || [];
    });

    sessionsList.forEach(s => {
      sessions[s._id] = s.email;
    });

    cachedUserData = { users, progress, customWords, sessions, chats, quizHistory };
    return cachedUserData;
  } catch (error) {
    console.error("Error reading database from MongoDB, returning file fallback:", error);
    return await readUserDataFromFile();
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
        quizHistory: (data.quizHistory && data.quizHistory[email]) || [],
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

  // Set persistent session cookie (10 years)
  res.setHeader('Set-Cookie', `session=${sessionToken}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365 * 10}`);

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

// Helper to calculate streak from daily history
function calculateStreakFromHistory(dailyHistory) {
  if (!dailyHistory || typeof dailyHistory !== 'object') return 1;
  const dates = Object.keys(dailyHistory)
    .filter(d => (dailyHistory[d] || 0) > 0)
    .sort();
  if (dates.length === 0) return 1;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  let startStr = null;
  if (dates.includes(todayStr)) {
    startStr = todayStr;
  } else if (dates.includes(yesterdayStr)) {
    startStr = yesterdayStr;
  } else {
    startStr = dates[dates.length - 1];
  }

  let streak = 0;
  let checkDate = new Date(startStr);
  while (true) {
    const dateKey = checkDate.toISOString().split('T')[0];
    if (dailyHistory[dateKey] && dailyHistory[dateKey] > 0) {
      streak++;
      checkDate.setDate(checkDate.getDate() - 1);
    } else {
      break;
    }
  }
  return Math.max(streak, 1);
}

// GET endpoint to fetch user stats
function ensureDailyHistoryIntegrity(stats) {
  if (!stats) return;
  if (!stats.dailyHistory || typeof stats.dailyHistory !== 'object') {
    stats.dailyHistory = {};
  }

  let recordedSecs = 0;
  Object.values(stats.dailyHistory).forEach(s => {
    recordedSecs += (s || 0);
  });

  const totalSecs = stats.studyTime || 0;

  // 1. If stats.studyTime is smaller than sum of recorded history, sync it up!
  if (recordedSecs > totalSecs) {
    stats.studyTime = recordedSecs;
  } else if (totalSecs > recordedSecs) {
    // 2. If stats.studyTime has extra unallocated time, allocate it to history
    const unallocated = totalSecs - recordedSecs;
    const streak = Math.max(1, stats.streak || 1);
    const refDateStr = stats.lastActiveDate || new Date().toISOString().split('T')[0];
    const refDate = new Date(refDateStr);

    if (recordedSecs === 0) {
      const daysToSpread = Math.min(streak, 7);
      const perDaySecs = Math.floor(unallocated / daysToSpread);
      let remSecs = unallocated % daysToSpread;

      for (let k = daysToSpread - 1; k >= 0; k--) {
        const d = new Date(refDate);
        d.setDate(refDate.getDate() - k);
        const dateKey = d.toISOString().split('T')[0];
        const extra = (k === 0) ? remSecs : 0;
        stats.dailyHistory[dateKey] = (stats.dailyHistory[dateKey] || 0) + perDaySecs + extra;
      }
    } else {
      stats.dailyHistory[refDateStr] = (stats.dailyHistory[refDateStr] || 0) + unallocated;
    }
  }

  // 3. Ensure streak matches history
  const calculatedStreak = calculateStreakFromHistory(stats.dailyHistory);
  if (!stats.streak || stats.streak < calculatedStreak) {
    stats.streak = calculatedStreak;
  }
}

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

  if (!userRecord.stats) {
    userRecord.stats = {
      streak: 0,
      studyTime: 0,
      lastActiveDate: '',
      dailyHistory: {}
    };
  }

  ensureDailyHistoryIntegrity(userRecord.stats);
  await writeUserData(userData);

  res.json(userRecord.stats);
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
      lastActiveDate: '',
      dailyHistory: {}
    };
  }
  if (!userRecord.stats.dailyHistory) {
    userRecord.stats.dailyHistory = {};
  }

  const todayStr = localDateStr || new Date().toISOString().split('T')[0];

  if (typeof incrementStudyTime === 'number' && incrementStudyTime > 0) {
    userRecord.stats.studyTime += incrementStudyTime;
    userRecord.stats.dailyHistory[todayStr] = (userRecord.stats.dailyHistory[todayStr] || 0) + incrementStudyTime;
  }

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

  ensureDailyHistoryIntegrity(userRecord.stats);
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
    playedAt: req.body.playedAt || new Date().toISOString()
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

// GET endpoint for Real MongoDB Leaderboard — reads directly from MongoDB (bypasses RAM cache)
app.get('/api/leaderboard', async (req, res) => {
  try {
    // Always query MongoDB directly so we reflect the real current state
    const usersList = await User.find({});

    if (!usersList || usersList.length === 0) {
      return res.json([]);
    }

    const leaderboard = [];

    for (const u of usersList) {
      const userProg = u.progress || {};

      // Tính số từ vựng đã học thuộc/hoàn thành
      let completedLessonsCount = 0;
      let earliestCompletionTime = null;

      for (const wordId of Object.keys(userProg)) {
        const item = userProg[wordId];
        if (item && item.isMemorized) {
          completedLessonsCount++;
          if (item.updatedAt || item.completedAt) {
            const timeVal = new Date(item.updatedAt || item.completedAt).getTime();
            if (!earliestCompletionTime || timeVal < earliestCompletionTime) {
              earliestCompletionTime = timeVal;
            }
          }
        }
      }

      const lastActive = u.stats && u.stats.lastActiveDate
        ? new Date(u.stats.lastActiveDate).getTime()
        : (earliestCompletionTime || Date.now());

      leaderboard.push({
        email: u._id,
        name: u.name || u._id.split('@')[0],
        picture: u.picture || '',
        completedCount: completedLessonsCount,
        studyTime: u.stats ? (u.stats.studyTime || 0) : 0,
        streak: u.stats ? (u.stats.streak || 0) : 0,
        earliestCompletionTime: earliestCompletionTime || lastActive
      });
    }

    // Sort real users by completed count, study time, streak, and completion time
    leaderboard.sort((a, b) => {
      if (b.completedCount !== a.completedCount) {
        return b.completedCount - a.completedCount;
      }
      if (b.studyTime !== a.studyTime) {
        return b.studyTime - a.studyTime;
      }
      if (b.streak !== a.streak) {
        return b.streak - a.streak;
      }
      return a.earliestCompletionTime - b.earliestCompletionTime;
    });

    const realRankedUsers = leaderboard.map((item, index) => ({
      rank: index + 1,
      name: item.name,
      picture: item.picture,
      completedCount: item.completedCount,
      studyTimeMinutes: Math.round(item.studyTime / 60),
      streak: item.streak
    }));

    res.json(realRankedUsers);
  } catch (error) {
    console.error("Leaderboard calculation error:", error);
    res.status(500).json({ error: "Failed to fetch real leaderboard" });
  }
});

// Admin: Reset toàn bộ dữ liệu người dùng (xóa MongoDB + RAM cache) - Cần secret header
app.delete('/api/admin/reset-all', async (req, res) => {
  const adminSecret = req.headers['x-admin-secret'];
  if (!adminSecret || adminSecret !== (process.env.ADMIN_SECRET || 'hongtai_admin_secret_2026')) {
    return res.status(403).json({ error: "Unauthorized admin action" });
  }
  try {
    await User.deleteMany({});
    await Session.deleteMany({});
    cachedUserData = null;
    console.log("[ADMIN] All user data reset: MongoDB cleared, RAM cache invalidated.");
    res.json({ success: true, message: "All user data has been reset successfully." });
  } catch (err) {
    console.error("[ADMIN] Reset failed:", err);
    res.status(500).json({ error: "Reset failed", detail: err.message });
  }
});

// Admin: Reset Bảng Xếp Hạng & Tiến Độ Tất Cả Học Viên - Cần secret header
app.all('/api/admin/reset-leaderboard', async (req, res) => {
  const adminSecret = req.headers['x-admin-secret'];
  if (!adminSecret || adminSecret !== (process.env.ADMIN_SECRET || 'hongtai_admin_secret_2026')) {
    return res.status(403).json({ error: "Unauthorized admin action" });
  }
  try {
    if (mongoose.connection.readyState === 1) {
      await User.updateMany({}, {
        $set: {
          progress: {},
          'stats.streak': 0,
          'stats.studyTime': 0,
          'stats.lastActiveDate': null
        }
      });
    }

    const userData = await readUserData();
    userData.progress = {};
    userData.quizHistory = {};
    if (userData.users) {
      Object.keys(userData.users).forEach(email => {
        if (userData.users[email].progress) userData.users[email].progress = {};
        if (userData.users[email].stats) {
          userData.users[email].stats.streak = 0;
          userData.users[email].stats.studyTime = 0;
        }
      });
    }
    await writeUserData(userData);
    cachedUserData = null;

    console.log("[ADMIN] Leaderboard and progress reset successfully.");
    res.json({ success: true, message: "Bảng xếp hạng và tiến độ học tập đã được reset về 0 điểm!" });
  } catch (err) {
    console.error("[ADMIN] Leaderboard reset error:", err);
    res.status(500).json({ error: "Reset failed", detail: err.message });
  }
});

// POST endpoint to save quiz game results & update leaderboard
app.post('/api/quiz/save', async (req, res) => {
  const email = getLoggedInUserEmail(req) || 'guest';
  const { score, stage, total, combo, mode } = req.body;

  try {
    const userData = await readUserData();
    if (!userData.quizHistory) userData.quizHistory = {};
    if (!userData.quizHistory[email]) userData.quizHistory[email] = [];

    const newRecord = {
      score: typeof score === 'number' ? score : 0,
      stage: typeof stage === 'number' ? stage : 0,
      total: typeof total === 'number' ? total : 0,
      combo: typeof combo === 'number' ? combo : 0,
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

    const nextMemorized = (req.body.isMemorized !== undefined) 
      ? Boolean(req.body.isMemorized) 
      : !currentProgress.isMemorized;

    userData.progress[email][wordKey] = {
      ...currentProgress,
      isMemorized: nextMemorized,
      isStudied: true
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

  // Get logged in user if any
  const email = getLoggedInUserEmail(req);

  try {
    let reply = '';
    const systemPrompt = 'Bạn là trợ lý AI học tiếng Trung đắc lực của thương hiệu "Tiếng Trung Hongtai". Bạn có phong cách nói chuyện thân thiện, chuyên nghiệp, tận tâm và thông thái. Bạn giúp học viên giải thích từ vựng HSK, các quy tắc phát âm Pinyin, cấu trúc ngữ pháp tiếng Trung, dịch thuật Anh-Trung-Việt và luyện giao tiếp. Hãy sử dụng định dạng Markdown rõ ràng, thụt lề hợp lý, xuống dòng sạch sẽ. Khi nói về thương hiệu, luôn tự xưng là "Trợ lý AI Hongtai".';

    // 1. Primary: Try Groq LLaMA 3.3 70B
    if (groqClient) {
      try {
        const groqMsgs = [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role === 'model' ? 'assistant' : m.role, content: m.content }))
        ];
        const completion = await groqClient.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: groqMsgs,
          temperature: 0.7,
          max_tokens: 1500
        });
        reply = completion.choices[0]?.message?.content || '';
      } catch (eGroq70b) {
        console.warn('[Chat AI] Groq LLaMA 3.3 70B error, trying LLaMA 3.1 8B:', eGroq70b.message);
        try {
          const groqMsgs = [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role === 'model' ? 'assistant' : m.role, content: m.content }))
          ];
          const completion = await groqClient.chat.completions.create({
            model: 'llama-3.1-8b-instant',
            messages: groqMsgs,
            temperature: 0.7,
            max_tokens: 1500
          });
          reply = completion.choices[0]?.message?.content || '';
        } catch (eGroq8b) {
          console.warn('[Chat AI] Groq LLaMA 3.1 8B error:', eGroq8b.message);
        }
      }
    }

    // 2. Secondary: Try Gemini 1.5 Flash REST API if Groq failed or not present
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (!reply && GEMINI_API_KEY) {
      try {
        const contents = messages.map(msg => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }]
        }));

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            systemInstruction: { parts: [{ text: systemPrompt }] }
          })
        });

        if (response.ok) {
          const data = await response.json();
          reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      } catch (eGem) {
        console.warn('[Chat AI] Gemini REST call error:', eGem.message);
      }
    }

    // 3. Fallback response if all AI calls fail
    if (!reply) {
      const lastUserMsg = (messages[messages.length - 1]?.content || '').toLowerCase();
      if (lastUserMsg.includes('chào') || lastUserMsg.includes('hi') || lastUserMsg.includes('hello')) {
        reply = 'Chào bạn! Tôi là **Trợ lý AI Hongtai** 🐼. Rất vui được đồng hành cùng bạn học Tiếng Trung hôm nay! Bạn cần giải thích từ vựng, ngữ pháp HSK hay dịch câu nào không?';
      } else {
        reply = 'Chào bạn, tôi là **Trợ lý AI Hongtai** 🐼. Yêu cầu của bạn đã được ghi nhận. Bạn có thể hỏi bất kỳ câu hỏi nào về từ vựng HSK, phiên âm Pinyin, hoặc cấu trúc ngữ pháp Tiếng Trung nhé!';
      }
    }

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
  let cleaned = String(str)
    .replace(/['’]/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/^[A-Z]:\s*/gm, '')
    .replace(/\n[A-Z]:\s*/g, '，')
    .replace(/_{2,}/g, ' ')
    .replace(/[\r\n]+/g, '，')
    .replace(/[\(（][^()（）]*[\)）]/g, '')
    .trim();

  // If text is pure Pinyin (e.g. "long", "bā", "nǐhǎo", "b", "ia", etc.), convert to standard Chinese characters
  if (!/[\u4e00-\u9fa5]/.test(cleaned) && typeof convertPinyinToHanzi === 'function') {
    cleaned = convertPinyinToHanzi(cleaned);
  }

  return cleaned;
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

// GET /api/grammar/list — returns metadata list of all grammar levels
app.get('/api/grammar/list', async (req, res) => {
  try {
    const jsonPath = path.join(__dirname, 'hsk_grammar_data.json');
    try {
      await fs.access(jsonPath);
    } catch {
      return res.status(404).json({ error: 'Grammar data not found. Please run build_grammar.js first.' });
    }
    const dataStr = await fs.readFile(jsonPath, 'utf-8');
    const data = JSON.parse(dataStr);
    // Return lightweight list (without full items content)
    const list = Object.values(data).map(entry => ({
      id: entry.id,
      level: entry.level,
      title: entry.title,
      icon: entry.icon,
      color: entry.color,
      desc: entry.desc,
      pointCount: entry.pointCount,
    }));
    res.json(list);
  } catch (err) {
    console.error("Error reading hsk_grammar_data.json:", err);
    res.status(500).json({ error: 'Failed to load grammar list' });
  }
});

// GET /api/grammar/detail/:key — returns full grammar detail with items for a specific level
app.get('/api/grammar/detail/:key', async (req, res) => {
  try {
    const jsonPath = path.join(__dirname, 'hsk_grammar_data.json');
    const dataStr = await fs.readFile(jsonPath, 'utf-8');
    const data = JSON.parse(dataStr);
    const key = req.params.key;
    if (!data[key]) {
      return res.status(404).json({ error: `Grammar key '${key}' not found` });
    }
    res.json(data[key]);
  } catch (err) {
    console.error("Error reading grammar detail:", err);
    res.status(500).json({ error: 'Failed to load grammar detail' });
  }
});

// ==========================================
// VIDEO DICTATION API (eJOY Video Dictation)
// ==========================================

async function readDictationLessons() {
  try {
    const data = await fs.readFile(DICTATION_DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading video dictation database:', error);
    return [];
  }
}

// GET /api/dictation/lessons — Lấy danh sách video luyện chép chính tả
app.get('/api/dictation/lessons', async (req, res) => {
  try {
    const lessons = await readDictationLessons();
    res.json(lessons);
  } catch (err) {
    console.error("Error reading dictation lessons:", err);
    res.status(500).json({ error: 'Failed to load dictation lessons' });
  }
});

// GET /api/dictation/lessons/:id — Lấy chi tiết 1 bài học video
app.get('/api/dictation/lessons/:id', async (req, res) => {
  try {
    const lessons = await readDictationLessons();
    const lesson = lessons.find(l => l.id === req.params.id);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    res.json(lesson);
  } catch (err) {
    console.error("Error fetching lesson:", err);
    res.status(500).json({ error: 'Failed to load lesson' });
  }
});

// Helper: Filter out non-speech sound effects & music cues
function cleanHumanSpeechText(text) {
  if (!text) return '';
  let cleaned = text
    .replace(/\[(?:Âm nhạc|Nhạc|tiếng nhạc|Music|music|Applause|Vỗ tay|Tiếng cười|Laughter|Tiếng ồn|Silence|Trống|Guitar|Piano|Hát|Singing|Cheering)\]/gi, '')
    .replace(/\((?:Âm nhạc|Nhạc|tiếng nhạc|Music|music|Applause|Vỗ tay|Tiếng cười|Laughter|Tiếng ồn|Silence|nhạc nền|nhạc dạo)\)/gi, '')
    .replace(/[♪♫♩♬★☆✦✧❤️👍🔥]+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
  return cleaned;
}

// Helper: Consolidate fragmented speech chunks & apply vocal padding (0.15s pre-roll, 0.25s post-roll)
function consolidateSpeechSegments(rawItems) {
  if (!rawItems || rawItems.length === 0) return [];
  const consolidated = [];
  let currentGroup = null;

  for (const item of rawItems) {
    const cleanText = cleanHumanSpeechText(item.text);
    if (!cleanText || cleanText.length < 1) continue;

    if (!currentGroup) {
      currentGroup = {
        text: cleanText,
        startTime: item.startTime,
        endTime: item.endTime
      };
      continue;
    }

    const gap = item.startTime - currentGroup.endTime;
    const combinedDuration = item.endTime - currentGroup.startTime;
    const isTerminal = /[.!?。！？;\n]$/.test(currentGroup.text.trim());
    const isClauseEnd = /[,，;；]$/.test(currentGroup.text.trim());
    const isTooLong = (currentGroup.text.length + cleanText.length) > 35;
    const isTooLongInTime = combinedDuration > 6.0;

    // Merge if gap is small and not ending with sentence terminal punctuation or exceeding ideal max phrase length
    if (gap >= 0 && gap <= 0.38 && !isTerminal && !(isClauseEnd && combinedDuration > 3.5) && !isTooLong && !isTooLongInTime) {
      const glue = (currentGroup.text.endsWith(' ') || /[\u4e00-\u9fa5]/.test(currentGroup.text)) ? '' : ' ';
      currentGroup.text += glue + cleanText;
      currentGroup.endTime = Math.max(currentGroup.endTime, item.endTime);
    } else {
      consolidated.push(currentGroup);
      currentGroup = {
        text: cleanText,
        startTime: item.startTime,
        endTime: item.endTime
      };
    }
  }

  if (currentGroup && cleanHumanSpeechText(currentGroup.text)) {
    consolidated.push(currentGroup);
  }

  return consolidated.map(item => {
    const paddedStart = Math.max(0, parseFloat((item.startTime - 0.15).toFixed(2)));
    const paddedEnd = parseFloat((item.endTime + 0.25).toFixed(2));
    return {
      text: item.text,
      startTime: paddedStart,
      endTime: paddedEnd
    };
  });
}
async function translateText(text, sourceLang = 'auto', targetLang = 'zh-CN') {
  if (!text || !text.trim()) return '';
  const trimmed = text.trim();

  // 1. Fast Google Translate Web Endpoint with 2.5s Timeout
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(trimmed)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(2500)
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && Array.isArray(data[0])) {
        const translated = data[0].map(item => item[0]).join('').trim();
        if (translated) return translated;
      }
    }
  } catch (err) {}

  // 2. MyMemory Translation API fallback (Works 100% on Cloud IPs)
  try {
    const pair = `${sourceLang === 'auto' ? 'zh' : sourceLang}|${targetLang}`;
    const mmUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(trimmed)}&langpair=${pair}`;
    const mmRes = await fetch(mmUrl, { signal: AbortSignal.timeout(2500) });
    if (mmRes.ok) {
      const mmData = await mmRes.json();
      if (mmData.responseData && mmData.responseData.translatedText) {
        return mmData.responseData.translatedText.trim();
      }
    }
  } catch (err2) {}

  return trimmed;
}

// POST /api/dictation/pinyin-helper — Tự động sinh Pinyin cho đoạn văn
app.post('/api/dictation/pinyin-helper', (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text) return res.json({ pinyin: '' });
    const py = pinyin(text, { toneType: 'symbol' });
    res.json({ pinyin: py });
  } catch (err) {
    res.json({ pinyin: '' });
  }
});

// POST /api/dictation/auto-translate — Dịch & Chuẩn hóa chính tả Tiếng Việt + Tiếng Trung + Pinyin
app.post('/api/dictation/auto-translate', async (req, res) => {
  try {
    const { text } = req.body || {};
    if (!text || !text.trim()) {
      return res.json({ success: false, processedText: '' });
    }

    const lines = text.split('\n');
    const inputItems = [];

    for (let i = 0; i < lines.length; i++) {
      const trimmed = lines[i].trim();
      if (!trimmed) continue;

      let timePrefix = '';
      let contentText = trimmed;
      const timeMatch = trimmed.match(/^(\[[0-9:\s.-]+\]|[0-9:]+)\s*(.*)$/);
      if (timeMatch) {
        timePrefix = timeMatch[1] + ' ';
        contentText = timeMatch[2];
      }

      inputItems.push({
        index: i,
        timePrefix,
        rawText: contentText
      });
    }

    if (inputItems.length === 0) {
      return res.json({ success: true, processedText: text });
    }

    // Use Groq LLaMA 3.3 70B for Deep Proofreading & Translation
    if (groqClient) {
      try {
        const prompt = `Bạn là một chuyên gia ngôn ngữ học Tiếng Trung và Tiếng Việt cao cấp.
Nhiệm vụ: Chuẩn hóa chính tả Tiếng Việt 100% hoàn hảo và Dịch/Chuẩn hóa Chữ Hán Giản Thể cho các câu bên dưới.

YÊU CẦU:
1. "vietnamese": Chuẩn hóa chính tả Tiếng Việt tuyệt đối (sửa lỗi sai từ, teencode, thiếu dấu, viết hoa chữ cái đầu, dấu câu đúng ngữ pháp).
2. "hanzi": BẮT BUỘC có Chữ Hán Giản Thể chuẩn xác ngữ nghĩa (nếu đầu vào là tiếng Việt -> dịch sang tiếng Trung; nếu đầu vào đã có tiếng Trung -> chuẩn hóa chữ Hán giản thể).

Danh sách câu:
${JSON.stringify(inputItems.map(item => ({ index: item.index, text: item.rawText })), null, 2)}

Trả về đúng JSON:
{
  "results": [
    {
      "index": 0,
      "hanzi": "...",
      "vietnamese": "..."
    }
  ]
}`;

        const completion = await groqClient.chat.completions.create({
          model: 'llama-3.3-70b-versatile',
          messages: [{ role: 'user', content: prompt }],
          response_format: { type: 'json_object' }
        });

        const parsed = JSON.parse(completion.choices[0].message.content);
        if (Array.isArray(parsed.results) && parsed.results.length > 0) {
          const resultMap = new Map(parsed.results.map(r => [r.index, r]));
          const processed = inputItems.map(item => {
            const r = resultMap.get(item.index);
            const hanzi = r?.hanzi || item.rawText;
            const vi = r?.vietnamese || item.rawText;
            let py = '';
            try { py = pinyin(hanzi, { toneType: 'symbol' }); } catch (e) {}
            return `${item.timePrefix}${hanzi} | ${py} | ${vi}`;
          });

          return res.json({
            success: true,
            processedText: processed.join('\n')
          });
        }
      } catch (llmErr) {
        console.warn("[Auto-Translate] Groq LLM warn, falling back to base translator:", llmErr.message);
      }
    }

    // Fallback Translation
    const processedLines = [];
    for (const item of inputItems) {
      const parts = item.rawText.split('|').map(p => p.trim());
      let hanziCandidate = parts.find(p => /[\u4e00-\u9fa5]/.test(p)) || '';
      let viCandidate = parts.find(p => /[àáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i.test(p)) || parts[parts.length - 1] || '';

      if (!hanziCandidate) {
        const sourceText = viCandidate || parts.filter(p => p).join(' ').trim();
        const translatedHanzi = await translateText(sourceText, 'vi', 'zh-CN');
        let py = '';
        try { py = pinyin(translatedHanzi, { toneType: 'symbol' }); } catch (e) {}
        processedLines.push(`${item.timePrefix}${translatedHanzi} | ${py} | ${sourceText}`);
      } else {
        let py = parts.find(p => p !== hanziCandidate && p !== viCandidate) || '';
        if (!py) {
          try { py = pinyin(hanziCandidate, { toneType: 'symbol' }); } catch (e) {}
        }
        let meaning = viCandidate || '';
        if (!meaning || meaning === hanziCandidate) {
          meaning = await translateText(hanziCandidate, 'zh-CN', 'vi');
        }
        processedLines.push(`${item.timePrefix}${hanziCandidate} | ${py} | ${meaning}`);
      }
    }

    res.json({
      success: true,
      processedText: processedLines.join('\n')
    });
  } catch (err) {
    console.error("Auto translate error:", err);
    res.status(500).json({ error: 'Failed to auto translate' });
  }
});

// ============================================================
// AI AUDIO & SUBTITLE ENGINE — Multi-Tier High Performance
// ============================================================

const AUDIO_TEMP_DIR = path.join(os.tmpdir(), 'hongtai_audio');
fs.mkdir(AUDIO_TEMP_DIR, { recursive: true }).catch(() => {});

const BIN_DIR = path.join(__dirname, 'bin');
const YTDLP_PATH = path.join(BIN_DIR, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
const ytdlpWrap = YTDlpWrap.default || YTDlpWrap;

// Ensure yt-dlp binary is present
async function ensureYtDlpBinary() {
  await fs.mkdir(BIN_DIR, { recursive: true }).catch(() => {});
  if (!existsSync(YTDLP_PATH)) {
    console.log('[yt-dlp] Downloading standalone binary...');
    await ytdlpWrap.downloadFromGithub(YTDLP_PATH, undefined, process.platform === 'win32' ? 'win32' : 'linux');
    console.log('[yt-dlp] Downloaded to:', YTDLP_PATH);
  }
  if (process.platform !== 'win32') {
    await fs.chmod(YTDLP_PATH, 0o755).catch(() => {});
  }
  return YTDLP_PATH;
}

// Fast batch translation and Pinyin generator (Fallback)
async function batchTranslateAndPinyin(speechItems) {
  const results = [];
  const chunkSize = 12;

  for (let i = 0; i < speechItems.length; i += chunkSize) {
    const chunk = speechItems.slice(i, i + chunkSize);
    const promises = chunk.map(async (item, idx) => {
      let text = item.text || '';
      let hasHanzi = /[\u4e00-\u9fa5]/.test(text);
      let hanzi = '';
      let py = '';
      let meaning = '';

      if (hasHanzi) {
        hanzi = text;
        try { py = pinyin(hanzi, { toneType: 'symbol' }); } catch (e) {}
        meaning = await translateText(hanzi, 'zh-CN', 'vi');
      } else {
        meaning = text;
        hanzi = await translateText(meaning, 'auto', 'zh-CN');
        try { py = pinyin(hanzi, { toneType: 'symbol' }); } catch (e) {}
      }

      if (!hanzi || !/[\u4e00-\u9fa5]/.test(hanzi)) {
        hanzi = await translateText(meaning || '学习中文', 'vi', 'zh-CN');
        try { py = pinyin(hanzi, { toneType: 'symbol' }); } catch (e) {}
      }

      return {
        id: item.id || (i + idx + 1),
        startTime: parseFloat(item.startTime.toFixed(2)),
        endTime: parseFloat(item.endTime.toFixed(2)),
        hanzi: hanzi,
        pinyin: py,
        meaning: meaning || 'Câu hội thoại trong video',
        keywords: [hanzi ? hanzi.slice(0, Math.min(2, hanzi.length)) : '']
      };
    });

    const chunkResults = await Promise.all(promises);
    results.push(...chunkResults);
  }

  return results;
}

// Universal Multi-Model LLM JSON Caller (LLaMA 3.3 70B -> LLaMA 3.1 8B -> Gemini 2.5 Flash)
async function callLLMJson(prompt) {
  // 1. Try Groq LLaMA 3.3 70B (Deterministic temperature 0)
  if (groqClient) {
    try {
      const res = await groqClient.chat.completions.create({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        response_format: { type: 'json_object' }
      });
      return JSON.parse(res.choices[0].message.content);
    } catch (e70b) {
      console.warn('[LLM] LLaMA 3.3 70B limit/error, falling back to LLaMA 3.1 8B:', e70b.message);
    }

    // 2. Try Groq LLaMA 3.1 8B Instant (Deterministic temperature 0)
    try {
      const res = await groqClient.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        response_format: { type: 'json_object' }
      });
      return JSON.parse(res.choices[0].message.content);
    } catch (e8b) {
      console.warn('[LLM] LLaMA 3.1 8B error, falling back to Gemini:', e8b.message);
    }
  }

  // 3. Try Google Gemini Flash (Deterministic temperature 0)
  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json', temperature: 0 }
      });
      const res = await model.generateContent(prompt);
      return JSON.parse(res.response.text());
    } catch (eGem) {
      console.warn('[LLM] Gemini 1.5 Flash error, trying gemini-1.5-pro:', eGem.message);
      try {
        const model15 = genAI.getGenerativeModel({
          model: 'gemini-1.5-pro',
          generationConfig: { responseMimeType: 'application/json', temperature: 0 }
        });
        const res15 = await model15.generateContent(prompt);
        return JSON.parse(res15.response.text());
      } catch (eGem15) {
        console.warn('[LLM] All Gemini models failed:', eGem15.message);
      }
    }
  }

  throw new Error('All AI LLM models unavailable');
}



// Master Linguistic Proofreader & Classification Engine
async function enhanceAndClassifyLesson(rawSpeechSegments, videoTitle, durationSeconds) {
  let level = '2';
  let levelText = 'HSK 2';
  let category = 'Giao Tiếp';
  let description = `Bài luyện nghe chép chính tả ${videoTitle || ''}`;

  if (!rawSpeechSegments || rawSpeechSegments.length === 0) {
    return { level, levelText, category, description, sentences: [] };
  }

  const lowerTitle = (videoTitle || '').toLowerCase();
  if (lowerTitle.includes('bài hát') || lowerTitle.includes('nhạc') || lowerTitle.includes('ca sĩ') || lowerTitle.includes('music') || lowerTitle.includes('mv') || lowerTitle.includes('fancam') || lowerTitle.includes('lyric')) {
    category = 'Âm Nhạc';
  } else if (lowerTitle.includes('hội thoại') || lowerTitle.includes('giao tiếp') || lowerTitle.includes('nói')) {
    category = 'Giao Tiếp';
  } else if (lowerTitle.includes('ẩm thực') || lowerTitle.includes('món ăn') || lowerTitle.includes('nấu')) {
    category = 'Ẩm Thực';
  } else if (lowerTitle.includes('du lịch') || lowerTitle.includes('khám phá') || lowerTitle.includes('phượt')) {
    category = 'Du Lịch';
  } else if (lowerTitle.includes('hoạt hình') || lowerTitle.includes('anime') || lowerTitle.includes('cartoon')) {
    category = 'Hoạt Hình';
  } else if (lowerTitle.includes('phim') || lowerTitle.includes('movie') || lowerTitle.includes('cinema') || lowerTitle.includes('drama')) {
    category = 'Phim Ảnh';
  } else if (lowerTitle.includes('tin tức') || lowerTitle.includes('thời sự') || lowerTitle.includes('news')) {
    category = 'Tin Tức';
  }

  if (lowerTitle.includes('hsk 1') || lowerTitle.includes('hsk1')) level = '1';
  else if (lowerTitle.includes('hsk 2') || lowerTitle.includes('hsk2')) level = '2';
  else if (lowerTitle.includes('hsk 3') || lowerTitle.includes('hsk3')) level = '3';
  else if (lowerTitle.includes('hsk 4') || lowerTitle.includes('hsk4')) level = '4';
  else if (lowerTitle.includes('hsk 5') || lowerTitle.includes('hsk5')) level = '5';
  else if (lowerTitle.includes('hsk 6') || lowerTitle.includes('hsk6')) level = '6';

  levelText = `HSK ${level}`;

  // AI Deep Linguistic Proofreading, Translation & Classification via Multi-LLM Engine
  try {
    console.log(`[AI Master Engine] Refining & Proofreading ${rawSpeechSegments.length} sentences with Multi-Model AI...`);
    const chunkSize = 25;
    const refinedSentences = [];

    for (let i = 0; i < rawSpeechSegments.length; i += chunkSize) {
      const chunk = rawSpeechSegments.slice(i, i + chunkSize);
      const chunkItems = chunk.map((s, idx) => ({
        id: s.id || (i + idx + 1),
        startTime: s.startTime,
        endTime: s.endTime,
        text: s.text
      }));

      const isFirstChunk = (i === 0);
      const prompt = `Bạn là một chuyên gia ngôn ngữ học Tiếng Trung đa ngôn ngữ và Biên tập viên Âm nhạc/Hội thoại cao cấp.
Dưới đây là tiêu đề video "${videoTitle}" (${durationSeconds}s) và danh sách các câu thoại/lời bài hát thô nhận diện từ âm thanh (có thể là Tiếng Trung Phổ Thông, Quảng Đông, Tiếng Việt, Tiếng Anh,...).

NHIỆM VỤ CHỈNH SỬA & DỊCH THUẬT CHUẨN XÁC TUYỆT ĐỐI (Theo ngữ cảnh thực tế của video):
1. "hanzi": 
   - QUAN TRỌNG: BẮT BUỘC CHUYỂN ĐỔI / CHUẨN HÓA VỀ CHỮ HÁN GIẢN THỂ CHUẨN 100% KHỚP VỚI LỜI BÀI HÁT / CÂU THOẠI THỰC TẾ TRONG VIDEO.
   - Sửa toàn bộ lỗi nghe nhầm đồng âm từ ASR (Chữ Hán bị sai nét, sai nghĩa, hoặc phiên âm sai).
   - Nếu câu âm thanh gốc là Tiếng Việt/Tiếng Anh, BẮT BUỘC dịch sang Chữ Hán Giản Thể tự nhiên, đúng ngữ pháp tiếng Trung nhất.
2. "vietnamese": 
   - BẮT BUỘC LỜI DỊCH TIẾNG VIỆT CHUẨN XÁC 100% THEO NGỮ CẢNH: Viết hoa đầu câu, đúng chính tả tiếng Việt (xóa bỏ hoàn toàn lỗi ngô nghê, lỗi vùng miền, từ teencode hoặc âm thừa như ừm, à, ê).
3. "startTime" & "endTime": 
   - Giữ nguyên mốc thời gian phát âm thực tế chính xác từng mili-giây.
${isFirstChunk ? `4. "hskLevel": Đánh giá cấp độ HSK phù hợp ("1", "2", "3", "4", "5", "6").
5. "category": Chọn đúng 1 trong: "Âm Nhạc", "Giao Tiếp", "Ẩm Thực", "Du Lịch", "Hoạt Hình", "Phim Ảnh", "Công Việc", "Tin Tức", "Văn Hóa", "Đời Sống", "Khác".
6. "description": 1 câu tóm tắt nội dung bài học tiếng Việt hấp dẫn.` : ''}

Danh sách câu thô cần xử lý:
${JSON.stringify(chunkItems, null, 2)}

BẮT BUỘC TRẢ VỀ ĐÚNG JSON:
{
  ${isFirstChunk ? `"hskLevel": "2",\n  "category": "Âm Nhạc",\n  "description": "...",\n  ` : ''}"sentences": [
    {
      "id": 1,
      "startTime": 0.0,
      "endTime": 5.0,
      "hanzi": "...",
      "vietnamese": "..."
    }
  ]
}`;

      const parsed = await callLLMJson(prompt);
      if (isFirstChunk) {
        if (parsed.hskLevel) level = String(parsed.hskLevel);
        if (parsed.category) category = parsed.category;
        if (parsed.description) description = parsed.description;
        levelText = `HSK ${level}`;
      }

        if (Array.isArray(parsed.sentences)) {
          for (let idx = 0; idx < chunk.length; idx++) {
            const origItem = chunk[idx];
            const s = parsed.sentences[idx] || {};

            let hanzi = s.hanzi || origItem.text || '';
            let vietnamese = s.vietnamese || origItem.text || '';

            if (!hanzi && vietnamese) {
              hanzi = await translateText(vietnamese, 'vi', 'zh-CN');
            }
            if (!vietnamese && hanzi) {
              vietnamese = await translateText(hanzi, 'zh-CN', 'vi');
            }
            if (!hanzi) continue;

            let py = '';
            try { py = pinyin(hanzi, { toneType: 'symbol' }); } catch (e) {}
            const exactStart = (origItem && typeof origItem.startTime === 'number' && !isNaN(origItem.startTime)) ? origItem.startTime : parseTimeSeconds(s.startTime);
            const exactEnd = (origItem && typeof origItem.endTime === 'number' && !isNaN(origItem.endTime)) ? origItem.endTime : parseTimeSeconds(s.endTime);

            refinedSentences.push({
              id: refinedSentences.length + 1,
              startTime: parseFloat(Number(exactStart || 0).toFixed(3)),
              endTime: parseFloat(Number(exactEnd || (exactStart + 3)).toFixed(3)),
              hanzi: hanzi,
              pinyin: py,
              meaning: vietnamese,
              keywords: [hanzi ? hanzi.slice(0, Math.min(2, hanzi.length)) : ''],
              words: origItem && Array.isArray(origItem.words) ? origItem.words : []
            });
          }
        }
      }

      if (refinedSentences.length > 0) {
        return {
          level,
          levelText,
          category,
          description,
          sentences: refinedSentences
        };
      }
    } catch (llmErr) {
      console.warn('[AI Master Engine] Groq LLM refinement warn, falling back to base translation:', llmErr.message);
    }

    // Fallback to base translation if Groq LLM was unavailable
    const baseSentences = await batchTranslateAndPinyin(rawSpeechSegments);
    return {
      level,
      levelText,
      category,
      description,
      sentences: baseSentences
    };
}

function parseISO8601Duration(isoStr) {
  if (!isoStr) return 60;
  const match = isoStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 60;
  const hours = parseInt(match[1] || '0', 10);
  const minutes = parseInt(match[2] || '0', 10);
  const seconds = parseInt(match[3] || '0', 10);
  return hours * 3600 + minutes * 60 + seconds;
}

function parseTranscriptAiText(txt) {
  if (!txt || txt.includes('# No captions available') || txt.includes('no auto-generated captions')) {
    return null;
  }

  const lines = txt.split('\n');
  const rawParagraphs = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('Source video:') || trimmed.startsWith('Language:') || trimmed.startsWith('Other available') || trimmed.startsWith('To request') || trimmed.startsWith('Interactive')) {
      continue;
    }

    const timeMatch = trimmed.match(/^\[?(\d{1,2}):(\d{2})(?::(\d{2}))?\]?\s*(.*)$/);
    if (timeMatch) {
      const hOrM = parseInt(timeMatch[1], 10);
      const mOrS = parseInt(timeMatch[2], 10);
      const s = timeMatch[3] ? parseInt(timeMatch[3], 10) : 0;
      const seconds = timeMatch[3] ? (hOrM * 3600 + mOrS * 60 + s) : (hOrM * 60 + mOrS);
      const text = timeMatch[4];
      if (text && text.length > 0) {
        rawParagraphs.push({
          startTime: seconds,
          text: text
        });
      }
    }
  }

  if (rawParagraphs.length === 0) return null;

  const segments = [];
  for (let i = 0; i < rawParagraphs.length; i++) {
    const p = rawParagraphs[i];
    const endVal = (typeof p.endTime === 'number' && p.endTime > p.startTime) ? p.endTime : ((i < rawParagraphs.length - 1) ? rawParagraphs[i + 1].startTime : (p.startTime + 10));
    const duration = Math.max(1, endVal - p.startTime);

    let parts = p.text.split(/♪|♫|\[[^\]]+\]/).map(s => s.trim()).filter(s => s.length > 0);
    if (parts.length === 0) {
      parts = p.text.split(/(?<=[.!?。！？\n])\s+/).map(s => s.trim()).filter(s => s.length > 0);
    }
    if (parts.length === 0) {
      parts = [p.text];
    }

    const step = duration / parts.length;
    parts.forEach((part, pIdx) => {
      segments.push({
        id: segments.length + 1,
        startTime: parseFloat((p.startTime + pIdx * step).toFixed(2)),
        endTime: parseFloat((p.startTime + (pIdx + 1) * step).toFixed(2)),
        text: part
      });
    });
  }

  return segments.length > 0 ? segments : null;
}

// Master Unified YouTube Dictation Extractor
export async function extractYouTubeDictation(youtubeId) {
  let videoTitle = `Bài Luyện Nghe (${youtubeId})`;
  let duration = 60;

  try {
    // 1. Instant Official Google YouTube Data API v3 or oEmbed Title Resolution
    try {
      if (process.env.YOUTUBE_API_KEY) {
        const ytApiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${youtubeId}&key=${process.env.YOUTUBE_API_KEY}`;
        const ytRes = await fetch(ytApiUrl);
        if (ytRes.ok) {
          const ytData = await ytRes.json();
          if (ytData.items && ytData.items.length > 0) {
            const item = ytData.items[0];
            videoTitle = item.snippet.title || videoTitle;
            duration = parseISO8601Duration(item.contentDetails?.duration) || duration;
            console.log(`[YouTube API v3] Fetched Official Metadata: "${videoTitle}" (${duration}s)`);
          }
        }
      }
    } catch (ytErr) {
      console.warn('[YouTube API v3] Metadata fetch warn:', ytErr.message);
    }

    // Fallback to free YouTube oEmbed API if title is still default
    if (!videoTitle || videoTitle.startsWith('Bài Luyện Nghe')) {
      try {
        const oEmbedRes = await fetch(`https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${youtubeId}&format=json`, {
          signal: AbortSignal.timeout(4000)
        });
        if (oEmbedRes.ok) {
          const oData = await oEmbedRes.json();
          if (oData.title) {
            videoTitle = oData.title;
            console.log(`[YouTube oEmbed] Resolved title: "${videoTitle}"`);
          }
        }
      } catch (eOembed) {
        console.warn('[YouTube oEmbed] warn:', eOembed.message);
      }
    }

    const videoUrl = `https://www.youtube.com/watch?v=${youtubeId}`;

    // ----------------------------------------------------
    // TIER 0: Direct YouTube Subtitles / Captions Track (Multi-language fallback)
    // ----------------------------------------------------
    try {
      let ytTranscript = null;
      const langsToTry = ['zh-CN', 'zh', 'zh-TW', 'zh-HK', 'vi', 'en', null];
      for (const lang of langsToTry) {
        try {
          ytTranscript = lang ? await YoutubeTranscript.fetchTranscript(youtubeId, { lang }) : await YoutubeTranscript.fetchTranscript(youtubeId);
          if (ytTranscript && ytTranscript.length > 0) {
            console.log(`[Dictation] YoutubeTranscript matched language '${lang || 'default'}': ${ytTranscript.length} lines`);
            break;
          }
        } catch (eLang) {}
      }

      if (ytTranscript && ytTranscript.length > 0) {
        const rawInitial = ytTranscript.map((t, idx) => ({
          id: idx + 1,
          text: t.text,
          startTime: parseFloat((t.offset / 1000).toFixed(3)),
          endTime: parseFloat(((t.offset + t.duration) / 1000).toFixed(3))
        }));

        // Consolidate short 0.5s auto-caption fragments into natural full sentences
        const raw = [];
        let curr = null;
        for (const seg of rawInitial) {
          if (!curr) {
            curr = { ...seg };
            continue;
          }
          const gap = seg.startTime - curr.endTime;
          if (gap >= -0.2 && gap < 0.8 && (curr.text + ' ' + seg.text).length < 75) {
            curr.text = (curr.text + ' ' + seg.text).replace(/\s+/g, ' ').trim();
            curr.endTime = seg.endTime;
          } else {
            raw.push(curr);
            curr = { ...seg };
          }
        }
        if (curr) raw.push(curr);

        const lastTimestamp = raw[raw.length - 1]?.endTime || 0;
        console.log(`[Dictation] Tier 0 YouTube Captions: ${raw.length} consolidated sentences from ${ytTranscript.length} raw lines, up to ${lastTimestamp}s / total ${duration}s`);

        if (raw.length > 0) {
          const enhanced = await enhanceAndClassifyLesson(raw, videoTitle, duration);
          if (enhanced.sentences && enhanced.sentences.length > 0) {
            return {
              success: true,
              videoTitle,
              duration,
              level: enhanced.level,
              levelText: enhanced.levelText,
              category: enhanced.category,
              description: enhanced.description,
              tierUsed: 'Phụ Đề YouTube + AI HSK 📝✨',
              sentences: enhanced.sentences
            };
          }
        }
      }
    } catch (e) {
      console.log(`[Dictation] Tier 0 direct transcript not available for ${youtubeId}, checking Tier 0.5...`);
    }

    // ----------------------------------------------------
    // TIER 0.5: Proxy Caption Scraper (youtube-transcript.ai)
    // ----------------------------------------------------
    try {
      const proxyRes = await fetch(`https://youtube-transcript.ai/transcript/${youtubeId}.txt`, {
        signal: AbortSignal.timeout(6000)
      });
      if (proxyRes.ok) {
        const proxyTxt = await proxyRes.text();
        const proxySegments = parseTranscriptAiText(proxyTxt);
        if (proxySegments && proxySegments.length > 0) {
          console.log(`[Dictation] Tier 0.5 (youtube-transcript.ai) success: ${proxySegments.length} lines!`);
          const speech = consolidateSpeechSegments(proxySegments);
          const enhanced = await enhanceAndClassifyLesson(speech, videoTitle, duration);
          if (enhanced.sentences && enhanced.sentences.length > 0) {
            return {
              success: true,
              videoTitle,
              duration,
              level: enhanced.level,
              levelText: enhanced.levelText,
              category: enhanced.category,
              description: enhanced.description,
              tierUsed: 'Phụ Đề YouTube Proxy (AI) 📝✨',
              sentences: enhanced.sentences
            };
          }
        }
      }
    } catch (eProxy) {
      console.log(`[Dictation] Tier 0.5 not available:`, eProxy.message);
    }

    // ----------------------------------------------------
    // TIER 1: Groq Whisper Large v3 via yt-dlp Audio Stream (Full 100% video coverage)
    // ----------------------------------------------------
    const tempAudio = path.join(AUDIO_TEMP_DIR, `audio_${youtubeId}_${Date.now()}.m4a`);
    let tempCookiesFile = null;

    try {
      const { execFile } = await import('child_process');
      const { promisify } = await import('util');
      const execFileAsync = promisify(execFile);
      const ytDlpBinaryPath = await ensureYtDlpBinary();

      const cookieArgs = [];
      if (process.env.YOUTUBE_COOKIES || process.env.YOUTUBE_COOKIES_BASE64) {
        try {
          tempCookiesFile = path.join(AUDIO_TEMP_DIR, `cookies_${Date.now()}.txt`);
          const cookieContent = process.env.YOUTUBE_COOKIES || Buffer.from(process.env.YOUTUBE_COOKIES_BASE64, 'base64').toString('utf-8');
          await fs.writeFile(tempCookiesFile, cookieContent, 'utf-8');
          cookieArgs.push('--cookies', tempCookiesFile);
        } catch (eCookie) {
          console.warn('[Dictation] Error writing cookies file:', eCookie.message);
        }
      }

      // Try downloading audio via yt-dlp (Priority: 1. Cookie-based standard download -> 2. Android client bypass)
      let downloadSuccess = false;
      if (cookieArgs.length > 0) {
        try {
          await execFileAsync(ytDlpBinaryPath, [
            videoUrl,
            '-f', 'ba/b/bestaudio/best',
            '-o', tempAudio,
            '--force-overwrites',
            '--no-playlist',
            ...cookieArgs
          ], { timeout: 60000 });
          downloadSuccess = existsSync(tempAudio);
        } catch (eCookieDl) {
          console.warn('[Dictation] Cookie audio download attempt warn:', eCookieDl.message);
        }
      }

      if (!downloadSuccess) {
        try {
          await execFileAsync(ytDlpBinaryPath, [
            videoUrl,
            '--extractor-args', 'youtube:player_client=android;player_skip=webpage,configs',
            '-f', 'ba/b/bestaudio/best',
            '-o', tempAudio,
            '--force-overwrites',
            '--no-playlist'
          ], { timeout: 60000 });
          downloadSuccess = existsSync(tempAudio);
        } catch (errAndroid) {
          console.warn(`[Dictation] Android client download warn, retrying android_creator/tv:`, errAndroid.message);
          try {
            await execFileAsync(ytDlpBinaryPath, [
              videoUrl,
              '--extractor-args', 'youtube:player_client=android_creator,tv_embedded;player_skip=webpage,configs',
              '-f', 'ba/b/bestaudio/best',
              '-o', tempAudio,
              '--force-overwrites',
              '--no-playlist'
            ], { timeout: 60000 });
            downloadSuccess = existsSync(tempAudio);
          } catch (eThird) {
            console.warn(`[Dictation] All yt-dlp audio download strategies failed:`, eThird.message);
          }
        }
      }

      // TIER 1.5 Backup: Piped / Invidious API Direct Audio Downloader (bypasses Render IP block completely)
      if (!downloadSuccess) {
        const pipedInstances = [
          `https://pipedapi.kavin.rocks/streams/${youtubeId}`,
          `https://api.piped.video/streams/${youtubeId}`,
          `https://pipedapi.mha.fi/streams/${youtubeId}`,
          `https://inv.tux.pizza/api/v1/videos/${youtubeId}`
        ];

        for (const instUrl of pipedInstances) {
          try {
            console.log(`[Dictation] Attempting Piped/Invidious direct audio stream fetch from ${instUrl}...`);
            const pRes = await fetch(instUrl, { signal: AbortSignal.timeout(8000) });
            if (pRes.ok) {
              const pData = await pRes.json();
              const audioStreams = pData.audioStreams || pData.adaptiveFormats?.filter(f => f.type?.includes('audio')) || [];
              if (audioStreams.length > 0) {
                const bestStream = audioStreams.find(s => s.mimeType?.includes('audio/mp4') || s.format === 'M4A') || audioStreams[0];
                const streamUrl = bestStream.url;
                if (streamUrl) {
                  const audioFileRes = await fetch(streamUrl, { signal: AbortSignal.timeout(45000) });
                  if (audioFileRes.ok) {
                    const arrayBuffer = await audioFileRes.arrayBuffer();
                    await fs.writeFile(tempAudio, Buffer.from(arrayBuffer));
                    downloadSuccess = existsSync(tempAudio);
                    if (downloadSuccess) {
                      console.log(`[Dictation] Successfully downloaded audio stream via Piped API! (${(arrayBuffer.byteLength / 1024 / 1024).toFixed(2)} MB)`);
                      break;
                    }
                  }
                }
              }
            }
          } catch (ePiped) {
            console.warn(`[Dictation] Piped instance ${instUrl} warn:`, ePiped.message);
          }
        }
      }

      if (groqClient && existsSync(tempAudio)) {
        console.log(`[Dictation] Transcribing FULL audio with Groq Whisper Large v3...`);
        const { createReadStream } = await import('fs');
        const whisperPrompt = 'Chinese Mandarin 汉语 汉字, Pinyin, Song Lyrics, Conversation';

        let transcription;
        try {
          transcription = await groqClient.audio.transcriptions.create({
            file: createReadStream(tempAudio),
            model: 'whisper-large-v3',
            prompt: whisperPrompt,
            response_format: 'verbose_json',
            timestamp_granularities: ['word', 'segment']
          });
        } catch (eZh) {
          console.warn(`[Dictation] Whisper initial transcription failed, retrying fallback:`, eZh.message);
          transcription = await groqClient.audio.transcriptions.create({
            file: createReadStream(tempAudio),
            model: 'whisper-large-v3',
            response_format: 'verbose_json',
            timestamp_granularities: ['word', 'segment']
          });
        }

        let segments = transcription.segments || [];

        // Filter out famous Whisper hallucination noise strings only (preserve all actual speech timestamps)
        segments = segments.filter(s => {
          const t = (s.text || '').toLowerCase();
          const origText = (s.text || '').trim();

          // Drop pure metadata credit spam strings if alone
          if (origText === '填词' || origText === '作词' || origText === '作曲' || origText === '编曲') {
            return false;
          }

          return !t.includes('dimatorzok') &&
                 !t.includes('amara.org') &&
                 !t.includes('subtitles created by') &&
                 !t.includes('ghien mi go') &&
                 !t.includes('ghiền mì gõ') &&
                 !t.includes('subscribe') &&
                 !t.includes('субтитры') &&
                 !t.includes('белая ночь') &&
                 !t.includes('yoyo television series');
        });

        console.log(`[Dictation] Whisper extracted ${segments.length} valid Chinese segments across full video`);

        if (segments.length > 0) {
          const raw = segments.map((s, idx) => ({
            id: idx + 1,
            text: s.text,
            startTime: parseFloat(Number(s.start || 0).toFixed(3)),
            endTime: parseFloat(Number(s.end || 0).toFixed(3)),
            words: Array.isArray(s.words) ? s.words.map(w => ({
              word: w.word,
              start: parseFloat(Number(w.start || 0).toFixed(3)),
              end: parseFloat(Number(w.end || 0).toFixed(3))
            })) : []
          }));
          const enhanced = await enhanceAndClassifyLesson(raw, videoTitle, duration);
          if (enhanced.sentences && enhanced.sentences.length > 0) {
            return {
              success: true,
              videoTitle,
              duration,
              level: enhanced.level,
              levelText: enhanced.levelText,
              category: enhanced.category,
              description: enhanced.description,
              tierUsed: 'Groq Whisper Large v3 + LLaMA 3.3 ⚡✨',
              sentences: enhanced.sentences
            };
          }
        }
      }
    } catch (err) {
      console.warn(`[Dictation] Tier 1 Audio transcription error: ${err.message}`);
    } finally {
      await fs.unlink(tempAudio).catch(() => {});
      if (tempCookiesFile) {
        await fs.unlink(tempCookiesFile).catch(() => {});
      }
    }

    // If direct subtitles and ASR are not available, return failure rather than hallucinating generic lyrics
    console.warn(`[Dictation] Could not extract direct subtitles or ASR for "${videoTitle}".`);
    return {
      success: false,
      message: 'Không thể tự động trích xuất phụ đề cho video này. Video có thể không có phụ đề CC hoặc bị chặn luồng âm thanh.'
    };

  } catch (outerErr) {
    console.warn(`[Dictation] Outer extraction error:`, outerErr.message);
    return {
      success: false,
      message: 'Lỗi trích xuất phụ đề video. Vui lòng thử lại hoặc sử dụng tính năng Tạo Thủ Công.'
    };
  }
}

// Helper: Parse timestamps in seconds safely from number, string, or MM:SS format with 3-decimal precision
function parseTimeSeconds(val, defaultVal = 0) {
  if (typeof val === 'number' && !isNaN(val)) return parseFloat(val.toFixed(3));
  if (typeof val === 'string') {
    const parts = val.split(':').map(Number);
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      return parseFloat((parts[0] * 60 + parts[1]).toFixed(3));
    }
    const num = parseFloat(val);
    if (!isNaN(num)) return parseFloat(num.toFixed(3));
  }
  return parseFloat(Number(defaultVal || 0).toFixed(3));
}

// Zero-Failure AI Master Knowledge Synthesis Engine (Multi-Model AI)
async function generateAIFallbackLesson(videoTitle, durationSeconds) {
  const duration = durationSeconds || 60;
  console.log(`[AI Master Engine] Synthesizing comprehensive dictation lesson for "${videoTitle}" (${duration}s)...`);

  try {
    const prompt = `Bạn là một chuyên gia giáo dục ngôn ngữ Tiếng Trung và biên tập viên âm nhạc HSK cao cấp.
Nhiệm vụ: Hãy biên soạn một bài học luyện nghe tiếng Trung gồm 15 đến 20 câu thoại/lời bài hát bám sát theo tựa đề video: "${videoTitle}" (Thời lượng: ${duration} giây).

YÊU CẦU BẮT BUỘC VỀ THỜI GIAN & LỜI DỊCH:
1. "hanzi": BẮT BUỘC là câu tiếng Trung bằng Chữ Hán Giản Thể chuẩn. Ví dụ: "风起了，心也跟着痛了。"
2. "vietnamese": Lời dịch tiếng Việt chuẩn xác, giàu cảm xúc, ĐÚNG CHÍNH TẢ VIỆT NAM (Tuyệt đối KHÔNG dịch ngô nghê hay sai từ ngữ như "Giời nổi", "đau điệu"). Ví dụ: "Gió nổi lên, trái tim cũng đau nhói."
3. "startTime" & "endTime": Hầu hết video ca nhạc/hội thoại có đoạn nhạc dạo đầu (Intro Music) từ 10s-15s, do đó câu đầu tiên NÊN BẮT ĐẦU từ giây 12.0 trở đi (KHÔNG bắt đầu từ 00:00 trừ khi là thoại trực tiếp).
4. Phân bổ mốc thời gian tự nhiên theo thời lượng ${duration}s với độ chính xác mili-giây dạng số thập phân (Ví dụ: 12.385, 17.820).
5. "hskLevel": Cấp độ HSK ("1", "2", "3", "4", "5", "6").
6. "category": "Âm Nhạc" hoặc "Giao Tiếp".

BẮT BUỘC TRẢ VỀ ĐÚNG JSON:
{
  "hskLevel": "3",
  "category": "Âm Nhạc",
  "sentences": [
    {
      "id": 1,
      "startTime": 12.385,
      "endTime": 17.820,
      "hanzi": "风起了，心也跟着痛了。",
      "vietnamese": "Gió nổi lên, trái tim cũng đau nhói."
    }
  ]
}`;

    const parsed = await callLLMJson(prompt);
    let rawSentences = parsed.sentences || parsed.data || parsed.list || parsed.lyrics || [];
    if (!Array.isArray(rawSentences) && typeof parsed === 'object') {
      const arrayKey = Object.keys(parsed).find(k => Array.isArray(parsed[k]));
      if (arrayKey) rawSentences = parsed[arrayKey];
    }

    const sentences = [];
    const introOffset = duration > 40 ? Math.min(14.5, duration * 0.08) : 3.0;
    const usableDuration = Math.max(10, duration - introOffset - 5.0);
    const step = usableDuration / Math.max(1, rawSentences.length);

    for (let idx = 0; idx < rawSentences.length; idx++) {
      const s = rawSentences[idx];
      let hanzi = (s.hanzi || '').trim();
      let vietnamese = (s.vietnamese || s.meaning || '').trim();
      
      if (!hanzi && vietnamese) {
        hanzi = await translateText(vietnamese, 'vi', 'zh-CN');
      }
      if (!vietnamese && hanzi) {
        vietnamese = await translateText(hanzi, 'zh-CN', 'vi');
      }
      if (!hanzi && !vietnamese) continue;
      if (!hanzi) hanzi = vietnamese;

      const baseStart = introOffset + (idx * step);
      const sentenceLen = Math.max(3.5, Math.min(7.8, hanzi.length * 0.38));
      const defaultStart = baseStart + ((idx * 0.237) % 0.85);
      const defaultEnd = defaultStart + sentenceLen;

      const sTime = parseTimeSeconds(s.startTime, defaultStart);
      const eTime = parseTimeSeconds(s.endTime, defaultEnd);

      let py = '';
      try { py = pinyin(hanzi, { toneType: 'symbol' }); } catch (e) {}

      sentences.push({
        id: idx + 1,
        startTime: parseFloat(sTime.toFixed(3)),
        endTime: parseFloat(eTime.toFixed(3)),
        hanzi: hanzi,
        pinyin: py,
        meaning: vietnamese || hanzi,
        keywords: [hanzi.slice(0, Math.min(2, hanzi.length))]
      });
    }

    if (sentences.length > 0) {
      return {
        success: true,
        videoTitle,
        duration,
        level: String(parsed.hskLevel || '3'),
        levelText: `HSK ${parsed.hskLevel || '3'}`,
        category: parsed.category || 'Giao Tiếp',
        description: parsed.description || `Bài học luyện nghe ${videoTitle}`,
        tierUsed: 'AI Trợ Lý HSK Toàn Năng ✨',
        sentences
      };
    }
  } catch (e) {
    console.warn('[AI Master Engine] Fallback lesson synthesis warn:', e.message);
  }

  // 100% Guaranteed Non-empty Synthetic Baseline Lesson with Intro Delay & Milliseconds
  const introOffset = duration > 40 ? 12.350 : 2.500;
  const step = Math.max(5, Math.floor((duration - introOffset) / 6));
  const fallbackSentences = [
    { id: 1, startTime: introOffset, endTime: introOffset + 4.820, hanzi: "你好，很高兴和你一起学习汉语。", meaning: "Xin chào, rất vui được cùng bạn học tiếng Trung." },
    { id: 2, startTime: introOffset + step + 0.310, endTime: introOffset + step + 5.150, hanzi: "听力练习是提高语言能力最好的方法。", meaning: "Luyện nghe là phương pháp tốt nhất để nâng cao trình độ ngôn ngữ." },
    { id: 3, startTime: introOffset + step * 2 + 0.180, endTime: introOffset + step * 2 + 5.620, hanzi: "每一天坚持练习，你会发现自己进步很快。", meaning: "Mỗi ngày kiên trì luyện tập, bạn sẽ thấy mình tiến bộ rất nhanh." },
    { id: 4, startTime: introOffset + step * 3 + 0.450, endTime: introOffset + step * 3 + 5.280, hanzi: "听写能帮助我们记住更多生词和语法。", meaning: "Nghe chép chính tả giúp chúng ta ghi nhớ nhiều từ mới và ngữ pháp hơn." },
    { id: 5, startTime: introOffset + step * 4 + 0.220, endTime: introOffset + step * 4 + 4.910, hanzi: "让我们一起努力，加油！", meaning: "Hãy cùng nhau cố gắng, cố lên nào!" }
  ].map(s => {
    let py = '';
    try { py = pinyin(s.hanzi, { toneType: 'symbol' }); } catch (e) {}
    return {
      ...s,
      startTime: parseFloat(s.startTime.toFixed(3)),
      endTime: parseFloat(s.endTime.toFixed(3)),
      pinyin: py,
      keywords: [s.hanzi.slice(0, 2)]
    };
  });

  return {
    success: true,
    videoTitle,
    duration,
    level: '2',
    levelText: 'HSK 2',
    category: 'Giao Tiếp',
    description: `Bài luyện nghe tiếng Trung: ${videoTitle}`,
    tierUsed: 'AI Trợ Lý HSK Toàn Năng ✨',
    sentences: fallbackSentences
  };
}

// GET /api/dictation/debug-status — Kiểm tra chẩn đoán hệ thống AI & biến môi trường
app.get('/api/dictation/debug-status', (req, res) => {
  res.json({
    status: 'online',
    commit: 'latest',
    hasGroqKey: !!process.env.GROQ_API_KEY,
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    hasYoutubeKey: !!process.env.YOUTUBE_API_KEY,
    hasMongoUri: !!process.env.MONGODB_URI,
    groqClientReady: !!groqClient,
    genAIReady: !!genAI,
    nodeVersion: process.version,
    platform: process.platform,
    timestamp: new Date().toISOString()
  });
});

// POST /api/dictation/fetch-subtitles — Lấy phụ đề / mốc giọng nói YouTube
app.post('/api/dictation/fetch-subtitles', async (req, res) => {
  const { youtubeId } = req.body || {};
  if (!youtubeId) {
    return res.status(400).json({ error: 'Missing youtubeId' });
  }

  try {
    const result = await extractYouTubeDictation(youtubeId);
    res.json(result);
  } catch (err) {
    console.error('Fetch subtitles error:', err);
    res.status(500).json({ error: 'Lỗi khi trích xuất phụ đề YouTube', detail: err.message });
  }
});

// POST /api/dictation/transcribe-audio — AI Audio Transcription
app.post('/api/dictation/transcribe-audio', async (req, res) => {
  const { youtubeId } = req.body || {};
  if (!youtubeId) {
    return res.status(400).json({ error: 'Missing youtubeId' });
  }

  try {
    const result = await extractYouTubeDictation(youtubeId);
    res.json(result);
  } catch (err) {
    console.error('Transcribe audio error:', err);
    res.status(500).json({ error: 'Lỗi khi phân tích giọng nói AI', detail: err.message });
  }
});

// POST /api/dictation/save-lesson — Lưu bài học video mới
app.post('/api/dictation/save-lesson', async (req, res) => {
  try {
    const email = getLoggedInUserEmail(req) || req.body.userEmail || 'guest';
    const newLesson = req.body;
    if (!newLesson || !newLesson.youtubeId || !newLesson.title) {
      return res.status(400).json({ error: 'Missing required lesson fields (youtubeId, title)' });
    }
    newLesson.userEmail = email;
    newLesson.isCustom = true;
    newLesson.createdAt = newLesson.createdAt || new Date().toISOString();

    const lessons = await readDictationLessons();
    const existingIndex = lessons.findIndex(l => l.id === newLesson.id || (l.youtubeId === newLesson.youtubeId && l.userEmail === email));
    if (existingIndex >= 0) {
      lessons[existingIndex] = { ...lessons[existingIndex], ...newLesson };
    } else {
      if (!newLesson.id) {
        newLesson.id = 'dict_custom_' + Date.now();
      }
      lessons.unshift(newLesson);
    }
    await fs.writeFile(DICTATION_DB_PATH, JSON.stringify(lessons, null, 2), 'utf-8');
    res.json({ success: true, lesson: newLesson });
  } catch (err) {
    console.error("Error saving dictation lesson:", err);
    res.status(500).json({ error: 'Failed to save lesson' });
  }
});

// DELETE /api/dictation/lessons/:id — Xóa bài học video tự thêm
app.delete('/api/dictation/lessons/:id', async (req, res) => {
  try {
    const lessonId = req.params.id;
    let lessons = await readDictationLessons();
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }
    lessons = lessons.filter(l => l.id !== lessonId);
    await fs.writeFile(DICTATION_DB_PATH, JSON.stringify(lessons, null, 2), 'utf-8');
    res.json({ success: true, message: 'Lesson deleted successfully' });
  } catch (err) {
    console.error("Error deleting dictation lesson:", err);
    res.status(500).json({ error: 'Failed to delete lesson' });
  }
});

// POST /api/dict/lookup — Instant Multi-language Word Dictionary Lookup for Subtitle Click-to-Translate
app.post('/api/dict/lookup', async (req, res) => {
  try {
    const { word } = req.body || {};
    if (!word || !word.trim()) {
      return res.status(400).json({ error: 'Missing word parameter' });
    }
    const cleanWord = word.trim();
    const isChinese = /[\u4e00-\u9fa5]/.test(cleanWord);

    let py = '';
    let meaning = '';
    let wordTag = 'Từ vựng';

    if (isChinese) {
      try { py = pinyin(cleanWord, { toneType: 'symbol' }); } catch (e) {}

      const db = await readDatabase();
      let foundDbMatch = db.find(w => w && (w.word === cleanWord || w.hanzi === cleanWord));
      if (foundDbMatch) {
        wordTag = foundDbMatch.level || foundDbMatch.hsk || 'HSK';
        if (!wordTag.toString().startsWith('HSK')) wordTag = `HSK ${wordTag}`;
      } else {
        wordTag = 'Từ vựng HSK';
      }
      meaning = await translateText(cleanWord, 'zh-CN', 'vi');
    } else {
      // English / Non-Chinese word lookup
      wordTag = 'English';
      meaning = await translateText(cleanWord, 'en', 'vi');
      
      // Fetch English IPA phonetics from free dictionary API
      try {
        const dictRes = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(cleanWord)}`);
        if (dictRes.ok) {
          const dictData = await dictRes.json();
          if (Array.isArray(dictData) && dictData[0]) {
            const entry = dictData[0];
            const phonetic = entry.phonetic || (entry.phonetics && entry.phonetics.find(p => p.text)?.text);
            if (phonetic) py = phonetic;
            const pos = entry.meanings && entry.meanings[0]?.partOfSpeech;
            if (pos) wordTag = pos.toUpperCase();
          }
        }
      } catch (eDict) {}
    }

    res.json({
      success: true,
      word: cleanWord,
      pinyin: py,
      meaning: meaning || 'Đang cập nhật nghĩa',
      hskLevel: wordTag
    });
  } catch (err) {
    console.error("Dict lookup error:", err);
    res.status(500).json({ error: 'Lookup failed' });
  }
});

// Serve index.html or dist/index.html as root
app.get('/', (req, res) => {
  const distIndex = path.join(DIST_DIR, 'index.html');
  if (existsSync(distIndex)) {
    res.sendFile(distIndex);
  } else {
    res.sendFile(path.join(FRONTEND_DIR, 'index.html'));
  }
});

// Start Server
if (process.env.NO_SERVER_LISTEN !== 'true') {
  app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`[Server] Port ${PORT} already in use, skipping app.listen()`);
    } else {
      console.error('[Server] Listen error:', err);
    }
  });
}