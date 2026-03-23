"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AppLocale } from "@/lib/i18n";

type CreateProjectFormProps = {
  action: (formData: FormData) => Promise<void>;
  locale: AppLocale;
};

export function CreateProjectForm({ action, locale }: CreateProjectFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const copy =
    locale === "el"
      ? {
          success: "Το έργο δημιουργήθηκε επιτυχώς.",
          fallbackError: "Δεν ήταν δυνατή η δημιουργία έργου",
          eyebrow: "Νέο Έργο",
          title: "Προσθήκη Έργου",
          desc: "Δημιούργησε νέο έργο και ξεκίνα να προσθέτεις κατόψεις και πυροφραγές.",
          projectName: "Όνομα Έργου",
          client: "Πελάτης",
          address: "Διεύθυνση",
          create: "Δημιουργία έργου",
          creating: "Δημιουργία...",
        }
      : {
          success: "Project created successfully.",
          fallbackError: "Could not create project",
          eyebrow: "New Project",
          title: "Add Project",
          desc: "Create a new project and start adding floorplans and firestops.",
          projectName: "Project Name",
          client: "Client",
          address: "Address",
          create: "Create project",
          creating: "Creating...",
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
      className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
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

      <div className="grid gap-4 md:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {copy.projectName}
          </label>
          <input
            name="name"
            placeholder="Office Tower A"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {copy.client}
          </label>
          <input
            name="client"
            placeholder="Acme Construction"
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {copy.address}
          </label>
          <input
            name="site_address"
            placeholder="Athens, Greece"
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
