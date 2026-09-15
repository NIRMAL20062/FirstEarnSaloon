import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type DecodedIdToken } from "firebase-admin/auth";

/**
 * Server-only: verifies the Firebase ID token a signed-in owner sends with
 * every request to /api/**. This is the ONLY place in the app that
 * confirms who someone is — Supabase never sees Firebase's identity at
 * all, which is why every privileged Supabase read/write happens in a
 * Route Handler, after this check, using the service-role client (see
 * src/lib/server/supabaseAdmin.ts and src/lib/server/auth.ts).
 */
function getAdminApp(): App {
  if (getApps().length) return getApps()[0];

  const encoded = process.env.FIREBASE_SERVICE_ACCOUNT_KEY_BASE64;
  if (!encoded) {
    throw new Error(
      "FIREBASE_SERVICE_ACCOUNT_KEY_BASE64 is not set. Generate a service account key " +
        "(Firebase Console → Project settings → Service accounts → Generate new private key), " +
        "base64-encode the JSON file, and set it in .env.local — see .env.local.example."
    );
  }

  const serviceAccount = JSON.parse(Buffer.from(encoded, "base64").toString("utf8"));
  return initializeApp({ credential: cert(serviceAccount) });
}

export async function verifyFirebaseIdToken(idToken: string): Promise<DecodedIdToken> {
  return getAuth(getAdminApp()).verifyIdToken(idToken);
}
