"use client";

import { KeyRound, UserPlus } from "lucide-react";
import { changePassword, createAdmin } from "@/app/admin/actions/auth";
import { ActionForm } from "./action-form";
import { SelectField, SubmitButton, TextField } from "./fields";

export function ChangePasswordForm() {
  return (
    <ActionForm action={changePassword} resetOnSuccess className="space-y-4">
      <TextField label="Current password" name="current" type="password" autoComplete="current-password" required />
      <TextField label="New password" name="password" type="password" autoComplete="new-password" required hint="At least 10 characters, mixing letters with numbers or symbols." />
      <TextField label="Confirm new password" name="confirm" type="password" autoComplete="new-password" required />
      <SubmitButton>
        <KeyRound className="size-4" aria-hidden="true" /> Update password
      </SubmitButton>
    </ActionForm>
  );
}

export function AddAdminForm() {
  return (
    <ActionForm action={createAdmin} resetOnSuccess className="grid gap-4 sm:grid-cols-2">
      <TextField label="Name" name="name" required maxLength={60} />
      <TextField label="Email" name="email" type="email" required autoComplete="off" />
      <TextField label="Temporary password" name="password" type="password" autoComplete="new-password" required hint="Share it securely; they can change it after signing in." />
      <SelectField
        label="Role"
        name="role"
        defaultValue="admin"
        options={[
          { value: "admin", label: "Admin — manage content" },
          { value: "owner", label: "Owner — also manage admins" },
        ]}
      />
      <div className="sm:col-span-2">
        <SubmitButton>
          <UserPlus className="size-4" aria-hidden="true" /> Add admin
        </SubmitButton>
      </div>
    </ActionForm>
  );
}
