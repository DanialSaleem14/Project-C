import "server-only";
import Parser from "rss-parser";
import { RSS_FEEDS, type RssFeedSource } from "@/config/rss-feeds";
import type { Category } from "@/types/article";

export interface RssItem {
  title: string;
  link: string;
  summary: string;
  sourceName: string;
  defaultCategory: Category;
}

const parser = new Parser({ timeout: 15_000 });

/**
 * Fetches and normalizes items from every configured RSS feed. A single
 * feed failing (unreachable, malformed XML) is logged and skipped rather
 * than aborting the whole run.
 */
export async function fetchAllFeedItems(): Promise<RssItem[]> {
  const results = await Promise.allSettled(RSS_FEEDS.map(fetchFeedItems));

  const items: RssItem[] = [];
  results.forEach((result, index) => {
    if (result.status === "fulfilled") {
      items.push(...result.value);
    } else {
      console.error(`Failed to fetch feed "${RSS_FEEDS[index]!.name}":`, result.reason);
    }
  });
  return items;
}

async function fetchFeedItems(source: RssFeedSource): Promise<RssItem[]> {
  const feed = await parser.parseURL(source.url);
  return (feed.items ?? [])
    .filter((item) => item.title && item.link)
    .map((item) => ({
      title: item.title!.trim(),
      link: item.link!.trim(),
      summary: (item.contentSnippet ?? item.content ?? "").slice(0, 2000),
      sourceName: source.name,
      defaultCategory: source.defaultCategory,
    }));
}
