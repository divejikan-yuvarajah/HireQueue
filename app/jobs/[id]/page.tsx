"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { QRCodeSVG } from "qrcode.react"
import {
  Briefcase,
  MapPin,
  Copy,
  Check,
  Download,
  ArrowLeft,
  Users,
  Trophy,
  Radio,
  DollarSign,
} from "lucide-react"
import useSWR from "swr"
import { toast } from "sonner"
import { AppShell } from "@/components/app-shell"
import { ApplicantCard } from "@/components/applicant-card"
import { ScoreRing } from "@/components/score-ring"
import { TierBadge } from "@/components/tier-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { supabase } from "@/lib/supabase"
import { initialsOf, avatarColor } from "@/lib/avatar"
import type { Job, Applicant, Tier } from "@/lib/types"
import { cn } from "@/lib/utils"

type SortMode = "score_desc" | "score_asc" | "date_desc"

async function fetchJobWithApplicants(jobId: string) {
  const [{ data: job, error: jobErr }, { data: applicants, error: appErr }] = await Promise.all([
    supabase.from("jobs").select("*").eq("id", jobId).maybeSingle(),
    supabase.from("applicants").select("*").eq("job_id", jobId),
  ])
  if (jobErr || !job) throw new Error("Job not found")
  if (appErr) throw appErr
  return { job: job as Job, applicants: (applicants ?? []) as Applicant[] }
}

