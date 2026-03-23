import { cookies } from "next/headers";

export const LOCALE_COOKIE_NAME = "firestop_locale";
export const supportedLocales = ["en", "el"] as const;

export type AppLocale = (typeof supportedLocales)[number];

export function isSupportedLocale(value: string): value is AppLocale {
  return supportedLocales.includes(value as AppLocale);
}

export async function getLocale(): Promise<AppLocale> {
  const cookieStore = await cookies();
  const locale = cookieStore.get(LOCALE_COOKIE_NAME)?.value;

  if (locale && isSupportedLocale(locale)) {
    return locale;
  }

  return "en";
}

export async function setLocaleCookie(locale: AppLocale) {
  const cookieStore = await cookies();

  cookieStore.set(LOCALE_COOKIE_NAME, locale, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
