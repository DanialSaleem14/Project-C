"use client";

import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import { ArticleForm } from "@/components/admin/ArticleForm";

export default function NewArticlePage() {
  return (
    <AdminGuard>
      <AdminShell>
        <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
          New Article
        </h1>
        <ArticleForm mode="create" />
      </AdminShell>
    </AdminGuard>
  );
}
