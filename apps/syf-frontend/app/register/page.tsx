import type { Metadata } from "next"
import Link from "next/link"
import { Suspense, type ReactNode } from "react"
import { CalendarClock, Loader2 } from "lucide-react"
import { site } from "@/site.config"
import { isPending, isProduction, isTbcSlot, pub, type Field } from "@/lib/content"
import { formatDate, formatInr } from "@/lib/format"
import type { Cta } from "@/lib/phase"
import { getSiteState } from "@/lib/site"
import { cn } from "@/lib/utils"
import { CtaButton } from "@/components/cta-button"
import { SeamRings } from "@/components/brand/seam-rings"
import { TbcBadge, TbcFor } from "@/components/brand/tbc"
import { RegisterGate } from "@/components/register/register-gate"
import { ResumePayment } from "@/components/register/resume-payment"

export const revalidate = 60

const { event, org } = site
const { registration: reg, season } = event
const eventLabel = `${event.shortName} ${event.seasonLabel}`

export const metadata: Metadata = {
  title: `Register for ${eventLabel}`,
  description: `Player registration for the ${event.name} ${event.seasonLabel}, by ${org.name}.`,
}

const date = (iso: string) => formatDate(iso, site.timeZone, site.timeZoneLabel, "date")
const dateTime = (iso: string) => formatDate(iso, site.timeZone, site.timeZoneLabel, "date-time")

function seasonDates(): string | null {
  const start = pub(season.startsAt)
  const end = pub(season.endsAt)
  if (!start) return null
  return end && date(end) !== date(start) ? `${date(start)} to ${date(end)}` : date(start)
}

