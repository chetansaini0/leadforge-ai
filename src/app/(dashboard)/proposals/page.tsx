"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Copy, Check, Sparkles, Link2, Eye, ThumbsUp, ThumbsDown, Trash2, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label, Select, Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLeads } from "@/hooks/useLeads";
import { api } from "@/lib/fetcher";
import { formatCurrency } from "@/lib/utils";

const VARIANTS = [
  { id: "detailed", label: "Detailed proposal" },
  { id: "short", label: "Short pitch" },
  { id: "email", label: "Email pitch" },
  { id: "whatsapp", label: "WhatsApp pitch" },
  { id: "linkedin", label: "LinkedIn message" },
];

type GenResult = { id: string; publicId: string; content: string; generatedBy: string };

type ProposalRow = {
  _id: string;
  businessName: string;
  variant: string;
  service: string;
  price: number;
  timelineWeeks: number;
  status: string;
  publicId?: string;
  viewCount: number;
  viewedAt: string | null;
  createdAt: string;
};

const STATUS_TONE: Record<string, string> = {
  draft: "bg-slate-500/15 text-slate-400",
  sent: "bg-blue-500/15 text-blue-400",
  viewed: "bg-amber-500/15 text-amber-500",
  accepted: "bg-emerald-500/15 text-emerald-500",
  rejected: "bg-red-500/15 text-red-400",
};

function ProposalsInner() {
  const params = useSearchParams();
  const qc = useQueryClient();
  const { data: leads } = useLeads();
  const [leadId, setLeadId] = useState(params.get("lead") ?? "");
  const [variant, setVariant] = useState("detailed");
  const [price, setPrice] = useState("");
  const [timeline, setTimeline] = useState("");
  const [result, setResult] = useState<GenResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState<"text" | "link" | null>(null);

  const { data: history } = useQuery({
    queryKey: ["proposals"],
    queryFn: () => api<ProposalRow[]>("/api/proposals"),
  });

  const setStatus = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api(`/api/proposals/${id}`, { method: "PATCH", body: JSON.stringify({ status }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["proposals"] }),
  });

  const del = useMutation({
    mutationFn: (id: string) => api(`/api/proposals/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["proposals"] }),
  });

  async function generate() {
    if (!leadId) { setError("Pick a lead first."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await api<GenResult>("/api/proposals/generate", {
        method: "POST",
        body: JSON.stringify({
          leadId, variant,
          price: Number(price) || 0,
          timelineWeeks: Number(timeline) || 0,
        }),
      });
      setResult(data);
      qc.invalidateQueries({ queryKey: ["proposals"] });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    if (!result) return;
    navigator.clipboard.writeText(result.content);
    setCopied("text");
    setTimeout(() => setCopied(null), 1500);
  }

  function copyLink(publicId?: string) {
    const id = publicId ?? result?.publicId;
    if (!id) return;
    navigator.clipboard.writeText(`${window.location.origin}/p/${id}`);
    setCopied("link");
    setTimeout(() => setCopied(null), 1500);
  }

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Proposal Generator</h1>
        <p className="text-sm text-[var(--muted)]">
          Personalized proposals with your real portfolio auto-matched. Share a link and see when it&apos;s viewed.
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
              <Label>Variant</Label>
              <Select className="w-full" value={variant} onChange={(e) => setVariant(e.target.value)}>
                {VARIANTS.map((v) => <option key={v.id} value={v.id}>{v.label}</option>)}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Price (₹)</Label><Input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="auto" /></div>
              <div><Label>Timeline (weeks)</Label><Input value={timeline} onChange={(e) => setTimeline(e.target.value)} placeholder="auto" /></div>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button className="w-full" onClick={generate} disabled={loading}>
              <Sparkles className="h-4 w-4" /> {loading ? "Generating…" : "Generate proposal"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <div className="flex items-center justify-between p-5 pb-0">
            <CardTitle>Output</CardTitle>
            {result && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copy}>
                  {copied === "text" ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  {copied === "text" ? "Copied" : "Copy"}
                </Button>
                <Button variant="outline" size="sm" onClick={() => copyLink()}>
                  {copied === "link" ? <Check className="h-3.5 w-3.5" /> : <Link2 className="h-3.5 w-3.5" />}
                  {copied === "link" ? "Copied" : "Share link"}
                </Button>
              </div>
            )}
          </div>
          <CardContent>
            {!result && <p className="text-sm text-[var(--muted)]">Your generated proposal will appear here.</p>}
            {result && (
              <>
                <span className="mb-3 inline-block rounded-full bg-[var(--surface-2)] px-2 py-0.5 text-[10px] uppercase tracking-wide text-[var(--muted)]">
                  {result.generatedBy === "ai" ? "AI-generated" : "Template (add OpenAI key for AI)"}
                </span>
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed">{result.content}</pre>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Proposals &amp; engagement</CardTitle></CardHeader>
        <CardContent>
          {(history?.length ?? 0) === 0 && <p className="text-sm text-[var(--muted)]">No proposals yet.</p>}
          <div className="space-y-2">
            {history?.map((p) => (
              <div
                key={p._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-3 py-2.5"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="truncate font-medium">{p.businessName}</p>
                    <Badge className={STATUS_TONE[p.status] ?? ""}>{p.status}</Badge>
                    <span className="text-xs text-[var(--muted)]">{p.variant}</span>
                  </div>
                  <p className="truncate text-xs text-[var(--muted)]">
                    {p.price > 0 ? formatCurrency(p.price) : "no price"}
                    {p.timelineWeeks > 0 && ` · ${p.timelineWeeks}w`}
                    {p.viewCount > 0 && ` · viewed ${p.viewCount}×`}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  {p.viewedAt && <Eye className="h-4 w-4 text-amber-500" />}
                  {p.publicId && (
                    <button title="Copy share link" onClick={() => copyLink(p.publicId)}
                      className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-[var(--primary)]">
                      <Link2 className="h-4 w-4" />
                    </button>
                  )}
                  {p.status === "draft" && (
                    <button title="Mark sent" onClick={() => setStatus.mutate({ id: p._id, status: "sent" })}
                      className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-blue-400">
                      <Send className="h-4 w-4" />
                    </button>
                  )}
                  <button title="Mark accepted" onClick={() => setStatus.mutate({ id: p._id, status: "accepted" })}
                    className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-emerald-500">
                    <ThumbsUp className="h-4 w-4" />
                  </button>
                  <button title="Mark rejected" onClick={() => setStatus.mutate({ id: p._id, status: "rejected" })}
                    className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-red-400">
                    <ThumbsDown className="h-4 w-4" />
                  </button>
                  <button title="Delete" onClick={() => del.mutate(p._id)}
                    className="rounded-lg p-2 text-[var(--muted)] hover:bg-[var(--surface)] hover:text-red-400">
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

export default function ProposalsPage() {
  return (
    <Suspense fallback={<div className="text-sm text-[var(--muted)]">Loading…</div>}>
      <ProposalsInner />
    </Suspense>
  );
}
