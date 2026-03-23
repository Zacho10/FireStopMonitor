import type { Firestop, FirestopStatus } from "@/types/database";

export const firestopStatuses: FirestopStatus[] = [
  "new",
  "to_install",
  "installed",
  "to_inspect",
  "approved",
  "rejected",
  "repaired",
];

export function summarizeFirestopsByStatus(firestops: Firestop[]) {
  const summary = Object.fromEntries(
    firestopStatuses.map((status) => [status, 0])
  ) as Record<FirestopStatus, number>;

  for (const firestop of firestops) {
    summary[firestop.status] += 1;
  }

  return summary;
}
