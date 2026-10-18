"use client";

import Link from "next/link";
import { ExternalLink, Save } from "lucide-react";
import { saveGame } from "@/app/admin/actions/games";
import type { Game } from "@/db/schema";
import { GAME_STATUSES, GAME_STATUS_LABELS, PLATFORMS, PLATFORM_LABELS } from "@/lib/constants";
import { ActionForm } from "./action-form";
import { CheckboxGroup, FormSection, SelectField, SubmitButton, TextField, Toggle } from "./fields";
import { GalleryField, ImageField } from "./image-field";
import { MarkdownField } from "./markdown-field";

const dateInput = (d: Date | null | undefined) => (d ? new Date(d).toISOString().slice(0, 10) : "");

export function GameForm({ game }: { game?: Game }) {
  return (
    <ActionForm action={saveGame} className="grid gap-6 xl:grid-cols-[1fr_22rem]">
      {game && <input type="hidden" name="id" value={game.id} />}
      <div className="space-y-6">
        <FormSection title="Basics">
          <div className="grid gap-5 sm:grid-cols-2">
            <TextField label="Game name" name="name" defaultValue={game?.name} required maxLength={80} />
            <TextField label="URL slug" name="slug" defaultValue={game?.slug} placeholder="auto from name" maxLength={80} hint="cheapnerds.com/games/your-slug" />
          </div>
          <TextField label="Tagline" name="tagline" defaultValue={game?.tagline} maxLength={160} hint="One line shown on cards and link previews." />
          <TextField
            label="Roblox game link or place ID"
            name="placeId"
            defaultValue={game?.placeId ?? ""}
            placeholder="https://www.roblox.com/games/123456789/…"
            hint="Used for the Play button, live icon, thumbnails, stats and last-updated date."
          />
          <MarkdownField
            label="Description"
            name="description"
            defaultValue={game?.description}
            hint="Leave empty to show the description from Roblox. Supports Markdown."
          />
        </FormSection>

        <FormSection title="Images" description="Optional overrides. When empty, the game's live Roblox icon and thumbnails are used.">
          <div className="grid gap-5 sm:grid-cols-[12rem_1fr]">
            <ImageField label="Icon" name="iconUrl" defaultValue={game?.iconUrl} aspect="aspect-square" />
            <ImageField label="Main thumbnail" name="thumbnailUrl" defaultValue={game?.thumbnailUrl} />
          </div>
          <GalleryField label="Extra screenshots" name="screenshots" defaultValue={game?.screenshots ?? []} hint="Shown before Roblox thumbnails in the game page gallery." />
        </FormSection>
      </div>

      <div className="space-y-6">
        <FormSection title="Status & visibility">
          <SelectField
            label="Status"
            name="status"
            defaultValue={game?.status ?? "in_development"}
            options={GAME_STATUSES.map((s) => ({ value: s, label: GAME_STATUS_LABELS[s] }))}
          />
          <Toggle label="Published" name="published" description="Visible on the public site." defaultChecked={game?.published ?? true} />
          <Toggle label="Featured" name="featured" description="Highlighted on the homepage and games page." defaultChecked={game?.featured ?? false} />
          <Toggle label="Show live stats" name="showStats" description="Players, visits and favourites from Roblox." defaultChecked={game?.showStats ?? true} />
        </FormSection>
        <FormSection title="Details">
          <CheckboxGroup label="Platforms" name="platforms" defaultValue={game?.platforms ?? ["pc", "mobile", "tablet"]} options={PLATFORMS.map((p) => ({ value: p, label: PLATFORM_LABELS[p] }))} />
          <TextField label="Genre" name="genre" defaultValue={game?.genre} placeholder="e.g. Simulator" maxLength={40} />
          <TextField label="Release date" name="releaseDate" type="date" defaultValue={dateInput(game?.releaseDate)} />
          <TextField label="Sort order" name="sortOrder" type="number" defaultValue={game?.sortOrder ?? 0} hint="Lower numbers appear first." />
        </FormSection>
        <div className="flex flex-col gap-3 xl:sticky xl:top-6">
          <SubmitButton className="w-full">
            <Save className="size-4" aria-hidden="true" /> {game ? "Save changes" : "Create game"}
          </SubmitButton>
          {game?.published && (
            <Link href={`/games/${game.slug}`} target="_blank" className="inline-flex items-center justify-center gap-1.5 text-sm text-muted hover:text-white">
              View on site <ExternalLink className="size-3.5" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </ActionForm>
  );
}
