import { Card, CardContent } from "@/components/ui/card";
import { SEED_PORTFOLIOS } from "@/lib/ai/portfolio";
import { ExternalLink } from "lucide-react";

export default function PortfolioPage() {
  return (
    <div className="space-y-6 fade-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Portfolio Intelligence</h1>
        <p className="text-sm text-[var(--muted)]">
          Real shipped projects. These are auto-matched to leads by business type in proposals and outreach.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SEED_PORTFOLIOS.map((p) => (
          <Card key={p.slug}>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{p.name}</h3>
                <span className="rounded-full bg-[var(--primary)]/15 px-2 py-0.5 text-[10px] uppercase text-[var(--primary)]">
                  {p.businessType}
                </span>
              </div>
              <p className="text-sm text-[var(--muted)]">{p.blurb}</p>
              <div className="flex flex-wrap gap-1.5">
                {p.stack.map((s) => (
                  <span key={s} className="rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[11px]">{s}</span>
                ))}
              </div>
              <a href={p.liveUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-[var(--primary)] hover:underline">
                Live site <ExternalLink className="h-3.5 w-3.5" />
              </a>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
