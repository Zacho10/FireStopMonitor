import { PageHeader } from "@/components/PageHeader";
import { ProjectCard } from "@/components/ProjectCard";
import { getProjects } from "@/lib/projects";

export default async function HomePage() {
  const { data: projects, error } = await getProjects();

  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <PageHeader
          eyebrow="Firestop Tracker"
          title="Projects"
          description="Παρακολούθηση έργων, κατόψεων και πυροφραγών σε μία οργανωμένη πλατφόρμα."
        />

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            Error loading projects: {error}
          </div>
        )}

        {!error && !projects?.length && (
          <div className="rounded-xl border border-slate-200 bg-white p-6 text-slate-600">
            No projects found.
          </div>
        )}

        {projects?.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}