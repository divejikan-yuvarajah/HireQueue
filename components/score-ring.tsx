"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { Tier } from "@/lib/types"

const tierColor: Record<Tier, string> = {
  top: "var(--tier-top)",
  match: "var(--accent)",
  reach: "var(--tier-reach)",
}

export function ScoreRing({
  score,
  tier,
  size = 96,
  stroke = 6,
  className,
  showLabel = true,
}: {
  score: number
  tier: Tier
  size?: number
  stroke?: number
  className?: string
  showLabel?: boolean
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, score)) / 100
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
          stroke="var(--hairline)"
          strokeWidth={stroke}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tierColor[tier]}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - c * pct }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </svg>
      {showLabel && (
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-num text-2xl leading-none tracking-tighter">
            {Math.round(score)}
          </span>
          <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground mt-0.5">
            score
          </span>
        </div>
      )}
    </div>
  )
}
