import Link from "next/link";
import { FloorplanCard } from "@/components/FloorplanCard";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import {
  getFloorplansByProjectId,
  getProjectById,
} from "@/lib/project-details";

type ProjectDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;

  const [{ data: project, error: projectError }, { data: floorplans, error: floorplansError }] =
    await Promise.all([
      getProjectById(id),
      getFloorplansByProjectId(id),
    ]);

  if (projectError) {
    return (
      <main className="min-h-screen bg-slate-50 text-slate-900">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            Error loading project: {projectError}
          </div>
        </div>
      </main>
    );
  }

  if (!project) {
    notFound();
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            ← Back to projects
          </Link>
        </div>

        <PageHeader
          eyebrow="Project Detail"
          title={project.name}
          description="Στοιχεία έργου και διαθέσιμες κατόψεις."
        />

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">
              Project Information
            </h2>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-800">Client:</span>{" "}
                {project.client || "-"}
              </p>
              <p>
                <span className="font-medium text-slate-800">Address:</span>{" "}
                {project.site_address || "-"}
              </p>
              <p>
                <span className="font-medium text-slate-800">Project ID:</span>{" "}
                {project.id}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Summary</h2>

            <div className="mt-4 space-y-2 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-800">Floorplans:</span>{" "}
                {floorplans?.length ?? 0}
              </p>
            </div>
          </div>
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">Floorplans</h2>
          </div>

          {floorplansError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              Error loading floorplans: {floorplansError}
            </div>
          )}

          {!floorplans?.length && !floorplansError && (
            <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
              No floorplans found for this project.
            </div>
          )}

          {floorplans?.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {floorplans.map((floorplan) => (
                <FloorplanCard
                 key={floorplan.id}
                 projectId={project.id}
                 floorplan={floorplan}
                />
             ))}

            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}