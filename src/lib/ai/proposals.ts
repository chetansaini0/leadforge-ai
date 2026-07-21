import type { BusinessType, ProposalVariant } from "@/types";
import { aiComplete } from "./client";
import { matchPortfolios, type SeedPortfolio } from "./portfolio";
import { formatCurrency } from "@/lib/utils";

export type ProposalInput = {
  businessName: string;
  contactName: string;
  businessType: BusinessType;
  issues: string[];
  service: string;
  timelineWeeks: number;
  price: number;
  city: string;
};

export type ProposalResult = {
  content: string;
  generatedBy: "ai" | "template";
  portfolios: SeedPortfolio[];
  service: string;
  timelineWeeks: number;
  price: number;
};

const DEFAULT_TIMELINE: Record<ProposalVariant, number> = {
  short: 3,
  detailed: 4,
  whatsapp: 3,
  email: 3,
  linkedin: 3,
};

export async function generateProposal(
  variant: ProposalVariant,
  input: ProposalInput,
): Promise<ProposalResult> {
  const portfolios = matchPortfolios(input.businessType);
  const service = input.service || defaultService(input.businessType);
  const timelineWeeks = input.timelineWeeks || DEFAULT_TIMELINE[variant];
  const price = input.price || defaultPrice(input.businessType);

  const system =
    "You are a senior freelance web developer and sales copywriter. Write persuasive, specific, non-generic outreach. Never fabricate client names, testimonials, or metrics. Keep the tone warm and confident.";
  const user = buildPrompt(variant, { ...input, service, timelineWeeks, price }, portfolios);

  const ai = await aiComplete(system, user, { maxTokens: variant === "detailed" ? 1100 : 500 });
  const content = ai ?? template(variant, { ...input, service, timelineWeeks, price }, portfolios);

  return {
    content,
    generatedBy: ai ? "ai" : "template",
    portfolios,
    service,
    timelineWeeks,
    price,
  };
}

function defaultService(type: BusinessType): string {
  const map: Record<BusinessType, string> = {
    hotel: "a modern hotel website with direct booking",
    restaurant: "a restaurant website with online menu and reservations",
    jewellery: "a premium jewellery showcase website with lead capture",
    hospital: "a healthcare website with appointment booking",
    coaching: "a coaching website with a lead funnel",
    gym: "a gym website with membership sign-ups",
    salon: "a salon website with online booking",
    other: "a modern, conversion-focused website",
  };
  return map[type];
}

function defaultPrice(type: BusinessType): number {
  const map: Record<BusinessType, number> = {
    hotel: 55000,
    restaurant: 30000,
    jewellery: 45000,
    hospital: 60000,
    coaching: 28000,
    gym: 25000,
    salon: 20000,
    other: 35000,
  };
  return map[type];
}

function buildPrompt(
  variant: ProposalVariant,
  input: ProposalInput,
  portfolios: SeedPortfolio[],
): string {
  const port = portfolios
    .map((p) => `- ${p.name} (${p.liveUrl}): ${p.blurb}`)
    .join("\n");
  const format: Record<ProposalVariant, string> = {
    short: "a punchy 4-6 sentence pitch",
    detailed: "a structured proposal with sections: Understanding, Solution, Relevant Work, Timeline, Investment, Next step",
    whatsapp: "a friendly WhatsApp message under 90 words with line breaks and 1 emoji max",
    email: "a cold email with a subject line (prefix 'Subject:') and a short body",
    linkedin: "a concise LinkedIn connection/DM message under 80 words",
  };
  return [
    `Write ${format[variant]}.`,
    `Business: ${input.businessName}${input.city ? `, ${input.city}` : ""} (${input.businessType}).`,
    input.contactName ? `Contact person: ${input.contactName}.` : "",
    input.issues.length ? `Problems detected on their current web presence: ${input.issues.join(", ")}.` : "",
    `Offer: ${input.service}.`,
    `Timeline: ${input.timelineWeeks} weeks. Investment: ${formatCurrency(input.price)}.`,
    `Reference these REAL portfolio projects (use only these, do not invent others):\n${port}`,
    "Sign off as Chetan Saini, AI Web & SaaS Developer.",
  ]
    .filter(Boolean)
    .join("\n");
}

function template(
  variant: ProposalVariant,
  input: ProposalInput,
  portfolios: SeedPortfolio[],
): string {
  const greeting = input.contactName ? `Hi ${input.contactName}` : `Hi ${input.businessName} team`;
  const issue = input.issues[0] ?? "your current site could convert more visitors";
  const p = portfolios[0];
  const price = formatCurrency(input.price);

  switch (variant) {
    case "short":
      return `${greeting}, I build ${input.service} for businesses like yours. I noticed ${issue.toLowerCase()}. I recently shipped ${p?.name} (${p?.liveUrl}) — I can deliver similar results for ${input.businessName} in ${input.timelineWeeks} weeks for ${price}. Open to a quick call?\n\n— Chetan Saini, AI Web & SaaS Developer`;

    case "whatsapp":
      return `${greeting}! 👋\n\nI came across ${input.businessName} and noticed ${issue.toLowerCase()}. I build ${input.service}.\n\nRecent work: ${p?.name} — ${p?.liveUrl}\n\nI can do this for you in ${input.timelineWeeks} weeks (${price}). Want me to send a quick plan?\n\n— Chetan`;

    case "email":
      return `Subject: Quick idea for ${input.businessName}'s website\n\n${greeting},\n\nI build ${input.service}. Looking at ${input.businessName}, I noticed ${issue.toLowerCase()} — which usually means lost enquiries.\n\nI recently delivered ${p?.name} (${p?.liveUrl}): ${p?.blurb}\n\nI can build this for ${input.businessName} in ${input.timelineWeeks} weeks for ${price}, including SEO, mobile optimisation, and a lead/booking flow.\n\nWould a 15-minute call this week work?\n\nBest,\nChetan Saini\nAI Web & SaaS Developer`;

    case "linkedin":
      return `${greeting}, I help ${input.businessType} businesses win more customers online with ${input.service}. Recently shipped ${p?.name} (${p?.liveUrl}). I'd love to share a couple of quick ideas for ${input.businessName} — open to connecting?\n\n— Chetan Saini`;

    case "detailed":
    default:
      return [
        `Proposal for ${input.businessName}`,
        ``,
        `Prepared by: Chetan Saini — AI Web & SaaS Developer`,
        ``,
        `1) Understanding your situation`,
        `${greeting}, I looked at ${input.businessName}${input.city ? ` in ${input.city}` : ""}. ${
          input.issues.length
            ? `A few things stood out: ${input.issues.join(", ")}.`
            : `There's a clear opportunity to convert more visitors into customers.`
        }`,
        ``,
        `2) Proposed solution`,
        `I'll build ${input.service} with a modern, responsive design, strong SEO foundations, fast loading, and a clear lead/booking flow — everything needed to turn visits into enquiries.`,
        ``,
        `3) Relevant work (real, live projects)`,
        ...portfolios.map((pf) => `• ${pf.name} — ${pf.liveUrl}\n  ${pf.blurb}`),
        ``,
        `4) Timeline`,
        `Approximately ${input.timelineWeeks} weeks from kickoff, delivered in milestones you can review.`,
        ``,
        `5) Investment`,
        `${price} (fixed scope). Optional monthly maintenance available.`,
        ``,
        `6) Next step`,
        `A quick 15-minute call to confirm scope. Reply and I'll share a couple of time slots.`,
        ``,
        `Thank you,`,
        `Chetan Saini`,
      ].join("\n");
  }
}
