"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { ArrowRight, Menu, X } from "lucide-react";
import { Suspense, useEffect, useRef, useState } from "react";
import { buttonClass } from "@/components/ui/button";
import { DiscordIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { NAV_LINKS, isActive } from "./nav-links";

type HeaderProps = {
  siteName: string;
  logoUrl?: string;
  discordUrl?: string;
  announcement?: { text: string; href: string };
};

/**
 * The current path is request data, so the header first renders (and prerenders)
 * without an active link, then picks up the path inside a Suspense boundary.
 */
export function SiteHeader(props: HeaderProps) {
  return (
    <Suspense fallback={<HeaderView {...props} pathname="" />}>
      <HeaderWithPath {...props} />
    </Suspense>
  );
}

function HeaderWithPath(props: HeaderProps) {
  return <HeaderView {...props} pathname={usePathname()} />;
}

function HeaderView({ siteName, logoUrl, discordUrl, announcement, pathname }: HeaderProps & { pathname: string }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile menu on navigation.
  const [lastPath, setLastPath] = useState(pathname);
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        menuButton.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <header className="fixed inset-x-0 top-0 z-50">
      {announcement && !open && (
        <div className="border-b border-line bg-[linear-gradient(90deg,rgb(255_178_26/0.22),rgb(91_147_184/0.16),rgb(255_178_26/0.22))] backdrop-blur-xl">
          <div className="container-page flex h-9 items-center justify-center gap-2 text-center text-[0.8rem] text-fg">
            <span className="size-1.5 shrink-0 animate-pulse-dot rounded-full bg-brand-soft" aria-hidden="true" />
            {announcement.href ? (
              <Link href={announcement.href} className="group inline-flex items-center gap-1.5 truncate hover:text-white">
                <span className="truncate">{announcement.text}</span>
                <ArrowRight className="size-3.5 shrink-0 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            ) : (
              <span className="truncate">{announcement.text}</span>
            )}
          </div>
        </div>
      )}
      <div
        className={cn(
          "border-b transition-[background-color,border-color,backdrop-filter] duration-300",
          scrolled || open ? "border-line bg-ink/75 backdrop-blur-xl" : "border-transparent bg-transparent",
        )}
      >
        <nav className="container-page flex h-16 items-center justify-between gap-6 sm:h-[4.5rem]" aria-label="Main">
          <Link href="/" className="relative z-10 shrink-0 rounded-xl" aria-label={`${siteName} home`}>
            <Logo siteName={siteName} logoUrl={logoUrl} />
          </Link>

          <ul className="hidden items-center gap-1 rounded-full border border-line bg-white/[0.025] p-1 backdrop-blur md:flex">
            {NAV_LINKS.map((link) => {
              const active = isActive(pathname, link.href);
              return (
                <li key={link.href} className="relative">
                  {active && (
                    <motion.span
                      layoutId="nav-pill"
                      className="absolute inset-0 rounded-full bg-white/[0.08] shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]"
                      transition={{ type: "spring", stiffness: 420, damping: 34 }}
                    />
                  )}
                  <Link
                    href={link.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "relative block rounded-full px-4 py-1.5 text-sm transition-colors",
                      active ? "text-white" : "text-muted hover:text-white",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            {discordUrl && (
              <span className="hidden sm:block">
                <a href={discordUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("discord", "sm")}>
                  <DiscordIcon size={17} />
                  Join Discord
                </a>
              </span>
            )}
            <button
              ref={menuButton}
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="relative z-10 grid size-10 place-items-center rounded-full border border-line bg-white/[0.04] text-fg md:hidden"
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? "Close menu" : "Open menu"}
            >
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={open ? "close" : "open"}
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {open ? <X className="size-5" /> : <Menu className="size-5" />}
                </motion.span>
              </AnimatePresence>
            </button>
          </div>
        </nav>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            className="fixed inset-x-0 bottom-0 top-16 overflow-y-auto border-t border-line bg-ink/95 backdrop-blur-2xl md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.ul
              className="container-page flex flex-col gap-1 py-6"
              initial="hidden"
              animate="show"
              variants={{ show: { transition: { staggerChildren: 0.045, delayChildren: 0.05 } } }}
            >
              {NAV_LINKS.map((link) => {
                const active = isActive(pathname, link.href);
                return (
                  <motion.li
                    key={link.href}
                    variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }}
                    transition={{ ease: [0.22, 1, 0.36, 1], duration: 0.4 }}
                  >
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "flex items-center justify-between rounded-2xl px-4 py-4 font-display text-2xl font-medium transition-colors",
                        active ? "bg-white/[0.06] text-white" : "text-muted active:bg-white/[0.04]",
                      )}
                    >
                      {link.label}
                      {active && <span className="size-2 rounded-full bg-brand-soft" aria-hidden="true" />}
                    </Link>
                  </motion.li>
                );
              })}
              {discordUrl && (
                <motion.li variants={{ hidden: { opacity: 0, y: 14 }, show: { opacity: 1, y: 0 } }} className="mt-4">
                  <a href={discordUrl} target="_blank" rel="noopener noreferrer" className={buttonClass("discord", "lg", "w-full")}>
                    <DiscordIcon size={19} />
                    Join our Discord
                  </a>
                </motion.li>
              )}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
