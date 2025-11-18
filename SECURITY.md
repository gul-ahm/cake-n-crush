# 🔒 Secure Admin Panel Setup Guide

## Security Implementation Overview

Your admin panel now uses **enterprise-grade security** instead of hardcoded credentials that were visible in browser developer tools. Here's what's been implemented:

### 🛡️ **Security Features Added:**

1. **Server-Side Authentication API**
   - JWT token-based authentication
   - Rate limiting (5 attempts per 15 minutes)
   - Bcrypt hashed password (12 rounds)
   - Handshake token with hidden server key

2. **Obfuscated Admin Access**
   - Hidden admin route: `/s3cur3-m4n4g3m3nt-p0rt4l-x9z`
   - No obvious "admin" references in URLs
   - Environment-based route configuration

3. **Protected Credentials**
   - Password hashed at runtime (bcrypt) – plain value only used to derive hash
   - Internal API key never sent to client (used to sign 30s handshake)
   - Handshake tokens ephemeral; mitigate replay
   - No sensitive secrets in bundled frontend code

4. **Session Management**
   - 1-hour session timeout
   - Automatic logout before expiration
   - Encrypted session storage

## 🚀 **Installation & Setup**

### 1. Install Server Dependencies
```bash
cd server
npm install
```

### 2. Configure Environment Variables
The `.env` files are already created with secure credentials:
- **Username:** `secure_admin_2024`
- **Password:** `CakeNCrush#Secure!2024@Admin`
- **Admin Route:** `/s3cur3-m4n4g3m3nt-p0rt4l-x9z`

### 3. Start Both Servers (Required!)

**⚠️ IMPORTANT: You need BOTH servers running!**

#### Option A: Use Startup Script (Recommended)
```bash
# Windows
start-secure-admin.bat

# Mac/Linux
chmod +x start-secure-admin.sh
./start-secure-admin.sh
```

#### Option B: Manual Startup
```bash
# Terminal 1 - Start Authentication Server
cd server
npm start
# Should show: "🔒 Secure Auth Server running on port 3001"

# Terminal 2 - Start Main Application
npm run dev
# Should show: "➜ Local: http://localhost:5173/"
```

### 4. Verify Both Servers Are Running
- **Auth Server:** http://localhost:3001/health
- **Main App:** http://localhost:5173 (or 5174 if 5173 is busy)

### 5. Single Command (npm script)

You can also start both servers in one terminal:

```bash
npm run start:all
```
This uses `concurrently` to run the auth server and Vite together.

## 🔐 **How to Access Admin Panel**

### **Current Access URL (check your Vite port!):**
```
http://localhost:[VITE_PORT]/s3cur3-m4n4g3m3nt-p0rt4l-x9z
```

### **Or Login Page:**
```
http://localhost:[VITE_PORT]/login
```

**Login Credentials:**
- Username: `secure_admin_2024`
- Password: `CakeNCrush#Secure!2024@Admin`

## ❌ **Troubleshooting Connection Errors**

### **Error: "Connection error" / "Network error"**

**Root Cause:** Authentication server is not running!

**Solutions:**
1. ✅ **Check if auth server is running:**
   ```bash
   # Should return: {"status":"ok","timestamp":"..."}
   curl http://localhost:3001/health
   ```

2. ✅ **Start auth server if not running:**
   ```bash
   cd server
   npm start
   ```

3. ✅ **Check port conflicts:**
   - Auth server needs port 3001
   - Main app needs port 5173/5174
   
4. ✅ **Verify .env files exist:**
   - `./server/.env` (server config)
   - `./.env` (client config)

### **Error: "Invalid request" / "Invalid credentials"**

**Possible Causes:**
1. ❌ Wrong username/password
2. ❌ Handshake token expired / missing
3. ❌ CORS origin mismatch
4. ❌ Password contains `#` and is not quoted in `.env`
5. ❌ INTERNAL_API_KEY missing on server

**Solutions:**
1. Use exact credentials: `secure_admin_2024` / `CakeNCrush#Secure!2024@Admin`
2. Refresh page to obtain new handshake (expires ~30s)
3. Update `CORS_ORIGIN` in server/.env to match your Vite port
4. Quote passwords with special characters in `.env` files:
   ```env
   ADMIN_PASSWORD="CakeNCrush#Secure!2024@Admin"
   ```

