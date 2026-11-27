---
name: chat-architecture
description: Architecture, security, AI SDK, and database rules for building API routes, tools, and queries in this Next.js SQL AI agent project.
---

# Project Architecture & Rules (`sql-agent`)

## Tech & Stack Conventions

- **Framework & Runtime:** Next.js 16 (App Router under `app/`, NOT `src/`), React 19, TypeScript (strict mode), Tailwind CSS v4.
- **Package Manager:** Always use `pnpm` (`pnpm dev`, `pnpm build`, `pnpm lint`, `pnpm db:*`). Never use `npm` or `yarn`.
- **AI Layer:** Use Vercel AI SDK (`ai` v7, `@ai-sdk/react`, `@ai-sdk/google`). Keep model calls and tool execution strictly server-side inside `app/api/**`.
- **Database Layer:** Use Turso / LibSQL (`@libsql/client`) with Drizzle ORM (`drizzle-orm` / `drizzle-kit`). Schema lives in `db/schema.ts`, DB client in `db/index.ts`, migrations in `db/migrations/`.

## API Route & Tool Rules (`app/api/chat/route.ts`)

1. **Validate Request Payloads with `zod`:** Always validate incoming request bodies (`messages`, optional parameters, or length limits) with `zod` before passing data to `convertToModelMessages` or `streamText`. Return clean `400` responses on invalid input instead of crashing.
2. **Enforce Read-Only SQL (`SELECT` Only):** Any SQL execution tool (such as `querySql`) must enforce read-only access in code—reject `INSERT`, `UPDATE`, `DELETE`, `DROP`, `ALTER`, `ATTACH`, `PRAGMA` mutations, or multi-statement SQL injection attempts (`;`).
3. **Safe Error Handling:** Catch database and AI/API errors gracefully (`429` rate/quota limits, malformed SQL, or network errors) and return user-friendly messages without leaking stack traces or secrets.
4. **Streaming & Step Control:** Use `streamText`, `convertToModelMessages`, `stepCountIs(...)`, and `result.toUIMessageStreamResponse()` consistently with `@ai-sdk/react` `useChat`.

## Database & Migration Rules (`db/`)

1. **Schema First:** Define tables and relations in `db/schema.ts`. After schema edits, run `pnpm db:generate` and inspect the generated SQL in `db/migrations/` before running `pnpm db:migrate`.
2. **Protect Production Data:** Never run `pnpm db:reset` against a database with important or live data because it drops tables (`orders`, `customers`, `__drizzle_migrations`) before re-migrating and seeding.
3. **Seed Idempotency:** Keep `db/seed.ts` safe to re-run without creating duplicate customers.

## Environment & Security

- Never read, modify, or print real secrets from `.env` or `.env.local`. Reference environment variables via `process.env.*` and document variable names in `.env.example` (`GOOGLE_GENERATIVE_AI_API_KEY`, `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`).
