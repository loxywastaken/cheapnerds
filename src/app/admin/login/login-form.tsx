"use client";

import { useActionState } from "react";
import { CircleAlert, LoaderCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { inputClass } from "@/components/admin/fields";
import { login } from "../actions/auth";

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(login, { ok: false });
  return (
    <form action={action} className="panel space-y-4 p-6">
      <input type="hidden" name="next" value={next} />
      {state.message && !state.ok && (
        <p role="alert" className="flex items-start gap-2 rounded-xl border border-danger/30 bg-danger/10 p-3 text-sm text-danger">
          <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" /> {state.message}
        </p>
      )}
      <div className="space-y-1.5">
        <label htmlFor="email" className="text-sm font-medium text-fg">
          Email
        </label>
        <input id="email" name="email" type="email" autoComplete="username" required className={inputClass} autoFocus />
      </div>
      <div className="space-y-1.5">
        <label htmlFor="password" className="text-sm font-medium text-fg">
          Password
        </label>
        <input id="password" name="password" type="password" autoComplete="current-password" required className={inputClass} />
      </div>
      <Button type="submit" variant="primary" className="w-full" disabled={pending}>
        {pending ? <LoaderCircle className="size-4 animate-spin" aria-hidden="true" /> : <LogIn className="size-4" aria-hidden="true" />}
        Sign in
      </Button>
    </form>
  );
}
