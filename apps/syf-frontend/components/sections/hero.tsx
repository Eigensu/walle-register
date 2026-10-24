import Image from "next/image"
import Link from "next/link"
import { site } from "@/site.config"
import { isProduction, pub, type Field } from "@/lib/content"
import { formatDate, remaining } from "@/lib/format"
import type { PhaseState } from "@/lib/phase"
import { assetExists, fakeNow, now } from "@/lib/site"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { CtaButton } from "@/components/cta-button"
import { Countdown } from "@/components/countdown"
import { Emphasis } from "@/components/brand/emphasis"
import { SeamRings } from "@/components/brand/seam-rings"
import { TbcBadge, TbcFor } from "@/components/brand/tbc"
import type { SectionProps } from "./types"

const countdownSource: Record<NonNullable<PhaseState["countdown"]>["calendar"], Field<unknown>> = {
  registration_open: site.event.registration.opensAt,
  registration_close: site.event.registration.closesAt,
  season_start: site.event.season.startsAt,
  next_match: site.event.season.matchDays,
}

export function Hero({ state }: SectionProps) {
  const { hero } = site.home
  const { phase, status } = state
  const photo = pub(hero.photo)
  const hasPhoto = assetExists(photo)
  const headline = pub(hero.headline) ?? site.org.name
  const subcopy = pub(hero.subcopy)
  const cd = phase.countdown
  const spotsLeft =
    hero.showSpotsLeft && status && phase.phase === "open"
      ? `${status.current_registrations} of ${status.registration_cap} spots taken`
      : null

  return (
    <section aria-labelledby="hero-title" className="on-navy grain relative isolate overflow-hidden bg-navy text-silver-bright">
      {hasPhoto ? (
        <>
          <Image src={photo} alt="" fill priority sizes="100vw" className="-z-20 object-cover object-center" />
          <div
            className="absolute inset-0 -z-10"
            style={{
              background:
                "linear-gradient(90deg, var(--brand-navy) 0%, color-mix(in srgb, var(--brand-navy) 85%, transparent) 42%, color-mix(in srgb, var(--brand-navy) 20%, transparent) 100%)",
            }}
          />
        </>
      ) : (
        <div
          className="absolute inset-0 -z-20"
          style={{ background: "radial-gradient(ellipse 80% 70% at 72% 32%, var(--brand-navy-raised) 0%, var(--brand-navy) 70%)" }}
        />
      )}

      <SeamRings
        strokeWidth={1}
        className="animate-ring-turn absolute -right-[22rem] top-[42%] -z-10 size-[44rem] -translate-y-1/2 text-silver opacity-[0.14] sm:-right-[18rem] sm:size-[52rem] lg:-right-[14rem] lg:top-1/2 lg:size-[60rem]"
      />

      <div className="container-site relative grid min-h-[88svh] content-end gap-10 pb-12 pt-28 lg:grid-cols-12 lg:items-end lg:gap-8 lg:pb-16 lg:pt-36">
        <div className="lg:col-span-7">
          <p className="eyebrow flex items-center gap-4 text-silver">
            {hero.eyebrow}
            <span aria-hidden="true" className="h-px w-12 bg-silver/50" />
          </p>
          <h1 id="hero-title" className="type-display-xl mt-6 text-silver-bright">
            <Emphasis text={headline} accentClassName="silver-text" />
          </h1>
          {subcopy && (
            <p className="mt-7 max-w-[34rem] text-lg leading-relaxed text-silver md:text-xl md:leading-relaxed">
              {subcopy} <TbcFor f={hero.subcopy} />
            </p>
          )}
          <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
            <CtaButton id="hero-cta" cta={phase.primaryCta} location="hero" size="lg" />
            <Button asChild variant="outlineDark" size="lg">
              <Link href={hero.secondaryCta.href}>{hero.secondaryCta.label}</Link>
            </Button>
          </div>
          <p className="mt-7 flex items-center gap-2.5 text-sm text-silver">
            <span
              aria-hidden="true"
              className={cn(
                "size-2 rounded-full",
                phase.badge.tone === "live" && "animate-beacon bg-live text-live",
                phase.badge.tone === "open" && "animate-beacon bg-silver-bright text-silver-bright",
                phase.badge.tone === "neutral" && "bg-silver-dim",
              )}
            />
            <span className="font-medium text-silver-bright">{phase.badge.text}</span>
            {spotsLeft && <span className="text-silver-dim">· {spotsLeft}</span>}
          </p>
        </div>

        <div className="lg:col-span-5 lg:col-start-8 xl:col-span-4 xl:col-start-9">
          {phase.live ? (
            <LiveCard state={state} />
          ) : cd ? (
            <div className="relative">
              <Countdown
                label={cd.label}
                target={cd.target}
                srLabel={cd.srLabel}
                dateLine={formatDate(cd.target, site.timeZone, site.timeZoneLabel, "date-time")}
                calendarHref={`/calendar/${site.event.slug}.ics?target=${cd.calendar}`}
                calendarTarget={cd.calendar}
                initial={remaining(Date.parse(cd.target), now().getTime())}
                fakeNowMs={fakeNow()}
              />
              <TbcFor f={countdownSource[cd.calendar]} className="absolute right-4 top-4" />
            </div>
          ) : null}
        </div>
      </div>

      {!hasPhoto && !isProduction && (
        <p className="absolute bottom-3 right-4 flex items-center gap-2 text-xs text-silver-dim">
          <TbcBadge note={hero.photo.note} /> Hero photo
        </p>
      )}
    </section>
  )
}

function LiveCard({ state }: SectionProps) {
  const { phase } = state
  return (
    <div className="relative overflow-hidden rounded-lg border border-navy-line bg-navy-raised/80 p-6 backdrop-blur-sm">
      <SeamRings className="absolute -right-8 -top-8 size-28 text-silver opacity-20" />
      <p className="eyebrow flex items-center gap-2.5 text-silver-bright">
        <span aria-hidden="true" className="animate-beacon size-2 rounded-full bg-live text-live" />
        Live now
      </p>
      <p className="type-sport-xl mt-4 text-[2rem] text-silver-bright sm:text-[2.5rem]">{phase.live?.label || "Match day"}</p>
    </div>
  )
}
