import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CATEGORIES, CATEGORY_LABELS, type Category } from "@/types/article";
import { getPublishedArticles } from "@/lib/articles";
import { ArticleCard } from "@/components/ArticleCard";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ name: string }>;
}

function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export function generateStaticParams() {
  return CATEGORIES.map((name) => ({ name }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { name } = await params;
  if (!isCategory(name)) return {};

  const label = CATEGORY_LABELS[name];
  const title = `${label} News & Analysis`;
  const description = `Latest ${label} news, analysis and guides from ${siteConfig.name}.`;

  return {
    title,
    description,
    alternates: { canonical: `/category/${name}` },
    openGraph: { title, description, url: `${siteConfig.url}/category/${name}` },
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { name } = await params;
  if (!isCategory(name)) notFound();

  const articles = await getPublishedArticles({ category: name, limit: 24 });
  const label = CATEGORY_LABELS[name];

  return (
    <div className="mx-auto max-w-5xl px-4 py-10">
      <h1 className="mb-8 text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
        {label}
      </h1>
      {articles.length === 0 ? (
        <p className="text-neutral-500 dark:text-neutral-400">
          No {label} articles published yet. Check back soon.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {articles.map((article) => (
            <ArticleCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
