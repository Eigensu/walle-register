// Silver Youth Forum · NSPL Season 2
// Single source of truth for this site. Anything still owed by SYF is a field(..., false, "note");
// run `pnpm check:content` for the full list.

import { field, mapField } from "./lib/content"
import { formatInr } from "./lib/format"
import type { SiteConfig } from "./lib/site-types"

const registrationFee = field<number | null>(null, false, "SYF to decide the Season 2 registration fee")

export const site: SiteConfig = {
  org: {
    name: "Silver Youth Forum",
    shortName: "SYF",
    description: field(
      "Young entrepreneurs and leaders from India's silver jewellery industry.",
      false,
      "Approve the footer one-liner",
    ),
    logo: field(
      {
        onDark: "/brand/syf-logo-on-dark.png",
        onLight: "/brand/syf-logo.png",
        compact: { onDark: "/brand/syf-logo-compact-on-dark.png" },
        mark: "/brand/syf-mark.png",
      },
      true,
    ),
  },
  siteUrl: field(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3001", false, "Domain to be registered in SYF's name"),
  locale: "en-IN",
  timeZone: "Asia/Kolkata",
  timeZoneLabel: "IST",

  theme: {
    colors: {
      navy: "#0E1A2B",
      navyRaised: "#16243A",
      navyLine: "#24324A",
      silver: "#C0C6CF",
      silverBright: "#EEF1F5",
      silverDim: "#8C95A3",
      mist: "#F3F5F8",
      paper: "#FFFFFF",
      line: "#E3E7ED",
      inkMuted: "#4A5568",
      royal: "#2457E6",
      royalHover: "#1C46C2",
      live: "#E5484D",
    },
  },

  nav: [
    { label: "About Us", href: "/about" },
    { label: "NSPL", href: "/nspl" },
    { label: "Our Sponsors", href: "/sponsors" },
    { label: "Committee", href: "/committee" },
    { label: "Gallery", href: "/gallery" },
    { label: "Contact", href: "/contact" },
  ],
  footer: {
    policies: [
      { label: "Privacy Policy", href: "/privacy-policy" },
      { label: "Terms & Conditions", href: "/terms" },
      { label: "Refund & Cancellation Policy", href: "/refund-policy" },
    ],
    credit: null,
  },
  stubPages: {
    nspl: { title: "NSPL", summary: "Season 2 overview, format and rules, teams, fixtures, live stream and past seasons." },
    sponsors: { title: "Our Sponsors", summary: "Our title, associate and team sponsors, and how to become one." },
    committee: { title: "Committee", summary: "The members who run Silver Youth Forum." },
    gallery: { title: "Gallery", summary: "Photos and highlight videos from NSPL and our conclaves." },
    contact: { title: "Contact", summary: "Reach the forum by email, phone or WhatsApp." },
    register: { title: "Register for NSPL", summary: "Season info, fee, eligibility and the player registration form." },
    "privacy-policy": { title: "Privacy Policy", summary: "What player data we collect, why, who sees it and how long we keep it." },
    terms: { title: "Terms & Conditions", summary: "Tournament rules, eligibility and conduct." },
    "refund-policy": { title: "Refund & Cancellation Policy", summary: "When registration fees are refundable and how long refunds take." },
  },

  event: {
    slug: "nspl-s2",
    shortName: "NSPL",
    name: "National Silver Premier League",
    sport: "Cricket",
    seasonLabel: "Season 2",
    href: "/nspl",
    logo: field("/brand/nspl-logo.png", true),
    registration: {
      href: "/register",
      opensAt: field("2026-12-01T10:00:00+05:30", false, "Draft: PDF says early December"),
      closesAt: field("2026-12-20T23:59:00+05:30", false, "Draft: deadline not decided"),
      fee: registrationFee,
      cap: field<number | null>(null, false, "Player cap not decided"),
      waitlist: false,
    },
    season: {
      startsAt: field("2027-02-06T09:00:00+05:30", false, "Draft: PDF says February 2027"),
      endsAt: field("2027-02-28T21:00:00+05:30", false, "Draft"),
      matchDays: field(
        [
          "2027-02-06T09:00:00+05:30",
          "2027-02-07T09:00:00+05:30",
          "2027-02-13T09:00:00+05:30",
          "2027-02-14T09:00:00+05:30",
          "2027-02-27T09:00:00+05:30",
          "2027-02-28T09:00:00+05:30",
        ],
        false,
        "Draft match days",
      ),
      liveLabel: field("", false, "Set on match days, e.g. Match 7 · Team A vs Team B"),
      venue: field("", false, "Venue not confirmed"),
    },
    liveStreamUrl: field("", false, "YouTube live link for match days"),
    teamsPublished: false,
  },

  home: {
    sections: ["hero", "stats", "about", "featuredEvent", "sponsors", "people", "gallery"],
    hero: {
      eyebrow: "Silver Youth Forum",
      headline: field("Uniting the\n*Silver* Fraternity", true),
      subcopy: field(
        "Young entrepreneurs and leaders of India's silver jewellery industry, building what comes next, on and off the pitch.",
        false,
        "Draft sub copy for SYF approval",
      ),
      photo: field<string | null>(null, false, "NSPL Season 1 action photo"),
      secondaryCta: { label: "About SYF", href: "/about" },
      showSpotsLeft: false,
    },
    stats: { minimumToShow: 3 },
    about: {
      eyebrow: "About the forum",
      heading: "The next generation of\n*Indian silver*",
      body: field(
        "Silver Youth Forum is a vibrant and forward-thinking collective of young entrepreneurs and leaders from the Silver Jewellery Industry of India. Committed to innovation, collaboration and growth, the forum serves as a platform for knowledge sharing, networking, and industry development.",
        true,
      ),
      pillars: ["Knowledge sharing", "Networking", "Industry development"],
      photo: field<string | null>(null, false, "Group photo of the forum"),
      link: { label: "Read more about SYF", href: "/about" },
    },
    featuredEvent: {
      eyebrow: "NSPL · Season 2",
      heading: "Young leaders.\nOne industry.\nOne pitch.",
      body: field(
        "National Silver Premier League (NSPL) is a flagship cricketing extravaganza organized by Silver Youth Forum. This first-of-its-kind initiative brings together leading companies from the Indian Silver Jewellery industry on one pitch.",
        true,
      ),
      facts: [
        { label: "When", value: field("February 2027", true) },
        { label: "Title sponsor", value: field("Silver Show of India", true) },
        { label: "Format", value: field("", false, "Format not confirmed") },
        { label: "Registration fee", value: mapField(registrationFee, (n) => (n == null ? "" : formatInr(n))) },
      ],
      photo: field<string | null>(null, false, "NSPL action photo"),
      link: { label: "Explore NSPL", href: "/nspl" },
    },
    sponsors: {
      eyebrow: "Our sponsors",
      heading: field("Backed by the industry", false, "Draft heading"),
      enquire: { label: "Become a sponsor", href: "/sponsors#enquire" },
      utmSource: "silveryouthforum",
      utmCampaign: "nspl_s2",
    },
    people: {
      eyebrow: "The people behind SYF",
      heading: field("Led by the industry's next generation", false, "Draft heading"),
      teaserCount: 6,
      link: { label: "Meet the committee", href: "/committee" },
    },
    gallery: {
      eyebrow: "Gallery",
      heading: field("Moments from NSPL and our conclaves", false, "Draft heading"),
      link: { label: "View gallery", href: "/gallery" },
    },
  },

  contact: {
    email: field("", false, "Official SYF email"),
    phone: field("", false, "Official SYF phone"),
    whatsapp: field("", false, "WhatsApp number, digits with country code, e.g. 919800000000"),
    address: field("", false, "Official address"),
  },
  social: [
    { label: "Instagram", url: field("", false, "Instagram handle URL") },
    { label: "YouTube", url: field("", false, "YouTube channel URL") },
  ],
  analytics: { provider: null, id: "" },
}
