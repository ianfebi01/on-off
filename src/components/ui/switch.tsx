import * as React from "react"
import { Switch as SwitchPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function Switch({
  className,
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root>) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "group relative flex h-7 w-14 shrink-0 cursor-pointer items-center rounded-full bg-navy/20 p-1 outline-none transition-colors duration-200 ease-in-out focus-visible:outline focus-visible:outline-navy disabled:cursor-not-allowed data-[state=checked]:bg-navy",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className="pointer-events-none block size-5 translate-x-0 rounded-full bg-white shadow-lg ring-0 transition-transform duration-200 ease-in-out data-[state=checked]:translate-x-7"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
