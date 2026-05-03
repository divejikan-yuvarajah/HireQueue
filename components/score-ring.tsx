"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { Tier } from "@/lib/types"

const tierColor: Record<Tier, string> = {
  top: "var(--tier-top)",
  match: "var(--accent)",
  reach: "var(--tier-reach)",
}

function tierFromScore(score: number): Tier {
  if (score >= 75) return "top"
  if (score >= 50) return "match"
  return "reach"
}

export function ScoreRing({
  score,
  tier,
  size = 96,
  stroke,
  strokeWidth,
  className,
  showLabel = true,
}: {
  score: number
  tier?: Tier
  size?: number
  stroke?: number
  strokeWidth?: number
  className?: string
  showLabel?: boolean
}) {
  const resolvedTier = tier ?? tierFromScore(score)
  const resolvedStroke = stroke ?? strokeWidth ?? 6
  const r = (size - resolvedStroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, score)) / 100

  const labelSize = size >= 96 ? "text-2xl" : size >= 56 ? "text-base" : "text-sm"

  return (
    <div
      className={cn("relative inline-flex items-center justify-center", className)}
      style={{ width: size, height: size }}
    >
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--border)"
          strokeWidth={resolvedStroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tierColor[resolvedTier]}
          strokeWidth={resolvedStroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - c * pct }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={cn("font-mono leading-none tracking-tighter font-bold tabular-nums", labelSize)}>
            {Math.round(score)}
          </span>
        </div>
      )}
    </div>
  )
}
