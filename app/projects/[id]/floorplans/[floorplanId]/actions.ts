"use server";

import { revalidatePath } from "next/cache";
import { supabase } from "@/lib/supabase";
import { uploadFloorplanImage } from "@/lib/storage";

type CreateFirestopInput = {
  projectId: string;
  floorplanId: string;
  x: number;
  y: number;
};

export async function createFirestop({
  projectId,
  floorplanId,
  x,
  y,
}: CreateFirestopInput) {
  const code = `FS-${Date.now()}`;

  const { error } = await supabase.from("firestops").insert({
    project_id: projectId,
    floorplan_id: floorplanId,
    code,
    type: "Mixed Penetration",
    status: "new",
    x,
    y,
  });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${projectId}/floorplans/${floorplanId}`);
}

export async function updateFirestop(formData: FormData) {
  const id = formData.get("id") as string;
  const projectId = formData.get("projectId") as string;
  const floorplanId = formData.get("floorplanId") as string;

  const code = formData.get("code") as string;
  const type = formData.get("type") as string;
  const system_name = formData.get("system_name") as string;
  const fire_rating = formData.get("fire_rating") as string;
  const substrate = formData.get("substrate") as string;
  const status = formData.get("status") as string;
  const notes = formData.get("notes") as string;

  const { error } = await supabase
    .from("firestops")
    .update({
      code,
      type,
      system_name: system_name || null,
      fire_rating: fire_rating || null,
      substrate: substrate || null,
      status,
      notes: notes || null,
    })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${projectId}/floorplans/${floorplanId}`);
}

export async function deleteFirestop(formData: FormData) {
  const id = formData.get("id") as string;
  const projectId = formData.get("projectId") as string;
  const floorplanId = formData.get("floorplanId") as string;

  const { error } = await supabase.from("firestops").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

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
  const { error } = await supabase
    .from("firestops")
    .update({ x, y })
    .eq("id", id);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${projectId}/floorplans/${floorplanId}`);
}

export async function updateFloorplanImage(formData: FormData) {
  const file = formData.get("file") as File;
  const projectId = formData.get("projectId") as string;
  const floorplanId = formData.get("floorplanId") as string;

  if (!file || file.size === 0) {
    throw new Error("No file uploaded");
  }

  const imageUrl = await uploadFloorplanImage(file, projectId, floorplanId);

  const { error } = await supabase
    .from("floorplans")
    .update({ image_url: imageUrl })
    .eq("id", floorplanId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/projects/${projectId}/floorplans/${floorplanId}`);
}