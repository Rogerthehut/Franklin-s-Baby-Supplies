import { env } from "cloudflare:workers";

export function requireAdmin(request: Request): Response | null {
  if (!env.ADMIN_TOKEN) {
    return Response.json(
      {
        error:
          "The admin area isn't configured yet. Set the ADMIN_TOKEN secret before using it.",
      },
      { status: 500 }
    );
  }

  const header = request.headers.get("authorization") ?? "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";

  if (token !== env.ADMIN_TOKEN) {
    return Response.json({ error: "Not authorised." }, { status: 401 });
  }

  return null;
}
