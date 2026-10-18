"use client";

import Image from "next/image";
import { ArrowDown, ArrowUp, ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { useId, useRef, useState, useTransition } from "react";
import { uploadMedia } from "@/app/admin/actions/media";
import { isAllowedImageRef } from "@/lib/image-ref";
import { cn } from "@/lib/utils";
import { useFieldError } from "./action-form";
import { useToast } from "./toast";

const MAX_BYTES = 4 * 1024 * 1024;
const ACCEPT = "image/png,image/jpeg,image/webp,image/gif,image/avif";

function useUploader(onUploaded: (url: string) => void) {
  const [pending, startTransition] = useTransition();
  const toast = useToast();

  function upload(files: FileList | File[] | null) {
    const list = Array.from(files ?? []);
    if (list.length === 0) return;
    startTransition(async () => {
      for (const file of list) {
        if (file.size > MAX_BYTES) {
          toast("error", `${file.name} is larger than 4 MB.`);
          continue;
        }
        const fd = new FormData();
        fd.set("file", file);
        const result = await uploadMedia(fd);
        if (result.ok && typeof result.data?.url === "string") onUploaded(result.data.url);
        else toast("error", result.message ?? "Upload failed.");
      }
    });
  }
  return { pending, upload };
}

/** Single image picker: upload, preview, replace or remove. Submits its URL as a hidden input. */
export function ImageField({
  label,
  name,
  defaultValue,
  hint,
  aspect = "aspect-video",
  onChange,
}: {
  label: string;
  name: string;
  defaultValue?: string | null;
  hint?: string;
  aspect?: string;
  onChange?: (value: string) => void;
}) {
  const [value, setValueState] = useState(defaultValue ?? "");
  const setValue = (next: string) => {
    setValueState(next);
    onChange?.(next);
  };
  const [dragging, setDragging] = useState(false);
  const inputId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const error = useFieldError(name);
  const { pending, upload } = useUploader(setValue);

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-fg">{label}</p>
      <input type="hidden" name={name} value={value} />
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          upload(e.dataTransfer.files);
        }}
        className={cn(
          "relative overflow-hidden rounded-2xl border border-dashed bg-ink/40 transition-colors",
          aspect,
          dragging ? "border-violet-soft bg-violet/10" : error ? "border-danger/60" : "border-line-strong",
        )}
      >
        {value && isAllowedImageRef(value) ? (
          <>
            <Image src={value} alt="" fill sizes="400px" className="object-cover" />
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-ink/90 to-transparent p-2.5">
              <button type="button" onClick={() => fileRef.current?.click()} className="rounded-lg bg-white/15 px-3 py-1.5 text-xs text-white backdrop-blur hover:bg-white/25">
                Replace
              </button>
              <button type="button" onClick={() => setValue("")} className="rounded-lg bg-danger/20 px-3 py-1.5 text-xs text-danger backdrop-blur hover:bg-danger/30">
                Remove
              </button>
            </div>
          </>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-muted hover:text-white"
          >
            <ImagePlus className="size-6" aria-hidden="true" />
            <span>Click or drop an image</span>
            <span className="text-xs text-subtle">PNG, JPG, WebP, GIF · max 4 MB</span>
          </button>
        )}
        {pending && (
          <div className="absolute inset-0 grid place-items-center bg-ink/70 backdrop-blur-sm">
            <LoaderCircle className="size-6 animate-spin text-white" aria-label="Uploading" />
          </div>
        )}
      </div>
      <input
        ref={fileRef}
        id={inputId}
        type="file"
        accept={ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-label={`Upload ${label}`}
        onChange={(e) => {
          upload(e.target.files);
          e.target.value = "";
        }}
      />
      {error ? <p className="text-xs text-danger">{error}</p> : hint && <p className="text-xs text-subtle">{hint}</p>}
    </div>
  );
}

/** Ordered list of images (screenshots / project gallery). */
export function GalleryField({ label, name, defaultValue, hint }: { label: string; name: string; defaultValue: string[]; hint?: string }) {
  const [items, setItems] = useState<string[]>(defaultValue);
  const fileRef = useRef<HTMLInputElement>(null);
  const error = useFieldError(name);
  const { pending, upload } = useUploader((url) => setItems((list) => [...list, url]));

  const move = (from: number, to: number) =>
    setItems((list) => {
      if (to < 0 || to >= list.length) return list;
      const copy = [...list];
      const [item] = copy.splice(from, 1);
      copy.splice(to, 0, item);
      return copy;
    });

  return (
    <div className="space-y-1.5">
      <p className="text-sm font-medium text-fg">{label}</p>
      {items.map((url) => (
        <input key={url} type="hidden" name={name} value={url} />
      ))}
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {items.map((url, i) => (
          <li key={url} className="group relative aspect-video overflow-hidden rounded-xl border border-line bg-ink/40">
            {isAllowedImageRef(url) && <Image src={url} alt="" fill sizes="240px" className="object-cover" />}
            <span className="absolute left-2 top-2 rounded-md bg-ink/70 px-1.5 py-0.5 font-mono text-[0.65rem] text-white">{i + 1}</span>
            <div className="absolute inset-x-0 bottom-0 flex justify-end gap-1 bg-gradient-to-t from-ink/90 to-transparent p-1.5">
              <IconBtn label="Move earlier" onClick={() => move(i, i - 1)} disabled={i === 0}>
                <ArrowUp className="size-3.5 -rotate-90" />
              </IconBtn>
              <IconBtn label="Move later" onClick={() => move(i, i + 1)} disabled={i === items.length - 1}>
                <ArrowDown className="size-3.5 -rotate-90" />
              </IconBtn>
              <IconBtn label="Remove image" onClick={() => setItems((list) => list.filter((x) => x !== url))} danger>
                <Trash2 className="size-3.5" />
              </IconBtn>
            </div>
          </li>
        ))}
        <li>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              upload(e.dataTransfer.files);
            }}
            disabled={pending}
            className="flex aspect-video w-full flex-col items-center justify-center gap-1.5 rounded-xl border border-dashed border-line-strong bg-ink/40 text-xs text-muted transition-colors hover:border-violet-soft hover:text-white"
          >
            {pending ? <LoaderCircle className="size-5 animate-spin" /> : <ImagePlus className="size-5" />}
            {pending ? "Uploading…" : "Add images"}
          </button>
        </li>
      </ul>
      <input
        ref={fileRef}
        type="file"
        accept={ACCEPT}
        multiple
        className="sr-only"
        tabIndex={-1}
        aria-label={`Upload ${label}`}
        onChange={(e) => {
          upload(e.target.files);
          e.target.value = "";
        }}
      />
      {error ? <p className="text-xs text-danger">{error}</p> : hint && <p className="text-xs text-subtle">{hint}</p>}
    </div>
  );
}

function IconBtn({ children, label, onClick, disabled, danger }: { children: React.ReactNode; label: string; onClick: () => void; disabled?: boolean; danger?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className={cn("grid size-7 place-items-center rounded-md backdrop-blur disabled:opacity-30", danger ? "bg-danger/25 text-danger hover:bg-danger/40" : "bg-white/15 text-white hover:bg-white/25")}
    >
      {children}
    </button>
  );
}
