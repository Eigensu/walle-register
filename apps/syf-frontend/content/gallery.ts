// Optimized event photographs supplied in D:/eigensu/SYF Photos.
// Keep this list as the shared source for the homepage highlights and gallery page.

import { field } from "../lib/content"
import type { GalleryPhoto } from "../lib/site-types"

type Photo = GalleryPhoto & { featured?: boolean }

const photo = (folder: string, file: string, tag: string, alt: string, featured = false): Photo => ({
  src: field<string | null>(`/photos/nspl-season-1/${folder}/${file}`, true),
  alt,
  tag,
  featured,
})

export const gallery: Photo[] = [
  photo("opening-day", "01_img_8070.webp", "Opening Day", "The NSPL Season 1 crest at the tournament opening."),
  photo("opening-day", "02_img_8114.webp", "Opening Day", "Organizers and guests take part in the NSPL opening ceremony."),
  photo("opening-day", "03_img_8147.webp", "Opening Day", "Players gather in team colours before the opening matches.", true),
  photo("opening-day", "04_img_8179.webp", "Opening Day", "The teams line up together on the cricket ground."),
  photo("opening-day", "05_img_8187.webp", "Opening Day", "The purple team poses together before a match."),
  photo("opening-day", "06_img_8201.webp", "Opening Day", "Guests gather for the ceremonial opening of the league."),
  photo("opening-day", "07_img_8223.webp", "Opening Day", "Dignitaries unveil the NSPL tournament branding."),
  photo("opening-day", "08_img_8232.webp", "Opening Day", "The NSPL Season 1 launch ceremony with players and guests."),
  photo("opening-day", "09_img_8259.webp", "Opening Day", "The tournament trophy displayed at the ground."),
  photo("opening-day", "10_img_8283.webp", "Opening Day", "A commemorative watch presented for the tournament."),
  photo("opening-day", "11_img_8302.webp", "Opening Day", "Players and guests assemble at the opening-day venue."),
  photo("opening-day", "12_gkp_3460.webp", "Opening Day", "A player receives an award during the opening matches."),
  photo("opening-day", "13_gkp_3452.webp", "Opening Day", "Players pose with the tournament award."),

  photo("match-action", "01_img_8330.webp", "Match Action", "A bowler delivers a ball during an NSPL match."),
  photo("match-action", "02_img_8355.webp", "Match Action", "A bowler follows through as the batter prepares to play."),
  photo("match-action", "03_img_8366.webp", "Match Action", "A batter plays a shot during a daytime fixture.", true),
  photo("match-action", "04_img_8384.webp", "Match Action", "An orange-shirted player watches the ball after a delivery."),
  photo("match-action", "05_img_8423.webp", "Match Action", "Teammates regroup for a brief huddle on the field."),
  photo("match-action", "06_img_8453.webp", "Match Action", "A player celebrates during a close match."),
  photo("match-action", "07_img_9018.webp", "Match Action", "A player walks across the ground between overs."),
  photo("match-action", "08_img_9320.webp", "Match Action", "Fielders take their positions across the cricket ground."),
  photo("match-action", "09_img_9354.webp", "Match Action", "Players and officials follow the action from the field."),
  photo("match-action", "10_ast01505.webp", "Match Day", "Players and guests watch a match from the pavilion."),
  photo("match-action", "11_ast01507.webp", "Match Day", "Guests share a moment together during match day."),
  photo("match-action", "12_ast01554.webp", "Match Action", "Players gather in a huddle before returning to play.", true),
  photo("match-action", "13_ast01948.webp", "Match Action", "A player pauses between plays during the tournament."),
  photo("match-action", "14_ast01949.webp", "Match Action", "A close view of a player in the NSPL tournament jersey."),
  photo("match-action", "15_ast02182.webp", "Night Match", "A batter faces a delivery under the ground lights."),
  photo("match-action", "16_ast02262.webp", "Night Match", "Batters run between the wickets in a night fixture."),

  photo("night-ceremony", "01_ast01974.webp", "Night Ceremony", "A winner's trophy displayed before the evening ceremony."),
  photo("night-ceremony", "02_ast01998.webp", "Night Ceremony", "Players and guests gather on the award stage."),
  photo("night-ceremony", "03_ast02027.webp", "Night Ceremony", "The NSPL evening ceremony begins with a celebration on the field."),
  photo("night-ceremony", "04_ast02040.webp", "Night Ceremony", "Players and guests take part in the awards presentation."),
  photo("night-ceremony", "05_ast02055.webp", "Night Ceremony", "Teams gather for the presentation during the night ceremony."),
  photo("night-ceremony", "06_ast02067.webp", "Night Ceremony", "The assembled teams celebrate beneath the tournament lights.", true),
  photo("night-ceremony", "07_ast02078.webp", "Night Ceremony", "Players celebrate together after the final whistle."),
  photo("night-ceremony", "08_gkp_4211.webp", "Night Ceremony", "The award presentation continues amid the evening celebrations."),

  photo("finals-awards", "01_ast02307.webp", "Finals & Awards", "Players celebrate with the trophy after the final."),
  photo("finals-awards", "02_ast02327.webp", "Finals & Awards", "The team lifts its trophy during the finals celebration."),
  photo("finals-awards", "03_ast02353.webp", "Finals & Awards", "A tournament award is presented to a player."),
  photo("finals-awards", "04_ast02368.webp", "Finals & Awards", "A player makes a run during the finals."),
  photo("finals-awards", "05_ast02386.webp", "Finals & Awards", "Finalists gather for the NSPL Season 1 awards."),
  photo("finals-awards", "06_ast02432.webp", "Finals & Awards", "Players and organizers celebrate together at the awards presentation.", true),
  photo("finals-awards", "07_ast02447.webp", "Finals & Awards", "The winning squad celebrates on the awards stage."),
  photo("finals-awards", "08_ast02467.webp", "Finals & Awards", "The champions pose with the NSPL trophy."),
  photo("finals-awards", "09_gkp_4272.webp", "Finals & Awards", "Players regroup on the field during the finals."),
  photo("finals-awards", "10_gkp_4389.webp", "Finals & Awards", "The championship team receives its trophy."),
  photo("finals-awards", "11_gkp_4401.webp", "Finals & Awards", "The champions hold the trophy at the presentation."),
  photo("finals-awards", "12_gkp_4411.webp", "Finals & Awards", "A player receives an individual tournament award."),

  photo("player-auction", "01_303a4940.webp", "Player Auction", "A team card and cap displayed at the NSPL player auction."),
  photo("player-auction", "02_303a4994.webp", "Player Auction", "Team memorabilia arranged on an auction table."),
  photo("player-auction", "03_303a5067.webp", "Player Auction", "Guests meet and discuss team selections at the auction."),
  photo("player-auction", "04_303a5143.webp", "Player Auction", "Team representatives gather around the auction table."),
  photo("player-auction", "05_303a5213.webp", "Player Auction", "Players and team representatives gather on the auction stage.", true),
  photo("player-auction", "06_303a5270.webp", "Player Auction", "The player auction brings teams and league organizers together."),
  photo("player-auction", "07_303a5359.webp", "Player Auction", "A team representative receives recognition at the auction."),
]
