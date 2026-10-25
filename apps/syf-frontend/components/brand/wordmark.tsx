import Image from "next/image"
import { site } from "@/site.config"
import { pub } from "@/lib/content"
import { assetExists, logoSize } from "@/lib/site"
import { cn } from "@/lib/utils"
import { SeamRings } from "./seam-rings"

type Props = {
  tone: "onDark" | "onLight"
  /** Use the lockup without its tagline (falls back to the full logo if there isn't one). */
  compact?: boolean
  /** Rendered height in px; the width follows the logo's aspect ratio. */
  height?: number
  className?: string
  priority?: boolean
}

/** The organisation's logo, or a typeset fallback until the logo files are in public/brand/. */
export function Wordmark({ tone, compact, height = 36, className, priority }: Props) {
  const logo = pub(site.org.logo)
  const src = (compact && logo?.compact?.[tone]) || logo?.[tone]
  if (assetExists(src)) {
    const size = logoSize(src, height)
    return (
      <Image
        src={src}
        alt={site.org.name}
        {...size}
        priority={priority}
        unoptimized={src.endsWith(".svg")}
        className={className}
        style={size}
      />
    )
  }
  return (
    <span className={cn("inline-flex items-center gap-2.5", tone === "onDark" ? "text-silver-bright" : "text-navy", className)}>
      <SeamRings className={cn("size-8 shrink-0", tone === "onDark" ? "text-silver" : "text-ink-muted")} strokeWidth={1.25} />
      <span className="font-display text-[1.375rem] leading-none tracking-[-0.01em]">{site.org.name}</span>
    </span>
  )
}
