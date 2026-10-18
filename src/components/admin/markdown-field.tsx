"use client";

import { useId, useState } from "react";
import { Markdown } from "@/components/ui/markdown";
import { cn } from "@/lib/utils";
import { useFieldError } from "./action-form";
import { inputClass } from "./fields";

export function MarkdownField({
  label,
  name,
  defaultValue = "",
  hint,
  rows = 14,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  hint?: string;
  rows?: number;
  placeholder?: string;
}) {
  const [value, setValue] = useState(defaultValue);
  const [tab, setTab] = useState<"write" | "preview">("write");
  const id = useId();
  const error = useFieldError(name);

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="text-sm font-medium text-fg">
          {label}
        </label>
        <div role="tablist" className="flex rounded-lg border border-line bg-ink/40 p-0.5 text-xs">
          {(["write", "preview"] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn("rounded-md px-3 py-1 capitalize transition-colors", tab === t ? "bg-white/10 text-white" : "text-muted hover:text-white")}
            >
              {t}
            </button>
          ))}
        </div>
      </div>
      <textarea
        id={id}
        name={name}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        aria-invalid={error ? true : undefined}
        className={cn(inputClass, "resize-y font-mono text-[0.83rem] leading-relaxed", tab === "preview" && "hidden")}
      />
      {tab === "preview" && (
        <div className="min-h-40 rounded-xl border border-line bg-ink/40 p-5">
          {value.trim() ? <Markdown className="!text-[0.95rem]">{value}</Markdown> : <p className="text-sm text-subtle">Nothing to preview yet.</p>}
        </div>
      )}
      {error ? (
        <p className="text-xs text-danger">{error}</p>
      ) : (
        <p className="text-xs text-subtle">{hint ?? "Supports Markdown: ## headings, **bold**, _italic_, [links](https://…), lists, > quotes and ![images](/api/media/…)."}</p>
      )}
    </div>
  );
}
