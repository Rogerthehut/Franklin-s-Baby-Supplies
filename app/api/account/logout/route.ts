import { getDb } from "../../../../db";
import { destroySession, isHttps, logoutCookieHeader } from "../../../../lib/auth";

export async function POST(request: Request) {
  const db = getDb();
  await destroySession(db, request);
  return Response.json({ ok: true }, { headers: { "Set-Cookie": logoutCookieHeader(isHttps(request)) } });
}
