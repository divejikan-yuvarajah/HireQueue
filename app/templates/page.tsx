"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  Code2,
  Palette,
  Megaphone,
  BarChart3,
  Shield,
  Users,
  Briefcase,
  ArrowRight,
  Search,
} from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { AppShell } from "@/components/app-shell"
import { supabase } from "@/lib/supabase"

type Template = {
  id: string
  title: string
  department: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  required_skills: string[]
  nice_to_have_skills: string[]
  min_experience_yrs: number
  education_requirement: string
  weights: { experience: number; skills: number; education: number; location: number }
  salary_min: number
  salary_max: number
  job_type: string
}

const TEMPLATES: Template[] = [
  {
    id: "frontend",
    title: "Senior Frontend Engineer",
    department: "Engineering",
    icon: Code2,
    description: "Build and maintain user-facing web applications with modern JavaScript frameworks. Collaborate with designers and backend engineers to deliver pixel-perfect, performant interfaces.",
    required_skills: ["React", "TypeScript", "CSS", "HTML", "Git"],
    nice_to_have_skills: ["Next.js", "GraphQL", "Testing", "Figma"],
    min_experience_yrs: 4,
    education_requirement: "bachelor",
    weights: { experience: 30, skills: 40, education: 15, location: 15 },
    salary_min: 120000,
    salary_max: 180000,
    job_type: "full-time",
  },
  {
    id: "product-designer",
    title: "Product Designer",
    department: "Design",
    icon: Palette,
    description: "Own the end-to-end design process from research through high-fidelity prototypes. Champion user needs and contribute to a growing design system.",
    required_skills: ["Figma", "User Research", "Prototyping", "Design Systems", "UI Design"],
    nice_to_have_skills: ["Motion Design", "Accessibility", "HTML/CSS", "Illustration"],
    min_experience_yrs: 3,
    education_requirement: "bachelor",
    weights: { experience: 25, skills: 40, education: 15, location: 20 },
    salary_min: 100000,
    salary_max: 160000,
    job_type: "full-time",
  },
  {
    id: "growth-marketer",
    title: "Growth Marketing Manager",
    department: "Marketing",
    icon: Megaphone,
    description: "Drive user acquisition and retention through data-driven campaigns across paid, organic, and lifecycle channels. Own the marketing funnel from awareness to conversion.",
    required_skills: ["SEO", "Paid Ads", "Analytics", "Content Strategy", "A/B Testing"],
    nice_to_have_skills: ["SQL", "CRM", "Email Marketing", "Social Media"],
    min_experience_yrs: 3,
    education_requirement: "bachelor",
    weights: { experience: 35, skills: 35, education: 10, location: 20 },
    salary_min: 90000,
    salary_max: 140000,
    job_type: "full-time",
  },
  {
    id: "data-analyst",
    title: "Data Analyst",
    department: "Engineering",
    icon: BarChart3,
    description: "Transform raw data into actionable insights for product and business teams. Build dashboards, run experiments, and inform strategic decisions with data.",
    required_skills: ["SQL", "Python", "Data Visualization", "Statistics", "Excel"],
    nice_to_have_skills: ["dbt", "Looker", "Tableau", "R", "Machine Learning"],
    min_experience_yrs: 2,
    education_requirement: "bachelor",
    weights: { experience: 25, skills: 45, education: 20, location: 10 },
    salary_min: 85000,
    salary_max: 130000,
    job_type: "full-time",
  },
  {
    id: "security-engineer",
    title: "Security Engineer",
    department: "Engineering",
    icon: Shield,
    description: "Protect our infrastructure and user data through proactive threat modeling, vulnerability assessments, and security automation. Lead incident response and security reviews.",
    required_skills: ["Penetration Testing", "Cloud Security", "SIEM", "Network Security", "Python"],
    nice_to_have_skills: ["SOC 2", "OWASP", "Kubernetes", "Terraform"],
    min_experience_yrs: 5,
    education_requirement: "bachelor",
    weights: { experience: 40, skills: 35, education: 15, location: 10 },
    salary_min: 140000,
    salary_max: 200000,
    job_type: "full-time",
  },
  {
    id: "people-ops",
    title: "People Operations Manager",
    department: "HR",
    icon: Users,
    description: "Build and scale people programs that support a high-performance culture. Oversee onboarding, performance management, and employee experience.",
    required_skills: ["HR Operations", "Onboarding", "Performance Management", "HRIS", "Compliance"],
    nice_to_have_skills: ["DEI Programs", "Compensation", "Employee Engagement", "Recruiting"],
    min_experience_yrs: 4,
    education_requirement: "bachelor",
    weights: { experience: 35, skills: 30, education: 15, location: 20 },
    salary_min: 95000,
    salary_max: 140000,
    job_type: "full-time",
  },
]

