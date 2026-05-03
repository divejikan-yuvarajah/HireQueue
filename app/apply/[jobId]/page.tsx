"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import confetti from "canvas-confetti"
import { Briefcase, MapPin, CheckCircle2, ArrowLeft } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { SkillInput } from "@/components/skill-input"
import { supabase } from "@/lib/supabase"
import { scoreApplicant } from "@/lib/scoring"
import type { Education, Job } from "@/lib/types"
import { EDUCATION_LABEL } from "@/lib/types"

type Form = {
  name: string
  email: string
  experience_yrs: number
  skills: string[]
  education: Education
  location: string
  cover_note: string
}

const EMPTY_FORM: Form = {
  name: "",
  email: "",
  experience_yrs: 0,
  skills: [],
  education: "bachelor",
  location: "",
  cover_note: "",
}

export default function ApplyPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const [job, setJob] = useState<Job | null>(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [form, setForm] = useState<Form>(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ name: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      const { data, error } = await supabase
        .from("jobs")
        .select("*")
        .eq("id", jobId)
        .maybeSingle()
      if (cancelled) return
      if (error || !data) {
        setNotFound(true)
      } else {
        setJob(data as Job)
      }
      setLoading(false)
    }
    if (jobId) load()
    return () => {
      cancelled = true
    }
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
      const { error } = await supabase.from("applicants").insert({
        job_id: job.id,
        name: form.name.trim(),
        email: form.email.trim(),
        experience_yrs: form.experience_yrs,
        skills: form.skills,
        education: form.education,
        location: form.location.trim(),
        cover_note: form.cover_note.trim(),
        score,
        tier,
        score_breakdown: breakdown,
      })
      if (error) throw error
      setSuccess({ name: form.name.trim() })
      // Confetti!
      const burst = (x: number) =>
        confetti({
          particleCount: 60,
          spread: 70,
          origin: { x, y: 0.5 },
          colors: ["#4f46e5", "#7c3aed", "#059669", "#d97706"],
        })
      burst(0.2)
      setTimeout(() => burst(0.8), 150)
    } catch (err) {
      toast.error((err as Error).message ?? "Submission failed")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-2xl card-shadow">
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
    )
  }

  if (notFound || !job) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md card-shadow">
          <CardContent className="p-10 text-center space-y-4">
            <h1 className="text-2xl font-bold">Job not found</h1>
            <p className="text-muted-foreground">
              This application link is invalid or the job has been removed.
            </p>
            <Button asChild>
              <Link href="/">Go home</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (success) {
    return (
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center px-4 py-10">
        <Card className="w-full max-w-md card-shadow-lg">
          <CardContent className="p-10 text-center space-y-5 fade-in-up">
            <div className="mx-auto h-20 w-20 rounded-full bg-success/10 text-success flex items-center justify-center">
              <CheckCircle2 className="h-12 w-12" />
            </div>
            <div className="space-y-2">
              <h1 className="text-3xl font-bold">Application submitted!</h1>
              <p className="text-muted-foreground text-pretty">
                Thanks, <span className="font-semibold text-foreground">{success.name}</span>.
                Your application for{" "}
                <span className="font-semibold text-foreground">{job.title}</span> at{" "}
                <span className="font-semibold text-foreground">{job.company}</span> has been
                received and scored. Good luck!
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-secondary/30 px-4 py-10">
      <div className="max-w-2xl mx-auto">
        {/* Job banner */}
        <Card className="card-shadow mb-6 overflow-hidden">
          <div className="h-1.5 bg-gradient-to-r from-primary to-violet" />
          <CardContent className="p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm text-primary font-medium">
              <Briefcase className="h-4 w-4" />
              You&apos;re applying for
            </div>
            <div>
              <h1 className="text-2xl font-bold">{job.title}</h1>
              <p className="text-muted-foreground">{job.company}</p>
            </div>
            {job.location && (
              <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                {job.location}
              </div>
            )}
            {job.required_skills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-2">
                {job.required_skills.map((s, i) => (
                  <Badge key={`${s}-${i}`} variant="secondary" className="bg-primary/10 text-primary border-0">
                    {s}
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <form onSubmit={handleSubmit}>
          <Card className="card-shadow">
            <CardContent className="p-6 sm:p-8 space-y-5">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={form.name}
                  onChange={(e) => update("name", e.target.value)}
                  placeholder="Jamie Lee"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={form.email}
                  onChange={(e) => update("email", e.target.value)}
                  placeholder="jamie@example.com"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="experience">Years of Experience</Label>
                  <Input
                    id="experience"
                    type="number"
                    min={0}
                    step={0.5}
                    value={form.experience_yrs}
                    onChange={(e) =>
                      update("experience_yrs", Number(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Education Level</Label>
                  <Select
                    value={form.education}
                    onValueChange={(v) => update("education", v as Education)}
                  >
                    <SelectTrigger id="education">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(EDUCATION_LABEL) as Education[]).map((k) => (
                        <SelectItem key={k} value={k}>
                          {EDUCATION_LABEL[k]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="skills">Your Skills</Label>
                <SkillInput
                  id="skills"
                  value={form.skills}
                  onChange={(next) => update("skills", next)}
                  placeholder="Type a skill and press Enter"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Current Location</Label>
                <Input
                  id="location"
                  value={form.location}
                  onChange={(e) => update("location", e.target.value)}
                  placeholder="Berlin"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cover_note">Why should we hire you? (optional)</Label>
                <Textarea
                  id="cover_note"
                  rows={4}
                  value={form.cover_note}
                  onChange={(e) => update("cover_note", e.target.value)}
                  placeholder="Tell us a bit about your background, what excites you about this role, and what you'd bring..."
                />
              </div>

              <Button type="submit" size="lg" className="w-full gap-2" disabled={submitting}>
                {submitting && <Spinner />}
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>

              <Link
                href="/"
                className="flex items-center justify-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to home
              </Link>
            </CardContent>
          </Card>
        </form>
      </div>
    </div>
  )
}
