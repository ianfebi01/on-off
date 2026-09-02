import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { Slot } from "radix-ui"

import { cn } from "@/lib/utils"

// The variants below intentionally lean on the `.button*` classes declared in
// `src/index.css` so shadcn primitives inherit this project's design system.
// The base only carries behaviour (focus ring, disabled, svg sizing) — no
// layout/colour utilities, which would otherwise out-rank the component layer.
const buttonVariants = cva(
  "shrink-0 outline-none transition-all disabled:pointer-events-none disabled:opacity-50 focus-visible:ring-[3px] focus-visible:ring-ring/50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        primary: "button button-primary",
        secondary: "button button-secondary",
        outline: "button button-outline",
        icon: "button button-icon",
        iconOnly: "button button-icon-only",
        link: "button button-link",
        error: "button button-error",
        // Used by shadcn-internal composites (calendar nav / day cells).
        ghost:
          "inline-flex cursor-pointer items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "",
        sm: "h-8 px-3 text-sm",
        lg: "h-10 px-6",
        icon: "size-9 p-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "primary",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
