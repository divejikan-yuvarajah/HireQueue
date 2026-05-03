"use client"

import * as React from "react"
import Link from "next/link"
import useSWR from "swr"
import { motion } from "framer-motion"
import {
  Plus,
  ArrowUpRight,
  ArrowRight,
  Briefcase,
  Users,
  TrendingUp,
  MapPin,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { AppShell } from "@/components/app-shell"
import { TierBadge } from "@/components/tier-badge"
import { supabase } from "@/lib/supabase"
import type { Job, Applicant, Tier } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

type JobRow = Job & {
  applicantCount: number
  avgScore: number
  topCount: number
  matchCount: number
  reachCount: number
  recentApps: Pick<Applicant, "id" | "name" | "score" | "tier" | "created_at">[]
}

type DashboardData = {
  jobs: JobRow[]
  totalApplicants: number
  avgScore: number
  topThisWeek: number
  perDay: { day: string; count: number }[]
}

async function fetchDashboard(): Promise<DashboardData> {
  const [{ data: jobs }, { data: applicants }] = await Promise.all([
    supabase.from("jobs").select("*").order("created_at", { ascending: false }),
    supabase.from("applicants").select("*"),
  ])
  const apps = (applicants ?? []) as Applicant[]
  const jobsList = (jobs ?? []) as Job[]

  const grouped: Record<
    string,
    {
      count: number
      total: number
      top: number
      match: number
      reach: number
      recent: Applicant[]
    }
  > = {}
  for (const a of apps) {
    if (!grouped[a.job_id])
      grouped[a.job_id] = {
        count: 0,
        total: 0,
        top: 0,
        match: 0,
        reach: 0,
        recent: [],
      }
    const g = grouped[a.job_id]
    g.count++
    g.total += Number(a.score) || 0
    if (a.tier === "top") g.top++
    else if (a.tier === "match") g.match++
    else g.reach++
    g.recent.push(a)
  }

  const enriched: JobRow[] = jobsList.map((j) => {
    const g = grouped[j.id] ?? {
      count: 0,
      total: 0,
      top: 0,
      match: 0,
      reach: 0,
      recent: [],
    }
    const recentApps = g.recent
      .sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
      .slice(0, 3)
    return {
      ...j,
      applicantCount: g.count,
      avgScore: g.count ? Math.round(g.total / g.count) : 0,
      topCount: g.top,
      matchCount: g.match,
      reachCount: g.reach,
      recentApps,
    }
  })

  const totalApplicants = apps.length
  const avgScore = totalApplicants
    ? Math.round(
        apps.reduce((s, a) => s + (Number(a.score) || 0), 0) / totalApplicants,
      )
    : 0

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const topThisWeek = apps.filter(
    (a) => new Date(a.created_at).getTime() >= oneWeekAgo && a.tier === "top",
  ).length

  // Per-day for last 14 days
  const days: { day: string; count: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - i)
    const next = new Date(d)
    next.setDate(next.getDate() + 1)
    const count = apps.filter((a) => {
      const t = new Date(a.created_at).getTime()
      return t >= d.getTime() && t < next.getTime()
    }).length
    days.push({ day: d.toISOString().slice(0, 10), count })
  }

  return { jobs: enriched, totalApplicants, avgScore, topThisWeek, perDay: days }
}

export default function DashboardPage() {
  const { data, isLoading } = useSWR("dashboard", fetchDashboard, {
    refreshInterval: 6000,
  })

  return (
    <AppShell
      pageEyebrow="Workspace overview"
      pageTitle={
        <>
          Today&rsquo;s desk.{" "}
          <span className="italic text-muted-foreground">
            Your hiring, in one spread.
          </span>
        </>
      }
      pageActions={
        <Link href="/jobs/new">
          <Button className="rounded-none h-11 px-6 bg-foreground text-background hover:bg-foreground/90">
            <Plus className="h-4 w-4 mr-1.5" />
            New job
          </Button>
        </Link>
      }
    >
      <div className="px-4 md:px-8 py-10">
        <StatsRow data={data} loading={isLoading} />
        <Sparkline perDay={data?.perDay ?? []} />
        <JobsBlock jobs={data?.jobs ?? []} loading={isLoading} />
      </div>
    </AppShell>
  )
}

