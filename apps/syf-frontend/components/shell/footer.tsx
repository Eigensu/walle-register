import Link from "next/link"
import type { ReactNode } from "react"
import { site } from "@/site.config"
import { isTbcSlot, pub, type Field } from "@/lib/content"
import { TbcBadge, TbcFor } from "@/components/brand/tbc"
import { Wordmark } from "@/components/brand/wordmark"
import { SeamRings } from "@/components/brand/seam-rings"

function ContactRow({ label, f, render }: { label: string; f: Field<string>; render: (value: string) => ReactNode }) {
  const value = pub(f)
  if (!value && !isTbcSlot(f)) return null
  return (
    <div>
      <dt className="eyebrow text-[0.6875rem] text-silver-dim">{label}</dt>
      <dd className="mt-1 text-silver-bright">
        {value ? render(value) : <TbcBadge note={f.note} />} {value && <TbcFor f={f} />}
      </dd>
    </div>
  )
}

const linkClass = "rounded-sm text-silver-bright/80 transition-colors hover:text-silver-bright"

export function Footer() {
  const { org, nav, footer, contact, social, event } = site
  const description = pub(org.description)
  const socialLinks = social.flatMap((s) => {
    const url = pub(s.url)
    return url ? [{ label: s.label, href: url, pending: !s.url.confirmed }] : []
  })
  const contactFields = [contact.email, contact.phone, contact.whatsapp, contact.address]
  const hasContact = contactFields.some((f) => pub(f) || isTbcSlot(f))
  const year = new Date().getFullYear()

  return (
    <footer className="on-navy relative overflow-hidden bg-navy text-silver">
      <SeamRings className="pointer-events-none absolute -bottom-48 -right-32 size-[34rem] text-silver opacity-[0.06]" />
      <div className="container-site relative grid gap-12 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr] lg:py-20">
        <div className="max-w-sm">
          <Link href="/" aria-label={`${org.name}, home`} className="inline-block rounded-sm">
            <Wordmark tone="onDark" />
          </Link>
          {description && (
            <p className="mt-5 text-[0.9375rem] leading-relaxed text-silver">
              {description} <TbcFor f={org.description} />
            </p>
          )}
          {socialLinks.length > 0 ? (
            <ul className="mt-6 flex flex-wrap gap-5">
              {socialLinks.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener" className={linkClass}>
                    {s.label}
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            social.some((s) => isTbcSlot(s.url)) && (
              <p className="mt-6 flex items-center gap-2 text-sm text-silver-dim">
                <TbcBadge note="Social links" /> {social.map((s) => s.label).join(" · ")}
              </p>
            )
          )}
        </div>

        <nav aria-label="Explore">
          <h2 className="eyebrow text-silver-dim">Explore</h2>
          <ul className="mt-5 space-y-3 text-[0.9375rem]">
            {[...nav, { label: `Register for ${event.shortName}`, href: event.registration.href }].map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Policies">
          <h2 className="eyebrow text-silver-dim">Policies</h2>
          <ul className="mt-5 space-y-3 text-[0.9375rem]">
            {footer.policies.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className={linkClass}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        {hasContact && (
          <div>
            <h2 className="eyebrow text-silver-dim">Contact</h2>
            <dl className="mt-5 space-y-4 text-[0.9375rem]">
              <ContactRow label="Email" f={contact.email} render={(v) => <a href={`mailto:${v}`} className={linkClass}>{v}</a>} />
              <ContactRow label="Phone" f={contact.phone} render={(v) => <a href={`tel:${v.replace(/\s/g, "")}`} className={linkClass}>{v}</a>} />
              <ContactRow
                label="WhatsApp"
                f={contact.whatsapp}
                render={(v) => <a href={`https://wa.me/${v.replace(/\D/g, "")}`} target="_blank" rel="noopener" className={linkClass}>Message us</a>}
              />
              <ContactRow label="Address" f={contact.address} render={(v) => <span className="whitespace-pre-line">{v}</span>} />
            </dl>
          </div>
        )}
      </div>

      <div className="relative border-t border-navy-line">
        <div className="container-site flex flex-col gap-2 py-6 text-sm text-silver-dim sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {org.name}
          </p>
          {footer.credit && (
            <a href={footer.credit.href} target="_blank" rel="noopener" className="hover:text-silver">
              {footer.credit.label}
            </a>
          )}
        </div>
      </div>
    </footer>
  )
}
