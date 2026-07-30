"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MarkdownEditor } from "@/components/admin/MarkdownEditor";
import { adminFetch } from "@/lib/admin-api-client";
import { slugify } from "@/lib/text-utils";
import { CATEGORIES, CATEGORY_LABELS, type Article, type ArticleInput } from "@/types/article";

interface ArticleFormProps {
  mode: "create" | "edit";
  initialArticle?: Article;
}

type FormState = Omit<ArticleInput, "tags"> & { tagsInput: string };

function toFormState(article?: Article): FormState {
  return {
    title: article?.title ?? "",
    slug: article?.slug ?? "",
    excerpt: article?.excerpt ?? "",
    markdown: article?.markdown ?? "",
    category: article?.category ?? "llms",
    tagsInput: article?.tags.join(", ") ?? "",
    seoTitle: article?.seoTitle ?? "",
    metaDescription: article?.metaDescription ?? "",
    featuredImageUrl: article?.featuredImageUrl ?? "",
    sourceUrl: article?.sourceUrl ?? "",
    sourceName: article?.sourceName ?? "",
    status: article?.status ?? "draft",
  };
}

export function ArticleForm({ mode, initialArticle }: ArticleFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(toFormState(initialArticle));
  const [slugTouched, setSlugTouched] = useState(mode === "edit");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "title" && !slugTouched) {
        next.slug = slugify(value as string);
      }
      return next;
    });
  }

  function buildPayload(): ArticleInput {
    return {
      title: form.title,
      slug: form.slug,
      excerpt: form.excerpt,
      markdown: form.markdown,
      category: form.category,
      tags: form.tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean),
      seoTitle: form.seoTitle,
      metaDescription: form.metaDescription,
      featuredImageUrl: form.featuredImageUrl,
      sourceUrl: form.sourceUrl,
      sourceName: form.sourceName,
      status: form.status,
    };
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const payload = buildPayload();
      const response =
        mode === "create"
          ? await adminFetch("/api/admin/articles", {
              method: "POST",
              body: JSON.stringify(payload),
            })
          : await adminFetch(`/api/admin/articles/${initialArticle!.id}`, {
              method: "PATCH",
              body: JSON.stringify(payload),
            });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? "Failed to save article");
      }

      const data = await response.json();
      if (mode === "create") {
        router.push(`/admin/articles/${data.article.id}`);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save article");
    } finally {
      setSaving(false);
    }
  }

  async function handleStatusAction(action: "publish" | "reject") {
    if (!initialArticle) return;
    setSaving(true);
    setError(null);
    try {
      const response = await adminFetch(`/api/admin/articles/${initialArticle.id}/${action}`, {
        method: "POST",
      });
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error ?? `Failed to ${action} article`);
      }
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Failed to ${action} article`);
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSave} className="flex flex-col gap-6">
      {error && (
        <p className="rounded border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-400">
          {error}
        </p>
      )}

      {mode === "edit" && initialArticle && (
        <div className="flex items-center gap-3 rounded border border-neutral-200 bg-white px-4 py-3 text-sm dark:border-neutral-800 dark:bg-neutral-900">
          <span className="font-medium">Status:</span>
          <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-xs uppercase dark:bg-neutral-800">
            {initialArticle.status}
          </span>
          <div className="ml-auto flex gap-2">
            <button
              type="button"
              disabled={saving || initialArticle.status === "published"}
              onClick={() => handleStatusAction("publish")}
              className="rounded bg-green-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              Publish
            </button>
            <button
              type="button"
              disabled={saving || initialArticle.status === "rejected"}
              onClick={() => handleStatusAction("reject")}
              className="rounded bg-red-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
            >
              Reject
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="text-sm">
          <span className="mb-1 block text-neutral-600 dark:text-neutral-400">Title</span>
          <input
            required
            value={form.title}
            onChange={(e) => update("title", e.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-neutral-600 dark:text-neutral-400">Slug</span>
          <input
            required
            value={form.slug}
            onChange={(e) => {
              setSlugTouched(true);
              update("slug", slugify(e.target.value));
            }}
            className="w-full rounded border border-neutral-300 px-3 py-2 font-mono text-xs dark:border-neutral-700 dark:bg-neutral-800"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-neutral-600 dark:text-neutral-400">Category</span>
          <select
            value={form.category}
            onChange={(e) => update("category", e.target.value as FormState["category"])}
            className="w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-neutral-600 dark:text-neutral-400">Tags (comma separated)</span>
          <input
            value={form.tagsInput}
            onChange={(e) => update("tagsInput", e.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-neutral-600 dark:text-neutral-400">SEO Title</span>
          <input
            required
            maxLength={70}
            value={form.seoTitle}
            onChange={(e) => update("seoTitle", e.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-neutral-600 dark:text-neutral-400">Featured Image URL</span>
          <input
            required
            type="url"
            value={form.featuredImageUrl}
            onChange={(e) => update("featuredImageUrl", e.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-neutral-600 dark:text-neutral-400">Source URL</span>
          <input
            required
            type="url"
            value={form.sourceUrl}
            onChange={(e) => update("sourceUrl", e.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </label>

        <label className="text-sm">
          <span className="mb-1 block text-neutral-600 dark:text-neutral-400">Source Name</span>
          <input
            required
            value={form.sourceName}
            onChange={(e) => update("sourceName", e.target.value)}
            className="w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
          />
        </label>
      </div>

      <label className="text-sm">
        <span className="mb-1 block text-neutral-600 dark:text-neutral-400">Meta Description</span>
        <textarea
          required
          maxLength={160}
          rows={2}
          value={form.metaDescription}
          onChange={(e) => update("metaDescription", e.target.value)}
          className="w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
        />
      </label>

      <label className="text-sm">
        <span className="mb-1 block text-neutral-600 dark:text-neutral-400">Excerpt</span>
        <textarea
          required
          rows={2}
          value={form.excerpt}
          onChange={(e) => update("excerpt", e.target.value)}
          className="w-full rounded border border-neutral-300 px-3 py-2 dark:border-neutral-700 dark:bg-neutral-800"
        />
      </label>

      <div>
        <span className="mb-1 block text-sm text-neutral-600 dark:text-neutral-400">Body (Markdown)</span>
        <MarkdownEditor value={form.markdown} onChange={(v) => update("markdown", v)} />
      </div>

      <button
        type="submit"
        disabled={saving}
        className="self-start rounded bg-neutral-900 px-5 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900"
      >
        {saving ? "Saving…" : mode === "create" ? "Create draft" : "Save changes"}
      </button>
    </form>
  );
}
