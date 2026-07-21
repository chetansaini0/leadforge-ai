import { NextResponse } from "next/server";
import { getSession, type SessionPayload } from "@/lib/auth";

export function ok<T>(data: T, init?: number) {
  return NextResponse.json({ ok: true, data }, { status: init ?? 200 });
}

export function fail(message: string, status = 400, extra?: Record<string, unknown>) {
  return NextResponse.json({ ok: false, error: message, ...extra }, { status });
}

/**
 * Guard a route handler. Returns the session or a 401 response.
 * Usage:
 *   const auth = await requireAuth();
 *   if (auth instanceof NextResponse) return auth;
 *   // auth is SessionPayload here
 */
export async function requireAuth(): Promise<SessionPayload | NextResponse> {
  const session = await getSession();
  if (!session) return fail("Unauthorized", 401);
  return session;
}

export async function requireRole(role: "admin"): Promise<SessionPayload | NextResponse> {
  const session = await getSession();
  if (!session) return fail("Unauthorized", 401);
  if (session.role !== role) return fail("Forbidden", 403);
  return session;
}

// ─── Simple in-memory rate limiter (per instance) ──────────────────────────
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit = 30, windowMs = 60_000): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  if (b.count >= limit) return false;
  b.count += 1;
  return true;
}
