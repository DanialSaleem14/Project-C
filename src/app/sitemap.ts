import type { MetadataRoute } from "next";
import { getPublishedArticles } from "@/lib/articles";
import { CATEGORIES } from "@/types/article";
import { siteConfig } from "@/config/site";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const articles = await getPublishedArticles();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: siteConfig.url, changeFrequency: "hourly", priority: 1 },
    { url: `${siteConfig.url}/about`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteConfig.url}/contact`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteConfig.url}/privacy`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${siteConfig.url}/terms`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const categoryRoutes: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${siteConfig.url}/category/${category}`,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${siteConfig.url}/news/${article.slug}`,
    lastModified: article.updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...categoryRoutes, ...articleRoutes];
}
