"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

import { ConfirmationStep } from "@/components/registration-steps/confirmation-step";
import { verifyCashfreePayment, type CashfreeVerifyResponse } from "@/lib/api";

/**
 * Landing view when Cashfree sends the player back to /register?order_id=...
 * (happens when checkout finishes with a redirect instead of closing the popup).
 * The payment is confirmed server-side; the URL alone proves nothing.
 */
export function CashfreeReturn({ orderId }: { orderId: string }) {
  const [result, setResult] = useState<CashfreeVerifyResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    verifyCashfreePayment(orderId)
      .then((res) => !cancelled && setResult(res))
      .catch(
        (err) =>
          !cancelled &&
          setError(err instanceof Error ? err.message : "Could not verify payment"),
      );
    return () => {
      cancelled = true;
    };
  }, [orderId]);

  if (!result && !error) {
    return (
      <div className="flex flex-col items-center gap-4 py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Confirming your payment...
        </p>
      </div>
    );
  }

  if (result?.status === "CAPTURED") {
    return <ConfirmationStep playerId={result.player_id} />;
  }

  const message = error ?? result?.message ?? "Payment not completed.";
  // Pending or under review: money may already be taken, so don't offer to pay again.
  const pending =
    result?.status === "PENDING" || result?.status === "NEEDS_REVIEW";

  return (
    <div className="space-y-4">
      <div
        className={`rounded-xl border-2 px-4 py-3 text-sm font-medium ${
          pending
            ? "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-200"
            : "border-red-200 bg-red-50 text-red-900 dark:border-red-900/40 dark:bg-red-950/20 dark:text-red-200"
        }`}
      >
        {message}
      </div>
      {result?.player_id && !pending ? (
        <Link
          href={`/register?resume=${result.player_id}`}
          className="inline-flex h-10 items-center rounded-md bg-blue-600 px-4 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Try payment again
        </Link>
      ) : null}
    </div>
  );
}
