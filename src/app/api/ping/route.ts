import { NextResponse } from "next/server";

// Zero-dependency diagnostic route: no firebase-admin, no Supabase, nothing.
// If this also crashes on Vercel, the problem isn't firebase-admin at all —
// it's something broader about how the API routes are deployed/configured.
export async function GET() {
  return NextResponse.json({ ok: true, time: new Date().toISOString() });
}
