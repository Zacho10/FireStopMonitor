import Link from "next/link";
import { notFound } from "next/navigation";
import { BrandIdentity } from "@/components/BrandIdentity";
import { requireProjectAccess } from "@/lib/project-access";
import { attachPhotosToFirestops, getFirestopPhotosByFirestopIds } from "@/lib/firestop-photos";
import { getFloorplanById } from "@/lib/floorplans";
import { getProjectById } from "@/lib/project-details";
import { FloorplanViewer } from "@/components/FloorplanViewer";
import { UploadFloorplanForm } from "@/components/UploadFloorplanForm";
import { getFirestopsByFloorplanId } from "@/lib/firestops";
import { getLocale } from "@/lib/i18n";
import type { FirestopWithPhotos } from "@/types/database";
import { updateFloorplanImage } from "./actions";


type FloorplanViewerPageProps = {
  params: Promise<{
    id: string;
    floorplanId: string;
  }>;
};

export default async function FloorplanViewerPage({
  params,
}: FloorplanViewerPageProps) {
  const { id, floorplanId } = await params;
  const { canEdit } = await requireProjectAccess(id);
  const locale = await getLocale();

  const [
    { data: project, error: projectError },
    { data: floorplan, error: floorplanError },
    { data: firestops, error: firestopsError },
  ] = await Promise.all([
    getProjectById(id),
    getFloorplanById(floorplanId, id),
    getFirestopsByFloorplanId(floorplanId),
  ]);

  const firestopIds = firestops?.map((firestop) => firestop.id) || [];
  const { data: firestopPhotos, error: firestopPhotosError } =
    await getFirestopPhotosByFirestopIds(firestopIds);
  const firestopsWithPhotos: FirestopWithPhotos[] = attachPhotosToFirestops(
    firestops || [],
    firestopPhotos || []
  );

  if (projectError || floorplanError) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p>Project error: {projectError || "none"}</p>
            <p>Floorplan error: {floorplanError || "none"}</p>
            <p>Firestops error: {firestopsError || "none"}</p>
            <p>Firestop photos error: {firestopPhotosError || "none"}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!project || !floorplan) {
    notFound();
  }

  const copy =
    locale === "el"
      ? {
          projects: "Έργα",
          viewer: "Προβολή Κάτοψης",
          desc:
            "Προβολή κάτοψης, διαχείριση pins πυροφραγών και αποθήκευση before/after φωτογραφιών για το συγκεκριμένο floor ή area.",
          area: "Area",
          access: "Πρόσβαση",
          editor: "Επεξεργασία",
          viewerRole: "Προβολή",
          viewReport: "Προβολή report",
          exportCsv: "Εξαγωγή CSV",
          firestops: "Πυροφραγές",
          photosLinked: "Φωτογραφίες",
          floorSection: "Όροφος / Ενότητα",
          drawingArea: "Σχέδιο / Περιοχή",
          readonly:
            "Πρόσβαση μόνο για ανάγνωση. Τα uploads κατόψεων και οι αλλαγές pins είναι απενεργοποιημένα για τον λογαριασμό σου.",
        }
      : {
          projects: "Projects",
          viewer: "Floorplan Viewer",
          desc:
            "View the floorplan, manage firestop pins, and store before/after photos for this floor or area.",
          area: "Area",
          access: "Access",
          editor: "Editor",
          viewerRole: "Viewer",
          viewReport: "View report",
          exportCsv: "Export CSV",
          firestops: "Firestops",
          photosLinked: "Photos linked",
          floorSection: "Floor / Section",
          drawingArea: "Drawing / Area",
          readonly:
            "Read-only access. Floorplan uploads and pin changes are disabled for your account.",
        };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] text-slate-900">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="mb-6 flex flex-wrap gap-4 text-sm text-slate-600">
          <Link href="/" className="font-medium transition hover:text-slate-900">
            {copy.projects}
          </Link>
          <span>→</span>
          <Link
            href={`/projects/${project.id}`}
            className="font-medium transition hover:text-slate-900"
          >
            {project.name}
          </Link>
          <span>→</span>
          <span>{floorplan.title}</span>
        </div>

        <section className="mb-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-12">
            <div>
              <BrandIdentity />
              <p className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                {copy.viewer}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                {floorplan.title}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                {copy.desc}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                  {project.name}
                </span>
                <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-500 ring-1 ring-slate-200">
                  {floorplan.floor_name || copy.area}
                </span>
                <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-500 ring-1 ring-slate-200">
                  {copy.access}: {canEdit ? copy.editor : copy.viewerRole}
                </span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/projects/${project.id}/floorplans/${floorplan.id}/report`}
                  className="inline-flex min-h-14 w-full shrink-0 whitespace-nowrap items-center justify-center gap-2 rounded-[1.75rem] border border-slate-300 bg-white px-6 py-4 text-base font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 sm:min-w-[168px] sm:w-auto"
                >
                  <span className="text-slate-400">→</span>
                  {copy.viewReport}
                </Link>
                <a
                  href={`/projects/${project.id}/floorplans/${floorplan.id}/export`}
                  className="inline-flex min-h-14 w-full shrink-0 whitespace-nowrap items-center justify-center gap-2 rounded-[1.75rem] bg-slate-900 px-6 py-4 text-base font-medium text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-700 sm:min-w-[168px] sm:w-auto"
                >
                  <span className="text-slate-300">↓</span>
                  {copy.exportCsv}
                </a>
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-slate-50 p-3 sm:bg-transparent sm:p-0">
              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                <div className="rounded-3xl bg-slate-900 p-6 text-white">
                  <p className="text-sm text-slate-300">{copy.firestops}</p>
                  <p className="mt-3 text-3xl font-semibold">{firestopsWithPhotos.length}</p>
                </div>
                <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">{copy.photosLinked}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {
                      firestopsWithPhotos.filter(
                        (firestop) => firestop.photos.before || firestop.photos.after
                      ).length
                    }
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">{copy.floorSection}</p>
                  <p className="mt-3 text-xl font-semibold text-slate-900">
                    {floorplan.floor_name || "-"}
                  </p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-6 ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">{copy.drawingArea}</p>
                  <p className="mt-3 text-xl font-semibold text-slate-900">
                    {floorplan.title}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {canEdit ? (
          <UploadFloorplanForm
            projectId={project.id}
            floorplanId={floorplan.id}
            locale={locale}
            action={updateFloorplanImage}
          />
        ) : (
          <div className="mb-6 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
            {copy.readonly}
          </div>
        )}

        {firestopPhotosError && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
            Firestop photos could not be loaded: {firestopPhotosError}
          </div>
        )}

        <FloorplanViewer
          projectId={project.id}
          floorplanId={floorplan.id}
          imageUrl={floorplan.image_url}
          title={floorplan.title}
          firestops={firestopsWithPhotos}
          canEdit={canEdit}
          locale={locale}
        />
      </div>
    </main>
  );
}
