import { Outreach } from "@/models/Outreach";
import { Lead } from "@/models/Lead";
import type { Types } from "mongoose";

export type FollowupItem = {
  kind: "followup" | "first_touch";
  leadId: string;
  outreachId?: string;
  businessName: string;
  channel: string;
  priority: string;
  reason: string;
  ageDays: number;
  recommendedStep: number;
};

/** Days to wait after each sequence step before a follow-up is "due". */
const STEP_WAIT_DAYS = [2, 3, 5, 5, 7];
const DAY = 864e5;

/**
 * Compute due follow-ups for one owner (or everyone when omitted).
 * - "followup": a sent/opened message with no reply that has gone cold.
 * - "first_touch": a hot/high-priority lead that has never been contacted.
 */
export async function computeFollowups(owner?: string): Promise<FollowupItem[]> {
  const ownerFilter = owner ? { owner } : {};
  const now = Date.now();

  const [outreach, leads] = await Promise.all([
    Outreach.find({ ...ownerFilter, status: { $in: ["sent", "opened"] }, repliedAt: null })
      .select("lead businessName channel sequenceStep sentAt createdAt")
      .sort({ createdAt: -1 })
      .lean<
        {
          _id: Types.ObjectId;
          lead: Types.ObjectId;
          businessName: string;
          channel: string;
          sequenceStep: number;
          sentAt: Date | null;
          createdAt: Date;
        }[]
      >(),
    Lead.find({ ...ownerFilter })
      .select("businessName priority stage")
      .lean<{ _id: Types.ObjectId; businessName: string; priority: string; stage: string }[]>(),
  ]);

  const items: FollowupItem[] = [];
  const leadsWithOutreach = new Set(outreach.map((o) => String(o.lead)));

  // Only surface the most recent pending outreach per lead.
  const seenLead = new Set<string>();
  for (const o of outreach) {
    const leadKey = String(o.lead);
    if (seenLead.has(leadKey)) continue;
    seenLead.add(leadKey);

    const base = (o.sentAt ?? o.createdAt) as Date;
    const ageDays = Math.floor((now - new Date(base).getTime()) / DAY);
    const step = Math.min(o.sequenceStep ?? 0, STEP_WAIT_DAYS.length - 1);
    if (ageDays >= STEP_WAIT_DAYS[step]) {
      items.push({
        kind: "followup",
        leadId: leadKey,
        outreachId: String(o._id),
        businessName: o.businessName || "Lead",
        channel: o.channel,
        priority: "",
        reason: `No reply for ${ageDays} day${ageDays === 1 ? "" : "s"} after your ${o.channel} message.`,
        ageDays,
        recommendedStep: Math.min((o.sequenceStep ?? 0) + 1, 4),
      });
    }
  }

  for (const l of leads) {
    const key = String(l._id);
    if (leadsWithOutreach.has(key)) continue;
    if ((l.priority === "hot" || l.priority === "high") && l.stage === "new") {
      items.push({
        kind: "first_touch",
        leadId: key,
        businessName: l.businessName,
        channel: "email",
        priority: l.priority,
        reason: `${l.priority === "hot" ? "🔥 Hot" : "High-priority"} lead not contacted yet.`,
        ageDays: 0,
        recommendedStep: 0,
      });
    }
  }

  // Hot first-touches first, then oldest follow-ups.
  return items.sort((a, b) => {
    if (a.kind !== b.kind) return a.kind === "first_touch" ? -1 : 1;
    return b.ageDays - a.ageDays;
  });
}
