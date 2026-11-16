// Client for the backend's /api/admin-panel routes (apps/backend/app/routers/admin_panel.py).
// Requests go to /api/*, which next.config.ts proxies to ADMIN_API_URL.

const TOKEN_KEY = "admin_panel_session"

export type Session = { token: string; username: string; is_owner: boolean }

export type PaymentSummary = {
  status: string | null
  gateway: string | null
  amount: number | null
  currency: string | null
  created_at: string | null
}

export type Overview = {
  registration_open: boolean
  registration_cap: number
  current_registrations: number
  registration_cap_reached: boolean
  by_status: Record<string, number>
}

export type PlayerRow = {
  id: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  registration_status?: string
  created_at?: string
  payment: PaymentSummary | null
}

export type PlayerDetail = {
  player: Record<string, unknown> & { id: string }
  payment: PaymentSummary | null
  payments: Record<string, unknown>[]
}

export type AdminUser = { username: string; is_owner: boolean; created_by: string | null; created_at: string | null }

export class UnauthorizedError extends Error {}

// Kept in memory too, so signing in still works when localStorage is blocked (it just won't survive a reload).
let memorySession: string | null = null
const listeners = new Set<() => void>()

export function readSessionRaw(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? memorySession
  } catch {
    return memorySession
  }
}

export function subscribeSession(listener: () => void): () => void {
  listeners.add(listener)
  window.addEventListener("storage", listener)
  return () => {
    listeners.delete(listener)
    window.removeEventListener("storage", listener)
  }
}

export function getSession(): Session | null {
  const raw = readSessionRaw()
  try {
    return raw ? (JSON.parse(raw) as Session) : null
  } catch {
    return null
  }
}

export function setSession(session: Session | null) {
  memorySession = session ? JSON.stringify(session) : null
  try {
    if (memorySession) localStorage.setItem(TOKEN_KEY, memorySession)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Storage blocked: memorySession still holds it for this tab.
  }
  listeners.forEach((l) => l())
}

async function errorMessage(res: Response): Promise<string> {
  const body = await res.json().catch(() => ({}))
  const detail = body?.detail
  if (typeof detail === "string") return detail
  if (Array.isArray(detail) && typeof detail[0]?.msg === "string") return detail[0].msg
  return `Request failed (${res.status})`
}

async function call(path: string, init: RequestInit = {}): Promise<Response> {
  const session = getSession()
  const headers = new Headers(init.headers)
  if (session) headers.set("Authorization", `Bearer ${session.token}`)
  if (init.body && typeof init.body === "string") headers.set("Content-Type", "application/json")

  let res: Response
  try {
    res = await fetch(`/api/admin-panel${path}`, { ...init, headers, cache: "no-store" })
  } catch {
    throw new Error("Couldn't reach the backend. Check ADMIN_API_URL and that the backend is running.")
  }
  if (res.status === 401 && path !== "/login") {
    setSession(null)
    throw new UnauthorizedError(await errorMessage(res))
  }
  if (!res.ok) throw new Error(await errorMessage(res))
  return res
}

const json = async <T>(path: string, init?: RequestInit) => (await call(path, init)).json() as Promise<T>

export async function login(username: string, password: string): Promise<Session> {
  const session = await json<Session>("/login", { method: "POST", body: JSON.stringify({ username, password }) })
  setSession(session)
  return session
}

export const getOverview = () => json<Overview>("/overview")

export const updateConfig = (patch: { registration_open?: boolean; registration_cap?: number }) =>
  json<Overview>("/config", { method: "PATCH", body: JSON.stringify(patch) })

export type PlayerQuery = { page: number; limit: number; search?: string; registration_status?: string }

function queryString(q: Partial<PlayerQuery>): string {
  const params = new URLSearchParams()
  for (const [k, v] of Object.entries(q)) if (v !== undefined && v !== "") params.set(k, String(v))
  const s = params.toString()
  return s ? `?${s}` : ""
}

export const listPlayers = (q: PlayerQuery) =>
  json<{ players: PlayerRow[]; total: number; page: number; limit: number }>(`/players${queryString(q)}`)

export const getPlayer = (id: string) => json<PlayerDetail>(`/players/${encodeURIComponent(id)}`)

export async function downloadPlayersCsv(q: Omit<PlayerQuery, "page" | "limit">) {
  const res = await call(`/players/export.csv${queryString(q)}`)
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = `players-${new Date().toISOString().slice(0, 10)}.csv`
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(url)
}

export const listAdmins = () => json<{ admins: AdminUser[] }>("/admins")

export const createAdmin = (username: string, password: string) =>
  json<AdminUser>("/admins", { method: "POST", body: JSON.stringify({ username, password }) })

export const deleteAdmin = (username: string) =>
  json<{ deleted: string }>(`/admins/${encodeURIComponent(username)}`, { method: "DELETE" })
