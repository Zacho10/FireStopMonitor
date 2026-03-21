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