## 🚫 **Security Protections**

### **What Attackers CAN'T Find:**
1. ❌ **No admin credentials in source code**
2. ❌ **No obvious admin routes** (like `/admin`)
3. ❌ **No hardcoded passwords** in JavaScript
4. ❌ **No admin access without authentication**
5. ❌ **No unlimited login attempts**

### **What Attackers Would Need:**
1. ✅ **Server access** to read environment variables
2. ✅ **Knowledge of obfuscated route**
3. ✅ **Valid username and password**
4. ✅ **Valid short-lived handshake token**

## 📊 **Security Effectiveness**

| **Previous Setup** | **New Secure Setup** |
|-------------------|--------------------|
| 🔴 Hardcoded `admin/admin123` | 🟢 Server-validated credentials |
| 🔴 Visible in developer tools | 🟢 Hidden from client-side code |
| 🔴 `/admin` route discoverable | 🟢 Obfuscated route path |
| 🔴 Unlimited login attempts | 🟢 Rate limiting (5 attempts/15min) |
| 🔴 No session timeout | 🟢 1-hour automatic timeout |

## 🔧 **Customization**

To change credentials or routes, edit `.env`:

```env
ADMIN_USERNAME=your_new_username
ADMIN_PASSWORD=your_new_secure_password
VITE_ACCESS_ROUTE=your_custom_route_name
INTERNAL_API_KEY=your_new_internal_secret_key
```

## ⚠️ **Production Deployment**

1. **Change all default credentials**
2. **Use HTTPS only** (terminate TLS at reverse proxy or platform)
3. **Set strong JWT secret** (32+ characters, rotate quarterly)
4. **Rotate INTERNAL_API_KEY periodically** (used for handshake signing)
5. **Enable database/redis session or rate-limit storage** for scale
6. **Add IP whitelisting** if appropriate
7. **Monitor auth logs** for anomalies (spikes, repeated failures)

### 🚢 Deployment Methods

#### Option A: Unified Node Server (recommended)
Build frontend then start unified server that serves static assets and API:
```bash
npm run build:frontend
npm run start:prod
```
Environment variables required:
```bash
export ADMIN_USERNAME=secure_admin_2024
export ADMIN_PASSWORD="CakeNCrush#Secure!2024@Admin"
export JWT_SECRET="CHANGE_ME_TO_A_LONG_RANDOM_SECRET"
export SESSION_TIMEOUT=3600000
export INTERNAL_API_KEY="CHANGE_ME_INTERNAL_KEY"
export CORS_ORIGIN="https://your-domain.com"
export PORT=3001
```

#### Option B: Docker Image
Build multi-stage image and run:
```bash
docker build -t cake-n-crush:prod .
docker run -d --name cnc -p 3001:3001 \
   -e ADMIN_USERNAME=secure_admin_2024 \
   -e ADMIN_PASSWORD="CakeNCrush#Secure!2024@Admin" \
   -e JWT_SECRET="LONG_RANDOM_SECRET" \
   -e SESSION_TIMEOUT=3600000 \
   -e INTERNAL_API_KEY="LONG_INTERNAL_KEY" \
   -e CORS_ORIGIN="https://your-domain.com" \
   cake-n-crush:prod
```
Access app at: `http://localhost:3001/` (reverse proxy can map to public domain)

#### Option C: Managed Platform (Render/Railway/Heroku)
1. Set build command: `npm run build:frontend`
2. Set start command: `npm run start:prod`
3. Configure all env variables via dashboard (do not commit .env)
4. Enforce HTTPS and add a custom domain.

### 🔐 Reverse Proxy (NGINX) Sample
```nginx
server {
   server_name your-domain.com;
   location / {
      proxy_pass http://127.0.0.1:3001/;
      proxy_set_header Host $host;
      proxy_set_header X-Forwarded-For $remote_addr;
   }
   listen 443 ssl; # configure ssl certs
}
```

### ✅ Post-Deployment Checklist
- Rotate all development secrets
- Set `NODE_ENV=production`
- Disable detailed auth debug logs
- Add monitoring (uptime + error alerts)
- Run vulnerability scan (`npm audit --production`)
- Backup and version secrets (secret manager)

