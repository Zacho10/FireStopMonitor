"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { Firestop } from "@/types/database";
import { createFirestop } from "@/app/projects/[id]/floorplans/[floorplanId]/actions";
import { FirestopEditor } from "@/components/FirestopEditor";
import { FirestopsList } from "@/components/FirestopsList";
import { getFirestopStatusClasses } from "@/lib/firestop-status";
import { updateFirestopPosition } from "@/app/projects/[id]/floorplans/[floorplanId]/actions";


type FloorplanViewerProps = {
  projectId: string;
  floorplanId: string;
  imageUrl: string;
  title: string;
  firestops: Firestop[];
};

export function FloorplanViewer({
  projectId,
  floorplanId,
  imageUrl,
  title,
  firestops,
}: FloorplanViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const transparentDragImageRef = useRef<HTMLImageElement | null>(null);

useEffect(() => {
  const img = new Image();
  img.src =
    "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
  transparentDragImageRef.current = img;
}, []);
  const [isPending, startTransition] = useTransition();
  const [selectedFirestopId, setSelectedFirestopId] = useState<string | null>(
    null
  );

  useEffect(() => {
    if (!firestops.length) {
      setSelectedFirestopId(null);
      return;
    }

    if (
      selectedFirestopId &&
      firestops.some((firestop) => firestop.id === selectedFirestopId)
    ) {
      return;
    }

    setSelectedFirestopId(firestops[0].id);
  }, [firestops, selectedFirestopId]);

  const selectedFirestop = useMemo(
    () => firestops.find((item) => item.id === selectedFirestopId) || null,
    [firestops, selectedFirestopId]
  );

  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    if (target.closest("[data-pin='true']")) {
      return;
    }

    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    startTransition(async () => {
      await createFirestop({
        projectId,
        floorplanId,
        x,
        y,
      });
    });
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">
            Floorplan
          </h2>

          <p className="text-xs text-slate-500">
            {isPending ? "Saving pin..." : "Click empty area to add firestop"}
          </p>
        </div>

        <div className="p-4">
          <div
  ref={containerRef}
  onClick={handleContainerClick}
  onDragOver={(e) => e.preventDefault()}
  onDrop={(event) => {
    const container = containerRef.current;
    if (!container) return;

    const firestopId = event.dataTransfer.getData("firestopId");
    if (!firestopId) return;

    const rect = container.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    startTransition(async () => {
      await updateFirestopPosition({
        id: firestopId,
        projectId,
        floorplanId,
        x,
        y,
      });
    });
  }}
  className="relative cursor-crosshair overflow-hidden rounded-xl border border-slate-200 bg-slate-100"
>
            <img
              src={imageUrl}
              alt={title}
              className="block h-auto w-full select-none"
              draggable={false}
            />

            {firestops.map((firestop) => {
              const isSelected = selectedFirestopId === firestop.id;

              return (
                <button
                    key={firestop.id}
                    type="button"
                    data-pin="true"
                    draggable
                    onClick={(event) => {
                   if (isDraggingRef.current) return;
                      event.stopPropagation();
                      setSelectedFirestopId(firestop.id);
                     }}
                    onDragStart={(event) => {
    isDraggingRef.current = true;
    event.dataTransfer.setData("firestopId", firestop.id);
     if (transparentDragImageRef.current) {
        event.dataTransfer.setDragImage(transparentDragImageRef.current , 0 , 0);
 }}
}onDragEnd={() => {
    setTimeout(() => {
      isDraggingRef.current = false;
    }, 50);
  }}
  className={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-[10px] font-bold shadow transition ${
    selectedFirestopId === firestop.id
      ? `scale-110 ring-2 ring-slate-900 ${getFirestopStatusClasses(
          firestop.status
        )}`
      : `${getFirestopStatusClasses(firestop.status)} hover:scale-105`
  }`}
  style={{
    left: `${firestop.x}%`,
    top: `${firestop.y}%`,
  }}
>
  <span className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-md bg-slate-900 px-2 py-1 text-[10px] font-medium text-white shadow">
    {firestop.code}
  </span>
  <span>•</span>
</button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        {!selectedFirestop ? (
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              Firestop Details
            </h3>
            <p className="mt-2 text-sm text-slate-600">
              Επίλεξε ένα pin για να δεις και να επεξεργαστείς τα στοιχεία της
              πυροφραγής.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Edit Firestop
              </h3>
              <p className="mt-1 text-sm text-slate-600">
                Επεξεργασία στοιχείων για:{" "}
                <span className="font-medium text-slate-800">
                  {selectedFirestop.code}
                </span>
              </p>
            </div>

            <FirestopEditor
              key={selectedFirestop.id}
              firestop={selectedFirestop}
              projectId={projectId}
              floorplanId={floorplanId}
            />
          </div>
        )}
      </div>

      <FirestopsList
        firestops={firestops}
        selectedFirestopId={selectedFirestopId}
        onSelect={setSelectedFirestopId}
      />
    </div>
  );
}