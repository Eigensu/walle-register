// Cashfree Checkout (JS SDK v3), loaded on demand so the script only reaches visitors who pay.
// Docs: https://www.cashfree.com/docs/payments/online/web/popup

import type { CashfreeOrderResponse } from "./registration-api"

type CheckoutResult = {
  error?: { message?: string; code?: string }
  redirect?: boolean
  paymentDetails?: { paymentMessage?: string }
}

type CashfreeInstance = {
  checkout: (options: { paymentSessionId: string; redirectTarget?: "_self" | "_modal" }) => Promise<CheckoutResult>
}

declare global {
  interface Window {
    Cashfree?: (options: { mode: "sandbox" | "production" }) => CashfreeInstance
  }
}

let loading: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (window.Cashfree) return Promise.resolve()
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script")
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js"
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => {
      loading = null
      script.remove()
      reject(new Error("Couldn't load the payment window. Check your connection and try again."))
    }
    document.body.appendChild(script)
  })
  return loading
}

/**
 * Opens Cashfree's checkout over the page and resolves when it closes. "redirected" means the
 * browser is leaving for a bank or UPI page and will come back to the order's return URL.
 * The outcome is only a hint: the backend confirms the payment with Cashfree either way.
 */
export async function payWithCashfree(order: CashfreeOrderResponse): Promise<"closed" | "redirected"> {
  await loadScript()
  if (!window.Cashfree) throw new Error("Couldn't start the payment window. Please try again.")
  const mode = order.mode === "production" ? "production" : "sandbox"
  const result = await window.Cashfree({ mode }).checkout({ paymentSessionId: order.payment_session_id, redirectTarget: "_modal" })
  return result?.redirect ? "redirected" : "closed"
}
