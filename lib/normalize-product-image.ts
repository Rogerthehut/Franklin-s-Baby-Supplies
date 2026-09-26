// Every product photo goes through this before it ever reaches R2, so the
// catalogue's picture-frame treatment (square, cream backdrop, breathing
// room around the product) is guaranteed regardless of what aspect ratio or
// crop the admin uploads — the .image-wrap CSS frame only supplies the
// border; this is what makes the backdrop and margins consistent too.
// Runs entirely client-side (Canvas API) because the deployed API route
// runs on the Cloudflare Workers runtime, which can't load native/WASM
// image libraries like sharp.
const CANVAS_SIZE = 1400;
const INNER_RATIO = 0.86;
const CREAM = "#f3f0ea";
const JPEG_QUALITY = 0.92;

export async function normalizeProductImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  try {
    const canvas = document.createElement("canvas");
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Couldn't process that image.");

    ctx.fillStyle = CREAM;
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);

    const inner = CANVAS_SIZE * INNER_RATIO;
    const scale = Math.min(inner / bitmap.width, inner / bitmap.height);
    const width = bitmap.width * scale;
    const height = bitmap.height * scale;
    ctx.drawImage(bitmap, (CANVAS_SIZE - width) / 2, (CANVAS_SIZE - height) / 2, width, height);

    return await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error("Couldn't process that image."))),
        "image/jpeg",
        JPEG_QUALITY
      );
    });
  } finally {
    bitmap.close();
  }
}
