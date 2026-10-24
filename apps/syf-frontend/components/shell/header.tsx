"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState, type ReactNode } from "react"
import type { Cta } from "@/lib/phase"
import type { Link as NavLink } from "@/lib/site-types"
import { cn } from "@/lib/utils"
import { CtaButton } from "@/components/cta-button"
import { MobileMenu } from "./mobile-menu"

type Props = {
  logo: ReactNode
  homeLabel: string
  nav: NavLink[]
  headerCta: Cta
  menuCta: Cta
  social: NavLink[]
}

export function Header({ logo, homeLabel, nav, headerCta, menuCta, social }: Props) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  return (
    <header
      className={cn(
        "on-navy fixed inset-x-0 top-0 z-50 border-b transition-[background-color,border-color,box-shadow,backdrop-filter] duration-200",
        scrolled
          ? "border-navy-line bg-navy/85 shadow-[0_8px_30px_rgb(14_26_43/0.18)] backdrop-blur-md"
          : "border-transparent bg-transparent",
      )}
    >
      <div className="container-site flex h-[60px] items-center justify-between gap-6 lg:h-[76px]">
        <Link href="/" aria-label={`${homeLabel}, home`} className="shrink-0 rounded-sm">
          {logo}
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {nav.map((item) => {
              const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    className={cn(
                      "rounded-sm text-[0.9375rem] font-medium underline-offset-[10px] transition-colors hover:text-silver-bright",
                      active ? "text-silver-bright underline decoration-silver decoration-1" : "text-silver-bright/75",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <CtaButton cta={headerCta} location="header" size="sm" className="hidden lg:inline-flex" />
          <MobileMenu logo={logo} homeLabel={homeLabel} nav={nav} cta={menuCta} social={social} />
        </div>
      </div>
    </header>
  )
}
