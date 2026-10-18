import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" },
  { key: "Content-Security-Policy", value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
];

const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
  poweredByHeader: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  experimental: {
    serverActions: {
      // Uploads are capped at 4 MB in lib/media.ts; leave headroom for multipart overhead.
      // Vercel functions reject request bodies above 4.5 MB regardless of this value.
      bodySizeLimit: "4.4mb",
    },
  },
  images: {
    qualities: [75, 90],
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "tr.rbxcdn.com", pathname: "/**", search: "" },
      { protocol: "https", hostname: "*.rbxcdn.com", pathname: "/**", search: "" },
      { protocol: "https", hostname: "cdn.discordapp.com", pathname: "/**" },
    ],
    localPatterns: [
      { pathname: "/api/media/**", search: "" },
      { pathname: "/brand/**", search: "" },
    ],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
