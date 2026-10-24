// Phase engine (SPEC-HOME §5). Pure: everything it needs comes in as arguments, so it can be
// unit-tested and reused by any event site. Dates are ISO strings with an offset.

import { formatDate, localDay } from "./format"

export type Phase = "coming_soon" | "open" | "full" | "closed" | "live" | "between_matches" | "complete"

export type CtaKind = "register" | "live" | "nav"

export type Cta = { label: string; href: string; kind: CtaKind; external?: boolean }

export type PhaseState = {
  phase: Phase
  badge: { text: string; tone: "live" | "open" | "neutral" }
  countdown: { label: string; target: string; srLabel: string; calendar: "registration_close" | "registration_open" | "season_start" | "next_match" } | null
  live: { label: string | null; url: string | null } | null
  primaryCta: Cta
  headerCta: Cta
  showStickyBar: boolean
}

/** Mirrors PublicConfigResponse from the FastAPI backend (GET /api/config). */
export type RegistrationStatus = {
  registration_open: boolean
  registration_cap_reached: boolean
  current_registrations: number
  registration_cap: number
}

export type PhaseInput = {
  timeZone: string
  timeZoneLabel: string
  event: {
    shortName: string // "NSPL"
    seasonLabel: string // "Season 2"
    href: string // "/nspl"
  }
  registration: {
    opensAt: string | null
    closesAt: string | null
    href: string
    waitlist: boolean
  }
  season: {
    startsAt: string | null
    endsAt: string | null
    /** First-ball time of each match day, ISO with offset. */
    matchDays: readonly string[]
    /** Label for today's fixture on match days, e.g. "Match 7 · Titans vs Kings". */
    liveLabel: string | null
  }
  liveStreamUrl: string | null
  teamsPublished: boolean
}

const t = (iso: string) => new Date(iso).getTime()

export function getPhase(now: Date, input: PhaseInput, status: RegistrationStatus | null): PhaseState {
  const { event, registration: reg, season, timeZone: tz, timeZoneLabel: tzl } = input
  const nowMs = now.getTime()
  const longDate = (iso: string) => formatDate(iso, tz, tzl, "long-date-time")

  const exploreCta: Cta = { label: `Explore ${event.shortName}`, href: event.href, kind: "nav" }
  const registerCta: Cta = { label: `Register for ${event.shortName}`, href: reg.href, kind: "register" }
  const seasonStartCountdown =
    season.startsAt && t(season.startsAt) > nowMs
      ? {
          label: `${event.seasonLabel} starts in`,
          target: season.startsAt,
          srLabel: `${event.shortName} ${event.seasonLabel} starts on ${longDate(season.startsAt)}`,
          calendar: "season_start" as const,
        }
      : null

  // 1. Season over
  if (season.endsAt && nowMs > t(season.endsAt)) {
    return {
      phase: "complete",
      badge: { text: `${event.seasonLabel} complete`, tone: "neutral" },
      countdown: null,
      live: null,
      primaryCta: { label: `Relive ${event.seasonLabel}`, href: `${event.href}#results`, kind: "nav" },
      headerCta: { label: event.shortName, href: event.href, kind: "nav" },
      showStickyBar: false,
    }
  }

  // 2. Match day
  const today = localDay(now, tz)
  if (season.matchDays.some((d) => localDay(new Date(d), tz) === today)) {
    const watch: Cta = input.liveStreamUrl
      ? { label: `Watch ${event.shortName} live`, href: input.liveStreamUrl, kind: "live", external: true }
      : { label: "See fixtures", href: `${event.href}#fixtures`, kind: "nav" }
    return {
      phase: "live",
      badge: { text: "Live now", tone: "live" },
      countdown: null,
      live: { label: season.liveLabel, url: input.liveStreamUrl },
      primaryCta: watch,
      headerCta: input.liveStreamUrl ? { ...watch, label: "Watch live" } : watch,
      showStickyBar: false,
    }
  }

  // 3. Inside the season, between match days
  if (season.startsAt && season.endsAt && nowMs >= t(season.startsAt)) {
    const next = season.matchDays.map(t).filter((ms) => ms > nowMs).sort((a, b) => a - b)[0]
    const nextIso = next ? season.matchDays.find((d) => t(d) === next)! : null
    const fixtures: Cta = { label: "See fixtures", href: `${event.href}#fixtures`, kind: "nav" }
    return {
      phase: "between_matches",
      badge: { text: `${event.seasonLabel} underway`, tone: "neutral" },
      countdown: nextIso
        ? { label: "Next match in", target: nextIso, srLabel: `Next match on ${longDate(nextIso)}`, calendar: "next_match" }
        : null,
      live: null,
      primaryCta: fixtures,
      headerCta: { ...fixtures, label: "Fixtures" },
      showStickyBar: false,
    }
  }

  const afterRegistration: Cta = input.teamsPublished
    ? { label: "See the teams", href: `${event.href}#teams`, kind: "nav" }
    : exploreCta

  // 4. Registration window has passed
  if (reg.closesAt && nowMs >= t(reg.closesAt)) {
    return closed()
  }

  // 5. Registration window not open yet (or its date isn't known)
  if (!reg.opensAt || nowMs < t(reg.opensAt)) {
    return {
      phase: "coming_soon",
      badge: {
        text: reg.opensAt ? `Registrations open ${formatDate(reg.opensAt, tz, tzl, "day-month")}` : "Registrations opening soon",
        tone: "neutral",
      },
      countdown: reg.opensAt
        ? { label: "Registrations open in", target: reg.opensAt, srLabel: `Registrations open on ${longDate(reg.opensAt)}`, calendar: "registration_open" }
        : seasonStartCountdown,
      live: null,
      primaryCta: exploreCta,
      headerCta: { label: "Register", href: reg.href, kind: "register" },
      showStickyBar: false,
    }
  }

  // Inside the window: the backend can still close it by hand (kill switch) or report it full.
  if (status?.registration_open === false) return closed()

  if (status?.registration_cap_reached) {
    const waitlist: Cta = { label: "Join the waitlist", href: `${reg.href}?waitlist=1`, kind: "register" }
    return {
      phase: "full",
      badge: { text: "Registrations full", tone: "neutral" },
      countdown: seasonStartCountdown,
      live: null,
      primaryCta: reg.waitlist ? waitlist : exploreCta,
      headerCta: reg.waitlist ? waitlist : exploreCta,
      showStickyBar: reg.waitlist,
    }
  }

  // 6. Open
  return {
    phase: "open",
    badge: { text: "Registrations open", tone: "open" },
    countdown: reg.closesAt
      ? { label: "Registrations close in", target: reg.closesAt, srLabel: `Registrations close on ${longDate(reg.closesAt)}`, calendar: "registration_close" }
      : seasonStartCountdown,
    live: null,
    primaryCta: registerCta,
    headerCta: registerCta,
    showStickyBar: true,
  }

  function closed(): PhaseState {
    return {
      phase: "closed",
      badge: { text: "Registrations closed", tone: "neutral" },
      countdown: seasonStartCountdown,
      live: null,
      primaryCta: afterRegistration,
      headerCta: afterRegistration,
      showStickyBar: false,
    }
  }
}
