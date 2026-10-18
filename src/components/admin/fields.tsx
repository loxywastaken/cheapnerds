"use client";

import { LoaderCircle } from "lucide-react";
import { useId, type ComponentProps, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useFieldError, useFormPending } from "./action-form";

export const inputClass =
  "w-full rounded-xl border border-line bg-ink/60 px-3.5 py-2.5 text-sm text-white placeholder:text-subtle transition-[border-color,box-shadow] focus:border-violet/60 focus:outline-none focus:ring-4 focus:ring-violet/15 aria-[invalid=true]:border-danger/60 disabled:opacity-60";

export function Field({
  label,
  name,
  hint,
  children,
  className,
}: {
  label: string;
  name: string;
  hint?: ReactNode;
  className?: string;
  children: (props: { id: string; name: string; "aria-invalid"?: boolean; "aria-describedby"?: string }) => ReactNode;
}) {
  const id = useId();
  const error = useFieldError(name);
  const describedBy = error ? `${id}-error` : hint ? `${id}-hint` : undefined;
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={id} className="block text-sm font-medium text-fg">
        {label}
      </label>
      {children({ id, name, "aria-invalid": error ? true : undefined, "aria-describedby": describedBy })}
      {error ? (
        <p id={`${id}-error`} className="text-xs text-danger">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="text-xs text-subtle">
            {hint}
          </p>
        )
      )}
    </div>
  );
}

export function TextField({ label, name, hint, className, ...props }: { label: string; name: string; hint?: ReactNode } & ComponentProps<"input">) {
  return (
    <Field label={label} name={name} hint={hint} className={className}>
      {(p) => <input {...p} {...props} className={inputClass} />}
    </Field>
  );
}

export function TextArea({ label, name, hint, className, ...props }: { label: string; name: string; hint?: ReactNode } & ComponentProps<"textarea">) {
  return (
    <Field label={label} name={name} hint={hint} className={className}>
      {(p) => <textarea {...p} {...props} className={cn(inputClass, "min-h-24 resize-y leading-relaxed")} />}
    </Field>
  );
}

export function SelectField({
  label,
  name,
  hint,
  options,
  className,
  ...props
}: { label: string; name: string; hint?: ReactNode; options: { value: string; label: string }[] } & ComponentProps<"select">) {
  return (
    <Field label={label} name={name} hint={hint} className={className}>
      {(p) => (
        <select {...p} {...props} className={cn(inputClass, "appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23a3a3b2%22 stroke-width=%222%22><path d=%22m6 9 6 6 6-6%22/></svg>')] bg-[length:16px] bg-[right_0.8rem_center] bg-no-repeat pr-10")}>
          {options.map((o) => (
            <option key={o.value} value={o.value} className="bg-surface-2">
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function Toggle({ label, name, description, defaultChecked }: { label: string; name: string; description?: string; defaultChecked?: boolean }) {
  const id = useId();
  return (
    <label htmlFor={id} className="flex cursor-pointer items-start justify-between gap-4 rounded-xl border border-line bg-ink/40 p-3.5 transition-colors hover:border-line-strong">
      <span>
        <span className="block text-sm font-medium text-fg">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-subtle">{description}</span>}
      </span>
      <span className="relative mt-0.5 inline-flex shrink-0">
        <input id={id} type="checkbox" name={name} defaultChecked={defaultChecked} className="peer sr-only" />
        <span className="h-6 w-10 rounded-full bg-surface-3 transition-colors peer-checked:bg-violet peer-focus-visible:ring-2 peer-focus-visible:ring-violet-soft" />
        <span className="absolute left-0.5 top-0.5 size-5 rounded-full bg-white shadow transition-transform peer-checked:translate-x-4" />
      </span>
    </label>
  );
}

export function CheckboxGroup({ label, name, options, defaultValue }: { label: string; name: string; options: { value: string; label: string }[]; defaultValue: string[] }) {
  return (
    <fieldset>
      <legend className="mb-1.5 text-sm font-medium text-fg">{label}</legend>
      <div className="flex flex-wrap gap-2">
        {options.map((o) => (
          <label key={o.value} className="cursor-pointer">
            <input type="checkbox" name={name} value={o.value} defaultChecked={defaultValue.includes(o.value)} className="peer sr-only" />
            <span className="inline-flex items-center rounded-full border border-line bg-ink/40 px-3.5 py-1.5 text-sm text-muted transition-colors peer-checked:border-violet/60 peer-checked:bg-violet/15 peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-violet-soft">
              {o.label}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function SubmitButton({ children, variant = "accent", className }: { children: ReactNode; variant?: "accent" | "primary" | "danger" | "secondary"; className?: string }) {
  const pending = useFormPending();
  return (
    <Button type="submit" variant={variant} disabled={pending} className={className} aria-busy={pending}>
      {pending && <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />}
      {children}
    </Button>
  );
}

export function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="panel p-5 sm:p-6">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-white">{title}</h2>
        {description && <p className="mt-1 text-sm text-muted">{description}</p>}
      </div>
      <div className="space-y-5">{children}</div>
    </section>
  );
}
