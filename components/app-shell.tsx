"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Briefcase,
  BarChart3,
  FileText,
  Plus,
  PanelLeftClose,
  PanelLeftOpen,
  Search,
  Bell,
  Command,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/jobs", label: "Jobs", icon: Briefcase },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/templates", label: "Templates", icon: FileText },
]

export function AppShell({
  children,
  pageTitle,
  pageEyebrow,
  pageActions,
  hideHeader = false,
}: {
  children: React.ReactNode
  pageTitle?: React.ReactNode
  pageEyebrow?: string
  pageActions?: React.ReactNode
  hideHeader?: boolean
}) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = React.useState(false)

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-hairline bg-sidebar text-sidebar-foreground transition-[width] duration-300 ease-out",
          collapsed ? "w-[68px]" : "w-[240px]",
        )}
      >
        <div className="h-16 flex items-center px-4 border-b border-hairline">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="size-7 bg-foreground text-background flex items-center justify-center font-display text-sm">
              H
            </div>
            {!collapsed && (
              <span className="font-display text-base tracking-tight">
                HireQueue
              </span>
            )}
          </Link>
        </div>

        <div className="px-3 pt-4">
          <Link href="/jobs/new">
            <Button
              size="sm"
              className={cn(
                "w-full bg-foreground text-background hover:bg-foreground/90 rounded-none h-9",
                collapsed && "px-0",
              )}
            >
              <Plus className="h-3.5 w-3.5" />
              {!collapsed && <span className="ml-1.5 text-xs">New job</span>}
            </Button>
          </Link>
        </div>

        <nav className="flex-1 px-2 pt-6 space-y-0.5">
          {!collapsed && (
            <div className="px-2 mb-2 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Workspace
            </div>
          )}
          {navItems.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href))
            const Icon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-2.5 h-9 text-sm font-medium relative",
                  active
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {active && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 bg-sidebar-accent"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon className="h-4 w-4 shrink-0 relative" />
                {!collapsed && <span className="relative">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        <div className="p-3 border-t border-hairline">
          <button
            onClick={() => setCollapsed((c) => !c)}
            className="flex items-center justify-center w-full h-8 text-muted-foreground hover:text-foreground"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-16 border-b border-hairline bg-background/80 backdrop-blur sticky top-0 z-30 flex items-center px-4 md:px-8 gap-4">
          <div className="md:hidden font-display text-lg">HireQueue</div>
          <div className="flex-1 flex items-center gap-3 max-w-md ml-auto md:ml-0">
            <div className="hidden md:flex items-center gap-2 border border-hairline rounded-none px-3 h-9 flex-1 text-muted-foreground hover:border-foreground/30">
              <Search className="h-3.5 w-3.5" />
              <span className="text-xs">Search jobs, applicants…</span>
              <kbd className="ml-auto inline-flex items-center gap-1 font-mono text-[10px] text-muted-foreground">
                <Command className="h-3 w-3" />K
              </kbd>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-auto">
            <ThemeToggle />
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="h-4 w-4" />
            </Button>
            <div className="size-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-medium ml-1">
              HQ
            </div>
          </div>
        </header>

        {/* Page header */}
        {!hideHeader && (pageTitle || pageEyebrow) && (
          <div className="border-b border-hairline px-4 md:px-8 py-8 md:py-10 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              {pageEyebrow && (
                <div className="text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-2 font-mono">
                  {pageEyebrow}
                </div>
              )}
              {pageTitle && (
                <h1 className="font-display text-3xl md:text-5xl text-balance leading-[1.05] tracking-tight">
                  {pageTitle}
                </h1>
              )}
            </div>
            {pageActions && <div className="shrink-0">{pageActions}</div>}
          </div>
        )}

        <main className="flex-1 min-w-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  )
}
