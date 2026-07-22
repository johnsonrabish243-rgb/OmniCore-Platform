# OmniCore ERP — Intelligent Workspace Platform

**OmniCore** est une plateforme SaaS d'entreprise modulaire qui centralise la gestion des RH, Finance, CRM, Commerce, Pharmacie, Éducation, Santé et plus encore dans un seul espace de travail intelligent.

---

## 🚀 Tech Stack

| Layer        | Technology                        |
| ------------ | --------------------------------- |
| **Frontend** | Next.js 16 (React 19, TypeScript) |
| **Styling**  | Tailwind CSS 4 + CSS Variables    |
| **Backend**  | InsForge (PostgreSQL + Auth)      |
| **Auth**     | InsForge Auth (Supabase-compatible) |
| **i18n**     | next-intl (fr, en, sw)            |
| **UI**       | Radix UI primitives + Framer Motion |
| **Charts**   | Recharts                          |
| **Font**     | Geist (Vercel)                    |

---

## 📦 Prerequisites

- Node.js >= 18
- npm
- An **InsForge** project (backend)

---

## 🛠️ Local Development

### 1. Clone & install

```bash
cd saas-platform
npm install
```

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in your InsForge credentials:

```env
NEXT_PUBLIC_INSFORGE_URL=https://your-app-key.region.insforge.app
NEXT_PUBLIC_INSFORGE_ANON_KEY=anon_your_anon_key_here
INSFORGE_API_KEY=ik_your_api_key_here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### 3. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🚢 Vercel Deployment

### Step 1: Push to Git

```bash
git add .
git commit -m "Ready for deployment"
git push origin master
```

### Step 2: Import to Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import your Git repository
3. Configure the project:

| Setting          | Value                            |
| ---------------- | -------------------------------- |
| **Root Directory** | `saas-platform`                |
| **Framework**    | Next.js (auto-detected)          |
| **Build Command** | `npx next build`                |
| **Output Dir**   | `.next`                          |

> **Note:** A `vercel.json` file is included in `saas-platform/` for automatic tech stack detection.

### Step 3: Set Environment Variables

In the Vercel Dashboard → Settings → Environment Variables, add:

| Name                         | Value / Source                          |
| ---------------------------- | --------------------------------------- |
| `NEXT_PUBLIC_INSFORGE_URL`   | `https://4majgdg3.us-east.insforge.app` |
| `NEXT_PUBLIC_INSFORGE_ANON_KEY` | Your InsForge anon key               |
| `INSFORGE_API_KEY`           | Your InsForge API key                   |
| `NEXTAUTH_SECRET`            | `openssl rand -base64 32` output        |
| `NEXT_PUBLIC_SITE_URL`       | `https://your-domain.vercel.app`        |
| `OPENAI_API_KEY`             | Your OpenAI API key (optional)          |
| `RESEND_API_KEY`             | Your Resend API key (optional)          |

### Step 4: Deploy

Vercel will automatically detect the Next.js framework and deploy.

---

## 🗄️ Database (InsForge)

This project uses **InsForge** as its backend. The database is PostgreSQL with Row-Level Security (RLS).

### Check project status

```bash
cd saas-platform
npx insforge projects get
```

### List tables

```bash
npx insforge db tables
```

### Run migrations (fresh DB only)

Migrations are in `supabase/migrations/`. The current DB already has all migrations applied (confirmed via `_migrations` table). For a fresh DB, apply via:

```bash
npx insforge db import supabase/migrations/00001_initial_schema.sql
npx insforge db import supabase/migrations/00002_rls_policies_and_triggers.sql
```

---

## 📁 Project Structure

```
saas-platform/
├── src/
│   ├── app/
│   │   ├── [locale]/          # Internationalized pages
│   │   ├── api/                # API routes (auth, admin, modules)
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   └── globals.css         # Global styles + theme
│   ├── components/
│   │   ├── ui/                 # Radix UI primitives
│   │   └── *.tsx               # App components
│   ├── i18n/                   # Internationalization
│   ├── lib/
│   │   ├── supabase/           # InsForge SDK config
│   │   └── *.ts                # Utilities
│   └── middleware.ts           # Auth + i18n middleware
├── supabase/migrations/        # Database migrations
├── .env                        # Local env vars (git-ignored)
├── .env.example                # Template for .env
├── next.config.ts              # Next.js configuration
├── vercel.json                 # Vercel deployment config
└── package.json
```

---

## 🌐 Internationalization

Supported locales: **fr** (default), **en**, **sw**

- Translations are in `messages/{locale}.json`
- Locale routing is handled by `next-intl`

---

## 🧪 Commands

| Command           | Description          |
| ----------------- | -------------------- |
| `npm run dev`     | Start dev server     |
| `npm run build`   | Production build     |
| `npm run start`   | Start production     |
| `npm run lint`    | Run ESLint           |

---

## 📄 Environment Variables

See `.env.example` for all required and optional environment variables.

---

Built with ❤️ in **Kalemie, Tanganyika, RDC**
