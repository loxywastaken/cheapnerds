"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import {
  BarChart3,
  Boxes,
  ExternalLink,
  Gamepad2,
  Image as ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Newspaper,
  Settings,
  UserRound,
  X,
} from "lucide-react";
import { useState } from "react";
import { LogoMark } from "@/components/site/logo";
import { cn } from "@/lib/utils";

const items = [
  { href: "/admin", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/admin/games", label: "Games", Icon: Gamepad2 },
  { href: "/admin/projects", label: "Projects", Icon: Boxes },
  { href: "/admin/posts", label: "News", Icon: Newspaper },
  { href: "/admin/media", label: "Media", Icon: ImageIcon },
  { href: "/admin/analytics", label: "Analytics", Icon: BarChart3 },
  { href: "/admin/settings", label: "Site settings", Icon: Settings },
  { href: "/admin/account", label: "Account", Icon: UserRound },
];

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <ul className="space-y-1">
      {items.map(({ href, label, Icon }) => {
        const active = href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);
        return (
          <li key={href}>
            <Link
              href={href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                active ? "bg-white/[0.07] text-white shadow-[inset_0_1px_0_rgb(255_255_255/0.06)]" : "text-muted hover:bg-white/[0.04] hover:text-white",
              )}
            >
              <Icon className={cn("size-4", active && "text-violet-soft")} aria-hidden="true" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function AdminNav({ name, email, logout }: { name: string; email: string; logout: () => Promise<void> }) {
  const [open, setOpen] = useState(false);

  const footer = (
    <div className="space-y-2 border-t border-line pt-4">
      <Link href="/" target="_blank" className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted hover:bg-white/[0.04] hover:text-white">
        <ExternalLink className="size-4" aria-hidden="true" /> View site
      </Link>
      <div className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-violet/20 text-sm font-semibold text-violet-soft">{name.slice(0, 1).toUpperCase()}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm text-white">{name}</p>
          <p className="truncate text-xs text-subtle">{email}</p>
        </div>
        <form action={logout}>
          <button type="submit" className="grid size-8 place-items-center rounded-lg text-subtle hover:bg-white/10 hover:text-white" aria-label="Sign out" title="Sign out">
            <LogOut className="size-4" />
          </button>
        </form>
      </div>
    </div>
  );

  return (
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-line bg-surface/60 p-4 backdrop-blur-xl lg:flex">
        <Link href="/admin" className="mb-6 flex items-center gap-2.5 px-2 pt-1">
          <LogoMark className="size-8" />
          <span>
            <span className="block font-logo text-sm font-semibold text-white">Cheap Nerds</span>
            <span className="block text-[0.7rem] text-subtle">Admin dashboard</span>
          </span>
        </Link>
        <nav className="flex-1 overflow-y-auto" aria-label="Admin">
          <NavList />
        </nav>
        {footer}
      </aside>

      <div className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-ink/80 px-4 backdrop-blur-xl lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <LogoMark className="size-7" />
          <span className="font-logo text-sm font-semibold text-white">Admin</span>
        </Link>
        <button type="button" onClick={() => setOpen(true)} className="grid size-9 place-items-center rounded-lg border border-line" aria-label="Open admin menu" aria-expanded={open}>
          <Menu className="size-4" />
        </button>
      </div>
      <AnimatePresence>
        {open && (
          <>
            <motion.div className="fixed inset-0 z-50 bg-ink/70 backdrop-blur-sm lg:hidden" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setOpen(false)} />
            <motion.aside
              className="fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-line bg-surface p-4 lg:hidden"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 38 }}
            >
              <div className="mb-6 flex items-center justify-between px-2">
                <span className="font-logo font-semibold text-white">Cheap Nerds admin</span>
                <button type="button" onClick={() => setOpen(false)} className="grid size-8 place-items-center rounded-lg hover:bg-white/10" aria-label="Close menu">
                  <X className="size-4" />
                </button>
              </div>
              <nav className="flex-1 overflow-y-auto" aria-label="Admin">
                <NavList onNavigate={() => setOpen(false)} />
              </nav>
              {footer}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
