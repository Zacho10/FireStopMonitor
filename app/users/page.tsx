import Link from "next/link";
import { notFound } from "next/navigation";
import { CreateUserForm } from "@/components/CreateUserForm";
import { DeleteUserButton } from "@/components/DeleteUserButton";
import { EditUserForm } from "@/components/EditUserForm";
import { PageHeader } from "@/components/PageHeader";
import { ProjectAccessManager } from "@/components/ProjectAccessManager";
import { requireAdminSession } from "@/lib/auth";
import { getLocale } from "@/lib/i18n";
import { getAllProjectMemberships } from "@/lib/project-access";
import { getProjects } from "@/lib/projects";
import { getAuditLogs, getUsers } from "@/lib/user-admin";
import {
  createUserAction,
  deleteUserAction,
  removeProjectAccessAction,
  updateUserAction,
  upsertProjectAccessAction,
} from "./actions";

export default async function UsersPage() {
  const session = await requireAdminSession();
  const locale = await getLocale();
  const [
    { data: users, error: usersError },
    { data: auditLogs, error: auditError },
    { data: projects, error: projectsError },
    { data: memberships, error: membershipsError },
  ] = await Promise.all([
    getUsers(),
    getAuditLogs(),
    getProjects(),
    getAllProjectMemberships(),
  ]);

  if (usersError?.includes("Only administrators")) {
    notFound();
  }
  const copy =
    locale === "el"
      ? {
          back: "← Πίσω στα έργα",
          eyebrow: "Διαχείριση",
          title: "Χρήστες και Πρόσβαση",
          desc: `Διαχείριση λογαριασμών, ρόλων και πρόσφατης auth activity. Συνδεδεμένος ως ${session.name}.`,
          dbSetup: "Ρύθμιση Βάσης",
          dbTextStart: "Τρέξε το SQL στο",
          dbTextMiddle: "και πρόσθεσε το",
          dbTextEnd: "στο environment για να ενεργοποιηθούν πλήρως οι database users.",
          users: "Χρήστες",
          accounts: "λογαριασμοί",
          active: "ενεργός",
          inactive: "ανενεργός",
          noUsers: "Δεν υπάρχουν ακόμη database users. Χρησιμοποίησε τη φόρμα πιο πάνω για να δημιουργήσεις τον πρώτο.",
          audit: "Audit Log",
          latest: "Τελευταία δραστηριότητα",
          noAudit: "Δεν έχουν καταγραφεί ακόμη audit events.",
          loadUsers: "Αποτυχία φόρτωσης χρηστών",
          loadProjects: "Αποτυχία φόρτωσης έργων",
          loadAccess: "Αποτυχία φόρτωσης project access",
          loadAudit: "Αποτυχία φόρτωσης audit log",
        }
      : {
          back: "← Back to projects",
          eyebrow: "Administration",
          title: "Users & Access",
          desc: `Manage user accounts, roles, and the latest auth activity. Signed in as ${session.name}.`,
          dbSetup: "Database setup",
          dbTextStart: "Run the SQL in",
          dbTextMiddle: "and add",
          dbTextEnd: "to your environment to fully enable database users.",
          users: "Users",
          accounts: "accounts",
          active: "active",
          inactive: "inactive",
          noUsers: "No database users found yet. Use the form above to create the first one.",
          audit: "Audit Log",
          latest: "Latest activity",
          noAudit: "No audit events recorded yet.",
          loadUsers: "Could not load users",
          loadProjects: "Could not load projects",
          loadAccess: "Could not load project access",
          loadAudit: "Could not load audit log",
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

        <PageHeader
          eyebrow={copy.eyebrow}
          title={copy.title}
          description={copy.desc}
        />

        <div className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-5 text-sm text-slate-600 shadow-sm sm:p-6">
          <p className="font-medium text-slate-800">{copy.dbSetup}</p>
          <p className="mt-2">
            {copy.dbTextStart}{" "}
            <span className="font-mono text-slate-800">
              supabase/user-management.sql
            </span>{" "}
            {copy.dbTextMiddle}{" "}
            <span className="font-mono text-slate-800">
              SUPABASE_SERVICE_ROLE_KEY
            </span>{" "}
            {copy.dbTextEnd}
          </p>
        </div>

        <div className="mb-8">
          <CreateUserForm locale={locale} action={createUserAction} />
        </div>

        {usersError && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {copy.loadUsers}: {usersError}
          </div>
        )}

        {projectsError && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {copy.loadProjects}: {projectsError}
          </div>
        )}

        {membershipsError && (
          <div className="mb-8 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
            {copy.loadAccess}: {membershipsError}
          </div>
        )}

        {!usersError && users?.length ? (
          <section className="mb-10">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">{copy.users}</h2>
              <p className="text-sm text-slate-500">{users.length} {copy.accounts}</p>
            </div>

            <div className="grid gap-4">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">
                        {user.full_name}
                      </h3>
                      <p className="mt-1 text-sm text-slate-600">
                        @{user.username}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs">
                        <span className="rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
                          {user.role}
                        </span>
                        <span
                          className={`rounded-full px-3 py-1 font-medium ${
                            user.is_active
                              ? "bg-green-100 text-green-700"
                              : "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {user.is_active ? copy.active : copy.inactive}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <EditUserForm user={user} locale={locale} action={updateUserAction} />
                      <DeleteUserButton
                        userId={user.id}
                        username={user.username}
                        action={deleteUserAction}
                      />
                    </div>
                  </div>

                  <div className="mt-4">
                    <ProjectAccessManager
                      userId={user.id}
                      projects={projects || []}
                      memberships={(memberships || []).filter(
                        (membership) => membership.user_id === user.id
                      )}
                      locale={locale}
                      onUpsert={upsertProjectAccessAction}
                      onRemove={removeProjectAccessAction}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        {!usersError && !users?.length ? (
          <div className="mb-10 rounded-[2rem] border border-dashed border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
            {copy.noUsers}
          </div>
        ) : null}

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-900">{copy.audit}</h2>
            <p className="text-sm text-slate-500">{copy.latest}</p>
          </div>

          {auditError ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
              {copy.loadAudit}: {auditError}
            </div>
          ) : auditLogs?.length ? (
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
              <div className="divide-y divide-slate-200">
                {auditLogs.map((entry) => (
                  <div key={entry.id} className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          {entry.description}
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          {entry.actor_username || "system"} • {entry.action} •{" "}
                          {entry.entity_type}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500">
                        {new Date(entry.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-[2rem] border border-dashed border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
              {copy.noAudit}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
