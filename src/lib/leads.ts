import { Business } from "@/models/Business";
import { Lead } from "@/models/Lead";
import { analyzeWebsite, detectOpportunity } from "@/lib/ai/analysis";
import type { BusinessType } from "@/types";

export type LeadInput = {
  businessName: string;
  businessType: BusinessType;
  contactName?: string;
  email?: string;
  phone?: string;
  website?: string;
  city?: string;
  googleRating?: number;
  reviewsCount?: number;
  notes?: string;
  source?: "manual" | "places" | "import";
  placeId?: string;
};

/**
 * Single source of truth for turning a raw business into an analyzed,
 * prioritized Lead (used by manual add, Lead Finder import, and seeding).
 */
export async function createLead(owner: string, input: LeadInput) {
  const type = input.businessType;
  const rating = input.googleRating ?? 0;
  const reviews = input.reviewsCount ?? 0;

  const business = await Business.create({
    owner,
    name: input.businessName,
    ownerName: input.contactName ?? "",
    type,
    website: input.website ?? "",
    email: input.email ?? "",
    phone: input.phone ?? "",
    googleRating: rating,
    reviewsCount: reviews,
    location: { city: input.city ?? "", country: "India", placeId: input.placeId ?? "" },
    source: input.source ?? "manual",
  });

  const { scores, issues } = analyzeWebsite({ website: input.website ?? "", googleRating: rating, reviewsCount: reviews });
  const opp = detectOpportunity({ businessType: type, scores, issues, googleRating: rating, reviewsCount: reviews });

  return Lead.create({
    owner,
    business: business._id,
    businessName: input.businessName,
    businessType: type,
    contactName: input.contactName ?? "",
    email: input.email ?? "",
    phone: input.phone ?? "",
    website: input.website ?? "",
    city: input.city ?? "",
    googleRating: rating,
    reviewsCount: reviews,
    stage: "new",
    priority: opp.priority,
    scores,
    issues,
    suggestedServices: opp.suggestedServices,
    estimatedValue: opp.estimatedValue,
    closingProbability: opp.closingProbability,
    aiReasoning: opp.reasoning,
    notes: input.notes ?? "",
  });
}
