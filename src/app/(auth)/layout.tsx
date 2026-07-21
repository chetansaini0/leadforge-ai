import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function AuthLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (session) redirect("/dashboard");
  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden flex-col justify-between overflow-hidden p-12 lg:flex">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(600px 400px at 20% 10%, color-mix(in srgb, var(--primary) 30%, transparent), transparent 60%)",
          }}
        />
        <div className="relative">
          <div className="flex items-center gap-2 text-lg font-semibold">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-[var(--primary)] text-[var(--primary-fg)]">
              LF
            </span>
            LeadForge AI
          </div>
        </div>
        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight">
            Turn cold businesses into booked calls.
          </h2>
          <p className="mt-4 text-[var(--muted)]">
            Find leads, auto-analyze their websites, generate personalized proposals and
            outreach, and manage your whole pipeline — the AI sales OS for web developers
            and agencies.
          </p>
        </div>
        <p className="relative text-xs text-[var(--muted)]">
          Built by Chetan Saini · compliant lead-gen, human-approved outreach.
        </p>
      </div>
      <div className="flex items-center justify-center p-6">{children}</div>
    </div>
  );
}
