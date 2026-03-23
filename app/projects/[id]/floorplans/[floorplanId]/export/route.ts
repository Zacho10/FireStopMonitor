import { buildFirestopsCsv, getFloorplanReportData } from "@/lib/report-data";
import { getLocale } from "@/lib/i18n";
import { requireProjectAccess } from "@/lib/project-access";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/projects/[id]/floorplans/[floorplanId]/export">
) {
  const { id, floorplanId } = await params;
  const locale = await getLocale();
  await requireProjectAccess(id);
  const { project, floorplan, firestops, error } = await getFloorplanReportData(
    id,
    floorplanId
  );

  if (error || !project || !floorplan) {
    return new Response(
      locale === "el"
        ? "Δεν ήταν δυνατή η δημιουργία εξαγωγής κάτοψης"
        : "Could not generate floorplan export",
      { status: 500 }
    );
  }

  const csv = buildFirestopsCsv(
    firestops.map((firestop) => ({
      projectName: project.name,
      floorplanTitle: floorplan.title,
      floorName: floorplan.floor_name,
      code: firestop.code,
      status: firestop.status,
      type: firestop.type,
      roomZone: firestop.room_zone,
      locationDescription: firestop.location_description,
      systemName: firestop.system_name,
      fireRating: firestop.fire_rating,
      substrate: firestop.substrate,
      installedBy: firestop.installed_by,
      installedAt: firestop.installed_at,
      inspectedBy: firestop.inspected_by,
      inspectionDate: firestop.inspection_date,
      inspectionNotes: firestop.inspection_notes,
      beforePhoto: firestop.photos.before?.file_url || null,
      afterPhoto: firestop.photos.after?.file_url || null,
      notes: firestop.notes,
    })),
    locale
  );

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="floorplan-${floorplanId}-firestops.csv"`,
    },
  });
}
