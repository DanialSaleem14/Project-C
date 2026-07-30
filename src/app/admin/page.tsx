"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminShell>
        <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          Dashboard
        </h1>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          You&apos;re signed in. Article counts and the drafts queue land in Phase 4.
        </p>
      </AdminShell>
    </AdminGuard>
  );
}
