"use client"

import { useSearchParams } from "next/navigation"
import type { ComponentProps, ReactNode } from "react"
import { RegistrationForm } from "./registration-form"

type Props = Omit<ComponentProps<typeof RegistrationForm>, "resumeId"> & {
  /** Whether new registrations are accepted right now. */
  open: boolean
  /** What to show instead of the form when registrations aren't open. */
  closed: ReactNode
}

/** A ?resume=<id> link always reopens the form (to pay for a saved registration), even when closed. */
export function RegisterGate({ open, closed, ...form }: Props) {
  const resumeId = useSearchParams().get("resume")
  if (!open && !resumeId) return closed
  return <RegistrationForm key={resumeId ?? "new"} resumeId={resumeId} {...form} />
}