function StatsRow({
  data,
  loading,
}: {
  data?: DashboardData
  loading: boolean
}) {
  const stats = [
    {
      label: "Active jobs",
      value: data?.jobs.length ?? 0,
      icon: Briefcase,
      hint: "currently hiring",
    },
    {
      label: "Total applicants",
      value: data?.totalApplicants ?? 0,
      icon: Users,
      hint: "across all roles",
    },
    {
      label: "Average score",
      value: data?.avgScore ?? 0,
      suffix: "/100",
      icon: TrendingUp,
      hint: "weighted match",
    },
    {
      label: "Top tier this week",
      value: data?.topThisWeek ?? 0,
      icon: ArrowUpRight,
      hint: "score ≥ 75",
      accent: true,
    },
  ]
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-hairline border border-hairline mt-2">
      {stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
          className={`p-6 md:p-8 ${
            s.accent ? "bg-accent text-accent-foreground" : "bg-card"
          }`}
        >
          <div className="flex items-start justify-between">
            <div className="font-mono text-[10px] uppercase tracking-[0.25em] opacity-70">
              {s.label}
            </div>
            <s.icon className="h-3.5 w-3.5 opacity-60" />
          </div>
          <div className="mt-6 flex items-baseline gap-1">
            <span className="font-num text-4xl md:text-5xl tracking-tighter">
              {loading ? "—" : s.value}
            </span>
            {s.suffix && (
              <span className="font-num text-sm opacity-60">{s.suffix}</span>
            )}
          </div>
          <div className="mt-3 font-mono text-[10px] uppercase tracking-[0.2em] opacity-60">
            {s.hint}
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function Sparkline({ perDay }: { perDay: { day: string; count: number }[] }) {
  const max = Math.max(1, ...perDay.map((d) => d.count))
  return (
    <div className="border-l border-r border-b border-hairline bg-card px-6 py-5">
      <div className="flex items-end justify-between mb-3">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Application velocity
          </div>
          <div className="font-display text-xl mt-1">Last 14 days</div>
        </div>
        <div className="font-num text-2xl">
          {perDay.reduce((s, d) => s + d.count, 0)}
        </div>
      </div>
      <div className="flex items-end gap-1.5 h-20">
        {perDay.map((d, i) => {
          const h = (d.count / max) * 100
          return (
            <div
              key={d.day}
              className="flex-1 relative group flex items-end"
              style={{ height: "100%" }}
            >
              <motion.div
                initial={{ height: 0 }}
                animate={{ height: `${Math.max(h, 4)}%` }}
                transition={{ delay: i * 0.02, duration: 0.6 }}
                className="w-full bg-foreground/80 group-hover:bg-accent"
              />
              <div className="absolute -top-7 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-foreground text-background px-2 py-0.5 text-[10px] font-mono whitespace-nowrap pointer-events-none">
                {d.count} · {d.day.slice(5)}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function JobsBlock({ jobs, loading }: { jobs: JobRow[]; loading: boolean }) {
  if (loading) {
    return (
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-px bg-hairline border border-hairline">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-card p-6 h-48 animate-pulse" />
        ))}
      </div>
    )
  }

  if (!jobs.length) {
    return (
      <div className="mt-12 border border-hairline p-16 text-center bg-card">
        <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-4">
          No jobs yet
        </div>
        <h3 className="font-display text-3xl tracking-tight max-w-md mx-auto text-balance">
          Your first issue starts here.
        </h3>
        <p className="mt-3 text-sm text-muted-foreground max-w-md mx-auto">
          Define your bar, share the link, and watch applicants land in tiers.
        </p>
        <Link href="/jobs/new" className="inline-block mt-8">
          <Button className="rounded-none h-11 px-6 bg-foreground text-background hover:bg-foreground/90">
            <Plus className="h-4 w-4 mr-1.5" /> Post your first job
          </Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="mt-12">
      <div className="flex items-end justify-between mb-6">
        <div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            Section A
          </div>
          <h2 className="font-display text-3xl tracking-tight mt-1">
            Open roles
          </h2>
        </div>
        <Link
          href="/jobs/templates"
          className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5"
        >
          Browse templates
          <ChevronRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-hairline border border-hairline">
        {jobs.map((j, i) => (
          <JobCard key={j.id} job={j} index={i} />
        ))}
      </div>
    </div>
  )
}

function JobCard({ job, index }: { job: JobRow; index: number }) {
  const tierData: { tier: Tier; count: number }[] = [
    { tier: "top", count: job.topCount },
    { tier: "match", count: job.matchCount },
    { tier: "reach", count: job.reachCount },
  ]
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="bg-card p-7 group relative"
    >
      <Link href={`/jobs/${job.id}`} className="absolute inset-0 z-10" aria-label={`View ${job.title}`} />
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            {job.department || "Engineering"} · {job.job_type || "full-time"}
          </div>
          <h3 className="font-display text-2xl tracking-tight mt-1.5 truncate">
            {job.title}
          </h3>
          <div className="text-sm text-muted-foreground mt-1 truncate">
            {job.company}
            {job.location && (
              <>
                {" · "}
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {job.location}
                </span>
              </>
            )}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="font-num text-3xl">{job.applicantCount}</div>
          <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            applicants
          </div>
        </div>
      </div>

      <div className="mt-6 flex gap-1.5 h-1.5">
        {tierData.map((t) => {
          const pct = job.applicantCount
            ? (t.count / job.applicantCount) * 100
            : 0
          if (!pct && job.applicantCount) return null
          return (
            <div
              key={t.tier}
              className={
                t.tier === "top"
                  ? "bg-tier-top"
                  : t.tier === "match"
                    ? "bg-accent/60"
                    : "bg-tier-reach"
              }
              style={{ width: job.applicantCount ? `${pct}%` : "33.33%" }}
            />
          )
        })}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {tierData.map((t) => (
          <div
            key={t.tier}
            className="flex items-center justify-between text-xs"
          >
            <TierBadge tier={t.tier} size="sm" />
            <span className="font-num text-sm">{t.count}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-5 border-t border-hairline flex items-center justify-between">
        <div className="text-[11px] text-muted-foreground">
          Posted{" "}
          {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
        </div>
        <span className="inline-flex items-center gap-1 text-xs font-medium group-hover:text-accent transition-colors relative z-20">
          View leaderboard
          <ArrowRight className="h-3 w-3" />
        </span>
      </div>
    </motion.div>
  )
}
