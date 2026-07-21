import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Lead, type LeanLead } from "@/models/Lead";
import { requireAuth, ok, fail, rateLimit } from "@/lib/api";
import { assistantSchema } from "@/lib/validation";
import { askAssistant } from "@/lib/ai/assistant";

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;
  if (!rateLimit(`assistant:${auth.sub}`, 30)) return fail("Rate limit reached.", 429);

  const parsed = assistantSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return fail("Invalid input", 422);

  try {
    let context;
    if (parsed.data.leadId) {
      await connectDB();
      const lead = await Lead.findOne({ _id: parsed.data.leadId, owner: auth.sub }).lean<LeanLead>();
      if (lead) {
        context = {
          businessName: lead.businessName,
          businessType: lead.businessType,
          issues: lead.issues,
          priority: lead.priority,
          estimatedValue: lead.estimatedValue,
        };
      }
    }
    const result = await askAssistant(parsed.data.message, context);
    return ok(result);
  } catch (err) {
    console.error(err);
    return fail("Assistant error", 500);
  }
}
