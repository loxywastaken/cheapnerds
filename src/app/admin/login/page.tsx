import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { LogoMark } from "@/components/site/logo";
import { getCurrentAdmin } from "@/lib/auth/session";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Sign in" };

export default function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  return (
    <main className="relative isolate flex min-h-dvh items-center justify-center overflow-hidden px-4 py-16">
      <div className="dot-grid absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_10%,transparent_65%)]" aria-hidden="true" />
      <div className="absolute left-1/2 top-1/4 -z-10 size-[28rem] -translate-x-1/2 rounded-full bg-brand/20 blur-[140px]" aria-hidden="true" />
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <LogoMark className="mx-auto size-20 rounded-2xl" />
          <h1 className="mt-5 text-2xl font-semibold text-white">Admin sign in</h1>
          <p className="mt-1.5 text-sm text-muted">Manage games, projects and news for Cheap Nerds.</p>
        </div>
        <Suspense fallback={<div className="panel h-[17.5rem]" />}>
          <AlreadySignedIn />
          <LoginFormWithNext searchParams={searchParams} />
        </Suspense>
      </div>
    </main>
  );
}

async function AlreadySignedIn() {
  if (await getCurrentAdmin()) redirect("/admin");
  return null;
}

async function LoginFormWithNext({ searchParams }: Pick<PageProps<"/admin/login">, "searchParams">) {
  const { next } = await searchParams;
  return <LoginForm next={typeof next === "string" ? next : ""} />;
}
