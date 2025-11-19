# Deployment Guide (Cake N Crush)

This guide shows multiple ways to publish the project using the unified production server (`server/index.js`). The unified server serves the built React `dist` folder and exposes the secure authentication API.

---
## 1. Required Environment Variables
Set these for ANY production method (do not commit values):

| Variable | Purpose | Example |
|----------|---------|---------|
| `ADMIN_USERNAME` | Admin login username | `secure_admin_2024` |
| `ADMIN_PASSWORD` | Admin login password (quoted if special chars) | `"CakeNCrush#Secure!2024@Admin"` |
| `JWT_SECRET` | JWT signing secret (>=32 chars random) | `CHANGE_ME_LONG_RANDOM` |
| `SESSION_TIMEOUT` | Session TTL in ms (should match token expiry) | `3600000` |
| `INTERNAL_API_KEY` | Handshake signing key (rotate periodically) | `INTERNAL_SUPER_SECRET_KEY` |
| `CORS_ORIGIN` | Origin allowed for browser requests | `https://your-domain.com` |
| `PORT` | Runtime port (container/VM). Leave blank on Render so the platform can inject the assigned port. | `3001` |
| `COOKIE_AUTH` (optional) | Enable HttpOnly cookie mode | `true` |
| `COOKIE_SECURE` (optional) | Force secure flag (true in prod) | `true` |
| `COOKIE_SAMESITE` (optional) | Cookie SameSite value | `Strict` |
| `VERBOSE_AUTH_LOGS` (optional) | Detailed auth logging | `false` |

---
## 2. Local Production Test (No Docker)

```powershell
# From repository root (PowerShell)
$env:ADMIN_USERNAME="secure_admin_2024"
$env:ADMIN_PASSWORD="CakeNCrush#Secure!2024@Admin"
$env:JWT_SECRET="CHANGE_ME_LONG_RANDOM"
$env:SESSION_TIMEOUT="3600000"
$env:INTERNAL_API_KEY="CHANGE_ME_INTERNAL_KEY"
$env:CORS_ORIGIN="http://localhost:3001"
$env:PORT="3001"
$env:COOKIE_AUTH="true"   # optional
npm run build:frontend
npm run start:prod
```
Visit: `http://localhost:3001/` (The SPA + API are served here)

---
## 3. Docker Build & Run

### Build Image
```powershell
docker build -t cake-n-crush:prod .
```

### Run Container
```powershell
docker run -d --name cnc -p 3001:3001 `
  -e ADMIN_USERNAME=secure_admin_2024 `
  -e ADMIN_PASSWORD="CakeNCrush#Secure!2024@Admin" `
  -e JWT_SECRET=CHANGE_ME_LONG_RANDOM `
  -e SESSION_TIMEOUT=3600000 `
  -e INTERNAL_API_KEY=CHANGE_ME_INTERNAL_KEY `
  -e CORS_ORIGIN=https://your-domain.com `
  -e COOKIE_AUTH=true `
  cake-n-crush:prod
```

### Push to Registry (Example: Docker Hub)
```powershell
docker tag cake-n-crush:prod your_dockerhub_username/cake-n-crush:prod
docker push your_dockerhub_username/cake-n-crush:prod
```
Deploy pulled image similarly on VPS / platform.

---
## 4. Render / Railway / Heroku Style Deployment

| Setting | Value |
|---------|-------|
| Build Command | `npm run build:frontend` |
| Start Command | `npm run start:prod` |
| Node Version | 20.x (matches Dockerfile) |

Add all environment variables in dashboard, pointing origins to `https://cake-n-crush.onrender.com`. Ensure `COOKIE_AUTH=true`, `VERBOSE_AUTH_LOGS=false`, and set a strong `JWT_SECRET` & `INTERNAL_API_KEY` (the handshake only works when that key is present).

### Local Development Quickstart
For local dev, prefer `.env.example.local` (copy to `.env`). Key points:
- `CORS_ORIGIN=http://localhost:5173`
- `VITE_ADMIN_API_ENDPOINT=http://localhost:3001/api/auth`
- `COOKIE_SECURE=false` (no TLS locally)
- `COOKIE_DOMAIN=` (blank)
- If port 3001 is busy, set `PORT=3002`

