import { supabase } from "@/lib/supabase";

export async function uploadFloorplanImage(
  file: File,
  projectId: string,
  floorplanId: string
) {
  const fileExt = file.name.split(".").pop();
  const filePath = `${projectId}/${floorplanId}.${fileExt}`;

  const { error } = await supabase.storage
    .from("floorplans")
    .upload(filePath, file, {
      upsert: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from("floorplans")
    .getPublicUrl(filePath);

  return data.publicUrl;
}