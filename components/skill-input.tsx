"use client"

import { useState, type KeyboardEvent } from "react"
import { X } from "lucide-react"
import { Input } from "@/components/ui/input"

type Props = {
  value: string[]
  onChange: (next: string[]) => void
  placeholder?: string
  id?: string
}

export function SkillInput({ value, onChange, placeholder, id }: Props) {
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
    <div className="flex flex-wrap gap-2 p-2 min-h-[2.75rem] rounded-lg border border-input bg-background focus-within:ring-2 focus-within:ring-ring/40 focus-within:border-ring">
      {value.map((skill, i) => (
        <span
          key={`${skill}-${i}`}
          className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium"
        >
          {skill}
          <button
            type="button"
            onClick={() => remove(i)}
            className="hover:bg-primary/20 rounded-full p-0.5 -mr-1"
            aria-label={`Remove ${skill}`}
          >
            <X className="h-3 w-3" />
          </button>
        </span>
      ))}
      <Input
        id={id}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={commit}
        placeholder={value.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[8rem] border-0 shadow-none focus-visible:ring-0 px-2 h-8"
      />
    </div>
  )
}
