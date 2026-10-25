import type { getSiteState } from "@/lib/site"

export type SiteState = Awaited<ReturnType<typeof getSiteState>>

export type SectionProps = { state: SiteState }
