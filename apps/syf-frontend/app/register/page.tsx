"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Calendar,
  Share2,
  Download,
  ShieldCheck,
  Upload,
  User,
  Briefcase,
  Trophy,
  Shirt,
  AlertCircle,
  Clock,
  Sparkles,
} from "lucide-react"
import { site } from "@/site.config"
import { pub } from "@/lib/content"
import { formatInr } from "@/lib/format"
import { Button } from "@/components/ui/button"
import { SeamRings } from "@/components/brand/seam-rings"

type Step = 1 | 2 | 3 | 4 | 5

interface FormData {
  // Step 1: About You & Your Firm
  fullName: string
  phone: string
  email: string
  dob: string
  city: string
  photo: string | null
  firmName: string
  firmRole: string
  proofFile: string | null

  // Step 2: Cricket Profile
  playingRole: "Batter" | "Bowler" | "All-rounder" | "Wicket-keeper"
  battingHand: "Right" | "Left"
  bowlingStyle: string
  playedNsplBefore: "Yes" | "No"
  highlights: string

  // Step 3: Kit, Safety & Consent
  jerseySize: "S" | "M" | "L" | "XL" | "XXL"
  nameOnJersey: string
  preferredNumber: string
  emergencyName: string
  emergencyPhone: string
  consentRules: boolean
  consentMedia: boolean
  consentUpdates: boolean
}

const INITIAL_DATA: FormData = {
  fullName: "",
  phone: "",
  email: "",
  dob: "",
  city: "Mumbai",
  photo: null,
  firmName: "",
  firmRole: "Partner",
  proofFile: null,

  playingRole: "All-rounder",
  battingHand: "Right",
  bowlingStyle: "Right-arm medium",
  playedNsplBefore: "No",
  highlights: "",

  jerseySize: "L",
  nameOnJersey: "",
  preferredNumber: "07",
  emergencyName: "",
  emergencyPhone: "",
  consentRules: false,
  consentMedia: false,
  consentUpdates: true,
}

const REGISTRATION_FEE = 2000

