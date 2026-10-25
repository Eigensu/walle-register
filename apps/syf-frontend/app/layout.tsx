import type { Metadata, Viewport } from "next"
import type { CSSProperties, ReactNode } from "react"
import "./globals.css"
import { site } from "@/site.config"
import { isProduction, pub } from "@/lib/content"
import { formatDate, formatInr } from "@/lib/format"
import { getSiteState, siteUrl } from "@/lib/site"
import { fontVariables } from "./fonts"
import { Header } from "@/components/shell/header"
import { Footer } from "@/components/shell/footer"
import { StickyRegisterBar } from "@/components/shell/sticky-register-bar"
import { RevealObserver } from "@/components/reveal-observer"
import { Wordmark } from "@/components/brand/wordmark"
import { plainText } from "@/components/brand/emphasis"

const headline = plainText(pub(site.home.hero.headline) ?? site.org.name)
const description = pub(site.home.hero.subcopy) ?? `${site.org.name} and ${site.event.name} ${site.event.seasonLabel}.`

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: { default: `${site.org.name} · ${headline}`, template: `%s · ${site.org.name}` },
  description,
  applicationName: site.org.name,
  openGraph: { type: "website", siteName: site.org.name, locale: site.locale.replace("-", "_") },
  twitter: { card: "summary_large_image" },
  robots: isProduction ? undefined : { index: false, follow: false },
}

export const viewport: Viewport = {
  themeColor: site.theme.colors.navy,
  width: "device-width",
  initialScale: 1,
}

const toKebab = (key: string) => key.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)
const brandVars = Object.fromEntries(
  Object.entries(site.theme.colors).map(([key, value]) => [`--brand-${toKebab(key)}`, value]),
) as CSSProperties

export default async function RootLayout({ children }: { children: ReactNode }) {
  const { phase } = await getSiteState()
  const { event } = site
  const closesAt = pub(event.registration.closesAt)
  const fee = pub(event.registration.fee)
  const stickyDetail =
    [closesAt && `Closes ${formatDate(closesAt, site.timeZone, site.timeZoneLabel, "day-month")}`, fee != null && formatInr(fee)]
      .filter(Boolean)
      .join(" · ") || null
  const social = site.social.flatMap((s) => {
    const url = pub(s.url)
    return url ? [{ label: s.label, href: url }] : []
  })

  return (
    <html lang={site.locale} className={fontVariables} style={brandVars}>
      <body>
        <a
          href="#main"
          className="sr-only z-[60] rounded-lg bg-paper px-4 py-3 font-semibold text-navy focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
        >
          Skip to content
        </a>
        <Header
          logo={<Wordmark tone="onDark" compact height={40} priority />}
          homeLabel={site.org.name}
          nav={site.nav}
          headerCta={phase.headerCta}
          menuCta={phase.primaryCta}
          social={social}
        />
        <main id="main">{children}</main>
        <Footer />
        {phase.showStickyBar && (
          <StickyRegisterBar
            cta={phase.primaryCta}
            eyebrow={`${event.shortName} ${event.seasonLabel}`}
            detail={stickyDetail}
            label={phase.phase === "open" ? "Register" : undefined}
          />
        )}
        <RevealObserver />
      </body>
    </html>
  )
}
