"use client"

import { useState } from "react"
import {
  ChevronDown,
  ChevronUp,
  GraduationCap,
  Briefcase,
  MapPin,
  Mail,
  CheckCircle2,
  XCircle,
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card"
import { CountUp } from "@/components/count-up"
import { TIER_META } from "@/lib/scoring"
import { EDUCATION_LABEL, type Applicant } from "@/lib/types"
import { initialsOf, avatarColor } from "@/lib/avatar"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

type Props = {
  applicant: Applicant
  rank: number
  weights: { experience: number; skills: number; education: number; location: number }
  isNew?: boolean
  index: number
}

const RANK_COLORS = [
  "bg-gradient-to-br from-yellow-400 to-amber-500 text-white gold-glow",
  "bg-gradient-to-br from-slate-300 to-slate-400 text-white",
  "bg-gradient-to-br from-amber-700 to-amber-800 text-white",
]

export function ApplicantCard({ applicant, rank, weights, isNew, index }: Props) {
  const [expanded, setExpanded] = useState(false)
  const tier = TIER_META[applicant.tier]
  const breakdown = applicant.score_breakdown ?? {
    experience: 0,
    skills: 0,
    education: 0,
    location: 0,
    matched_skills: [],
    missing_skills: [],
  }
  const rankBadge = rank <= 3 ? RANK_COLORS[rank - 1] : "bg-secondary text-foreground"

  return (
    <Card
      className={cn(
        "card-shadow hover:card-shadow-lg overflow-hidden",
        isNew ? "new-flash" : "fade-in-up",
      )}
      style={!isNew ? { animationDelay: `${Math.min(index, 10) * 50}ms` } : undefined}
    >
      <CardContent className="p-5 sm:p-6">
        <div className="flex items-start gap-4">
          {/* Rank badge */}
          <div
            className={cn(
              "h-14 w-14 rounded-full flex items-center justify-center font-bold text-lg shrink-0",
              rankBadge,
            )}
          >
            #{rank}
          </div>

          {/* Avatar + info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0",
                    avatarColor(applicant.email || applicant.name),
                  )}
                >
                  {initialsOf(applicant.name)}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold truncate">{applicant.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                    <Mail className="h-3 w-3 shrink-0" />
                    <span className="truncate">{applicant.email}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Badge
                  className={cn(
                    "border-0 font-semibold tracking-wide",
                    tier.color,
                    applicant.tier === "safe" && "pulse-soft",
                  )}
                >
                  {tier.label}
                </Badge>

                <HoverCard openDelay={120}>
                  <HoverCardTrigger asChild>
                    <button className={cn("text-3xl font-bold tabular-nums leading-none", tier.text)}>
                      <CountUp value={applicant.score} decimals={0} suffix="%" />
                    </button>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-72">
                    <div className="space-y-2.5">
                      <p className="text-sm font-semibold">Score breakdown</p>
                      <BreakdownRow label="Experience" value={breakdown.experience} max={weights.experience} />
                      <BreakdownRow label="Skills" value={breakdown.skills} max={weights.skills} />
                      <BreakdownRow label="Education" value={breakdown.education} max={weights.education} />
                      <BreakdownRow label="Location" value={breakdown.location} max={weights.location} />
                      <div className="border-t border-border pt-2 flex justify-between font-semibold text-sm">
                        <span>Total</span>
                        <span>{applicant.score.toFixed(1)} / 100</span>
                      </div>
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
            </div>

            {/* Skill matches */}
            {(breakdown.matched_skills.length > 0 || breakdown.missing_skills.length > 0) && (
              <div className="flex flex-wrap gap-1.5">
                {breakdown.matched_skills.map((s) => (
                  <span
                    key={`m-${s}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-success/10 text-success text-xs font-medium border border-success/20"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    {s}
                  </span>
                ))}
                {breakdown.missing_skills.map((s) => (
                  <span
                    key={`x-${s}`}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-medium border border-border line-through opacity-70"
                  >
                    <XCircle className="h-3 w-3 no-underline" />
                    {s}
                  </span>
                ))}
              </div>
            )}

            {/* Meta row */}
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="gap-1 font-normal">
                <Briefcase className="h-3 w-3" />
                {applicant.experience_yrs} yrs
              </Badge>
              <Badge variant="secondary" className="gap-1 font-normal">
                <GraduationCap className="h-3 w-3" />
                {EDUCATION_LABEL[applicant.education] ?? applicant.education}
              </Badge>
              {applicant.location && (
                <Badge variant="secondary" className="gap-1 font-normal">
                  <MapPin className="h-3 w-3" />
                  {applicant.location}
                </Badge>
              )}
              <Badge variant="secondary" className="font-normal">
                Applied {formatDistanceToNow(new Date(applicant.created_at), { addSuffix: true })}
              </Badge>
            </div>

            {/* Expand */}
            {(applicant.cover_note || applicant.skills.length > 0) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded((e) => !e)}
                className="gap-1 -ml-2 h-8"
              >
                {expanded ? (
                  <>
                    Hide details <ChevronUp className="h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show details <ChevronDown className="h-4 w-4" />
                  </>
                )}
              </Button>
            )}

            {expanded && (
              <div className="space-y-3 fade-in-up">
                {applicant.skills.length > 0 && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                      All skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {applicant.skills.map((s, i) => (
                        <Badge
                          key={`${s}-${i}`}
                          variant="secondary"
                          className="bg-primary/10 text-primary border-0 fade-in-up"
                          style={{ animationDelay: `${i * 30}ms` }}
                        >
                          {s}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {applicant.cover_note && (
                  <div>
                    <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-1.5">
                      Cover note
                    </p>
                    <p className="text-sm leading-relaxed text-pretty whitespace-pre-wrap">
                      {applicant.cover_note}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function BreakdownRow({
  label,
  value,
  max,
}: {
  label: string
  value: number
  max: number
}) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label}</span>
        <span className="tabular-nums font-medium">
          {value.toFixed(1)} / {max}
        </span>
      </div>
      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
        <div
          className="h-full bg-primary rounded-full"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}
