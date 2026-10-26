"use client"

import { useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, CircleCheck, CircleAlert, Loader2, LockKeyhole, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { track } from "@/lib/analytics"
import { formatInr } from "@/lib/format"
import { payWithRazorpay } from "@/lib/razorpay"
import {
  createOrder,
  getPlayer,
  registerPlayer,
  updatePlayer,
  verifyPayment,
  type CreateOrderResponse,
  type PlayerForm,
} from "@/lib/registration-api"
import {
  aadharDigits,
  battingTypes,
  bowlingTypes,
  photoRules,
  registrationSteps as steps,
  tshirtSizes,
  waistSizes,
  yesNo,
  type RegistrationStepId,
} from "@/content/registration"
import { ChoiceGroup, fieldId, PhotoField, SelectField, TextField } from "./fields"
import { Stepper } from "./stepper"

type Props = {
  /** Player id from /register?resume=…, to finish paying for a saved registration. */
  resumeId: string | null
  previousSeason: { label: string; teams: string[] }
  /** "NSPL Season 2" */
  eventLabel: string
  feeLabel: string | null
  payment: { name: string; description: string; color: string }
}

type Errors = Partial<Record<keyof PlayerForm, string>>
type Notice = { kind: "success" | "error"; text: string } | null

const empty: PlayerForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  residential_area: "",
  firm_name: "",
  designation: "",
  aadhar_number: "",
  city: "",
  village: "",
  batting_type: "",
  bowling_type: "",
  wicket_keeper: "",
  name_on_jersey: "",
  tshirt_size: "",
  waist_size: "",
  played_JMCL_S2: "",
  JMCL_S2_team: "",
  photo: null,
}

const EMAIL = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i
const index = (id: RegistrationStepId) => steps.findIndex((s) => s.id === id)

function photoError(photo: PlayerForm["photo"]): string | undefined {
  if (!photo) return "Add a passport-size photo"
  if (typeof photo === "string") return undefined
  const ext = photo.name.slice(photo.name.lastIndexOf(".")).toLowerCase()
  // Some phones send HEIC with an empty type, so fall back to the extension.
  if (!photoRules.mimes.includes(photo.type) && !photoRules.extensions.includes(ext)) return "Use a JPG, PNG or HEIC photo"
  if (photo.size > photoRules.maxBytes) return "The photo must be under 10 MB"
  return undefined
}

function validate(step: RegistrationStepId, v: PlayerForm): Errors {
  const e: Errors = {}
  const need = (key: keyof PlayerForm, message: string) => {
    if (!String(v[key] ?? "").trim()) e[key] = message
  }
  if (step === "details") {
    need("first_name", "Enter your first name")
    need("last_name", "Enter your last name")
    if (!EMAIL.test(v.email.trim())) e.email = "Enter a valid email address"
    if (!/^\d{10}$/.test(v.phone)) e.phone = "Enter your 10-digit mobile number"
    need("firm_name", "Enter your firm's name")
    need("designation", "Enter your designation")
    need("residential_area", "Enter your residential area")
    need("city", "Enter your city")
    need("village", "Enter your native village")
    if (v.aadhar_number.replace(/\D/g, "").length !== aadharDigits) e.aadhar_number = `Enter all ${aadharDigits} digits`
    const photo = photoError(v.photo)
    if (photo) e.photo = photo
  }
  if (step === "cricket") {
    need("batting_type", "Choose your batting style")
    need("bowling_type", "Choose your bowling style")
    need("wicket_keeper", "Tell us whether you keep wicket")
  }
  if (step === "jersey") {
    need("name_on_jersey", "Enter the name for your jersey")
    need("tshirt_size", "Choose a T-shirt size")
    need("waist_size", "Choose a waist size")
  }
  if (step === "history") {
    need("played_JMCL_S2", "Choose yes or no")
    if (v.played_JMCL_S2 === "yes") need("JMCL_S2_team", "Tell us which team you played for")
  }
  return e
}

const formSteps: RegistrationStepId[] = ["details", "cricket", "jersey", "history"]

