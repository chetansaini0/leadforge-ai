import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth, ok, fail } from "@/lib/api";
import { leadFinderImportSchema } from "@/lib/validation";
import { createLead } from "@/lib/leads";
import { Lead } from "@/models/Lead";
import type { BusinessType } from "@/types";

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  const parsed = leadFinderImportSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid input", 422, { issues: parsed.error.flatten() });

  try {
    await connectDB();

    // Skip businesses already imported by this user (match on name + city).
    const existing = await Lead.find({ owner: auth.sub })
      .select("businessName city")
      .lean<{ businessName: string; city?: string }[]>();
    const seen = new Set(existing.map((l) => `${l.businessName}|${l.city ?? ""}`.toLowerCase()));

    let imported = 0;
    let skipped = 0;

    for (const c of parsed.data.candidates) {
      const key = `${c.businessName}|${c.city ?? ""}`.toLowerCase();
      if (seen.has(key)) {
        skipped += 1;
        continue;
      }
      await createLead(auth.sub, {
        businessName: c.businessName,
        businessType: c.businessType as BusinessType,
        contactName: c.contactName,
        email: c.email,
        phone: c.phone,
        website: c.website,
        city: c.city,
        googleRating: c.googleRating,
        reviewsCount: c.reviewsCount,
        placeId: c.placeId,
        source: c.placeId ? "places" : "import",
      });
      seen.add(key);
      imported += 1;
    }

    return ok({ imported, skipped }, 201);
  } catch (err) {
    console.error(err);
    return fail("Import failed.", 500);
  }
}
