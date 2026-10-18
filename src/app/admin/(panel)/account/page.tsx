import type { Metadata } from "next";
import { and, asc, count, eq, gt } from "drizzle-orm";
import { LogOut, Trash2 } from "lucide-react";
import { ActionButton } from "@/components/admin/action-button";
import { AddAdminForm, ChangePasswordForm } from "@/components/admin/account-forms";
import { AdminPageTitle } from "@/components/admin/page-title";
import { db } from "@/db";
import { admins, sessions } from "@/db/schema";
import { requireAdmin } from "@/lib/auth/session";
import { formatDate } from "@/lib/utils";
import { removeAdmin, signOutOtherDevices } from "../../actions/auth";

export const metadata: Metadata = { title: "Account" };

export default async function AccountPage() {
  const me = await requireAdmin();
  const [team, [active]] = await Promise.all([
    db.select({ id: admins.id, name: admins.name, email: admins.email, role: admins.role, lastLoginAt: admins.lastLoginAt }).from(admins).orderBy(asc(admins.createdAt)),
    db.select({ n: count() }).from(sessions).where(and(eq(sessions.adminId, me.id), gt(sessions.expiresAt, new Date()))),
  ]);

  return (
    <>
      <AdminPageTitle title="Account" description={`Signed in as ${me.email} (${me.role}).`} />
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="panel p-5 sm:p-6">
          <h2 className="mb-5 font-semibold text-white">Change password</h2>
          <ChangePasswordForm />
        </section>
        <section className="panel p-5 sm:p-6">
          <h2 className="font-semibold text-white">Sessions</h2>
          <p className="mt-1 text-sm text-muted">
            You&apos;re signed in on {active.n} device{active.n === 1 ? "" : "s"}. Sessions expire after 7 days of inactivity.
          </p>
          <ActionButton action={signOutOtherDevices} className="mt-5 rounded-full border border-line px-4 py-2 text-sm text-fg hover:border-line-strong">
            <LogOut className="size-4" aria-hidden="true" /> Sign out other devices
          </ActionButton>
        </section>
      </div>

      <section className="panel mt-6 p-5 sm:p-6">
        <h2 className="font-semibold text-white">Administrators</h2>
        <ul className="mt-4 divide-y divide-line">
          {team.map((a) => (
            <li key={a.id} className="flex items-center justify-between gap-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm text-white">
                  {a.name} {a.id === me.id && <span className="text-xs text-subtle">(you)</span>}
                </p>
                <p className="truncate text-xs text-subtle">
                  {a.email} · {a.role} · {a.lastLoginAt ? `last sign-in ${formatDate(a.lastLoginAt)}` : "never signed in"}
                </p>
              </div>
              {me.role === "owner" && a.id !== me.id && (
                <ActionButton
                  action={removeAdmin.bind(null, a.id)}
                  confirm={`Remove ${a.email}? They'll be signed out immediately.`}
                  title={`Remove ${a.email}`}
                  className="grid size-8 place-items-center rounded-lg text-muted hover:bg-danger/15 hover:text-danger"
                >
                  <Trash2 className="size-4" />
                </ActionButton>
              )}
            </li>
          ))}
        </ul>
        {me.role === "owner" ? (
          <div className="mt-6 border-t border-line pt-6">
            <h3 className="mb-4 text-sm font-medium text-white">Add an administrator</h3>
            <AddAdminForm />
          </div>
        ) : (
          <p className="mt-4 text-xs text-subtle">Only owners can add or remove administrators.</p>
        )}
      </section>
    </>
  );
}
