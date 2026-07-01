"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface Props {
  name: string;
  label: string;
  defaultValue?: string;
  multiline?: boolean;
}

export function TextField({
  name,
  label,
  defaultValue = "",
  multiline,
}: Props) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs uppercase tracking-wider text-[#5A5550]">
        {label}
      </Label>
      {multiline ? (
        <Textarea
          name={name}
          defaultValue={defaultValue}
          rows={Math.min(Math.max(defaultValue.split("\n").length, 2), 6)}
          className={cn("rounded-none border-[#E8E2D9] bg-white resize-y")}
        />
      ) : (
        <Input
          name={name}
          defaultValue={defaultValue}
          className={cn("rounded-none border-[#E8E2D9] bg-white")}
        />
      )}
    </div>
  );
}
