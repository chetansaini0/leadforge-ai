"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Copy, Check, Send } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/input";
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

function OutreachInner() {
  const params = useSearchParams();
  const { data: leads } = useLeads();
  const [leadId, setLeadId] = useState(params.get("lead") ?? "");
  const [channel, setChannel] = useState("email");
  const [kind, setKind] = useState("cold");
  const [step, setStep] = useState("1");
  const [result, setResult] = useState<{ subject: string; body: string; generatedBy: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  async function generate() {
    if (!leadId) { setError("Pick a lead first."); return; }
    setLoading(true); setError(""); setResult(null);
    try {
      const data = await api<{ subject: string; body: string; generatedBy: string }>("/api/outreach/generate", {
        method: "POST",
        body: JSON.stringify({ leadId, channel, kind, step: Number(step) || 0 }),
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
    const text = result.subject ? `Subject: ${result.subject}\n\n${result.body}` : result.body;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <div className="space-y-6 fade-up">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Outreach Studio</h1>
        <p className="text-sm text-[var(--muted)]">
          Generate personalized, review-before-you-send messages. Compliant: you send them manually.
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
              <Button variant="outline" size="sm" onClick={copy}>
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied" : "Copy"}
              </Button>
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
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
