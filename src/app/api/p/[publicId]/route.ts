import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Proposal } from "@/models/Proposal";
import { ok, fail } from "@/lib/api";

/**
 * Public, unauthenticated proposal fetch by shareable publicId.
 * Records a view (first-viewed timestamp + view count) so the owner can see
 * engagement, and promotes status to "viewed" unless already accepted/rejected.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ publicId: string }> }) {
  const { publicId } = await params;

  try {
    await connectDB();
    const doc = await Proposal.findOne({ publicId }).lean<{
      _id: unknown;
      businessName: string;
      content: string;
      service: string;
      price: number;
      currency: string;
      timelineWeeks: number;
      status: string;
      viewedAt: Date | null;
      createdAt: Date;
    } | null>();

    if (!doc) return fail("Proposal not found.", 404);

    const set: Record<string, unknown> = {};
    if (!doc.viewedAt) set.viewedAt = new Date();
    if (doc.status !== "accepted" && doc.status !== "rejected") set.status = "viewed";
    await Proposal.updateOne(
      { publicId },
      { $inc: { viewCount: 1 }, ...(Object.keys(set).length ? { $set: set } : {}) },
    );

    return ok({
      businessName: doc.businessName,
      content: doc.content,
      service: doc.service,
      price: doc.price,
      currency: doc.currency,
      timelineWeeks: doc.timelineWeeks,
      createdAt: doc.createdAt,
    });
  } catch (err) {
    console.error(err);
    return fail("Could not load proposal.", 500);
  }
}
