import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { pub, type Field } from "@/lib/content"
import type { Link as NavLink } from "@/lib/site-types"
import { cn } from "@/lib/utils"
import { TbcFor } from "@/components/brand/tbc"
import { Emphasis } from "@/components/brand/emphasis"

type Props = {
  id: string
  eyebrow: string
  heading: Field<string> | string
  link?: NavLink
  align?: "start" | "center"
  tone?: "light" | "dark"
}

/** Eyebrow + serif heading, with the section's "see more" link opposite on wide screens. */
export function SectionHeading({ id, eyebrow, heading, link, align = "start", tone = "light" }: Props) {
  const text = typeof heading === "string" ? heading : pub(heading)
  const dark = tone === "dark"
  return (
    <div
      className={cn(
        "flex flex-col gap-6",
        align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between",
      )}
    >
      <div>
        <p className={cn("eyebrow", dark ? "text-silver" : "text-ink-muted")}>{eyebrow}</p>
        {text ? (
          <h2 id={id} className={cn("type-display-l mt-4 max-w-[18ch]", dark ? "text-silver-bright" : "text-navy")}>
            <Emphasis text={text} accentClassName={dark ? "silver-text" : "ink-text"} />{" "}
            {typeof heading !== "string" && <TbcFor f={heading} />}
          </h2>
        ) : (
          <h2 id={id} className="sr-only">
            {eyebrow}
          </h2>
        )}
      </div>
      {link && (
        <Link
          href={link.href}
          className={cn(
            "group inline-flex shrink-0 items-center gap-2 rounded-sm text-[0.9375rem] font-semibold underline-offset-4 hover:underline",
            dark ? "text-silver-bright" : "text-royal",
          )}
        >
          {link.label}
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
