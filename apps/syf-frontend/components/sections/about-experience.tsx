"use client"

import Link from "next/link"
import { ArrowDown, ArrowRight, ArrowUpRight } from "lucide-react"
import { type RefObject, useEffect, useRef } from "react"
import { gsap } from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Button } from "@/components/ui/button"

const story = [
  {
    number: "01",
    eyebrow: "The fraternity",
    title: "Where Vision Meets Fraternity",
    body: "Silver Youth Forum is a vibrant, forward-thinking collective of young entrepreneurs and leaders from India's silver jewellery industry.",
  },
  {
    number: "02",
    eyebrow: "The direction",
    title: "Our Vision",
    body: "To unite the silver fraternity and help shape a stronger, more connected future for the industry.",
  },
  {
    number: "03",
    eyebrow: "What moves us",
    title: "Knowledge Sharing",
    body: "Open exchange of ideas and experience helps the next generation move the industry forward.",
  },
  {
    number: "04",
    eyebrow: "What moves us",
    title: "Networking",
    body: "Meaningful relationships create room for collaboration across the silver fraternity.",
  },
  {
    number: "05",
    eyebrow: "What moves us",
    title: "Industry Development",
    body: "A connected community can help build a more resilient and forward-looking industry.",
  },
  {
    number: "06",
    eyebrow: "On and off the pitch",
    title: "Beyond Business. United Through Sport.",
    body: "Business conclaves create space for knowledge exchange, networking and collaboration across the silver jewellery industry. NSPL is SYF's flagship cricketing initiative, bringing companies together through sport, sportsmanship, youth leadership and healthy competition.",
  },
  {
    number: "07",
    eyebrow: "The people behind the forum",
    title: "Different Strengths. One Fraternity.",
    body: "An ecosystem of young entrepreneurs and leaders working towards a more connected silver industry.",
  },
  { number: "08", eyebrow: "The innings continues", title: "One Fraternity. A Stronger Future.", body: "Be part of a community shaping the future of India's silver jewellery industry." },
]

const cricketVideoSrc = "/vids/gemini_generated_video_538335ae.mp4"
const batVideoSrc = "/vids/bat.mp4"
const scrollSliceCount = 1_000_000
const cricketVideoFps = 24

function CricketVideo({
  videoRef,
  className,
  src = cricketVideoSrc,
}: {
  videoRef: RefObject<HTMLVideoElement | null>
  className: string
  src?: string
}) {
  return (
    <div className={`about-film ${className}`}>
      <video
        ref={videoRef}
        className="about-film-video"
        muted
        playsInline
        loop
        preload="auto"
        tabIndex={-1}
      >
        <source src={src} type="video/mp4" />
      </video>
      <span className="about-film-wash" />
      <span className="about-film-vignette" />
    </div>
  )
}

