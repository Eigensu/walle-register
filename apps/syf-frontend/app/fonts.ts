// Three faces, one job each (SPEC-HOME §4.2). next/font needs static calls, so fonts live here
// rather than in site.config.ts; a new event swaps them in this file.

import { Barlow_Condensed, Geist, Instrument_Serif } from "next/font/google"

export const displayFont = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display-face",
})

export const sportFont = Barlow_Condensed({
  weight: ["500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sport-face",
})

export const sansFont = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans-face",
})

export const fontVariables = [displayFont.variable, sportFont.variable, sansFont.variable].join(" ")