Dev-only fallbacks in unified server:
- When `NODE_ENV !== 'production'` and `INTERNAL_API_KEY` is missing, an ephemeral handshake key is generated.
- When `NODE_ENV !== 'production'` and `ADMIN_PASSWORD` is missing, a DEV fallback password `admin` is used (warning logged). These never apply in production.

### Health Check
Configure a health check URL: `/health` returns JSON `{ status: 'ok' }`.

---
## 5. NGINX Reverse Proxy (SSL Termination)

Example (map public domain to Node server):
```nginx
server {
  server_name your-domain.com;
  location / {
    proxy_pass http://127.0.0.1:3001/;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }
  listen 443 ssl;  # configure certificates
}
```
Add an HTTP->HTTPS redirect server block.

---
## 6. Secret Management & Rotation

1. Store secrets in platform env vars or secret manager (Azure Key Vault, AWS Secrets Manager, GCP Secret Manager).
2. Rotate `INTERNAL_API_KEY` monthly (invalidates outstanding handshakes automatically).
3. Rotate `JWT_SECRET` using dual-secret strategy (accept old for grace period, short overlap window).
4. Never bake secrets into the image or commit them.

---
## 7. Security Checklist Before Publishing

- [ ] Replace all default secrets (`JWT_SECRET`, `INTERNAL_API_KEY`, password if still default).
- [ ] Enable HTTPS (proxy or platform).
- [ ] Set `NODE_ENV=production`.
- [ ] Enable `COOKIE_AUTH=true` (cookie-based JWT).
- [ ] Disable verbose auth logs (`VERBOSE_AUTH_LOGS=false`).
- [ ] Confirm CSP header present (default loaded in server code).
- [ ] Run `npm audit --production` and patch critical issues.
- [ ] Confirm admin route environment variable `VITE_ACCESS_ROUTE` in frontend build.
- [ ] Optional: Add Web Application Firewall / CDN (Cloudflare) for DDoS mitigation.

---
## 8. Logs & Monitoring

Add one or more:
- Structured logging (e.g., pino) forwarded to log aggregator.
- Uptime monitoring (Pingdom, Healthchecks.io) hitting `/health`.
- Alerting for repeated auth failures (threshold metric).

---
## 9. Common Deployment Pitfalls

| Issue | Cause | Fix |
|-------|-------|-----|
| 404 on refresh | Missing SPA fallback | Use `index.js` unified server; ensure `dist/index.html` served for `*` |
| CORS errors | Wrong `CORS_ORIGIN` value | Set exact origin (scheme + domain + port) |
| Handshake unavailable | Missing `INTERNAL_API_KEY` | Set variable and restart container/server |
| Cookie not set | `COOKIE_AUTH` false or HTTPS missing | Enable `COOKIE_AUTH` & use HTTPS (Secure flag) |
| Infinite login loop | Token not stored & cookie mode off | Ensure cookie mode on OR fallback token logic present (already implemented) |

---
## 10. Quick Smoke Test (Production)
After deploy:
```bash
curl https://your-domain.com/health
curl https://your-domain.com/api/auth/handshake
# Acquire handshake value then:
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"secure_admin_2024","password":"CakeNCrush#Secure!2024@Admin","handshake":"<token>"}'
```
Expect JSON success & `Set-Cookie` header when `COOKIE_AUTH=true`.

---
## 11. Build Artifacts
- Frontend build output: `dist/`
- Runtime entry: `server/index.js`
- Docker: multi-stage produces small runtime layer.

---
## 12. Rollback Strategy
1. Keep previous image tagged (e.g., `prod-prev`).
2. In failure: redeploy previous tag quickly.
3. Maintain versioned env backups (secret manager versions).

---
## 13. Scaling
- Horizontal: run multiple containers behind load balancer (stateless auth cookie/JWT).
- Use Redis for shared rate limiting / token blacklist if needed.
- Add CDN for static assets (serve `/dist` via CDN, API via origin).

---
## 14. MFA & Future Enhancements
Add second factor (TOTP) by introducing `/api/auth/mfa/init` & `/api/auth/mfa/verify` endpoints, storing per-user secret server-side only.

---
**Ready to publish.** Choose your path (Docker, Render, Railway, or manual VM) and apply variables securely.

---
## 15. Automated CI/CD (GitHub Actions)

Add workflow file: `.github/workflows/publish.yml` (already created) which:
- Builds multi-stage Docker image.
- Tags image with branch, tag, commit SHA, and `latest` for `main`.
- Pushes to Docker Hub.

