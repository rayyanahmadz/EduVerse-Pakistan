# Deploying to Vercel

This project deploys to Vercel with **zero configuration changes** — `vercel.json` already tells Vercel how to build the frontend and route the serverless functions.

## Option A — Deploy from GitHub (recommended)

1. Push this project to GitHub first (see [`GITHUB_SETUP.md`](./GITHUB_SETUP.md) if you haven't).
2. Go to [vercel.com](https://vercel.com) → sign in with GitHub → **Add New… → Project**.
3. Select your `eduverse-pakistan` repository → **Import**.
4. Vercel auto-detects the **Vite** framework preset (from `vercel.json`). You don't need to change the build command, output directory, or root directory.
5. Open **Environment Variables** and add all four, exactly as in your local `.env`:

   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | your Supabase anon public key |
   | `SUPABASE_URL` | same project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | your Supabase service_role key |

   Set them for **Production**, **Preview**, and **Development** environments (Vercel shows checkboxes for each).
6. Click **Deploy**. Takes about a minute.
7. Once live, visit `https://your-project.vercel.app/api/health` — you should see:
   ```json
   { "success": true, "message": "EduVerse Pakistan API functions are running." }
   ```
   If that works, both your static site and your serverless functions deployed correctly.

## Option B — Deploy from the Vercel CLI

```bash
npm install -g vercel
vercel login
vercel                 # first run: link/create the project, deploys a preview
vercel env add VITE_SUPABASE_URL
vercel env add VITE_SUPABASE_ANON_KEY
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel --prod          # deploy to production
```

## Testing the serverless functions locally before deploying

Plain `npm run dev` (Vite) does **not** run `/api/*` functions — those only exist under Vercel's runtime. To test the Admin Panel's create/delete/import actions locally:

```bash
npm install -g vercel
vercel dev
```
This runs both the Vite dev server and the `/api` functions together, reading from your local `.env` file. Everything else in the app (browsing, search, saving items, reviews, applications, merit predictor) talks to Supabase directly and works fine under plain `npm run dev` too.

## Custom domain (optional)

Vercel → your project → **Settings → Domains** → add your domain and follow the DNS instructions shown. No app changes needed.

## Common issues

**Site loads but every page shows "Could not load..." errors**
`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` are missing or wrong in Vercel's environment variables. Check **Settings → Environment Variables**, then redeploy (**Deployments → ⋯ → Redeploy**) — env var changes require a new deployment to take effect.

**Admin Panel actions fail with "Admin access required"**
Your account's `Profile.role` isn't `'ADMIN'` yet — see step 6 in `SUPABASE_SETUP.md`.

**`/api/admin` or `/api/import` return 500 errors**
`SUPABASE_URL` / `SUPABASE_SERVICE_ROLE_KEY` are missing in Vercel's environment variables (these are separate from the `VITE_`-prefixed ones — both pairs must be set).

**Routing to a page directly (e.g. refreshing `/universities`) shows a 404**
This means `vercel.json`'s rewrites weren't applied — confirm the file exists at the project root and wasn't excluded from the deployment.
