import type { MetadataRoute } from "next"
import { site } from "@/site.config"
import { siteUrl } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl()
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}${site.event.registration.href}`, changeFrequency: "daily", priority: 0.9 },
    ...Object.keys(site.stubPages).map((slug) => ({ url: `${base}/${slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
  ]
}
