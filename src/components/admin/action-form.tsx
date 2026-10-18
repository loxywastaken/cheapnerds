"use client";

import { useRouter } from "next/navigation";
import {
  createContext,
  startTransition,
  useActionState,
  useContext,
  useEffect,
  useRef,
  type ComponentProps,
  type FormEvent,
  type ReactNode,
} from "react";
import type { ActionState } from "@/lib/admin/forms";
import { useToast } from "./toast";

const FormContext = createContext<{ errors?: Record<string, string>; pending: boolean }>({ pending: false });

export function useFieldError(name: string) {
  return useContext(FormContext).errors?.[name];
}

export function useFormPending() {
  return useContext(FormContext).pending;
}

/**
 * Form bound to a Server Action via useActionState. Submits through a transition (so
 * React doesn't auto-reset what the admin typed when validation fails), shows a toast
 * for the result, exposes field errors to <Field>s and refreshes server data on success.
 */
export function ActionForm({
  action,
  children,
  onSuccess,
  resetOnSuccess,
  ...props
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  onSuccess?: (state: ActionState) => void;
  resetOnSuccess?: boolean;
} & Omit<ComponentProps<"form">, "action" | "children" | "onSubmit">) {
  const toast = useToast();
  // Toast from inside the action so the message survives even if the server response
  // re-renders (and remounts) this form before an effect could run.
  const [state, formAction, pending] = useActionState(async (prev: ActionState, formData: FormData) => {
    const result = await action(prev, formData);
    if (result.message) toast(result.ok ? "success" : "error", result.message);
    return result;
  }, { ok: false });
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const handled = useRef<number | undefined>(undefined);

  useEffect(() => {
    if (!state.at || handled.current === state.at) return;
    handled.current = state.at;
    if (state.ok) {
      if (resetOnSuccess) formRef.current?.reset();
      onSuccess?.(state);
      router.refresh();
    } else if (state.errors) {
      const first = Object.keys(state.errors)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${CSS.escape(first)}"]`)?.focus();
    }
  }, [state, router, onSuccess, resetOnSuccess]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;
    const formData = new FormData(event.currentTarget);
    startTransition(() => formAction(formData));
  }

  return (
    <FormContext value={{ errors: state.ok ? undefined : state.errors, pending }}>
      <form ref={formRef} onSubmit={handleSubmit} noValidate {...props}>
        {children}
      </form>
    </FormContext>
  );
}
