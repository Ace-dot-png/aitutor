"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItem { label: string; href: string; icon?: string; }

interface SidebarProps { items: SidebarItem[]; role: string; userName?: string; }

export default function Sidebar({ items, role, userName }: SidebarProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-border">
        <div className="text-xs text-text-muted uppercase tracking-wider mb-1">{role}</div>
        {userName && <div className="text-sm text-text-secondary truncate">{userName}</div>}
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2 rounded-card text-sm transition-colors ${
                active ? "bg-accent-blue text-text-primary" : "text-text-secondary hover:text-text-primary hover:bg-card"}`}>
              {item.icon && <span className="text-base w-5 text-center">{item.icon}</span>}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </>
  );

  return (
    <>
      <button onClick={() => setOpen(!open)} className="lg:hidden fixed top-[3.5rem] left-4 z-50 p-2 card text-text-secondary hover:text-text-primary">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor"><rect y="3" width="20" height="2" rx="1"/><rect y="9" width="20" height="2" rx="1"/><rect y="15" width="20" height="2" rx="1"/></svg>
      </button>
      {open && <div className="lg:hidden fixed inset-0 z-40 bg-black/60" onClick={() => setOpen(false)} />}
      <aside className={`lg:hidden fixed top-0 left-0 z-40 w-56 h-full bg-bg-primary border-r border-border pt-14 flex flex-col transition-transform ${open ? "translate-x-0" : "-translate-x-full"}`}>
        {sidebarContent}
      </aside>
      <aside className="hidden lg:flex w-56 shrink-0 border-r border-border min-h-screen pt-14 flex-col">
        {sidebarContent}
      </aside>
    </>
  );
}
