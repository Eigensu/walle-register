import type { Field } from "@/lib/content"
import { isPending } from "@/lib/content"
import { cn } from "@/lib/utils"

/** Amber marker on content still awaiting the client's confirmation. Never renders in production. */
export function TbcBadge({ note, className }: { note?: string; className?: string }) {
  return (
    <span
      title={note}
      className={cn(
        "inline-flex items-center rounded-[4px] border border-tbc/40 bg-amber-50 px-1.5 py-0.5 align-middle font-sans text-[10px] font-semibold uppercase not-italic tracking-wider text-tbc [-webkit-text-fill-color:currentColor]",
        className,
      )}
    >
      TBC
    </span>
  )
}

/** Badge for a field if it's pending; nothing otherwise. */
export function TbcFor({ f, className }: { f: Field<unknown>; className?: string }) {
  return isPending(f) ? <TbcBadge note={f.note} className={className} /> : null
}
