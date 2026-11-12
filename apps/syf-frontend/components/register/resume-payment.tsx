"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { findPendingRegistration } from "@/lib/registration-api"
import { TextField } from "./fields"

/** "Already registered?": finds a saved registration by email and reopens it at the payment step. */
export function ResumePayment({ registerHref }: { registerHref: string }) {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)

  return (
    <form
      noValidate
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault()
        if (!/^\S+@\S+\.\S+$/.test(email.trim())) return setError("Enter the email you registered with")
        setBusy(true)
        setError(undefined)
        try {
          const { player_id } = await findPendingRegistration(email.trim())
          router.push(`${registerHref}?resume=${encodeURIComponent(player_id)}`)
        } catch (err) {
          setError((err as Error).message)
          setBusy(false)
        }
      }}
    >
      <TextField
        name="resume_email"
        label="Registered email"
        type="email"
        inputMode="email"
        autoComplete="email"
        placeholder="you@example.com"
        value={email}
        error={error}
        onValue={(v) => {
          setEmail(v)
          setError(undefined)
        }}
      />
      <Button type="submit" variant="outlineLight" disabled={busy} className="self-start">
        {busy ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
        Continue to payment
        {!busy && <ArrowRight aria-hidden="true" />}
      </Button>
    </form>
  )
}
