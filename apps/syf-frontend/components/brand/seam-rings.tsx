import { cn } from "@/lib/utils"

type Props = {
  className?: string
  /** Hairline weight in screen pixels, independent of the rendered size. */
  strokeWidth?: number
  /** Drop the dashed seams (for very small marks). */
  ringsOnly?: boolean
}

/**
 * The signature motif from the blueprint cover: a jeweller's three rings crossed by a cricket
 * ball's stitched seam. Decorative only; colour comes from `currentColor`.
 */
export function SeamRings({ className, strokeWidth = 1, ringsOnly = false }: Props) {
  return (
    <svg
      viewBox="-200 -200 400 400"
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
      className={cn("pointer-events-none select-none", className)}
    >
      <g strokeWidth={strokeWidth} vectorEffect="non-scaling-stroke">
        <circle r="196" vectorEffect="non-scaling-stroke" />
        <circle r="152" vectorEffect="non-scaling-stroke" />
        <circle r="108" vectorEffect="non-scaling-stroke" />
        {!ringsOnly && (
          <g strokeDasharray="5 6" strokeLinecap="round">
            <path d="M -89 -146 Q 3 0 -89 146" vectorEffect="non-scaling-stroke" />
            <path d="M 89 -146 Q -3 0 89 146" vectorEffect="non-scaling-stroke" />
          </g>
        )}
      </g>
    </svg>
  )
}
