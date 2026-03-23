"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import type { AppLocale } from "@/lib/i18n";
import type { FirestopWithPhotos } from "@/types/database";
import {
  createFirestop,
  updateFirestopPosition,
} from "@/app/projects/[id]/floorplans/[floorplanId]/actions";
import { FirestopEditor } from "@/components/FirestopEditor";
import { FirestopsList } from "@/components/FirestopsList";
import {
  getFirestopStatusClasses,
  getFirestopStatusLabel,
} from "@/lib/firestop-status";
import { firestopStatuses, summarizeFirestopsByStatus } from "@/lib/firestop-summary";
import type { FirestopStatus } from "@/types/database";

type FloorplanViewerProps = {
  projectId: string;
  floorplanId: string;
  imageUrl: string | null;
  title: string;
  firestops: FirestopWithPhotos[];
  canEdit: boolean;
  locale: AppLocale;
};

export function FloorplanViewer({
  projectId,
  floorplanId,
  imageUrl,
  title,
  firestops,
  canEdit,
  locale,
}: FloorplanViewerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const panLayerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const isDraggingRef = useRef(false);
  const transparentDragImageRef = useRef<HTMLImageElement | null>(null);

  useEffect(() => {
    const img = new Image();
    img.src =
      "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==";
    transparentDragImageRef.current = img;
  }, []);

  const [isPending, startTransition] = useTransition();
  const [isAddMode, setIsAddMode] = useState(false);
  const [pendingPin, setPendingPin] = useState<{ x: number; y: number } | null>(
    null
  );
  const [selectedFirestopId, setSelectedFirestopId] = useState<string | null>(
    null
  );
  const [statusFilter, setStatusFilter] = useState<FirestopStatus | "all">("all");
  const [searchInput, setSearchInput] = useState("");
  const [appliedSearchQuery, setAppliedSearchQuery] = useState("");
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const scaleRef = useRef(1);
  const offsetRef = useRef({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const panStartRef = useRef({ x: 0, y: 0 });
  const panOriginRef = useRef({ x: 0, y: 0 });
  const hasImage = Boolean(imageUrl);
  const isPanMode = !isAddMode;
  const firestopSummary = summarizeFirestopsByStatus(firestops);
  const copy =
    locale === "el"
      ? {
          workspace: "Περιοχή Σχεδίου",
          cancelAdd: "Ακύρωση προσθήκης",
          addFirestop: "Προσθήκη Πυροφραγής",
          savingPin: "Αποθήκευση pin...",
          confirmPin: "Επιβεβαίωσε ή ακύρωσε την επιλεγμένη θέση",
          readonly: "Η λειτουργία είναι μόνο για ανάγνωση για αυτόν τον λογαριασμό",
          uploadFirst: "Ανέβασε πρώτα εικόνα κάτοψης για να τοποθετήσεις pins",
          clickToPlace: "Πάτησε πάνω στην κάτοψη για να τοποθετήσεις νέα πυροφραγή",
          dragZoomed: "Σύρε για να μετακινήσεις τη ζουμαρισμένη κάτοψη",
          selectPin: "Επέλεξε pin ή ενεργοποίησε add mode",
          total: "Σύνολο",
          pending: "Εκκρεμεί",
          approved: "Εγκεκριμένα",
          rejected: "Απορριφθέντα",
          searchPlaceholder: "Αναζήτηση με κωδικό πυροφραγής",
          search: "Αναζήτηση",
          clear: "Καθαρισμός",
          allStatuses: "Όλες οι καταστάσεις",
          searchResults: "Αποτελέσματα αναζήτησης για",
          noImage: "Δεν υπάρχει ακόμη εικόνα κάτοψης",
          noImageDesc:
            "Ανέβασε πρώτα εικόνα κάτοψης και μετά θα μπορείς να τοποθετείς και να μετακινείς firestop pins.",
        }
      : {
          workspace: "Drawing Workspace",
          cancelAdd: "Cancel add",
          addFirestop: "Add Firestop",
          savingPin: "Saving pin...",
          confirmPin: "Confirm or cancel the selected position",
          readonly: "Read-only mode enabled for this account",
          uploadFirst: "Upload a floorplan image to place firestop pins",
          clickToPlace: "Click on the floorplan to place a new firestop",
          dragZoomed: "Drag to move the zoomed floorplan",
          selectPin: "Select a pin or enable add mode",
          total: "Total",
          pending: "Pending",
          approved: "Approved",
          rejected: "Rejected",
          searchPlaceholder: "Search by firestop code",
          search: "Search",
          clear: "Clear",
          allStatuses: "All statuses",
          searchResults: "Search results for",
          noImage: "No floorplan image yet",
          noImageDesc:
            "Upload a floorplan image first, then you can place and move firestop pins.",
        };

  const filteredFirestops = useMemo(() => {
    const normalizedQuery = appliedSearchQuery.trim().toLowerCase();

    return firestops.filter((firestop) => {
      const matchesStatus =
        statusFilter === "all" || firestop.status === statusFilter;
      const matchesSearch =
        !normalizedQuery ||
        firestop.code.toLowerCase().includes(normalizedQuery);

      return matchesStatus && matchesSearch;
    });
  }, [appliedSearchQuery, firestops, statusFilter]);

  const effectiveSelectedFirestopId =
    selectedFirestopId &&
    filteredFirestops.some((firestop) => firestop.id === selectedFirestopId)
      ? selectedFirestopId
      : filteredFirestops[0]?.id ?? null;

  const selectedFirestop = useMemo(
    () =>
      filteredFirestops.find((item) => item.id === effectiveSelectedFirestopId) ||
      null,
    [effectiveSelectedFirestopId, filteredFirestops]
  );

  const applySearch = () => {
    const nextQuery = searchInput.trim();
    setAppliedSearchQuery(nextQuery);

    if (!nextQuery) {
      return;
    }

    const normalizedQuery = nextQuery.toLowerCase();
    const firstMatch = firestops.find((firestop) => {
      const matchesStatus =
        statusFilter === "all" || firestop.status === statusFilter;

      return (
        matchesStatus &&
        firestop.code.toLowerCase().includes(normalizedQuery)
      );
    });

    setSelectedFirestopId(firstMatch?.id ?? null);
  };

  const clearSearch = () => {
    setSearchInput("");
    setAppliedSearchQuery("");
  };

  const handleContainerClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;

    if (isPanning) {
      return;
    }

    if (target.closest("[data-pin='true']")) {
      return;
    }

    if (!isAddMode) {
      return;
    }

    if (!hasImage) {
      return;
    }

    const content = contentRef.current;
    if (!content) return;

    const rect = content.getBoundingClientRect();

    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    setPendingPin({ x, y });
  };

  const handleConfirmPendingPin = () => {
    if (!pendingPin) return;

    startTransition(async () => {
      await createFirestop({
        projectId,
        floorplanId,
        x: pendingPin.x,
        y: pendingPin.y,
      });

      setPendingPin(null);
      setIsAddMode(false);
    });
  };

  const handleCancelPendingPin = () => {
    setPendingPin(null);
  };

  const clampOffset = (
    nextOffset: { x: number; y: number },
    nextScale: number
  ) => {
    const container = containerRef.current;
    const content = contentRef.current;

    if (!container || !content) {
      return nextOffset;
    }

    const containerRect = container.getBoundingClientRect();

    const baseWidth = content.offsetWidth;
    const baseHeight = content.offsetHeight;

    const scaledWidth = baseWidth * nextScale;
    const scaledHeight = baseHeight * nextScale;

    const minX = Math.min(0, containerRect.width - scaledWidth);
    const maxX = 0;

    const minY = Math.min(0, containerRect.height - scaledHeight);
    const maxY = 0;

    return {
      x: Math.min(Math.max(nextOffset.x, minX), maxX),
      y: Math.min(Math.max(nextOffset.y, minY), maxY),
    };
  };

  const applyView = (
    nextScale: number,
    nextOffset: { x: number; y: number }
  ) => {
    scaleRef.current = nextScale;
    offsetRef.current = nextOffset;
    setScale(nextScale);
    setOffset(nextOffset);
  };

  const zoomAtPoint = (
    clientX: number,
    clientY: number,
    nextScale: number
  ) => {
    const panLayer = panLayerRef.current;
    if (!panLayer) return;

    const currentScale = scaleRef.current;
    const currentOffset = offsetRef.current;
    const panLayerRect = panLayer.getBoundingClientRect();

    const contentX = (clientX - panLayerRect.left) / currentScale;
    const contentY = (clientY - panLayerRect.top) / currentScale;

    const nextOffset = {
      x: currentOffset.x - contentX * (nextScale - currentScale),
      y: currentOffset.y - contentY * (nextScale - currentScale),
    };

    const clamped = clampOffset(nextOffset, nextScale);

    applyView(nextScale, clamped);
  };

  const zoomIn = () => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const nextScale = Math.min(Number((scaleRef.current + 0.25).toFixed(2)), 4);

    zoomAtPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      nextScale
    );
  };

  const zoomOut = () => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const nextScale = Math.max(Number((scaleRef.current - 0.25).toFixed(2)), 1);

    if (nextScale === 1) {
      applyView(1, { x: 0, y: 0 });
      return;
    }

    zoomAtPoint(
      rect.left + rect.width / 2,
      rect.top + rect.height / 2,
      nextScale
    );
  };

  const resetView = () => {
    applyView(1, { x: 0, y: 0 });
  };

  const handlePanStart = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanMode) return;
    if (scaleRef.current <= 1) return;

    const target = event.target as HTMLElement;
    if (target.closest("[data-pin='true']")) return;

    setIsPanning(true);
    panStartRef.current = { x: event.clientX, y: event.clientY };
    panOriginRef.current = { ...offsetRef.current };
  };

  const handlePanMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isPanning) return;

    const dx = event.clientX - panStartRef.current.x;
    const dy = event.clientY - panStartRef.current.y;

    const nextOffset = {
      x: panOriginRef.current.x + dx,
      y: panOriginRef.current.y + dy,
    };

    applyView(scaleRef.current, clampOffset(nextOffset, scaleRef.current));
  };

  const handlePanEnd = () => {
    setIsPanning(false);
  };

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-200 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:px-5">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-400">
              {copy.workspace}
            </p>
            <h2 className="mt-2 text-lg font-semibold text-slate-900">
              {title}
            </h2>
          </div>

          <div className="flex w-full flex-col gap-3 sm:w-auto">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={zoomOut}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                −
              </button>

              <button
                type="button"
                onClick={resetView}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {Math.round(scale * 100)}%
              </button>

              <button
                type="button"
                onClick={zoomIn}
                className="rounded-2xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                +
              </button>
            </div>

            {canEdit ? (
              <button
                type="button"
                onClick={() => {
                  if (!hasImage) {
                    return;
                  }

                  setIsAddMode((prev) => {
                    const next = !prev;
                    if (!next) {
                      setPendingPin(null);
                    }

                    return next;
                  });
                }}
                className={`w-full rounded-xl px-4 py-2 text-sm font-medium transition sm:w-auto ${
                  isAddMode
                    ? "bg-amber-500 text-white hover:bg-amber-600"
                    : "bg-slate-900 text-white hover:bg-slate-700"
                }`}
                disabled={!hasImage}
              >
                {isAddMode ? copy.cancelAdd : copy.addFirestop}
              </button>
            ) : null}

            <p className="max-w-xl text-xs text-slate-500">
              {isPending
                ? copy.savingPin
                : pendingPin
                ? copy.confirmPin
                : !canEdit
                ? copy.readonly
                : !hasImage
                ? copy.uploadFirst
                : isAddMode
                ? copy.clickToPlace
                : scale > 1
                ? copy.dragZoomed
                : copy.selectPin}
            </p>
          </div>
        </div>

        <div className="border-b border-slate-200 px-4 py-4">
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {copy.total}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {firestops.length}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {copy.pending}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-slate-900">
                    {firestopSummary.new +
                      firestopSummary.to_install +
                      firestopSummary.to_inspect}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {copy.approved}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-green-600">
                    {firestopSummary.approved}
                  </p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-center">
                  <p className="text-xs uppercase tracking-[0.12em] text-slate-500">
                    {copy.rejected}
                  </p>
                  <p className="mt-2 text-xl font-semibold text-red-600">
                    {firestopSummary.rejected}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-[minmax(260px,1fr)_220px] lg:min-w-[560px]">
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      applySearch();
                    }
                  }}
                  placeholder={copy.searchPlaceholder}
                  className="min-w-0 flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
                />
                <button
                  type="button"
                  onClick={applySearch}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:whitespace-nowrap"
                >
                  {copy.search}
                </button>
                <button
                  type="button"
                  onClick={clearSearch}
                  disabled={!searchInput && !appliedSearchQuery}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 sm:whitespace-nowrap"
                >
                  {copy.clear}
                </button>
              </div>

              <select
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as FirestopStatus | "all")
                }
                className="rounded-xl border border-slate-300 px-3 py-2 text-sm outline-none focus:border-slate-500"
              >
                <option value="all">{copy.allStatuses}</option>
                {firestopStatuses.map((status) => (
                  <option key={status} value={status}>
                    {getFirestopStatusLabel(status, locale)}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {appliedSearchQuery && (
            <p className="mt-3 text-sm text-slate-500">
              {copy.searchResults}{" "}
              <span className="font-medium text-slate-700">
                &quot;{appliedSearchQuery}&quot;
              </span>
            </p>
          )}
        </div>

        <div className="p-4">
          <div
            ref={containerRef}
            onClick={handleContainerClick}
            onMouseDown={handlePanStart}
            onMouseMove={handlePanMove}
            onMouseUp={handlePanEnd}
            onMouseLeave={handlePanEnd}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(event) => {
              if (!canEdit) return;
              const content = contentRef.current;
              if (!content) return;

              const firestopId = event.dataTransfer.getData("firestopId");
              if (!firestopId) return;

              const rect = content.getBoundingClientRect();

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
            className={`relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 ${
              isAddMode
                ? "cursor-crosshair"
                : isPanMode && scale > 1
                ? isPanning
                  ? "cursor-grabbing"
                  : "cursor-grab"
                : "cursor-default"
            }`}
          >
            <div
              ref={panLayerRef}
              className="relative"
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px)`,
              }}
            >
              <div
                ref={contentRef}
                className="relative origin-top-left"
                style={{
                  transform: `scale(${scale})`,
                }}
              >
                {hasImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={imageUrl ?? undefined}
                      alt={title}
                      className="block h-auto w-full select-none"
                      draggable={false}
                    />
                  </>
                ) : (
                  <div className="flex min-h-[420px] items-center justify-center rounded-xl border border-dashed border-slate-300 bg-white text-center">
                    <div className="max-w-md px-6 py-10">
                      <h3 className="text-lg font-semibold text-slate-900">
                        No floorplan image yet
                      </h3>
                      <p className="mt-2 text-sm text-slate-600">
                        Upload a floorplan image first, then you can place and move
                        firestop pins on top of it.
                      </p>
                    </div>
                  </div>
                )}

                {filteredFirestops.map((firestop) => {
                  return (
                    <button
                      key={firestop.id}
                      type="button"
                      data-pin="true"
                      draggable={canEdit}
                      onClick={(event) => {
                        if (isDraggingRef.current) return;
                        event.stopPropagation();
                        setSelectedFirestopId(firestop.id);
                      }}
                      onDragStart={(event) => {
                        isDraggingRef.current = true;
                        event.dataTransfer.setData("firestopId", firestop.id);
                        if (transparentDragImageRef.current) {
                          event.dataTransfer.setDragImage(
                            transparentDragImageRef.current,
                            0,
                            0
                          );
                        }
                      }}
                      onDragEnd={() => {
                        setTimeout(() => {
                          isDraggingRef.current = false;
                        }, 50);
                      }}
                      className={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 text-[10px] font-bold shadow transition ${
                        effectiveSelectedFirestopId === firestop.id
                          ? `scale-110 ring-2 ring-slate-900 ${getFirestopStatusClasses(
                              firestop.status
                            )}`
                          : `${getFirestopStatusClasses(
                              firestop.status
                            )} hover:scale-105`
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

                {pendingPin && (
                  <div
                    className="absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-dashed border-amber-600 bg-amber-100 text-[10px] font-bold text-amber-700 shadow"
                    style={{
                      left: `${pendingPin.x}%`,
                      top: `${pendingPin.y}%`,
                    }}
                  >
                    +
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {pendingPin && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-sm font-semibold text-amber-900">
                New firestop position selected
              </h3>
              <p className="mt-1 text-sm text-amber-800">
                Position: {pendingPin.x.toFixed(2)}%, {pendingPin.y.toFixed(2)}%
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleCancelPendingPin}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleConfirmPendingPin}
                disabled={isPending}
                className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700 disabled:opacity-50"
              >
                {isPending ? "Saving..." : "Confirm Firestop"}
              </button>
            </div>
          </div>
        </div>
      )}

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
              key={`${selectedFirestop.id}:${selectedFirestop.code}:${selectedFirestop.status}:${selectedFirestop.installed_at || ""}`}
              firestop={selectedFirestop}
              projectId={projectId}
              floorplanId={floorplanId}
              canEdit={canEdit}
              locale={locale}
            />
          </div>
        )}
      </div>

      <FirestopsList
        firestops={filteredFirestops}
        totalCount={firestops.length}
        selectedFirestopId={effectiveSelectedFirestopId}
        locale={locale}
        onSelect={setSelectedFirestopId}
      />
    </div>
  );
}
