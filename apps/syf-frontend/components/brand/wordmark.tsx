import Image from "next/image"
import { site } from "@/site.config"
import { pub } from "@/lib/content"
import { assetExists } from "@/lib/site"
import { cn } from "@/lib/utils"
import { SeamRings } from "./seam-rings"

type Props = { tone: "onDark" | "onLight"; className?: string; priority?: boolean }

/** The organisation's logo, or a typeset fallback until the logo files are in public/brand/. */
export function Wordmark({ tone, className, priority }: Props) {
  const src = pub(site.org.logo)?.[tone]
  if (assetExists(src)) {
    return (
      <Image
        src={src}
        alt={site.org.name}
        width={160}
        height={40}
        priority={priority}
        unoptimized={src.endsWith(".svg")}
        className={cn("h-9 w-auto", className)}
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
