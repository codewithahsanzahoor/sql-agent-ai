<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project Map & Agent Instructions (`sql-agent`)

## 1. Tech Stack
- **Frontend & API:** Next.js 16.4.6 (App Router), React 19.3.0, TypeScript, Tailwind CSS v4
- **AI & Validation:** Vercel AI SDK (`ai` v7, `@ai-sdk/react`, `@ai-sdk/google`), `zod` v4
- **Database:** Turso (LibSQL via `@libsql/client`) + Drizzle ORM (`drizzle-orm`, `drizzle-kit`)

## 2. Package Manager & Commands
- Always use **`pnpm`** (never `npm` or `yarn`).
- `pnpm dev` — Start local dev server
- `pnpm build` / `pnpm lint` — Production build check and ESLint check
- `pnpm db:generate` — Generate Drizzle migrations from `db/schema.ts`
- `pnpm db:migrate` — Apply migrations to Turso
- `pnpm db:seed` — Seed sample `customers` and `orders` data
- `pnpm db:studio` — Open Drizzle Studio
- `pnpm db:reset` — Destructive reset (drops tables, migrates, seeds)

## 3. Folder Structure
- `app/api/chat/route.ts` — Streaming AI chat endpoint with read-only SQL tool (`querySql`)
- `app/page.tsx` — Chat UI using `useChat` from `@ai-sdk/react`
- `app/layout.tsx` & `app/globals.css` — Root layout, fonts, and Tailwind v4 styles
- `db/schema.ts` — SQLite/Turso Drizzle schema (`customers`, `orders`)
- `db/index.ts` — LibSQL + Drizzle client instance
- `db/seed.ts` & `db/reset.ts` — Seeding and database reset scripts
- `db/migrations/` — Generated SQL migrations
- `.agents/skills/chat-architecture/SKILL.md` — Detailed domain rules for API, AI SDK, and DB work

## 4. Strict Rules
- Never read or write `.env` or `.env.local` files; use `.env.example` for env var names.
- Always validate API inputs with `zod` and keep SQL tool execution strictly read-only (`SELECT` only).
- Keep `PLAN.md` and `PROGRESS.md` updated when completing milestones across sessions.