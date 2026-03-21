import Link from "next/link";
import type { Floorplan } from "@/types/database";

type FloorplanCardProps = {
  projectId: string;
  floorplan: Floorplan;
};

export function FloorplanCard({
  projectId,
  floorplan,
}: FloorplanCardProps) {
  return (
    <Link
      href={`/projects/${projectId}/floorplans/${floorplan.id}`}
      className="block rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-slate-300 hover:shadow-md"
    >
      <h3 className="text-lg font-semibold text-slate-900">
        {floorplan.title}
      </h3>

      <div className="mt-3 space-y-1 text-sm text-slate-600">
        <p>
          <span className="font-medium text-slate-700">Floor:</span>{" "}
          {floorplan.floor_name || "-"}
        </p>
        <p>
          <span className="font-medium text-slate-700">Size:</span>{" "}
          {floorplan.width || "-"} × {floorplan.height || "-"}
        </p>
      </div>
    </Link>
  );
}