"use client";

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CalendarClock, CalendarPlus, ExternalLink, Trash2, Check, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLeads } from "@/hooks/useLeads";
import { api } from "@/lib/fetcher";

type Meeting = {
  _id: string;
  lead?: string;
  leadName?: string;
  title: string;
  startsAt: string;
  durationMins: number;
  provider: string;
  calendarUrl: string;
  status: string;
  notes?: string;
};

const PROVIDERS = [
  { value: "google_meet", label: "Google Meet" },
  { value: "zoom", label: "Zoom" },
  { value: "phone", label: "Phone call" },
  { value: "in_person", label: "In person" },
];

const STATUS_TONE: Record<string, string> = {
  scheduled: "bg-[var(--primary)]/15 text-[var(--primary)]",
  completed: "bg-emerald-500/15 text-emerald-500",
  cancelled: "bg-red-500/15 text-red-400",
  no_show: "bg-amber-500/15 text-amber-500",
};

export default function MeetingsPage() {
  const qc = useQueryClient();
  const { data: leads } = useLeads();
  const { data: meetings, isLoading } = useQuery({
    queryKey: ["meetings"],
    queryFn: () => api<Meeting[]>("/api/meetings"),
  });

  const [form, setForm] = useState({
    leadId: "",
    title: "",
    startAt: "",
    durationMins: "30",
    provider: "google_meet",
    notes: "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const create = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      api<Meeting>("/api/meetings", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["meetings"] });
      setForm({ leadId: "", title: "", startAt: "", durationMins: "30", provider: "google_meet", notes: "" });
    },
  });

  const update = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api(`/api/meetings/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meetings"] }),
  });

  const del = useMutation({
    mutationFn: (id: string) => api(`/api/meetings/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meetings"] }),
  });

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const lead = leads?.find((l) => l._id === form.leadId);
    create.mutate({
      leadId: form.leadId || undefined,
      title: form.title || (lead ? `Discovery call — ${lead.businessName}` : "Meeting"),
      startAt: form.startAt,
      durationMins: Number(form.durationMins) || 30,
      provider: form.provider,
      notes: form.notes,
    });
  }

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <CalendarClock className="h-6 w-6 text-[var(--primary)]" /> Meetings
        </h1>
        <p className="text-sm text-[var(--muted)]">
          Schedule calls and generate one-click &ldquo;Add to Google Calendar&rdquo; links.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card className="h-fit p-4">
          <h2 className="mb-3 font-medium">Schedule a meeting</h2>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label>Lead (optional)</Label>
              <Select className="w-full" value={form.leadId} onChange={(e) => set("leadId", e.target.value)}>
                <option value="">No lead</option>
                {leads?.map((l) => (
                  <option key={l._id} value={l._id}>{l.businessName}</option>
                ))}
              </Select>
            </div>
            <div>
              <Label>Title</Label>
              <Input value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Discovery call" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Date &amp; time *</Label>
                <Input type="datetime-local" required value={form.startAt} onChange={(e) => set("startAt", e.target.value)} />
              </div>
              <div>
                <Label>Duration (min)</Label>
                <Input type="number" value={form.durationMins} onChange={(e) => set("durationMins", e.target.value)} />
              </div>
            </div>
            <div>
              <Label>Provider</Label>
              <Select className="w-full" value={form.provider} onChange={(e) => set("provider", e.target.value)}>
                {PROVIDERS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </Select>
            </div>
            <div>
              <Label>Notes</Label>
              <Textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            </div>
            {create.isError && <p className="text-sm text-red-400">{(create.error as Error).message}</p>}
            <Button type="submit" className="w-full" disabled={create.isPending}>
              <CalendarPlus className="h-4 w-4" /> {create.isPending ? "Scheduling…" : "Schedule meeting"}
            </Button>
          </form>
        </Card>

        <div className="space-y-3">
          {isLoading && <Card className="p-6 text-center text-[var(--muted)]">Loading…</Card>}
          {!isLoading && (meetings?.length ?? 0) === 0 && (
            <Card className="p-6 text-center text-[var(--muted)]">No meetings scheduled yet.</Card>
          )}
          {meetings?.map((m) => (
            <Card key={m._id} className="p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{m.title}</p>
                    <Badge className={STATUS_TONE[m.status] ?? ""}>{m.status.replace("_", " ")}</Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-[var(--muted)]">
                    {formatDateTime(m.startsAt)} · {m.durationMins} min
                    {m.leadName ? ` · ${m.leadName}` : ""}
                    {" · "}
                    {PROVIDERS.find((p) => p.value === m.provider)?.label ?? m.provider}
                  </p>
                  {m.notes && <p className="mt-1 text-sm">{m.notes}</p>}
                </div>
                <div className="flex items-center gap-1.5">
                  <a href={m.calendarUrl} target="_blank" rel="noreferrer">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-3.5 w-3.5" /> Add to Calendar
                    </Button>
                  </a>
                  {m.status === "scheduled" && (
                    <>
                      <button
                        onClick={() => update.mutate({ id: m._id, status: "completed" })}
                        className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-emerald-500"
                        aria-label="Mark completed"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => update.mutate({ id: m._id, status: "cancelled" })}
                        className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-amber-500"
                        aria-label="Cancel"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => del.mutate(m._id)}
                    className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-red-400"
                    aria-label="Delete"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}
