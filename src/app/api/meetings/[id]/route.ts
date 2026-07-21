import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth, ok, fail } from "@/lib/api";
import { Meeting } from "@/models/Meeting";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  const { id } = await params;
  const body = (await req.json().catch(() => null)) as { status?: string; notes?: string } | null;
  if (!body) return fail("Invalid input", 422);

  const allowed = ["scheduled", "completed", "cancelled", "no_show"];
  const update: Record<string, unknown> = {};
  if (body.status && allowed.includes(body.status)) update.status = body.status;
  if (typeof body.notes === "string") update.notes = body.notes;

  try {
    await connectDB();
    const meeting = await Meeting.findOneAndUpdate(
      { _id: id, owner: auth.sub },
      { $set: update },
      { new: true },
    ).lean();
    if (!meeting) return fail("Meeting not found.", 404);
    return ok(meeting);
  } catch (err) {
    console.error(err);
    return fail("Could not update meeting.", 500);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  const { id } = await params;
  try {
    await connectDB();
    const res = await Meeting.findOneAndDelete({ _id: id, owner: auth.sub });
    if (!res) return fail("Meeting not found.", 404);
    return ok({ deleted: true });
  } catch (err) {
    console.error(err);
    return fail("Could not delete meeting.", 500);
  }
}
