import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models/Lead";
import { requireAuth, ok, fail } from "@/lib/api";
import { leadUpdateSchema } from "@/lib/validation";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { id } = await params;
  try {
    await connectDB();
    const lead = await Lead.findOne({ _id: id, owner: auth.sub }).lean();
    if (!lead) return fail("Lead not found", 404);
    return ok(lead);
  } catch {
    return fail("Could not load lead", 500);
  }
}

export async function PATCH(req: NextRequest, { params }: Ctx) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { id } = await params;

  const parsed = leadUpdateSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid input", 422);

  try {
    await connectDB();
    const update: Record<string, unknown> = { ...parsed.data };
    if (parsed.data.stage === "contacted") update.lastContactedAt = new Date();
    const lead = await Lead.findOneAndUpdate({ _id: id, owner: auth.sub }, update, { new: true }).lean();
    if (!lead) return fail("Lead not found", 404);
    return ok(lead);
  } catch {
    return fail("Could not update lead", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  const { id } = await params;
  try {
    await connectDB();
    const res = await Lead.findOneAndDelete({ _id: id, owner: auth.sub });
    if (!res) return fail("Lead not found", 404);
    return ok({ deleted: true });
  } catch {
    return fail("Could not delete lead", 500);
  }
}
