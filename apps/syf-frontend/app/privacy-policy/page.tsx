import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, ShieldCheck, Mail, MapPin } from "lucide-react"
import { site } from "@/site.config"
import { SeamRings } from "@/components/brand/seam-rings"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Silver Youth Forum collects, uses, and protects player and member data under DPDP standards.",
  alternates: { canonical: "/privacy-policy" },
}

export default function PrivacyPolicyPage() {
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
          <p className="eyebrow text-silver">Legal & Compliance</p>
          <h1 className="type-display-l mt-3 text-white">Privacy Policy</h1>
          <p className="mt-4 max-w-2xl text-base text-silver">
            This Privacy Policy explains how Silver Youth Forum (&ldquo;SYF&rdquo;, &ldquo;we&rdquo;, &ldquo;our&rdquo;) collects, processes, and safeguards data collected during tournament registrations and forum initiatives.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-4 text-xs text-silver-dim">
            <span>Last Updated: October 2026</span>
            <span>&bull;</span>
            <span className="inline-flex items-center gap-1.5 text-silver">
              <ShieldCheck className="size-4 text-royal" />
              Aligned with India DPDP Rules
            </span>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="container-site py-12 lg:py-16">
        <div className="mx-auto max-w-4xl space-y-10 rounded-2xl border border-line bg-paper p-6 sm:p-10 shadow-sm">
          
          {/* DPDP Highlight Callout */}
          <div className="rounded-xl border border-royal/20 bg-royal/5 p-5 sm:p-6">
            <h3 className="font-semibold text-royal text-base flex items-center gap-2">
              <ShieldCheck className="size-5" />
              Our Data Protection Commitment
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
              In accordance with India&rsquo;s Digital Personal Data Protection (DPDP) standards, Silver Youth Forum only collects data strictly necessary for tournament organization, player auction profiling, kit creation, and verified fraternity participation. We deliberately <strong>do not collect</strong> Aadhaar numbers, PAN cards, or sensitive medical histories.
            </p>
          </div>

          <article className="space-y-8 text-sm leading-relaxed text-ink-muted sm:text-base sm:leading-7">
            <div>
              <h2 className="text-xl font-bold text-navy sm:text-2xl mb-3">1. Information We Collect</h2>
              <p className="mb-3">
                When you register as a player for the National Silver Premier League (NSPL) or engage with SYF, we collect only the following information:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Identity & Contact:</strong> Full name, WhatsApp mobile number, email address, date of birth, and current residential city.</li>
                <li><strong>Fraternity Affiliation:</strong> Firm or company name, role in the firm (partner, director, proprietor, employee), and optional proof of silver industry association (visiting card or company ID).</li>
                <li><strong>Cricket Profile:</strong> Playing role (Batter, Bowler, All-rounder, Wicket-keeper), batting hand, bowling style, and previous NSPL tournament experience.</li>
                <li><strong>Kit & Safety:</strong> Jersey size, requested jersey name, preferred jersey number, and emergency contact details.</li>
                <li><strong>Photographs:</strong> A front-facing headshot used for auction player cards, live streams, and tournament graphics.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-navy sm:text-2xl mb-3">2. How We Use Your Information</h2>
              <p className="mb-3">The personal information collected is utilized exclusively for:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Validating player eligibility within the silver jewellery fraternity.</li>
                <li>Forming the official player auction pool and generating player profile cards for franchise team owners.</li>
                <li>Procuring customized tournament playing kits with appropriate sizing and printing.</li>
                <li>Communicating schedule updates, match fixtures, auction timelines, and emergency alerts via WhatsApp and email.</li>
                <li>Broadcasting match scorecards, rosters, and live streams on digital media.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-navy sm:text-2xl mb-3">3. Data Sharing & Security Safeguards</h2>
              <p className="mb-3">
                We value your trust and do not sell, rent, or lease your personal information to third parties. Access to player data is restricted strictly as follows:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Committee Admin Access:</strong> Dashboard access is password-protected with two-factor authentication and restricted only to named SYF Committee members.</li>
                <li><strong>Payment Security:</strong> Online payment transactions are handled directly by RBI-authorised payment aggregators (e.g. Cashfree/Razorpay). SYF never accesses or stores credit/debit card numbers or UPI PINs.</li>
                <li><strong>Sponsor & Media Disclosure:</strong> Only publicly relevant information (player name, role, firm, and photo) is shared during auction streams or team announcements.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl font-bold text-navy sm:text-2xl mb-3">4. Data Retention & Deletion Policy</h2>
              <p className="mb-3">
                Registration details are retained through the tournament cycle and auction post-event for accounting, score records, and dispute resolution. At the conclusion of the season, inactive raw documents are archived or deleted.
              </p>
              <p>
                Under DPDP guidelines, you hold the right to request access, correction, or deletion of your personal data by submitting a written request to our grievance officer.
              </p>
            </div>

            <div>
              <h2 className="text-xl font-bold text-navy sm:text-2xl mb-3">5. Contact & Grievance Redressal</h2>
              <p className="mb-4">
                If you have questions, corrections, or concerns regarding your privacy or data practices, please contact the Silver Youth Forum Committee:
              </p>
              <div className="rounded-xl border border-line bg-mist/60 p-5 space-y-3">
                <p className="font-semibold text-navy">Silver Youth Forum Secretariat</p>
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
