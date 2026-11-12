// Browser-side client for the registration backend (same FastAPI code as apps/backend). Requests
// go to /api/*, which next.config.ts proxies to REGISTRATION_API_URL.

/** Field names match the backend's form fields, which still carry JMCL's names for last season. */
export type PlayerForm = {
  first_name: string
  last_name: string
  email: string
  phone: string
  residential_area: string
  firm_name: string
  designation: string
  aadhar_number: string
  city: string
  village: string
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

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(`/api${path}`, init)
  } catch {
    throw new Error("Couldn't reach the registration server. Check your connection and try again.")
  }
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const detail = body?.detail
    // FastAPI sends a string for HTTPException and a list for validation errors.
    if (typeof detail === "string") throw new Error(detail)
    if (Array.isArray(detail) && typeof detail[0]?.msg === "string") throw new Error(detail[0].msg)
    throw new Error("Something went wrong. Please try again.")
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
  const p = await request<PlayerDetails>(`/player/${encodeURIComponent(playerId)}`)
  return {
    first_name: p.first_name,
    last_name: p.last_name,
    email: p.email,
    phone: p.phone,
    residential_area: p.residential_area,
    firm_name: p.firm_name,
    designation: p.designation,
    aadhar_number: p.aadhar_number.replace(/(\d{4})(?=\d)/g, "$1 "),
    city: p.city,
    village: p.village,
    batting_type: p.batting_type,
    bowling_type: p.bowling_type,
    wicket_keeper: p.wicket_keeper,
    name_on_jersey: p.name_on_jersey,
    tshirt_size: p.tshirt_size,
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
