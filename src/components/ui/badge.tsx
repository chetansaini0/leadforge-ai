import { cn } from "@/lib/utils";
import type { LeadPriority, PipelineStage } from "@/types";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border border-[var(--border)] px-2.5 py-0.5 text-xs font-medium",
        className,
      )}
      {...props}
    />
  );
}

const PRIORITY_STYLES: Record<LeadPriority, string> = {
  low: "bg-slate-500/15 text-slate-400 border-slate-500/20",
  medium: "bg-blue-500/15 text-blue-400 border-blue-500/20",
  high: "bg-amber-500/15 text-amber-400 border-amber-500/20",
  hot: "bg-red-500/15 text-red-400 border-red-500/20",
};

export function PriorityBadge({ priority }: { priority: LeadPriority }) {
  return (
    <Badge className={PRIORITY_STYLES[priority]}>
      {priority === "hot" ? "🔥 Hot" : priority.charAt(0).toUpperCase() + priority.slice(1)}
    </Badge>
  );
}

export const STAGE_LABELS: Record<PipelineStage, string> = {
  new: "New Lead",
  contacted: "Contacted",
  interested: "Interested",
  meeting: "Meeting Scheduled",
  proposal: "Proposal Sent",
  negotiation: "Negotiation",
  won: "Won",
  lost: "Lost",
};

export function ScorePill({ label, value }: { label: string; value: number }) {
  const color =
    value >= 70 ? "text-emerald-400" : value >= 45 ? "text-amber-400" : "text-red-400";
  return (
    <div className="flex flex-col items-center rounded-lg border border-[var(--border)] bg-[var(--surface-2)] px-2 py-1.5">
      <span className={cn("text-sm font-semibold", color)}>{value}</span>
      <span className="text-[10px] uppercase tracking-wide text-[var(--muted)]">{label}</span>
    </div>
  );
}
