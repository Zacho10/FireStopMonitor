import type { FirestopStatus } from "@/types/database";
import type { AppLocale } from "@/lib/i18n";

export function getFirestopStatusLabel(
  status: FirestopStatus,
  locale: AppLocale = "en"
): string {
  const labels =
    locale === "el"
      ? {
          new: "Νέα",
          to_install: "Προς Τοποθέτηση",
          installed: "Τοποθετημένη",
          to_inspect: "Προς Επιθεώρηση",
          approved: "Εγκεκριμένη",
          rejected: "Απορριφθείσα",
          repaired: "Επισκευασμένη",
        }
      : {
          new: "New",
          to_install: "To Install",
          installed: "Installed",
          to_inspect: "To Inspect",
          approved: "Approved",
          rejected: "Rejected",
          repaired: "Repaired",
        };

  return labels[status] ?? status;
}

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
