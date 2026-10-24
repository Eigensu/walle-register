// Every value the client has to supply is a Field. Unconfirmed fields render with a
// "TBC" badge in development/preview and are hidden in production (SPEC-HOME §9).

export type Field<T> = { readonly value: T; readonly confirmed: boolean; readonly note?: string }

export const field = <T,>(value: T, confirmed = false, note?: string): Field<T> => ({ value, confirmed, note })

export const mapField = <T, U>(f: Field<T>, fn: (value: T) => U): Field<U> => ({ ...f, value: fn(f.value) })

export type SiteEnv = "development" | "preview" | "production"

export const siteEnv: SiteEnv = (process.env.NEXT_PUBLIC_SITE_ENV as SiteEnv) || "development"

export const isProduction = siteEnv === "production"

export function isField(value: unknown): value is Field<unknown> {
  return typeof value === "object" && value !== null && "confirmed" in value && "value" in value
}

function isEmpty(value: unknown) {
  return value === null || value === undefined || value === "" || (Array.isArray(value) && value.length === 0)
}

export function isPublishable(f: Field<unknown>) {
  return !isEmpty(f.value) && (f.confirmed || !isProduction)
}

/** The value if it may be shown in this environment, otherwise null. */
export function pub<T>(f: Field<T>): NonNullable<T> | null {
  return isPublishable(f) ? (f.value as NonNullable<T>) : null
}

/** True when the value is shown but still awaiting confirmation (dev/preview only). */
export function isPending(f: Field<unknown>) {
  return !isProduction && !f.confirmed
}

/** Field that is pending and has no draft value: render a "TBC" slot in dev/preview. */
export function isTbcSlot(f: Field<unknown>) {
  return !isProduction && !f.confirmed && isEmpty(f.value)
}
