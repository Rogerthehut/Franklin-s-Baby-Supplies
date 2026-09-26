import { sql } from "drizzle-orm";
import type { getDb } from "../db";
import { rateLimitHits } from "../db/schema";

// Sliding-window limiter backed by D1: a Worker has no memory shared
// between requests, so an in-process counter wouldn't hold. Stale hits for
// the bucket are pruned on every check, so the table stays small.
export async function checkRateLimit(
  db: ReturnType<typeof getDb>,
  bucket: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  // Timestamps are written explicitly (rather than left to the column's
  // CURRENT_TIMESTAMP default) so they compare correctly against `cutoff`:
  // SQLite's own CURRENT_TIMESTAMP renders "YYYY-MM-DD HH:MM:SS", which
  // sorts differently from toISOString()'s "YYYY-MM-DDTHH:MM:SS.sssZ".
  const now = new Date();
  const cutoff = new Date(now.getTime() - windowSeconds * 1000).toISOString();

  await db.delete(rateLimitHits).where(sql`${rateLimitHits.bucket} = ${bucket} and ${rateLimitHits.createdAt} < ${cutoff}`);

  const [row] = await db
    .select({ count: sql<number>`count(*)` })
    .from(rateLimitHits)
    .where(sql`${rateLimitHits.bucket} = ${bucket}`);

  if ((row?.count ?? 0) >= limit) return false;

  await db.insert(rateLimitHits).values({ bucket, createdAt: now.toISOString() });
  return true;
}

export function clientIp(request: Request): string {
  return request.headers.get("cf-connecting-ip") ?? request.headers.get("x-forwarded-for") ?? "unknown";
}

export function rateLimitResponse(): Response {
  return Response.json({ error: "Too many requests. Wait a moment and try again." }, { status: 429 });
}
