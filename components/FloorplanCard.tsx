import Link from "next/link";
import { DeleteFloorplanButton } from "@/components/DeleteFloorplanButton";
import { EditFloorplanForm } from "@/components/EditFloorplanForm";
import type { AppLocale } from "@/lib/i18n";
import type { Floorplan } from "@/types/database";

type FloorplanCardProps = {
  projectId: string;
  floorplan: Floorplan;
  locale: AppLocale;
  onDelete: (formData: FormData) => Promise<void>;
  onEdit: (formData: FormData) => Promise<void>;
  canManage: boolean;
};

export function FloorplanCard({
  projectId,
  floorplan,
  locale,
  onDelete,
  onEdit,
  canManage,
}: FloorplanCardProps) {
  const copy =
    locale === "el"
      ? {
          title: "Κάτοψη",
          area: "Περιοχή",
          floorSection: "Όροφος / Ενότητα",
          drawingArea: "Σχέδιο / Περιοχή",
        }
      : {
          title: "Floorplan",
          area: "Area",
          floorSection: "Floor / Section",
          drawingArea: "Drawing / Area",
        };
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      <Link
        href={`/projects/${projectId}/floorplans/${floorplan.id}`}
        className="block"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              {copy.title}
            </p>
            <h3 className="mt-2 text-lg font-semibold text-slate-900">
              {floorplan.title}
            </h3>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            {floorplan.floor_name || copy.area}
          </span>
        </div>

        <div className="mt-4 space-y-2 text-sm text-slate-600">
          <p>
            <span className="font-medium text-slate-700">{copy.floorSection}:</span>{" "}
            {floorplan.floor_name || "-"}
          </p>
          <p>
            <span className="font-medium text-slate-700">{copy.drawingArea}:</span>{" "}
            {floorplan.title}
          </p>
        </div>
      </Link>

      {canManage ? (
        <div className="mt-4 flex flex-wrap justify-end gap-3">
          <EditFloorplanForm
            projectId={projectId}
            floorplanId={floorplan.id}
            initialTitle={floorplan.title}
            initialFloorName={floorplan.floor_name}
            locale={locale}
            action={onEdit}
          />
          <DeleteFloorplanButton
            projectId={projectId}
            floorplanId={floorplan.id}
            floorplanTitle={floorplan.title}
            action={onDelete}
          />
        </div>
      ) : null}
    </div>
  );
}
