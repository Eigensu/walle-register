import Image from "next/image"
import type { CSSProperties } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { site } from "@/site.config"
import { isProduction, pub } from "@/lib/content"
import { assetExists } from "@/lib/site"
import { cn } from "@/lib/utils"
import { Emphasis } from "@/components/brand/emphasis"
import { SeamRings } from "@/components/brand/seam-rings"
import { TbcBadge, TbcFor } from "@/components/brand/tbc"

/** About snippet (PDF p4 #4): the organisation's own write-up, its pillars, and a link to About Us. */
export function AboutSnippet() {
  const { about } = site.home
  const photo = pub(about.photo)
  const hasPhoto = assetExists(photo)
  const body = pub(about.body)

  return (
    <section aria-labelledby="about-title" className="bg-paper">
      <div className="container-site grid items-center gap-12 py-24 lg:grid-cols-12 lg:gap-16 lg:py-32">
        <div data-reveal="" className={cn(hasPhoto ? "lg:col-span-6" : "lg:col-span-7")}>
          <p className="eyebrow text-ink-muted">{about.eyebrow}</p>
          <h2 id="about-title" className="type-display-l mt-4 text-navy">
            <Emphasis text={about.heading} accentClassName="ink-text" />
          </h2>
          {body && (
            <p className="mt-7 max-w-[60ch] text-lg leading-relaxed text-ink-muted">
              {body} <TbcFor f={about.body} />
            </p>
          )}
          {hasPhoto && (
            <ul className="mt-8 flex flex-wrap gap-x-3 gap-y-2">
              {about.pillars.map((p, i) => (
                <li key={p} className="eyebrow flex items-center gap-3 text-navy">
                  {i > 0 && <span aria-hidden="true" className="size-1 rounded-full bg-silver-dim" />}
                  {p}
                </li>
              ))}
            </ul>
          )}
          <Link
            href={about.link.href}
            className="group mt-9 inline-flex items-center gap-2 rounded-sm text-[0.9375rem] font-semibold text-royal underline-offset-4 hover:underline"
          >
            {about.link.label}
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>

        <div data-reveal="" style={{ "--reveal-delay": "80ms" } as CSSProperties} className={cn(hasPhoto ? "lg:col-span-6" : "lg:col-span-5")}>
          {hasPhoto ? (
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
              <Image src={photo} alt={`${site.org.name} members`} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" />
            </div>
          ) : (
            <div className="on-navy grain relative overflow-hidden rounded-2xl bg-navy text-silver-bright">
              <SeamRings className="absolute -right-24 -top-24 size-[26rem] text-silver opacity-[0.12]" />
              <ul className="relative px-8 py-6 sm:px-10">
                {about.pillars.map((p) => (
                  <li key={p} className="border-b border-navy-line py-6 last:border-b-0">
                    <span className="font-display text-[2rem] leading-tight sm:text-[2.5rem]">{p}</span>
                  </li>
                ))}
              </ul>
              {!isProduction && (
                <p className="relative flex items-center gap-2 px-8 pb-5 text-xs text-silver-dim sm:px-10">
                  <TbcBadge note={about.photo.note} /> Group photo
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
