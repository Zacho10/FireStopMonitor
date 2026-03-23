"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";
import {
  deleteProjectMembership,
  upsertProjectMembership,
} from "@/lib/project-access";
import {
  createDatabaseUser,
  deleteDatabaseUser,
  getDatabaseUserById,
  logAuditEvent,
  updateDatabaseUser,
} from "@/lib/user-admin";
import type { AppUserRole } from "@/types/database";
import type { ProjectMembershipRole } from "@/types/database";

function parseRole(value: string): AppUserRole {
  if (value === "admin" || value === "editor" || value === "viewer") {
    return value;
  }

  throw new Error("Invalid role selected.");
}

function parseMembershipRole(value: string): ProjectMembershipRole {
  if (value === "editor" || value === "viewer") {
    return value;
  }

  throw new Error("Invalid project access role selected.");
}

export async function createUserAction(formData: FormData) {
  const session = await requireAdminSession();
  const username = String(formData.get("username") || "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") || "").trim();
  const role = parseRole(String(formData.get("role") || "viewer"));
  const password = String(formData.get("password") || "");

  if (!username || !fullName) {
    throw new Error("Please fill in username and full name.");
  }

  if (password.length < 8) {
    throw new Error("Password must be at least 8 characters.");
  }

  const user = await createDatabaseUser({
    username,
    fullName,
    role,
    password,
  });

  await logAuditEvent({
    actorUserId: session.userId,
    actorUsername: session.username,
    action: "create_user",
    entityType: "app_user",
    entityId: user.id,
    description: `Created user ${user.username} with role ${user.role}.`,
  });

  revalidatePath("/users");
}

export async function updateUserAction(formData: FormData) {
  const session = await requireAdminSession();
  const userId = String(formData.get("userId") || "");
  const username = String(formData.get("username") || "").trim().toLowerCase();
  const fullName = String(formData.get("full_name") || "").trim();
  const role = parseRole(String(formData.get("role") || "viewer"));
  const password = String(formData.get("password") || "");
  const isActive = formData.get("is_active") === "on";

  if (!userId || !username || !fullName) {
    throw new Error("Missing user details.");
  }

  if (password && password.length < 8) {
    throw new Error("New password must be at least 8 characters.");
  }

  if (session.userId === userId && !isActive) {
    throw new Error("You cannot deactivate your own account.");
  }

  const user = await updateDatabaseUser({
    userId,
    username,
    fullName,
    role,
    isActive,
    password: password || undefined,
  });

  await logAuditEvent({
    actorUserId: session.userId,
    actorUsername: session.username,
    action: "update_user",
    entityType: "app_user",
    entityId: user.id,
    description: `Updated user ${user.username}.`,
    metadata: {
      role: user.role,
      isActive: user.is_active,
      passwordChanged: Boolean(password),
    },
  });

  revalidatePath("/users");
}

export async function deleteUserAction(formData: FormData) {
  const session = await requireAdminSession();
  const userId = String(formData.get("userId") || "");

  if (!userId) {
    throw new Error("Missing user id.");
  }

  if (session.userId === userId) {
    throw new Error("You cannot delete your own account.");
  }

  const { data: user } = await getDatabaseUserById(userId);

  await deleteDatabaseUser(userId);

  await logAuditEvent({
    actorUserId: session.userId,
    actorUsername: session.username,
    action: "delete_user",
    entityType: "app_user",
    entityId: userId,
    description: `Deleted user ${user?.username || userId}.`,
  });

  revalidatePath("/users");
}

export async function upsertProjectAccessAction(formData: FormData) {
  const session = await requireAdminSession();
  const userId = String(formData.get("userId") || "");
  const projectId = String(formData.get("projectId") || "");
  const role = parseMembershipRole(String(formData.get("role") || "viewer"));

  if (!userId || !projectId) {
    throw new Error("Missing user or project.");
  }

  const membership = await upsertProjectMembership({
    userId,
    projectId,
    role,
  });

  await logAuditEvent({
    actorUserId: session.userId,
    actorUsername: session.username,
    action: "upsert_project_access",
    entityType: "project_membership",
    entityId: membership.id,
    description: `Updated project access for user ${userId} on project ${projectId} as ${role}.`,
    metadata: {
      projectId,
      userId,
      membershipRole: role,
    },
  });

  revalidatePath("/users");
  revalidatePath(`/projects/${projectId}`);
}

export async function removeProjectAccessAction(formData: FormData) {
  const session = await requireAdminSession();
  const userId = String(formData.get("userId") || "");
  const projectId = String(formData.get("projectId") || "");

  if (!userId || !projectId) {
    throw new Error("Missing user or project.");
  }

  await deleteProjectMembership({ userId, projectId });

  await logAuditEvent({
    actorUserId: session.userId,
    actorUsername: session.username,
    action: "remove_project_access",
    entityType: "project_membership",
    entityId: `${userId}:${projectId}`,
    description: `Removed project access for user ${userId} on project ${projectId}.`,
    metadata: {
      projectId,
      userId,
    },
  });

  revalidatePath("/users");
  revalidatePath(`/projects/${projectId}`);
}
