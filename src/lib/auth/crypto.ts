import "server-only";
import { createHash, createHmac, randomBytes } from "node:crypto";

export function randomToken(bytes = 32) {
  return randomBytes(bytes).toString("base64url");
}

export function sha256(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function secret() {
  const value = process.env.APP_SECRET;
  if (!value || value.length < 16) {
    if (process.env.NODE_ENV === "production") throw new Error("APP_SECRET must be set to a long random string.");
    return "insecure-development-secret";
  }
  return value;
}

/** Keyed hash so stored IPs / visitor IDs can't be reversed or correlated without the secret. */
export function hmac(value: string) {
  return createHmac("sha256", secret()).update(value).digest("hex");
}
