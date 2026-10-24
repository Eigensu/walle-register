import { ImageResponse } from "next/og"
import { site } from "@/site.config"

// Seam-rings favicon until the organisation's logo is supplied (then replace with app/icon.png).
export const size = { width: 64, height: 64 }
export const contentType = "image/png"

export default function Icon() {
  const c = site.theme.colors
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: c.navy, borderRadius: 14 }}>
        <svg width="50" height="50" viewBox="-200 -200 400 400" fill="none" stroke={c.silverBright} strokeLinecap="round">
          <circle r="180" strokeWidth="26" />
          <path d="M -70 -165 Q 25 0 -70 165" strokeWidth="18" />
          <path d="M 70 -165 Q -25 0 70 165" strokeWidth="18" />
        </svg>
      </div>
    ),
    size,
  )
}
