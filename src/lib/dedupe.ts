import "server-only";
import { getAdminFirestore } from "@/lib/firebase-admin";
import { titleSimilarity } from "@/lib/text-utils";

const ARTICLES_COLLECTION = "articles";
const FUZZY_MATCH_THRESHOLD = 0.6;
const RECENT_ARTICLES_LIMIT = 300;

export async function isDuplicateByUrlHash(urlHash: string): Promise<boolean> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(ARTICLES_COLLECTION)
    .where("urlHash", "==", urlHash)
    .limit(1)
    .get();
  return !snapshot.empty;
}

/**
 * Fuzzy dedupe against recently-created articles' normalized titles, to
 * catch the same story republished across multiple RSS feeds with
 * slightly different headlines.
 */
export async function isDuplicateByFuzzyTitle(title: string): Promise<boolean> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(ARTICLES_COLLECTION)
    .orderBy("createdAt", "desc")
    .limit(RECENT_ARTICLES_LIMIT)
    .get();

  return snapshot.docs.some((doc) => {
    const existingTitle = doc.data().title as string | undefined;
    if (!existingTitle) return false;
    return titleSimilarity(title, existingTitle) >= FUZZY_MATCH_THRESHOLD;
  });
}
