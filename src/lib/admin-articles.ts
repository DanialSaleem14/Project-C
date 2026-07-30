import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { computeReadingTimeMinutes, hashUrl, normalizeTitle } from "@/lib/text-utils";
import type { Article, ArticleInput, ArticleStatus } from "@/types/article";

const ARTICLES_COLLECTION = "articles";

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

export async function listArticles(status?: ArticleStatus): Promise<Article[]> {
  const db = getAdminFirestore();
  let query: FirebaseFirestore.Query = db.collection(ARTICLES_COLLECTION);
  if (status) {
    query = query.where("status", "==", status);
  }
  query = query.orderBy("createdAt", "desc");
  const snapshot = await query.get();
  return snapshot.docs.map((doc) => toArticle(doc.id, doc.data()));
}

export async function getArticleById(id: string): Promise<Article | null> {
  const db = getAdminFirestore();
  const doc = await db.collection(ARTICLES_COLLECTION).doc(id).get();
  if (!doc.exists) return null;
  return toArticle(doc.id, doc.data()!);
}

export async function getArticleCounts(): Promise<{
  draft: number;
  reviewed: number;
  published: number;
  rejected: number;
  fetchedToday: number;
}> {
  const db = getAdminFirestore();
  const collection = db.collection(ARTICLES_COLLECTION);

  const [draft, reviewed, published, rejected] = await Promise.all([
    collection.where("status", "==", "draft").count().get(),
    collection.where("status", "==", "reviewed").count().get(),
    collection.where("status", "==", "published").count().get(),
    collection.where("status", "==", "rejected").count().get(),
  ]);

  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const fetchedToday = await collection.where("createdAt", ">=", startOfToday).count().get();

  return {
    draft: draft.data().count,
    reviewed: reviewed.data().count,
    published: published.data().count,
    rejected: rejected.data().count,
    fetchedToday: fetchedToday.data().count,
  };
}

/**
 * Creates a new article document, keyed by slug. Throws if the slug is
 * already taken so editors get an explicit conflict instead of a silent
 * overwrite.
 */
export async function createArticle(input: ArticleInput): Promise<Article> {
  const db = getAdminFirestore();
  const ref = db.collection(ARTICLES_COLLECTION).doc(input.slug);

  const existing = await ref.get();
  if (existing.exists) {
    throw new Error(`An article with slug "${input.slug}" already exists`);
  }

  const now = FieldValue.serverTimestamp();
  await ref.set({
    ...input,
    readingTimeMinutes: computeReadingTimeMinutes(input.markdown),
    urlHash: hashUrl(input.sourceUrl),
    titleNormalized: normalizeTitle(input.title),
    createdAt: now,
    updatedAt: now,
    publishedAt: input.status === "published" ? now : null,
  });

  const created = await ref.get();
  return toArticle(created.id, created.data()!);
}

export async function updateArticle(
  id: string,
  input: Partial<ArticleInput>
): Promise<Article> {
  const db = getAdminFirestore();
  const ref = db.collection(ARTICLES_COLLECTION).doc(id);

  const updates: Record<string, unknown> = {
    ...input,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (input.markdown) {
    updates.readingTimeMinutes = computeReadingTimeMinutes(input.markdown);
  }
  if (input.title) {
    updates.titleNormalized = normalizeTitle(input.title);
  }
  if (input.sourceUrl) {
    updates.urlHash = hashUrl(input.sourceUrl);
  }

  await ref.update(updates);
  const updated = await ref.get();
  return toArticle(updated.id, updated.data()!);
}

export async function setArticleStatus(id: string, status: ArticleStatus): Promise<Article> {
  const db = getAdminFirestore();
  const ref = db.collection(ARTICLES_COLLECTION).doc(id);
  const doc = await ref.get();
  if (!doc.exists) {
    throw new Error(`Article "${id}" not found`);
  }

  const updates: Record<string, unknown> = {
    status,
    updatedAt: FieldValue.serverTimestamp(),
  };

  if (status === "published" && !doc.data()!.publishedAt) {
    updates.publishedAt = FieldValue.serverTimestamp();
  }

  await ref.update(updates);
  const updated = await ref.get();
  return toArticle(updated.id, updated.data()!);
}
