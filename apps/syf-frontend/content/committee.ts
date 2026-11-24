// Names and firms as supplied by SYF (blueprint PDF p6). Designations remain pending.
// Open item: "Silbells Jewellery Pvt. Ltd." (Jayesh Rathod) vs "Silbells" (Sumeet Jain): same firm, which spelling?

import { field } from "../lib/content"
import type { Person } from "../lib/site-types"

const member = (order: number, name: string, firm: string, photo: string | null = null): Person => ({
  name,
  firm,
  designation: field("", false, "Designation TBC"),
  photo: photo ? field<string | null>(photo, true) : field<string | null>(null, false, "Headshot, front-facing, plain background"),
  order,
  confirmed: true,
})

export const committee: Person[] = [
  member(1, "Anil Jain", "Queens & Kings", "/committee/01-anil-jain-white.webp"),
  member(2, "Sumeet Jain", "Silbells", "/committee/02-sumeet-jain-white.webp"),
  member(3, "Suraj Mehta", "RS Bullion", "/committee/03-suraj-mehta-white.webp"),
  member(4, "Akshay Navlakha", "Divine Silver", "/committee/04-akshay-navlakha-white.webp"),
  member(5, "Chetan Rajawat", "J'Riti Riwaaz", "/committee/05-chetan-rajawat-white.webp"),
  member(6, "Aman Singhvi", "Arihant 925 Jewellery Pvt. Ltd. (AJPL)", "/committee/06-aman-singhvi-white.webp"),
  member(7, "Kartik Jain", "Tresorie", "/committee/07-kartik-jain-white.webp"),
  member(8, "Ritesh Doshi", "Richezza Royal 925 Sterling Silver Jewellery", "/committee/08-ritesh-doshi-white.webp"),
  member(9, "Jayesh Rathod", "Silbells Jewellery Pvt. Ltd."),
  member(10, "Akshay Mehta", "Mehta Properties"),
  member(11, "Vivek Kabra", "JewelBuzz"),
  member(12, "Pavan Jain", "Antraa Silver"),
]
