# Deployment runbook

Lean checklist for taking this repo from **local Docker** to a **production** API + static SPA. Adapt hostnames and secrets to your platform (VPS, Railway, Fly.io, AWS, etc.).

## 1. Database

- Provision **MySQL 8** (managed or self-hosted).
- Create database and user; note host, port, name, user, password.

## 2. Laravel API

1. Code on the server (git clone, artifact, or container image).
2. Copy `backend/.env.example` → `backend/.env` and set at minimum:

   | Variable | Production notes |
   |----------|------------------|
   | `APP_ENV` | `production` |
   | `APP_DEBUG` | `false` |
   | `APP_KEY` | `php artisan key:generate` (once) |
   | `APP_URL` | Public HTTPS URL of the API (e.g. `https://api.example.com`) |
   | `FRONTEND_URL` | Public HTTPS URL of the SPA (e.g. `https://shop.example.com`) |
   | `CORS_ALLOWED_ORIGINS` | Same as SPA origin(s), comma-separated if several |
   | `DB_*` | Match your MySQL |
   | `LOG_CHANNEL` / `LOG_LEVEL` | Prefer `stderr` or a managed log stack on PaaS |

3. Install and optimize:

   ```bash
   cd backend
   composer install --no-dev --optimize-autoloader --no-interaction
   php artisan migrate --force
   php artisan config:cache
   php artisan route:cache
   ```

4. **Web server** must point the vhost to `backend/public/` (not the repo root). Use PHP-FPM; `php artisan serve` is **not** for production.

5. Verify `GET {APP_URL}/api/health` returns JSON `status: ok`.

## 3. React SPA

The app reads **`VITE_API_URL` at build time** (`frontend/src/api.js`). It must be the browser-reachable API URL (usually your production `APP_URL`, no trailing slash).

```bash
cd frontend
npm ci
VITE_API_URL=https://api.example.com npm run build
```

Upload `frontend/dist/` to static hosting (S3+CloudFront, Netlify, Vercel `dist`, nginx `root`, etc.). Ensure the SPA’s public URL matches `FRONTEND_URL` and is listed in `CORS_ALLOWED_ORIGINS`.

## 4. Smoke test

- Open the SPA, register/login, hit catalog and (if customer) cart/checkout.
- Confirm supplier flows against the same API if you use two roles.

## 5. Rollback

- Keep previous `dist/` and prior release tag; revert web root to previous build.
- DB: restore snapshot or run down migrations only if you Version migrations carefully (prefer forward fixes in production).

---

*Docker Compose in this repo targets **local development** (MySQL + `php artisan serve` + Vite). For production, prefer a real app server, managed DB, and a static build of the frontend.*
