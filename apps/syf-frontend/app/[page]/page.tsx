import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft } from "lucide-react"
import { site } from "@/site.config"
import { getSiteState } from "@/lib/site"
import { Button } from "@/components/ui/button"
import { CtaButton } from "@/components/cta-button"
import { SeamRings } from "@/components/brand/seam-rings"

// The other pages from the sitemap, until each is built. Unknown paths 404.
export const dynamicParams = false
export const revalidate = 60

type Params = { params: Promise<{ page: string }> }

export function generateStaticParams() {
  return Object.keys(site.stubPages).map((page) => ({ page }))
}

const pageFor = (slug: string) => (site.stubPages as Record<string, { title: string; summary: string }>)[slug]

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const page = pageFor((await params).page)
  return page ? { title: page.title, description: page.summary, robots: { index: false } } : {}
}

export default async function StubPage({ params }: Params) {
  const slug = (await params).page
  const page = pageFor(slug)
  if (!page) notFound()
  const { phase } = await getSiteState()
  const primary = phase.primaryCta.href === `/${slug}` ? null : phase.primaryCta

  return (
    <section aria-labelledby="page-title" className="on-navy grain relative isolate overflow-hidden bg-navy text-silver-bright">
      <SeamRings className="animate-ring-turn absolute -right-60 top-1/2 -z-10 size-[44rem] -translate-y-1/2 text-silver opacity-[0.12]" />
      <div className="container-site flex min-h-[78svh] flex-col justify-end pb-20 pt-36">
        <p className="eyebrow text-silver">{site.org.name}</p>
        <h1 id="page-title" className="type-display-xl mt-5">
          {page.title}
        </h1>
        <p className="mt-6 max-w-[40rem] text-lg leading-relaxed text-silver">{page.summary}</p>
        <p className="mt-3 text-silver-dim">This page is being built and will be live soon.</p>
        <div className="mt-10 flex flex-col gap-3 sm:flex-row">
          {primary && <CtaButton cta={primary} location={`stub_${slug}`} size="lg" />}
          <Button asChild variant="outlineDark" size="lg">
            <Link href="/">
              <ArrowLeft aria-hidden="true" />
              Back to home
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
