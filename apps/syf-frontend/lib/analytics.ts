// Analytics events (SPEC-HOME §13). The provider isn't chosen yet, so this only logs in development.
// When one is picked, set site.analytics and forward events here.

export type AnalyticsEvent =
  | "register_cta_click"
  | "sponsor_click"
  | "live_stream_click"
  | "calendar_add"
  | "nav_click"

export type AnalyticsProps = Record<string, string | number | boolean | undefined>

export function track(event: AnalyticsEvent, props: AnalyticsProps = {}) {
  if (typeof window === "undefined") return
  if (process.env.NODE_ENV !== "production") console.debug("[analytics]", event, props)
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"]

/** Carry UTM tags from the landing URL (e.g. WhatsApp shares) on to the register page. */
export function withLandingUtm(href: string, search: string): string {
  const incoming = new URLSearchParams(search)
  const url = new URL(href, "http://x")
  for (const key of UTM_KEYS) {
    const value = incoming.get(key)
    if (value && !url.searchParams.has(key)) url.searchParams.set(key, value)
  }
  return `${url.pathname}${url.search}${url.hash}`
}
