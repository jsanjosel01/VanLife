import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "flex h-12 w-full rounded-lg border border-input bg-background px-3 py-2 text-base text-foreground ring-offset-background",
        "placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    />
  )
}

export { Input }
