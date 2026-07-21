import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { requireAuth, ok, fail } from "@/lib/api";
import { meetingSchema } from "@/lib/validation";
import { Meeting } from "@/models/Meeting";
import { Lead } from "@/models/Lead";
import { googleCalendarUrl, providerLocation } from "@/lib/calendar";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  try {
    await connectDB();
    const meetings = await Meeting.find({ owner: auth.sub }).sort({ startsAt: 1 }).limit(200).lean();
    return ok(meetings);
  } catch (err) {
    console.error(err);
    return fail("Could not load meetings.", 500);
  }
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  const parsed = meetingSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid input", 422, { issues: parsed.error.flatten() });

  try {
    await connectDB();
    const d = parsed.data;
    const startsAt = new Date(d.startAt);
    if (Number.isNaN(startsAt.getTime())) return fail("Invalid date/time.", 422);

    let leadName = "";
    if (d.leadId) {
      const lead = await Lead.findOne({ _id: d.leadId, owner: auth.sub })
        .select("businessName")
        .lean<{ businessName: string } | null>();
      leadName = lead?.businessName ?? "";
    }

    const calendarUrl = googleCalendarUrl({
      title: d.title,
      startsAt,
      durationMins: d.durationMins,
      details: d.notes,
      location: providerLocation(d.provider),
    });

    const meeting = await Meeting.create({
      owner: auth.sub,
      lead: d.leadId || undefined,
      leadName,
      title: d.title,
      startsAt,
      durationMins: d.durationMins,
      provider: d.provider,
      calendarUrl,
      notes: d.notes,
    });

    return ok(meeting, 201);
  } catch (err) {
    console.error(err);
    return fail("Could not schedule meeting.", 500);
  }
}
