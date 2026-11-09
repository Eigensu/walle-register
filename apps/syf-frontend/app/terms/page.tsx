import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Scale, Mail, MapPin } from "lucide-react"
import { SeamRings } from "@/components/brand/seam-rings"

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Tournament rules, player eligibility, auction guidelines, and conduct policies for NSPL and Silver Youth Forum.",
  alternates: { canonical: "/terms" },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-mist text-navy">
      {/* Hero Header */}
      <section className="on-navy relative overflow-hidden bg-navy pb-16 pt-32 text-silver-bright lg:pb-24 lg:pt-40">
        <SeamRings className="pointer-events-none absolute -right-40 top-1/2 -translate-y-1/2 size-[36rem] text-silver opacity-[0.08]" />
        <div className="container-site relative">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-silver-dim transition-colors hover:text-silver-bright mb-6"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
          <p className="eyebrow text-silver">Tournament Governance</p>
          <h1 className="type-display-l mt-3 text-white">Terms & Conditions</h1>
          <p className="mt-4 max-w-2xl text-base text-silver">
            Rules, eligibility criteria, player conduct guidelines, and tournament terms for the National Silver Premier League (NSPL) organised by Silver Youth Forum.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-silver-dim">
            <span>Last Updated: October 2026</span>
            <span>&bull;</span>
            <span className="inline-flex items-center gap-1.5 text-silver">
              <Scale className="size-4 text-royal" />
              Official SYF Committee Rules
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container-site py-12 lg:py-16">
        <div className="mx-auto max-w-4xl space-y-10 rounded-2xl border border-line bg-paper p-6 sm:p-10 shadow-sm">
          
          <div className="rounded-xl border border-line bg-mist/60 p-5 sm:p-6">
            <h3 className="font-semibold text-navy text-base flex items-center gap-2">
              <Scale className="size-5 text-royal" />
              Tournament Governance Overview
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              By submitting your player registration form and completing payment for the National Silver Premier League (NSPL Season 2), you agree to comply with the rules, spirit of cricket, and decisions of the Silver Youth Forum Committee. The committee&rsquo;s decisions regarding disputes, scheduling, eligibility, and disciplinary actions remain final and binding.
            </p>
          </div>

          <article className="space-y-8 text-sm leading-relaxed text-ink-muted sm:text-base sm:leading-7">
            <div>
              <h2 className="text-xl font-bold text-navy sm:text-2xl mb-3">1. Eligibility Criteria</h2>
              <p className="mb-3">
                NSPL is established exclusively to foster unity, leadership, and athletic competition within the silver jewellery fraternity of India. Participation is strictly governed by the following criteria:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Participants must be owners, partners, directors, family members, or bona fide active employees of registered silver jewellery firms.</li>
                <li>The SYF Committee reserves the right to request proof of association (such as visiting cards, GST certificates, or company credentials) before or after auction confirmation.</li>
                <li>Any registration misrepresenting firm association or employment shall lead to immediate disqualification without fee refund.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-navy sm:text-2xl mb-3">2. Player Registration & Pool Selection</h2>
              <p className="mb-3">
                Registration submissions are validated on a first-come, first-verified basis until player caps or deadlines are reached:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>A registration is marked complete and active only after confirmation of the entry fee through our integrated payment aggregator.</li>
                <li>Confirmed registrants enter the official NSPL Player Auction Pool. Team assignment is governed solely by the auction process conducted by registered team owners and franchise sponsors.</li>
                <li>Silver Youth Forum does not guarantee placement on a specific team, franchise, or batting position.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-navy sm:text-2xl mb-3">3. Code of Conduct & Sportsmanship</h2>
              <p className="mb-3">
                All players represent the dignity and values of the silver jewellery fraternity. Players agree to maintain the highest standard of sportsmanship on and off the field:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Verbal abuse, aggressive dissent towards on-field umpires, or physical misconduct will result in match penalties or season disqualification.</li>
                <li>Umpires and match referees appointed by the tournament committee hold sole on-field match authority.</li>
                <li>Players must wear official tournament jerseys and kits provided by the forum during all official match days.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-navy sm:text-2xl mb-3">4. Media, Broadcast & Photograph Consent</h2>
              <p className="mb-3">
                By participating in NSPL, players grant Silver Youth Forum and its authorized media partners non-exclusive, irrevocable permission to photograph, film, and broadcast match coverage, auction profiles, highlights, and promotional creatives featuring the player&rsquo;s name, likeness, and cricket statistics across YouTube live streams, social media, and official publications.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-navy sm:text-2xl mb-3">5. Health, Safety & Disclaimer of Liability</h2>
              <p className="mb-3">
                Cricket is an active sporting competition. Each participant confirms that they are medically fit to engage in competitive cricket:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>First-aid and emergency medical support will be accessible on tournament grounds.</li>
                <li>Silver Youth Forum, its office-bearers, tournament sponsors, and event management partners assume no liability for personal sporting injuries, gear loss, or accidents sustained during match days or practice sessions.</li>
                <li>All players must supply accurate emergency contact information during registration.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-navy sm:text-2xl mb-3">6. Modifications & Organiser&rsquo;s Authority</h2>
              <p className="mb-3">
                The Silver Youth Forum Committee reserves the right to amend match schedules, tournament venues, fixture formats, or playing conditions owing to weather, ground availability, or operational requirements. In all tournament matters, the Committee&rsquo;s ruling is final.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-navy sm:text-2xl mb-3">7. Contact & Official Queries</h2>
              <p className="mb-4">For any tournament questions, sponsorship notices, or formal clarifications:</p>
              <div className="rounded-xl border border-line bg-mist/60 p-5 space-y-3">
                <p className="font-semibold text-navy">Silver Youth Forum Organizing Committee</p>
                <div className="flex items-center gap-2 text-sm text-ink-muted">
                  <Mail className="size-4 text-royal shrink-0" />
                  <a href="mailto:contact@silveryouthforum.in" className="hover:text-royal hover:underline">
                    contact@silveryouthforum.in
                  </a>
                </div>
                <div className="flex items-start gap-2 text-sm text-ink-muted">
                  <MapPin className="size-4 text-royal shrink-0 mt-0.5" />
                  <span>Mumbai, Maharashtra, India</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
