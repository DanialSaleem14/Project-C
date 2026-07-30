import "server-only";

export interface PipelineResult {
  itemsFound: number;
  itemsNew: number;
  itemsFailed: number;
}

/**
 * Core content pipeline: fetch RSS feeds, dedupe against existing
 * articles, and generate draft articles via Gemini. Implemented in
 * Phase 5. Both /api/cron/fetch (secret-protected) and
 * /api/admin/fetch-now (admin-auth protected) call this same function.
 */
export async function runFetchPipeline(
  trigger: "cron" | "manual"
): Promise<PipelineResult> {
  void trigger;
  throw new Error("Content pipeline not implemented yet (Phase 5)");
}
