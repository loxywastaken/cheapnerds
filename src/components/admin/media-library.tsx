"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { Check, Copy, ImagePlus, LoaderCircle, Trash2 } from "lucide-react";
import { useRef, useState, useTransition } from "react";
import { deleteMedia, uploadMedia } from "@/app/admin/actions/media";
import { formatDate } from "@/lib/utils";
import { ActionButton } from "./action-button";
import { useToast } from "./toast";

type Item = { id: string; filename: string; size: number; width: number | null; height: number | null; createdAt: Date };

export function MediaUploader() {
  const [pending, startTransition] = useTransition();
  const [dragging, setDragging] = useState(false);
  const ref = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const router = useRouter();

  function upload(files: FileList | null) {
    const list = Array.from(files ?? []);
    if (!list.length) return;
    startTransition(async () => {
      let done = 0;
      for (const file of list) {
        const fd = new FormData();
        fd.set("file", file);
        const result = await uploadMedia(fd);
        if (result.ok) done++;
        else toast("error", `${file.name}: ${result.message}`);
      }
      if (done) toast("success", `Uploaded ${done} image${done === 1 ? "" : "s"}.`);
      router.refresh();
    });
  }

  return (
    <>
      <button
        type="button"
        onClick={() => ref.current?.click()}
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
        disabled={pending}
        className={`flex w-full flex-col items-center justify-center gap-2 rounded-3xl border border-dashed px-6 py-10 text-sm transition-colors ${dragging ? "border-violet-soft bg-violet/10 text-white" : "border-line-strong bg-surface text-muted hover:text-white"}`}
      >
        {pending ? <LoaderCircle className="size-6 animate-spin" /> : <ImagePlus className="size-6" />}
        <span>{pending ? "Uploading…" : "Click or drop images to upload"}</span>
        <span className="text-xs text-subtle">PNG, JPG, WebP, GIF, AVIF · up to 4 MB each</span>
      </button>
      <input
        ref={ref}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        className="sr-only"
        tabIndex={-1}
        onChange={(e) => {
          upload(e.target.files);
          e.target.value = "";
        }}
      />
    </>
  );
}

export function MediaGrid({ items }: { items: Item[] }) {
  const [copied, setCopied] = useState<string | null>(null);
  return (
    <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {items.map((item) => {
        const url = `/api/media/${item.id}`;
        return (
          <li key={item.id} className="panel overflow-hidden">
            <div className="relative aspect-video bg-[repeating-conic-gradient(#16161e_0_25%,#1d1d28_0_50%)] bg-[length:16px_16px]">
              <Image src={url} alt={item.filename} fill sizes="280px" className="object-contain" />
            </div>
            <div className="p-3">
              <p className="truncate text-xs text-white" title={item.filename}>
                {item.filename}
              </p>
              <p className="mt-0.5 text-[0.7rem] text-subtle">
                {item.width && item.height ? `${item.width}×${item.height} · ` : ""}
                {(item.size / 1024).toFixed(0)} KB · {formatDate(item.createdAt)}
              </p>
              <div className="mt-2 flex gap-1">
                <button
                  type="button"
                  onClick={async () => {
                    await navigator.clipboard.writeText(url);
                    setCopied(item.id);
                    setTimeout(() => setCopied(null), 1500);
                  }}
                  className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-white/[0.06] px-2 py-1.5 text-xs text-fg hover:bg-white/10"
                >
                  {copied === item.id ? <Check className="size-3.5 text-ok" /> : <Copy className="size-3.5" />}
                  {copied === item.id ? "Copied" : "Copy URL"}
                </button>
                <ActionButton
                  action={deleteMedia.bind(null, item.id)}
                  confirm="Delete this image? It can't be recovered."
                  title="Delete image"
                  className="grid size-8 place-items-center rounded-lg text-muted hover:bg-danger/15 hover:text-danger"
                >
                  <Trash2 className="size-3.5" />
                </ActionButton>
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
