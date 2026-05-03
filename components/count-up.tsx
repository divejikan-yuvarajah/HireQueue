"use client"

import { useEffect, useRef, useState } from "react"

type Props = {
  value: number
  duration?: number
  decimals?: number
  suffix?: string
  className?: string
}

export function CountUp({ value, duration = 700, decimals = 0, suffix = "", className }: Props) {
  const [display, setDisplay] = useState(0)
  const startTimeRef = useRef<number | null>(null)
  const fromRef = useRef(0)

  useEffect(() => {
    fromRef.current = display
    startTimeRef.current = null
    let raf = 0

    const tick = (t: number) => {
      if (startTimeRef.current === null) startTimeRef.current = t
      const progress = Math.min(1, (t - startTimeRef.current) / duration)
      const eased = 1 - Math.pow(1 - progress, 3)
      const next = fromRef.current + (value - fromRef.current) * eased
      setDisplay(next)
      if (progress < 1) raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  return (
    <span className={className}>
      {display.toFixed(decimals)}
      {suffix}
    </span>
  )
}
