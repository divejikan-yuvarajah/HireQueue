import Link from "next/link"

export function MarketingFooter() {
  return (
    <footer className="border-t border-hairline mt-32">
      <div className="max-w-[1240px] mx-auto px-6 py-16 grid grid-cols-2 md:grid-cols-5 gap-12">
        <div className="col-span-2">
          <div className="flex items-center gap-2.5 mb-6">
            <div className="size-7 bg-foreground text-background flex items-center justify-center font-display text-sm">
              H
            </div>
            <span className="font-display text-base tracking-tight">
              HireQueue
            </span>
          </div>
          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Editorial-grade hiring intelligence. Built for teams that take craft
            seriously.
          </p>
          <div className="mt-8 font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground">
            v1.0 · est. 2026
          </div>
        </div>

        <FooterCol
          title="Product"
          links={[
            ["Dashboard", "/dashboard"],
            ["New job", "/jobs/new"],
            ["Templates", "/jobs/templates"],
            ["Analytics", "/analytics"],
          ]}
        />
        <FooterCol
          title="Company"
          links={[
            ["Pricing", "/pricing"],
            ["FAQ", "/#faq"],
            ["How it works", "/#how"],
          ]}
        />
        <FooterCol
          title="Legal"
          links={[
            ["Privacy", "#"],
            ["Terms", "#"],
            ["Security", "#"],
          ]}
        />
      </div>
      <div className="border-t border-hairline">
        <div className="max-w-[1240px] mx-auto px-6 h-14 flex items-center justify-between text-xs text-muted-foreground font-mono">
          <span>© 2026 HireQueue Inc.</span>
          <span className="uppercase tracking-[0.2em]">
            Made with intent, not algorithms
          </span>
        </div>
      </div>
    </footer>
  )
}

function FooterCol({
  title,
  links,
}: {
  title: string
  links: [string, string][]
}) {
  return (
    <div>
      <div className="font-mono text-[10px] uppercase tracking-[0.25em] text-muted-foreground mb-5">
        {title}
      </div>
      <ul className="space-y-3 text-sm">
        {links.map(([label, href]) => (
          <li key={label}>
            <Link href={href} className="hover:text-accent transition-colors">
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