export default async function RegisterPage() {
  const { phase } = await getSiteState()
  const fee = pub(reg.fee)
  const feeLabel = fee != null ? formatInr(fee) : null
  const opensAt = pub(reg.opensAt)
  const closesAt = pub(reg.closesAt)
  const venue = pub(season.venue)
  const rules = pub(reg.rules) ?? []
  const teams = pub(reg.previousSeason.teams) ?? []

  const open = phase.phase === "open"
  // Dev and preview builds show the form before the window opens, so it can be reviewed.
  const preview = !open && !isProduction && phase.phase === "coming_soon"

  const facts: { label: string; value: string | null; f: Field<unknown> }[] = [
    { label: "Registration fee", value: feeLabel, f: reg.fee },
    { label: open ? "Registrations close" : "Registrations open", value: open ? closesAt && dateTime(closesAt) : opensAt && dateTime(opensAt), f: open ? reg.closesAt : reg.opensAt },
    { label: "Season", value: seasonDates(), f: season.startsAt },
    { label: "Venue", value: venue, f: season.venue },
  ]
  const shownFacts = facts.filter((x) => x.value || isTbcSlot(x.f))

  return (
    <>
      <section aria-labelledby="page-title" className="on-navy grain relative isolate overflow-hidden bg-navy text-silver-bright">
        <SeamRings className="animate-ring-turn absolute -right-60 top-1/2 -z-10 size-[44rem] -translate-y-1/2 text-silver opacity-[0.12]" />
        <div className="container-site pb-14 pt-32 lg:pb-16 lg:pt-40">
          <p className="eyebrow flex flex-wrap items-center gap-3 text-silver">
            <span>
              {event.name} · {event.seasonLabel}
            </span>
            <Badge tone={phase.badge.tone}>{phase.badge.text}</Badge>
          </p>
          <h1 id="page-title" className="type-sport-xl mt-5">
            Register for {event.shortName}
          </h1>
          <p className="mt-6 max-w-[44rem] text-lg leading-relaxed text-silver">
            Player registration for {eventLabel}. It takes about five minutes: your details, your cricket profile, jersey sizes, then the fee. Keep a
            passport-size photo handy.
          </p>

          {shownFacts.length > 0 && (
            <dl className="mt-10 grid grid-cols-2 border-y border-navy-line lg:grid-cols-4">
              {shownFacts.map((x) => (
                <div
                  key={x.label}
                  className="border-navy-line py-4 pr-4 even:border-l even:pl-4 lg:border-l lg:pl-4 lg:first:border-l-0 lg:first:pl-0 [&:nth-child(n+3)]:border-t lg:[&:nth-child(n+3)]:border-t-0"
                >
                  <dt className="eyebrow text-silver-dim">{x.label}</dt>
                  <dd className="mt-2 font-medium text-silver-bright">
                    {x.value ?? <TbcBadge note={x.f.note} />} {x.value && <TbcFor f={x.f} />}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>
      </section>

      <section aria-label="Registration form" className="bg-mist">
        <div className="container-site grid gap-8 py-12 lg:grid-cols-12 lg:gap-12 lg:py-20">
          {/* Phones: rules, form, then "Already registered?". Desktop: rules and resume share the left column. */}
          {rules.length > 0 && (
            <aside className="lg:col-span-4 lg:col-start-1 lg:row-start-1">
              <div className="rounded-2xl border border-line bg-paper p-6">
                <h2 className="eyebrow flex items-center gap-2 text-ink-muted">
                  Before you register <TbcFor f={reg.rules} />
                </h2>
                <ol className="mt-5 flex flex-col gap-4">
                  {rules.map((rule, i) => (
                    <li key={i} className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink-muted">
                      <span className="font-sport text-base font-semibold text-royal">{String(i + 1).padStart(2, "0")}</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </aside>
          )}

          <div className={cn("lg:col-span-8 lg:row-span-2 lg:row-start-1", rules.length > 0 || open || preview ? "lg:col-start-5" : "lg:col-start-3")}>
            <div className="rounded-2xl border border-line bg-paper p-5 shadow-[0_24px_60px_-40px_rgb(14_26_43/0.35)] sm:p-8 lg:p-10">
              {preview && (
                <p className="mb-8 flex items-start gap-2 rounded-lg border border-tbc/30 bg-amber-50 px-4 py-3 text-sm text-tbc">
                  <TbcBadge />
                  <span>
                    Preview only: registrations aren&rsquo;t open yet ({phase.badge.text.toLowerCase()}). Production shows a &ldquo;coming soon&rdquo; panel here
                    until then.
                  </span>
                </p>
              )}
              <Suspense
                fallback={
                  <div className="flex justify-center py-20">
                    <Loader2 className="size-7 animate-spin text-royal" aria-label="Loading" />
                  </div>
                }
              >
                <RegisterGate
                  open={open || preview}
                  eventLabel={eventLabel}
                  feeLabel={feeLabel}
                  previousSeason={{ label: reg.previousSeason.label, teams }}
                  payment={{ name: org.name, description: reg.paymentName, color: site.theme.colors.royal }}
                  closed={<ClosedPanel phase={phase.phase} badge={phase.badge.text} opensAt={opensAt} cta={phase.primaryCta} />}
                />
              </Suspense>
            </div>
            <p className={cn("mt-6 text-center text-sm text-ink-muted", !open && !preview && "hidden")}>
              By registering you agree to our{" "}
              <PolicyLink href="/terms">Terms &amp; Conditions</PolicyLink>, <PolicyLink href="/privacy-policy">Privacy Policy</PolicyLink> and{" "}
              <PolicyLink href="/refund-policy">Refund &amp; Cancellation Policy</PolicyLink>.
            </p>
          </div>

          {(open || preview) && (
            <aside className="lg:col-span-4 lg:col-start-1 lg:row-start-2 lg:self-start">
              <div className="rounded-2xl border border-line bg-paper p-6">
                <h2 className="font-display text-2xl text-navy">Already registered?</h2>
                <p className="mb-5 mt-2 text-[0.9375rem] text-ink-muted">If you saved your details but didn&rsquo;t finish paying, pick up where you left off.</p>
                <ResumePayment registerHref={reg.href} />
              </div>
            </aside>
          )}
        </div>
      </section>
    </>
  )
}

function ClosedPanel({
  phase,
  badge,
  opensAt,
  cta,
}: {
  phase: string
  badge: string
  opensAt: string | null
  cta: Cta
}) {
  const soon = phase === "coming_soon"
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col items-start gap-4">
        <CalendarClock className="size-9 text-royal" aria-hidden="true" />
        <h2 className="font-display text-3xl text-navy sm:text-4xl">{soon ? "Registrations open soon" : badge}</h2>
        <p className="max-w-prose text-ink-muted">
          {soon
            ? opensAt
              ? `The form opens here on ${dateTime(opensAt)}. Come back then to register.`
              : "The dates will be announced shortly. Come back here to register once they open."
            : `${eventLabel} isn't taking new registrations. If you saved your details and still need to pay, continue below.`}
          {soon && opensAt && isPending(reg.opensAt) && <TbcBadge note={reg.opensAt.note} className="ml-2" />}
        </p>
        {cta.href !== reg.href && <CtaButton cta={cta} location="register_closed" variant="outlineLight" />}
      </div>
      {!soon && (
        <div className="border-t border-line pt-8">
          <h3 className="mb-4 font-semibold text-navy">Finish a saved registration</h3>
          <ResumePayment registerHref={reg.href} />
        </div>
      )}
    </div>
  )
}

function Badge({ tone, children }: { tone: "live" | "open" | "neutral"; children: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[0.6875rem] tracking-[0.16em]",
        tone === "open" ? "border-royal/60 bg-royal/20 text-silver-bright" : "border-navy-line bg-navy-raised text-silver",
      )}
    >
      {tone !== "neutral" && <span className={cn("size-1.5 rounded-full", tone === "live" ? "bg-live" : "bg-emerald-400")} aria-hidden="true" />}
      {children}
    </span>
  )
}

function PolicyLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="font-semibold text-royal underline-offset-4 hover:underline">
      {children}
    </Link>
  )
}
