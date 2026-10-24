// Numbers strip. The PDF suggests these four; SYF supplies the real figures.
// Fewer than site.home.stats.minimumToShow publishable stats hides the strip.

import { field } from "../lib/content"
import type { Stat } from "../lib/site-types"

export const stats: Stat[] = [
  { value: field("", false, "Number of member firms"), label: "Member firms" },
  { value: field("", false, "Number of events held"), label: "Events held" },
  { value: field("", false, "Number of NSPL teams"), label: "NSPL teams" },
  { value: field("", false, "Number of NSPL players"), label: "Players" },
]
