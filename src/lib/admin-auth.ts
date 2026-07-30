import { NextRequest } from "next/server";
import { getAdminAuth } from "@/lib/firebase-admin";

export class UnauthorizedError extends Error {
  constructor(message = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
  }
}

/**
 * Verifies the Firebase ID token sent by the admin client in the
 * Authorization header ("Bearer <idToken>"). Throws UnauthorizedError
 * if missing/invalid. This is the only path admin API routes use to
 * authorize writes — Firestore rules deny all client writes directly.
 */
export async function requireAdmin(request: NextRequest): Promise<string> {
  const authHeader = request.headers.get("authorization");
  const idToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!idToken) {
    throw new UnauthorizedError("Missing bearer token");
  }

  try {
    const decoded = await getAdminAuth().verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    throw new UnauthorizedError("Invalid or expired token");
  }
}
