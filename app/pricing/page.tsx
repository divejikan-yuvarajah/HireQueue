"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Check, Minus, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { MarketingNav } from "@/components/marketing-nav"
import { MarketingFooter } from "@/components/marketing-footer"

const PLANS = [
  {
    name: "Solo",
    price: { monthly: 0, yearly: 0 },
    cadence: "/forever",
    desc: "Founders making their first three hires.",
    features: {
      "Active jobs": "1",
      "Applicants / month": "100",
      "Realtime leaderboard": true,
      "CSV export": true,
      "Public apply link": true,
      "Custom domains": false,
      "Templates library": false,
      "Analytics dashboard": false,
      "API access": false,
      "Audit logs": false,
      "SSO + SAML": false,
      "Dedicated reviewer": false,
    },
    cta: "Start free",
    featured: false,
  },
  {
    name: "Studio",
    price: { monthly: 49, yearly: 39 },
    cadence: "/mo",
    desc: "Boutique teams hiring on taste.",
    features: {
      "Active jobs": "Unlimited",
      "Applicants / month": "10,000",
      "Realtime leaderboard": true,
      "CSV export": true,
      "Public apply link": true,
      "Custom domains": true,
      "Templates library": true,
      "Analytics dashboard": true,
      "API access": false,
      "Audit logs": false,
      "SSO + SAML": false,
      "Dedicated reviewer": false,
    },
    cta: "Start trial",
    featured: true,
  },
  {
    name: "Atelier",
    price: { monthly: 199, yearly: 159 },
    cadence: "/mo",
    desc: "Agencies and high-volume operators.",
    features: {
      "Active jobs": "Unlimited",
      "Applicants / month": "Unlimited",
      "Realtime leaderboard": true,
      "CSV export": true,
      "Public apply link": true,
      "Custom domains": true,
      "Templates library": true,
      "Analytics dashboard": true,
      "API access": true,
      "Audit logs": true,
      "SSO + SAML": true,
      "Dedicated reviewer": true,
    },
    cta: "Talk to us",
    featured: false,
  },
] as const

export default function PricingPage() {
  const [cadence, setCadence] = React.useState<"monthly" | "yearly">("yearly")

  return (
    <div className="min-h-screen bg-background grain">
      <MarketingNav />

      <section className="max-w-[1240px] mx-auto px-6 pt-20 pb-16 text-center">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground mb-6"
        >
          Pricing — annual billing recommended
        </motion.div>
        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="font-display text-[clamp(2.5rem,7vw,5.5rem)] leading-[0.95] tracking-tight text-balance"
        >
          Pay for the hires, <br />
          <span className="italic">not the seats.</span>
        </motion.h1>
        <p className="mt-6 max-w-xl mx-auto text-muted-foreground leading-relaxed">
          One flat plan per company. Unlimited hiring managers and reviewers
          included on every tier. No per-applicant surcharges.
        </p>

        <div className="mt-10 inline-flex items-center border border-hairline">
          {(["monthly", "yearly"] as const).map((c) => (
            <button
              key={c}
              onClick={() => setCadence(c)}
              className={`relative h-9 px-5 text-xs uppercase tracking-[0.2em] font-mono ${
                cadence === c ? "text-background" : "text-muted-foreground"
              }`}
            >
              {cadence === c && (
                <motion.span
                  layoutId="cadence-pill"
                  className="absolute inset-0 bg-foreground"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className="relative">
                {c}
                {c === "yearly" && (
                  <span className="ml-2 text-[9px] text-accent">−20%</span>
                )}
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-px bg-hairline border border-hairline">
          {PLANS.map((p) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={`p-10 flex flex-col ${
                p.featured ? "bg-foreground text-background" : "bg-background"
              }`}
            >
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-[11px] uppercase tracking-[0.25em] opacity-70">
                  {p.name}
                </span>
                {p.featured && (
                  <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-accent">
                    Recommended
                  </span>
                )}
              </div>
              <div className="mt-8 flex items-baseline gap-1">
                <span className="font-display text-6xl tracking-tight">
                  {typeof p.price[cadence] === "number"
                    ? `$${p.price[cadence]}`
                    : p.price[cadence]}
                </span>
                <span className="text-sm opacity-60">{p.cadence}</span>
              </div>
              <p className="text-sm opacity-80 mt-4">{p.desc}</p>
              <Link href="/jobs/new" className="mt-10">
                <Button
                  size="lg"
                  className={`rounded-none w-full h-12 ${
                    p.featured
                      ? "bg-background text-foreground hover:bg-background/90"
                      : "bg-foreground text-background hover:bg-foreground/90"
                  }`}
                >
                  {p.cta}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <ul className="mt-10 space-y-3 text-sm">
                {Object.entries(p.features).map(([k, v]) => (
                  <li
                    key={k}
                    className="flex items-center justify-between gap-3 text-sm border-b border-hairline/50 pb-3"
                  >
                    <span className="opacity-80">{k}</span>
                    {typeof v === "boolean" ? (
                      v ? (
                        <Check className="h-3.5 w-3.5 text-accent" />
                      ) : (
                        <Minus className="h-3.5 w-3.5 opacity-30" />
                      )
                    ) : (
                      <span className="font-mono text-xs">{v}</span>
                    )}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </section>

      <section className="max-w-[1240px] mx-auto px-6 mt-24">
        <div className="border border-hairline p-10 md:p-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
              Enterprise
            </span>
            <h2 className="font-display text-3xl md:text-4xl tracking-tight leading-tight mt-3 text-balance">
              Hiring more than 1,000 a month? <br />
              <span className="italic">We&rsquo;ll build you a couture plan.</span>
            </h2>
          </div>
          <div className="md:text-right">
            <p className="text-muted-foreground text-sm leading-relaxed max-w-md md:ml-auto">
              Custom integrations, on-prem options, dedicated solutions
              architect, and a quarterly hiring review. Average response time:
              under four hours.
            </p>
            <Button
              size="lg"
              className="rounded-none mt-6 bg-foreground text-background hover:bg-foreground/90 h-12 px-7"
            >
              Talk to founders
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </section>

      <MarketingFooter />
    </div>
  )
}
