import * as React from "react"
import { cn } from "@/lib/utils"

const InputGroupContext = React.createContext<{
  hasTextarea?: boolean
}>({})

function InputGroup({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="input-group"
      className={cn(
        "group relative flex w-full h-9 items-center rounded-4xl border border-input bg-input/30 transition-colors focus-within:border-ring focus-within:ring-[3px] focus-within:ring-ring/50 overflow-hidden",
        className
      )}
      {...props}
    />
  )
}

function InputGroupAddon({
  className,
  align = "inline-start",
  ...props
}: React.ComponentProps<"div"> & {
  align?: "inline-start" | "inline-end" | "block-end"
}) {
  return (
    <div
      data-slot="input-group-addon"
      data-align={align}
      className={cn(
        "flex shrink-0 items-center justify-center gap-2 px-3 text-muted-foreground transition-colors",
        align === "inline-start" && "order-first",
        align === "inline-end" && "order-last border-l border-input/50",
        align === "block-end" && "absolute right-2 bottom-1.5",
        className
      )}
      {...props}
    />
  )
}

function InputGroupInput({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      data-slot="input-group-input"
      className={cn(
        "h-full w-full min-w-0 bg-transparent px-3 py-1 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function InputGroupText({ className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      data-slot="input-group-text"
      className={cn("text-xs font-medium uppercase tracking-widest", className)}
      {...props}
    />
  )
}

function InputGroupTextarea({ className, ...props }: React.ComponentProps<"textarea">) {
  return (
    <textarea
      data-slot="input-group-textarea"
      className={cn(
        "min-h-[80px] w-full bg-transparent p-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

function InputGroupButton({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      data-slot="input-group-button"
      className={cn(
        "inline-flex items-center justify-center rounded-full text-sm font-medium transition-colors hover:bg-black/5 active:scale-95 disabled:pointer-events-none disabled:opacity-50",
        className
      )}
      {...props}
    />
  )
}

export {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
  InputGroupButton,
}
