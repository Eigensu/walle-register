export type DateStyle = "day-month" | "date" | "date-time" | "long-date-time"

function parts(iso: string, timeZone: string, options: Intl.DateTimeFormatOptions) {
  const out: Record<string, string> = {}
  for (const p of new Intl.DateTimeFormat("en-GB", { timeZone, ...options }).formatToParts(new Date(iso))) {
    out[p.type] = p.value
  }
  return out
}

/**
 * day-month       → 20 Dec
 * date            → 20 Dec 2026
 * date-time       → 20 Dec 2026, 11:59 PM IST
 * long-date-time  → 20 December 2026 at 11:59 PM IST
 */
export function formatDate(iso: string, timeZone: string, tzLabel: string, style: DateStyle): string {
  const long = style === "long-date-time"
  const d = parts(iso, timeZone, { day: "numeric", month: long ? "long" : "short", year: "numeric" })
  if (style === "day-month") return `${d.day} ${d.month}`
  if (style === "date") return `${d.day} ${d.month} ${d.year}`
  const t = parts(iso, timeZone, { hour: "numeric", minute: "2-digit", hour12: true })
  const time = `${t.hour}:${t.minute} ${(t.dayPeriod ?? "").toUpperCase()} ${tzLabel}`.replace(/\s+/g, " ")
  return long ? `${d.day} ${d.month} ${d.year} at ${time}` : `${d.day} ${d.month} ${d.year}, ${time}`
}

/** YYYY-MM-DD for the given instant in the given time zone. */
export function localDay(date: Date, timeZone: string): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone, year: "numeric", month: "2-digit", day: "2-digit" }).format(date)
}

export function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`
}

export type Remaining = { days: number; hours: number; minutes: number; seconds: number; done: boolean }

export function remaining(targetMs: number, nowMs: number): Remaining {
  const total = Math.max(0, Math.floor((targetMs - nowMs) / 1000))
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    done: total === 0,
  }
}