### Required GitHub Secrets
| Secret | Purpose |
|--------|---------|
| `DOCKERHUB_USERNAME` | Docker Hub account name |
| `DOCKERHUB_TOKEN` | Personal access token or password |

### Configure
1. Commit code to `main` or create tag `v1.0.0`.
2. Workflow runs automatically, publishing image `docker.io/<username>/cake-n-crush:<tag>`.
3. Pull and run on server:
```bash
docker pull <username>/cake-n-crush:latest
docker run -d --name cnc -p 3001:3001 \
  -e ADMIN_USERNAME=secure_admin_2024 \
  -e ADMIN_PASSWORD="<PROD_PASSWORD>" \
  -e JWT_SECRET="<LONG_RANDOM_SECRET>" \
  -e SESSION_TIMEOUT=3600000 \
  -e INTERNAL_API_KEY="<LONG_INTERNAL_KEY>" \
  -e CORS_ORIGIN="https://your-domain.com" \
  -e COOKIE_AUTH=true \
  <username>/cake-n-crush:latest
```

---
## 16. Manual Docker Publish (If Not Using CI)
```bash
docker login -u <username>
docker build -t <username>/cake-n-crush:latest .
docker push <username>/cake-n-crush:latest
```

Tag semantic versions:
```bash
docker tag <username>/cake-n-crush:latest <username>/cake-n-crush:v1.0.0
docker push <username>/cake-n-crush:v1.0.0
```

---
## 17. Render Deployment Quick Steps
1. Create new Web Service from repo.
2. Build Command: `npm run build:frontend`
3. Start Command: `npm run start:prod`
4. Add env vars from `.env.example.prod` (copy & fill).
5. Enable Auto-Deploy on `main` branch.
6. Confirm health at `/health`.

---
## 18. Railway Deployment Quick Steps
1. New project → Deploy from GitHub.
2. Add env vars (paste from template).
3. Set Start Command `npm run start:prod`.
4. Optional: Add domain + SSL (automatic).

---
## 19. Minimal VPS Checklist
```bash
# Server provisioning (Ubuntu example)
sudo apt update && sudo apt install -y docker.io
sudo usermod -aG docker $USER
logout # then log back in
docker login -u <username>
docker pull <username>/cake-n-crush:latest
docker run -d --name cnc -p 3001:3001 --restart=always \
  -e ADMIN_USERNAME=secure_admin_2024 \
  -e ADMIN_PASSWORD="<PROD_PASSWORD>" \
  -e JWT_SECRET="<LONG_RANDOM_SECRET>" \
  -e SESSION_TIMEOUT=3600000 \
  -e INTERNAL_API_KEY="<LONG_INTERNAL_KEY>" \
  -e CORS_ORIGIN="https://your-domain.com" \
  -e COOKIE_AUTH=true \
  <username>/cake-n-crush:latest
```
Add NGINX reverse proxy + SSL (Certbot) pointing to port 3001.

---
## 20. Promotion Flow
1. Merge feature branches → `main`.
2. Tag release: `git tag v1.1.0 && git push --tags`.
3. CI publishes new version automatically.
4. Pull updated tag in production or rely on auto-deploy (Render/Railway).

---
## 21. Rollback (CI Images)
```bash
docker pull <username>/cake-n-crush:v1.0.0
docker stop cnc && docker rm cnc
docker run -d --name cnc -p 3001:3001 <username>/cake-n-crush:v1.0.0
```

---
## 22. Post-Publish Verification Script
```bash
#!/usr/bin/env bash
set -e
BASE="https://your-domain.com"
curl -fsS "$BASE/health" | jq .
HS=$(curl -fsS "$BASE/api/auth/handshake" | jq -r .handshake)
echo "Handshake: $HS"
LOGIN=$(curl -fsS -X POST "$BASE/api/auth/login" -H 'Content-Type: application/json' \
  -d "{\"username\":\"secure_admin_2024\",\"password\":\"REDACTED\",\"handshake\":\"$HS\"}")
echo "$LOGIN" | jq .status
```

---
## 23. Next Hardening Targets
- Add MFA endpoint flow.
- Integrate Redis for distributed rate limiting.
- Implement structured logging + log shipper.
- Add automated secret rotation pipeline.
- Enable Web Application Firewall (Cloudflare rules).

