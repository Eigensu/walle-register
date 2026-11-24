// Browser-side client for the registration backend (same FastAPI code as apps/backend). Requests
// go to /api/*, which next.config.ts proxies to REGISTRATION_API_URL.

import { withRetry, type RetryOptions } from "./retry"

/** Field names match the backend's form fields, which still carry JMCL's names for last season. */
export type PlayerForm = {
  first_name: string
  last_name: string
  email: string
  phone: string
  residential_area: string
  firm_name: string
  gst_number: string
  designation: string
  aadhar_number: string
  city: string
  batting_type: string
  bowling_type: string
  wicket_keeper: string
  name_on_jersey: string
  tshirt_size: string
  waist_size: string
  played_JMCL_S2: string
  JMCL_S2_team: string
  /** A new upload, or the stored photo's URL when resuming a registration. */
  photo: File | string | null
}

export type CreateOrderResponse = { razorpay_order_id: string; amount: number; currency: string; player_id: string }

type PlayerDetails = Omit<PlayerForm, "photo" | "waist_size"> & { player_id: string; photo_url: string; waist_size: number }

function currentBowlingValue(value: string): string {
  if (value === "Non-Bowler") return "none"
  if (value.startsWith("Right Arm ")) return "right_arm"
  if (value.startsWith("Left Arm ")) return "left_arm"
  return value
}

/** A failed API call. `status` is the HTTP status, or null when no response came back at all. */
export class ApiError extends Error {
  status: number | null

  constructor(message: string, status: number | null) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

/**
 * The request may never have reached the server, or the server was briefly unavailable, so asking
 * again can work. A phone that was switched to a UPI app and back often fails its first request.
 */
export const isTransientError = (err: unknown): boolean =>
  err instanceof ApiError && (err.status === null || err.status === 408 || err.status === 429 || err.status >= 500)

/** Aborts a request that hangs, which iOS can do for a page that was in the background. */
const timeoutSignal = (ms: number): AbortSignal | undefined =>
  typeof AbortSignal !== "undefined" && typeof AbortSignal.timeout === "function" ? AbortSignal.timeout(ms) : undefined

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`/api${path}`, init)
  } catch {
    throw new ApiError("Couldn't reach the registration server. Check your connection and try again.", null)
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const detail = body?.detail
    // FastAPI sends a string for HTTPException and a list for validation errors.
    if (typeof detail === "string") throw new ApiError(detail, res.status)
    if (Array.isArray(detail) && typeof detail[0]?.msg === "string") throw new ApiError(detail[0].msg, res.status)
    throw new ApiError("Something went wrong. Please try again.", res.status)
  }
  return res.json() as Promise<T>
}

const json = (body: unknown): RequestInit => ({
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify(body),
})

function toFormData(values: PlayerForm): FormData {
  const data = new FormData()
  for (const [key, value] of Object.entries(values)) {
    if (value instanceof File) data.append(key, value)
    // A stored photo URL is not re-sent; the backend keeps the existing photo on update.
    else if (key !== "photo" && value != null) data.append(key, String(value))
  }
  return data
}

export const registerPlayer = (values: PlayerForm) =>
  request<{ player_id: string; message: string }>("/register", { method: "POST", body: toFormData(values) })

export const updatePlayer = (playerId: string, values: PlayerForm) =>
  request<{ player_id: string; message: string }>(`/player/${encodeURIComponent(playerId)}`, {
    method: "PUT",
    body: toFormData(values),
  })

export async function getPlayer(playerId: string): Promise<PlayerForm> {
  const p = await request<PlayerDetails>(`/player/${encodeURIComponent(playerId)}`, { signal: timeoutSignal(15_000) })
  return {
    first_name: p.first_name,
    last_name: p.last_name,
    email: p.email,
    phone: p.phone,
    residential_area: p.residential_area,
    firm_name: p.firm_name,
    gst_number: p.gst_number ?? "",
    designation: p.designation,
    aadhar_number: p.aadhar_number.replace(/(\d{4})(?=\d)/g, "$1 "),
    city: p.city,
    batting_type: p.batting_type,
    bowling_type: currentBowlingValue(p.bowling_type),
    wicket_keeper: p.wicket_keeper,
    name_on_jersey: p.name_on_jersey,
    // The previous 4XL option corresponds to the vendor's XXXXL label.
    // Keep unknown historical sizes (such as 5XL) visible to validation so the player can choose a supported size.
    tshirt_size: p.tshirt_size === "4XL" ? "XXXXL" : p.tshirt_size,
    waist_size: String(p.waist_size),
    played_JMCL_S2: p.played_JMCL_S2,
    JMCL_S2_team: p.JMCL_S2_team,
    photo: p.photo_url,
  }
}

export const findPendingRegistration = (email: string) => request<{ player_id: string }>("/resume-payment", json({ email }))

export const createOrder = (playerId: string) => request<CreateOrderResponse>("/payments/create-order", json({ player_id: playerId }))

export const verifyPayment = (payload: {
  player_id: string
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}) => request<{ status: string; message: string }>("/payments/verify", json(payload))

export type PaymentGateway = "razorpay" | "cashfree"

/** Gateways the backend accepts (its PAYMENT_GATEWAYS setting), in display order. */
export async function getPaymentGateways(): Promise<PaymentGateway[]> {
  const config = await request<{ payment_gateways?: string[] }>("/config", { cache: "no-store" })
  const gateways = (config.payment_gateways ?? ["razorpay"]).filter((g): g is PaymentGateway => g === "razorpay" || g === "cashfree")
  return gateways.length ? gateways : ["razorpay"]
}

export type CashfreeOrderResponse = {
  order_id: string
  payment_session_id: string
  /** Paise, like the Razorpay order. */
  amount: number
  currency: string
  player_id: string
  mode: string
}

/** CAPTURED is paid. PENDING and NEEDS_REVIEW may already have taken money, so don't offer to pay again. */
export type CashfreeStatus = "CAPTURED" | "PENDING" | "NEEDS_REVIEW" | "FAILED" | "NOT_PAID"

export type CashfreeVerifyResponse = { status: CashfreeStatus; message: string; player_id: string }

/** returnUrl is where Cashfree sends the payer back after a bank or UPI redirect; "?order_id=…" is appended. */
export const createCashfreeOrder = (playerId: string, returnUrl: string) =>
  request<CashfreeOrderResponse>("/payments/cashfree/create-order", json({ player_id: playerId, return_url: returnUrl }))

/** Asks the backend to confirm the order with Cashfree; the browser's own result proves nothing. */
export const verifyCashfreePayment = (orderId: string, playerId?: string) =>
  request<CashfreeVerifyResponse>("/payments/cashfree/verify", {
    ...json({ order_id: orderId, player_id: playerId }),
    signal: timeoutSignal(15_000),
  })

/**
 * Confirms a Cashfree order, trying again if the request fails to get through. This is what a player
 * needs right after paying: the money is gone, so a single dropped request mustn't look like a failed
 * payment. Rejects only once every attempt has failed (or for an error that retrying can't fix).
 */
export const verifyCashfreePaymentWithRetry = (orderId: string, playerId?: string, options?: Partial<RetryOptions>) =>
  withRetry(() => verifyCashfreePayment(orderId, playerId), { retryIf: isTransientError, ...options })

export const getPlayerWithRetry = (playerId: string, options?: Partial<RetryOptions>) =>
  withRetry(() => getPlayer(playerId), { retryIf: isTransientError, ...options })
