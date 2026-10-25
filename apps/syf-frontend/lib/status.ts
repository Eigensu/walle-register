import type { RegistrationStatus } from "./phase"

/**
 * Live registration status from this site's own backend (GET /api/config, same FastAPI code as
 * apps/backend). Returns null when unset, slow or down; the phase engine then uses dates only.
 */
export async function getRegistrationStatus(): Promise<RegistrationStatus | null> {
  const base = process.env.REGISTRATION_API_URL
  if (!base) return null
  try {
    const res = await fetch(`${base.replace(/\/$/, "")}/api/config`, {
      next: { revalidate: 60 },
      signal: AbortSignal.timeout(2000),
    })
    if (!res.ok) return null
    const data = (await res.json()) as RegistrationStatus
    return typeof data.registration_open === "boolean" ? data : null
  } catch {
    return null
  }
}
