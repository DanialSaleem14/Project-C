import Link from "next/link";
import Image from "next/image";
import type { Article } from "@/types/article";
import { CATEGORY_LABELS } from "@/types/article";
import { formatDate } from "@/lib/format-date";

export function ArticleCard({ article }: { article: Article }) {
  return (
    <article className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 transition hover:shadow-md dark:border-neutral-800">
      <Link href={`/news/${article.slug}`} className="relative aspect-video w-full overflow-hidden bg-neutral-100 dark:bg-neutral-900">
        <Image
          src={article.featuredImageUrl}
          alt={article.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition group-hover:scale-105"
        />
      </Link>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
          <Link href={`/category/${article.category}`}>{CATEGORY_LABELS[article.category]}</Link>
        </div>
        <h3 className="text-lg font-semibold leading-snug text-neutral-900 dark:text-neutral-50">
          <Link href={`/news/${article.slug}`} className="hover:underline">
            {article.title}
          </Link>
        </h3>
        <p className="line-clamp-3 flex-1 text-sm text-neutral-600 dark:text-neutral-400">{article.excerpt}</p>
        <div className="flex items-center gap-3 text-xs text-neutral-400">
          <time dateTime={article.publishedAt ?? undefined}>
            {article.publishedAt ? formatDate(article.publishedAt) : ""}
          </time>
          <span aria-hidden="true">&middot;</span>
          <span>{article.readingTimeMinutes} min read</span>
        </div>
      </div>
    </article>
  );
}
