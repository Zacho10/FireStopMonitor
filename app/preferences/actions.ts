"use server";

import { revalidatePath } from "next/cache";
import { isSupportedLocale, setLocaleCookie } from "@/lib/i18n";

export async function setLocaleAction(formData: FormData) {
  const locale = String(formData.get("locale") || "");

  if (!isSupportedLocale(locale)) {
    return;
  }

  await setLocaleCookie(locale);
  revalidatePath("/", "layout");
}
