import { connectDB } from "@/lib/db";
import { requireAuth, ok, fail } from "@/lib/api";
import { computeFollowups } from "@/lib/followups";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  try {
    await connectDB();
    const items = await computeFollowups(auth.sub);
    return ok(items);
  } catch (err) {
    console.error(err);
    return fail("Could not compute follow-ups.", 500);
  }
}
