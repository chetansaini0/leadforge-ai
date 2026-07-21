import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Lead, type LeanLead } from "@/models/Lead";
import { Proposal } from "@/models/Proposal";
import { requireAuth, ok, fail, rateLimit } from "@/lib/api";
import { proposalSchema } from "@/lib/validation";
import { generateProposal } from "@/lib/ai/proposals";
import type { BusinessType } from "@/types";

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  if (!rateLimit(`proposal:${auth.sub}`, 40)) return fail("Rate limit reached. Slow down.", 429);

  const parsed = proposalSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid input", 422);

  try {
    await connectDB();
    const lead = await Lead.findOne({ _id: parsed.data.leadId, owner: auth.sub }).lean<LeanLead>();
    if (!lead) return fail("Lead not found", 404);

    const result = await generateProposal(parsed.data.variant, {
      businessName: lead.businessName,
      contactName: lead.contactName ?? "",
      businessType: (lead.businessType ?? "other") as BusinessType,
      issues: lead.issues ?? [],
      service: parsed.data.service,
      timelineWeeks: parsed.data.timelineWeeks,
      price: parsed.data.price || lead.estimatedValue || 0,
      city: lead.city ?? "",
    });

    const proposal = await Proposal.create({
      owner: auth.sub,
      lead: lead._id,
      businessName: lead.businessName,
      variant: parsed.data.variant,
      service: result.service,
      timelineWeeks: result.timelineWeeks,
      price: result.price,
      content: result.content,
      generatedBy: result.generatedBy,
    });

    return ok({
      id: String(proposal._id),
      content: result.content,
      generatedBy: result.generatedBy,
      portfolios: result.portfolios,
      service: result.service,
      timelineWeeks: result.timelineWeeks,
      price: result.price,
    });
  } catch (err) {
    console.error(err);
    return fail("Could not generate proposal", 500);
  }
}
