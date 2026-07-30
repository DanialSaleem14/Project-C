import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getArticleBySlug, getRelatedArticles } from "@/lib/articles";
import { ArticleBody } from "@/components/ArticleBody";
import { ArticleCard } from "@/components/ArticleCard";
import { JsonLd } from "@/components/JsonLd";
import { AdSlot } from "@/components/ads/AdSlot";
import { CATEGORY_LABELS } from "@/types/article";
import { formatDate } from "@/lib/format-date";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const url = `${siteConfig.url}/news/${article.slug}`;

  return {
    title: article.seoTitle || article.title,
    description: article.metaDescription || article.excerpt,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      title: article.seoTitle || article.title,
      description: article.metaDescription || article.excerpt,
      url,
      siteName: siteConfig.name,
      images: [{ url: article.featuredImageUrl }],
      publishedTime: article.publishedAt ?? undefined,
      modifiedTime: article.updatedAt,
      tags: article.tags,
    },
    twitter: {
      card: "summary_large_image",
      title: article.seoTitle || article.title,
      description: article.metaDescription || article.excerpt,
      images: [article.featuredImageUrl],
      site: siteConfig.twitterHandle,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(article, 3);
  const url = `${siteConfig.url}/news/${article.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.title,
    description: article.metaDescription || article.excerpt,
    image: [article.featuredImageUrl],
    datePublished: article.publishedAt ?? article.createdAt,
    dateModified: article.updatedAt,
    author: [{ "@type": "Organization", name: siteConfig.name, url: siteConfig.url }],
    publisher: {
      "@type": "Organization",
      name: siteConfig.name,
      logo: { "@type": "ImageObject", url: `${siteConfig.url}/logo.png` },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
  };

  return (
    <article className="mx-auto max-w-3xl px-4 py-10">
      <JsonLd data={jsonLd} />

      <div className="mb-4 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-blue-600 dark:text-blue-400">
        <Link href={`/category/${article.category}`}>{CATEGORY_LABELS[article.category]}</Link>
      </div>

      <h1 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-neutral-900 sm:text-4xl dark:text-neutral-50">
        {article.title}
      </h1>

      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-neutral-500 dark:text-neutral-400">
        <time dateTime={article.publishedAt ?? undefined}>
          Published {article.publishedAt ? formatDate(article.publishedAt) : ""}
        </time>
        {article.updatedAt !== article.publishedAt && (
          <>
            <span aria-hidden="true">&middot;</span>
            <span>Updated {formatDate(article.updatedAt)}</span>
          </>
        )}
        <span aria-hidden="true">&middot;</span>
        <span>{article.readingTimeMinutes} min read</span>
      </div>

      <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-lg bg-neutral-100 dark:bg-neutral-900">
        <Image
          src={article.featuredImageUrl}
          alt={article.title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 768px"
          className="object-cover"
        />
      </div>

      <ArticleBody markdown={article.markdown} />

      <div className="my-8">
        <AdSlot variant="in-article" />
      </div>

      <p className="mb-10 text-sm text-neutral-500 dark:text-neutral-400">
        Source:{" "}
        <a href={article.sourceUrl} rel="nofollow noopener noreferrer" target="_blank" className="underline">
          {article.sourceName}
        </a>
      </p>

      {article.tags.length > 0 && (
        <div className="mb-10 flex flex-wrap gap-2">
          {article.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-600 dark:bg-neutral-900 dark:text-neutral-400"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {related.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold text-neutral-900 dark:text-neutral-50">
            Related articles
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {related.map((a) => (
              <ArticleCard key={a.id} article={a} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
