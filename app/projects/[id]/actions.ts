"use server";

import { revalidatePath } from "next/cache";
import { requireProjectEditAccess } from "@/lib/project-access";
import { supabase } from "@/lib/supabase";
import { logAuditEvent } from "@/lib/user-admin";

export async function createFloorplan(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const access = await requireProjectEditAccess(projectId);
  const title = (formData.get("title") as string)?.trim();
  const floorName = (formData.get("floor_name") as string)?.trim();

  if (!projectId) {
    throw new Error("Missing project id");
  }

  if (!title) {
    throw new Error("Please enter a floor or area name");
  }

  const { data, error } = await supabase
    .from("floorplans")
    .insert({
      project_id: projectId,
      title,
      floor_name: floorName || null,
      image_url: null,
      width: null,
      height: null,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent({
    actorUserId: access.session.userId,
    actorUsername: access.session.username,
    action: "create_floorplan",
    entityType: "floorplan",
    entityId: data?.id || null,
    description: `Created floorplan ${title} in project ${projectId}.`,
    metadata: {
      projectId,
      floorplanId: data?.id || null,
      floorplanTitle: title,
    },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function deleteFloorplan(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const access = await requireProjectEditAccess(projectId);
  const floorplanId = formData.get("floorplanId") as string;

  if (!projectId || !floorplanId) {
    throw new Error("Missing floorplan details");
  }

  const { error } = await supabase
    .from("floorplans")
    .delete()
    .eq("id", floorplanId)
    .eq("project_id", projectId);

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent({
    actorUserId: access.session.userId,
    actorUsername: access.session.username,
    action: "delete_floorplan",
    entityType: "floorplan",
    entityId: floorplanId,
    description: `Deleted floorplan ${floorplanId} from project ${projectId}.`,
    metadata: {
      projectId,
      floorplanId,
    },
  });

  revalidatePath(`/projects/${projectId}`);
}

export async function updateFloorplan(formData: FormData) {
  const projectId = formData.get("projectId") as string;
  const access = await requireProjectEditAccess(projectId);
  const floorplanId = formData.get("floorplanId") as string;
  const title = (formData.get("title") as string)?.trim();
  const floorName = (formData.get("floor_name") as string)?.trim();

  if (!projectId || !floorplanId) {
    throw new Error("Missing floorplan details");
  }

  if (!title) {
    throw new Error("Please enter a floor or area name");
  }

  const { error } = await supabase
    .from("floorplans")
    .update({
      title,
      floor_name: floorName || null,
    })
    .eq("id", floorplanId)
    .eq("project_id", projectId);

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent({
    actorUserId: access.session.userId,
    actorUsername: access.session.username,
    action: "update_floorplan",
    entityType: "floorplan",
    entityId: floorplanId,
    description: `Updated floorplan ${title} in project ${projectId}.`,
    metadata: {
      projectId,
      floorplanId,
      floorplanTitle: title,
    },
  });

  revalidatePath(`/projects/${projectId}`);
}
