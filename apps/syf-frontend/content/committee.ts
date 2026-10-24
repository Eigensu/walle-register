// Names and firms as supplied by SYF (blueprint PDF p6). Designations, order and headshots are pending.
// Open item: "Silbells Jewellery Pvt. Ltd." (Jayesh Rathod) vs "Silbells" (Sumit Jain): same firm, which spelling?

import { field } from "../lib/content"
import type { Person } from "../lib/site-types"

const member = (order: number, name: string, firm: string): Person => ({
  name,
  firm,
  designation: field("", false, "Designation TBC"),
  photo: field<string | null>(null, false, "Headshot, front-facing, plain background"),
  order,
  confirmed: true,
})

export const committee: Person[] = [
  member(1, "Jayesh Rathod", "Silbells Jewellery Pvt. Ltd."),
  member(2, "Anil Jain", "Queens & Kings"),
  member(3, "Ritesh Doshi", "Richezza Royal 925 Sterling Silver Jewellery"),
  member(4, "Suraj Mehta", "RS Bullion"),
  member(5, "Aman Singhvi", "Arihant 925 Jewellery Pvt. Ltd. (AJPL)"),
  member(6, "Akshay Mehta", "Mehta Properties"),
  member(7, "Akshay Navlakha", "Divine Silver"),
  member(8, "Vivek Kabra", "JewelBuzz"),
  member(9, "Sumit Jain", "Silbells"),
  member(10, "Kartik Jain", "Tresorie"),
  member(11, "Chetan Rajawat", "J'Riti Riwaaz"),
  member(12, "Pavan Jain", "Antraa Silver"),
]
