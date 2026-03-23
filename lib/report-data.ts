import { attachPhotosToFirestops, getFirestopPhotosByFirestopIds } from "@/lib/firestop-photos";
import { getFirestopsByFloorplanId, getFirestopsByProjectId } from "@/lib/firestops";
import { getFloorplanById } from "@/lib/floorplans";
import type { AppLocale } from "@/lib/i18n";
import { getFloorplansByProjectId, getProjectById } from "@/lib/project-details";
import { getFirestopStatusLabel } from "@/lib/firestop-status";

export async function getProjectReportData(projectId: string) {
  const [
    { data: project, error: projectError },
    { data: floorplans, error: floorplansError },
    { data: firestops, error: firestopsError },
  ] = await Promise.all([
    getProjectById(projectId),
    getFloorplansByProjectId(projectId),
    getFirestopsByProjectId(projectId),
  ]);

  const firestopIds = firestops?.map((firestop) => firestop.id) || [];
  const { data: photos, error: photosError } =
    await getFirestopPhotosByFirestopIds(firestopIds);

  return {
    project,
    floorplans: floorplans || [],
    firestops: attachPhotosToFirestops(firestops || [], photos || []),
    error: projectError || floorplansError || firestopsError || photosError,
  };
}

export async function getFloorplanReportData(
  projectId: string,
  floorplanId: string
) {
  const [
    { data: project, error: projectError },
    { data: floorplan, error: floorplanError },
    { data: firestops, error: firestopsError },
  ] = await Promise.all([
    getProjectById(projectId),
    getFloorplanById(floorplanId, projectId),
    getFirestopsByFloorplanId(floorplanId),
  ]);

  const firestopIds = firestops?.map((firestop) => firestop.id) || [];
  const { data: photos, error: photosError } =
    await getFirestopPhotosByFirestopIds(firestopIds);

  return {
    project,
    floorplan,
    firestops: attachPhotosToFirestops(firestops || [], photos || []),
    error: projectError || floorplanError || firestopsError || photosError,
  };
}

function escapeCsvCell(value: string | null | undefined) {
  const normalized = value ?? "";
  return `"${normalized.replaceAll('"', '""')}"`;
}

export function buildFirestopsCsv(
  rows: Array<{
    projectName: string;
    floorplanTitle: string;
    floorName: string | null;
    code: string;
    status: string;
    type: string;
    locationDescription: string | null;
    roomZone: string | null;
    systemName: string | null;
    fireRating: string | null;
    substrate: string | null;
    installedBy: string | null;
    installedAt: string | null;
    inspectedBy: string | null;
    inspectionDate: string | null;
    inspectionNotes: string | null;
    beforePhoto: string | null;
    afterPhoto: string | null;
    notes: string | null;
  }>,
  locale: AppLocale = "en"
) {
  const header =
    locale === "el"
      ? [
          "Έργο",
          "Κάτοψη",
          "Όροφος / Τμήμα",
          "Κωδικός",
          "Κατάσταση",
          "Τύπος",
          "Χώρος / Ζώνη",
          "Περιγραφή Τοποθεσίας",
          "Όνομα Συστήματος",
          "Πυραντίσταση",
          "Υπόστρωμα",
          "Τοποθέτησε",
          "Ημερομηνία Τοποθέτησης",
          "Επιθεώρησε",
          "Ημερομηνία Επιθεώρησης",
          "Σημειώσεις Επιθεώρησης",
          "Φωτογραφία Πριν",
          "Φωτογραφία Μετά",
          "Σημειώσεις",
        ]
      : [
          "Project",
          "Floorplan",
          "Floor / Section",
          "Code",
          "Status",
          "Type",
          "Room / Zone",
          "Location Description",
          "System Name",
          "Fire Rating",
          "Substrate",
          "Installed By",
          "Installation Date",
          "Inspected By",
          "Inspection Date",
          "Inspection Notes",
          "Before Photo",
          "After Photo",
          "Notes",
        ];

  const csvRows = rows.map((row) =>
    [
      row.projectName,
      row.floorplanTitle,
      row.floorName,
      row.code,
      getFirestopStatusLabel(row.status as Parameters<typeof getFirestopStatusLabel>[0], locale),
      row.type,
      row.roomZone,
      row.locationDescription,
      row.systemName,
      row.fireRating,
      row.substrate,
      row.installedBy,
      row.installedAt,
      row.inspectedBy,
      row.inspectionDate,
      row.inspectionNotes,
      row.beforePhoto,
      row.afterPhoto,
      row.notes,
    ]
      .map(escapeCsvCell)
      .join(",")
  );

  return [header.map(escapeCsvCell).join(","), ...csvRows].join("\n");
}
