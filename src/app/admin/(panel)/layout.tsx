import { Suspense } from "react";
import { AdminNav } from "@/components/admin/admin-nav";
import { requireAdmin } from "@/lib/auth/session";
import { logout } from "../actions/auth";

export default function PanelLayout({ children }: LayoutProps<"/admin">) {
  return (
    <div className="min-h-dvh bg-ink">
      <Suspense fallback={<AdminSkeleton />}>
        <AdminFrame>{children}</AdminFrame>
      </Suspense>
    </div>
  );
}

async function AdminFrame({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  return (
    <>
      <AdminNav name={admin.name} email={admin.email} logout={logout} />
      <div className="lg:pl-64">
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">{children}</main>
      </div>
    </>
  );
}

function AdminSkeleton() {
  return (
    <div className="lg:pl-64" aria-busy="true" aria-label="Loading dashboard">
      <div className="fixed inset-y-0 left-0 hidden w-64 border-r border-line bg-surface/60 lg:block" />
      <div className="mx-auto max-w-6xl space-y-6 px-4 py-10 sm:px-6 lg:px-10">
        <div className="skeleton h-9 w-56" />
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="skeleton h-28 rounded-3xl" />
          <div className="skeleton h-28 rounded-3xl" />
          <div className="skeleton h-28 rounded-3xl" />
        </div>
        <div className="skeleton h-80 rounded-3xl" />
      </div>
    </div>
  );
}
