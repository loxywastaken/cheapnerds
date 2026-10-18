"use client";

import { useRouter } from "next/navigation";
import { useTransition, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import type { ActionState } from "@/lib/admin/forms";
import { cn } from "@/lib/utils";
import { useToast } from "./toast";

/** Runs a server action on click (optionally after a confirm prompt), then toasts and refreshes. */
export function ActionButton({
  action,
  children,
  confirm,
  className,
  title,
  redirectTo,
}: {
  action: () => Promise<ActionState>;
  children: ReactNode;
  confirm?: string;
  className?: string;
  title?: string;
  redirectTo?: string;
}) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();

  return (
    <button
      type="button"
      title={title}
      aria-label={title}
      disabled={pending}
      aria-busy={pending}
      className={cn("inline-flex items-center justify-center gap-1.5 disabled:opacity-50", className)}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        startTransition(async () => {
          const result = await action();
          if (result.message) toast(result.ok ? "success" : "error", result.message);
          if (result.ok) {
            if (redirectTo) router.push(redirectTo);
            router.refresh();
          }
        });
      }}
    >
      {pending ? <LoaderCircle className="size-3.5 animate-spin" aria-hidden="true" /> : null}
      {children}
    </button>
  );
}

/** Small on/off switch bound to a server action. */
export function ActionSwitch({ checked, onChange, label }: { checked: boolean; onChange: (value: boolean) => Promise<ActionState>; label: string }) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      title={label}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          const result = await onChange(!checked);
          if (!result.ok && result.message) toast("error", result.message);
          router.refresh();
        })
      }
      className={cn("relative inline-flex h-6 w-10 shrink-0 rounded-full transition-colors disabled:opacity-60", checked ? "bg-violet" : "bg-surface-3")}
    >
      <span className={cn("absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform", checked && "translate-x-4")} />
    </button>
  );
}

/** Inline <select> that saves immediately through a server action. */
export function ActionSelect({
  value,
  options,
  onChange,
  label,
}: {
  value: string;
  options: { value: string; label: string }[];
  onChange: (value: string) => Promise<ActionState>;
  label: string;
}) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();
  const router = useRouter();
  return (
    <select
      aria-label={label}
      value={value}
      disabled={pending}
      onChange={(e) => {
        const next = e.target.value;
        startTransition(async () => {
          const result = await onChange(next);
          if (result.message) toast(result.ok ? "success" : "error", result.message);
          router.refresh();
        });
      }}
      className="rounded-lg border border-line bg-ink/60 px-2.5 py-1.5 text-xs text-fg focus:border-violet/60 focus:outline-none disabled:opacity-60"
    >
      {options.map((o) => (
        <option key={o.value} value={o.value} className="bg-surface-2">
          {o.label}
        </option>
      ))}
    </select>
  );
}
