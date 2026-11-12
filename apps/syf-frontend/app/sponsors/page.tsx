"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  ArrowRight,
  Send,
  CheckCircle2,
  ExternalLink,
  Award,
  Sparkles,
  TrendingUp,
  Eye,
  Tv,
  Check,
} from "lucide-react"
import { site } from "@/site.config"
import { sponsors } from "@/content/sponsors"
import { pub, isProduction } from "@/lib/content"
import { SeamRings } from "@/components/brand/seam-rings"
import { Button } from "@/components/ui/button"

export default function SponsorsPage() {
  const [form, setForm] = useState({
    name: "",
    firm: "",
    phone: "",
    email: "",
    tier: "team",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const titleSponsor = sponsors.find((s) => s.tier === "title")
  const associateSponsors = sponsors.filter((s) => s.tier === "associate")
  const teamSponsors = sponsors.filter((s) => s.tier === "team" || s.tier === "partner")

  const contactEmail = pub(site.contact.email)
  const partners = sponsors.filter((x) => x.tier !== "title" && (x.confirmed || !isProduction))
  const tierLabel: Record<string, string> = { associate: "Associate Partner", team: "Team Sponsor", partner: "Official Partner" }

  // No enquiry backend yet: the form opens the visitor's email app with the details filled in,
  // and nothing is reported as received until they send it themselves.
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!contactEmail) return
    const body = [form.message, "", `Name: ${form.name}`, `Firm: ${form.firm}`, `Email: ${form.email}`, form.phone ? `Phone: ${form.phone}` : ""].join("\n")
    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent(`NSPL sponsorship enquiry: ${form.tier}`)}&body=${encodeURIComponent(body)}`
    setSubmitted(true)
  }

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
          <p className="eyebrow text-silver">Partners &middot; NSPL Season 2</p>
          <h1 className="type-display-l mt-3 text-white">
            Our <span className="silver-text italic">Sponsors</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-silver lg:text-lg">
            Backed by the most esteemed industry names. We partner with trailblazing jewellery enterprises and brands that empower the next generation of Indian silver.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-navy-line pt-6">
            <Button variant="primary" size="md" onClick={() => {
              const el = document.getElementById("enquire")
              el?.scrollIntoView({ behavior: "smooth" })
            }}>
              Become a Sponsor <ArrowRight className="size-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <section className="container-site -mt-8 pb-24 relative z-10 space-y-12">
        
        {/* TITLE SPONSOR SECTION (Prominent Stage) */}
        {titleSponsor && (
          <div className="overflow-hidden rounded-2xl border-2 border-royal/30 bg-paper p-8 sm:p-12 shadow-md">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left flex-1">
                <div className="inline-flex items-center gap-2 rounded-full bg-royal/10 px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-royal">
                  <Award className="size-4" />
                  Official Title Sponsor
                </div>
                <h2 className="text-3xl font-black text-navy sm:text-4xl">
                  {titleSponsor.name}
                </h2>
                <p className="text-sm leading-relaxed text-ink-muted max-w-xl">
                  Silver Show of India (SSI) is India&rsquo;s premier B2B silver jewellery exhibition, bringing together top manufacturers, wholesalers, and designers under one grand pavilion. As title partner for NSPL Season 2, SSI champions unity and sporting camaraderie across the trade.
                </p>
                <div className="pt-2">
                  <a
                    href="https://silvershowofindia.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-royal hover:underline"
                  >
                    Visit Silver Show of India <ExternalLink className="size-3.5" />
                  </a>
                </div>
              </div>

              {/* Logo Card */}
              <div className="flex w-full md:w-80 h-44 items-center justify-center rounded-2xl border border-line bg-gradient-to-br from-mist to-white p-6 shadow-sm">
                {Boolean(titleSponsor.logo) ? (
                  <Image
                    src={titleSponsor.logo}
                    alt={titleSponsor.name}
                    width={240}
                    height={100}
                    className="max-h-24 w-auto object-contain"
                  />
                ) : (
                  <span className="font-display text-2xl font-bold text-navy text-center">
                    {titleSponsor.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ASSOCIATE & TEAM SPONSORS GRID */}
        {partners.length > 0 && (
        <div className="rounded-2xl border border-line bg-paper p-6 sm:p-10 shadow-sm">
          <div className="border-b border-line pb-6">
            <h2 className="text-2xl font-bold text-navy">Associate &amp; Team Partners</h2>
            <p className="mt-1 text-sm text-ink-muted">
              Distinguished silver jewellery enterprises sponsoring teams, kits, and match initiatives.
            </p>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {partners.map((p, idx) => (
              <div
                key={idx}
                className="group flex flex-col justify-between rounded-xl border border-line bg-mist/40 p-5 transition-all hover:border-royal/40 hover:bg-white hover:shadow-sm"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-royal">
                    {tierLabel[p.tier]}
                  </span>
                  <h3 className="mt-2 text-base font-bold text-navy group-hover:text-royal transition-colors">
                    {p.name}
                  </h3>
                  
                </div>
                <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-[11px] text-ink-muted">
                  <span>NSPL Season 2</span>
                  <Sparkles className="size-3 text-silver-dim group-hover:text-royal transition-colors" />
                </div>
              </div>
            ))}
          </div>
        </div>
        )}

        {/* WHY SPONSOR NSPL (METRICS & VALUE) */}
        <div className="rounded-2xl border border-line bg-paper p-6 sm:p-10 shadow-sm">
          <h2 className="text-2xl font-bold text-navy text-center">Why Sponsor NSPL?</h2>
          <p className="mt-1 text-sm text-ink-muted text-center max-w-xl mx-auto">
            Directly connect your brand with active decision-makers in India&rsquo;s booming silver jewellery market.
          </p>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-line bg-mist/30 p-6 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-royal/10 text-royal mb-4">
                <Eye className="size-6" />
              </div>
              <span className="type-stat text-navy">5,000+</span>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-silver-dim">Fraternity Reach</p>
              <p className="mt-2 text-xs text-ink-muted">Proprietors, directors, and top buyers across major Indian jewellery hubs.</p>
            </div>

            <div className="rounded-xl border border-line bg-mist/30 p-6 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-royal/10 text-royal mb-4">
                <Tv className="size-6" />
              </div>
              <span className="type-stat text-navy">500K+</span>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-silver-dim">Digital Broadcast Views</p>
              <p className="mt-2 text-xs text-ink-muted">High-definition multi-camera live YouTube streams and highlight reels.</p>
            </div>

            <div className="rounded-xl border border-line bg-mist/30 p-6 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-royal/10 text-royal mb-4">
                <TrendingUp className="size-6" />
              </div>
              <span className="type-stat text-navy">100%</span>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-silver-dim">B2B Silver Focus</p>
              <p className="mt-2 text-xs text-ink-muted">Zero wasted marketing spend; every viewer is involved in the jewellery fraternity.</p>
            </div>

            <div className="rounded-xl border border-line bg-mist/30 p-6 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-royal/10 text-royal mb-4">
                <Award className="size-6" />
              </div>
              <span className="type-stat text-navy">16+</span>
              <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-silver-dim">Franchise Teams</p>
              <p className="mt-2 text-xs text-ink-muted">Custom branded kits, stadium boundary naming, and high-impact auction visibility.</p>
            </div>
          </div>
        </div>

        {/* BECOME A SPONSOR ENQUIRY FORM (Lead Source per Blueprint Page 6) */}
        <div id="enquire" className="rounded-2xl border border-line bg-paper p-6 sm:p-10 shadow-sm scroll-mt-20">
          <div className="max-w-2xl">
            <span className="eyebrow text-royal">Partner With Us</span>
            <h2 className="text-2xl font-bold text-navy sm:text-3xl mt-1">Become a Sponsor for Season 2</h2>
            <p className="mt-2 text-sm text-ink-muted">
              Fill in your details below and the form will open in your email app, ready to send to the sponsorship committee.
            </p>
          </div>

          {submitted ? (
            <div className="mt-8 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center animate-in fade-in duration-300">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <CheckCircle2 className="size-8" />
              </div>
              <h3 className="mt-4 text-xl font-bold text-navy">Almost there</h3>
              <p className="mt-2 text-sm text-ink-muted max-w-md mx-auto">
                Your email app should have opened with your enquiry ready to go. Press send there to deliver it. Nothing is sent until you do.
              </p>
              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <Button variant="outlineLight" size="sm" onClick={() => setSubmitted(false)}>
                  Submit Another Inquiry
                </Button>
              </div>
            </div>
          ) : !contactEmail ? (
            <p className="mt-8 rounded-xl border border-line bg-mist/60 p-6 text-sm text-ink-muted">
              The sponsorship enquiry form opens once the forum&rsquo;s contact email is confirmed. Please check back soon.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-8 space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-2">
                    Contact Person Name <span className="text-live">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ritesh Doshi"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-xl border border-line bg-mist/30 px-4 py-3 text-sm text-navy focus:border-royal focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-2">
                    Firm / Enterprise Name <span className="text-live">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Richezza Royal Jewellers"
                    value={form.firm}
                    onChange={(e) => setForm({ ...form, firm: e.target.value })}
                    className="w-full rounded-xl border border-line bg-mist/30 px-4 py-3 text-sm text-navy focus:border-royal focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-2">
                    WhatsApp Mobile Number <span className="text-live">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="+91 98200 00000"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    className="w-full rounded-xl border border-line bg-mist/30 px-4 py-3 text-sm text-navy focus:border-royal focus:bg-white focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-2">
                    Official Email <span className="text-live">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="partner@jewelleryfirm.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-xl border border-line bg-mist/30 px-4 py-3 text-sm text-navy focus:border-royal focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-2">
                  Sponsorship Tier of Interest <span className="text-live">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[
                    { id: "associate", label: "Associate Partner" },
                    { id: "team", label: "Team Franchise Owner" },
                    { id: "official", label: "Official Partner" },
                    { id: "other", label: "Custom Partnership" },
                  ].map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setForm({ ...form, tier: t.id })}
                      className={`flex h-12 items-center justify-center rounded-xl border-2 px-3 text-xs font-bold transition-all ${
                        form.tier === t.id
                          ? "border-royal bg-royal text-white shadow-sm"
                          : "border-line bg-mist/40 text-navy hover:border-royal/50"
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-2">
                  Message or Brand Objectives
                </label>
                <textarea
                  rows={3}
                  placeholder="Tell us about your brand goals or preferred sponsorship arrangement..."
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  className="w-full rounded-xl border border-line bg-mist/30 px-4 py-3 text-sm text-navy focus:border-royal focus:bg-white focus:outline-none resize-none"
                />
              </div>

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <Button type="submit" variant="primary" size="lg">
                  <Send className="size-4" /> Open Enquiry in Email
                </Button>
              </div>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
