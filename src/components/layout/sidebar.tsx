"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Radar,
  Users,
  KanbanSquare,
  FileText,
  Send,
  CalendarClock,
  BarChart3,
  Bot,
  Briefcase,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/lead-finder", label: "Lead Finder", icon: Radar },
  { href: "/leads", label: "Leads", icon: Users },
  { href: "/crm", label: "CRM Pipeline", icon: KanbanSquare },
  { href: "/proposals", label: "Proposals", icon: FileText },
  { href: "/outreach", label: "Outreach", icon: Send },
  { href: "/meetings", label: "Meetings", icon: CalendarClock },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/assistant", label: "AI Assistant", icon: Bot },
  { href: "/portfolio", label: "Portfolio", icon: Briefcase },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-[var(--border)] bg-[var(--surface)] p-4 lg:flex">
      <Link href="/dashboard" className="mb-8 flex items-center gap-2 px-2 text-lg font-semibold">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-[var(--primary)] text-sm text-[var(--primary-fg)]">
          LF
        </span>
        LeadForge
      </Link>
      <nav className="flex flex-1 flex-col gap-1">
        {NAV.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active
                  ? "bg-[var(--primary)] text-[var(--primary-fg)]"
                  : "text-[var(--muted)] hover:bg-[var(--surface-2)] hover:text-[var(--text)]",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
      <p className="px-2 text-[10px] text-[var(--muted)]">v0.1 · Compliant lead-gen</p>
    </aside>
  );
}
