"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import TopNav from "@/components/ui/TopNav";
import Sidebar from "@/components/ui/Sidebar";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "▦" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  if (status === "unauthenticated") redirect("/login");
  if (status === "loading") return <div className="min-h-screen bg-bg-primary flex items-center justify-center"><div className="text-text-muted">Loading...</div></div>;

  const user = session?.user as any;

  return (
    <div className="min-h-screen bg-bg-primary">
      <TopNav role="Admin" userName={user?.name} schoolName={user?.schoolName} links={[{ label: "Dashboard", href: "/admin/dashboard" }]} />
      <div className="flex pt-14">
        <Sidebar items={SIDEBAR_ITEMS} role="Admin" userName={user?.name} />
        <main className="flex-1 p-6 max-w-[1800px]">{children}</main>
      </div>
    </div>
  );
}
