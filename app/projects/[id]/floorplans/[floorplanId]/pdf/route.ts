import {
  buildFloorplanPdfLines,
  buildPdfDocument,
} from "@/lib/pdf-report";
import { requireProjectAccess } from "@/lib/project-access";
import { getFloorplanReportData } from "@/lib/report-data";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/projects/[id]/floorplans/[floorplanId]/pdf">
) {
  const { id, floorplanId } = await params;
  await requireProjectAccess(id);
  const { project, floorplan, firestops, error } = await getFloorplanReportData(
    id,
    floorplanId
  );

  if (error || !project || !floorplan) {
    return new Response("Could not generate floorplan PDF", { status: 500 });
  }

  const pdf = buildPdfDocument(
    `Floorplan Report - ${floorplan.title}`,
    buildFloorplanPdfLines({
      projectName: project.name,
      floorplanTitle: floorplan.title,
      floorName: floorplan.floor_name,
      firestops: firestops.map((firestop) => ({
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
    })
  );

  return new Response(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="floorplan-${floorplanId}-report.pdf"`,
    },
  });
}
