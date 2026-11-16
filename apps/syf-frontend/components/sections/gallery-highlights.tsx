import Image from "next/image"
import type { CSSProperties } from "react"
import { site } from "@/site.config"
import { gallery } from "@/content/gallery"
import { pub } from "@/lib/content"
import { assetExists } from "@/lib/site"
import { cn } from "@/lib/utils"
import { SectionHeading } from "./section-heading"

// Six-photo rhythm on wide screens: 3 / 6 / 3 over 4 / 4 / 4.
const SPANS = ["lg:col-span-3", "lg:col-span-6", "lg:col-span-3", "lg:col-span-4", "lg:col-span-4", "lg:col-span-4"]
/** Curated gallery highlights from the supplied NSPL photo archive. */
export function GalleryHighlights() {
  const { gallery: cfg } = site.home
  const photos = gallery.filter((g) => g.featured).flatMap((g) => {
    const src = pub(g.src)
    return assetExists(src) ? [{ ...g, src: src as string }] : []
  })
  if (photos.length === 0) return null
  const sixUp = photos.length === 6

  return (
    <section aria-labelledby="gallery-title" className="bg-mist">
      <div className="container-site py-24 lg:py-32">
        <SectionHeading id="gallery-title" eyebrow={cfg.eyebrow} heading={cfg.heading} link={cfg.link} />

        <ul
          className={cn(
            "scrollbar-none -mx-4 mt-12 grid snap-x snap-mandatory auto-cols-[82%] grid-flow-col gap-4 overflow-x-auto scroll-px-4 px-4 sm:-mx-6 sm:auto-cols-[48%] sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid-flow-row lg:overflow-visible lg:px-0",
            sixUp ? "lg:grid-cols-12" : "lg:grid-cols-3",
          )}
        >
          {photos.map((t, i) => (
            <li
              key={`${t.alt}-${i}`}
              data-reveal=""
              style={{ "--reveal-delay": `${(i % 3) * 60}ms` } as CSSProperties}
              className={cn("snap-start", sixUp && SPANS[i])}
            >
              <figure className={cn("group relative aspect-[4/3] overflow-hidden rounded-2xl", sixUp && (i < 3 ? "lg:aspect-auto lg:h-[22rem]" : "lg:aspect-auto lg:h-[17rem]"))}>
                <Image src={t.src} alt={t.alt} fill sizes="(min-width: 1024px) 40vw, 82vw" className="object-cover transition duration-500 lg:group-hover:scale-[1.03]" />
                <figcaption className="eyebrow absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/80 to-transparent px-4 pb-3 pt-10 text-[0.6875rem] text-silver-bright lg:opacity-0 lg:transition-opacity lg:group-hover:opacity-100">
                  {t.tag}
                </figcaption>
              </figure>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
