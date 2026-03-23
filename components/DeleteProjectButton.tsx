"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeleteProjectButtonProps = {
  projectId: string;
  projectName: string;
  action: (formData: FormData) => Promise<void>;
};

export function DeleteProjectButton({
  projectId,
  projectName,
  action,
}: DeleteProjectButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <form
      action={async (formData) => {
        const confirmed = window.confirm(
          `Delete project "${projectName}"? This may fail if related floorplans or firestops still exist.`
        );

        if (!confirmed) {
          return;
        }

        setIsDeleting(true);

        try {
          await action(formData);
          router.refresh();
        } finally {
          setIsDeleting(false);
        }
      }}
    >
      <input type="hidden" name="projectId" value={projectId} />

      <button
        type="submit"
        disabled={isDeleting}
        className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
      >
        {isDeleting ? "Deleting..." : "Delete"}
      </button>
    </form>
  );
}
