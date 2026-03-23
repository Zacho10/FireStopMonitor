"use client";

import type { AppLocale } from "@/lib/i18n";
import type { FirestopWithPhotos } from "@/types/database";
import {
  getFirestopStatusBadgeClasses,
  getFirestopStatusLabel,
} from "@/lib/firestop-status";

type FirestopsListProps = {
  firestops: FirestopWithPhotos[];
  totalCount?: number;
  selectedFirestopId: string | null;
  locale: AppLocale;
  onSelect: (id: string) => void;
};

export function FirestopsList({
  firestops,
  totalCount,
  selectedFirestopId,
  locale,
  onSelect,
}: FirestopsListProps) {
  const copy =
    locale === "el"
      ? {
          eyebrow: "Μητρώο Πυροφραγών",
          title: "Πυροφραγές",
          noMatches: "Δεν υπάρχουν πυροφραγές που να ταιριάζουν με την αναζήτηση ή το φίλτρο.",
          noFirestops: "Δεν υπάρχουν ακόμα πυροφραγές σε αυτή την κάτοψη.",
          total: "σύνολο",
          roomZone: "Χώρος / Ζώνη",
          location: "Τοποθεσία",
          system: "Σύστημα",
          rating: "Κατάταξη",
          substrate: "Υπόστρωμα",
          installedBy: "Τοποθέτησε",
          installationDate: "Ημερομηνία τοποθέτησης",
          inspectedBy: "Επιθεώρησε",
          inspectionDate: "Ημερομηνία επιθεώρησης",
          photos: "Φωτογραφίες",
          before: "πριν",
          after: "μετά",
        }
      : {
          eyebrow: "Firestop Register",
          title: "Firestops",
          noMatches: "No firestops match the current search or filter.",
          noFirestops: "There are no firestops on this floorplan yet.",
          total: "total",
          roomZone: "Room / Zone",
          location: "Location",
          system: "System",
          rating: "Rating",
          substrate: "Substrate",
          installedBy: "Installed by",
          installationDate: "Installation date",
          inspectedBy: "Inspected by",
          inspectionDate: "Inspection date",
          photos: "Photos",
          before: "before",
          after: "after",
        };
  if (!firestops.length) {
    return (
      <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          {copy.eyebrow}
        </p>
        <h3 className="mt-2 text-lg font-semibold text-slate-900">{copy.title}</h3>
        <p className="mt-2 text-sm text-slate-600">
          {totalCount ? copy.noMatches : copy.noFirestops}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
            {copy.eyebrow}
          </p>
          <h3 className="mt-2 text-lg font-semibold text-slate-900">{copy.title}</h3>
        </div>
        <p className="text-sm text-slate-500">{firestops.length} {copy.total}</p>
      </div>

      <div className="space-y-3">
        {firestops.map((firestop) => {
          const isSelected = selectedFirestopId === firestop.id;

          return (
            <button
              key={firestop.id}
              type="button"
              onClick={() => onSelect(firestop.id)}
              className={`w-full rounded-2xl border p-4 text-left transition ${
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
                  {getFirestopStatusLabel(firestop.status, locale)}
                </span>
              </div>

              <div className="mt-3 grid gap-2 text-xs text-slate-500 md:grid-cols-3">
                <p>
                  <span className="font-medium text-slate-700">{copy.roomZone}:</span>{" "}
                  {firestop.room_zone || "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">{copy.location}:</span>{" "}
                  {firestop.location_description || "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">{copy.system}:</span>{" "}
                  {firestop.system_name || "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">{copy.rating}:</span>{" "}
                  {firestop.fire_rating || "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">{copy.substrate}:</span>{" "}
                  {firestop.substrate || "-"}
                </p>
              </div>

              <div className="mt-2 grid gap-2 text-xs text-slate-500 md:grid-cols-2">
                <p>
                  <span className="font-medium text-slate-700">{copy.installedBy}:</span>{" "}
                  {firestop.installed_by || "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">{copy.installationDate}:</span>{" "}
                  {firestop.installed_at
                    ? new Date(firestop.installed_at).toLocaleDateString()
                    : "-"}
                </p>
              </div>

              <div className="mt-2 grid gap-2 text-xs text-slate-500 md:grid-cols-2">
                <p>
                  <span className="font-medium text-slate-700">{copy.inspectedBy}:</span>{" "}
                  {firestop.inspected_by || "-"}
                </p>
                <p>
                  <span className="font-medium text-slate-700">{copy.inspectionDate}:</span>{" "}
                  {firestop.inspection_date
                    ? new Date(firestop.inspection_date).toLocaleDateString()
                    : "-"}
                </p>
              </div>

              <p className="mt-3 text-xs text-slate-500">
                {copy.photos}: {firestop.photos.before ? copy.before : "-"} /{" "}
                {firestop.photos.after ? copy.after : "-"}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
