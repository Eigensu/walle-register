"use client"

import { useEffect, useRef } from "react"
import { Loader2, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
  /** The player's registration id, when we know it. */
  playerId: string | null
  checking: boolean
  onCheck: () => void
}

/**
 * Shown when the player has paid (or may have) but we couldn't get an answer from the server, e.g.
 * their phone had just come back from a UPI app and had no connection yet. This is deliberately not
 * an error: the payment is probably fine, and the backend confirms it on its own.
 */
export function PaymentUnconfirmed({ playerId, checking, onCheck }: Props) {
  const headingRef = useRef<HTMLHeadingElement>(null)

  // Like each step of the form: bring it into view, since this replaces the form wherever the player had scrolled to.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
    headingRef.current?.closest("section")?.scrollIntoView({ behavior: "smooth", block: "start" })
  }, [])

  return (
    <section aria-labelledby="payment-unconfirmed-title" className="scroll-mt-24 rounded-xl border border-royal/20 bg-royal/[0.06] p-5 sm:p-7">
      <div role="status" className="flex items-start gap-3">
        <Loader2 className="mt-1 size-5 shrink-0 animate-spin text-royal" aria-hidden="true" />
        <div>
          <h2 id="payment-unconfirmed-title" ref={headingRef} tabIndex={-1} className="font-display text-2xl text-navy outline-none">
            We&apos;re confirming your payment
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-navy">
            We couldn&apos;t reach our server just now to check your payment. If the money left your account, <strong>please don&apos;t pay again</strong>.
            We keep checking with the payment provider, and we&apos;ll email your registration confirmation and invoice as soon as it comes through.
          </p>
          {playerId && (
            <p className="mt-3 text-sm text-ink-muted">
              Registration ID <span className="font-mono font-semibold text-navy">{playerId}</span>
            </p>
          )}
          <Button type="button" variant="outlineLight" onClick={onCheck} disabled={checking} className="mt-5">
            {checking ? (
              <>
                <Loader2 className="animate-spin" aria-hidden="true" />
                Checking…
              </>
            ) : (
              <>
                <RefreshCw aria-hidden="true" />
                Check payment status
              </>
            )}
          </Button>
        </div>
      </div>
    </section>
  )
}
