"use client"

import { usePathname } from "next/navigation"
import { useEffect } from "react"

/**
 * Fades in elements marked data-reveal as they scroll into view. Content stays visible without
 * JS: hiding starts only once the "js" class is set here, after in-view elements are marked shown.
 */
export function RevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    const pending = Array.from(document.querySelectorAll<HTMLElement>("[data-reveal]:not([data-shown])"))
    const fold = window.innerHeight
    for (const el of pending) {
      if (el.getBoundingClientRect().top < fold) el.dataset.shown = ""
    }
    document.documentElement.classList.add("js")

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            ;(entry.target as HTMLElement).dataset.shown = ""
            io.unobserve(entry.target)
          }
        }
      },
      { threshold: 0.15, rootMargin: "0px 0px -5% 0px" },
    )
    pending.filter((el) => !("shown" in el.dataset)).forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [pathname])

  return null
}
