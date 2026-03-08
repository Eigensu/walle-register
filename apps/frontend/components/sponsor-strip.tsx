"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type Props = {
  className?: string;
};

export function SponsorStrip({ className }: Props) {
  return (
    <div
      className={cn(
        "flex items-center justify-between gap-6 py-2 sm:py-3 -px-2",
        "rounded-2xl border-2 border-blue-400/60 bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900",
        "dark:border-blue-700/50",
        className,
      )}
    >
      {/* Left — Tournament name + logo */}
      <div className="flex items-center">
        <Image
          src="/JMCL_logo_transparent.png"
          alt="JMCL Logo"
          width={120}
          height={120}
          className="h-24 w-36 object-contain"
          priority
        />
        <div className="space-y-1 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-blue-200">
            Jain Marwari Champions League 
          </p>
          <p className="text-[11px] font-medium text-blue-100 sm:text-md">
            Promesa Reality Cup - Season 2
          </p>
        </div>
      </div>

      {/* Right — Title Sponsor */}
      <div className="flex flex-col items-center gap-0.5">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.28em] text-blue-300 leading-none">
          Title Sponsor
        </p>
        <Image
          src="/Title%20Sponsor.png"
          alt="Title Sponsor"
          width={320}
          height={120}
          className="h-24 w-auto object-contain brightness-110 drop-shadow -my-0.5"
          priority
        />
      </div>
    </div>
  );
}