function StorySequence() {
  const sectionRef = useRef<HTMLElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const section = sectionRef.current
    const video = videoRef.current
    if (!section || !video) return

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)")
    let isInView = false
    let isScrollControlled = false
    let latestFrame = 0
    let requestedFrame = -1
    let isSeeking = false
    const maxFrame = () => Math.max(0, Math.floor(video.duration * cricketVideoFps) - 1)

    const syncPlayback = () => {
      if (motionPreference.matches) {
        video.pause()
        if (video.readyState >= HTMLMediaElement.HAVE_METADATA && video.currentTime !== 0) video.currentTime = 0
      } else if (isInView && !isScrollControlled && video.readyState >= HTMLMediaElement.HAVE_METADATA) {
        void video.play().catch(() => undefined)
      } else {
        video.pause()
      }
    }
    const resumePlayback = () => {
      isScrollControlled = false
      syncPlayback()
    }
    const resumeScrollScrub = () => {
      isScrollControlled = true
      video.pause()
    }
    const seekLatestFrame = () => {
      if (!isScrollControlled || isSeeking || video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA) return
      const frame = Math.min(latestFrame, maxFrame())
      const time = frame / cricketVideoFps
      if (Math.abs(video.currentTime - time) < 0.5 / cricketVideoFps) {
        requestedFrame = frame
        return
      }

      requestedFrame = frame
      isSeeking = true
      video.currentTime = time
    }
    const handleSeeked = () => {
      isSeeking = false
      if (latestFrame !== requestedFrame) seekLatestFrame()
    }
    const setVideoSlice = (slice: number) => {
      const normalized = Math.min(scrollSliceCount - 1, Math.max(0, Math.round(slice))) / (scrollSliceCount - 1)
      latestFrame = Math.round(normalized * maxFrame())
      seekLatestFrame()
    }

    const observer = new IntersectionObserver(([entry]) => {
      isInView = entry.isIntersecting
      syncPlayback()
    }, { threshold: 0.01 })
    observer.observe(section)
    motionPreference.addEventListener("change", syncPlayback)
    video.addEventListener("seeked", handleSeeked)

    gsap.registerPlugin(ScrollTrigger)
    const media = gsap.matchMedia()
    let context: { revert: () => void } | undefined

    const initialize = () => {
      if (context || !Number.isFinite(video.duration) || video.duration <= 0) return

      video.pause()
      video.currentTime = 0

      context = gsap.context(() => {
        media.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
          const steps = gsap.utils.toArray<HTMLElement>("[data-story-stage]", section)
          const progress = section.querySelector<HTMLElement>(".about-progress span")
          const stage = section.querySelector<HTMLElement>(".about-sequence-stage")
          const flare = section.querySelector<HTMLElement>(".about-film-flare")
          if (!progress || !stage || !flare || steps.length !== story.length) return

          section.dataset.animated = "true"
          isScrollControlled = true
          video.pause()
          latestFrame = 0
          requestedFrame = 0
          gsap.set(steps, { autoAlpha: 0, y: 18, yPercent: -50 })
          gsap.set(steps[0], { autoAlpha: 1, y: 0 })
          gsap.set(flare, { autoAlpha: 0, scale: 0.82, transformOrigin: "center" })
          gsap.set(progress, { scaleX: 0, transformOrigin: "left center" })

          const timeline = gsap.timeline({
            defaults: { ease: "power1.inOut" },
            scrollTrigger: {
              trigger: section,
              pin: stage,
              start: "top top",
              end: () => `+=${Math.round(window.innerHeight * 5.8)}`,
              scrub: 0.45,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onEnter: resumeScrollScrub,
              onEnterBack: resumeScrollScrub,
              onLeave: resumePlayback,
              onLeaveBack: resumePlayback,
            },
          })
          const changeStep = (index: number, at: string) => {
            timeline.to(steps[index - 1], { autoAlpha: 0, y: -8, duration: 0.34, ease: "power1.inOut" }, at)
            timeline.to(steps[index], { autoAlpha: 1, y: 0, duration: 0.42, ease: "power1.inOut" }, `${at}+=0.14`)
          }

          timeline.addLabel("stance", 0)
          const playhead = { slice: 0 }
          timeline.to(playhead, {
            slice: scrollSliceCount - 1,
            duration: 7.5,
            ease: "none",
            onUpdate: () => setVideoSlice(playhead.slice),
          }, "stance")
          timeline.addLabel("backswing", 0.9)
          changeStep(1, "backswing+=0.22")

          timeline.addLabel("story", 2.1)
          changeStep(2, "story")

          timeline.addLabel("pillars", 2.95)
          changeStep(3, "pillars")
          changeStep(4, "pillars+=0.82")

          timeline.addLabel("preImpact", 4.8)
          changeStep(5, "preImpact")

          timeline.addLabel("community", 5.8)
          changeStep(6, "community")

          timeline.addLabel("impact", 6.62)
          changeStep(7, "impact+=0.08")
          timeline.to(flare, { autoAlpha: 0.56, scale: 1.08, duration: 0.18, ease: "power1.out" }, "impact")
            .to(flare, { autoAlpha: 0, scale: 1.28, duration: 0.5, ease: "power1.out" }, "impact+=0.18")
            .to(progress, { scaleX: 1, duration: 7.5, ease: "none" }, "stance")
            .addLabel("closing", "impact+=0.08")

          return () => {
            delete section.dataset.animated
            isScrollControlled = false
            syncPlayback()
          }
        })
      }, section)
      syncPlayback()
    }

    if (video.readyState >= HTMLMediaElement.HAVE_METADATA) initialize()
    else video.addEventListener("loadedmetadata", initialize, { once: true })

    return () => {
      video.removeEventListener("loadedmetadata", initialize)
      context?.revert()
      media.revert()
      observer.disconnect()
      motionPreference.removeEventListener("change", syncPlayback)
      video.removeEventListener("seeked", handleSeeked)
      video.pause()
    }
  }, [])

  return (
    <section ref={sectionRef} className="about-sequence" aria-label="Silver Youth Forum story">
      <div className="about-sequence-stage">
        <div className="about-sequence-inner">
          <div className="about-film-wrap" aria-hidden="true">
            <CricketVideo videoRef={videoRef} className="about-film-story" src={batVideoSrc} />
            <div className="about-film-flare" />
          </div>
          <div className="about-story-copy">
            {story.map((item) => (
              <article key={item.number} className={`about-story-step ${item.number === "06" ? "about-story-step-long" : ""}`} data-story-stage>
                <p className="eyebrow text-silver">{item.eyebrow} <span className="ml-2 text-silver-dim">/ {item.number}</span></p>
                <h2 className="type-display-l mt-5 max-w-xl text-silver-bright">{item.title}</h2>
                <p className="mt-5 max-w-lg text-base leading-8 text-silver md:text-lg">{item.body}</p>
                {item.number === "06" && (
                  <div className="about-story-links mt-5 flex flex-wrap gap-3">
                    <Button asChild size="md"><Link href="/gallery">Business Conclaves <ArrowRight aria-hidden="true" /></Link></Button>
                    <Button asChild variant="outlineDark" size="md"><Link href="/nspl">Discover NSPL <ArrowRight aria-hidden="true" /></Link></Button>
                  </div>
                )}
                {item.number === "07" && <Link className="about-story-link mt-5" href="/committee">Meet the committee <ArrowRight size={15} /></Link>}
                {item.number === "08" && (
                  <div className="mt-7 flex flex-wrap gap-3">
                    <Button asChild size="md"><Link href="/committee">Discover SYF <ArrowRight aria-hidden="true" /></Link></Button>
                    <Button asChild size="md" variant="outlineDark"><Link href="/nspl">Explore NSPL <ArrowUpRight aria-hidden="true" /></Link></Button>
                  </div>
                )}
              </article>
            ))}
          </div>
          <div className="about-progress" aria-hidden="true"><span /></div>
          <span className="about-scene-label eyebrow">Silver Youth Forum <span aria-hidden="true">·</span> The innings</span>
        </div>
      </div>
    </section>
  )
}

