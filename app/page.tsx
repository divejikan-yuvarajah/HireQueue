"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import {
  ArrowRight,
  ArrowUpRight,
  Sparkles,
  GitBranch,
  Layers,
  Sliders,
  Eye,
  CheckCircle2,
  Plus,
  Minus,
} from "lucide-react"
import * as React from "react"
import { Button } from "@/components/ui/button"
import { MarketingNav } from "@/components/marketing-nav"
import { MarketingFooter } from "@/components/marketing-footer"
import { TierBadge } from "@/components/tier-badge"
import { ScoreRing } from "@/components/score-ring"
import { initialsFor, avatarHueFor } from "@/lib/avatar"

const TODAY = new Date().toLocaleDateString("en-US", {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
})

const ISSUE = "Vol. I · No. 137"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background grain">
      <MarketingNav />

      <div className="border-b border-hairline">
        <div className="max-w-[1240px] mx-auto px-6 h-10 flex items-center justify-between font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <span>{TODAY}</span>
          <span className="hidden md:inline">The Hiring Quarterly</span>
          <span>{ISSUE}</span>
        </div>
      </div>

      <Hero />
      <SectionRule label="01 — How it works" />
      <HowItWorks />
      <SectionRule label="02 — The leaderboard" />
      <LiveDemoSection />
      <SectionRule label="03 — Bento" />
      <BentoSection />
      <SectionRule label="04 — Numbers" />
      <StatsBand />
      <SectionRule label="05 — Pricing" />
      <PricingTeaser />
      <SectionRule label="06 — Questions" />
      <FAQ />
      <CTASection />
      <MarketingFooter />
    </div>
  )
}

function SectionRule({ label }: { label: string }) {
  return (
    <div className="max-w-[1240px] mx-auto px-6">
      <div className="border-t border-hairline pt-6 mb-12 mt-24 md:mt-32">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          {label}
        </div>
      </div>
    </div>
  )
}

function Hero() {
  return (
    <section className="max-w-[1240px] mx-auto px-6 pt-12 md:pt-20 pb-12 md:pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-end">
        <div className="lg:col-span-7">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6 flex items-center gap-3"
          >
            <span className="size-1.5 rounded-full bg-accent" />
            Hiring intelligence · Vercel Hackathon &rsquo;26
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.05,
            }}
            className="font-display text-[clamp(2.5rem,7vw,6rem)] leading-[0.95] tracking-tight text-balance"
          >
            Hire smarter.{" "}
            <span className="italic font-display">Rank faster.</span>{" "}
            <span className="block">Sleep better.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              ease: [0.22, 1, 0.36, 1],
              delay: 0.15,
            }}
            className="mt-8 max-w-xl text-base md:text-lg leading-relaxed text-muted-foreground"
          >
            HireQueue scores every applicant against your weighted criteria the
            moment they apply. Three tiers. Zero AI tokens. Real-time
            leaderboards built like a newspaper, not a spreadsheet.
          </motion.p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.25 }}
            className="mt-10 flex flex-wrap items-center gap-3"
          >
            <Link href="/jobs/new">
              <Button
                size="lg"
                className="rounded-none h-12 px-7 bg-foreground text-background hover:bg-foreground/90 group"
              >
                Post a job in 2 minutes
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                variant="ghost"
                size="lg"
                className="rounded-none h-12 px-5 hover:bg-transparent hover:text-accent"
              >
                Open the dashboard
                <ArrowUpRight className="h-4 w-4 ml-1.5" />
              </Button>
            </Link>
          </motion.div>

          <div className="mt-12 grid grid-cols-3 max-w-md gap-px bg-hairline border border-hairline">
            {[
              ["—98%", "time-to-rank"],
              ["100%", "deterministic"],
              ["0", "AI tokens"],
            ].map(([num, label]) => (
              <div key={label} className="bg-background p-4">
                <div className="font-num text-2xl tracking-tight">{num}</div>
                <div className="font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-1">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-5">
          <HeroLeaderboardCard />
        </div>
      </div>
    </section>
  )
}

const DEMO_APPLICANTS = [
  { name: "Amara Okafor", role: "Senior PM, Lagos", score: 92, tier: "top" as const },
  { name: "Theo Voss", role: "Staff Eng, Berlin", score: 87, tier: "top" as const },
  { name: "Mei Tanaka", role: "Product Designer, Tokyo", score: 73, tier: "match" as const },
  { name: "Sasha Iyengar", role: "Growth, NYC", score: 64, tier: "match" as const },
  { name: "Diego Marín", role: "FE Dev, Mexico City", score: 41, tier: "reach" as const },
]

function HeroLeaderboardCard() {
  const [hover, setHover] = React.useState<number | null>(null)
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      <div className="absolute -inset-4 bg-accent-tint blur-2xl rounded-full opacity-60 -z-10" />
      <div className="bg-card border border-hairline">
        <div className="px-5 h-11 flex items-center justify-between border-b border-hairline">
          <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            <span className="relative flex size-1.5">
              <span className="animate-ping absolute inline-flex size-full rounded-full bg-accent/60" />
              <span className="relative inline-flex rounded-full size-1.5 bg-accent" />
            </span>
            Live · Senior PM
          </div>
          <div className="font-mono text-[10px] text-muted-foreground">
            247 ranked
          </div>
        </div>
        <ul>
          {DEMO_APPLICANTS.map((a, i) => (
            <li
              key={a.name}
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
              className="grid grid-cols-[40px_1fr_auto] items-center gap-4 px-5 py-4 border-b border-hairline last:border-0 relative group"
            >
              <span className="font-mono text-xs text-muted-foreground tabular-nums">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex items-center gap-2">
                <div
                  className="size-7 rounded-full flex items-center justify-center text-[10px] font-medium border border-hairline shrink-0"
                  style={{
                    backgroundColor: `hsl(${avatarHueFor(a.name)} 55% 92%)`,
                    color: `hsl(${avatarHueFor(a.name)} 60% 25%)`,
                  }}
                >
                  {initialsFor(a.name)}
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{a.name}</div>
                  <div className="text-[11px] text-muted-foreground truncate">
                    {a.role}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-num text-xl tabular-nums">{a.score}</span>
                <TierBadge tier={a.tier} size="sm" />
              </div>
              {hover === i && (
                <motion.span
                  layoutId="hero-hover"
                  className="absolute inset-y-0 left-0 w-px bg-accent"
                />
              )}
            </li>
          ))}
        </ul>
        <div className="px-5 h-10 flex items-center justify-between border-t border-hairline font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
          <span>Updated 0.4s ago</span>
          <span className="text-accent">+12 today</span>
        </div>
      </div>
    </motion.div>
  )
}

