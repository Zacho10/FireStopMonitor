import Link from "next/link";
import { logoutAction } from "@/app/auth/actions";
import { BrandIdentity } from "@/components/BrandIdentity";
import type { AppSession } from "@/lib/auth";
import type { AppLocale } from "@/lib/i18n";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";

type AuthHeaderProps = {
  session: AppSession;
  locale: AppLocale;
  setLocale: (formData: FormData) => Promise<void>;
};

export async function AuthHeader({ session, locale, setLocale }: AuthHeaderProps) {
  const copy =
    locale === "el"
      ? {
          users: "Χρήστες",
          signedIn: "Συνδεδεμένος ως",
          logout: "Αποσύνδεση",
        }
      : {
          users: "Users",
          signedIn: "Signed in as",
          logout: "Logout",
        };

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4 sm:px-6">
        <div className="flex w-full items-center justify-between gap-3 sm:w-auto sm:justify-start sm:gap-4">
          <BrandIdentity compact />
          {session.role === "admin" ? (
            <Link
              href="/users"
              className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              {copy.users}
            </Link>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
          <LocaleSwitcher locale={locale} action={setLocale} />
          <p className="text-xs text-slate-500">
            {copy.signedIn} {session.name} ({session.role})
          </p>
          <form action={logoutAction}>
            <button
              type="submit"
              className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 sm:w-auto"
            >
              {copy.logout}
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
