import type { Category } from "@/types/article";

/**
 * Deterministic per-article placeholder image. Lorem Picsum serves real
 * Unsplash photos and needs no API key; seeding by category+slug keeps
 * the same article always showing the same image (no layout shift or
 * flicker across reloads) while varying by article.
 */
export function getFallbackImageUrl(category: Category, slug: string): string {
  return `https://picsum.photos/seed/${encodeURIComponent(`${category}-${slug}`)}/1600/900`;
}
