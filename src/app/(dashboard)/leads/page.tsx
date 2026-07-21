"use client";

import { useState } from "react";
import { Search, Plus, Trash2, ExternalLink, X } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/input";
import { PriorityBadge, ScorePill, STAGE_LABELS } from "@/components/ui/badge";
import { useCreateLead, useDeleteLead, useLeads } from "@/hooks/useLeads";
import { formatCurrency } from "@/lib/utils";
import type { ClientLead } from "@/types/client";
import { PIPELINE_STAGES } from "@/types";

const TYPES = ["hotel", "restaurant", "jewellery", "hospital", "coaching", "gym", "salon", "other"];

export default function LeadsPage() {
  const [q, setQ] = useState("");
  const [type, setType] = useState("");
  const [priority, setPriority] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [selected, setSelected] = useState<ClientLead | null>(null);

  const { data: leads, isLoading } = useLeads({ q, type, priority });
  const del = useDeleteLead();

  return (
    <div className="space-y-6 fade-up">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Leads</h1>
          <p className="text-sm text-[var(--muted)]">
            {leads?.length ?? 0} businesses · auto-analyzed and prioritized.
          </p>
        </div>
        <Button onClick={() => setShowAdd(true)}>
          <Plus className="h-4 w-4" /> Add lead
        </Button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--muted)]" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, city, email…" className="pl-9" />
        </div>
        <Select value={type} onChange={(e) => setType(e.target.value)}>
          <option value="">All types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Select value={priority} onChange={(e) => setPriority(e.target.value)}>
          <option value="">All priorities</option>
          {["hot", "high", "medium", "low"].map((p) => <option key={p} value={p}>{p}</option>)}
        </Select>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] text-left text-xs uppercase tracking-wide text-[var(--muted)]">
                <th className="p-3">Business</th>
                <th className="p-3">Type</th>
                <th className="p-3">Priority</th>
                <th className="p-3">Web score</th>
                <th className="p-3">Est. value</th>
                <th className="p-3">Stage</th>
                <th className="p-3"></th>
              </tr>
            </thead>
            <tbody>
              {isLoading && (
                <tr><td colSpan={7} className="p-6 text-center text-[var(--muted)]">Loading…</td></tr>
              )}
              {!isLoading && (leads?.length ?? 0) === 0 && (
                <tr><td colSpan={7} className="p-6 text-center text-[var(--muted)]">
                  No leads yet. Add one or click "Load demo data" in the top bar.
                </td></tr>
              )}
              {leads?.map((l) => (
                <tr
                  key={l._id}
                  className="cursor-pointer border-b border-[var(--border)] transition-colors hover:bg-[var(--surface-2)]"
                  onClick={() => setSelected(l)}
                >
                  <td className="p-3">
                    <p className="font-medium">{l.businessName}</p>
                    <p className="text-xs text-[var(--muted)]">{l.city || "—"}{l.contactName ? ` · ${l.contactName}` : ""}</p>
                  </td>
                  <td className="p-3 capitalize text-[var(--muted)]">{l.businessType}</td>
                  <td className="p-3"><PriorityBadge priority={l.priority} /></td>
                  <td className="p-3">
                    <span className="font-semibold">{l.scores?.overall ?? "—"}</span>
                    <span className="text-xs text-[var(--muted)]">/100</span>
                  </td>
                  <td className="p-3">{formatCurrency(l.estimatedValue ?? 0)}</td>
                  <td className="p-3 text-xs text-[var(--muted)]">{STAGE_LABELS[l.stage]}</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={(e) => { e.stopPropagation(); del.mutate(l._id); }}
                      className="text-[var(--muted)] hover:text-red-400"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {showAdd && <AddLeadModal onClose={() => setShowAdd(false)} />}
      {selected && <LeadDrawer lead={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function AddLeadModal({ onClose }: { onClose: () => void }) {
  const create = useCreateLead();
  const [form, setForm] = useState({
    businessName: "", businessType: "hotel", contactName: "", email: "",
    phone: "", website: "", city: "", googleRating: "", reviewsCount: "",
  });
  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await create.mutateAsync({
      businessName: form.businessName,
      businessType: form.businessType,
      contactName: form.contactName,
      email: form.email,
      phone: form.phone,
      website: form.website,
      city: form.city,
      googleRating: Number(form.googleRating) || 0,
      reviewsCount: Number(form.reviewsCount) || 0,
    });
    onClose();
  }

  return (
    <Overlay onClose={onClose} title="Add lead">
      <form onSubmit={submit} className="space-y-3">
        <div>
          <Label>Business name *</Label>
          <Input required value={form.businessName} onChange={(e) => set("businessName", e.target.value)} />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label>Type</Label>
            <Select className="w-full" value={form.businessType} onChange={(e) => set("businessType", e.target.value)}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          <div><Label>City</Label><Input value={form.city} onChange={(e) => set("city", e.target.value)} /></div>
        </div>
        <div><Label>Contact name</Label><Input value={form.contactName} onChange={(e) => set("contactName", e.target.value)} /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Email</Label><Input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} /></div>
          <div><Label>Phone</Label><Input value={form.phone} onChange={(e) => set("phone", e.target.value)} /></div>
        </div>
        <div><Label>Website</Label><Input value={form.website} onChange={(e) => set("website", e.target.value)} placeholder="https://…" /></div>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>Google rating</Label><Input value={form.googleRating} onChange={(e) => set("googleRating", e.target.value)} placeholder="4.2" /></div>
          <div><Label>Reviews count</Label><Input value={form.reviewsCount} onChange={(e) => set("reviewsCount", e.target.value)} placeholder="120" /></div>
        </div>
        {create.isError && <p className="text-sm text-red-400">{(create.error as Error).message}</p>}
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
          <Button type="submit" disabled={create.isPending}>{create.isPending ? "Analyzing…" : "Add & analyze"}</Button>
        </div>
      </form>
    </Overlay>
  );
}

function LeadDrawer({ lead, onClose }: { lead: ClientLead; onClose: () => void }) {
  return (
    <Overlay onClose={onClose} title={lead.businessName}>
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={lead.priority} />
          <span className="text-xs text-[var(--muted)] capitalize">{lead.businessType} · {lead.city || "—"}</span>
        </div>

        {lead.scores && (
          <div className="grid grid-cols-5 gap-2">
            <ScorePill label="SEO" value={lead.scores.seo} />
            <ScorePill label="Mobile" value={lead.scores.mobile} />
            <ScorePill label="Speed" value={lead.scores.speed} />
            <ScorePill label="Design" value={lead.scores.design} />
            <ScorePill label="Convert" value={lead.scores.conversion} />
          </div>
        )}

        {!!lead.issues?.length && (
          <div>
            <p className="mb-1 text-xs font-medium text-[var(--muted)]">Detected issues</p>
            <ul className="flex flex-wrap gap-1.5">
              {lead.issues.map((i) => (
                <li key={i} className="rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs text-red-400">{i}</li>
              ))}
            </ul>
          </div>
        )}

        {!!lead.suggestedServices?.length && (
          <div>
            <p className="mb-1 text-xs font-medium text-[var(--muted)]">Suggested services</p>
            <ul className="flex flex-wrap gap-1.5">
              {lead.suggestedServices.map((s) => (
                <li key={s} className="rounded-full bg-[var(--primary)]/15 px-2.5 py-0.5 text-xs text-[var(--primary)]">{s}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
            <p className="text-lg font-semibold">{formatCurrency(lead.estimatedValue ?? 0)}</p>
            <p className="text-xs text-[var(--muted)]">Estimated value</p>
          </div>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3">
            <p className="text-lg font-semibold">{lead.closingProbability ?? 0}%</p>
            <p className="text-xs text-[var(--muted)]">Closing probability</p>
          </div>
        </div>

        {lead.aiReasoning && (
          <div>
            <p className="mb-1 text-xs font-medium text-[var(--muted)]">AI reasoning</p>
            <p className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] p-3 text-sm">{lead.aiReasoning}</p>
          </div>
        )}

        {lead.website && (
          <a href={lead.website} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm text-[var(--primary)] hover:underline">
            Visit website <ExternalLink className="h-3.5 w-3.5" />
          </a>
        )}

        <div className="flex gap-2 pt-2">
          <a href={`/proposals?lead=${lead._id}`} className="flex-1"><Button className="w-full">Generate proposal</Button></a>
          <a href={`/outreach?lead=${lead._id}`} className="flex-1"><Button variant="outline" className="w-full">Draft outreach</Button></a>
        </div>
      </div>
    </Overlay>
  );
}

function Overlay({ children, title, onClose }: { children: React.ReactNode; title: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="h-full w-full max-w-md overflow-y-auto border-l border-[var(--border)] bg-[var(--surface)] p-5 scrollbar-thin fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button onClick={onClose} className="text-[var(--muted)] hover:text-[var(--text)]"><X className="h-5 w-5" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}
