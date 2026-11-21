import type { Field } from "@/lib/content"

/** TBC markers are switched off site-wide; these stay as no-ops so existing call sites keep working. */
export function TbcBadge(_props: { note?: string; className?: string }) {
  return null
}

export function TbcFor(_props: { f: Field<unknown>; className?: string }) {
  return null
}
