import { NextRequest } from "next/server";
import { requireAuth, ok, fail, rateLimit } from "@/lib/api";
import { leadFinderSearchSchema } from "@/lib/validation";
import { searchLeads, placesEnabled } from "@/lib/ai/leadFinder";
import type { BusinessType } from "@/types";

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  if (!rateLimit(`finder:${auth.sub}`, 20, 60_000)) {
    return fail("Too many searches. Please wait a moment.", 429);
  }

  const parsed = leadFinderSearchSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid input", 422, { issues: parsed.error.flatten() });

  try {
    const { businessType, city, keyword } = parsed.data;
    const result = await searchLeads(businessType as BusinessType, city, keyword);
    return ok({ ...result, placesEnabled: placesEnabled() });
  } catch (err) {
    console.error(err);
    return fail("Search failed.", 500);
  }
}
