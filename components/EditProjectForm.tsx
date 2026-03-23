"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppLocale } from "@/lib/i18n";

type EditProjectFormProps = {
  projectId: string;
  initialName: string;
  initialClient: string | null;
  initialSiteAddress: string | null;
  locale: AppLocale;
  action: (formData: FormData) => Promise<void>;
};

export function EditProjectForm({
  projectId,
  initialName,
  initialClient,
  initialSiteAddress,
  locale,
  action,
}: EditProjectFormProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copy =
    locale === "el"
      ? {
          cancel: "Ακύρωση",
          edit: "Επεξεργασία",
          fallbackError: "Δεν ήταν δυνατή η ενημέρωση έργου",
          projectName: "Όνομα Έργου",
          client: "Πελάτης",
          address: "Διεύθυνση",
          save: "Αποθήκευση",
          saving: "Αποθήκευση...",
        }
      : {
          cancel: "Cancel",
          edit: "Edit",
          fallbackError: "Could not update project",
          projectName: "Project Name",
          client: "Client",
          address: "Address",
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

      {isOpen && (
        <form
          action={async (formData) => {
            setIsSaving(true);
            setError(null);

            try {
              await action(formData);
              setIsOpen(false);
              router.refresh();
            } catch (err) {
              setError(
                err instanceof Error ? err.message : copy.fallbackError
              );
            } finally {
              setIsSaving(false);
            }
          }}
          className="mt-4 grid gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >
          <input type="hidden" name="projectId" value={projectId} />

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {copy.projectName}
            </label>
            <input
              name="name"
              defaultValue={initialName}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {copy.client}
            </label>
            <input
              name="client"
              defaultValue={initialClient || ""}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {copy.address}
            </label>
            <input
              name="site_address"
              defaultValue={initialSiteAddress || ""}
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
      )}
    </div>
  );
}
