import { env } from "cloudflare:workers";
import { requireAdmin } from "../../../lib/admin-auth";

const ALLOWED_TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

const MAX_BYTES = 8 * 1024 * 1024;

export async function POST(request: Request) {
  const authError = requireAdmin(request);
  if (authError) return authError;

  if (!env.BUCKET) {
    return Response.json(
      { error: "Image storage isn't configured yet. Set the `r2` field in .openai/hosting.json." },
      { status: 500 }
    );
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    if (!(file instanceof File)) {
      return Response.json({ error: "Attach an image as `file`." }, { status: 400 });
    }

    const extension = ALLOWED_TYPES[file.type];
    if (!extension) {
      return Response.json(
        { error: "Unsupported image type. Use PNG, JPEG, WEBP or GIF." },
        { status: 400 }
      );
    }
    if (file.size > MAX_BYTES) {
      return Response.json({ error: "Images must be 8MB or smaller." }, { status: 400 });
    }

    const key = `img_${crypto.randomUUID()}.${extension}`;
    await env.BUCKET.put(key, await file.arrayBuffer(), {
      httpMetadata: { contentType: file.type },
    });

    return Response.json({ key, url: `/api/images/${key}` }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    return Response.json({ error: message }, { status: 500 });
  }
}
