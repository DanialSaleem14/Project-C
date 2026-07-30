import "server-only";
import { fetchAllFeedItems, type RssItem } from "@/lib/rss";
import { isDuplicateByUrlHash, isDuplicateByFuzzyTitle } from "@/lib/dedupe";
import { generateArticleFromSource, GeminiGenerationError } from "@/lib/gemini";
import { createArticle } from "@/lib/admin-articles";
import { recordFailedItem, findQueueItemByHash } from "@/lib/fetch-queue";
import { createFetchRun, finishFetchRun } from "@/lib/fetch-runs";
import { hashUrl, slugify } from "@/lib/text-utils";
import { getFallbackImageUrl } from "@/lib/fallback-image";
import { MAX_ITEMS_PER_RUN, GEMINI_CALL_DELAY_MS, MAX_RETRY_ATTEMPTS } from "@/config/rss-feeds";
import type { ArticleInput } from "@/types/article";

export interface PipelineResult {
  itemsFound: number;
  itemsNew: number;
  itemsFailed: number;
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function isAlreadyQueuedAndExhausted(urlHash: string): Promise<boolean> {
  const existing = await findQueueItemByHash(urlHash);
  if (!existing) return false;
  return existing.status === "failed" || existing.attempts >= MAX_RETRY_ATTEMPTS;
}

async function processItem(item: RssItem): Promise<"created" | "failed"> {
  try {
    const generated = await generateArticleFromSource(item);
    const slug = slugify(generated.slug || generated.title);

    const input: ArticleInput = {
      title: generated.title,
      slug,
      excerpt: generated.excerpt,
      markdown: generated.markdown,
      category: generated.category,
      tags: generated.tags,
      seoTitle: generated.seoTitle,
      metaDescription: generated.metaDescription,
      featuredImageUrl: getFallbackImageUrl(generated.category, slug),
      sourceUrl: item.link,
      sourceName: item.sourceName,
      status: "draft",
    };

    // Guard against slug collisions by suffixing with a short hash fragment.
    try {
      await createArticle(input);
    } catch (error) {
      if (!(error instanceof Error) || !error.message.includes("already exists")) {
        throw error;
      }
      input.slug = `${input.slug}-${hashUrl(item.link).slice(0, 6)}`;
      input.featuredImageUrl = getFallbackImageUrl(input.category, input.slug);
      await createArticle(input);
    }

    return "created";
  } catch (error) {
    const message = error instanceof GeminiGenerationError ? error.message : String(error);
    await recordFailedItem(item, hashUrl(item.link), message, MAX_RETRY_ATTEMPTS);
    return "failed";
  }
}

/**
 * Core content pipeline: fetch RSS feeds, dedupe against existing
 * articles, and generate draft articles via Gemini - sequentially, with
 * a delay between calls, to respect Gemini's free-tier rate limits.
 * Both /api/cron/fetch (secret-protected) and /api/admin/fetch-now
 * (admin-auth protected) call this same function.
 */
export async function runFetchPipeline(trigger: "cron" | "manual"): Promise<PipelineResult> {
  const runId = await createFetchRun(trigger);

  let itemsFound = 0;
  let itemsNew = 0;
  let itemsFailed = 0;

  try {
    const allItems = await fetchAllFeedItems();
    itemsFound = allItems.length;

    let processed = 0;
    for (const item of allItems) {
      if (processed >= MAX_ITEMS_PER_RUN) break;

      const urlHash = hashUrl(item.link);

      if (await isDuplicateByUrlHash(urlHash)) continue;
      if (await isAlreadyQueuedAndExhausted(urlHash)) continue;
      if (await isDuplicateByFuzzyTitle(item.title)) continue;

      const outcome = await processItem(item);
      processed += 1;
      if (outcome === "created") {
        itemsNew += 1;
      } else {
        itemsFailed += 1;
      }

      if (processed < MAX_ITEMS_PER_RUN) {
        await sleep(GEMINI_CALL_DELAY_MS);
      }
    }
  } finally {
    await finishFetchRun(runId, { itemsFound, itemsNew, itemsFailed });
  }

  return { itemsFound, itemsNew, itemsFailed };
}
