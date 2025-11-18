const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const crypto = require('crypto');
require('dotenv').config();

// Debug logging
console.log('🔧 Starting server initialization...');
console.log('📍 Current directory:', process.cwd());
console.log('🔑 Environment variables loaded:');
console.log('  - CORS_ORIGIN:', process.env.CORS_ORIGIN);
console.log('  - PORT:', process.env.PORT);
console.log('  - ADMIN_USERNAME:', process.env.ADMIN_USERNAME ? '✅ Set' : '❌ Missing');
console.log('  - JWT_SECRET:', process.env.JWT_SECRET ? '✅ Set' : '❌ Missing');

const app = express();
const PORT = process.env.PORT || 3001;

// Prepare secure password hash (do not log plain password)
let hashedPassword;
if (process.env.ADMIN_PASSWORD) {
  try {
    hashedPassword = bcrypt.hashSync(process.env.ADMIN_PASSWORD, 12);
    console.log('🔐 Password hashed with bcrypt (12 rounds)');
  } catch (e) {
    console.error('❌ Failed to hash admin password:', e);
  }
} else {
  console.error('❌ ADMIN_PASSWORD missing; cannot hash');
}

// Internal API key (server only) for handshake signing
let internalApiKey = process.env.INTERNAL_API_KEY;
if (internalApiKey) {
  console.log('🔑 Internal API key loaded (hidden from client)');
} else {
  // Generate ephemeral key (NOT for production) so handshake still works in dev
  internalApiKey = crypto.randomBytes(32).toString('hex');
  console.warn('⚠️ INTERNAL_API_KEY missing - generated ephemeral key (DO NOT use this in production). Set INTERNAL_API_KEY in .env');
}

const verboseAuth = process.env.VERBOSE_AUTH_LOGS === 'true';

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
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

// Custom CSP (can override via CONTENT_SECURITY_POLICY env)
const defaultCsp = process.env.CONTENT_SECURITY_POLICY || "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' http://localhost:5173 http://localhost:" + PORT + "; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'";
app.use((req,res,next)=>{ res.setHeader('Content-Security-Policy', defaultCsp); next(); });

// Security headers (additional)
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Global rate limiter
const globalLimiter = rateLimit({ windowMs: 60 * 1000, max: 300, standardHeaders: true, legacyHeaders: false });
app.use(globalLimiter);

// Handshake rate limiter
const handshakeLimiter = rateLimit({ windowMs: 60 * 1000, max: 60, standardHeaders: true, legacyHeaders: false, message: { success:false, message:'Handshake rate exceeded' } });

// Rate limiting for auth endpoint
const authAttempts = new Map();

const rateLimitAuth = (req, res, next) => {
  const ip = req.ip;
  const attempts = authAttempts.get(ip) || { count: 0, lastAttempt: Date.now() };
  
  // Reset after 15 minutes
  if (Date.now() - attempts.lastAttempt > 15 * 60 * 1000) {
    attempts.count = 0;
  }
  
  if (attempts.count >= 5) {
    return res.status(429).json({ 
      success: false, 
      message: 'Too many login attempts. Please try again later.' 
    });
  }
  
  req.authAttempts = attempts;
  req.clientIP = ip;
  next();
};

// Handshake endpoint to obtain short-lived token
app.get('/api/auth/handshake', handshakeLimiter, (req, res) => {
  try {
    // internalApiKey always present (ephemeral generation in dev if missing)
    const token = jwt.sign({ type: 'handshake', nonce: Date.now() }, internalApiKey, { expiresIn: '30s' });
    res.json({ success: true, handshake: token, expiresIn: 30000 });
  } catch (e) {
    if (verboseAuth) console.error('Handshake error:', e);
    res.status(500).json({ success: false, message: 'Handshake error' });
  }
});

