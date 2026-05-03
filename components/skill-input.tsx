"use client"

import { useState, type KeyboardEvent } from "react"
import { X } from "lucide-react"

type Props = {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  id?: string
  variant?: "default" | "ghost"
}

export function SkillInput({
  value,
  onChange,
  placeholder,
  id,
  variant = "default",
}: Props) {
  const [draft, setDraft] = useState("")

  function commit() {
    const trimmed = draft.trim()
    if (!trimmed) return
    if (value.some((v) => v.toLowerCase() === trimmed.toLowerCase())) {
      setDraft("")
      return
    }
    onChange([...value, trimmed])
    setDraft("")
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault()
      commit()
    } else if (e.key === "Backspace" && !draft && value.length > 0) {
      onChange(value.slice(0, -1))
    }
  }

  function remove(i: number) {
    onChange(value.filter((_, idx) => idx !== i))
  }

  return (
    <div
      className={`flex flex-wrap gap-1.5 p-2 min-h-[44px] border ${
        variant === "ghost"
          ? "border-hairline bg-transparent"
          : "border-foreground/30 bg-card"
      } focus-within:border-foreground transition-colors rounded-none`}
    >
      {value.map((skill, i) => (
        <span
          key={`${skill}-${i}`}
          className="inline-flex items-center gap-1.5 px-2.5 h-7 bg-foreground text-background text-xs font-mono uppercase tracking-[0.1em]"
        >
          {skill}
          <button
            type="button"
            onClick={() => remove(i)}
            className="opacity-60 hover:opacity-100"
            aria-label={`Remove ${skill}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[10rem] outline-none px-2 h-7 bg-transparent text-sm placeholder:text-muted-foreground"
      />
    </div>
  )
}
