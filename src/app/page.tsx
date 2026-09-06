import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";

export default async function RootPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(900px 520px at 70% -10%, color-mix(in srgb, var(--primary) 18%, transparent), transparent 55%), radial-gradient(700px 400px at 0% 80%, color-mix(in srgb, var(--accent) 10%, transparent), transparent 50%)",
        }}
      />
      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <div className="flex items-center gap-2.5 text-lg font-semibold tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-[var(--primary)] text-sm font-bold text-[var(--primary-fg)]">
            LF
          </span>
          LeadForge AI
        </div>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/login" className="px-3 py-2 text-[var(--muted)] transition-colors hover:text-[var(--text)]">
            Sign in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-[var(--primary)] px-4 py-2 font-medium text-[var(--primary-fg)] transition-opacity hover:opacity-90"
          >
            Start free
          </Link>
        </nav>
      </header>

      <main className="relative z-10 mx-auto flex min-h-[calc(100vh-5.5rem)] max-w-5xl flex-col justify-center px-6 pb-20 pt-10 sm:px-10">
        <p className="text-[11px] font-medium uppercase tracking-[0.28em] text-[var(--accent)]">
          AI sales OS for agencies
        </p>
        <h1 className="mt-5 max-w-3xl text-[clamp(2.6rem,7vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.035em]">
          LeadForge AI
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-[var(--muted)]">
          Find cold businesses, analyze their sites, ship personalized proposals, and run the pipeline — without the purple SaaS noise.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/register"
            className="rounded-lg bg-[var(--primary)] px-5 py-3 text-sm font-semibold text-[var(--primary-fg)] transition-opacity hover:opacity-90"
          >
            Create workspace
          </Link>
          <Link
            href="/login"
            className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-5 py-3 text-sm font-medium text-[var(--text)] transition-colors hover:bg-[var(--surface-2)]"
          >
            Sign in
          </Link>
        </div>
      </main>
    </div>
  );
}
