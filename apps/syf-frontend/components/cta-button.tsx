import { ArrowRight, ArrowUpRight } from "lucide-react"
import type { Cta } from "@/lib/phase"
import type { AnalyticsEvent } from "@/lib/analytics"
import { Button } from "@/components/ui/button"
import { TrackLink } from "@/components/track-link"
import type { ComponentProps } from "react"

type Props = {
  cta: Cta
  /** Where on the page, for analytics (header, hero, event_band, sticky_bar, mobile_menu). */
  location: string
  variant?: ComponentProps<typeof Button>["variant"]
  size?: ComponentProps<typeof Button>["size"]
  className?: string
  id?: string
  label?: string
}

const EVENTS: Record<Cta["kind"], AnalyticsEvent> = {
  register: "register_cta_click",
  live: "live_stream_click",
  nav: "nav_click",
}

/** A phase-driven call to action, rendered as a button-styled link. */
export function CtaButton({ cta, location, variant = "primary", size = "md", className, id, label }: Props) {
  const Icon = cta.external ? ArrowUpRight : ArrowRight
  return (
    <Button asChild variant={variant} size={size} className={className}>
      <TrackLink
        id={id}
        href={cta.href}
        external={cta.external}
        keepUtm={cta.kind === "register"}
        event={EVENTS[cta.kind]}
        eventProps={{ location, href: cta.href }}
      >
        {label ?? cta.label}
        <Icon aria-hidden="true" />
      </TrackLink>
    </Button>
  )
}
