"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import { ArrowLeft, ArrowRight, CircleCheck, CircleAlert, Loader2, LockKeyhole, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { track } from "@/lib/analytics"
import { formatInr } from "@/lib/format"
import { payWithCashfree } from "@/lib/cashfree"
import { clearPendingPayment, loadPendingPayment, savePendingPayment } from "@/lib/pending-payment"
import { payWithRazorpay } from "@/lib/razorpay"
import {
  createCashfreeOrder,
  createOrder,
  getPaymentGateways,
  getPlayer,
  getPlayerWithRetry,
  isTransientError,
  registerPlayer,
  updatePlayer,
  verifyCashfreePaymentWithRetry,
  verifyPayment,
  type CashfreeVerifyResponse,
  type CreateOrderResponse,
  type PaymentGateway,
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
import { PaymentUnconfirmed } from "./payment-unconfirmed"
import { Stepper } from "./stepper"

type Props = {
  /** Player id from /register?resume=…, to finish paying for a saved registration. */
  resumeId: string | null
  /** Cashfree order id from /register?order_id=…, when checkout came back from a bank or UPI redirect. */
  returnOrderId: string | null
  previousSeason: { label: string; teams: string[] }
  /** "NSPL Season 2" */
  eventLabel: string
  feeLabel: string | null
  rules: string[]
  payment: { name: string; description: string; color: string }
}

type Errors = Partial<Record<keyof PlayerForm, string>>
type Notice = { kind: "success" | "error"; text: string } | null

const gatewayLabels: Record<PaymentGateway, string> = { razorpay: "Razorpay", cashfree: "Cashfree" }

/** A Cashfree payment that may already have taken money: never offer to pay again. */
const inFlight = (status: CashfreeVerifyResponse["status"]) => status === "PENDING" || status === "NEEDS_REVIEW"

const empty: PlayerForm = {
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  residential_area: "",
  firm_name: "",
  gst_number: "",
  designation: "",
  aadhar_number: "",
  city: "",
  batting_type: "",
  bowling_type: "",
  wicket_keeper: "",
  name_on_jersey: "",
  jersey_number: "",
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

const GSTIN = /^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/

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
    if (v.gst_number && !GSTIN.test(v.gst_number)) e.gst_number = "Enter a valid 15-character GST number, or leave it blank"
    need("designation", "Enter your designation")
    need("residential_area", "Enter your residential area")
    need("city", "Enter your city")
    if (v.aadhar_number.replace(/\D/g, "").length !== aadharDigits) e.aadhar_number = `Enter all ${aadharDigits} digits`
    const photo = photoError(v.photo)
    if (photo) e.photo = photo
  }
  if (step === "cricket") {
    need("batting_type", "Choose your batting style")
    if (!bowlingTypes.some((option) => option.value === v.bowling_type)) e.bowling_type = "Choose your bowling style"
    need("wicket_keeper", "Tell us whether you keep wicket")
  }
  if (step === "jersey") {
    need("name_on_jersey", "Enter the name for your jersey")
    if (v.jersey_number && (!/^\d{1,2}$/.test(v.jersey_number) || Number(v.jersey_number) > 99)) e.jersey_number = "Enter a number from 0 to 99"
    if (!tshirtSizes.some((option) => option.value === v.tshirt_size)) e.tshirt_size = "Choose a T-shirt size"
    need("waist_size", "Choose a waist size")
  }
  if (step === "history") {
    need("played_JMCL_S2", "Choose yes or no")
    if (v.played_JMCL_S2 === "yes") need("JMCL_S2_team", "Tell us which team you played for")
  }
  return e
}

const formSteps: RegistrationStepId[] = ["details", "cricket", "jersey", "history"]

