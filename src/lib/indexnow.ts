import "server-only";
import { siteConfig } from "@/config/site";

/**
 * Pings IndexNow with the given URLs. Best-effort: failures are logged,
 * never thrown, so a publish action never fails because of indexing.
 * Requires INDEXNOW_KEY to be set and the key file to be servable at
 * /{INDEXNOW_KEY}.txt (see src/app/[key].txt/route.ts, added in Phase 6).
 */
export async function pingIndexNow(urls: string[]): Promise<void> {
  const key = process.env.INDEXNOW_KEY;
  if (!key || urls.length === 0) return;

  try {
    const host = new URL(siteConfig.url).hostname;
    await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host,
        key,
        keyLocation: `${siteConfig.url}/${key}.txt`,
        urlList: urls,
      }),
    });
  } catch (error) {
    console.error("IndexNow ping failed:", error);
  }
}
