import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { ArrowLeft, Shield, Users, Trophy, Sparkles } from "lucide-react"
import { committee } from "@/content/committee"
import { pub, isProduction } from "@/lib/content"
import { Monogram } from "@/components/brand/monogram"
import { SeamRings } from "@/components/brand/seam-rings"

export const metadata: Metadata = {
  title: "Committee Members",
  description: "Meet the 12 committee members and young industry leaders steering Silver Youth Forum and NSPL.",
  alternates: { canonical: "/committee" },
}

export default function CommitteePage() {
  const members = committee.filter((m) => m.confirmed || !isProduction).sort((a, b) => a.order - b.order)

  return (
    <div className="min-h-screen bg-mist text-navy">
      {/* Hero Header */}
      <section className="on-navy relative isolate overflow-hidden bg-navy pb-16 pt-32 text-silver-bright lg:pb-24 lg:pt-40">
        <SeamRings className="pointer-events-none absolute -right-36 top-1/2 -translate-y-1/2 size-[42rem] text-silver opacity-[0.09]" />
        <div className="container-site relative">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-silver-dim transition-colors hover:text-silver-bright mb-6"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
          <p className="eyebrow text-silver">Leadership &middot; Silver Youth Forum</p>
          <h1 className="type-display-l mt-3 text-white">
            The People Behind <span className="silver-text italic">SYF</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-silver lg:text-lg">
            A united collective of 12 dynamic entrepreneurs and leaders representing prominent silver jewellery houses across India, dedicated to driving fraternity collaboration, youth empowerment, and sporting excellence.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-6 text-xs text-silver-dim border-t border-navy-line pt-6">
            <span className="flex items-center gap-2 text-silver">
              <Users className="size-4 text-royal" /> 12 Committee Leaders
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-2 text-silver">
              <Shield className="size-4 text-royal" /> Industry Governance
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-2 text-silver">
              <Trophy className="size-4 text-royal" /> NSPL Governing Body
            </span>
          </div>
        </div>
      </section>

      {/* Committee Grid */}
      <section className="container-site -mt-8 pb-20 relative z-10">
        <div className="rounded-2xl border border-line bg-paper p-6 sm:p-10 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-line pb-6">
            <div>
              <h2 className="text-2xl font-bold text-navy">Governing Committee Members</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Office-bearers and executive members from across the silver fraternity.
              </p>
            </div>
            <div className="rounded-xl bg-mist px-4 py-2 text-xs font-semibold text-silver-dim self-start sm:self-auto">
              Season 2 &middot; 2026&ndash;2027
            </div>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {members.map((m) => {
              const photo = pub(m.photo)
              return (
                <div
                  key={m.name}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-mist/30 p-5 transition-all hover:border-royal/40 hover:bg-white hover:shadow-md"
                >
                  <div>
                    {/* Headshot / Monogram */}
                    <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-xl bg-navy shadow-inner">
                      {Boolean(photo) ? (
                        <Image
                          src={photo as string}
                          alt={m.name}
                          fill
                          sizes="(min-width: 1280px) 20vw, (min-width: 768px) 30vw, 90vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Monogram name={m.name} className="h-full w-full" />
                        </div>
                      )}
                    </div>

                    {/* Member Details */}
                    <h3 className="text-base font-bold text-navy group-hover:text-royal transition-colors">
                      {m.name}
                    </h3>
                    <p className="mt-1 text-sm font-semibold leading-snug text-navy/70 line-clamp-2">
                      {m.firm}
                    </p>
                  </div>

                </div>
              )
            })}
          </div>
        </div>

        {/* Governance & Vision Cards */}
        <div className="mt-12 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
            <div className="flex size-10 items-center justify-center rounded-xl bg-royal/10 text-royal mb-4">
              <Users className="size-5" />
            </div>
            <h3 className="font-bold text-navy text-base">Uniting Young Leaders</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              Bringing together the second-generation entrepreneurs from the bullion, manufacturing, and retail silver trade under one dynamic platform.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
            <div className="flex size-10 items-center justify-center rounded-xl bg-royal/10 text-royal mb-4">
              <Trophy className="size-5" />
            </div>
            <h3 className="font-bold text-navy text-base">NSPL Tournament Governance</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              Managing transparent player auctions, impartial match refereeing, team franchising, and world-class cricketing infrastructure.
            </p>
          </div>

          <div className="rounded-2xl border border-line bg-paper p-6 shadow-sm">
            <div className="flex size-10 items-center justify-center rounded-xl bg-royal/10 text-royal mb-4">
              <Sparkles className="size-5" />
            </div>
            <h3 className="font-bold text-navy text-base">Industry Knowledge &amp; Growth</h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              Organizing business conclaves, networking summits, and discussions to advance India&rsquo;s silver jewellery industry globally.
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
