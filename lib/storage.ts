import { supabase } from "@/lib/supabase";
import type { FirestopPhotoSlot } from "@/types/database";

const STORAGE_BUCKET = "floorplans";

function getFileExtension(file: File) {
  const fromName = file.name.split(".").pop()?.trim().toLowerCase();

  if (fromName) {
    return fromName.replace(/[^a-z0-9]/g, "") || "img";
  }

  const fromType = file.type.split("/").pop()?.trim().toLowerCase();
  if (fromType) {
    return fromType.replace(/[^a-z0-9.+-]/g, "") || "img";
  }

  return "img";
}

function getContentType(file: File) {
  if (file.type?.startsWith("image/")) {
    return file.type;
  }

  const fileExt = getFileExtension(file);

  switch (fileExt) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "gif":
      return "image/gif";
    case "bmp":
      return "image/bmp";
    case "tif":
    case "tiff":
      return "image/tiff";
    case "heic":
      return "image/heic";
    case "heif":
      return "image/heif";
    case "avif":
      return "image/avif";
    case "svg":
      return "image/svg+xml";
    default:
      return "application/octet-stream";
  }
}

function getVersionToken() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export async function uploadFloorplanImage(
  file: File,
  projectId: string,
  floorplanId: string
) {
  const fileExt = getFileExtension(file);
  const versionToken = getVersionToken();
  const filePath = `${projectId}/${floorplanId}-${versionToken}.${fileExt}`;
  const fileBytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, fileBytes, {
      contentType: getContentType(file),
      upsert: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return `${data.publicUrl}?v=${versionToken}`;
}

export async function uploadFirestopPhoto(
  file: File,
  projectId: string,
  floorplanId: string,
  firestopId: string,
  slot: FirestopPhotoSlot
) {
  const fileExt = getFileExtension(file);
  const versionToken = getVersionToken();
  const filePath = `${projectId}/${floorplanId}/firestops/${firestopId}/${slot}-${versionToken}.${fileExt}`;
  const fileBytes = new Uint8Array(await file.arrayBuffer());

  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(filePath, fileBytes, {
      contentType: getContentType(file),
      upsert: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase.storage
    .from(STORAGE_BUCKET)
    .getPublicUrl(filePath);

  return `${data.publicUrl}?v=${versionToken}`;
}

export async function deleteStorageFileByPublicUrl(publicUrl: string) {
  const normalizedUrl = publicUrl.split("?")[0];
  const marker = `/${STORAGE_BUCKET}/`;
  const markerIndex = normalizedUrl.indexOf(marker);

  if (markerIndex === -1) {
    return;
  }

  const filePath = decodeURIComponent(
    normalizedUrl.slice(markerIndex + marker.length)
  );

  const { error } = await supabase.storage.from(STORAGE_BUCKET).remove([filePath]);

  if (error) {
    throw new Error(error.message);
  }
}
