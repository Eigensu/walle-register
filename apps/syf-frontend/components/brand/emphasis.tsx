import { Fragment } from "react"
import { cn } from "@/lib/utils"

type Props = {
  /** "*word*" is accented; "\n" breaks the line. */
  text: string
  accentClassName?: string
}

/** Renders config headlines like "Uniting the\n*Silver* Fraternity". */
export function Emphasis({ text, accentClassName }: Props) {
  const lines = text.split("\n")
  return (
    <>
      {lines.map((line, i) => (
        <Fragment key={i}>
          {line.split(/(\*[^*]+\*)/g).map((part, j) =>
            part.startsWith("*") && part.endsWith("*") ? (
              <em key={j} className={cn("accent-italic", accentClassName)}>
                {part.slice(1, -1)}
              </em>
            ) : (
              <Fragment key={j}>{part}</Fragment>
            ),
          )}
          {i < lines.length - 1 && <br />}
        </Fragment>
      ))}
    </>
  )
}

/** Plain-text version for metadata and alt text. */
export function plainText(text: string) {
  return text.replace(/\*/g, "").replace(/\s*\n\s*/g, " ")
}
