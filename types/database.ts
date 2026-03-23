export type Project = {
  id: string;
  name: string;
  client: string | null;
  site_address: string | null;
  created_at: string;
};

export type AppUserRole = "admin" | "editor" | "viewer";

export type AppUser = {
  id: string;
  username: string;
  full_name: string;
  role: AppUserRole;
  is_active: boolean;
  password_hash: string;
  created_at: string;
  updated_at: string;
};

export type AuditLogEntry = {
  id: string;
  actor_user_id: string | null;
  actor_username: string | null;
  action: string;
  entity_type: string;
  entity_id: string | null;
  description: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
};

export type ProjectMembershipRole = "editor" | "viewer";

export type ProjectMembership = {
  id: string;
  user_id: string;
  project_id: string;
  role: ProjectMembershipRole;
  created_at: string;
};

export type Floorplan = {
  id: string;
  project_id: string;
  title: string;
  floor_name: string | null;
  image_url: string | null;
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
  location_description: string | null;
  room_zone: string | null;
  system_name: string | null;
  fire_rating: string | null;
  substrate: string | null;
  status: FirestopStatus;
  x: number;
  y: number;
  notes: string | null;
  installed_by: string | null;
  installed_at: string | null;
  inspected_by: string | null;
  inspection_date: string | null;
  inspection_notes: string | null;
  created_at: string;
};

export type FirestopPhotoSlot = "before" | "after";

export type FirestopPhoto = {
  id: string;
  firestop_id: string;
  file_url: string;
  caption: FirestopPhotoSlot | string | null;
  created_at: string;
};

export type FirestopWithPhotos = Firestop & {
  photos: Record<FirestopPhotoSlot, FirestopPhoto | null>;
};
