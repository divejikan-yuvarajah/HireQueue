export type Education =
  | "high_school"
  | "diploma"
  | "bachelor"
  | "master"
  | "phd"

export const EDUCATION_LABEL: Record<Education, string> = {
  high_school: "High School",
  diploma: "Diploma",
  bachelor: "Bachelor's Degree",
  master: "Master's Degree",
  phd: "PhD",
}

export type Tier = "safe" | "borderline" | "reach"

export type Weights = {
  experience: number
  skills: number
  education: number
  location: number
}

export type Job = {
  id: string
  title: string
  company: string
  description: string
  location: string
  required_skills: string[]
  min_experience_yrs: number
  preferred_location: string
  weights: Weights
  created_at: string
}

export type ScoreBreakdown = {
  experience: number
  skills: number
  education: number
  location: number
  matched_skills: string[]
  missing_skills: string[]
}

export type Applicant = {
  id: string
  job_id: string
  name: string
  email: string
  experience_yrs: number
  skills: string[]
  education: Education
  location: string
  cover_note: string
  score: number
  tier: Tier
  score_breakdown: ScoreBreakdown
  created_at: string
}
