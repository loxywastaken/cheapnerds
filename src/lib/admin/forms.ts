import "server-only";
import { z } from "zod";
import { isAllowedImageRef } from "@/lib/image-ref";
import { UnauthorizedError } from "@/lib/auth/session";

export type ActionState = {
  ok: boolean;
  message?: string;
  errors?: Record<string, string>;
  /** Changes on every submission so clients can react (e.g. show a toast) even if the message repeats. */
  at?: number;
  data?: Record<string, unknown>;
};

export const initialState: ActionState = { ok: false };

export function success(message: string, data?: Record<string, unknown>): ActionState {
  return { ok: true, message, at: Date.now(), data };
}

export function failure(message: string, errors?: Record<string, string>): ActionState {
  return { ok: false, message, errors, at: Date.now() };
}

export function fromZodError(error: z.ZodError): ActionState {
  const errors: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join(".");
    if (!errors[key]) errors[key] = issue.message;
  }
  return failure("Please fix the highlighted fields.", errors);
}

/** Convert thrown errors into a safe message; never leak internals to the browser. */
export function handleActionError(err: unknown): ActionState {
  if (err instanceof UnauthorizedError) return failure(err.message);
  if (err && typeof err === "object" && "digest" in err) throw err; // let redirect()/notFound() through
  const code = (err as { code?: string; cause?: { code?: string } })?.code ?? (err as { cause?: { code?: string } })?.cause?.code;
  if (code === "23505") return failure("Something with that URL slug already exists. Choose a different slug.", { slug: "Already in use" });
  console.error("[admin action]", err);
  return failure(err instanceof Error && err.message.length < 160 ? err.message : "Something went wrong. Please try again.");
}

/* ---------- FormData field helpers ---------- */

export const str = (fd: FormData, key: string) => {
  const v = fd.get(key);
  return typeof v === "string" ? v.trim() : "";
};
export const bool = (fd: FormData, key: string) => fd.get(key) === "on" || fd.get(key) === "true";
export const list = (fd: FormData, key: string) =>
  fd
    .getAll(key)
    .flatMap((v) => (typeof v === "string" ? v.split(/\n/) : []))
    .map((v) => v.trim())
    .filter(Boolean);
export const tags = (fd: FormData, key: string) =>
  [...new Set(str(fd, key).split(",").map((t) => t.trim()).filter(Boolean))].slice(0, 20);

/* ---------- Shared schemas ---------- */

export const slugSchema = z
  .string()
  .trim()
  .min(1, "Required")
  .max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers and dashes");

export const imageRef = z
  .string()
  .refine(isAllowedImageRef, "Upload the image, or use a Roblox CDN (rbxcdn.com) URL");

export const optionalImageRef = z.union([z.literal(""), imageRef]).transform((v) => v || null);

export const optionalHttpUrl = z
  .union([z.literal(""), z.url({ protocol: /^https?$/, message: "Must be a valid http(s) URL" })])
  .transform((v) => v || null);

export const optionalDate = z
  .string()
  .transform((v, ctx) => {
    if (!v) return null;
    const d = new Date(v);
    if (Number.isNaN(d.getTime())) {
      ctx.addIssue({ code: "custom", message: "Invalid date" });
      return z.NEVER;
    }
    return d;
  });
