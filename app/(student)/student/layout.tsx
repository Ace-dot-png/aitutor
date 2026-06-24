"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import TopNav from "@/components/ui/TopNav";
import Sidebar from "@/components/ui/Sidebar";

const SIDEBAR_ITEMS = [
  { label: "Dashboard", href: "/student/dashboard", icon: "▦" },
  { label: "Tutor", href: "/student/tutor", icon: "▸" },
  { label: "Progress", href: "/student/progress", icon: "▤" },
  { label: "Notes", href: "/student/notes", icon: "☰" },
  { label: "Timetable", href: "/student/timetable", icon: "▥" },
  { label: "Settings", href: "/student/settings", icon: "⚙" },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  if (status === "unauthenticated") redirect("/login");
  if (status === "loading") return <div className="min-h-screen bg-bg-primary flex items-center justify-center"><div className="text-text-muted">Loading...</div></div>;

  const user = session?.user as any;
  const navLinks = SIDEBAR_ITEMS.map((item) => ({
    label: item.label,
    href: item.href,
  }));

  return (
    <div className="min-h-screen bg-bg-primary">
      <TopNav role="Student" userName={user?.name} schoolName={user?.schoolName} links={navLinks} />
      <div className="flex pt-14">
        <Sidebar items={SIDEBAR_ITEMS} role="Student" userName={user?.name} />
        <main className="flex-1 p-6 max-w-[1400px]">{children}</main>
      </div>
    </div>
  );
}
