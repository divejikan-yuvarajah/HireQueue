"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import confetti from "canvas-confetti"
import { motion, AnimatePresence } from "framer-motion"
import {
  Briefcase,
  MapPin,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Send,
} from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Skeleton } from "@/components/ui/skeleton"
import { Spinner } from "@/components/ui/spinner"
import { SkillInput } from "@/components/skill-input"
import { ScoreRing } from "@/components/score-ring"
import { TierBadge } from "@/components/tier-badge"
import { MarketingNav } from "@/components/marketing-nav"
import { supabase } from "@/lib/supabase"
import { scoreApplicant } from "@/lib/scoring"
import type { Education, Job, Tier } from "@/lib/types"
import { EDUCATION_LABEL } from "@/lib/types"

type Form = {
  name: string
  email: string
  phone: string
  experience_yrs: number
  skills: string[]
  education: Education
  location: string
  country: string
  linkedin_url: string
  portfolio_url: string
  cover_note: string
  notice_period: string
  referral_source: string
}

const EMPTY_FORM: Form = {
  name: "",
  email: "",
  phone: "",
  experience_yrs: 0,
  skills: [],
  education: "bachelor",
  location: "",
  country: "",
  linkedin_url: "",
  portfolio_url: "",
  cover_note: "",
  notice_period: "2 weeks",
  referral_source: "Other",
}

const NOTICE_PERIODS = ["Immediately", "1 week", "2 weeks", "1 month", "2 months", "3+ months"]
const REFERRAL_SOURCES = ["LinkedIn", "Job Board", "Referral", "Company Website", "Social Media", "Other"]

type SuccessData = {
  name: string
  score: number
  tier: Tier
  breakdown: Record<string, number>
}

