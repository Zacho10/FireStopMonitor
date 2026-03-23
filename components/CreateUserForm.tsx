"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AppLocale } from "@/lib/i18n";

type CreateUserFormProps = {
  action: (formData: FormData) => Promise<void>;
  locale: AppLocale;
};

export function CreateUserForm({ action, locale }: CreateUserFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const copy =
    locale === "el"
      ? {
          success: "Ο χρήστης δημιουργήθηκε επιτυχώς.",
          fallbackError: "Δεν ήταν δυνατή η δημιουργία χρήστη",
          eyebrow: "Νέος Χρήστης",
          title: "Προσθήκη Χρήστη",
          desc: "Δημιούργηστε χρήστη βάσης με ρόλο και κωδικό.",
          fullName: "Ονοματεπώνυμο",
          username: "Όνομα χρήστη",
          role: "Ρόλος",
          password: "Κωδικός",
          creating: "Δημιουργία...",
          create: "Δημιουργία χρήστη",
        }
      : {
          success: "User created successfully.",
          fallbackError: "Could not create user",
          eyebrow: "New User",
          title: "Add User",
          desc: "Create a database-backed user with a role and password.",
          fullName: "Full Name",
          username: "Username",
          role: "Role",
          password: "Password",
          creating: "Creating...",
          create: "Create user",
        };

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        setIsSaving(true);
        setError(null);
        setSuccess(null);

        try {
          await action(formData);
          formRef.current?.reset();
          setSuccess(copy.success);
          router.refresh();
        } catch (err) {
          setError(err instanceof Error ? err.message : copy.fallbackError);
        } finally {
          setIsSaving(false);
        }
      }}
      className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
    >
      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          {copy.eyebrow}
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">{copy.title}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {copy.desc}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {copy.fullName}
          </label>
          <input
            name="full_name"
            placeholder="Maria Papadopoulou"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {copy.username}
          </label>
          <input
            name="username"
            placeholder="maria"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {copy.role}
          </label>
          <select
            name="role"
            defaultValue="viewer"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
          >
            <option value="admin">admin</option>
            <option value="editor">editor</option>
            <option value="viewer">viewer</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {copy.password}
          </label>
          <input
            type="password"
            name="password"
            placeholder="At least 8 characters"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}

      <div className="mt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSaving}
          className="inline-flex min-h-14 min-w-[196px] shrink-0 whitespace-nowrap items-center justify-center rounded-[1.75rem] bg-slate-900 px-6 py-4 text-base font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-700 disabled:opacity-50"
        >
          {isSaving ? copy.creating : copy.create}
        </button>
      </div>
    </form>
  );
}