export default function TemplatesPage() {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [preview, setPreview] = useState<Template | null>(null)
  const [creating, setCreating] = useState(false)

  const filtered = TEMPLATES.filter((t) => {
    const q = search.toLowerCase()
    return (
      t.title.toLowerCase().includes(q) ||
      t.department.toLowerCase().includes(q) ||
      t.required_skills.some((s) => s.toLowerCase().includes(q))
    )
  })

  async function useTemplate(t: Template) {
    setCreating(true)
    try {
      const { data, error } = await supabase
        .from("jobs")
        .insert({
          title: t.title,
          company: "My Company",
          description: t.description,
          location: "",
          department: t.department,
          job_type: t.job_type,
          salary_min: t.salary_min,
          salary_max: t.salary_max,
          education_requirement: t.education_requirement,
          required_skills: t.required_skills,
          nice_to_have_skills: t.nice_to_have_skills,
          min_experience_yrs: t.min_experience_yrs,
          preferred_location: "",
          weights: t.weights,
        })
        .select("id")
        .single()
      if (error) throw error
      toast.success("Job created from template!")
      router.push(`/jobs/${data.id}`)
    } catch (err) {
      toast.error((err as Error).message ?? "Failed to create job")
    } finally {
      setCreating(false)
    }
  }

  return (
    <AppShell>
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-serif text-3xl font-bold tracking-tight">Templates</h1>
            <p className="text-muted-foreground mt-1">
              Start from a pre-built role with optimized scoring weights
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t) => {
            const Icon = t.icon
            return (
              <Card
                key={t.id}
                className="border-border/50 hover:border-accent/40 transition-colors cursor-pointer group"
                onClick={() => setPreview(t)}
              >
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center group-hover:bg-accent group-hover:text-accent-foreground transition-colors">
                      <Icon className="h-5 w-5" />
                    </div>
                    <Badge variant="secondary" className="font-mono text-xs">{t.department}</Badge>
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{t.title}</h3>
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{t.description}</p>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {t.required_skills.slice(0, 3).map((s) => (
                      <span key={s} className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-muted text-muted-foreground">{s}</span>
                    ))}
                    {t.required_skills.length > 3 && (
                      <span className="px-1.5 py-0.5 text-[10px] font-mono rounded bg-muted text-muted-foreground">+{t.required_skills.length - 3}</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="font-mono">{t.min_experience_yrs}+ yrs</span>
                    <span className="font-mono">${(t.salary_min / 1000).toFixed(0)}k&ndash;${(t.salary_max / 1000).toFixed(0)}k</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p className="font-serif text-lg">No templates match your search</p>
            <p className="text-sm mt-1">Try a different keyword or browse all templates</p>
          </div>
        )}

        {/* Preview dialog */}
        <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
          {preview && (
            <DialogContent className="sm:max-w-lg">
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center">
                    <preview.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="font-serif">{preview.title}</DialogTitle>
                    <DialogDescription>{preview.department} &middot; {preview.job_type}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="space-y-4 mt-2">
                <p className="text-sm leading-relaxed">{preview.description}</p>

                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Required Skills</p>
                  <div className="flex flex-wrap gap-1.5">
                    {preview.required_skills.map((s) => (
                      <span key={s} className="px-2 py-0.5 text-xs font-mono rounded-full bg-accent/10 text-accent border border-accent/20">{s}</span>
                    ))}
                  </div>
                </div>

                {preview.nice_to_have_skills.length > 0 && (
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Nice to Have</p>
                    <div className="flex flex-wrap gap-1.5">
                      {preview.nice_to_have_skills.map((s) => (
                        <span key={s} className="px-2 py-0.5 text-xs font-mono rounded-full bg-muted text-muted-foreground border border-border">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-muted-foreground" />
                    <span>{preview.min_experience_yrs}+ years experience</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono tabular-nums">
                    ${(preview.salary_min / 1000).toFixed(0)}k&ndash;${(preview.salary_max / 1000).toFixed(0)}k
                  </div>
                </div>

                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Scoring Weights</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Object.entries(preview.weights).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between p-2 rounded bg-muted/50 text-xs">
                        <span className="capitalize">{key}</span>
                        <span className="font-mono font-semibold">{val}%</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  onClick={() => useTemplate(preview)}
                  disabled={creating}
                  className="w-full gap-1.5 bg-accent hover:bg-accent/90 text-accent-foreground"
                >
                  {creating ? <Spinner /> : <ArrowRight className="h-4 w-4" />}
                  {creating ? "Creating..." : "Use This Template"}
                </Button>
              </div>
            </DialogContent>
          )}
        </Dialog>
      </div>
    </AppShell>
  )
}
