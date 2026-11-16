import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Clock, AlertTriangle, Mail } from "lucide-react"
import { SeamRings } from "@/components/brand/seam-rings"

export const metadata: Metadata = {
  title: "Cancellation Policy",
  description: "Tournament cancellation timeline, withdrawal rules, and kit delivery terms for Silver Youth Forum NSPL Season 2.",
  alternates: { canonical: "/cancellation-policy" },
}

export default function CancellationPolicyPage() {
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
          <p className="eyebrow text-silver">Tournament Policies</p>
          <h1 className="type-display-l mt-3 text-white">Cancellation Policy</h1>
          <p className="mt-4 max-w-2xl text-base text-silver">
            Guidelines governing tournament registration cancellations, kit distribution timelines, and withdrawal procedures.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-silver-dim">
            <span>Last Updated: October 2026</span>
            <span>&bull;</span>
            <span className="inline-flex items-center gap-1.5 text-silver">
              <Clock className="size-4 text-royal" />
              Standardized SYF Timelines
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container-site py-12 lg:py-16">
        <div className="mx-auto max-w-4xl space-y-10 rounded-2xl border border-line bg-paper p-6 sm:p-10 shadow-sm">
          
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-5">
            <h3 className="font-semibold text-amber-900 dark:text-amber-300 text-sm flex items-center gap-2">
              <AlertTriangle className="size-4 shrink-0 text-amber-600" />
              Notice on Kit Orders &amp; Auction Finalization
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-ink-muted">
              Because tournament jerseys are customized with player names and sizes and player cards are submitted for the official live auction, registrations cannot be cancelled once the player pool cutoff date has passed.
            </p>
          </div>

          <article className="space-y-8 text-sm leading-relaxed text-ink-muted sm:text-base sm:leading-7">
            <div>
              <h2 className="text-xl font-bold text-navy sm:text-2xl mb-3">1. Cancellation Timelines</h2>
              <p className="mb-3">
                Players who have registered for NSPL Season 2 may request cancellation of their registration under the following timeline rules:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Prior to Registration Deadline:</strong> Full cancellation permitted. Registration fee is refunded minus payment gateway charges (~2.5%).
                </li>
                <li>
                  <strong>Post-Deadline / During Auction Phase:</strong> No cancellations permitted. Player details and jersey customizations enter manufacturing and auction rosters.
                </li>
                <li>
                  <strong>Force Majeure / Committee Rescheduling:</strong> If tournament match days are rescheduled by the committee and a player cannot attend the rescheduled dates, cancellation requests will be reviewed on a case-by-case basis.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-navy sm:text-2xl mb-3">2. Kit &amp; Materials Delivery</h2>
              <p className="mb-3">
                Tournament kits (jerseys, caps, and badges) are distributed directly at the official pre-tournament team meeting or at the venue prior to the opening match. Kits are not shipped by commercial post unless specifically requested and coordinated with the committee.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-navy sm:text-2xl mb-3">3. How to Submit a Cancellation</h2>
              <p className="mb-3">
                To cancel your registration, send an email to <a href="mailto:contact@silveryouthforum.in" className="text-royal font-medium hover:underline">contact@silveryouthforum.in</a> with your Registration ID, full name, and mobile number. For details on refund settlements, refer to our{" "}
                <Link href="/refund-policy" className="text-royal font-medium hover:underline">
                  Refund &amp; Cancellation Policy
                </Link>.
              </p>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
