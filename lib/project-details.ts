import { supabase } from "@/lib/supabase";
import type { Floorplan, Project } from "@/types/database";

export async function getProjectById(projectId: string): Promise<{
  data: Project | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data: data as Project | null,
    error: null,
  };
}

export async function getFloorplansByProjectId(projectId: string): Promise<{
  data: Floorplan[] | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("floorplans")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data: data as Floorplan[],
    error: null,
  };
}

export async function getFloorplansByProjectIds(projectIds: string[]): Promise<{
  data: Floorplan[] | null;
  error: string | null;
}> {
  if (!projectIds.length) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from("floorplans")
    .select("*")
    .in("project_id", projectIds)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data: data as Floorplan[],
    error: null,
  };
}
