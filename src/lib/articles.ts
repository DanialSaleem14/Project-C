import "server-only";
import { getAdminFirestore } from "@/lib/firebase-admin";
import type { Article, Category } from "@/types/article";

const ARTICLES_COLLECTION = "articles";

function isFirebaseConfigured(): boolean {
  return Boolean(
    process.env.FIREBASE_ADMIN_PROJECT_ID &&
      process.env.FIREBASE_ADMIN_CLIENT_EMAIL &&
      process.env.FIREBASE_ADMIN_PRIVATE_KEY
  );
}

function toArticle(id: string, data: FirebaseFirestore.DocumentData): Article {
  return {
    id,
    title: data.title,
    slug: data.slug,
    excerpt: data.excerpt,
    markdown: data.markdown,
    category: data.category,
    tags: data.tags ?? [],
    seoTitle: data.seoTitle,
    metaDescription: data.metaDescription,
    featuredImageUrl: data.featuredImageUrl,
    sourceUrl: data.sourceUrl,
    sourceName: data.sourceName,
    status: data.status,
    createdAt: data.createdAt?.toDate?.().toISOString() ?? new Date(0).toISOString(),
    updatedAt: data.updatedAt?.toDate?.().toISOString() ?? new Date(0).toISOString(),
    publishedAt: data.publishedAt?.toDate?.().toISOString() ?? null,
    readingTimeMinutes: data.readingTimeMinutes ?? 1,
    urlHash: data.urlHash,
    titleNormalized: data.titleNormalized,
  };
}

/**
 * All public-facing reads go through here. If Firebase isn't configured
 * yet (e.g. building this project before Firebase setup is complete),
 * these fall back to empty results instead of throwing, so `next build`
 * and local dev keep working before SETUP.md has been followed.
 */
export async function getPublishedArticles(options?: {
  category?: Category;
  limit?: number;
}): Promise<Article[]> {
  if (!isFirebaseConfigured()) return [];

  try {
    const db = getAdminFirestore();
    let query: FirebaseFirestore.Query = db
      .collection(ARTICLES_COLLECTION)
      .where("status", "==", "published");

    if (options?.category) {
      query = query.where("category", "==", options.category);
    }

    query = query.orderBy("publishedAt", "desc");

    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const snapshot = await query.get();
    return snapshot.docs.map((doc) => toArticle(doc.id, doc.data()));
  } catch (error) {
    console.error("getPublishedArticles failed:", error);
    return [];
  }
}

export async function getArticleBySlug(slug: string): Promise<Article | null> {
  if (!isFirebaseConfigured()) return null;

  try {
    const db = getAdminFirestore();
    const doc = await db.collection(ARTICLES_COLLECTION).doc(slug).get();
    if (!doc.exists) return null;
    const article = toArticle(doc.id, doc.data()!);
    return article.status === "published" ? article : null;
  } catch (error) {
    console.error("getArticleBySlug failed:", error);
    return null;
  }
}

export async function getRelatedArticles(
  article: Article,
  count = 3
): Promise<Article[]> {
  const candidates = await getPublishedArticles({ category: article.category, limit: count + 1 });
  return candidates.filter((a) => a.slug !== article.slug).slice(0, count);
}

export async function getAllPublishedSlugs(): Promise<string[]> {
  const articles = await getPublishedArticles();
  return articles.map((a) => a.slug);
}
