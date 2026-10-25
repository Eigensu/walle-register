"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useRef, type ReactNode } from "react"
import { Menu, X } from "lucide-react"
import type { Cta } from "@/lib/phase"
import type { Link as NavLink } from "@/lib/site-types"
import { CtaButton } from "@/components/cta-button"
import { SeamRings } from "@/components/brand/seam-rings"

type Props = { logo: ReactNode; homeLabel: string; nav: NavLink[]; cta: Cta; social: NavLink[] }

/** Full-screen menu on a native modal <dialog>: focus is contained and Esc closes it. */
export function MobileMenu({ logo, homeLabel, nav, cta, social }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const pathname = usePathname()

  const close = () => dialog.current?.close()

  useEffect(() => {
    dialog.current?.close()
  }, [pathname])

  useEffect(() => {
    const el = dialog.current
    if (!el) return
    const unlock = () => document.documentElement.classList.remove("overflow-hidden")
    el.addEventListener("close", unlock)
    return () => {
      el.removeEventListener("close", unlock)
      unlock()
    }
  }, [])

  const open = () => {
    document.documentElement.classList.add("overflow-hidden")
    dialog.current?.showModal()
  }

  return (
    <>
      <button
        type="button"
        onClick={open}
        aria-label="Open menu"
        aria-haspopup="dialog"
        className="inline-flex size-11 items-center justify-center rounded-lg text-silver-bright hover:bg-white/5 lg:hidden"
      >
        <Menu className="size-6" aria-hidden="true" />
      </button>

      <dialog ref={dialog} aria-label="Menu" className="mobile-menu on-navy lg:hidden">
        <div className="grain flex h-full flex-col overflow-y-auto bg-navy text-silver-bright">
          <SeamRings className="pointer-events-none absolute -right-40 top-24 size-[30rem] text-silver opacity-[0.07]" />
          <div className="container-site relative flex h-[60px] shrink-0 items-center justify-between">
            <Link href="/" aria-label={`${homeLabel}, home`} onClick={close} className="rounded-sm">
              {logo}
            </Link>
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className="inline-flex size-11 items-center justify-center rounded-lg hover:bg-white/5"
            >
              <X className="size-6" aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Main" className="container-site relative mt-8 flex-1">
            <ul className="space-y-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={close}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="block border-b border-navy-line py-3.5 font-display text-[2rem] leading-tight aria-[current=page]:italic"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="container-site relative space-y-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8">
            <CtaButton cta={cta} location="mobile_menu" size="lg" className="w-full" />
            {social.length > 0 && (
              <ul className="flex gap-6">
                {social.map((s) => (
                  <li key={s.href}>
                    <a href={s.href} target="_blank" rel="noopener" className="text-sm text-silver underline underline-offset-4">
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </dialog>
    </>
  )
}
