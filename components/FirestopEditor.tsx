"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppLocale } from "@/lib/i18n";
import { getFirestopStatusLabel } from "@/lib/firestop-status";
import type { FirestopPhotoSlot, FirestopWithPhotos } from "@/types/database";
import {
  deleteFirestopPhotoAction,
  deleteFirestop,
  updateFirestop,
  uploadFirestopPhotoAction,
} from "@/app/projects/[id]/floorplans/[floorplanId]/actions";

type FirestopEditorProps = {
  firestop: FirestopWithPhotos;
  projectId: string;
  floorplanId: string;
  canEdit: boolean;
  locale: AppLocale;
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

const photoFields: {
  slot: FirestopPhotoSlot;
  label: string;
  helper: string;
}[] = [
  {
    slot: "before",
    label: "Before photo",
    helper: "Upload the condition before installation.",
  },
  {
    slot: "after",
    label: "After photo",
    helper: "Upload the completed firestop result.",
  },
];

async function normalizeImageFile(file: File) {
  if (!file.type.startsWith("image/")) {
    return file;
  }

  // Keep SVG as-is instead of rasterizing it.
  if (file.type === "image/svg+xml") {
    return file;
  }

  try {
    const objectUrl = URL.createObjectURL(file);

    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Image decode failed"));
      img.src = objectUrl;
    });

    const canvas = document.createElement("canvas");
    canvas.width = image.naturalWidth || image.width;
    canvas.height = image.naturalHeight || image.height;

    const context = canvas.getContext("2d");
    if (!context) {
      URL.revokeObjectURL(objectUrl);
      return file;
    }

    context.drawImage(image, 0, 0);

    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, "image/jpeg", 0.92);
    });

    URL.revokeObjectURL(objectUrl);

    if (!blob) {
      return file;
    }

    const normalizedName = file.name.replace(/\.[^.]+$/, "") || "upload";

    return new File([blob], `${normalizedName}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } catch {
    return file;
  }
}

export function FirestopEditor({
  firestop,
  projectId,
  floorplanId,
  canEdit,
  locale,
}: FirestopEditorProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<FirestopPhotoSlot | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState(firestop.status);
  const [inspectionNotesValue, setInspectionNotesValue] = useState(
    firestop.inspection_notes || ""
  );
  const [previewPhoto, setPreviewPhoto] = useState<{
    url: string;
    label: string;
  } | null>(null);
  const router = useRouter();
  const needsInspectionAttention =
    selectedStatus === "approved" || selectedStatus === "rejected";
  const isRejectedWithoutInspectionNote =
    selectedStatus === "rejected" && !inspectionNotesValue.trim();
  const copy =
    locale === "el"
      ? {
          details: "Στοιχεία Πυροφραγής",
          fallbackSave: "Δεν ήταν δυνατή η αποθήκευση πυροφραγής",
          nameCode: "Όνομα / Κωδικός Πυροφραγής",
          status: "Κατάσταση",
          inspectionReady: "Αυτή η κατάσταση είναι έτοιμη για στοιχεία επιθεώρησης.",
          approvedHelp:
            "Οι εγκεκριμένες πυροφραγές καλό είναι να έχουν συμπληρωμένα στοιχεία επιθεώρησης.",
          rejectedHelp:
            "Οι απορριφθείσες πυροφραγές συνήθως πρέπει να έχουν σχόλια επιθεώρησης.",
          independentHelp: "Η τοποθέτηση και η επιθεώρηση μπορούν να παρακολουθούνται ανεξάρτητα.",
          type: "Τύπος",
          roomZone: "Χώρος / Ζώνη",
          locationDescription: "Περιγραφή Τοποθεσίας",
          systemName: "Όνομα Συστήματος",
          fireRating: "Πυραντίσταση",
          substrate: "Υπόστρωμα",
          installedBy: "Τοποθέτησε",
          installationDate: "Ημερομηνία Τοποθέτησης",
          inspection: "Επιθεώρηση",
          inspectionOptional: "Προαιρετικά στοιχεία επιθεώρησης. Μπορούν να μείνουν κενά μέχρι να γίνει ο έλεγχος.",
          approvedBanner:
            "Η πυροφραγή είναι σημειωμένη ως εγκεκριμένη. Είναι καλή ιδέα να καταγραφεί ποιος την επιθεώρησε και πότε.",
          rejectedBanner:
            "Η πυροφραγή είναι σημειωμένη ως απορριφθείσα. Πρόσθεσε στοιχεία επιθεώρησης ώστε να είναι ξεκάθαρος ο λόγος.",
          rejectedWarn:
            "Η κατάσταση rejected συνήθως χρειάζεται inspection notes ώστε να είναι ξεκάθαρη η διορθωτική ενέργεια.",
          inspectedBy: "Επιθεώρησε",
          inspectionDate: "Ημερομηνία Επιθεώρησης",
          inspectionNotes: "Σημειώσεις Επιθεώρησης",
          notes: "Σημειώσεις",
          readonly: "Η πυροφραγή είναι σε read-only mode για τον λογαριασμό σου.",
          position: "Θέση",
          saving: "Αποθήκευση...",
          save: "Αποθήκευση αλλαγών",
          noPhoto: "Δεν υπάρχει ακόμα φωτογραφία",
          uploadPhoto: "Ανέβασμα φωτογραφίας",
          replacePhoto: "Αντικατάσταση φωτογραφίας",
          uploading: "Μεταφόρτωση...",
          deletePhoto: "Διαγραφή φωτογραφίας",
          deleting: "Διαγραφή...",
          deleteFirestop: "Διαγραφή πυροφραγής",
          deletingFirestop: "Διαγραφή...",
          close: "Κλείσιμο",
          fallbackDelete: "Δεν ήταν δυνατή η διαγραφή πυροφραγής",
          noUpload: "Δεν ανέβηκε φωτογραφία",
        }
      : {
          details: "Firestop Details",
          fallbackSave: "Could not save firestop",
          nameCode: "Firestop Name / Code",
          status: "Status",
          inspectionReady: "This status is ready for inspection details.",
          approvedHelp: "Approved firestops should normally have inspection info filled in.",
          rejectedHelp: "Rejected firestops should usually include inspection notes.",
          independentHelp: "Installation and inspection can be tracked independently.",
          type: "Type",
          roomZone: "Room / Zone",
          locationDescription: "Location Description",
          systemName: "System Name",
          fireRating: "Fire Rating",
          substrate: "Substrate",
          installedBy: "Installed By",
          installationDate: "Installation Date",
          inspection: "Inspection",
          inspectionOptional: "Optional inspection details. These can stay empty until checked.",
          approvedBanner:
            "This firestop is marked as approved. It is a good idea to record who inspected it and when.",
          rejectedBanner:
            "This firestop is marked as rejected. Add inspection details so the reason is clear.",
          rejectedWarn:
            "Rejected status usually needs inspection notes, so the corrective action is clear.",
          inspectedBy: "Inspected By",
          inspectionDate: "Inspection Date",
          inspectionNotes: "Inspection Notes",
          notes: "Notes",
          readonly: "This firestop is in read-only mode for your account.",
          position: "Position",
          saving: "Saving...",
          save: "Save changes",
          noPhoto: "No photo yet",
          uploadPhoto: "Upload photo",
          replacePhoto: "Replace photo",
          uploading: "Uploading...",
          deletePhoto: "Delete photo",
          deleting: "Deleting...",
          deleteFirestop: "Delete firestop",
          deletingFirestop: "Deleting...",
          close: "Close",
          fallbackDelete: "Could not delete firestop",
          noUpload: "No photo uploaded",
        };

  return (
    <div className="grid gap-4">
      <form
        action={async (formData) => {
          setIsSaving(true);
          setError(null);

          try {
            await updateFirestop(formData);
            router.refresh();
          } catch (err) {
            setError(err instanceof Error ? err.message : copy.fallbackSave);
          } finally {
            setIsSaving(false);
          }
        }}
        className="grid gap-5 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm"
      >
        <input type="hidden" name="id" value={firestop.id} />
        <input type="hidden" name="projectId" value={projectId} />
        <input type="hidden" name="floorplanId" value={floorplanId} />

        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              {copy.details}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">
              {firestop.code}
            </h3>
          </div>
          <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
            {getFirestopStatusLabel(firestop.status, locale)}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {copy.nameCode}
            </label>
            <input
              name="code"
              defaultValue={firestop.code}
              placeholder="FS-001"
              disabled={!canEdit}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {copy.status}
            </label>
            <select
              name="status"
              defaultValue={firestop.status}
              onChange={(event) =>
                setSelectedStatus(event.target.value as typeof firestop.status)
              }
              disabled={!canEdit}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {getFirestopStatusLabel(status, locale)}
                </option>
              ))}
            </select>
            <p className="mt-2 text-xs text-slate-500">
              {selectedStatus === "to_inspect"
                ? copy.inspectionReady
                : selectedStatus === "approved"
                ? copy.approvedHelp
                : selectedStatus === "rejected"
                ? copy.rejectedHelp
                : copy.independentHelp}
            </p>
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {copy.type}
          </label>
          <input
            name="type"
            defaultValue={firestop.type}
            disabled={!canEdit}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {copy.roomZone}
            </label>
            <input
              name="room_zone"
              defaultValue={firestop.room_zone || ""}
              placeholder="Level 2 - Room 214 / Zone C"
              disabled={!canEdit}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {copy.locationDescription}
            </label>
            <input
              name="location_description"
              defaultValue={firestop.location_description || ""}
              placeholder="Above ceiling near riser / wall by corridor door"
              disabled={!canEdit}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {copy.systemName}
          </label>
          <input
            name="system_name"
            defaultValue={firestop.system_name || ""}
            disabled={!canEdit}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {copy.fireRating}
            </label>
            <input
              name="fire_rating"
              defaultValue={firestop.fire_rating || ""}
              placeholder="EI60 / EI120"
              disabled={!canEdit}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {copy.substrate}
            </label>
            <input
              name="substrate"
              defaultValue={firestop.substrate || ""}
              placeholder="flexible wall / concrete wall / slab"
              disabled={!canEdit}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {copy.installedBy}
            </label>
            <input
              name="installed_by"
              defaultValue={firestop.installed_by || ""}
              placeholder="Installer / team"
              disabled={!canEdit}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {copy.installationDate}
            </label>
            <input
              type="date"
              name="installed_at"
              defaultValue={firestop.installed_at?.slice(0, 10) || ""}
              disabled={!canEdit}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
            />
          </div>
        </div>

        <div
          className={`rounded-2xl border p-4 ${
            needsInspectionAttention
              ? "border-amber-300 bg-amber-50"
              : "border-slate-200 bg-slate-50"
          }`}
        >
          <div className="mb-3">
            <h4 className="text-sm font-semibold text-slate-900">{copy.inspection}</h4>
            <p className="mt-1 text-xs text-slate-600">
              {copy.inspectionOptional}
            </p>
          </div>

          {needsInspectionAttention ? (
            <div className="mb-4 rounded-xl border border-amber-200 bg-white/70 p-3 text-sm text-amber-900">
              {selectedStatus === "approved"
                ? copy.approvedBanner
                : copy.rejectedBanner}
            </div>
          ) : null}

          {isRejectedWithoutInspectionNote ? (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {copy.rejectedWarn}
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {copy.inspectedBy}
              </label>
              <input
                name="inspected_by"
                defaultValue={firestop.inspected_by || ""}
                placeholder="Inspector / engineer"
                disabled={!canEdit}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">
                {copy.inspectionDate}
              </label>
              <input
                type="date"
                name="inspection_date"
                defaultValue={firestop.inspection_date?.slice(0, 10) || ""}
                disabled={!canEdit}
                className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="mb-1 block text-sm font-medium text-slate-700">
              {copy.inspectionNotes}
            </label>
            <textarea
              name="inspection_notes"
              defaultValue={firestop.inspection_notes || ""}
              onChange={(event) => setInspectionNotesValue(event.target.value)}
              rows={3}
              disabled={!canEdit}
              className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">
            {copy.notes}
          </label>
          <textarea
            name="notes"
            defaultValue={firestop.notes || ""}
            rows={4}
            disabled={!canEdit}
            className="w-full rounded-2xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-slate-500"
          />
        </div>

        {!canEdit && (
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
            {copy.readonly}
          </div>
        )}

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {copy.position}: {firestop.x.toFixed(2)}%, {firestop.y.toFixed(2)}%
          </div>

          {canEdit ? (
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex min-h-14 min-w-[188px] shrink-0 whitespace-nowrap items-center justify-center rounded-[1.75rem] bg-slate-900 px-6 py-4 text-base font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-700 disabled:opacity-50"
            >
              {isSaving ? copy.saving : copy.save}
            </button>
          ) : null}
        </div>
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {photoFields.map(({ slot, label, helper }) => {
          const photo = firestop.photos[slot];

          return (
            <div
              key={slot}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
            >
              <div className="mb-3">
                <h4 className="text-sm font-semibold text-slate-900">{label}</h4>
                <p className="mt-1 text-xs text-slate-600">{helper}</p>
              </div>

              {photo ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewPhoto({
                        url: photo.file_url,
                        label: `${firestop.code} ${slot} photo`,
                      })
                    }
                    className="mb-3 block w-full"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={photo.file_url}
                      alt={`${firestop.code} ${slot} photo`}
                      className="min-h-56 w-full rounded-xl border border-slate-200 object-cover transition hover:opacity-90"
                    />
                  </button>
                </>
              ) : (
                <div className="mb-3 flex min-h-56 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-sm text-slate-500">
                  {copy.noPhoto}
                </div>
              )}

              {canEdit ? (
                <form
                  action={async (formData) => {
                    setUploadingSlot(slot);
                    setError(null);

                    try {
                      const rawFile = formData.get("file");

                      if (!(rawFile instanceof File) || rawFile.size === 0) {
                        setError(copy.noUpload);
                        return;
                      }

                      const normalizedFile = await normalizeImageFile(rawFile);
                      const uploadFormData = new FormData();
                      uploadFormData.set("projectId", projectId);
                      uploadFormData.set("floorplanId", floorplanId);
                      uploadFormData.set("firestopId", firestop.id);
                      uploadFormData.set("slot", slot);
                      uploadFormData.set("file", normalizedFile);

                      const result = await uploadFirestopPhotoAction(uploadFormData);

                      if (!result.success) {
                        setError(result.error || `Could not upload ${slot} photo`);
                        return;
                      }

                      router.refresh();
                    } catch (err) {
                      setError(
                        err instanceof Error
                          ? err.message
                          : `Could not upload ${slot} photo`
                      );
                    } finally {
                      setUploadingSlot(null);
                    }
                  }}
                  className="grid gap-3"
                >
                  <input type="hidden" name="projectId" value={projectId} />
                  <input type="hidden" name="floorplanId" value={floorplanId} />
                  <input type="hidden" name="firestopId" value={firestop.id} />
                  <input type="hidden" name="slot" value={slot} />

                  <input
                    type="file"
                    name="file"
                    accept="image/*"
                    className="text-sm"
                  />

                  <button
                    type="submit"
                    disabled={uploadingSlot === slot}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
                  >
                    {uploadingSlot === slot
                      ? copy.uploading
                      : photo
                      ? `${copy.replacePhoto} (${slot})`
                      : `${copy.uploadPhoto} (${slot})`}
                  </button>
                </form>
              ) : null}

              {canEdit && photo ? (
                <form
                  action={async (formData) => {
                    const confirmed = window.confirm(
                      `Delete the ${slot} photo for ${firestop.code}?`
                    );

                    if (!confirmed) {
                      return;
                    }

                    setUploadingSlot(slot);
                    setError(null);

                    try {
                      const result = await deleteFirestopPhotoAction(formData);

                      if (!result.success) {
                        setError(result.error || `Could not delete ${slot} photo`);
                        return;
                      }

                      router.refresh();
                    } catch (err) {
                      setError(
                        err instanceof Error
                          ? err.message
                          : `Could not delete ${slot} photo`
                      );
                    } finally {
                      setUploadingSlot(null);
                    }
                  }}
                  className="mt-3"
                >
                  <input type="hidden" name="projectId" value={projectId} />
                  <input type="hidden" name="floorplanId" value={floorplanId} />
                  <input type="hidden" name="firestopId" value={firestop.id} />
                  <input type="hidden" name="slot" value={slot} />
                  <button
                    type="submit"
                    disabled={uploadingSlot === slot}
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                  >
                    {uploadingSlot === slot ? copy.deleting : `${copy.deletePhoto} (${slot})`}
                  </button>
                </form>
              ) : null}
            </div>
          );
        })}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {canEdit ? (
        <form
          action={async (formData) => {
            const confirmed = window.confirm(
              `Delete firestop ${firestop.code}? This cannot be undone.`
            );

            if (!confirmed) {
              return;
            }

            setIsDeleting(true);
            setError(null);

            try {
              await deleteFirestop(formData);
              router.refresh();
            } catch (err) {
              setError(err instanceof Error ? err.message : copy.fallbackDelete);
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
            {isDeleting ? copy.deletingFirestop : copy.deleteFirestop}
          </button>
        </form>
      ) : null}

      {previewPhoto ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-6">
          <div className="relative w-full max-w-5xl">
            <button
              type="button"
              onClick={() => setPreviewPhoto(null)}
              className="absolute right-0 top-0 z-10 rounded-xl bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow"
            >
              {copy.close}
            </button>
            <div className="overflow-hidden rounded-2xl bg-white p-3 shadow-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewPhoto.url}
                alt={previewPhoto.label}
                className="max-h-[80vh] w-full rounded-xl object-contain"
              />
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
