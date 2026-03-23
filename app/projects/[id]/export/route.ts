import { buildFirestopsCsv, getProjectReportData } from "@/lib/report-data";
import { getLocale } from "@/lib/i18n";
import { requireProjectAccess } from "@/lib/project-access";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/projects/[id]/export">
) {
  const { id } = await params;
  const locale = await getLocale();
  await requireProjectAccess(id);
  const { project, floorplans, firestops, error } = await getProjectReportData(id);

  if (error || !project) {
    return new Response(
      locale === "el"
        ? "Δεν ήταν δυνατή η δημιουργία εξαγωγής έργου"
        : "Could not generate project export",
      { status: 500 }
    );
  }

  const floorplansById = new Map(floorplans.map((floorplan) => [floorplan.id, floorplan]));

  const csv = buildFirestopsCsv(
    firestops.map((firestop) => {
      const floorplan = floorplansById.get(firestop.floorplan_id);

      return {
        projectName: project.name,
        floorplanTitle: floorplan?.title || "-",
        floorName: floorplan?.floor_name || null,
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
      };
    }),
    locale
  );

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="project-${id}-firestops.csv"`,
    },
  });
}
