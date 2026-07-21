import { aiComplete } from "./client";

export type AssistantContext = {
  businessName?: string;
  businessType?: string;
  issues?: string[];
  priority?: string;
  estimatedValue?: number;
};

export async function askAssistant(
  message: string,
  context?: AssistantContext,
): Promise<{ reply: string; generatedBy: "ai" | "template" }> {
  const system =
    "You are LeadForge Copilot, an assistant for a freelance web developer. Help with proposals, lead analysis, pricing, outreach, and service recommendations. Be concise and practical. Never fabricate client names or testimonials. Prices are in INR unless stated.";

  const ctx = context?.businessName
    ? `Context — Lead: ${context.businessName} (${context.businessType}). Priority: ${context.priority}. Issues: ${(context.issues ?? []).join(", ")}. Est. value: ₹${context.estimatedValue ?? "?"}.`
    : "No specific lead selected.";

  const ai = await aiComplete(system, `${ctx}\n\nUser: ${message}`, { maxTokens: 600 });
  if (ai) return { reply: ai, generatedBy: "ai" };

  return { reply: templateReply(message, context), generatedBy: "template" };
}

function templateReply(message: string, context?: AssistantContext): string {
  const m = message.toLowerCase();
  const name = context?.businessName;

  if (m.includes("price") || m.includes("pricing") || m.includes("quote")) {
    return `Pricing guidance (INR):\n• Landing page: ₹12k–25k\n• Business website: ₹25k–60k\n• Booking/e-commerce: ₹50k–1.2L\n• SEO retainer: ₹15k–40k/mo\n• AI automation: ₹30k–1L\n\nPrice on value and complexity, not hours. Add 15–20% for urgency.${
      name ? `\n\nFor ${name}, start around the mid-range and anchor with a maintenance retainer.` : ""
    }`;
  }
  if (m.includes("proposal")) {
    return `To generate a proposal, open the lead and hit "Generate proposal" — you'll get short, detailed, WhatsApp, email, and LinkedIn variants. Lead with the client's problem, show one relevant live project, then timeline + price + a single clear next step.`;
  }
  if (m.includes("follow") ) {
    return `Follow-up cadence that works: Day 2 (soft bump), Day 5 (add value — a tip or mini-audit), Day 10 (case study), Final (break-up message). Keep each under 4 sentences and always end with one easy yes/no ask.`;
  }
  if (m.includes("service") || m.includes("sell") || m.includes("upsell")) {
    return `High-margin add-ons to pitch: SEO retainer, monthly maintenance, AI chatbot/lead capture, performance optimisation, and content/Google Business setup. Bundle one recurring service with every website to build MRR.`;
  }
  return `I can help with proposals, lead analysis, pricing, outreach copy, and service recommendations. Add your OpenAI API key in the environment to unlock full conversational answers.${
    name ? ` Right now you're focused on ${name}.` : ""
  }`;
}