function HowItWorks() {
  const steps = [
    {
      n: "01",
      title: "Define your bar",
      copy: "Specify required skills, minimum experience, and how much each dimension matters. Drag four sliders. That's the rubric.",
      icon: Sliders,
    },
    {
      n: "02",
      title: "Share the link",
      copy: "Send a single application link. Anyone can apply — no logins, no friction. Custom subdomain coming soon.",
      icon: GitBranch,
    },
    {
      n: "03",
      title: "Watch them rank",
      copy: "Each submission triggers a deterministic score and a tier. The leaderboard reorders in real time, in your sleep.",
      icon: Layers,
    },
  ]
  return (
    <section id="how" className="max-w-[1240px] mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-hairline border border-hairline">
        {steps.map((s) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="bg-background p-8 md:p-10 group hover:bg-card transition-colors"
          >
            <div className="flex items-start justify-between mb-12">
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground">
                {s.n}
              </span>
              <s.icon className="h-4 w-4 text-muted-foreground group-hover:text-accent transition-colors" />
            </div>
            <h3 className="font-display text-3xl leading-tight tracking-tight mb-4 text-balance">
              {s.title}
            </h3>
            <p className="text-sm leading-relaxed text-muted-foreground max-w-sm">
              {s.copy}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}

function LiveDemoSection() {
  return (
    <section className="max-w-[1240px] mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-center">
        <div className="md:col-span-5">
          <h2 className="font-display text-4xl md:text-5xl leading-[1.05] tracking-tight text-balance">
            Built like a newspaper.{" "}
            <span className="italic">Updates like a stock ticker.</span>
          </h2>
          <p className="mt-6 text-muted-foreground leading-relaxed max-w-md">
            Every applicant lands in the right tier the moment they hit submit.
            No queue. No &ldquo;we&rsquo;ll get back to you.&rdquo; Editorial layouts,
            monospaced scores, and motion that respects your time.
          </p>
          <ul className="mt-10 space-y-4 text-sm">
            {[
              "Realtime via Supabase",
              "CSV export, anytime",
              "Custom apply page per role",
              "Editorial dark mode included",
            ].map((f) => (
              <li key={f} className="flex items-center gap-3">
                <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="md:col-span-7">
          <DemoTickerBoard />
        </div>
      </div>
    </section>
  )
}

function DemoTickerBoard() {
  return (
    <div className="bg-card border border-hairline">
      <div className="px-5 h-12 border-b border-hairline flex items-center justify-between">
        <div className="font-mono text-[11px] uppercase tracking-[0.2em]">
          Senior Product Designer
        </div>
        <div className="flex items-center gap-2 text-muted-foreground">
          <Eye className="h-3.5 w-3.5" />
          <span className="font-mono text-[11px]">live</span>
        </div>
      </div>
      <div className="grid grid-cols-3 divide-x divide-hairline">
        {[
          { tier: "top" as const, count: 12, label: "Top" },
          { tier: "match" as const, count: 38, label: "Match" },
          { tier: "reach" as const, count: 197, label: "Reach" },
        ].map((t) => (
          <div key={t.label} className="p-5">
            <TierBadge tier={t.tier} />
            <div className="font-num text-3xl mt-3">{t.count}</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-1">
              applicants
            </div>
          </div>
        ))}
      </div>
      <div className="overflow-hidden border-t border-hairline">
        <div className="ticker flex gap-12 whitespace-nowrap py-3 font-mono text-[11px] text-muted-foreground">
          {[
            "↑ Amara Okafor · 92",
            "↑ Theo Voss · 87",
            "→ Mei Tanaka · 73",
            "↓ Sasha Iyengar · 64",
            "↓ Diego Marín · 41",
            "↑ Liang Wei · 81",
            "↑ Noor Khalil · 79",
            "↓ Pieter Bos · 55",
            "↑ Amara Okafor · 92",
            "↑ Theo Voss · 87",
            "→ Mei Tanaka · 73",
          ].map((line, i) => (
            <span key={i}>{line}</span>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 divide-x divide-hairline border-t border-hairline">
        <div className="p-5">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Median Score
          </div>
          <div className="font-num text-3xl mt-2">62.4</div>
        </div>
        <div className="p-5 flex items-center gap-4">
          <ScoreRing score={92} tier="top" size={72} stroke={5} showLabel={false} />
          <div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Top Pick
            </div>
            <div className="font-display text-lg leading-tight">
              Amara Okafor
            </div>
            <div className="text-xs text-muted-foreground">92 · Senior PM</div>
          </div>
        </div>
      </div>
    </div>
  )
}

function BentoSection() {
  return (
    <section className="max-w-[1240px] mx-auto px-6">
      <div className="grid grid-cols-12 gap-px bg-hairline border border-hairline">
        <div className="col-span-12 md:col-span-7 p-8 md:p-12 min-h-[280px] bg-background">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Feature
          </span>
          <h3 className="font-display text-3xl md:text-4xl leading-tight tracking-tight mt-3 max-w-md text-balance">
            Weighted scoring. <span className="italic">Yours, not ours.</span>
          </h3>
          <p className="text-sm text-muted-foreground mt-4 max-w-md leading-relaxed">
            Drag four sliders to set how much experience, skill match,
            education, and location matter. Scores recompute the instant you
            move them.
          </p>
          <div className="mt-8 grid grid-cols-4 gap-px bg-hairline">
            {[
              ["Exp", 35],
              ["Skills", 35],
              ["Edu", 15],
              ["Loc", 15],
            ].map(([k, v]) => (
              <div key={k as string} className="bg-background p-4">
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground font-mono">
                  {k}
                </div>
                <div className="font-num text-2xl mt-1">{v}</div>
                <div className="h-1 mt-2 bg-muted">
                  <div
                    className="h-full bg-accent"
                    style={{ width: `${v as number}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="col-span-12 md:col-span-5 p-8 md:p-12 min-h-[280px] bg-foreground text-background">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-60">
            Editorial UX
          </span>
          <h3 className="font-display text-3xl md:text-4xl leading-tight tracking-tight mt-3 text-balance">
            Designed for humans, <br />
            <span className="italic">not HR-tech vendors.</span>
          </h3>
          <div className="mt-8 flex items-center gap-3">
            <div className="font-display text-6xl leading-none">A</div>
            <div className="text-xs opacity-70 max-w-[200px] leading-relaxed">
              Set in IBM Plex Serif Display, Inter, and JetBrains Mono. Treated
              like a craft, not a CRUD app.
            </div>
          </div>
        </div>

        <div className="col-span-12 md:col-span-4 p-8 md:p-10 min-h-[260px] bg-background">
          <Sparkles className="h-4 w-4 text-accent" />
          <h3 className="font-display text-2xl leading-tight tracking-tight mt-6 text-balance">
            Zero hallucinations
          </h3>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Deterministic math beats LLM vibes. Every score is auditable, every
            tier reproducible.
          </p>
        </div>

        <div className="col-span-12 md:col-span-4 p-8 md:p-10 min-h-[260px] bg-accent text-accent-foreground">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-80">
            Realtime
          </span>
          <h3 className="font-display text-2xl leading-tight tracking-tight mt-6 text-balance">
            See applicants land
          </h3>
          <p className="text-sm opacity-90 mt-3 leading-relaxed">
            Powered by Supabase realtime. New rows appear with a soft chime,
            slot into the right tier, and update every aggregate live.
          </p>
        </div>

        <div className="col-span-12 md:col-span-4 p-8 md:p-10 min-h-[260px] bg-background">
          <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Anywhere
          </span>
          <h3 className="font-display text-2xl leading-tight tracking-tight mt-6 text-balance">
            Share. Embed. Export.
          </h3>
          <p className="text-sm text-muted-foreground mt-3 leading-relaxed">
            Public apply pages with QR. CSV export by tier. Embeddable
            leaderboard widget for your careers page.
          </p>
        </div>
      </div>
    </section>
  )
}

function StatsBand() {
  const stats = [
    { v: "0.4s", l: "Avg score time" },
    { v: "247K+", l: "Apps ranked" },
    { v: "98.7%", l: "Hiring manager NPS" },
    { v: "$0", l: "AI inference cost" },
  ]
  return (
    <section className="max-w-[1240px] mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-hairline border border-hairline">
        {stats.map((s) => (
          <div key={s.l} className="bg-background p-8 md:p-10">
            <div className="font-num text-4xl md:text-5xl tracking-tighter">
              {s.v}
            </div>
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mt-3">
              {s.l}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

function PricingTeaser() {
  const plans = [
    {
      name: "Solo",
      price: "$0",
      cadence: "/forever",
      desc: "For founders making their first three hires.",
      features: ["1 active job", "100 applicants/mo", "CSV export", "Public apply link"],
      cta: "Start free",
      featured: false,
    },
    {
      name: "Studio",
      price: "$49",
      cadence: "/mo",
      desc: "For boutique teams that hire on taste.",
      features: [
        "Unlimited jobs",
        "10K applicants/mo",
        "Realtime leaderboard",
        "Custom apply page",
        "Templates library",
      ],
      cta: "Start trial",
      featured: true,
    },
    {
      name: "Atelier",
      price: "Custom",
      cadence: "",
      desc: "For agencies and high-volume operators.",
      features: ["SSO + SAML", "API access", "Audit logs", "Dedicated reviewer"],
      cta: "Talk to us",
      featured: false,
    },
  ]
  return (
    <section className="max-w-[1240px] mx-auto px-6">
      <div className="flex items-end justify-between mb-10 flex-wrap gap-6">
        <h2 className="font-display text-4xl md:text-5xl leading-tight tracking-tight max-w-xl text-balance">
          Pricing as honest as the scoring.
        </h2>
        <Link
          href="/pricing"
          className="font-mono text-[11px] uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
        >
          See all plans <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-hairline border border-hairline">
        {plans.map((p) => (
          <div
            key={p.name}
            className={`p-8 md:p-10 flex flex-col ${
              p.featured ? "bg-foreground text-background" : "bg-background"
            }`}
          >
            <div className="flex items-baseline justify-between">
              <span className="font-mono text-[11px] uppercase tracking-[0.25em] opacity-70">
                {p.name}
              </span>
              {p.featured && (
                <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
                  Most popular
                </span>
              )}
            </div>
            <div className="mt-6 flex items-baseline gap-1">
              <span className="font-display text-5xl">{p.price}</span>
              <span className="text-sm opacity-60">{p.cadence}</span>
            </div>
            <p className="text-sm opacity-80 mt-3">{p.desc}</p>
            <ul className="mt-8 space-y-2.5 text-sm flex-1">
              {p.features.map((f) => (
                <li key={f} className="flex items-center gap-2.5">
                  <span
                    className={`size-1 rounded-full ${
                      p.featured ? "bg-accent" : "bg-foreground"
                    }`}
                  />
                  {f}
                </li>
              ))}
            </ul>
            <Link href="/pricing" className="mt-8">
              <Button
                size="sm"
                variant={p.featured ? "secondary" : "outline"}
                className={`rounded-none w-full h-10 ${
                  p.featured
                    ? "bg-background text-foreground hover:bg-background/90"
                    : "border-foreground text-foreground hover:bg-foreground hover:text-background"
                }`}
              >
                {p.cta}
              </Button>
            </Link>
          </div>
        ))}
      </div>
    </section>
  )
}

function FAQ() {
  const items = [
    {
      q: "Does HireQueue use AI to score applicants?",
      a: "No. Scoring is deterministic and explainable. Every applicant gets a transparent breakdown of how their score was calculated against the weights you set.",
    },
    {
      q: "Can applicants see their own score?",
      a: "By default, yes — they see their tier and matched skills on the success page. You can disable this per-job in the visibility settings.",
    },
    {
      q: "What happens if my requirements change mid-process?",
      a: "Adjust the sliders and the leaderboard re-ranks every applicant in real time. History is preserved — you can always see the original score.",
    },
    {
      q: "Do I need to set up authentication?",
      a: "No. The hackathon build runs without auth. Apply pages are public via shareable links and QR codes. Production teams can layer auth on top.",
    },
    {
      q: "Can I export to my ATS?",
      a: "CSV export is built in. API access for Greenhouse, Lever, and Ashby is on the Atelier plan.",
    },
  ]
  const [open, setOpen] = React.useState<number | null>(0)
  return (
    <section id="faq" className="max-w-[1240px] mx-auto px-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <h2 className="font-display text-4xl md:text-5xl leading-tight tracking-tight text-balance">
            Questions, <span className="italic">honestly answered.</span>
          </h2>
          <p className="text-muted-foreground mt-6 text-sm leading-relaxed max-w-xs">
            If we don&rsquo;t cover it here, the team replies inside 24 hours.
          </p>
        </div>
        <div className="md:col-span-8">
          <ul className="border-t border-hairline">
            {items.map((it, i) => {
              const isOpen = open === i
              return (
                <li key={it.q} className="border-b border-hairline">
                  <button
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 py-6 text-left group"
                  >
                    <span className="font-display text-xl md:text-2xl tracking-tight pr-4">
                      {it.q}
                    </span>
                    <span className="size-7 border border-hairline flex items-center justify-center shrink-0 group-hover:border-foreground/40">
                      {isOpen ? (
                        <Minus className="h-3.5 w-3.5" />
                      ) : (
                        <Plus className="h-3.5 w-3.5" />
                      )}
                    </span>
                  </button>
                  <motion.div
                    initial={false}
                    animate={{
                      height: isOpen ? "auto" : 0,
                      opacity: isOpen ? 1 : 0,
                    }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="overflow-hidden"
                  >
                    <p className="pb-6 pr-12 text-sm text-muted-foreground leading-relaxed max-w-2xl">
                      {it.a}
                    </p>
                  </motion.div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}

function CTASection() {
  return (
    <section className="max-w-[1240px] mx-auto px-6 mt-32">
      <div className="border border-hairline bg-foreground text-background p-10 md:p-20 grain relative overflow-hidden">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-70 mb-6">
          Closing argument
        </div>
        <h2 className="font-display text-4xl md:text-7xl leading-[0.95] tracking-tight max-w-3xl text-balance">
          Ten minutes from now,{" "}
          <span className="italic opacity-80">your inbox is sorted.</span>
        </h2>
        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Link href="/jobs/new">
            <Button
              size="lg"
              className="rounded-none h-12 px-8 bg-accent text-accent-foreground hover:bg-accent/90"
            >
              Start ranking
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link href="/dashboard">
            <Button
              size="lg"
              variant="ghost"
              className="rounded-none h-12 px-5 text-background hover:bg-background/10 hover:text-background"
            >
              Tour the dashboard
            </Button>
          </Link>
        </div>
        <div className="absolute bottom-6 right-6 font-mono text-[10px] uppercase tracking-[0.25em] opacity-50 hidden md:block">
          — End of issue —
        </div>
      </div>
    </section>
  )
}
