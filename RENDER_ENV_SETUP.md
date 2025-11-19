# Render Environment Setup Guide

## Problem
The admin panel shows "Handshake unavailable" error because environment variables are not set in Render.

## Solution: Add Environment Variables to Render

### Option 1: Using Render Dashboard (Recommended)

1. Go to **Render Dashboard**: https://dashboard.render.com
2. Select your service: **cake-n-crush**
3. Go to **Settings** tab (bottom left)
4. Scroll to **Secret Files** section
5. Click **Add Secret File**
6. Set filename: `.env`
7. Copy-paste the contents from `.env.render` file
8. Click **Save and Deploy**

### Option 2: Using Environment Variables (Alternative)

1. Go to **Render Dashboard**: https://dashboard.render.com
2. Select: **cake-n-crush** service
3. Go to **Settings** → **Environment**
4. Add each variable individually:

| Key | Value |
|-----|-------|
| `NODE_ENV` | `production` |
| `ADMIN_USERNAME` | `secure_admin_2024` |
| `ADMIN_PASSWORD` | `CakeNCrush#Secure!2025@Admin` |
| `JWT_SECRET` | `m4g1c35cr3t_jwt_key_32_chars_min123_extend_this_for_security_2025` |
| `INTERNAL_API_KEY` | `handshake_internalsc3cr3t_k3y_123456_make_this_very_secure_production` |
| `CORS_ORIGIN` | `https://cake-n-crush.onrender.com` |
| `COOKIE_SECURE` | `true` |
| `COOKIE_SAMESITE` | `Strict` |
| `COOKIE_DOMAIN` | `.onrender.com` |
| `VERBOSE_AUTH_LOGS` | `false` |

5. Click **Save and Deploy**

### Important Notes

⚠️ **Change These Values in Production:**
- `ADMIN_PASSWORD` - Use a stronger, unique password
- `JWT_SECRET` - Generate a random 32+ character string
- `INTERNAL_API_KEY` - Generate a random 32+ character string

🔒 **Generate Secure Keys:**
```bash
# On your local machine (PowerShell):
$key = -join ((1..32) | ForEach-Object { [char](Get-Random -InputObject (33..126)) })
Write-Host $key

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### After Setting Environment Variables

1. Render will **automatically restart** your service
2. Wait for deployment to complete (watch the Logs)
3. Once deployed, try accessing the admin panel
4. You should now see a proper login form (no handshake error)

### Testing the Fix

1. Go to: https://cake-n-crush.onrender.com/admin
2. You should see the login form without errors
3. Enter credentials:
   - Username: `secure_admin_2024`
   - Password: `CakeNCrush#Secure!2025@Admin`
4. If login fails, set `VERBOSE_AUTH_LOGS=true` and check logs

### Troubleshooting

If you still see errors:
1. Check **Logs** in Render dashboard
2. Look for messages like:
   - "Internal API key loaded" ✅ (good)
   - "INTERNAL_API_KEY missing" ⚠️ (bad - env var not set)
   - "Handshake error" 🔴 (check JWT_SECRET and INTERNAL_API_KEY)

### Reset Instructions

If something goes wrong:
1. Go to Render dashboard
2. **Settings** → **Environment** 
3. Delete the problematic variables
4. Revert `.env` file to default values
5. Redeploy
