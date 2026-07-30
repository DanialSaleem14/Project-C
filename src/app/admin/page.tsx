"use client";

import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminShell } from "@/components/admin/AdminShell";
import { adminFetch } from "@/lib/admin-api-client";
import { useAuth } from "@/lib/auth-context";

interface Counts {
  draft: number;
  reviewed: number;
  published: number;
  rejected: number;
  fetchedToday: number;
}

function DashboardContent() {
  const { user } = useAuth();
  const [counts, setCounts] = useState<Counts | null>(null);
  const [fetching, setFetching] = useState(false);
  const [fetchMessage, setFetchMessage] = useState<string | null>(null);

  async function loadCounts() {
    const response = await adminFetch("/api/admin/stats");
    if (response.ok) {
      setCounts(await response.json());
    }
  }

  useEffect(() => {
    if (user) loadCounts();
  }, [user]);

  async function handleFetchNow() {
    setFetching(true);
    setFetchMessage(null);
    try {
      const response = await adminFetch("/api/admin/fetch-now", { method: "POST" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? "Fetch failed");
      setFetchMessage(
        `Found ${data.itemsFound}, added ${data.itemsNew} new drafts, ${data.itemsFailed} failed.`
      );
      await loadCounts();
    } catch (err) {
      setFetchMessage(err instanceof Error ? err.message : "Fetch failed");
    } finally {
      setFetching(false);
    }
  }

  const cards = counts
    ? [
        { label: "Drafts", value: counts.draft },
        { label: "Reviewed", value: counts.reviewed },
        { label: "Published", value: counts.published },
        { label: "Rejected", value: counts.rejected },
        { label: "Fetched today", value: counts.fetchedToday },
      ]
    : [];

  return (
    <>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">Dashboard</h1>
        <button
          onClick={handleFetchNow}
          disabled={fetching}
          className="rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
        >
          {fetching ? "Fetching…" : "Fetch now"}
        </button>
      </div>

      {fetchMessage && (
        <p className="mb-6 rounded border border-neutral-200 bg-white px-4 py-2 text-sm dark:border-neutral-800 dark:bg-neutral-900">
          {fetchMessage}
        </p>
      )}

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900"
          >
            <p className="text-sm text-neutral-500 dark:text-neutral-400">{card.label}</p>
            <p className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{card.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminGuard>
      <AdminShell>
        <DashboardContent />
      </AdminShell>
    </AdminGuard>
  );
}
