"use client"

import { useEffect, useState, useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts"
import { TrendingUp, Users, Target, Award, Briefcase } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { AppShell } from "@/components/app-shell"
import { supabase } from "@/lib/supabase"
import type { Job, Applicant } from "@/lib/types"

const TIER_COLORS = {
  top: "var(--top)",
  match: "var(--match)",
  reach: "var(--reach)",
}

const PIE_COLORS = ["var(--top)", "var(--match)", "var(--reach)"]

export default function AnalyticsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedJob, setSelectedJob] = useState<string>("all")

  useEffect(() => {
    async function load() {
      const [{ data: j }, { data: a }] = await Promise.all([
        supabase.from("jobs").select("*").order("created_at", { ascending: false }),
        supabase.from("applicants").select("*").order("created_at", { ascending: true }),
      ])
      setJobs((j ?? []) as Job[])
      setApplicants((a ?? []) as Applicant[])
      setLoading(false)
    }
    load()
  }, [])

  const filtered = useMemo(() => {
    if (selectedJob === "all") return applicants
    return applicants.filter((a) => a.job_id === selectedJob)
  }, [applicants, selectedJob])

  // Tier distribution
  const tierData = useMemo(() => {
    const counts = { top: 0, match: 0, reach: 0 }
    filtered.forEach((a) => {
      if (a.tier in counts) counts[a.tier as keyof typeof counts]++
    })
    return [
      { name: "Top", value: counts.top, fill: TIER_COLORS.top },
      { name: "Match", value: counts.match, fill: TIER_COLORS.match },
      { name: "Reach", value: counts.reach, fill: TIER_COLORS.reach },
    ]
  }, [filtered])

  // Score distribution histogram
  const scoreDistribution = useMemo(() => {
    const buckets = Array.from({ length: 10 }, (_, i) => ({
      range: `${i * 10}-${i * 10 + 9}`,
      count: 0,
    }))
    filtered.forEach((a) => {
      const idx = Math.min(Math.floor(a.score / 10), 9)
      buckets[idx].count++
    })
    return buckets
  }, [filtered])

  // Applications over time
  const timelineData = useMemo(() => {
    const byDate: Record<string, number> = {}
    filtered.forEach((a) => {
      const d = new Date(a.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })
      byDate[d] = (byDate[d] || 0) + 1
    })
    let cumulative = 0
    return Object.entries(byDate).map(([date, count]) => {
      cumulative += count
      return { date, count, cumulative }
    })
  }, [filtered])

  // Skills frequency
  const skillsData = useMemo(() => {
    const freq: Record<string, number> = {}
    filtered.forEach((a) => {
      a.skills.forEach((s) => {
        freq[s] = (freq[s] || 0) + 1
      })
    })
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 12)
      .map(([skill, count]) => ({ skill, count }))
  }, [filtered])

  // Education breakdown
  const educationData = useMemo(() => {
    const freq: Record<string, number> = {}
    filtered.forEach((a) => {
      freq[a.education] = (freq[a.education] || 0) + 1
    })
    return Object.entries(freq).map(([edu, count]) => ({ edu, count }))
  }, [filtered])

  // Experience avg
  const avgExperience = useMemo(() => {
    if (!filtered.length) return 0
    return filtered.reduce((sum, a) => sum + a.experience_yrs, 0) / filtered.length
  }, [filtered])

  const avgScore = useMemo(() => {
    if (!filtered.length) return 0
    return filtered.reduce((sum, a) => sum + a.score, 0) / filtered.length
  }, [filtered])

  const topRate = useMemo(() => {
    if (!filtered.length) return 0
    return (filtered.filter((a) => a.tier === "top").length / filtered.length) * 100
  }, [filtered])

  if (loading) {
    return (
      <AppShell>
        <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6 space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-72 rounded-xl" />)}
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell>
      <div className="max-w-6xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight">Analytics</h1>
            <p className="text-muted-foreground mt-1">Pipeline health across all positions</p>
          </div>
          <Select value={selectedJob} onValueChange={setSelectedJob}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="All jobs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Jobs</SelectItem>
              {jobs.map((j) => (
                <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Users, label: "Total Applicants", value: filtered.length, sub: `across ${jobs.length} jobs` },
            { icon: Target, label: "Avg Score", value: avgScore.toFixed(1), sub: "out of 100" },
            { icon: Award, label: "Top Tier Rate", value: `${topRate.toFixed(0)}%`, sub: "of applicants" },
            { icon: Briefcase, label: "Avg Experience", value: `${avgExperience.toFixed(1)}y`, sub: "years" },
          ].map((kpi) => (
            <Card key={kpi.label} className="border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <kpi.icon className="h-4 w-4 text-accent" />
                  <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{kpi.label}</span>
                </div>
                <p className="font-serif text-2xl font-bold tabular-nums">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {filtered.length === 0 ? (
          <Card className="border-border/50">
            <CardContent className="p-10 text-center">
              <p className="font-serif text-lg font-semibold mb-2">No data yet</p>
              <p className="text-muted-foreground text-sm">Post a job and collect applicants to see analytics here.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Applications over time */}
            <Card className="border-border/50 lg:col-span-2">
              <CardHeader>
                <CardTitle className="font-serif text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-accent" /> Applications Over Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <AreaChart data={timelineData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <RTooltip
                      contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }}
                    />
                    <Area type="monotone" dataKey="cumulative" stroke="var(--accent)" fill="var(--accent)" fillOpacity={0.1} strokeWidth={2} name="Total" />
                    <Line type="monotone" dataKey="count" stroke="var(--muted-foreground)" strokeWidth={1} dot={false} name="Daily" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tier distribution pie */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Tier Distribution</CardTitle>
              </CardHeader>
              <CardContent className="flex items-center justify-center">
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={tierData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {tierData.map((entry, i) => (
                        <Cell key={entry.name} fill={PIE_COLORS[i]} />
                      ))}
                    </Pie>
                    <RTooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Score distribution */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Score Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="range" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <RTooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Top skills */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Top Skills</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={skillsData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis type="number" tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <YAxis type="category" dataKey="skill" tick={{ fontSize: 10 }} width={80} stroke="var(--muted-foreground)" />
                    <RTooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" fill="var(--top)" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Education breakdown */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="font-serif text-lg">Education Levels</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={educationData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="edu" tick={{ fontSize: 10 }} stroke="var(--muted-foreground)" />
                    <YAxis tick={{ fontSize: 11 }} stroke="var(--muted-foreground)" />
                    <RTooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8, fontSize: 12 }} />
                    <Bar dataKey="count" fill="var(--match)" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  )
}
