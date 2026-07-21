import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models/Lead";
import { requireAuth, ok, fail } from "@/lib/api";
import { leadCreateSchema } from "@/lib/validation";
import { createLead } from "@/lib/leads";
import type { BusinessType } from "@/types";

export async function GET(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim();
    const stage = searchParams.get("stage");
    const priority = searchParams.get("priority");
    const type = searchParams.get("type");

    const filter: Record<string, unknown> = { owner: auth.sub };
    if (stage) filter.stage = stage;
    if (priority) filter.priority = priority;
    if (type) filter.businessType = type;
    if (q) {
      filter.$or = [
        { businessName: { $regex: q, $options: "i" } },
        { city: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } },
      ];
    }

    const leads = await Lead.find(filter).sort({ createdAt: -1 }).limit(500).lean();
    return ok(leads);
  } catch (err) {
    console.error(err);
    return fail("Could not load leads. Is the database configured?", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  const parsed = leadCreateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid input", 422, { issues: parsed.error.flatten() });

  try {
    await connectDB();
    const d = parsed.data;
    const lead = await createLead(auth.sub, {
      businessName: d.businessName,
      businessType: d.businessType as BusinessType,
      contactName: d.contactName,
      email: d.email,
      phone: d.phone,
      website: d.website,
      city: d.city,
      googleRating: d.googleRating,
      reviewsCount: d.reviewsCount,
      notes: d.notes,
      source: "manual",
    });
    return ok(lead, 201);
  } catch (err) {
    console.error(err);
    return fail("Could not create lead.", 500);
  }
}
