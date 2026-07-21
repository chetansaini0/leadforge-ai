import { connectDB } from "@/lib/db";
import { Lead } from "@/models/Lead";
import { Outreach } from "@/models/Outreach";
import { Proposal } from "@/models/Proposal";
import { Meeting } from "@/models/Meeting";
import { requireAuth, ok, fail } from "@/lib/api";
import { PIPELINE_STAGES } from "@/types";

export async function GET() {
  const auth = await requireAuth();
  if (auth instanceof Response) return auth;

  try {
    await connectDB();
    const owner = auth.sub;

    const [leads, emailsSent, replies, proposals, meetings] = await Promise.all([
      Lead.find({ owner }).select("stage priority estimatedValue createdAt businessType").lean(),
      Outreach.countDocuments({ owner, channel: "email", status: { $in: ["sent", "opened", "replied"] } }),
      Outreach.countDocuments({ owner, status: "replied" }),
      Proposal.countDocuments({ owner }),
      Meeting.countDocuments({ owner }),
    ]);

    const byStage = Object.fromEntries(PIPELINE_STAGES.map((s) => [s, 0]));
    const byType: Record<string, number> = {};
    let revenue = 0;
    for (const l of leads) {
      byStage[l.stage as string] = (byStage[l.stage as string] ?? 0) + 1;
      byType[l.businessType as string] = (byType[l.businessType as string] ?? 0) + 1;
      if (l.stage === "won") revenue += l.estimatedValue ?? 0;
    }

    const totalLeads = leads.length;
    const won = byStage.won ?? 0;
    const conversionRate = totalLeads ? Math.round((won / totalLeads) * 100) : 0;

    // Last 8 weeks of lead adds for the trend chart.
    const weeks: { label: string; leads: number }[] = [];
    const now = Date.now();
    for (let i = 7; i >= 0; i--) {
      const start = now - i * 7 * 864e5;
      const end = start + 7 * 864e5;
      const count = leads.filter((l) => {
        const t = new Date(l.createdAt as unknown as string).getTime();
        return t >= start && t < end;
      }).length;
      weeks.push({ label: `W${8 - i}`, leads: count });
    }

    return ok({
      totals: {
        leads: totalLeads,
        emailsSent,
        replies,
        proposals,
        meetings,
        conversionRate,
        revenue,
      },
      byStage,
      byType,
      trend: weeks,
    });
  } catch (err) {
    console.error(err);
    return fail("Could not load analytics", 500);
  }
}
