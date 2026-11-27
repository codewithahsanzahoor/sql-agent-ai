# Progress Log

## Current Status
- **Active Phase:** Phase 3 (Polish & Observability)
- **Last Completed:** Phase 2 hardening — rate limiting, input validation, SQL hardening, and demo UI feedback.

## Recent Changes & Files
- `lib/rate-limit.ts`: Turso-backed fixed-window rate limiter (2 req/min, 5 req/hour per IP) using atomic `INSERT ... ON CONFLICT` upserts on the `rate_limits` table. Fails open with logged errors so Turso hiccups don't break chat.
- `db/schema.ts` + `db/migrations/0001_clear_meltdown.sql`: New `rate_limits(key, window_start, count)` table (migration applied to Turso).
- `db/reset.ts`: Also drops `rate_limits`.
- `app/api/chat/route.ts`: `zod` body validation, 500-char last-user-message cap (400), IP-based rate limit (429 + `Retry-After`), stricter read-only SQL checks (`;` and write-keyword blocking), `onError` stream logging, try/catch 500 fallback.
- `app/page.tsx`: Demo badge ("Recruiter Live Demo • 5 free messages per hour"), `maxLength={500}` + char counter, clickable sample prompts, error banner with polite rate-limit message and dismiss.

## Verification
- `pnpm db:generate` + `pnpm db:migrate` — applied successfully.
- `pnpm lint` — clean (1 pre-existing warning in `db/seed.ts`).
- `pnpm build` — passes typecheck and production build.
- Rate limiter smoke-tested against Turso: correctly allows 2/min and blocks with `retryAfterSeconds`.

## Next Step
- Phase 3: Update `app/layout.tsx` metadata (title/description), then final `pnpm lint` + `pnpm build` before pushing.
