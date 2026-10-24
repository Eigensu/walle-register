"use client"

import { useRouter } from "next/navigation"
import { useEffect, useRef, useState } from "react"
import { CalendarPlus } from "lucide-react"
import { remaining, type Remaining } from "@/lib/format"
import { TrackLink } from "@/components/track-link"
import { SeamRings } from "@/components/brand/seam-rings"

type Props = {
  label: string
  target: string
  srLabel: string
  dateLine: string
  calendarHref: string | null
  calendarTarget: string
  /** Days and hours at server render, so the first client render matches the HTML. */
  initial: { days: number; hours: number }
  /** Set only when NEXT_PUBLIC_FAKE_NOW is active, so previews tick from the fake moment. */
  fakeNowMs: number | null
}

const pad = (n: number) => String(n).padStart(2, "0")

export function Countdown({ label, target, srLabel, dateLine, calendarHref, calendarTarget, initial, fakeNowMs }: Props) {
  const router = useRouter()
  const [rem, setRem] = useState<Remaining | null>(null)
  const refreshed = useRef(false)

  useEffect(() => {
    const targetMs = Date.parse(target)
    const skew = fakeNowMs == null ? 0 : fakeNowMs - Date.now()
    const tick = () => {
      const r = remaining(targetMs, Date.now() + skew)
      setRem(r)
      if (r.done && !refreshed.current && fakeNowMs == null) {
        refreshed.current = true
        router.refresh() // next phase
      }
    }
    tick()
    const id = window.setInterval(tick, 1000)
    return () => window.clearInterval(id)
  }, [target, fakeNowMs, router])

  const cells: [string, string][] = [
    [String(rem?.days ?? initial.days).padStart(2, "0"), "Days"],
    [pad(rem?.hours ?? initial.hours), "Hrs"],
    [rem ? pad(rem.minutes) : "--", "Min"],
    [rem ? pad(rem.seconds) : "--", "Sec"],
  ]

  return (
    <div className="relative overflow-hidden rounded-lg border border-navy-line bg-navy-raised/80 p-5 backdrop-blur-sm sm:p-6">
      <SeamRings className="absolute -right-8 -top-8 size-28 text-silver opacity-20" />
      <p className="eyebrow text-silver">{label}</p>
      <p className="sr-only">{srLabel}</p>
      <div aria-hidden="true" className="mt-4 grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-start">
        {cells.map(([value, unit], i) => (
          <div key={unit} className="contents">
            {i > 0 && <span className="type-stat px-1 text-[2.25rem] text-silver-dim/60 sm:text-[2.75rem]">:</span>}
            <div className="text-center">
              <span className="type-stat silver-text block text-[2.25rem] sm:text-[2.75rem]">{value}</span>
              <span className="eyebrow mt-1.5 block text-[0.625rem] tracking-[0.18em] text-silver-dim">{unit}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-navy-line pt-4 text-sm">
        <span className="text-silver">{dateLine}</span>
        {calendarHref && (
          <TrackLink
            href={calendarHref}
            native
            download
            rel="nofollow"
            event="calendar_add"
            eventProps={{ target: calendarTarget }}
            className="inline-flex items-center gap-1.5 font-medium text-silver-bright underline decoration-silver/40 underline-offset-4 hover:decoration-silver-bright"
          >
            <CalendarPlus className="size-4" aria-hidden="true" />
            Add to calendar
          </TrackLink>
        )}
      </div>
    </div>
  )
}