// Secure admin authentication endpoint (now requires handshake)
app.post('/api/auth/login', rateLimitAuth, async (req, res) => {
  if (verboseAuth) {
    console.log('🔐 Authentication request received');
    console.log('📍 Request IP:', req.ip);
    console.log('📋 Request body:', { ...req.body, password: req.body.password ? '***' : 'missing' });
    console.log('🔑 Headers:', req.headers);
  }
  
  try {
    const { username, password, handshake } = req.body;

    // Verify handshake token
    if (!handshake) {
      return res.status(400).json({ success: false, message: 'Missing handshake token' });
    }
    try {
      const decodedHandshake = jwt.verify(handshake, internalApiKey);
      if (decodedHandshake.type !== 'handshake') {
        return res.status(401).json({ success: false, message: 'Invalid handshake context' });
      }
    } catch (e) {
      return res.status(401).json({ success: false, message: 'Handshake invalid or expired' });
    }
    if (verboseAuth) console.log('✅ Handshake verified');
    
    // Validate credentials
    if (verboseAuth) {
      console.log('🔍 Validating credentials...');
      console.log('👤 Received username:', username);
      console.log('🔑 Expected username:', process.env.ADMIN_USERNAME);
      console.log('🔐 Password provided:', password ? 'Yes' : 'No');
    }
    const isValidUser = username === process.env.ADMIN_USERNAME;
    let isValidPassword = false;
    if (hashedPassword && password) {
      try {
        isValidPassword = await bcrypt.compare(password, hashedPassword);
      } catch (e) {
        console.error('Password compare error:', e);
      }
    }
    
    if (verboseAuth) {
      console.log('✅ Username valid:', isValidUser);
      console.log('✅ Password valid (bcrypt):', isValidPassword);
    }
    
    if (!isValidUser || !isValidPassword) {
      if (verboseAuth) console.log('❌ Invalid credentials - Username:', isValidUser, 'Password:', isValidPassword);
      req.authAttempts.count++;
      req.authAttempts.lastAttempt = Date.now();
      authAttempts.set(req.clientIP, req.authAttempts);
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }
    
    if (verboseAuth) console.log('🎉 Authentication successful! Creating JWT token...');
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        user: username, 
        role: 'admin',
        iat: Date.now(),
        ip: req.clientIP 
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
    
    if (verboseAuth) console.log('🎯 JWT token created successfully');
    
    // Reset attempts on successful login
    authAttempts.delete(req.clientIP);
    
    if (verboseAuth) console.log('✨ Login complete - attempts reset');
    // Optional cookie-based auth (dual mode). Enable with COOKIE_AUTH=true
    if (process.env.COOKIE_AUTH === 'true') {
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.COOKIE_SECURE === 'true' || process.env.NODE_ENV === 'production',
        sameSite: process.env.COOKIE_SAMESITE || 'Strict',
        maxAge: 3600000,
        path: '/'
      });
    }
    res.json({ 
      success: true, 
      token: process.env.COOKIE_AUTH === 'true' ? undefined : token,
      expiresIn: 3600000,
      cookieAuth: process.env.COOKIE_AUTH === 'true',
      message: 'Authentication successful'
    });
    
  } catch (error) {
    console.error('Auth error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  }
});

// Token validation endpoint
app.post('/api/auth/verify', (req, res) => {
  try {
    let providedToken = req.body.token;
    if (!providedToken && req.cookies && req.cookies.auth_token) {
      providedToken = req.cookies.auth_token;
    }
    if (!providedToken) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const decoded = jwt.verify(providedToken, process.env.JWT_SECRET);
    if (process.env.SESSION_TIMEOUT && (Date.now() - decoded.iat > parseInt(process.env.SESSION_TIMEOUT))) {
      return res.status(401).json({ success: false, message: 'Session expired' });
    }
    res.json({ success: true, user: decoded.user, role: decoded.role, message: 'Token valid' });
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid token' });
  }
});

// Logout endpoint (token blacklist could be added here)
app.post('/api/auth/logout', (req, res) => {
  if (process.env.COOKIE_AUTH === 'true') {
    res.clearCookie('auth_token', { path: '/' });
  }
  res.json({ success: true, message: 'Logout successful' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler for unknown routes
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`🔒 Secure Auth Server running on port ${PORT}`);
  console.log(`🌐 Accepting requests from: ${process.env.CORS_ORIGIN}`);
  console.log(`🚀 Server ready! Test with: http://localhost:${PORT}/health`);
  
  // Keep server alive logging
  setInterval(() => {
    console.log(`💓 Server heartbeat - ${new Date().toLocaleTimeString()}`);
  }, 30000); // Log every 30 seconds
}).on('error', (err) => {
  console.error('❌ Server failed to start:', err);
  if (err.code === 'EADDRINUSE') {
    console.error(`🔴 Port ${PORT} is already in use!`);
    console.error('💡 Try a different port or stop the conflicting process.');
  }
  process.exit(1);
});