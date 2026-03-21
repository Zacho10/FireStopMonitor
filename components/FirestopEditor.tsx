"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Firestop } from "@/types/database";
import {
  deleteFirestop,
  updateFirestop,
} from "@/app/projects/[id]/floorplans/[floorplanId]/actions";

type FirestopEditorProps = {
  firestop: Firestop;
  projectId: string;
  floorplanId: string;
};

const statusOptions = [
  "new",
  "to_install",
  "installed",
  "to_inspect",
  "approved",
  "rejected",
  "repaired",
] as const;

export function FirestopEditor({
  firestop,
  projectId,
  floorplanId,
}: FirestopEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  return (
    <div className="grid gap-4">
      <form
        action={async (formData) => {
          setIsSaving(true);

          try {
            await updateFirestop(formData);
            router.refresh();
          } finally {
            setIsSaving(false);
          }
        }}
        className="grid gap-4"
      >
        <input type="hidden" name="id" value={firestop.id} />
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="floorplanId" value={floorplanId} />

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Code
            </label>
            <input
              name="code"
              defaultValue={firestop.code}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Status
            </label>
            <select
              name="status"
              defaultValue={firestop.status}
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Type
          </label>
          <input
            name="type"
            defaultValue={firestop.type}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            System Name
          </label>
          <input
            name="system_name"
            defaultValue={firestop.system_name || ""}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Fire Rating
            </label>
            <input
              name="fire_rating"
              defaultValue={firestop.fire_rating || ""}
              placeholder="EI60 / EI120"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              Substrate
            </label>
            <input
              name="substrate"
              defaultValue={firestop.substrate || ""}
              placeholder="flexible wall / concrete wall / slab"
              className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            Notes
          </label>
          <textarea
            name="notes"
            defaultValue={firestop.notes || ""}
            rows={4}
            className="w-full rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            Position: {firestop.x.toFixed(2)}%, {firestop.y.toFixed(2)}%
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </form>

      <form
        action={async (formData) => {
          const confirmed = window.confirm(
            `Delete firestop ${firestop.code}? This cannot be undone.`
          );

          if (!confirmed) {
            return;
          }

          setIsDeleting(true);

          try {
            await deleteFirestop(formData);
            router.refresh();
          } finally {
            setIsDeleting(false);
          }
        }}
      >
        <input type="hidden" name="id" value={firestop.id} />
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="floorplanId" value={floorplanId} />

        <button
          type="submit"
          disabled={isDeleting}
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
        >
          {isDeleting ? "Deleting..." : "Delete firestop"}
        </button>
      </form>
    </div>
  );
}