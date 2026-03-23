import { redirect } from "next/navigation";
import { setLocaleAction } from "@/app/preferences/actions";
import { loginAction } from "@/app/auth/actions";
import { LoginForm } from "@/components/LoginForm";
import { getSession } from "@/lib/auth";
import { getLocale } from "@/lib/i18n";

export default async function LoginPage() {
  const session = await getSession();
  const locale = await getLocale();

  if (session) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-900">
      <LoginForm action={loginAction} locale={locale} setLocale={setLocaleAction} />
    </main>
  );
}
