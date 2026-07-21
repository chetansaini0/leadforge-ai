import { connectDB } from "@/lib/db";
import { Outreach } from "@/models/Outreach";
import { requireAuth, ok, fail } from "@/lib/api";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  try {
    await connectDB();
    const items = await Outreach.find({ owner: auth.sub })
      .sort({ createdAt: -1 })
      .limit(200)
      .select("businessName channel kind subject body status sentAt openedAt openCount repliedAt generatedBy createdAt")
      .lean();
    return ok(items);
  } catch (err) {
    console.error(err);
    return fail("Could not load outreach history.", 500);
  }
}
