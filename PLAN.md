# Project Roadmap — SQL AI Agent

## Phase 1: Core Setup & SQL Agent (Completed)
- [x] Scaffold Next.js 16 App Router, Tailwind v4, Drizzle ORM, LibSQL, and Vercel AI SDK
- [x] Define `customers` and `orders` schema in `db/schema.ts` with migrations and seed script
- [x] Implement `/api/chat` streaming route with `@ai-sdk/google` and read-only `querySql` tool
- [x] Build basic chat interface in `app/page.tsx` with `useChat`

## Phase 2: Hardening & Recruiter Demo Readiness (Completed)
- [x] Add `zod` request body validation and max message length cap (500 chars) in `app/api/chat/route.ts`
- [x] Tighten read-only SQL validation (block semicolons/writes beyond prefix check)
- [x] Add rate limiting & graceful `429` / error handling for live Vercel demo (Turso-backed, 2/min + 5/hour per IP)
- [x] Add clickable sample prompts and clear demo status feedback in `app/page.tsx`

## Phase 3: Polish & Observability (Pending)
- [ ] Update `app/layout.tsx` metadata (title and description) for the SQL AI Agent
- [ ] Run `pnpm lint` and `pnpm build` verification before pushing to GitHub