"use client"

import { useEffect, useRef, useState } from "react"

/** Counts a figure like "48+" up from zero the first time it scrolls into view. */
export function CountUp({ value, className }: { value: string; className?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const [shown, setShown] = useState(value)

  useEffect(() => {
    const match = value.match(/^(\d[\d,]*)(.*)$/)
    const end = match ? Number(match[1].replace(/,/g, "")) : NaN
    const el = ref.current
    if (!el || !match || !end || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const suffix = match[2]
    const format = (n: number) => `${n.toLocaleString("en-IN")}${suffix}`
    let frame = 0
    const run = () => {
      const start = performance.now()
      const step = (now: number) => {
        const p = Math.min(1, (now - start) / 900)
        setShown(format(Math.round(end * (1 - Math.pow(1 - p, 3)))))
        if (p < 1) frame = requestAnimationFrame(step)
      }
      frame = requestAnimationFrame(step)
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          io.disconnect()
          run()
        }
      },
      { threshold: 0.4 },
    )
    io.observe(el)
    return () => {
      io.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [value])

  return (
    <span ref={ref} className={className}>
      {shown}
    </span>
  )
}
