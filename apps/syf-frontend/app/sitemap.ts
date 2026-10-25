import type { MetadataRoute } from "next"
import { site } from "@/site.config"
import { siteUrl } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl()
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    ...Object.keys(site.stubPages).map((slug) => ({ url: `${base}/${slug}`, changeFrequency: "weekly" as const, priority: 0.7 })),
  ]
}