export default function LeaderboardPage() {
  const { id: jobId } = useParams<{ id: string }>()
  const { data, error, isLoading, mutate } = useSWR(
    jobId ? `job-${jobId}` : null,
    () => (jobId ? fetchJobWithApplicants(jobId) : null),
    { refreshInterval: 0 },
  )

  const [copied, setCopied] = useState(false)
  const [tierFilter, setTierFilter] = useState<"all" | Tier>("all")
  const [sortMode, setSortMode] = useState<SortMode>("score_desc")
  const [newApplicants, setNewApplicants] = useState<Set<string>>(new Set())

  // Realtime
  useEffect(() => {
    if (!jobId) return
    const channel = supabase
      .channel(`applicants:${jobId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "applicants", filter: `job_id=eq.${jobId}` },
        (payload) => {
          mutate()
          const rec = payload.new as { id?: string; name?: string }
          if (rec?.id) {
            toast.success(`New applicant: ${rec.name ?? "Unknown"}`)
            setNewApplicants((prev) => new Set(prev).add(rec.id!))
            setTimeout(() => {
              setNewApplicants((prev) => {
                const next = new Set(prev)
                next.delete(rec.id!)
                return next
              })
            }, 4000)
          }
        },
      )
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [jobId, mutate])

  const sorted = useMemo(() => {
    if (!data) return []
    let list = data.applicants
    if (tierFilter !== "all") list = list.filter((a) => a.tier === tierFilter)
    if (sortMode === "score_desc") list = [...list].sort((a, b) => b.score - a.score)
    else if (sortMode === "score_asc") list = [...list].sort((a, b) => a.score - b.score)
    else list = [...list].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    return list
  }, [data, tierFilter, sortMode])

  const applyUrl = data && typeof window !== "undefined" ? `${window.location.origin}/apply/${jobId}` : ""

  async function copyLink() {
    if (!applyUrl) return
    try {
      await navigator.clipboard.writeText(applyUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
      toast.success("Link copied!")
    } catch { toast.error("Couldn't copy link") }
  }

  function downloadCSV() {
    if (!data) return
    const rows = [
      ["Rank", "Name", "Email", "Score", "Tier", "Experience", "Education", "Location", "Applied"],
      ...sorted.map((a, i) => [
        String(i + 1), a.name, a.email, String(a.score), a.tier,
        String(a.experience_yrs), a.education, a.location, a.created_at,
      ]),
    ]
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${data.job.title.replace(/\W+/g, "_")}_applicants.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <AppShell>
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
          <Skeleton className="h-8 w-1/2 mb-4" />
          <Skeleton className="h-5 w-1/3 mb-8" />
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </AppShell>
    )
  }

  if (error || !data) {
    return (
      <AppShell>
        <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
          <Card className="border-destructive/30">
            <CardContent className="p-6 text-destructive space-y-2">
              <p className="font-semibold font-serif">Job not found</p>
              <p className="text-sm">{error ? (error as Error).message : "This job doesn't exist."}</p>
              <Button asChild variant="outline" className="mt-2 gap-1.5">
                <Link href="/dashboard"><ArrowLeft className="h-4 w-4" /> Back to dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </AppShell>
    )
  }

  const { job, applicants } = data
  const topThree = [...applicants].sort((a, b) => b.score - a.score).slice(0, 3)
  const counts = {
    all: applicants.length,
    top: applicants.filter((a) => a.tier === "top").length,
    match: applicants.filter((a) => a.tier === "match").length,
    reach: applicants.filter((a) => a.tier === "reach").length,
  }
  const avgScore = applicants.length ? applicants.reduce((sum, a) => sum + a.score, 0) / applicants.length : 0

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
        </Link>

        {/* Job header */}
        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-top/10 text-top text-xs font-mono">
                <Radio className="h-3 w-3 animate-pulse" /> Live
              </span>
            </div>
            <h1 className="font-serif text-3xl font-bold tracking-tight mb-1">{job.title}</h1>
            <p className="text-muted-foreground text-lg">{job.company}</p>
            <div className="flex flex-wrap gap-3 text-sm text-muted-foreground mt-2">
              {job.location && (<span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>)}
              {job.job_type && (<span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.job_type}</span>)}
              {job.salary_min && job.salary_max && (
                <span className="flex items-center gap-1">
                  <DollarSign className="h-3.5 w-3.5" />
                  ${(job.salary_min / 1000).toFixed(0)}k&ndash;${(job.salary_max / 1000).toFixed(0)}k
                </span>
              )}
            </div>
          </div>

          {/* QR + actions */}
          <div className="flex items-start gap-4">
            {applyUrl && (
              <div className="p-2 rounded-lg border border-border/50 bg-background">
                <QRCodeSVG value={applyUrl} size={80} level="M" />
              </div>
            )}
            <div className="flex flex-col gap-2">
              <Button variant="outline" onClick={copyLink} className="gap-1.5 text-sm">
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy link"}
              </Button>
              {applicants.length > 0 && (
                <Button variant="outline" onClick={downloadCSV} className="gap-1.5 text-sm">
                  <Download className="h-3.5 w-3.5" /> Export CSV
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          {[
            { label: "Total", value: applicants.length, sub: "applicants" },
            { label: "Avg Score", value: avgScore.toFixed(1), sub: "out of 100" },
            { label: "Top Tier", value: counts.top, sub: "candidates" },
            { label: "Match", value: counts.match, sub: "candidates" },
          ].map((s) => (
            <Card key={s.label} className="border-border/50">
              <CardContent className="p-4">
                <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">{s.label}</p>
                <p className="font-serif text-2xl font-bold tabular-nums mt-1">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.sub}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Podium */}
        {topThree.length >= 3 && (
          <Card className="border-border/50 mb-8 overflow-hidden">
            <div className="h-1 bg-accent" />
            <CardHeader>
              <CardTitle className="font-serif text-xl flex items-center gap-2">
                <Trophy className="h-5 w-5 text-accent" /> Top Candidates
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-center gap-4 sm:gap-8 py-4">
                {[1, 0, 2].map((idx) => {
                  const a = topThree[idx]
                  if (!a) return null
                  const isFirst = idx === 0
                  return (
                    <div key={a.id} className="flex flex-col items-center gap-2">
                      <ScoreRing score={a.score} size={isFirst ? 72 : 56} strokeWidth={isFirst ? 4 : 3} />
                      <div
                        className={cn(
                          "h-10 w-10 rounded-full flex items-center justify-center text-background font-semibold text-xs",
                          avatarColor(a.email || a.name),
                        )}
                      >
                        {initialsOf(a.name)}
                      </div>
                      <div className="text-center">
                        <p className={cn("font-semibold truncate max-w-[120px]", isFirst ? "text-sm" : "text-xs")}>
                          {a.name}
                        </p>
                        <TierBadge tier={a.tier} size="sm" />
                      </div>
                      <div
                        className={cn(
                          "w-20 sm:w-24 rounded-t-lg flex items-center justify-center font-mono text-sm font-bold",
                          isFirst
                            ? "h-28 bg-accent text-accent-foreground"
                            : idx === 1
                              ? "h-20 bg-muted text-muted-foreground"
                              : "h-14 bg-muted/60 text-muted-foreground",
                        )}
                      >
                        #{idx + 1}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Empty state */}
        {applicants.length === 0 && (
          <Card className="border-border/50">
            <CardContent className="p-10">
              <Empty>
                <EmptyHeader>
                  <div className="mx-auto h-16 w-16 rounded-2xl bg-accent/10 text-accent flex items-center justify-center mb-2">
                    <Users className="h-8 w-8" />
                  </div>
                  <EmptyTitle className="font-serif">No applicants yet</EmptyTitle>
                  <EmptyDescription>
                    Share your application link to start receiving scored candidates in real time.
                  </EmptyDescription>
                </EmptyHeader>
                <div className="flex flex-col sm:flex-row gap-2 justify-center mt-4">
                  <Button variant="outline" onClick={copyLink} className="gap-1.5">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Copied" : "Copy applicant link"}
                  </Button>
                </div>
              </Empty>
            </CardContent>
          </Card>
        )}

        {/* Filters + List */}
        {applicants.length > 0 && (
          <>
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Tabs value={tierFilter} onValueChange={(v) => setTierFilter(v as typeof tierFilter)}>
                <TabsList>
                  <TabsTrigger value="all" className="font-mono text-xs">All ({counts.all})</TabsTrigger>
                  <TabsTrigger value="top" className="font-mono text-xs">Top ({counts.top})</TabsTrigger>
                  <TabsTrigger value="match" className="font-mono text-xs">Match ({counts.match})</TabsTrigger>
                  <TabsTrigger value="reach" className="font-mono text-xs">Reach ({counts.reach})</TabsTrigger>
                </TabsList>
              </Tabs>
              <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score_desc">Score: High to Low</SelectItem>
                  <SelectItem value="score_asc">Score: Low to High</SelectItem>
                  <SelectItem value="date_desc">Newest First</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {sorted.length === 0 ? (
              <Card className="border-border/50">
                <CardContent className="p-8 text-center text-muted-foreground font-mono text-sm">
                  No applicants match this filter.
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {sorted.map((applicant, i) => (
                  <ApplicantCard
                    key={applicant.id}
                    applicant={applicant}
                    rank={i + 1}
                    weights={job.weights}
                    isNew={newApplicants.has(applicant.id)}
                    index={i}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </AppShell>
  )
}
