"use client";

import { getClientAuth } from "@/lib/firebase-client";

/**
 * fetch() wrapper for admin API routes that attaches the current user's
 * Firebase ID token as a Bearer token. Server routes verify it via
 * requireAdmin() (src/lib/admin-auth.ts) before performing any write.
 */
export async function adminFetch(input: string, init: RequestInit = {}): Promise<Response> {
  const user = getClientAuth().currentUser;
  if (!user) {
    throw new Error("Not authenticated");
  }

  const idToken = await user.getIdToken();
  const headers = new Headers(init.headers);
  headers.set("Authorization", `Bearer ${idToken}`);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return fetch(input, { ...init, headers });
}
