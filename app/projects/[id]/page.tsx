import Link from "next/link";
import { BrandIdentity } from "@/components/BrandIdentity";
import { CreateFloorplanForm } from "@/components/CreateFloorplanForm";
import { FloorplanCard } from "@/components/FloorplanCard";
import { ProjectTeamManager } from "@/components/ProjectTeamManager";
import { notFound } from "next/navigation";
import {
  getProjectMembershipsByProjectId,
  requireProjectAccess,
} from "@/lib/project-access";
import { getProjectAuditLogs, getUsers } from "@/lib/user-admin";
import { createFloorplan, deleteFloorplan, updateFloorplan } from "./actions";
import {
  removeProjectAccessAction,
  upsertProjectAccessAction,
} from "@/app/users/actions";
import { getFirestopsByProjectId } from "@/lib/firestops";
import { summarizeFirestopsByStatus } from "@/lib/firestop-summary";
import {
  getFloorplansByProjectId,
  getProjectById,
} from "@/lib/project-details";
import { getLocale } from "@/lib/i18n";

type ProjectDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ProjectDetailPage({
  params,
}: ProjectDetailPageProps) {
  const { id } = await params;
  const { canEdit, session } = await requireProjectAccess(id);
  const locale = await getLocale();

  const [
    { data: project, error: projectError },
    { data: floorplans, error: floorplansError },
    { data: firestops, error: firestopsError },
    { data: users, error: usersError },
    { data: memberships, error: membershipsError },
    { data: projectAuditLogs, error: projectAuditLogsError },
  ] =
    await Promise.all([
      getProjectById(id),
      getFloorplansByProjectId(id),
      getFirestopsByProjectId(id),
      session.role === "admin" ? getUsers() : Promise.resolve({ data: null, error: null }),
      session.role === "admin"
        ? getProjectMembershipsByProjectId(id)
        : Promise.resolve({ data: null, error: null }),
      session.role === "admin"
        ? getProjectAuditLogs(id, 12)
        : Promise.resolve({ data: null, error: null }),
    ]);

  const firestopSummary = summarizeFirestopsByStatus(firestops || []);

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

  const pendingCount =
    firestopSummary.new + firestopSummary.to_install + firestopSummary.to_inspect;
  const copy =
    locale === "el"
      ? {
          back: "← Πίσω στα έργα",
          overview: "Επισκόπηση Έργου",
          desc:
            "Στοιχεία έργου, ομάδας, πρόσφατης δραστηριότητας και διαθέσιμων κατόψεων συγκεντρωμένα σε ένα σημείο.",
          noClient: "Χωρίς πελάτη ακόμα",
          access: "Πρόσβαση",
          editor: "Επεξεργασία",
          viewer: "Προβολή",
          viewReport: "Προβολή report",
          exportCsv: "Εξαγωγή CSV",
          floorplans: "Κατόψεις",
          firestops: "Πυροφραγές",
          pending: "Εκκρεμεί",
          approved: "Εγκεκριμένα",
          projectDetails: "Στοιχεία Έργου",
          client: "Πελάτης",
          projectId: "Project ID",
          address: "Διεύθυνση",
          statusSnapshot: "Κατάσταση",
          installed: "Τοποθετημένα",
          rejected: "Απορριφθέντα",
          activityFeed: "Ροή Δραστηριότητας",
          recentActivity: "Πρόσφατη Δραστηριότητα",
          activityDesc: "Οι τελευταίες ενέργειες που έγιναν σε αυτό το project.",
          noActivity: "Δεν υπάρχει ακόμα πρόσφατη δραστηριότητα για αυτό το project.",
          drawings: "Σχέδια",
          noFloorplans: "Δεν υπάρχουν ακόμα κατόψεις",
          noFloorplansEdit:
            "Πρόσθεσε το πρώτο floor ή area για να αρχίσεις να τοποθετείς πυροφραγές πάνω σε σχέδιο.",
          noFloorplansView: "Δεν υπάρχουν ακόμα διαθέσιμες κατόψεις σε αυτό το project.",
        }
      : {
          back: "← Back to projects",
          overview: "Project Overview",
          desc:
            "Project details, team access, recent activity, and available floorplans in one place.",
          noClient: "No client yet",
          access: "Access",
          editor: "Editor",
          viewer: "Viewer",
          viewReport: "View report",
          exportCsv: "Export CSV",
          floorplans: "Floorplans",
          firestops: "Firestops",
          pending: "Pending",
          approved: "Approved",
          projectDetails: "Project Details",
          client: "Client",
          projectId: "Project ID",
          address: "Address",
          statusSnapshot: "Status Snapshot",
          installed: "Installed",
          rejected: "Rejected",
          activityFeed: "Activity Feed",
          recentActivity: "Recent Activity",
          activityDesc: "The latest actions that happened in this project.",
          noActivity: "No recent activity for this project yet.",
          drawings: "Drawings",
          noFloorplans: "No floorplans yet",
          noFloorplansEdit:
            "Add the first floor or area for this project to start placing firestops on a drawing.",
          noFloorplansView: "No floorplans are available in this project yet.",
        };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <div className="mb-6">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 transition hover:text-slate-900"
          >
            {copy.back}
          </Link>
        </div>

        <section className="mb-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.15fr_0.85fr] lg:px-10 lg:py-12">
            <div>
              <BrandIdentity />
              <p className="mt-8 text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                {copy.overview}
              </p>
              <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                {project.name}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                {copy.desc}
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                  {project.client || copy.noClient}
                </span>
                <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-500 ring-1 ring-slate-200">
                  {copy.access}: {canEdit ? copy.editor : copy.viewer}
                </span>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href={`/projects/${project.id}/report`}
                  className="inline-flex min-h-14 w-full shrink-0 whitespace-nowrap items-center justify-center gap-2 rounded-[1.75rem] border border-slate-300 bg-white px-6 py-4 text-base font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-slate-400 hover:bg-slate-50 sm:min-w-[168px] sm:w-auto"
                >
                  <span className="text-slate-400">→</span>
                  {copy.viewReport}
                </Link>
                <a
                  href={`/projects/${project.id}/export`}
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
                  <p className="text-sm text-slate-300">{copy.floorplans}</p>
                  <p className="mt-3 text-3xl font-semibold">{floorplans?.length ?? 0}</p>
                </div>
                <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">{copy.firestops}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {firestops?.length ?? 0}
                  </p>
                </div>
                <div className="rounded-3xl bg-amber-50 p-6 ring-1 ring-amber-100">
                  <p className="text-sm text-amber-700">{copy.pending}</p>
                  <p className="mt-3 text-3xl font-semibold text-amber-800">{pendingCount}</p>
                </div>
                <div className="rounded-3xl bg-green-50 p-6 ring-1 ring-green-100">
                  <p className="text-sm text-green-700">{copy.approved}</p>
                  <p className="mt-3 text-3xl font-semibold text-green-800">
                    {firestopSummary.approved}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-8 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              {copy.projectDetails}
            </p>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">{copy.client}</p>
                <p className="mt-2 text-sm font-medium text-slate-800">
                  {project.client || "-"}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="text-xs uppercase tracking-wide text-slate-400">{copy.projectId}</p>
                <p className="mt-2 text-sm font-medium text-slate-800 break-all">
                  {project.id}
                </p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4 md:col-span-2">
                <p className="text-xs uppercase tracking-wide text-slate-400">{copy.address}</p>
                <p className="mt-2 text-sm font-medium text-slate-800">
                  {project.site_address || "-"}
                </p>
              </div>
            </div>
          </section>

          {!firestopsError && (
            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                {copy.statusSnapshot}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:gap-4">
                <div className="rounded-2xl bg-slate-50 p-4 text-center">
                  <p className="text-sm text-slate-500">{copy.pending}</p>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">
                    {pendingCount}
                  </p>
                </div>
                <div className="rounded-2xl bg-amber-50 p-4 text-center">
                  <p className="text-sm text-amber-700">{copy.installed}</p>
                  <p className="mt-3 text-2xl font-semibold text-amber-700">
                    {firestopSummary.installed}
                  </p>
                </div>
                <div className="rounded-2xl bg-green-50 p-4 text-center">
                  <p className="text-sm text-green-700">{copy.approved}</p>
                  <p className="mt-3 text-2xl font-semibold text-green-700">
                    {firestopSummary.approved}
                  </p>
                </div>
                <div className="rounded-2xl bg-red-50 p-4 text-center">
                  <p className="text-sm text-red-700">{copy.rejected}</p>
                  <p className="mt-3 text-2xl font-semibold text-red-700">
                    {firestopSummary.rejected}
                  </p>
                </div>
              </div>
            </section>
          )}
        </div>

        {firestopsError && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            Error loading firestop summary: {firestopsError}
          </div>
        )}

        {session.role === "admin" ? (
          <>
            {usersError || membershipsError ? (
              <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
                Error loading project access:
                {" "}
                {usersError || membershipsError}
              </div>
            ) : (
              <ProjectTeamManager
                projectId={project.id}
                projectName={project.name}
                users={users || []}
                memberships={memberships || []}
                locale={locale}
                onUpsert={upsertProjectAccessAction}
                onRemove={removeProjectAccessAction}
              />
            )}
          </>
        ) : null}

        {session.role === "admin" ? (
          <section className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                {copy.activityFeed}
              </p>
              <h2 className="mt-2 text-lg font-semibold text-slate-900">{copy.recentActivity}</h2>
              <p className="mt-1 text-sm text-slate-500">
                {copy.activityDesc}
              </p>
            </div>

            {projectAuditLogsError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                Error loading recent activity: {projectAuditLogsError}
              </div>
            ) : null}

            {!projectAuditLogsError && !projectAuditLogs?.length ? (
              <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                {copy.noActivity}
              </div>
            ) : null}

            {projectAuditLogs?.length ? (
              <div className="mt-4 space-y-3">
                {projectAuditLogs.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800">
                        {entry.actor_username || "System"}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(entry.created_at).toLocaleString("en-GB", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-slate-700">{entry.description}</p>
                    <p className="mt-2 text-xs uppercase tracking-wide text-slate-400">
                      {entry.action.replaceAll("_", " ")}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </section>
        ) : null}

        {canEdit ? (
          <div className="mb-8">
            <CreateFloorplanForm projectId={project.id} locale={locale} action={createFloorplan} />
          </div>
        ) : null}

        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
                {copy.drawings}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-slate-900">{copy.floorplans}</h2>
            </div>
          </div>

          {floorplansError && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              Error loading floorplans: {floorplansError}
            </div>
          )}

          {!floorplans?.length && !floorplansError && (
            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-6 text-slate-600 shadow-sm sm:p-8">
              <p className="text-lg font-semibold text-slate-900">{copy.noFloorplans}</p>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                {canEdit ? copy.noFloorplansEdit : copy.noFloorplansView}
              </p>
            </div>
          )}

          {floorplans?.length ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {floorplans.map((floorplan) => (
                <FloorplanCard
                  key={floorplan.id}
                  projectId={project.id}
                  floorplan={floorplan}
                  locale={locale}
                  onEdit={updateFloorplan}
                  onDelete={deleteFloorplan}
                  canManage={canEdit}
                />
              ))}

            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
