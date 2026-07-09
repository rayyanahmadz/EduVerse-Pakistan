# Supabase Setup

## 1. Create a project

1. Go to [supabase.com](https://supabase.com) → sign up (free) → **New Project**.
2. Pick a name, a database password (save it somewhere — you likely won't need it again, but keep it), and a region close to you.
3. Wait ~2 minutes for provisioning.

## 2. Run the schema

1. In the left sidebar, open **SQL Editor** → **New query**.
2. Open [`supabase/schema.sql`](../supabase/schema.sql) from this project, copy the entire file, paste it into the editor, and click **Run**.
3. You should see "Success. No rows returned." This created every table, index, Row Level Security policy, and a storage bucket for university images.

## 3. Load demo data

1. New query again → open [`supabase/seed.sql`](../supabase/seed.sql), copy, paste, **Run**.
2. This loads 20 real HEC-recognized universities, ~10 degrees, university-degree offers, 5 scholarships, and a handful of admission-calendar events.

Both scripts are safe to re-run — they use `on conflict ... do nothing`, so running them twice won't create duplicates.

## 4. Get your API credentials

Go to **Project Settings** (gear icon) → **API**. You need three values:

| Value | Where it's used | Safe for the browser? |
|---|---|---|
| **Project URL** | `VITE_SUPABASE_URL` and `SUPABASE_URL` | Yes |
| **anon public** key | `VITE_SUPABASE_ANON_KEY` | Yes — this is what RLS is for |
| **service_role** key | `SUPABASE_SERVICE_ROLE_KEY` | **No — never put this in a `VITE_` variable or commit it.** It bypasses every RLS policy. It's used only inside the two Vercel Serverless Functions. |

Paste these into your `.env` file (see the root `.env.example`).

## 5. (Recommended) Turn off email confirmation for easier testing

By default, Supabase Auth requires users to confirm their email before they can log in. For local development/demoing this is usually more friction than it's worth.

**Authentication → Providers → Email** → toggle off **Confirm email**. (You can turn it back on before a real public launch.)

## 6. Create your admin account

1. Run the app (`npm run dev`) and register a normal account at `/register`, **or** create one directly in **Authentication → Users → Add User** in the Supabase dashboard.
2. Promote it to admin — SQL Editor:
   ```sql
   update public."Profile" set role = 'ADMIN' where email = 'you@example.com';
   ```
3. Log out and back in on the site. You'll now see **Admin Panel** in the navbar, and can create universities, degrees, scholarships, calendar events, and bulk-import via CSV/JSON.

## How the schema handles "unlimited universities"

`University` is a normal table with no hardcoded rows — everything (including the 20 demo universities) is just data. The Admin Panel's CSV/JSON importer (backed by `/api/import`) lets you add the remaining HEC-recognized universities without touching any code, one paste or file upload at a time.

## Row Level Security, in one paragraph

Every table has RLS **enabled**. Catalog tables (`University`, `Degree`, `Scholarship`, `Deadline`, ...) have a `select` policy allowing anyone to read, and **no** insert/update/delete policy — meaning even a signed-in user cannot write to them from the browser, no matter what they try in devtools. Only the service-role key (used exclusively inside `/api/admin.ts` and `/api/import.ts`) can bypass RLS to write there. User-owned tables (`SavedUniversity`, `Review`, `Application`, `Reminder`, ...) allow a user full access to rows where `auth.uid()` matches the row's `userId` — so your saved universities are private to you, and nobody else's dashboard can be read or edited by you either.
