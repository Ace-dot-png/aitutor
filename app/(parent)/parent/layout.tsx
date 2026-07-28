"use client";
import { useSession } from "next-auth/react";
import { redirect, usePathname } from "next/navigation";
import TopNav from "@/components/ui/TopNav";
import Sidebar from "@/components/ui/Sidebar";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const { lang } = useLang();

  if (status === "loading") return <div className="min-h-screen bg-bg-primary flex items-center justify-center"><div className="text-text-muted">Loading...</div></div>;
  if (status === "unauthenticated") { redirect("/login"); return null; }

  const user = session?.user as any;
  const storedLinkedId = typeof window !== "undefined" ? localStorage.getItem("linkedStudentId") : null;
  const linkedId = user?.linkedStudentId || storedLinkedId;
  const isLinkPage = pathname === "/parent/link";

  if (!linkedId && !isLinkPage) { redirect("/parent/link"); return null; }

  // Link page renders standalone — no sidebar/header
  if (isLinkPage && !user?.linkedStudentId) {
    return <>{children}</>;
  }

  const items = [{ label: t(lang, "dashboard"), href: "/parent/dashboard", icon: "▦" }];
  return (
    <div className="min-h-screen bg-bg-primary">
      <TopNav role={t(lang, "parent")} userName={user?.name} links={items.map(i => ({label:i.label,href:i.href}))} />
      <div className="flex pt-14">
        <Sidebar items={items} role={t(lang, "parent")} userName={user?.name} />
        <main className="flex-1 p-6 max-w-[1200px]">{children}</main>
      </div>
    </div>
  );
}
