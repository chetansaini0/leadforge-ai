import type { BusinessType } from "@/types";
import { aiComplete } from "./client";
import { matchPortfolios } from "./portfolio";

export type OutreachChannel = "email" | "whatsapp" | "linkedin";
export type OutreachKind =
  | "cold"
  | "seo_audit"
  | "redesign"
  | "automation"
  | "followup"
  | "closing";

export type OutreachInput = {
  businessName: string;
  contactName: string;
  businessType: BusinessType;
  issues: string[];
  step: number;
  city?: string;
  scores?: { overall: number; seo: number; mobile: number; speed: number; design: number; conversion: number };
  suggestedServices?: string[];
  googleRating?: number;
  hasWebsite?: boolean;
};

export type OutreachResult = {
  subject: string;
  body: string;
  generatedBy: "ai" | "template";
};

const KIND_ANGLE: Record<OutreachKind, string> = {
  cold: "a first cold introduction offering a website/redesign",
  seo_audit: "a free SEO audit offer",
  redesign: "a website redesign offer",
  automation: "an AI automation offer (chatbot, lead capture, follow-ups)",
  followup: "a polite follow-up to a previous unanswered message",
  closing: "a gentle closing nudge to book a call",
};

const FOLLOWUP_LABEL = ["", "Day 2 follow-up", "Day 5 follow-up", "Day 10 follow-up", "Final follow-up"];

export async function generateOutreach(
  channel: OutreachChannel,
  kind: OutreachKind,
  input: OutreachInput,
): Promise<OutreachResult> {
  const portfolios = matchPortfolios(input.businessType);
  const p = portfolios[0];

  const system =
    "You are a senior freelancer writing high-converting, human, non-spammy outreach. Never fabricate testimonials, client names, or numbers. Keep it concise and specific.";
  const user = [
    `Channel: ${channel}. Goal: ${KIND_ANGLE[kind]}.`,
    kind === "followup" ? `This is ${FOLLOWUP_LABEL[Math.min(input.step, 4)] || "a follow-up"}.` : "",
    `Business: ${input.businessName}${input.city ? `, ${input.city}` : ""} (${input.businessType}).`,
    input.contactName ? `Contact: ${input.contactName}.` : "",
    input.hasWebsite === false ? "They have no website yet — lead with that gap." : "",
    typeof input.googleRating === "number" && input.googleRating > 0
      ? `They have a ${input.googleRating}★ Google rating — reference their good reputation naturally.`
      : "",
    input.scores ? `Their site scores ${input.scores.overall}/100 overall (open with one concrete weak point).` : "",
    input.issues.length ? `Detected issues: ${input.issues.join(", ")}.` : "",
    input.suggestedServices?.length ? `Services to hint at: ${input.suggestedServices.slice(0, 2).join(", ")}.` : "",
    p ? `Reference this real project only: ${p.name} (${p.liveUrl}).` : "",
    "Keep it under 120 words. Be specific, not generic. No fake urgency.",
    channel === "email" ? "Return a subject line prefixed with 'Subject:' then the body." : "Return only the message body.",
    "Sign as Chetan.",
  ]
    .filter(Boolean)
    .join("\n");

  const ai = await aiComplete(system, user, { maxTokens: 450 });
  if (ai) {
    return { ...splitSubject(ai, channel), generatedBy: "ai" };
  }
  return { ...template(channel, kind, input, p?.name ?? "", p?.liveUrl ?? ""), generatedBy: "template" };
}

function splitSubject(text: string, channel: OutreachChannel): { subject: string; body: string } {
  if (channel !== "email") return { subject: "", body: text };
  const m = text.match(/subject:\s*(.+)/i);
  if (m) {
    const subject = m[1].trim();
    const body = text.replace(/subject:\s*.+\n?/i, "").trim();
    return { subject, body };
  }
  return { subject: "", body: text };
}

function template(
  channel: OutreachChannel,
  kind: OutreachKind,
  input: OutreachInput,
  portfolioName: string,
  portfolioUrl: string,
): { subject: string; body: string } {
  const greeting = input.contactName ? `Hi ${input.contactName}` : `Hi ${input.businessName} team`;
  const issue = (input.issues[0] ?? "your website could convert more visitors").toLowerCase();

  if (kind === "followup") {
    const label = FOLLOWUP_LABEL[Math.min(input.step, 4)] || "Following up";
    const body = `${greeting}, just floating this back to the top of your inbox. I shared how I could help ${input.businessName} with its online presence — happy to send a quick plan or hop on a 15-min call. No pressure either way!\n\n— Chetan`;
    return { subject: channel === "email" ? `${label}: ${input.businessName} website` : "", body };
  }

  if (kind === "seo_audit") {
    const body = `${greeting}, I put together a quick, free audit of ${input.businessName}'s online presence — I noticed ${issue}. I recently built ${portfolioName} (${portfolioUrl}). Want me to send the audit + a couple of fixes?\n\n— Chetan`;
    return { subject: channel === "email" ? `Free audit for ${input.businessName}` : "", body };
  }

  const body = `${greeting}, I build modern, high-converting websites and automation for ${input.businessType} businesses. Looking at ${input.businessName}, I noticed ${issue}. Recent work: ${portfolioName} (${portfolioUrl}). Could I share a couple of quick ideas?\n\n— Chetan`;
  return { subject: channel === "email" ? `Idea for ${input.businessName}'s website` : "", body };
}