export function RegistrationForm({ resumeId, returnOrderId, previousSeason, eventLabel, feeLabel, rules, payment }: Props) {
  const [values, setValues] = useState<PlayerForm>(empty)
  const [errors, setErrors] = useState<Errors>({})
  const [step, setStep] = useState<RegistrationStepId>("details")
  const [playerId, setPlayerId] = useState<string | null>(null)
  const [order, setOrder] = useState<CreateOrderResponse | null>(null)
  const [gateways, setGateways] = useState<PaymentGateway[] | null>(null)
  const [gateway, setGateway] = useState<PaymentGateway | null>(null)
  // Set when a Cashfree payment is still processing or under review, so the player can't pay twice.
  const [payLocked, setPayLocked] = useState(false)
  // A Cashfree payment we couldn't get an answer about, e.g. no connection yet after a UPI app.
  const [unconfirmed, setUnconfirmed] = useState<{ orderId: string; playerId: string | null } | null>(null)
  const [checking, setChecking] = useState(false)
  // Waiting for the backend to confirm a Cashfree payment the player has just made.
  const [confirming, setConfirming] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)
  const [busy, setBusy] = useState(false)
  const [loading, setLoading] = useState(Boolean(resumeId || returnOrderId))
  // Picking up a payment that was started before this page (re)loaded, with no ?order_id in the URL.
  const [recovering, setRecovering] = useState(false)
  const [rulesAccepted, setRulesAccepted] = useState(Boolean(resumeId || returnOrderId))
  const [rulesDialogOpen, setRulesDialogOpen] = useState(false)
  const [rulesReadToEnd, setRulesReadToEnd] = useState(false)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const rulesContentRef = useRef<HTMLDivElement>(null)
  const firstRender = useRef(true)
  const alive = useRef(true)
  const checkingRef = useRef(false)

  // Lets a retry loop stop once the page has gone. Declared first so it is set before the effects below run.
  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  useEffect(() => {
    if (!rulesDialogOpen) return
    const content = rulesContentRef.current
    if (content) setRulesReadToEnd(content.scrollHeight <= content.clientHeight + 2)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setRulesDialogOpen(false)
    }
    window.addEventListener("keydown", onKeyDown)
    return () => window.removeEventListener("keydown", onKeyDown)
  }, [rulesDialogOpen])

  // Which gateways the backend accepts right now (PAYMENT_GATEWAYS). The first one is preselected.
  useEffect(() => {
    let cancelled = false
    getPaymentGateways()
      .catch((): PaymentGateway[] => ["razorpay"])
      .then((list) => {
        if (cancelled) return
        setGateways(list)
        setGateway((current) => (current && list.includes(current) ? current : list[0]))
      })
    return () => {
      cancelled = true
    }
  }, [])

  /**
   * Asks the backend how a Cashfree order ended and shows the outcome: after a bank or UPI redirect,
   * when the page reloads mid-payment, and when re-checking an unconfirmed payment. It retries a request
   * that doesn't get through, and never throws: a connection that stays down becomes the calm
   * "unconfirmed" screen rather than an error, because the player may well have paid.
   */
  const resolveOrder = useCallback(
    async (orderId: string, knownPlayerId: string | null, { announceErrors, delays }: { announceErrors: boolean; delays?: number[] }) => {
      const retry = { isCancelled: () => !alive.current, ...(delays && { delays }) }
      try {
        const result = await verifyCashfreePaymentWithRetry(orderId, knownPlayerId ?? undefined, retry)
        // A page that merely reloaded (no ?order_id=) must not show a saved registration's details
        // on a browser that may now belong to someone else, unless the payment actually needs them.
        if (!announceErrors && result.status !== "CAPTURED" && !inFlight(result.status)) {
          if (!alive.current) return
          setUnconfirmed(null)
          clearPendingPayment()
          return
        }
        const player = await getPlayerWithRetry(result.player_id, retry)
        if (!alive.current) return
        setUnconfirmed(null)
        setValues(player)
        setPlayerId(result.player_id)
        setGateway("cashfree")
        if (result.status === "CAPTURED") {
          clearPendingPayment()
          track("registration_paid", { gateway: "cashfree" })
          setStep("done")
          return
        }
        // Still processing or under review: keep the order so a reload picks it up again.
        if (!inFlight(result.status)) clearPendingPayment()
        setStep("payment")
        setPayLocked(inFlight(result.status))
        setNotice({ kind: "error", text: inFlight(result.status) ? result.message : `${result.message} Your details are saved.` })
      } catch (err) {
        if (!alive.current) return
        if (isTransientError(err)) {
          setUnconfirmed((previous) => (previous?.orderId === orderId ? previous : { orderId, playerId: knownPlayerId }))
          return
        }
        setUnconfirmed(null)
        clearPendingPayment()
        if (announceErrors) setNotice({ kind: "error", text: (err as Error).message })
      }
    },
    [],
  )

  // Back from a Cashfree bank or UPI redirect (?order_id=…), or the page was reloaded or discarded
  // while the player was in their UPI app: find out how the order ended.
  useEffect(() => {
    if (resumeId) return
    const stored = loadPendingPayment()
    const orderId = returnOrderId ?? stored?.orderId
    if (!orderId) return
    setRulesAccepted(true)
    if (!returnOrderId) {
      setRecovering(true)
      setLoading(true)
    }
    void resolveOrder(orderId, stored?.orderId === orderId ? stored.playerId : null, { announceErrors: Boolean(returnOrderId) }).finally(() => {
      if (alive.current) setLoading(false)
    })
  }, [returnOrderId, resumeId, resolveOrder])

  // Check an unconfirmed payment again: on request, when the connection or the page comes back, and
  // every so often. The backend confirms paid orders by itself, so this is usually a matter of time.
  const checkAgain = useCallback(async () => {
    if (!unconfirmed || checkingRef.current) return
    checkingRef.current = true
    setChecking(true)
    try {
      await resolveOrder(unconfirmed.orderId, unconfirmed.playerId, { announceErrors: true, delays: [1500, 3000] })
    } finally {
      checkingRef.current = false
      if (alive.current) setChecking(false)
    }
  }, [unconfirmed, resolveOrder])

  useEffect(() => {
    if (!unconfirmed) return
    const recheck = () => {
      if (document.visibilityState === "visible") void checkAgain()
    }
    const timer = window.setInterval(recheck, 15_000)
    window.addEventListener("online", recheck)
    window.addEventListener("pageshow", recheck)
    document.addEventListener("visibilitychange", recheck)
    return () => {
      window.clearInterval(timer)
      window.removeEventListener("online", recheck)
      window.removeEventListener("pageshow", recheck)
      document.removeEventListener("visibilitychange", recheck)
    }
  }, [unconfirmed, checkAgain])

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
    if (!playerId || !gateway || payLocked) return
    setBusy(true)
    setNotice(null)
    try {
      if (gateway === "cashfree") await payByCashfree(playerId)
      else await payByRazorpay(playerId)
    } catch (err) {
      // A used-up order can't be paid again; get a fresh one on the next try.
      setOrder(null)
      setNotice({ kind: "error", text: (err as Error).message })
    } finally {
      setBusy(false)
    }
  }

  async function payByCashfree(id: string) {
    // Cashfree appends "?order_id=…" to this when a bank or UPI page sends the payer back.
    const returnUrl = `${window.location.origin}${window.location.pathname}`
    const created = await createCashfreeOrder(id, returnUrl)
    // Remember the order until we know how it ended: if this page is reloaded or discarded while the
    // player is in a UPI app, the next load asks the backend about it instead of losing the payment.
    savePendingPayment({ orderId: created.order_id, playerId: id })
    let outcome: Awaited<ReturnType<typeof payWithCashfree>>
    try {
      outcome = await payWithCashfree(created)
    } catch (err) {
      clearPendingPayment() // checkout never opened, so nothing was paid
      throw err
    }
    if (outcome === "redirected") return
    setConfirming(true)
    let result: CashfreeVerifyResponse
    try {
      // The first request after returning from a UPI app often fails, so this retries it.
      result = await verifyCashfreePaymentWithRetry(created.order_id, id, { isCancelled: () => !alive.current })
    } catch (err) {
      // Still no answer: the player may have paid, so don't show an error or offer to pay again.
      if (isTransientError(err)) {
        if (alive.current) setUnconfirmed({ orderId: created.order_id, playerId: id })
        return
      }
      clearPendingPayment()
      throw err
    } finally {
      setConfirming(false)
    }
    if (result.status === "CAPTURED") {
      clearPendingPayment()
      track("registration_paid", { gateway: "cashfree" })
      setStep("done")
      return
    }
    if (inFlight(result.status)) {
      setPayLocked(true)
      setNotice({ kind: "error", text: result.message })
      return
    }
    clearPendingPayment()
    setNotice({ kind: "error", text: "Payment wasn't completed. Your details are saved, so you can try again whenever you're ready." })
  }

  async function payByRazorpay(id: string) {
    const created = order ?? (await createOrder(id))
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
    await verifyPayment({ player_id: id, ...result })
    track("registration_paid", { gateway: "razorpay" })
    setStep("done")
  }

  function next() {
    if (step === "details" && !rulesAccepted) {
      setRulesDialogOpen(true)
      return
    }
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
    setPayLocked(false)
    setNotice(null)
    setRulesAccepted(false)
    setStep("details")
  }

  if (loading) {
    return (
      <div role="status" className="flex flex-col items-center gap-3 py-20 text-ink-muted">
        <Loader2 className="size-7 animate-spin text-royal" aria-hidden="true" />
        {(returnOrderId && !resumeId) || recovering ? "Confirming your payment…" : "Loading your registration…"}
      </div>
    )
  }

  if (unconfirmed) return <PaymentUnconfirmed playerId={unconfirmed.playerId} checking={checking} onCheck={() => void checkAgain()} />

  const active = steps[index(step)]
  const fullName = `${values.first_name} ${values.last_name}`.trim()
  const amount = order ? formatInr(order.amount / 100) : feeLabel

  return (
    <section aria-labelledby="form-step-title" className="scroll-mt-24">
      {step === "details" && (
        <div className="mb-8 rounded-xl border border-line bg-mist p-4 sm:p-5">
          <label className="flex cursor-pointer items-start gap-3 text-sm font-medium leading-relaxed text-navy">
            <input
              type="checkbox"
              checked={rulesAccepted}
              onChange={(event) => {
                if (event.currentTarget.checked) {
                  setRulesReadToEnd(false)
                  setRulesDialogOpen(true)
                } else {
                  setRulesAccepted(false)
                }
              }}
              className="mt-0.5 size-4 shrink-0 accent-royal"
              aria-label="Read and accept the NSPL player registration rules"
            />
            <span>I have read and accept the NSPL Player Registration Rules.</span>
          </label>
          {!rulesAccepted && <p className="ml-7 mt-1 text-xs text-ink-muted">Open the rules and scroll to the bottom to accept before continuing.</p>}
        </div>
      )}

      {rulesDialogOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-navy/75 p-3 backdrop-blur-sm sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setRulesDialogOpen(false)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="registration-rules-title"
            className="flex max-h-[min(90dvh,48rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-2xl"
          >
            <div className="border-b border-line px-5 py-4 sm:px-7">
              <h2 id="registration-rules-title" className="font-display text-2xl text-navy sm:text-3xl">NSPL – Player Registration Rules</h2>
              <p className="mt-1 text-sm text-ink-muted">Read all rules and scroll to the end before accepting.</p>
            </div>
            <div
              ref={rulesContentRef}
              onScroll={(event) => {
                const element = event.currentTarget
                if (element.scrollTop + element.clientHeight >= element.scrollHeight - 8) setRulesReadToEnd(true)
              }}
              className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-7"
            >
              <ol className="flex flex-col gap-5">
                {rules.map((rule, index) => {
                  const separator = rule.indexOf(":")
                  return (
                    <li key={index} className="flex gap-3 text-sm leading-relaxed text-ink-muted sm:text-base">
                      <span className="font-sport font-semibold text-royal">{String(index + 1).padStart(2, "0")}</span>
                      <span>
                        {separator >= 0 ? <><strong className="text-navy">{rule.slice(0, separator)}:</strong>{rule.slice(separator + 1)}</> : rule}
                      </span>
                    </li>
                  )
                })}
              </ol>
              <p className="mt-6 border-t border-line pt-5 text-sm font-bold leading-relaxed text-navy">PLEASE READ ALL RULES CAREFULLY BEFORE REGISTERING.</p>
            </div>
            <div className="flex flex-col-reverse gap-3 border-t border-line bg-mist px-5 py-4 sm:flex-row sm:justify-end sm:px-7">
              <Button type="button" variant="outlineLight" onClick={() => setRulesDialogOpen(false)}>Not now</Button>
              <Button
                type="button"
                disabled={!rulesReadToEnd}
                onClick={() => {
                  setRulesAccepted(true)
                  setRulesDialogOpen(false)
                }}
              >
                I accept the rules
              </Button>
            </div>
          </section>
        </div>
      )}

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
                name="gst_number"
                label="GST number (optional)"
                autoComplete="off"
                placeholder="Enter GSTIN"
                maxLength={15}
                value={values.gst_number}
                error={errors.gst_number}
                hint="Optional. If provided, it will appear on your invoice."
                onValue={(v) => set("gst_number", v.replace(/\s/g, "").toUpperCase())}
              />
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
                placeholder="Eg. Lalbaug, Malad, Parel"
                autoComplete="address-level3"
                value={values.residential_area}
                error={errors.residential_area}
                onValue={(v) => set("residential_area", v)}
              />
              <TextField name="city" label="City" autoComplete="address-level2" value={values.city} error={errors.city} onValue={(v) => set("city", v)} />
              <TextField
                name="aadhar_number"
                label="Aadhaar number"
                inputMode="numeric"
                autoComplete="off"
                placeholder="XXXX XXXX XXXX"
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
              <TextField
                name="jersey_number"
                label="Jersey number (optional)"
                type="number"
                min={0}
                max={99}
                inputMode="numeric"
                value={values.jersey_number}
                error={errors.jersey_number}
                onValue={(v) => set("jersey_number", v)}
              />
              <SelectField
                name="tshirt_size"
                label="T-shirt size"
                placeholder="Select T-shirt size"
                options={tshirtSizes}
                value={values.tshirt_size}
                error={errors.tshirt_size}
                onValue={(v) => set("tshirt_size", v)}
              />
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
                  <div className="max-w-md">
                    <SelectField
                      name="JMCL_S2_team"
                      label="Which team?"
                      placeholder="Select your team"
                      options={previousSeason.teams}
                      value={values.JMCL_S2_team}
                      error={errors.JMCL_S2_team}
                      onValue={(v) => set("JMCL_S2_team", v)}
                    />
                  </div>
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
                  Secure checkout{gateway ? ` by ${gatewayLabels[gateway]}` : ""}. Pay by UPI, card or net banking. Your slot is confirmed once the payment goes
                  through.
                </p>
              </div>
              {gateways && gateways.length > 1 && (
                <ChoiceGroup
                  name="payment_gateway"
                  legend="Pay with"
                  options={gateways.map((g) => gatewayLabels[g])}
                  value={gateway ? gatewayLabels[gateway] : ""}
                  onValue={(label) => {
                    const picked = gateways.find((g) => gatewayLabels[g] === label)
                    if (picked) setGateway(picked)
                  }}
                />
              )}
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
              <Button type="submit" disabled={busy || (step === "details" && !rulesAccepted)}>
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
            <Button type="button" onClick={pay} disabled={busy || !playerId || !gateway || payLocked} className="sm:ml-auto">
              {busy ? (
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  {confirming ? "Confirming your payment…" : "Opening checkout…"}
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
