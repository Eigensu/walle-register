// Lists every value still awaiting the client (the "what we need from SYF" checklist) and, for
// production builds, fails if a required one is missing. Runs before `next build`.
//   pnpm check:content

import { existsSync } from "fs"
import path from "path"
import { site } from "../site.config"
import { committee } from "../content/committee"
import { sponsors } from "../content/sponsors"
import { stats } from "../content/stats"
import { gallery } from "../content/gallery"
import { isField, siteEnv, type Field } from "../lib/content"

type Pending = { path: string; note?: string }

function walk(value: unknown, at: string, out: Pending[]) {
  if (isField(value)) {
    if (!value.confirmed) out.push({ path: at, note: value.note })
    return
  }
  if (Array.isArray(value)) value.forEach((v, i) => walk(v, `${at}[${i}]`, out))
  else if (value && typeof value === "object") for (const [k, v] of Object.entries(value)) walk(v, at ? `${at}.${k}` : k, out)
}

const pending: Pending[] = []
walk(site, "site", pending)
walk(committee, "committee", pending)
walk(stats, "stats", pending)
walk(gallery, "gallery", pending)
walk(sponsors, "sponsors", pending)
sponsors.filter((s) => !s.confirmed).forEach((s) => pending.push({ path: `sponsors.${s.key}`, note: "Sponsor not confirmed (hidden in production)" }))

// Confirmed asset paths must point at real files.
const publicDir = path.join(__dirname, "..", "public")
const missingFiles: string[] = []
const checkFile = (f: Field<unknown>, file: string | null | undefined, label: string) => {
  if (f.confirmed && file && !existsSync(path.join(publicDir, file))) missingFiles.push(`${label}: public${file}`)
}
checkFile(site.org.logo, site.org.logo.value.onDark, "site.org.logo.onDark")
checkFile(site.org.logo, site.org.logo.value.onLight, "site.org.logo.onLight")
checkFile(site.event.logo, site.event.logo.value, "site.event.logo")

// Without these, the production site would be missing its identity or contact route.
const required: [string, Field<unknown>][] = [
  ["site.org.logo", site.org.logo],
  ["site.siteUrl", site.siteUrl],
  ["site.home.hero.headline", site.home.hero.headline],
  ["site.contact.email", site.contact.email],
]
const missingRequired = required.filter(([, f]) => !f.confirmed).map(([p]) => p)

const grouped = new Map<string, Pending[]>()
for (const p of pending) {
  const key = p.path.split(/[.[]/)[0] + (p.path.startsWith("site.") ? `.${p.path.split(".")[1]}` : "")
  grouped.set(key, [...(grouped.get(key) ?? []), p])
}

console.log(`\nContent check (${siteEnv}): ${pending.length} item(s) awaiting confirmation\n`)
for (const [group, items] of grouped) {
  console.log(`  ${group}`)
  for (const item of items) console.log(`    · ${item.path}${item.note ? `  (${item.note})` : ""}`)
}
if (missingFiles.length) {
  console.log("\n  Confirmed files that don't exist:")
  missingFiles.forEach((f) => console.log(`    ✗ ${f}`))
}
console.log("")

if (siteEnv === "production" && (missingRequired.length || missingFiles.length)) {
  console.error(`Production build blocked. Required: ${missingRequired.join(", ") || "none"}; missing files: ${missingFiles.length}`)
  process.exit(1)
}
