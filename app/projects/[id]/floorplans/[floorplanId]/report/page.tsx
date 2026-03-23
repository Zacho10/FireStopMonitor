import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintReportButton } from "@/components/PrintReportButton";
import { getLocale } from "@/lib/i18n";
import { getFirestopStatusLabel } from "@/lib/firestop-status";
import { summarizeFirestopsByStatus } from "@/lib/firestop-summary";
import { requireProjectAccess } from "@/lib/project-access";
import { getFloorplanReportData } from "@/lib/report-data";

type FloorplanReportPageProps = {
  params: Promise<{
    id: string;
    floorplanId: string;
  }>;
};

export default async function FloorplanReportPage({
  params,
}: FloorplanReportPageProps) {
  const { id, floorplanId } = await params;
  const locale = await getLocale();
  await requireProjectAccess(id);
  const { project, floorplan, firestops, error } = await getFloorplanReportData(
    id,
    floorplanId
  );
  const copy =
    locale === "el"
      ? {
          error: "Δεν ήταν δυνατή η φόρτωση της αναφοράς κάτοψης",
          back: "Επιστροφή στην κάτοψη",
          export: "Εξαγωγή CSV",
          eyebrow: "Αναφορά Κάτοψης",
          project: "Έργο",
          floorSection: "Όροφος / Τμήμα",
          firestops: "Πυροφραγές",
          totalFirestops: "Σύνολο πυροφραγών",
          pending: "Εκκρεμεί",
          installed: "Τοποθετημένες",
          approved: "Εγκεκριμένες",
          rejected: "Απορριφθείσες",
          statusBreakdown: "Ανάλυση Καταστάσεων",
          roomZone: "Χώρος / Ζώνη",
          location: "Τοποθεσία",
          system: "Σύστημα",
          rating: "Κατάταξη",
          substrate: "Υπόστρωμα",
          installedBy: "Τοποθέτησε",
          inspectedBy: "Επιθεώρησε",
          inspectionDate: "Ημερομηνία επιθεώρησης",
          inspectionNotes: "Σημειώσεις επιθεώρησης",
          notes: "Σημειώσεις",
          beforePhoto: "Φωτογραφία πριν",
          afterPhoto: "Φωτογραφία μετά",
          noBeforePhoto: "Δεν υπάρχει φωτογραφία πριν",
          noAfterPhoto: "Δεν υπάρχει φωτογραφία μετά",
        }
      : {
          error: "Could not load floorplan report",
          back: "Back to floorplan",
          export: "Export CSV",
          eyebrow: "Floorplan Report",
          project: "Project",
          floorSection: "Floor / Section",
          firestops: "Firestops",
          totalFirestops: "Total firestops",
          pending: "Pending",
          installed: "Installed",
          approved: "Approved",
          rejected: "Rejected",
          statusBreakdown: "Status Breakdown",
          roomZone: "Room / Zone",
          location: "Location",
          system: "System",
          rating: "Rating",
          substrate: "Substrate",
          installedBy: "Installed by",
          inspectedBy: "Inspected by",
          inspectionDate: "Inspection date",
          inspectionNotes: "Inspection notes",
          notes: "Notes",
          beforePhoto: "Before photo",
          afterPhoto: "After photo",
          noBeforePhoto: "No before photo",
          noAfterPhoto: "No after photo",
        };

  if (error) {
    return (
      <main className="min-h-screen bg-white px-6 py-10 text-slate-900">
        <div className="mx-auto max-w-6xl rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {copy.error}: {error}
        </div>
      </main>
    );
  }

  if (!project || !floorplan) {
    notFound();
  }

  const firestopSummary = summarizeFirestopsByStatus(firestops);
  const pendingCount =
    firestopSummary.new + firestopSummary.to_install + firestopSummary.to_inspect;

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex gap-3">
            <Link
              href={`/projects/${project.id}/floorplans/${floorplan.id}`}
              className="inline-flex min-h-14 min-w-[186px] shrink-0 whitespace-nowrap items-center justify-center gap-2 rounded-[1.75rem] border border-slate-300 bg-white px-6 py-4 text-base font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
            >
              <span className="text-slate-400">←</span>
              {copy.back}
            </Link>
            <a
              href={`/projects/${project.id}/floorplans/${floorplan.id}/export`}
              className="inline-flex min-h-14 min-w-[168px] shrink-0 whitespace-nowrap items-center justify-center gap-2 rounded-[1.75rem] bg-slate-900 px-6 py-4 text-base font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-700"
            >
              <span className="text-slate-300">↓</span>
              {copy.export}
            </a>
          </div>
          <PrintReportButton locale={locale} />
        </div>

        <header className="mb-10 border-b border-slate-200 pb-6">
          <p className="text-sm uppercase tracking-[0.16em] text-slate-500">
            {copy.eyebrow}
          </p>
          <h1 className="mt-2 text-4xl font-semibold text-slate-900">
            {floorplan.title}
          </h1>
          <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
            <p>
              <span className="font-medium text-slate-800">{copy.project}:</span>{" "}
              {project.name}
            </p>
            <p>
              <span className="font-medium text-slate-800">{copy.floorSection}:</span>{" "}
              {floorplan.floor_name || "-"}
            </p>
            <p>
              <span className="font-medium text-slate-800">{copy.firestops}:</span>{" "}
              {firestops.length}
            </p>
          </div>
        </header>

        <section className="mb-10">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
            <div className="flex min-h-[132px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-500">{copy.totalFirestops}</p>
              <p className="mt-3 text-3xl font-semibold leading-none text-slate-900">
                {firestops.length}
              </p>
            </div>
            <div className="flex min-h-[132px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-500">{copy.pending}</p>
              <p className="mt-3 text-3xl font-semibold leading-none text-slate-900">
                {pendingCount}
              </p>
            </div>
            <div className="flex min-h-[132px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-500">{copy.installed}</p>
              <p className="mt-3 text-3xl font-semibold leading-none text-amber-600">
                {firestopSummary.installed}
              </p>
            </div>
            <div className="flex min-h-[132px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-500">{copy.approved}</p>
              <p className="mt-3 text-3xl font-semibold leading-none text-green-600">
                {firestopSummary.approved}
              </p>
            </div>
            <div className="flex min-h-[132px] flex-col items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 p-6 text-center">
              <p className="text-sm text-slate-500">{copy.rejected}</p>
              <p className="mt-3 text-3xl font-semibold leading-none text-red-600">
                {firestopSummary.rejected}
              </p>
            </div>
          </div>
        </section>

        <section className="mb-10 rounded-2xl border border-slate-200 p-6">
          <h2 className="text-lg font-semibold text-slate-900">
            {copy.statusBreakdown}
          </h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="flex min-h-[112px] flex-col items-center justify-center rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-500">{getFirestopStatusLabel("new", locale)}</p>
              <p className="mt-3 text-2xl font-semibold leading-none text-slate-900">
                {firestopSummary.new}
              </p>
            </div>
            <div className="flex min-h-[112px] flex-col items-center justify-center rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-500">{getFirestopStatusLabel("to_install", locale)}</p>
              <p className="mt-3 text-2xl font-semibold leading-none text-slate-900">
                {firestopSummary.to_install}
              </p>
            </div>
            <div className="flex min-h-[112px] flex-col items-center justify-center rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-500">{getFirestopStatusLabel("to_inspect", locale)}</p>
              <p className="mt-3 text-2xl font-semibold leading-none text-slate-900">
                {firestopSummary.to_inspect}
              </p>
            </div>
            <div className="flex min-h-[112px] flex-col items-center justify-center rounded-xl bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-500">{getFirestopStatusLabel("repaired", locale)}</p>
              <p className="mt-3 text-2xl font-semibold leading-none text-slate-900">
                {firestopSummary.repaired}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-6">
          {firestops.length ? (
            firestops.map((firestop) => (
              <article
                key={firestop.id}
                className="break-inside-avoid rounded-2xl border border-slate-200 p-6 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-900">
                      {firestop.code}
                    </h2>
                    <p className="mt-1 text-sm text-slate-600">{firestop.type}</p>
                  </div>
                  <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                    {getFirestopStatusLabel(firestop.status, locale)}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                  <p>
                    <span className="font-medium text-slate-800">{copy.roomZone}:</span>{" "}
                    {firestop.room_zone || "-"}
                  </p>
                  <p>
                    <span className="font-medium text-slate-800">{copy.location}:</span>{" "}
                    {firestop.location_description || "-"}
                  </p>
                  <p>
                    <span className="font-medium text-slate-800">{copy.system}:</span>{" "}
                    {firestop.system_name || "-"}
                  </p>
                  <p>
                    <span className="font-medium text-slate-800">{copy.rating}:</span>{" "}
                    {firestop.fire_rating || "-"}
                  </p>
                  <p>
                    <span className="font-medium text-slate-800">{copy.substrate}:</span>{" "}
                    {firestop.substrate || "-"}
                  </p>
                  <p>
                    <span className="font-medium text-slate-800">{copy.installedBy}:</span>{" "}
                    {firestop.installed_by || "-"}
                  </p>
                  <p>
                    <span className="font-medium text-slate-800">{copy.inspectedBy}:</span>{" "}
                    {firestop.inspected_by || "-"}
                  </p>
                  <p>
                    <span className="font-medium text-slate-800">{copy.inspectionDate}:</span>{" "}
                    {firestop.inspection_date
                      ? new Date(firestop.inspection_date).toLocaleDateString()
                      : "-"}
                  </p>
                </div>

                {firestop.inspection_notes && (
                  <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                    <span className="font-medium text-slate-800">
                      {copy.inspectionNotes}:
                    </span>{" "}
                    {firestop.inspection_notes}
                  </div>
                )}

                {firestop.notes && (
                  <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                    <span className="font-medium text-slate-800">{copy.notes}:</span>{" "}
                    {firestop.notes}
                  </div>
                )}

                <div className="mt-6 grid gap-4 md:grid-cols-2">
                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="mb-3 text-sm font-medium text-slate-800">
                      {copy.beforePhoto}
                    </p>
                    {firestop.photos.before ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={firestop.photos.before.file_url}
                        alt={`${firestop.code} before`}
                        className="w-full rounded-xl border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                        {copy.noBeforePhoto}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-slate-200 p-4">
                    <p className="mb-3 text-sm font-medium text-slate-800">
                      {copy.afterPhoto}
                    </p>
                    {firestop.photos.after ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={firestop.photos.after.file_url}
                        alt={`${firestop.code} after`}
                        className="w-full rounded-xl border border-slate-200 object-cover"
                      />
                    ) : (
                      <div className="flex h-56 items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 text-sm text-slate-500">
                        {copy.noAfterPhoto}
                      </div>
                    )}
                  </div>
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
              No firestops found for this floorplan.
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
