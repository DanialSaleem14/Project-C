import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase-admin";
import type { RssItem } from "@/lib/rss";

const FETCH_QUEUE_COLLECTION = "fetchQueue";

interface QueueDoc {
  id: string;
  attempts: number;
  status: string;
}

export async function findQueueItemByHash(urlHash: string): Promise<QueueDoc | null> {
  const db = getAdminFirestore();
  const snapshot = await db
    .collection(FETCH_QUEUE_COLLECTION)
    .where("urlHash", "==", urlHash)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  const doc = snapshot.docs[0]!;
  return { id: doc.id, attempts: doc.data().attempts ?? 0, status: doc.data().status };
}

export async function recordFailedItem(
  item: RssItem,
  urlHash: string,
  error: string,
  maxAttempts: number
): Promise<void> {
  const db = getAdminFirestore();
  const existing = await findQueueItemByHash(urlHash);
  const now = FieldValue.serverTimestamp();

  if (existing) {
    const attempts = existing.attempts + 1;
    await db
      .collection(FETCH_QUEUE_COLLECTION)
      .doc(existing.id)
      .update({
        attempts,
        status: attempts >= maxAttempts ? "failed" : "pending",
        lastError: error,
        updatedAt: now,
      });
    return;
  }

  await db.collection(FETCH_QUEUE_COLLECTION).add({
    sourceUrl: item.link,
    sourceName: item.sourceName,
    rawTitle: item.title,
    rawSummary: item.summary,
    urlHash,
    status: "pending",
    attempts: 1,
    lastError: error,
    createdAt: now,
    updatedAt: now,
  });
}
