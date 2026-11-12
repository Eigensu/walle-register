import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

type Step = { id: string; label: string; helper: string }

/** Progress through the registration steps: a compact bar on phones, numbered steps from sm up. */
export function Stepper({ steps, active }: { steps: readonly Step[]; active: number }) {
  const current = steps[active]
  return (
    <nav aria-label="Registration progress">
      <div className="sm:hidden">
        <p className="eyebrow text-ink-muted">
          Step {active + 1} of {steps.length}
        </p>
        <p className="mt-2 font-display text-2xl text-navy">{current.label}</p>
        <div className="mt-4 flex gap-1.5" aria-hidden="true">
          {steps.map((s, i) => (
            <span key={s.id} className={cn("h-1 flex-1 rounded-full", i <= active ? "bg-royal" : "bg-line")} />
          ))}
        </div>
      </div>

      <ol className="hidden grid-cols-6 gap-2 sm:grid">
        {steps.map((s, i) => {
          const done = i < active
          const isActive = i === active
          return (
            <li key={s.id} aria-current={isActive ? "step" : undefined} className="flex flex-col gap-3">
              <span className={cn("h-1 rounded-full", i <= active ? "bg-royal" : "bg-line")} aria-hidden="true" />
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded-full font-sport text-xs font-semibold",
                    done && "bg-royal text-white",
                    isActive && "bg-navy text-silver-bright",
                    !done && !isActive && "border border-line text-ink-muted",
                  )}
                >
                  {done ? <Check className="size-3.5" strokeWidth={3} aria-hidden="true" /> : i + 1}
                </span>
                <span className={cn("text-sm font-semibold", i <= active ? "text-navy" : "text-ink-muted")}>
                  {s.label}
                  {done && <span className="sr-only"> (done)</span>}
                </span>
              </span>
              <span className="hidden text-xs text-ink-muted lg:block">{s.helper}</span>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
