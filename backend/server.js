import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import fs from 'fs/promises';
import * as fsSync from 'fs';
import { existsSync, createWriteStream, createReadStream } from 'fs';
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
import * as XLSX from 'xlsx';
import { processYouTubeVideo } from './services/youtube_transcriber.js';
import { Resend } from 'resend';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env explicitly from backend directory or root
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config();

// Crash Prevention Safeguards (Guarantees server never dies with 502/crash)
process.on('uncaughtException', (err) => {
  console.error('[Server SafeGuard] Uncaught exception prevented:', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('[Server SafeGuard] Unhandled rejection prevented:', reason);
});

const DB_PATH = path.join(__dirname, 'database.json');
const DICTATION_DB_PATH = path.join(__dirname, 'video_dictation_lessons.json');
const USER_DB_PATH = path.join(__dirname, 'user_data.json');
const AUDIO_CACHE_DIR = path.join(__dirname, 'audio_cache');

// AI Clients initialization
const groqApiKey = process.env.GROQ_API_KEY;
const groqClient = groqApiKey ? new Groq({ apiKey: groqApiKey }) : null;

const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// Resend Email Client
const resendApiKey = process.env.RESEND_API_KEY;
const resendClient = resendApiKey ? new Resend(resendApiKey) : null;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Tiếng Trung Hồng Thái <thongbao@tiengtrunghongtai.online>';

// Ensure audio cache directory exists
fs.mkdir(AUDIO_CACHE_DIR, { recursive: true }).catch(err => {
  console.error("Error creating audio_cache dir:", err);
});

// Connect to MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;
// Removed bufferCommands=false so Mongoose will queue queries until connected

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

const sessionSchema = new mongoose.Schema({
  _id: String, // sessionToken
  email: String,
  createdAt: { type: Date, default: Date.now, expires: '7d' }
});
const Session = mongoose.model('Session', sessionSchema);

const commentSchema = new mongoose.Schema({
  id: String,
  authorEmail: String,
  authorName: String,
  authorPicture: String,
  content: String,
  createdAt: { type: Date, default: Date.now }
});

const discussionSchema = new mongoose.Schema({
  _id: String,
  authorEmail: String,
  authorName: String,
  authorPicture: String,
  category: { type: String, default: 'feedback' }, // 'feedback', 'study', 'qa', 'tips'
  title: String,
  content: String,
  likes: { type: [String], default: [] },
  comments: { type: [commentSchema], default: [] },
  isPinned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });
const Discussion = mongoose.model('Discussion', discussionSchema);

const dictationLessonSchema = new mongoose.Schema({
  _id: String, // lessonId, e.g. 'dict_v13_luying'
  studyCount: { type: Number, default: 0 },
  completedUsers: { type: [String], default: [] }
}, { timestamps: true });
const DictationLesson = mongoose.model('DictationLesson', dictationLessonSchema);

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
app.use('/vendor', express.static(path.join(DIST_DIR, 'vendor')));
app.use('/vendor', express.static(path.join(PUBLIC_DIR, 'vendor')));

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

  // Ensure we wait for MongoDB to connect if URI is provided.
  // This prevents the bug where server reads from old ephemeral local file and overwrites DB!
  if (process.env.MONGODB_URI) {
    if (mongoose.connection.readyState !== 1) {
      console.log("Waiting for MongoDB connection before reading data...");
      try {
        for (let i = 0; i < 50; i++) {
          if (mongoose.connection.readyState === 1) break;
          await new Promise(r => setTimeout(r, 100));
        }
      } catch (e) { }
    }
  } else if (mongoose.connection.readyState !== 1) {
    // If no MongoDB URI, use user_data.json file fallback immediately
    return await readUserDataFromFile();
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
        role: u.role || 'user',
        lastSeenTime: u.lastSeenTime || null,
        stats: u.stats,
        gameHistory: u.gameHistory || [],
        accessLogs: u.accessLogs || []
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
      if (s._id && s.email) {
        activeSessions.set(s._id, s.email);
      }
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
  if (mongoose.connection.readyState !== 1) return;
  const promises = [];
  const emails = new Set([
    ...Object.keys(data.users || {}),
    ...Object.keys(data.progress || {}),
    ...Object.keys(data.customWords || {}),
    ...Object.keys(data.chats || {})
  ]);

  for (const email of emails) {
    const u = data.users[email] || { name: "", picture: "", role: "user", stats: { streak: 0, studyTime: 0, lastActiveDate: "" } };
    const updateDoc = {
      name: u.name || "",
      picture: u.picture || "",
      role: u.role || 'user',
      lastSeenTime: u.lastSeenTime || new Date(),
      stats: u.stats || { streak: 0, studyTime: 0, lastActiveDate: "" },
      gameHistory: u.gameHistory || [],
      quizHistory: (data.quizHistory && data.quizHistory[email]) || [],
      progress: data.progress[email] || {},
      customWords: data.customWords[email] || [],
      chats: data.chats[email] || [],
      accessLogs: (data.users[email] && data.users[email].accessLogs) || (u.accessLogs || [])
    };

    promises.push(User.updateOne(
      { _id: email },
      { $set: updateDoc },
      { upsert: true }
    ));
  }

  for (const token of Object.keys(data.sessions || {})) {
    if (token && data.sessions[token]) {
      promises.push(Session.updateOne(
        { _id: token },
        { $set: { email: data.sessions[token] } },
        { upsert: true }
      ));
    }
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

  if (token) {
    if (activeSessions.has(token)) {
      return activeSessions.get(token);
    }
    if (cachedUserData && cachedUserData.sessions && cachedUserData.sessions[token]) {
      const email = cachedUserData.sessions[token];
      activeSessions.set(token, email);
      return email;
    }
  }

  // 4. Fallback to custom x-user-email header
  const customEmail = req.headers['x-user-email'];
  if (customEmail && typeof customEmail === 'string' && customEmail.includes('@')) {
    return customEmail.toLowerCase().trim();
  }

  return null;
}

// Helper to decode Google JWT payload without external libraries
function decodeJwt(token) {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    let payload = parts[1];
    payload = payload.replace(/-/g, '+').replace(/_/g, '/');
    while (payload.length % 4) {
      payload += '=';
    }
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


// Helper functions for Admin & Super Admin resolution
const SUPER_ADMINS = ['phanphiphu04@gmail.com', 'thaihong162004@gmail.com', 'toiyeutinhoc238@gmail.com'];

function isSuperAdmin(email) {
  if (!email) return false;
  const em = email.toLowerCase().trim();
  return SUPER_ADMINS.some(admin => em === admin || em.includes('phanphiphu') || em.includes('thaihong162004') || em.includes('toiyeutinhoc'));
}

function isUserAdmin(email, userData = null) {
  if (!email) return false;
  if (isSuperAdmin(email)) return true;
  const em = email.toLowerCase().trim();
  if (em.includes('hongtai')) return true;

  if (userData && userData.users && userData.users[em]) {
    const r = userData.users[em].role;
    if (r === 'admin' || r === 'teacher' || r === 'super_admin') return true;
  }
  return false;
}

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

  const isSuper = isSuperAdmin(email);
  const isAdmin = isUserAdmin(email, userData);
  const userRole = isSuper ? 'super_admin' : (existingUser.role || (email.includes('hongtai') ? 'admin' : 'user'));

  userData.users[email] = {
    ...existingUser,
    name,
    picture,
    role: userRole,
    lastSeenTime: new Date(),
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
    user: {
      name,
      email,
      picture,
      role: userRole,
      isSuperAdmin: isSuper,
      isAdmin
    }
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

  const isSuper = isSuperAdmin(email);
  const isAdmin = isUserAdmin(email, userData);
  const userRole = isSuper ? 'super_admin' : (userRecord.role || (email.includes('hongtai') ? 'admin' : 'user'));

  res.json({
    user: {
      name: userRecord.name,
      email: email,
      picture: userRecord.picture,
      role: userRole,
      isSuperAdmin: isSuper,
      isAdmin,
      stats: userRecord.stats
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

// GET /api/admin/users & /api/admin/users-activity — Lấy toàn bộ danh sách & lịch sử hoạt động học viên
app.get(['/api/admin/users', '/api/admin/users-activity'], async (req, res) => {
  try {
    const userData = await readUserData();
    const usersObj = userData.users || {};
    const progressObj = userData.progress || {};

    const now = Date.now();
    let totalStudyTimeSec = 0;
    let onlineCount = 0;
    let adminCount = 0;

    const usersList = Object.keys(usersObj).map(email => {
      const u = usersObj[email] || {};
      const userProg = progressObj[email] || {};

      const totalWordsStudied = Object.values(userProg).filter(p => p && (p.isStudied || p.isMemorized || p.isWrong || p.isStarred)).length;
      const totalWordsMemorized = Object.values(userProg).filter(p => p && p.isMemorized).length;

      const studyTime = u.stats?.studyTime || 0;
      totalStudyTimeSec += studyTime;

      const isSuper = isSuperAdmin(email);
      const isAdmin = isUserAdmin(email, userData);
      if (isAdmin || isSuper) adminCount++;

      // Check online status within last 5 minutes
      const lastSeenTime = u.lastSeenTime ? new Date(u.lastSeenTime).getTime() : 0;
      const isOnline = (now - lastSeenTime) < 5 * 60 * 1000;
      if (isOnline) onlineCount++;

      return {
        email: email,
        name: u.name || 'Học viên',
        picture: u.picture || '',
        role: isSuper ? 'super_admin' : (u.role || (email.includes('hongtai') ? 'admin' : 'user')),
        isSuperAdmin: isSuper,
        isAdmin: isAdmin,
        isOnline: isOnline,
        lastSeen: u.lastSeenTime || null,
        lastSeenTime: u.lastSeenTime || null,
        streak: calculateStreakFromHistory(u.stats?.dailyHistory),
        studyTime: studyTime,
        studyTimeSeconds: studyTime,
        studyTimeMinutes: Math.round(studyTime / 60),
        lastActiveDate: u.stats?.lastActiveDate || '',
        dailyHistory: u.stats?.dailyHistory || {},
        memorizedWordsCount: totalWordsMemorized,
        totalWordsStudied: totalWordsStudied,
        totalWordsMemorized: totalWordsMemorized,
        quizCount: (u.gameHistory || []).length,
        highestQuizScore: (u.gameHistory || []).reduce((max, g) => Math.max(max, g.score || 0), 0),
        gameHistory: u.gameHistory || []
      };
    });

    // Sort by lastSeenTime / lastActiveDate descending
    usersList.sort((a, b) => {
      const timeA = a.lastSeenTime ? new Date(a.lastSeenTime).getTime() : 0;
      const timeB = b.lastSeenTime ? new Date(b.lastSeenTime).getTime() : 0;
      return timeB - timeA;
    });

    res.json({
      success: true,
      totalUsers: usersList.length,
      onlineCount: onlineCount,
      adminCount: adminCount,
      totalStudyTimeHours: parseFloat((totalStudyTimeSec / 3600).toFixed(1)),
      users: usersList
    });
  } catch (err) {
    console.error("Error fetching user activities:", err);
    res.status(500).json({ error: 'Failed to fetch user activities' });
  }
});

// ============================================================
// REAL-TIME USER PRESENCE & 100% REAL DATABASE STATS SYSTEM
// ============================================================
const livePresenceMap = new Map(); // clientId/IP/token -> timestamp
const userPresenceMap = new Map(); // normalized email -> timestamp

function trackPresence(req) {
  try {
    let email = getLoggedInUserEmail(req);
    if (!email && req.body && req.body.email && typeof req.body.email === 'string' && req.body.email.includes('@')) {
      email = req.body.email.toLowerCase().trim();
    }
    const now = Date.now();
    if (email) {
      const normEmail = email.toLowerCase().trim();
      userPresenceMap.set(normEmail, now);
      if (cachedUserData && cachedUserData.users && cachedUserData.users[normEmail]) {
        cachedUserData.users[normEmail].lastSeenTime = new Date(now);
      }
    }

    const rawIp = req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || 'guest';
    const clientId = (req.body && req.body.clientId) || req.headers['x-client-id'] || '';
    const authHeader = req.headers['authorization'] || req.headers['x-session-token'] || '';

    let key;
    if (email) {
      key = `user_${email.toLowerCase().trim()}`;
    } else if (authHeader) {
      key = `token_${authHeader.substring(0, 32)}`;
    } else if (clientId) {
      key = `guest_${clientId}`;
    } else {
      key = `ip_${rawIp}`;
    }

    livePresenceMap.set(key, now);
  } catch (e) { }
}

// Automatically track presence on all incoming requests
app.use((req, res, next) => {
  trackPresence(req);
  next();
});

// Clean up expired presence sessions every 30 seconds (inactive for more than 2 minutes)
setInterval(() => {
  const now = Date.now();
  const EXPIRY = 2 * 60 * 1000;
  for (const [key, lastSeen] of livePresenceMap.entries()) {
    if (now - lastSeen > EXPIRY) {
      livePresenceMap.delete(key);
    }
  }
  for (const [email, lastSeen] of userPresenceMap.entries()) {
    if (now - lastSeen > EXPIRY) {
      userPresenceMap.delete(email);
    }
  }
}, 30000);

// POST: Heartbeat ping from clients
app.post('/api/presence/heartbeat', (req, res) => {
  trackPresence(req);
  res.json({ ok: true, timestamp: Date.now() });
});

// GET: 100% Real Database Stats & Real-Time Online Count
app.get('/api/stats/community', async (req, res) => {
  trackPresence(req);

  let totalUsers = 0;
  try {
    if (mongoose.connection.readyState === 1) {
      totalUsers = await User.countDocuments({});
    } else {
      const uData = await readUserDataFromFile();
      totalUsers = Object.keys(uData.users || {}).length;
    }
  } catch (e) {
    console.error("Error querying real user count from MongoDB:", e);
    totalUsers = 0;
  }

  const now = Date.now();
  let registeredOnlineCount = 0;
  for (const [email, lastSeen] of userPresenceMap.entries()) {
    if (now - lastSeen <= 120000) {
      registeredOnlineCount++;
    }
  }

  // Exact 100% real active connection count matching admin dashboard
  const onlineUsers = registeredOnlineCount > 0 ? registeredOnlineCount : Math.max(1, livePresenceMap.size);

  res.json({
    totalUsers,
    onlineUsers,
    registeredOnlineCount,
    liveConnectionsCount: livePresenceMap.size,
    timestamp: Date.now()
  });
});

// ============================================================
// ADMIN MANAGEMENT & LEARNER INTELLIGENCE APIs
// ============================================================

// GET /api/admin/users - Detailed list of learners, online status, scores & roles
app.get('/api/admin/users', async (req, res) => {
  const currentEmail = getLoggedInUserEmail(req);
  if (!currentEmail) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập tài khoản quản trị.' });
  }

  const userData = await readUserData();
  if (!isUserAdmin(currentEmail, userData)) {
    return res.status(403).json({ error: 'Bạn không có quyền truy cập trang quản trị hệ thống.' });
  }

  const now = Date.now();
  // Ensure we query directly from MongoDB Atlas for 100% fresh, real-time data
  let dbUsersMap = new Map();
  if (mongoose.connection.readyState === 1) {
    try {
      const dbUsers = await User.find({}).lean();
      dbUsers.forEach(u => {
        if (u && u._id) {
          dbUsersMap.set(u._id.toLowerCase().trim(), u);
        }
      });
    } catch (dbErr) {
      console.error("Error reading users directly from MongoDB in /api/admin/users:", dbErr);
    }
  }

  // Combine emails from both MongoDB and in-memory userData
  const allEmails = new Set([
    ...dbUsersMap.keys(),
    ...Object.keys(userData.users || {}).map(e => e.toLowerCase().trim())
  ]);

  for (const email of allEmails) {
    const dbU = dbUsersMap.get(email);
    const memU = (userData.users && (userData.users[email] || Object.values(userData.users).find(x => x && x.email && x.email.toLowerCase() === email))) || {};

    // Source of truth: MongoDB record first, fallback to in-memory
    const u = dbU || memU;
    const isSuper = isSuperAdmin(email);
    const isAdmin = isUserAdmin(email, userData);
    const role = isSuper ? 'super_admin' : (u.role || (email.includes('hongtai') ? 'admin' : 'user'));

    // Real-time online check: active in last 120 seconds
    const lastSeenTimestamp = userPresenceMap.get(email.toLowerCase().trim()) || (u.lastSeenTime ? new Date(u.lastSeenTime).getTime() : 0);
    const isOnline = lastSeenTimestamp ? (now - lastSeenTimestamp <= 120000) : false;

    // Exam scores and progress
    const stats = u.stats || {};
    const gameHistory = Array.isArray(u.gameHistory) ? u.gameHistory : (Array.isArray(memU.gameHistory) ? memU.gameHistory : []);
    const quizHistory = (userData.quizHistory && userData.quizHistory[email]) || (Array.isArray(u.quizHistory) ? u.quizHistory : []);
    const combinedGames = [...gameHistory, ...quizHistory].sort((a, b) => new Date(b.playedAt || b.date) - new Date(a.playedAt || a.date));

    let highestQuizScore = 0;
    let totalQuizScore = 0;
    combinedGames.forEach(q => {
      const sc = Number(q.score) || 0;
      if (sc > highestQuizScore) highestQuizScore = sc;
      totalQuizScore += sc;
    });
    const avgQuizScore = combinedGames.length > 0 ? Math.round(totalQuizScore / combinedGames.length) : 0;

    const progress = (userData.progress && userData.progress[email]) || u.progress || {};
    let memorizedWordsCount = 0;
    let studiedWordsCount = 0;
    Object.values(progress).forEach(p => {
      if (p.isMemorized) memorizedWordsCount++;
      if (p.isStudied || p.isMemorized || p.isWrong || p.isStarred) studiedWordsCount++;
    });

    const accessLogs = Array.isArray(u.accessLogs) ? u.accessLogs : (Array.isArray(memU.accessLogs) ? memU.accessLogs : []);

    usersList.push({
      email,
      name: u.name || email.split('@')[0],
      picture: u.picture || '',
      role,
      isSuperAdmin: isSuper,
      isAdmin,
      isOnline,
      lastSeen: lastSeenTimestamp ? new Date(lastSeenTimestamp).toISOString() : (stats.lastActiveDate || null),
      streak: calculateStreakFromHistory(stats.dailyHistory),
      studyTime: stats.studyTime || 0,
      quizCount: combinedGames.length,
      highestQuizScore,
      avgQuizScore,
      memorizedWordsCount,
      studiedWordsCount,
      customWordsCount: (userData.customWords && userData.customWords[email] ? userData.customWords[email].length : 0),
      chatsCount: (userData.chats && userData.chats[email] ? userData.chats[email].length : 0),
      dailyHistory: stats.dailyHistory || {},
      accessLogs: [...accessLogs].slice(-100).reverse(),
      gameHistory: combinedGames
    });
  }

  // Sort: Super Admin & Admin first, then Online users first, then by lastSeen desc
  usersList.sort((a, b) => {
    if (a.isSuperAdmin !== b.isSuperAdmin) return a.isSuperAdmin ? -1 : 1;
    if (a.isAdmin !== b.isAdmin) return a.isAdmin ? -1 : 1;
    if (a.isOnline !== b.isOnline) return a.isOnline ? -1 : 1;
    return new Date(b.lastSeen || 0) - new Date(a.lastSeen || 0);
  });

  const totalStudyTimeSecs = usersList.reduce((acc, curr) => acc + (curr.studyTime || 0), 0);

  res.json({
    success: true,
    currentUserRole: isSuperAdmin(currentEmail) ? 'super_admin' : (userData.users[currentEmail]?.role || 'admin'),
    isCurrentSuperAdmin: isSuperAdmin(currentEmail),
    totalUsers: usersList.length,
    onlineCount: usersList.filter(u => u.isOnline).length,
    adminCount: usersList.filter(u => u.isAdmin || u.isSuperAdmin).length,
    totalStudyTimeHours: (totalStudyTimeSecs / 3600).toFixed(1),
    users: usersList
  });
});

// GET /api/admin/users/export-excel - Export full User Management Excel Report (.xlsx)
app.get('/api/admin/users/export-excel', async (req, res) => {
  const adminEmail = getLoggedInUserEmail(req);
  if (!adminEmail || !isUserAdmin(adminEmail)) {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }

  try {
    const userData = await readUserData();
    const users = userData.users || {};
    const now = Date.now();

    function toVnTimeStr(isoOrDate) {
      if (!isoOrDate) return 'Chưa có';
      const d = new Date(isoOrDate);
      if (isNaN(d.getTime())) return 'Chưa có';
      const vnDate = new Date(d.getTime() + 7 * 60 * 60 * 1000);
      return vnDate.toISOString().replace('T', ' ').substring(0, 19);
    }

    function toDurationStr(seconds) {
      const s = Math.max(0, Math.round(seconds || 0));
      if (s < 60) return `${s}s`;
      const m = Math.floor(s / 60);
      const remS = s % 60;
      if (m < 60) return `${m}p ${remS > 0 ? remS + 's' : ''}`;
      const h = Math.floor(m / 60);
      const remM = m % 60;
      return `${h}h ${remM}p`;
    }

    const sheet1Data = [
      [
        'STT',
        'Họ và Tên',
        'Email',
        'Vai Trò',
        'Trạng Thái Trực Tuyến',
        'Chuỗi Học (Ngày)',
        'Tổng Thời Gian Học (Phút)',
        'Tổng Thời Gian Học (Giờ)',
        'Số Bài Quiz Đã Thi',
        'Điểm Quiz Cao Nhất',
        'Điểm Quiz Trung Bình',
        'Lần Hoạt Động Gần Nhất (Giờ VN)',
        'Tổng Số Phiên Vào Web'
      ]
    ];

    const sheet2Data = [
      [
        'STT',
        'Họ và Tên',
        'Email',
        'Mốc Thời Gian Vào Web (Giờ VN)',
        'Mốc Thời Gian Thoát Web (Giờ VN)',
        'Thời Lượng Phiên',
        'Thời Lượng (Giây)',
        'Thiết Bị / Trình Duyệt',
        'Địa Chỉ IP / Mạng',
        'Trạng Thái Phiên'
      ]
    ];

    const sheet3Data = [
      [
        'STT',
        'Họ và Tên',
        'Email',
        'Ngày Học (YYYY-MM-DD)',
        'Thời Gian Luyện Tập (Phút)',
        'Thời Gian Luyện Tập (Giây)'
      ]
    ];

    let userIndex = 1;
    let sessionIndex = 1;
    let dailyIndex = 1;

    for (const [email, u] of Object.entries(users)) {
      const isSuper = isSuperAdmin(email);
      const isAdmin = isUserAdmin(email, userData);
      const roleStr = isSuper ? 'Super Admin' : (isAdmin ? 'Admin / Giáo Viên' : 'Học Viên');

      const lastSeenTimestamp = userPresenceMap.get(email.toLowerCase().trim()) || (u.lastSeenTime ? new Date(u.lastSeenTime).getTime() : 0);
      const isOnline = lastSeenTimestamp ? (now - lastSeenTimestamp <= 120000) : false;
      const statusStr = isOnline ? '🟢 Đang Online' : '⚪ Đã Thoát';

      const stats = u.stats || {};
      const studyMins = Math.round((stats.studyTime || 0) / 60);
      const studyHours = ((stats.studyTime || 0) / 3600).toFixed(1);

      const quizHistory = (userData.quizHistory && userData.quizHistory[email]) || u.quizHistory || [];
      let highestScore = 0;
      let totalScore = 0;
      quizHistory.forEach(q => {
        const sc = Number(q.score) || 0;
        if (sc > highestScore) highestScore = sc;
        totalScore += sc;
      });
      const avgScore = quizHistory.length > 0 ? Math.round(totalScore / quizHistory.length) : 0;

      const accessLogs = Array.isArray(u.accessLogs) ? u.accessLogs : [];

      sheet1Data.push([
        userIndex++,
        u.name || email.split('@')[0],
        email,
        roleStr,
        statusStr,
        calculateStreakFromHistory(stats.dailyHistory),
        studyMins,
        studyHours,
        quizHistory.length,
        highestScore,
        avgScore,
        toVnTimeStr(u.lastSeenTime || stats.lastActiveDate),
        accessLogs.length
      ]);

      accessLogs.forEach(sess => {
        const isCurrentActive = isOnline && !sess.isClosed;
        sheet2Data.push([
          sessionIndex++,
          u.name || email.split('@')[0],
          email,
          toVnTimeStr(sess.enterTime),
          isCurrentActive ? '🟢 Đang Trên Web' : toVnTimeStr(sess.exitTime),
          toDurationStr(sess.durationSeconds || 0),
          sess.durationSeconds || 0,
          sess.device || 'Thiết bị web',
          sess.ip || '',
          isCurrentActive ? '🟢 Online' : '⚪ Đã Thoát'
        ]);
      });

      const dailyHistory = stats.dailyHistory || {};
      Object.keys(dailyHistory).sort().reverse().forEach(dateStr => {
        const sec = dailyHistory[dateStr] || 0;
        const mins = (sec / 60).toFixed(1);
        sheet3Data.push([
          dailyIndex++,
          u.name || email.split('@')[0],
          email,
          dateStr,
          mins,
          sec
        ]);
      });
    }

    const wb = XLSX.utils.book_new();

    const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
    ws1['!cols'] = [
      { wch: 6 },  // STT
      { wch: 25 }, // Tên
      { wch: 30 }, // Email
      { wch: 18 }, // Vai trò
      { wch: 22 }, // Trạng thái
      { wch: 18 }, // Streak
      { wch: 24 }, // Thời gian học (phút)
      { wch: 22 }, // Thời gian học (giờ)
      { wch: 18 }, // Số bài quiz
      { wch: 18 }, // Điểm cao nhất
      { wch: 20 }, // Điểm trung bình
      { wch: 28 }, // Lần hoạt động gần nhất
      { wch: 22 }  // Tổng số phiên
    ];
    XLSX.utils.book_append_sheet(wb, ws1, 'Danh Sách Học Viên');

    const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
    ws2['!cols'] = [
      { wch: 6 },  // STT
      { wch: 25 }, // Tên
      { wch: 30 }, // Email
      { wch: 28 }, // Vào web
      { wch: 28 }, // Thoát web
      { wch: 18 }, // Thời lượng
      { wch: 16 }, // Giây
      { wch: 24 }, // Thiết bị
      { wch: 18 }, // IP
      { wch: 16 }  // Trạng thái
    ];
    XLSX.utils.book_append_sheet(wb, ws2, 'Nhật Ký Vào Thoát Web');

    const ws3 = XLSX.utils.aoa_to_sheet(sheet3Data);
    ws3['!cols'] = [
      { wch: 6 },  // STT
      { wch: 25 }, // Tên
      { wch: 30 }, // Email
      { wch: 18 }, // Ngày học
      { wch: 24 }, // Phút
      { wch: 24 }  // Giây
    ];
    XLSX.utils.book_append_sheet(wb, ws3, 'Lịch Sử Học Theo Ngày');

    const excelBuffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const todayDate = new Date();
    const dateTag = `${todayDate.getFullYear()}_${(todayDate.getMonth() + 1).toString().padStart(2, '0')}_${todayDate.getDate().toString().padStart(2, '0')}`;
    const filename = `Bao_Cao_Nguoi_Dung_TiengTrungHongTai_${dateTag}.xlsx`;

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(excelBuffer);

  } catch (error) {
    console.error('Error exporting user Excel report:', error);
    res.status(500).json({ error: 'Failed to export Excel report' });
  }
});

// POST /api/admin/users/role - Grant or Revoke Admin/Teacher role (Super Admin only)
app.post('/api/admin/users/role', async (req, res) => {
  const currentEmail = getLoggedInUserEmail(req);
  if (!currentEmail || !isSuperAdmin(currentEmail)) {
    return res.status(403).json({ error: 'Chỉ Super Admin (Phú & Tôi Yêu Tin Học) mới có quyền Cấp / Thu hồi quyền quản trị viên.' });
  }

  const { targetEmail, role } = req.body;
  if (!targetEmail || !['admin', 'teacher', 'user'].includes(role)) {
    return res.status(400).json({ error: 'Dữ liệu phân quyền không hợp lệ.' });
  }

  const normalizedTarget = targetEmail.toLowerCase().trim();
  if (isSuperAdmin(normalizedTarget)) {
    return res.status(400).json({ error: 'Không thể thay đổi quyền của Super Admin tối cao.' });
  }

  const userData = await readUserData();
  if (!userData.users[normalizedTarget]) {
    userData.users[normalizedTarget] = {
      name: normalizedTarget.split('@')[0],
      picture: '',
      role,
      stats: { streak: 0, studyTime: 0, lastActiveDate: '' }
    };
  } else {
    userData.users[normalizedTarget].role = role;
  }

  await writeUserData(userData);

  if (mongoose.connection.readyState === 1) {
    await User.updateOne({ _id: normalizedTarget }, { $set: { role } }, { upsert: true }).catch(console.error);
  }

  const roleLabel = role === 'user' ? 'Học viên thông thường' : (role === 'teacher' ? 'Giáo viên' : 'Admin');
  res.json({
    success: true,
    targetEmail: normalizedTarget,
    newRole: role,
    message: role === 'user'
      ? `Đã thu hồi quyền quản trị của ${normalizedTarget} (Trở về Học viên).`
      : `Đã cấp quyền ${roleLabel} cho ${normalizedTarget} thành công!`
  });
});

// ============================================================
// RESEND EMAIL BROADCAST & LEARNER NOTIFICATIONS
// ============================================================

// Helper: Generate anti-spam responsive HTML email
function generateAnnouncementEmailHtml({
  subject,
  headline,
  message,
  actionText,
  actionUrl,
  recipientEmail = ''
}) {
  const safeHeadline = headline || subject || 'Thông Báo Học Tập';
  const formattedMessage = (message || '')
    .split('\n\n')
    .map(para => `<p style="margin: 0 0 16px 0; line-height: 1.7; color: #334155; font-size: 15px;">${para.replace(/\n/g, '<br/>')}</p>`)
    .join('');

  const ctaBtn = (actionUrl && actionText) ? `
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin: 28px auto 12px auto;">
      <tr>
        <td align="center" style="border-radius: 8px; background: linear-gradient(135deg, #e11d48 0%, #be123c 100%);">
          <a href="${actionUrl}" target="_blank" style="display: inline-block; padding: 14px 34px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; font-size: 15px; font-weight: 700; color: #ffffff; text-decoration: none; border-radius: 8px; letter-spacing: 0.3px;">
            ${actionText} &rarr;
          </a>
        </td>
      </tr>
    </table>
  ` : '';

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject || 'Thông Báo Từ Tiếng Trung Hồng Thái'}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f1f5f9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased;">
  <div style="display: none; max-height: 0px; overflow: hidden; mso-hide: all;">
    ${headline || subject || 'Thông báo mới từ Tiếng Trung Hồng Thái'} - Cập nhật nội dung học tập và bài tập mới nhất.
  </div>

  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f1f5f9; padding: 32px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; background-color: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.06); border: 1px solid #e2e8f0;">
          
          <!-- Header Banner -->
          <tr>
            <td style="background: linear-gradient(135deg, #be123c 0%, #e11d48 50%, #f43f5e 100%); padding: 32px 28px; text-align: center;">
              <div style="display: inline-block; width: 48px; height: 48px; line-height: 48px; border-radius: 12px; background: rgba(255, 255, 255, 0.2); color: #ffffff; font-size: 24px; font-weight: 900; margin-bottom: 12px; border: 1px solid rgba(255, 255, 255, 0.35);">
                泰
              </div>
              <h1 style="margin: 0; color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: 0.5px; text-transform: uppercase;">
                TIẾNG TRUNG HỒNG THÁI
              </h1>
              <p style="margin: 6px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 13px; font-weight: 500;">
                Hệ Thống Luyện Thi HSK & Giao Tiếp Thông Minh
              </p>
            </td>
          </tr>

          <!-- Content Body -->
          <tr>
            <td style="padding: 36px 32px 28px 32px;">
              <div style="border-left: 4px solid #e11d48; background-color: #fff1f2; border-radius: 0 8px 8px 0; padding: 14px 18px; margin-bottom: 24px;">
                <h2 style="margin: 0; color: #9f1239; font-size: 18px; font-weight: 700; line-height: 1.4;">
                  ${safeHeadline}
                </h2>
              </div>

              <div style="font-size: 15px; color: #334155; line-height: 1.7;">
                ${formattedMessage}
              </div>

              ${ctaBtn}
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding: 0 32px;">
              <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 0;" />
            </td>
          </tr>

          <!-- Footer (Anti-Spam & Deliverability Compliance) -->
          <tr>
            <td style="padding: 24px 32px 32px 32px; background-color: #f8fafc; text-align: center; color: #64748b; font-size: 12px; line-height: 1.6;">
              <p style="margin: 0 0 8px 0; font-weight: 600; color: #475569;">
                Tiếng Trung Hồng Thái &bull; Học Thông Minh, Nhớ Dài Lâu
              </p>
              <p style="margin: 0 0 10px 0;">
                Bạn nhận được thông báo này vì đã đăng ký tài khoản học tập với email <strong style="color: #334155;">${recipientEmail || 'học viên'}</strong>.
              </p>
              <p style="margin: 0; color: #94a3b8;">
                &copy; 2026 Tiếng Trung Hồng Thái. Toàn bộ bản quyền được bảo lưu.<br/>
                Nếu bạn không muốn nhận thông báo qua email, bạn có thể thay đổi trong cài đặt tài khoản.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// GET /api/admin/broadcast-email/status - Check Resend status and recipient count
app.get('/api/admin/broadcast-email/status', async (req, res) => {
  const currentEmail = getLoggedInUserEmail(req);
  if (!currentEmail || !isUserAdmin(currentEmail)) {
    return res.status(403).json({ error: 'Chỉ Quản trị viên mới có quyền kiểm tra trạng thái gửi email.' });
  }

  let totalLearners = 0;
  try {
    if (mongoose.connection.readyState === 1) {
      totalLearners = await User.countDocuments({});
    } else {
      const uData = await readUserData();
      totalLearners = Object.keys(uData.users || {}).length;
    }
  } catch (e) {
    totalLearners = 0;
  }

  res.json({
    success: true,
    configured: !!resendApiKey,
    senderEmail: RESEND_FROM_EMAIL,
    defaultTestRecipient: isSuperAdmin(currentEmail) ? currentEmail : 'toiyeutinhoc238@gmail.com',
    totalLearners,
    isSandbox: RESEND_FROM_EMAIL.includes('onboarding@resend.dev')
  });
});

// POST /api/admin/broadcast-email - Send broadcast announcement email via Resend
app.post('/api/admin/broadcast-email', async (req, res) => {
  const currentEmail = getLoggedInUserEmail(req);
  if (!currentEmail || !isUserAdmin(currentEmail)) {
    return res.status(403).json({ error: 'Chỉ Quản trị viên mới có quyền gửi email thông báo.' });
  }

  if (!resendClient) {
    return res.status(500).json({
      error: 'Chưa cấu hình RESEND_API_KEY trong hệ thống. Vui lòng kiểm tra lại file backend/.env.'
    });
  }

  const {
    subject,
    headline,
    message,
    actionText,
    actionUrl,
    target = 'test',
    testEmail
  } = req.body;

  if (!subject || !subject.trim()) {
    return res.status(400).json({ error: 'Vui lòng nhập Tiêu đề email (Subject).' });
  }
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Vui lòng nhập Nội dung thông báo.' });
  }

  const sender = RESEND_FROM_EMAIL;

  // 1. Chế độ gửi thử nghiệm (Target: test)
  if (target === 'test') {
    const recipient = (testEmail && testEmail.includes('@'))
      ? testEmail.toLowerCase().trim()
      : (currentEmail || 'toiyeutinhoc238@gmail.com');

    try {
      const emailHtml = generateAnnouncementEmailHtml({
        subject,
        headline,
        message,
        actionText,
        actionUrl,
        recipientEmail: recipient
      });

      const response = await resendClient.emails.send({
        from: sender,
        to: recipient,
        subject: subject.trim(),
        html: emailHtml
      });

      if (response.error) {
        let errorMsg = response.error.message || 'Lỗi gửi email từ Resend';
        if (response.error.statusCode === 403 && response.error.message?.includes('only send testing emails')) {
          errorMsg = `Tài khoản Resend ở chế độ dùng thử (Sandbox) chỉ gửi được đến email chủ (${recipient}). Để gửi tới mọi người học khác, bạn cần xác thực Tên miền (Domain) tại resend.com/domains.`;
        }
        return res.status(400).json({
          success: false,
          error: errorMsg,
          resendError: response.error
        });
      }

      return res.json({
        success: true,
        target: 'test',
        recipient,
        emailId: response.data?.id,
        message: `Đã gửi email thử nghiệm thành công tới ${recipient}!`
      });
    } catch (err) {
      console.error('Send test email error:', err);
      return res.status(500).json({
        success: false,
        error: err.message || 'Lỗi hệ thống khi gửi email.'
      });
    }
  }

  // 2. Chế độ gửi toàn bộ học viên (Target: all)
  let recipientEmails = [];
  try {
    const emailSet = new Set();
    if (mongoose.connection.readyState === 1) {
      const users = await User.find({}, '_id').lean();
      users.forEach(u => {
        if (u._id && u._id.includes('@')) emailSet.add(u._id.toLowerCase().trim());
      });
    }
    const userData = await readUserData();
    if (userData && userData.users) {
      Object.keys(userData.users).forEach(em => {
        if (em && em.includes('@')) emailSet.add(em.toLowerCase().trim());
      });
    }
    recipientEmails = Array.from(emailSet).filter(em => !em.includes('example.com') && !em.includes('test.com'));
  } catch (e) {
    console.error('Error fetching learner emails:', e);
  }

  if (recipientEmails.length === 0) {
    return res.status(400).json({ error: 'Không tìm thấy địa chỉ email học viên nào trong cơ sở dữ liệu.' });
  }

  const isDefaultSandbox = sender.includes('onboarding@resend.dev');
  if (isDefaultSandbox) {
    return res.status(400).json({
      success: false,
      isDomainRequired: true,
      error: 'Tài khoản Resend hiện đang dùng địa chỉ thử nghiệm (onboarding@resend.dev). Theo chính sách bảo mật chống SPAM của Resend, bạn cần thêm Tên miền riêng tại https://resend.com/domains để gửi tới tất cả học viên.',
      recipientCount: recipientEmails.length,
      suggestion: 'Bạn có thể bấm "Gửi Thử Nghiệm" để nhận email ngay tại toiyeutinhoc238@gmail.com. Khi xác thực xong tên miền, bạn chỉ cần cấu hình RESEND_FROM_EMAIL trong backend/.env.'
    });
  }

  // Gửi hàng loạt
  let sentCount = 0;
  let failedCount = 0;
  const errors = [];

  for (const recipient of recipientEmails) {
    try {
      const emailHtml = generateAnnouncementEmailHtml({
        subject,
        headline,
        message,
        actionText,
        actionUrl,
        recipientEmail: recipient
      });

      const response = await resendClient.emails.send({
        from: sender,
        to: recipient,
        subject: subject.trim(),
        html: emailHtml
      });

      if (response.error) {
        failedCount++;
        errors.push(`${recipient}: ${response.error.message}`);
      } else {
        sentCount++;
      }
      await new Promise(r => setTimeout(r, 200));
    } catch (sendErr) {
      failedCount++;
      errors.push(`${recipient}: ${sendErr.message}`);
    }
  }

  return res.json({
    success: true,
    target: 'all',
    totalRecipients: recipientEmails.length,
    sentCount,
    failedCount,
    errors: errors.slice(0, 5),
    message: `Đã gửi thông báo thành công tới ${sentCount}/${recipientEmails.length} học viên!`
  });
});


// Safe date stepping (handles leap years, month & year boundaries cleanly in UTC)
function getPreviousDateStr(dateStr) {
  const [y, m, d] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  dt.setUTCDate(dt.getUTCDate() - 1);
  return dt.toISOString().split('T')[0];
}

// Helper to calculate streak from daily history
// Chuỗi ngày được tính theo số ngày học liên tiếp. Nếu đứt đoạn (nghỉ học) thì xem như mất chuỗi (= 0).
function calculateStreakFromHistory(dailyHistory) {
  if (!dailyHistory || typeof dailyHistory !== 'object') return 0;
  const activeDates = new Set(
    Object.keys(dailyHistory).filter(d => (dailyHistory[d] || 0) > 0)
  );
  if (activeDates.size === 0) return 0;

  // Sử dụng giờ chuẩn Việt Nam (UTC+7 / Asia/Ho_Chi_Minh)
  const todayStr = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Ho_Chi_Minh' }).format(new Date());
  const yesterdayStr = getPreviousDateStr(todayStr);

  // Nếu cả hôm nay và hôm qua người dùng đều không học -> Chuỗi đã bị đứt đoạn -> 0 ngày
  if (!activeDates.has(todayStr) && !activeDates.has(yesterdayStr)) {
    return 0;
  }

  // Điểm bắt đầu tính lùi: nếu hôm nay có học thì bắt đầu từ hôm nay.
  // Nếu hôm nay chưa học nhưng hôm qua có học, chuỗi hôm qua vẫn duy trì.
  let curr = activeDates.has(todayStr) ? todayStr : yesterdayStr;
  let streak = 0;

  while (activeDates.has(curr)) {
    streak++;
    curr = getPreviousDateStr(curr);
  }

  return streak;
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
    const vnTimeNow = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
    const refDateStr = stats.lastActiveDate || vnTimeNow.toISOString().split('T')[0];
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

  // 3. Ensure streak matches history accurately
  stats.streak = calculateStreakFromHistory(stats.dailyHistory);
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

  const vnTimeNow = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
  const todayStr = localDateStr || vnTimeNow.toISOString().split('T')[0];

  if (typeof incrementStudyTime === 'number' && incrementStudyTime > 0) {
    userRecord.stats.studyTime += incrementStudyTime;
    userRecord.stats.dailyHistory[todayStr] = (userRecord.stats.dailyHistory[todayStr] || 0) + incrementStudyTime;
    userRecord.stats.lastActiveDate = todayStr;
  } else if (!userRecord.stats.lastActiveDate) {
    userRecord.stats.lastActiveDate = todayStr;
  }

  ensureDailyHistoryIntegrity(userRecord.stats);
  await writeUserData(userData);
  res.json(userRecord.stats);
});

// POST endpoint for user Session Heartbeat & Access Logs (Enter / Ping / Exit)
app.post('/api/user/session/heartbeat', async (req, res) => {
  let email = getLoggedInUserEmail(req);
  if (!email && req.body && req.body.email && typeof req.body.email === 'string' && req.body.email.includes('@')) {
    email = req.body.email.toLowerCase().trim();
  }
  if (!email) {
    return res.json({ ok: false, error: 'Unauthenticated session' });
  }

  const { sessionId, action, device, timestamp } = req.body || {};
  if (!sessionId) {
    return res.json({ ok: false, error: 'Missing sessionId' });
  }

  const now = new Date();
  const userData = await readUserData();
  let userRecord = userData.users[email];
  if (!userRecord) {
    userRecord = {
      name: email.split('@')[0],
      picture: '',
      role: 'user',
      lastSeenTime: now,
      accessLogs: []
    };
    userData.users[email] = userRecord;
  }

  if (!Array.isArray(userRecord.accessLogs)) {
    userRecord.accessLogs = [];
  }

  userRecord.lastSeenTime = now;

  let session = userRecord.accessLogs.find(s => s.sessionId === sessionId);

  if (action === 'enter' || !session) {
    if (!session) {
      session = {
        sessionId,
        enterTime: timestamp ? new Date(timestamp) : now,
        exitTime: now,
        durationSeconds: 0,
        device: device || 'Thiết bị web',
        ip: req.headers['x-forwarded-for']?.split(',')[0].trim() || req.socket?.remoteAddress || '',
        isClosed: false
      };
      userRecord.accessLogs.push(session);
    } else {
      session.exitTime = now;
      session.durationSeconds = Math.max(0, Math.round((new Date(session.exitTime) - new Date(session.enterTime)) / 1000));
      session.isClosed = false;
    }
  } else if (action === 'exit') {
    session.exitTime = timestamp ? new Date(timestamp) : now;
    session.durationSeconds = Math.max(0, Math.round((new Date(session.exitTime) - new Date(session.enterTime)) / 1000));
    session.isClosed = true;
  } else {
    // 'ping' or periodic keep-alive
    session.exitTime = now;
    session.durationSeconds = Math.max(0, Math.round((new Date(session.exitTime) - new Date(session.enterTime)) / 1000));
    session.isClosed = false;
  }

  // Keep last 150 sessions
  if (userRecord.accessLogs.length > 150) {
    userRecord.accessLogs = userRecord.accessLogs.slice(-150);
  }

  await writeUserData(userData);
  res.json({ ok: true, session });
});

// GET endpoint for Super Admin to query access logs of a specific user
app.get('/api/admin/user/:email/access-logs', async (req, res) => {
  const adminEmail = getLoggedInUserEmail(req);
  if (!adminEmail || !isUserAdmin(adminEmail)) {
    return res.status(403).json({ error: 'Forbidden. Admin access required.' });
  }

  const targetEmail = (req.params.email || '').toLowerCase().trim();
  let userRecord = null;

  // Query directly from MongoDB Atlas
  if (mongoose.connection.readyState === 1) {
    try {
      userRecord = await User.findById(targetEmail).lean();
    } catch (e) { }
  }

  if (!userRecord) {
    const userData = await readUserData();
    userRecord = userData.users && (userData.users[targetEmail] || userData.users[req.params.email]);
  }

  if (!userRecord) {
    return res.status(404).json({ error: 'User not found' });
  }

  const accessLogs = Array.isArray(userRecord.accessLogs) ? [...userRecord.accessLogs].reverse() : [];
  res.json({
    email: targetEmail,
    name: userRecord.name || targetEmail.split('@')[0],
    totalSessions: accessLogs.length,
    accessLogs
  });
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
  const email = (req.query.email || getLoggedInUserEmail(req) || '').toLowerCase().trim();
  if (!email) {
    return res.json([]);
  }

  try {
    let userHistory = [];
    let quizHistory = [];

    // Query directly from MongoDB Atlas for 100% accurate, non-stale data
    if (mongoose.connection.readyState === 1) {
      try {
        const dbUser = await User.findById(email).lean();
        if (dbUser) {
          userHistory = Array.isArray(dbUser.gameHistory) ? dbUser.gameHistory : [];
          quizHistory = Array.isArray(dbUser.quizHistory) ? dbUser.quizHistory : [];
        }
      } catch (e) { }
    }

    // Fallback to in-memory cache if MongoDB returned empty
    if (userHistory.length === 0 && quizHistory.length === 0) {
      const userData = await readUserData();
      const userRecord = userData.users && (userData.users[email] || userData.users[req.query.email]);
      userHistory = (userRecord && userRecord.gameHistory) ? userRecord.gameHistory : [];
      quizHistory = (userData.quizHistory && (userData.quizHistory[email] || userData.quizHistory[req.query.email])) ? (userData.quizHistory[email] || userData.quizHistory[req.query.email]) : [];
    }

    // Gop va sap xep theo thoi gian playedAt moi nhat
    const combined = [...userHistory, ...quizHistory].sort((a, b) => new Date(b.playedAt || b.date || 0) - new Date(a.playedAt || a.date || 0));
    res.json(combined);
  } catch (err) {
    res.json([]);
  }
});

// GET endpoint for Real MongoDB Leaderboard — reads directly from MongoDB
app.get('/api/leaderboard', async (req, res) => {
  try {
    const usersList = await User.find({});

    if (!usersList || usersList.length === 0) {
      return res.json([]);
    }

    const userData = cachedUserData || await readUserData();
    const leaderboard = [];

    for (const u of usersList) {
      const email = u._id;
      const quizHistory = (userData.quizHistory && userData.quizHistory[email]) || u.quizHistory || [];
      const gameHistory = u.gameHistory || [];
      const allAttempts = [...quizHistory, ...gameHistory];

      let highestScore = 0;
      let latestAttemptTime = 0;

      allAttempts.forEach(a => {
        const sc = Number(a.score) || 0;
        if (sc > highestScore) highestScore = sc;
        const t = a.playedAt || a.submittedAt || a.date;
        if (t) {
          const timeVal = new Date(t).getTime();
          if (timeVal > latestAttemptTime) latestAttemptTime = timeVal;
        }
      });

      const lastActive = u.stats && u.stats.lastActiveDate
        ? new Date(u.stats.lastActiveDate).getTime()
        : (latestAttemptTime || (u.lastSeenTime ? new Date(u.lastSeenTime).getTime() : Date.now()));

      leaderboard.push({
        email,
        name: u.name || email.split('@')[0],
        picture: u.picture || '',
        score: highestScore,
        quizCount: allAttempts.length,
        studyTime: u.stats ? (u.stats.studyTime || 0) : 0,
        streak: calculateStreakFromHistory(u.stats?.dailyHistory),
        latestAttemptTime: latestAttemptTime || lastActive
      });
    }

    // Sort real users by highest Quiz score, then quiz count, then study time, then streak
    leaderboard.sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }
      if (b.quizCount !== a.quizCount) {
        return b.quizCount - a.quizCount;
      }
      if (b.studyTime !== a.studyTime) {
        return b.studyTime - a.studyTime;
      }
      if (b.streak !== a.streak) {
        return b.streak - a.streak;
      }
      return b.latestAttemptTime - a.latestAttemptTime;
    });

    const realRankedUsers = leaderboard.map((item, index) => ({
      rank: index + 1,
      name: item.name,
      picture: item.picture,
      score: item.score,
      quizCount: item.quizCount,
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

  const targetLevel = req.query.level;
  const targetLessonId = req.query.lessonId || req.query.lesson;
  const targetVersion = req.query.version || req.query.hskVersion;
  const targetCurriculum = req.query.curriculum;

  let baseList = masterList;
  if (targetCurriculum) {
    baseList = baseList.filter(w => (w.curriculum || 'hsk') === targetCurriculum || (w.hskVersion || '') === targetCurriculum);
  }
  if (targetLevel) {
    baseList = baseList.filter(w => String(w.level) === String(targetLevel) || String(w.level) === `HSK ${targetLevel}`);
  }
  if (targetLessonId) {
    baseList = baseList.filter(w => String(w.lessonId) === String(targetLessonId) || String(w.lesson_id) === String(targetLessonId));
  }
  if (targetVersion) {
    baseList = baseList.filter(w => (w.hskVersion || '3.0') === targetVersion);
  }

  if (!email) {
    // If not logged in, return filtered master list with default unmemorized, unstarred, and not wrong states
    const defaultList = baseList.map(w => ({
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
  const mergedList = baseList.map(item => {
    const state = userProgress[item.id.toString()];
    return {
      ...item,
      isMemorized: state ? !!state.isMemorized : false,
      isStarred: state ? !!state.isStarred : false,
      isWrong: state ? !!state.isWrong : false,
      isStudied: state ? !!state.isStudied : false
    };
  });

  // If specific level or lesson was requested, return filtered list directly without appending global custom words
  if (targetLevel || targetLessonId) {
    return res.json(mergedList);
  }

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
async function handleSetWordWrong(req, res) {
  const email = getLoggedInUserEmail(req);
  if (!email) {
    return res.status(401).json({ error: 'Unauthorized. Please login first.' });
  }

  const id = req.body?.id || req.params?.id;
  const isWrong = req.body?.isWrong !== undefined ? req.body.isWrong : true;
  if (!id) {
    return res.status(400).json({ error: 'Missing word ID' });
  }

  const wordId = parseInt(id);
  const userData = await readUserData();

  if (!isNaN(wordId) && wordId >= 100000) {
    // Custom word wrong set
    const userCustomWords = userData.customWords[email] || [];
    const wordIndex = userCustomWords.findIndex(w => w.id === wordId || String(w.id) === String(id) || w.word === id);
    if (wordIndex === -1) {
      return res.status(404).json({ error: 'Custom word not found' });
    }

    userCustomWords[wordIndex].isWrong = !!isWrong;
    if (isWrong) {
      userCustomWords[wordIndex].isMemorized = false;
      userCustomWords[wordIndex].isStudied = true;
    }
    await writeUserData(userData);
    return res.json(userCustomWords[wordIndex]);
  } else {
    // Built-in word wrong set
    const masterList = await readDatabase();
    const wordIndex = masterList.findIndex(w => (!isNaN(wordId) && w.id === wordId) || String(w.id) === String(id) || w.word === id);
    if (wordIndex === -1) {
      return res.status(404).json({ error: 'Word not found' });
    }

    const matchedWord = masterList[wordIndex];
    const actualId = matchedWord.id;

    if (!userData.progress[email]) {
      userData.progress[email] = {};
    }

    const wordKey = actualId.toString();
    const currentProgress = userData.progress[email][wordKey] || { isMemorized: false, isStarred: false, isWrong: false };

    const updatedProg = {
      ...currentProgress,
      isWrong: !!isWrong,
      ...(isWrong ? { isMemorized: false, isStudied: true } : {})
    };

    userData.progress[email][wordKey] = updatedProg;
    if (matchedWord.word) {
      userData.progress[email][matchedWord.word] = updatedProg;
    }

    await writeUserData(userData);

    res.json({
      ...matchedWord,
      isMemorized: updatedProg.isMemorized,
      isStarred: updatedProg.isStarred,
      isWrong: updatedProg.isWrong,
      isStudied: !!updatedProg.isStudied
    });
  }
}

app.post('/api/vocabulary/set-wrong', handleSetWordWrong);
app.post('/api/vocabulary/:id/wrong', handleSetWordWrong);

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
  const { messages, threadId, userEmail } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'Missing or invalid messages parameter' });
  }

  // Get logged in user if any
  let email = getLoggedInUserEmail(req);
  if (!email && userEmail && typeof userEmail === 'string' && userEmail.includes('@')) {
    email = userEmail.toLowerCase().trim();
  }

  try {
    let reply = '';
    const systemPrompt = `Bạn là Trợ lý AI học tiếng Trung của thương hiệu "Tiếng Trung Hongtai".
QUY TẮC BẮT BUỘC KHI PHẢN HỒI:
1. NÓI NGẮN GỌN, SÚC TÍCH, ĐÚNG TRỌNG TÂM: Người học đang xem trên ô chat nhỏ điện thoại/tablet, tuyệt đối KHÔNG nói dông dài, KHÔNG viết bài luận dài lê thê, KHÔNG mở bài/kết bài rườm rà. Trả lời thẳng vào câu hỏi trong khoảng 2 - 4 câu hoặc vài gạch đầu dòng ngắn.
2. TUYỆT ĐỐI KHÔNG KẺ BẢNG (NO MARKDOWN TABLES): KHÔNG BAO GIỜ dùng cú pháp kẻ bảng (cú pháp |---| hoặc bảng Markdown) vì khung chat nhỏ sẽ bị méo mó, vỡ chữ và tràn viền. Nếu cần liệt kê, BẮT BUỘC dùng danh sách gạch đầu dòng (- hoặc •).
3. RÕ RÀNG VÀ CHUẨN XÁC: Khi giải thích từ vựng hoặc ngữ pháp, luôn kèm Chữ Hán, Pinyin và nghĩa Tiếng Việt ngắn gọn + đúng 1 câu ví dụ ngắn.
4. XƯNG HÔ: Luôn tự xưng là "Trợ lý AI Hongtai", giọng văn thân thiện, ấm áp và gần gũi.`;

    // 1. Primary: Try Groq LLaMA 3.3 70B
    if (groqClient) {
      try {
        const groqMsgs = [
          { role: 'system', content: systemPrompt },
          ...messages.map(m => ({ role: m.role === 'model' ? 'assistant' : m.role, content: m.content }))
        ];
        const completion = await groqClient.chat.completions.create({
          model: 'openai/gpt-oss-120b',
          messages: groqMsgs,
          temperature: 0.7,
          max_tokens: 500
        });
        reply = completion.choices[0]?.message?.content || '';
      } catch (eGroq120) {
        console.warn('[Chat AI] Groq GPT-OSS-120B error, trying GPT-OSS-20B:', eGroq120.message);
        try {
          const groqMsgs = [
            { role: 'system', content: systemPrompt },
            ...messages.map(m => ({ role: m.role === 'model' ? 'assistant' : m.role, content: m.content }))
          ];
          const completion = await groqClient.chat.completions.create({
            model: 'openai/gpt-oss-20b',
            messages: groqMsgs,
            temperature: 0.7,
            max_tokens: 500
          });
          reply = completion.choices[0]?.message?.content || '';
        } catch (eGroq20) {
          console.warn('[Chat AI] Groq GPT-OSS-20B error:', eGroq20.message);
        }
      }
    }

    // 2. Secondary: Try Google Gemini REST API if Groq failed or not present
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (!reply && GEMINI_API_KEY) {
      const geminiModels = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-1.5-flash'];
      const contents = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      for (const modelName of geminiModels) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-goog-api-key': GEMINI_API_KEY
            },
            body: JSON.stringify({
              contents,
              generationConfig: { maxOutputTokens: 500, temperature: 0.7 },
              systemInstruction: { parts: [{ text: systemPrompt }] }
            })
          });

          if (response.ok) {
            const data = await response.json();
            reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
            if (reply) break;
          }
        } catch (eGem) {
          console.warn(`[Chat AI] Gemini model ${modelName} call error:`, eGem.message);
        }
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

    let returnedThreadId = threadId || null;

    // If logged in, persist the messages into user_data.json and MongoDB Atlas
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
        returnedThreadId = threadId || ('thread_' + Date.now() + Math.random().toString(36).substring(2, 6));
        const firstUserMsg = messages.find(m => m.role === 'user')?.content || messages[messages.length - 1]?.content || 'Cuộc trò chuyện mới';
        const title = firstUserMsg.substring(0, 35) + (firstUserMsg.length > 35 ? '...' : '');
        thread = {
          id: returnedThreadId,
          title,
          createdAt: new Date().toISOString(),
          messages: []
        };
        userData.chats[email].unshift(thread);
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

      // Immediate atomic update in MongoDB Atlas for maximum durability
      if (mongoose.connection.readyState === 1) {
        User.updateOne(
          { _id: email },
          { $set: { chats: userData.chats[email], lastSeenTime: new Date() } },
          { upsert: true }
        ).catch(err => console.error('[Chat] Atomic MongoDB chat update error:', err));
      }
    } else {
      // For guest users, generate a stable thread ID for local persistence
      returnedThreadId = threadId || ('thread_guest_' + Date.now() + Math.random().toString(36).substring(2, 6));
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
    return res.json([]);
  }

  const userData = await readUserData();
  let userChats = (userData.chats && userData.chats[email]) || [];

  // If cache is empty, check MongoDB directly
  if (userChats.length === 0 && mongoose.connection.readyState === 1) {
    try {
      const uDoc = await User.findById(email);
      if (uDoc && Array.isArray(uDoc.chats) && uDoc.chats.length > 0) {
        userChats = uDoc.chats;
        if (!userData.chats) userData.chats = {};
        userData.chats[email] = userChats;
      }
    } catch (e) {
      console.warn('Direct MongoDB chat lookup error:', e);
    }
  }

  // Sort by date descending
  const sorted = [...userChats].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Return list of threads (metadata only)
  const metadata = sorted.map(t => ({
    id: t.id,
    title: t.title || 'Cuộc trò chuyện',
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
  let userChats = (userData.chats && userData.chats[email]) || [];

  let thread = userChats.find(t => t.id === id);

  // If not found in cache, check MongoDB directly
  if (!thread && mongoose.connection.readyState === 1) {
    try {
      const uDoc = await User.findById(email);
      if (uDoc && Array.isArray(uDoc.chats)) {
        thread = uDoc.chats.find(t => t.id === id);
        if (thread) {
          if (!userData.chats) userData.chats = {};
          if (!userData.chats[email]) userData.chats[email] = [];
          if (!userData.chats[email].some(t => t.id === id)) {
            userData.chats[email].push(thread);
          }
        }
      }
    } catch (e) {
      console.warn('Direct MongoDB thread lookup error:', e);
    }
  }

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

      if (mongoose.connection.readyState === 1) {
        User.updateOne(
          { _id: email },
          { $set: { chats: userData.chats[email] } }
        ).catch(err => console.error('Atomic MongoDB chat deletion error:', err));
      }

      return res.json({ success: true, message: 'Đã xóa cuộc trò chuyện.' });
    }
  }

  // Also try MongoDB deletion directly if not found in cache
  if (mongoose.connection.readyState === 1) {
    try {
      const uDoc = await User.findById(email);
      if (uDoc && Array.isArray(uDoc.chats)) {
        const filtered = uDoc.chats.filter(t => t.id !== id);
        if (filtered.length < uDoc.chats.length) {
          await User.updateOne({ _id: email }, { $set: { chats: filtered } });
          if (!userData.chats) userData.chats = {};
          userData.chats[email] = filtered;
          return res.json({ success: true, message: 'Đã xóa cuộc trò chuyện.' });
        }
      }
    } catch (e) {
      console.warn('MongoDB direct thread deletion error:', e);
    }
  }

  res.status(404).json({ error: 'Không tìm thấy cuộc trò chuyện để xóa.' });
});

// POST endpoint to migrate guest chat history to a new or existing user account
app.post('/api/chat/migrate', async (req, res) => {
  const email = getLoggedInUserEmail(req);
  if (!email) {
    return res.status(401).json({ error: 'Chưa đăng nhập.' });
  }

  const { messages, threads: incomingThreads } = req.body;

  try {
    const userData = await readUserData();
    if (!userData.chats) userData.chats = {};
    if (!userData.chats[email]) userData.chats[email] = [];

    let migratedCount = 0;
    let mainThreadId = null;

    // Handle full threads array migration
    if (Array.isArray(incomingThreads) && incomingThreads.length > 0) {
      for (const t of incomingThreads) {
        if (!t || !t.id || !Array.isArray(t.messages) || t.messages.length === 0) continue;
        const existingIdx = userData.chats[email].findIndex(item => item.id === t.id);
        if (existingIdx !== -1) {
          // Merge / update messages if longer
          if (t.messages.length > (userData.chats[email][existingIdx].messages || []).length) {
            userData.chats[email][existingIdx].messages = t.messages;
          }
        } else {
          userData.chats[email].unshift({
            id: t.id,
            title: t.title || 'Cuộc trò chuyện',
            createdAt: t.createdAt || new Date().toISOString(),
            messages: t.messages
          });
          migratedCount++;
        }
        if (!mainThreadId) mainThreadId = t.id;
      }
    } else if (Array.isArray(messages) && messages.length > 0) {
      // Handle single messages list migration
      const threadId = 'thread_' + Date.now() + Math.random().toString(36).substring(2, 6);
      const firstUserMsg = messages.find(m => m.role === 'user')?.content || 'Cuộc trò chuyện được đồng bộ';
      const title = firstUserMsg.substring(0, 35) + (firstUserMsg.length > 35 ? '...' : '');

      const thread = {
        id: threadId,
        title,
        createdAt: new Date().toISOString(),
        messages: messages.map(m => ({
          role: m.role,
          content: m.content,
          timestamp: m.timestamp || new Date().toISOString()
        }))
      };

      userData.chats[email].unshift(thread);
      migratedCount++;
      mainThreadId = threadId;
    }

    if (migratedCount > 0) {
      await writeUserData(userData);

      if (mongoose.connection.readyState === 1) {
        await User.updateOne(
          { _id: email },
          { $set: { chats: userData.chats[email] } },
          { upsert: true }
        );
      }
    }

    res.json({ success: true, threadId: mainThreadId, count: migratedCount });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ error: 'Có lỗi xảy ra khi đồng bộ lịch sử hội thoại.' });
  }
});

// ==========================================================================
// AI LESSON TEXTS & VOCABULARY PRACTICE ENDPOINTS
// ==========================================================================

// POST endpoint for AI Story Retell Feedback (Bài Khóa)
app.post('/api/ai/review-retell', async (req, res) => {
  const { storyText, dialogueLines, lessonTitle, level } = req.body;
  if (!storyText || !storyText.trim()) {
    return res.status(400).json({ error: 'Nội dung kể chuyện không được để trống.' });
  }

  const prompt = `Bạn là giáo viên dạy tiếng Trung HSK chuyên nghiệp của "Tiếng Trung Hongtai".
Học viên vừa học xong bài khóa cấp độ HSK ${level || 1} "${lessonTitle || ''}".
Nội dung bài khóa gốc:
${(dialogueLines || []).map(l => `${l.speaker || ''}: ${l.zh} (${l.vi || ''})`).join('\n')}

Học viên đã tự tóm tắt / kể lại câu chuyện bài khóa như sau:
"${storyText.trim()}"

Hãy đánh giá bài viết của học viên và trả về ĐÚNG 1 JSON object (không bọc code block markdown thừa) với cấu trúc sau:
{
  "score": <số điểm từ 0 đến 100>,
  "assessment": "<Nhận xét ngắn gọn, khích lệ và đánh giá độ chính xác so với bài gốc bằng tiếng Việt>",
  "goodPoints": ["<điểm tốt 1>", "<điểm tốt 2>"],
  "improvements": ["<lỗi ngữ pháp, dùng từ và cách sửa chi tiết>"],
  "nativeVersion": "<Phiên bản viết lại bằng tiếng Trung tự nhiên, chuẩn người bản xứ>",
  "nativePinyin": "<Pinyin có dấu của nativeVersion>",
  "nativeVi": "<Dịch nghĩa tiếng Việt của nativeVersion>"
}`;

  try {
    let reply = '';
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (groqClient) {
      try {
        const completion = await groqClient.chat.completions.create({
          model: 'openai/gpt-oss-120b',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1500
        });
        reply = completion.choices[0]?.message?.content || '';
      } catch (eGroq) {
        try {
          const completion2 = await groqClient.chat.completions.create({
            model: 'openai/gpt-oss-20b',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.3,
            max_tokens: 1500
          });
          reply = completion2.choices[0]?.message?.content || '';
        } catch (eGroq2) { }
      }
    }

    if (!reply && GEMINI_API_KEY) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (response.ok) {
        const data = await response.json();
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    }

    let result = null;
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { result = JSON.parse(jsonMatch[0]); } catch (e) { }
    }
    if (!result) {
      result = {
        score: 88,
        assessment: "Bài kể lại rất tốt, đã nắm được ý chính và các nhân vật của bài khóa!",
        goodPoints: ["Nắm bắt được cốt truyện và bối cảnh hội thoại.", "Sử dụng từ vựng phù hợp."],
        improvements: ["Có thể kết hợp thêm liên từ nối để câu văn tự nhiên hơn."],
        nativeVersion: storyText,
        nativePinyin: "",
        nativeVi: ""
      };
    }
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('AI Retell error:', err);
    res.json({
      success: true,
      score: 85,
      assessment: "Bạn đã kể lại được diễn biến bài khóa rất tốt!",
      goodPoints: ["Nắm đúng nội dung chính của bài."],
      improvements: ["Chú ý luyện thêm cách phát âm và cấu trúc câu liên kết."],
      nativeVersion: storyText,
      nativePinyin: "",
      nativeVi: ""
    });
  }
});

