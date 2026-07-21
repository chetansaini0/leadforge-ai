"use client";

import Link from "next/link";
import { Users, Send, CalendarCheck, FileText, TrendingUp, IndianRupee } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAnalytics, useLeads } from "@/hooks/useLeads";
import { PriorityBadge, STAGE_LABELS } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { PipelineStage } from "@/types";

export default function DashboardPage() {
  const { data: analytics, isLoading } = useAnalytics();
  const { data: leads } = useLeads();
  const t = analytics?.totals;

  const kpis = [
    { label: "Total Leads", value: t?.leads ?? 0, icon: Users, href: "/leads" },
    { label: "Emails Sent", value: t?.emailsSent ?? 0, icon: Send, href: "/outreach" },
    { label: "Proposals", value: t?.proposals ?? 0, icon: FileText, href: "/proposals" },
    { label: "Meetings", value: t?.meetings ?? 0, icon: CalendarCheck, href: "/crm" },
    { label: "Conversion", value: `${t?.conversionRate ?? 0}%`, icon: TrendingUp, href: "/analytics" },
    { label: "Revenue (won)", value: formatCurrency(t?.revenue ?? 0), icon: IndianRupee, href: "/analytics" },
  ];

  const hotLeads = (leads ?? []).filter((l) => l.priority === "hot" || l.priority === "high").slice(0, 5);

  return (
    <div className="space-y-6 fade-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-[var(--muted)]">Your pipeline at a glance.</p>
        </div>
        <Link href="/leads">
          <Button>Add lead</Button>
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {kpis.map((k) => {
          const Icon = k.icon;
          return (
            <Link key={k.label} href={k.href}>
              <Card className="p-4 transition-transform hover:-translate-y-0.5">
                <Icon className="h-4 w-4 text-[var(--primary)]" />
                <p className="mt-3 text-2xl font-semibold tracking-tight">
                  {isLoading ? "—" : k.value}
                </p>
                <p className="text-xs text-[var(--muted)]">{k.label}</p>
              </Card>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between p-5 pb-0">
            <h3 className="font-semibold">Pipeline overview</h3>
            <Link href="/crm" className="text-xs text-[var(--primary)] hover:underline">
              Open CRM
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 p-5 sm:grid-cols-4">
            {(Object.keys(STAGE_LABELS) as PipelineStage[]).map((stage) => (
              <div key={stage} className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
                <p className="text-xl font-semibold">{analytics?.byStage?.[stage] ?? 0}</p>
                <p className="text-[11px] text-[var(--muted)]">{STAGE_LABELS[stage]}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <div className="p-5 pb-0">
            <h3 className="font-semibold">Hot & high-priority</h3>
          </div>
          <div className="space-y-2 p-5">
            {hotLeads.length === 0 && (
              <p className="text-sm text-[var(--muted)]">No priority leads yet. Add leads or load demo data.</p>
            )}
            {hotLeads.map((l) => (
              <Link
                key={l._id}
                href="/leads"
                className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{l.businessName}</p>
                  <p className="text-xs text-[var(--muted)]">{formatCurrency(l.estimatedValue ?? 0)} · {l.closingProbability ?? 0}%</p>
                </div>
                <PriorityBadge priority={l.priority} />
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
