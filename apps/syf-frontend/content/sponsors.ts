// Approved NSPL Season 2 sponsor artwork supplied in the sponsor logo archive.
// Role labels are used where the archive gives a sponsorship role but no separate brand name.
import { field } from "../lib/content"
import type { Sponsor } from "../lib/site-types"

const roleSponsor = (key: string, role: string, name: string): Sponsor => ({
  key,
  role,
  name,
  tier: "partner",
  logo: `/brand/sponsors/${key}.png`,
  url: field("", false, "Sponsor website not supplied"),
  confirmed: true,
})

export const sponsors: Sponsor[] = [
  {
    key: "silver-show-of-india",
    name: "Silver Show of India",
    role: "Title Sponsor",
    tier: "title",
    logo: "/brand/sponsors/title-sponsor.png",
    url: field("https://silvershowofindia.com", true),
    confirmed: true,
  },
  roleSponsor("powered-by", "Powered By", "Marvel"),
  roleSponsor("auction-partner", "Auction, Launch & Logistics Partner", "Naplog"),
  roleSponsor("food-partner", "Food Partner", "SACH Developers"),
  roleSponsor("jersey-partner", "Jersey Partner", "Ambika"),
  roleSponsor("boundary-partner", "Boundary Partner", "AJPL"),
  roleSponsor("youtube-partner", "YouTube Partner", "Silver India Heritage"),
  roleSponsor("hydration-partner", "Water Partner", "Richezza"),
  roleSponsor("toss-ka-boss", "Toss Ka Boss", "Antraa"),
  roleSponsor("cap-partner", "Cap Partner", "Silbells"),
  roleSponsor("trophy-partner", "Trophy Partner", "Emerald"),
  roleSponsor("kit-partner", "Kit Partner", "Arya24"),
  roleSponsor("man-of-the-match-partner", "Man of the Match", "Aurous"),
  roleSponsor("ground-partner", "Venue Partner", "Aman Ornament"),
  roleSponsor("vip-dugout-partner", "VIP Dugout Partner", "Ratan Shahi"),
  roleSponsor("wicket-partner", "Wicket Partner", "Aadi"),
  roleSponsor("match-officials-partner", "Match Official Partner", "Silbell"),
  roleSponsor("powerplay-partner", "Powerplay Partner", "PM Bullion"),
  roleSponsor("innings-partner", "Innings Partner", "Mitani Sky"),
]
