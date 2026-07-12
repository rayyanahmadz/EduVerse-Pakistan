# 🎓 EduVerse Pakistan

**Pakistan's Complete Higher Education Platform**

A full-stack web app that helps students discover universities, compare programs, predict admission chances, find scholarships, and plan their academic journey — all in one place.

Built with **React**, **TypeScript**, **Supabase**, **PostgreSQL**, and **Vercel Serverless Functions**.

[![Deploy with Vercel] https://edu-verse-pakistan.vercel.app/


---

## Overview

Instead of browsing dozens of university websites, students can search, compare, and plan their higher education through one unified platform. EduVerse brings together university information, degree exploration, scholarships, admission tracking, career guidance, merit prediction, fee estimation, and student reviews in a single experience.

The app follows a **serverless-first architecture** — Supabase (PostgreSQL + Auth) handles the database, and Vercel Serverless Functions handle privileged operations. No dedicated backend server to maintain.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎓 **University Explorer** | Search and filter universities by province, city, sector (public/private/women's), facilities, fees, merit, and rankings |
| 📚 **Degree Explorer** | Browse programs with eligibility, duration, career paths, salary estimates, and offering universities |
| 📈 **Merit Predictor** | Estimate admission chances from matric/intermediate/entry test scores, sorted into safe, moderate, and dream universities |
| 🏛 **University Comparison** | Compare fees, merit, rankings, facilities, and programs side-by-side |
| 💰 **Scholarship Hub** | Browse merit, need-based, government, provincial, university, and international scholarships |
| 📅 **Admission Calendar** | Track application deadlines, entry tests, interviews, merit lists, and personal reminders |
| 💵 **Fee Calculator** | Estimate total yearly cost including tuition, hostel, books, transport, and living expenses |
| 🤖 **Career Advisor** | Rule-based recommendations from interests and academic strengths — no external AI API required |
| ⭐ **Student Reviews** | Rate universities across teaching quality, campus life, facilities, and more |
| ❤️ **Personal Dashboard** | Manage saved universities, degrees, scholarships, applications, and reminders |
| 🛠 **Admin Dashboard** | Full CRUD over platform data, CSV/JSON bulk import, image library, and validation — all via secure server-side operations |

---

## 🏗 Architecture

```
                     Browser
                        │
                        ▼
            React + TypeScript + Vite
                        │
        ┌───────────────┴────────────────┐
        ▼                                 ▼
Supabase (Database)             Vercel Serverless APIs
(PostgreSQL + Auth)             (/api/admin, /api/import)
        │                                 │
        └───────────────┬─────────────────┘
                         ▼
                Row Level Security
```

| Layer | Stack |
|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion, React Query |
| Backend | Supabase, PostgreSQL, Row Level Security |
| Auth | Supabase Auth |
| Serverless | Vercel Functions |
| Deployment | Vercel |

---

## 🔒 Security

- **Row Level Security (RLS)** — every table enforces policies so users only access data they're authorized to see or modify.
- **Direct browser reads** — public data (universities, degrees, scholarships) is read straight from Supabase; regular users can't write to it, since no write policies exist for those tables.
- **Secure administration** — the Service Role Key is never exposed to the client. All privileged actions run through Vercel Serverless Functions that verify authentication, confirm admin privileges, validate input, and return sanitized responses.

---

## 📂 Project Structure

```text
eduverse-pakistan/
├── api/                 # Vercel serverless functions
│   ├── admin.ts
│   ├── import.ts
│   ├── health.ts
│   └── _lib/
├── src/
│   ├── components/
│   ├── context/
│   ├── hooks/
│   ├── lib/
│   ├── pages/
│   ├── types/
│   └── utils/
├── supabase/
│   ├── schema.sql
│   ├── seed.sql
│   └── fix_grants.sql
├── docs/
│   ├── SUPABASE_SETUP.md
│   ├── VERCEL_DEPLOYMENT.md
│   └── GITHUB_SETUP.md
├── public/
├── .env.example
├── vercel.json
└── package.json
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-username/eduverse-pakistan.git
cd eduverse-pakistan
```

### 2. Set up Supabase

Create a free project at [supabase.com](https://supabase.com), open the SQL Editor, and run:

```
supabase/schema.sql
supabase/seed.sql
```

Then copy your **Project URL**, **Anon Key**, and **Service Role Key** from **Project Settings → API**.

> **Tip:** If you ever see `permission denied for table...`, run `supabase/fix_grants.sql` to restore table permissions.

### 3. Configure environment variables

```bash
cp .env.example .env
```

Fill in your Supabase credentials. The browser only uses `VITE_*` variables — private credentials are used exclusively by serverless functions.

### 4. Install and run

```bash
npm install
npm run dev
```

Visit **http://localhost:5173**

> **Note:** `npm run dev` only starts the Vite dev server. Serverless routes (`/api/*`) aren't executed by Vite — install the Vercel CLI and run `vercel dev` to test admin features (CRUD, bulk imports) locally. Everything else (auth, search, merit prediction, fee calculator, dashboards, reviews) works normally with `npm run dev` since it talks directly to Supabase.

---

## 👨‍💼 Creating an Administrator Account

After registering a normal account, open the Supabase SQL Editor and run:

```sql
update public."Profile"
set role = 'ADMIN'
where email = 'you@example.com';
```

Sign out and back in — the **Admin Dashboard** will appear in the navigation bar.

---

## ☁️ Deploying to Vercel

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```
2. **Import into Vercel** — create a new project and import the repo. Vercel auto-detects Vite and applies routing/functions via `vercel.json`.
3. **Add environment variables** (Production, Preview, and Development):

   | Variable | Description |
   |---|---|
   | `VITE_SUPABASE_URL` | Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Public browser key |
   | `SUPABASE_URL` | Server-side project URL |
   | `SUPABASE_SERVICE_ROLE_KEY` | Private service role key |

4. **Deploy**, then verify at `https://your-project.vercel.app/api/health` — you should see `{ "success": true }`.

---

## 📖 Documentation

| Document | Description |
|---|---|
| [`docs/SUPABASE_SETUP.md`](docs/SUPABASE_SETUP.md) | Complete database setup guide |
| [`docs/VERCEL_DEPLOYMENT.md`](docs/VERCEL_DEPLOYMENT.md) | Deployment instructions |
| [`docs/GITHUB_SETUP.md`](docs/GITHUB_SETUP.md) | GitHub repository setup |

---

## 📊 Data Accuracy

EduVerse includes information on real **HEC-recognized universities** across Pakistan. Some values — tuition fees, merit percentages, salary estimates, rankings — are **illustrative estimates** meant to demonstrate platform functionality. Always verify fees, merit requirements, admission schedules, scholarships, and eligibility criteria directly with the official university before making decisions. The platform is built to scale through secure bulk imports, so illustrative data can be replaced with verified institutional data over time.

---

## 🎯 Roadmap

- [ ] AI-powered university recommendations & admission guidance
- [ ] University application assistant
- [ ] Discussion forums & alumni network
- [ ] Student messaging & university announcements
- [ ] Internship and job portal integration
- [ ] Mobile app with push notifications
- [ ] Analytics dashboard
- [ ] Multi-language support
- [ ] Offline support (PWA)

---

## 🤝 Contributing

Contributions are welcome!

```bash
git checkout -b feature/new-feature
git commit -m "Add new feature"
git push origin feature/new-feature
```

Then open a Pull Request.

---

## ⭐ Support

If this project helped you, consider starring the repo, forking it, reporting issues, or suggesting features — it all helps.

---

## 📄 License

Built as a **production-ready portfolio project** demonstrating modern full-stack development with React, TypeScript, Supabase, PostgreSQL, and Vercel. Intended for educational, demonstration, and portfolio purposes.

University information included is illustrative and should not be treated as official — always consult the respective institutions for current admission policies, fees, scholarships, and eligibility requirements.

---

<div align="center">

**EduVerse Pakistan** — Helping students make smarter higher education decisions.
Built with ❤️ using React, TypeScript, Supabase & Vercel.

</div>
