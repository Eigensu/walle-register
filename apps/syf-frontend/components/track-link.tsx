"use client"

import Link from "next/link"
import { useSyncExternalStore, type ComponentProps } from "react"
import { track, withLandingUtm, type AnalyticsEvent, type AnalyticsProps } from "@/lib/analytics"

type Props = Omit<ComponentProps<"a">, "href"> & {
  href: string
  external?: boolean
  event?: AnalyticsEvent
  eventProps?: AnalyticsProps
  /** Forward utm_* from the landing URL (register links). */
  keepUtm?: boolean
  /** Plain <a> in the same tab (downloads, route handlers). */
  native?: boolean
}

const noopSubscribe = () => () => {}

/** A link that reports a click to analytics. External links open in a new tab. */
export function TrackLink({ href, external, native, event, eventProps, keepUtm, onClick, children, ...rest }: Props) {
  const search = useSyncExternalStore(noopSubscribe, () => window.location.search, () => "")
  const resolved = keepUtm && !external && search ? withLandingUtm(href, search) : href

  const handleClick: Props["onClick"] = (e) => {
    if (event) track(event, eventProps)
    onClick?.(e)
  }

  if (external) {
    return (
      <a href={href} target="_blank" rel={rest.rel ?? "noopener"} onClick={handleClick} {...rest}>
        {children}
      </a>
    )
  }
  if (native) {
    return (
      <a href={href} onClick={handleClick} {...rest}>
        {children}
      </a>
    )
  }
  return (
    <Link href={resolved} onClick={handleClick} {...rest}>
      {children}
    </Link>
  )
}
