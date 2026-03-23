"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import type { AppLocale } from "@/lib/i18n";

type LocaleSwitcherProps = {
  locale: AppLocale;
  action: (formData: FormData) => Promise<void>;
};

export function LocaleSwitcher({ locale, action }: LocaleSwitcherProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const submitLocale = (nextLocale: AppLocale) => {
    const formData = new FormData();
    formData.set("locale", nextLocale);

    startTransition(async () => {
      await action(formData);
      router.refresh();
    });
  };

  return (
    <div className="inline-flex rounded-full border border-slate-300 bg-white p-1">
      <button
        type="button"
        onClick={() => submitLocale("en")}
        disabled={isPending || locale === "en"}
        className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
          locale === "en"
            ? "bg-slate-900 text-white"
            : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => submitLocale("el")}
        disabled={isPending || locale === "el"}
        className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
          locale === "el"
            ? "bg-slate-900 text-white"
            : "text-slate-600 hover:bg-slate-50"
        }`}
      >
        EL
      </button>
    </div>
  );
}
