"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import { FilterHorizontalIcon } from "@hugeicons/core-free-icons";

const STATUSES = [
  { label: "Semua", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Confirmed", value: "confirmed" },
  { label: "Cancelled", value: "cancelled" },
];

export function StatusFilter() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("status") ?? "all";

  const setStatus = useCallback(
    (status: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("status", status);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams],
  );

  return (
    <Select value={current} onValueChange={setStatus}>
      <SelectTrigger className="w-[160px] rounded-none border-[#2C2A29]/10 bg-white text-[10px] uppercase tracking-widest h-10 px-4 focus:ring-0 shadow-none hover:bg-[#8B5E56]/5 hover:border-[#8B5E56]/30 hover:text-[#2C2A29] transition-all duration-300 font-bold text-[#2C2A29] group">
        <div className="flex items-center gap-2 group-hover:translate-x-0.5 transition-transform duration-300">
          <HugeiconsIcon
            icon={FilterHorizontalIcon}
            size={14}
            className="opacity-50"
          />
          <SelectValue placeholder="Status" />
        </div>
      </SelectTrigger>
      <SelectContent className="rounded-none border-[#2C2A29]/10 shadow-xl p-0">
        {STATUSES.map((s) => (
          <SelectItem
            key={s.value}
            value={s.value}
            className="rounded-none text-[10px] uppercase tracking-widest cursor-pointer focus:bg-[#8B5E56] focus:text-[#8B5E56] data-highlighted:text-[#8B5E56] text-[#2C2A29] font-medium py-3 px-4 transition-colors"
          >
            {s.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
