import Image from "next/image"
import type { CSSProperties } from "react"
import { site } from "@/site.config"
import { committee } from "@/content/committee"
import { isProduction, pub } from "@/lib/content"
import { assetExists } from "@/lib/site"
import { Monogram } from "@/components/brand/monogram"
import { SectionHeading } from "./section-heading"

/** Committee teaser (PDF p4 #7). */
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

        <div className="committee-marquee-viewport mt-12 overflow-hidden">
          <div className="committee-marquee-track flex w-max">
            {[0, 1].map((copy) => (
              <ul key={copy} aria-hidden={copy === 1} aria-label={copy === 0 ? "Meet the committee" : undefined} className="flex shrink-0 gap-4 pr-4 sm:gap-6 sm:pr-6">
                {members.map((m, i) => {
                  const photo = pub(m.photo)
                  return (
                    <li key={`${m.name}-${i}`} style={{ "--reveal-delay": `${i * 60}ms` } as CSSProperties} className="w-[44vw] max-w-64 shrink-0 sm:w-[30vw] lg:w-[18vw] lg:max-w-56">
                      {assetExists(photo) ? (
                        <div className="group relative aspect-square overflow-hidden rounded-lg bg-navy">
                          <Image src={photo} alt="" fill sizes="(min-width: 1024px) 18vw, 44vw" className={`object-cover transition-transform duration-300 group-hover:scale-105 ${["Akshay Mehta", "Vivek Kabra"].includes(m.name) ? "object-top" : "object-center"}`} />
                        </div>
                      ) : (
                        <Monogram name={m.name} className="aspect-square rounded-lg" />
                      )}
                      <p className="mt-4 font-semibold leading-snug text-navy">{m.name}</p>
                      <p className="mt-1 text-sm leading-snug text-ink-muted">{m.firm}</p>
                    </li>
                  )
                })}
              </ul>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
