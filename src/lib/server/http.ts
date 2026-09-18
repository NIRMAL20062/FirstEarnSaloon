import "server-only";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import type { ZodType } from "zod";

/** Thrown anywhere inside a Route Handler; caught by withErrorHandling(). */
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

/**
 * Wraps a Route Handler so every ApiError (401/403/404/409/...) becomes a
 * consistent `{ error: string }` JSON response, and any unexpected
 * exception becomes a logged 500 instead of an unhandled crash.
 */
export function withErrorHandling<Args extends unknown[]>(
  handler: (...args: Args) => Promise<NextResponse>
) {
  return async (...args: Args): Promise<NextResponse> => {
    try {
      return await handler(...args);
    } catch (error) {
      if (error instanceof ApiError) {
        return NextResponse.json({ error: error.message }, { status: error.status });
      }
      console.error("Unhandled API error", error);
      return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
  };
}

/**
 * Wraps an unexpected Supabase/Postgres error for a client response: logs
 * the real message server-side and returns a generic ApiError instead —
 * the database's own error text (column/constraint names, query
 * fragments) should never reach the client directly.
 */
export function dbError(error: { message: string }): ApiError {
  console.error("Database error:", error.message);
  return new ApiError(500, "Something went wrong. Please try again.");
}

/** Parses the request body as JSON and validates it against `schema`, throwing a 400 ApiError on failure. */
export async function parseJsonBody<T>(request: NextRequest, schema: ZodType<T>): Promise<T> {
  const json = await request.json().catch(() => null);
  const result = schema.safeParse(json);
  if (!result.success) {
    throw new ApiError(400, result.error.issues[0]?.message ?? "Invalid request body");
  }
  return result.data;
}
