import type { Metadata } from "next";
import { ToastProvider } from "@/components/admin/toast";

export const metadata: Metadata = {
  title: { default: "Admin", template: "%s · Admin · Cheap Nerds" },
  robots: { index: false, follow: false },
};

export default function AdminRootLayout({ children }: LayoutProps<"/admin">) {
  return <ToastProvider>{children}</ToastProvider>;
}
