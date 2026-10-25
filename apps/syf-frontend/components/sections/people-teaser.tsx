import Image from "next/image"
import type { CSSProperties } from "react"
import { site } from "@/site.config"
import { committee } from "@/content/committee"
import { isProduction, pub } from "@/lib/content"
import { assetExists } from "@/lib/site"
import { Monogram } from "@/components/brand/monogram"
import { TbcFor } from "@/components/brand/tbc"
import { SectionHeading } from "./section-heading"

/** Committee teaser (PDF p4 #7). Portraits share one greyscale + navy treatment so mixed headshots read as a set. */
export function PeopleTeaser() {
  const { people } = site.home
  const members = committee
    .filter((m) => m.confirmed || !isProduction)
    .sort((a, b) => a.order - b.order)
    .slice(0, people.teaserCount)
  if (members.length === 0) return null

  return (
    <section aria-labelledby="people-title" className="bg-paper">
      <div className="container-site py-24 lg:py-32">
        <SectionHeading id="people-title" eyebrow={people.eyebrow} heading={people.heading} link={people.link} />

        <ul className="scrollbar-none -mx-4 mt-12 grid snap-x snap-mandatory auto-cols-[44%] grid-flow-col gap-4 overflow-x-auto scroll-px-4 px-4 sm:-mx-6 sm:auto-cols-[30%] sm:scroll-px-6 sm:px-6 lg:mx-0 lg:grid-flow-row lg:grid-cols-6 lg:overflow-visible lg:px-0">
          {members.map((m, i) => {
            const photo = pub(m.photo)
            const designation = pub(m.designation)
            return (
              <li key={m.name} data-reveal="" style={{ "--reveal-delay": `${i * 60}ms` } as CSSProperties} className="snap-start">
                {assetExists(photo) ? (
                  <div className="group relative aspect-square overflow-hidden rounded-lg bg-navy">
                    <Image
                      src={photo}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 16vw, 44vw"
                      className="object-cover grayscale transition duration-300 lg:group-hover:grayscale-0"
                    />
                    <div className="absolute inset-0 bg-navy/10 mix-blend-multiply transition-opacity lg:group-hover:opacity-0" />
                  </div>
                ) : (
                  <Monogram name={m.name} className="aspect-square rounded-lg" />
                )}
                <p className="mt-4 font-semibold leading-snug text-navy">{m.name}</p>
                <p className="mt-1 text-sm leading-snug text-ink-muted">{m.firm}</p>
                {designation ? (
                  <p className="eyebrow mt-2 text-[0.6875rem] text-navy">
                    {designation} <TbcFor f={m.designation} />
                  </p>
                ) : (
                  <TbcFor f={m.designation} className="mt-2" />
                )}
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
