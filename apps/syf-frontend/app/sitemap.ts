import type { MetadataRoute } from "next"
import { site } from "@/site.config"
import { siteUrl } from "@/lib/site"

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl()
  const realPages = [
    "/about",
    "/nspl",
    "/committee",
    "/sponsors",
    "/gallery",
    "/contact",
    "/privacy-policy",
    "/terms",
    "/refund-policy",
    "/cancellation-policy",
  ]
  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}${site.event.registration.href}`, changeFrequency: "daily", priority: 0.9 },
    ...realPages.map((slug) => ({
      url: `${base}${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    })),
    ...Object.keys(site.stubPages).map((slug) => ({
      url: `${base}/${slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ]
}
