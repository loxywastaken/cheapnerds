import { NextResponse, type NextRequest } from "next/server";

/**
 * Optimistic gate for the admin area: bounce visitors without a session cookie straight
 * to the login page. Real authorization happens server-side on every admin page and
 * Server Action (see lib/auth/session.ts), so this is only a fast path.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  if (!request.cookies.has("cn_session")) {
    const url = new URL("/admin/login", request.url);
    if (pathname !== "/admin") url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin", "/admin/:path*"],
};
