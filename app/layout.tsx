import "./globals.css";
import type { Metadata } from "next";
import { setLocaleAction } from "@/app/preferences/actions";
import { AuthHeader } from "@/components/AuthHeader";
import { getSession } from "@/lib/auth";
import { getLocale } from "@/lib/i18n";

export const metadata: Metadata = {
  title: "Firestop Tracker",
  description: "Firestop tracking system for building projects",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const locale = await getLocale();

  return (
    <html lang={locale}>
      <body>
        {session ? (
          <AuthHeader session={session} locale={locale} setLocale={setLocaleAction} />
        ) : null}
        {children}
      </body>
    </html>
  );
}
