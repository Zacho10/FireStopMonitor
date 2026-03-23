import { notFound } from "next/navigation";
import type {
  Project,
  ProjectMembership,
  ProjectMembershipRole,
} from "@/types/database";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { requireSession } from "@/lib/auth";

function getAdminClientOrThrow() {
  const client = getSupabaseAdmin();

  if (!client) {
    throw new Error(
      "Missing SUPABASE_SERVICE_ROLE_KEY. Project permissions are not configured yet."
    );
  }

  return client;
}

export async function getProjectMembershipsByUserId(userId: string): Promise<{
  data: ProjectMembership[] | null;
  error: string | null;
}> {
  const client = getAdminClientOrThrow();
  const { data, error } = await client
    .from("project_memberships")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data || []) as ProjectMembership[], error: null };
}

export async function getProjectMembershipsByProjectId(projectId: string): Promise<{
  data: ProjectMembership[] | null;
  error: string | null;
}> {
  const client = getAdminClientOrThrow();
  const { data, error } = await client
    .from("project_memberships")
    .select("*")
    .eq("project_id", projectId);

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data || []) as ProjectMembership[], error: null };
}

export async function getAllProjectMemberships(): Promise<{
  data: ProjectMembership[] | null;
  error: string | null;
}> {
  const client = getAdminClientOrThrow();
  const { data, error } = await client.from("project_memberships").select("*");

  if (error) {
    return { data: null, error: error.message };
  }

  return { data: (data || []) as ProjectMembership[], error: null };
}

export async function getAccessibleProjectsForSession(session: Awaited<ReturnType<typeof requireSession>>) {
  if (session.role === "admin") {
    return null;
  }

  if (!session.userId) {
    return [];
  }

  const { data } = await getProjectMembershipsByUserId(session.userId);
  return data || [];
}

export async function filterProjectsForSession(
  session: Awaited<ReturnType<typeof requireSession>>,
  projects: Project[]
) {
  if (session.role === "admin") {
    return projects;
  }

  if (!session.userId) {
    return [];
  }

  const memberships = await getAccessibleProjectsForSession(session);
  const allowedIds = new Set((memberships || []).map((item) => item.project_id));
  return projects.filter((project) => allowedIds.has(project.id));
}

export async function requireProjectAccess(projectId: string) {
  const session = await requireSession();

  if (session.role === "admin") {
    return { session, canEdit: true, membershipRole: "editor" as const };
  }

  if (!session.userId) {
    notFound();
  }

  const client = getAdminClientOrThrow();
  const { data, error } = await client
    .from("project_memberships")
    .select("*")
    .eq("user_id", session.userId)
    .eq("project_id", projectId)
    .maybeSingle();

  if (error || !data) {
    notFound();
  }

  const membership = data as ProjectMembership;

  return {
    session,
    canEdit: membership.role === "editor",
    membershipRole: membership.role,
  };
}

export async function requireProjectEditAccess(projectId: string) {
  const access = await requireProjectAccess(projectId);

  if (!access.canEdit) {
    throw new Error("You have view-only access for this project.");
  }

  return access;
}

export async function upsertProjectMembership(input: {
  userId: string;
  projectId: string;
  role: ProjectMembershipRole;
}) {
  const client = getAdminClientOrThrow();
  const { data, error } = await client
    .from("project_memberships")
    .upsert(
      {
        user_id: input.userId,
        project_id: input.projectId,
        role: input.role,
      },
      { onConflict: "user_id,project_id" }
    )
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data as ProjectMembership;
}

export async function deleteProjectMembership(input: {
  userId: string;
  projectId: string;
}) {
  const client = getAdminClientOrThrow();
  const { error } = await client
    .from("project_memberships")
    .delete()
    .eq("user_id", input.userId)
    .eq("project_id", input.projectId);

  if (error) {
    throw new Error(error.message);
  }
}
