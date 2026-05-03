"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Briefcase,
  Sliders,
  Eye,
  MapPin,
  DollarSign,
  Building2,
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
import { Spinner } from "@/components/ui/spinner"
import { SkillInput } from "@/components/skill-input"
import { AppShell } from "@/components/app-shell"
import { TierBadge } from "@/components/tier-badge"
import { ScoreRing } from "@/components/score-ring"
import { supabase } from "@/lib/supabase"
import { scoreApplicant } from "@/lib/scoring"
import type { Education, Job, Tier } from "@/lib/types"
import { EDUCATION_LABEL } from "@/lib/types"

const STEPS = [
  { label: "Details", icon: Briefcase },
  { label: "Skills & Weights", icon: Sliders },
  { label: "Preview", icon: Eye },
]

const DEPARTMENTS = [
  "Engineering", "Design", "Product", "Marketing",
  "Sales", "Operations", "Finance", "Legal", "HR", "Other",
]

const JOB_TYPES = [
  { value: "full-time", label: "Full-time" },
  { value: "part-time", label: "Part-time" },
  { value: "contract", label: "Contract" },
  { value: "internship", label: "Internship" },
]

type FormState = {
  title: string
  company: string
  description: string
  location: string
  department: string
  job_type: string
  salary_min: number
  salary_max: number
  education_requirement: Education
  required_skills: string[]
  nice_to_have_skills: string[]
  min_experience_yrs: number
  preferred_location: string
  weights: { experience: number; skills: number; education: number; location: number }
}

const DEFAULT: FormState = {
  title: "",
  company: "",
  description: "",
  location: "",
  department: "Engineering",
  job_type: "full-time",
  salary_min: 80000,
  salary_max: 140000,
  education_requirement: "bachelor",
  required_skills: [],
  nice_to_have_skills: [],
  min_experience_yrs: 2,
  preferred_location: "",
  weights: { experience: 35, skills: 35, education: 15, location: 15 },
}

const SAMPLE_APPLICANTS = [
  { name: "Alex Rivera", experience_yrs: 6, skills: ["React", "TypeScript", "Node.js", "PostgreSQL"], education: "master" as Education, location: "San Francisco" },
  { name: "Morgan Chen", experience_yrs: 2, skills: ["React", "CSS"], education: "bachelor" as Education, location: "Austin" },
  { name: "Jamie Park", experience_yrs: 0.5, skills: ["HTML", "JavaScript"], education: "high_school" as Education, location: "Remote" },
]

