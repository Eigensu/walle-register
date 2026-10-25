import type { CSSProperties } from "react"
import { site } from "@/site.config"
import { stats } from "@/content/stats"
import { isPublishable, isTbcSlot, pub } from "@/lib/content"
import { CountUp } from "@/components/count-up"
import { TbcBadge, TbcFor } from "@/components/brand/tbc"

/** Numbers strip (PDF p4 #3). Hidden unless enough real figures exist: no placeholder numbers in production. */
export function StatsStrip() {
  const shown = stats.filter((s) => isPublishable(s.value) || isTbcSlot(s.value))
  if (shown.length < site.home.stats.minimumToShow) return null

  return (
    <section aria-label="Forum in numbers" className="on-navy bg-navy text-silver-bright">
      <div className="container-site">
        <dl className="grid grid-cols-2 border-t border-navy-line md:grid-cols-4">
          {shown.map((s, i) => {
            const value = pub(s.value)
            return (
              <div
                key={s.label}
                data-reveal=""
                style={{ "--reveal-delay": `${i * 60}ms` } as CSSProperties}
                className="flex flex-col-reverse gap-2 border-navy-line px-1 py-8 even:border-l even:pl-6 md:border-l md:px-8 md:py-10 md:first:border-l-0 md:first:pl-0 [&:nth-child(n+3)]:border-t md:[&:nth-child(n+3)]:border-t-0"
              >
                <dt className="eyebrow text-silver-dim">{s.label}</dt>
                <dd className="flex items-start gap-2">
                  {value ? (
                    <>
                      <CountUp value={value} className="type-stat silver-text" />
                      <TbcFor f={s.value} />
                    </>
                  ) : (
                    <>
                      <span className="type-stat text-silver-dim/40">00</span>
                      <TbcBadge note={s.value.note} />
                    </>
                  )}
                </dd>
              </div>
            )
          })}
        </dl>
      </div>
    </section>
  )
}