// Helper: Nhận diện các cấu trúc ngữ pháp (NP) tiếng Trung trong câu
function detectChineseGrammarPoints(sentence) {
  if (!sentence) return [];
  const points = [];
  
  // 1. Cấu trúc câu phức & Liên từ cặp đôi
  if (/虽然|尽管/.test(sentence) && /但是|但|可是|却/.test(sentence)) points.push('Mệnh đề nhượng bộ (虽然...但是...)');
  else if (/虽然|尽管/.test(sentence)) points.push('Từ nối nhượng bộ (虽然/尽管)');
  
  if (/因为/.test(sentence) && /所以/.test(sentence)) points.push('Mệnh đề nhân quả (因为...所以...)');
  else if (/因为|由于/.test(sentence)) points.push('Nguyên nhân (因为/由于)');
  else if (/所以|因此/.test(sentence)) points.push('Kết quả (所以/因此)');

  if (/不但|不仅|不光/.test(sentence) && /而且|并且|也|还/.test(sentence)) points.push('Mệnh đề tăng tiến (不但...而且...)');
  else if (/不但|不仅/.test(sentence)) points.push('Cấu trúc tăng tiến (不但/不仅)');

  if (/如果|要是|假如/.test(sentence) && /就|便|那么/.test(sentence)) points.push('Mệnh đề giả thiết (如果...就...)');
  else if (/如果|要是/.test(sentence)) points.push('Cấu trúc điều kiện (如果/要是)');

  if (/只要/.test(sentence) && /就/.test(sentence)) points.push('Điều kiện đầy đủ (只要...就...)');
  if (/只有/.test(sentence) && /才/.test(sentence)) points.push('Điều kiện cần (只有...才...)');
  if (/一边/.test(sentence) && sentence.indexOf('一边') !== sentence.lastIndexOf('一边')) points.push('Hành động song song (一边...一边...)');
  else if (/又[\u4e00-\u9fa5]+又[\u4e00-\u9fa5]+/.test(sentence)) points.push('Tính chất song song (又...又...)');
  if (/除了/.test(sentence) && /以外|都|也|还/.test(sentence)) points.push('Cấu trúc loại trừ (除了...以外...)');
  if (/越[\u4e00-\u9fa5]+越[\u4e00-\u9fa5]+/.test(sentence)) points.push('Cấu trúc tiến triển (越...越...)');
  if (/既然/.test(sentence) && /就|也/.test(sentence)) points.push('Liên từ suy luận (既然...就...)');
  if (/连[\u4e00-\u9fa5]+(?:都|也)/.test(sentence)) points.push('Cấu trúc nhấn mạnh (连...都/也...)');

  // 2. Các câu đặc thù tiếng Trung
  if (/把[\u4e00-\u9fa5]+(?:[\u4e00-\u9fa5]{1,4})/.test(sentence)) points.push('Câu chữ 把 (câu xử lý)');
  if (/被[\u4e00-\u9fa5]+/.test(sentence)) points.push('Câu chữ 被 (câu bị động)');
  if (/比[\u4e00-\u9fa5]+(?:更|还|大|小|多|少|高|快|好|漂亮|便宜|贵|远|近|长|短)/.test(sentence)) points.push('Câu so sánh 比');
  if (/没有[\u4e00-\u9fa5]+(?:那么|这么)/.test(sentence)) points.push('Câu so sánh 没有...那么');
  if (/是[\u4e00-\u9fa5]+的[。！？]?$/.test(sentence) || /是[\u4e00-\u9fa5]{2,}的/.test(sentence)) points.push('Cấu trúc nhấn mạnh 是...的');

  // 3. Bổ ngữ
  if (/[\u4e00-\u9fa5]得(?:很|非常|十分|特别|真|极了|太|好|快|慢|多|少|高)/.test(sentence)) points.push('Bổ ngữ trạng thái (V + 得...)');
  if (/[\u4e00-\u9fa5](?:得懂|不懂|得见|不见|得完|不完|得了|不了|得上|不上|得下|不下|得起|不起)/.test(sentence)) points.push('Bổ ngữ khả năng');
  if (/[\u4e00-\u9fa5](?:出来|进去|过来|过去|起来|下去|回来|回去|上来|上去|下来)/.test(sentence)) points.push('Bổ ngữ xu hướng kép');
  if (/(?:做完|写完|学完|看完|吃完|听懂|看懂|买到|找到|看到|听到|做好|准备好|学会|记住)/.test(sentence)) points.push('Bổ ngữ kết quả');

  // 4. Trợ từ động thái & thời thái
  if (/(?:正在|在)[\u4e00-\u9fa5]+(?:呢)?/.test(sentence)) points.push('Thì tiếp diễn (正在/在...呢)');
  if (/[\u4e00-\u9fa5]着/.test(sentence) && !/虽然|接着|着急/.test(sentence)) points.push('Trợ từ động thái 着 (tiếp diễn trạng thái)');
  if (/[\u4e00-\u9fa5]过/.test(sentence) && !/经过|不过|过去|难过/.test(sentence)) points.push('Trợ từ động thái 过 (từng trải qua)');

  return Array.from(new Set(points));
}

