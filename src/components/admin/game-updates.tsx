"use client";

import { Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { deleteGameUpdate, saveGameUpdate } from "@/app/admin/actions/games";
import type { GameUpdate } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { ActionButton } from "./action-button";
import { ActionForm } from "./action-form";
import { SubmitButton, TextField } from "./fields";
import { MarkdownField } from "./markdown-field";

function UpdateForm({ gameId, update, onDone }: { gameId: string; update?: GameUpdate; onDone: () => void }) {
  return (
    <ActionForm action={saveGameUpdate} onSuccess={onDone} className="space-y-4 rounded-2xl border border-line bg-ink/40 p-4">
      <input type="hidden" name="gameId" value={gameId} />
      {update && <input type="hidden" name="id" value={update.id} />}
      <div className="grid gap-4 sm:grid-cols-[8rem_1fr_10rem]">
        <TextField label="Version" name="version" defaultValue={update?.version} placeholder="v1.2" maxLength={30} />
        <TextField label="Title" name="title" defaultValue={update?.title} placeholder="Winter update" required maxLength={120} />
        <TextField label="Date" name="publishedAt" type="date" defaultValue={update ? new Date(update.publishedAt).toISOString().slice(0, 10) : ""} />
      </div>
      <MarkdownField label="Patch notes" name="body" defaultValue={update?.body} rows={6} placeholder={"- Added new pets\n- Fixed a bug with…"} />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onDone} className="rounded-full px-4 py-2 text-sm text-muted hover:text-white">
          Cancel
        </button>
        <SubmitButton>{update ? "Save entry" : "Add entry"}</SubmitButton>
      </div>
    </ActionForm>
  );
}

export function GameUpdatesManager({ gameId, updates }: { gameId: string; updates: GameUpdate[] }) {
  const [editing, setEditing] = useState<string | "new" | null>(null);
  return (
    <section className="panel p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-white">Update log</h2>
          <p className="mt-1 text-sm text-muted">Patch notes shown on the game page.</p>
        </div>
        {editing !== "new" && (
          <button type="button" onClick={() => setEditing("new")} className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3.5 py-2 text-sm text-white hover:bg-white/10">
            <Plus className="size-4" aria-hidden="true" /> Add entry
          </button>
        )}
      </div>
      {editing === "new" && <UpdateForm gameId={gameId} onDone={() => setEditing(null)} />}
      {updates.length === 0 && editing !== "new" ? (
        <p className="text-sm text-subtle">No entries yet.</p>
      ) : (
        <ul className="mt-4 space-y-3">
          {updates.map((u) =>
            editing === u.id ? (
              <li key={u.id}>
                <UpdateForm gameId={gameId} update={u} onDone={() => setEditing(null)} />
              </li>
            ) : (
              <li key={u.id} className="flex items-start justify-between gap-4 rounded-2xl border border-line p-4">
                <div className="min-w-0">
                  <p className="text-xs text-subtle">
                    {u.version && <span className="mr-2 rounded bg-violet/15 px-1.5 py-0.5 font-mono text-violet-soft">{u.version}</span>}
                    {formatDate(u.publishedAt)}
                  </p>
                  <p className="mt-1 font-medium text-white">{u.title}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <button type="button" onClick={() => setEditing(u.id)} className="grid size-8 place-items-center rounded-lg text-muted hover:bg-white/10 hover:text-white" aria-label="Edit entry">
                    <Pencil className="size-4" />
                  </button>
                  <ActionButton
                    action={deleteGameUpdate.bind(null, u.id)}
                    confirm="Delete this update log entry?"
                    title="Delete entry"
                    className="grid size-8 place-items-center rounded-lg text-muted hover:bg-danger/15 hover:text-danger"
                  >
                    <Trash2 className="size-4" />
                  </ActionButton>
                </div>
              </li>
            ),
          )}
        </ul>
      )}
      {editing && editing !== "new" && (
        <button type="button" onClick={() => setEditing(null)} className="sr-only">
          <X /> Cancel editing
        </button>
      )}
    </section>
  );
}
