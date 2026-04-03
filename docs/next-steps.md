# Shortcuts in this codebase

These choices keep the assignment small and reviewable; they are not implied limits of the domain.

| Area | What we did |
|------|----------------|
| Auth | Laravel Sanctum **personal access tokens** (Bearer); SPA stores token in `localStorage`. |
| API server | `php artisan serve` in Docker for dev only; production should use PHP-FPM/nginx (see [deploy-runbook](deploy-runbook.md)). |
| Frontend | Vite dev server in Docker; production is static files after `npm run build`. |
| Payments | Checkout creates a completed order and decrements stock; no payment gateway. |
| Images | Text catalog only; no asset pipeline for product photos. |
| Email | No transactional mail. |

## If scope were extended

Aligned with `plan.md` **With more time**:

- Payment provider (e.g. Stripe) with idempotent checkout and webhooks.
- Refunds, partial shipments, order states beyond `completed`.
- Inventory reservations, low-stock alerts, admin dashboard.
- Search (DB full-text or Meilisearch/Algolia), filters, categories.
- Image uploads (S3-compatible storage) and CDN.
- Stricter rate limits, audit logs, separate supplier subdomain.
- E2E tests (Playwright/Cypress) and broader CI (security audit, dependency updates).

CI today: `.github/workflows/ci.yml` (Compose validation, Pint, PHPUnit, ESLint, Vite build).
