import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen antialiased tracking-tight">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar name={session.name} />
        <main className="flex-1 p-4 text-[15px] leading-relaxed sm:p-6">{children}</main>
      </div>
    </div>
  );
}
