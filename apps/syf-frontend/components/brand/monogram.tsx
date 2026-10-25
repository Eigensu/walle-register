import { cn } from "@/lib/utils"
import { SeamRings } from "./seam-rings"

export const initials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()

/** Portrait stand-in until headshots arrive: initials in silver on navy, inside the ring motif. */
export function Monogram({ name, className }: { name: string; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("grain relative flex items-center justify-center overflow-hidden bg-navy-raised", className)}>
      <SeamRings className="absolute size-[92%] text-silver opacity-[0.14]" ringsOnly />
      <span className="silver-text relative font-sport text-5xl font-semibold tracking-wide">{initials(name)}</span>
    </div>
  )
}
