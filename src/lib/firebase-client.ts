import { initializeApp, getApps, getApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export const firebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

let authInstance: Auth | undefined;

/**
 * Lazily constructs the Auth service. Must only be called from
 * client-only code paths (useEffect bodies, event handlers) - never at
 * module scope - so that a missing/placeholder Firebase config doesn't
 * throw during server-side rendering of admin pages.
 */
export function getClientAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(firebaseApp);
  }
  return authInstance;
}
