import "server-only";

export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024;

const SIGNATURES: { mime: string; ext: string; test: (b: Uint8Array) => boolean }[] = [
  { mime: "image/png", ext: "png", test: (b) => b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47 },
  { mime: "image/jpeg", ext: "jpg", test: (b) => b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff },
  { mime: "image/gif", ext: "gif", test: (b) => b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38 },
  {
    mime: "image/webp",
    ext: "webp",
    test: (b) => b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50,
  },
  {
    mime: "image/avif",
    ext: "avif",
    test: (b) => String.fromCharCode(...b.slice(4, 12)) === "ftypavif" || String.fromCharCode(...b.slice(4, 12)) === "ftypavis",
  },
];

/** Detect the real image type from its bytes. The browser-supplied MIME type is never trusted. */
export function sniffImage(bytes: Uint8Array) {
  return SIGNATURES.find((s) => bytes.length > 12 && s.test(bytes)) ?? null;
}

/** Read pixel dimensions for PNG, GIF, WebP and JPEG without any native dependencies. */
export function imageSize(b: Uint8Array, mime: string): { width: number; height: number } | null {
  const view = new DataView(b.buffer, b.byteOffset, b.byteLength);
  try {
    if (mime === "image/png") return { width: view.getUint32(16), height: view.getUint32(20) };
    if (mime === "image/gif") return { width: view.getUint16(6, true), height: view.getUint16(8, true) };
    if (mime === "image/webp") {
      const chunk = String.fromCharCode(...b.slice(12, 16));
      if (chunk === "VP8 ") return { width: view.getUint16(26, true) & 0x3fff, height: view.getUint16(28, true) & 0x3fff };
      if (chunk === "VP8L") {
        const bits = view.getUint32(21, true);
        return { width: (bits & 0x3fff) + 1, height: ((bits >> 14) & 0x3fff) + 1 };
      }
      if (chunk === "VP8X") {
        const w = 1 + (b[24] | (b[25] << 8) | (b[26] << 16));
        const h = 1 + (b[27] | (b[28] << 8) | (b[29] << 16));
        return { width: w, height: h };
      }
    }
    if (mime === "image/jpeg") {
      let offset = 2;
      while (offset < b.length) {
        if (b[offset] !== 0xff) return null;
        const marker = b[offset + 1];
        const length = view.getUint16(offset + 2);
        if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
          return { height: view.getUint16(offset + 5), width: view.getUint16(offset + 7) };
        }
        offset += 2 + length;
      }
    }
  } catch {}
  return null;
}

export function mediaUrl(id: string) {
  return `/api/media/${id}`;
}

export { isAllowedImageRef } from "./image-ref";