export default function NewJobPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [form, setForm] = useState<FormState>(DEFAULT)
  const [submitting, setSubmitting] = useState(false)

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function updateWeight(key: keyof FormState["weights"], val: number) {
    setForm((prev) => ({
      ...prev,
      weights: { ...prev.weights, [key]: val },
    }))
  }

  const totalWeight = Object.values(form.weights).reduce((a, b) => a + b, 0)

  const sampleScores = useMemo(() => {
    const fakeJob = { ...form, id: "", created_at: "" } as unknown as Job
    return SAMPLE_APPLICANTS.map((a) => ({
      ...a,
      ...scoreApplicant(a, fakeJob),
    }))
  }, [form])

  function canNext(): boolean {
    if (step === 0) return !!(form.title.trim() && form.company.trim())
    if (step === 1) return form.required_skills.length > 0 && totalWeight === 100
    return true
  }

  async function handlePublish() {
    setSubmitting(true)
    try {
      const { data, error } = await supabase
        .from("jobs")
        .insert({
          title: form.title.trim(),
          company: form.company.trim(),
          description: form.description.trim(),
          location: form.location.trim(),
          department: form.department,
          job_type: form.job_type,
          salary_min: form.salary_min,
          salary_max: form.salary_max,
          education_requirement: form.education_requirement,
          required_skills: form.required_skills,
          nice_to_have_skills: form.nice_to_have_skills,
          min_experience_yrs: form.min_experience_yrs,
          preferred_location: form.preferred_location.trim() || form.location.trim(),
          weights: form.weights,
        })
        .select("id")
        .single()
      if (error) throw error
      toast.success("Job published successfully!")
      router.push(`/jobs/${data.id}`)
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to publish job")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AppShell>
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to dashboard
        </Link>

        <h1 className="font-serif text-3xl font-bold tracking-tight mb-8">
          Post a new position
        </h1>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => {
            const Icon = s.icon
            const done = i < step
            const active = i === step
            return (
              <div key={s.label} className="flex items-center gap-2">
                {i > 0 && (
                  <div className={`h-px w-8 transition-colors ${done ? "bg-accent" : "bg-border"}`} />
                )}
                <button
                  type="button"
                  onClick={() => i < step && setStep(i)}
                  disabled={i > step}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-mono uppercase tracking-widest transition-all ${
                    active
                      ? "bg-accent text-accent-foreground"
                      : done
                        ? "bg-accent/10 text-accent cursor-pointer hover:bg-accent/20"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {done ? <Check className="h-3.5 w-3.5" /> : <Icon className="h-3.5 w-3.5" />}
                  <span className="hidden sm:inline">{s.label}</span>
                </button>
              </div>
            )
          })}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2 }}
          >
            {/* Step 0: Details */}
            {step === 0 && (
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="font-serif text-xl">Job Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">Job Title</Label>
                      <Input id="title" value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="Senior Frontend Engineer" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Company</Label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="company" value={form.company} onChange={(e) => update("company", e.target.value)} placeholder="Acme Inc." className="pl-9" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="Describe the role, responsibilities, and what makes this position exciting..." />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="location" value={form.location} onChange={(e) => update("location", e.target.value)} placeholder="San Francisco, CA" className="pl-9" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Select value={form.department} onValueChange={(v) => update("department", v)}>
                        <SelectTrigger id="department"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.map((d) => (<SelectItem key={d} value={d}>{d}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="job_type">Type</Label>
                      <Select value={form.job_type} onValueChange={(v) => update("job_type", v)}>
                        <SelectTrigger id="job_type"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {JOB_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary_min">Salary Min</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="salary_min" type="number" min={0} step={5000} value={form.salary_min} onChange={(e) => update("salary_min", Number(e.target.value) || 0)} className="pl-9" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary_max">Salary Max</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input id="salary_max" type="number" min={0} step={5000} value={form.salary_max} onChange={(e) => update("salary_max", Number(e.target.value) || 0)} className="pl-9" />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 1: Skills & Weights */}
            {step === 1 && (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">Required Skills & Criteria</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="space-y-2">
                      <Label>Required Skills</Label>
                      <SkillInput value={form.required_skills} onChange={(v) => update("required_skills", v)} placeholder="React, TypeScript, Node.js..." />
                    </div>
                    <div className="space-y-2">
                      <Label>Nice-to-Have Skills</Label>
                      <SkillInput value={form.nice_to_have_skills} onChange={(v) => update("nice_to_have_skills", v)} placeholder="GraphQL, AWS, Docker..." />
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="min_exp">Min Experience (years)</Label>
                        <Input id="min_exp" type="number" min={0} step={0.5} value={form.min_experience_yrs} onChange={(e) => update("min_experience_yrs", Number(e.target.value) || 0)} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="edu_req">Education Requirement</Label>
                        <Select value={form.education_requirement} onValueChange={(v) => update("education_requirement", v as Education)}>
                          <SelectTrigger id="edu_req"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {(Object.keys(EDUCATION_LABEL) as Education[]).map((k) => (
                              <SelectItem key={k} value={k}>{EDUCATION_LABEL[k]}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="pref_loc">Preferred Location</Label>
                      <Input id="pref_loc" value={form.preferred_location} onChange={(e) => update("preferred_location", e.target.value)} placeholder="Same as job location if blank" />
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/50">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">Scoring Weights</CardTitle>
                    <p className="text-sm text-muted-foreground font-mono">
                      Total: {totalWeight}/100
                      {totalWeight !== 100 && <span className="text-destructive ml-2">Must equal 100</span>}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {([
                      { key: "experience" as const, label: "Experience", color: "bg-accent" },
                      { key: "skills" as const, label: "Skills Match", color: "bg-top" },
                      { key: "education" as const, label: "Education", color: "bg-match" },
                      { key: "location" as const, label: "Location", color: "bg-reach" },
                    ]).map(({ key, label, color }) => (
                      <div key={key} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium">{label}</span>
                          <span className="font-mono text-muted-foreground tabular-nums">{form.weights[key]}%</span>
                        </div>
                        <input
                          type="range"
                          min={0}
                          max={100}
                          step={5}
                          value={form.weights[key]}
                          onChange={(e) => updateWeight(key, Number(e.target.value))}
                          className="w-full accent-[var(--accent)]"
                        />
                        <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${form.weights[key]}%` }} />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Step 2: Preview */}
            {step === 2 && (
              <div className="grid gap-6 lg:grid-cols-5">
                <Card className="lg:col-span-3 border-border/50">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">Job Preview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h2 className="font-serif text-2xl font-bold">{form.title || "Untitled"}</h2>
                      <p className="text-muted-foreground">{form.company || "Company"}</p>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                      {form.location && (<span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {form.location}</span>)}
                      <span className="flex items-center gap-1"><Briefcase className="h-3.5 w-3.5" /> {form.job_type}</span>
                      <span className="flex items-center gap-1">
                        <DollarSign className="h-3.5 w-3.5" />
                        ${(form.salary_min / 1000).toFixed(0)}k&ndash;${(form.salary_max / 1000).toFixed(0)}k
                      </span>
                    </div>
                    {form.description && <p className="text-sm leading-relaxed whitespace-pre-wrap">{form.description}</p>}
                    <div className="pt-2">
                      <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Required Skills</p>
                      <div className="flex flex-wrap gap-1.5">
                        {form.required_skills.map((s) => (
                          <span key={s} className="px-2 py-0.5 text-xs font-mono rounded-full bg-accent/10 text-accent border border-accent/20">{s}</span>
                        ))}
                      </div>
                    </div>
                    {form.nice_to_have_skills.length > 0 && (
                      <div>
                        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Nice to Have</p>
                        <div className="flex flex-wrap gap-1.5">
                          {form.nice_to_have_skills.map((s) => (
                            <span key={s} className="px-2 py-0.5 text-xs font-mono rounded-full bg-muted text-muted-foreground border border-border">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="lg:col-span-2 border-border/50">
                  <CardHeader>
                    <CardTitle className="font-serif text-xl">Live Scoring Preview</CardTitle>
                    <p className="text-xs text-muted-foreground font-mono">3 sample candidates scored with your weights</p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {sampleScores.map((s, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-border/50 bg-card">
                        <ScoreRing score={s.score} size={48} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{s.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">{s.experience_yrs}y exp &middot; {EDUCATION_LABEL[s.education]}</p>
                        </div>
                        <TierBadge tier={s.tier as Tier} />
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/50">
          <Button variant="ghost" onClick={() => setStep((s) => s - 1)} disabled={step === 0} className="gap-1.5">
            <ArrowLeft className="h-4 w-4" /> Back
          </Button>
          {step < 2 ? (
            <Button onClick={() => setStep((s) => s + 1)} disabled={!canNext()} className="gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground">
              Next <ArrowRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handlePublish} disabled={submitting} className="gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground">
              {submitting && <Spinner />}
              {submitting ? "Publishing..." : "Publish Job"}
            </Button>
          )}
        </div>
      </div>
    </AppShell>
  )
}
