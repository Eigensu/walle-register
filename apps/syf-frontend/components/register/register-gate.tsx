"use client"

import { useSearchParams } from "next/navigation"
import type { ComponentProps, ReactNode } from "react"
import { RegistrationForm } from "./registration-form"

type Props = Omit<ComponentProps<typeof RegistrationForm>, "resumeId" | "returnOrderId"> & {
  /** Whether new registrations are accepted right now. */
  open: boolean
  /** What to show instead of the form when registrations aren't open. */
  closed: ReactNode
}

/**
 * A ?resume=<id> link (pay for a saved registration) or ?order_id=<id> (back from a Cashfree bank
 * or UPI redirect) always reopens the form, even when registrations are closed.
 */
export function RegisterGate({ open, closed, ...form }: Props) {
  const params = useSearchParams()
  const resumeId = params.get("resume")
  const returnOrderId = params.get("order_id")
  if (!open && !resumeId && !returnOrderId) return closed
  return <RegistrationForm key={resumeId ?? returnOrderId ?? "new"} resumeId={resumeId} returnOrderId={returnOrderId} {...form} />
}
