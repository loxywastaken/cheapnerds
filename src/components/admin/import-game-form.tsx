"use client";

import { Download } from "lucide-react";
import { importGame } from "@/app/admin/actions/games";
import { ActionForm } from "./action-form";
import { SubmitButton, TextField, Toggle } from "./fields";

export function ImportGameForm({ defaultUrl = "", compact = false }: { defaultUrl?: string; compact?: boolean }) {
  if (compact) {
    return (
      <ActionForm action={importGame}>
        <input type="hidden" name="url" value={defaultUrl} />
        <input type="hidden" name="publish" value="on" />
        <SubmitButton variant="secondary" className="!h-8 !px-3 !text-xs">
          <Download className="size-3.5" aria-hidden="true" /> Add
        </SubmitButton>
      </ActionForm>
    );
  }
  return (
    <ActionForm action={importGame} className="space-y-4">
      <TextField label="Roblox game link" name="url" defaultValue={defaultUrl} placeholder="https://www.roblox.com/games/136197477499761/…" required />
      <Toggle label="Publish immediately" name="publish" description="Otherwise it's saved as a hidden draft." defaultChecked />
      <SubmitButton>
        <Download className="size-4" aria-hidden="true" /> Import from Roblox
      </SubmitButton>
    </ActionForm>
  );
}
