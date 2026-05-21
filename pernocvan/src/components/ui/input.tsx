import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      // Quitamos cualquier posible residuo de color, dejamos solo la variable de tema
      className={cn(
        "h-12 w-full rounded-lg border border-input bg-background px-3 py-2 text-base text-foreground transition-colors outline-none",
        "placeholder:text-muted-foreground",
        "focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    />
  )
}

export { Input }
