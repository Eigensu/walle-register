"use client"

import { createContext, useCallback, useContext, useEffect, useMemo, useSyncExternalStore, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { LogOut } from "lucide-react"
import { readSessionRaw, setSession, subscribeSession, UnauthorizedError, type Session } from "@/lib/api"
import { ADMIN_TITLE, cn } from "@/lib/utils"
import { Spinner } from "./ui"

type Ctx = {
  session: Session
  /** Turns an API error into a message; signs out and redirects on an expired session. */
  handleError: (err: unknown) => string
}

const SessionContext = createContext<Ctx | null>(null)

export function useSession(): Ctx {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error("useSession must be used inside <PanelShell>")
  return ctx
}

const NAV = [
  { href: "/", label: "Overview" },
  { href: "/players", label: "Players" },
  { href: "/admins", label: "Admins" },
]

export function PanelShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  // undefined on the server and during hydration; null once we know there is no session.
  const raw = useSyncExternalStore(subscribeSession, readSessionRaw, () => undefined)
  const session = useMemo<Session | null>(() => {
    try {
      return raw ? (JSON.parse(raw) as Session) : null
    } catch {
      return null
    }
  }, [raw])

  useEffect(() => {
    if (raw === null || (raw && !session)) router.replace("/login")
  }, [raw, session, router])

  const signOut = useCallback(() => {
    setSession(null)
    router.replace("/login")
  }, [router])

  const handleError = useCallback(
    (err: unknown) => {
      if (err instanceof UnauthorizedError) signOut()
      return err instanceof Error ? err.message : "Something went wrong"
    },
    [signOut],
  )

  if (!session) return <Spinner />

  return (
    <SessionContext.Provider value={{ session, handleError }}>
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-900/90">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
          <span className="font-bold">{ADMIN_TITLE}</span>
          <nav className="flex gap-1">
            {NAV.map((item) => {
              const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3 py-1.5 text-sm font-medium",
                    active
                      ? "bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300"
                      : "text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800",
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>
          <div className="ml-auto flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <span>{session.username}</span>
            <button onClick={signOut} className="inline-flex items-center gap-1 rounded-md px-2 py-1 hover:bg-slate-100 dark:hover:bg-slate-800">
              <LogOut className="size-4" /> Sign out
            </button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">{children}</main>
    </SessionContext.Provider>
  )
}
