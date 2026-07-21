"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAnalytics } from "@/hooks/useLeads";
import { STAGE_LABELS } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const COLORS = ["#8b7bff", "#2dd4bf", "#f59e0b", "#ef4444", "#3b82f6", "#a855f7", "#10b981", "#64748b"];

export default function AnalyticsPage() {
  const { data, isLoading } = useAnalytics();

  const stageData = Object.entries(data?.byStage ?? {}).map(([k, v]) => ({
    name: STAGE_LABELS[k as keyof typeof STAGE_LABELS] ?? k,
    value: v,
  }));
  const typeData = Object.entries(data?.byType ?? {}).map(([k, v]) => ({ name: k, value: v }));
  const trend = data?.trend ?? [];
  const t = data?.totals;

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-sm text-[var(--muted)]">Performance across your pipeline.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total leads", value: t?.leads ?? 0 },
          { label: "Replies received", value: t?.replies ?? 0 },
          { label: "Conversion rate", value: `${t?.conversionRate ?? 0}%` },
          { label: "Revenue (won)", value: formatCurrency(t?.revenue ?? 0) },
        ].map((k) => (
          <Card key={k.label} className="p-4">
            <p className="text-2xl font-semibold">{isLoading ? "—" : k.value}</p>
            <p className="text-xs text-[var(--muted)]">{k.label}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Leads added (last 8 weeks)</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="label" stroke="var(--muted)" fontSize={12} />
                <YAxis stroke="var(--muted)" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)" }} />
                <Line type="monotone" dataKey="leads" stroke="#8b7bff" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Leads by stage</CardTitle></CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted)" fontSize={10} interval={0} angle={-20} textAnchor="end" height={50} />
                <YAxis stroke="var(--muted)" fontSize={12} allowDecimals={false} />
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)" }} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {stageData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader><CardTitle>Leads by business type</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={typeData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {typeData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--text)" }} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
