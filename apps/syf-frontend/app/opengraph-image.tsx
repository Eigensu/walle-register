import { ImageResponse } from "next/og"
import { site } from "@/site.config"
import { pub } from "@/lib/content"
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
          background: `radial-gradient(ellipse 80% 80% at 78% 30%, ${c.navyRaised} 0%, ${c.navy} 70%)`,
          color: c.silverBright,
          position: "relative",
        }}
      >
        <svg
          width="760"
          height="760"
          viewBox="-200 -200 400 400"
          style={{ position: "absolute", right: -200, top: -65, opacity: 0.22 }}
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
        <div style={{ display: "flex", fontFamily: "Sport", fontSize: 26, letterSpacing: 7, textTransform: "uppercase", color: c.silver }}>
          {site.org.name}
        </div>
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
