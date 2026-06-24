"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import TopNav from "@/components/ui/TopNav";
import Sidebar from "@/components/ui/Sidebar";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", href: "/parent/dashboard", icon: "▦" },
];

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  if (status === "unauthenticated") redirect("/login");
  if (status === "loading") return <div className="min-h-screen bg-bg-primary flex items-center justify-center"><div className="text-text-muted">Loading...</div></div>;

  const user = session?.user as any;

  // Redirect to link if not linked
  if (!user?.linkedStudentId && window.location.pathname !== "/parent/link") {
    redirect("/parent/link");
  }

  return (
    <div className="min-h-screen bg-bg-primary">
      <TopNav role="Parent" userName={user?.name} links={[{ label: "Dashboard", href: "/parent/dashboard" }]} />
      <div className="flex pt-14">
        <Sidebar items={SIDEBAR_ITEMS} role="Parent" userName={user?.name} />
        <main className="flex-1 p-6 max-w-[1200px]">{children}</main>
      </div>
    </div>
  );
}
