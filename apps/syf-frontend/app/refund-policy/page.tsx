import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, RefreshCw, AlertCircle, CheckCircle, Mail, MapPin } from "lucide-react"
import { SeamRings } from "@/components/brand/seam-rings"

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy",
  description: "Guidelines and timelines regarding tournament fee refunds, cancellation requests, and payment resolutions for NSPL Season 2.",
  alternates: { canonical: "/refund-policy" },
}

export default function RefundPolicyPage() {
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
          <p className="eyebrow text-silver">Payment Policies</p>
          <h1 className="type-display-l mt-3 text-white">Refund &amp; Cancellation Policy</h1>
          <p className="mt-4 max-w-2xl text-base text-silver">
            Clear, transparent guidelines on when NSPL tournament registration fees are refundable, applicable timelines, and gateway settlement procedures.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-silver-dim">
            <span>Last Updated: October 2026</span>
            <span>&bull;</span>
            <span className="inline-flex items-center gap-1.5 text-silver">
              <RefreshCw className="size-4 text-royal" />
              Automated Gateway Reversals
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container-site py-12 lg:py-16">
        <div className="mx-auto max-w-4xl space-y-10 rounded-2xl border border-line bg-paper p-6 sm:p-10 shadow-sm">
          
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5">
              <h3 className="font-semibold text-emerald-800 dark:text-emerald-400 text-sm flex items-center gap-2">
                <CheckCircle className="size-4 shrink-0 text-emerald-600" />
                100% Refund Situations
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                Tournament cancellation by SYF, unintentional duplicate charges, or verified system transaction errors qualify for a full 100% refund without deduction.
              </p>
            </div>
            <div className="rounded-xl border border-royal/20 bg-royal/5 p-5">
              <h3 className="font-semibold text-royal text-sm flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0 text-royal" />
                Player Cancellation Deadline
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                Voluntary withdrawals submitted before the published registration closing date are processed minus nominal gateway settlement charges.
              </p>
            </div>
          </div>

          <article className="space-y-8 text-sm leading-relaxed text-ink-muted sm:text-base sm:leading-7">
            <div>
              <h2 className="text-xl font-bold text-navy sm:text-2xl mb-3">1. Scope and Applicability</h2>
              <p className="mb-3">
                This Refund and Cancellation Policy applies to all player registrations, sponsorships, and entry fees received by Silver Youth Forum (&ldquo;SYF&rdquo;) for the National Silver Premier League (&ldquo;NSPL&rdquo;). All transactions are processed into the verified bank account of Silver Youth Forum via RBI-authorised payment aggregators.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-navy sm:text-2xl mb-3">2. Circumstances Eligible for Refund</h2>
              <p className="mb-3">Registrants are eligible for refunds under the following specific circumstances:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Tournament Postponement or Cancellation:</strong> If NSPL Season 2 is cancelled by the committee due to unforeseen administrative or force majeure circumstances, all verified registrants will receive a full 100% refund.
                </li>
                <li>
                  <strong>Withdrawal Prior to Registration Deadline:</strong> If a player formally withdraws their registration in writing prior to the announced registration deadline (early December 2026), a refund will be issued subject to deduction of applicable bank/gateway processing charges (~2.5%).
                </li>
                <li>
                  <strong>Unselected Auction Players:</strong> In the event that tournament rules stipulate a refund for verified registered players who remain unsold/unassigned after the official player auction, such fee portions will be refunded per committee notification.
                </li>
                <li>
                  <strong>Duplicate or Erroneous Transactions:</strong> In case of duplicate debits or technical errors during gateway checkout where payment is debited twice, the extra charge will be immediately credited back to the source account.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-navy sm:text-2xl mb-3">3. Non-Refundable Scenarios</h2>
              <p className="mb-3">Refunds cannot be granted under the following conditions:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Withdrawal requests made after the close of registrations or once the official auction player cards have been finalized.</li>
                <li>Disqualification arising from false eligibility representations, forged firm association credentials, or violation of the tournament Code of Conduct.</li>
                <li>Absence, late arrival, or forfeiture on tournament match days by a player or team.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-navy sm:text-2xl mb-3">4. Refund Processing &amp; Settlement Timelines</h2>
              <p className="mb-3">
                Approved refunds are initiated through the payment gateway&rsquo;s merchant portal back to the original method of payment (UPI, credit/debit card, or net banking account).
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Initiation:</strong> Within 48 hours of committee written confirmation.</li>
                <li><strong>Bank Settlement:</strong> Funds typically credit into the player&rsquo;s account within <strong>5 to 7 business days</strong> depending on the issuing bank&rsquo;s clearing cycle.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-navy sm:text-2xl mb-3">5. How to Submit a Cancellation or Refund Request</h2>
              <p className="mb-4">
                To initiate a cancellation or request assistance with a billing discrepancy, please email our finance committee with your Registration ID and payment reference:
              </p>
              <div className="rounded-xl border border-line bg-mist/60 p-5 space-y-3">
                <p className="font-semibold text-navy">SYF Finance &amp; Tournament Desk</p>
                <div className="flex items-center gap-2 text-sm text-ink-muted">
                  <Mail className="size-4 text-royal shrink-0" />
                  <a href="mailto:contact@silveryouthforum.in" className="hover:text-royal hover:underline">
                    contact@silveryouthforum.in
                  </a>
                </div>
                <div className="flex items-start gap-2 text-sm text-ink-muted">
                  <MapPin className="size-4 text-royal shrink-0 mt-0.5" />
                  <span>Subject: &ldquo;Refund Request - [Registration ID]&rdquo;</span>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>
    </div>
  )
}
