"use client";

import type { Firestop } from "@/types/database";
import { getFirestopStatusBadgeClasses } from "@/lib/firestop-status";

type FirestopsListProps = {
  firestops: Firestop[];
  selectedFirestopId: string | null;
  onSelect: (id: string) => void;
};

export function FirestopsList({
  firestops,
  selectedFirestopId,
  onSelect,
}: FirestopsListProps) {
  if (!firestops.length) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">Firestops</h3>
        <p className="mt-2 text-sm text-slate-600">
          Δεν υπάρχουν ακόμα πυροφραγές σε αυτή την κάτοψη.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-900">Firestops</h3>
        <p className="text-sm text-slate-500">{firestops.length} total</p>
      </div>

      <div className="space-y-3">
        {firestops.map((firestop) => {
          const isSelected = selectedFirestopId === firestop.id;

          return (
            <button
              key={firestop.id}
              type="button"
              onClick={() => onSelect(firestop.id)}
              className={`w-full rounded-xl border p-4 text-left transition ${
                isSelected
                  ? "border-slate-900 bg-slate-50"
                  : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    {firestop.code}
                  </p>
                  <p className="mt-1 text-sm text-slate-600">
                    {firestop.type || "-"}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${getFirestopStatusBadgeClasses(
                    firestop.status
                  )}`}
                >
                  {firestop.status}
                </span>
              </div>

              <div className="mt-3 grid gap-2 text-xs text-slate-500 md:grid-cols-3">
                <p>
                  <span className="font-medium text-slate-700">System:</span>{" "}
                  {firestop.system_name || "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">Rating:</span>{" "}
                  {firestop.fire_rating || "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">Substrate:</span>{" "}
                  {firestop.substrate || "-"}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}