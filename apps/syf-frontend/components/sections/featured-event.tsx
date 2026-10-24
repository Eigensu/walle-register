import Image from "next/image"
import Link from "next/link"
import type { CSSProperties } from "react"
import { ArrowRight } from "lucide-react"
import { site } from "@/site.config"
import { isProduction, isTbcSlot, pub } from "@/lib/content"
import { assetExists } from "@/lib/site"
import { CtaButton } from "@/components/cta-button"
import { Emphasis } from "@/components/brand/emphasis"
import { SeamRings } from "@/components/brand/seam-rings"
import { TbcBadge, TbcFor } from "@/components/brand/tbc"
import type { SectionProps } from "./types"

/** The flagship event band (PDF p4 #5): the "matchday" register of the page. */
export function FeaturedEvent({ state }: SectionProps) {
  const { featuredEvent: fe } = site.home
  const { event } = site
  const photo = pub(fe.photo)
  const hasPhoto = assetExists(photo)
  const logo = pub(event.logo)
  const hasLogo = assetExists(logo)
  const body = pub(fe.body)
  const facts = fe.facts.filter((f) => pub(f.value) || isTbcSlot(f.value))
  const primary = state.phase.primaryCta
  const showExplore = primary.href !== fe.link.href

  return (
    <section aria-labelledby="event-title" className="on-navy relative overflow-hidden bg-navy text-silver-bright">
      <div className="container-site grid items-center gap-12 py-24 lg:grid-cols-12 lg:gap-16 lg:py-32">
        <div data-reveal="" className="lg:col-span-5">
          <div className="grain relative aspect-[16/10] overflow-hidden rounded-2xl bg-navy-raised sm:aspect-[5/4]">
            {hasPhoto ? (
              <>
                <Image src={photo} alt={`${event.shortName} match`} fill sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
                {hasLogo && (
                  <Image src={logo} alt={event.name} width={72} height={72} unoptimized={logo.endsWith(".svg")} className="absolute bottom-4 left-4 size-16 object-contain" />
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <SeamRings className="absolute size-[115%] text-silver opacity-[0.16]" />
                {hasLogo ? (
                  <Image src={logo} alt={event.name} width={220} height={220} unoptimized={logo.endsWith(".svg")} className="relative h-1/2 w-auto object-contain" />
                ) : (
                  <>
                    <span className="silver-text relative font-sport text-[5.5rem] font-bold leading-none tracking-tight sm:text-[7.5rem]">
                      {event.shortName}
                    </span>
                    <span className="eyebrow relative mt-2 text-silver">{event.seasonLabel}</span>
                  </>
                )}
              </div>
            )}
            {!hasPhoto && !isProduction && (
              <p className="absolute bottom-3 left-3 flex items-center gap-2 text-xs text-silver-dim">
                <TbcBadge note={fe.photo.note} /> {hasLogo ? "Event photo" : "Event logo and photo"}
              </p>
            )}
          </div>
        </div>

        <div data-reveal="" style={{ "--reveal-delay": "80ms" } as CSSProperties} className="lg:col-span-7">
          <p className="eyebrow text-silver">{fe.eyebrow}</p>
          <h2 id="event-title" className="type-sport-xl mt-4 text-silver-bright">
            <Emphasis text={fe.heading} />
          </h2>
          {body && (
            <p className="mt-7 max-w-[60ch] text-lg leading-relaxed text-silver">
              {body} <TbcFor f={fe.body} />
            </p>
          )}

          {facts.length > 0 && (
            <dl className="mt-9 grid grid-cols-2 border-y border-navy-line sm:grid-cols-4">
              {facts.map((f) => {
                const value = pub(f.value)
                return (
                  <div
                    key={f.label}
                    className="border-navy-line py-4 pr-4 even:border-l even:pl-4 sm:border-l sm:pl-4 sm:first:border-l-0 sm:first:pl-0 [&:nth-child(n+3)]:border-t sm:[&:nth-child(n+3)]:border-t-0"
                  >
                    <dt className="eyebrow text-[0.6875rem] text-silver-dim">{f.label}</dt>
                    <dd className="mt-1.5 font-semibold text-silver-bright">
                      {value ?? <TbcBadge note={f.value.note} />} {value && <TbcFor f={f.value} />}
                    </dd>
                  </div>
                )
              })}
            </dl>
          )}

          <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-7">
            <CtaButton cta={primary} location="event_band" size="lg" />
            {showExplore && (
              <Link
                href={fe.link.href}
                className="group inline-flex items-center gap-2 rounded-sm text-[0.9375rem] font-semibold text-silver-bright underline-offset-4 hover:underline"
              >
                {fe.link.label}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
