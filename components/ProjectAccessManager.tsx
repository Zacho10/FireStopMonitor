"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AppLocale } from "@/lib/i18n";
import type { Project, ProjectMembership, ProjectMembershipRole } from "@/types/database";

type ProjectAccessManagerProps = {
  userId: string;
  projects: Project[];
  memberships: ProjectMembership[];
  locale: AppLocale;
  onUpsert: (formData: FormData) => Promise<void>;
  onRemove: (formData: FormData) => Promise<void>;
};

export function ProjectAccessManager({
  userId,
  projects,
  memberships,
  locale,
  onUpsert,
  onRemove,
}: ProjectAccessManagerProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const copy =
    locale === "el"
      ? {
          close: "Κλείσιμο πρόσβασης",
          access: "Πρόσβαση έργων",
          current: "Τρέχουσα πρόσβαση",
          none: "Δεν έχει δοθεί πρόσβαση",
          fallbackUpdate: "Δεν ήταν δυνατή η ενημέρωση πρόσβασης έργου",
          fallbackRemove: "Δεν ήταν δυνατή η αφαίρεση πρόσβασης έργου",
          update: "Ενημέρωση",
          grant: "Δώσε πρόσβαση",
          remove: "Αφαίρεση",
          noProjects: "Δεν υπάρχουν έργα ακόμα. Δημιούργησε πρώτα έργο και μετά όρισε πρόσβαση.",
          confirmPrefix: "Να αφαιρεθεί η πρόσβαση στο",
          confirmSuffix: "για αυτόν τον χρήστη;",
        }
      : {
          close: "Close access",
          access: "Project access",
          current: "Current access",
          none: "No access assigned",
          fallbackUpdate: "Could not update project access",
          fallbackRemove: "Could not remove project access",
          update: "Update",
          grant: "Grant access",
          remove: "Remove",
          noProjects: "No projects exist yet. Create a project first, then assign access.",
          confirmPrefix: 'Remove access to',
          confirmSuffix: "for this user?",
        };
  const membershipByProjectId = new Map(
    memberships.map((membership) => [membership.project_id, membership])
  );

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={() => {
          setError(null);
          setIsOpen((prev) => !prev);
        }}
        className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        {isOpen ? copy.close : copy.access}
      </button>

      {isOpen ? (
        <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          {projects.length ? (
            projects.map((project) => {
              const membership = membershipByProjectId.get(project.id);

              return (
                <div
                  key={project.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-medium text-slate-900">
                        {project.name}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        {membership
                          ? `${copy.current}: ${membership.role}`
                          : copy.none}
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
                        <input type="hidden" name="userId" value={userId} />
                        <input type="hidden" name="projectId" value={project.id} />

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
                              `${copy.confirmPrefix} "${project.name}" ${copy.confirmSuffix}`
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
                          <input type="hidden" name="userId" value={userId} />
                          <input type="hidden" name="projectId" value={project.id} />
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
              {copy.noProjects}
            </p>
          )}

          {error ? (
            <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
