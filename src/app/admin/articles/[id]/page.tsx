"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import { ArticleForm } from "@/components/admin/ArticleForm";
import { adminFetch } from "@/lib/admin-api-client";
import { useAuth } from "@/lib/auth-context";
import type { Article } from "@/types/article";

function EditArticleContent() {
  const params = useParams<{ id: string }>();
  const { user } = useAuth();
  const [article, setArticle] = useState<Article | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      try {
        const response = await adminFetch(`/api/admin/articles/${params.id}`);
        if (!response.ok) throw new Error("Article not found");
        const data = await response.json();
        if (!cancelled) setArticle(data.article);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Failed to load article");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [params.id, user]);

  if (loading) {
    return <p className="text-sm text-neutral-500">Loading&hellip;</p>;
  }

  if (error || !article) {
    return <p className="text-sm text-red-600 dark:text-red-400">{error ?? "Article not found"}</p>;
  }

  return (
    <>
      <h1 className="mb-6 text-2xl font-bold text-neutral-900 dark:text-neutral-50">
        Edit Article
      </h1>
      <ArticleForm mode="edit" initialArticle={article} />
    </>
  );
}

export default function EditArticlePage() {
  return (
    <AdminGuard>
      <AdminShell>
        <EditArticleContent />
      </AdminShell>
    </AdminGuard>
  );
}
