"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppLocale } from "@/lib/i18n";
import type { AppUser } from "@/types/database";

type EditUserFormProps = {
  user: AppUser;
  locale: AppLocale;
  action: (formData: FormData) => Promise<void>;
};

export function EditUserForm({ user, locale, action }: EditUserFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copy =
    locale === "el"
      ? {
          cancel: "Ακύρωση",
          edit: "Επεξεργασία",
          fallbackError: "Δεν ήταν δυνατή η ενημέρωση χρήστη",
          fullName: "Ονοματεπώνυμο",
          username: "Όνομα χρήστη",
          role: "Ρόλος",
          active: "Ενεργός λογαριασμός",
          newPassword: "Νέος Κωδικός",
          keepPassword: "Άφησέ το κενό για να διατηρηθεί ο τρέχων κωδικός",
          save: "Αποθήκευση",
          saving: "Αποθήκευση...",
        }
      : {
          cancel: "Cancel",
          edit: "Edit",
          fallbackError: "Could not update user",
          fullName: "Full Name",
          username: "Username",
          role: "Role",
          active: "Active account",
          newPassword: "New Password",
          keepPassword: "Leave blank to keep current password",
          save: "Save",
          saving: "Saving...",
        };

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          setError(null);
          setIsOpen((prev) => !prev);
        }}
        className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        {isOpen ? copy.cancel : copy.edit}
      </button>

      {isOpen ? (
        <form
          action={async (formData) => {
            setIsSaving(true);
            setError(null);

            try {
              await action(formData);
              setIsOpen(false);
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : copy.fallbackError);
            } finally {
              setIsSaving(false);
            }
          }}
          className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >
          <input type="hidden" name="userId" value={user.id} />

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {copy.fullName}
            </label>
            <input
              name="full_name"
              defaultValue={user.full_name}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {copy.username}
            </label>
            <input
              name="username"
              defaultValue={user.username}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {copy.role}
              </label>
              <select
                name="role"
                defaultValue={user.role}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
              >
                <option value="admin">admin</option>
                <option value="editor">editor</option>
                <option value="viewer">viewer</option>
              </select>
            </div>

            <label className="mt-7 flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" name="is_active" defaultChecked={user.is_active} />
              {copy.active}
            </label>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {copy.newPassword}
            </label>
            <input
              type="password"
              name="password"
              placeholder={copy.keepPassword}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
            />
          </div>

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex min-h-12 min-w-[132px] items-center justify-center rounded-[1.25rem] bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
            >
              {isSaving ? copy.saving : copy.save}
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
