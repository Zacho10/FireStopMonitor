import Link from "next/link";
import { notFound } from "next/navigation";
import { PrintReportButton } from "@/components/PrintReportButton";
import { getLocale } from "@/lib/i18n";
import { getFirestopStatusLabel } from "@/lib/firestop-status";
import { summarizeFirestopsByStatus } from "@/lib/firestop-summary";
import { requireProjectAccess } from "@/lib/project-access";
import { getProjectReportData } from "@/lib/report-data";

type ProjectReportPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectReportPage({
  params,
}: ProjectReportPageProps) {
  const { id } = await params;
  const locale = await getLocale();
  await requireProjectAccess(id);
  const { project, floorplans, firestops, error } = await getProjectReportData(id);
  const copy =
    locale === "el"
      ? {
          error: "Δεν ήταν δυνατή η φόρτωση της αναφοράς έργου",
          back: "Επιστροφή στο έργο",
          export: "Εξαγωγή CSV",
          eyebrow: "Αναφορά Έργου",
          client: "Πελάτης",
          address: "Διεύθυνση",
          floorplans: "Κατόψεις",
          totalFirestops: "Σύνολο πυροφραγών",
          pending: "Εκκρεμεί",
          installed: "Τοποθετημένες",
          approved: "Εγκεκριμένες",
          rejected: "Απορριφθείσες",
          statusBreakdown: "Ανάλυση Καταστάσεων",
          byFloor: "Πυροφραγές ανά Όροφο / Περιοχή",
          noFloorSummary: "Δεν υπάρχει ακόμα σύνοψη ανά κάτοψη.",
          floorSection: "Όροφος / Τμήμα",
          firestops: "Πυροφραγές",
          roomZone: "Χώρος / Ζώνη",
          location: "Τοποθεσία",
          drawingArea: "Σχέδιο / Περιοχή",
          system: "Σύστημα",
          rating: "Κατάταξη",
          substrate: "Υπόστρωμα",
          installedBy: "Τοποθέτησε",
          installationDate: "Ημερομηνία τοποθέτησης",
          inspectedBy: "Επιθεώρησε",
          inspectionDate: "Ημερομηνία επιθεώρησης",
          inspectionNotes: "Σημειώσεις επιθεώρησης",
          notes: "Σημειώσεις",
          beforePhoto: "Φωτογραφία πριν",
          afterPhoto: "Φωτογραφία μετά",
          noBeforePhoto: "Δεν υπάρχει φωτογραφία πριν",
          noAfterPhoto: "Δεν υπάρχει φωτογραφία μετά",
          noFirestops: "Δεν βρέθηκαν πυροφραγές για αυτό το έργο.",
        }
      : {
          error: "Could not load project report",
          back: "Back to project",
          export: "Export CSV",
          eyebrow: "Project Report",
          client: "Client",
          address: "Address",
          floorplans: "Floorplans",
          totalFirestops: "Total firestops",
          pending: "Pending",
          installed: "Installed",
          approved: "Approved",
          rejected: "Rejected",
          statusBreakdown: "Status Breakdown",
          byFloor: "Firestops by Floor / Area",
          noFloorSummary: "No floor summary available yet.",
          floorSection: "Floor / Section",
          firestops: "Firestops",
          roomZone: "Room / Zone",
          location: "Location",
          drawingArea: "Drawing / Area",
          system: "System",
          rating: "Rating",
          substrate: "Substrate",
          installedBy: "Installed by",
          installationDate: "Installation date",
          inspectedBy: "Inspected by",
          inspectionDate: "Inspection date",
          inspectionNotes: "Inspection notes",
          notes: "Notes",
          beforePhoto: "Before photo",
          afterPhoto: "After photo",
          noBeforePhoto: "No before photo",
          noAfterPhoto: "No after photo",
          noFirestops: "No firestops found for this project.",
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

  if (!project) {
    notFound();
  }

  const floorplansById = new Map(floorplans.map((floorplan) => [floorplan.id, floorplan]));
  const firestopSummary = summarizeFirestopsByStatus(firestops);
  const pendingCount =
    firestopSummary.new + firestopSummary.to_install + firestopSummary.to_inspect;
  const floorSummary = floorplans
    .map((floorplan) => {
      const count = firestops.filter(
        (firestop) => firestop.floorplan_id === floorplan.id
      ).length;

      return {
        id: floorplan.id,
        title: floorplan.title,
        floorName: floorplan.floor_name || "-",
        count,
      };
    })
    .sort((a, b) => b.count - a.count);
  const groupedByFloorplan = floorplans
    .map((floorplan) => ({
      floorplan,
      firestops: firestops.filter(
        (firestop) => firestop.floorplan_id === floorplan.id
      ),
    }))
    .filter((group) => group.firestops.length > 0);

  return (
    <main className="min-h-screen bg-white px-6 py-10 text-slate-900">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 print:hidden">
          <div className="flex gap-3">
            <Link
              href={`/projects/${project.id}`}
              className="inline-flex min-h-14 min-w-[176px] shrink-0 whitespace-nowrap items-center justify-center gap-2 rounded-[1.75rem] border border-slate-300 bg-white px-6 py-4 text-base font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50"
            >
              <span className="text-slate-400">←</span>
              {copy.back}
            </Link>
            <a
              href={`/projects/${project.id}/export`}
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
            {project.name}
          </h1>
          <div className="mt-4 grid gap-2 text-sm text-slate-600 md:grid-cols-3">
            <p>
              <span className="font-medium text-slate-800">{copy.client}:</span>{" "}
              {project.client || "-"}
            </p>
            <p>
              <span className="font-medium text-slate-800">{copy.address}:</span>{" "}
              {project.site_address || "-"}
            </p>
            <p>
              <span className="font-medium text-slate-800">{copy.floorplans}:</span>{" "}
              {floorplans.length}
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

        <section className="mb-10 grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              {copy.statusBreakdown}
            </h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
                <p className="text-sm text-slate-500">{getFirestopStatusLabel("installed", locale)}</p>
                <p className="mt-3 text-2xl font-semibold leading-none text-amber-600">
                  {firestopSummary.installed}
                </p>
              </div>
              <div className="flex min-h-[112px] flex-col items-center justify-center rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-500">{getFirestopStatusLabel("approved", locale)}</p>
                <p className="mt-3 text-2xl font-semibold leading-none text-green-600">
                  {firestopSummary.approved}
                </p>
              </div>
              <div className="flex min-h-[112px] flex-col items-center justify-center rounded-xl bg-slate-50 p-4 text-center">
                <p className="text-sm text-slate-500">{getFirestopStatusLabel("rejected", locale)}</p>
                <p className="mt-3 text-2xl font-semibold leading-none text-red-600">
                  {firestopSummary.rejected}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              {copy.byFloor}
            </h2>
            <div className="mt-4 space-y-3">
              {floorSummary.length ? (
                floorSummary.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {item.title}
                      </p>
                      <p className="text-xs text-slate-500">{item.floorName}</p>
                    </div>
                    <p className="text-lg font-semibold text-slate-900">
                      {item.count}
                    </p>
                  </div>
                ))
              ) : (
                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
                  {copy.noFloorSummary}
                </div>
              )}
            </div>
          </div>
        </section>

        <section className="space-y-10">
          {groupedByFloorplan.length ? (
            groupedByFloorplan.map(({ floorplan, firestops: groupFirestops }) => (
              <section key={floorplan.id} className="space-y-6">
                <div className="border-b border-slate-200 pb-4">
                  <h2 className="text-2xl font-semibold text-slate-900">
                    {floorplan.title}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600">
                    {copy.floorSection}: {floorplan.floor_name || "-"} • {copy.firestops}:{" "}
                    {groupFirestops.length}
                  </p>
                </div>

                <div className="space-y-6">
                  {groupFirestops.map((firestop) => {
                    const floorplanMeta = floorplansById.get(firestop.floorplan_id);

                    return (
                      <article
                        key={firestop.id}
                        className="break-inside-avoid rounded-2xl border border-slate-200 p-6 shadow-sm"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <h3 className="text-xl font-semibold text-slate-900">
                              {firestop.code}
                            </h3>
                            <p className="mt-1 text-sm text-slate-600">
                              {firestop.type}
                            </p>
                          </div>
                          <div className="rounded-full bg-slate-100 px-3 py-1 text-sm font-medium text-slate-700">
                            {getFirestopStatusLabel(firestop.status, locale)}
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 text-sm text-slate-600 md:grid-cols-2 xl:grid-cols-4">
                          <p>
                            <span className="font-medium text-slate-800">
                              {copy.roomZone}:
                            </span>{" "}
                            {firestop.room_zone || "-"}
                          </p>
                          <p>
                            <span className="font-medium text-slate-800">
                              {copy.location}:
                            </span>{" "}
                            {firestop.location_description || "-"}
                          </p>
                          <p>
                            <span className="font-medium text-slate-800">
                              {copy.floorSection}:
                            </span>{" "}
                            {floorplanMeta?.floor_name || "-"}
                          </p>
                          <p>
                            <span className="font-medium text-slate-800">
                              {copy.drawingArea}:
                            </span>{" "}
                            {floorplanMeta?.title || "-"}
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
                            <span className="font-medium text-slate-800">
                              {copy.substrate}:
                            </span>{" "}
                            {firestop.substrate || "-"}
                          </p>
                          <p>
                            <span className="font-medium text-slate-800">
                              {copy.installedBy}:
                            </span>{" "}
                            {firestop.installed_by || "-"}
                          </p>
                          <p>
                            <span className="font-medium text-slate-800">
                              {copy.installationDate}:
                            </span>{" "}
                            {firestop.installed_at
                              ? new Date(firestop.installed_at).toLocaleDateString()
                              : "-"}
                          </p>
                          <p>
                            <span className="font-medium text-slate-800">
                              {copy.inspectedBy}:
                            </span>{" "}
                            {firestop.inspected_by || "-"}
                          </p>
                          <p>
                            <span className="font-medium text-slate-800">
                              {copy.inspectionDate}:
                            </span>{" "}
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
                            <span className="font-medium text-slate-800">
                              {copy.notes}:
                            </span>{" "}
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
                    );
                  })}
                </div>
              </section>
            ))
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-6 text-slate-600">
              {copy.noFirestops}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
