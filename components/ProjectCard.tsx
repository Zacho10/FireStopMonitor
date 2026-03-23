import Link from "next/link";
import { DeleteProjectButton } from "@/components/DeleteProjectButton";
import { EditProjectForm } from "@/components/EditProjectForm";
import { summarizeFirestopsByStatus } from "@/lib/firestop-summary";
import type { AppLocale } from "@/lib/i18n";
import type { Firestop, Floorplan, Project } from "@/types/database";

type ProjectCardProps = {
  project: Project;
  floorplans?: Floorplan[];
  firestops?: Firestop[];
  locale: AppLocale;
  onEdit: (formData: FormData) => Promise<void>;
  onDelete: (formData: FormData) => Promise<void>;
  canManage: boolean;
};

export function ProjectCard({
  project,
  floorplans = [],
  firestops = [],
  locale,
  onEdit,
  onDelete,
  canManage,
}: ProjectCardProps) {
  const summary = summarizeFirestopsByStatus(firestops);
  const pendingCount = summary.new + summary.to_install + summary.to_inspect;
  const copy =
    locale === "el"
      ? {
          noClient: "Χωρίς πελάτη ακόμα",
          floor: "όροφος",
          floors: "όροφοι",
          firestops: "Πυροφραγές",
          pending: "Εκκρεμεί",
          approved: "Εγκεκριμένα",
          client: "Πελάτης",
          address: "Διεύθυνση",
        }
      : {
          noClient: "No client yet",
          floor: "floor",
          floors: "floors",
          firestops: "Firestops",
          pending: "Pending",
          approved: "Approved",
          client: "Client",
          address: "Address",
        };

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md sm:p-6">
      <Link href={`/projects/${project.id}`} className="block">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 sm:text-xl">{project.name}</h2>
            <p className="mt-1 text-sm text-slate-500">{project.client || copy.noClient}</p>
          </div>
          <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {floorplans.length} {floorplans.length === 1 ? copy.floor : copy.floors}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-slate-50 px-3 py-3 text-center">
            <p className="text-xs uppercase tracking-wide text-slate-400">{copy.firestops}</p>
            <p className="mt-2 text-xl font-semibold text-slate-900">{firestops.length}</p>
          </div>
          <div className="rounded-2xl bg-amber-50 px-3 py-3 text-center">
            <p className="text-xs uppercase tracking-wide text-amber-600">{copy.pending}</p>
            <p className="mt-2 text-xl font-semibold text-amber-700">{pendingCount}</p>
          </div>
          <div className="rounded-2xl bg-green-50 px-3 py-3 text-center">
            <p className="text-xs uppercase tracking-wide text-green-600">{copy.approved}</p>
            <p className="mt-2 text-xl font-semibold text-green-700">{summary.approved}</p>
          </div>
        </div>

        <div className="mt-4 space-y-1 text-sm text-slate-600">
          <p>
            <span className="font-medium text-slate-700">{copy.client}:</span>{" "}
            {project.client || "-"}
          </p>
          <p>
            <span className="font-medium text-slate-700">{copy.address}:</span>{" "}
            {project.site_address || "-"}
          </p>
        </div>
      </Link>

      {canManage ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:justify-end">
          <EditProjectForm
            projectId={project.id}
            initialName={project.name}
            initialClient={project.client}
            initialSiteAddress={project.site_address}
            locale={locale}
            action={onEdit}
          />
          <DeleteProjectButton
            projectId={project.id}
            projectName={project.name}
            action={onDelete}
          />
        </div>
      ) : null}
    </div>
  );
}
