"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Briefcase, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/jobs/new", label: "Post Job" },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-4">
          <Link href="/" className="flex items-center gap-2 font-bold text-lg">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-violet text-white flex items-center justify-center shadow-md">
              <Briefcase className="h-5 w-5" />
            </div>
            <span className="bg-gradient-to-r from-primary to-violet bg-clip-text text-transparent">
              HireQueue
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV_ITEMS.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href))
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium",
                    active
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary",
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <Button asChild size="sm" className="gap-2">
            <Link href="/jobs/new">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Job</span>
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
