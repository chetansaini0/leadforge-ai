"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Check, Send, Code2, MailOpen, Reply, Trash2, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLeads } from "@/hooks/useLeads";
import { api } from "@/lib/fetcher";

const CHANNELS = ["email", "whatsapp", "linkedin"];
const KINDS = [
  { id: "cold", label: "Cold outreach" },
  { id: "seo_audit", label: "SEO audit offer" },
  { id: "redesign", label: "Website redesign offer" },
  { id: "automation", label: "AI automation offer" },
  { id: "followup", label: "Follow-up" },
  { id: "closing", label: "Closing nudge" },
];

type GenResult = { id: string; subject: string; body: string; generatedBy: string; trackingHtml: string };

type OutreachRow = {
  _id: string;
  businessName: string;
  channel: string;
  kind: string;
  subject: string;
  status: string;
  sentAt: string | null;
  openedAt: string | null;
  openCount: number;
  repliedAt: string | null;
  createdAt: string;
};

const STATUS_TONE: Record<string, string> = {
  draft: "bg-slate-500/15 text-slate-400",
  sent: "bg-blue-500/15 text-blue-400",
  opened: "bg-amber-500/15 text-amber-500",
  replied: "bg-emerald-500/15 text-emerald-500",
  bounced: "bg-red-500/15 text-red-400",
};

function OutreachInner() {
  const params = useSearchParams();
  const qc = useQueryClient();
  const { data: leads } = useLeads();
  const [leadId, setLeadId] = useState(params.get("lead") ?? "");
  const [channel, setChannel] = useState("email");
  const [kind, setKind] = useState(params.get("kind") ?? "cold");
  const [step, setStep] = useState(params.get("step") || "1");
  const [result, setResult] = useState<GenResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"text" | "html" | null>(null);

  const { data: history } = useQuery({
    queryKey: ["outreach"],
    queryFn: () => api<OutreachRow[]>("/api/outreach"),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api(`/api/outreach/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["outreach"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  const del = useMutation({
    mutationFn: (id: string) => api(`/api/outreach/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["outreach"] });
      qc.invalidateQueries({ queryKey: ["analytics"] });
    },
  });

  async function generate() {
    if (!leadId) { setError("Pick a lead first."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await api<GenResult>("/api/outreach/generate", {
        method: "POST",
        body: JSON.stringify({ leadId, channel, kind, step: Number(step) || 0 }),
      });
      setResult(data);
      qc.invalidateQueries({ queryKey: ["outreach"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  function copyText() {
    if (!result) return;
    const text = result.subject ? `Subject: ${result.subject}\n\n${result.body}` : result.body;
    navigator.clipboard.writeText(text);
    setCopied("text");
    setTimeout(() => setCopied(null), 1500);
  }

  async function copyHtml() {
    if (!result?.trackingHtml) return;
    try {
      const item = new ClipboardItem({
        "text/html": new Blob([result.trackingHtml], { type: "text/html" }),
        "text/plain": new Blob([result.body], { type: "text/plain" }),
      });
      await navigator.clipboard.write([item]);
    } catch {
      await navigator.clipboard.writeText(result.trackingHtml);
    }
    setCopied("html");
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Outreach Studio</h1>
        <p className="text-sm text-[var(--muted)]">
          Generate personalized, review-before-you-send messages. Paste the tracked HTML into Gmail to detect opens.
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <Card>
          <CardHeader><CardTitle>Configure</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label>Lead</Label>
              <Select className="w-full" value={leadId} onChange={(e) => setLeadId(e.target.value)}>
                <option value="">Select a lead…</option>
                {leads?.map((l) => <option key={l._id} value={l._id}>{l.businessName} ({l.businessType})</option>)}
              </Select>
            </div>
            <div>
              <Label>Channel</Label>
              <Select className="w-full" value={channel} onChange={(e) => setChannel(e.target.value)}>
                {CHANNELS.map((c) => <option key={c} value={c}>{c}</option>)}
              </Select>
            </div>
            <div>
              <Label>Message type</Label>
              <Select className="w-full" value={kind} onChange={(e) => setKind(e.target.value)}>
                {KINDS.map((k) => <option key={k.id} value={k.id}>{k.label}</option>)}
              </Select>
            </div>
            {kind === "followup" && (
              <div>
                <Label>Follow-up step</Label>
                <Select className="w-full" value={step} onChange={(e) => setStep(e.target.value)}>
                  <option value="1">Day 2</option>
                  <option value="2">Day 5</option>
                  <option value="3">Day 10</option>
                  <option value="4">Final</option>
                </Select>
              </div>
            )}
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button className="w-full" onClick={generate} disabled={loading}>
              <Send className="h-4 w-4" /> {loading ? "Generating…" : "Generate message"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-5 pb-0">
            <CardTitle>Output</CardTitle>
            {result && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyText}>
                  {copied === "text" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === "text" ? "Copied" : "Copy text"}
                </Button>
                {result.trackingHtml && (
                  <Button variant="outline" size="sm" onClick={copyHtml}>
                    {copied === "html" ? <Check className="h-3.5 w-3.5" /> : <Code2 className="h-3.5 w-3.5" />}
                    {copied === "html" ? "Copied" : "Copy tracked HTML"}
                  </Button>
                )}
              </div>
            )}
          </div>
          <CardContent>
            {!result && <p className="text-sm text-[var(--muted)]">Your message will appear here.</p>}
            {result && (
              <>
                <span className="mb-3 inline-block rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                  {result.generatedBy === "ai" ? "AI-generated" : "Template"}
                </span>
                {result.subject && <p className="mb-2 text-sm"><span className="text-[var(--muted)]">Subject: </span>{result.subject}</p>}
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{result.body}</pre>
                {result.trackingHtml && (
                  <p className="mt-3 text-xs text-[var(--muted)]">
                    Tip: use &ldquo;Copy tracked HTML&rdquo;, then in Gmail paste into the body. When the recipient
                    loads images, the message is marked <strong>opened</strong> below.
                  </p>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sent &amp; tracking</CardTitle>
        </CardHeader>
        <CardContent>
          {(history?.length ?? 0) === 0 && (
            <p className="text-sm text-[var(--muted)]">No messages generated yet.</p>
          )}
          <div className="space-y-2">
            {history?.map((o) => (
              <div
                key={o._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{o.businessName || "Lead"}</p>
                    <Badge className={STATUS_TONE[o.status] ?? ""}>{o.status}</Badge>
                    <span className="text-xs capitalize text-[var(--muted)]">{o.channel} · {o.kind.replace("_", " ")}</span>
                  </div>
                  <p className="truncate text-xs text-[var(--muted)]">
                    {o.subject || o.channel + " message"}
                    {o.openCount > 0 && ` · opened ${o.openCount}×`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {o.status === "draft" && (
                    <button
                      title="Mark sent"
                      onClick={() => setStatus.mutate({ id: o._id, status: "sent" })}
                      className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-blue-400"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                    </button>
                  )}
                  {o.status !== "replied" && (
                    <button
                      title="Mark replied"
                      onClick={() => setStatus.mutate({ id: o._id, status: "replied" })}
                      className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-emerald-500"
                    >
                      <Reply className="h-4 w-4" />
                    </button>
                  )}
                  {o.openedAt && <MailOpen className="h-4 w-4 text-amber-500" />}
                  <button
                    title="Delete"
                    onClick={() => del.mutate(o._id)}
                    className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function OutreachPage() {
  return (
    <Suspense fallback={<div className="text-sm text-[var(--muted)]">Loading…</div>}>
      <OutreachInner />
    </Suspense>
  );
}
