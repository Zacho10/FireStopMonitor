import { supabase } from "@/lib/supabase";
import type { Firestop } from "@/types/database";

export async function getFirestopsByFloorplanId(
  floorplanId: string
): Promise<{
  data: Firestop[] | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("firestops")
    .select("*")
    .eq("floorplan_id", floorplanId)
    .order("created_at", { ascending: true });

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data: data as Firestop[],
    error: null,
  };
}

export async function getFirestopsByProjectId(
  projectId: string
): Promise<{
  data: Firestop[] | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("firestops")
    .select("*")
    .eq("project_id", projectId)
    .order("created_at", { ascending: true });

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data: data as Firestop[],
    error: null,
  };
}

export async function getFirestopsByProjectIds(
  projectIds: string[]
): Promise<{
  data: Firestop[] | null;
  error: string | null;
}> {
  if (!projectIds.length) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from("firestops")
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
    data: data as Firestop[],
    error: null,
  };
}
