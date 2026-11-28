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
  member(1, "Jayesh Rathod", "Silbells Jewellery Pvt. Ltd.", "/committee/collage-01-jayesh-rathod.webp"),
  member(2, "Anil Jain", "Queens & Kings", "/committee/collage-02-anil-jain.webp"),
  member(3, "Ritesh Doshi", "Richezza Royal 925 Sterling Silver Jewellery", "/committee/collage-03-ritesh-doshi.webp"),
  member(4, "Suraj Mehta", "RS Bullion", "/committee/collage-04-suraj-mehta.webp"),
  member(5, "Aman Singhvi", "Arihant 925 Jewellery Pvt. Ltd. (AJPL)", "/committee/collage-05-aman-singhvi.webp"),
  member(6, "Akshay Mehta", "Mehta Properties", "/committee/collage-06-akshay-mehta.webp"),
  member(7, "Akshay Navlakha", "Divine Silver", "/committee/collage-07-akshay-navlakha.webp"),
  member(8, "Vivek Kabra", "JewelBuzz", "/committee/collage-08-vivek-kabra.webp"),
  member(9, "Sumeet Jain", "Silbells", "/committee/collage-09-sumeet-jain.webp"),
  member(10, "Kartik Jain", "Tresorie", "/committee/collage-10-kartik-jain.webp"),
  member(11, "Chetan Rajawat", "J'Riti Riwaaz", "/committee/collage-11-chetan-rajawat.webp"),
  member(12, "Pavan Jain", "Antraa Silver", "/committee/collage-12-pavan-jain.webp"),
]
