import Link from "next/link";
import { getBrandLogoSrc } from "@/lib/branding";

type BrandIdentityProps = {
  compact?: boolean;
};

export async function BrandIdentity({ compact = false }: BrandIdentityProps) {
  const logoSrc = await getBrandLogoSrc();

  return (
    <Link href="/" className="flex items-center gap-2 sm:gap-3">
      {logoSrc ? (
        <div className={`${compact ? "h-10 w-10 sm:h-12 sm:w-12" : "h-10 w-10 sm:h-12 sm:w-12"} overflow-hidden bg-transparent`}>
          {/* Plain img is more reliable here for custom static brand files like AVIF logos. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoSrc}
            alt="Company logo"
            className="h-full w-full object-contain"
          />
        </div>
      ) : (
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm sm:h-12 sm:w-12">
          FT
        </div>
      )}

      <div className={compact ? "space-y-0.5" : "space-y-1"}>
        <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-slate-500 sm:text-xs sm:tracking-[0.22em]">
          Firestop Tracker
        </p>
        <p className={compact ? "text-xs font-semibold text-slate-900 sm:text-sm" : "text-base font-semibold text-slate-900 sm:text-lg"}>
          Project Dashboard
        </p>
      </div>
    </Link>
  );
}
