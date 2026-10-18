import type { Metadata, Viewport } from "next";
import { Fredoka, Geist, Geist_Mono } from "next/font/google";
import { MotionConfig } from "motion/react";
import { getSettings } from "@/lib/data";
import { siteUrl } from "@/lib/utils";
import "./globals.css";

const geist = Geist({ variable: "--font-geist", subsets: ["latin"], display: "swap" });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"], display: "swap" });
const fredoka = Fredoka({ variable: "--font-fredoka", subsets: ["latin"], weight: ["500", "600", "700"], display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: `${settings.siteName} — Roblox Game Studio`, template: `%s · ${settings.siteName}` },
    description: settings.siteDescription,
    applicationName: settings.siteName,
    openGraph: {
      type: "website",
      siteName: settings.siteName,
      locale: "en_GB",
    },
    twitter: { card: "summary_large_image" },
    alternates: { canonical: "./" },
  };
}

export const viewport: Viewport = {
  themeColor: "#ffd43b",
  colorScheme: "dark",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${fredoka.variable} antialiased`}>
      <body className="min-h-dvh">
        <MotionConfig reducedMotion="user">{children}</MotionConfig>
      </body>
    </html>
  );
}