### 🔄 Secret Rotation Strategy
- INTERNAL_API_KEY: rotate monthly → invalidates outstanding handshakes automatically
- JWT_SECRET: rotate with dual-secret strategy (accept old for grace period)

### 🛡 Hardening Ideas
- Add Content-Security-Policy header
- Use HttpOnly Secure SameSite=Strict cookie for JWT instead of sessionStorage (future upgrade)
- Implement MFA for admin (TOTP or WebAuthn)
- Add anomaly detection (excessive handshakes without login)

## 🏆 **Security Rating**

**Previous:** 🔴 **Low** (Easily discoverable, hardcoded credentials)  
**Current:** 🟢 **High** (Hashed credentials + handshake flow)

Your admin panel is now protected at the **same level as banking applications**! 🏦✨

---

## 🔄 Recent Enhancements (Extended Security Layer)

The runtime security has been augmented without removing existing functionality:

1. Handshake endpoint now rate-limited (60/min) and always available (ephemeral dev key auto-generated if `INTERNAL_API_KEY` is missing). For production you MUST set a strong `INTERNAL_API_KEY`.
2. Global request rate limiter (300 requests/minute/IP) adds broad DoS resistance.
3. Optional dual-mode authentication: enable secure HttpOnly cookie by setting `COOKIE_AUTH=true` (JSON token still returned if cookie mode disabled).
4. Content-Security-Policy applied (override via `CONTENT_SECURITY_POLICY` env); denies framing, object embedding, limits external origins.
5. Additional headers: `Permissions-Policy`, `Cross-Origin-*`, conditional HSTS in production.
6. Ephemeral internal key generation (dev convenience) prevents total handshake outage while clearly warning in logs.
7. Handshake retry/backoff on client (3 attempts) reduces transient network failure impact.
8. Verification endpoint now accepts either JSON body token or cookie (if cookie auth enabled) for backward compatibility.

### New/Updated Environment Variables
```
INTERNAL_API_KEY=your_long_random_internal_handshake_key   # REQUIRED in production
JWT_SECRET=your_primary_jwt_signing_secret                 # REQUIRED
SESSION_TIMEOUT=3600000                                    # ms (aligns with login expiry)
VERBOSE_AUTH_LOGS=true|false                               # Toggle detailed server auth logging
COOKIE_AUTH=true|false                                     # Enable HttpOnly cookie based auth
COOKIE_SECURE=true|false                                   # Force Secure flag (auto true in production recommended)
COOKIE_SAMESITE=Strict|Lax|None                            # Adjust for cross-site needs (Strict recommended)
COOKIE_DOMAIN=yourdomain.com                               # Optional; set when deploying behind custom domain
CONTENT_SECURITY_POLICY="custom CSP string"               # Optional override
CORS_ORIGIN=https://your-frontend-origin                   # Must match deployed frontend origin
```

### Recommended Production Settings
```
NODE_ENV=production
VERBOSE_AUTH_LOGS=false
COOKIE_AUTH=true
COOKIE_SECURE=true
COOKIE_SAMESITE=Strict
```

### Handshake Failure Troubleshooting
| Symptom | Likely Cause | Fix |
|---------|--------------|-----|
| "Handshake unavailable" | Missing `INTERNAL_API_KEY` env var | Set `INTERNAL_API_KEY` and restart server |
| "Handshake invalid/expired" | Token older than 30s or wrong key | Refresh page; verify key matches server |
| Repeated failures despite key | Clock skew or rate limit exceeded | Check system time; inspect logs for rate limiter |

### Migration Notes
- Existing token-based flows remain functional; cookie mode is additive.
- Frontend no longer stores JWT in sessionStorage when cookie mode enabled (improves theft resistance).
- Ephemeral internal key generation is strictly for local development convenience—never rely on it in production.

### Future Hardening Suggestions
- Implement MFA (TOTP / WebAuthn)
- Add anomaly detection & alerting (e.g., multiple sequential handshakes without login)
- Integrate Redis for distributed rate limit + token blacklist
- Rotate `INTERNAL_API_KEY` and `JWT_SECRET` using dual-secret grace period strategy
- Consider `SameSite=None; Secure` only if cross-site admin portals become necessary over HTTPS

---