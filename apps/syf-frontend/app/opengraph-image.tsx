import { ImageResponse } from "next/og"
import { site } from "@/site.config"
import { pub } from "@/lib/content"
import { assetExists, logoSize, pngDataUrl } from "@/lib/site"
import { loadOgFonts } from "./og-fonts"

// WhatsApp / social share card (SPEC-HOME §12). Keep under ~300 KB; WhatsApp caches it hard.
export const alt = site.org.name
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OpengraphImage() {
  const c = site.theme.colors
  const fonts = await loadOgFonts()
  const headline = pub(site.home.hero.headline) ?? site.org.name
  const lines = headline.split("\n")
  const orgLogo = pub(site.org.logo)
  const orgLogoSrc = orgLogo?.compact?.onDark ?? orgLogo?.onDark
  const eventLogo = pub(site.event.logo)
  const showOrgLogo = assetExists(orgLogoSrc) && orgLogoSrc.endsWith(".png")
  const showEventLogo = assetExists(eventLogo) && eventLogo.endsWith(".png")

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "72px 80px",
          // Flat navy: a gradient behind the shield's marbled texture pushes the PNG past the size budget.
          background: c.navy,
          color: c.silverBright,
          position: "relative",
        }}
      >
        <svg
          width="760"
          height="760"
          viewBox="-200 -200 400 400"
          style={{ position: "absolute", right: showEventLogo ? -140 : -200, top: -65, opacity: 0.22 }}
          fill="none"
          stroke={c.silver}
          strokeWidth="1"
        >
          <circle r="196" />
          <circle r="152" />
          <circle r="108" />
          <path d="M -89 -146 Q 3 0 -89 146" strokeDasharray="5 6" />
          <path d="M 89 -146 Q -3 0 89 146" strokeDasharray="5 6" />
        </svg>
        {showEventLogo && (
          <img src={pngDataUrl(eventLogo)} alt="" {...logoSize(eventLogo, 360)} style={{ position: "absolute", right: 120, top: 135 }} />
        )}
        {showOrgLogo ? (
          <img src={pngDataUrl(orgLogoSrc)} alt="" {...logoSize(orgLogoSrc, 64)} style={{ position: "absolute", left: 80, top: 72 }} />
        ) : (
          <div style={{ display: "flex", fontFamily: "Sport", fontSize: 26, letterSpacing: 7, textTransform: "uppercase", color: c.silver }}>
            {site.org.name}
          </div>
        )}
        <div style={{ display: "flex", flexDirection: "column", marginTop: 24, fontFamily: "Display", fontSize: 104, lineHeight: 0.95 }}>
          {lines.map((line, i) => (
            <div key={i} style={{ display: "flex" }}>
              {line.split(/(\*[^*]+\*)/g).filter(Boolean).map((part, j) =>
                part.startsWith("*") ? (
                  <span key={j} style={{ fontStyle: "italic", color: c.silver, marginRight: 24 }}>
                    {part.slice(1, -1)}
                  </span>
                ) : (
                  <span key={j}>{part.trim()}</span>
                ),
              )}
            </div>
          ))}
        </div>
        <div style={{ display: "flex", marginTop: 44 }}>
          <div
            style={{
              display: "flex",
              background: c.royal,
              color: "#fff",
              fontFamily: "Sport",
              fontSize: 34,
              fontWeight: 600,
              letterSpacing: 1,
              padding: "16px 30px",
              borderRadius: 10,
            }}
          >
            {`Register for ${site.event.shortName} ${site.event.seasonLabel}`}
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: fonts.length ? fonts : undefined },
  )
}
