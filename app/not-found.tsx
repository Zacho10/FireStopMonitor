import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900">
      <div className="mx-auto flex min-h-screen max-w-3xl items-center justify-center px-6 py-16">
        <div className="w-full rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-slate-500">
            Firestop Tracker
          </p>

          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Project not found
          </h1>

          <p className="mt-4 text-sm leading-6 text-slate-600">
            Το έργο που ζήτησες δεν βρέθηκε.
          </p>

          <div className="mt-8">
            <Link
              href="/"
              className="inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Back to projects
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}