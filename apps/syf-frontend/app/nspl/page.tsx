"use client"

import { useState, useRef } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  ArrowRight,
  Trophy,
  Calendar,
  Award,
  ShieldCheck,
  Download,
  Play,
  ChevronDown,
  Sparkles,
  MapPin,
  Tv,
  X,
  RotateCcw,
} from "lucide-react"
import { formatInr } from "@/lib/format"
import { SeamRings } from "@/components/brand/seam-rings"
import { Button } from "@/components/ui/button"

// Green cricket pitch reference image (replace with "/photos/your_pitch.jpg" anytime)
const PITCH_BG_IMAGE = "/brand/cricket-pitch.svg"

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Register Online",
    desc: "Complete the 3-minute registration form with your player profile, silver firm affiliation, and kit preferences.",
  },
  {
    step: "02",
    title: "Player Pool",
    desc: "The SYF committee validates eligibility. Verified players enter the official NSPL Season 2 Auction Pool.",
  },
  {
    step: "03",
    title: "Franchise Auction",
    desc: "Franchise team owners bid in a live, high-stakes auction to form balanced 15-player squads.",
  },
  {
    step: "04",
    title: "League Matches",
    desc: "Teams clash in action-packed T20 fixtures under floodlights with official umpires and DRS reviews.",
  },
  {
    step: "05",
    title: "Grand Finale",
    desc: "Championship final followed by the prestigious handcrafted silver trophy and MVP award ceremony.",
  },
]

const TEAMS_PREVIEW = [
  { name: "Silbells Strikers", firm: "Silbells Jewellery", icon: "⚡" },
  { name: "SSI Titans", firm: "Silver Show of India", icon: "👑" },
  { name: "RS Bullion Blasters", firm: "RS Bullion", icon: "🔥" },
  { name: "Queens & Kings Royals", firm: "Queens & Kings", icon: "🦁" },
  { name: "Arihant Knights", firm: "Arihant 925 (AJPL)", icon: "⚔️" },
  { name: "Divine Super Kings", firm: "Divine Silver", icon: "🌟" },
  { name: "Richezza Stars", firm: "Richezza Royal 925", icon: "💎" },
  { name: "Tresorie Gladiators", firm: "Tresorie Silver", icon: "🛡️" },
]

const FAQS = [
  {
    q: "Who is eligible to register for NSPL Season 2?",
    a: "Participation is exclusively for members of the Indian silver jewellery fraternity. This includes proprietors, partners, directors, family members, and verified full-time employees of registered bullion, manufacturing, wholesale, and retail silver enterprises.",
  },
  {
    q: "What is the player registration fee and what does it cover?",
    a: "The registration fee is ₹2,000 all-inclusive. It covers tournament registration, official customized team jersey with printed name and number, matchday insurance, ground hospitality, and participation in the player auction pool.",
  },
  {
    q: "What happens if a player is not selected in the auction?",
    a: "Per committee tournament rules, players who are not picked during the live franchise auction are eligible for a refund according to our published Refund & Cancellation Policy, or may be drafted into the official reserve pool for injury replacements.",
  },
  {
    q: "What is the tournament format and rules?",
    a: "NSPL is played under standard T20 regulations using a white leather ball, white cricket clothing, and colored team jerseys. Full match rules and regulations are approved by the SYF Technical Committee and affiliated cricket associations.",
  },
  {
    q: "When and where will the matches be held?",
    a: "Matches are scheduled across February 2027 at a premier cricket stadium in Mumbai equipped with international-grade floodlights, turf pitches, and digital scoreboards.",
  },
]

