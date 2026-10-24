import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-lg font-sans font-semibold transition-[background-color,border-color,color] duration-200 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "bg-royal text-white hover:bg-royal-hover",
        outlineDark: "border border-silver/50 text-silver-bright hover:border-silver-bright hover:bg-white/5",
        outlineLight: "border border-navy/70 text-navy hover:bg-navy hover:text-paper",
      },
      size: {
        sm: "h-10 px-4 text-sm",
        md: "h-12 px-6 text-[0.9375rem]",
        lg: "h-[3.25rem] px-7 text-base md:h-12 md:px-6 md:text-[0.9375rem]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  },
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot : "button"

  return <Comp data-slot="button" className={cn(buttonVariants({ variant, size, className }))} {...props} />
}

export { Button, buttonVariants }