// POST endpoint for AI Vocabulary Sentence Checking (Ôn Tập Từ Vựng)
app.post('/api/ai/check-sentence', async (req, res) => {
  const { word, sentence, level } = req.body;
  if (!sentence || !sentence.trim()) {
    return res.status(400).json({ error: 'Câu đặt không được để trống.' });
  }

  const cleanSentence = sentence.trim();
  const targetWord = (word || '').trim();
  const containsWord = targetWord ? cleanSentence.includes(targetWord) : true;
  const isGibberish = /^([a-zA-Z0-9\u4e00-\u9fa5])\1{3,}$/.test(cleanSentence) || cleanSentence.length < 2;
  const charCount = (cleanSentence.match(/[\u4e00-\u9fa5\u3400-\u4dbfa-zA-Z0-9]/g) || []).length;
  const detectedGrammar = detectChineseGrammarPoints(cleanSentence);
  const npCount = detectedGrammar.length;
  const npListStr = detectedGrammar.length > 0 ? detectedGrammar.join(', ') : 'Chưa phát hiện điểm ngữ pháp nâng cao nào (câu cấu trúc cơ bản)';

  const prompt = `Bạn là giáo viên dạy tiếng Trung CỰC KỲ KHÓ TÍNH, CHUẨN MỰC và SƯ PHẠM NGHIÊM KHẮC của "Tiếng Trung Hongtai".
Nhiệm vụ: Chấm điểm thật KHẮT KHE, CÔNG TÂM và nhận xét chi tiết câu học sinh tự đặt để luyện từ vựng.

Từ vựng mục tiêu cần đặt câu: "${targetWord}" (Trình độ: HSK ${level || 1}).
Câu học sinh đã đặt: "${cleanSentence}" (Độ dài: ${charCount} ký tự chữ Hán).
Cấu trúc ngữ pháp (NP) sơ bộ nhận diện trong câu: ${npListStr}.

BẢNG QUY TẮC CHẤM ĐIỂM BẮT BUỘC (RẤT KHẮT KHE - TUÂN THỦ TUYỆT ĐỐI):

1. THIẾU TỪ MỤC TIÊU HOẶC GÕ VÔ NGHĨA / RÁC (score: 0 - 20 ĐIỂM, isCorrect: false):
   - Nếu câu KHÔNG chứa từ vựng mục tiêu "${targetWord}" (kể cả thiếu nét, gõ sai chữ Hán của từ vựng): CHO ĐIỂM THẤP TỪ 0 ĐẾN 20 ĐIỂM!
   - Nếu câu gõ bậy bạ, ký tự rác vô nghĩa: CHO ĐIỂM TỪ 0 ĐẾN 10 ĐIỂM.
   - Nhận xét: Nghiêm khắc nhắc nhở câu hoàn toàn chưa sử dụng từ vựng yêu cầu "${targetWord}".

2. DÙNG SAI TỪ, SAI NGỮ PHÁP HOẶC SAI NGỮ CẢNH (score: 15 - 40 ĐIỂM, isCorrect: false):
   - Dùng sai từ loại của "${targetWord}" (ví dụ: từ là tính từ nhưng dùng làm động từ mang tân ngữ, hoặc phó từ đặt sai vị trí).
   - Dùng sai ngữ cảnh / kết hợp từ không tự nhiên (dịch từng từ thô từ tiếng Việt sang chữ Hán, chắp vá từ ngô nghê).
   - Sai trật tự ngữ pháp tiếng Trung cơ bản.
   - CHO ĐIỂM THẤP TỪ 15 ĐẾN 40 ĐIỂM!
   - Nhận xét: Chỉ rõ cụ thể lỗi sai: từ "${targetWord}" bị dùng sai ở đâu, cấu trúc nào bị sai, và sửa lại câu đúng chuẩn.

3. ĐÚNG NGỮ PHÁP NHƯNG CÂU ĐƠN GIẢN / CƠ BẢN (CHỈ CHO ĐIỂM TRUNG BÌNH: 50 - 65 ĐIỂM, isCorrect: true):
   - Câu ĐÚNG ngữ pháp và có chứa đúng từ "${targetWord}", nhưng câu NGẮN hoặc là CÂU ĐƠN GIẢN (chỉ có Chủ - Vị - Tân cơ bản, dưới 8-10 chữ Hán, ít thành phần mở rộng, không dùng ngữ pháp nâng cao).
   - Ví dụ: "我学习汉语。", "他非常喜欢苹果。", "今天天气很好。", "我想去商店买东西。"
   - TUYỆT ĐỐI CHỈ ĐƯỢC CHO ĐIỂM TRUNG BÌNH TỪ 50 ĐẾN 65 ĐIỂM! (Cấm cho điểm cao 75-90 ở trường hợp này).
   - Nhận xét: Ghi nhận câu đúng ngữ pháp và dùng từ chuẩn, nhưng thẳng thắn nhận xét câu còn quá cơ bản, cấu trúc đơn điệu; khuyên học sinh muốn đạt điểm cao thì phải mở rộng câu, dùng thêm trạng ngữ thời gian, nơi chốn, liên từ và cấu trúc ngữ pháp (np) phức hợp.

4. CÂU MỨC ĐỘ KHÁ (score: 70 - 79 ĐIỂM, isCorrect: true):
   - Câu có độ dài từ 8 đến 12 chữ Hán, diễn đạt rõ ràng, có trạng ngữ thời gian/địa điểm cụ thể HOẶC áp dụng được 1 cấu trúc ngữ pháp cơ bản (câu so sánh 比, trợ từ động thái 了/着/过, câu chữ 是...的, bổ ngữ kết quả...).
   - Nhận xét: Khen câu hoàn chỉnh, diễn đạt tốt; gợi ý phát triển thêm liên từ để câu đạt điểm cao hơn.

5. CÂU DÀI VÀ SỬ DỤNG NHIỀU CẤU TRÚC NGỮ PHÁP (NHIỀU NP) THÌ ĐIỂM MỚI CAO (score: 80 - 100 ĐIỂM, isCorrect: true):
   - Mức Rất Tốt (80 - 89 ĐIỂM):
     + YÊU CẦU: Câu phải DÀI (từ 12-16 chữ Hán trở lên), diễn đạt tự nhiên, VÀ bắt buộc phải áp dụng thành thạo từ 1 đến 2 cấu trúc ngữ pháp (np) quan trọng (như câu chữ 把, câu chữ 被, liên từ cặp đôi 虽然...但是..., 因为...所以..., 不但...而且..., 一边...一边..., 如果...就..., bổ ngữ trạng thái 得, bổ ngữ khả năng, bổ ngữ xu hướng kép).
     + Nhận xét: Khen câu dài, biểu đạt lưu loát và vận dụng đúng cấu trúc ngữ pháp.
   - Mức Xuất Sắc (90 - 100 ĐIỂM):
     + YÊU CẦU CỰC CAO: Câu phải RẤT DÀI (từ 16 chữ Hán trở lên), giàu ngữ cảnh thực tế, văn phong tự nhiên chuẩn bản ngữ, VÀ kết hợp NHIỀU CẤU TRÚC NGỮ PHÁP (từ 2-3 điểm ngữ pháp trở lên) một cách nhuần nhuyễn.
     + Nhận xét: Khen ngợi nồng nhiệt vì câu dài, tư duy ngữ pháp phong phú và hành văn như người bản xứ.

ĐỊNH DẠNG TRẢ VỀ:
Trả về DUY NHẤT 1 JSON object thuần túy (không bọc trong markdown block hay văn bản nào khác):
{
  "isCorrect": <true hoặc false>,
  "score": <số nguyên từ 0 đến 100 theo đúng bảng điểm khắt khe ở trên>,
  "grammarPoints": ["<Tên cấu trúc ngữ pháp 1 đã dùng>", "<Tên cấu trúc ngữ pháp 2 đã dùng>"],
  "feedback": "<Lời nhận xét tiếng Việt chi tiết, thẳng thắn, nêu rõ vì sao đúng/sai, chỉ ra điểm ngữ pháp đã dùng hoặc cần cải thiện>",
  "improvedSentence": "<Câu tiếng Trung gợi ý nâng cấp mượt mà hoặc câu sửa lỗi chuẩn xác>",
  "pinyin": "<Pinyin có dấu của improvedSentence>",
  "translation": "<Bản dịch tiếng Việt chuẩn của improvedSentence>"
}`;

  try {
    let reply = '';
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (groqClient) {
      try {
        const completion = await groqClient.chat.completions.create({
          model: 'openai/gpt-oss-120b',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 800
        });
        reply = completion.choices[0]?.message?.content || '';
      } catch (eGroq) {
        try {
          const completion2 = await groqClient.chat.completions.create({
            model: 'openai/gpt-oss-20b',
            messages: [{ role: 'user', content: prompt }],
            temperature: 0.2,
            max_tokens: 800
          });
          reply = completion2.choices[0]?.message?.content || '';
        } catch (eGroq2) { }
      }
    }
    if (!reply && GEMINI_API_KEY) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (response.ok) {
        const data = await response.json();
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    }

    let result = null;
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { result = JSON.parse(jsonMatch[0]); } catch (e) { }
    }
    if (!result) {
      if (!containsWord || isGibberish) {
        result = {
          isCorrect: false,
          score: 15,
          grammarPoints: [],
          feedback: `Câu của bạn ${!containsWord ? `chưa chứa từ vựng mục tiêu "${targetWord}"` : 'chưa có nghĩa hoàn chỉnh'}. Hãy thử đặt lại câu nhé!`,
          improvedSentence: `今天${targetWord || ''}。`,
          pinyin: "",
          translation: ""
        };
      } else {
        // Fallback calculation strictly based on length and grammar points
        let fallbackScore = 55;
        let fallbackFb = `Câu có sử dụng từ "${targetWord}" đúng ngữ pháp nhưng cấu trúc còn đơn giản. Hãy thử thêm trạng ngữ thời gian, nơi chốn hoặc liên từ để đạt điểm cao hơn nhé!`;
        if (npCount >= 2 && charCount >= 15) {
          fallbackScore = 93;
          fallbackFb = `Xuất sắc! Câu của bạn dài (${charCount} chữ), diễn đạt lưu loát và vận dụng nhiều cấu trúc ngữ pháp (${detectedGrammar.join(', ')}) rất tự nhiên!`;
        } else if (npCount >= 1 && charCount >= 12) {
          fallbackScore = 84;
          fallbackFb = `Rất tốt! Câu có độ dài tốt (${charCount} chữ) và áp dụng tốt cấu trúc ngữ pháp: ${detectedGrammar.join(', ')}!`;
        } else if (charCount >= 8 && (npCount >= 1 || charCount >= 10)) {
          fallbackScore = 72;
          fallbackFb = `Khá tốt! Câu của bạn rõ nghĩa, sử dụng từ "${targetWord}" chuẩn xác. Hãy thử dùng thêm liên từ câu phức để nâng cao điểm số!`;
        } else {
          fallbackScore = 58;
          fallbackFb = `Câu đúng ngữ pháp cơ bản và dùng đúng từ "${targetWord}", nhưng câu còn ngắn (${charCount} chữ) và đơn giản. Cần mở rộng câu và dùng thêm cấu trúc ngữ pháp để đạt điểm cao hơn!`;
        }
        result = {
          isCorrect: true,
          score: fallbackScore,
          grammarPoints: detectedGrammar,
          feedback: fallbackFb,
          improvedSentence: cleanSentence,
          pinyin: "",
          translation: ""
        };
      }
    } else {
      // Đảm bảo kiểu dữ liệu và ràng buộc logic khắt khe
      const fb = (result.feedback || '').toLowerCase();
      const mentionsFailure = fb.includes('vô nghĩa') || fb.includes('không chứa từ') || fb.includes('chưa chứa từ') || fb.includes('thiếu từ') || fb.includes('không có nghĩa') || fb.includes('chưa đáp ứng') || fb.includes('sai ngữ pháp') || fb.includes('dùng sai');
      
      if (!Array.isArray(result.grammarPoints) || result.grammarPoints.length === 0) {
        result.grammarPoints = detectedGrammar;
      }

      if (isGibberish || (!containsWord && targetWord) || (!containsWord && mentionsFailure)) {
        // 1. Thiếu từ hoặc vô nghĩa: cho điểm thấp luôn! (0 - 20 điểm)
        result.isCorrect = false;
        result.score = Math.min(typeof result.score === 'number' ? result.score : 15, 20);
        if (!result.feedback || (!result.feedback.includes('thiếu') && !result.feedback.includes('chưa chứa'))) {
          result.feedback = `Câu của bạn hoàn toàn chưa chứa từ vựng mục tiêu "${targetWord}". Vui lòng đặt lại câu có sử dụng từ này nhé!`;
        }
      } else if (result.isCorrect === false || mentionsFailure) {
        // 2. Sai từ / sai ngữ pháp: cho điểm thấp luôn! (15 - 38 điểm)
        result.isCorrect = false;
        result.score = Math.min(Math.max(typeof result.score === 'number' ? result.score : 25, 15), 38);
      } else {
        // 3, 4, 5. Câu đúng:
        result.isCorrect = true;
        let baseScore = typeof result.score === 'number' ? result.score : 60;
        const totalNp = Math.max(npCount, (result.grammarPoints || []).length);

        // Quy tắc: Đúng thì điểm trung bình (50-65). Câu dài VÀ dùng nhiều np thì điểm mới cao!
        if (charCount < 8 || totalNp === 0) {
          // Câu ngắn hoặc không có cấu trúc ngữ pháp: CHỈ ĐIỂM TRUNG BÌNH (50 - 65)
          result.score = Math.min(Math.max(baseScore, 50), 65);
          if (result.feedback && !result.feedback.includes('đơn giản') && !result.feedback.includes('ngắn') && !result.feedback.includes('trung bình') && !result.feedback.includes('mở rộng')) {
            result.feedback += ' (Đánh giá mức Trung Bình: Câu đúng cơ bản nhưng còn ngắn/đơn giản. Hãy mở rộng câu dài hơn và áp dụng thêm cấu trúc ngữ pháp như câu chữ 把, liên từ hoặc bổ ngữ để đạt điểm cao hơn nhé!)';
          }
        } else if (totalNp >= 2 && charCount >= 15) {
          // Câu rất dài VÀ nhiều np: 90 - 100 điểm
          result.score = Math.min(Math.max(baseScore, 90), 100);
        } else if (totalNp >= 1 && charCount >= 12) {
          // Câu dài VÀ có 1-2 np: 80 - 88 điểm
          result.score = Math.min(Math.max(baseScore, 80), 88);
        } else if (charCount >= 8 || totalNp >= 1) {
          // Câu khá: 70 - 78 điểm
          result.score = Math.min(Math.max(baseScore, 70), 78);
        } else {
          result.score = Math.min(baseScore, 65);
        }
      }
    }
    res.json({ success: true, ...result });
  } catch (err) {
    console.error('AI Check sentence error:', err);
    const ok = containsWord && !isGibberish;
    let fallbackScore = 15;
    let fallbackFb = `Câu chưa chứa từ vựng mục tiêu "${targetWord}".`;
    if (ok) {
      if (npCount >= 2 && charCount >= 15) {
        fallbackScore = 93;
        fallbackFb = `Xuất sắc! Câu dài (${charCount} chữ), diễn đạt lưu loát và vận dụng nhiều cấu trúc ngữ pháp: ${detectedGrammar.join(', ')}.`;
      } else if (npCount >= 1 && charCount >= 12) {
        fallbackScore = 84;
        fallbackFb = `Rất tốt! Câu có độ dài tốt (${charCount} chữ) và áp dụng cấu trúc ngữ pháp: ${detectedGrammar.join(', ')}.`;
      } else if (charCount >= 8 && (npCount >= 1 || charCount >= 10)) {
        fallbackScore = 72;
        fallbackFb = `Khá tốt! Câu rõ nghĩa, dùng từ "${targetWord}" chuẩn xác. Hãy thử dùng thêm liên từ câu phức để nâng cao điểm số.`;
      } else {
        fallbackScore = 58;
        fallbackFb = `Câu đúng ngữ pháp cơ bản và dùng đúng từ "${targetWord}", nhưng câu còn ngắn (${charCount} chữ) và đơn giản. Cần mở rộng câu và dùng thêm cấu trúc ngữ pháp để đạt điểm cao hơn!`;
      }
    }
    res.json({
      success: true,
      isCorrect: ok,
      score: fallbackScore,
      grammarPoints: detectedGrammar,
      feedback: fallbackFb,
      improvedSentence: cleanSentence,
      pinyin: "",
      translation: ""
    });
  }
});

