import { describe, expect, it } from "vitest"
import { getPhase, type PhaseInput, type RegistrationStatus } from "./phase"

const input: PhaseInput = {
  timeZone: "Asia/Kolkata",
  timeZoneLabel: "IST",
  event: { shortName: "NSPL", seasonLabel: "Season 2", href: "/nspl" },
  registration: {
    opensAt: "2026-12-01T10:00:00+05:30",
    closesAt: "2026-12-20T23:59:00+05:30",
    href: "/register",
    waitlist: false,
  },
  season: {
    startsAt: "2027-02-06T09:00:00+05:30",
    endsAt: "2027-02-28T21:00:00+05:30",
    matchDays: ["2027-02-06T09:00:00+05:30", "2027-02-13T09:00:00+05:30", "2027-02-28T09:00:00+05:30"],
    liveLabel: "Match 1 · Titans vs Kings",
  },
  liveStreamUrl: "https://youtube.com/live/abc",
  teamsPublished: false,
}

const open: RegistrationStatus = { registration_open: true, registration_cap_reached: false, current_registrations: 10, registration_cap: 174 }
const at = (iso: string) => new Date(iso)

describe("getPhase", () => {
  it("is coming_soon before registrations open, counting down to the opening", () => {
    const s = getPhase(at("2026-11-20T12:00:00+05:30"), input, open)
    expect(s.phase).toBe("coming_soon")
    expect(s.badge.text).toBe("Registrations open 1 Dec")
    expect(s.countdown?.target).toBe(input.registration.opensAt)
    expect(s.primaryCta.href).toBe("/nspl")
    expect(s.showStickyBar).toBe(false)
  })

  it("ignores a closed backend flag before the window opens", () => {
    const s = getPhase(at("2026-11-20T12:00:00+05:30"), input, { ...open, registration_open: false })
    expect(s.phase).toBe("coming_soon")
  })

  it("is coming_soon without a countdown when no opening date is known", () => {
    const s = getPhase(at("2026-11-20T12:00:00+05:30"), { ...input, registration: { ...input.registration, opensAt: null } }, open)
    expect(s.phase).toBe("coming_soon")
    expect(s.badge.text).toBe("Registrations opening soon")
    expect(s.countdown?.calendar).toBe("season_start")
  })

  it("is open inside the window, counting down to the deadline, with the sticky bar", () => {
    const s = getPhase(at("2026-12-10T12:00:00+05:30"), input, open)
    expect(s.phase).toBe("open")
    expect(s.primaryCta).toMatchObject({ label: "Register for NSPL", href: "/register", kind: "register" })
    expect(s.countdown?.target).toBe(input.registration.closesAt)
    expect(s.countdown?.srLabel).toBe("Registrations close on 20 December 2026 at 11:59 PM IST")
    expect(s.showStickyBar).toBe(true)
  })

  it("is open on dates alone when the backend is unreachable", () => {
    expect(getPhase(at("2026-12-10T12:00:00+05:30"), input, null).phase).toBe("open")
  })

  it("lets the backend close registrations early (kill switch)", () => {
    const s = getPhase(at("2026-12-10T12:00:00+05:30"), input, { ...open, registration_open: false })
    expect(s.phase).toBe("closed")
    expect(s.countdown?.calendar).toBe("season_start")
  })

  it("is full when the cap is reached, offering the waitlist only if enabled", () => {
    const full = { ...open, registration_cap_reached: true }
    expect(getPhase(at("2026-12-10T12:00:00+05:30"), input, full).primaryCta.href).toBe("/nspl")
    const withWaitlist = { ...input, registration: { ...input.registration, waitlist: true } }
    const s = getPhase(at("2026-12-10T12:00:00+05:30"), withWaitlist, full)
    expect(s.phase).toBe("full")
    expect(s.primaryCta.href).toBe("/register?waitlist=1")
    expect(s.showStickyBar).toBe(true)
  })

  it("is closed after the deadline, pointing at teams once published", () => {
    const s = getPhase(at("2027-01-10T12:00:00+05:30"), input, open)
    expect(s.phase).toBe("closed")
    expect(s.primaryCta.label).toBe("Explore NSPL")
    const teams = getPhase(at("2027-01-10T12:00:00+05:30"), { ...input, teamsPublished: true }, open)
    expect(teams.primaryCta).toMatchObject({ label: "See the teams", href: "/nspl#teams" })
  })

  it("is live on a match day (by IST date, even before first ball)", () => {
    const s = getPhase(at("2027-02-13T07:00:00+05:30"), input, open)
    expect(s.phase).toBe("live")
    expect(s.primaryCta).toMatchObject({ label: "Watch NSPL live", external: true })
    expect(s.live?.label).toBe("Match 1 · Titans vs Kings")
  })

  it("falls back to fixtures on a match day with no stream link", () => {
    const s = getPhase(at("2027-02-13T10:00:00+05:30"), { ...input, liveStreamUrl: null }, open)
    expect(s.primaryCta.href).toBe("/nspl#fixtures")
  })

  it("counts down to the next match between match days", () => {
    const s = getPhase(at("2027-02-08T12:00:00+05:30"), input, open)
    expect(s.phase).toBe("between_matches")
    expect(s.countdown?.target).toBe("2027-02-13T09:00:00+05:30")
  })

  it("is complete after the season ends", () => {
    const s = getPhase(at("2027-03-02T12:00:00+05:30"), input, open)
    expect(s.phase).toBe("complete")
    expect(s.countdown).toBeNull()
    expect(s.primaryCta.href).toBe("/nspl#results")
  })
})
