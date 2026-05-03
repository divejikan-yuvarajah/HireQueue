"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Rocket,
  Info,
  CheckCircle2,
  Copy,
  Check,
  AlertTriangle,
  MapPin,
  Briefcase,
  GraduationCap,
  Users,
} from "lucide-react"
import { toast } from "sonner"
import { Navbar } from "@/components/navbar"
import { SkillInput } from "@/components/skill-input"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/lib/supabase"

type Form = {
  title: string
  company: string
  description: string
  location: string
  required_skills: string[]
  min_experience_yrs: number
  preferred_location: string
  weights: {
    experience: number
    skills: number
    education: number
    location: number
  }
}

export default function NewJobPage() {
  const router = useRouter()
  const [form, setForm] = useState<Form>({
    title: "",
    company: "",
    description: "",
    location: "",
    required_skills: [],
    min_experience_yrs: 2,
    preferred_location: "",
    weights: { experience: 35, skills: 35, education: 15, location: 15 },
  })
  const [submitting, setSubmitting] = useState(false)
  const [createdId, setCreatedId] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const totalWeight = useMemo(
    () =>
      form.weights.experience +
      form.weights.skills +
      form.weights.education +
      form.weights.location,
    [form.weights],
  )

  const valid =
    form.title.trim() &&
    form.company.trim() &&
    totalWeight === 100

  function update<K extends keyof Form>(key: K, value: Form[K]) {
    setForm((f) => ({ ...f, [key]: value }))
  }

  function updateWeight(key: keyof Form["weights"], value: number) {
    setForm((f) => ({ ...f, weights: { ...f.weights, [key]: value } }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!valid) {
      toast.error("Please complete the form. Weights must total 100%.")
      return
    }
    setSubmitting(true)
    try {
      const { data, error } = await supabase
        .from("jobs")
        .insert({
          title: form.title.trim(),
          company: form.company.trim(),
          description: form.description.trim(),
          location: form.location.trim(),
          required_skills: form.required_skills,
          min_experience_yrs: form.min_experience_yrs,
          preferred_location: form.preferred_location.trim(),
          weights: form.weights,
        })
        .select("id")
        .single()
      if (error) throw error
      setCreatedId(data.id)
      toast.success("Job posted successfully!")
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to post job")
    } finally {
      setSubmitting(false)
    }
  }

  const applyUrl =
    createdId && typeof window !== "undefined"
      ? `${window.location.origin}/apply/${createdId}`
      : ""

  async function copyLink() {
    if (!applyUrl) return
    try {
      await navigator.clipboard.writeText(applyUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      toast.error("Couldn't copy link")
    }
  }

  return (
    <div className="min-h-screen bg-secondary/30">
      <Navbar />
      <main className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Post a job</h1>
          <p className="text-muted-foreground mt-1">
            Define your scoring criteria and we&apos;ll rank applicants automatically.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Left: form */}
            <Card className="card-shadow">
              <CardContent className="p-6 sm:p-8 space-y-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="title">Job Title</Label>
                    <Input
                      id="title"
                      placeholder="Senior Frontend Developer"
                      value={form.title}
                      onChange={(e) => update("title", e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      placeholder="Acme Inc."
                      value={form.company}
                      onChange={(e) => update("company", e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Job Description</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder="Describe the role, responsibilities, and what success looks like..."
                    value={form.description}
                    onChange={(e) => update("description", e.target.value)}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="Remote · Berlin · NYC"
                      value={form.location}
                      onChange={(e) => update("location", e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="preferred_location">Preferred Location (for scoring)</Label>
                    <Input
                      id="preferred_location"
                      placeholder="Berlin"
                      value={form.preferred_location}
                      onChange={(e) => update("preferred_location", e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Required Skills</Label>
                  <SkillInput
                    id="skills"
                    value={form.required_skills}
                    onChange={(next) => update("required_skills", next)}
                    placeholder="Type a skill and press Enter (e.g. React)"
                  />
                </div>

                <div className="space-y-2 max-w-xs">
                  <Label htmlFor="min_exp">Minimum Experience</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="min_exp"
                      type="number"
                      min={0}
                      step={0.5}
                      value={form.min_experience_yrs}
                      onChange={(e) =>
                        update("min_experience_yrs", Number(e.target.value) || 0)
                      }
                    />
                    <span className="text-sm text-muted-foreground">years</span>
                  </div>
                </div>

                {/* Scoring weights */}
                <div className="border-t border-border pt-6 space-y-5">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">Scoring Criteria Weights</h3>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button type="button" className="text-muted-foreground hover:text-foreground">
                            <Info className="h-4 w-4" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>These weights must add up to 100.</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>

                  <WeightRow
                    label="Experience"
                    value={form.weights.experience}
                    onChange={(v) => updateWeight("experience", v)}
                  />
                  <WeightRow
                    label="Skills Match"
                    value={form.weights.skills}
                    onChange={(v) => updateWeight("skills", v)}
                  />
                  <WeightRow
                    label="Education Level"
                    value={form.weights.education}
                    onChange={(v) => updateWeight("education", v)}
                  />
                  <WeightRow
                    label="Location Match"
                    value={form.weights.location}
                    onChange={(v) => updateWeight("location", v)}
                  />

                  <div
                    className={`rounded-lg p-4 flex items-center gap-3 border ${
                      totalWeight === 100
                        ? "bg-success/10 border-success/30 text-success"
                        : "bg-danger/10 border-danger/30 text-danger"
                    }`}
                  >
                    {totalWeight === 100 ? (
                      <CheckCircle2 className="h-5 w-5 shrink-0" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 shrink-0" />
                    )}
                    <div className="flex-1 text-sm font-medium">
                      Total: {totalWeight}%
                      {totalWeight !== 100 &&
                        ` — adjust the sliders to reach exactly 100%`}
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full gap-2"
                  disabled={!valid || submitting}
                >
                  {submitting ? <Spinner /> : <Rocket className="h-5 w-5" />}
                  {submitting ? "Posting..." : "Post Job & Get Shareable Link"}
                </Button>
              </CardContent>
            </Card>

            {/* Right: live preview */}
            <div className="lg:sticky lg:top-24 lg:self-start">
              <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">
                Live preview
              </p>
              <Card className="card-shadow-lg overflow-hidden">
                <div className="h-2 bg-gradient-to-r from-primary to-violet" />
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold">
                      {form.title || "Your job title"}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {form.company || "Your company"}
                    </p>
                  </div>

                  {form.location && (
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      {form.location}
                    </div>
                  )}

                  {form.description && (
                    <p className="text-sm text-foreground/80 leading-relaxed text-pretty line-clamp-4">
                      {form.description}
                    </p>
                  )}

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-primary" />
                      <span>{form.min_experience_yrs}+ years</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      <span>{form.required_skills.length} skills</span>
                    </div>
                  </div>

                  {form.required_skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {form.required_skills.slice(0, 8).map((s, i) => (
                        <Badge
                          key={`${s}-${i}`}
                          variant="secondary"
                          className="bg-primary/10 text-primary border-0"
                        >
                          {s}
                        </Badge>
                      ))}
                      {form.required_skills.length > 8 && (
                        <Badge variant="secondary" className="border-0">
                          +{form.required_skills.length - 8}
                        </Badge>
                      )}
                    </div>
                  )}

                  <div className="border-t border-border pt-4 space-y-2">
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
                      Scoring weights
                    </p>
                    <PreviewWeight label="Experience" value={form.weights.experience} icon={Briefcase} />
                    <PreviewWeight label="Skills" value={form.weights.skills} icon={CheckCircle2} />
                    <PreviewWeight label="Education" value={form.weights.education} icon={GraduationCap} />
                    <PreviewWeight label="Location" value={form.weights.location} icon={MapPin} />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </main>

      <Dialog open={!!createdId} onOpenChange={(open) => !open && setCreatedId(null)}>
        <DialogContent className="sm:max-w-md">
          <div className="flex flex-col items-center text-center space-y-3 pt-2">
            <div className="h-16 w-16 rounded-full bg-success/10 text-success flex items-center justify-center fade-in-up">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <DialogHeader>
              <DialogTitle className="text-2xl">Job Posted!</DialogTitle>
              <DialogDescription className="text-pretty">
                Share this link with applicants. They&apos;ll be ranked automatically as they apply.
              </DialogDescription>
            </DialogHeader>
          </div>

          <div className="space-y-2 mt-2">
            <Label htmlFor="apply-link" className="text-xs uppercase tracking-wider text-muted-foreground font-semibold">
              Applicant form link
            </Label>
            <div className="flex gap-2">
              <Input id="apply-link" readOnly value={applyUrl} className="font-mono text-sm" />
              <Button type="button" variant="outline" onClick={copyLink} className="gap-2 shrink-0">
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 mt-2">
            <Button asChild variant="outline">
              <Link href="/dashboard">Back to dashboard</Link>
            </Button>
            <Button
              onClick={() => createdId && router.push(`/jobs/${createdId}`)}
            >
              View Applicants
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function WeightRow({
  label,
  value,
  onChange,
}: {
  label: string
  value: number
  onChange: (n: number) => void
}) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <Label className="font-medium">{label}</Label>
        <span className="text-sm font-semibold tabular-nums text-primary min-w-[3rem] text-right">
          {value}%
        </span>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        min={0}
        max={100}
        step={5}
        className="cursor-pointer"
      />
    </div>
  )
}

function PreviewWeight({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number
  icon: React.ComponentType<{ className?: string }>
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm flex-1">{label}</span>
      <div className="flex items-center gap-2 min-w-[6rem]">
        <div className="h-1.5 flex-1 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${value}%` }}
          />
        </div>
        <span className="text-xs font-semibold tabular-nums w-9 text-right">{value}%</span>
      </div>
    </div>
  )
}
