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

export function scoreApplicant(
  applicant: ScoreInput,
  job: Pick<
    Job,
    "min_experience_yrs" | "required_skills" | "preferred_location" | "weights"
  >,
): {
  score: number
  tier: Tier
  breakdown: ScoreBreakdown
} {
  const minYrs = Math.max(0, Number(job.min_experience_yrs) || 0)
  const yrs = Math.max(0, Number(applicant.experience_yrs) || 0)

  let exp_score: number
  if (minYrs === 0) {
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

  const matched_skills = (job.required_skills ?? []).filter((s) =>
    matched_skills_norm.includes(normalize(s)),
  )
  const missing_skills = (job.required_skills ?? []).filter((s) =>
    missing_skills_norm.includes(normalize(s)),
  )

  const skill_score =
    required.length === 0
      ? 100
      : (matched_skills_norm.length / required.length) * 100

  const edu_score = EDU_POINTS[applicant.education] ?? 0

  const loc_score = !job.preferred_location?.trim()
    ? 100
    : normalize(job.preferred_location) === normalize(applicant.location)
      ? 100
      : 0

  const w: Weights = job.weights ?? {
    experience: 35,
    skills: 35,
    education: 15,
    location: 15,
  }
  const total =
    (exp_score * w.experience +
      skill_score * w.skills +
      edu_score * w.education +
      loc_score * w.location) /
    100

  const score = Math.round(total * 10) / 10
  const tier: Tier = score >= 75 ? "top" : score >= 50 ? "match" : "reach"

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
  top: {
    label: "TOP",
    bg: "bg-tier-top",
    text: "text-tier-top",
    soft: "bg-tier-top-soft",
    foreground: "text-tier-top-foreground",
    border: "border-tier-top/30",
  },
  match: {
    label: "MATCH",
    bg: "bg-tier-match",
    text: "text-tier-match",
    soft: "bg-tier-match-soft",
    foreground: "text-tier-match-foreground",
    border: "border-tier-match/30",
  },
  reach: {
    label: "REACH",
    bg: "bg-tier-reach",
    text: "text-tier-reach",
    soft: "bg-tier-reach-soft",
    foreground: "text-tier-reach-foreground",
    border: "border-tier-reach/30",
  },
} as const