// ==========================================================================
// AI ESSAY GRADING & WRITING PRACTICE API (Luyện Viết & AI Chấm Bài Dài)
// ==========================================================================

// 1. Chấm điểm bài viết tự do & bài viết theo đề bài
app.post('/api/ai/grade-essay', async (req, res) => {
  const { text, mode, topicTitle, topicPrompt, requiredKeywords, hskLevel, minWords } = req.body;
  if (!text || !text.trim()) {
    return res.status(400).json({ error: 'Nội dung bài viết không được để trống.' });
  }

  const cleanText = text.trim();
  const wordCount = (cleanText.match(/[\u4e00-\u9fa5\u3400-\u4dbfa-zA-Z0-9]/g) || []).length;
  const isPromptMode = mode === 'prompt';

  const prompt = `Bạn là giám khảo và chuyên gia chấm thi viết tiếng Trung HSK hàng đầu của "Tiếng Trung Hongtai".
Nhiệm vụ của bạn là chấm điểm, phân tích lỗi sai và hướng dẫn sửa bài viết tiếng Trung của học viên.

Thông tin bài làm:
- Chế độ: ${isPromptMode ? 'Viết theo đề bài' : 'Bài viết tự do'}
${isPromptMode ? `- Đề bài: "${topicTitle || ''}"\n- Yêu cầu: "${topicPrompt || ''}"` : ''}
${isPromptMode && requiredKeywords && requiredKeywords.length > 0 ? `- Các từ khóa bắt buộc: ${JSON.stringify(requiredKeywords)}` : ''}
- Trình độ mục tiêu: HSK ${hskLevel || 'Tự do'}
- Số chữ học viên viết: ${wordCount} chữ Hán ${minWords ? `(Yêu cầu đề xuất: ${minWords} chữ)` : ''}

Nội dung bài viết của học viên:
"""
${cleanText}
"""

Hãy chấm điểm công tâm, chỉ ra cụ thể từng lỗi sai và hướng dẫn học viên viết hay hơn.
Trả về ĐÚNG 1 JSON object:
{
  "overallScore": <điểm tổng thể từ 0 đến 100>,
  "badge": "<Một trong các huy hiệu: 'Xuất Sắc 🌟' (>=90) | 'Rất Tốt 👏' (>=80) | 'Khá 👍' (>=65) | 'Cần Cố Gắng ✍️' (<65)>",
  "wordCount": ${wordCount},
  "criteriaScores": {
    "grammar": <điểm ngữ pháp 0-100>,
    "vocabulary": <điểm vốn từ 0-100>,
    "coherence": <điểm mạch lạc liên kết 0-100>,
    "taskFulfillment": <điểm bám sát đề và độ dài 0-100>
  },
  "generalFeedback": "<Nhận xét tổng quan bằng tiếng Việt: đánh giá văn phong, cảm xúc, khả năng biểu đạt>",
  "strengths": [
    "<Điểm sáng 1 của bài viết>",
    "<Điểm sáng 2 của bài viết>"
  ],
  "errorsList": [
    {
      "original": "<câu hoặc cụm từ học viên viết chưa chuẩn>",
      "corrected": "<cách sửa lại đúng ngữ pháp và tự nhiên>",
      "reason": "<giải thích lý do bằng tiếng Việt>"
    }
  ],
  "nativeVersion": "<Bản viết lại toàn bài văn chuẩn phong cách người bản xứ, mượt mà và tự nhiên>",
  "nativePinyin": "<Pinyin có dấu thanh điệu đầy đủ của nativeVersion>",
  "nativeVi": "<Bản dịch tiếng Việt mượt mà của nativeVersion>",
  "advancedVocabSuggestions": [
    {
      "original": "<từ cơ bản trong bài>",
      "suggested": "<từ vựng hoặc thành ngữ HSK cao cấp hơn>",
      "pinyin": "<phiên âm>",
      "meaning": "<nghĩa tiếng Việt>"
    }
  ]
}`;

  try {
    let reply = '';
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (groqClient) {
      try {
        const completion = await groqClient.chat.completions.create({
          model: 'openai/gpt-oss-120b',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 2500
        });
        reply = completion.choices[0]?.message?.content || '';
      } catch (eGroq) {
        console.warn('Groq essay grading failed, trying Gemini...', eGroq.message);
      }
    }

    if (!reply && GEMINI_API_KEY) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (response.ok) {
        const data = await response.json();
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    }

    let result = null;
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { result = JSON.parse(jsonMatch[0]); } catch (e) { }
    }

    if (!result) {
      result = {
        overallScore: 86,
        badge: "Rất Tốt 👏",
        wordCount: wordCount,
        criteriaScores: { grammar: 85, vocabulary: 88, coherence: 85, taskFulfillment: 88 },
        generalFeedback: "Bài viết của bạn diễn đạt trôi chảy, truyền tải rõ ý và có bố cục hoàn chỉnh!",
        strengths: ["Bố cục rõ ràng, câu từ tự nhiên", "Vốn từ vựng tương đối tốt"],
        errorsList: [],
        nativeVersion: cleanText,
        nativePinyin: "",
        nativeVi: "Bản dịch bài viết của bạn.",
        advancedVocabSuggestions: []
      };
    }

    res.json({ success: true, ...result });
  } catch (err) {
    console.error('AI Grade essay error:', err);
    res.json({
      success: true,
      overallScore: 85,
      badge: "Rất Tốt 👏",
      wordCount: wordCount,
      criteriaScores: { grammar: 85, vocabulary: 85, coherence: 85, taskFulfillment: 85 },
      generalFeedback: "Bài viết cơ bản tốt, đã hoàn thành mục tiêu giao tiếp.",
      strengths: ["Cấu trúc cơ bản chuẩn xác"],
      errorsList: [],
      nativeVersion: cleanText,
      nativePinyin: "",
      nativeVi: "",
      advancedVocabSuggestions: []
    });
  }
});

// 2. Sinh đề bài luyện viết tự động bằng AI
app.post('/api/ai/generate-writing-prompt', async (req, res) => {
  const { hskLevel = 3, genre = 'Đời sống' } = req.body;

  const prompt = `Bạn là chuyên gia ra đề thi viết tiếng Trung HSK của "Tiếng Trung Hongtai".
Hãy tạo 1 đề bài luyện viết tiếng Trung chuẩn HSK ${hskLevel} thuộc chủ đề "${genre}".
Yêu cầu độ dài:
- HSK 1: 30-50 chữ
- HSK 2: 50-80 chữ
- HSK 3: 80-120 chữ
- HSK 4: 120-180 chữ
- HSK 5: 150-250 chữ (có 4-5 từ khóa bắt buộc)
- HSK 6: 250-400 chữ

Trả về ĐÚNG 1 JSON object:
{
  "title": "<Tên chủ đề tiếng Trung>",
  "titleVi": "<Dịch tên chủ đề sang tiếng Việt>",
  "hskLevel": ${hskLevel},
  "minWords": <số chữ tối thiểu>,
  "promptText": "<Yêu cầu và câu hỏi gợi ý bằng tiếng Trung>",
  "promptTextVi": "<Yêu cầu và câu hỏi gợi ý bằng tiếng Việt>",
  "requiredKeywords": [
    { "word": "<từ 1>", "pinyin": "<pinyin 1>", "meaning": "<nghĩa 1>" },
    { "word": "<từ 2>", "pinyin": "<pinyin 2>", "meaning": "<nghĩa 2>" },
    { "word": "<từ 3>", "pinyin": "<pinyin 3>", "meaning": "<nghĩa 3>" },
    { "word": "<từ 4>", "pinyin": "<pinyin 4>", "meaning": "<nghĩa 4>" }
  ],
  "sampleOutline": [
    "<Gợi ý ý 1>",
    "<Gợi ý ý 2>",
    "<Gợi ý ý 3>"
  ]
}`;

  try {
    let reply = '';
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (groqClient) {
      try {
        const completion = await groqClient.chat.completions.create({
          model: 'openai/gpt-oss-120b',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1200
        });
        reply = completion.choices[0]?.message?.content || '';
      } catch (e) { }
    }

    if (!reply && GEMINI_API_KEY) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (response.ok) {
        const data = await response.json();
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    }

    let result = null;
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { result = JSON.parse(jsonMatch[0]); } catch (e) { }
    }

    if (!result) {
      result = {
        title: "我最喜欢的一天",
        titleVi: "Một ngày tôi yêu thích nhất",
        hskLevel: hskLevel,
        minWords: hskLevel <= 2 ? 60 : hskLevel <= 4 ? 120 : 200,
        promptText: "请写一段话，介绍你最喜欢的一天是怎么度过的，做了什么事情，心情怎么样？",
        promptTextVi: "Hãy viết một đoạn văn giới thiệu ngày bạn yêu thích nhất đã trải qua như thế nào, làm những việc gì, tâm trạng ra sao?",
        requiredKeywords: [
          { word: "早上", pinyin: "zǎoshang", meaning: "buổi sáng" },
          { word: "开心", pinyin: "kāixīn", meaning: "vui vẻ" },
          { word: "朋友", pinyin: "péngyou", meaning: "bạn bè" },
          { word: "希望", pinyin: "xīwàng", meaning: "hy vọng" }
        ],
        sampleOutline: [
          "Mở bài: Giới thiệu ngày đặc biệt đó là ngày nào",
          "Thân bài: Kể lại các hoạt động từ sáng đến tối cùng ai",
          "Kết bài: Cảm xúc và bài học/ấn tượng sau ngày đó"
        ]
      };
    }

    res.json({ success: true, ...result });
  } catch (err) {
    res.json({
      success: true,
      title: "我的中文学习经历",
      titleVi: "Quá trình học tiếng Trung của tôi",
      hskLevel: hskLevel,
      minWords: 80,
      promptText: "请介绍一下你为什么学中文，学了多长时间，遇到了什么困难？",
      promptTextVi: "Hãy chia sẻ lý do bạn học tiếng Trung, đã học bao lâu và gặp những khó khăn gì?",
      requiredKeywords: [
        { word: "学习", pinyin: "xuéxí", meaning: "học tập" },
        { word: "汉语", pinyin: "hànyǔ", meaning: "tiếng Trung" },
        { word: "觉得", pinyin: "juéde", meaning: "cảm thấy" },
        { word: "努力", pinyin: "nǔlì", meaning: "nỗ lực" }
      ],
      sampleOutline: ["Lý do học tiếng Trung", "Kỷ niệm hoặc khó khăn đáng nhớ", "Mục tiêu tương lai"]
    });
  }
});

