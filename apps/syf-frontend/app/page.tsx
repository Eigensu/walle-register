import type { Metadata } from "next"
import type { ComponentType } from "react"
import { site } from "@/site.config"
import { pub } from "@/lib/content"
import { getSiteState, siteUrl } from "@/lib/site"
import type { HomeSection } from "@/lib/site-types"
import { Hero } from "@/components/sections/hero"
import { StatsStrip } from "@/components/sections/stats-strip"
import { AboutSnippet } from "@/components/sections/about-snippet"
import { FeaturedEvent } from "@/components/sections/featured-event"
import { SponsorStrip } from "@/components/sections/sponsor-strip"
import { PeopleTeaser } from "@/components/sections/people-teaser"
import { GalleryHighlights } from "@/components/sections/gallery-highlights"
import type { SectionProps } from "@/components/sections/types"

export const revalidate = 60

// Section registry: site.home.sections decides which render and in what order.
const SECTIONS: Record<HomeSection, ComponentType<SectionProps>> = {
  hero: Hero,
  stats: StatsStrip,
  about: AboutSnippet,
  featuredEvent: FeaturedEvent,
  sponsors: SponsorStrip,
  people: PeopleTeaser,
  gallery: GalleryHighlights,
}

export async function generateMetadata(): Promise<Metadata> {
  const { phase } = await getSiteState()
  const { event, org } = site
  const title =
    phase.phase === "open"
      ? `${event.shortName} ${event.seasonLabel} registrations open`
      : phase.phase === "live"
        ? `${event.shortName} ${event.seasonLabel} · live now`
        : undefined
  return {
    ...(title && { title: { absolute: `${org.name} · ${title}` } }),
    alternates: { canonical: "/" },
  }
}

export default async function HomePage() {
  const state = await getSiteState()
  return (
    <>
      {site.home.sections.map((key) => {
        const Section = SECTIONS[key]
        return <Section key={key} state={state} />
      })}
      <JsonLd state={state} />
    </>
  )
}

/** Organization + SportsEvent structured data, confirmed fields only (SPEC-HOME §12). */
function JsonLd({ state }: SectionProps) {
  const { org, event } = site
  const url = siteUrl()
  const sameAs = site.social.flatMap((s) => pub(s.url) ?? [])
  const fee = pub(event.registration.fee)
  const venue = pub(event.season.venue)
  const startDate = pub(event.season.startsAt)
  const logo = pub(org.logo)?.onLight
  const organization = { "@type": "Organization", name: org.name, url, ...(logo && { logo: `${url}${logo}` }), ...(sameAs.length > 0 && { sameAs }) }
  const graph: object[] = [{ "@context": "https://schema.org", ...organization }]
  if (startDate) {
    graph.push({
      "@context": "https://schema.org",
      "@type": "SportsEvent",
      name: `${event.name} ${event.seasonLabel}`,
      sport: event.sport,
      startDate,
      endDate: pub(event.season.endsAt) ?? undefined,
      eventStatus: "https://schema.org/EventScheduled",
      organizer: organization,
      ...(venue && { location: { "@type": "Place", name: venue } }),
      ...(fee != null && {
        offers: {
          "@type": "Offer",
          price: fee,
          priceCurrency: "INR",
          url: `${url}${event.registration.href}`,
          availability: state.phase.phase === "open" ? "https://schema.org/InStock" : "https://schema.org/SoldOut",
        },
      }),
    })
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />
}
