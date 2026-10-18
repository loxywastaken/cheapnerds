export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games" },
  { href: "/work", label: "Our Work" },
  { href: "/updates", label: "Updates" },
  { href: "/community", label: "Community" },
] as const;

export function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`);
}