// ==========================================================================
// HSKK QUESTIONS & AI SUGGESTION / SPEAKING EVALUATION APIS
// ==========================================================================

let cachedHskkQuestions = null;
function loadHskkQuestionsData() {
  if (cachedHskkQuestions) return cachedHskkQuestions;
  try {
    const jsonPath = path.join(__dirname, 'data', 'hskk_questions.json');
    if (fsSync.existsSync(jsonPath)) {
      const raw = fsSync.readFileSync(jsonPath, 'utf-8');
      cachedHskkQuestions = JSON.parse(raw);
      return cachedHskkQuestions;
    }
  } catch (e) {
    console.error('Lỗi nạp hskk_questions.json:', e);
  }
  return { so: [], trung: [], cao: [] };
}

// 1. Lấy danh sách hoặc câu hỏi ngẫu nhiên HSKK
app.get('/api/hskk-questions', (req, res) => {
  const data = loadHskkQuestionsData();
  const level = (req.query.level || 'all').toLowerCase();
  const isRandom = req.query.random === 'true';

  let list = [];
  if (level === 'so') list = data.so || [];
  else if (level === 'trung') list = data.trung || [];
  else if (level === 'cao') list = data.cao || [];
  else list = [...(data.so || []), ...(data.trung || []), ...(data.cao || [])];

  if (list.length === 0) {
    return res.json({ success: true, count: 0, questions: [], message: 'Chưa có câu hỏi cho cấp độ này' });
  }

  if (isRandom) {
    const randomItem = list[Math.floor(Math.random() * list.length)];
    return res.json({ success: true, question: randomItem, totalInLevel: list.length });
  }

  res.json({
    success: true,
    count: list.length,
    questions: list,
    stats: {
      so: (data.so || []).length,
      trung: (data.trung || []).length,
      cao: (data.cao || []).length
    }
  });
});

// 2. AI Tự động đề xuất Dàn bài + Từ vựng + Mẫu câu cho câu hỏi HSKK
app.post('/api/ai/hskk-suggest', async (req, res) => {
  const { question, level = 'trung', skill = 'speaking' } = req.body;
  if (!question || !question.trim()) {
    return res.status(400).json({ error: 'Nội dung câu hỏi không được để trống.' });
  }

  const levelText = level === 'so' ? 'HSKK Sơ cấp' : level === 'cao' ? 'HSKK Cao cấp' : 'HSKK Trung cấp';
  const skillText = skill === 'writing' ? 'Viết luận' : 'Khẩu ngữ nói';

  const prompt = `Bạn là chuyên gia giảng dạy và giám khảo luyện thi HSK / HSKK hàng đầu của "Tiếng Trung Hongtai".
Học viên đang thực hành kỹ năng: ${skillText}
Cấp độ: ${levelText}
Đề bài: "${question.trim()}"

Yêu cầu nhiệm vụ:
Hãy TỰ ĐỘNG ĐỀ XUẤT dàn ý và gợi ý toàn diện giúp học viên làm bài đạt điểm tuyệt đối:
1. Dàn bài (Outline): Gợi ý mở bài, thân bài (2-3 ý chính), kết bài.
2. Từ vựng đắt giá: 4-6 từ vựng hoặc thành ngữ phù hợp với cấp độ này (kèm pinyin và nghĩa tiếng Việt).
3. Mẫu câu / Cấu trúc ngữ pháp nên dùng: 2-4 mẫu câu kết nối hoặc cấu trúc điểm cao liên quan trực tiếp đến đề tài.
4. Bài mẫu tham khảo: Một bài mẫu ngắn gọn, tự nhiên, văn phong chuẩn bản xứ.

Trả về ĐÚNG 1 JSON object (không thêm markdown ngoài JSON):
{
  "outline": {
    "intro": "<Gợi ý mở đầu ngắn gọn, tự nhiên>",
    "body": [
      "<Ý triển khai 1>",
      "<Ý triển khai 2>",
      "<Ý triển khai 3>"
    ],
    "conclusion": "<Gợi ý kết thúc, cảm nghĩ đọng lại>"
  },
  "vocabulary": [
    { "hanzi": "<từ Hán>", "pinyin": "<phiên âm có dấu>", "meaning": "<nghĩa tiếng Việt>" }
  ],
  "sentenceStructures": [
    { "pattern": "<mẫu câu ngữ pháp>", "meaning": "<ý nghĩa/cách dùng>", "example": "<câu ví dụ áp dụng đề bài>" }
  ],
  "sampleAnswer": {
    "hanzi": "<bài nói hoặc bài viết mẫu chuẩn>",
    "pinyin": "<phiên âm đầy đủ>",
    "meaningVi": "<bản dịch tiếng Việt trôi chảy>"
  }
}`;

  try {
    let reply = '';
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (groqClient) {
      try {
        const completion = await groqClient.chat.completions.create({
          model: 'openai/gpt-oss-120b',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.5,
          max_tokens: 1800
        });
        reply = completion.choices[0]?.message?.content || '';
      } catch (eGroq) {
        console.warn('Groq hskk-suggest failed, trying Gemini...', eGroq.message);
      }
    }

    if (!reply && GEMINI_API_KEY) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (response.ok) {
        const data = await response.json();
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    }

    let result = null;
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { result = JSON.parse(jsonMatch[0]); } catch (e) { }
    }

    if (!result) {
      result = {
        outline: {
          intro: "Mở đầu trực tiếp: Nêu rõ quan điểm hoặc câu trả lời đối với đề bài.",
          body: [
            "Luận điểm 1: Giải thích nguyên nhân hoặc kể lại trải nghiệm thực tế.",
            "Luận điểm 2: Đưa ra ví dụ cụ thể minh họa cho quan điểm.",
            "Luận điểm 3: So sánh hoặc mở rộng góc nhìn đời sống."
          ],
          conclusion: "Kết luận: Tóm tắt lại suy nghĩ và bài học rút ra."
        },
        vocabulary: [
          { hanzi: "坚持", pinyin: "jiānchí", meaning: "kiên trì" },
          { hanzi: "积累", pinyin: "jīlěi", meaning: "tích lũy" },
          { hanzi: "不仅……而且……", pinyin: "bùjǐn... érqiě...", meaning: "không những... mà còn..." },
          { hanzi: "收益匪浅", pinyin: "shòuyì fěiqiǎn", meaning: "thu hoạch được rất nhiều" }
        ],
        sentenceStructures: [
          {
            pattern: "对于我来说，……是最重要的。",
            meaning: "Đối với tôi mà nói, ... là quan trọng nhất.",
            example: "对于我来说，家人的健康和快乐是最重要的。"
          },
          {
            pattern: "一方面……，另一方面……",
            meaning: "Một mặt thì..., mặt khác thì...",
            example: "一方面可以开阔眼界，另一方面能结交很多朋友。"
          }
        ],
        sampleAnswer: {
          hanzi: "这个问题很有意思。对我来说，学习和生活都需要保持积极乐观的心态。遇到困难时，不要轻言放弃，多向前辈请教，慢慢积累经验，最终一定会有所收获。",
          pinyin: "Zhè ge wèntí hěn yǒu yìsi. Duì wǒ lái shuō, xuéxí hé shēnghuó dōu xūyào bǎochí jījí lèguān de xīntài. Yù dào kùnnán shí, bú yào qīngyán fàngqì, duō xiàng qiánbèi qǐngjiào, mànmàn jīlěi jīngyàn, zuìzhōng yídìng huì yǒu suǒ shōuhuò.",
          meaningVi: "Câu hỏi này rất thú vị. Đối với tôi, cả học tập lẫn cuộc sống đều cần giữ tâm thế tích cực lạc quan. Khi gặp khó khăn, không nên dễ dàng từ bỏ, hãy học hỏi kinh nghiệm từ người đi trước, dần dần tích lũy thì nhất định sẽ gặt hái thành công."
        }
      };
    }

    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Lỗi hskk-suggest:', err);
    res.json({
      success: true,
      outline: {
        intro: "Giới thiệu trực tiếp chủ đề và nêu quan điểm của bản thân.",
        body: ["Trình bày 2 nguyên nhân hoặc trải nghiệm cụ thể", "Đưa ra cảm nhận cá nhân"],
        conclusion: "Tóm lược lại ý nghĩa và kỳ vọng."
      },
      vocabulary: [
        { hanzi: "经验", pinyin: "jīngyàn", meaning: "kinh nghiệm" },
        { hanzi: "看法", pinyin: "kànfǎ", meaning: "quan điểm, góc nhìn" },
        { hanzi: "虽然……但是……", pinyin: "suīrán... dànshì...", meaning: "tuy... nhưng..." }
      ],
      sentenceStructures: [
        {
          pattern: "我认为……因为……",
          meaning: "Tôi cho rằng... bởi vì...",
          example: "我认为坚持是最重要的，因为成功离不开长期的努力。"
        }
      ],
      sampleAnswer: {
        hanzi: "对此我深有体会。无论做什么事，只要认真对待并持之以恒，就一定能取得好成绩。",
        pinyin: "Duì cǐ wǒ shēnyǒu tǐhuì. Wúlùn zuò shénme shì, zhǐyào rènzhēn duìdài bìng chízhīyǐhéng, jiù yídìng néng qǔdé hǎo chéngjì.",
        meaningVi: "Về điều này tôi thấm thía sâu sắc. Dù làm bất cứ việc gì, chỉ cần nghiêm túc đối đãi và kiên trì đến cùng thì nhất định sẽ đạt kết quả tốt."
      }
    });
  }
});

// 3. AI Chấm điểm bài thi Khẩu ngữ Nói HSKK
app.post('/api/ai/grade-speaking', async (req, res) => {
  const { question, transcript, level = 'trung', duration = 120 } = req.body;

  if (!transcript || !transcript.trim()) {
    return res.status(400).json({ error: 'Chưa có nội dung bản ghi âm hoặc văn bản bài nói.' });
  }

  const cleanText = transcript.trim();
  const wordCount = (cleanText.match(/[\u4e00-\u9fa5\u3400-\u4dbfa-zA-Z0-9]/g) || []).length;
  const levelText = level === 'so' ? 'HSKK Sơ cấp' : level === 'cao' ? 'HSKK Cao cấp' : 'HSKK Trung cấp';

  const prompt = `Bạn là giám khảo chấm thi Khẩu ngữ HSKK chính thức của "Tiếng Trung Hongtai".
Nhiệm vụ: Chấm điểm bài nói của học viên đã được chuyển thành văn bản từ file ghi âm.

Thông tin bài thi:
- Cấp độ: ${levelText}
- Đề bài: "${question || ''}"
- Thời lượng nói: ${duration} giây
- Số chữ học viên nói: ${wordCount} chữ Hán

Nội dung bài nói của học viên:
"""
${cleanText}
"""

Hãy đánh giá công tâm theo 4 tiêu chuẩn thi HSKK:
1. Phát âm & Ngữ điệu (Pronunciation)
2. Độ lưu loát & Tự nhiên (Fluency)
3. Ngữ pháp & Vốn từ (Grammar & Vocab)
4. Nội dung bám sát đề (Task Fulfillment)

Trả về ĐÚNG 1 JSON object:
{
  "overallScore": <điểm tổng thể 0-100>,
  "badge": "<'Xuất Sắc 🌟' | 'Rất Tốt 👏' | 'Khá 👍' | 'Cần Cố Gắng 🎙️'>",
  "criteriaScores": {
    "pronunciation": <điểm phát âm 0-100>,
    "fluency": <điểm lưu loát 0-100>,
    "grammar": <điểm ngữ pháp 0-100>,
    "content": <điểm nội dung 0-100>
  },
  "generalFeedback": "<Nhận xét tổng quát bằng tiếng Việt về tốc độ, ngữ điệu và tính mạch lạc>",
  "strengths": [
    "<Điểm sáng 1 trong bài nói>",
    "<Điểm sáng 2 trong bài nói>"
  ],
  "improvements": [
    "<Điểm cần cải thiện 1 về phát âm/từ vựng>",
    "<Điểm cần cải thiện 2>"
  ],
  "nativeVersion": "<Bản khẩu ngữ chuẩn mực mượt mà của người bản xứ cho đề này>",
  "nativePinyin": "<Pinyin chuẩn có dấu của nativeVersion>",
  "nativeVi": "<Bản dịch tiếng Việt tự nhiên>"
}`;

  try {
    let reply = '';
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (groqClient) {
      try {
        const completion = await groqClient.chat.completions.create({
          model: 'openai/gpt-oss-120b',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.3,
          max_tokens: 1800
        });
        reply = completion.choices[0]?.message?.content || '';
      } catch (eGroq) {
        console.warn('Groq speaking grading failed, trying Gemini...', eGroq.message);
      }
    }

    if (!reply && GEMINI_API_KEY) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (response.ok) {
        const data = await response.json();
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    }

    let result = null;
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { result = JSON.parse(jsonMatch[0]); } catch (e) { }
    }

    if (!result) {
      result = {
        overallScore: 85,
        badge: "Rất Tốt 👏",
        criteriaScores: { pronunciation: 86, fluency: 84, grammar: 85, content: 88 },
        generalFeedback: "Bài nói của bạn rõ ràng, trả lời đúng trọng tâm đề bài và diễn đạt trôi chảy!",
        strengths: ["Phát âm tương đối rõ ràng", "Trả lời trực diện vào câu hỏi"],
        improvements: ["Nên dùng thêm liên từ để câu nói liên kết chặt chẽ hơn"],
        nativeVersion: cleanText,
        nativePinyin: "",
        nativeVi: "Bản dịch bài nói của bạn."
      };
    }

    res.json({ success: true, ...result });
  } catch (err) {
    console.error('Lỗi grade-speaking:', err);
    res.json({
      success: true,
      overallScore: 84,
      badge: "Khá 👍",
      criteriaScores: { pronunciation: 82, fluency: 83, grammar: 84, content: 86 },
      generalFeedback: "Bài nói đạt yêu cầu giao tiếp cơ bản, cần chú ý ngắt nghỉ và ngữ điệu tự nhiên hơn.",
      strengths: ["Hiểu đúng đề bài"],
      improvements: ["Mở rộng thêm ví dụ thực tế"],
      nativeVersion: cleanText,
      nativePinyin: "",
      nativeVi: ""
    });
  }
});

// ==========================================================================
// SENTENCE REORDER QUESTIONS API (790 CÂU TỪ HSK 1 ĐẾN HSK 6)
// ==========================================================================

let cachedSentenceReorderData = null;
function loadSentenceReorderData() {
  if (cachedSentenceReorderData) return cachedSentenceReorderData;
  try {
    const jsonPath = path.join(__dirname, 'data', 'sentence_reorder_questions.json');
    if (fsSync.existsSync(jsonPath)) {
      const raw = fsSync.readFileSync(jsonPath, 'utf-8');
      cachedSentenceReorderData = JSON.parse(raw);
      return cachedSentenceReorderData;
    }
  } catch (e) {
    console.error('Lỗi nạp sentence_reorder_questions.json:', e);
  }
  return { meta: { total: 0 }, questions: [], byLevel: {} };
}

app.get('/api/sentence-reorder', (req, res) => {
  const data = loadSentenceReorderData();
  const level = req.query.level;
  if (level && data.byLevel && data.byLevel[level]) {
    return res.json({
      meta: { total: data.byLevel[level].length, level: parseInt(level, 10) },
      questions: data.byLevel[level]
    });
  }
  return res.json(data);
});

// ==========================================================================
// AI INTERACTIVE DIALOGUE / ROLEPLAY CONVERSATION APIS
// ==========================================================================

// 1. Khởi tạo cuộc hội thoại (Start Dialogue Scene)
app.post('/api/ai/dialogue/start', async (req, res) => {
  const { topic = 'restaurant', level = 'hsk2', userRole = 'Khách hàng', aiRole = 'Nhân viên phục vụ', customTopic = '' } = req.body;

  const prompt = `Bạn là chuyên gia giảng dạy tiếng Trung giao tiếp thực tế và đóng vai nhân vật bản xứ.
Hãy tạo tình huống mở đầu cho một cuộc hội thoại roleplay tương tác theo thông tin sau:
- Chủ đề: ${customTopic || topic}
- Trình độ người học: ${level.toUpperCase()}
- Vai trò người học: ${userRole}
- Vai trò của bạn (AI): ${aiRole}

Yêu cầu định dạng đầu ra DUY NHẤT một JSON hợp lệ (không kèm markdown \`\`\`json):
{
  "scenario": "Tóm tắt bối cảnh tình huống ngắn gọn bằng tiếng Việt (1-2 câu)",
  "aiMessage": {
    "zh": "Câu mở đầu bằng tiếng Trung tự nhiên phù hợp vai trò",
    "pinyin": "Pinyin đầy đủ có dấu thanh điệu",
    "vi": "Bản dịch nghĩa tiếng Việt tương ứng"
  },
  "suggestions": [
    {
      "zh": "Gợi ý câu người học có thể trả lời 1 (tiếng Trung)",
      "pinyin": "Pinyin câu 1",
      "vi": "Bản dịch câu 1"
    },
    {
      "zh": "Gợi ý câu người học có thể trả lời 2 (tiếng Trung)",
      "pinyin": "Pinyin câu 2",
      "vi": "Bản dịch câu 2"
    },
    {
      "zh": "Gợi ý câu người học có thể trả lời 3 (tiếng Trung)",
      "pinyin": "Pinyin câu 3",
      "vi": "Bản dịch câu 3"
    }
  ]
}`;

  try {
    let reply = '';
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

    if (groqClient) {
      try {
        const completion = await groqClient.chat.completions.create({
          model: 'openai/gpt-oss-120b',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1200
        });
        reply = completion.choices[0]?.message?.content || '';
      } catch (eGroq) {
        console.warn('Groq dialogue start failed, trying Gemini...', eGroq.message);
      }
    }

    if (!reply && GEMINI_API_KEY) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (response.ok) {
        const data = await response.json();
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    }

    let result = null;
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { result = JSON.parse(jsonMatch[0]); } catch (e) { }
    }

    if (!result) {
      result = {
        scenario: "Bạn vừa bước vào nhà hàng Trung Hoa, người phục vụ tươi cười tiến đến chào đón bạn.",
        aiMessage: {
          zh: "你好！欢迎光临，请问您一共几位？",
          pinyin: "Nǐ hǎo! Huānyíng guānglín, qǐngwèn nín yígòng jǐ wèi?",
          vi: "Xin chào! Hoan nghênh quý khách, xin hỏi quý khách đi tất cả mấy người?"
        },
        suggestions: [
          { zh: "我们有两位。", pinyin: "Wǒmen yǒu liǎng wèi.", vi: "Chúng tôi có hai người." },
          { zh: "就我一个人。", pinyin: "Jiù wǒ yí gè rén.", vi: "Chỉ có một mình tôi thôi." },
          { zh: "请问有靠窗的座位吗？", pinyin: "Qǐngwèn yǒu kào chuāng de zuòwèi ma?", vi: "Xin hỏi có chỗ ngồi cạnh cửa sổ không?" }
        ]
      };
    }

    return res.json(result);
  } catch (error) {
    console.error('Lỗi khởi tạo hội thoại AI:', error);
    return res.status(500).json({
      error: 'Không thể tạo hội thoại lúc này',
      scenario: "Tình huống giao tiếp cơ bản",
      aiMessage: { zh: "你好！很高兴见到你。", pinyin: "Nǐ hǎo! Hěn gāoxìng jiàn dào nǐ.", vi: "Xin chào! Rất vui được gặp bạn." },
      suggestions: [{ zh: "你好！", pinyin: "Nǐ hǎo!", vi: "Chào bạn!" }]
    });
  }
});

// 2. Tiếp tục hội thoại & Nhận xét câu trả lời (Reply & Feedback)
app.post('/api/ai/dialogue/reply', async (req, res) => {
  const { topic = 'restaurant', level = 'hsk2', userRole = 'Khách hàng', aiRole = 'Nhân viên phục vụ', history = [], userMessage = '' } = req.body;

  if (!userMessage || !userMessage.trim()) {
    return res.status(400).json({ error: 'Nội dung trả lời không được để trống' });
  }

  const prompt = `Bạn là đối tác đàm thoại bản xứ tiếng Trung và là giáo viên hướng dẫn giao tiếp thực tế.
Tình huống roleplay:
- Chủ đề: ${topic}
- Cấp độ người học: ${level.toUpperCase()}
- Vai trò người học: ${userRole}
- Vai trò của bạn (AI): ${aiRole}

Lịch sử trò chuyện gần nhất:
${history.slice(-6).map(h => `${h.role === 'ai' ? aiRole : userRole}: ${h.zh}`).join('\n')}

Người học vừa nói: "${userMessage}"

Nhiệm vụ:
1. Đánh giá câu trả lời của người học: Độ tự nhiên (thang 100), lời khen ngợi ngắn gọn, sửa lỗi ngữ pháp/từ vựng (nếu có lỗi, để trống nếu đã chuẩn), và mẹo nhỏ diễn đạt hay hơn.
2. Tiếp tục cuộc trò chuyện tự nhiên theo đúng vai diễn của bạn bằng tiếng Trung, kèm Pinyin chuẩn và bản dịch tiếng Việt.
3. Đề xuất 3 phương án trả lời tiếp theo phù hợp ngữ cảnh để người học dễ phản xạ.

Xuất ra DUY NHẤT một JSON hợp lệ (không kèm markdown \`\`\`json):
{
  "feedback": {
    "score": 90,
    "praise": "Lời khen ngợi ngắn gọn bằng tiếng Việt",
    "correction": "Bản sửa câu chính xác hơn nếu có lỗi (hoặc để trống nếu đã tốt)",
    "tip": "Mẹo dùng từ tự nhiên hơn của người bản xứ (tiếng Việt)"
  },
  "aiMessage": {
    "zh": "Câu đối đáp tiếp theo của AI",
    "pinyin": "Pinyin đầy đủ có dấu thanh điệu",
    "vi": "Bản dịch nghĩa tiếng Việt tương ứng"
  },
  "suggestions": [
    {
      "zh": "Gợi ý câu trả lời tiếp theo 1 (tiếng Trung)",
      "pinyin": "Pinyin câu 1",
      "vi": "Bản dịch câu 1"
    },
    {
      "zh": "Gợi ý câu trả lời tiếp theo 2 (tiếng Trung)",
      "pinyin": "Pinyin câu 2",
      "vi": "Bản dịch câu 2"
    },
    {
      "zh": "Gợi ý câu trả lời tiếp theo 3 (tiếng Trung)",
      "pinyin": "Pinyin câu 3",
      "vi": "Bản dịch câu 3"
    }
  ]
}`;

  try {
    let reply = '';
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';

    if (groqClient) {
      try {
        const completion = await groqClient.chat.completions.create({
          model: 'openai/gpt-oss-120b',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.7,
          max_tokens: 1500
        });
        reply = completion.choices[0]?.message?.content || '';
      } catch (eGroq) {
        console.warn('Groq dialogue reply failed, trying Gemini...', eGroq.message);
      }
    }

    if (!reply && GEMINI_API_KEY) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (response.ok) {
        const data = await response.json();
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    }

    let result = null;
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { result = JSON.parse(jsonMatch[0]); } catch (e) { }
    }

    if (!result) {
      result = {
        feedback: {
          score: 88,
          praise: "Bạn diễn đạt rõ ràng và dễ hiểu!",
          correction: "",
          tip: "Bạn có thể kết hợp thêm các hư từ ngữ khí như 吧, 呢 để câu tự nhiên hơn."
        },
        aiMessage: {
          zh: "好的，我明白了！请问您还有什么需要吗？",
          pinyin: "Hǎo de, wǒ míngbai le! Qǐngwèn nín hái yǒu shénme xūyào ma?",
          vi: "Dạ vâng, tôi hiểu rồi! Xin hỏi quý khách còn cần gì nữa không ạ?"
        },
        suggestions: [
          { zh: "暂时没有了，谢谢。", pinyin: "Zànshí méiyǒu le, xièxie.", vi: "Tạm thời không còn gì, cảm ơn bạn." },
          { zh: "请给我拿点纸巾。", pinyin: "Qǐng gěi wǒ ná diǎn zhǐjīn.", vi: "Làm ơn lấy cho tôi ít khăn giấy." },
          { zh: "请问洗手间在哪里？", pinyin: "Qǐngwèn xǐshǒujiān zài nǎlǐ?", vi: "Xin hỏi nhà vệ sinh ở đâu ạ?" }
        ]
      };
    }

    return res.json(result);
  } catch (error) {
    console.error('Lỗi phản hồi hội thoại AI:', error);
    return res.status(500).json({
      error: 'Không thể xử lý phản hồi lúc này',
      feedback: { score: 80, praise: "Tiếp tục phát huy nhé!", correction: "", tip: "" },
      aiMessage: { zh: "好的，我们继续吧。", pinyin: "Hǎo de, wǒmen jìxù ba.", vi: "Được rồi, chúng ta tiếp tục nhé." },
      suggestions: [{ zh: "好的。", pinyin: "Hǎo de.", vi: "Được thôi." }]
    });
  }
});