export default function ApplyPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [form, setForm] = useState<Form>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<SuccessData | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .maybeSingle()
      if (cancelled) return
      if (error || !data) setNotFound(true)
      else setJob(data as Job)
      setLoading(false)
    }
    if (jobId) load()
    return () => { cancelled = true }
  }, [jobId])

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!job) return
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Please provide your name and email.")
      return
    }
    setSubmitting(true)
    try {
      const { score, tier, breakdown } = scoreApplicant(form, job)
      const appNum = `HQ-${Date.now().toString(36).toUpperCase()}`
      const { error } = await supabase.from("applicants").insert({
        job_id: job.id,
        name: form.name.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        experience_yrs: form.experience_yrs,
        skills: form.skills,
        education: form.education,
        location: form.location.trim(),
        country: form.country.trim(),
        linkedin_url: form.linkedin_url.trim(),
        portfolio_url: form.portfolio_url.trim(),
        cover_note: form.cover_note.trim(),
        notice_period: form.notice_period,
        referral_source: form.referral_source,
        application_number: appNum,
        score,
        tier,
        score_breakdown: breakdown,
      })
      if (error) throw error
      setSuccess({ name: form.name.trim(), score, tier: tier as Tier, breakdown })
      const burst = (x: number) =>
        confetti({
          particleCount: 80,
          spread: 80,
          origin: { x, y: 0.6 },
          colors: ["#b85b3f", "#2d5a3d", "#1a1815", "#d4a574"],
        })
      burst(0.25)
      setTimeout(() => burst(0.75), 200)
    } catch (err) {
      toast.error((err as Error).message ?? "Submission failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <MarketingNav />
        <div className="flex items-center justify-center px-4 py-20">
          <Card className="w-full max-w-2xl border-border/50">
            <CardContent className="p-8 space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-5 w-1/3" />
              <div className="space-y-3 pt-4">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (notFound || !job) {
    return (
      <div className="min-h-screen bg-background">
        <MarketingNav />
        <div className="flex items-center justify-center px-4 py-20">
          <Card className="w-full max-w-md border-border/50">
            <CardContent className="p-10 text-center space-y-4">
              <h1 className="font-serif text-2xl font-bold">Job not found</h1>
              <p className="text-muted-foreground">
                This application link is invalid or the job has been removed.
              </p>
              <Button asChild variant="outline">
                <Link href="/">Go home</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <MarketingNav />
      <div className="max-w-2xl mx-auto px-4 py-12">
        <AnimatePresence mode="wait">
          {success ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Card className="border-border/50 overflow-hidden">
                <div className="h-1 bg-top" />
                <CardContent className="p-8 sm:p-10 text-center space-y-6">
                  <div className="mx-auto">
                    <ScoreRing score={success.score} size={120} strokeWidth={6} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-center gap-2">
                      <h1 className="font-serif text-3xl font-bold">Application submitted</h1>
                      <TierBadge tier={success.tier} />
                    </div>
                    <p className="text-muted-foreground text-pretty">
                      Thanks, <span className="font-semibold text-foreground">{success.name}</span>.
                      Your application for{" "}
                      <span className="font-semibold text-foreground">{job.title}</span> at{" "}
                      <span className="font-semibold text-foreground">{job.company}</span> has been
                      received and scored.
                    </p>
                  </div>

                  {/* Score breakdown */}
                  <div className="grid grid-cols-2 gap-3 text-left max-w-sm mx-auto">
                    {Object.entries(success.breakdown).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-muted/50 border border-border/50">
                        <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground capitalize">{key}</span>
                        <span className="font-mono text-sm font-semibold tabular-nums">{(val as number).toFixed(0)}</span>
                      </div>
                    ))}
                  </div>

                  <Button asChild variant="outline" className="gap-1.5">
                    <Link href="/">
                      <ArrowLeft className="h-3.5 w-3.5" />
                      Back to home
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ) : (
            <motion.div key="form" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              {/* Job banner */}
              <Card className="border-border/50 mb-6 overflow-hidden">
                <div className="h-1 bg-accent" />
                <CardContent className="p-6 space-y-3">
                  <p className="text-xs font-mono uppercase tracking-widest text-accent">
                    You&apos;re applying for
                  </p>
                  <div>
                    <h1 className="font-serif text-2xl font-bold">{job.title}</h1>
                    <p className="text-muted-foreground">{job.company}</p>
                  </div>
                  <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                    {job.location && (
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {job.location}</span>
                    )}
                    {job.job_type && (
                      <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {job.job_type}</span>
                    )}
                    {job.salary_min && job.salary_max && (
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        ${(job.salary_min / 1000).toFixed(0)}k&ndash;${(job.salary_max / 1000).toFixed(0)}k
                      </span>
                    )}
                  </div>
                  {job.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {job.required_skills.map((s, i) => (
                        <span key={`${s}-${i}`} className="px-2 py-0.5 text-xs font-mono rounded-full bg-accent/10 text-accent border border-accent/20">{s}</span>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Application form */}
              <form onSubmit={handleSubmit}>
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">Your Application</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input id="name" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Jamie Lee" required />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input id="email" type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="jamie@example.com" required />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Phone (optional)</Label>
                        <Input id="phone" type="tel" value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+1 555 123 4567" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="experience">Years of Experience</Label>
                        <Input id="experience" type="number" min={0} step={0.5} value={form.experience_yrs} onChange={(e) => update("experience_yrs", Number(e.target.value) || 0)} />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="education">Education Level</Label>
                        <Select value={form.education} onValueChange={(v) => update("education", v as Education)}>
                          <SelectTrigger id="education"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {(Object.keys(EDUCATION_LABEL) as Education[]).map((k) => (
                              <SelectItem key={k} value={k}>{EDUCATION_LABEL[k]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="notice">Notice Period</Label>
                        <Select value={form.notice_period} onValueChange={(v) => update("notice_period", v)}>
                          <SelectTrigger id="notice"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {NOTICE_PERIODS.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label>Your Skills</Label>
                      <SkillInput value={form.skills} onChange={(next) => update("skills", next)} placeholder="Type a skill and press Enter" />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="loc">City / Region</Label>
                        <Input id="loc" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="Berlin" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="country">Country</Label>
                        <Input id="country" value={form.country} onChange={(e) => update("country", e.target.value)} placeholder="Germany" />
                      </div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="linkedin">LinkedIn (optional)</Label>
                        <Input id="linkedin" value={form.linkedin_url} onChange={(e) => update("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/..." />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="portfolio">Portfolio (optional)</Label>
                        <Input id="portfolio" value={form.portfolio_url} onChange={(e) => update("portfolio_url", e.target.value)} placeholder="https://..." />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="referral">How did you hear about us?</Label>
                      <Select value={form.referral_source} onValueChange={(v) => update("referral_source", v)}>
                        <SelectTrigger id="referral"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {REFERRAL_SOURCES.map((r) => (<SelectItem key={r} value={r}>{r}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="cover_note">Why should we hire you? (optional)</Label>
                      <Textarea id="cover_note" rows={4} value={form.cover_note} onChange={(e) => update("cover_note", e.target.value)} placeholder="Tell us what excites you about this role..." />
                    </div>

                    <Button type="submit" size="lg" className="w-full gap-2 bg-accent hover:bg-accent/90 text-accent-foreground" disabled={submitting}>
                      {submitting ? <Spinner /> : <Send className="h-4 w-4" />}
                      {submitting ? "Submitting..." : "Submit Application"}
                    </Button>

                    <Link href="/" className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
                      <ArrowLeft className="h-3.5 w-3.5" /> Back to home
                    </Link>
                  </CardContent>
                </Card>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
