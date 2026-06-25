"use client";
import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import TopNav from "@/components/ui/TopNav";
import Sidebar from "@/components/ui/Sidebar";
import { useLang } from "@/lib/LanguageContext";
import { t } from "@/lib/i18n";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const { lang } = useLang();
  if (status === "unauthenticated") redirect("/login");
  if (status === "loading") return <div className="min-h-screen bg-bg-primary flex items-center justify-center"><div className="text-text-muted">Loading...</div></div>;

  const user = session?.user as any;
  const items = [{ label: t(lang, "dashboard"), href: "/admin/dashboard", icon: "▦" }];

  return (
    <div className="min-h-screen bg-bg-primary">
      <TopNav role={t(lang, "admin")} userName={user?.name} schoolName={user?.schoolName} links={items.map(i => ({label:i.label,href:i.href}))} />
      <div className="flex pt-14">
        <Sidebar items={items} role={t(lang, "admin")} userName={user?.name} />
        <main className="flex-1 p-6 max-w-[1800px]">{children}</main>
      </div>
    </div>
  );
}
