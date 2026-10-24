"use client"

import { useEffect, useState } from "react"
import type { Cta } from "@/lib/phase"
import { cn } from "@/lib/utils"
import { CtaButton } from "@/components/cta-button"

type Props = { cta: Cta; eyebrow: string; detail: string | null; label?: string }

/**
 * Phone-only register bar (PDF p3). Shows once the hero's own CTA has scrolled away and hides
 * over the footer, so it never doubles up with another Register button.
 */
export function StickyRegisterBar({ cta, eyebrow, detail, label }: Props) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const heroCta = document.getElementById("hero-cta")
    const footer = document.querySelector("footer")
    let heroVisible = Boolean(heroCta)
    let footerVisible = false
    const update = () => setVisible(!heroVisible && !footerVisible)

    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.target === heroCta) heroVisible = e.isIntersecting
        if (e.target === footer) footerVisible = e.isIntersecting
      }
      update()
    })
    if (heroCta) io.observe(heroCta)
    if (footer) io.observe(footer)
    update()
    return () => io.disconnect()
  }, [])

  return (
    <div
      aria-hidden={!visible}
      inert={!visible}
      className={cn(
        "on-navy fixed inset-x-0 bottom-0 z-40 border-t border-navy-line bg-navy-raised/95 shadow-[0_-8px_30px_rgb(14_26_43/0.18)] backdrop-blur-md transition-transform duration-300 md:hidden",
        visible ? "translate-y-0" : "translate-y-full",
      )}
    >
      <div className="container-site flex items-center justify-between gap-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <div className="min-w-0">
          <p className="eyebrow truncate text-silver">{eyebrow}</p>
          {detail && <p className="mt-0.5 truncate text-sm text-silver-bright">{detail}</p>}
        </div>
        <CtaButton cta={cta} location="sticky_bar" label={label} />
      </div>
    </div>
  )
}
