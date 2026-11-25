This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## What this project does

This is an **AI-powered database chat assistant**. You ask questions about your database in plain language (e.g. "What is the total amount of delivered orders?" or "Which customers are from Lahore?"), and an AI agent writes the SQL query, runs it against your Turso database, and answers in simple language.

### How it works

```
You (browser)  →  chat message
                      ↓
            Next.js chat UI (app/page.tsx)
                      ↓
            /api/chat route (app/api/chat/route.ts)
                      ↓
            Gemini AI (gemini-flash-lite-latest)
                      ↓
            AI generates a SQL query
                      ↓
            querySql tool → executes on Turso DB
                      ↓
            Result goes back to AI → AI replies to you
```

### Tech stack

- **Next.js 16** — frontend + API route
- **Vercel AI SDK + Google Gemini** — the agent that writes SQL and answers
- **Drizzle ORM + Turso (libsql)** — database and schema management
- **Zod** — tool input validation

### Database schema

Two tables in `db/schema.ts`:

- `customers` — id, name, email, city
- `orders` — id, customer_id, product_name, category, amount, status, order_date

The AI is restricted to **read-only `SELECT` queries** — enforced both in the system prompt and in code.

## Getting Started

First, install dependencies and set up environment variables:

```bash
pnpm install
cp .env.example .env.local   # then fill in the values (see below)
```

Required environment variables in `.env.local`:

| Variable | Description |
|---|---|
| `TURSO_DATABASE_URL` | Turso database URL (`libsql://...`) |
| `TURSO_AUTH_TOKEN` | Turso auth token |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google AI API key (for the SQL agent) |

Then run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Database (Drizzle + Turso)

The database schema lives in `db/schema.ts`, migrations in `db/migrations/`, and the connection in `db/index.ts`.

### Scripts

| Command | What it does |
|---|---|
| `pnpm db:generate` | Generates a new SQL migration file from `db/schema.ts` changes (does not touch the DB) |
| `pnpm db:migrate` | Applies pending migrations to the Turso database |
| `pnpm db:seed` | Inserts dummy `customers` + `orders` data (safe to re-run, no duplicates) |
| `pnpm db:reset` | Drops all tables, then runs migrate + seed (fresh start — **deletes all data**) |
| `pnpm db:studio` | Opens Drizzle Studio to browse/edit the database |

### Typical workflow

```bash
# First-time setup on a fresh database
pnpm db:migrate
pnpm db:seed

# After changing db/schema.ts
pnpm db:generate   # creates a new file in db/migrations/
pnpm db:migrate    # applies it to the database
```

### Important: migrations can delete data

- **Adding** a column is safe — existing rows are kept.
- **Renaming or dropping** a column deletes that column's data. To preserve it, add the new column first, copy the data with `UPDATE`, then drop the old column in a second migration.
- Always review the generated `.sql` file in `db/migrations/` before running `db:migrate`, and take a backup before migrating a database with real data.
- `pnpm db:reset` drops every table — never run it against a database you need to keep.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
