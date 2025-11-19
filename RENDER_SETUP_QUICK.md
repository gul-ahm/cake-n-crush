# 🚀 Render Setup - Quick Start

## Step-by-Step Guide (5 minutes)

### Step 1: Open Render Dashboard
- Go to: https://dashboard.render.com
- Log in to your account
- Select **cake-n-crush** service

### Step 2: Navigate to Settings
```
cake-n-crush (service page)
  ↓
Click "Settings" tab
  ↓
Scroll down to find "Secret Files"
```

### Step 3: Create .env File
1. Click **Add Secret File**
2. In "FILENAME" field, type: `.env`
3. In "CONTENTS" field, copy-paste this:

```
ADMIN_USERNAME=secure_admin_2024
ADMIN_PASSWORD=CakeNCrush#Secure!2025@Admin
JWT_SECRET=m4g1c35cr3t_jwt_key_32_chars_min123_extend_this_for_security_2025
INTERNAL_API_KEY=handshake_internalsc3cr3t_k3y_123456_make_this_very_secure_production
NODE_ENV=production
PORT=3001
SESSION_TIMEOUT=3600000
CORS_ORIGIN=https://cake-n-crush.onrender.com
COOKIE_AUTH=true
COOKIE_SECURE=true
COOKIE_SAMESITE=Strict
COOKIE_DOMAIN=.onrender.com
VERBOSE_AUTH_LOGS=false
```

### Step 4: Save and Deploy
1. Click **Save and Deploy**
2. Wait for green checkmark (5-10 minutes)
3. Go to: https://cake-n-crush.onrender.com/admin

### Step 5: Test Login
- Username: `secure_admin_2024`
- Password: `CakeNCrush#Secure!2025@Admin`
- You should now be able to log in! ✅

---

## Screenshot References

### Where to find Secret Files
```
Dashboard → cake-n-crush service → Settings → Secret Files → Add Secret File
```

### What to paste
```
FILENAME: .env

CONTENTS: [paste the environment variables above]
```

---

## If You Still Get Errors

### Check Render Logs
1. Go to service dashboard
2. Click **Logs** tab
3. Look for these messages:

✅ **Good Signs:**
- "🔑 Internal API key loaded"
- "🔐 Admin password hashed"
- "✅ Production server listening on port 3001"

🔴 **Bad Signs:**
- "INTERNAL_API_KEY missing"
- "ADMIN_PASSWORD missing"
- "Handshake error"

### Manual Redeploy
1. Go to **Settings**
2. Click **"Manual Deploy"** → **"Deploy latest commit"**
3. Wait for deployment to finish
4. Try admin login again

---

## Security Notes

🔒 **Next Steps (Optional but Recommended):**
1. Change ADMIN_PASSWORD to something only you know
2. Change JWT_SECRET to a random 32+ character string
3. Change INTERNAL_API_KEY to a random 32+ character string

Generate secure random strings:
```powershell
# PowerShell
$key = -join ((1..32) | ForEach-Object { [char](Get-Random -InputObject (33..126)) })
Write-Host $key
```

```bash
# Bash/Terminal
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Still Not Working?

1. ✅ Confirm .env file is added in Secret Files (not regular Environment variables)
2. ✅ Confirm NODE_ENV=production is set
3. ✅ Confirm all 4 keys are present: ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET, INTERNAL_API_KEY
4. ✅ Check Render logs for specific errors
5. ✅ Try manual redeploy

Contact support or check Render documentation: https://render.com/docs
