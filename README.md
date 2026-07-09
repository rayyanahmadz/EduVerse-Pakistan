# EduVerse Pakistan

**Pakistan's Complete University & Higher Education Platform** — Supabase + Vercel Serverless edition.

A full-stack, production-ready web app to search, compare, and get into Pakistani universities: a Smart University Finder, Merit Predictor, Degree Explorer, Scholarship Hub, Admission Calendar with reminders, a rule-based Career Advisor, a Fee Calculator, student reviews, a personal dashboard, and a full Admin Panel with CSV/JSON bulk import — all deployable on Vercel's free tier with **no traditional backend server**.

---

## Architecture

This is intentionally **not** an Express/Node backend. It follows a serverless-first design:

| Layer | Technology | Where it runs |
|---|---|---|
| UI | React 18 + Vite + TypeScript + Tailwind CSS + Framer Motion + React Query | Static build, served by Vercel's CDN |
| Data (reads & user-owned writes) | Supabase PostgreSQL, called **directly from the browser** via the Supabase JS SDK | Browser → Supabase, protected by Row Level Security |
| Admin writes & bulk import | 3 Vercel Serverless Functions (`/api/admin`, `/api/import`, `/api/health`) | Vercel Edge Network, using the Supabase **service-role** key |
| Auth | Supabase Auth (email/password) | Supabase |

**Why this is secure:** every table has Row Level Security enabled. Public catalog data (universities, degrees, scholarships) is readable by anyone but has **no write policy at all** for normal users — so even though the browser talks to Postgres directly, nobody can write to it from the client. The only way to write to the catalog is through the two serverless functions, which hold the service-role key (never sent to the browser) and re-check that the caller is a logged-in admin before doing anything. User-owned data (saved items, reviews, applications, reminders) is written directly from the browser, protected by RLS policies scoped to `auth.uid()`.

```
eduverse-pakistan/
├── api/                        # Vercel Serverless Functions (3 total)
│   ├── admin.ts                 # admin CRUD — universities, degrees, scholarships, deadlines, stats
│   ├── import.ts                # CSV / JSON bulk university importer
│   ├── health.ts                # health check
│   └── _lib/supabaseAdmin.ts    # shared service-role client + admin-auth guard
├── src/
│   ├── components/               # layout (Navbar, Footer) + ui (Button, Card, Input, ...)
│   ├── context/                  # AuthContext (Supabase Auth), ThemeContext (dark/light)
│   ├── lib/
│   │   ├── supabase.ts           # Supabase client (anon key, browser-safe)
│   │   ├── queries.ts            # every direct-to-Supabase read/write used by pages
│   │   ├── functions.ts          # typed wrapper for calling /api/admin and /api/import
│   │   └── merit.ts              # aggregate/admission-chance calculation (client-side)
│   ├── pages/                    # one file per route
│   └── types/                    # shared TypeScript types
├── supabase/
│   ├── schema.sql                # tables, indexes, RLS policies, storage bucket — run once
│   └── seed.sql                  # 20 real HEC universities, degrees, scholarships, calendar
├── vercel.json
├── .env.example
└── docs/
    ├── SUPABASE_SETUP.md
    ├── VERCEL_DEPLOYMENT.md
    └── GITHUB_SETUP.md
```

---

## Quick Start (local development)

### 1. Create a Supabase project and run the SQL

Full walkthrough: [`docs/SUPABASE_SETUP.md`](./docs/SUPABASE_SETUP.md). Short version:

1. Create a free project at [supabase.com](https://supabase.com).
2. Open **SQL Editor** → paste and run [`supabase/schema.sql`](./supabase/schema.sql).
3. Paste and run [`supabase/seed.sql`](./supabase/seed.sql).
4. Copy your **Project URL**, **anon public key**, and **service_role key** from **Project Settings → API**.

### 2. Configure environment variables

```bash
cp .env.example .env
```
Fill in the four values from step 1.

### 3. Install and run

```bash
npm install
npm run dev
```
Open **http://localhost:5173**.

> Serverless functions (`/api/*`) don't run under plain `npm run dev` (that's Vite only). To test the Admin Panel's write operations locally, install the Vercel CLI and run `vercel dev` instead — see `docs/VERCEL_DEPLOYMENT.md`. Everything else (browsing, search, merit predictor, saving items, reviews, applications) works fully under `npm run dev` since those talk to Supabase directly.

### 4. Create your admin account

Register a normal account from `/register`, then in the Supabase SQL Editor run:
```sql
update public."Profile" set role = 'ADMIN' where email = 'you@example.com';
```
Log out and back in — you'll now see **Admin Panel** in the navbar.

---

## Deploy to Vercel

Full walkthrough: [`docs/VERCEL_DEPLOYMENT.md`](./docs/VERCEL_DEPLOYMENT.md). Short version: import the GitHub repo into Vercel, set the same environment variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`), click Deploy. No other configuration needed — `vercel.json` already handles the SPA routing and the `/api` functions.

## Push to GitHub

See [`docs/GITHUB_SETUP.md`](./docs/GITHUB_SETUP.md) for the exact commands.

---

## Features

- **Smart University Finder** — filter by province, city, sector, gender policy, hostel; live admission-chance badges when marks are supplied.
- **Merit Predictor** — Matric/Inter/entry-test aggregate calculation with Safe / Moderate / Dream matches, computed entirely client-side.
- **University Compare** — up to 6 universities side-by-side.
- **Degree Explorer** — overview, eligibility, careers, salary range, and every university offering each program.
- **Scholarship Hub** — merit, need-based, provincial, government, private, international.
- **Admission Calendar** — timeline of admission windows/tests/interviews/merit lists, with optional reminders (Supabase-backed, per user).
- **AI Career Advisor** — short quiz, transparent rule-based scoring, no external AI API, nothing leaves the browser.
- **Fee Calculator** — yearly cost estimate (tuition, hostel, books, transport, living).
- **Student Reviews** — 7-category ratings per university, averaged automatically.
- **Dashboard** — saved universities/degrees/scholarships, tracked applications, notifications.
- **Admin Panel** — full CRUD for universities/degrees/scholarships/deadlines, plus CSV and JSON bulk importers, all running through the two secure serverless functions.

## A note on data accuracy

The seed data ships with **20 real, well-known HEC-recognized universities** (NUST, LUMS, GIKI, FAST-NUCES, UET Lahore, and more). Fee, merit, and ranking figures are reasonable planning estimates for demonstration, not verified official numbers. The schema and Admin Panel importer are built to scale to every HEC-recognized university — use the CSV/JSON importer to add the rest with verified data.
