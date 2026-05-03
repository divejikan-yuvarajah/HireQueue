import { cn } from "@/lib/utils"
import type { Tier } from "@/lib/types"

const styles: Record<Tier, string> = {
  top: "bg-tier-top text-tier-top-foreground",
  match: "bg-tier-match-soft text-tier-match border-l-2 border-accent",
  reach: "bg-tier-reach-soft text-tier-reach",
}

const labels: Record<Tier, string> = {
  top: "TOP",
  match: "MATCH",
  reach: "REACH",
}

export function TierBadge({
  tier,
  className,
  size = "md",
}: {
  tier: Tier
  className?: string
  size?: "sm" | "md" | "lg"
}) {
  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-[11px]",
    lg: "px-3 py-1.5 text-xs",
  }
  return (
    <span
      className={cn(
        "inline-flex items-center font-mono uppercase tracking-[0.18em] font-medium rounded-none",
        sizes[size],
        styles[tier],
        className,
      )}
    >
      {labels[tier]}
    </span>
  )
}
