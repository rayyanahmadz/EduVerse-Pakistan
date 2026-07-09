# Pushing to GitHub

## 1. Create the repository on GitHub

Go to [github.com](https://github.com) → click **+** (top right) → **New repository** → name it `eduverse-pakistan` → **do not** check "Add a README" (this project already has one) → **Create repository**. Keep the page open — it shows the URL you'll need below.

## 2. Push your local project

From the project root (the folder containing `package.json`, `api/`, `src/`, `supabase/`):

```bash
git init
git add .
git commit -m "Initial commit — EduVerse Pakistan (Supabase + Vercel edition)"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/eduverse-pakistan.git
git push -u origin main
```

Replace the URL with the one shown on your GitHub repo page.

## What's excluded automatically

`.gitignore` already excludes `node_modules`, `dist`, `.env`, `.env.local`, and `.vercel` — so your real Supabase keys never get committed. Only `.env.example` (the template, with no real secrets) is pushed. Double check before your first push:

```bash
git status
```
You should **not** see `.env` in the list of files to be committed — if you do, something's wrong with `.gitignore` and you should fix that before pushing (`git rm --cached .env` if it was already staged).

## Connecting to Vercel

Once the repo is on GitHub, see [`VERCEL_DEPLOYMENT.md`](./VERCEL_DEPLOYMENT.md) — Vercel's "Import from GitHub" flow will pick this repository up directly, and every future `git push` to `main` will trigger an automatic redeploy.
