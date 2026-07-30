export const CATEGORIES = [
  "llms",
  "ai-tools",
  "research",
  "business",
  "tutorials",
] as const;

export type Category = (typeof CATEGORIES)[number];

export const CATEGORY_LABELS: Record<Category, string> = {
  llms: "LLMs",
  "ai-tools": "AI Tools",
  research: "Research",
  business: "Business",
  tutorials: "Tutorials",
};

export type ArticleStatus = "draft" | "reviewed" | "published" | "rejected";

export interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  markdown: string;
  category: Category;
  tags: string[];
  seoTitle: string;
  metaDescription: string;
  featuredImageUrl: string;
  sourceUrl: string;
  sourceName: string;
  status: ArticleStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  readingTimeMinutes: number;
  urlHash: string;
  titleNormalized: string;
}

export type ArticleInput = Omit<
  Article,
  | "id"
  | "createdAt"
  | "updatedAt"
  | "publishedAt"
  | "readingTimeMinutes"
  | "urlHash"
  | "titleNormalized"
>;

export type FetchQueueStatus = "pending" | "processing" | "failed" | "done";

export interface FetchQueueItem {
  id: string;
  sourceUrl: string;
  sourceName: string;
  rawTitle: string;
  rawSummary: string;
  urlHash: string;
  status: FetchQueueStatus;
  attempts: number;
  lastError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FetchRun {
  id: string;
  startedAt: string;
  finishedAt: string | null;
  itemsFound: number;
  itemsNew: number;
  itemsFailed: number;
  trigger: "cron" | "manual";
}

export interface SiteMetaConfig {
  indexNowKey: string;
  lastSitemapPing: string | null;
}
