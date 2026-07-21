import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Lead, type LeanLead } from "@/models/Lead";
import { Outreach } from "@/models/Outreach";
import { requireAuth, ok, fail, rateLimit } from "@/lib/api";
import { outreachSchema } from "@/lib/validation";
import { generateOutreach } from "@/lib/ai/outreach";
import { appBaseUrl, trackingPixelUrl, emailHtmlWithPixel } from "@/lib/tracking";
import type { BusinessType } from "@/types";

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  if (!rateLimit(`outreach:${auth.sub}`, 40)) return fail("Rate limit reached. Slow down.", 429);

  const parsed = outreachSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid input", 422);

  try {
    await connectDB();
    const lead = await Lead.findOne({ _id: parsed.data.leadId, owner: auth.sub }).lean<LeanLead>();
    if (!lead) return fail("Lead not found", 404);

    const result = await generateOutreach(parsed.data.channel, parsed.data.kind, {
      businessName: lead.businessName,
      contactName: lead.contactName ?? "",
      businessType: (lead.businessType ?? "other") as BusinessType,
      issues: lead.issues ?? [],
      step: parsed.data.step,
      city: lead.city ?? "",
      scores: lead.scores,
      suggestedServices: lead.suggestedServices,
      googleRating: lead.googleRating,
      hasWebsite: Boolean(lead.website),
    });

    const doc = await Outreach.create({
      owner: auth.sub,
      lead: lead._id,
      businessName: lead.businessName,
      channel: parsed.data.channel,
      kind: parsed.data.kind,
      subject: result.subject,
      body: result.body,
      sequenceStep: parsed.data.step,
      generatedBy: result.generatedBy,
    });

    const id = String(doc._id);
    const isEmail = parsed.data.channel === "email";
    const pixelUrl = isEmail ? trackingPixelUrl(appBaseUrl(), id) : "";
    const trackingHtml = isEmail ? emailHtmlWithPixel(result.body, pixelUrl) : "";

    return ok({
      id,
      subject: result.subject,
      body: result.body,
      generatedBy: result.generatedBy,
      trackingHtml,
    });
  } catch (err) {
    console.error(err);
    return fail("Could not generate outreach", 500);
  }
}
