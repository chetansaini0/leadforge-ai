import { NextRequest } from "next/server";
import { requireAuth, ok, fail } from "@/lib/api";
import { analyzeWebsite, detectOpportunity } from "@/lib/ai/analysis";
import type { BusinessType } from "@/types";

/**
 * On-demand website analysis for a URL (without creating a lead). Uses the
 * deterministic analyzer; swap for PageSpeed Insights when a key is available.
 */
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  const body = await req.json().catch(() => null);
  const website = String(body?.website ?? "").trim();
  const businessType = (body?.businessType ?? "other") as BusinessType;
  const googleRating = Number(body?.googleRating ?? 0);
  const reviewsCount = Number(body?.reviewsCount ?? 0);

  if (!website) return fail("website is required", 422);

  const { scores, issues } = analyzeWebsite({ website, googleRating, reviewsCount });
  const opportunity = detectOpportunity({ businessType, scores, issues, googleRating, reviewsCount });
  return ok({ scores, issues, opportunity });
}
