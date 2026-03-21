import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { getFloorplanById } from "@/lib/floorplans";
import { getProjectById } from "@/lib/project-details";
import { FloorplanViewer } from "@/components/FloorplanViewer";
import { getFirestopsByFloorplanId } from "@/lib/firestops";
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

  const [
    { data: project, error: projectError },
    { data: floorplan, error: floorplanError },{ data: firestops, error: firestopsError }
  ] = await Promise.all([
    getProjectById(id),
    getFloorplanById(floorplanId, id),getFirestopsByFloorplanId(floorplanId),
  ]);

  if (projectError || floorplanError) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p>Project error: {projectError || "none"}</p>
            <p>Floorplan error: {floorplanError || "none"}</p>
            <p>Firestops error: {firestopsError || "none"}</p>
          </div>
        </div>
      </main>
    );
  }

  if (!project || !floorplan) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-6 flex flex-wrap gap-4 text-sm text-slate-600">
          <Link href="/" className="font-medium transition hover:text-slate-900">
            Projects
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

        <PageHeader
          eyebrow="Floorplan Viewer"
          title={floorplan.title}
          description="Προβολή κάτοψης. Εδώ θα προστεθούν pins πυροφραγών στο επόμενο βήμα."
        />
        <form
  action={updateFloorplanImage}
  className="mb-6 flex items-center gap-3"
>
  <input type="hidden" name="projectId" value={project.id} />
  <input type="hidden" name="floorplanId" value={floorplan.id} />

  <input
    type="file"
    name="file"
    accept="image/png,image/jpeg,image/jpg,image/webp"
    className="text-sm"
  />

  <button
    type="submit"
    className="rounded-xl bg-slate-900 px-4 py-2 text-sm text-white"
  >
    Upload floorplan
  </button>
</form>
        

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Floor</p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {floorplan.floor_name || "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Width</p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {floorplan.width || "-"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-slate-500">Height</p>
            <p className="mt-1 text-base font-semibold text-slate-900">
              {floorplan.height || "-"}
            </p>
          </div>
        </div>

        <FloorplanViewer
  projectId={project.id}
  floorplanId={floorplan.id}
  imageUrl={floorplan.image_url}
  title={floorplan.title}
  firestops={firestops || []}
/>
      </div>
    </main>
  );
}