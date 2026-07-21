import { connectDB } from "@/lib/db";
import { Proposal } from "@/models/Proposal";
import { requireAuth, ok, fail } from "@/lib/api";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  try {
    await connectDB();
    const items = await Proposal.find({ owner: auth.sub })
      .sort({ createdAt: -1 })
      .limit(200)
      .select("businessName variant service price timelineWeeks status publicId sentAt viewedAt viewCount generatedBy createdAt")
      .lean();
    return ok(items);
  } catch (err) {
    console.error(err);
    return fail("Could not load proposals.", 500);
  }
}
