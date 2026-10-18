import "server-only";
import { updateTag } from "next/cache";
import { CACHE_TAGS } from "./constants";

type Tag = keyof typeof CACHE_TAGS;

/** Call from Server Actions after a mutation so the public site shows the change immediately. */
export function refresh(...tags: Tag[]) {
  for (const tag of tags) updateTag(CACHE_TAGS[tag]);
}
