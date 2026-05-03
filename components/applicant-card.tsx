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
  ExternalLink,
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScoreRing } from "@/components/score-ring"
import { TierBadge } from "@/components/tier-badge"
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

const RANK_STYLES = [
  "bg-accent text-accent-foreground ring-2 ring-accent/30",
  "bg-muted-foreground/80 text-background",
  "bg-accent/60 text-accent-foreground",
]

export function ApplicantCard({ applicant, rank, weights, isNew, index }: Props) {
  const [expanded, setExpanded] = useState(false)
  const breakdown = applicant.score_breakdown ?? {
    experience: 0,
    skills: 0,
    education: 0,
    location: 0,
    matched_skills: [],
    missing_skills: [],
  }
  const rankStyle = rank <= 3 ? RANK_STYLES[rank - 1] : "bg-muted text-muted-foreground"

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: Math.min(index, 10) * 0.04 }}
    >
      <Card
        className={cn(
          "border-border/50 hover:border-border transition-colors overflow-hidden group",
          isNew && "ring-2 ring-accent/40 animate-pulse",
        )}
      >
        <CardContent className="p-4 sm:p-5">
          <div className="flex items-start gap-4">
            {/* Rank */}
            <div
              className={cn(
                "h-10 w-10 rounded-full flex items-center justify-center font-mono text-sm font-bold shrink-0",
                rankStyle,
              )}
            >
              {rank}
            </div>

            {/* Avatar + info */}
            <div className="flex-1 min-w-0 space-y-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={cn(
                      "h-9 w-9 rounded-full flex items-center justify-center text-background font-semibold text-xs shrink-0",
                      avatarColor(applicant.email || applicant.name),
                    )}
                  >
                    {initialsOf(applicant.name)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-sm truncate">{applicant.name}</h3>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                      <Mail className="h-3 w-3 shrink-0" />
                      <span className="truncate">{applicant.email}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <TierBadge tier={applicant.tier} />
                  <ScoreRing score={applicant.score} size={44} strokeWidth={3} />
                </div>
              </div>

              {/* Skill matches */}
              {(breakdown.matched_skills?.length > 0 || breakdown.missing_skills?.length > 0) && (
                <div className="flex flex-wrap gap-1.5">
                  {breakdown.matched_skills?.map((s: string) => (
                    <span
                      key={`m-${s}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-top/10 text-top text-xs font-mono border border-top/20"
                    >
                      <CheckCircle2 className="h-3 w-3" />
                      {s}
                    </span>
                  ))}
                  {breakdown.missing_skills?.map((s: string) => (
                    <span
                      key={`x-${s}`}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-muted text-muted-foreground text-xs font-mono border border-border line-through opacity-60"
                    >
                      <XCircle className="h-3 w-3 no-underline" />
                      {s}
                    </span>
                  ))}
                </div>
              )}

              {/* Meta row */}
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary" className="gap-1 font-mono text-xs font-normal">
                  <Briefcase className="h-3 w-3" />
                  {applicant.experience_yrs}y
                </Badge>
                <Badge variant="secondary" className="gap-1 font-mono text-xs font-normal">
                  <GraduationCap className="h-3 w-3" />
                  {EDUCATION_LABEL[applicant.education] ?? applicant.education}
                </Badge>
                {applicant.location && (
                  <Badge variant="secondary" className="gap-1 font-mono text-xs font-normal">
                    <MapPin className="h-3 w-3" />
                    {applicant.location}
                  </Badge>
                )}
                <Badge variant="secondary" className="font-mono text-xs font-normal">
                  {formatDistanceToNow(new Date(applicant.created_at), { addSuffix: true })}
                </Badge>
              </div>

              {/* Expand */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExpanded((e) => !e)}
                className="gap-1 -ml-2 h-7 text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground"
              >
                {expanded ? (
                  <>Details <ChevronUp className="h-3.5 w-3.5" /></>
                ) : (
                  <>Details <ChevronDown className="h-3.5 w-3.5" /></>
                )}
              </Button>

              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4 pt-2 border-t border-border/50">
                      {/* Score breakdown bars */}
                      <div className="grid grid-cols-2 gap-3">
                        <BreakdownRow label="Experience" value={breakdown.experience} max={weights.experience} />
                        <BreakdownRow label="Skills" value={breakdown.skills} max={weights.skills} />
                        <BreakdownRow label="Education" value={breakdown.education} max={weights.education} />
                        <BreakdownRow label="Location" value={breakdown.location} max={weights.location} />
                      </div>

                      {/* Links */}
                      {(applicant.linkedin_url || applicant.portfolio_url) && (
                        <div className="flex flex-wrap gap-2">
                          {applicant.linkedin_url && (
                            <a href={applicant.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                              LinkedIn <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                          {applicant.portfolio_url && (
                            <a href={applicant.portfolio_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                              Portfolio <ExternalLink className="h-3 w-3" />
                            </a>
                          )}
                        </div>
                      )}

                      {applicant.skills.length > 0 && (
                        <div>
                          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5">All skills</p>
                          <div className="flex flex-wrap gap-1.5">
                            {applicant.skills.map((s, i) => (
                              <span key={`${s}-${i}`} className="px-2 py-0.5 text-xs font-mono rounded-full bg-accent/10 text-accent border border-accent/20">{s}</span>
                            ))}
                          </div>
                        </div>
                      )}

                      {applicant.cover_note && (
                        <div>
                          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5">Cover note</p>
                          <p className="text-sm leading-relaxed text-pretty whitespace-pre-wrap">{applicant.cover_note}</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

function BreakdownRow({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = max ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="font-mono uppercase tracking-widest text-muted-foreground">{label}</span>
        <span className="tabular-nums font-mono font-medium">{value.toFixed(1)}/{max}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className="h-full bg-accent rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}
