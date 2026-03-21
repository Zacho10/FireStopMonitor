export type Project = {
  id: string;
  name: string;
  client: string | null;
  site_address: string | null;
  created_at: string;
};

export type Floorplan = {
  id: string;
  project_id: string;
  title: string;
  floor_name: string | null;
  image_url: string;
  width: number | null;
  height: number | null;
  created_at: string;
};

export type FirestopStatus =
  | "new"
  | "to_install"
  | "installed"
  | "to_inspect"
  | "approved"
  | "rejected"
  | "repaired";

export type Firestop = {
  id: string;
  project_id: string;
  floorplan_id: string;
  code: string;
  type: string;
  system_name: string | null;
  fire_rating: string | null;
  substrate: string | null;
  status: FirestopStatus;
  x: number;
  y: number;
  notes: string | null;
  installed_by: string | null;
  installed_at: string | null;
  created_at: string;
};

export type FirestopPhoto = {
  id: string;
  firestop_id: string;
  file_url: string;
  caption: string | null;
  created_at: string;
};