"use server";

import { revalidatePath } from "next/cache";
import { requireProjectEditAccess } from "@/lib/project-access";
import { supabase } from "@/lib/supabase";
import {
  deleteStorageFileByPublicUrl,
  uploadFirestopPhoto,
  uploadFloorplanImage,
} from "@/lib/storage";
import { logAuditEvent } from "@/lib/user-admin";
import type { FirestopPhotoSlot } from "@/types/database";

type CreateFirestopInput = {
  projectId: string;
  floorplanId: string;
  x: number;
  y: number;
};

function isImageFile(file: File) {
  if (file.type?.startsWith("image/")) {
    return true;
  }

  const extension = file.name.split(".").pop()?.trim().toLowerCase();
  return [
    "jpg",
    "jpeg",
    "png",
    "webp",
    "gif",
    "bmp",
    "tif",
    "tiff",
    "heic",
    "heif",
    "avif",
    "svg",
  ].includes(extension || "");
}

export async function createFirestop({
  projectId,
  floorplanId,
  x,
  y,
}: CreateFirestopInput) {
  const access = await requireProjectEditAccess(projectId);
  const code = `FS-${Date.now()}`;

  const { data, error } = await supabase
    .from("firestops")
    .insert({
      project_id: projectId,
      floorplan_id: floorplanId,
      code,
      type: "Mixed Penetration",
      status: "new",
      x,
      y,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent({
    actorUserId: access.session.userId,
    actorUsername: access.session.username,
    action: "create_firestop",
    entityType: "firestop",
    entityId: data?.id || null,
    description: `Created firestop ${code} on floorplan ${floorplanId}.`,
    metadata: {
      projectId,
      floorplanId,
      firestopId: data?.id || null,
      code,
    },
  });

  revalidatePath(`/projects/${projectId}/floorplans/${floorplanId}`);
}

export async function updateFirestop(formData: FormData) {
  const id = formData.get("id") as string;
  const projectId = formData.get("projectId") as string;
  const access = await requireProjectEditAccess(projectId);
  const floorplanId = formData.get("floorplanId") as string;

  const code = (formData.get("code") as string)?.trim();
  const type = formData.get("type") as string;
  const location_description = formData.get("location_description") as string;
  const room_zone = formData.get("room_zone") as string;
  const system_name = formData.get("system_name") as string;
  const fire_rating = formData.get("fire_rating") as string;
  const substrate = formData.get("substrate") as string;
  const status = formData.get("status") as string;
  const installed_by = formData.get("installed_by") as string;
  const installed_at = formData.get("installed_at") as string;
  const inspected_by = formData.get("inspected_by") as string;
  const inspection_date = formData.get("inspection_date") as string;
  const inspection_notes = formData.get("inspection_notes") as string;
  const notes = formData.get("notes") as string;

  if (!code) {
    throw new Error("Firestop name/code is required");
  }

  const { error } = await supabase
    .from("firestops")
    .update({
      code,
      type,
      location_description: location_description || null,
      room_zone: room_zone || null,
      system_name: system_name || null,
      fire_rating: fire_rating || null,
      substrate: substrate || null,
      status,
      installed_by: installed_by || null,
      installed_at: installed_at || null,
      inspected_by: inspected_by || null,
      inspection_date: inspection_date || null,
      inspection_notes: inspection_notes || null,
      notes: notes || null,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent({
    actorUserId: access.session.userId,
    actorUsername: access.session.username,
    action: "update_firestop",
    entityType: "firestop",
    entityId: id,
    description: `Updated firestop ${code} on floorplan ${floorplanId}.`,
    metadata: {
      projectId,
      floorplanId,
      firestopId: id,
      status,
      installed_by: installed_by || null,
      installed_at: installed_at || null,
      inspected_by: inspected_by || null,
      inspection_date: inspection_date || null,
    },
  });

  revalidatePath(`/projects/${projectId}/floorplans/${floorplanId}`);
}

export async function deleteFirestop(formData: FormData) {
  const id = formData.get("id") as string;
  const projectId = formData.get("projectId") as string;
  const access = await requireProjectEditAccess(projectId);
  const floorplanId = formData.get("floorplanId") as string;

  const { error } = await supabase.from("firestops").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent({
    actorUserId: access.session.userId,
    actorUsername: access.session.username,
    action: "delete_firestop",
    entityType: "firestop",
    entityId: id,
    description: `Deleted firestop ${id} from floorplan ${floorplanId}.`,
    metadata: {
      projectId,
      floorplanId,
      firestopId: id,
    },
  });

  revalidatePath(`/projects/${projectId}/floorplans/${floorplanId}`);
}

export async function updateFirestopPosition({
  id,
  projectId,
  floorplanId,
  x,
  y,
}: {
  id: string;
  projectId: string;
  floorplanId: string;
  x: number;
  y: number;
}) {
  const access = await requireProjectEditAccess(projectId);
  const { error } = await supabase
    .from("firestops")
    .update({ x, y })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  await logAuditEvent({
    actorUserId: access.session.userId,
    actorUsername: access.session.username,
    action: "move_firestop",
    entityType: "firestop",
    entityId: id,
    description: `Moved firestop ${id} on floorplan ${floorplanId}.`,
    metadata: {
      projectId,
      floorplanId,
      firestopId: id,
      x,
      y,
    },
  });

  revalidatePath(`/projects/${projectId}/floorplans/${floorplanId}`);
}

export async function updateFloorplanImage(formData: FormData) {
  try {
    const projectId = formData.get("projectId") as string;
    const access = await requireProjectEditAccess(projectId);
    const file = formData.get("file") as File;
    const floorplanId = formData.get("floorplanId") as string;

    if (!file || file.size === 0) {
      return { success: false, error: "No file selected" };
    }

    if (!isImageFile(file)) {
      return { success: false, error: "Please upload an image file" };
    }

    const imageUrl = await uploadFloorplanImage(file, projectId, floorplanId);

    const { error } = await supabase
      .from("floorplans")
      .update({ image_url: imageUrl })
      .eq("id", floorplanId);

    if (error) {
      return { success: false, error: error.message };
    }

    await logAuditEvent({
      actorUserId: access.session.userId,
      actorUsername: access.session.username,
      action: "upload_floorplan_image",
      entityType: "floorplan",
      entityId: floorplanId,
      description: `Uploaded or replaced the floorplan image for ${floorplanId}.`,
      metadata: {
        projectId,
        floorplanId,
      },
    });

    revalidatePath(`/projects/${projectId}/floorplans/${floorplanId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

export async function uploadFirestopPhotoAction(formData: FormData) {
  try {
    const projectId = formData.get("projectId") as string;
    const access = await requireProjectEditAccess(projectId);
    const file = formData.get("file") as File;
    const floorplanId = formData.get("floorplanId") as string;
    const firestopId = formData.get("firestopId") as string;
    const slot = formData.get("slot") as FirestopPhotoSlot;

    if (!file || file.size === 0) {
      return { success: false, error: "No photo uploaded" };
    }

    if (!isImageFile(file)) {
      return { success: false, error: "Please upload an image file" };
    }

    if (slot !== "before" && slot !== "after") {
      return { success: false, error: "Invalid photo slot" };
    }

    const fileUrl = await uploadFirestopPhoto(
      file,
      projectId,
      floorplanId,
      firestopId,
      slot
    );

    const { data: existingPhoto, error: existingPhotoError } = await supabase
      .from("firestop_photos")
      .select("id")
      .eq("firestop_id", firestopId)
      .eq("caption", slot)
      .maybeSingle();

    if (existingPhotoError) {
      return { success: false, error: existingPhotoError.message };
    }

    if (existingPhoto) {
      const { error: updateError } = await supabase
        .from("firestop_photos")
        .update({ file_url: fileUrl })
        .eq("id", existingPhoto.id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }
    } else {
      const { error: insertError } = await supabase.from("firestop_photos").insert({
        firestop_id: firestopId,
        file_url: fileUrl,
        caption: slot,
      });

      if (insertError) {
        return { success: false, error: insertError.message };
      }
    }

    await logAuditEvent({
      actorUserId: access.session.userId,
      actorUsername: access.session.username,
      action: "upload_firestop_photo",
      entityType: "firestop_photo",
      entityId: firestopId,
      description: `Uploaded ${slot} photo for firestop ${firestopId}.`,
      metadata: {
        projectId,
        floorplanId,
        firestopId,
        slot,
      },
    });

    revalidatePath(`/projects/${projectId}/floorplans/${floorplanId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

export async function deleteFirestopPhotoAction(formData: FormData) {
  try {
    const projectId = formData.get("projectId") as string;
    const access = await requireProjectEditAccess(projectId);
    const floorplanId = formData.get("floorplanId") as string;
    const firestopId = formData.get("firestopId") as string;
    const slot = formData.get("slot") as FirestopPhotoSlot;

    if (slot !== "before" && slot !== "after") {
      return { success: false, error: "Invalid photo slot" };
    }

    const { data: existingPhoto, error: fetchError } = await supabase
      .from("firestop_photos")
      .select("id, file_url")
      .eq("firestop_id", firestopId)
      .eq("caption", slot)
      .maybeSingle();

    if (fetchError) {
      return { success: false, error: fetchError.message };
    }

    if (!existingPhoto) {
      return { success: false, error: "Photo not found" };
    }

    const { error: deleteError } = await supabase
      .from("firestop_photos")
      .delete()
      .eq("id", existingPhoto.id);

    if (deleteError) {
      return { success: false, error: deleteError.message };
    }

    await deleteStorageFileByPublicUrl(existingPhoto.file_url);

    await logAuditEvent({
      actorUserId: access.session.userId,
      actorUsername: access.session.username,
      action: "delete_firestop_photo",
      entityType: "firestop_photo",
      entityId: firestopId,
      description: `Deleted ${slot} photo for firestop ${firestopId}.`,
      metadata: {
        projectId,
        floorplanId,
        firestopId,
        slot,
      },
    });

    revalidatePath(`/projects/${projectId}/floorplans/${floorplanId}`);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Delete failed",
    };
  }
}
