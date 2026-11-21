/** Scrolling registration notice pinned to the very top of every page while registrations are not open. */
// Literal class names so Tailwind picks them up; keep all three in step.
export const TICKER_HEIGHT = "h-9"
export const TICKER_HEADER_OFFSET = "top-9"
export const TICKER_CONTENT_OFFSET = "pt-9"

export function TopTicker({ text }: { text: string }) {
  const items = Array.from({ length: 10 })
  return (
    <div
      role="status"
      className={`on-navy fixed inset-x-0 top-0 z-50 ${TICKER_HEIGHT} overflow-hidden border-b border-navy-line bg-navy-raised`}
    >
      <span className="sr-only">{text}</span>
      <div aria-hidden="true" className="animate-ticker flex h-full w-max items-center whitespace-nowrap">
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {items.map((_, i) => (
              <span key={i} className="eyebrow flex items-center gap-6 px-6 text-silver-bright">
                {text}
                <span className="size-1.5 rounded-full bg-silver-dim" />
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
