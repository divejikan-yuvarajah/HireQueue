"use client"

import Link from "next/link"
import useSWR from "swr"
import {
  Briefcase,
  Users,
  TrendingUp,
  Award,
  ClipboardList,
  Plus,
  MapPin,
  ArrowRight,
} from "lucide-react"
import { Navbar } from "@/components/navbar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty"
import { supabase } from "@/lib/supabase"
import type { Job, Applicant } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

type DashboardData = {
  jobs: (Job & { applicantCount: number; avgScore: number })[]
  totalApplicants: number
  avgScore: number
  topThisWeek: number
}

async function fetchDashboard(): Promise<DashboardData> {
  const [{ data: jobs, error: jobsErr }, { data: applicants, error: appErr }] = await Promise.all([
    supabase.from("jobs").select("*").order("created_at", { ascending: false }),
    supabase.from("applicants").select("job_id, score, created_at"),
  ])
  if (jobsErr) throw jobsErr
  if (appErr) throw appErr

  const apps = (applicants ?? []) as Pick<Applicant, "job_id" | "score" | "created_at">[]
  const jobsList = (jobs ?? []) as Job[]

  const grouped: Record<string, { count: number; total: number }> = {}
  for (const a of apps) {
    if (!grouped[a.job_id]) grouped[a.job_id] = { count: 0, total: 0 }
    grouped[a.job_id].count++
    grouped[a.job_id].total += Number(a.score) || 0
  }

  const enriched = jobsList.map((j) => {
    const g = grouped[j.id] ?? { count: 0, total: 0 }
    return {
      ...j,
      applicantCount: g.count,
      avgScore: g.count ? Math.round(g.total / g.count) : 0,
    }
  })

  const totalApplicants = apps.length
  const avgScore = totalApplicants
    ? Math.round(apps.reduce((s, a) => s + (Number(a.score) || 0), 0) / totalApplicants)
    : 0

  const oneWeekAgo = Date.now() - 7 * 24 * 60 * 60 * 1000
  const topThisWeek = apps.filter(
    (a) => new Date(a.created_at).getTime() >= oneWeekAgo && Number(a.score) >= 75,
  ).length

  return { jobs: enriched, totalApplicants, avgScore, topThisWeek }
}

export default function DashboardPage() {
  const { data, error, isLoading } = useSWR("dashboard", fetchDashboard, {
    refreshInterval: 5000,
  })

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <main className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Manage your jobs and review ranked applicants.
            </p>
          </div>
          <Button asChild className="gap-2">
            <Link href="/jobs/new">
              <Plus className="h-4 w-4" />
              New Job
            </Link>
          </Button>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          <StatCard
            icon={Briefcase}
            label="Total Jobs Posted"
            value={isLoading ? null : data?.jobs.length ?? 0}
            tone="primary"
          />
          <StatCard
            icon={Users}
            label="Total Applicants"
            value={isLoading ? null : data?.totalApplicants ?? 0}
            tone="violet"
          />
          <StatCard
            icon={TrendingUp}
            label="Average Match Score"
            value={isLoading ? null : `${data?.avgScore ?? 0}%`}
            tone="success"
          />
          <StatCard
            icon={Award}
            label="Top Applicants This Week"
            value={isLoading ? null : data?.topThisWeek ?? 0}
            tone="warning"
          />
        </div>

        {/* Jobs list */}
        <div className="space-y-4">
          {error && (
            <Card className="border-danger/30 bg-danger/5">
              <CardContent className="p-6 text-danger">
                Couldn&apos;t load jobs. {(error as Error).message}
              </CardContent>
            </Card>
          )}

          {isLoading && (
            <div className="grid gap-4 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="card-shadow">
                  <CardContent className="p-6 space-y-3">
                    <Skeleton className="h-5 w-2/3" />
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-2 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!isLoading && data && data.jobs.length === 0 && (
            <Card className="card-shadow">
              <CardContent className="p-10">
                <Empty>
                  <EmptyHeader>
                    <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                      <ClipboardList className="h-8 w-8" />
                    </div>
                    <EmptyTitle>No jobs yet</EmptyTitle>
                    <EmptyDescription>
                      Create your first job posting to start collecting ranked applicants.
                    </EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent>
                    <Button asChild className="gap-2">
                      <Link href="/jobs/new">
                        <Plus className="h-4 w-4" />
                        Post your first job
                      </Link>
                    </Button>
                  </EmptyContent>
                </Empty>
              </CardContent>
            </Card>
          )}

          {!isLoading && data && data.jobs.length > 0 && (
            <div className="grid gap-4 md:grid-cols-2">
              {data.jobs.map((job, i) => (
                <Card
                  key={job.id}
                  className="card-shadow hover:card-shadow-lg fade-in-up group"
                  style={{ animationDelay: `${i * 50}ms` }}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="space-y-1 min-w-0">
                        <h3 className="font-semibold text-lg truncate">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">{job.company}</p>
                      </div>
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-0 shrink-0">
                        {job.applicantCount} {job.applicantCount === 1 ? "applicant" : "applicants"}
                      </Badge>
                    </div>

                    <div className="flex flex-wrap gap-2 text-xs">
                      {job.location && (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          {job.location}
                        </span>
                      )}
                      <span className="text-muted-foreground">
                        Posted {formatDistanceToNow(new Date(job.created_at), { addSuffix: true })}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Average match score</span>
                        <span className="font-semibold">{job.avgScore}%</span>
                      </div>
                      <Progress value={job.avgScore} className="h-2" />
                    </div>

                    <Button asChild variant="outline" className="w-full gap-2 group-hover:border-primary/50">
                      <Link href={`/jobs/${job.id}`}>
                        View Applicants
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

type StatTone = "primary" | "violet" | "success" | "warning"
const TONE_STYLES: Record<StatTone, string> = {
  primary: "bg-primary/10 text-primary",
  violet: "bg-violet/10 text-violet",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
}

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string | null
  tone: StatTone
}) {
  return (
    <Card className="card-shadow">
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${TONE_STYLES[tone]}`}>
            <Icon className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <div className="text-sm text-muted-foreground">{label}</div>
            {value === null ? (
              <Skeleton className="h-7 w-16 mt-1" />
            ) : (
              <div className="text-2xl font-bold">{value}</div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
