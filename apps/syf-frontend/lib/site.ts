// Server-side glue between site.config.ts and the pure helpers in lib/.

import { existsSync } from "fs"
import path from "path"
import { cache } from "react"
import { site } from "@/site.config"
import { isProduction, pub } from "./content"
import { getPhase, type PhaseInput } from "./phase"
import { getRegistrationStatus } from "./status"

/** NEXT_PUBLIC_FAKE_NOW lets dev/preview render any phase; production always uses the clock. */
export function fakeNow(): number | null {
  const raw = process.env.NEXT_PUBLIC_FAKE_NOW
  if (isProduction || !raw) return null
  const ms = Date.parse(raw)
  return Number.isNaN(ms) ? null : ms
}

export const now = () => new Date(fakeNow() ?? Date.now())

export function phaseInput(): PhaseInput {
  const { event } = site
  return {
    timeZone: site.timeZone,
    timeZoneLabel: site.timeZoneLabel,
    event: { shortName: event.shortName, seasonLabel: event.seasonLabel, href: event.href },
    registration: {
      opensAt: pub(event.registration.opensAt),
      closesAt: pub(event.registration.closesAt),
      href: event.registration.href,
      waitlist: event.registration.waitlist,
    },
    season: {
      startsAt: pub(event.season.startsAt),
      endsAt: pub(event.season.endsAt),
      matchDays: pub(event.season.matchDays) ?? [],
      liveLabel: pub(event.season.liveLabel),
    },
    liveStreamUrl: pub(event.liveStreamUrl),
    teamsPublished: event.teamsPublished,
  }
}

/** Phase and live status, deduped per request. */
export const getSiteState = cache(async () => {
  const status = await getRegistrationStatus()
  return { status, phase: getPhase(now(), phaseInput(), status) }
})

/** Whether a file referenced by config exists under public/ (logos and photos arrive over time). */
export function assetExists(publicPath: string | null | undefined): publicPath is string {
  if (!publicPath) return false
  return existsSync(path.join(process.cwd(), "public", publicPath.replace(/^\//, "")))
}

export function siteUrl(): string {
  return (pub(site.siteUrl) ?? process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3001").replace(/\/$/, "")
}
