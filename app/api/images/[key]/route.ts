import { env } from "cloudflare:workers";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ key: string }> }
) {
  if (!env.BUCKET) {
    return Response.json(
      { error: "Image storage isn't configured yet. Set the `r2` field in .openai/hosting.json." },
      { status: 500 }
    );
  }

  const { key } = await params;
  const object = await env.BUCKET.get(key);
  if (!object) {
    return Response.json({ error: "Image not found." }, { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("cache-control", "public, max-age=31536000, immutable");
  headers.set("etag", object.httpEtag);

  return new Response(object.body, { headers });
}
