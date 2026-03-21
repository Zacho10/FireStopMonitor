import type { FirestopStatus } from "@/types/database";

export function getFirestopStatusClasses(status: FirestopStatus): string {
  switch (status) {
    case "new":
      return "bg-slate-500 border-white text-white";
    case "to_install":
      return "bg-blue-600 border-white text-white";
    case "installed":
      return "bg-amber-500 border-white text-white";
    case "to_inspect":
      return "bg-cyan-600 border-white text-white";
    case "approved":
      return "bg-green-600 border-white text-white";
    case "rejected":
      return "bg-red-600 border-white text-white";
    case "repaired":
      return "bg-violet-600 border-white text-white";
    default:
      return "bg-slate-500 border-white text-white";
  }
}

export function getFirestopStatusBadgeClasses(status: FirestopStatus): string {
  switch (status) {
    case "new":
      return "bg-slate-100 text-slate-700";
    case "to_install":
      return "bg-blue-100 text-blue-700";
    case "installed":
      return "bg-amber-100 text-amber-700";
    case "to_inspect":
      return "bg-cyan-100 text-cyan-700";
    case "approved":
      return "bg-green-100 text-green-700";
    case "rejected":
      return "bg-red-100 text-red-700";
    case "repaired":
      return "bg-violet-100 text-violet-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}