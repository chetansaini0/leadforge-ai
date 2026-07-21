import { getSession } from "@/lib/auth";
import { ok, fail } from "@/lib/api";

export async function GET() {
  const session = await getSession();
  if (!session) return fail("Unauthorized", 401);
  return ok({ id: session.sub, name: session.name, email: session.email, role: session.role });
}
