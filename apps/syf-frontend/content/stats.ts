// Numbers strip. The PDF suggests these four; SYF supplies the real figures.
// Fewer than site.home.stats.minimumToShow publishable stats hides the strip.

import { field } from "../lib/content"
import type { Stat } from "../lib/site-types"

export const stats: Stat[] = [
  { value: field("250+", true), label: "Member firms" },
  { value: field("03", true), label: "Events held" },
  { value: field("14", true), label: "NSPL teams" },
  { value: field("182", true), label: "Players" },
]
