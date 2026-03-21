import { supabase } from "@/lib/supabase";
import type { Floorplan } from "@/types/database";

export async function getFloorplanById(
  floorplanId: string,
  projectId?: string
): Promise<{
  data: Floorplan | null;
  error: string | null;
}> {
  let query = supabase.from("floorplans").select("*").eq("id", floorplanId);

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query.maybeSingle();

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data: data as Floorplan | null,
    error: null,
  };
}