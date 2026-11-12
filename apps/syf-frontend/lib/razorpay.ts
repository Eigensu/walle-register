// Razorpay Checkout, loaded on demand so the script only reaches visitors who pay.

import type { CreateOrderResponse } from "./registration-api"

export type RazorpayResult = { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }

type CheckoutOptions = {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill?: { name?: string; email?: string; contact?: string }
  handler: (response: RazorpayResult) => void
  retry?: { enabled: boolean }
  modal?: { ondismiss?: () => void }
  theme?: { color?: string }
}

declare global {
  interface Window {
    Razorpay?: new (options: CheckoutOptions) => { open: () => void }
  }
}

let loading: Promise<void> | null = null

function loadScript(): Promise<void> {
  if (window.Razorpay) return Promise.resolve()
  loading ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script")
    script.src = "https://checkout.razorpay.com/v1/checkout.js"
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

/** Opens checkout; resolves with Razorpay's signed result, or null if the payer closed the window. */
export async function payWithRazorpay(opts: {
  order: CreateOrderResponse
  name: string
  description: string
  prefill: { name: string; email: string; contact: string }
  color: string
}): Promise<RazorpayResult | null> {
  const key = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  if (!key) throw new Error("Online payment isn't set up yet. Please contact the organisers.")
  await loadScript()
  if (!window.Razorpay) throw new Error("Couldn't start the payment window. Please try again.")
  const Razorpay = window.Razorpay

  return new Promise((resolve) => {
    new Razorpay({
      key,
      amount: opts.order.amount,
      currency: opts.order.currency,
      name: opts.name,
      description: opts.description,
      order_id: opts.order.razorpay_order_id,
      prefill: opts.prefill,
      retry: { enabled: false },
      modal: { ondismiss: () => resolve(null) },
      handler: resolve,
      theme: { color: opts.color },
    }).open()
  })
}
