"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import {
  ArrowLeft,
  ArrowRight,
  Play,
  Camera,
  Newspaper,
  Film,
  Sparkles,
  X,
  ExternalLink,
} from "lucide-react"
import { SeamRings } from "@/components/brand/seam-rings"
import { PhotoPlaceholder } from "@/components/brand/photo-placeholder"
import { Button } from "@/components/ui/button"

type FilterCategory = "all" | "nspl" | "conclave" | "videos" | "press"

interface GalleryItem {
  id: string
  type: "photo" | "video" | "press"
  category: "nspl" | "conclave" | "press"
  title: string
  subtitle: string
  src: string | null
  videoSrc?: string
  date: string
  outlet?: string
  link?: string
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: "v1",
    type: "video",
    category: "nspl",
    title: "Cricket Highlights",
    subtitle: "A moment from the Silver Youth Forum cricket experience.",
    src: null,
    videoSrc: "/videos/bat.mp4",
    date: "Cricket",
  },
  {
    id: "v2",
    type: "video",
    category: "nspl",
    title: "On the Field",
    subtitle: "A glimpse of the game that brings the fraternity together.",
    src: null,
    videoSrc: "/videos/ball.mp4",
    date: "Cricket",
  },
]

export default function GalleryPage() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all")
  const [selectedVideo, setSelectedVideo] = useState<GalleryItem | null>(null)

  useEffect(() => {
    const category = new URLSearchParams(window.location.search).get("category")
    if (category === "conclave" || category === "nspl" || category === "videos" || category === "press") {
      setActiveFilter(category)
    }
  }, [])

  const filteredItems = GALLERY_ITEMS.filter((item) => {
    if (activeFilter === "all") return true
    if (activeFilter === "videos") return item.type === "video"
    if (activeFilter === "press") return item.type === "press"
    return item.category === activeFilter
  })

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
          <p className="eyebrow text-silver">Archive &middot; Moments &amp; Highlights</p>
          <h1 className="type-display-l mt-3 text-white">
            Media <span className="silver-text italic">Gallery</span>
          </h1>
          <p className="mt-4 max-w-2xl text-base text-silver lg:text-lg">
            A look at cricket and the community bringing India&apos;s silver jewellery fraternity together.
          </p>

          {/* Filter Pills */}
          <div className="mt-8 flex flex-wrap gap-2 border-t border-navy-line pt-6">
            {[
              { id: "all", label: "All Moments", icon: Sparkles },
              { id: "nspl", label: "NSPL Cricket", icon: Camera },
              { id: "videos", label: "Highlight Reels", icon: Film },
              { id: "conclave", label: "Business Conclaves", icon: Sparkles },
              { id: "press", label: "Press Mentions", icon: Newspaper },
            ].map((f) => {
              const Icon = f.icon
              const active = activeFilter === f.id
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setActiveFilter(f.id as FilterCategory)}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold tracking-wider transition-all ${
                    active
                      ? "bg-royal text-white shadow-sm"
                      : "bg-navy-raised text-silver hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon className="size-3.5" />
                  {f.label}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Main Grid Section */}
      <section className="container-site -mt-8 pb-24 relative z-10">
        <div className="rounded-2xl border border-line bg-paper p-6 sm:p-10 shadow-sm">
          
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => {
              const isVideo = item.type === "video"
              const isPress = item.type === "press"

              return (
                <div
                  key={item.id}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-line bg-mist/30 transition-all hover:border-royal/40 hover:bg-white hover:shadow-md"
                >
                  {/* Media Viewport */}
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-navy">
                    {isVideo && item.videoSrc ? (
                      <div
                        onClick={() => setSelectedVideo(item)}
                        className="relative size-full cursor-pointer group-hover:scale-105 transition-transform duration-500"
                      >
                        <video
                          src={item.videoSrc}
                          muted
                          playsInline
                          loop
                          preload="none"
                          poster={item.videoSrc === "/videos/bat.mp4" ? "/videos/bat-poster.webp" : "/videos/ball-poster.webp"}
                          className="size-full object-cover opacity-80"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-navy/40 transition-colors group-hover:bg-navy/20">
                          <div className="flex size-14 items-center justify-center rounded-full bg-royal text-white shadow-lg transition-transform group-hover:scale-110">
                            <Play className="size-6 ml-0.5 fill-current" />
                          </div>
                        </div>
                      </div>
                    ) : item.src ? (
                      <Image
                        src={item.src}
                        alt={item.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <PhotoPlaceholder label={item.title} className="absolute inset-0" />
                    )}

                    {/* Tag Badge */}
                    <div className="absolute top-3 left-3 rounded-full bg-navy/80 px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-silver-bright backdrop-blur-sm">
                      {item.date}
                    </div>

                    {isPress && (
                      <div className="absolute top-3 right-3 rounded-full bg-royal px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                        {item.outlet}
                      </div>
                    )}
                  </div>

                  {/* Caption & Details */}
                  <div className="p-5 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-bold text-navy text-base leading-snug group-hover:text-royal transition-colors">
                        {item.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-ink-muted">
                        {item.subtitle}
                      </p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-line/60 flex items-center justify-between text-xs font-semibold text-royal">
                      {isVideo ? (
                        <button
                          type="button"
                          onClick={() => setSelectedVideo(item)}
                          className="inline-flex items-center gap-1 hover:underline"
                        >
                          <Play className="size-3.5 fill-current" /> Watch Video
                        </button>
                      ) : isPress && item.link ? (
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 hover:underline"
                        >
                          Read Article <ExternalLink className="size-3.5" />
                        </a>
                      ) : (
                        <span className="text-silver-dim text-[11px]">SYF Official Media</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {filteredItems.length === 0 && (
            <div className="py-16 text-center">
              <p className="text-sm text-silver-dim">
                {activeFilter === "conclave"
                  ? "Conclave photos and coverage will appear here once confirmed media is available."
                  : activeFilter === "press"
                    ? "Press coverage will appear here once published articles are available."
                    : "No items found for this category."}
              </p>
              {(activeFilter === "conclave" || activeFilter === "press") && (
                <Button asChild variant="outlineDark" size="sm" className="mt-5">
                  <Link href="/contact">Contact Silver Youth Forum <ArrowRight className="size-4" /></Link>
                </Button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Video Modal Player */}
      {selectedVideo && selectedVideo.videoSrc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy/90 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-4xl overflow-hidden rounded-2xl border border-navy-line bg-navy shadow-2xl">
            <div className="flex items-center justify-between border-b border-navy-line px-5 py-4 text-silver-bright">
              <h3 className="font-bold text-sm sm:text-base">{selectedVideo.title}</h3>
              <button
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="rounded-lg p-1 text-silver-dim hover:bg-white/10 hover:text-white"
                aria-label="Close modal"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="relative aspect-video w-full bg-black">
              <video
                src={selectedVideo.videoSrc}
                controls
                autoPlay
                preload="metadata"
                className="size-full object-contain"
              />
            </div>
            <div className="p-4 text-xs text-silver">
              <p>{selectedVideo.subtitle}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
