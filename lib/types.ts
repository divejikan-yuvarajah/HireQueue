export type Education =
  | "high_school"
  | "diploma"
  | "bachelor"
  | "master"
  | "phd"

export const EDUCATION_LABEL: Record<Education, string> = {
  high_school: "High School",
  diploma: "Diploma",
  bachelor: "Bachelor's",
  master: "Master's",
  phd: "PhD",
}

export type Tier = "top" | "match" | "reach"

export type Weights = {
  experience: number
  skills: number
  education: number
  location: number
}

export type ApplicationStatus =
  | "applied"
  | "screening"
  | "interview"
  | "offer"
  | "hired"
  | "rejected"

export type Job = {
  id: string
  title: string
  company: string
  description: string
  location: string
  required_skills: string[]
  nice_to_have_skills: string[]
  min_experience_yrs: number
  preferred_location: string
  weights: Weights
  department: string
  job_type: string
  salary_min: number
  salary_max: number
  cover_image_url: string | null
  visibility: string
  education_requirement: Education
  status: string
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
  phone: string
  experience_yrs: number
  skills: string[]
  education: Education
  location: string
  country: string
  cover_note: string
  linkedin_url: string
  portfolio_url: string
  notice_period: string
  referral_source: string
  application_number: string | null
  application_status: ApplicationStatus
  score: number
  tier: Tier
  score_breakdown: ScoreBreakdown
  created_at: string
}

export const TIER_LABEL: Record<Tier, string> = {
  top: "TOP",
  match: "MATCH",
  reach: "REACH",
}

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  applied: "Applied",
  screening: "Screening",
  interview: "Interview",
  offer: "Offer",
  hired: "Hired",
  rejected: "Rejected",
}
