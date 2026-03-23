"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AppLocale } from "@/lib/i18n";

type UploadFloorplanFormProps = {
  projectId: string;
  floorplanId: string;
  action: (formData: FormData) => Promise<{
    success: boolean;
    error?: string;
  }>;
  locale: AppLocale;
};

export function UploadFloorplanForm({
  projectId,
  floorplanId,
  action,
  locale,
}: UploadFloorplanFormProps) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const copy =
    locale === "el"
      ? {
          fallbackError: "Δεν ήταν δυνατή η αποστολή κάτοψης",
          success: "Η εικόνα κάτοψης ανέβηκε επιτυχώς.",
          eyebrow: "Εικόνα Κάτοψης",
          title: "Ανέβασμα ή αντικατάσταση σχεδίου",
          desc: "Χρησιμοποίησε καθαρή εικόνα σχεδίου ώστε η τοποθέτηση pins και η παρακολούθηση firestops να είναι ακριβής.",
          upload: "Ανέβασμα κάτοψης",
          uploading: "Μεταφόρτωση...",
        }
      : {
          fallbackError: "Could not upload floorplan",
          success: "Floorplan image uploaded successfully.",
          eyebrow: "Floorplan Image",
          title: "Upload or replace drawing",
          desc: "Use a clear plan image so pin placement and firestop tracking stay accurate.",
          upload: "Upload floorplan",
          uploading: "Uploading...",
        };

  return (
    <form
      ref={formRef}
      action={async (formData) => {
        setIsUploading(true);
        setError(null);
        setSuccess(null);

        try {
          const result = await action(formData);

          if (!result.success) {
            setError(result.error || copy.fallbackError);
            return;
          }

          formRef.current?.reset();
          setSuccess(copy.success);
          router.refresh();
        } finally {
          setIsUploading(false);
        }
      }}
      className="mb-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
    >
      <input type="hidden" name="projectId" value={projectId} />
      <input type="hidden" name="floorplanId" value={floorplanId} />

      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          {copy.eyebrow}
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">{copy.title}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {copy.desc}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <input
          type="file"
          name="file"
          accept="image/*"
          className="max-w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-700"
        />

        <button
          type="submit"
          disabled={isUploading}
          className="inline-flex min-h-14 min-w-[196px] shrink-0 whitespace-nowrap items-center justify-center rounded-[1.75rem] bg-slate-900 px-6 py-4 text-base font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-700 disabled:opacity-50"
        >
          {isUploading ? copy.uploading : copy.upload}
        </button>
      </div>

      {error && (
        <div className="mt-3 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mt-3 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}
    </form>
  );
}
