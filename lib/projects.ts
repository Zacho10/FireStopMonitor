import { supabase } from "@/lib/supabase";
import type { Project } from "@/types/database";

export async function getProjects(): Promise<{
  data: Project[] | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data: data as Project[],
    error: null,
  };
}