"use server";

import { revalidatePath } from "next/cache";
import { requireAdminSession } from "@/lib/auth";
import { supabase } from "@/lib/supabase";
import { logAuditEvent } from "@/lib/user-admin";

export async function createProject(formData: FormData) {
  const session = await requireAdminSession();
  const name = (formData.get("name") as string)?.trim();
  const client = (formData.get("client") as string)?.trim();
  const siteAddress = (formData.get("site_address") as string)?.trim();

  if (!name) {
    throw new Error("Please enter a project name");
  }

  const { data, error } = await supabase
    .from("projects")
    .insert({
      name,
      client: client || null,
      site_address: siteAddress || null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent({
    actorUserId: session.userId,
    actorUsername: session.username,
    action: "create_project",
    entityType: "project",
    entityId: data?.id || null,
    description: `Created project ${name}.`,
    metadata: {
      projectId: data?.id || null,
      projectName: name,
    },
  });

  revalidatePath("/");
}

export async function updateProject(formData: FormData) {
  const session = await requireAdminSession();
  const projectId = formData.get("projectId") as string;
  const name = (formData.get("name") as string)?.trim();
  const client = (formData.get("client") as string)?.trim();
  const siteAddress = (formData.get("site_address") as string)?.trim();

  if (!projectId) {
    throw new Error("Missing project id");
  }

  if (!name) {
    throw new Error("Please enter a project name");
  }

  const { error } = await supabase
    .from("projects")
    .update({
      name,
      client: client || null,
      site_address: siteAddress || null,
    })
    .eq("id", projectId);

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent({
    actorUserId: session.userId,
    actorUsername: session.username,
    action: "update_project",
    entityType: "project",
    entityId: projectId,
    description: `Updated project ${name}.`,
    metadata: {
      projectId,
      projectName: name,
    },
  });

  revalidatePath("/");
  revalidatePath(`/projects/${projectId}`);
}

export async function deleteProject(formData: FormData) {
  const session = await requireAdminSession();
  const projectId = formData.get("projectId") as string;

  if (!projectId) {
    throw new Error("Missing project id");
  }

  const { error } = await supabase.from("projects").delete().eq("id", projectId);

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent({
    actorUserId: session.userId,
    actorUsername: session.username,
    action: "delete_project",
    entityType: "project",
    entityId: projectId,
    description: `Deleted project ${projectId}.`,
    metadata: {
      projectId,
    },
  });

  revalidatePath("/");
}
