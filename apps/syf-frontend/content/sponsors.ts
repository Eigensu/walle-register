// Logos go in public/brand/sponsors/ (SVG or transparent PNG). Unconfirmed sponsors only show in
// development/preview, so the placeholders below never reach production.

import { field } from "../lib/content"
import type { Sponsor } from "../lib/site-types"

const placeholder = (n: number): Sponsor => ({
  key: `associate-${n}`,
  name: `Associate sponsor ${n}`,
  tier: "associate",
  logo: `/brand/sponsors/associate-${n}.svg`,
  url: field("", false),
  confirmed: false,
})

export const sponsors: Sponsor[] = [
  {
    key: "silver-show-of-india",
    name: "Silver Show of India",
    tier: "title",
    logo: "/brand/sponsors/silver-show-of-india.svg",
    url: field("", false, "Silver Show of India website link"),
    confirmed: true,
  },
  placeholder(1),
  placeholder(2),
  placeholder(3),
  placeholder(4),
]