export default function RegisterPage() {
  const [step, setStep] = useState<Step>(1)
  const [data, setData] = useState<FormData>(INITIAL_DATA)
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi")
  const [isProcessingPay, setIsProcessingPay] = useState(false)
  const [registrationId, setRegistrationId] = useState<string>("NSPL-S2-0042")
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateStep = (currentStep: Step): boolean => {
    const errs: Record<string, string> = {}

    if (currentStep === 1) {
      if (!data.fullName.trim()) errs.fullName = "Full name is required"
      if (!data.phone.trim() || data.phone.length < 10) errs.phone = "Valid 10-digit mobile number required"
      if (!data.email.trim() || !data.email.includes("@")) errs.email = "Valid email address required"
      if (!data.dob) errs.dob = "Date of birth is required"
      if (!data.city.trim()) errs.city = "City is required"
      if (!data.firmName.trim()) errs.firmName = "Firm / company name is required"
      if (!data.firmRole.trim()) errs.firmRole = "Your role in firm is required"
    } else if (currentStep === 2) {
      if (!data.playingRole) errs.playingRole = "Please select playing role"
      if (!data.battingHand) errs.battingHand = "Please select batting hand"
    } else if (currentStep === 3) {
      if (!data.jerseySize) errs.jerseySize = "Please select jersey size"
      if (!data.nameOnJersey.trim()) errs.nameOnJersey = "Name on jersey is required"
      if (!data.emergencyName.trim()) errs.emergencyName = "Emergency contact name is required"
      if (!data.emergencyPhone.trim() || data.emergencyPhone.length < 10)
        errs.emergencyPhone = "Emergency contact phone is required"
      if (!data.consentRules) errs.consentRules = "You must accept tournament rules & refund policy"
      if (!data.consentMedia) errs.consentMedia = "Photo & auction media consent is required"
    }

    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => Math.min(prev + 1, 4) as Step)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1) as Step)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const url = URL.createObjectURL(file)
      setData({ ...data, photo: url })
    }
  }

  const handleCompletePayment = () => {
    setIsProcessingPay(true)
    setTimeout(() => {
      const randomNum = Math.floor(1000 + Math.random() * 9000)
      setRegistrationId(`NSPL-S2-${randomNum}`)
      setIsProcessingPay(false)
      setStep(5)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }, 1200)
  }

  const handleDownloadReceipt = () => {
    const content = `
========================================
SILVER YOUTH FORUM - NSPL SEASON 2
OFFICIAL PLAYER REGISTRATION RECEIPT
========================================
Registration ID : ${registrationId}
Player Name     : ${data.fullName}
Firm / Company  : ${data.firmName} (${data.firmRole})
Mobile (WhatsApp): ${data.phone}
Email           : ${data.email}
Cricket Role    : ${data.playingRole} (${data.battingHand} hand)
Bowling Style   : ${data.bowlingStyle}
Jersey Details  : Size ${data.jerseySize} | Print: "${data.nameOnJersey}" | #${data.preferredNumber}
Emergency Contact: ${data.emergencyName} (${data.emergencyPhone})

Amount Paid     : ₹${REGISTRATION_FEE.toLocaleString("en-IN")}
Status          : CONFIRMED & PAID
Gateway Ref     : CF-TXN-${Date.now()}
Date            : ${new Date().toLocaleDateString("en-IN")}
========================================
Thank you for joining the National Silver Premier League.
Keep this receipt for player card verification and kit pickup.
`
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `NSPL-Receipt-${registrationId}.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🏏 I have registered for NSPL Season 2 (Registration ID: ${registrationId})! See you on the pitch with Silver Youth Forum.`,
    )
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  return (
    <div className="min-h-screen bg-mist text-navy">
      {/* Header Banner */}
      <section className="on-navy relative isolate overflow-hidden bg-navy pb-16 pt-32 text-silver-bright lg:pb-20 lg:pt-40">
        <SeamRings className="pointer-events-none absolute -right-36 top-1/2 -translate-y-1/2 size-[38rem] text-silver opacity-[0.09]" />
        <div className="container-site relative">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-silver-dim transition-colors hover:text-silver-bright mb-6"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="eyebrow text-silver">NSPL &middot; Season 2</p>
              <h1 className="type-display-l mt-2 text-white">Player Registration</h1>
              <p className="mt-2 text-sm text-silver max-w-xl">
                February 2027 &middot; Title Sponsor: Silver Show of India (SSI) &middot; Online player pool sign-up
              </p>
            </div>
            {step < 5 && (
              <div className="rounded-xl border border-royal/30 bg-navy-raised/80 px-4 py-3 text-right">
                <span className="block text-xs uppercase tracking-wider text-silver-dim">Entry Fee</span>
                <span className="text-xl font-bold text-white">{formatInr(REGISTRATION_FEE)}</span>
                <span className="block text-[11px] text-emerald-400">All-inclusive</span>
              </div>
            )}
          </div>

          {/* Stepper Progress Bar (for Steps 1-4) */}
          {step < 5 && (
            <div className="mt-8 border-t border-navy-line pt-6">
              <div className="grid grid-cols-4 gap-2 sm:gap-4">
                {[
                  { num: 1, label: "You & Firm" },
                  { num: 2, label: "Cricket Profile" },
                  { num: 3, label: "Kit & Safety" },
                  { num: 4, label: "Review & Pay" },
                ].map((s) => (
                  <div key={s.num} className="flex flex-col gap-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-colors ${
                        step >= s.num ? "bg-royal" : "bg-navy-line"
                      }`}
                    />
                    <span
                      className={`text-[11px] font-semibold tracking-wider uppercase sm:text-xs ${
                        step === s.num ? "text-white" : step > s.num ? "text-silver" : "text-silver-dim/60"
                      }`}
                    >
                      Step {s.num}: <span className="hidden sm:inline">{s.label}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Container */}
      <section className="container-site -mt-6 pb-24 relative z-10">
        <div className="mx-auto max-w-3xl rounded-2xl border border-line bg-paper p-6 sm:p-10 shadow-sm">
          
          {/* STEP 1: ABOUT YOU & FIRM */}
          {step === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-navy">Step 1: About You &amp; Your Firm</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Personal identity details and confirmation of your connection to the silver jewellery fraternity.
                </p>
              </div>

              {/* Photo Upload for Auction Player Card */}
              <div className="rounded-xl border border-line bg-mist/40 p-4 sm:p-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-2">
                  Player Headshot (Front-facing, Plain Background) <span className="text-live">*</span>
                </label>
                <p className="text-xs text-ink-muted mb-4">
                  Required for your official NSPL player auction card and broadcast graphics.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative flex size-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-silver-dim bg-white shadow-inner">
                    {data.photo ? (
                      <Image
                        src={data.photo}
                        alt="Player preview"
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    ) : (
                      <User className="size-10 text-silver-dim" />
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg bg-royal px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-royal-hover">
                      <Upload className="size-4" />
                      Choose Photo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="mt-2 text-[11px] text-silver-dim">JPG or PNG &middot; Max 5MB &middot; Crisp face lighting</p>
                  </div>
                </div>
              </div>

              {/* Personal Fields */}
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                    Full Name <span className="text-live">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Suraj Mehta"
                    value={data.fullName}
                    onChange={(e) => {
                      setData({
                        ...data,
                        fullName: e.target.value,
                        nameOnJersey: data.nameOnJersey || e.target.value.split(" ")[0].toUpperCase(),
                      })
                      if (errors.fullName) setErrors({ ...errors, fullName: "" })
                    }}
                    className="w-full rounded-xl border border-line bg-mist/30 px-4 py-3 text-sm text-navy placeholder:text-silver-dim focus:border-royal focus:bg-white focus:outline-none"
                  />
                  {errors.fullName && <p className="mt-1 text-xs text-live">{errors.fullName}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                    WhatsApp Number <span className="text-live">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="9820012345"
                    value={data.phone}
                    onChange={(e) => {
                      setData({ ...data, phone: e.target.value })
                      if (errors.phone) setErrors({ ...errors, phone: "" })
                    }}
                    className="w-full rounded-xl border border-line bg-mist/30 px-4 py-3 text-sm text-navy placeholder:text-silver-dim focus:border-royal focus:bg-white focus:outline-none"
                  />
                  {errors.phone && <p className="mt-1 text-xs text-live">{errors.phone}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                    Email Address <span className="text-live">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="suraj@example.com"
                    value={data.email}
                    onChange={(e) => {
                      setData({ ...data, email: e.target.value })
                      if (errors.email) setErrors({ ...errors, email: "" })
                    }}
                    className="w-full rounded-xl border border-line bg-mist/30 px-4 py-3 text-sm text-navy placeholder:text-silver-dim focus:border-royal focus:bg-white focus:outline-none"
                  />
                  {errors.email && <p className="mt-1 text-xs text-live">{errors.email}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                    Date of Birth <span className="text-live">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={data.dob}
                    onChange={(e) => {
                      setData({ ...data, dob: e.target.value })
                      if (errors.dob) setErrors({ ...errors, dob: "" })
                    }}
                    className="w-full rounded-xl border border-line bg-mist/30 px-4 py-3 text-sm text-navy focus:border-royal focus:bg-white focus:outline-none"
                  />
                  {errors.dob && <p className="mt-1 text-xs text-live">{errors.dob}</p>}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                    City <span className="text-live">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai, Surat, Rajkot"
                    value={data.city}
                    onChange={(e) => {
                      setData({ ...data, city: e.target.value })
                      if (errors.city) setErrors({ ...errors, city: "" })
                    }}
                    className="w-full rounded-xl border border-line bg-mist/30 px-4 py-3 text-sm text-navy focus:border-royal focus:bg-white focus:outline-none"
                  />
                  {errors.city && <p className="mt-1 text-xs text-live">{errors.city}</p>}
                </div>
              </div>

              {/* Fraternity Affiliation Fields */}
              <div className="border-t border-line pt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase className="size-4 text-royal" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-navy">
                    Silver Industry Association
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                      Firm / Company Name <span className="text-live">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. RS Bullion / Silbells"
                      value={data.firmName}
                      onChange={(e) => {
                        setData({ ...data, firmName: e.target.value })
                        if (errors.firmName) setErrors({ ...errors, firmName: "" })
                      }}
                      className="w-full rounded-xl border border-line bg-mist/30 px-4 py-3 text-sm text-navy focus:border-royal focus:bg-white focus:outline-none"
                    />
                    {errors.firmName && <p className="mt-1 text-xs text-live">{errors.firmName}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                      Your Role in Firm <span className="text-live">*</span>
                    </label>
                    <select
                      value={data.firmRole}
                      onChange={(e) => setData({ ...data, firmRole: e.target.value })}
                      className="w-full rounded-xl border border-line bg-mist/30 px-4 py-3 text-sm text-navy focus:border-royal focus:bg-white focus:outline-none"
                    >
                      <option value="Partner">Partner</option>
                      <option value="Director">Director / Promoter</option>
                      <option value="Proprietor">Proprietor</option>
                      <option value="Family Member">Family Member</option>
                      <option value="Executive Employee">Executive / Key Employee</option>
                    </select>
                  </div>
                </div>

                <p className="mt-3 text-xs text-silver-dim">
                  * Note: Deliberately left out: Aadhaar and PAN cards are not collected, keeping player privacy protected under DPDP standards.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex justify-end border-t border-line pt-6">
                <Button variant="primary" size="lg" onClick={handleNext}>
                  Continue to Cricket Profile <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 2: CRICKET PROFILE (matching PDF Page 8 screenshot!) */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-navy">Step 2: Cricket Profile</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Used by franchise owners during the NSPL Season 2 auction to build balanced squads.
                </p>
              </div>

              {/* Playing Role (Big Tap Targets) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-3">
                  Playing Role <span className="text-live">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {(["Batter", "Bowler", "All-rounder", "Wicket-keeper"] as const).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setData({ ...data, playingRole: role })}
                      className={`flex h-14 items-center justify-center rounded-xl border-2 px-3 text-sm font-semibold transition-all ${
                        data.playingRole === role
                          ? "border-royal bg-royal text-white shadow-sm"
                          : "border-line bg-mist/50 text-navy hover:border-royal/50"
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Batting Hand (Big Tap Targets) */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-3">
                  Batting Hand <span className="text-live">*</span>
                </label>
                <div className="grid grid-cols-2 gap-3 sm:w-72">
                  {(["Right", "Left"] as const).map((hand) => (
                    <button
                      key={hand}
                      type="button"
                      onClick={() => setData({ ...data, battingHand: hand })}
                      className={`flex h-12 items-center justify-center rounded-xl border-2 px-4 text-sm font-semibold transition-all ${
                        data.battingHand === hand
                          ? "border-navy bg-navy text-silver-bright shadow-sm"
                          : "border-line bg-mist/50 text-navy hover:border-navy/50"
                      }`}
                    >
                      {hand}-hand
                    </button>
                  ))}
                </div>
              </div>

              {/* Bowling Style Dropdown */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-2">
                  Bowling Style <span className="text-live">*</span>
                </label>
                <select
                  value={data.bowlingStyle}
                  onChange={(e) => setData({ ...data, bowlingStyle: e.target.value })}
                  className="w-full sm:max-w-md rounded-xl border border-line bg-mist/30 px-4 py-3 text-sm text-navy focus:border-royal focus:bg-white focus:outline-none"
                >
                  <option value="Right-arm fast">Right-arm fast</option>
                  <option value="Right-arm medium">Right-arm medium</option>
                  <option value="Left-arm fast">Left-arm fast</option>
                  <option value="Left-arm medium">Left-arm medium</option>
                  <option value="Right-arm off spin">Right-arm off spin</option>
                  <option value="Right-arm leg spin">Right-arm leg spin</option>
                  <option value="Left-arm orthodox">Left-arm orthodox</option>
                  <option value="Does not bowl">Does not bowl / Keeper</option>
                </select>
              </div>

              {/* Played NSPL Before */}
              <div className="border-t border-line pt-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-3">
                  Played NSPL Before?
                </label>
                <div className="grid grid-cols-2 gap-3 sm:w-48">
                  {(["Yes", "No"] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setData({ ...data, playedNsplBefore: opt })}
                      className={`flex h-11 items-center justify-center rounded-xl border-2 px-4 text-sm font-semibold transition-all ${
                        data.playedNsplBefore === opt
                          ? "border-royal bg-royal text-white shadow-sm"
                          : "border-line bg-mist/50 text-navy hover:border-royal/50"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Highlights & Notes */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-navy mb-1.5">
                  Cricket Highlights &amp; Experience (Optional)
                </label>
                <textarea
                  rows={3}
                  placeholder="e.g. 52 off 28 balls in local league, best bowling figures 4/18, previous team..."
                  value={data.highlights}
                  onChange={(e) => setData({ ...data, highlights: e.target.value })}
                  className="w-full rounded-xl border border-line bg-mist/30 px-4 py-3 text-sm text-navy placeholder:text-silver-dim focus:border-royal focus:bg-white focus:outline-none resize-none"
                />
              </div>

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
                <Button variant="outlineLight" size="md" onClick={handleBack}>
                  <ArrowLeft className="size-4" /> Back
                </Button>
                <Button variant="primary" size="lg" onClick={handleNext}>
                  Continue to Kit &amp; Consent <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: KIT, SAFETY & CONSENT */}
          {step === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-navy">Step 3: Kit Details, Safety &amp; Consent</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Jersey customisation, emergency logistics, and regulatory agreement.
                </p>
              </div>

              {/* Jersey Customisation */}
              <div className="rounded-xl border border-line bg-mist/40 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Shirt className="size-4 text-royal" />
                  <h3 className="text-sm font-bold uppercase tracking-wider text-navy">Playing Kit Customisation</h3>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-navy mb-2">
                    Jersey Size (Standard Indian Fit) <span className="text-live">*</span>
                  </label>
                  <div className="flex flex-wrap gap-2.5">
                    {(["S", "M", "L", "XL", "XXL"] as const).map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setData({ ...data, jerseySize: sz })}
                        className={`flex size-12 items-center justify-center rounded-xl border-2 text-sm font-bold transition-all ${
                          data.jerseySize === sz
                            ? "border-royal bg-royal text-white shadow-sm"
                            : "border-line bg-white text-navy hover:border-royal/50"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1.5">
                      Name on Jersey Back <span className="text-live">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. S. MEHTA"
                      value={data.nameOnJersey}
                      onChange={(e) => {
                        setData({ ...data, nameOnJersey: e.target.value.toUpperCase() })
                        if (errors.nameOnJersey) setErrors({ ...errors, nameOnJersey: "" })
                      }}
                      className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm uppercase text-navy focus:border-royal focus:outline-none"
                    />
                    {errors.nameOnJersey && <p className="mt-1 text-xs text-live">{errors.nameOnJersey}</p>}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1.5">
                      Preferred Jersey Number (0-99)
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      placeholder="07"
                      value={data.preferredNumber}
                      onChange={(e) => setData({ ...data, preferredNumber: e.target.value.replace(/\D/g, "") })}
                      className="w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-navy focus:border-royal focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Safety Contact */}
              <div className="border-t border-line pt-6">
                <h3 className="text-sm font-bold uppercase tracking-wider text-navy mb-3">
                  Safety &amp; Emergency Contact
                </h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1.5">
                      Contact Person Name <span className="text-live">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Ramesh Mehta (Father / Brother)"
                      value={data.emergencyName}
                      onChange={(e) => {
                        setData({ ...data, emergencyName: e.target.value })
                        if (errors.emergencyName) setErrors({ ...errors, emergencyName: "" })
                      }}
                      className="w-full rounded-xl border border-line bg-mist/30 px-4 py-3 text-sm text-navy focus:border-royal focus:bg-white focus:outline-none"
                    />
                    {errors.emergencyName && <p className="mt-1 text-xs text-live">{errors.emergencyName}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-navy mb-1.5">
                      Contact Mobile Number <span className="text-live">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="9820000000"
                      value={data.emergencyPhone}
                      onChange={(e) => {
                        setData({ ...data, emergencyPhone: e.target.value })
                        if (errors.emergencyPhone) setErrors({ ...errors, emergencyPhone: "" })
                      }}
                      className="w-full rounded-xl border border-line bg-mist/30 px-4 py-3 text-sm text-navy focus:border-royal focus:bg-white focus:outline-none"
                    />
                    {errors.emergencyPhone && <p className="mt-1 text-xs text-live">{errors.emergencyPhone}</p>}
                  </div>
                </div>
              </div>

              {/* Consent Checkboxes (DPDP Compliant - nothing pre-ticked) */}
              <div className="border-t border-line pt-6 space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-navy">
                  Declarations &amp; Permissions
                </h3>

                {/* Consent 1: Tournament rules & refund policy */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.consentRules}
                    onChange={(e) => {
                      setData({ ...data, consentRules: e.target.checked })
                      if (errors.consentRules) setErrors({ ...errors, consentRules: "" })
                    }}
                    className="mt-1 size-4 rounded border-line text-royal focus:ring-royal"
                  />
                  <span className="text-xs text-ink-muted leading-relaxed">
                    I accept the tournament rules, eligibility guidelines, and the{" "}
                    <Link href="/refund-policy" target="_blank" className="text-royal underline font-medium">
                      Refund &amp; Cancellation Policy
                    </Link>. I understand the committee&rsquo;s decision is final. <span className="text-live">*</span>
                  </span>
                </label>
                {errors.consentRules && <p className="text-xs text-live pl-7">{errors.consentRules}</p>}

                {/* Consent 2: Photo and broadcast consent */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.consentMedia}
                    onChange={(e) => {
                      setData({ ...data, consentMedia: e.target.checked })
                      if (errors.consentMedia) setErrors({ ...errors, consentMedia: "" })
                    }}
                    className="mt-1 size-4 rounded border-line text-royal focus:ring-royal"
                  />
                  <span className="text-xs text-ink-muted leading-relaxed">
                    I agree to my name, cricket stats, and photo being displayed during the auction pool, tournament promotions, and live broadcasts. <span className="text-live">*</span>
                  </span>
                </label>
                {errors.consentMedia && <p className="text-xs text-live pl-7">{errors.consentMedia}</p>}

                {/* Consent 3: WhatsApp updates (Optional) */}
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={data.consentUpdates}
                    onChange={(e) => setData({ ...data, consentUpdates: e.target.checked })}
                    className="mt-1 size-4 rounded border-line text-royal focus:ring-royal"
                  />
                  <span className="text-xs text-ink-muted leading-relaxed">
                    Send me NSPL match schedules, auction dates, and squad announcements directly on WhatsApp. (Optional)
                  </span>
                </label>
              </div>

              {/* Navigation */}
              <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
                <Button variant="outlineLight" size="md" onClick={handleBack}>
                  <ArrowLeft className="size-4" /> Back
                </Button>
                <Button variant="primary" size="lg" onClick={handleNext}>
                  Review &amp; Pay <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: REVIEW & PAY (matching PDF Page 8 screenshot!) */}
          {step === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-navy">Review &amp; Pay</h2>
                <p className="mt-1 text-sm text-ink-muted">
                  Verify your registration summary and complete secure checkout.
                </p>
              </div>

              {/* Summary Card */}
              <div className="rounded-2xl border border-line bg-mist/40 p-6 space-y-4">
                <div className="flex items-center justify-between border-b border-line pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-navy">Player Profile</span>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-xs font-semibold text-royal hover:underline"
                  >
                    Edit Details
                  </button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-sm">
                  <div>
                    <span className="block text-xs text-silver-dim">Name</span>
                    <span className="font-semibold text-navy">{data.fullName || "Suraj Mehta"}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-silver-dim">Role &amp; Batting</span>
                    <span className="font-semibold text-navy">
                      {data.playingRole} &middot; {data.battingHand}-hand
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-silver-dim">Firm &amp; City</span>
                    <span className="font-semibold text-navy">
                      {data.firmName || "Silver Firm"} ({data.firmRole}) &middot; {data.city}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-silver-dim">Jersey</span>
                    <span className="font-semibold text-navy">
                      Size {data.jerseySize} &middot; &ldquo;{data.nameOnJersey}&rdquo; #{data.preferredNumber || "00"}
                    </span>
                  </div>
                  <div>
                    <span className="block text-xs text-silver-dim">Contact Phone</span>
                    <span className="font-semibold text-navy">+91 {data.phone}</span>
                  </div>
                  <div>
                    <span className="block text-xs text-silver-dim">Email</span>
                    <span className="font-semibold text-navy">{data.email}</span>
                  </div>
                </div>
              </div>

              {/* Payment Amount Card */}
              <div className="rounded-2xl border border-royal/30 bg-white p-6 shadow-sm">
                <div className="flex items-center justify-between border-b border-line pb-4">
                  <span className="text-sm font-semibold text-navy">NSPL Season 2 Registration Fee</span>
                  <span className="text-sm font-bold text-navy">{formatInr(REGISTRATION_FEE)}</span>
                </div>
                <div className="flex items-center justify-between pt-4">
                  <div>
                    <span className="text-base font-bold text-navy">Total Amount Payable</span>
                    <p className="text-xs text-silver-dim">Includes official tournament kit and match insurance</p>
                  </div>
                  <span className="text-2xl font-black text-royal">{formatInr(REGISTRATION_FEE)}</span>
                </div>

                {/* Gateway Methods Selector */}
                <div className="mt-6 border-t border-line pt-6">
                  <span className="block text-xs font-bold uppercase tracking-wider text-navy mb-3">
                    Select Payment Gateway Method
                  </span>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: "upi", label: "UPI / QR", desc: "GPay, PhonePe, Paytm" },
                      { id: "card", label: "Cards", desc: "Visa, Mastercard, RuPay" },
                      { id: "netbanking", label: "Net Banking", desc: "All Indian Banks" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => setPaymentMethod(m.id as any)}
                        className={`rounded-xl border-2 p-3 text-left transition-all ${
                          paymentMethod === m.id
                            ? "border-royal bg-royal/5 shadow-sm"
                            : "border-line bg-white hover:border-royal/40"
                        }`}
                      >
                        <span className="block text-xs font-bold text-navy">{m.label}</span>
                        <span className="block text-[10px] text-silver-dim">{m.desc}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Trust Badge */}
                <div className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-mist/60 py-2.5 text-xs text-silver-dim">
                  <ShieldCheck className="size-4 text-emerald-600" />
                  <span>Secured by RBI-authorised payment gateway &middot; SYF official account</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
                <Button variant="outlineLight" size="md" onClick={handleBack} disabled={isProcessingPay}>
                  <ArrowLeft className="size-4" /> Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleCompletePayment}
                  disabled={isProcessingPay}
                  className="px-8"
                >
                  {isProcessingPay ? (
                    <>
                      <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Authorizing Payment...
                    </>
                  ) : (
                    <>Pay {formatInr(REGISTRATION_FEE)} Securely</>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* STEP 5: CONFIRMATION (matching PDF Page 8 screenshot!) */}
          {step === 5 && (
            <div className="py-6 text-center animate-in fade-in duration-300">
              {/* Checkmark */}
              <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-md">
                <Check className="size-10 stroke-[2.5]" />
              </div>

              <h2 className="mt-5 text-3xl font-extrabold text-navy">You&rsquo;re Registered!</h2>
              <p className="mt-2 text-sm text-ink-muted">
                Welcome to the National Silver Premier League Season 2.
              </p>

              {/* Registration ID Pill */}
              <div className="mx-auto mt-6 inline-block rounded-2xl border-2 border-royal/30 bg-royal/5 px-6 py-4">
                <span className="block text-xs font-bold uppercase tracking-widest text-silver-dim">
                  Registration ID
                </span>
                <span className="font-mono text-2xl font-black text-royal tracking-wider">
                  {registrationId}
                </span>
              </div>

              <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-silver-dim">
                Receipt and registration details have been dispatched to your email (<strong>{data.email}</strong>) and WhatsApp. The player auction date will be announced shortly.
              </p>

              {/* Action Buttons (matching PDF Page 8: Download receipt, Share on WhatsApp, Add NSPL to calendar) */}
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Button variant="primary" size="md" onClick={handleDownloadReceipt}>
                  <Download className="size-4" />
                  Download Receipt
                </Button>

                <Button variant="outlineLight" size="md" onClick={handleShareWhatsApp}>
                  <Share2 className="size-4" />
                  Share on WhatsApp
                </Button>

                <Button asChild variant="outlineLight" size="md">
                  <a href="/calendar/nspl-s2.ics?target=season_start">
                    <Calendar className="size-4" />
                    Add NSPL to Calendar
                  </a>
                </Button>
              </div>

              {/* Back to Home Link */}
              <div className="mt-10 border-t border-line pt-6">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-navy hover:text-royal"
                >
                  <ArrowLeft className="size-4" /> Return to Homepage
                </Link>
              </div>
            </div>
          )}

        </div>
      </section>
    </div>
  )
}
