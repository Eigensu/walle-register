import type { NextRequest } from "next/server"
import { site } from "@/site.config"
import { pub } from "@/lib/content"
import { now, siteUrl } from "@/lib/site"

// "Add to calendar" from the hero countdown: /calendar/<event-slug>.ics?target=registration_close

type Target = "registration_open" | "registration_close" | "season_start" | "next_match"

const MINUTE = 60_000

const icsDate = (ms: number) => new Date(ms).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "")
const escape = (text: string) => text.replace(/\\/g, "\\\\").replace(/([,;])/g, "\\$1").replace(/\n/g, "\\n")

function eventFor(target: Target): { start: number; end: number; summary: string; description: string } | null {
  const { event } = site
  const name = `${event.shortName} ${event.seasonLabel}`
  const registerUrl = `${siteUrl()}${event.registration.href}`
  const eventUrl = `${siteUrl()}${event.href}`
  const opensAt = pub(event.registration.opensAt)
  const closesAt = pub(event.registration.closesAt)
  const startsAt = pub(event.season.startsAt)

  switch (target) {
    case "registration_open":
      return opensAt
        ? { start: Date.parse(opensAt), end: Date.parse(opensAt) + 30 * MINUTE, summary: `${name} registrations open`, description: `Register at ${registerUrl}` }
        : null
    case "registration_close":
      return closesAt
        ? { start: Date.parse(closesAt) - 30 * MINUTE, end: Date.parse(closesAt), summary: `${name} registrations close`, description: `Register before the deadline at ${registerUrl}` }
        : null
    case "season_start":
      return startsAt
        ? { start: Date.parse(startsAt), end: Date.parse(startsAt) + 8 * 60 * MINUTE, summary: `${name} begins`, description: eventUrl }
        : null
    case "next_match": {
      const next = (pub(event.season.matchDays) ?? []).map(Date.parse).filter((ms) => ms > now().getTime()).sort((a, b) => a - b)[0]
      return next ? { start: next, end: next + 8 * 60 * MINUTE, summary: `${name} match day`, description: eventUrl } : null
    }
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const target = (request.nextUrl.searchParams.get("target") ?? "season_start") as Target
  const ev = slug === `${site.event.slug}.ics` ? eventFor(target) : null
  if (!ev) return new Response("Not found", { status: 404 })

  const venue = pub(site.event.season.venue)
  const host = new URL(siteUrl()).host
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    `PRODID:-//${escape(site.org.name)}//${escape(site.event.shortName)}//EN`,
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${target}-${site.event.slug}@${host}`,
    `DTSTAMP:${icsDate(Date.now())}`,
    `DTSTART:${icsDate(ev.start)}`,
    `DTEND:${icsDate(ev.end)}`,
    `SUMMARY:${escape(ev.summary)}`,
    `DESCRIPTION:${escape(ev.description)}`,
    `URL:${siteUrl()}`,
    ...(venue ? [`LOCATION:${escape(venue)}`] : []),
    "END:VEVENT",
    "END:VCALENDAR",
  ]

  return new Response(lines.join("\r\n") + "\r\n", {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="${site.event.slug}-${target.replace(/_/g, "-")}.ics"`,
      "Cache-Control": "public, max-age=300",
    },
  })
}
