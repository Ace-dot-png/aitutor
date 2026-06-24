"use client";
import { signOut } from "next-auth/react";
import Link from "next/link";

interface TopNavProps {
  role?: string;
  userName?: string;
  schoolName?: string;
  links?: { label: string; href: string; active?: boolean }[];
}

export default function TopNav({ role, userName, schoolName, links = [] }: TopNavProps) {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-bg-primary/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-[1600px] mx-auto px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <Link href={`/${role?.toLowerCase()}/dashboard`} className="font-silkscreen text-xl text-text-primary hover:opacity-80 transition-opacity">
            ;)
          </Link>
          <div className="flex items-center gap-1">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`px-3 py-1.5 rounded-card text-sm transition-colors ${
                  link.active
                    ? "bg-accent-blue text-text-primary"
                    : "text-text-secondary hover:text-text-primary hover:bg-card"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          {schoolName && (
            <span className="text-text-muted text-sm hidden md:block">{schoolName}</span>
          )}
          {userName && (
            <span className="text-text-secondary text-sm hidden md:block">{userName}</span>
          )}
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="text-text-muted hover:text-text-primary text-sm transition-colors"
          >
            Sign out
          </button>
        </div>
      </div>
    </nav>
  );
}
