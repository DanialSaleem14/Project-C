import type { Category } from "@/types/article";

export interface RssFeedSource {
  name: string;
  url: string;
  defaultCategory: Category;
}

/**
 * Editable list of RSS sources for the content pipeline.
 * Add/remove/comment out entries here — no code changes needed elsewhere.
 */
export const RSS_FEEDS: RssFeedSource[] = [
  {
    name: "OpenAI Blog",
    url: "https://openai.com/news/rss.xml",
    defaultCategory: "llms",
  },
  {
    name: "Google AI Blog",
    url: "https://blog.google/technology/ai/rss/",
    defaultCategory: "research",
  },
  // Anthropic does not currently publish an official RSS feed for
  // anthropic.com/news. If they add one, plug the URL in here - the
  // pipeline will pick it up with no other code changes needed.
  // {
  //   name: "Anthropic News",
  //   url: "https://www.anthropic.com/news/rss.xml",
  //   defaultCategory: "llms",
  // },
  {
    name: "TechCrunch AI",
    url: "https://techcrunch.com/category/artificial-intelligence/feed/",
    defaultCategory: "business",
  },
  {
    name: "The Verge AI",
    url: "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml",
    defaultCategory: "ai-tools",
  },
  {
    name: "MIT Technology Review AI",
    url: "https://www.technologyreview.com/topic/artificial-intelligence/feed",
    defaultCategory: "research",
  },
  {
    name: "Google News: Artificial Intelligence",
    url: "https://news.google.com/rss/search?q=artificial+intelligence&hl=en-US&gl=US&ceid=US:en",
    defaultCategory: "business",
  },
];

/** Max number of new items processed per pipeline run (Gemini rate-limit safety). */
export const MAX_ITEMS_PER_RUN = 8;

/** Delay between sequential Gemini calls, in milliseconds. */
export const GEMINI_CALL_DELAY_MS = 4000;

/** Max retry attempts before a fetch-queue item is left as permanently failed. */
export const MAX_RETRY_ATTEMPTS = 3;
