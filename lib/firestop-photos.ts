import { supabase } from "@/lib/supabase";
import type {
  Firestop,
  FirestopPhoto,
  FirestopWithPhotos,
} from "@/types/database";

function createEmptyPhotoSlots(): FirestopWithPhotos["photos"] {
  return {
    before: null,
    after: null,
  };
}

export async function getFirestopPhotosByFirestopIds(
  firestopIds: string[]
): Promise<{
  data: FirestopPhoto[] | null;
  error: string | null;
}> {
  if (!firestopIds.length) {
    return {
      data: [],
      error: null,
    };
  }

  const { data, error } = await supabase
    .from("firestop_photos")
    .select("*")
    .in("firestop_id", firestopIds)
    .order("created_at", { ascending: false });

  if (error) {
    return {
      data: null,
      error: error.message,
    };
  }

  return {
    data: data as FirestopPhoto[],
    error: null,
  };
}

export function attachPhotosToFirestops(
  firestops: Firestop[],
  photos: FirestopPhoto[]
): FirestopWithPhotos[] {
  const photosByFirestopId = new Map<string, FirestopWithPhotos["photos"]>();

  for (const photo of photos) {
    if (photo.caption !== "before" && photo.caption !== "after") {
      continue;
    }

    const existing =
      photosByFirestopId.get(photo.firestop_id) ?? createEmptyPhotoSlots();

    if (!existing[photo.caption]) {
      existing[photo.caption] = photo;
    }

    photosByFirestopId.set(photo.firestop_id, existing);
  }

  return firestops.map((firestop) => ({
    ...firestop,
    photos: photosByFirestopId.get(firestop.id) ?? createEmptyPhotoSlots(),
  }));
}
