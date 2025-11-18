# Cake N Crush — Bakery Portfolio

A visually rich, animated bakery portfolio for Chef Tamanna Arzoo with admin-only image management, WhatsApp ordering, social media integration, and animated geolocation.

## Tech Stack
- React 18 + Vite
- Tailwind CSS
- Framer Motion + GSAP
- React Router
- LocalStorage (portfolio data)
- JWT-like client auth (30-min expiry)

## Quickstart

1. Copy `.env.sample` to `.env` and adjust values.
2. Install and run:

```powershell
npm install
npm run dev
```

Build and preview:

```powershell
npm run build
npm run preview
```

## Features
- Admin panel at `/admin` (env-configurable credentials)
- Dashboard `/admin/dashboard` with stats, upload, and portfolio grid
- Upload multiple images with preview; client-side WebP optimization
- Portfolio with WhatsApp ordering buttons and prefilled messages
- Animated geolocation page with Google Maps directions
- Social media links with subtle animations

## Notes
- This implementation uses LocalStorage for simplicity (no backend).
- Tokens are signed on the client using Web Crypto and a secret from env; do not consider this production-grade security.
- Image optimization uses OffscreenCanvas. In older browsers, you may need a fallback.

## Scripts
- `npm run dev` — Start dev server
- `npm run build` — Production build
- `npm run preview` — Preview production build

## Environment
See `.env.sample` for variables (admin credentials, JWT secret, WhatsApp number, shop coordinates).