export function AboutExperience() {
  const heroVideoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = heroVideoRef.current
    if (!video) return

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)")
    const syncPlayback = () => {
      if (motionPreference.matches) {
        video.pause()
        video.currentTime = 0
        return
      }

      void video.play().catch(() => undefined)
    }

    syncPlayback()
    motionPreference.addEventListener("change", syncPlayback)
    return () => {
      motionPreference.removeEventListener("change", syncPlayback)
      video.pause()
    }
  }, [])

  return (
    <>
      <section className="about-hero grain relative isolate overflow-hidden bg-navy text-silver-bright">
        <div className="container-site about-hero-layout relative z-10">
          <div className="about-hero-copy">
            <p className="eyebrow text-silver">Silver Youth Forum <span className="mx-2 text-silver-dim">·</span> India&apos;s silver fraternity</p>
            <h1 className="about-hero-title type-display-xl mt-7">
              <span>Built on Brotherhood.</span>
              <span className="silver-text accent-italic">Driven by a Shared Vision.</span>
            </h1>
            <p className="mt-7 max-w-xl text-lg leading-8 text-silver">Bringing together young entrepreneurs and leaders to strengthen India&apos;s silver jewellery fraternity.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button asChild size="lg"><a href="#our-story">Discover Our Story <ArrowRight aria-hidden="true" /></a></Button>
              <Button asChild variant="outlineDark" size="lg"><Link href="/nspl">Explore NSPL <ArrowUpRight aria-hidden="true" /></Link></Button>
            </div>
          </div>
          <div className="about-hero-art" aria-hidden="true">
            <div className="about-orbit about-orbit-one" />
            <div className="about-orbit about-orbit-two" />
            <CricketVideo videoRef={heroVideoRef} className="about-film-hero" />
            <span className="about-hero-art-caption eyebrow">Ready for what comes next</span>
          </div>
          <a href="#our-story" className="about-scroll-cue"><span className="about-scroll-icon"><ArrowDown size={15} /></span><span className="eyebrow">Scroll to begin</span></a>
        </div>
      </section>

      <div id="our-story"><StorySequence /></div>
    </>
  )
}
