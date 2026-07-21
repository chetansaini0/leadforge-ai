import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { Outreach } from "@/models/Outreach";

// 1x1 transparent GIF.
const PIXEL = Buffer.from(
  "R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
  "base64",
);

function pixelResponse() {
  return new Response(new Uint8Array(PIXEL), {
    status: 200,
    headers: {
      "Content-Type": "image/gif",
      "Content-Length": String(PIXEL.length),
      "Cache-Control": "no-store, no-cache, must-revalidate, private",
      Pragma: "no-cache",
      Expires: "0",
    },
  });
}

/**
 * Public email open-tracking pixel. The id may include a ".gif" suffix so it
 * looks like an image to email clients. Records the first open + open count,
 * then always returns the pixel (never leaks whether the id exists).
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const cleanId = id.replace(/\.gif$/i, "");

  try {
    await connectDB();
    if (/^[a-f0-9]{24}$/i.test(cleanId)) {
      const now = new Date();
      const doc = await Outreach.findById(cleanId).select("openedAt status").lean<{
        openedAt: Date | null;
        status: string;
      } | null>();
      if (doc) {
        const update: Record<string, unknown> = { $inc: { openCount: 1 } };
        const set: Record<string, unknown> = {};
        if (!doc.openedAt) set.openedAt = now;
        // Don't downgrade a "replied" message back to "opened".
        if (doc.status !== "replied") set.status = "opened";
        if (Object.keys(set).length) update.$set = set;
        await Outreach.updateOne({ _id: cleanId }, update);
      }
    }
  } catch (err) {
    console.error("[track] error", err);
  }

  return pixelResponse();
}
