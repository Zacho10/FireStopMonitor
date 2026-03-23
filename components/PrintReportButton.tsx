"use client";

import type { AppLocale } from "@/lib/i18n";

type PrintReportButtonProps = {
  locale: AppLocale;
};

export function PrintReportButton({ locale }: PrintReportButtonProps) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
    >
      {locale === "el" ? "Εκτύπωση / Αποθήκευση PDF" : "Print / Save PDF"}
    </button>
  );
}
