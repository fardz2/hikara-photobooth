"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";
import { format, parseISO } from "date-fns";
import { id } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon } from "@hugeicons/core-free-icons";

type Preset = "today" | "week" | "month" | "all";

const PRESETS: { label: string; value: Preset }[] = [
  { label: "Hari Ini", value: "today" },
  { label: "Minggu Ini", value: "week" },
  { label: "Bulan Ini", value: "month" },
  { label: "Semua", value: "all" },
];

interface Props {
  defaultRange?: Preset;
}

export function DateRangeFilter({ defaultRange = "month" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);

  const currentRange = (searchParams.get("range") ?? defaultRange) as Preset;
  const fromStr = searchParams.get("from");
  const toStr = searchParams.get("to");
  const hasCustom = Boolean(fromStr && toStr);

  // Convert URL strings → DateRange for Calendar
  const calendarValue: DateRange | undefined =
    hasCustom && fromStr && toStr
      ? { from: parseISO(fromStr), to: parseISO(toStr) }
      : undefined;

  const setPreset = useCallback(
    (preset: Preset) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("range", preset);
      params.delete("from");
      params.delete("to");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const handleCalendarSelect = useCallback(
    (range: DateRange | undefined) => {
      if (!range) return;
      const params = new URLSearchParams(searchParams.toString());
      if (range.from) {
        params.set("from", format(range.from, "yyyy-MM-dd"));
        params.delete("range");
      }
      if (range.to) {
        params.set("to", format(range.to, "yyyy-MM-dd"));
        setOpen(false);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const customLabel =
    hasCustom && fromStr && toStr
      ? `${format(parseISO(fromStr), "d MMM", { locale: id })} – ${format(parseISO(toStr), "d MMM yyyy", { locale: id })}`
      : "Kustom";

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Preset Selector */}
      <Select 
        value={hasCustom ? "custom" : currentRange} 
        onValueChange={(val) => {
          if (val === "custom") return;
          setPreset(val as Preset);
        }}
      >
        <SelectTrigger className="w-[160px] rounded-none border-[#2C2A29]/10 bg-white text-[10px] uppercase tracking-widest h-10 px-4 focus:ring-0 shadow-none hover:bg-[#FAFAFA] hover:border-[#2C2A29]/20 transition-colors font-bold text-[#2C2A29]">
          <div className="flex items-center gap-2">
            <HugeiconsIcon icon={Calendar01Icon} size={14} className="opacity-50" />
            <SelectValue placeholder="Pilih Periode" />
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-none border-[#2C2A29]/10 shadow-xl p-0">
          {PRESETS.map((p) => (
            <SelectItem key={p.value} value={p.value} className="rounded-none text-[10px] uppercase tracking-widest cursor-pointer focus:bg-[#FAFAFA] text-[#2C2A29] font-medium py-3 px-4">
              {p.label}
            </SelectItem>
          ))}
          {hasCustom && (
            <SelectItem value="custom" className="hidden">
              Kustom
            </SelectItem>
          )}
        </SelectContent>
      </Select>

      {/* Shadcn Calendar Popover — Custom Date Range */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            className={`
              flex items-center gap-2 px-4 py-2 text-[10px] tracking-[0.25em] h-10 uppercase font-bold 
              border transition-colors duration-200
              ${
                hasCustom
                  ? "border-[#2C2A29] bg-[#2C2A29] text-white"
                  : "border-[#2C2A29]/10 bg-white text-[#5A5550]/60 hover:text-[#2C2A29] hover:bg-[#FAFAFA] hover:border-[#2C2A29]/20"
              }
            `}
          >
            {hasCustom ? null : <HugeiconsIcon icon={Calendar01Icon} size={12} />}
            {customLabel}
          </button>
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 border border-[#2C2A29]/10 shadow-xl"
          align="end"
        >
          <Calendar
            mode="range"
            selected={calendarValue}
            onSelect={handleCalendarSelect}
            numberOfMonths={2}
            locale={id}
            disabled={{ after: new Date() }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
