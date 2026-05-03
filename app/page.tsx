"use client"

import Link from "next/link"
import { Briefcase, BarChart2, Users, Rocket, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      {/* Hero section */}
      <section className="relative bg-gradient-to-b from-secondary/50 to-background overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-40" />
        <div className="container relative mx-auto px-4 py-24 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8 fade-in-up">
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
                <Briefcase className="h-4 w-4" />
                <span>Built for Zero to Agent Hackathon</span>
              </div>
              <h1 className="text-5xl font-bold tracking-tight text-balance sm:text-6xl lg:text-7xl">
                Hire smarter.{" "}
                <span className="bg-gradient-to-r from-primary to-violet bg-clip-text text-transparent">
                  Rank faster.
                </span>
              </h1>
              <p className="text-xl text-muted-foreground text-pretty max-w-2xl leading-relaxed">
                Post a job, set your criteria, and let HireQueue automatically score and rank every
                applicant — no AI API required.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="gap-2 shadow-lg hover:shadow-xl">
                  <Link href="/jobs/new">
                    <Rocket className="h-5 w-5" />
                    Post a Job
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="gap-2">
                  <Link href="/dashboard">View Dashboard</Link>
                </Button>
              </div>
            </div>

            <div className="relative fade-in-up [animation-delay:150ms]">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-violet/20 rounded-3xl blur-3xl" />
              <Card className="relative card-shadow-lg overflow-hidden border-0">
                <img
                  src="https://images.unsplash.com/photo-1521791136064-7986c2920216?w=800&q=80"
                  alt="Recruitment and hiring"
                  className="w-full h-auto object-cover"
                />
              </Card>
              {/* Floating stat cards */}
              <div className="absolute -bottom-6 -left-6 fade-in-up [animation-delay:300ms]">
                <Card className="card-shadow-lg bg-card/95 backdrop-blur-sm border-primary/20">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-primary">200+</div>
                    <div className="text-sm text-muted-foreground">applicants ranked</div>
                  </CardContent>
                </Card>
              </div>
              <div className="absolute -top-6 -right-6 fade-in-up [animation-delay:450ms]">
                <Card className="card-shadow-lg bg-card/95 backdrop-blur-sm border-success/20">
                  <CardContent className="p-4">
                    <div className="text-2xl font-bold text-success">{'<'}1s</div>
                    <div className="text-sm text-muted-foreground">scoring time</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features section */}
      <section className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12 text-balance">
          Everything you need to streamline hiring
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {[
            {
              icon: Briefcase,
              title: "Smart Criteria Builder",
              description:
                "Set weighted scoring rules — experience, skills, location, education",
              delay: "0ms",
            },
            {
              icon: BarChart2,
              title: "Instant Ranking",
              description: "Every applicant scored 0–100 the moment they apply",
              delay: "100ms",
            },
            {
              icon: Users,
              title: "Live Leaderboard",
              description: "Watch your ranked shortlist update in real time",
              delay: "200ms",
            },
          ].map((feature, i) => (
            <Card
              key={i}
              className="card-shadow hover:card-shadow-lg fade-in-up border-border/40"
              style={{ animationDelay: feature.delay }}
            >
              <CardContent className="p-8 space-y-4">
                <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-pretty leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-secondary/50 py-24">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-16 text-balance">
            How it works
          </h2>
          <div className="grid gap-12 md:grid-cols-3 max-w-5xl mx-auto relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-16 left-[16.666%] right-[16.666%] h-0.5 bg-gradient-to-r from-primary via-violet to-primary" />
            {[
              {
                step: 1,
                title: "Post your job + define scoring weights",
              },
              {
                step: 2,
                title: "Share the public applicant form link",
              },
              {
                step: 3,
                title: "Watch applicants rank automatically",
              },
            ].map((item) => (
              <div key={item.step} className="relative text-center space-y-4 fade-in-up">
                <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-primary to-violet text-white flex items-center justify-center text-2xl font-bold shadow-lg relative z-10">
                  {item.step}
                </div>
                <p className="text-foreground font-medium text-pretty">{item.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="container mx-auto px-4 py-24 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center mb-12 text-balance">
          Loved by recruiters everywhere
        </h2>
        <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
          {[
            { name: "Kavya R.", quote: "Cut our screening time from 2 weeks to 2 hours!" },
            { name: "Marco T.", quote: "The scoring is remarkably accurate and unbiased." },
            { name: "Siti N.", quote: "Finally, a tool that gets hiring right." },
          ].map((t, i) => (
            <Card key={i} className="card-shadow fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-violet text-white flex items-center justify-center font-semibold">
                    {t.name[0]}
                  </div>
                  <div className="font-semibold">{t.name}</div>
                </div>
                <p className="text-muted-foreground italic text-pretty leading-relaxed">
                  {'"'}
                  {t.quote}
                  {'"'}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/20">
        <div className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2 text-xl font-bold">
              <Briefcase className="h-6 w-6 text-primary" />
              <span className="bg-gradient-to-r from-primary to-violet bg-clip-text text-transparent">
                HireQueue
              </span>
            </div>
            <div className="text-sm text-muted-foreground text-center md:text-right">
              Built for Zero to Agent Hackathon by Vercel
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
