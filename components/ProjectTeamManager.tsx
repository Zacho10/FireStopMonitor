"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppLocale } from "@/lib/i18n";
import type { AppUser, ProjectMembership, ProjectMembershipRole } from "@/types/database";

type ProjectTeamManagerProps = {
  projectId: string;
  projectName: string;
  users: AppUser[];
  memberships: ProjectMembership[];
  locale: AppLocale;
  onUpsert: (formData: FormData) => Promise<void>;
  onRemove: (formData: FormData) => Promise<void>;
};

export function ProjectTeamManager({
  projectId,
  projectName,
  users,
  memberships,
  locale,
  onUpsert,
  onRemove,
}: ProjectTeamManagerProps) {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copy =
    locale === "el"
      ? {
          eyebrow: "Πρόσβαση Ομάδας",
          title: "Πρόσβαση Έργου",
          descPrefix: "Διαχειρίσου ποιοι χρήστες έχουν πρόσβαση στο",
          appRole: "ρόλος app",
          projectAccess: "πρόσβαση έργου",
          noProjectAccess: "χωρίς πρόσβαση στο έργο",
          fallbackUpdate: "Δεν ήταν δυνατή η ενημέρωση πρόσβασης έργου",
          fallbackRemove: "Δεν ήταν δυνατή η αφαίρεση πρόσβασης έργου",
          update: "Ενημέρωση",
          grant: "Δώσε πρόσβαση",
          remove: "Αφαίρεση",
          confirm: "Να αφαιρεθεί ο",
          confirm2: "από το",
          noUsers: "Δεν υπάρχουν ακόμα database users. Δημιούργησε πρώτα χρήστες από τη σελίδα admin users.",
        }
      : {
          eyebrow: "Team Access",
          title: "Project Access",
          descPrefix: "Manage which users can access",
          appRole: "app role",
          projectAccess: "project access",
          noProjectAccess: "no project access",
          fallbackUpdate: "Could not update project access",
          fallbackRemove: "Could not remove project access",
          update: "Update",
          grant: "Grant access",
          remove: "Remove",
          confirm: "Remove",
          confirm2: "from",
          noUsers: "No database users found yet. Create users first from the admin users page.",
        };
  const membershipByUserId = new Map(
    memberships.map((membership) => [membership.user_id, membership])
  );

  return (
    <section className="mb-8 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-4">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
          {copy.eyebrow}
        </p>
        <h2 className="mt-2 text-lg font-semibold text-slate-900">{copy.title}</h2>
        <p className="mt-1 text-sm text-slate-600">
          {copy.descPrefix} <span className="font-medium">{projectName}</span>.
        </p>
      </div>

      <div className="grid gap-3">
        {users.length ? (
          users.map((user) => {
            const membership = membershipByUserId.get(user.id);

            return (
              <div
                key={user.id}
                className="rounded-2xl border border-slate-200 bg-slate-50 p-4"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-medium text-slate-900">
                      {user.full_name}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      @{user.username} • {copy.appRole}: {user.role} •{" "}
                      {membership
                        ? `${copy.projectAccess}: ${membership.role}`
                        : copy.noProjectAccess}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <form
                      action={async (formData) => {
                        setError(null);
                        setIsSaving(true);

                        try {
                          await onUpsert(formData);
                          router.refresh();
                        } catch (err) {
                          setError(
                            err instanceof Error
                              ? err.message
                              : copy.fallbackUpdate
                          );
                        } finally {
                          setIsSaving(false);
                        }
                      }}
                      className="flex flex-wrap items-center gap-2"
                    >
                      <input type="hidden" name="projectId" value={projectId} />
                      <input type="hidden" name="userId" value={user.id} />
                      <select
                        name="role"
                        defaultValue={(membership?.role || "viewer") as ProjectMembershipRole}
                        className="rounded-2xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                      >
                        <option value="viewer">viewer</option>
                        <option value="editor">editor</option>
                      </select>
                      <button
                        type="submit"
                        disabled={isSaving}
                        className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
                      >
                        {membership ? copy.update : copy.grant}
                      </button>
                    </form>

                    {membership ? (
                      <form
                        action={async (formData) => {
                          const confirmed = window.confirm(
                            `${copy.confirm} ${user.full_name} ${copy.confirm2} ${projectName}?`
                          );

                          if (!confirmed) {
                            return;
                          }

                          setError(null);
                          setIsSaving(true);

                          try {
                            await onRemove(formData);
                            router.refresh();
                          } catch (err) {
                            setError(
                              err instanceof Error
                                ? err.message
                                : copy.fallbackRemove
                            );
                          } finally {
                            setIsSaving(false);
                          }
                        }}
                      >
                        <input type="hidden" name="projectId" value={projectId} />
                        <input type="hidden" name="userId" value={user.id} />
                        <button
                          type="submit"
                          disabled={isSaving}
                          className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100 disabled:opacity-50"
                        >
                          {copy.remove}
                        </button>
                      </form>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <p className="text-sm text-slate-600">
            {copy.noUsers}
          </p>
        )}
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      ) : null}
    </section>
  );
}
