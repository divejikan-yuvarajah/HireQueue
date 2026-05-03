"use client"

import { useEffect, useState, useMemo } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import {
  Briefcase,
  MapPin,
  Copy,
  Check,
  Download,
  ArrowLeft,
  Users,
} from "lucide-react"
import useSWR from "swr"
import { toast } from "sonner"
import { Navbar } from "@/components/navbar"
import { ApplicantCard } from "@/components/applicant-card"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
import type { Job, Applicant, Tier } from "@/lib/types"

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

  // Realtime subscription
  useEffect(() => {
    if (!jobId) return
    const channel = supabase
      .channel(`applicants:${jobId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "applicants",
          filter: `job_id=eq.${jobId}`,
        },
        (payload) => {
          mutate()
          if (payload.new && typeof payload.new === "object" && "id" in payload.new) {
            const id = (payload.new as { id: string }).id
            setNewApplicants((prev) => new Set(prev).add(id))
            setTimeout(() => {
              setNewApplicants((prev) => {
                const next = new Set(prev)
                next.delete(id)
                return next
              })
            }, 3000)
          }
        },
      )
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [jobId, mutate])

  const filtered = useMemo(() => {
    if (!data) return []
    let list = data.applicants
    if (tierFilter !== "all") list = list.filter((a) => a.tier === tierFilter)
    // Sort
    if (sortMode === "score_desc") list = [...list].sort((a, b) => b.score - a.score)
    else if (sortMode === "score_asc") list = [...list].sort((a, b) => a.score - b.score)
    else if (sortMode === "date_desc")
      list = [...list].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      )
    return list
  }, [data, tierFilter, sortMode])

  const applyUrl =
    data && typeof window !== "undefined" ? `${window.location.origin}/apply/${jobId}` : ""

  async function copyLink() {
    if (!applyUrl) return
    try {
      await navigator.clipboard.writeText(applyUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
      toast.success("Link copied!")
    } catch {
      toast.error("Couldn't copy link")
    }
  }

  function downloadCSV() {
    if (!data) return
    const rows = [
      ["Rank", "Name", "Email", "Score", "Tier", "Experience (yrs)", "Education", "Location"],
      ...filtered.map((a, i) => [
        String(i + 1),
        a.name,
        a.email,
        String(a.score),
        a.tier,
        String(a.experience_yrs),
        a.education,
        a.location,
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
      <div className="min-h-screen bg-secondary/30">
        <Navbar />
        <main className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <Card className="card-shadow mb-6">
            <CardContent className="p-6 space-y-3">
              <Skeleton className="h-7 w-1/2" />
              <Skeleton className="h-5 w-1/3" />
            </CardContent>
          </Card>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Card key={i} className="card-shadow">
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-secondary/30">
        <Navbar />
        <main className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <Card className="card-shadow border-danger/30 bg-danger/5">
            <CardContent className="p-6 text-danger space-y-2">
              <p className="font-semibold">Job not found</p>
              <p className="text-sm">
                {error ? (error as Error).message : "This job doesn't exist."}
              </p>
              <Button asChild variant="outline" className="mt-2">
                <Link href="/dashboard">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to dashboard
                </Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const { job, applicants } = data
  const counts = {
    all: applicants.length,
    safe: applicants.filter((a) => a.tier === "safe").length,
    borderline: applicants.filter((a) => a.tier === "borderline").length,
    reach: applicants.filter((a) => a.tier === "reach").length,
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <main className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        {/* Job header */}
        <Card className="card-shadow mb-6 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-primary to-violet" />
          <CardContent className="p-6 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2 min-w-0">
                <div className="flex items-center gap-2 text-sm text-primary font-medium">
                  <Briefcase className="h-4 w-4" />
                  Job posting
                </div>
                <h1 className="text-2xl font-bold">{job.title}</h1>
                <p className="text-muted-foreground">{job.company}</p>
                {job.location && (
                  <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4" />
                    {job.location}
                  </div>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="outline" onClick={copyLink} className="gap-2">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  {copied ? "Copied" : "Copy applicant link"}
                </Button>
                {applicants.length > 0 && (
                  <Button variant="outline" onClick={downloadCSV} className="gap-2">
                    <Download className="h-4 w-4" />
                    Export CSV
                  </Button>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/15 border-0">
                <Users className="h-3 w-3 mr-1.5" />
                {applicants.length} {applicants.length === 1 ? "applicant" : "applicants"}
              </Badge>
              {counts.safe > 0 && (
                <Badge className="bg-success/10 text-success border-0">
                  {counts.safe} Safe
                </Badge>
              )}
              {counts.borderline > 0 && (
                <Badge className="bg-warning/10 text-warning border-0">
                  {counts.borderline} Borderline
                </Badge>
              )}
              {counts.reach > 0 && (
                <Badge className="bg-danger/10 text-danger border-0">
                  {counts.reach} Reach
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {applicants.length === 0 && (
          <Card className="card-shadow">
            <CardContent className="p-10">
              <Empty>
                <EmptyHeader>
                  <div className="mx-auto h-16 w-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-2">
                    <Users className="h-8 w-8" />
                  </div>
                  <EmptyTitle>No applicants yet</EmptyTitle>
                  <EmptyDescription className="text-pretty">
                    Share your application link to get started. When applicants apply, they&apos;ll
                    appear here ranked automatically.
                  </EmptyDescription>
                </EmptyHeader>
                <div className="flex flex-col sm:flex-row gap-2 justify-center mt-2">
                  <Button variant="outline" onClick={copyLink} className="gap-2">
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                    {copied ? "Link copied" : "Copy applicant link"}
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/dashboard">
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back to dashboard
                    </Link>
                  </Button>
                </div>
              </Empty>
            </CardContent>
          </Card>
        )}

        {applicants.length > 0 && (
          <>
            {/* Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <Tabs value={tierFilter} onValueChange={(v) => setTierFilter(v as typeof tierFilter)}>
                <TabsList>
                  <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
                  <TabsTrigger value="safe">Safe ({counts.safe})</TabsTrigger>
                  <TabsTrigger value="borderline">Borderline ({counts.borderline})</TabsTrigger>
                  <TabsTrigger value="reach">Reach ({counts.reach})</TabsTrigger>
                </TabsList>
              </Tabs>

              <Select value={sortMode} onValueChange={(v) => setSortMode(v as SortMode)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="score_desc">Score (High → Low)</SelectItem>
                  <SelectItem value="score_asc">Score (Low → High)</SelectItem>
                  <SelectItem value="date_desc">Date (Newest first)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Leaderboard */}
            {filtered.length === 0 && (
              <Card className="card-shadow">
                <CardContent className="p-8 text-center text-muted-foreground">
                  No applicants match this filter.
                </CardContent>
              </Card>
            )}

            {filtered.length > 0 && (
              <div className="space-y-3">
                {filtered.map((applicant, i) => (
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
      </main>
    </div>
  )
}
