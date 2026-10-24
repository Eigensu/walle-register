// The blueprint's contract: a new event site is a new object of this shape plus content/ and
// public/ assets. Components read only from here, never from hard-coded strings.

import type { Field } from "./content"

export type Link = { label: string; href: string }

export type HomeSection = "hero" | "stats" | "about" | "featuredEvent" | "sponsors" | "people" | "gallery"

export type BrandColors = {
  navy: string
  navyRaised: string
  navyLine: string
  silver: string
  silverBright: string
  silverDim: string
  mist: string
  paper: string
  line: string
  inkMuted: string
  royal: string
  royalHover: string
  live: string
}

export type SiteConfig = {
  org: {
    name: string
    shortName: string
    description: Field<string>
    /** Paths under public/. onDark is used on navy, onLight on paper/mist. */
    logo: Field<{ onDark: string; onLight: string }>
  }
  siteUrl: Field<string>
  locale: string
  timeZone: string
  timeZoneLabel: string
  theme: { colors: BrandColors }
  nav: Link[]
  footer: {
    policies: Link[]
    credit: Link | null
  }
  /** Routes that exist but whose page isn't built yet; rendered as "coming soon" stubs. */
  stubPages: Record<string, { title: string; summary: string }>

  event: {
    slug: string
    shortName: string
    name: string
    /** schema.org SportsEvent sport */
    sport: string
    seasonLabel: string
    href: string
    logo: Field<string>
    registration: {
      href: string
      opensAt: Field<string>
      closesAt: Field<string>
      fee: Field<number | null>
      cap: Field<number | null>
      waitlist: boolean
    }
    season: {
      startsAt: Field<string>
      endsAt: Field<string>
      matchDays: Field<string[]>
      liveLabel: Field<string>
      venue: Field<string>
    }
    liveStreamUrl: Field<string>
    teamsPublished: boolean
  }

  home: {
    sections: HomeSection[]
    hero: {
      eyebrow: string
      /** "*word*" renders in the silver italic; "\n" forces a line break. */
      headline: Field<string>
      subcopy: Field<string>
      photo: Field<string | null>
      secondaryCta: Link
      showSpotsLeft: boolean
    }
    stats: { minimumToShow: number }
    about: {
      eyebrow: string
      heading: string
      body: Field<string>
      pillars: string[]
      photo: Field<string | null>
      link: Link
    }
    featuredEvent: {
      eyebrow: string
      heading: string
      body: Field<string>
      facts: { label: string; value: Field<string> }[]
      photo: Field<string | null>
      link: Link
    }
    sponsors: { eyebrow: string; heading: Field<string>; enquire: Link; utmSource: string; utmCampaign: string }
    people: { eyebrow: string; heading: Field<string>; teaserCount: number; link: Link }
    gallery: { eyebrow: string; heading: Field<string>; link: Link }
  }

  contact: {
    email: Field<string>
    phone: Field<string>
    whatsapp: Field<string>
    address: Field<string>
  }
  social: { label: string; url: Field<string> }[]
  analytics: { provider: null | "vercel" | "ga4" | "plausible"; id: string }
}

export type Sponsor = {
  key: string
  name: string
  tier: "title" | "associate" | "team" | "partner"
  /** Path under public/, SVG or transparent PNG. */
  logo: string
  url: Field<string>
  confirmed: boolean
}

export type Person = {
  name: string
  firm: string
  designation: Field<string>
  photo: Field<string | null>
  order: number
  confirmed: boolean
}

export type Stat = { value: Field<string>; label: string }

export type GalleryPhoto = { src: Field<string | null>; alt: string; tag: string }