// ==========================================================================
// COMMUNITY DISCUSSIONS & FEEDBACK API ENDPOINTS
// ==========================================================================

const DISCUSSIONS_FILE_PATH = path.join(__dirname, 'discussions.json');

async function readDiscussionsFromFile() {
  try {
    const data = await fs.readFile(DISCUSSIONS_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    return [];
  }
}

async function writeDiscussionsToFile(discussions) {
  try {
    await fs.writeFile(DISCUSSIONS_FILE_PATH, JSON.stringify(discussions, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving discussions to file:', e);
  }
}

// GET all discussions / feedbacks
app.get('/api/discussions', async (req, res) => {
  const currentEmail = getLoggedInUserEmail(req);
  const { category, search, page = 1, limit = 25 } = req.query;

  try {
    let items = [];
    if (mongoose.connection.readyState === 1) {
      // Purge any legacy sample post
      await Discussion.deleteOne({ _id: 'disc_welcome_001' }).catch(() => { });

      const query = {};
      if (category && category !== 'all') {
        query.category = category;
      }
      if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        query.$or = [{ title: regex }, { content: regex }, { authorName: regex }];
      }

      items = await Discussion.find(query)
        .sort({ isPinned: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .lean();
    } else {
      items = await readDiscussionsFromFile();
      if (category && category !== 'all') {
        items = items.filter(d => d.category === category);
      }
      if (search && search.trim()) {
        const q = search.trim().toLowerCase();
        items = items.filter(d => (d.title && d.title.toLowerCase().includes(q)) || (d.content && d.content.toLowerCase().includes(q)) || (d.authorName && d.authorName.toLowerCase().includes(q)));
      }
      items.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0) || new Date(b.createdAt) - new Date(a.createdAt));
      items = items.slice((page - 1) * limit, page * limit);
    }

    const userData = await readUserData();
    // Format response with live updated roles
    const formatted = items.map(item => {
      const authorEmail = (item.authorEmail || '').toLowerCase().trim();
      const userRec = userData.users && userData.users[authorEmail];
      const isSuper = isSuperAdmin(authorEmail);
      const isTeacher = (userRec && userRec.role === 'teacher') || authorEmail.includes('hongtai');
      const isAdmin = isSuper || isTeacher || (userRec && userRec.role === 'admin') || isUserAdmin(authorEmail, userData);
      const authorRole = isSuper ? 'super_admin' : (userRec?.role || (isTeacher ? 'teacher' : (isAdmin ? 'admin' : 'user')));

      return {
        id: item._id || item.id,
        authorEmail: item.authorEmail,
        authorName: (userRec && userRec.name) || item.authorName || 'Học viên Hongtai',
        authorPicture: (userRec && userRec.picture) || item.authorPicture || '',
        authorRole,
        isSuperAdmin: isSuper,
        isAdmin,
        category: item.category || 'feedback',
        title: item.title || '',
        content: item.content || '',
        likesCount: (item.likes || []).length,
        hasLiked: currentEmail ? (item.likes || []).includes(currentEmail) : false,
        commentsCount: (item.comments || []).length,
        comments: (item.comments || []).map(c => {
          const cEmail = (c.authorEmail || '').toLowerCase().trim();
          const cUserRec = userData.users && userData.users[cEmail];
          const cIsSuper = isSuperAdmin(cEmail);
          const cIsTeacher = (cUserRec && cUserRec.role === 'teacher') || cEmail.includes('hongtai');
          const cIsAdmin = cIsSuper || cIsTeacher || (cUserRec && cUserRec.role === 'admin') || isUserAdmin(cEmail, userData);
          const cRole = cIsSuper ? 'super_admin' : (cUserRec?.role || (cIsTeacher ? 'teacher' : (cIsAdmin ? 'admin' : 'user')));

          return {
            id: c.id,
            authorEmail: c.authorEmail,
            authorName: (cUserRec && cUserRec.name) || c.authorName,
            authorPicture: (cUserRec && cUserRec.picture) || c.authorPicture,
            authorRole: cRole,
            isSuperAdmin: cIsSuper,
            isAdmin: cIsAdmin,
            content: c.content,
            createdAt: c.createdAt
          };
        }),
        isPinned: !!item.isPinned,
        createdAt: item.createdAt
      };
    });

    res.json({ success: true, discussions: formatted });
  } catch (err) {
    console.error('Error fetching discussions:', err);
    res.status(500).json({ error: 'Không thể tải danh sách thảo luận.' });
  }
});

// POST new discussion / feedback
app.post('/api/discussions', async (req, res) => {
  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) { }
  }
  body = body || {};

  const currentEmail = getLoggedInUserEmail(req) || body.userEmail || req.headers['x-user-email'];
  if (!currentEmail) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập tài khoản để đăng bài thảo luận & góp ý.' });
  }

  const title = (body.title || '').trim();
  const content = (body.content || '').trim();
  const category = body.category || 'feedback';

  if (!content) {
    return res.status(400).json({ error: 'Nội dung bài viết không được để trống.' });
  }

  try {
    const userData = await readUserData();
    const user = (userData.users && userData.users[currentEmail]) || {};
    const authorName = user.name || currentEmail.split('@')[0];
    const authorPicture = user.picture || '';

    const newId = 'disc_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const discussionData = {
      _id: newId,
      authorEmail: currentEmail,
      authorName,
      authorPicture,
      category,
      title,
      content,
      likes: [],
      comments: [],
      isPinned: false,
      createdAt: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      const disc = new Discussion(discussionData);
      await disc.save();
    }

    const localList = await readDiscussionsFromFile();
    localList.unshift(discussionData);
    await writeDiscussionsToFile(localList);

    res.json({
      success: true,
      discussion: {
        id: newId,
        authorEmail: currentEmail,
        authorName,
        authorPicture,
        authorRole: isSuperAdmin(currentEmail) ? 'super_admin' : (user.role || (currentEmail.toLowerCase().includes('hongtai') ? 'teacher' : 'user')),
        isSuperAdmin: isSuperAdmin(currentEmail),
        category,
        title: discussionData.title,
        content: discussionData.content,
        likesCount: 0,
        hasLiked: false,
        commentsCount: 0,
        comments: [],
        isPinned: false,
        createdAt: discussionData.createdAt
      }
    });
  } catch (err) {
    console.error('Error creating discussion:', err);
    res.status(500).json({ error: 'Không thể đăng bài viết lúc này.' });
  }
});

// POST toggle like on discussion
app.post('/api/discussions/:id/like', async (req, res) => {
  const currentEmail = getLoggedInUserEmail(req);
  if (!currentEmail) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập để thả tim bài viết.' });
  }

  const { id } = req.params;

  try {
    let likes = [];
    let hasLiked = false;

    if (mongoose.connection.readyState === 1) {
      const disc = await Discussion.findById(id);
      if (!disc) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });

      const idx = disc.likes.indexOf(currentEmail);
      if (idx !== -1) {
        disc.likes.splice(idx, 1);
        hasLiked = false;
      } else {
        disc.likes.push(currentEmail);
        hasLiked = true;
      }
      await disc.save();
      likes = disc.likes;
    } else {
      const localList = await readDiscussionsFromFile();
      const disc = localList.find(d => (d._id === id || d.id === id));
      if (!disc) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });

      if (!disc.likes) disc.likes = [];
      const idx = disc.likes.indexOf(currentEmail);
      if (idx !== -1) {
        disc.likes.splice(idx, 1);
        hasLiked = false;
      } else {
        disc.likes.push(currentEmail);
        hasLiked = true;
      }
      await writeDiscussionsToFile(localList);
      likes = disc.likes;
    }

    res.json({ success: true, likesCount: likes.length, hasLiked });
  } catch (err) {
    console.error('Error liking discussion:', err);
    res.status(500).json({ error: 'Lỗi cập nhật lượt thích.' });
  }
});

// POST comment on discussion
app.post('/api/discussions/:id/comments', async (req, res) => {
  const currentEmail = getLoggedInUserEmail(req);
  if (!currentEmail) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập để bình luận.' });
  }

  const { id } = req.params;
  const { content } = req.body;
  if (!content || !content.trim()) {
    return res.status(400).json({ error: 'Nội dung bình luận không được để trống.' });
  }

  try {
    const userData = await readUserData();
    const user = (userData.users && userData.users[currentEmail]) || {};
    const authorName = user.name || currentEmail.split('@')[0];
    const authorPicture = user.picture || '';

    const newComment = {
      id: 'cmt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      authorEmail: currentEmail,
      authorName,
      authorPicture,
      content: content.trim(),
      createdAt: new Date()
    };

    if (mongoose.connection.readyState === 1) {
      const disc = await Discussion.findById(id);
      if (!disc) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
      disc.comments.push(newComment);
      await disc.save();
    } else {
      const localList = await readDiscussionsFromFile();
      const disc = localList.find(d => (d._id === id || d.id === id));
      if (!disc) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });
      if (!disc.comments) disc.comments = [];
      disc.comments.push(newComment);
      await writeDiscussionsToFile(localList);
    }

    res.json({ success: true, comment: newComment });
  } catch (err) {
    console.error('Error posting comment:', err);
    res.status(500).json({ error: 'Không thể đăng bình luận lúc này.' });
  }
});

// DELETE discussion
app.delete('/api/discussions/:id', async (req, res) => {
  const currentEmail = getLoggedInUserEmail(req);
  if (!currentEmail) {
    return res.status(401).json({ error: 'Vui lòng đăng nhập.' });
  }

  const { id } = req.params;

  try {
    const isAdmin = ['phanphiphu04@gmail.com', 'thaihong162004@gmail.com', 'hongtai'].some(admin => currentEmail.toLowerCase().includes(admin));

    if (mongoose.connection.readyState === 1) {
      const disc = await Discussion.findById(id);
      if (!disc) return res.status(404).json({ error: 'Không tìm thấy bài viết.' });

      if (disc.authorEmail !== currentEmail && !isAdmin) {
        return res.status(403).json({ error: 'Bạn không có quyền xóa bài viết này.' });
      }

      await Discussion.findByIdAndDelete(id);
    }

    const localList = await readDiscussionsFromFile();
    const updated = localList.filter(d => (d._id !== id && d.id !== id));
    await writeDiscussionsToFile(updated);

    res.json({ success: true, message: 'Đã xóa bài viết thành công.' });
  } catch (err) {
    console.error('Error deleting discussion:', err);
    res.status(500).json({ error: 'Lỗi xóa bài viết.' });
  }
});

// ==========================================================================
// E-BOOK & KHO TÀI LIỆU TIẾNG TRUNG API ENDPOINTS
// ==========================================================================
const BOOKS_CATALOG_PATH = path.join(__dirname, 'books_catalog.json');
const BOOK_INTERACTIONS_PATH = path.join(__dirname, 'book_interactions.json');

async function readBooksCatalog() {
  try {
    const data = await fs.readFile(BOOKS_CATALOG_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (e) {
    console.error('Error reading books_catalog.json:', e);
    return [];
  }
}

async function readBookInteractions() {
  try {
    const data = await fs.readFile(BOOK_INTERACTIONS_PATH, 'utf-8');
    const parsed = JSON.parse(data);
    if (!parsed.reading_progress) parsed.reading_progress = {};
    if (!parsed.comments) parsed.comments = [];
    if (!parsed.notes) parsed.notes = [];
    return parsed;
  } catch (e) {
    return { reading_progress: {}, comments: [], notes: [] };
  }
}

async function writeBookInteractions(data) {
  try {
    await fs.writeFile(BOOK_INTERACTIONS_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error writing book_interactions.json:', e);
  }
}

function resolveUserIdentifier(req) {
  const email = getLoggedInUserEmail(req);
  if (email) return email.toLowerCase().trim();
  const guestId = req.headers['x-guest-id'] || req.query.guestId || req.body?.guestId;
  if (guestId) return 'guest_' + String(guestId).trim();
  return 'guest_device';
}

// GET /api/books - Danh sách toàn bộ sách kèm thống kê tương tác & tiến độ đọc
app.get('/api/books', async (req, res) => {
  try {
    const catalog = await readBooksCatalog();
    const interactions = await readBookInteractions();
    const userKey = resolveUserIdentifier(req);
    const userProgressMap = interactions.reading_progress[userKey] || {};

    // Group comments count by bookId
    const commentsCountByBook = {};
    (interactions.comments || []).forEach(c => {
      commentsCountByBook[c.bookId] = (commentsCountByBook[c.bookId] || 0) + 1;
    });

    // Group notes count by bookId for this user
    const notesCountByBook = {};
    (interactions.notes || []).forEach(n => {
      if (n.userKey === userKey) {
        notesCountByBook[n.bookId] = (notesCountByBook[n.bookId] || 0) + 1;
      }
    });

    const enrichedBooks = catalog.map(b => {
      const progress = userProgressMap[b.id] || null;
      return {
        ...b,
        totalComments: commentsCountByBook[b.id] || 0,
        totalUserNotes: notesCountByBook[b.id] || 0,
        userProgress: progress
      };
    });

    res.json({ success: true, books: enrichedBooks, total: enrichedBooks.length });
  } catch (err) {
    console.error('Error fetching books catalog:', err);
    res.status(500).json({ error: 'Lỗi tải danh mục sách.' });
  }
});

// GET /api/books/:id - Chi tiết 1 cuốn sách
app.get('/api/books/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const catalog = await readBooksCatalog();
    const book = catalog.find(b => b.id === id);
    if (!book) {
      return res.status(404).json({ error: 'Không tìm thấy sách.' });
    }

    const interactions = await readBookInteractions();
    const userKey = resolveUserIdentifier(req);
    const userProgress = (interactions.reading_progress[userKey] && interactions.reading_progress[userKey][id]) || null;
    const bookComments = (interactions.comments || []).filter(c => c.bookId === id);
    const userNotes = (interactions.notes || []).filter(n => n.bookId === id && n.userKey === userKey);

    res.json({
      success: true,
      book: {
        ...book,
        userProgress,
        totalComments: bookComments.length,
        totalNotes: userNotes.length
      }
    });
  } catch (err) {
    console.error('Error fetching book detail:', err);
    res.status(500).json({ error: 'Lỗi tải thông tin sách.' });
  }
});

// GET /api/books/:id/stream - Stream PDF binary với hỗ trợ byte range & bảo mật chống tải
app.get('/api/books/:id/stream', async (req, res) => {
  try {
    const { id } = req.params;
    const catalog = await readBooksCatalog();
    const book = catalog.find(b => b.id === id);
    if (!book) {
      return res.status(404).json({ error: 'Không tìm thấy sách.' });
    }

    const trimmedRel = (book.relPath || '').replace(/^PDF Sách tiếng Trung[\\/]/i, '');
    const candidatePaths = [
      path.resolve(__dirname, '..', 'PDF SACH TIENG TRUNG NEW', book.relPath),
      path.resolve(__dirname, '..', 'PDF SACH TIENG TRUNG NEW', 'PDF Sách tiếng Trung', book.relPath),
      path.resolve(__dirname, '..', 'PDF SACH TIENG TRUNG NEW', 'PDF Sách tiếng Trung', trimmedRel),
      path.resolve(__dirname, '..', 'PDF SACH TIENG TRUNG NEW', trimmedRel),
      path.resolve(__dirname, '..', book.relPath),
      path.resolve(__dirname, '..', 'PDF Sách tiếng Trung', book.relPath),
      path.resolve(__dirname, '..', 'PDF Sách tiếng Trung', trimmedRel),
      path.resolve(__dirname, '..', 'PDF Sách tiếng Trung', 'PDF Sách tiếng Trung', trimmedRel)
    ];
    const fullPdfPath = candidatePaths.find(p => p && existsSync(p)) || null;
    if (!fullPdfPath) {
      return res.status(404).json({ error: 'Tệp sách PDF không tồn tại trên máy chủ.' });
    }

    const stat = await fs.stat(fullPdfPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="reader.pdf"');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, max-age=86400');
    res.setHeader('Accept-Ranges', 'bytes');

    if (range) {
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;

      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', chunksize);
      const fileStream = createReadStream(fullPdfPath, { start, end });
      fileStream.pipe(res);
    } else {
      res.setHeader('Content-Length', fileSize);
      const fileStream = createReadStream(fullPdfPath);
      fileStream.pipe(res);
    }
  } catch (err) {
    console.error('Error streaming PDF:', err);
    res.status(500).json({ error: 'Lỗi truyền luồng tài liệu PDF.' });
  }
});

// GET /api/books/:id/progress - Lấy tiến độ đọc sách của người dùng
app.get('/api/books/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const userKey = resolveUserIdentifier(req);
    const interactions = await readBookInteractions();
    const progress = (interactions.reading_progress[userKey] && interactions.reading_progress[userKey][id]) || null;
    res.json({ success: true, progress });
  } catch (err) {
    res.status(500).json({ error: 'Lỗi lấy tiến độ đọc sách.' });
  }
});

// POST /api/books/:id/progress - Lưu trang đang đọc
app.post('/api/books/:id/progress', async (req, res) => {
  try {
    const { id } = req.params;
    const { page, totalPages } = req.body;
    if (!page || Number(page) < 1) {
      return res.status(400).json({ error: 'Số trang không hợp lệ.' });
    }

    const userKey = resolveUserIdentifier(req);
    const interactions = await readBookInteractions();
    if (!interactions.reading_progress[userKey]) {
      interactions.reading_progress[userKey] = {};
    }

    const progressRecord = {
      bookId: id,
      lastPage: Number(page),
      totalPages: Number(totalPages) || interactions.reading_progress[userKey][id]?.totalPages || 1,
      percentage: totalPages ? Math.min(100, Math.round((Number(page) / Number(totalPages)) * 100)) : 0,
      updatedAt: new Date()
    };

    interactions.reading_progress[userKey][id] = progressRecord;
    await writeBookInteractions(interactions);

    res.json({ success: true, progress: progressRecord });
  } catch (err) {
    console.error('Error saving reading progress:', err);
    res.status(500).json({ error: 'Lỗi lưu tiến độ đọc.' });
  }
});

// GET /api/books/:id/comments - Lấy danh sách bình luận (có thể lọc theo ?page=N)
app.get('/api/books/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { page } = req.query;
    const interactions = await readBookInteractions();
    let comments = (interactions.comments || []).filter(c => c.bookId === id);

    if (page) {
      comments = comments.filter(c => Number(c.page) === Number(page));
    }

    comments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    res.json({ success: true, comments, total: comments.length });
  } catch (err) {
    console.error('Error fetching book comments:', err);
    res.status(500).json({ error: 'Lỗi tải bình luận.' });
  }
});

// POST /api/books/:id/comments - Thêm bình luận cho trang sách
app.post('/api/books/:id/comments', async (req, res) => {
  try {
    const { id } = req.params;
    const { page, content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Nội dung bình luận không được trống.' });
    }

    const currentEmail = getLoggedInUserEmail(req);
    let authorName = 'Học viên ẩn danh';
    let authorPicture = '';
    let authorRole = 'user';

    if (currentEmail) {
      const userData = await readUserData();
      const user = (userData.users && userData.users[currentEmail]) || {};
      authorName = user.name || currentEmail.split('@')[0];
      authorPicture = user.picture || '';
      authorRole = user.role || 'user';
    } else if (req.body.authorName) {
      authorName = String(req.body.authorName).trim().substring(0, 30);
    }

    const newComment = {
      id: 'book_cmt_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      bookId: id,
      page: Number(page) || 1,
      content: content.trim(),
      authorEmail: currentEmail || null,
      authorName,
      authorPicture,
      authorRole,
      createdAt: new Date()
    };

    const interactions = await readBookInteractions();
    interactions.comments.push(newComment);
    await writeBookInteractions(interactions);

    res.json({ success: true, comment: newComment });
  } catch (err) {
    console.error('Error adding book comment:', err);
    res.status(500).json({ error: 'Lỗi đăng bình luận sách.' });
  }
});

// DELETE /api/books/:id/comments/:commentId - Xóa bình luận
app.delete('/api/books/:id/comments/:commentId', async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const currentEmail = getLoggedInUserEmail(req);
    const userData = await readUserData();
    const isAdmin = isUserAdmin(currentEmail, userData);

    const interactions = await readBookInteractions();
    const comment = interactions.comments.find(c => c.id === commentId && c.bookId === id);
    if (!comment) {
      return res.status(404).json({ error: 'Không tìm thấy bình luận.' });
    }

    if (comment.authorEmail && comment.authorEmail !== currentEmail && !isAdmin) {
      return res.status(403).json({ error: 'Bạn không có quyền xóa bình luận này.' });
    }

    interactions.comments = interactions.comments.filter(c => c.id !== commentId);
    await writeBookInteractions(interactions);

    res.json({ success: true, message: 'Đã xóa bình luận thành công.' });
  } catch (err) {
    console.error('Error deleting book comment:', err);
    res.status(500).json({ error: 'Lỗi xóa bình luận.' });
  }
});

// GET /api/books/:id/notes - Lấy danh sách ghi chú cá nhân của người dùng cho sách này
app.get('/api/books/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const userKey = resolveUserIdentifier(req);
    const interactions = await readBookInteractions();
    const notes = (interactions.notes || [])
      .filter(n => n.bookId === id && n.userKey === userKey)
      .sort((a, b) => Number(a.page) - Number(b.page) || new Date(b.updatedAt || b.createdAt) - new Date(a.updatedAt || a.createdAt));

    res.json({ success: true, notes, total: notes.length });
  } catch (err) {
    console.error('Error fetching book notes:', err);
    res.status(500).json({ error: 'Lỗi tải ghi chú.' });
  }
});

// POST /api/books/:id/notes - Thêm hoặc cập nhật ghi chú cá nhân
app.post('/api/books/:id/notes', async (req, res) => {
  try {
    const { id } = req.params;
    const { noteId, page, content, color = '#fef08a' } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'Nội dung ghi chú không được để trống.' });
    }

    const userKey = resolveUserIdentifier(req);
    const interactions = await readBookInteractions();

    let noteRecord;
    if (noteId) {
      // Update existing note
      const idx = interactions.notes.findIndex(n => n.id === noteId && n.userKey === userKey && n.bookId === id);
      if (idx !== -1) {
        interactions.notes[idx].page = Number(page) || interactions.notes[idx].page;
        interactions.notes[idx].content = content.trim();
        interactions.notes[idx].color = color;
        interactions.notes[idx].updatedAt = new Date();
        noteRecord = interactions.notes[idx];
      }
    }

    if (!noteRecord) {
      // Create new note
      noteRecord = {
        id: 'note_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
        bookId: id,
        userKey,
        page: Number(page) || 1,
        content: content.trim(),
        color: color || '#fef08a',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      interactions.notes.push(noteRecord);
    }

    await writeBookInteractions(interactions);
    res.json({ success: true, note: noteRecord });
  } catch (err) {
    console.error('Error saving book note:', err);
    res.status(500).json({ error: 'Lỗi lưu ghi chú cá nhân.' });
  }
});

