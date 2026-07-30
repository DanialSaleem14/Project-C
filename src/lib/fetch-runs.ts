import "server-only";
import { FieldValue } from "firebase-admin/firestore";
import { getAdminFirestore } from "@/lib/firebase-admin";

const FETCH_RUNS_COLLECTION = "fetchRuns";

export async function createFetchRun(trigger: "cron" | "manual"): Promise<string> {
  const db = getAdminFirestore();
  const ref = await db.collection(FETCH_RUNS_COLLECTION).add({
    startedAt: FieldValue.serverTimestamp(),
    finishedAt: null,
    itemsFound: 0,
    itemsNew: 0,
    itemsFailed: 0,
    trigger,
  });
  return ref.id;
}

export async function finishFetchRun(
  id: string,
  result: { itemsFound: number; itemsNew: number; itemsFailed: number }
): Promise<void> {
  const db = getAdminFirestore();
  await db.collection(FETCH_RUNS_COLLECTION).doc(id).update({
    finishedAt: FieldValue.serverTimestamp(),
    ...result,
  });
}
