"use client";

import { ArrowDown, ArrowUp, Plus, Save, Trash2 } from "lucide-react";
import { useState, type ChangeEvent } from "react";
import { saveSettings } from "@/app/admin/actions/settings";
import type { FeatureItem, SiteSettings } from "@/lib/settings";
import { cn } from "@/lib/utils";
import { ActionForm, useFieldError } from "./action-form";
import { FormSection, SubmitButton, inputClass } from "./fields";
import { ImageField } from "./image-field";

type Path = string;

function getAt(obj: unknown, path: Path): unknown {
  return path.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

function setAt<T>(obj: T, path: Path, value: unknown): T {
  const [head, ...rest] = path.split(".");
  const source = (obj ?? {}) as Record<string, unknown>;
  return { ...source, [head]: rest.length ? setAt(source[head], rest.join("."), value) : value } as T;
}

export function SettingsForm({ initial, games }: { initial: SiteSettings; games: { id: string; name: string }[] }) {
  const [settings, setSettings] = useState(initial);
  const update = (path: Path, value: unknown) => setSettings((s) => setAt(s, path, value));
  const text = (path: Path) => ({
    name: path,
    value: String(getAt(settings, path) ?? ""),
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => update(path, e.target.value),
  });

  return (
    <ActionForm action={saveSettings} className="space-y-6">
      <input type="hidden" name="payload" value={JSON.stringify(settings)} />

      <FormSection title="General" description="Site name and the description used by search engines and link previews.">
        <Row label="Site name" path="siteName">
          <input {...text("siteName")} className={inputClass} maxLength={60} />
        </Row>
        <Row label="Site description" path="siteDescription">
          <textarea {...text("siteDescription")} className={cn(inputClass, "min-h-20")} maxLength={300} />
        </Row>
      </FormSection>

      <FormSection title="Homepage" description="The hero at the top of the homepage and the studio introduction.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Row label="Featured game in hero" path="hero.featuredGameId" hint="Defaults to the first featured game.">
            <select {...text("hero.featuredGameId")} className={inputClass}>
              <option value="">Automatic</option>
              {games.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </Row>
        </div>
        <Row label="Heading" path="hero.title" hint="The site name inside the heading is highlighted automatically.">
          <input {...text("hero.title")} className={inputClass} maxLength={80} />
        </Row>
        <Row label="Subtitle" path="hero.subtitle">
          <textarea {...text("hero.subtitle")} className={cn(inputClass, "min-h-20")} maxLength={240} />
        </Row>
        <Row label="Studio section heading" path="about.title">
          <input {...text("about.title")} className={inputClass} maxLength={80} />
        </Row>
        <Row label="Studio section text" path="about.body">
          <textarea {...text("about.body")} className={cn(inputClass, "min-h-28")} maxLength={800} />
        </Row>
      </FormSection>

      <FormSection title="Branding" description="The square logo badge shown next to the wordmark in the header and footer. Leave empty to use the built-in Cheap Nerds logo.">
        <div className="max-w-[12rem]">
          <ImageField label="Logo (square)" name="branding.logoUrl" defaultValue={settings.branding.logoUrl} aspect="aspect-square" onChange={(v) => update("branding.logoUrl", v)} />
        </div>
      </FormSection>

      <FormSection title="Roblox group" description="Name, icon and member count load live from Roblox using the group ID.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Row label="Group ID" path="roblox.groupId" hint="The number in roblox.com/communities/<id>/…">
            <input {...text("roblox.groupId")} className={inputClass} inputMode="numeric" />
          </Row>
          <Row label="Join group link" path="roblox.groupUrl">
            <input {...text("roblox.groupUrl")} className={inputClass} type="url" />
          </Row>
        </div>
        <Row label="Description override" path="roblox.descriptionOverride" hint="Leave empty to use the group's description from Roblox.">
          <textarea {...text("roblox.descriptionOverride")} className={cn(inputClass, "min-h-20")} maxLength={1000} />
        </Row>
        <div className="max-w-xl">
          <ImageField label="Group banner" name="roblox.bannerUrl" defaultValue={settings.roblox.bannerUrl} aspect="aspect-[4/1]" onChange={(v) => update("roblox.bannerUrl", v)} hint="Wide image shown behind the group card. Roblox doesn't provide banners via its API." />
        </div>
        <FeatureListEditor label="Reasons to join" path="roblox.reasons" items={settings.roblox.reasons} onChange={(items) => update("roblox.reasons", items)} />
      </FormSection>

      <FormSection title="Discord" description="Server name, icon and member counts load live from the invite link.">
        <div className="grid gap-5 sm:grid-cols-2">
          <Row label="Invite link" path="discord.inviteUrl" hint="Use a permanent invite (never expires).">
            <input {...text("discord.inviteUrl")} className={inputClass} type="url" placeholder="https://discord.gg/…" />
          </Row>
          <Row label="Rules link" path="discord.rulesUrl" hint="Optional. Shown as a “Server rules” button.">
            <input {...text("discord.rulesUrl")} className={inputClass} type="url" placeholder="https://…" />
          </Row>
        </div>
        <Row label="Server description" path="discord.description">
          <textarea {...text("discord.description")} className={cn(inputClass, "min-h-20")} maxLength={600} />
        </Row>
        <FeatureListEditor label="Community benefits" path="discord.benefits" items={settings.discord.benefits} onChange={(items) => update("discord.benefits", items)} />
      </FormSection>

      <FormSection title="Social links" description="Shown in the footer. Leave empty to hide.">
        <div className="grid gap-5 sm:grid-cols-2">
          {(["youtube", "x", "tiktok", "github"] as const).map((key) => (
            <Row key={key} label={{ youtube: "YouTube", x: "X (Twitter)", tiktok: "TikTok", github: "GitHub" }[key]} path={`socials.${key}`}>
              <input {...text(`socials.${key}`)} className={inputClass} type="url" placeholder="https://…" />
            </Row>
          ))}
        </div>
      </FormSection>

      <FormSection title="Announcement bar" description="A slim banner above the navigation on every page.">
        <Check label="Show announcement bar" checked={settings.announcement.enabled} onChange={(v) => update("announcement.enabled", v)} />
        <div className="grid gap-5 sm:grid-cols-[2fr_1fr]">
          <Row label="Text" path="announcement.text">
            <input {...text("announcement.text")} className={inputClass} maxLength={140} placeholder="Winter update is live!" />
          </Row>
          <Row label="Link (optional)" path="announcement.href">
            <input {...text("announcement.href")} className={inputClass} placeholder="/updates/winter-update" />
          </Row>
        </div>
      </FormSection>

      <FormSection title="Analytics">
        <Check
          label="Collect anonymous page views"
          description="No cookies or personal data. Visitors who send Do Not Track or Global Privacy Control are never counted."
          checked={settings.analytics.enabled}
          onChange={(v) => update("analytics.enabled", v)}
        />
      </FormSection>

      <div className="sticky bottom-4 z-10 flex justify-end">
        <SubmitButton className="shadow-2xl shadow-black/60">
          <Save className="size-4" aria-hidden="true" /> Save settings
        </SubmitButton>
      </div>
    </ActionForm>
  );
}

function Row({ label, path, hint, children }: { label: string; path: string; hint?: string; children: React.ReactNode }) {
  const error = useFieldError(path);
  return (
    <label className="block space-y-1.5">
      <span className="block text-sm font-medium text-fg">{label}</span>
      {children}
      {error ? <span className="block text-xs text-danger">{error}</span> : hint && <span className="block text-xs text-subtle">{hint}</span>}
    </label>
  );
}

function Check({ label, description, checked, onChange }: { label: string; description?: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-line bg-ink/40 p-3.5">
      <span>
        <span className="block text-sm font-medium text-fg">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-subtle">{description}</span>}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="peer sr-only" />
        <span className="h-6 w-10 rounded-full bg-surface-3 transition-colors peer-checked:bg-brand peer-focus-visible:ring-2 peer-focus-visible:ring-brand-soft" />
        <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  );
}

function FeatureListEditor({ label, path, items, onChange }: { label: string; path: string; items: FeatureItem[]; onChange: (items: FeatureItem[]) => void }) {
  const error = useFieldError(path);
  const set = (i: number, patch: Partial<FeatureItem>) => onChange(items.map((item, j) => (j === i ? { ...item, ...patch } : item)));
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const copy = [...items];
    [copy[i], copy[j]] = [copy[j], copy[i]];
    onChange(copy);
  };
  return (
    <fieldset className="space-y-3">
      <legend className="text-sm font-medium text-fg">{label}</legend>
      {error && <p className="text-xs text-danger">{error}</p>}
      {items.map((item, i) => {
        return (
          <div key={i} className="grid gap-3 rounded-2xl border border-line bg-ink/30 p-3 sm:grid-cols-[1fr_auto]">
            <div className="space-y-2">
              <input aria-label="Title" name={`${path}.${i}.title`} value={item.title} onChange={(e) => set(i, { title: e.target.value })} className={cn(inputClass, "py-2")} placeholder="e.g. Get into playtests early" maxLength={80} />
              <input aria-label="Description" value={item.body} onChange={(e) => set(i, { body: e.target.value })} className={cn(inputClass, "py-2")} placeholder="Optional extra detail" maxLength={240} />
            </div>
            <div className="flex gap-1 sm:flex-col">
              <SmallBtn label="Move up" onClick={() => move(i, -1)} disabled={i === 0}>
                <ArrowUp className="size-3.5" />
              </SmallBtn>
              <SmallBtn label="Move down" onClick={() => move(i, 1)} disabled={i === items.length - 1}>
                <ArrowDown className="size-3.5" />
              </SmallBtn>
              <SmallBtn label="Remove" onClick={() => onChange(items.filter((_, j) => j !== i))} danger>
                <Trash2 className="size-3.5" />
              </SmallBtn>
            </div>
          </div>
        );
      })}
      {items.length < 8 && (
        <button
          type="button"
          onClick={() => onChange([...items, { title: "", body: "" }])}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/[0.06] px-3.5 py-2 text-sm text-white hover:bg-white/10"
        >
          <Plus className="size-4" aria-hidden="true" /> Add item
        </button>
      )}
    </fieldset>
  );
}

function SmallBtn({ children, label, onClick, disabled, danger }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn("grid size-8 place-items-center rounded-lg disabled:opacity-30", danger ? "text-muted hover:bg-danger/15 hover:text-danger" : "text-muted hover:bg-white/10 hover:text-white")}
    >
      {children}
    </button>
  );
}
