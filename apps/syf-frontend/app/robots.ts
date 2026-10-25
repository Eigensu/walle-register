import type { MetadataRoute } from "next"
import { isProduction } from "@/lib/content"
import { siteUrl } from "@/lib/site"

export default function robots(): MetadataRoute.Robots {
  if (!isProduction) return { rules: { userAgent: "*", disallow: "/" } }
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${siteUrl()}/sitemap.xml` }
}
