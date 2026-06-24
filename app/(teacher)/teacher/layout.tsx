"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import TopNav from "@/components/ui/TopNav";
import Sidebar from "@/components/ui/Sidebar";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", href: "/teacher/dashboard", icon: "▦" },
  { label: "Lesson Planner", href: "/teacher/chat", icon: "▸" },
  { label: "My Lessons", href: "/teacher/lessons", icon: "☰" },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  if (status === "unauthenticated") redirect("/login");
  if (status === "loading") return <div className="min-h-screen bg-bg-primary flex items-center justify-center"><div className="text-text-muted">Loading...</div></div>;

  const user = session?.user as any;
  const navLinks = SIDEBAR_ITEMS.map((item) => ({ label: item.label, href: item.href }));

  return (
    <div className="min-h-screen bg-bg-primary">
      <TopNav role="Teacher" userName={user?.name} schoolName={user?.schoolName} links={navLinks} />
      <div className="flex pt-14">
        <Sidebar items={SIDEBAR_ITEMS} role="Teacher" userName={user?.name} />
        <main className="flex-1 p-6 max-w-[1600px]">{children}</main>
      </div>
    </div>
  );
}
