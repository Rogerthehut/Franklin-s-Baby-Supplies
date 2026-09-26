// An anonymous per-browser id for the feedback board, cookie-based rather
// than tied to an account, so voting stays open to everyone. It's a
// deterrent against casual double-voting (clearing local storage no longer
// resets the count), not an identity check.
export const VOTER_COOKIE = "franklyns_voter";

export function readVoterId(request: Request): string | null {
  const cookieHeader = request.headers.get("cookie") ?? "";
  for (const part of cookieHeader.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === VOTER_COOKIE) return rest.join("=") || null;
  }
  return null;
}

export function voterCookieHeader(voterId: string, isSecureRequest: boolean): string {
  const oneYear = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);
  const attrs = [`${VOTER_COOKIE}=${voterId}`, "Path=/", "HttpOnly", "SameSite=Lax", `Expires=${oneYear.toUTCString()}`];
  if (isSecureRequest) attrs.push("Secure");
  return attrs.join("; ");
}
