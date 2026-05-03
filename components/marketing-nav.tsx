"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { ArrowUpRight } from "lucide-react"

export function MarketingNav() {
  return (
    <header className="sticky top-0 z-40 bg-background/85 backdrop-blur border-b border-hairline">
      <div className="max-w-[1240px] mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="size-7 bg-foreground text-background flex items-center justify-center font-display text-sm">
            H
          </div>
          <span className="font-display text-base tracking-tight">HireQueue</span>
        </Link>
        <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
          <Link href="/#how" className="hover:text-foreground">
            How it works
          </Link>
          <Link href="/pricing" className="hover:text-foreground">
            Pricing
          </Link>
          <Link href="/#faq" className="hover:text-foreground">
            FAQ
          </Link>
          <Link href="/dashboard" className="hover:text-foreground">
            Dashboard
          </Link>
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <Link href="/dashboard" className="hidden sm:inline-flex">
            <Button
              size="sm"
              className="bg-foreground text-background hover:bg-foreground/90 rounded-none h-9 ml-2"
            >
              Open app
              <ArrowUpRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  )
}
