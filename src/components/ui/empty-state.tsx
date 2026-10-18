import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export function EmptyState({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children?: ReactNode }) {
  return (
    <div className="panel flex flex-col items-center px-6 py-16 text-center">
      <div className="mb-5 grid size-14 place-items-center rounded-2xl border border-line bg-surface-2 text-brand-soft">
        <Icon className="size-6" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {children && <div className="mt-2 max-w-md text-sm text-muted">{children}</div>}
    </div>
  );
}
