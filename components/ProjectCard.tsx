import Link from "next/link";
import type { Project } from "@/types/database";

type ProjectCardProps = {
  project: Project;
};

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link
      href={`/projects/${project.id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-slate-300"
    >
      <h2 className="text-xl font-semibold text-slate-900">{project.name}</h2>

      <div className="mt-3 space-y-1 text-sm text-slate-600">
        <p>
          <span className="font-medium text-slate-700">Client:</span>{" "}
          {project.client || "-"}
        </p>
        <p>
          <span className="font-medium text-slate-700">Address:</span>{" "}
          {project.site_address || "-"}
        </p>
      </div>
    </Link>
  );
}