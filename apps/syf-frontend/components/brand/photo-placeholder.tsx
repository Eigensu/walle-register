import { cn } from "@/lib/utils"
import { SeamRings } from "./seam-rings"
import { TbcBadge } from "./tbc"

/** Stand-in for a real photo (development/preview only). Real photos only in production. */
export function PhotoPlaceholder({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={cn(
        "grain relative flex items-end overflow-hidden bg-navy-raised text-silver",
        className,
      )}
    >
      <SeamRings className="absolute left-1/2 top-1/2 h-[62%] w-auto -translate-x-1/2 -translate-y-1/2 opacity-[0.14]" />
      <p className="relative m-3 flex items-center gap-2 font-sans text-xs text-silver-dim">
        <TbcBadge note={label} />
        {label}
      </p>
    </div>
  )
}
