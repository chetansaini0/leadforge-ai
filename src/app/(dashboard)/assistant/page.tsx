"use client";

import { useRef, useState } from "react";
import { Bot, Send, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { useLeads } from "@/hooks/useLeads";
import { api } from "@/lib/fetcher";

type Msg = { role: "user" | "assistant"; text: string };

const SUGGESTIONS = [
  "How should I price a hotel website?",
  "Write a follow-up plan for a cold lead",
  "What services can I upsell to a restaurant?",
  "Draft a proposal outline for a jewellery store",
];

export default function AssistantPage() {
  const { data: leads } = useLeads();
  const [leadId, setLeadId] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", text: "Hi! I'm your LeadForge Copilot. Ask me about proposals, pricing, lead analysis, or outreach." },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  async function send(text: string) {
    if (!text.trim()) return;
    const next = [...messages, { role: "user" as const, text }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const data = await api<{ reply: string }>("/api/assistant", {
        method: "POST",
        body: JSON.stringify({ message: text, leadId: leadId || undefined }),
      });
      setMessages([...next, { role: "assistant", text: data.reply }]);
    } catch (err) {
      setMessages([...next, { role: "assistant", text: err instanceof Error ? err.message : "Error" }]);
    } finally {
      setLoading(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
    }
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-3xl flex-col fade-up">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Assistant</h1>
          <p className="text-sm text-[var(--muted)]">Your sales & delivery copilot.</p>
        </div>
        <Select value={leadId} onChange={(e) => setLeadId(e.target.value)}>
          <option value="">No lead context</option>
          {leads?.map((l) => <option key={l._id} value={l._id}>{l.businessName}</option>)}
        </Select>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 space-y-4 overflow-y-auto p-5 scrollbar-thin">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${m.role === "user" ? "bg-[var(--surface-2)]" : "bg-[var(--primary)] text-[var(--primary-fg)]"}`}>
                {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${m.role === "user" ? "bg-[var(--primary)] text-[var(--primary-fg)]" : "bg-[var(--surface-2)]"}`}>
                <pre className="whitespace-pre-wrap font-sans">{m.text}</pre>
              </div>
            </div>
          ))}
          {loading && <p className="pl-11 text-sm text-[var(--muted)]">Thinking…</p>}
          <div ref={endRef} />
        </div>

        {messages.length <= 1 && (
          <div className="flex flex-wrap gap-2 px-5 pb-3">
            {SUGGESTIONS.map((s) => (
              <button key={s} onClick={() => send(s)} className="rounded-full border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--muted)] hover:bg-[var(--surface-2)]">
                {s}
              </button>
            ))}
          </div>
        )}

        <form
          onSubmit={(e) => { e.preventDefault(); send(input); }}
          className="flex gap-2 border-t border-[var(--border)] p-3"
        >
          <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Ask anything about your leads…" />
          <Button type="submit" size="icon" disabled={loading}><Send className="h-4 w-4" /></Button>
        </form>
      </Card>
    </div>
  );
}
