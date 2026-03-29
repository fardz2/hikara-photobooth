import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputGroupProps extends React.HTMLAttributes<HTMLDivElement> {}

const InputGroup = React.forwardRef<HTMLDivElement, InputGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex rounded-none group focus-within:ring-0", className)}
      {...props}
    />
  )
)
InputGroup.displayName = "InputGroup"

const InputGroupText = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center px-4 border border-[#2C2A29]/20 bg-[#F6F4F0]/50 text-[#5A5550] text-xs font-medium uppercase tracking-widest transition-colors group-focus-within:border-[#8B5E56] group-focus-within:text-[#8B5E56]",
      "first:border-r-0 last:border-l-0",
      className
    )}
    {...props}
  />
))
InputGroupText.displayName = "InputGroupText"

export { InputGroup, InputGroupText }
