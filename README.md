# Multi-supplier e-commerce (demo)

Laravel API (Sanctum), MySQL, and a React (Vite) storefront. **Customers** browse the catalog, use a cart, check out, and view order history. **Suppliers** manage their products and see sales line items with buyer details.

---

## Quick start (Docker)

**Prerequisites:** Docker with Compose v2.

From the repository root:

```bash
docker compose up --build
```

Wait until the backend health check passes (first boot runs `composer install`, `php artisan key:generate` if needed, and `php artisan migrate`).

| Service  | URL / port |
|----------|------------|
| Frontend | [http://localhost:5173](http://localhost:5173) |
| API      | [http://localhost:8000](http://localhost:8000) — e.g. `GET /api/health` |
| MySQL    | Host `127.0.0.1`, port **3307** (mapped from the container), database `ecommerce`, user `ecommerce` / password `ecommerce` |

Register as **customer** or **supplier**, then use the nav links for the role-specific flows.

---

## Environment variables

### Docker Compose (`docker-compose.yml`)

Values below are the ones defined for this repo; adjust if you change ports or database names.

**MySQL**

- `MYSQL_DATABASE`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_PASSWORD`

**Backend container**

- `APP_ENV`, `APP_DEBUG`, `APP_URL` — API base URL as seen by the browser (here `http://localhost:8000`).
- `FRONTEND_URL` — Vite dev origin for Sanctum / session-related config (`http://localhost:5173`).
- `CORS_ALLOWED_ORIGINS` — Must include the SPA origin (comma-separated if you add more).
- `DB_*` — Points at the `mysql` service (`DB_HOST=mysql`, `DB_PORT=3306` inside the network).

**Frontend container**

- `VITE_API_URL` — Base URL for API calls from the **browser** (not `host.docker.internal` unless that is what you use). With the default compose file use `http://localhost:8000` so `fetch` hits the published API port on the host.
- `CHOKIDAR_USEPOLLING` — Set to `true` in Docker so Vite file watching works reliably on some hosts.

### Backend file env (`backend/.env`)

On first container start, `backend/docker-entrypoint.sh` copies `backend/.env.example` to `backend/.env` if missing, then ensures `APP_KEY` and runs migrations.

For **local PHP without Docker**, copy `backend/.env.example` to `backend/.env`, set `APP_KEY` (`php artisan key:generate`), and configure MySQL — e.g. `DB_HOST=127.0.0.1`, `DB_PORT=3307` if MySQL is only the compose service published on 3307. Match `FRONTEND_URL` and `CORS_ALLOWED_ORIGINS` to your Vite URL.

### Frontend (`frontend/.env` or `.env.local`)

Copy `frontend/.env.example`. The important variable is:

- **`VITE_API_URL`** — Laravel API base (no trailing slash), e.g. `http://127.0.0.1:8000` or `http://localhost:8000`.

Rebuild or restart the Vite dev server after changing any `VITE_*` variable.

---

## Running without Docker (outline)

1. MySQL 8 with database `ecommerce` and a user (or use only the `mysql` service from Compose).
2. In `backend/`: `composer install`, `.env` as above, `php artisan migrate`, `php artisan serve` (default `http://127.0.0.1:8000`).
3. In `frontend/`: `npm ci`, set `VITE_API_URL`, `npm run dev`.

---

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on pushes and PRs to `main`, `master`, and `dev`:

- **Docker Compose** — `docker compose … config` (validates the file).
- **Backend** — `composer install`, Laravel Pint (`composer run lint`), `php artisan test` (SQLite in-memory per `phpunit.xml`).
- **Frontend** — `npm ci`, `npm run lint`, `npm run build`.

---

## Deployment (production)

This repo’s `docker-compose.yml` is for **local development**. For a production-style checklist (env vars, `composer install --no-dev`, static frontend build, web root), see **[docs/deploy-runbook.md](docs/deploy-runbook.md)**.

---

## Shortcuts & possible extensions

What was intentionally kept small—which APIs and flows are in scope, and sensible next iterations—is summarized in **[docs/next-steps.md](docs/next-steps.md)** (and in `plan.md` under **With More Time**).

---

## Tests (backend)

PHPUnit uses `backend/.env.testing` when `APP_ENV=testing`, so **CI and clones without a `.env` file** still get a valid `APP_KEY` and no missing-file warnings.

```bash
cd backend
composer run test
```

---

## GitHub access (reviewers)

Add these GitHub users as collaborators with read (or appropriate) access so they can review the repository:

- **[@turculaurentiu91](https://github.com/turculaurentiu91)**
- **[@gumacs92](https://github.com/gumacs92)**

In the repo: **Settings → Collaborators** (personal repo) or invite via your organization’s access controls.

---
