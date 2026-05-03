import type { Education, Job, ScoreBreakdown, Tier, Weights } from "./types"

const EDU_POINTS: Record<Education, number> = {
  phd: 100,
  master: 85,
  bachelor: 70,
  diploma: 50,
  high_school: 30,
}

export type ScoreInput = {
  experience_yrs: number
  skills: string[]
  education: Education
  location: string
}

function normalize(s: string) {
  return s.trim().toLowerCase()
}

export function scoreApplicant(applicant: ScoreInput, job: Job): {
  score: number
  tier: Tier
  breakdown: ScoreBreakdown
} {
  const minYrs = Math.max(0, Number(job.min_experience_yrs) || 0)
  const yrs = Math.max(0, Number(applicant.experience_yrs) || 0)

  let exp_score: number
  if (minYrs === 0) {
    // No minimum required: any experience scales nicely up to 5 yrs = 100.
    exp_score = Math.min(100, (yrs / 5) * 100)
  } else if (yrs >= minYrs * 1.5) {
    exp_score = 100
  } else {
    exp_score = Math.min(100, (yrs / minYrs) * 100)
  }

  const required = (job.required_skills ?? []).map(normalize).filter(Boolean)
  const have = (applicant.skills ?? []).map(normalize).filter(Boolean)
  const matched_skills_norm = required.filter((s) => have.includes(s))
  const missing_skills_norm = required.filter((s) => !have.includes(s))

  // Map normalized matches back to the original casing from the job spec.
  const matched_skills = (job.required_skills ?? []).filter((s) =>
    matched_skills_norm.includes(normalize(s)),
  )
  const missing_skills = (job.required_skills ?? []).filter((s) =>
    missing_skills_norm.includes(normalize(s)),
  )

  const skill_score =
    required.length === 0 ? 100 : (matched_skills_norm.length / required.length) * 100

  const edu_score = EDU_POINTS[applicant.education] ?? 0

  const loc_score =
    !job.preferred_location?.trim()
      ? 100
      : normalize(job.preferred_location) === normalize(applicant.location)
        ? 100
        : 0

  const w: Weights = job.weights ?? { experience: 35, skills: 35, education: 15, location: 15 }
  const total =
    (exp_score * w.experience +
      skill_score * w.skills +
      edu_score * w.education +
      loc_score * w.location) /
    100

  const score = Math.round(total * 10) / 10
  const tier: Tier = score >= 75 ? "safe" : score >= 50 ? "borderline" : "reach"

  // Component contributions out of their weighted budgets.
  const breakdown: ScoreBreakdown = {
    experience: Math.round(((exp_score * w.experience) / 100) * 10) / 10,
    skills: Math.round(((skill_score * w.skills) / 100) * 10) / 10,
    education: Math.round(((edu_score * w.education) / 100) * 10) / 10,
    location: Math.round(((loc_score * w.location) / 100) * 10) / 10,
    matched_skills,
    missing_skills,
  }

  return { score, tier, breakdown }
}

export const TIER_META = {
  safe: {
    label: "SAFE",
    color: "bg-success text-success-foreground",
    ring: "ring-success/30",
    text: "text-success",
    bg: "bg-success/10",
    border: "border-success/20",
  },
  borderline: {
    label: "BORDERLINE",
    color: "bg-warning text-warning-foreground",
    ring: "ring-warning/30",
    text: "text-warning",
    bg: "bg-warning/10",
    border: "border-warning/20",
  },
  reach: {
    label: "REACH",
    color: "bg-danger text-danger-foreground",
    ring: "ring-danger/30",
    text: "text-danger",
    bg: "bg-danger/10",
    border: "border-danger/20",
  },
} as const
