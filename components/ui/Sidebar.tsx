"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface SidebarItem {
  label: string;
  href: string;
  icon?: string;
}

interface SidebarProps {
  items: SidebarItem[];
  role: string;
  userName?: string;
}

export default function Sidebar({ items, role, userName }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="w-56 shrink-0 border-r border-border min-h-screen pt-14 flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="text-xs text-text-muted uppercase tracking-wider mb-1">{role}</div>
        {userName && <div className="text-sm text-text-secondary truncate">{userName}</div>}
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {items.map((item) => {
          const active = pathname === item.href || pathname?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-card text-sm transition-colors ${
                active
                  ? "bg-accent-blue text-text-primary"
                  : "text-text-secondary hover:text-text-primary hover:bg-card"
              }`}
            >
              {item.icon && <span className="text-base w-5 text-center">{item.icon}</span>}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
