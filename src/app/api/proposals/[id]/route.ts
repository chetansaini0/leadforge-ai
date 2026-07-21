import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Proposal } from "@/models/Proposal";
import { requireAuth, ok, fail } from "@/lib/api";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as { status?: string } | null;
  const status = body?.status;
  const allowed = ["draft", "sent", "viewed", "accepted", "rejected"];
  if (!status || !allowed.includes(status)) return fail("Invalid status.", 422);

  const set: Record<string, unknown> = { status };
  if (status === "sent") set.sentAt = new Date();

  try {
    await connectDB();
    const doc = await Proposal.findOneAndUpdate(
      { _id: id, owner: auth.sub },
      { $set: set },
      { new: true },
    ).lean();
    if (!doc) return fail("Proposal not found.", 404);
    return ok(doc);
  } catch (err) {
    console.error(err);
    return fail("Could not update proposal.", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  const { id } = await params;
  try {
    await connectDB();
    const res = await Proposal.findOneAndDelete({ _id: id, owner: auth.sub });
    if (!res) return fail("Proposal not found.", 404);
    return ok({ deleted: true });
  } catch (err) {
    console.error(err);
    return fail("Could not delete proposal.", 500);
  }
}
