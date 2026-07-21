"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, Check, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label, Select, Input } from "@/components/ui/input";
import { useLeads } from "@/hooks/useLeads";
import { api } from "@/lib/fetcher";

const VARIANTS = [
  { id: "detailed", label: "Detailed proposal" },
  { id: "short", label: "Short pitch" },
  { id: "email", label: "Email pitch" },
  { id: "whatsapp", label: "WhatsApp pitch" },
  { id: "linkedin", label: "LinkedIn message" },
];

function ProposalsInner() {
  const params = useSearchParams();
  const { data: leads } = useLeads();
  const [leadId, setLeadId] = useState(params.get("lead") ?? "");
  const [variant, setVariant] = useState("detailed");
  const [price, setPrice] = useState("");
  const [timeline, setTimeline] = useState("");
  const [result, setResult] = useState<{ content: string; generatedBy: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!leadId) { setError("Pick a lead first."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await api<{ content: string; generatedBy: string }>("/api/proposals/generate", {
        method: "POST",
        body: JSON.stringify({
          leadId, variant,
          price: Number(price) || 0,
          timelineWeeks: Number(timeline) || 0,
        }),
      });
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  function copy() {
    if (!result) return;
    navigator.clipboard.writeText(result.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">AI Proposal Generator</h1>
        <p className="text-sm text-[var(--muted)]">Personalized proposals with your real portfolio auto-matched to the lead.</p>
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
              <Button variant="outline" size="sm" onClick={copy}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
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
