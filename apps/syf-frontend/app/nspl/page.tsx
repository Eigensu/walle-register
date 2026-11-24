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
  Play,
  Sparkles,
  MapPin,
  Tv,
  X,
  RotateCcw,
} from "lucide-react"
import { formatInr } from "@/lib/format"
import { site } from "@/site.config"
import { SeamRings } from "@/components/brand/seam-rings"
import { Button } from "@/components/ui/button"

// Use a supplied NSPL match photo as the background after the intro video ends.
const PITCH_BG_IMAGE = "/photos/nspl-season-1/match-action/08_img_9320.webp"
const previousSeasonVideoId = "yOuBxruXpG8"

const HOW_IT_WORKS = [
  { step: "01", title: "Register Online" },
  { step: "02", title: "Player Screening" },
  { step: "03", title: "Player Auction & Launch Party" },
  { step: "04", title: "Main Tournament" },
]

const TEAMS_PREVIEW = [
  { name: "Silbells Strikers", firm: "Silbells Jewellery" },
  { name: "SSI Titans", firm: "Silver Show of India" },
  { name: "RS Bullion Blasters", firm: "RS Bullion" },
  { name: "Queens & Kings Royals", firm: "Queens & Kings" },
  { name: "Arihant Knights", firm: "Arihant 925 (AJPL)" },
  { name: "Divine Super Kings", firm: "Divine Silver" },
  { name: "Richezza Stars", firm: "Richezza Royal 925" },
  { name: "Tresorie Gladiators", firm: "Tresorie Silver" },
]

export default function NsplPage() {
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null)
  const [videoEnded, setVideoEnded] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)

  const handleReplayVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0
      videoRef.current.play()
      setVideoEnded(false)
    }
  }

  return (
    <div className="relative isolate min-h-screen overflow-x-clip text-silver-bright">
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
              Season 2 &middot; 12&ndash;14 Feb 2027
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
              Registrations open 24 Nov
            </div>
          </div>

          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm p-5 transition-colors hover:bg-white/15">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-silver mb-1">
                <Calendar className="size-4 text-royal" /> When
              </div>
              <span className="text-xl font-extrabold text-white">12–14 February 2027</span>
              <p className="mt-1 text-xs text-silver/80">Three days of floodlit matches</p>
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
              <span className="text-xl font-extrabold text-white">Police Gymkhana</span>
              <p className="mt-1 text-xs text-silver/80">Turf wickets &amp; stadium lights</p>
            </div>

            <div className="rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm p-5 transition-colors hover:bg-white/15">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-silver mb-1">
                <ShieldCheck className="size-4 text-royal" /> Entry Fee
              </div>
              <span className="text-xl font-extrabold text-white">{formatInr(site.event.registration.fee.value ?? 7200)}</span>
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

          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
        </div>

        {/* 4. LIVE BROADCAST CARD (Translucent Video Preview) */}
        <div className="rounded-2xl border border-white/20 bg-navy/45 backdrop-blur-md p-6 sm:p-10 text-white shadow-2xl overflow-hidden relative">
          <div className="relative z-10 grid gap-8 lg:grid-cols-12 items-center">
            <div className="space-y-4 lg:col-span-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-live/25 px-3 py-1 text-xs font-bold uppercase tracking-wider text-live border border-live/30">
                <Tv className="size-3.5" />
                Previous Season
              </div>
              <h2 className="text-2xl font-bold text-white sm:text-3xl">
                Watch a Season 1 Match
              </h2>
              <p className="text-xs sm:text-sm leading-relaxed text-silver/85">
                Revisit the National Silver Premier League Season 1 final-day coverage, streamed by JewelBuzz.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Button variant="primary" size="sm" onClick={() => setSelectedVideo(previousSeasonVideoId)} className="shadow-md">
                  <Play className="size-4 fill-current" /> Watch Previous Season Match
                </Button>
                <Button asChild variant="outlineDark" size="sm" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
                  <a href="https://www.youtube.com/@JewelBuzz-SpreadTheBuzz" target="_blank" rel="noopener noreferrer">
                    More from JewelBuzz
                  </a>
                </Button>
              </div>
            </div>

            {/* Video Viewport Card */}
            <div className="lg:col-span-7">
              <div
                onClick={() => setSelectedVideo(previousSeasonVideoId)}
                className="group relative aspect-video overflow-hidden rounded-2xl border border-white/20 bg-black/40 backdrop-blur-sm cursor-pointer shadow-xl"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-80 transition-transform duration-500 group-hover:scale-105"
                  style={{ backgroundImage: `url(https://i.ytimg.com/vi/${previousSeasonVideoId}/hqdefault.jpg)` }}
                  aria-hidden="true"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/10 transition-colors">
                  <div className="flex size-16 items-center justify-center rounded-full bg-royal text-white shadow-2xl group-hover:scale-110 transition-transform">
                    <Play className="size-7 ml-0.5 fill-current" />
                  </div>
                </div>
                <div className="absolute bottom-4 left-4 rounded-md bg-navy/85 px-3 py-1 text-xs font-semibold text-silver-bright backdrop-blur-sm">
                  NSPL Season 1 &middot; Final Day Coverage
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

      </section>

      </div>

      {/* Video Modal Player */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-white/20 bg-navy shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/15 px-5 py-4 text-silver-bright">
              <h3 className="font-bold text-sm sm:text-base">NSPL Season 1 · Final Day · Part 1</h3>
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
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${selectedVideo}?autoplay=1&rel=0`}
                title="NSPL Season 1 final-day coverage from JewelBuzz"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                className="size-full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