export default function NsplPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0)
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [videoEnded, setVideoEnded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleDownloadRules = () => {
    const rulesText = `
============================================================
NATIONAL SILVER PREMIER LEAGUE (NSPL SEASON 2)
OFFICIAL TOURNAMENT RULES & CODE OF CONDUCT
Organised by Silver Youth Forum (SYF)
============================================================

1. ELIGIBILITY & VERIFICATION
- Players must be associated with a bona fide enterprise in the Indian Silver Jewellery Trade.
- Each registrant must complete online registration and fee settlement before the cutoff date.
- Impersonation or fraudulent company representation leads to lifetime tournament ban.

2. TOURNAMENT STRUCTURE
- Format: T20 overs per innings.
- Ball: High-grade tournament white leather ball.
- Powerplay: Overs 1-6 mandatory field restrictions.
- Bowling limit: Maximum 4 overs per bowler.
- Time Limit: 85 minutes per innings; strict over-rate penalties apply.

3. AUCTION & TEAM COMPOSITION
- 15 players per franchise squad (including 1 designated wicket-keeper and at least 4 frontline bowlers).
- Playing XI must be nominated at the coin toss.
- Super Sub & Impact Player rules as announced by the Technical Committee.

4. EQUIPMENT & DRESS CODE
- Custom NSPL player jerseys provided by SYF must be worn during all matches.
- Colored batting pads matching team kits are mandatory.
- White cricket trousers, spikes/rubber studs conforming to turf pitch standards.

5. CODE OF CONDUCT & DISCIPLINE
- Umpires' decisions on the field are final and binding.
- Zero tolerance for verbal abuse, umpire intimidation, or physical dissent.
- Level 1 & Level 2 offences carry match bans and team fine deductions.

For questions: contact@silveryouthforum.in
Organizing Desk: Silver Youth Forum, Mumbai
============================================================
`
    const blob = new Blob([rulesText], { type: "text/plain;charset=utf-8" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "NSPL-Season2-Official-Rules.txt"
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleReplayVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
      setVideoEnded(false)
    }
  }

  return (
    <div className="relative isolate min-h-screen text-silver-bright">
      {/* 1 & 3: FIXED FULLSCREEN BACKGROUND: Video -> Green Pitch onEnded */}
      <div className="fixed inset-0 z-0 w-full h-full overflow-hidden pointer-events-none select-none">
        {/* 2: Green Cricket Pitch Background (Shown after video ends) */}
        <div
          className="absolute inset-0 size-full bg-cover bg-center transition-opacity duration-1000"
          style={{ backgroundImage: `url(${PITCH_BG_IMAGE})` }}
        />

        {/* 1 & 2: Fullscreen Video (Constant background that fits whole screen) */}
        <video
          ref={videoRef}
          src="/videos/NSPL_page_BG_video.mp4"
          autoPlay
          muted
          playsInline
          preload="auto"
          onEnded={() => setVideoEnded(true)}
          className={`absolute inset-0 size-full object-cover object-center transition-opacity duration-1000 ${
            videoEnded ? "opacity-0" : "opacity-100"
          }`}
        />

        {/* Ambient subtle vignette for readable typography */}
        <div className="absolute inset-0 bg-gradient-to-b from-navy/35 via-transparent to-navy/55 pointer-events-none" />
      </div>

      <div className="relative z-10">
      {/* Floating Replay Video Button (When video ends) */}
      {videoEnded && (
        <button
          type="button"
          onClick={handleReplayVideo}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 rounded-full border border-white/20 bg-navy/80 px-4 py-2 text-xs font-semibold text-white shadow-lg backdrop-blur-md transition-all hover:bg-navy hover:scale-105"
        >
          <RotateCcw className="size-3.5 text-royal" /> Replay Video
        </button>
      )}

      {/* Hero Header */}
      <section className="relative isolate pt-32 pb-16 lg:pt-40 lg:pb-24">
        <SeamRings className="pointer-events-none absolute -right-36 top-1/2 -translate-y-1/2 size-[44rem] text-white opacity-[0.12]" />
        <div className="container-site relative drop-shadow-[0_2px_12px_rgba(0,0,0,0.7)]">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-silver transition-colors hover:text-white mb-6"
          >
            <ArrowLeft className="size-4" />
            Back to Home
          </Link>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="eyebrow text-silver">Flagship Tournament</span>
            <span className="rounded-full bg-royal/80 backdrop-blur-sm px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white shadow-sm">
              Season 2 &middot; Feb 2027
            </span>
          </div>
          <h1 className="type-display-l text-white drop-shadow-md">
            National Silver <span className="silver-text italic">Premier League</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-silver-bright lg:text-lg leading-relaxed drop-shadow">
            Where vision meets brotherhood. The flagship cricketing extravaganza bringing leading companies from the Indian Silver Jewellery fraternity together on one pitch.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4 border-t border-white/15 pt-6">
            <Button asChild variant="primary" size="lg" className="shadow-lg">
              <Link href="/register">
                Register for Season 2 <ArrowRight className="size-4 ml-1" />
              </Link>
            </Button>
            <Button variant="outlineDark" size="lg" onClick={handleDownloadRules} className="backdrop-blur-sm bg-navy/30 border-white/20 text-white hover:bg-white/10">
              <Download className="size-4" /> Download Rules &amp; Regulations
            </Button>
          </div>
        </div>
      </section>

      {/* 3 & 4: SCROLLABLE TRANSLUCENT COMPONENTS (Video stays constant behind) */}
      <section className="container-site -mt-6 pb-28 relative z-10 space-y-10">
        
        {/* 1. KEY FACTS CARD (Translucent Glassmorphism) */}
        <div className="rounded-2xl border border-white/20 bg-navy/40 backdrop-blur-md p-6 sm:p-10 shadow-2xl text-white">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-white/15 pb-6">
            <div>
              <span className="eyebrow text-silver">Season 2 Overview</span>
              <h2 className="text-2xl font-bold text-white sm:text-3xl mt-1">Tournament Key Facts</h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 rounded-full px-4 py-1.5 self-start md:self-auto backdrop-blur-sm">
              <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
              Player Registrations Open
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm p-5 transition-colors hover:bg-white/15">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-silver mb-1">
                <Calendar className="size-4 text-royal" /> When
              </div>
              <span className="text-xl font-extrabold text-white">February 2027</span>
              <p className="mt-1 text-xs text-silver/80">Weekend floodlit match fixtures</p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm p-5 transition-colors hover:bg-white/15">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-silver mb-1">
                <Award className="size-4 text-royal" /> Title Sponsor
              </div>
              <span className="text-xl font-extrabold text-white">Silver Show of India</span>
              <p className="mt-1 text-xs text-silver/80">India&rsquo;s premier B2B jewellery expo</p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm p-5 transition-colors hover:bg-white/15">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-silver mb-1">
                <MapPin className="size-4 text-royal" /> Venue &amp; Pitch
              </div>
              <span className="text-xl font-extrabold text-white">Mumbai Stadium</span>
              <p className="mt-1 text-xs text-silver/80">Turf wickets &amp; stadium lights</p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm p-5 transition-colors hover:bg-white/15">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-silver mb-1">
                <ShieldCheck className="size-4 text-royal" /> Entry Fee
              </div>
              <span className="text-xl font-extrabold text-white">{formatInr(2000)}</span>
              <p className="mt-1 text-xs text-silver/80">Kit, auction pool &amp; insurance</p>
            </div>
          </div>
        </div>

        {/* 2. HOW IT WORKS (Translucent Cards) */}
        <div className="rounded-2xl border border-white/20 bg-navy/40 backdrop-blur-md p-6 sm:p-10 shadow-2xl text-white">
          <div className="max-w-2xl">
            <span className="eyebrow text-silver">Tournament Roadmap</span>
            <h2 className="text-2xl font-bold text-white sm:text-3xl mt-1">How NSPL Works</h2>
            <p className="mt-2 text-sm text-silver/85">
              From online sign-up to lifting the silver championship trophy under stadium floodlights.
            </p>
          </div>

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {HOW_IT_WORKS.map((h, i) => (
              <div
                key={h.step}
                className="relative flex flex-col justify-between rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm p-5 transition-all hover:bg-white/15 hover:border-royal/50"
              >
                <div>
                  <span className="font-mono text-2xl font-black text-white/50">
                    {h.step}
                  </span>
                  <h3 className="mt-2 font-bold text-white text-base">{h.title}</h3>
                  <p className="mt-2 text-xs leading-relaxed text-silver/85">{h.desc}</p>
                </div>
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 text-white/40 z-10">
                    &rarr;
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 3. TEAMS & SQUADS PREVIEW (Translucent) */}
        <div className="rounded-2xl border border-white/20 bg-navy/40 backdrop-blur-md p-6 sm:p-10 shadow-2xl text-white">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-white/15 pb-6">
            <div>
              <span className="eyebrow text-silver">Franchises &middot; Season 2</span>
              <h2 className="text-2xl font-bold text-white sm:text-3xl mt-1">Competing Teams &amp; Squads</h2>
              <p className="mt-1 text-sm text-silver/80">
                Official franchise teams representing top silver jewellery houses.
              </p>
            </div>
            <div className="rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white self-start sm:self-auto backdrop-blur-sm">
              Live Auction: January 2027
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {TEAMS_PREVIEW.map((t) => (
              <div
                key={t.name}
                className="group flex items-start gap-4 rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm p-4 transition-all hover:bg-white/15 hover:border-royal/50"
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-white/20 text-2xl shadow-inner border border-white/20">
                  {t.icon}
                </div>
                <div>
                  <h3 className="font-bold text-white text-sm group-hover:text-royal transition-colors">
                    {t.name}
                  </h3>
                  <p className="text-xs text-silver/70">{t.firm}</p>
                  <span className="mt-2 inline-block rounded bg-white/10 px-2 py-0.5 text-[10px] font-semibold text-silver-bright">
                    Squad drafting soon
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 rounded-xl border border-white/15 bg-white/5 backdrop-blur-sm p-5 text-center">
            <p className="text-xs text-silver">
              Want your enterprise to own a franchise team for NSPL Season 2?{" "}
              <Link href="/sponsors#enquire" className="font-semibold text-white underline hover:text-royal">
                Submit a Team Ownership enquiry
              </Link>
            </p>
          </div>
        </div>

        {/* 4. LIVE BROADCAST CARD (Translucent Video Preview) */}
        <div className="rounded-2xl border border-white/20 bg-navy/45 backdrop-blur-md p-6 sm:p-10 text-white shadow-2xl overflow-hidden relative">
          <div className="relative z-10 grid gap-8 lg:grid-cols-12 items-center">
            <div className="space-y-4 lg:col-span-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-live/25 px-3 py-1 text-xs font-bold uppercase tracking-wider text-live border border-live/30">
                <Tv className="size-3.5" />
                Live Broadcast
              </div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Watch NSPL Match Days Live
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-silver/85">
                Every ball, boundary, and wicket broadcasted in high-definition across YouTube with multi-camera action, live commentary, and real-time scorecards.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Button variant="primary" size="sm" onClick={() => setSelectedVideo("/videos/bat.mp4")} className="shadow-md">
                  <Play className="size-4 fill-current" /> Watch Season 1 Teaser
                </Button>
                <Button asChild variant="outlineDark" size="sm" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer">
                    Visit YouTube Channel
                  </a>
                </Button>
              </div>
            </div>

            {/* Video Viewport Card */}
            <div className="lg:col-span-7">
              <div
                onClick={() => setSelectedVideo("/videos/bat.mp4")}
                className="group relative aspect-video overflow-hidden rounded-2xl border border-white/20 bg-black/40 backdrop-blur-sm cursor-pointer shadow-xl"
              >
                <video
                  src="/videos/bat.mp4"
                  muted
                  loop
                  playsInline
                  autoPlay
                  className="size-full object-cover opacity-75 group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                  <div className="flex size-16 items-center justify-center rounded-full bg-royal text-white shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="size-7 ml-0.5 fill-current" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 rounded-md bg-navy/85 px-3 py-1 text-xs font-semibold text-silver-bright backdrop-blur-sm">
                  NSPL Season 1 &middot; Final Highlight Reel
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 5. HALL OF FAME / PAST CHAMPIONS (Translucent Cards) */}
        <div className="rounded-2xl border border-white/20 bg-navy/40 backdrop-blur-md p-6 sm:p-10 shadow-2xl text-white">
          <div className="border-b border-white/15 pb-6">
            <span className="eyebrow text-silver">Hall of Fame</span>
            <h2 className="text-2xl font-bold text-white sm:text-3xl mt-1">Past Season Champions</h2>
            <p className="mt-1 text-sm text-silver/80">
              Honoring the champions and individual performers of NSPL Season 1.
            </p>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            <div className="rounded-xl border border-amber-500/30 bg-amber-950/30 backdrop-blur-sm p-6 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-amber-500/20 text-amber-300 mb-3 border border-amber-400/30">
                <Trophy className="size-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-300">Season 1 Champions</span>
              <h3 className="text-xl font-extrabold text-white mt-1">Silbells Warriors</h3>
              <p className="mt-1 text-xs text-silver/80">Lifted the inaugural silver cup</p>
            </div>

            <div className="rounded-xl border border-royal/30 bg-royal/10 backdrop-blur-sm p-6 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-royal/20 text-royal mb-3 border border-royal/30">
                <Award className="size-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-silver-bright">Tournament MVP</span>
              <h3 className="text-xl font-extrabold text-white mt-1">Suraj Mehta</h3>
              <p className="mt-1 text-xs text-silver/80">342 runs &middot; 9 wickets</p>
            </div>

            <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/30 backdrop-blur-sm p-6 text-center">
              <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-300 mb-3 border border-emerald-400/30">
                <Sparkles className="size-7" />
              </div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">Best Bowler</span>
              <h3 className="text-xl font-extrabold text-white mt-1">Ritesh Doshi</h3>
              <p className="mt-1 text-xs text-silver/80">14 wickets in 6 matches</p>
            </div>
          </div>
        </div>

        {/* 6. FAQS ACCORDION (Translucent Glassmorphism) */}
        <div className="rounded-2xl border border-white/20 bg-navy/40 backdrop-blur-md p-6 sm:p-10 shadow-2xl text-white">
          <div className="max-w-2xl mb-8">
            <span className="eyebrow text-silver">Frequently Asked Questions</span>
            <h2 className="text-2xl font-bold text-white sm:text-3xl mt-1">Common Questions About NSPL</h2>
          </div>

          <div className="space-y-4">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index
              return (
                <div
                  key={index}
                  className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm overflow-hidden transition-colors hover:border-royal/50 hover:bg-white/15"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="flex w-full items-center justify-between p-5 text-left text-sm sm:text-base font-bold text-white"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`size-5 shrink-0 text-silver transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-white" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="border-t border-white/15 p-5 pt-3 text-xs sm:text-sm leading-relaxed text-silver-bright">
                      {faq.a}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* 7. BOTTOM REGISTRATION CTA */}
        <div className="rounded-2xl border border-royal/40 bg-royal/80 backdrop-blur-md p-8 text-white shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="text-center sm:text-left">
            <h3 className="text-2xl font-black">Ready to represent your firm on the pitch?</h3>
            <p className="mt-1 text-xs sm:text-sm text-white/90">
              Registrations for the NSPL Season 2 player auction pool are closing soon.
            </p>
          </div>
          <Button asChild variant="outlineDark" size="lg" className="border-white bg-white text-navy hover:bg-white/90 hover:text-royal shrink-0 font-bold shadow-lg">
            <Link href="/register">
              Sign Up Now <ArrowRight className="size-4 ml-1" />
            </Link>
          </Button>
        </div>

      </section>

      </div>

      {/* Video Modal Player */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/20 bg-navy shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/15 px-5 py-4 text-silver-bright">
              <h3 className="font-bold text-sm sm:text-base">NSPL Match Action</h3>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="rounded-lg p-1 text-silver hover:bg-white/10 hover:text-white"
                aria-label="Close video"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black">
              <video
                src={selectedVideo}
                controls
                autoPlay
                className="size-full object-contain"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
