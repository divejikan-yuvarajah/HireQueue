<div align="center">

<img src="https://img.shields.io/badge/HireQueue-v1.0-6366f1?style=for-the-badge&logo=vercel&logoColor=white" alt="HireQueue" />

# 🧠 HireQueue
### Editorial-grade hiring intelligence. Built for teams that take craft seriously.

> Score every applicant 0–100 the moment they apply. Real-time leaderboards. Zero AI tokens. Zero bias.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-v0--hirequeue.vercel.app-22d3ee?style=flat-square&logo=vercel)](https://v0-hirequeue-job-platform.vercel.app/)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0%20by%20Vercel-black?style=flat-square&logo=vercel)](https://v0.app)
[![Next.js 14](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Realtime-3ecf8e?style=flat-square&logo=supabase)](https://supabase.com)
[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=flat-square&logo=vercel)](https://vercel.com)
[![Hackathon](https://img.shields.io/badge/Zero%20to%20Agent-Buildathon%20Colombo%202026-f59e0b?style=flat-square)](https://techtalk360.com)

</div>

---

## 📌 The Problem

Recruiters spend **hours — sometimes days** — manually reading resumes one by one. Most don't even meet the basic requirements. Hiring is slow, subjective, and exhausting.

**HireQueue fixes that.**

---

## 💡 What is HireQueue?

HireQueue is an **AI-powered job applicant ranking platform** that automatically scores and ranks every applicant from **0–100** using a deterministic weighted algorithm — based on experience, skills, education, and location match.

No LLMs. No hallucinations. No black boxes. Every score is **transparent, auditable, and reproducible.**

Built and shipped in **one day** at the [Zero to Agent Buildathon - Colombo 2026](https://techtalk360.com) 🇱🇰

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎯 **Weighted Scoring Engine** | Set custom weights for experience, skills, education & location |
| 📊 **Real-time Leaderboard** | Applicants ranked live the moment they submit |
| 🏆 **Tier System** | Auto-classify as **Safe**, **Borderline**, or **Reach** |
| 🔗 **Shareable Apply Link** | One public link + QR code per job posting |
| 📈 **Analytics Dashboard** | Track applicant trends, scores, and conversion |
| 📁 **CSV Export** | Download your shortlist anytime |
| 🌙 **Dark Mode First** | Editorial newspaper-style UI, stunning in both modes |
| ⚡ **0.4s Score Time** | Scoring happens instantly on submission |
| 🗄️ **Supabase Realtime** | Leaderboard updates live without refresh |
| 📋 **Job Templates** | Pre-built templates for 8+ common roles |

---

## 🖥️ Pages

```
/                   → Landing page (editorial hero + features + pricing + FAQ)
/dashboard          → Recruiter dashboard with stats, jobs list & activity feed
/jobs/new           → Multi-step job posting wizard with live preview
/jobs/[id]          → Real-time applicant leaderboard with podium & score rings
/apply/[jobId]      → Public applicant submission form (no login required)
/analytics          → Hiring analytics with charts, funnel & skills heatmap
/applicants/[id]    → Detailed applicant profile with score breakdown
/templates          → Job template library filterable by department
/pricing            → Pricing tiers (Solo / Studio / Atelier)
```

---

## 🛠️ Tech Stack

| Tool | Purpose |
|---|---|
| [v0 by Vercel](https://v0.app) | AI-powered UI generation |
| [Next.js 14](https://nextjs.org) | App Router, SSR, routing |
| [Supabase](https://supabase.com) | Realtime database & backend |
| [Tailwind CSS](https://tailwindcss.com) | Utility-first styling |
| [shadcn/ui](https://ui.shadcn.com) | UI component library |
| [Framer Motion](https://framer.com/motion) | Animations & transitions |
| [Recharts](https://recharts.org) | Analytics charts |
| [Vercel](https://vercel.com) | One-click deployment |
| [Cursor](https://cursor.sh) | AI-assisted coding |

---

## ⚙️ Scoring Algorithm

```ts
// lib/scoring.ts

function scoreApplicant(applicant, job): number {
  // Experience: full score if 1.5x the minimum
  const expScore = applicant.yrs >= job.minYrs * 1.5
    ? 100
    : (applicant.yrs / job.minYrs) * 100;

  // Skills: required match + nice-to-have bonus
  const skillScore = (matched / total) * 100
    + (niceMatched / niceTotal) * 20;  // max 100

  // Education: phd=100, masters=85, bachelors=70, diploma=50, hs=30
  const eduScore = educationMap[applicant.education];

  // Location: exact=100, same country=40, else=0
  const locScore = exactMatch ? 100 : sameCountry ? 40 : 0;

  // Bonus: LinkedIn +5, Portfolio +5
  const bonus = (applicant.linkedin ? 5 : 0) + (applicant.portfolio ? 5 : 0);

  // Weighted final score
  const final = (
    expScore * w.experience +
    skillScore * w.skills +
    eduScore * w.education +
    locScore * w.location
  ) / 100 + bonus;

  return Math.min(final, 100);
}

// Tiers
// >= 75 → SAFE 🟢
// >= 50 → BORDERLINE 🟡
// <  50 → REACH 🔴
```

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/divejikan-yuvarajah/hirequeue-job-platform.git
cd hirequeue-job-platform
```

### 2. Install dependencies

```bash
npm install
# or
pnpm install
```

### 3. Set up environment variables

```bash
cp .env.example .env.local
```

Add your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see HireQueue running locally.

---

## 🗄️ Supabase Schema

```sql
-- Jobs table
create table jobs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  company text not null,
  location text,
  description text,
  required_skills text[],
  min_experience int,
  w_experience int default 35,
  w_skills int default 35,
  w_education int default 15,
  w_location int default 15,
  created_at timestamp default now()
);

-- Applicants table
create table applicants (
  id uuid default gen_random_uuid() primary key,
  job_id uuid references jobs(id),
  name text not null,
  email text not null,
  experience_yrs int,
  skills text[],
  education text,
  location text,
  cover_note text,
  score numeric,
  tier text,
  created_at timestamp default now()
);
```

---

## 📁 Project Structure

```
hirequeue-job-platform/
├── app/
│   ├── page.tsx                 # Landing page
│   ├── dashboard/page.tsx       # Recruiter dashboard
│   ├── jobs/
│   │   ├── new/page.tsx         # Post a job (wizard)
│   │   ├── [id]/page.tsx        # Leaderboard
│   │   └── templates/page.tsx  # Job templates
│   ├── apply/[jobId]/page.tsx   # Public apply form
│   ├── analytics/page.tsx       # Analytics dashboard
│   ├── applicants/[id]/page.tsx # Applicant profile
│   └── pricing/page.tsx         # Pricing page
├── components/
│   └── ui/                      # shadcn/ui components
├── lib/
│   ├── scoring.ts               # Weighted scoring algorithm
│   └── supabase.ts              # Supabase client
└── public/
```

---

## 🌐 Deployment

This project is deployed on **Vercel** with automatic deployments on every push to `main`.

Every commit pushed via v0 or directly to GitHub triggers a new deployment automatically.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/divejikan-yuvarajah/hirequeue-job-platform)

---

## 🔗 Continue on v0

This repository is linked to a v0 project. Start new chats to make changes and v0 will push commits directly to this repo.

[Continue working on v0 →](https://v0.app/chat/projects/prj_UbZLr4aE7Oi80KNnD5B1nxUGIofq)

---

## 🏆 Built At

<div align="center">

**Zero to Agent Buildathon — Colombo 2026** 🇱🇰

Organized by [TechTalk360](https://techtalk360.com) · Powered by [Vercel](https://vercel.com)

*Built and shipped in one day.*

</div>

---

## 📄 License

MIT License — feel free to fork, build, and ship.

---

<div align="center">

Made with intent, not algorithms · **HireQueue v1.0 · est. 2026**

⭐ Star this repo if HireQueue helped you hire smarter!

</div>
