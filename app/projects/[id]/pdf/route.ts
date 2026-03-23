import {
  buildPdfDocument,
  buildProjectPdfLines,
} from "@/lib/pdf-report";
import { requireProjectAccess } from "@/lib/project-access";
import { getProjectReportData } from "@/lib/report-data";

export async function GET(
  _request: Request,
  { params }: RouteContext<"/projects/[id]/pdf">
) {
  const { id } = await params;
  await requireProjectAccess(id);
  const { project, floorplans, firestops, error } = await getProjectReportData(id);

  if (error || !project) {
    return new Response("Could not generate project PDF", { status: 500 });
  }

  const floorplansById = new Map(
    floorplans.map((floorplan) => [floorplan.id, floorplan])
  );
  const pdf = buildPdfDocument(
    `Project Report - ${project.name}`,
    buildProjectPdfLines({
      projectName: project.name,
      client: project.client,
      siteAddress: project.site_address,
      floorplansCount: floorplans.length,
      firestops: firestops.map((firestop) => {
        const floorplan = floorplansById.get(firestop.floorplan_id);

        return {
          code: firestop.code,
          status: firestop.status,
          type: firestop.type,
          roomZone: firestop.room_zone,
          locationDescription: firestop.location_description,
          floorplanTitle: floorplan?.title || null,
          floorName: floorplan?.floor_name || null,
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
    })
  );

  return new Response(pdf, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="project-${id}-report.pdf"`,
    },
  });
}
