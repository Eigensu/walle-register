import Image from "next/image"
import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { site } from "@/site.config"
import { sponsors } from "@/content/sponsors"
import { isProduction, pub } from "@/lib/content"
import { assetExists } from "@/lib/site"
import type { Sponsor } from "@/lib/site-types"
import { cn } from "@/lib/utils"
import { TrackLink } from "@/components/track-link"
import { TbcBadge } from "@/components/brand/tbc"
import { SectionHeading } from "./section-heading"

const TIER_LABEL: Record<Sponsor["tier"], string> = {
  title: "Title sponsor",
  associate: "Associate sponsors",
  team: "Team sponsors",
  partner: "Partners",
}

function sponsorHref(s: Sponsor) {
  const url = pub(s.url)
  if (!url) return null
  const u = new URL(url)
  const { utmSource, utmCampaign } = site.home.sponsors
  u.searchParams.set("utm_source", utmSource)
  u.searchParams.set("utm_medium", "website")
  u.searchParams.set("utm_campaign", utmCampaign)
  u.searchParams.set("utm_content", `home_${s.tier}`)
  return u.toString()
}

function SponsorMark({ s, size }: { s: Sponsor; size: "title" | "tile" }) {
  if (assetExists(s.logo)) {
    return (
      <Image
        src={s.logo}
        alt={s.name}
        width={size === "title" ? 320 : 160}
        height={size === "title" ? 96 : 48}
        unoptimized={s.logo.endsWith(".svg")}
        className={cn(
          "w-auto object-contain",
          size === "title" ? "h-16 md:h-24" : "h-10 grayscale-0 opacity-100 transition lg:h-12 lg:opacity-70 lg:grayscale lg:group-hover:opacity-100 lg:group-hover:grayscale-0",
        )}
      />
    )
  }
  return size === "title" ? (
    <span className="font-display text-[2.25rem] leading-none text-navy md:text-[3.25rem]">{s.name}</span>
  ) : (
    <span className="eyebrow text-center text-ink-muted">{s.name}</span>
  )
}

function SponsorLink({ s, className, children }: { s: Sponsor; className: string; children: ReactNode }) {
  const href = sponsorHref(s)
  const pending = !isProduction && (!s.confirmed || !s.url.confirmed)
  const inner = (
    <>
      {children}
      {pending && <TbcBadge note={!s.confirmed ? "Sponsor not confirmed" : s.url.note} className="absolute right-2 top-2" />}
    </>
  )
  return href ? (
    <TrackLink
      href={href}
      external
      rel="sponsored noopener"
      event="sponsor_click"
      eventProps={{ sponsor: s.key, tier: s.tier, location: "home" }}
      className={cn("group", className)}
    >
      {inner}
      <span className="sr-only"> (opens in a new tab)</span>
    </TrackLink>
  ) : (
    <div className={cn("group", className)}>{inner}</div>
  )
}

/** Sponsor strip (PDF p4 #6, p6): the title sponsor gets its own stage; every logo links out with UTM tags. */
export function SponsorStrip() {
  const { sponsors: cfg } = site.home
  const visible = sponsors.filter((s) => s.confirmed || !isProduction)
  const title = visible.find((s) => s.tier === "title")
  const others = visible.filter((s) => s.tier !== "title")
  if (!title && others.length === 0) return null
  const tiers = (["associate", "team", "partner"] as const).filter((t) => others.some((s) => s.tier === t))

  return (
    <section aria-labelledby="sponsors-title" className="bg-mist">
      <div className="container-site py-24 lg:py-32">
        <SectionHeading id="sponsors-title" eyebrow={cfg.eyebrow} heading={cfg.heading} align="center" />

        <div className="mx-auto mt-14 max-w-[880px] space-y-10">
          {title && (
            <div data-reveal="">
              <p className="eyebrow mb-3 text-center text-ink-muted">{TIER_LABEL.title}</p>
              <SponsorLink
                s={title}
                className="relative flex min-h-40 items-center justify-center rounded-lg border border-line bg-paper px-8 py-10 transition-colors hover:border-navy/30 md:min-h-52"
              >
                <SponsorMark s={title} size="title" />
              </SponsorLink>
            </div>
          )}

          {tiers.map((tier) => (
            <div key={tier} data-reveal="">
              {(tiers.length > 1 || title) && <p className="eyebrow mb-3 text-center text-ink-muted">{TIER_LABEL[tier]}</p>}
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {others
                  .filter((s) => s.tier === tier)
                  .map((s) => (
                    <li key={s.key}>
                      <SponsorLink
                        s={s}
                        className="relative flex h-24 items-center justify-center rounded-lg border border-line bg-paper px-4 transition-colors hover:border-navy/30"
                      >
                        <SponsorMark s={s} size="tile" />
                      </SponsorLink>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={cfg.enquire.href}
            className="group inline-flex items-center gap-2 rounded-sm text-[0.9375rem] font-semibold text-royal underline-offset-4 hover:underline"
          >
            {cfg.enquire.label}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  )
}
