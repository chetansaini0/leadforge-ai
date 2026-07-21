import { connectDB } from "@/lib/db";
import { Proposal } from "@/models/Proposal";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

async function loadAndTrack(publicId: string) {
  await connectDB();
  const doc = await Proposal.findOne({ publicId }).lean<{
    businessName: string;
    content: string;
    service: string;
    price: number;
    timelineWeeks: number;
    status: string;
    viewedAt: Date | null;
    createdAt: Date;
  } | null>();
  if (!doc) return null;

  const set: Record<string, unknown> = {};
  if (!doc.viewedAt) set.viewedAt = new Date();
  if (doc.status !== "accepted" && doc.status !== "rejected") set.status = "viewed";
  await Proposal.updateOne(
    { publicId },
    { $inc: { viewCount: 1 }, ...(Object.keys(set).length ? { $set: set } : {}) },
  );
  return doc;
}

export default async function PublicProposalPage({
  params,
}: {
  params: Promise<{ publicId: string }>;
}) {
  const { publicId } = await params;
  const doc = await loadAndTrack(publicId).catch(() => null);

  if (!doc) {
    return (
      <main className="grid min-h-screen place-items-center bg-[var(--bg)] p-6 text-center">
        <div>
          <h1 className="text-xl font-semibold">Proposal not found</h1>
          <p className="mt-1 text-sm text-[var(--muted)]">This link may have expired or is incorrect.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--bg)] px-4 py-10">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex items-center gap-2 text-sm font-semibold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--primary)] text-[var(--primary-fg)]">
            LF
          </span>
          Proposal for {doc.businessName}
        </div>

        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
          {(doc.price > 0 || doc.timelineWeeks > 0) && (
            <div className="mb-6 flex flex-wrap gap-3">
              {doc.price > 0 && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                  <p className="text-lg font-semibold">{formatCurrency(doc.price)}</p>
                  <p className="text-xs text-[var(--muted)]">Investment</p>
                </div>
              )}
              {doc.timelineWeeks > 0 && (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-2)] px-4 py-3">
                  <p className="text-lg font-semibold">{doc.timelineWeeks} weeks</p>
                  <p className="text-xs text-[var(--muted)]">Timeline</p>
                </div>
              )}
            </div>
          )}

          <pre className="whitespace-pre-wrap font-sans text-[15px] leading-relaxed text-[var(--text)]">
            {doc.content}
          </pre>
        </div>

        <p className="mt-6 text-center text-xs text-[var(--muted)]">
          Prepared by Chetan Saini · AI Web &amp; SaaS Developer
        </p>
      </div>
    </main>
  );
}
