import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

export const ADMIN_TITLE = process.env.NEXT_PUBLIC_ADMIN_TITLE || "Registration Admin"

/** "played_JMCL_S2" -> "Played JMCL S2" */
export function humanize(key: string): string {
  return key
    .replace(/_/g, " ")
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .trim()
}

export function formatDateTime(value: unknown): string {
  if (typeof value !== "string" || !value) return "—"
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? value : d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })
}

/** Payment amounts are stored in paise. */
export function formatAmount(paise: unknown, currency: unknown = "INR"): string {
  if (typeof paise !== "number") return "—"
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: typeof currency === "string" ? currency : "INR" }).format(paise / 100)
}

export function statusTone(status: string | null | undefined): string {
  switch (status) {
    case "PAID":
    case "APPROVED":
    case "CAPTURED":
      return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
    case "FAILED":
      return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
    case "PENDING_PAYMENT":
    case "PENDING":
    case "CREATED":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400"
    default:
      return "bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300"
  }
}
