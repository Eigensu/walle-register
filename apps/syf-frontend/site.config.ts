// Silver Youth Forum · NSPL Season 2
// Single source of truth for this site. Anything still owed by SYF is a field(..., false, "note");
// run `pnpm check:content` for the full list.

import { field, mapField } from "./lib/content"
import { formatInr } from "./lib/format"
import type { SiteConfig } from "./lib/site-types"

const registrationFee = field<number | null>(7200, true)

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
  siteUrl: field(process.env.NEXT_PUBLIC_SITE_URL || "https://silveryouthforum.com", true),
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
  stubPages: {},

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
      opensAt: field("2026-11-24T00:00:00+05:30", true),
      closesAt: field("2026-12-20T23:59:00+05:30", false, "Draft: deadline not decided"),
      fee: registrationFee,
      cap: field<number | null>(null, false, "Player cap not decided"),
      waitlist: false,
      rules: field(
        [
          "Limited Slots: Registration does not guarantee participation. Slots are limited and subject to confirmation.",
          "Online Payment: Registration fees must be paid online only. Your slot is secured only after successful payment. Incorrect or mismatched details may lead to cancellation.",
          "Eligibility: Only Owners, Partners and Directors of Silver Jewellery Manufacturing and Wholesale Firms are eligible. Employees and top management personnel are not eligible.",
          "One Entry Only: Only one registration per player is allowed.",
          "Full Availability: Register only if you can attend all practice sessions and the tournament (12-13-14 February 2027). No show may lead to blacklist in future seasons.",
          "Business Proof: A valid GST Registration Certificate is preferred as proof of eligibility. However, other relevant business documents may also be considered at the discretion of the NSPL Organising Committee.",
          "Final Decision: All decisions of the NSPL Organising Committee will be final and binding.",
        ],
        true,
      ),
      previousSeason: {
        label: "NSPL Season 1",
        teams: field<string[]>([
          "Purple Panthers",
          "T Silvi Sterling Stars",
          "Silverzone Rising Star",
          "Maa Silver Kings",
          "Mexx Mavericks",
          "Divine Dynamites",
          "Marvelous Mysha",
          "Ksp Comets",
          "Kuber Bullion Kings (A X 11)",
          "A.O.S. Tigers (Navkar Knights)",
        ], true),
      },
      paymentName: "NSPL Season 2 registration",
    },
    season: {
      startsAt: field("2027-02-12T09:00:00+05:30", true),
      endsAt: field("2027-02-14T21:00:00+05:30", true),
      matchDays: field(
        ["2027-02-12T09:00:00+05:30", "2027-02-13T09:00:00+05:30", "2027-02-14T09:00:00+05:30"],
        true,
      ),
      liveLabel: field("", false, "Set on match days, e.g. Match 7 · Team A vs Team B"),
      venue: field("Police Gymkhana", true),
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
      photo: field<string | null>("/photos/nspl-season-1/hero/syf-launch-cover.webp", true),
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
      photo: field<string | null>("/photos/nspl-season-1/player-auction/05_303a5213.webp", true),
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
        { label: "When", value: field("12–14 February 2027", true) },
        { label: "Title sponsor", value: field("Silver Show of India", true) },
      ],
      photo: field<string | null>("/photos/nspl-season-1/match-action/03_img_8366.webp", true),
      link: { label: "Explore NSPL", href: "/nspl" },
    },
    sponsors: {
      eyebrow: "Our Sponsors",
      heading: field("", true),
      enquire: { label: "Become a sponsor", href: "/sponsors#enquire" },
      utmSource: "silveryouthforum",
      utmCampaign: "nspl_s2",
    },
    people: {
      eyebrow: "The people behind SYF",
      heading: field("Led by the industry's next generation", false, "Draft heading"),
      teaserCount: 12,
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
    phone: field("+91 90298 87172", true),
    whatsapp: field("", false, "WhatsApp number, digits with country code, e.g. 919800000000"),
    address: field("OFFICE NO. 2, 1ST FLOOR, RAJBAUG ESTATE, 47/55, ABOVE B. BHAGAT TARACHAND, PYDHONIE, TAMBAKATA, MUMBAI 400003", true),
  },
  social: [
    { label: "Instagram", url: field("https://www.instagram.com/officialnsyf", true) },
    { label: "YouTube", url: field("", false, "YouTube channel URL") },
  ],
  analytics: { provider: null, id: "" },
}
