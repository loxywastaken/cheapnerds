const MEDIA_PATH = /^\/api\/media\/[0-9a-f-]{36}$/;
const BRAND_PATH = /^\/brand\/[\w.-]+$/;
const ALLOWED_REMOTE_HOSTS = /(^|\.)rbxcdn\.com$/;

/**
 * Image references stored in content must be one of our uploaded media URLs, a file in
 * /brand, or an https Roblox CDN URL, so next/image can always optimise them safely.
 */
export function isAllowedImageRef(value: string) {
  if (MEDIA_PATH.test(value) || BRAND_PATH.test(value)) return true;
  try {
    const url = new URL(value);
    return url.protocol === "https:" && ALLOWED_REMOTE_HOSTS.test(url.hostname);
  } catch {
    return false;
  }
}
