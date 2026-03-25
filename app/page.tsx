import { createProject, deleteProject, updateProject } from "@/app/actions";
import { BrandIdentity } from "@/components/BrandIdentity";
import { CreateProjectForm } from "@/components/CreateProjectForm";
import { ProjectCard } from "@/components/ProjectCard";
import { requireSession } from "@/lib/auth";
import { summarizeFirestopsByStatus } from "@/lib/firestop-summary";
import { getFirestopsByProjectIds } from "@/lib/firestops";
import { getLocale } from "@/lib/i18n";
import { getFloorplansByProjectIds } from "@/lib/project-details";
import { filterProjectsForSession } from "@/lib/project-access";
import { getProjects } from "@/lib/projects";
import { getAuditLogs } from "@/lib/user-admin";

export default async function HomePage() {
  const session = await requireSession();
  const locale = await getLocale();
  const { data: projects, error } = await getProjects();
  const visibleProjects = projects
    ? await filterProjectsForSession(session, projects)
    : null;
  const canManage = session.role === "admin";
  const projectIds = visibleProjects?.map((project) => project.id) || [];
  const [
    { data: floorplans, error: floorplansError },
    { data: firestops, error: firestopsError },
    { data: auditLogs },
  ] = await Promise.all([
    getFloorplansByProjectIds(projectIds),
    getFirestopsByProjectIds(projectIds),
    canManage ? getAuditLogs(60) : Promise.resolve({ data: null }),
  ]);
  const firestopSummary = summarizeFirestopsByStatus(firestops || []);
  const pendingCount =
    firestopSummary.new + firestopSummary.to_install + firestopSummary.to_inspect;
  const recentActivity = (auditLogs || [])
    .filter((entry) => {
      const metadataProjectId =
        entry.metadata && typeof entry.metadata.projectId === "string"
          ? entry.metadata.projectId
          : null;

      return (
        (entry.entity_type === "project" && entry.entity_id && projectIds.includes(entry.entity_id)) ||
        (metadataProjectId && projectIds.includes(metadataProjectId))
      );
    })
    .slice(0, 6);
  const floorplansByProject = new Map(
    (floorplans || []).reduce<Array<[string, typeof floorplans]>>((groups, floorplan) => {
      const existing = groups.find(([projectId]) => projectId === floorplan.project_id);

      if (existing) {
        existing[1]?.push(floorplan);
      } else {
        groups.push([floorplan.project_id, [floorplan]]);
      }

      return groups;
    }, [])
  );
  const firestopsByProject = new Map(
    (firestops || []).reduce<Array<[string, typeof firestops]>>((groups, firestop) => {
      const existing = groups.find(([projectId]) => projectId === firestop.project_id);

      if (existing) {
        existing[1]?.push(firestop);
      } else {
        groups.push([firestop.project_id, [firestop]]);
      }

      return groups;
    }, [])
  );
  const copy =
    locale === "el"
      ? {
          hero:
            "Παρακολούθησε έργα, κατόψεις, πυροφραγές και πρόοδο εργοταξίου από ένα σημείο.",
          heroText:
            "Δικαιώματα πρόσβασης, επιθεώρηση, αναφορές, φωτογραφίες και audit history δουλεύουν μαζί ώστε η ομάδα να βλέπει τι εκκρεμεί και τι έχει ολοκληρωθεί.",
          role: "Ρόλος",
          visibleProjects: "Ορατά Έργα",
          floorplans: "Κατόψεις",
          pendingFirestops: "Εκκρεμείς Πυροφραγές",
          approvedFirestops: "Εγκεκριμένες Πυροφραγές",
          portfolioOverview: "Επισκόπηση Χαρτοφυλακίου",
          projects: "Έργα",
          readonly:
            "Ο λογαριασμός σου έχει μόνο δικαιώματα προβολής. Μπορείς να δεις έργα και αναφορές, αλλά όχι να δημιουργήσεις ή να αλλάξεις δεδομένα.",
          recentActivity: "Πρόσφατη Δραστηριότητα",
          latestChanges: "Τελευταίες αλλαγές",
          noRecentActivity: "Δεν υπάρχει ακόμα πρόσφατη δραστηριότητα στα έργα που βλέπεις.",
          errorProjects: "Σφάλμα φόρτωσης έργων",
          errorSummary: "Σφάλμα φόρτωσης dashboard summary",
          noProjectsYet: "Δεν υπάρχουν ακόμα έργα",
          noProjectsAdmin:
            "Δημιούργησε το πρώτο σου έργο για να αρχίσεις να προσθέτεις κατόψεις, πυροφραγές, φωτογραφίες και αναφορές.",
          noProjectsViewer: "Δεν υπάρχουν ορατά έργα ανατεθειμένα στον λογαριασμό σου.",
        }
      : {
          hero: "Track projects, floorplans, firestops, and site progress from one place.",
          heroText:
            "Live project access, inspection workflow, reporting, photos, and audit history are all connected here so the team can see what is pending and what is done.",
          role: "Role",
          visibleProjects: "Visible Projects",
          floorplans: "Floorplans",
          pendingFirestops: "Pending Firestops",
          approvedFirestops: "Approved Firestops",
          portfolioOverview: "Portfolio Overview",
          projects: "Projects",
          readonly:
            "Your account has read-only access. You can view projects and reports, but you cannot create or edit data.",
          recentActivity: "Recent Activity",
          latestChanges: "Latest changes",
          noRecentActivity: "No recent activity for the projects you can access yet.",
          errorProjects: "Error loading projects",
          errorSummary: "Error loading dashboard summary",
          noProjectsYet: "No projects yet",
          noProjectsAdmin:
            "Create your first project to start adding floorplans, firestops, photos, and reports.",
          noProjectsViewer: "There are no visible projects assigned to your account yet.",
        };

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fafc_0%,#eef2f7_100%)] text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
        <section className="mb-10 overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
          <div className="grid gap-8 px-5 py-8 sm:px-8 sm:py-10 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-12">
            <div>
              <BrandIdentity />
              <h1 className="mt-6 max-w-3xl text-3xl font-semibold tracking-tight text-slate-900 sm:mt-8 sm:text-4xl">
                {copy.hero}
              </h1>
              <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-600">
                {copy.heroText}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <span className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700">
                  {session.name}
                </span>
                <span className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-500 ring-1 ring-slate-200">
                  {copy.role}: {session.role}
                </span>
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-slate-50 p-3 sm:bg-transparent sm:p-0">
              <div className="grid grid-cols-2 gap-3 sm:gap-5">
                <div className="rounded-3xl bg-slate-900 p-6 text-white">
                  <p className="text-sm text-slate-300">{copy.visibleProjects}</p>
                  <p className="mt-3 text-3xl font-semibold">{visibleProjects?.length ?? 0}</p>
                </div>
                <div className="rounded-3xl bg-white p-6 ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">{copy.floorplans}</p>
                  <p className="mt-3 text-3xl font-semibold text-slate-900">
                    {floorplans?.length ?? 0}
                  </p>
                </div>
                <div className="rounded-3xl bg-amber-50 p-6 ring-1 ring-amber-100">
                  <p className="text-sm text-amber-700">{copy.pendingFirestops}</p>
                  <p className="mt-3 text-3xl font-semibold text-amber-800">{pendingCount}</p>
                </div>
                <div className="rounded-3xl bg-green-50 p-6 ring-1 ring-green-100">
                  <p className="text-sm text-green-700">{copy.approvedFirestops}</p>
                  <p className="mt-3 text-3xl font-semibold text-green-800">
                    {firestopSummary.approved}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="mb-8 grid gap-4 lg:grid-cols-[1.3fr_0.7fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                  {copy.portfolioOverview}
                </p>
                <h2 className="mt-2 text-2xl font-semibold text-slate-900">{copy.projects}</h2>
              </div>
            </div>

            <div className="mt-6">
              {canManage ? (
                <CreateProjectForm action={createProject} locale={locale} />
              ) : (
                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-6 text-sm text-slate-600">
                  {copy.readonly}
                </div>
              )}
            </div>
          </section>

          {canManage ? (
            <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <p className="text-sm font-medium uppercase tracking-[0.18em] text-slate-500">
                {copy.recentActivity}
              </p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-900">{copy.latestChanges}</h2>

              {!recentActivity.length ? (
                <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
                  {copy.noRecentActivity}
                </div>
              ) : (
                <div className="mt-6 space-y-3">
                  {recentActivity.map((entry) => (
                    <div
                      key={entry.id}
                      className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-slate-800">
                          {entry.actor_username || "System"}
                        </p>
                        <p className="text-xs text-slate-500">
                          {new Date(entry.created_at).toLocaleString("en-GB", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <p className="mt-2 text-sm text-slate-700">{entry.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ) : null}
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {copy.errorProjects}: {error}
          </div>
        )}

        {(floorplansError || firestopsError) && !error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {copy.errorSummary}: {floorplansError || firestopsError}
          </div>
        )}

        {!error && !visibleProjects?.length && (
          <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-6 text-slate-600 shadow-sm sm:p-8">
            <p className="text-lg font-semibold text-slate-900">{copy.noProjectsYet}</p>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              {canManage ? copy.noProjectsAdmin : copy.noProjectsViewer}
            </p>
          </div>
        )}

        {visibleProjects?.length ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {visibleProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                floorplans={floorplansByProject.get(project.id) || []}
                firestops={firestopsByProject.get(project.id) || []}
                locale={locale}
                onEdit={updateProject}
                onDelete={deleteProject}
                canManage={canManage}
              />
            ))}
          </div>
        ) : null}
      </div>
    </main>
  );
}
