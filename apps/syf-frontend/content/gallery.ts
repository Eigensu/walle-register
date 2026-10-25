// Six best photos from NSPL and conclaves (PDF p4 #8). Real photos only: put files in public/photos/.

import { field } from "../lib/content"
import type { GalleryPhoto } from "../lib/site-types"

const pending = (tag: string, alt: string): GalleryPhoto => ({
  src: field<string | null>(null, false, `${tag} photo`),
  alt,
  tag,
})

export const gallery: GalleryPhoto[] = [
  pending("NSPL Season 1", "Final match of NSPL Season 1"),
  pending("Conclave", "Speakers at the SYF business conclave"),
  pending("NSPL Season 1", "Team celebrating a wicket"),
  pending("NSPL Season 1", "Trophy presentation"),
  pending("Conclave", "Members networking at the conclave"),
  pending("NSPL Season 1", "Batting during a league match"),
]
