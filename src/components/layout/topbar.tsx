"use client";

import { useRouter } from "next/navigation";
import { Moon, Sun, LogOut, Sparkles } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/providers";
import { api } from "@/lib/fetcher";
import { initials } from "@/lib/utils";

export function Topbar({ name }: { name: string }) {
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const [seeding, setSeeding] = useState(false);

  async function seed() {
    setSeeding(true);
    try {
      await api("/api/seed", { method: "POST" });
      router.refresh();
      window.location.reload();
    } catch {
      setSeeding(false);
    }
  }

  async function logout() {
    await api("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--border)] bg-[var(--bg)]/80 px-4 backdrop-blur sm:px-6">
      <div className="lg:hidden text-lg font-semibold">LeadForge</div>
      <div className="hidden text-sm text-[var(--muted)] lg:block">
        Welcome back, <span className="text-[var(--text)]">{name}</span>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={seed} disabled={seeding}>
          <Sparkles className="h-3.5 w-3.5" />
          {seeding ? "Seeding…" : "Load demo data"}
        </Button>
        <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle theme">
          {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <div className="grid h-9 w-9 place-items-center rounded-full bg-[var(--surface-2)] text-xs font-semibold">
          {initials(name)}
        </div>
        <Button variant="ghost" size="icon" onClick={logout} aria-label="Log out">
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
