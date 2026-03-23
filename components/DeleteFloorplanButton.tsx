"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type DeleteFloorplanButtonProps = {
  projectId: string;
  floorplanId: string;
  floorplanTitle: string;
  action: (formData: FormData) => Promise<void>;
};

export function DeleteFloorplanButton({
  projectId,
  floorplanId,
  floorplanTitle,
  action,
}: DeleteFloorplanButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  return (
    <form
      action={async (formData) => {
        const confirmed = window.confirm(
          `Delete floorplan "${floorplanTitle}"? This cannot be undone.`
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
      <input type="hidden" name="floorplanId" value={floorplanId} />

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
