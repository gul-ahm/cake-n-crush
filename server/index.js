// Production unified server: serves built React app and auth API with enhanced security
const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const DIST_DIR = process.env.DIST_DIR || path.join(__dirname, '..', 'dist');

// Basic startup logging (do not print secrets)
console.log('🚀 Starting production server');
console.log('📁 Serving dist from:', DIST_DIR);
console.log('🔧 NODE_ENV:', process.env.NODE_ENV);

// Derived config
const isProd = process.env.NODE_ENV === 'production';
const allowedOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
const cookieSecure = (process.env.COOKIE_SECURE === 'true') || isProd;
const cookieSameSite = process.env.COOKIE_SAMESITE || 'Strict';
const cookieDomain = process.env.COOKIE_DOMAIN || undefined; // optional
const verboseAuth = process.env.VERBOSE_AUTH_LOGS === 'true';

// Middleware: CORS, JSON, Cookies
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
  methods: ['GET','POST','OPTIONS'],
  allowedHeaders: ['Content-Type','X-Requested-With']
}));
app.use(express.json({ limit: '50kb' }));
app.use(cookieParser());

// Helmet baseline (disable CSP here; custom CSP below)
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

// Custom Content Security Policy (env override possible)
const defaultCsp = process.env.CONTENT_SECURITY_POLICY || "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' " + allowedOrigin + "; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'";
app.use((req,res,next)=>{
  res.setHeader('Content-Security-Policy', defaultCsp);
  next();
});

// Additional security headers
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');
  if (isProd) {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Generic rate limiter (global) - soft limit
const globalLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(globalLimiter);

// Legacy attempt tracking + stricter auth limiter
const authAttempts = new Map();
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success:false, message:'Too many requests - slow down' },
  standardHeaders: true,
  legacyHeaders: false
});
const handshakeLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  message: { success:false, message:'Handshake rate exceeded' },
  standardHeaders: true,
  legacyHeaders: false
});

// Additional per-IP login failure counter (before bcrypt compare)
const attemptGate = (req,res,next)=>{
  const ip = req.ip;
  const rec = authAttempts.get(ip) || { fails:0, last:Date.now() };
  if (Date.now() - rec.last > 15 * 60 * 1000) rec.fails = 0; // reset after 15m
  if (rec.fails >= 10) {
    return res.status(429).json({ success:false, message:'Temporary lockout. Try again later.' });
  }
  req._attemptRec = rec;
  next();
};

// Hash password once at startup (dev-friendly fallback when not production)
let hashedPassword;
try {
  if (process.env.ADMIN_PASSWORD) {
    hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 12);
    console.log('🔐 Admin password hashed');
  } else if (!isProd) {
    // Developer convenience: only for local/dev when password is not provided
    const devPassword = 'admin';
    hashedPassword = bcrypt.hashSync(devPassword, 12);
    console.warn('⚠️ ADMIN_PASSWORD missing - using DEV fallback password "admin" (DO NOT use in production)');
  } else {
    console.error('❌ ADMIN_PASSWORD missing');
  }
} catch (e) {
  console.error('❌ Password hash failed:', e);
}

// Internal API key for handshake (dev-friendly fallback when not production)
let internalApiKey = process.env.INTERNAL_API_KEY;
if (!internalApiKey && !isProd) {
  internalApiKey = crypto.randomBytes(32).toString('hex');
  console.warn('⚠️ INTERNAL_API_KEY missing - generated ephemeral DEV key (handshake enabled for local/test). Set INTERNAL_API_KEY for production.');
}
if (internalApiKey) console.log('🔑 Internal API key loaded'); else console.warn('⚠️ INTERNAL_API_KEY missing');

// Handshake endpoint (short-lived) with rate limiter
app.get('/api/auth/handshake', handshakeLimiter, (req, res) => {
  if (!internalApiKey) return res.status(500).json({ success: false, message: 'Handshake disabled' });
  try {
    const token = jwt.sign({ type: 'handshake', nonce: Date.now() }, internalApiKey, { expiresIn: '30s' });
    res.json({ success: true, handshake: token, expiresIn: 30000 });
  } catch (e) {
    if (verboseAuth) console.error('Handshake error:', e);
    res.status(500).json({ success: false, message: 'Handshake error' });
  }
});

// Login endpoint - issues HttpOnly cookie
app.post('/api/auth/login', loginLimiter, attemptGate, async (req, res) => {
  try {
    const { username, password, handshake } = req.body;
    if (!handshake) return res.status(400).json({ success: false, message: 'Missing handshake' });
    try {
      const decoded = jwt.verify(handshake, internalApiKey);
      if (decoded.type !== 'handshake') throw new Error('Bad type');
    } catch {
      return res.status(401).json({ success: false, message: 'Handshake invalid/expired' });
    }
    const userOk = username === process.env.ADMIN_USERNAME;
    let passOk = false;
    if (hashedPassword && password) passOk = await bcrypt.compare(password, hashedPassword);
    if (!userOk || !passOk) {
      const rec = req._attemptRec; rec.fails++; rec.last = Date.now(); authAttempts.set(req.ip, rec);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    const token = jwt.sign({ user: username, role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    // Set secure cookie
    res.cookie('auth_token', token, {
      httpOnly: true,
      secure: cookieSecure,
      sameSite: cookieSameSite,
      domain: cookieDomain,
      maxAge: 3600000,
      path: '/'
    });
    authAttempts.delete(req.ip);
    res.json({ success: true, message: 'Authentication successful', expiresIn: 3600000 });
  } catch (e) {
    if (verboseAuth) console.error('Auth error:', e);
    res.status(500).json({ success: false, message: 'Internal error' });
  }
});

// Token verify (cookie based)
app.post('/api/auth/verify', (req, res) => {
  const token = req.cookies.auth_token;
  if (!token) return res.status(401).json({ success: false, message: 'No token cookie' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    res.json({ success: true, user: decoded.user, role: decoded.role, message: 'Token valid' });
  } catch (e) {
    return res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Logout - clears cookie
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_token', { path: '/', httpOnly: true });
  res.json({ success: true, message: 'Logout successful' });
});

// Health
app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

// Serve static frontend
app.use(express.static(DIST_DIR));

// SPA fallback (must be after API routes & static)
app.get('*', (req, res) => {
  res.sendFile(path.join(DIST_DIR, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Production server listening on port ${PORT}`);
}).on('error', (err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
