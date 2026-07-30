"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const navItems = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/articles", label: "Articles" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950">
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-6">
            <span className="font-semibold text-neutral-900 dark:text-neutral-50">
              Learn About AI &mdash; Admin
            </span>
            <nav className="flex gap-4 text-sm">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={
                    pathname === item.href
                      ? "font-medium text-neutral-900 dark:text-neutral-50"
                      : "text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-neutral-100"
                  }
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="flex items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
            <span>{user?.email}</span>
            <button
              onClick={() => logout()}
              className="rounded border border-neutral-300 px-3 py-1 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-800"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  );
}
