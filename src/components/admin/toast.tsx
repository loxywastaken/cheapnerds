"use client";

import { AnimatePresence, motion } from "motion/react";
import { CircleAlert, CircleCheck, X } from "lucide-react";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";

type Toast = { id: number; kind: "success" | "error"; message: string };
const ToastContext = createContext<(kind: Toast["kind"], message: string) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);
  const push = useCallback(
    (kind: Toast["kind"], message: string) => {
      const id = Date.now() + Math.random();
      setToasts((t) => [...t.slice(-3), { id, kind, message }]);
      setTimeout(() => dismiss(id), kind === "error" ? 7000 : 4000);
    },
    [dismiss],
  );

  return (
    <ToastContext value={push}>
      {children}
      <div className="pointer-events-none fixed bottom-4 right-4 z-[200] flex w-[calc(100%-2rem)] max-w-sm flex-col gap-2" aria-live="polite" role="status">
        <AnimatePresence initial={false}>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 16, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40 }}
              className="pointer-events-auto flex items-start gap-3 rounded-2xl border border-line-strong bg-surface-2/95 p-4 text-sm text-fg shadow-2xl shadow-black/50 backdrop-blur-xl"
            >
              {toast.kind === "success" ? (
                <CircleCheck className="mt-0.5 size-4 shrink-0 text-ok" aria-hidden="true" />
              ) : (
                <CircleAlert className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden="true" />
              )}
              <p className="flex-1">{toast.message}</p>
              <button type="button" onClick={() => dismiss(toast.id)} className="text-subtle hover:text-white" aria-label="Dismiss">
                <X className="size-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext>
  );
}
