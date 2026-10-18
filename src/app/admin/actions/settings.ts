"use server";

import { db } from "@/db";
import { settings } from "@/db/schema";
import { failure, fromZodError, handleActionError, success, type ActionState } from "@/lib/admin/forms";
import { assertAdmin } from "@/lib/auth/session";
import { parseGroupId } from "@/lib/roblox";
import { parseInviteCode } from "@/lib/discord";
import { refresh } from "@/lib/revalidate";
import { settingsSchema } from "@/lib/settings";

export async function saveSettings(_prev: ActionState, formData: FormData): Promise<ActionState> {
  try {
    await assertAdmin();
    const raw = formData.get("payload");
    if (typeof raw !== "string" || raw.length > 100_000) return failure("Invalid settings payload.");
    let json: unknown;
    try {
      json = JSON.parse(raw);
    } catch {
      return failure("Invalid settings payload.");
    }
    const parsed = settingsSchema.safeParse(json);
    if (!parsed.success) return fromZodError(parsed.error);
    const value = parsed.data;

    // Accept a full group URL in the ID field and keep the ID / link in sync.
    const groupId = parseGroupId(value.roblox.groupId) ?? (value.roblox.groupId ? null : "");
    if (groupId === null) return failure("Invalid Roblox group ID.", { "roblox.groupId": "Use the numeric group ID" });
    value.roblox.groupId = groupId;
    if (!value.roblox.groupUrl && groupId) value.roblox.groupUrl = `https://www.roblox.com/communities/${groupId}`;

    if (value.discord.inviteUrl && !parseInviteCode(value.discord.inviteUrl)) {
      return failure("That isn't a Discord invite link.", { "discord.inviteUrl": "Use a discord.gg/… invite link" });
    }

    await db
      .insert(settings)
      .values({ key: "site", value })
      .onConflictDoUpdate({ target: settings.key, set: { value, updatedAt: new Date() } });
    refresh("settings", "roblox", "discord");
    return success("Settings saved.");
  } catch (err) {
    return handleActionError(err);
  }
}
