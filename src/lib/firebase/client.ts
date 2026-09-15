import { getApp, getApps, initializeApp, type FirebaseOptions } from "firebase/app";
import { getAuth, type Auth } from "firebase/auth";

// Firebase is used for Authentication ONLY in this app — the database and
// file storage are Supabase (see src/lib/supabase/ and src/lib/server/).
// These values are public identifiers, safe to ship to the browser (see
// .env.local.example).
const firebaseConfig: FirebaseOptions = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp() {
  // Guard against re-initializing on hot reload / multiple imports.
  return getApps().length ? getApp() : initializeApp(firebaseConfig);
}

// Created lazily, on first use, rather than eagerly at module load. This
// module is imported from Server Components and Route Handlers too (they
// need Firebase User types), and Next.js imports every route module while
// collecting page data at build time. Firebase's SDK throws synchronously
// (`auth/invalid-api-key`) the moment `getAuth()` runs against an
// incomplete config — creating it eagerly would break `next build` before
// `.env.local` is set up, even for routes that never touch Auth.
let authInstance: Auth | undefined;
export function getFirebaseAuth(): Auth {
  if (!authInstance) authInstance = getAuth(getFirebaseApp());
  return authInstance;
}
