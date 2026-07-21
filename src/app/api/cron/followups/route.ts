import { NextRequest } from "next/server";
import { connectDB } from "@/lib/db";
import { ok, fail } from "@/lib/api";
import { computeFollowups, type FollowupItem } from "@/lib/followups";

/**
 * Scheduled follow-up digest. Designed to be triggered by Vercel Cron, n8n,
 * or any scheduler. Secured with a shared secret. Returns JSON (for n8n to
 * route) and optionally pushes a Telegram summary.
 *
 *   GET /api/cron/followups?secret=XXX
 *   GET /api/cron/followups   (header: x-cron-secret: XXX)
 */
export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return fail("CRON_SECRET is not configured on the server.", 501);

  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const provided =
    bearer || req.headers.get("x-cron-secret") || new URL(req.url).searchParams.get("secret");
  if (provided !== secret) return fail("Unauthorized", 401);

  try {
    await connectDB();
    const items = await computeFollowups();
    let telegram: "sent" | "skipped" | "error" = "skipped";

    if (items.length > 0) {
      telegram = await sendTelegram(items);
    }

    return ok({ count: items.length, telegram, items });
  } catch (err) {
    console.error(err);
    return fail("Follow-up digest failed.", 500);
  }
}

async function sendTelegram(items: FollowupItem[]): Promise<"sent" | "skipped" | "error"> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return "skipped";

  const hot = items.filter((i) => i.kind === "first_touch");
  const quiet = items.filter((i) => i.kind === "followup");
  const lines = [
    `📋 *LeadForge — ${items.length} follow-up${items.length === 1 ? "" : "s"} due*`,
    "",
    ...(hot.length ? [`🔥 *Reach out now (${hot.length})*`, ...hot.slice(0, 10).map((i) => `• ${i.businessName}`)] : []),
    ...(hot.length && quiet.length ? [""] : []),
    ...(quiet.length
      ? [`⏰ *Gone quiet (${quiet.length})*`, ...quiet.slice(0, 10).map((i) => `• ${i.businessName} — ${i.ageDays}d`)]
      : []),
  ];

  try {
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: lines.join("\n"), parse_mode: "Markdown" }),
    });
    return res.ok ? "sent" : "error";
  } catch (err) {
    console.error("[telegram] send failed", err);
    return "error";
  }
}