export function RegistrationForm({ resumeId, previousSeason, eventLabel, feeLabel, payment }: Props) {
  const [values, setValues] = useState<PlayerForm>(empty)
  const [errors, setErrors] = useState<Errors>({})
  const [step, setStep] = useState<RegistrationStepId>("details")
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [order, setOrder] = useState<CreateOrderResponse | null>(null)
  const [notice, setNotice] = useState<Notice>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(Boolean(resumeId))
  const headingRef = useRef<HTMLHeadingElement>(null)
  const firstRender = useRef(true)

  // Resuming: load the saved registration and go straight to payment.
  useEffect(() => {
    if (!resumeId) return
    let cancelled = false
    getPlayer(resumeId)
      .then((player) => {
        if (cancelled) return
        setValues(player)
        setPlayerId(resumeId)
        setStep("payment")
        setNotice({ kind: "success", text: "Welcome back. Complete your payment to confirm your slot." })
      })
      .catch((err: Error) => !cancelled && setNotice({ kind: "error", text: err.message }))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [resumeId])

  // Bring each new step into view and move focus to its heading.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false
      return
    }
    headingRef.current?.focus({ preventScroll: true })
    headingRef.current?.closest("section")?.scrollIntoView({ behavior: "smooth", block: "start" })
    track("registration_step", { step })
  }, [step])

  const set = <K extends keyof PlayerForm>(key: K, value: PlayerForm[K]) => {
    setValues((v) => ({ ...v, [key]: value }))
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }))
  }

  function check(stepsToCheck: RegistrationStepId[]): boolean {
    for (const s of stepsToCheck) {
      const found = validate(s, values)
      const keys = Object.keys(found) as (keyof PlayerForm)[]
      if (keys.length) {
        setErrors(found)
        setStep(s)
        setNotice({ kind: "error", text: keys.length === 1 ? "Please fix the highlighted field." : `Please fix the ${keys.length} highlighted fields.` })
        // Wait for the step to render before focusing its first problem.
        requestAnimationFrame(() => document.getElementById(fieldId(keys[0]))?.focus())
        return false
      }
    }
    setErrors({})
    setNotice(null)
    return true
  }

  async function saveDetails() {
    if (!check(formSteps)) return
    setBusy(true)
    try {
      const cleaned = { ...values, email: values.email.trim(), JMCL_S2_team: values.played_JMCL_S2 === "yes" ? values.JMCL_S2_team : "" }
      const res = playerId ? await updatePlayer(playerId, cleaned) : await registerPlayer(cleaned)
      setPlayerId(res.player_id)
      setOrder(null)
      track("registration_saved", { updated: Boolean(playerId) })
      setNotice({ kind: "success", text: "Your details are saved. Pay the registration fee to confirm your slot." })
      setStep("payment")
    } catch (err) {
      setNotice({ kind: "error", text: (err as Error).message })
    } finally {
      setBusy(false)
    }
  }

  async function pay() {
    if (!playerId) return
    setBusy(true)
    setNotice(null)
    try {
      const created = order ?? (await createOrder(playerId))
      setOrder(created)
      const result = await payWithRazorpay({
        order: created,
        name: payment.name,
        description: payment.description,
        color: payment.color,
        prefill: { name: `${values.first_name} ${values.last_name}`.trim(), email: values.email, contact: values.phone },
      })
      if (!result) {
        setNotice({ kind: "error", text: "Payment wasn't completed. Your details are saved, so you can try again whenever you're ready." })
        return
      }
      await verifyPayment({ player_id: playerId, ...result })
      track("registration_paid")
      setNotice(null)
      setStep("done")
    } catch (err) {
      // A used-up order can't be paid again; get a fresh one on the next try.
      setOrder(null)
      setNotice({ kind: "error", text: (err as Error).message })
    } finally {
      setBusy(false)
    }
  }

  function next() {
    const i = formSteps.indexOf(step)
    if (step === "history") return void saveDetails()
    if (check([step])) setStep(formSteps[i + 1])
  }

  function back() {
    setNotice(null)
    setErrors({})
    setStep(formSteps[Math.max(0, formSteps.indexOf(step) - 1)])
  }

  function reset() {
    setValues(empty)
    setErrors({})
    setPlayerId(null)
    setOrder(null)
    setNotice(null)
    setStep("details")
  }

  if (loading) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-20 text-ink-muted">
        <Loader2 className="size-7 animate-spin text-royal" aria-hidden="true" />
        Loading your registration…
      </div>
    )
  }

  const active = steps[index(step)]
  const fullName = `${values.first_name} ${values.last_name}`.trim()
  const amount = order ? formatInr(order.amount / 100) : feeLabel

  return (
    <section aria-labelledby="form-step-title" className="scroll-mt-24">
      <Stepper steps={steps} active={index(step)} />

      <form
        noValidate
        className="mt-10"
        onSubmit={(e) => {
          e.preventDefault()
          if (formSteps.includes(step)) next()
        }}
      >
        <div className="flex flex-col gap-1 border-b border-line pb-6">
          <h2 id="form-step-title" ref={headingRef} tabIndex={-1} className="font-display text-3xl text-navy outline-none sm:text-4xl">
            {stepTitle(step, previousSeason.label)}
          </h2>
          <p className="text-ink-muted">{active.helper}</p>
        </div>

        <div className="pt-8">
          {step === "details" && (
            <div className="grid gap-6 sm:grid-cols-2">
              <TextField name="first_name" label="First name" autoComplete="given-name" value={values.first_name} error={errors.first_name} onValue={(v) => set("first_name", v)} />
              <TextField name="last_name" label="Last name" autoComplete="family-name" value={values.last_name} error={errors.last_name} onValue={(v) => set("last_name", v)} />
              <TextField
                name="email"
                label="Email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={values.email}
                error={errors.email}
                hint="We'll send your confirmation here"
                onValue={(v) => set("email", v)}
              />
              <TextField
                name="phone"
                label="Mobile number"
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                prefix="+91"
                maxLength={10}
                placeholder="98765 43210"
                value={values.phone}
                error={errors.phone}
                hint="10 digits, WhatsApp preferred"
                onValue={(v) => set("phone", v.replace(/\D/g, "").slice(0, 10))}
              />
              <TextField name="firm_name" label="Firm / organisation" autoComplete="organization" value={values.firm_name} error={errors.firm_name} onValue={(v) => set("firm_name", v)} />
              <TextField
                name="designation"
                label="Designation"
                autoComplete="organization-title"
                placeholder="Owner, partner or director"
                value={values.designation}
                error={errors.designation}
                onValue={(v) => set("designation", v)}
              />
              <TextField
                name="residential_area"
                label="Residential area"
                autoComplete="address-level3"
                value={values.residential_area}
                error={errors.residential_area}
                onValue={(v) => set("residential_area", v)}
              />
              <TextField name="city" label="City" autoComplete="address-level2" value={values.city} error={errors.city} onValue={(v) => set("city", v)} />
              <TextField name="village" label="Native village" value={values.village} error={errors.village} onValue={(v) => set("village", v)} />
              <TextField
                name="aadhar_number"
                label="Aadhaar number"
                inputMode="numeric"
                autoComplete="off"
                placeholder="XXXX XXXX XXXX XXXX"
                maxLength={aadharDigits + Math.ceil(aadharDigits / 4) - 1}
                value={values.aadhar_number}
                error={errors.aadhar_number}
                hint={`${aadharDigits} digits. Used only to verify your identity`}
                onValue={(v) =>
                  set(
                    "aadhar_number",
                    v
                      .replace(/\D/g, "")
                      .slice(0, aadharDigits)
                      .replace(/(\d{4})(?=\d)/g, "$1 "),
                  )
                }
              />
              <div className="sm:col-span-2">
                <PhotoField
                  name="photo"
                  label="Passport-size photo"
                  hint={photoRules.hint}
                  accept={[...photoRules.mimes, ...photoRules.extensions].join(",")}
                  value={values.photo}
                  error={errors.photo}
                  onFile={(file) => {
                    set("photo", file)
                    setErrors((e) => ({ ...e, photo: photoError(file) }))
                  }}
                />
              </div>
            </div>
          )}

          {step === "cricket" && (
            <div className="flex flex-col gap-9">
              <ChoiceGroup name="batting_type" legend="Batting" options={battingTypes} value={values.batting_type} error={errors.batting_type} onValue={(v) => set("batting_type", v)} />
              <ChoiceGroup
                name="bowling_type"
                legend="Bowling"
                options={bowlingTypes}
                columns="sm:grid-cols-2 lg:grid-cols-3"
                value={values.bowling_type}
                error={errors.bowling_type}
                onValue={(v) => set("bowling_type", v)}
              />
              <ChoiceGroup name="wicket_keeper" legend="Do you keep wicket?" options={yesNo} value={values.wicket_keeper} error={errors.wicket_keeper} onValue={(v) => set("wicket_keeper", v)} />
            </div>
          )}

          {step === "jersey" && (
            <div className="flex flex-col gap-9">
              <div className="max-w-md">
                <TextField
                  name="name_on_jersey"
                  label="Name on jersey"
                  maxLength={15}
                  value={values.name_on_jersey}
                  error={errors.name_on_jersey}
                  hint={`${values.name_on_jersey.length}/15 characters`}
                  className="font-sport text-lg uppercase tracking-wider"
                  onValue={(v) => set("name_on_jersey", v)}
                />
              </div>
              <ChoiceGroup
                name="tshirt_size"
                legend="T-shirt size"
                options={tshirtSizes}
                columns="grid-cols-4 sm:grid-cols-8"
                value={values.tshirt_size}
                error={errors.tshirt_size}
                onValue={(v) => set("tshirt_size", v)}
              />
              <div className="max-w-xs">
                <SelectField
                  name="waist_size"
                  label="Waist size (inches)"
                  placeholder="Select waist size"
                  options={waistSizes}
                  value={values.waist_size}
                  error={errors.waist_size}
                  onValue={(v) => set("waist_size", v)}
                />
              </div>
            </div>
          )}

          {step === "history" && (
            <div className="flex flex-col gap-9">
              <ChoiceGroup
                name="played_JMCL_S2"
                legend={`Did you play in ${previousSeason.label}?`}
                options={yesNo}
                value={values.played_JMCL_S2 === "yes" ? "Yes" : values.played_JMCL_S2 === "no" ? "No" : ""}
                error={errors.played_JMCL_S2}
                onValue={(v) => set("played_JMCL_S2", v.toLowerCase())}
              />
              {values.played_JMCL_S2 === "yes" &&
                (previousSeason.teams.length ? (
                  <ChoiceGroup
                    name="JMCL_S2_team"
                    legend="Which team?"
                    options={previousSeason.teams}
                    columns="sm:grid-cols-2 lg:grid-cols-3"
                    value={values.JMCL_S2_team}
                    error={errors.JMCL_S2_team}
                    onValue={(v) => set("JMCL_S2_team", v)}
                  />
                ) : (
                  <div className="max-w-md">
                    <TextField name="JMCL_S2_team" label="Which team?" value={values.JMCL_S2_team} error={errors.JMCL_S2_team} onValue={(v) => set("JMCL_S2_team", v)} />
                  </div>
                ))}
            </div>
          )}

          {step === "payment" && (
            <div className="flex flex-col gap-5">
              <dl className="grid gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3">
                {[
                  ["Player", fullName],
                  ["Email", values.email],
                  ["Mobile", values.phone && `+91 ${values.phone}`],
                ].map(([label, value]) => (
                  <div key={label} className="bg-paper px-5 py-4">
                    <dt className="eyebrow text-ink-muted">{label}</dt>
                    <dd className="mt-2 truncate font-medium text-navy">{value || "—"}</dd>
                  </div>
                ))}
              </dl>
              <div className="on-navy flex flex-col gap-5 rounded-xl bg-navy p-6 text-silver-bright sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="eyebrow text-silver">{eventLabel} · Registration fee</p>
                  {amount ? (
                    <p className="type-stat silver-text mt-3">{amount}</p>
                  ) : (
                    <p className="mt-3 font-display text-2xl text-silver-bright">Shown at checkout</p>
                  )}
                </div>
                <p className="flex max-w-xs items-start gap-2 text-sm text-silver">
                  <LockKeyhole className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
                  Secure checkout by Razorpay. Pay by UPI, card or net banking. Your slot is confirmed once the payment goes through.
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setNotice(null)
                  setStep("details")
                }}
                className="inline-flex items-center gap-2 self-start rounded-sm text-[0.9375rem] font-semibold text-royal underline-offset-4 hover:underline"
              >
                <Pencil className="size-4" aria-hidden="true" />
                Edit my details
              </button>
            </div>
          )}

          {step === "done" && (
            <div className="flex flex-col items-start gap-5 rounded-xl border border-line bg-mist p-6 sm:p-8">
              <CircleCheck className="size-10 text-royal" aria-hidden="true" />
              <div>
                <p className="font-display text-3xl text-navy">You&rsquo;re registered{values.first_name && `, ${values.first_name}`}.</p>
                <p className="mt-3 max-w-prose text-ink-muted">
                  Your payment for {eventLabel} is received. A confirmation email is on its way to <strong className="text-navy">{values.email}</strong>. Registration
                  doesn&rsquo;t guarantee a place in a team; the organisers will be in touch about the next steps.
                </p>
              </div>
              {playerId && (
                <p className="text-sm text-ink-muted">
                  Registration ID <span className="font-mono font-semibold text-navy">{playerId}</span>
                </p>
              )}
            </div>
          )}
        </div>

        {notice && (
          <div
            role={notice.kind === "error" ? "alert" : "status"}
            className={
              notice.kind === "error"
                ? "mt-8 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-800"
                : "mt-8 flex items-start gap-3 rounded-lg border border-royal/20 bg-royal/[0.06] px-4 py-3 text-sm font-medium text-navy"
            }
          >
            {notice.kind === "error" ? (
              <CircleAlert className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            ) : (
              <CircleCheck className="mt-0.5 size-4 shrink-0 text-royal" aria-hidden="true" />
            )}
            {notice.text}
          </div>
        )}

        <div className="mt-10 flex flex-col-reverse gap-3 border-t border-line pt-8 sm:flex-row sm:items-center sm:justify-between">
          {formSteps.includes(step) && (
            <>
              {step !== "details" ? (
                <Button type="button" variant="outlineLight" onClick={back} disabled={busy}>
                  <ArrowLeft aria-hidden="true" />
                  Back
                </Button>
              ) : (
                <span className="hidden sm:block" />
              )}
              <Button type="submit" disabled={busy}>
                {busy ? (
                  <>
                    <Loader2 className="animate-spin" aria-hidden="true" />
                    Saving…
                  </>
                ) : (
                  <>
                    {step === "history" ? "Save and continue to payment" : "Continue"}
                    <ArrowRight aria-hidden="true" />
                  </>
                )}
              </Button>
            </>
          )}
          {step === "payment" && (
            <Button type="button" onClick={pay} disabled={busy || !playerId} className="sm:ml-auto">
              {busy ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  Opening checkout…
                </>
              ) : (
                <>
                  <LockKeyhole aria-hidden="true" />
                  {amount ? `Pay ${amount}` : "Pay registration fee"}
                </>
              )}
            </Button>
          )}
          {step === "done" && (
            <Button type="button" variant="outlineLight" onClick={reset}>
              Register another player
            </Button>
          )}
        </div>
      </form>
    </section>
  )
}

function stepTitle(step: RegistrationStepId, previousSeasonLabel: string): string {
  switch (step) {
    case "details":
      return "About you"
    case "cricket":
      return "Your game"
    case "jersey":
      return "Your kit"
    case "history":
      return previousSeasonLabel
    case "payment":
      return "Review and pay"
    case "done":
      return "All set"
  }
}
