// Remembers a Cashfree order the player has started paying for, until we know how it ended.
//
// A phone that goes to a UPI app and back can reload or discard the registration page, losing the
// order it was waiting on. Keeping the order id here lets the page ask the backend what happened
// when it next loads, instead of leaving a player who has paid on a blank form.
//
// localStorage, not sessionStorage: a discarded iOS tab can come back as a different tab.
// Storage can be unavailable (private mode, blocked cookies), so every access is guarded.

const KEY = "syf:pending-cashfree-payment"
const MAX_AGE_MS = 24 * 60 * 60 * 1000

export type PendingPayment = { orderId: string; playerId: string; startedAt: number }

export function savePendingPayment(payment: Pick<PendingPayment, "orderId" | "playerId">, now = Date.now()): void {
  try {
    window.localStorage.setItem(KEY, JSON.stringify({ ...payment, startedAt: now } satisfies PendingPayment))
  } catch {
    // Without storage the in-page flow and the return URL still work.
  }
}

/** The order still waiting for a result, or null. A record older than a day is dropped. */
export function loadPendingPayment(now = Date.now()): PendingPayment | null {
  try {
    const raw = window.localStorage.getItem(KEY)
    if (!raw) return null
    const value: unknown = JSON.parse(raw)
    if (
      value &&
      typeof value === "object" &&
      typeof (value as PendingPayment).orderId === "string" &&
      typeof (value as PendingPayment).playerId === "string" &&
      typeof (value as PendingPayment).startedAt === "number" &&
      now - (value as PendingPayment).startedAt < MAX_AGE_MS
    ) {
      return value as PendingPayment
    }
    window.localStorage.removeItem(KEY)
  } catch {
    // Unreadable or unavailable: treat as nothing pending.
  }
  return null
}

export function clearPendingPayment(): void {
  try {
    window.localStorage.removeItem(KEY)
  } catch {
    // Nothing to clear.
  }
}
