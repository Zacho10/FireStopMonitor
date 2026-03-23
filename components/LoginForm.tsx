"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import type { AppLocale } from "@/lib/i18n";

type LoginFormProps = {
  action: (formData: FormData) => Promise<{
    success: boolean;
    error?: string;
  }>;
  locale: AppLocale;
  setLocale: (formData: FormData) => Promise<void>;
};

export function LoginForm({ action, locale, setLocale }: LoginFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copy =
    locale === "el"
      ? {
          title: "Σύνδεση",
          description:
            "Συνδέσου για να δεις έργα, κατόψεις, αναφορές και firestop records.",
          username: "Όνομα χρήστη",
          password: "Κωδικός",
          signin: "Σύνδεση",
          signingIn: "Γίνεται σύνδεση...",
          signInError: "Αποτυχία σύνδεσης.",
        }
      : {
          title: "Sign in",
          description:
            "Sign in to access projects, floorplans, reports, and firestop records.",
          username: "Username",
          password: "Password",
          signin: "Sign in",
          signingIn: "Signing in...",
          signInError: "Could not sign in.",
        };

  return (
    <form
      action={async (formData) => {
        setIsSubmitting(true);
        setError(null);

        try {
          const result = await action(formData);

          if (!result.success) {
            setError(result.error || copy.signInError);
            return;
          }

          router.replace("/");
          router.refresh();
        } finally {
          setIsSubmitting(false);
        }
      }}
      className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-sm"
    >
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
          Firestop Tracker
        </p>
        <h1 className="mt-2 text-3xl font-semibold text-slate-900">{copy.title}</h1>
        <p className="mt-3 text-sm leading-6 text-slate-600">
          {copy.description}
        </p>
        </div>
        <LocaleSwitcher locale={locale} action={setLocale} />
      </div>

      <div className="grid gap-4">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {copy.username}
          </label>
          <input
            name="username"
            autoComplete="username"
            placeholder="admin"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {copy.password}
          </label>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="mt-6 w-full rounded-xl bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
      >
        {isSubmitting ? copy.signingIn : copy.signin}
      </button>
    </form>
  );
}
