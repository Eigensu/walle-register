// Approved NSPL Season 2 sponsor artwork supplied in the sponsor logo archive.
// Role labels are used where the archive gives a sponsorship role but no separate brand name.
import { field } from "../lib/content"
import type { Sponsor } from "../lib/site-types"

const roleSponsor = (key: string, name: string, hasLogo = true): Sponsor => ({
  key,
  name,
  tier: "partner",
  logo: hasLogo ? `/brand/sponsors/${key}.png` : "",
  url: field("", false, "Sponsor website not supplied"),
  confirmed: true,
})

export const sponsors: Sponsor[] = [
  {
    key: "silver-show-of-india",
    name: "Silver Show of India",
    tier: "title",
    logo: "/brand/sponsors/title-sponsor.png",
    url: field("https://silvershowofindia.com", true),
    confirmed: true,
  },
  // Order follows the committee's list. Naplog is one sponsor for the auction, launch and logistics roles.
  roleSponsor("powered-by", "Powered By"),
  roleSponsor("auction-partner", "Auction, Launch & Logistics Partner"),
  roleSponsor("food-partner", "Food Partner"),
  roleSponsor("jersey-partner", "Jersey Partner"),
  roleSponsor("boundary-partner", "Boundary Partner"),
  roleSponsor("youtube-partner", "YouTube Partner"),
  roleSponsor("hydration-partner", "Hydration Partner"),
  roleSponsor("toss-ka-boss", "Toss Ka Boss"),
  roleSponsor("cap-partner", "Cap Partner"),
  roleSponsor("trophy-partner", "Trophy Partner"),
  roleSponsor("kit-partner", "Kit Partner"),
  roleSponsor("man-of-the-match-partner", "Man of the Match Partner"),
  roleSponsor("ground-partner", "Venue Partner"),
  roleSponsor("vip-dugout-partner", "VIP Dugout Partner"),
  roleSponsor("wicket-partner", "Wicket Partner"),
  roleSponsor("match-officials-partner", "Match Officials Partner"),
  roleSponsor("powerplay-partner", "PowerPlay Partner"),
  roleSponsor("innings-partner", "Innings Partner"),
]