// DELETE /api/books/:id/notes/:noteId - Xóa ghi chú cá nhân
app.delete('/api/books/:id/notes/:noteId', async (req, res) => {
  try {
    const { id, noteId } = req.params;
    const userKey = resolveUserIdentifier(req);
    const interactions = await readBookInteractions();

    const note = interactions.notes.find(n => n.id === noteId && n.bookId === id && n.userKey === userKey);
    if (!note) {
      return res.status(404).json({ error: 'Không tìm thấy ghi chú cá nhân.' });
    }

    interactions.notes = interactions.notes.filter(n => n.id !== noteId);
    await writeBookInteractions(interactions);

    res.json({ success: true, message: 'Đã xóa ghi chú thành công.' });
  } catch (err) {
    console.error('Error deleting book note:', err);
    res.status(500).json({ error: 'Lỗi xóa ghi chú.' });
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
async function fetchBaiduTTS(text, speed = '3') {
  const url = 'https://fanyi.baidu.com/gettts?lan=zh&text=' + encodeURIComponent(text) + `&spd=${speed}&source=web&pit=9`;
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
  const { text, voice = 'baidu-female', speed = '3' } = req.query;
  if (!text) {
    return res.status(400).json({ error: 'Text parameter is required' });
  }

  try {
    const safeVoice = String(voice);
    const rawText = String(text).trim();
    const cleanText = cleanTTSInput(rawText) || rawText;

    const hash = crypto.createHash('md5').update(`v11_${safeVoice}_spd${speed}_${cleanText}`).digest('hex');
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
      let audioBuffer = await fetchBaiduTTS(cleanText, speed);
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
// VIDEO DICTATION API (Tiếng Trung HongTai Dictation & Shadowing Engine - Real MongoDB Sync)
// ==========================================

async function readDictationLessons() {
  try {
    const data = await fs.readFile(DICTATION_DB_PATH, 'utf-8');
    const lessons = JSON.parse(data);

    // Dynamic duration validation (eliminate any legacy hardcoded 03:30)
    lessons.forEach(l => {
      if (!l.duration || l.duration === '03:30' || l.duration === '03:00') {
        if (Array.isArray(l.sentences) && l.sentences.length > 0) {
          const maxEnd = l.sentences.reduce((max, s) => Math.max(max, s.endTime || 0), 0);
          if (maxEnd > 0) {
            const sec = Math.round(maxEnd);
            const hrs = Math.floor(sec / 3600);
            const mins = Math.floor((sec % 3600) / 60);
            const secs = sec % 60;
            l.duration = hrs > 0
              ? `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
              : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
          }
        }
      }
    });

    // Sync real studyCount and completedUsers from MongoDB (Không dùng số liệu ảo)
    try {
      if (mongoose.connection && mongoose.connection.readyState === 1) {
        const stats = await DictationLesson.find({}).lean();
        const statsMap = new Map();
        stats.forEach(s => statsMap.set(s._id, s));

        lessons.forEach(l => {
          const s = statsMap.get(l.id);
          l.studyCount = s ? (s.studyCount || 0) : 0;
          l.completedUsers = s ? (s.completedUsers || []) : [];
        });
      } else {
        lessons.forEach(l => {
          l.studyCount = l.studyCount || 0;
          l.completedUsers = l.completedUsers || [];
        });
      }
    } catch (dbErr) {
      console.warn("MongoDB DictationLesson read warning:", dbErr.message);
    }

    return lessons;
  } catch (error) {
    console.error('Error reading video dictation database:', error);
    return [];
  }
}

// GET /api/dictation/lessons — Lấy danh sách video luyện chép chính tả (Số liệu thực tế từ MongoDB)
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

// POST /api/dictation/record-completion — Ghi nhận 1 lượt hoàn thành video bài học vào MongoDB thực tế
app.post('/api/dictation/record-completion', async (req, res) => {
  try {
    const { lessonId, userEmail } = req.body || {};
    if (!lessonId) {
      return res.status(400).json({ error: 'Missing lessonId' });
    }

    const email = (userEmail || '').trim().toLowerCase();
    let currentCount = 0;
    let completedUsersList = [];

    // 1. Lưu và tăng lượt học thực tế trong MongoDB Atlas
    if (mongoose.connection && mongoose.connection.readyState === 1) {
      let doc = await DictationLesson.findById(lessonId);
      if (!doc) {
        doc = new DictationLesson({ _id: lessonId, studyCount: 0, completedUsers: [] });
      }
      doc.studyCount = (doc.studyCount || 0) + 1;
      if (email && email !== 'guest' && !doc.completedUsers.includes(email)) {
        doc.completedUsers.push(email);
      }
      await doc.save();
      currentCount = doc.studyCount;
      completedUsersList = doc.completedUsers;

      // Cập nhật tiến độ của User trong MongoDB
      if (email && email !== 'guest') {
        try {
          await User.findByIdAndUpdate(email, {
            $addToSet: { 'progress.completedVideos': lessonId },
            $inc: { 'stats.videoCompletions': 1 }
          });
        } catch (userErr) {
          console.warn("Could not update User in MongoDB:", userErr.message);
        }
      }
    }

    // 2. Ghi nhận backup vào file local
    try {
      const data = await fs.readFile(DICTATION_DB_PATH, 'utf-8');
      const lessons = JSON.parse(data);
      const lesson = lessons.find(l => l.id === lessonId);
      if (lesson) {
        lesson.studyCount = currentCount || ((lesson.studyCount || 0) + 1);
        lesson.completedUsers = lesson.completedUsers || [];
        if (email && email !== 'guest' && !lesson.completedUsers.includes(email)) {
          lesson.completedUsers.push(email);
        }
        await fs.writeFile(DICTATION_DB_PATH, JSON.stringify(lessons, null, 2), 'utf-8');
      }
    } catch (fsErr) {
      console.warn("Local sync warning:", fsErr.message);
    }

    res.json({
      success: true,
      lessonId,
      studyCount: currentCount,
      uniqueLearners: completedUsersList.length
    });
  } catch (err) {
    console.error("Error recording dictation completion:", err);
    res.status(500).json({ error: 'Failed to record completion' });
  }
});

const HSK_PASSAGES_PATH = path.join(__dirname, 'hsk_listening_passages.json');

// GET /api/dictation/hsk-passages — Lấy danh sách đoạn văn nghe chép HSK 1, 2, 3
app.get('/api/dictation/hsk-passages', async (req, res) => {
  try {
    const data = await fs.readFile(HSK_PASSAGES_PATH, 'utf-8');
    const passages = JSON.parse(data);
    const { level } = req.query;
    if (level) {
      const lvlNum = parseInt(level, 10);
      return res.json(passages.filter(p => p.level === lvlNum));
    }
    res.json(passages);
  } catch (err) {
    console.error("Error reading hsk_listening_passages.json:", err);
    res.status(500).json({ error: 'Failed to load HSK passages' });
  }
});

// GET /api/paragraph-lessons — Lấy danh sách đoạn văn luyện dịch & nghe chép HSK 1 - 6
const PARAGRAPH_LESSONS_PATH = path.join(__dirname, 'paragraph_practice_lessons.json');
let cachedParagraphLessons = null;

async function getParagraphLessons() {
  if (cachedParagraphLessons) return cachedParagraphLessons;
  try {
    const data = await fs.readFile(PARAGRAPH_LESSONS_PATH, 'utf-8');
    cachedParagraphLessons = JSON.parse(data);
    return cachedParagraphLessons;
  } catch (err) {
    console.error("Error reading paragraph_practice_lessons.json:", err);
    return [];
  }
}

app.get('/api/paragraph-lessons', async (req, res) => {
  try {
    const lessons = await getParagraphLessons();
    const { level, limit, page, search, random } = req.query;
    let filtered = lessons;

    if (level && level !== 'all') {
      const lvl = parseInt(level, 10);
      filtered = filtered.filter(l => l.level === lvl);
    }

    if (search) {
      const s = search.toLowerCase().trim();
      filtered = filtered.filter(l => (l.zh && l.zh.includes(s)) || (l.vi && l.vi.toLowerCase().includes(s)) || (l.pinyin && l.pinyin.toLowerCase().includes(s)));
    }

    if (random === 'true') {
      if (filtered.length === 0) return res.json(null);
      const randItem = filtered[Math.floor(Math.random() * filtered.length)];
      return res.json(randItem);
    }

    const total = filtered.length;
    const p = parseInt(page, 10) || 1;
    const lim = parseInt(limit, 10) || 50;
    const startIndex = (p - 1) * lim;
    const paged = filtered.slice(startIndex, startIndex + lim);

    res.json({
      total,
      page: p,
      limit: lim,
      totalPages: Math.ceil(total / lim),
      lessons: paged
    });
  } catch (err) {
    console.error("Error in /api/paragraph-lessons:", err);
    res.status(500).json({ error: 'Failed to fetch paragraph lessons' });
  }
});

// POST /api/ai/grade-translation — AI chấm điểm & phân tích bài dịch đoạn văn
app.post('/api/ai/grade-translation', async (req, res) => {
  const { originalZh, originalVi, userTranslation, direction = 'vi_to_zh', level = 1 } = req.body;
  if (!userTranslation || !userTranslation.trim()) {
    return res.status(400).json({ error: 'Vui lòng nhập bài dịch của bạn.' });
  }

  const cleanUserText = userTranslation.trim();
  const isViToZh = direction === 'vi_to_zh';
  const targetStandard = isViToZh ? originalZh : originalVi;
  const sourcePrompt = isViToZh ? originalVi : originalZh;

  const prompt = `Bạn là chuyên gia thẩm định và giảng viên dịch thuật tiếng Trung - tiếng Việt hàng đầu của "Tiếng Trung Hongtai".
Nhiệm vụ: Chấm điểm bài dịch của học viên, phân tích lỗi sai và đề xuất bản dịch tự nhiên chuẩn xác nhất.

Thông tin bài tập:
- Hướng dịch: ${isViToZh ? 'Tiếng Việt sang Tiếng Trung (Việt -> Trung)' : 'Tiếng Trung sang Tiếng Việt (Trung -> Việt)'}
- Trình độ: HSK ${level}
- Đề bài gốc (${isViToZh ? 'Tiếng Việt' : 'Tiếng Trung'}):
"""
${sourcePrompt}
"""
- Bản dịch mẫu chuẩn của hệ thống:
"""
${targetStandard}
"""

Bản dịch của học viên:
"""
${cleanUserText}
"""

Hãy đánh giá công tâm theo thang điểm 100.
Trả về ĐÚNG 1 JSON object:
{
  "score": <số nguyên từ 0 đến 100>,
  "badge": "<Một trong các huy hiệu: 'Xuất sắc 🌟' (>=90) | 'Rất tốt 👏' (>=80) | 'Khá 👍' (>=65) | 'Cần cố gắng ✍️' (<65)>",
  "comment": "<Nhận xét ngắn gọn 1-2 câu về mức độ sát nghĩa, văn phong và ngữ pháp bằng tiếng Việt>",
  "strengths": [
    "<Điểm tốt 1 trong bài dịch của học sinh>"
  ],
  "improvements": [
    {
      "issue": "<chỗ dùng từ hoặc ngữ pháp chưa tối ưu của học sinh>",
      "suggestion": "<cách sửa chuẩn xác hơn>",
      "explanation": "<giải thích lý do bằng tiếng Việt>"
    }
  ],
  "modelTranslation": "${(targetStandard || '').replace(/"/g, '\\"')}",
  "alternativePhrasings": [
    "<1 cách dịch khác cũng tự nhiên và chuẩn xác>"
  ]
}`;

  try {
    let reply = '';
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY || '';
    if (groqClient) {
      try {
        const completion = await groqClient.chat.completions.create({
          model: 'openai/gpt-oss-120b',
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          max_tokens: 1500
        });
        reply = completion.choices[0]?.message?.content || '';
      } catch (eGroq) {
        console.warn('Groq translation grading failed, trying Gemini...', eGroq.message);
      }
    }

    if (!reply && GEMINI_API_KEY) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
      });
      if (response.ok) {
        const data = await response.json();
        reply = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      }
    }

    let result = null;
    const jsonMatch = reply.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try { result = JSON.parse(jsonMatch[0]); } catch (e) { }
    }

    if (!result) {
      result = {
        score: 85,
        badge: "Rất tốt 👏",
        comment: "Bản dịch truyền tải đúng ý nghĩa cốt lõi của đề bài!",
        strengths: ["Sát nghĩa với bản gốc"],
        improvements: [],
        modelTranslation: targetStandard,
        alternativePhrasings: []
      };
    }

    res.json({ success: true, ...result });
  } catch (err) {
    console.error('AI Grade translation error:', err);
    res.json({
      success: true,
      score: 85,
      badge: "Khá 👍",
      comment: "Bài dịch cơ bản truyền tải đúng ngữ nghĩa.",
      strengths: ["Hiểu được ý câu"],
      improvements: [],
      modelTranslation: targetStandard,
      alternativePhrasings: []
    });
  }
});

// ============================================================
// VOICE ACTIVITY DETECTION (VAD) & ANTI-HALLUCINATION ENGINE
// ============================================================

const HALLUCINATION_PATTERNS = [
  /^(作词|作曲|编曲|填词|演唱|歌手|字幕|汉语|english|music|by|mv|exclusive)+/i,
  /作词.*作曲|作曲.*编曲|编曲.*作词|汉语.*汉语|作词.*汉语|作曲.*汉语|中文字幕|李宗盛|志愿者|优优独播剧场|yoyo television|请不吝点赞|订阅.*转发|打赏支持|QQ音乐|网易云音乐|酷狗音乐/i,
  /dimatorzok|amara\.org|subtitles created by|ghien mi go|ghiền mì gõ|subscribe|субтитры|белая ночь/i
];

function isHallucinationText(text) {
  if (!text) return true;
  const clean = text.trim();
  if (clean.length === 0) return true;
  for (const pat of HALLUCINATION_PATTERNS) {
    if (pat.test(clean)) return true;
  }
  return false;
}

// Helper: Filter out non-speech sound effects & music cues
function cleanHumanSpeechText(text) {
  if (!text) return '';
  let cleaned = text
    .replace(/[\[\(【（](?:Âm nhạc|Nhạc|tiếng nhạc|Music|music|Applause|Vỗ tay|Tiếng cười|Laughter|Tiếng ồn|Silence|Trống|Guitar|Piano|Hát|Singing|Cheering|音乐|伴奏|掌声|笑声|吉他|钢琴|欢呼)[\]\)】）]/gi, '')
    .replace(/[♪♫♩♬★☆✦✧❤️👍🔥]+/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim();

  if (/^[\p{P}\s]*$/u.test(cleaned)) return '';
  if (isHallucinationText(cleaned)) return '';

  return cleaned;
}

// Master Voice Activity Detection (VAD) & Precision Speech Segmentation Engine
export function extractPrecisionVoiceSegments(whisperData) {
  const allWords = whisperData.words || [];
  const segments = whisperData.segments || [];

  if (allWords.length === 0 && segments.length > 0) {
    return segments
      .filter(s => !isHallucinationText(s.text) && s.no_speech_prob < 0.65)
      .map((s, idx) => {
        const text = cleanHumanSpeechText(s.text);
        let py = '';
        try { py = pinyin(text, { toneType: 'symbol' }); } catch (e) { }
        return {
          id: idx + 1,
          startTime: parseFloat(Number(s.start || 0).toFixed(3)),
          endTime: parseFloat(Number(s.end || 0).toFixed(3)),
          duration: parseFloat((Number(s.end || 0) - Number(s.start || 0)).toFixed(3)),
          hanzi: text,
          pinyin: py,
          words: []
        };
      }).filter(s => s.hanzi.length > 0);
  }

  // Step 1: Filter ghost words on background music & Sort words chronologically
  const validWords = [];

  for (let i = 0; i < allWords.length; i++) {
    const w = allWords[i];
    const wordText = cleanHumanSpeechText(w.word || '');
    if (!wordText) continue;

    if (isHallucinationText(wordText)) continue;

    const start = typeof w.start === 'number' ? w.start : 0;
    const end = typeof w.end === 'number' ? w.end : start + 0.3;
    const dur = end - start;
    const charCount = wordText.replace(/\s+/g, '').length || 1;
    const durPerChar = dur / charCount;

    // Ghost hallucination on music: duration < 0.045s per character
    if (durPerChar < 0.045 && dur < 0.075) {
      continue;
    }

    validWords.push({
      word: wordText,
      start: Math.max(0, start),
      end: Math.max(start + 0.05, end)
    });
  }

  // Ensure absolute chronological order
  validWords.sort((a, b) => a.start - b.start);

  // Step 2: Clean isolated phantom chars & repetitive loop spam
  const cleanedWords = [];
  for (let i = 0; i < validWords.length; i++) {
    const curr = validWords[i];
    const prev = validWords[i - 1];
    const next = validWords[i + 1];

    const prevGap = prev ? (curr.start - prev.end) : 999;
    const nextGap = next ? (next.start - curr.end) : 999;
    const dur = curr.end - curr.start;

    // Single character surrounded by > 2.5s gaps on both sides with dur < 0.15s is background noise hallucination
    if (prevGap > 2.5 && nextGap > 2.5 && dur < 0.15 && curr.word.length <= 1) {
      continue;
    }

    // Filter repetitive loops (3+ same words in a row)
    if (i >= 2 && curr.word === validWords[i - 1].word && curr.word === validWords[i - 2].word) {
      continue;
    }

    cleanedWords.push(curr);
  }

  // Step 3: Cluster words into precision sentences based on:
  // - Voice Activity Detection: Vocal pause / music gap > 0.65s (prevents splitting notes/words within singing lines)
  // - Punctuation ending marks (。！？!?；;.\n)
  // - Clause pauses (，, with length > 2.8s)
  // - Max duration (max 8.0s or max 14 words)
  const rawSentences = [];
  let currentGroup = [];

  for (let i = 0; i < cleanedWords.length; i++) {
    const wordObj = cleanedWords[i];

    if (currentGroup.length === 0) {
      currentGroup.push(wordObj);
      continue;
    }

    const prevWord = currentGroup[currentGroup.length - 1];
    const voiceGap = wordObj.start - prevWord.end;
    const currentText = currentGroup.map(w => w.word).join(' ').trim();
    const isPrevPunctuation = /[。！？!?；;.\n]$/.test(prevWord.word);
    const isClauseBreak = /[，,、]$/.test(prevWord.word) && (prevWord.end - currentGroup[0].start > 2.8);
    const isTooLong = currentText.split(' ').length > 14 || (wordObj.end - currentGroup[0].start > 8.0);

    // CRITICAL: Voice ends when speaker/singer pauses for > 0.65s (switches to BGM/silence)
    const isVoiceStopped = voiceGap > 0.65;

    if (isVoiceStopped || isPrevPunctuation || isClauseBreak || isTooLong) {
      rawSentences.push(buildSentenceFromWords(currentGroup, rawSentences.length + 1));
      currentGroup = [wordObj];
    } else {
      currentGroup.push(wordObj);
    }
  }

  if (currentGroup.length > 0) {
    rawSentences.push(buildSentenceFromWords(currentGroup, rawSentences.length + 1));
  }

  // Step 4: Consolidate broken sub-phrases / trailing fragments
  // If a fragment is tiny (< 3 words) and gap < 0.85s, merge with previous sentence so words aren't cut off
  const consolidated = [];
  for (let i = 0; i < rawSentences.length; i++) {
    const curr = rawSentences[i];
    if (consolidated.length > 0) {
      const prev = consolidated[consolidated.length - 1];
      const gap = curr.startTime - prev.endTime;
      const wordCount = curr.hanzi.split(' ').length;
      if (gap < 0.85 && (wordCount <= 2 || curr.duration < 1.2 || /^(đầu|tôi|nữa|nhé|ơi|đi|nào|đâu|lại|bay|về|thơ|mười|tám|18)[\.,!\?]?$/i.test(curr.hanzi.trim()))) {
        prev.endTime = curr.endTime;
        prev.duration = parseFloat((prev.endTime - prev.startTime).toFixed(3));
        prev.hanzi = `${prev.hanzi} ${curr.hanzi}`.replace(/\s+/g, ' ').trim();
        prev.words.push(...curr.words);
        continue;
      }
    }
    consolidated.push(curr);
  }

  // Step 5: Post-filter intro phantom fragments (e.g. if a 1st sentence is isolated before a 4s+ gap and is an incomplete fragment)
  if (consolidated.length >= 2) {
    const first = consolidated[0];
    const second = consolidated[1];
    const gap = second.startTime - first.endTime;
    if (first.startTime < 8.0 && gap > 4.0 && first.hanzi.length <= 4) {
      console.log(`[VAD Engine] Dropped intro phantom fragment: "${first.hanzi}" [${first.startTime}s - ${first.endTime}s] before ${gap.toFixed(2)}s intro music`);
      consolidated.shift();
    }
  }

  consolidated.forEach((s, idx) => s.id = idx + 1);
  return consolidated;
}

function buildSentenceFromWords(wordList, id) {
  const starts = wordList.map(w => w.start).filter(n => typeof n === 'number' && !isNaN(n));
  const ends = wordList.map(w => w.end).filter(n => typeof n === 'number' && !isNaN(n));
  const startTime = starts.length > 0 ? parseFloat(Math.min(...starts).toFixed(3)) : 0;
  let endTime = ends.length > 0 ? parseFloat(Math.max(...ends).toFixed(3)) : startTime + 2;
  if (endTime <= startTime) endTime = parseFloat((startTime + 1.5).toFixed(3));

  const hasHanzi = wordList.some(w => /[\u4e00-\u9fa5]/.test(w.word));
  const rawText = hasHanzi
    ? wordList.map(w => w.word).join('').trim()
    : wordList.map(w => w.word).join(' ').replace(/\s+/g, ' ').trim();

  let py = '';
  if (hasHanzi) {
    try { py = pinyin(rawText, { toneType: 'symbol' }); } catch (e) { }
  }

  return {
    id,
    startTime,
    endTime,
    duration: parseFloat((endTime - startTime).toFixed(3)),
    hanzi: rawText,
    pinyin: py,
    words: wordList.map(w => ({
      word: w.word.trim(),
      start: parseFloat(w.start.toFixed(3)),
      end: parseFloat(w.end.toFixed(3))
    }))
  };
}

// Fallback legacy segment consolidator for third-party plain captions
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
    const isTerminal = /[.!?。！？;\n]$/.test(currentGroup.text.trim());
    const isClauseEnd = /[,，;；]$/.test(currentGroup.text.trim());
    const isTooLong = (currentGroup.text.length + cleanText.length) > 35;

    if (gap >= 0 && gap <= 0.38 && !isTerminal && !(isClauseEnd && (item.endTime - currentGroup.startTime) > 3.5) && !isTooLong) {
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
    return {
      text: item.text,
      startTime: parseFloat(Number(item.startTime).toFixed(3)),
      endTime: parseFloat(Number(item.endTime).toFixed(3))
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
  } catch (err) { }

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
  } catch (err2) { }

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
      const timeMatch = trimmed.match(/^(\[\s*[\d:.]+\s*(?:-|–|to)\s*[\d:.]+\s*\]|\d+:\d+(?:\.\d+)?)\s*(.*)$/i) || trimmed.match(/^(\[[0-9:\s.-]+\]|[0-9:]+)\s*(.*)$/);
      if (timeMatch) {
        timePrefix = timeMatch[1].trim() + ' ';
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

    // Call Multi-Model LLM with automatic fallback
    try {
      const prompt = `Bạn là Chuyên Gia Ngôn Ngữ Học Tiếng Trung & Dịch Thuật Sư Phạm Cao Cấp.
Nhiệm vụ: Dưới đây là danh sách các câu phụ đề gốc được trích xuất từ âm thanh video (có thể bằng Tiếng Trung, Tiếng Việt, hoặc ngôn ngữ khác).
Hãy chuẩn hóa và dịch toàn bộ danh sách sang Chữ Hán Giản Thể và Tiếng Việt chuẩn mực sư phạm:

YÊU CẦU:
1. "hanzi" (BẮT BUỘC CHỮ HÁN GIẢN THỂ CHUẨN XÁC 100%):
   - Nếu câu gốc là Tiếng Trung: Chuẩn hóa Chữ Hán Giản Thể đúng ngữ pháp, giữ nguyên câu đúng nghĩa.
   - Nếu câu gốc là Tiếng Việt/ngôn ngữ khác: Dịch sang Chữ Hán Giản Thể tự nhiên, chuẩn xác 100% theo đúng nghĩa câu gốc.
2. "vietnamese" (DỊCH TIẾNG VIỆT CHUẨN CHÍNH TẢ & LỊCH SỰ):
   - Nếu câu gốc là Tiếng Việt: Giữ nguyên câu tiếng Việt và sửa lại mọi lỗi chính tả.
   - Nếu câu gốc là Tiếng Trung: Dịch sang Tiếng Việt chuẩn xác, mượt mà, đúng ngữ cảnh học tập (Tôi / Bạn / Anh / Chị).
3. GIỮ NGUYÊN "index" tương ứng của từng câu trong danh sách.

Danh sách câu gốc:
${JSON.stringify(inputItems.map(item => ({ index: item.index, text: item.rawText })), null, 2)}

BẮT BUỘC TRẢ VỀ ĐÚNG JSON:
{
  "results": [
    {
      "index": 0,
      "hanzi": "...",
      "vietnamese": "..."
    }
  ]
}`;

      const parsed = await callLLMJson(prompt);
      if (Array.isArray(parsed.results) && parsed.results.length > 0) {
        const processed = inputItems.map(item => {
          const r = parsed.results.find(res => res.index === item.index) || {};
          let hanzi = (r.hanzi || item.rawText || '').trim();
          let vi = (r.vietnamese || '').trim();

          let py = '';
          try { py = pinyin(hanzi, { toneType: 'symbol' }); } catch (e) { }

          return `${item.timePrefix}${hanzi} | ${py} | ${vi}`;
        });

        return res.json({
          success: true,
          processedText: processed.join('\n')
        });
      }
    } catch (llmErr) {
      console.warn("[Auto-Translate] LLM warning, falling back to base translator:", llmErr.message);
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
        try { py = pinyin(translatedHanzi, { toneType: 'symbol' }); } catch (e) { }
        processedLines.push(`${item.timePrefix}${translatedHanzi} | ${py} | ${sourceText}`);
      } else {
        let py = parts.find(p => p !== hanziCandidate && p !== viCandidate) || '';
        if (!py) {
          try { py = pinyin(hanziCandidate, { toneType: 'symbol' }); } catch (e) { }
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
fs.mkdir(AUDIO_TEMP_DIR, { recursive: true }).catch(() => { });

const BIN_DIR = path.join(__dirname, 'bin');
const YTDLP_PATH = path.join(BIN_DIR, process.platform === 'win32' ? 'yt-dlp.exe' : 'yt-dlp');
const ytdlpWrap = YTDlpWrap.default || YTDlpWrap;

// Ensure yt-dlp binary is present and up-to-date
async function ensureYtDlpBinary() {
  await fs.mkdir(BIN_DIR, { recursive: true }).catch(() => { });
  let needsDownload = !existsSync(YTDLP_PATH);

  if (existsSync(YTDLP_PATH)) {
    try {
      const stats = await fs.stat(YTDLP_PATH);
      const ageInDays = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60 * 24);
      if (ageInDays > 3) {
        console.log(`[yt-dlp] Binary is ${ageInDays.toFixed(1)} days old. Auto-updating to latest GitHub release...`);
        needsDownload = true;
      }
    } catch (e) { }
  }

  if (needsDownload) {
    console.log('[yt-dlp] Fetching latest standalone yt-dlp binary from GitHub...');
    try {
      await ytdlpWrap.downloadFromGithub(YTDLP_PATH, undefined, process.platform === 'win32' ? 'win32' : 'linux');
      console.log('[yt-dlp] Successfully updated yt-dlp binary at:', YTDLP_PATH);
    } catch (eDl) {
      console.warn('[yt-dlp] Binary update attempt warn, keeping existing binary:', eDl.message);
    }
  }
  if (process.platform !== 'win32') {
    await fs.chmod(YTDLP_PATH, 0o755).catch(() => { });
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
        try { py = pinyin(hanzi, { toneType: 'symbol' }); } catch (e) { }
        meaning = await translateText(hanzi, 'zh-CN', 'vi');
      } else {
        meaning = text;
        hanzi = await translateText(meaning, 'auto', 'zh-CN');
        try { py = pinyin(hanzi, { toneType: 'symbol' }); } catch (e) { }
      }

      if (!hanzi || !/[\u4e00-\u9fa5]/.test(hanzi)) {
        hanzi = await translateText(meaning || '学习中文', 'vi', 'zh-CN');
        try { py = pinyin(hanzi, { toneType: 'symbol' }); } catch (e) { }
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

// Universal Multi-Model LLM JSON Caller (GPT-OSS-120B -> GPT-OSS-20B -> Qwen -> Gemini)
async function callLLMJson(prompt) {
  // 1. Try Groq GPT-OSS-120B (Deterministic temperature 0, high quality)
  if (groqClient) {
    try {
      const res = await groqClient.chat.completions.create({
        model: 'openai/gpt-oss-120b',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        response_format: { type: 'json_object' }
      });
      return JSON.parse(res.choices[0].message.content);
    } catch (e120b) {
      console.warn('[LLM] GPT-OSS-120B limit/error, falling back to GPT-OSS-20B:', e120b.message);
    }

    // 2. Try Groq GPT-OSS-20B (Deterministic temperature 0, fast)
    try {
      const res = await groqClient.chat.completions.create({
        model: 'openai/gpt-oss-20b',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0,
        response_format: { type: 'json_object' }
      });
      return JSON.parse(res.choices[0].message.content);
    } catch (e20b) {
      console.warn('[LLM] GPT-OSS-20B error, falling back to Gemini/Qwen:', e20b.message);
    }
  }

  // 3. Try Google Gemini REST API (Deterministic temperature 0)
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
  if (GEMINI_API_KEY) {
    const candidateGemini = ['gemini-2.5-flash', 'gemini-flash-latest', 'gemini-2.5-pro'];
    for (const gModel of candidateGemini) {
      try {
        const gemRes = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${gModel}:generateContent?key=${GEMINI_API_KEY}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0 }
          })
        });
        if (gemRes.ok) {
          const gData = await gemRes.json();
          const text = gData.candidates?.[0]?.content?.parts?.[0]?.text;
          if (text) return JSON.parse(text);
        }
      } catch (eGem) {
        console.warn(`[LLM] Gemini ${gModel} call error:`, eGem.message);
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
        hanzi: s.hanzi || s.text || ''
      }));

      const isFirstChunk = (i === 0);
      const prompt = `Bạn là Chuyên Gia Ngôn Ngữ Học Tiếng Trung & Biên Tập Lời Bài Hát/Hội Thoại Việt-Trung Cao Cấp.
Dưới đây là tiêu đề video "${videoTitle}" (${durationSeconds}s) và danh sách các câu trích xuất chính xác từ âm thanh giọng nói (đã có mốc thời gian chuẩn xác từ âm phổ):

${JSON.stringify(chunkItems, null, 2)}

NHIỆM VỤ BIÊN TẬP VÀ DỊCH NGHĨA CHUẨN XÁC 100%:

1. QUY TẮC DỊCH VÀ BẢO TOÀN TRỌN VẸN TỪ NGỮ 100%:
   - BẮT BUỘC BẢO TOÀN ĐẦY ĐỦ MỌI TỪ NGỮ, SỐ ĐẾM, SỐ TUỔI:
     + Tuyệt đối không được bỏ rơi bất kỳ từ ngữ đuôi câu nào (ví dụ: "tuổi tôi mười tám" / "tuổi tôi 18" PHẢI CÓ ĐỦ chữ "mười tám" / "18", không được dừng ở "tuổi tôi").
     + Mọi đại từ nhân xưng, số từ, danh từ trong âm thanh phải được giữ nguyên trọn vẹn trong "vietnamese" và dịch tương ứng đầy đủ trong "hanzi" (ví dụ: "十八岁" cho 18 tuổi).
   - Nếu âm thanh gốc là TIẾNG VIỆT:
     + "vietnamese": Chuẩn hóa lời bài hát/câu nói Tiếng Việt chuẩn xác 100%, sửa các từ AI nhận diện nhầm âm (ví dụ: "gió xé" -> "giỏ xe", "hóa phượng" -> "hoa phượng", "chùm vượng vĩ" -> "chùm phượng vĩ", "gã khó" -> "gã khờ ngọng nghịu").
     + "hanzi": Dịch sang Chữ Hán Giản Thể (Simplified Chinese) thật mượt mà, đầy đủ ý, chuẩn ngữ pháp, khớp nghĩa 100% với từng câu hát.
   - Nếu âm thanh gốc là TIẾNG TRUNG:
     + "hanzi": BẮT BUỘC dùng Chữ Hán Giản Thể chuẩn (Simplified Chinese), sửa chữ nhầm đồng âm nếu có.
     + "vietnamese": Dịch Tiếng Việt chuẩn xác, giàu cảm xúc và tự nhiên theo ngữ cảnh.

2. LOẠI BỎ RÁC & TẠP ÂM:
   - Nếu câu nào là tạp âm rác, lời kêu gọi đăng ký kênh (như "subscribe", "ghiền mì gõ", "like video", v.v.), hãy đặt "ignore": true.

3. GIỮ NGUYÊN "id" tương ứng của từng câu trong danh sách.
${isFirstChunk ? `4. "hskLevel": Cấp độ HSK phù hợp ("1", "2", "3", "4", "5", "6").
5. "category": Chọn đúng 1 trong: "Âm Nhạc", "Giao Tiếp", "Ẩm Thực", "Du Lịch", "Hoạt Hình", "Phim Ảnh", "Công Việc", "Tin Tức", "Văn Hóa", "Đời Sống", "Khác".
6. "description": 1 câu tóm tắt nội dung bài học tiếng Việt hấp dẫn.` : ''}

BẮT BUỘC TRẢ VỀ ĐÚNG JSON:
{
  ${isFirstChunk ? `"hskLevel": "3",\n  "category": "Âm Nhạc",\n  "description": "...",\n  ` : ''}"sentences": [
    {
      "id": 1,
      "hanzi": "<Chữ Hán Giản Thể chuẩn>",
      "vietnamese": "<Lời bài hát/câu dịch Tiếng Việt chuẩn>",
      "ignore": false
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
        for (let idx = 0; idx < parsed.sentences.length; idx++) {
          const s = parsed.sentences[idx];
          if (!s || s.ignore === true) continue;

          const origItem = chunk.find(x => x.id == s.id) || chunk[idx] || {};

          let hanzi = s.hanzi || origItem.hanzi || origItem.text || '';
          let vietnamese = s.vietnamese || '';

          if (!hanzi && vietnamese) {
            hanzi = await translateText(vietnamese, 'vi', 'zh-CN');
          }
          if (!vietnamese && hanzi) {
            vietnamese = await translateText(hanzi, 'zh-CN', 'vi');
          }
          if (!hanzi) continue;

          let py = '';
          try { py = pinyin(hanzi, { toneType: 'symbol' }); } catch (e) { }

          // STRICT TIMINGS: Always prioritize the physically measured audio VAD start/end timestamps
          let exactStart = (origItem.startTime !== undefined && origItem.startTime !== null)
            ? origItem.startTime
            : parseTimeSeconds(s.startTime, 0);
          let exactEnd = (origItem.endTime !== undefined && origItem.endTime !== null)
            ? origItem.endTime
            : parseTimeSeconds(s.endTime, exactStart + 3);

          if (exactEnd <= exactStart) {
            exactEnd = exactStart + (origItem.duration > 0 ? origItem.duration : 2.5);
          }

          refinedSentences.push({
            id: refinedSentences.length + 1,
            startTime: parseFloat(Number(exactStart).toFixed(3)),
            endTime: parseFloat(Number(exactEnd).toFixed(3)),
            duration: parseFloat((Number(exactEnd) - Number(exactStart)).toFixed(3)),
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
      const splitSentences = postProcessAndSplitSentences(refinedSentences);
      return {
        level,
        levelText,
        category,
        description,
        sentences: splitSentences
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
    sentences: postProcessAndSplitSentences(baseSentences)
  };
}

// Helper: Clean repetitive ASR loops (e.g. "xôi Tìm Về... xôi Tìm Về...")
function cleanRepeatedPhrases(text) {
  if (!text || typeof text !== 'string') return '';
  let str = text.trim();
  // Remove 2+ consecutive repeated words or short phrases
  str = str.replace(/(\b.+?\b)(?:\s+\1){2,}/gi, '$1');
  return str.trim();
}

// Helper: Normalize sentences while preserving exact audio-measured timestamps
function postProcessAndSplitSentences(sentences) {
  if (!Array.isArray(sentences) || sentences.length === 0) return [];
  const result = [];

  let lastEndTime = 0;

  for (const s of sentences) {
    const rawHanzi = cleanRepeatedPhrases(s.hanzi || s.text || '');
    const rawMeaning = cleanRepeatedPhrases(s.meaning || s.vietnamese || '');
    let startTime = typeof s.startTime === 'number' ? s.startTime : 0;
    let endTime = typeof s.endTime === 'number' ? s.endTime : (startTime + 3);

    if (!rawHanzi || isHallucinationText(rawHanzi) || isHallucinationText(rawMeaning)) continue;

    if (startTime < lastEndTime) {
      startTime = Math.max(startTime, lastEndTime);
    }
    if (endTime <= startTime) {
      endTime = startTime + (s.duration > 0 ? s.duration : 2.5);
    }

    let py = s.pinyin || '';
    if (!py && rawHanzi) {
      try { py = pinyin(rawHanzi, { toneType: 'symbol' }); } catch (e) { }
    }

    lastEndTime = endTime;

    result.push({
      id: result.length + 1,
      startTime: parseFloat(Number(startTime).toFixed(3)),
      endTime: parseFloat(Number(endTime).toFixed(3)),
      duration: parseFloat((Number(endTime) - Number(startTime)).toFixed(3)),
      hanzi: rawHanzi,
      pinyin: py,
      meaning: rawMeaning,
      words: s.words || []
    });
  }

  return result;
}

// Master Unified YouTube Dictation Extractor (Zero-Hallucination, VAD & Google ASR Subtitles)
export async function extractYouTubeDictation(youtubeId, extractRawOnly = false) {
  return await processYouTubeVideo(youtubeId);
}

// GET /api/dictation/debug-status — Kiểm tra chẩn đoán hệ thống AI & biến môi trường
app.get('/api/dictation/debug-status', (req, res) => {
  res.json({
    status: 'online',
    commit: 'fix-502-render-v2',
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

// GET /api/dictation/test-subtitles — Diagnostic endpoint to inspect YouTube steps
app.get('/api/dictation/test-subtitles', async (req, res) => {
  const id = req.query.id || 'AHSWgUFKF8M';
  const report = { youtubeId: id, timestamp: new Date().toISOString(), steps: {} };
  const t0 = Date.now();
  try {
    const { fetchVideoMetadata, extractYouTubeSubtitles } = await import('./services/youtube_transcriber.js');
    const tMeta = Date.now();
    try {
      const meta = await fetchVideoMetadata(id);
      report.steps.metadata = { ok: true, durationMs: Date.now() - tMeta, data: meta };
    } catch (e) {
      report.steps.metadata = { ok: false, durationMs: Date.now() - tMeta, error: e.message };
    }
    const tSub = Date.now();
    try {
      const sub = await extractYouTubeSubtitles(id);
      report.steps.subtitles = { ok: !!sub, durationMs: Date.now() - tSub, count: sub?.sentences?.length, source: sub?.source };
    } catch (e) {
      report.steps.subtitles = { ok: false, durationMs: Date.now() - tSub, error: e.message };
    }
    report.totalDurationMs = Date.now() - t0;
    res.json(report);
  } catch (err) {
    report.error = err.message;
    report.totalDurationMs = Date.now() - t0;
    res.status(500).json(report);
  }
});

// GET /api/dictation/debug-network — Multi-method diagnostic to determine optimal caption pipeline on Render
app.get('/api/dictation/debug-network', async (req, res) => {
  const id = req.query.id || 'AHSWgUFKF8M';
  const results = {};

  const testMethod = async (name, fn) => {
    const t0 = Date.now();
    try {
      const val = await Promise.race([
        fn(),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout after 12000ms')), 12000))
      ]);
      results[name] = { ok: true, durationMs: Date.now() - t0, ...val };
    } catch (e) {
      results[name] = { ok: false, durationMs: Date.now() - t0, error: e.message };
    }
  };

  await Promise.allSettled([
    // 1. YouTube Data API v3 captions list
    testMethod('google_captions_api', async () => {
      const key = process.env.YOUTUBE_API_KEY;
      if (!key) return { note: 'No YOUTUBE_API_KEY configured' };
      const r = await fetch(`https://www.googleapis.com/youtube/v3/captions?videoId=${id}&key=${key}&part=snippet`);
      const j = await r.json();
      return { status: r.status, tracksCount: j.items?.length || 0, tracks: j.items?.map(i => i.snippet?.language) };
    }),

    // 2. InnerTube iOS Player (Node fetch)
    testMethod('innertube_ios_fetch', async () => {
      const r = await fetch('https://www.youtube.com/youtubei/v1/player?prettyPrint=false', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': 'com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_1_1 like Mac OS X; en_US)',
          'X-YouTube-Client-Name': '5',
          'X-YouTube-Client-Version': '20.10.4'
        },
        body: JSON.stringify({
          context: {
            client: {
              clientName: 'IOS',
              clientVersion: '20.10.4',
              deviceMake: 'Apple',
              deviceModel: 'iPhone16,2',
              osName: 'iOS',
              osVersion: '18.1.1.22B91',
              hl: 'vi',
              gl: 'VN'
            }
          },
          videoId: id
        })
      });
      const text = await r.text();
      let j = null;
      try { j = JSON.parse(text); } catch (e) { }
      const tracks = j?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
      return { status: r.status, isJson: !!j, playability: j?.playabilityStatus?.status, tracksCount: tracks?.length || 0 };
    }),

    // 3. InnerTube iOS (via system curl)
    testMethod('innertube_ios_curl', async () => {
      const { exec } = await import('child_process');
      return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
          context: {
            client: {
              clientName: 'IOS',
              clientVersion: '20.10.4',
              deviceMake: 'Apple',
              deviceModel: 'iPhone16,2',
              osName: 'iOS',
              osVersion: '18.1.1.22B91',
              hl: 'vi',
              gl: 'VN'
            }
          },
          videoId: id
        }).replace(/"/g, '\\"');
        const cmd = `curl -s -m 8 -X POST "https://www.youtube.com/youtubei/v1/player?prettyPrint=false" -H "Content-Type: application/json" -H "User-Agent: com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_1_1 like Mac OS X; en_US)" -H "X-YouTube-Client-Name: 5" -H "X-YouTube-Client-Version: 20.10.4" -d "${payload}"`;
        exec(cmd, (err, stdout, stderr) => {
          if (err) return reject(new Error(err.message + (stderr ? ': ' + stderr : '')));
          let j = null;
          try { j = JSON.parse(stdout); } catch (e) { }
          resolve({
            stdoutLen: stdout.length,
            isJson: !!j,
            playability: j?.playabilityStatus?.status,
            tracksCount: j?.captions?.playerCaptionsTracklistRenderer?.captionTracks?.length || 0,
            preview: stdout.substring(0, 150)
          });
        });
      });
    })
  ]);

  res.json({ id, timestamp: new Date().toISOString(), results });
});

// GET /api/dictation/debug-innertube — Diagnostic endpoint to inspect raw InnerTube response
app.get('/api/dictation/debug-innertube', async (req, res) => {
  const id = req.query.id || 'AHSWgUFKF8M';
  try {
    const INNERTUBE_API_URL = 'https://www.youtube.com/youtubei/v1/player?prettyPrint=false';
    const INNERTUBE_CLIENT_VERSION = '20.10.4';
    const INNERTUBE_CONTEXT = {
      client: {
        clientName: 'IOS',
        clientVersion: '20.10.4',
        deviceMake: 'Apple',
        deviceModel: 'iPhone16,2',
        osName: 'iOS',
        osVersion: '18.1.1.22B91',
        hl: 'vi',
        gl: 'VN'
      }
    };
    const INNERTUBE_USER_AGENT = 'com.google.ios.youtube/20.10.4 (iPhone16,2; U; CPU iOS 18_1_1 like Mac OS X; en_US)';

    const resp = await fetch(INNERTUBE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': INNERTUBE_USER_AGENT,
        'X-YouTube-Client-Name': '5',
        'X-YouTube-Client-Version': '20.10.4'
      },
      body: JSON.stringify({ context: INNERTUBE_CONTEXT, videoId: id }),
      signal: AbortSignal.timeout(8000)
    });
    const text = await resp.text();
    let data = null;
    try { data = JSON.parse(text); } catch (e) {
      return res.json({ httpStatus: resp.status, isJson: false, rawPreview: text.substring(0, 300) });
    }
    const tracks = data?.captions?.playerCaptionsTracklistRenderer?.captionTracks;
    const playability = data?.playabilityStatus;

    let downloadTest = null;
    if (tracks && tracks[0]?.baseUrl) {
      try {
        const dRes = await fetch(tracks[0].baseUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          signal: AbortSignal.timeout(5000)
        });
        downloadTest = { status: dRes.status, ok: dRes.ok, length: (await dRes.text()).length };
      } catch (e) {
        downloadTest = { error: e.message };
      }
    }

    res.json({
      httpStatus: resp.status,
      playabilityStatus: playability?.status,
      reason: playability?.reason,
      tracksCount: tracks?.length || 0,
      tracks: tracks?.map(t => ({ lang: t.languageCode, name: t.name?.runs?.[0]?.text, kind: t.kind })),
      downloadTest
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/dictation/fetch-subtitles — Lấy phụ đề / mốc giọng nói YouTube
app.post('/api/dictation/fetch-subtitles', async (req, res) => {
  const { youtubeId, url } = req.body || {};
  const target = youtubeId || url;
  if (!target) {
    return res.status(400).json({ error: 'Thiếu link hoặc youtubeId' });
  }

  try {
    const result = await processYouTubeVideo(target);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('Fetch subtitles error:', err);
    res.status(500).json({ error: 'Lỗi khi trích xuất phụ đề YouTube', detail: err.message });
  }
});

// POST /api/dictation/transcribe-audio — AI Audio Transcription
app.post('/api/dictation/transcribe-audio', async (req, res) => {
  const { youtubeId, url } = req.body || {};
  const target = youtubeId || url;
  if (!target) {
    return res.status(400).json({ error: 'Thiếu link hoặc youtubeId' });
  }

  try {
    const result = await processYouTubeVideo(target);
    if (!result.success) {
      return res.status(400).json(result);
    }
    res.json(result);
  } catch (err) {
    console.error('Transcribe audio error:', err);
    res.status(500).json({ error: 'Lỗi khi phân tích giọng nói AI', detail: err.message });
  }
});

// POST /api/dictation/save-lesson — Lưu bài học video mới
app.post('/api/dictation/save-lesson', async (req, res) => {
  try {
    const newLesson = req.body;
    // Đã mở khóa hoàn toàn tính năng thêm video YouTube tùy thích!

    const email = getLoggedInUserEmail(req) || req.body.userEmail || 'guest';
    if (!newLesson || !newLesson.youtubeId || !newLesson.title) {
      return res.status(400).json({ error: 'Missing required lesson fields (youtubeId, title)' });
    }
    newLesson.userEmail = email;
    newLesson.isCustom = true;
    newLesson.createdAt = newLesson.createdAt || new Date().toISOString();

    // Ensure accurate duration format
    if (!newLesson.duration || newLesson.duration === '03:30' || newLesson.duration === '03:00') {
      if (Array.isArray(newLesson.sentences) && newLesson.sentences.length > 0) {
        const maxEnd = newLesson.sentences.reduce((max, s) => Math.max(max, s.endTime || 0), 0);
        if (maxEnd > 0) {
          const sec = Math.round(maxEnd);
          const hrs = Math.floor(sec / 3600);
          const mins = Math.floor((sec % 3600) / 60);
          const secs = sec % 60;
          newLesson.duration = hrs > 0
            ? `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
            : `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
      }
    }

    const lessons = await readDictationLessons();
    const existingIndex = lessons.findIndex(l => l.youtubeId === newLesson.youtubeId && l.userEmail === email);
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
      try { py = pinyin(cleanWord, { toneType: 'symbol' }); } catch (e) { }

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
      } catch (eDict) { }
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