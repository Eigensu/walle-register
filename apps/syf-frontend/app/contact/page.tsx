"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Mail,
  Phone,
  MessageCircle,
  MapPin,
  Send,
  CheckCircle2,
  Instagram,
  Youtube,
  ArrowRight,
  Clock,
  Sparkles,
} from "lucide-react"
import { site } from "@/site.config"
import { pub } from "@/lib/content"
import { Button } from "@/components/ui/button"
import { SeamRings } from "@/components/brand/seam-rings"

type FormState = {
  name: string
  email: string
  phone: string
  subject: string
  message: string
}

export default function ContactPage() {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    phone: "",
    subject: "nspl",
    message: "",
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const emailVal = pub(site.contact.email) || "contact@silveryouthforum.in"
  const phoneVal = pub(site.contact.phone) || "+91 98200 12345"
  const whatsappRaw = pub(site.contact.whatsapp) || "919820012345"
  const addressVal = pub(site.contact.address) || "Silver Youth Forum Secretariat, Zaveri Bazaar, Mumbai, Maharashtra 400002"

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setTimeout(() => {
      setSubmitting(false)
      setSubmitted(true)
    }, 800)
  }

  return (
    <div className="min-h-screen bg-mist text-navy">
      {/* Hero Header */}
      <section className="on-navy relative isolate overflow-hidden bg-navy pb-16 pt-32 text-silver-bright lg:pb-24 lg:pt-40">
        <SeamRings className="pointer-events-none absolute -right-36 top-1/2 -translate-y-1/2 size-[40rem] text-silver opacity-[0.09]" />
        <div className="container-site relative">
          <p className="eyebrow text-silver">Get In Touch</p>
          <h1 className="type-display-l mt-3 text-white">
            Connect with the <span className="silver-text italic">Silver Fraternity</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-silver lg:text-lg">
            Whether you have questions about NSPL Season 2 player registration, sponsorship opportunities, or upcoming industry conclaves, the Silver Youth Forum committee is here to assist.
          </p>
        </div>
      </section>

      {/* Main Grid: Direct Channels & Enquiry Form */}
      <section className="container-site -mt-8 pb-20 relative z-10">
        <div className="grid gap-8 lg:grid-cols-12">
          
          {/* Left Column: Direct Contact Channels */}
          <div className="space-y-6 lg:col-span-5">
            {/* Direct Cards */}
            <div className="rounded-2xl border border-line bg-paper p-6 sm:p-8 shadow-sm">
              <h2 className="text-xl font-bold text-navy">Direct Channels</h2>
              <p className="mt-1 text-sm text-ink-muted">Quickest ways to reach our desk during office hours.</p>

              <div className="mt-6 space-y-5">
                {/* WhatsApp */}
                <a
                  href={`https://wa.me/${whatsappRaw.replace(/\D/g, "")}?text=Hello%20Silver%20Youth%20Forum,%20I%20have%20an%20enquiry%20regarding%20NSPL%20Season%202`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-4 rounded-xl border border-line bg-mist/60 p-4 transition-all hover:border-emerald-500/40 hover:bg-emerald-500/5"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm transition-transform group-hover:scale-105">
                    <MessageCircle className="size-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-navy">WhatsApp Helpline</span>
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-emerald-800">
                        Fastest
                      </span>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-muted">Chat directly with the organizing desk</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                      Open WhatsApp <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </a>

                {/* Email */}
                <a
                  href={`mailto:${emailVal}`}
                  className="group flex items-start gap-4 rounded-xl border border-line bg-mist/60 p-4 transition-all hover:border-royal/40 hover:bg-royal/5"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-royal text-white shadow-sm transition-transform group-hover:scale-105">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-navy">Official Email</span>
                    <p className="mt-0.5 text-xs text-ink-muted">{emailVal}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-royal">
                      Send Email <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </a>

                {/* Phone */}
                <a
                  href={`tel:${phoneVal.replace(/\s/g, "")}`}
                  className="group flex items-start gap-4 rounded-xl border border-line bg-mist/60 p-4 transition-all hover:border-navy/40 hover:bg-navy/5"
                >
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-navy text-silver-bright shadow-sm transition-transform group-hover:scale-105">
                    <Phone className="size-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-navy">Phone Support</span>
                    <p className="mt-0.5 text-xs text-ink-muted">{phoneVal}</p>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-navy">
                      Call Committee <ArrowRight className="size-3 transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </a>

                {/* Address */}
                <div className="flex items-start gap-4 rounded-xl border border-line bg-mist/40 p-4">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-silver-dim/20 text-navy">
                    <MapPin className="size-5" />
                  </div>
                  <div>
                    <span className="font-semibold text-navy">Office Address</span>
                    <p className="mt-0.5 text-xs text-ink-muted leading-relaxed">{addressVal}</p>
                  </div>
                </div>
              </div>

              {/* Working Hours & Socials */}
              <div className="mt-6 border-t border-line pt-6">
                <div className="flex items-center gap-2 text-xs text-ink-muted">
                  <Clock className="size-4 text-royal shrink-0" />
                  <span>Support Hours: Mon &ndash; Sat, 10:00 AM &ndash; 7:00 PM IST</span>
                </div>
                <div className="mt-4 flex items-center gap-3">
                  <span className="text-xs font-semibold text-silver-dim uppercase tracking-wider">Social:</span>
                  <a
                    href="https://instagram.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-8 items-center justify-center rounded-lg border border-line bg-mist text-navy transition-colors hover:border-royal hover:text-royal"
                    aria-label="Instagram"
                  >
                    <Instagram className="size-4" />
                  </a>
                  <a
                    href="https://youtube.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-8 items-center justify-center rounded-lg border border-line bg-mist text-navy transition-colors hover:border-live hover:text-live"
                    aria-label="YouTube"
                  >
                    <Youtube className="size-4" />
                  </a>
                </div>
              </div>
            </div>

            {/* Quick Link to Player Registration */}
            <div className="rounded-2xl border border-royal/30 bg-gradient-to-br from-navy to-navy-raised p-6 text-white shadow-sm">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-silver">
                <Sparkles className="size-4 text-royal" />
                Player Registration
              </div>
              <h3 className="mt-2 text-lg font-bold">Looking to play in NSPL Season 2?</h3>
              <p className="mt-2 text-xs leading-relaxed text-silver">
                Register as a player online in 3 quick steps: profile, cricket details, and instant gateway confirmation.
              </p>
              <div className="mt-4">
                <Button asChild variant="primary" size="sm">
                  <Link href="/register">
                    Register as a Player <ArrowRight className="size-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right Column: Enquiry Form */}
          <div className="lg:col-span-7">
            <div className="rounded-2xl border border-line bg-paper p-6 sm:p-10 shadow-sm">
              <h2 className="text-2xl font-bold text-navy">Send an Enquiry</h2>
              <p className="mt-1 text-sm text-ink-muted">
                Fill out the form below and an SYF committee representative will respond within 24 hours.
              </p>

              {submitted ? (
                <div className="mt-8 rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center animate-in fade-in duration-300">
                  <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                    <CheckCircle2 className="size-8" />
                  </div>
                  <h3 className="mt-4 text-xl font-bold text-navy">Thank You for Reaching Out!</h3>
                  <p className="mt-2 text-sm text-ink-muted max-w-md mx-auto">
                    Your enquiry regarding <strong>{form.subject.toUpperCase()}</strong> has been delivered to the committee. We will contact you via WhatsApp or email shortly.
                  </p>
                  <div className="mt-6">
                    <Button
                      variant="outlineLight"
                      size="sm"
                      onClick={() => {
                        setSubmitted(false)
                        setForm({ name: "", email: "", phone: "", subject: "nspl", message: "" })
                      }}
                    >
                      Send Another Message
                    </Button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-navy mb-2">
                      Full Name <span className="text-live">*</span>
                    </label>
                    <input
                      id="name"
                      type="text"
                      required
                      placeholder="e.g. Jayesh Rathod"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full rounded-xl border border-line bg-mist/30 px-4 py-3 text-sm text-navy placeholder:text-silver-dim focus:border-royal focus:bg-white focus:outline-none"
                    />
                  </div>

                  {/* Two column: Phone & Email */}
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="phone" className="block text-xs font-bold uppercase tracking-wider text-navy mb-2">
                        WhatsApp Number <span className="text-live">*</span>
                      </label>
                      <input
                        id="phone"
                        type="tel"
                        required
                        placeholder="+91 98000 00000"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        className="w-full rounded-xl border border-line bg-mist/30 px-4 py-3 text-sm text-navy placeholder:text-silver-dim focus:border-royal focus:bg-white focus:outline-none"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-navy mb-2">
                        Email Address <span className="text-live">*</span>
                      </label>
                      <input
                        id="email"
                        type="email"
                        required
                        placeholder="jayesh@silbells.com"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full rounded-xl border border-line bg-mist/30 px-4 py-3 text-sm text-navy placeholder:text-silver-dim focus:border-royal focus:bg-white focus:outline-none"
                      />
                    </div>
                  </div>

                  {/* Subject Selection */}
                  <div>
                    <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-navy mb-2">
                      Topic / Enquiry Type <span className="text-live">*</span>
                    </label>
                    <select
                      id="subject"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full rounded-xl border border-line bg-mist/30 px-4 py-3 text-sm text-navy focus:border-royal focus:bg-white focus:outline-none"
                    >
                      <option value="nspl">NSPL Season 2 - Player Registration</option>
                      <option value="sponsorship">Sponsorship &amp; Team Ownership</option>
                      <option value="membership">Forum Membership &amp; Conclaves</option>
                      <option value="media">Media, Press &amp; Live Streaming</option>
                      <option value="other">General Inquiries</option>
                    </select>
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-navy mb-2">
                      Message <span className="text-live">*</span>
                    </label>
                    <textarea
                      id="message"
                      rows={4}
                      required
                      placeholder="Share your question or details here..."
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full rounded-xl border border-line bg-mist/30 px-4 py-3 text-sm text-navy placeholder:text-silver-dim focus:border-royal focus:bg-white focus:outline-none resize-none"
                    />
                  </div>

                  {/* Submit Button */}
                  <div>
                    <Button
                      type="submit"
                      variant="primary"
                      size="lg"
                      disabled={submitting}
                      className="w-full sm:w-auto"
                    >
                      {submitting ? (
                        <>
                          <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                          Sending Message...
                        </>
                      ) : (
                        <>
                          <Send className="size-4" />
                          Send Enquiry
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
