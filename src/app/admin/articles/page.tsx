"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/admin-api-client";
import { useAuth } from "@/lib/auth-context";
import { formatDate } from "@/lib/format-date";
import type { Article, ArticleStatus } from "@/types/article";

const TABS: { label: string; value: ArticleStatus | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Draft", value: "draft" },
  { label: "Reviewed", value: "reviewed" },
  { label: "Published", value: "published" },
  { label: "Rejected", value: "rejected" },
];

function ArticlesListContent() {
  const { user } = useAuth();
  const [tab, setTab] = useState<ArticleStatus | "all">("draft");
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    async function load() {
      setLoading(true);
      const query = tab === "all" ? "" : `?status=${tab}`;
      const response = await adminFetch(`/api/admin/articles${query}`);
      const data = await response.json();
      if (!cancelled) {
        setArticles(data.articles ?? []);
        setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [tab, user]);

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Articles</h1>
        <Link
          href="/admin/articles/new"
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-neutral-100 dark:text-neutral-900"
        >
          New Article
        </Link>
      </div>

      <div className="mb-6 flex gap-2 border-b border-neutral-200 dark:border-neutral-800">
        {TABS.map((t) => (
          <button
            key={t.value}
            onClick={() => setTab(t.value)}
            className={`px-3 py-2 text-sm ${
              tab === t.value
                ? "border-b-2 border-neutral-900 font-medium text-neutral-900 dark:border-neutral-100 dark:text-neutral-50"
                : "text-neutral-500 dark:text-neutral-400"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-neutral-500">Loading&hellip;</p>
      ) : articles.length === 0 ? (
        <p className="text-sm text-neutral-500">No articles in this status.</p>
      ) : (
        <div className="overflow-hidden rounded border border-neutral-200 dark:border-neutral-800">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-100 text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400">
              <tr>
                <th className="px-4 py-2">Title</th>
                <th className="px-4 py-2">Category</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr
                  key={article.id}
                  className="border-t border-neutral-200 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-900"
                >
                  <td className="px-4 py-2">
                    <Link href={`/admin/articles/${article.id}`} className="hover:underline">
                      {article.title}
                    </Link>
                  </td>
                  <td className="px-4 py-2">{article.category}</td>
                  <td className="px-4 py-2">
                    <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs uppercase dark:bg-neutral-800">
                      {article.status}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-neutral-500">{formatDate(article.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

export default function ArticlesListPage() {
  return (
    <AdminGuard>
      <AdminShell>
        <ArticlesListContent />
      </AdminShell>
    </AdminGuard>
  );
}
