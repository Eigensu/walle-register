import type { Metadata } from "next"
import { AboutExperience } from "@/components/sections/about-experience"

export const revalidate = 60

export const metadata: Metadata = {
  title: "About Silver Youth Forum",
  description:
    "Meet the young entrepreneurs and leaders bringing India's silver jewellery industry together through knowledge, connection and sport.",
  alternates: { canonical: "/about" },
}

export default function AboutPage() {
  return <AboutExperience />
}
