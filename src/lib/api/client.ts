"use client";

/** Thrown by apiFetch() for any non-2xx response. */
export class ApiRequestError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
  }
}

/**
 * Calls one of our own /api/** Route Handlers with the caller's Firebase ID
 * token attached. Every admin mutation goes through here rather than
 * talking to Supabase directly from the browser — see
 * src/lib/server/auth.ts for why (Supabase RLS has no concept of a
 * Firebase identity, so ownership is checked server-side instead).
 */
export async function apiFetch<T>(
  path: string,
  options: { token: string; method?: string; body?: unknown }
): Promise<T> {
  const response = await fetch(path, {
    method: options.method ?? "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${options.token}`,
    },
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const json = await response.json().catch(() => null);
  if (!response.ok) {
    throw new ApiRequestError(
      response.status,
      json?.error ?? `Request failed (HTTP ${response.status})`
    );
  }
  return json as T;
}
