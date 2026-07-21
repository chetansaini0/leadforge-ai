"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { BellRing, Flame, MailPlus, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { api } from "@/lib/fetcher";

type FollowupItem = {
  kind: "followup" | "first_touch";
  leadId: string;
  outreachId?: string;
  businessName: string;
  channel: string;
  priority: string;
  reason: string;
  ageDays: number;
  recommendedStep: number;
};

export default function FollowupsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["followups"],
    queryFn: () => api<FollowupItem[]>("/api/followups"),
  });

  const firstTouch = data?.filter((i) => i.kind === "first_touch") ?? [];
  const followups = data?.filter((i) => i.kind === "followup") ?? [];

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <BellRing className="h-6 w-6 text-[var(--primary)]" /> Follow-up Agent
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Leads that need attention today — hot leads to contact and messages that have gone quiet.
        </p>
      </div>

      {isLoading && <Card className="p-6 text-center text-[var(--muted)]">Loading…</Card>}

      {!isLoading && (data?.length ?? 0) === 0 && (
        <Card className="p-8 text-center">
          <p className="font-medium">You&apos;re all caught up 🎉</p>
          <p className="mt-1 text-sm text-[var(--muted)]">No follow-ups due right now.</p>
        </Card>
      )}

      {firstTouch.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-red-400" /> Reach out now ({firstTouch.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {firstTouch.map((i) => (
              <Row key={i.leadId} item={i} />
            ))}
          </CardContent>
        </Card>
      )}

      {followups.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MailPlus className="h-4 w-4 text-amber-500" /> Gone quiet ({followups.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {followups.map((i) => (
              <Row key={i.outreachId ?? i.leadId} item={i} />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function Row({ item }: { item: FollowupItem }) {
  const href =
    item.kind === "followup"
      ? `/outreach?lead=${item.leadId}&kind=followup&step=${item.recommendedStep}`
      : `/outreach?lead=${item.leadId}`;
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <p className="truncate font-medium">{item.businessName}</p>
          {item.priority && (
            <Badge className={item.priority === "hot" ? "bg-red-500/15 text-red-400" : "bg-amber-500/15 text-amber-500"}>
              {item.priority}
            </Badge>
          )}
        </div>
        <p className="truncate text-xs text-[var(--muted)]">{item.reason}</p>
      </div>
      <Link href={href} className="shrink-0">
        <Button variant="outline" size="sm">
          {item.kind === "first_touch" ? "Draft outreach" : "Draft follow-up"}
          <ArrowRight className="h-3.5 w-3.5" />
        </Button>
      </Link>
    </div>
  );
}
