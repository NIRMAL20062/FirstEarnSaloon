import "server-only";
import { createRemoteJWKSet, jwtVerify } from "jose";

/**
 * Verifies a Firebase Auth ID token WITHOUT firebase-admin.
 *
 * This used to use firebase-admin's `verifyIdToken()`, but firebase-admin
 * pulls in a large dependency tree (google-gax/grpc and friends) that
 * Vercel's serverless function bundler has repeatedly mishandled in this
 * project — every /api/** route that merely imported it crashed with an
 * empty 500 response, even `serverExternalPackages` didn't fix it (see
 * git history / CLAUDE.md if this comes up again). Firebase ID tokens are
 * just standard RS256 JWTs, so verifying them directly against Google's
 * public keys with `jose` (a small, dependency-free JWT library with none
 * of firebase-admin's bundling baggage) avoids the whole problem — and
 * means we no longer need a service account key/credential at all.
 */

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

// createRemoteJWKSet caches the fetched keys and handles rotation itself —
// safe to create once per cold start rather than per request.
const JWKS = createRemoteJWKSet(
  new URL("https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com")
);

export interface VerifiedFirebaseToken {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
}

export async function verifyFirebaseIdToken(idToken: string): Promise<VerifiedFirebaseToken> {
  if (!PROJECT_ID) {
    throw new Error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not set — see .env.local.example.");
  }

  const { payload } = await jwtVerify(idToken, JWKS, {
    issuer: `https://securetoken.google.com/${PROJECT_ID}`,
    audience: PROJECT_ID,
  });

  if (typeof payload.sub !== "string") {
    throw new Error("Token has no subject claim");
  }

  return {
    uid: payload.sub,
    email: typeof payload.email === "string" ? payload.email : null,
    name: typeof payload.name === "string" ? payload.name : null,
    picture: typeof payload.picture === "string" ? payload.picture : null,
  };
}
