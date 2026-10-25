import { ImageResponse } from "next/og"
import { site } from "@/site.config"
import { pub } from "@/lib/content"
import { assetExists, logoSize, pngDataUrl } from "@/lib/site"

// Favicon and home-screen icon: the logo's mark on navy, or the seam rings until a mark is supplied.
export function brandIcon(size: number, radius: number) {
  const c = site.theme.colors
  const mark = pub(site.org.logo)?.mark
  const frame = { width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: c.navy, borderRadius: radius }

  if (assetExists(mark)) {
    const img = logoSize(mark, Math.round(size * 0.4))
    return new ImageResponse(
      (
        <div style={frame}>
          <img src={pngDataUrl(mark)} alt="" width={img.width} height={img.height} />
        </div>
      ),
      { width: size, height: size },
    )
  }

  const ring = Math.round(size * 0.78)
  return new ImageResponse(
    (
      <div style={frame}>
        <svg width={ring} height={ring} viewBox="-200 -200 400 400" fill="none" stroke={c.silverBright} strokeLinecap="round">
          <circle r="180" strokeWidth="26" />
          <path d="M -70 -165 Q 25 0 -70 165" strokeWidth="18" />
          <path d="M 70 -165 Q -25 0 70 165" strokeWidth="18" />
        </svg>
      </div>
    ),
    { width: size, height: size },
  )
}
