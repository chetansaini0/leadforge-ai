import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session) redirect("/dashboard");
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-[var(--border)] p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(560px 380px at 15% 8%, color-mix(in srgb, var(--primary) 22%, transparent), transparent 62%), radial-gradient(420px 280px at 90% 90%, color-mix(in srgb, var(--accent) 12%, transparent), transparent 55%)",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--primary)] text-sm font-bold text-[var(--primary-fg)]">
              LF
            </span>
            LeadForge AI
          </div>
        </div>
        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-[1.15] tracking-[-0.03em]">
            Turn cold businesses into booked calls.
          </h2>
          <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
            Find leads, analyze websites, generate proposals and outreach, and manage the pipeline — a focused sales OS for web developers and agencies.
          </p>
        </div>
        <p className="relative text-xs tracking-wide text-[var(--muted)]">
          Built by Chetan Saini · compliant lead-gen, human-approved outreach.
        </p>
      </div>
      <div className="flex items-center justify-center p-6">{children}</div>
    </div>
  );
}
